import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { NotificacionesService } from '../../../core/services/notificaciones.service';
import { UiStateService } from '../../../core/services/ui-state.service';
import { Usuario } from '../../../core/models';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: false,
})
export class NavbarComponent implements OnInit {
  usuario: Usuario | null = null;
  noLeidas = 0;

  constructor(
    public  auth:    AuthService,
    private notiSvc: NotificacionesService,
    private ui:      UiStateService,
  ) {}

  ngOnInit(): void {
    this.auth.user$.subscribe(u => this.usuario = u);
    this.notiSvc.noLeidas$.subscribe(n => this.noLeidas = n);
    this.notiSvc.listar().subscribe();
  }

  logout(): void { this.auth.logout(); }
  toggleSidebar(): void { this.ui.toggle(); }
}
