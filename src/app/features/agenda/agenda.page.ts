import {
  Component,
  signal,
  ChangeDetectorRef,
  OnInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonIcon,
  IonBadge,
  IonButton,
  ToastController,
  AlertController,
  IonSpinner,
  IonLabel,
  IonItem
} from '@ionic/angular';

import { CitaDetalle } from '../../core/models/cita';
import { Agenda } from './services/agenda';
import { AgendaRefreshService } from '../../core/services/agenda-refresh';


@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.page.html',
  styleUrls: ['./agenda.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonIcon,
    IonSpinner,
    IonLabel,
    IonItem,
    IonBadge,
    IonButton
  ]
})
export class AgendaPage implements OnInit, OnDestroy {

  fechaSeleccionada = new Date().toLocaleDateString('en-CA');

  citas = signal<CitaDetalle[]>([]);
  cargando = signal(false);
  errorCargandoCitas = signal(false);

  private cargaEnCurso = false;
  private refrescoPendiente = false;

  private refreshSub?: Subscription;
  private routerSub?: Subscription;

  constructor(
    private agenda: Agenda,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private cdr: ChangeDetectorRef,
    private refreshService: AgendaRefreshService
  ) {}

  ngOnInit(): void {
    // Capa 2: Subject (el detalle lo emite al volver)
    this.refreshSub = this.refreshService.refresh$.subscribe(() => {
      console.log('[AgendaPage] Refresh por Subject');
      void this.cargarCitas();
    });

    // Capa 3: Router.events — cubre TODA navegación a /tabs/agenda
    // aunque ionViewWillEnter no dispare (caché del outlet).
    this.routerSub = this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        filter((e: NavigationEnd) =>
          e.urlAfterRedirects.includes('/tabs/agenda')
        )
      )
      .subscribe(e => {
        console.log(
          '[AgendaPage] NavigationEnd → agenda:',
          (e as NavigationEnd).urlAfterRedirects
        );
        void this.cargarCitas();
      });
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
    this.routerSub?.unsubscribe();
  }

  // Capa 1: se dispara al entrar al tab o con pop real
  async ionViewWillEnter(): Promise<void> {
    console.log('[AgendaPage] ionViewWillEnter');
    await this.cargarCitas();
  }

  async cargarCitas(): Promise<void> {
    if (this.cargaEnCurso) {
      this.refrescoPendiente = true;
      return;
    }

    this.cargaEnCurso = true;

    this.cargando.set(true);
    this.errorCargandoCitas.set(false);
    this.cdr.detectChanges();

    try {
      do {
        this.refrescoPendiente = false;

        const fecha = this.fechaSeleccionada;
        console.log('[AgendaPage] Consultando fecha:', fecha);

        const resultado = await this.agenda.cargarCitas(fecha);

        this.citas.set([...(resultado ?? [])]);

        console.log(
          '[AgendaPage] Citas actualizadas:',
          this.citas().length,
          this.citas()
        );

        this.cdr.detectChanges();

      } while (this.refrescoPendiente);

    } catch (error) {
      console.error('[AgendaPage] Error cargando citas:', error);

      this.errorCargandoCitas.set(true);
      this.cdr.detectChanges();

      await this.toast('No se pudieron cargar las citas', 'danger');

    } finally {
      this.cargando.set(false);
      this.cargaEnCurso = false;
      this.cdr.detectChanges();

      console.log('[AgendaPage] Carga finalizada');

      if (this.refrescoPendiente) {
        this.refrescoPendiente = false;
        void this.cargarCitas();
      }
    }
  }

  async onFechaChange(): Promise<void> {
    await this.cargarCitas();
  }

  abrirNuevaCita(): void {
    void this.router.navigate(['/nueva-cita'])
      .catch(e => console.error('[AgendaPage] Error nueva cita:', e));
  }

  verDetalle(cita: CitaDetalle): void {
    void this.router.navigate(['/detalle-cita', cita.id])
      .catch(e => console.error('[AgendaPage] Error detalle:', e));
  }

  abrirEdicion(cita: CitaDetalle): void {
    void this.router.navigate(['/editar-cita', cita.id])
      .catch(e => console.error('[AgendaPage] Error edición:', e));
  }

  contarEstado(estado: string): number {
    return this.citas().filter(c => c.estado === estado).length;
  }

  colorEstado(estado: string): string {
    switch (estado) {
      case 'realizada':  return 'success';
      case 'cancelada':  return 'danger';
      case 'pendiente':
      default:           return 'warning';
    }
  }

  textoEstado(estado: string): string {
    switch (estado) {
      case 'realizada':  return 'Realizada';
      case 'cancelada':  return 'Cancelada';
      case 'pendiente':
      default:           return 'Pendiente';
    }
  }

  async cambiarEstado(
    cita: CitaDetalle,
    estado: 'realizada' | 'cancelada'
  ): Promise<void> {
    try {
      await this.agenda.cambiarEstadoCita(cita.id, estado);
      await this.cargarCitas();
      await this.toast(
        estado === 'realizada'
          ? 'Cita marcada como realizada'
          : 'Cita cancelada correctamente',
        'success'
      );
    } catch (error) {
      console.error('[AgendaPage] Error cambiando estado:', error);
      await this.toast('No se pudo cambiar el estado de la cita', 'danger');
    }
  }

  async confirmarCancelar(cita: CitaDetalle): Promise<void> {
    const alerta = await this.alertController.create({
      header: 'Cancelar cita',
      message: `¿Deseas cancelar la cita de ${cita.paciente}? Se conservará en el historial.`,
      buttons: [
        { text: 'Volver', role: 'cancel' },
        {
          text: 'Cancelar cita',
          role: 'destructive',
          handler: () => { void this.cambiarEstado(cita, 'cancelada'); }
        }
      ]
    });
    await alerta.present();
  }

  async confirmarEliminar(cita: CitaDetalle): Promise<void> {
    const alerta = await this.alertController.create({
      header: 'Eliminar cita',
      message: `¿Deseas eliminar la cita de ${cita.paciente}? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Volver', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => { void this.eliminarCita(cita.id); }
        }
      ]
    });
    await alerta.present();
  }

  private async eliminarCita(id: number): Promise<void> {
    try {
      await this.agenda.eliminarCita(id);
      await this.cargarCitas();
      await this.toast('Cita eliminada correctamente', 'success');
    } catch (error) {
      console.error('[AgendaPage] Error eliminando cita:', error);
      await this.toast('No se pudo eliminar la cita', 'danger');
    }
  }

  private async toast(
    mensaje: string,
    color: 'success' | 'danger' | 'warning' = 'success'
  ): Promise<void> {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2500,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}