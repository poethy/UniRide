import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse, Calificacion } from '../models';

@Injectable({ providedIn: 'root' })
export class CalificacionesService {
  private api = `${environment.apiUrl}/calificaciones`;
  constructor(private http: HttpClient) {}

  listarDeUsuario(id: number)  { return this.http.get<ApiResponse<Calificacion[]>>(`${this.api}/usuario/${id}`); }
  promedio(id: number)         { return this.http.get<ApiResponse<{ promedio: number; total: number }>>(`${this.api}/usuario/${id}/promedio`); }
  crear(data: { viaje_id: number; calificado_id: number; puntaje: number; comentario?: string }) {
    return this.http.post<ApiResponse<Calificacion>>(this.api, data);
  }
}
