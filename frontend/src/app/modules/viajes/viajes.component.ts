import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ViajesService } from '../../core/services/viajes.service';
import { RutasService } from '../../core/services/rutas.service';
import { Viaje, Ruta } from '../../core/models';
import Swal from 'sweetalert2';

@Component({ standalone: false, selector: 'app-viajes', templateUrl: './viajes.component.html' })
export class ViajesComponent implements OnInit {
  viajes$!: Observable<Viaje[]>;
  rutas: Ruta[] = [];
  form: FormGroup;
  filtroEstado = '';
  showForm = false;

  constructor(
    private fb: FormBuilder,
    public auth: AuthService,
    private viajesSvc: ViajesService,
    private rutasSvc: RutasService,
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
