import { Component, OnInit } from '@angular/core';
import { UsuariosService } from '../../core/services/usuarios.service';
import { Usuario } from '../../core/models';
import Swal from 'sweetalert2';

@Component({ standalone: false, selector: 'app-usuarios', templateUrl: './usuarios.component.html' })
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  loading = true;
  busqueda = '';

  constructor(private svc: UsuariosService) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading = true;
    this.svc.listar().subscribe({ next: r => { this.usuarios = r.data; this.loading = false; } });
  }

  get filtrados(): Usuario[] {
    const q = this.busqueda.toLowerCase();
    return this.usuarios.filter(u =>
      u.nombre.toLowerCase().includes(q) ||
      u.apellido.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }

  desactivar(u: Usuario): void {
    Swal.fire({ title: `¿Desactivar a ${u.nombre}?`, icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'No' })
      .then(r => { if (r.isConfirmed) this.svc.desactivar(u.id).subscribe({ next: () => this.cargar() }); });
  }

  asignarRol(u: Usuario): void {
    Swal.fire({
      title: 'Asignar rol',
      input: 'select',
      inputOptions: { 1: 'Administrador', 2: 'Conductor', 3: 'Pasajero' },
      showCancelButton: true,
      confirmButtonText: 'Asignar',
    }).then(r => {
      if (r.isConfirmed)
        this.svc.asignarRol(u.id, Number(r.value)).subscribe({
          next: () => Swal.fire({ icon: 'success', title: 'Rol asignado', timer: 1200, showConfirmButton: false }),
        });
    });
  }
}
