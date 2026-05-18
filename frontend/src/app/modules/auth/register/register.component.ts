import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({ standalone: false, selector: 'app-register', templateUrl: './register.component.html' })
export class RegisterComponent {
  form: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      nombre:              ['', Validators.required],
      apellido:            ['', Validators.required],
      email:               ['', [Validators.required, Validators.email]],
      password:            ['', [Validators.required, Validators.minLength(6)]],
      universidad:         [''],
      codigo_estudiantil:  [''],
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.auth.register(this.form.value).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: '¡Cuenta creada!', text: 'Ya puedes iniciar sesión.' });
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading = false;
        Swal.fire({ icon: 'error', title: 'Error', text: err.error?.message || 'No se pudo registrar.' });
      },
    });
  }
}
