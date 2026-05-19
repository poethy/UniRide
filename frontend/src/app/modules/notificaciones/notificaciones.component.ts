import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificacionesService } from '../../core/services/notificaciones.service';
import { Notificacion } from '../../core/models';
import Swal from 'sweetalert2';

@Component({ standalone: false, selector: 'app-notificaciones', templateUrl: './notificaciones.component.html' })
export class NotificacionesComponent implements OnInit {
  notificaciones$!: Observable<Notificacion[]>;

  constructor(private svc: NotificacionesService) {}

  ngOnInit(): void {
    this.notificaciones$ = this.svc.notificaciones$;
    this.svc.listar().subscribe();
  }

  marcarLeida(n: Notificacion): void {
    if (n.leida) return;
    this.svc.marcarLeida(n.id).subscribe({ next: () => this.svc.listar().subscribe() });
  }

  marcarTodas(): void {
    this.svc.marcarTodasLeidas().subscribe({
      next: () => {
        this.svc.listar().subscribe();
        Swal.fire({ icon: 'success', title: 'Listo', timer: 1000, showConfirmButton: false });
      },
    });
  }

  icono(tipo: string): string {
    const map: Record<string, string> = {
      info: 'text-blue-500', exito: 'text-green-500',
      advertencia: 'text-yellow-500', error: 'text-red-500',
    };
    return map[tipo] || 'text-gray-400';
  }
}
