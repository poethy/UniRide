import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse, Ruta } from '../models';

@Injectable({ providedIn: 'root' })
export class RutasService {
  private api = `${environment.apiUrl}/rutas`;
  constructor(private http: HttpClient) {}

  listar()                              { return this.http.get<ApiResponse<Ruta[]>>(this.api); }
  obtener(id: number)                   { return this.http.get<ApiResponse<Ruta>>(`${this.api}/${id}`); }
  crear(data: Partial<Ruta>)            { return this.http.post<ApiResponse<Ruta>>(this.api, data); }
  actualizar(id: number, data: Partial<Ruta>) { return this.http.put<ApiResponse<Ruta>>(`${this.api}/${id}`, data); }
  eliminar(id: number)                  { return this.http.delete<ApiResponse<any>>(`${this.api}/${id}`); }
  favoritos()                           { return this.http.get<ApiResponse<any[]>>(`${this.api}/favoritas`); }
  agregarFavorito(ruta_id: number, alias?: string) { return this.http.post<ApiResponse<any>>(`${this.api}/favoritas`, { ruta_id, alias }); }
  quitarFavorito(ruta_id: number)       { return this.http.delete<ApiResponse<any>>(`${this.api}/favoritas/${ruta_id}`); }
}
