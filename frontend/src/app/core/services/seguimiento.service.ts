import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models';

export interface UbicacionConductor {
  lat: number;
  lng: number;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class SeguimientoService {
  private api = `${environment.apiUrl}/viajes`;

  constructor(private http: HttpClient) {}

  actualizarUbicacion(viajeId: number, lat: number, lng: number) {
    return this.http.put<ApiResponse<{ updated: boolean }>>(
      `${this.api}/${viajeId}/ubicacion`,
      { lat, lng }
    );
  }

  obtenerUbicacion(viajeId: number) {
    return this.http.get<ApiResponse<UbicacionConductor | null>>(
      `${this.api}/${viajeId}/ubicacion`
    );
  }
}
