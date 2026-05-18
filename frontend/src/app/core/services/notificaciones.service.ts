import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, Notificacion } from '../models';

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private api = `${environment.apiUrl}/notificaciones`;
  private noLeidasSubject = new BehaviorSubject<number>(0);
  noLeidas$ = this.noLeidasSubject.asObservable();

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get<ApiResponse<Notificacion[]>>(this.api).pipe(
      tap(res => this.noLeidasSubject.next(res.data.filter(n => !n.leida).length))
    );
  }
  marcarLeida(id: number)    { return this.http.patch<ApiResponse<Notificacion>>(`${this.api}/${id}/leer`, {}); }
  marcarTodasLeidas()        { return this.http.patch<ApiResponse<any>>(`${this.api}/leer-todas`, {}); }
}
