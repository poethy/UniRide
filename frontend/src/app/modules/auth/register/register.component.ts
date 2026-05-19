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
      // Accept bare username (juan.perez) OR full email (juan.perez@uam.edu.co)
      email:               ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+\-]+(@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})?$/)]],
      password:            ['', [Validators.required, Validators.minLength(6)]],
      universidad:         [''],
      codigo_estudiantil:  [''],
      rol_id:              [3, Validators.required],
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const payload = { ...this.form.value };
    // Auto-append domain when user typed only the username part
    if (!payload.email.includes('@')) {
      payload.email = `${payload.email}@uam.edu.co`;
    }
    this.auth.register(payload).subscribe({
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
