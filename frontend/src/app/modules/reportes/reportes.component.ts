import { Component, OnInit } from '@angular/core';
import { ReportesService } from '../../core/services/reportes.service';

@Component({ standalone: false, selector: 'app-reportes', templateUrl: './reportes.component.html' })
export class ReportesComponent implements OnInit {
  resumen: any = null;
  estados: any = null;
  actividad: any[] = [];
  loading = true;

  constructor(private svc: ReportesService) {}

  ngOnInit(): void {
    Promise.all([
      this.svc.resumen().toPromise(),
      this.svc.viajesPorEstado().toPromise(),
      this.svc.actividadReciente().toPromise(),
    ]).then(([r, e, a]) => {
      this.resumen  = r?.data;
      this.estados  = e?.data;
      this.actividad = a?.data || [];
      this.loading  = false;
    });
  }

  estadosArray(): { key: string; value: number }[] {
    if (!this.estados) return [];
    return Object.entries(this.estados).map(([key, value]) => ({ key, value: value as number }));
  }
}
