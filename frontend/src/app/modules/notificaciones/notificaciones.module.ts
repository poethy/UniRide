import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NotificacionesComponent } from './notificaciones.component';

const routes: Routes = [{ path: '', component: NotificacionesComponent }];

@NgModule({
  declarations: [NotificacionesComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class NotificacionesModule {}
