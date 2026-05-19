export interface UsuarioRol {
  rol: { id: number; nombre: string };
}

export interface Usuario {
  id: number;
  uuid: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  foto_perfil?: string;
  universidad?: string;
  codigo_estudiantil?: string;
  saldo_billetera: number;
  activo: boolean;
  email_verificado: boolean;
  roles: string[];
  usuarios_roles?: UsuarioRol[];
  created_at: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

export interface Vehiculo {
  id: number;
  conductor_id: number;
  marca: string;
  modelo: string;
  anio: number;
  color: string;
  placa: string;
  capacidad_pasajeros: number;
  foto_vehiculo?: string;
  soat_vence?: string;
  tecnomecanica_vence?: string;
  verificado: boolean;
  activo: boolean;
  conductor?: Pick<Usuario, 'id' | 'nombre' | 'apellido'>;
}

export interface Ruta {
  id: number;
  nombre?: string;
  origen_descripcion: string;
  origen_lat: number;
  origen_lng: number;
  destino_descripcion: string;
  destino_lat: number;
  destino_lng: number;
  distancia_km?: number;
  duracion_min?: number;
  puntos_ruta?: PuntoRuta[];
}

export interface PuntoRuta {
  id: number;
  orden: number;
  descripcion?: string;
  latitud: number;
  longitud: number;
}

export type EstadoViaje = 'pendiente' | 'aceptado' | 'en_curso' | 'finalizado' | 'cancelado';

export interface Viaje {
  id: number;
  uuid: string;
  pasajero_id: number;
  conductor_id?: number;
  vehiculo_id?: number;
  ruta_id: number;
  estado: EstadoViaje;
  precio?: number;
  fecha_solicitud: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  motivo_cancelacion?: string;
  pasajero?: Pick<Usuario, 'id' | 'nombre' | 'apellido' | 'foto_perfil' | 'telefono'>;
  conductor?: Pick<Usuario, 'id' | 'nombre' | 'apellido' | 'foto_perfil' | 'telefono'>;
  vehiculo?: Vehiculo;
  ruta?: Ruta;
}

export interface Pago {
  id: number;
  uuid: string;
  viaje_id: number;
  monto: number;
  estado: 'pendiente' | 'completado' | 'fallido' | 'reembolsado';
  metodo: string;
  pagado_en?: string;
  created_at: string;
  viaje?: Viaje;
}

export interface Transaccion {
  id: number;
  usuario_id: number;
  tipo: 'recarga' | 'cobro_viaje' | 'pago_viaje' | 'reembolso' | 'retiro';
  monto: number;
  saldo_anterior: number;
  saldo_nuevo: number;
  descripcion?: string;
  created_at: string;
}

export interface Calificacion {
  id: number;
  viaje_id: number;
  calificador_id: number;
  calificado_id: number;
  puntaje: number;
  comentario?: string;
  created_at: string;
  calificador?: Pick<Usuario, 'id' | 'nombre' | 'apellido' | 'foto_perfil'>;
}

export interface Notificacion {
  id: number;
  usuario_id: number;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'exito' | 'advertencia' | 'error';
  leida: boolean;
  viaje_id?: number;
  created_at: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  message?: string;
}
