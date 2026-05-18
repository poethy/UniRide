import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse, Usuario } from '../models';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private api = `${environment.apiUrl}/usuarios`;
  constructor(private http: HttpClient) {}

  listar()            { return this.http.get<ApiResponse<Usuario[]>>(this.api); }
  obtener(id: number) { return this.http.get<ApiResponse<Usuario>>(`${this.api}/${id}`); }
  actualizar(id: number, data: Partial<Usuario>) { return this.http.put<ApiResponse<Usuario>>(`${this.api}/${id}`, data); }
  cambiarPassword(data: { password_actual: string; password_nuevo: string }) {
    return this.http.patch<ApiResponse<any>>(`${this.api}/password`, data);
  }
  desactivar(id: number) { return this.http.delete<ApiResponse<Usuario>>(`${this.api}/${id}`); }
  asignarRol(id: number, rol_id: number) { return this.http.post<ApiResponse<any>>(`${this.api}/${id}/roles`, { rol_id }); }
}
