import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse, Viaje } from '../models';

@Injectable({ providedIn: 'root' })
export class ViajesService {
  private api = `${environment.apiUrl}/viajes`;
  constructor(private http: HttpClient) {}

  listar(filtros: { pasajero_id?: number; conductor_id?: number; estado?: string } = {}) {
    return this.http.get<ApiResponse<Viaje[]>>(this.api, { params: filtros as any });
  }
  obtener(id: number)                  { return this.http.get<ApiResponse<Viaje>>(`${this.api}/${id}`); }
  solicitar(data: { ruta_id: number; precio?: number }) { return this.http.post<ApiResponse<Viaje>>(this.api, data); }
  aceptar(id: number, vehiculo_id: number) { return this.http.patch<ApiResponse<Viaje>>(`${this.api}/${id}/aceptar`, { vehiculo_id }); }
  iniciar(id: number)                  { return this.http.patch<ApiResponse<Viaje>>(`${this.api}/${id}/iniciar`, {}); }
  finalizar(id: number)                { return this.http.patch<ApiResponse<Viaje>>(`${this.api}/${id}/finalizar`, {}); }
  cancelar(id: number, motivo?: string){ return this.http.patch<ApiResponse<Viaje>>(`${this.api}/${id}/cancelar`, { motivo_cancelacion: motivo }); }
}
