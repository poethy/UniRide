import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ViajesComponent } from './viajes.component';

const routes: Routes = [{ path: '', component: ViajesComponent }];

@NgModule({
  declarations: [ViajesComponent],
  imports: [CommonModule, ReactiveFormsModule, RouterModule.forChild(routes)],
})
export class ViajesModule {}
