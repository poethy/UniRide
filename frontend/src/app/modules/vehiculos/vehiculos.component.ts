import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { VehiculosService } from '../../core/services/vehiculos.service';
import { Vehiculo } from '../../core/models';
import Swal from 'sweetalert2';

@Component({ standalone: false, selector: 'app-vehiculos', templateUrl: './vehiculos.component.html' })
export class VehiculosComponent implements OnInit {
  vehiculos: Vehiculo[] = [];
  form: FormGroup;
  editando: Vehiculo | null = null;
  showForm = false;
  loading = true;

  constructor(private fb: FormBuilder, public auth: AuthService, private svc: VehiculosService) {
    this.form = this.fb.group({
      marca:               ['', Validators.required],
      modelo:              ['', Validators.required],
      anio:                ['', [Validators.required, Validators.min(2000)]],
      color:               ['', Validators.required],
      placa:               ['', Validators.required],
      capacidad_pasajeros: [3, [Validators.required, Validators.min(1), Validators.max(8)]],
      soat_vence:          [''],
      tecnomecanica_vence: [''],
    });
  }

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading = true;
    this.svc.listar(this.auth.currentUser?.id).subscribe({
      next: r => { this.vehiculos = r.data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  abrirFormulario(v?: Vehiculo): void {
    this.editando = v || null;
    if (v) {
      this.form.patchValue({ ...v,
        soat_vence: v.soat_vence?.substring(0, 10),
        tecnomecanica_vence: v.tecnomecanica_vence?.substring(0, 10),
      });
    } else {
      this.form.reset({ capacidad_pasajeros: 3 });
    }
    this.showForm = true;
  }

  guardar(): void {
    if (this.form.invalid) return;
    const op = this.editando
      ? this.svc.actualizar(this.editando.id, this.form.value)
      : this.svc.crear(this.form.value);

    op.subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: this.editando ? 'Actualizado' : 'Registrado', timer: 1500, showConfirmButton: false });
        this.showForm = false;
        this.cargar();
      },
      error: err => Swal.fire({ icon: 'error', title: 'Error', text: err.error?.message }),
    });
  }

  eliminar(v: Vehiculo): void {
    Swal.fire({ title: '¿Eliminar vehículo?', text: v.placa, icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Sí', cancelButtonText: 'No' }).then(r => {
      if (r.isConfirmed) this.svc.eliminar(v.id).subscribe({ next: () => this.cargar() });
    });
  }
}
