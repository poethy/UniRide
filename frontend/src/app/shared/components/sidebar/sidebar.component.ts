import { Component, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { NotificacionesService } from '../../../core/services/notificaciones.service';
import { UiStateService } from '../../../core/services/ui-state.service';
import { Usuario } from '../../../core/models';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  standalone: false,
})
export class SidebarComponent implements OnInit {
  noLeidas = 0;
  usuario: Usuario | null = null;
  isOpen = false;

  constructor(
    public  auth:    AuthService,
    private notiSvc: NotificacionesService,
    private ui:      UiStateService,
    private router:  Router,
  ) {}

  ngOnInit(): void {
    this.auth.user$.subscribe(u => this.usuario = u);
    this.notiSvc.noLeidas$.subscribe(n => this.noLeidas = n);
    this.ui.sidebarOpen$.subscribe(v => this.isOpen = v);
    this.router.events
      .pipe(filter((e): e is NavigationStart => e instanceof NavigationStart))
      .subscribe(() => this.ui.close());
  }

  close(): void { this.ui.close(); }
}
