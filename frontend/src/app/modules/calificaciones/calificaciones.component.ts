import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { CalificacionesService } from '../../core/services/calificaciones.service';
import { Calificacion } from '../../core/models';
import Swal from 'sweetalert2';

@Component({ standalone: false, selector: 'app-calificaciones', templateUrl: './calificaciones.component.html' })
export class CalificacionesComponent implements OnInit {
  calificaciones$!: Observable<Calificacion[]>;
  promedio: number | null = null;
  total = 0;
  form: FormGroup;
  showForm = false;

  constructor(private fb: FormBuilder, public auth: AuthService, private svc: CalificacionesService) {
    this.form = this.fb.group({
      viaje_id:      ['', Validators.required],
      calificado_id: ['', Validators.required],
      puntaje:       [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comentario:    [''],
    });
  }

  ngOnInit(): void {
    const userId = this.auth.currentUser?.id;
    if (!userId) return;
    this.calificaciones$ = this.svc.calificaciones$;
    this.svc.listarDeUsuario(userId).subscribe();
    this.svc.promedio(userId).subscribe({ next: r => { this.promedio = r.data.promedio; this.total = r.data.total; } });
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.svc.crear(this.form.value).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: '¡Calificación enviada!', timer: 1500, showConfirmButton: false });
        this.showForm = false;
        this.form.reset({ puntaje: 5 });
        const userId = this.auth.currentUser?.id;
        if (userId) this.svc.listarDeUsuario(userId).subscribe();
      },
      error: err => Swal.fire({ icon: 'error', title: 'Error', text: err.error?.message }),
    });
  }

  get promedioRedondeado(): number { return this.promedio ? Math.round(this.promedio) : 0; }
  estrellas(n: number): number[] { return Array(n).fill(0); }
  estrellasVacias(n: number): number[] { return Array(5 - n).fill(0); }
}
