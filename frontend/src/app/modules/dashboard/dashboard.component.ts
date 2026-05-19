import {
  Component, OnInit, OnDestroy,
  AfterViewChecked, ElementRef, ViewChild,
} from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import * as L from 'leaflet';

import { AuthService }           from '../../core/services/auth.service';
import { ViajesService }         from '../../core/services/viajes.service';
import { SeguimientoService }    from '../../core/services/seguimiento.service';
import { CalificacionesService } from '../../core/services/calificaciones.service';
import { Usuario, Viaje }        from '../../core/models';

// Fix Leaflet icons con webpack
(L.Icon.Default.prototype as any)._getIconUrl = undefined;
L.Icon.Default.mergeOptions({
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('mapDashEl') mapDashEl?: ElementRef<HTMLDivElement>;

  usuario: Usuario | null = null;
  viajesRecientes: Viaje[] = [];
  viajeEnCurso: Viaje | null = null;
  totalViajes   = 0;
  viajesActivos = 0;
  loading       = true;

  // Mapa
  private map?: L.Map;
  private conductorMarker?: L.Marker;
  private mapInitialized = false;
  private mapPendingInit = false;

  // Tracking
  private pollSub?: Subscription;
  private geoInterval?: ReturnType<typeof setInterval>;

  get esConductor(): boolean { return this.auth.hasRole('conductor'); }

  get otraPersona() {
    return this.esConductor ? this.viajeEnCurso?.pasajero : this.viajeEnCurso?.conductor;
  }

  constructor(
    public  auth:              AuthService,
    private viajesSvc:         ViajesService,
    private seguimientoSvc:    SeguimientoService,
    private calificacionesSvc: CalificacionesService,
  ) {}

  ngOnInit(): void {
    this.usuario = this.auth.currentUser;
    this.cargarDatos();
  }

  /** Se llama en cada ciclo de change detection — inicializa el mapa solo una vez */
  ngAfterViewChecked(): void {
    if (this.mapPendingInit && this.mapDashEl?.nativeElement) {
      this.mapPendingInit = false;
      setTimeout(() => this.initMap(), 0);
    }
  }

  private cargarDatos(): void {
    const userId = this.usuario?.id;
    if (!userId) return;

    const filtro = this.esConductor
      ? { conductor_id: userId }
      : { pasajero_id: userId };

    this.viajesSvc.listar(filtro).subscribe({
      next: res => {
        const todos = res.data;
        this.viajesRecientes = todos.slice(0, 5);
        this.totalViajes     = todos.length;
        this.viajesActivos   = todos.filter(v =>
          ['pendiente', 'aceptado', 'en_curso'].includes(v.estado)
        ).length;
        this.loading = false;

        // Detectar viaje en curso
        const enCurso = todos.find(v => v.estado === 'en_curso') ?? null;
        if (enCurso?.id !== this.viajeEnCurso?.id) {
          this.limpiarTracking();
          this.viajeEnCurso = enCurso;
          if (enCurso) this.mapPendingInit = true;   // dispara ngAfterViewChecked
        }
      },
      error: () => { this.loading = false; },
    });
  }

  // ── Mapa ──────────────────────────────────────────────────────────────────

  private initMap(): void {
    if (this.mapInitialized || !this.viajeEnCurso?.ruta || !this.mapDashEl?.nativeElement) return;

    const ruta = this.viajeEnCurso.ruta;
    const { origen_lat, origen_lng, destino_lat, destino_lng, puntos_ruta } = ruta;

    this.map = L.map(this.mapDashEl.nativeElement).setView([origen_lat, origen_lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    // Marcador origen
    L.marker([origen_lat, origen_lng], {
      icon: L.divIcon({
        className: '',
        html: '<div style="background:#22c55e;width:13px;height:13px;border-radius:50%;border:2.5px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>',
        iconAnchor: [6, 6],
      }),
    }).addTo(this.map).bindPopup(`<b>Origen</b><br>${ruta.origen_descripcion}`);

    // Marcador destino
    L.marker([destino_lat, destino_lng], {
      icon: L.divIcon({
        className: '',
        html: '<div style="background:#ef4444;width:13px;height:13px;border-radius:50%;border:2.5px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>',
        iconAnchor: [6, 6],
      }),
    }).addTo(this.map).bindPopup(`<b>Destino</b><br>${ruta.destino_descripcion}`);

    // Polyline
    const coords: [number, number][] = puntos_ruta?.length
      ? puntos_ruta.map(p => [p.latitud, p.longitud])
      : [[origen_lat, origen_lng], [destino_lat, destino_lng]];

    L.polyline(coords, { color: '#6366f1', weight: 4, dashArray: '8 5', opacity: 0.85 }).addTo(this.map);
    this.map.fitBounds(L.latLngBounds(coords), { padding: [35, 35] });

    this.mapInitialized = true;
    this.iniciarTracking();
  }

  private iniciarTracking(): void {
    if (!this.viajeEnCurso) return;
    const viajeId = this.viajeEnCurso.id;

    if (this.esConductor) {
      this.geoInterval = setInterval(() => {
        navigator.geolocation?.getCurrentPosition(
          pos => {
            this.seguimientoSvc
              .actualizarUbicacion(viajeId, pos.coords.latitude, pos.coords.longitude)
              .subscribe();
            this.moverMarcadorConductor(pos.coords.latitude, pos.coords.longitude);
          },
          () => {},
          { enableHighAccuracy: true, timeout: 4000 }
        );
      }, 5000);
    } else {
      this.pollSub = interval(5000).pipe(
        switchMap(() => this.seguimientoSvc.obtenerUbicacion(viajeId))
      ).subscribe(res => {
        if (res.data) this.moverMarcadorConductor(res.data.lat, res.data.lng);
      });
    }
  }

  private moverMarcadorConductor(lat: number, lng: number): void {
    if (!this.map) return;
    const icon = L.divIcon({
      className: '',
      html: `<div style="background:#6366f1;width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 3px rgba(99,102,241,.3),0 2px 6px rgba(0,0,0,.3)"></div>`,
      iconAnchor: [9, 9],
    });
    if (this.conductorMarker) {
      this.conductorMarker.setLatLng([lat, lng]);
    } else {
      this.conductorMarker = L.marker([lat, lng], { icon, zIndexOffset: 1000 })
        .addTo(this.map)
        .bindPopup('<b>Conductor</b>');
    }
  }

  calificarViaje(viaje: Viaje): void {
    const rol = this.esConductor ? 'pasajero' : 'conductor';
    this.calificacionesSvc.abrirModalCalificacion(viaje, rol, () => this.cargarDatos());
  }

  private limpiarTracking(): void {
    this.pollSub?.unsubscribe();
    if (this.geoInterval) clearInterval(this.geoInterval);
    if (this.map) { this.map.remove(); this.map = undefined; }
    this.conductorMarker  = undefined;
    this.mapInitialized   = false;
    this.mapPendingInit   = false;
  }

  ngOnDestroy(): void {
    this.limpiarTracking();
  }
}
