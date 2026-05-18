import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CalificacionesComponent } from './calificaciones.component';

const routes: Routes = [{ path: '', component: CalificacionesComponent }];

@NgModule({
  declarations: [CalificacionesComponent],
  imports: [CommonModule, ReactiveFormsModule, RouterModule.forChild(routes)],
})
export class CalificacionesModule {}
