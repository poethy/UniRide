import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SeguimientoComponent } from './seguimiento.component';

const routes: Routes = [{ path: '', component: SeguimientoComponent }];

@NgModule({
  declarations: [SeguimientoComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class SeguimientoModule {}
