import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
})
export class App implements OnInit {
  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    // Pre-calienta la conexión con el backend/Supabase en cuanto la app carga,
    // para que la primera navegación a cualquier módulo no tenga espera fría
    if (this.auth.isLoggedIn()) {
      this.auth.refreshUser().subscribe();
    }
  }
}
