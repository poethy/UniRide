import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ViajesService } from '../../core/services/viajes.service';
import { PagosService } from '../../core/services/pagos.service';
import { Usuario, Viaje } from '../../core/models';

@Component({ standalone: false, selector: 'app-dashboard', templateUrl: './dashboard.component.html' })
export class DashboardComponent implements OnInit {
  usuario: Usuario | null = null;
  viajesRecientes: Viaje[] = [];
  totalViajes = 0;
  viajesActivos = 0;
  loading = false;

  constructor(
    public auth: AuthService,
    private viajesSvc: ViajesService,
    private pagosSvc: PagosService,
  ) {}

  ngOnInit(): void {
    this.usuario = this.auth.currentUser;
    this.cargarDatos();
  }

  private cargarDatos(): void {
    const userId = this.usuario?.id;
    if (!userId) return;

    const filtro = this.auth.hasRole('conductor')
      ? { conductor_id: userId }
      : { pasajero_id: userId };

    this.viajesSvc.listar(filtro).subscribe({
      next: (res) => {
        this.viajesRecientes = res.data.slice(0, 5);
        this.totalViajes = res.data.length;
        this.viajesActivos = res.data.filter(v =>
          ['pendiente', 'aceptado', 'en_curso'].includes(v.estado)
        ).length;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }
}
