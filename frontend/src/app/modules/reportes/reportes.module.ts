import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReportesComponent } from './reportes.component';

const routes: Routes = [{ path: '', component: ReportesComponent }];

@NgModule({
  declarations: [ReportesComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class ReportesModule {}
