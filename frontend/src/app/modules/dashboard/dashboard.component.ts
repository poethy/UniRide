import {
  Component, OnInit, OnDestroy,
  AfterViewChecked, ElementRef, ViewChild,
} from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import * as L from 'leaflet';

import { AuthService }           from '../../core/services/auth.service';
import { ViajesService }         from '../../core/services/viajes.service';
import { SeguimientoService }    from '../../core/services/seguimiento.service';
import { CalificacionesService } from '../../core/services/calificaciones.service';
import { Usuario, Viaje }        from '../../core/models';

(L.Icon.Default.prototype as any)._getIconUrl = undefined;
L.Icon.Default.mergeOptions({
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('mapDashEl') mapDashEl?: ElementRef<HTMLDivElement>;

  usuario:         Usuario | null = null;
  viajesRecientes: Viaje[]        = [];
  viajeEnCurso:    Viaje | null   = null;
  proxViaje:       Viaje | null   = null;
  totalViajes      = 0;
  viajesActivos    = 0;
  promedio         = 0;
  promedioTotal    = 0;
  loading          = true;
  today            = new Date();

  private map?:             L.Map;
  private conductorMarker?: L.Marker;
  private mapInitialized    = false;
  private mapPendingInit    = false;
  private pollSub?:         Subscription;
  private geoInterval?:     ReturnType<typeof setInterval>;

  get esConductor(): boolean { return this.auth.hasRole('conductor'); }

  firstPart(s: string | null | undefined): string {
    if (!s) return '';
    const parts = s.split(',');
    return parts[0] ?? '';
  }

  formatMonto(n: number | null | undefined): string {
    return (n ?? 0).toLocaleString('es-CO');
  }

  starsArray(rating: number): boolean[] {
    return [1, 2, 3, 4, 5].map(i => i <= Math.round(rating));
  }
  get otraPersona() {
    return this.esConductor ? this.viajeEnCurso?.pasajero : this.viajeEnCurso?.conductor;
  }

  get fechaHoy(): string {
    const dias  = ['DOMINGO','LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO'];
    const meses = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO',
                   'SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
    const d = this.today;
    return `${dias[d.getDay()]}, ${d.getDate()} DE ${meses[d.getMonth()]}`;
  }

  get viajesAlcance(): number {
    return Math.floor((this.usuario?.saldo_billetera ?? 0) / 5000);
  }

  get rutasGuardadas(): number {
    const seen = new Set<string>();
    for (const v of this.viajesRecientes) {
      if (v.ruta) seen.add(`${v.ruta.origen_descripcion}|${v.ruta.destino_descripcion}`);
    }
    return seen.size;
  }

  get ultimoViajeFinalizado(): Viaje | null {
    return this.viajesRecientes.find(v => v.estado === 'finalizado') ?? null;
  }

  constructor(
    public  auth:              AuthService,
    private viajesSvc:         ViajesService,
    private seguimientoSvc:    SeguimientoService,
    private calificacionesSvc: CalificacionesService,
  ) {}

  ngOnInit(): void {
    this.usuario = this.auth.currentUser;
    this.cargarDatos();
    const uid = this.usuario?.id;
    if (uid) {
      this.calificacionesSvc.promedio(uid).subscribe(res => {
        this.promedio      = res.data?.promedio ?? 0;
        this.promedioTotal = res.data?.total    ?? 0;
      });
    }
  }

  ngAfterViewChecked(): void {
    if (this.mapPendingInit && this.mapDashEl?.nativeElement) {
      this.mapPendingInit = false;
      setTimeout(() => this.initMap(), 0);
    }
  }

  private cargarDatos(): void {
    const userId = this.usuario?.id;
    if (!userId) return;
    const filtro = this.esConductor ? { conductor_id: userId } : { pasajero_id: userId };

    this.viajesSvc.listar(filtro).subscribe({
      next: res => {
        const todos          = res.data;
        this.viajesRecientes = todos.slice(0, 5);
        this.totalViajes     = todos.length;
        this.viajesActivos   = todos.filter(v =>
          ['pendiente','aceptado','en_curso'].includes(v.estado)).length;
        this.loading = false;

        const enCurso = todos.find(v => v.estado === 'en_curso') ?? null;
        if (enCurso?.id !== this.viajeEnCurso?.id) {
          this.limpiarTracking();
          this.viajeEnCurso = enCurso;
          if (enCurso) this.mapPendingInit = true;
        }

        this.proxViaje = !enCurso
          ? (todos.find(v => v.estado === 'aceptado') ?? todos.find(v => v.estado === 'pendiente') ?? null)
          : null;
      },
      error: () => { this.loading = false; },
    });
  }

  private initMap(): void {
    if (this.mapInitialized || !this.viajeEnCurso?.ruta || !this.mapDashEl?.nativeElement) return;
    const ruta = this.viajeEnCurso.ruta;
    this.map = L.map(this.mapDashEl.nativeElement).setView([ruta.origen_lat, ruta.origen_lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(this.map);

    const dot = (c: string) => L.divIcon({
      className: '',
      html: `<div style="background:${c};width:13px;height:13px;border-radius:50%;border:2.5px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
      iconAnchor: [6, 6],
    });
    L.marker([ruta.origen_lat,  ruta.origen_lng],  { icon: dot('#22c55e') }).addTo(this.map);
    L.marker([ruta.destino_lat, ruta.destino_lng], { icon: dot('#ef4444') }).addTo(this.map);
    const coords: [number, number][] = ruta.puntos_ruta?.length
      ? ruta.puntos_ruta.map((p: any) => [p.latitud, p.longitud])
      : [[ruta.origen_lat, ruta.origen_lng], [ruta.destino_lat, ruta.destino_lng]];
    L.polyline(coords, { color: '#E8852A', weight: 4, opacity: 0.9 }).addTo(this.map);
    this.map.fitBounds(L.latLngBounds(coords), { padding: [35, 35] });
    this.mapInitialized = true;
    this.iniciarTracking();
  }

  private iniciarTracking(): void {
    if (!this.viajeEnCurso) return;
    const viajeId = this.viajeEnCurso.id;
    if (this.esConductor) {
      this.geoInterval = setInterval(() => {
        navigator.geolocation?.getCurrentPosition(pos => {
          this.seguimientoSvc.actualizarUbicacion(viajeId, pos.coords.latitude, pos.coords.longitude).subscribe();
          this.moverConductor(pos.coords.latitude, pos.coords.longitude);
        }, () => {}, { enableHighAccuracy: true, timeout: 4000 });
      }, 5000);
    } else {
      this.pollSub = interval(5000).pipe(
        switchMap(() => this.seguimientoSvc.obtenerUbicacion(viajeId))
      ).subscribe(res => { if (res.data) this.moverConductor(res.data.lat, res.data.lng); });
    }
  }

  private moverConductor(lat: number, lng: number): void {
    if (!this.map) return;
    const icon = L.divIcon({
      className: '',
      html: `<div style="background:#1E3A78;width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 3px rgba(30,58,120,.3)"></div>`,
      iconAnchor: [9, 9],
    });
    if (this.conductorMarker) this.conductorMarker.setLatLng([lat, lng]);
    else this.conductorMarker = L.marker([lat, lng], { icon, zIndexOffset: 1000 }).addTo(this.map!);
  }

  calificarViaje(viaje: Viaje): void {
    const rol = this.esConductor ? 'pasajero' : 'conductor';
    this.calificacionesSvc.abrirModalCalificacion(viaje, rol, () => this.cargarDatos());
  }

  private limpiarTracking(): void {
    this.pollSub?.unsubscribe();
    if (this.geoInterval) clearInterval(this.geoInterval);
    if (this.map) { this.map.remove(); this.map = undefined; }
    this.conductorMarker = undefined;
    this.mapInitialized  = false;
    this.mapPendingInit  = false;
  }

  ngOnDestroy(): void { this.limpiarTracking(); }
}
