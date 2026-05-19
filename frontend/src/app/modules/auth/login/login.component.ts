import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({ standalone: false, selector: 'app-login', templateUrl: './login.component.html' })
export class LoginComponent {
  form: FormGroup;
  loading = false;
  tab: 'pasajero' | 'conductor' = 'pasajero';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      // Accept bare username (sofia.henao) OR full email (sofia.henao@uam.edu.co)
      email:    ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+\-]+(@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})?$/)]],
      password: ['', Validators.required],
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    let { email, password } = this.form.value;
    // Auto-append domain when user typed only the username part
    if (!email.includes('@')) {
      email = `${email}@uam.edu.co`;
    }
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.loading = false;
        Swal.fire({ icon: 'error', title: 'Error', text: err.error?.message || 'Credenciales inválidas' });
      },
    });
  }
}
