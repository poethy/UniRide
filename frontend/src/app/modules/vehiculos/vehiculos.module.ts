import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { VehiculosComponent } from './vehiculos.component';

const routes: Routes = [{ path: '', component: VehiculosComponent }];

@NgModule({
  declarations: [VehiculosComponent],
  imports: [CommonModule, ReactiveFormsModule, RouterModule.forChild(routes)],
})
export class VehiculosModule {}
