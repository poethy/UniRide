import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, Vehiculo } from '../models';

@Injectable({ providedIn: 'root' })
export class VehiculosService {
  private api = `${environment.apiUrl}/vehiculos`;

  private _vehiculos$ = new BehaviorSubject<Vehiculo[]>([]);
  readonly vehiculos$ = this._vehiculos$.asObservable();

  constructor(private http: HttpClient) {}

  listar(conductor_id?: number) {
    const params: any = conductor_id ? { conductor_id } : {};
    return this.http.get<ApiResponse<Vehiculo[]>>(this.api, { params }).pipe(
      tap(res => this._vehiculos$.next(res.data))
    );
  }

  obtener(id: number)                              { return this.http.get<ApiResponse<Vehiculo>>(`${this.api}/${id}`); }
  crear(data: Partial<Vehiculo>)                   { return this.http.post<ApiResponse<Vehiculo>>(this.api, data); }
  actualizar(id: number, data: Partial<Vehiculo>)  { return this.http.put<ApiResponse<Vehiculo>>(`${this.api}/${id}`, data); }
  eliminar(id: number)                             { return this.http.delete<ApiResponse<Vehiculo>>(`${this.api}/${id}`); }
}
