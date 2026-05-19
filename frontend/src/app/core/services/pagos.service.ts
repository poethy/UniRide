import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, Pago, Transaccion } from '../models';

@Injectable({ providedIn: 'root' })
export class PagosService {
  private api = `${environment.apiUrl}/pagos`;

  private _pagos$ = new BehaviorSubject<Pago[]>([]);
  readonly pagos$ = this._pagos$.asObservable();

  private _transacciones$ = new BehaviorSubject<Transaccion[]>([]);
  readonly transacciones$ = this._transacciones$.asObservable();

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get<ApiResponse<Pago[]>>(this.api).pipe(
      tap(res => this._pagos$.next(res.data))
    );
  }

  obtener(id: number) { return this.http.get<ApiResponse<Pago>>(`${this.api}/${id}`); }

  recargar(monto: number) { return this.http.post<ApiResponse<Transaccion>>(`${this.api}/recargar`, { monto }); }

  transacciones() {
    return this.http.get<ApiResponse<Transaccion[]>>(`${this.api}/transacciones`).pipe(
      tap(res => this._transacciones$.next(res.data))
    );
  }
}
