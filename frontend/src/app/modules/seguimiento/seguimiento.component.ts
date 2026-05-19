import {
  Component, OnInit, OnDestroy, AfterViewInit,
  ElementRef, ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import * as L from 'leaflet';

import { AuthService }        from '../../core/services/auth.service';
import { ViajesService }      from '../../core/services/viajes.service';
import { SeguimientoService } from '../../core/services/seguimiento.service';
import { Viaje, Vehiculo }    from '../../core/models';

// Fix Leaflet icon paths con webpack/Angular
(L.Icon.Default.prototype as any)._getIconUrl = undefined;
L.Icon.Default.mergeOptions({
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

@Component({
  standalone: false,
  selector: 'app-seguimiento',
  templateUrl: './seguimiento.component.html',
})
export class SeguimientoComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapEl') mapEl!: ElementRef<HTMLDivElement>;

  viaje: Viaje | null = null;
  viajeId!: number;
  cargando = true;

  private map!: L.Map;
  private conductorMarker?: L.Marker;
  private pollSub?: Subscription;
  private geoInterval?: ReturnType<typeof setInterval>;
  private mapInitialized = false;

  get esConductor(): boolean { return this.auth.hasRole('conductor'); }

  get otraPersona() {
    return this.esConductor ? this.viaje?.pasajero : this.viaje?.conductor;
  }

  get vehiculoViaje(): Vehiculo | undefined {
    return this.viaje?.vehiculo;
  }

  constructor(
    private route:          ActivatedRoute,
    private router:         Router,
    public  auth:           AuthService,
    private viajesSvc:      ViajesService,
    private seguimientoSvc: SeguimientoService,
  ) {}

  ngOnInit(): void {
    this.viajeId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarViaje();
  }

  ngAfterViewInit(): void {
    // El mapa se inicializa después de cargar el viaje
  }

  cargarViaje(): void {
    this.viajesSvc.obtener(this.viajeId).subscribe({
      next: res => {
        this.viaje = res.data;
        this.cargando = false;

        if (this.viaje.estado !== 'en_curso') {
          this.router.navigate(['/viajes']);
          return;
        }

        // Esperar a que Angular renderice el div del mapa
        setTimeout(() => {
          this.initMap();
          this.iniciarTracking();
        }, 150);
      },
      error: () => this.router.navigate(['/viajes']),
    });
  }

  private initMap(): void {
    if (!this.viaje?.ruta || !this.mapEl?.nativeElement) return;

    const { origen_lat, origen_lng, destino_lat, destino_lng, puntos_ruta } = this.viaje.ruta;

    this.map = L.map(this.mapEl.nativeElement).setView([origen_lat, origen_lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    // Marcador origen (verde)
    const iconOrigen = L.divIcon({
      className: '',
      html: '<div style="background:#22c55e;width:14px;height:14px;border-radius:50%;border:2.5px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,0.4)"></div>',
      iconAnchor: [7, 7],
    });
    L.marker([origen_lat, origen_lng], { icon: iconOrigen })
      .addTo(this.map)
      .bindPopup(`<b>Origen</b><br>${this.viaje.ruta.origen_descripcion}`);

    // Marcador destino (rojo)
    const iconDestino = L.divIcon({
      className: '',
      html: '<div style="background:#ef4444;width:14px;height:14px;border-radius:50%;border:2.5px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,0.4)"></div>',
      iconAnchor: [7, 7],
    });
    L.marker([destino_lat, destino_lng], { icon: iconDestino })
      .addTo(this.map)
      .bindPopup(`<b>Destino</b><br>${this.viaje.ruta.destino_descripcion}`);

    // Polyline de la ruta
    const coords: [number, number][] = puntos_ruta?.length
      ? puntos_ruta.map(p => [p.latitud, p.longitud])
      : [[origen_lat, origen_lng], [destino_lat, destino_lng]];

    L.polyline(coords, { color: '#6366f1', weight: 4, dashArray: '8 5', opacity: 0.85 })
      .addTo(this.map);

    // Ajustar vista
    const bounds = L.latLngBounds(coords);
    this.map.fitBounds(bounds, { padding: [40, 40] });

    this.mapInitialized = true;
  }

  private iniciarTracking(): void {
    if (this.esConductor) {
      // Conductor: envía su ubicación GPS cada 5 segundos
      this.geoInterval = setInterval(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
          pos => {
            const { latitude, longitude } = pos.coords;
            this.seguimientoSvc
              .actualizarUbicacion(this.viajeId, latitude, longitude)
              .subscribe();
            this.actualizarMarcadorConductor(latitude, longitude);
          },
          () => { /* permiso denegado o error GPS */ },
          { enableHighAccuracy: true, timeout: 4000 }
        );
      }, 5000);
    } else {
      // Pasajero: consulta la ubicación del conductor cada 5 segundos
      this.pollSub = interval(5000).pipe(
        switchMap(() => this.seguimientoSvc.obtenerUbicacion(this.viajeId))
      ).subscribe(res => {
        if (res.data) {
          this.actualizarMarcadorConductor(res.data.lat, res.data.lng);
        }
      });
    }
  }

  private actualizarMarcadorConductor(lat: number, lng: number): void {
    if (!this.mapInitialized || !this.map) return;

    const iconConductor = L.divIcon({
      className: '',
      html: `<div style="
        background:#6366f1;
        width:20px;height:20px;
        border-radius:50%;
        border:3px solid #fff;
        box-shadow:0 0 0 3px rgba(99,102,241,0.35), 0 2px 6px rgba(0,0,0,0.3)
      "></div>`,
      iconAnchor: [10, 10],
    });

    if (this.conductorMarker) {
      this.conductorMarker.setLatLng([lat, lng]);
    } else {
      this.conductorMarker = L.marker([lat, lng], { icon: iconConductor, zIndexOffset: 1000 })
        .addTo(this.map)
        .bindPopup('<b>Conductor</b><br>Ubicación en tiempo real');
    }
  }

  volver(): void {
    this.router.navigate(['/viajes']);
  }

  ngOnDestroy(): void {
    if (this.pollSub)    this.pollSub.unsubscribe();
    if (this.geoInterval) clearInterval(this.geoInterval);
    if (this.map)        this.map.remove();
  }
}
