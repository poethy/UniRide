import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';
import { ApiResponse, Calificacion, Viaje } from '../models';

@Injectable({ providedIn: 'root' })
export class CalificacionesService {
  private api = `${environment.apiUrl}/calificaciones`;

  private _calificaciones$ = new BehaviorSubject<Calificacion[]>([]);
  readonly calificaciones$ = this._calificaciones$.asObservable();

  private _calificacionesDadas$ = new BehaviorSubject<Calificacion[]>([]);
  readonly calificacionesDadas$ = this._calificacionesDadas$.asObservable();

  constructor(private http: HttpClient) {}

  listarDeUsuario(id: number) {
    return this.http.get<ApiResponse<Calificacion[]>>(`${this.api}/usuario/${id}`).pipe(
      tap(res => this._calificaciones$.next(res.data))
    );
  }

  listarDadasPorUsuario(id: number) {
    return this.http.get<ApiResponse<Calificacion[]>>(`${this.api}/usuario/${id}/dadas`).pipe(
      tap(res => this._calificacionesDadas$.next(res.data))
    );
  }

  promedio(id: number) {
    return this.http.get<ApiResponse<{ promedio: number; total: number }>>(`${this.api}/usuario/${id}/promedio`);
  }

  crear(data: { viaje_id: number; calificado_id: number; puntaje: number; comentario?: string }) {
    return this.http.post<ApiResponse<Calificacion>>(this.api, data);
  }

  yaCalifique(viajeId: number) {
    return this.http.get<ApiResponse<boolean>>(`${this.api}/viaje/${viajeId}/ya-califique`);
  }

  /**
   * Abre el modal de calificación para un viaje finalizado.
   * Llama a `onSuccess` tras guardar exitosamente.
   */
  abrirModalCalificacion(viaje: Viaje, calificadoRole: 'conductor' | 'pasajero' = 'conductor', onSuccess?: () => void): void {
    const calificado = calificadoRole === 'conductor' ? viaje.conductor : viaje.pasajero;
    if (!calificado) return;
    const rolLabel = calificadoRole === 'conductor' ? 'Conductor' : 'Pasajero';
    this._mostrarFormCalificacion(viaje, calificado, rolLabel, onSuccess);
  }

  private _mostrarFormCalificacion(
    viaje: Viaje,
    calificado: { id: number; nombre: string; apellido: string; foto_perfil?: string },
    rolLabel: string,
    onSuccess?: () => void,
  ): void {
    const avatar = calificado.foto_perfil
      ? `<img src="${calificado.foto_perfil}" style="width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid #e5e7eb">`
      : `<div style="width:56px;height:56px;border-radius:50%;background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:700;color:#6b7280">${calificado.nombre.charAt(0).toUpperCase()}</div>`;

    Swal.fire({
      title: '¿Cómo estuvo el viaje?',
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;margin-bottom:12px">
          ${avatar}
          <p style="font-weight:600;color:#1f2937;margin:0">${calificado.nombre} ${calificado.apellido}</p>
          <p style="font-size:0.75rem;color:#6b7280;margin:0">${rolLabel} · Viaje #${viaje.id}</p>
        </div>
        <div id="swal-stars" style="display:flex;justify-content:center;gap:6px;margin:8px 0 4px;cursor:pointer">
          ${[1,2,3,4,5].map(i => `<span class="swal-star" data-val="${i}" style="font-size:2.2rem;color:#d1d5db;transition:color .15s;user-select:none">★</span>`).join('')}
        </div>
        <p id="swal-star-label" style="font-size:0.8rem;color:#6b7280;margin:0 0 12px">Toca una estrella para calificar</p>
        <textarea id="swal-comentario" rows="3"
          style="width:100%;border:1px solid #d1d5db;border-radius:8px;padding:8px 12px;font-size:0.9rem;resize:none;outline:none;box-sizing:border-box"
          placeholder="Comentario opcional..."></textarea>
        <input type="hidden" id="swal-puntaje" value="0">
      `,
      confirmButtonText: 'Enviar calificación',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#6366f1',
      didOpen: () => {
        const labels = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', '¡Excelente!'];
        const stars = document.querySelectorAll<HTMLElement>('.swal-star');
        const setStars = (val: number) => {
          stars.forEach((s, i) => { s.style.color = i < val ? '#fbbf24' : '#d1d5db'; });
          (document.getElementById('swal-puntaje') as HTMLInputElement).value = val.toString();
          const lbl = document.getElementById('swal-star-label');
          if (lbl) lbl.textContent = val ? labels[val] : 'Toca una estrella para calificar';
        };
        stars.forEach(star => {
          star.addEventListener('click', () => setStars(parseInt(star.dataset['val'] ?? '0')));
          star.addEventListener('mouseenter', () => {
            const v = parseInt(star.dataset['val'] ?? '0');
            stars.forEach((s, i) => { s.style.color = i < v ? '#fbbf24' : '#d1d5db'; });
          });
        });
        document.getElementById('swal-stars')?.addEventListener('mouseleave', () => {
          const cur = parseInt((document.getElementById('swal-puntaje') as HTMLInputElement).value);
          stars.forEach((s, i) => { s.style.color = i < cur ? '#fbbf24' : '#d1d5db'; });
        });
      },
      preConfirm: () => {
        const puntaje = parseInt((document.getElementById('swal-puntaje') as HTMLInputElement).value);
        if (!puntaje) { Swal.showValidationMessage('Selecciona al menos una estrella'); return false; }
        const comentario = (document.getElementById('swal-comentario') as HTMLTextAreaElement).value.trim();
        return { puntaje, comentario: comentario || undefined };
      },
    }).then(result => {
      if (!result.isConfirmed) return;
      this.crear({
        viaje_id: viaje.id,
        calificado_id: calificado.id,
        puntaje: result.value.puntaje,
        comentario: result.value.comentario,
      }).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: '¡Gracias!', text: 'Tu calificación fue enviada.', timer: 1800, showConfirmButton: false });
          onSuccess?.();
        },
        error: err => {
          const msg = err.error?.message ?? 'No se pudo enviar la calificación';
          const icon = msg.toLowerCase().includes('ya calific') ? 'info' : 'error';
          Swal.fire({ icon, title: icon === 'info' ? 'Ya calificaste' : 'Error', text: msg });
        },
      });
    });
  }
}
