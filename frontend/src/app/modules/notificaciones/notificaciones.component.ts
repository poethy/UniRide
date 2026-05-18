import { Component, OnInit } from '@angular/core';
import { NotificacionesService } from '../../core/services/notificaciones.service';
import { Notificacion } from '../../core/models';
import Swal from 'sweetalert2';

@Component({ standalone: false, selector: 'app-notificaciones', templateUrl: './notificaciones.component.html' })
export class NotificacionesComponent implements OnInit {
  notificaciones: Notificacion[] = [];
  loading = true;

  constructor(private svc: NotificacionesService) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading = true;
    this.svc.listar().subscribe({ next: r => { this.notificaciones = r.data; this.loading = false; } });
  }

  marcarLeida(n: Notificacion): void {
    if (n.leida) return;
    this.svc.marcarLeida(n.id).subscribe({ next: () => { n.leida = true; } });
  }

  marcarTodas(): void {
    this.svc.marcarTodasLeidas().subscribe({
      next: () => {
        this.notificaciones.forEach(n => n.leida = true);
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
