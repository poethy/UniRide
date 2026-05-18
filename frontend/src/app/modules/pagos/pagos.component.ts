import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { PagosService } from '../../core/services/pagos.service';
import { Pago, Transaccion, Usuario } from '../../core/models';
import Swal from 'sweetalert2';

@Component({ standalone: false, selector: 'app-pagos', templateUrl: './pagos.component.html' })
export class PagosComponent implements OnInit {
  pagos: Pago[] = [];
  transacciones: Transaccion[] = [];
  usuario: Usuario | null = null;
  form: FormGroup;
  tab: 'pagos' | 'transacciones' = 'pagos';
  loading = true;

  constructor(private fb: FormBuilder, public auth: AuthService, private svc: PagosService) {
    this.form = this.fb.group({ monto: ['', [Validators.required, Validators.min(1)]] });
  }

  ngOnInit(): void {
    this.usuario = this.auth.currentUser;
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.svc.listar().subscribe(r => { this.pagos = r.data; this.loading = false; });
    this.svc.transacciones().subscribe(r => this.transacciones = r.data);
  }

  recargar(): void {
    if (this.form.invalid) return;
    this.svc.recargar(this.form.value.monto).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Recarga exitosa', timer: 1500, showConfirmButton: false });
        this.form.reset();
        this.cargar();
      },
      error: err => Swal.fire({ icon: 'error', title: 'Error', text: err.error?.message }),
    });
  }
}
