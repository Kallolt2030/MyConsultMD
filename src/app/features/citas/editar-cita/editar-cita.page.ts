import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

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
  ToastController,
  IonIcon
} from '@ionic/angular';

import { Agenda } from '../../agenda/services/agenda';
import { Paciente } from '../../../core/models/paciente';

@Component({
  selector: 'app-editar-cita',
  templateUrl: './editar-cita.page.html',
  styleUrls: ['./editar-cita.page.scss'],
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
    IonIcon,
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
export class EditarCitaPage implements OnInit {

  citaId: number | null = null;

  pacientes: Paciente[] = [];

  cargando = false;
  guardando = false;
  error = false;

  citaForm = {
    paciente_id: null as number | null,
    fecha: '',
    hora: '',
    tipo: 'Consulta',
    procedimiento: '',
    notas: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private agenda: Agenda,
    private toastController: ToastController,
    private cdr: ChangeDetectorRef
  ) {}

  // ==========================================
  // INICIALIZAR COMPONENTE
  // ==========================================

  async ngOnInit(): Promise<void> {
    console.log('🟢 [EditarCita] ngOnInit iniciado');

    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    console.log('🔎 [EditarCita] Parámetro ID:', idParam);

    if (!idParam || !Number.isInteger(id) || id <= 0) {
      console.error(
        '❌ [EditarCita] El ID recibido no es válido'
      );

      this.error = true;
      this.cdr.detectChanges();

      await this.mostrarToast(
        'El identificador de la consulta no es válido.',
        'danger'
      );

      return;
    }

    this.citaId = id;

    console.log(
      '✅ [EditarCita] ID de consulta válido:',
      this.citaId
    );

    await this.cargarDatos();
  }

  // ==========================================
  // CARGAR PACIENTES Y CONSULTA
  // ==========================================

  async cargarDatos(): Promise<void> {
    if (this.citaId === null) {
      console.error(
        '❌ [EditarCita] No hay un ID de consulta'
      );
      return;
    }

    console.log(
      '🔵 [EditarCita] Iniciando carga de datos'
    );

    this.cargando = true;
    this.error = false;
    this.cdr.detectChanges();

    try {
      // PASO 1: Cargar pacientes.
      console.log(
        '⏳ [EditarCita] Consultando pacientes en SQLite...'
      );

      const pacientes = await this.agenda.cargarPacientes();

      console.log(
        '📦 [EditarCita] Resultado de pacientes:',
        pacientes
      );

      this.pacientes = pacientes ?? [];

      console.log(
        '✅ [EditarCita] Total de pacientes:',
        this.pacientes.length
      );

      // PASO 2: Consultar la cita por su ID.
      console.log(
        '⏳ [EditarCita] Consultando cita con ID:',
        this.citaId
      );

      const cita = await this.agenda.obtenerCitaPorId(
        this.citaId
      );

      console.log(
        '📦 [EditarCita] Resultado de la consulta:',
        cita
      );

      if (!cita) {
        console.error(
          '❌ [EditarCita] No se encontró la cita en SQLite'
        );

        this.error = true;

        await this.mostrarToast(
          'No se encontró la consulta.',
          'danger'
        );

        return;
      }

      // PASO 3: Asignar los datos al formulario.
      console.log(
        '📝 [EditarCita] Preparando formulario'
      );

      this.citaForm = {
        paciente_id: cita.paciente_id,
        fecha: cita.fecha,
        hora: cita.hora,
        tipo: cita.tipo || 'Consulta',
        procedimiento: cita.procedimiento || '',
        notas: cita.notas || ''
      };

      console.log(
        '✅ [EditarCita] Formulario cargado:',
        this.citaForm
      );

      console.log(
        '🔢 [EditarCita] Paciente seleccionado:',
        this.citaForm.paciente_id
      );

    } catch (error) {
      console.error(
        '❌ [EditarCita] Error cargando datos:',
        error
      );

      this.error = true;

      await this.mostrarToast(
        'No se pudieron cargar los datos de la consulta.',
        'danger'
      );

    } finally {
      this.cargando = false;

      this.cdr.detectChanges();

      console.log(
        '🏁 [EditarCita] Carga finalizada'
      );

      console.log(
        '🔄 [EditarCita] Estado cargando:',
        this.cargando
      );

      console.log(
        '🔄 [EditarCita] Estado error:',
        this.error
      );
    }
  }

  // ==========================================
  // GUARDAR CAMBIOS
  // ==========================================

  async guardarCambios(): Promise<void> {
    console.log(
      '🟣 [EditarCita] Intentando guardar cambios:',
      this.citaForm
    );

    if (this.guardando) {
      console.warn(
        '⚠️ [EditarCita] Ya existe un guardado en proceso'
      );
      return;
    }

    if (
      this.citaId === null ||
      this.citaForm.paciente_id === null ||
      !this.citaForm.fecha ||
      !this.citaForm.hora
    ) {
      console.warn(
        '⚠️ [EditarCita] Faltan campos obligatorios'
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
      const datosActualizados = {
        paciente_id: this.citaForm.paciente_id,
        fecha: this.citaForm.fecha,
        hora: this.citaForm.hora,
        tipo: this.citaForm.tipo,
        procedimiento: this.citaForm.procedimiento.trim(),
        notas: this.citaForm.notas.trim()
      };

      console.log(
        '📤 [EditarCita] Enviando actualización:',
        {
          id: this.citaId,
          ...datosActualizados
        }
      );

      await this.agenda.actualizarCita(
        this.citaId,
        datosActualizados
      );

      console.log(
        '✅ [EditarCita] El servicio terminó de actualizar la cita'
      );

      await this.mostrarToast(
        'Consulta actualizada correctamente.',
        'success'
      );

      console.log(
        '➡️ [EditarCita] Navegando al detalle de la cita'
      );

      await this.router.navigate([
        '/detalle-cita',
        this.citaId
      ]);

    } catch (error) {
      console.error(
        '❌ [EditarCita] Error al actualizar:',
        error
      );

      await this.mostrarToast(
        'No se pudo actualizar la consulta.',
        'danger'
      );

    } finally {
      this.guardando = false;
      this.cdr.detectChanges();

      console.log(
        '🏁 [EditarCita] Guardado finalizado'
      );

      console.log(
        '🔄 [EditarCita] Estado guardando:',
        this.guardando
      );
    }
  }

  // ==========================================
  // CANCELAR
  // ==========================================

  cancelar(): void {
    console.log(
      '↩️ [EditarCita] Regresando a la agenda'
    );

    void this.router.navigate(['/tabs/agenda']);
  }

  // ==========================================
  // NOTIFICACIONES
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