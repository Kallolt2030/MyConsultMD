import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonButton,
  IonSpinner,
  ToastController
} from '@ionic/angular';

import { Agenda } from '../../agenda/services/agenda';
import { Paciente } from '../../../core/models/paciente';
import { PacientesService } from '../../pacientes/services/pacientes';

@Component({
  selector: 'app-nueva-cita',
  templateUrl: './nueva-cita.page.html',
  styleUrls: ['./nueva-cita.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonButton,
    IonSpinner
  ]
})
export class NuevaCitaPage implements OnInit {

  pacientes: Paciente[] = [];

  cargando = false;
  guardando = false;

  citaForm = {
    paciente_id: null as number | null,
    fecha: new Date().toISOString().split('T')[0],
    hora: '',
    tipo: 'Consulta',
    procedimiento: '',
    notas: ''
  };

  constructor(
    private agenda: Agenda,
    private router: Router,
    private toastController: ToastController,
    private pacientesService: PacientesService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    console.log('🟢 [NuevaCita] Inicializando componente');

    await this.cargarPacientes();
  }

  // ==========================================
  // CARGAR PACIENTES DESDE SQLITE
  // ==========================================

  async cargarPacientes(): Promise<void> {
    console.log('🔵 [NuevaCita] Iniciando carga de pacientes');

    this.cargando = true;
    this.cdr.detectChanges();

    try {
      console.log('⏳ [NuevaCita] Consultando PacientesService');

      const resultado =
        await this.pacientesService.cargarPacientes();

      console.log(
        '📦 [NuevaCita] Resultado de SQLite:',
        resultado
      );

      console.log(
        '🔢 [NuevaCita] Registros encontrados:',
        resultado?.length ?? 0
      );

      this.pacientes = (resultado ?? [])
        .filter(paciente => paciente.id !== undefined)
        .map(paciente => ({
          id: paciente.id!,
          nombre: paciente.nombre,
          telefono: paciente.telefono,
          telegram: paciente.telegram
        }));

      console.log(
        '✅ [NuevaCita] Pacientes disponibles:',
        this.pacientes
      );

      if (this.pacientes.length === 0) {
        console.warn(
          '⚠️ [NuevaCita] No hay pacientes registrados'
        );
      }

    } catch (error) {
      console.error(
        '❌ [NuevaCita] Error al consultar SQLite:',
        error
      );

      this.pacientes = [];

      await this.mostrarToast(
        'No se pudieron cargar los pacientes.',
        'danger'
      );

    } finally {
      this.cargando = false;

      // Actualizar la vista después de finalizar la operación.
      this.cdr.detectChanges();

      console.log(
        '🏁 [NuevaCita] Carga finalizada. cargando =',
        this.cargando
      );
    }
  }

  // ==========================================
  // REGISTRAR NUEVA CITA
  // ==========================================

  async guardarCita(): Promise<void> {
    console.log(
      '🟣 [NuevaCita] Intentando guardar cita:',
      this.citaForm
    );

    if (this.guardando) {
      console.warn(
        '⚠️ [NuevaCita] Ya existe una operación de guardado'
      );
      return;
    }

    if (
      this.citaForm.paciente_id === null ||
      !this.citaForm.fecha ||
      !this.citaForm.hora
    ) {
      console.warn(
        '⚠️ [NuevaCita] Faltan campos obligatorios'
      );

      await this.mostrarToast(
        'Selecciona un paciente, una fecha y una hora.',
        'warning'
      );

      return;
    }

    this.guardando = true;
    this.cdr.detectChanges();

    try {
      const datosCita = {
        paciente_id: this.citaForm.paciente_id,
        fecha: this.citaForm.fecha,
        hora: this.citaForm.hora,
        tipo: this.citaForm.tipo,
        procedimiento: this.citaForm.procedimiento.trim(),
        notas: this.citaForm.notas.trim()
      };

      console.log(
        '📤 [NuevaCita] Enviando datos al servicio Agenda:',
        datosCita
      );

      await this.agenda.crearCita(datosCita);

      console.log(
        '✅ [NuevaCita] El servicio terminó de registrar la cita'
      );

      await this.mostrarToast(
        'Consulta registrada correctamente.',
        'success'
      );

      console.log(
        '➡️ [NuevaCita] Regresando a la agenda'
      );

      await this.router.navigate(['/tabs/agenda']);

    } catch (error) {
      console.error(
        '❌ [NuevaCita] Error al registrar la cita:',
        error
      );

      await this.mostrarToast(
        'No se pudo registrar la consulta.',
        'danger'
      );

    } finally {
      this.guardando = false;
      this.cdr.detectChanges();

      console.log(
        '🏁 [NuevaCita] Guardado finalizado. guardando =',
        this.guardando
      );
    }
  }

  // ==========================================
  // REGRESAR A LA AGENDA
  // ==========================================

  iraAgenda(): void {
    console.log(
      '↩️ [NuevaCita] Regresando a la agenda'
    );

    void this.router.navigate(['/tabs/agenda']);
  }

  // ==========================================
  // MOSTRAR NOTIFICACIONES
  // ==========================================

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
}