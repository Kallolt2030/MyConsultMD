import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule, Location } from '@angular/common';
import {
  ActivatedRoute,
  Router,
  RouterModule
} from '@angular/router';

import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonButton,
  ToastController,
  IonSpinner,
  NavController
} from '@ionic/angular';

import { CitaDetalle } from '../../../core/models/cita';
import { Agenda } from '../../agenda/services/agenda';
import { AgendaRefreshService } from '../../../core/services/agenda-refresh';

@Component({
  selector: 'app-detalle-cita',
  templateUrl: './detalle-cita.page.html',
  styleUrls: ['./detalle-cita.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonSpinner,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonBadge,
    IonButton
  ]
})
export class DetalleCitaPage implements OnInit {

  cita: CitaDetalle | null = null;

  cargando = false;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private agenda: Agenda,
    private toastController: ToastController,
    private cdr: ChangeDetectorRef,
    private location: Location,
    private navCtrl: NavController,
    private refreshService: AgendaRefreshService
  ) {}

  async ngOnInit(): Promise<void> {
    console.log('🟢 [DetalleCita] ngOnInit iniciado');
    await this.cargarDetalle();
  }

  async cargarDetalle(): Promise<void> {
    console.log('🔵 [DetalleCita] Iniciando consulta');

    const idParam = this.route.snapshot.paramMap.get('id');
    console.log('🔎 [DetalleCita] ID recibido de la ruta:', idParam);

    const id = Number(idParam);

    if (
      idParam === null ||
      idParam.trim() === '' ||
      !Number.isSafeInteger(id) ||
      id <= 0
    ) {
      console.error('❌ [DetalleCita] Identificador inválido:', idParam);

      this.cita = null;
      this.error = true;
      this.cargando = false;
      this.cdr.detectChanges();

      await this.mostrarToast(
        'El identificador de la consulta no es válido.',
        'danger'
      );
      return;
    }

    this.cargando = true;
    this.error = false;
    this.cita = null;
    this.cdr.detectChanges();

    try {
      console.log('⏳ [DetalleCita] Consultando Agenda.obtenerCitaPorId()...', id);

      const resultado = await this.agenda.obtenerCitaPorId(id);
      console.log('📦 [DetalleCita] Resultado recibido de SQLite:', resultado);

      if (!resultado) {
        console.warn('⚠️ [DetalleCita] No existe una cita con ID:', id);
        this.error = true;
        await this.mostrarToast('No se encontró la consulta.', 'warning');
        return;
      }

      this.cita = resultado;

      console.log('✅ [DetalleCita] Cita cargada correctamente:', this.cita);
      console.log('👤 [DetalleCita] Paciente:', this.cita.paciente);
      console.log('📅 [DetalleCita] Fecha y hora:', this.cita.fecha, this.cita.hora);

    } catch (error) {
      console.error('❌ [DetalleCita] Error al consultar SQLite:', error);

      this.cita = null;
      this.error = true;

      await this.mostrarToast(
        'No se pudo cargar el detalle de la consulta.',
        'danger'
      );

    } finally {
      this.cargando = false;
      this.cdr.detectChanges();

      console.log('🏁 [DetalleCita] Carga finalizada');
      console.log('🔄 [DetalleCita] cargando:', this.cargando);
      console.log('🔄 [DetalleCita] error:', this.error);
      console.log('🔄 [DetalleCita] cita disponible:', this.cita !== null);
    }
  }

  editarCita(): void {
    if (!this.cita) {
      console.warn('⚠️ [DetalleCita] No hay cita para editar');
      return;
    }

    if (this.cita.estado?.toLowerCase() === 'cancelada') {
      console.warn('⚠️ [DetalleCita] No se puede editar una cita cancelada');
      return;
    }

    console.log('➡️ [DetalleCita] Navegando a editar cita:', this.cita.id);

    void this.router.navigate(['/editar-cita', this.cita.id]);
  }

  obtenerEstado(estado: string): string {
    const estados: Record<string, string> = {
      pendiente: 'Pendiente',
      realizada: 'Realizada',
      cancelada: 'Cancelada'
    };

    return estados[estado?.toLowerCase()] ?? estado ?? 'Sin estado';
  }

  private async mostrarToast(
    mensaje: string,
    color: 'success' | 'danger' | 'warning'
  ): Promise<void> {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2500,
      position: 'bottom',
      color
    });

    await toast.present();
  }

  // ✅ ÚNICA forma de volver. Usa navCtrl.back() → pop real → dispara
  //    ionViewWillEnter en la agenda. Además pide refresh por Subject.
  volverAgenda(): void {
    console.log('[DetalleCita] volverAgenda() ejecutado');

    // 1) Pedir refresco a la agenda (por si willEnter no dispara)
    this.refreshService.requestRefresh();

    // 2) Pop real del stack de Ionic
    this.router.navigate(['/tabs/agenda']);
    // Alternativa si navCtrl falla en tu entorno:
    // this.location.back();
  }
}