import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { NotificacionesService } from '../../../core/services/notificaciones.service';
import { Usuario } from '../../../core/models';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  standalone: false,
})
export class SidebarComponent implements OnInit {
  noLeidas = 0;
  usuario: Usuario | null = null;

  constructor(
    public  auth:    AuthService,
    private notiSvc: NotificacionesService,
  ) {}

  ngOnInit(): void {
    this.auth.user$.subscribe(u => this.usuario = u);
    this.notiSvc.noLeidas$.subscribe(n => this.noLeidas = n);
  }
}
