import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { UsuariosComponent } from './usuarios.component';

const routes: Routes = [{ path: '', component: UsuariosComponent }];

@NgModule({
  declarations: [UsuariosComponent],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes)],
})
export class UsuariosModule {}
