
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonButton,
  IonInput,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonCheckbox,
  IonSpinner,
  ToastController
} from '@ionic/angular';

import { Configuracion } from './services/configuracion';
import { Consultorio } from '../../core/models/consultorio';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.page.html',
  styleUrls: ['./configuracion.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonIcon,
    IonButton,
    IonInput,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonCheckbox,
    IonSpinner
  ]
})
export class ConfiguracionPage implements OnInit {

  cargando = false;
  guardando = false;
  error = '';

  diasDisponibles: string[] = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo'
  ];

  diasSeleccionados: string[] = [];

  consultorio: Consultorio = {
    nombre: '',
    profesional: '',
    especialidad: '',
    tipo_establecimiento: '',
    hora_inicio: '09:00',
    hora_cierre: '18:00',
    dias_laborales: ''
  };

  constructor(
    private configuracionService: Configuracion,
    private toastController: ToastController,
    private cdr: ChangeDetectorRef
  ) {
    console.log('[Configuracion] Componente creado');
  }

  ngOnInit() {
    console.log('[Configuracion] ngOnInit ejecutado');
    this.cargarDatos();
  }

  ionViewWillEnter() {
    console.log('[Configuracion] Entrando a la pantalla');

    // Evita iniciar otra carga si ya hay una en proceso.
    this.cargarDatos();
  }

  async cargarDatos() {

    if (this.cargando) {
      console.log('[Configuracion] Ya existe una carga en proceso');
      return;
    }

    console.log('[Configuracion] Iniciando carga');

    this.cargando = true;
    this.error = '';

    try {

      const datos =
        await this.configuracionService.obtenerConsultorio();

      console.log('[Configuracion] Datos recibidos:', datos);

      if (datos) {

        this.consultorio = {
          ...datos,
          especialidad: datos.especialidad || '',
          tipo_establecimiento: datos.tipo_establecimiento || '',
          hora_inicio: datos.hora_inicio || '09:00',
          hora_cierre: datos.hora_cierre || '18:00'
        };

        // Recuperar los días laborales almacenados.
        const diasGuardados = datos.dias_laborales || '';

        try {

          const resultado = JSON.parse(diasGuardados);

          this.diasSeleccionados = Array.isArray(resultado)
            ? resultado
            : [];

        } catch {

          this.diasSeleccionados = diasGuardados
            .split(',')
            .map(dia => dia.trim())
            .filter(dia => dia.length > 0);

        }

        console.log(
          '[Configuracion] Días seleccionados:',
          this.diasSeleccionados
        );

      } else {

        console.log('[Configuracion] No existe consultorio registrado');

        this.diasSeleccionados = [];

      }

    } catch (error) {

      console.error(
        '[Configuracion] Error al cargar:',
        error
      );

      this.error = 'No se pudieron cargar los datos del consultorio.';

    } finally {

      this.cargando = false;

      // Fuerza la actualización de la vista de Angular.
      this.cdr.detectChanges();

      console.log('[Configuracion] Carga finalizada');
      console.log('[Configuracion] Estado de cargando:', this.cargando);

    }
  }

  cambiarDia(dia: string, seleccionado: boolean) {

    if (seleccionado) {

      if (!this.diasSeleccionados.includes(dia)) {
        this.diasSeleccionados = [
          ...this.diasSeleccionados,
          dia
        ];
      }

    } else {

      this.diasSeleccionados =
        this.diasSeleccionados.filter(
          item => item !== dia
        );

    }

    console.log(
      '[Configuracion] Días actuales:',
      this.diasSeleccionados
    );
  }

  async guardarCambios() {

    if (this.guardando) {
      return;
    }

    console.log('[Configuracion] Iniciando guardado');

    if (
      !this.consultorio.nombre.trim() ||
      !this.consultorio.profesional.trim()
    ) {

      await this.mostrarMensaje(
        'El nombre del consultorio y del profesional son obligatorios.',
        'warning'
      );

      return;
    }

    if (
      !this.consultorio.hora_inicio ||
      !this.consultorio.hora_cierre
    ) {

      await this.mostrarMensaje(
        'Selecciona el horario de atención.',
        'warning'
      );

      return;
    }

    if (
      this.consultorio.hora_inicio >=
      this.consultorio.hora_cierre
    ) {

      await this.mostrarMensaje(
        'La hora de cierre debe ser posterior a la apertura.',
        'warning'
      );

      return;
    }

    if (this.diasSeleccionados.length === 0) {

      await this.mostrarMensaje(
        'Selecciona al menos un día laboral.',
        'warning'
      );

      return;
    }

    this.guardando = true;

    try {

      this.consultorio.dias_laborales = JSON.stringify(
        this.diasDisponibles.filter(
          dia => this.diasSeleccionados.includes(dia)
        )
      );

      console.log(
        '[Configuracion] Datos que se guardarán:',
        this.consultorio
      );

      await this.configuracionService.guardarConsultorio(
        this.consultorio
      );

      console.log('[Configuracion] Guardado exitoso');

      await this.mostrarMensaje(
        'Los datos del consultorio se actualizaron correctamente.',
        'success'
      );

    } catch (error) {

      console.error(
        '[Configuracion] Error al guardar:',
        error
      );

      await this.mostrarMensaje(
        'No se pudieron guardar los cambios.',
        'danger'
      );

    } finally {

      this.guardando = false;
      this.cdr.detectChanges();

    }
  }

  async mostrarMensaje(
    mensaje: string,
    color: string
  ) {

    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2500,
      position: 'bottom',
      color: color
    });

    await toast.present();
  }

}
