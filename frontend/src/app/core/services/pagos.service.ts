import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse, Pago, Transaccion } from '../models';

@Injectable({ providedIn: 'root' })
export class PagosService {
  private api = `${environment.apiUrl}/pagos`;
  constructor(private http: HttpClient) {}

  listar()                   { return this.http.get<ApiResponse<Pago[]>>(this.api); }
  obtener(id: number)        { return this.http.get<ApiResponse<Pago>>(`${this.api}/${id}`); }
  recargar(monto: number)    { return this.http.post<ApiResponse<Transaccion>>(`${this.api}/recargar`, { monto }); }
  transacciones()            { return this.http.get<ApiResponse<Transaccion[]>>(`${this.api}/transacciones`); }
}
