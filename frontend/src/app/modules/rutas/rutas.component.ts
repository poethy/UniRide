import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { RutasService } from '../../core/services/rutas.service';
import { Ruta } from '../../core/models';
import Swal from 'sweetalert2';

@Component({ standalone: false, selector: 'app-rutas', templateUrl: './rutas.component.html' })
export class RutasComponent implements OnInit {
  rutas$!: Observable<Ruta[]>;
  favoritas: any[] = [];
  form: FormGroup;
  showForm = false;

  constructor(private fb: FormBuilder, private svc: RutasService) {
    this.form = this.fb.group({
      nombre:              [''],
      origen_descripcion:  ['', Validators.required],
      origen_lat:          ['', Validators.required],
      origen_lng:          ['', Validators.required],
      destino_descripcion: ['', Validators.required],
      destino_lat:         ['', Validators.required],
      destino_lng:         ['', Validators.required],
      distancia_km:        [''],
      duracion_min:        [''],
    });
  }

  ngOnInit(): void {
    this.rutas$ = this.svc.rutas$;
    this.cargar();
  }

  cargar(): void {
    this.svc.listar().subscribe();
    this.svc.favoritos().subscribe({ next: r => this.favoritas = r.data });
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.svc.crear(this.form.value).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Ruta creada', timer: 1500, showConfirmButton: false });
        this.showForm = false;
        this.form.reset();
        this.cargar();
      },
      error: err => Swal.fire({ icon: 'error', title: 'Error', text: err.error?.message }),
    });
  }

  toggleFavorito(ruta: Ruta): void {
    const esFav = this.favoritas.some(f => f.ruta_id === ruta.id);
    const op = esFav ? this.svc.quitarFavorito(ruta.id) : this.svc.agregarFavorito(ruta.id);
    op.subscribe({ next: () => this.cargar() });
  }

  esFavorita(ruta: Ruta): boolean {
    return this.favoritas.some(f => f.ruta_id === ruta.id);
  }
}
