import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule),
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '',           redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',  loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule) },
      { path: 'viajes',     loadChildren: () => import('./modules/viajes/viajes.module').then(m => m.ViajesModule) },
      { path: 'rutas',      loadChildren: () => import('./modules/rutas/rutas.module').then(m => m.RutasModule) },
      { path: 'vehiculos',  loadChildren: () => import('./modules/vehiculos/vehiculos.module').then(m => m.VehiculosModule) },
      { path: 'pagos',      loadChildren: () => import('./modules/pagos/pagos.module').then(m => m.PagosModule) },
      { path: 'calificaciones', loadChildren: () => import('./modules/calificaciones/calificaciones.module').then(m => m.CalificacionesModule) },
      { path: 'notificaciones', loadChildren: () => import('./modules/notificaciones/notificaciones.module').then(m => m.NotificacionesModule) },
      { path: 'reportes',   loadChildren: () => import('./modules/reportes/reportes.module').then(m => m.ReportesModule) },
      { path: 'calendario', loadChildren: () => import('./modules/calendario/calendario.module').then(m => m.CalendarioModule) },
      { path: 'usuarios',   loadChildren: () => import('./modules/usuarios/usuarios.module').then(m => m.UsuariosModule) },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
