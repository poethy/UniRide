import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { RutasComponent } from './rutas.component';

const routes: Routes = [{ path: '', component: RutasComponent }];

@NgModule({
  declarations: [RutasComponent],
  imports: [CommonModule, ReactiveFormsModule, RouterModule.forChild(routes)],
})
export class RutasModule {}
