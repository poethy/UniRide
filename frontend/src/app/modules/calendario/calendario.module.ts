import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarioComponent } from './calendario.component';

const routes: Routes = [{ path: '', component: CalendarioComponent }];

@NgModule({
  declarations: [CalendarioComponent],
  imports: [CommonModule, RouterModule.forChild(routes), FullCalendarModule],
})
export class CalendarioModule {}
