import { Component, OnInit } from '@angular/core';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';
import { ViajesService } from '../../core/services/viajes.service';
import { AuthService } from '../../core/services/auth.service';

@Component({ standalone: false, selector: 'app-calendario', templateUrl: './calendario.component.html' })
export class CalendarioComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin],
    initialView: 'dayGridMonth',
    locale: esLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,listWeek',
    },
    buttonText: { today: 'Hoy', month: 'Mes', week: 'Semana', list: 'Agenda' },
    dayMaxEvents: true,
    events: [],
    eventColor: '#2563eb',
  };

  constructor(private viajesSvc: ViajesService, private auth: AuthService) {
    // On mobile: simplify toolbar so title has room to breathe
    if (typeof window !== 'undefined' && window.innerWidth <= 767) {
      this.calendarOptions = {
        ...this.calendarOptions,
        headerToolbar: {
          left:   'prev,next',
          center: 'title',
          right:  'today',
        },
        initialView: 'listMonth',
        buttonText: { today: 'Hoy', list: 'Lista', month: 'Mes', week: 'Sem' },
      };
    }
  }

  ngOnInit(): void {
    const userId = this.auth.currentUser?.id;
    const filtro = this.auth.hasRole('conductor') ? { conductor_id: userId } : { pasajero_id: userId };

    this.viajesSvc.listar(filtro).subscribe(res => {
      const eventos: EventInput[] = res.data
        .filter(v => v.fecha_solicitud)
        .map(v => ({
          id: String(v.id),
          title: `${v.ruta?.origen_descripcion?.split(',')[0]} → ${v.ruta?.destino_descripcion?.split(',')[0]}`,
          date: v.fecha_inicio || v.fecha_solicitud,
          backgroundColor: this.colorEstado(v.estado),
          borderColor: this.colorEstado(v.estado),
        }));
      this.calendarOptions = { ...this.calendarOptions, events: eventos };
    });
  }

  private colorEstado(estado: string): string {
    const map: Record<string, string> = {
      pendiente: '#f59e0b', aceptado: '#3b82f6',
      en_curso: '#8b5cf6', finalizado: '#10b981', cancelado: '#ef4444',
    };
    return map[estado] || '#6b7280';
  }
}
