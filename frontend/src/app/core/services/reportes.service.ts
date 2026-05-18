import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private api = `${environment.apiUrl}/reportes`;
  constructor(private http: HttpClient) {}

  resumen()                         { return this.http.get<ApiResponse<any>>(`${this.api}/resumen`); }
  viajesPorEstado()                 { return this.http.get<ApiResponse<any>>(`${this.api}/viajes/estados`); }
  topConductores(limit = 5)         { return this.http.get<ApiResponse<any[]>>(`${this.api}/top-conductores`, { params: { limit } }); }
  actividadReciente(dias = 30)      { return this.http.get<ApiResponse<any[]>>(`${this.api}/actividad`, { params: { dias } }); }
}
