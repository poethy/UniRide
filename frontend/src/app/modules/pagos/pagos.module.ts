import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { PagosComponent } from './pagos.component';

const routes: Routes = [{ path: '', component: PagosComponent }];

@NgModule({
  declarations: [PagosComponent],
  imports: [CommonModule, ReactiveFormsModule, RouterModule.forChild(routes)],
})
export class PagosModule {}
