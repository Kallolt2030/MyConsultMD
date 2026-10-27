
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonIcon,
  IonBadge,
  IonSelect,
  IonSelectOption,
  IonModal,
  ToastController,
  AlertController,
  IonButton
} from '@ionic/angular';

import { CitaDetalle } from '../../core/models/cita';
import { Agenda } from './services/agenda';
import { Paciente } from '../../core/models/paciente';

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
    IonBadge,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonModal
  ]
})
export class AgendaPage implements OnInit {

  // Listado de citas
  fechaSeleccionada = new Date().toISOString().split('T')[0];
  citas: CitaDetalle[] = [];
  pacientes: Paciente[] = [];

  cargando = false;
  errorCargandoCitas = false;

  // Formulario
  mostrarFormulario = false;
  citaEnEdicion: number | null = null;
  guardando = false;

  citaForm = {
    paciente_id: null as number | null,
    hora: '',
    tipo: 'Consulta',
    procedimiento: '',
    notas: ''
  };

  private initialized = false;

  constructor(
    private agenda: Agenda,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  // Inicialización
  async ngOnInit(): Promise<void> {
    await this.cargarPacientes();
    await this.cargarCitas();

    this.initialized = true;
  }

  // Actualizar al regresar a la página
  async ionViewWillEnter(): Promise<void> {
    if (this.initialized) {
      await this.cargarPacientes();
      await this.cargarCitas();
    }
  }

  // Cargar citas de la fecha seleccionada
  async cargarCitas(): Promise<void> {
    this.cargando = true;
    this.errorCargandoCitas = false;

    try {
      this.citas = await this.agenda.cargarCitas(
        this.fechaSeleccionada
      );
    } catch (error) {
      console.error(
        '[AgendaPage] Error cargando citas:',
        error
      );

      this.errorCargandoCitas = true;

      await this.toast(
        'No se pudieron cargar las citas',
        'danger'
      );
    } finally {
      this.cargando = false;
    }
  }

  // Cambiar la fecha del listado
  async onFechaChange(): Promise<void> {
    await this.cargarCitas();
  }


async cargarPacientes(): Promise<void> {
  try {
    this.pacientes = await this.agenda.cargarPacientes();
  } catch (error) {
    console.error(
      '[AgendaPage] Error cargando pacientes:',
      error
    );

    await this.toast(
      'No se pudieron cargar los pacientes',
      'danger'
    );
  }
}


  // Abrir formulario para una nueva cita
  abrirNuevaCita(): void {
    this.citaEnEdicion = null;

    this.citaForm = {
      paciente_id: null,
      hora: '',
      tipo: 'Consulta',
      procedimiento: '',
      notas: ''
    };

    this.mostrarFormulario = true;
  }

  // Abrir formulario para editar una cita
  abrirEdicion(cita: CitaDetalle): void {
    this.citaEnEdicion = cita.id;

    this.citaForm = {
      paciente_id: cita.paciente_id,
      hora: cita.hora,
      tipo: cita.tipo || 'Consulta',
      procedimiento: cita.procedimiento || '',
      notas: cita.notas || ''
    };

    this.mostrarFormulario = true;
  }

  // Cerrar formulario
  cerrarFormulario(): void {
    if (this.guardando) {
      return;
    }

    this.mostrarFormulario = false;
  }

  // Crear o actualizar cita
  async guardarCita(): Promise<void> {
    if (
      this.citaForm.paciente_id === null ||
      !this.citaForm.hora ||
      this.guardando
    ) {
      return;
    }

    this.guardando = true;

    try {
      const datos = {
        paciente_id: this.citaForm.paciente_id,
        fecha: this.fechaSeleccionada,
        hora: this.citaForm.hora,
        tipo: this.citaForm.tipo,
        procedimiento: this.citaForm.procedimiento,
        notas: this.citaForm.notas
      };

      if (this.citaEnEdicion !== null) {
        await this.agenda.actualizarCita(
          this.citaEnEdicion,
          datos
        );
      } else {
        await this.agenda.crearCita(datos);
      }

      const esEdicion = this.citaEnEdicion !== null;

      this.mostrarFormulario = false;
      this.citaEnEdicion = null;

      await this.cargarCitas();

      await this.toast(
        esEdicion
          ? 'Cita actualizada correctamente'
          : 'Cita creada correctamente',
        'success'
      );
    } catch (error) {
      console.error(
        '[AgendaPage] Error guardando cita:',
        error
      );

      await this.toast(
        'No se pudo guardar la cita',
        'danger'
      );
    } finally {
      this.guardando = false;
    }
  }

  

  // Cambiar estado de una cita
  async cambiarEstado(
    cita: CitaDetalle,
    estado: 'realizada' | 'cancelada'
  ): Promise<void> {
    try {
      await this.agenda.cambiarEstadoCita(
        cita.id,
        estado
      );

      await this.cargarCitas();

      await this.toast(
        estado === 'realizada'
          ? 'Cita marcada como realizada'
          : 'Cita cancelada correctamente',
        'success'
      );
    } catch (error) {
      console.error(
        '[AgendaPage] Error cambiando estado:',
        error
      );

      await this.toast(
        'No se pudo cambiar el estado de la cita',
        'danger'
      );
    }
  }

  // Confirmar eliminación
  async confirmarEliminar(
    cita: CitaDetalle
  ): Promise<void> {
    const alerta = await this.alertController.create({
      header: 'Eliminar cita',
      message: `¿Deseas eliminar la cita de ${cita.paciente}? Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            void this.eliminarCita(cita.id);
          }
        }
      ]
    });

    await alerta.present();
  }

  // Eliminar cita
  private async eliminarCita(
    id: number
  ): Promise<void> {
    try {
      await this.agenda.eliminarCita(id);

      await this.cargarCitas();

      await this.toast(
        'Cita eliminada correctamente',
        'success'
      );
    } catch (error) {
      console.error(
        '[AgendaPage] Error eliminando cita:',
        error
      );

      await this.toast(
        'No se pudo eliminar la cita',
        'danger'
      );
    }
  }

  // Mostrar notificaciones
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
