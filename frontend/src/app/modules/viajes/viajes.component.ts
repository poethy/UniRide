import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService }           from '../../core/services/auth.service';
import { ViajesService }         from '../../core/services/viajes.service';
import { RutasService }          from '../../core/services/rutas.service';
import { VehiculosService }      from '../../core/services/vehiculos.service';
import { CalificacionesService } from '../../core/services/calificaciones.service';
import { Viaje, Ruta, Vehiculo } from '../../core/models';
import Swal from 'sweetalert2';

@Component({ standalone: false, selector: 'app-viajes', templateUrl: './viajes.component.html' })
export class ViajesComponent implements OnInit {
  viajes$!: Observable<Viaje[]>;
  rutas: Ruta[] = [];
  vehiculos: Vehiculo[] = [];
  form: FormGroup;
  filtroEstado = '';
  showForm = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public  auth:              AuthService,
    private viajesSvc:         ViajesService,
    private rutasSvc:          RutasService,
    private vehiculosSvc:      VehiculosService,
    private calificacionesSvc: CalificacionesService,
  ) {
    this.form = this.fb.group({
      ruta_id: ['', Validators.required],
      precio:  [''],
    });
  }

  ngOnInit(): void {
    this.viajes$ = this.viajesSvc.viajes$;
    this.cargar();
    this.rutasSvc.listar().subscribe(r => this.rutas = r.data);
    if (this.auth.hasRole('conductor')) {
      this.vehiculosSvc.listar(this.auth.currentUser?.id)
        .subscribe(r => this.vehiculos = r.data);
    }
  }

  cargar(): void {
    const userId = this.auth.currentUser?.id;
    const filtro = this.auth.hasRole('conductor')
      ? { conductor_id: userId, ...(this.filtroEstado ? { estado: this.filtroEstado } : {}) }
      : { pasajero_id: userId, ...(this.filtroEstado ? { estado: this.filtroEstado } : {}) };
    this.viajesSvc.listar(filtro).subscribe();
  }

  solicitar(): void {
    if (this.form.invalid) return;
    const payload = {
      ruta_id: Number(this.form.value.ruta_id),
      precio:  this.form.value.precio ? Number(this.form.value.precio) : undefined,
    };
    this.viajesSvc.solicitar(payload).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Viaje solicitado', timer: 1500, showConfirmButton: false });
        this.showForm = false;
        this.form.reset();
        this.cargar();
      },
      error: err => Swal.fire({ icon: 'error', title: 'Error', text: err.error?.message }),
    });
  }

  aceptar(viaje: Viaje): void {
    if (!this.vehiculos.length) {
      Swal.fire({ icon: 'warning', title: 'Sin vehículos', text: 'Debes registrar un vehículo antes de aceptar viajes.' });
      return;
    }
    const inputOptions: Record<string, string> = {};
    this.vehiculos.forEach(v => {
      inputOptions[v.id] = `${v.marca} ${v.modelo} (${v.placa})`;
    });
    Swal.fire({
      title: 'Selecciona tu vehículo',
      input: 'select',
      inputOptions,
      inputPlaceholder: 'Elige un vehículo',
      showCancelButton: true,
      confirmButtonText: 'Aceptar viaje',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => (!value ? 'Debes seleccionar un vehículo' : null),
    }).then(result => {
      if (result.isConfirmed) {
        this.viajesSvc.aceptar(viaje.id, Number(result.value)).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Viaje aceptado', timer: 1500, showConfirmButton: false });
            this.cargar();
          },
          error: err => Swal.fire({ icon: 'error', title: 'Error', text: err.error?.message }),
        });
      }
    });
  }

  cancelar(viaje: Viaje): void {
    Swal.fire({
      title: '¿Cancelar viaje?',
      input: 'text',
      inputPlaceholder: 'Motivo de cancelación (opcional)',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No',
    }).then(result => {
      if (result.isConfirmed) {
        this.viajesSvc.cancelar(viaje.id, result.value).subscribe({
          next: () => this.cargar(),
          error: err => Swal.fire({ icon: 'error', title: 'Error', text: err.error?.message }),
        });
      }
    });
  }

  calificarViaje(viaje: Viaje): void {
    this.calificacionesSvc.abrirModalCalificacion(viaje, () => this.cargar());
  }

  verSeguimiento(viaje: Viaje): void {
    this.router.navigate(['/seguimiento', viaje.id]);
  }

  cambiarEstado(viaje: Viaje, accion: 'iniciar' | 'finalizar'): void {
    const op = accion === 'iniciar'
      ? this.viajesSvc.iniciar(viaje.id)
      : this.viajesSvc.finalizar(viaje.id);

    op.subscribe({
      next: () => this.cargar(),
      error: err => Swal.fire({ icon: 'error', title: 'Error', text: err.error?.message }),
    });
  }
}
