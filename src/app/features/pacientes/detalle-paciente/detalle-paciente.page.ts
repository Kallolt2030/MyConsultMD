
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonBadge,
  IonSpinner,
  IonTitle,
  IonButtons,
  IonToolbar,
  IonHeader
} from '@ionic/angular';

import { addIcons } from 'ionicons';

import {
  personOutline,
  callOutline,
  chatbubbleOutline,
  calendarOutline,
  arrowBackOutline,
  createOutline,
  informationCircleOutline,
  linkOutline,
  checkmarkCircleOutline,
  cameraOutline,
  imagesOutline
} from 'ionicons/icons';

import { PacientesService } from '../services/pacientes';
import { FotoPacienteService } from '../services/foto-paciente';

export interface PacienteDetalle {
  id: number;
  nombre: string;
  telefono: string;
  telegram: string;
  telegram_chat_id?: string | null;
  telegram_vinculado?: number;
  fecha_registro?: string;
  foto?: string | null;
}

interface RespuestaCodigo {
  codigo: string;
  enlace: string;
  expiraEnSegundos: number;
}

interface RespuestaVinculacion {
  vinculada: boolean;
  pendiente?: boolean;
  pacienteId?: number;
  chatId?: string;
  mensaje?: string;
}

@Component({
  selector: 'app-detalle-paciente',
  standalone: true,
  templateUrl: './detalle-paciente.page.html',
  styleUrls: ['./detalle-paciente.page.scss'],
  imports: [
    CommonModule,
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonBadge,
    IonSpinner,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle
  ]
})
export class DetallePacientePage implements OnChanges {

  @Input() paciente: PacienteDetalle | null = null;

  @Output() regresar = new EventEmitter<void>();
  @Output() editar = new EventEmitter<PacienteDetalle>();

  private readonly API_URL =
    'https://telegram-back.vercel.app/api/telegram';

  codigoVinculacion = '';
  cargandoTelegram = false;
  mensajeTelegram = '';
  errorTelegram = false;
  enlaceTelegram = '';

  // ---------- Fotografías ----------

  fotoUrl: string | null = null;
  cargandoFoto = false;
  mensajeFoto = '';
  errorFoto = false;

  constructor(
    private pacientesService: PacientesService,
    private fotoPacienteService: FotoPacienteService,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({
      personOutline,
      callOutline,
      chatbubbleOutline,
      calendarOutline,
      arrowBackOutline,
      createOutline,
      informationCircleOutline,
      linkOutline,
      checkmarkCircleOutline,
      cameraOutline,
      imagesOutline
    });
  }

  // Detectar cuando cambia el paciente recibido
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['paciente']) {
      this.cargarFotoPaciente();
    }
  }

  // ---------- Cargar fotografía ----------

  async cargarFotoPaciente(): Promise<void> {
    this.fotoUrl = null;

    const ruta = this.paciente?.foto;

    if (!ruta) {
      this.cdr.detectChanges();
      return;
    }

    try {
      this.fotoUrl =
        await this.fotoPacienteService.obtenerUrlFoto(ruta);

    } catch (error) {
      console.error(
        'Error al cargar la fotografía del paciente:',
        error
      );

      this.fotoUrl = null;

    } finally {
      this.cdr.detectChanges();
    }
  }

  // ---------- Tomar fotografía o elegir de galería ----------

  async seleccionarFotografia(
    origen: 'camara' | 'galeria'
  ): Promise<void> {

    const pacienteId = this.paciente?.id;

    if (!pacienteId) {
      this.mostrarMensajeFoto(
        'No se encontró el paciente seleccionado.',
        true
      );
      return;
    }

    if (this.cargandoFoto) {
      return;
    }

    this.cargandoFoto = true;
    this.mensajeFoto = '';
    this.errorFoto = false;

    try {
      // Guardar la fotografía en el almacenamiento privado.
      const nuevaRuta =
        await this.fotoPacienteService.seleccionarFoto(
          pacienteId,
          origen
        );

      // Guardar la ruta en SQLite.
      await this.pacientesService.actualizarFotoPaciente(
        pacienteId,
        nuevaRuta
      );

      // Conservar la ruta anterior para eliminarla después.
      const rutaAnterior = this.paciente?.foto;

      // Actualizar los datos del paciente en pantalla.
      if (this.paciente) {
        this.paciente.foto = nuevaRuta;
      }

      // Mostrar la nueva fotografía.
      this.fotoUrl =
        await this.fotoPacienteService.obtenerUrlFoto(
          nuevaRuta
        );

      // Eliminar la fotografía anterior si existía.
      if (rutaAnterior && rutaAnterior !== nuevaRuta) {
        try {
          await this.fotoPacienteService.eliminarFoto(
            rutaAnterior
          );
        } catch (error) {
          console.warn(
            'No se pudo eliminar la fotografía anterior:',
            error
          );
        }
      }

      this.mostrarMensajeFoto(
        'Fotografía guardada correctamente.',
        false
      );

    } catch (error) {
      console.error(
        'Error al guardar la fotografía:',
        error
      );

      this.mostrarMensajeFoto(
        error instanceof Error
          ? error.message
          : 'No se pudo guardar la fotografía.',
        true
      );

    } finally {
      this.cargandoFoto = false;
      this.cdr.detectChanges();
    }
  }

  private mostrarMensajeFoto(
    mensaje: string,
    esError: boolean
  ): void {
    this.mensajeFoto = mensaje;
    this.errorFoto = esError;
    this.cdr.detectChanges();
  }

  // ---------- Navegación ----------

  regresarALista(): void {
    this.regresar.emit();
  }

  editarPaciente(): void {
    if (this.paciente) {
      this.editar.emit(this.paciente);
    }
  }

  // ---------- Estado de Telegram ----------

  get telegramVinculado(): boolean {
    return (
      this.paciente?.telegram_vinculado === 1 &&
      !!this.paciente?.telegram_chat_id
    );
  }

  // ---------- Generar enlace ----------

  async generarEnlaceTelegram(): Promise<void> {
    const pacienteId = this.paciente?.id;

    if (!pacienteId) {
      this.mostrarMensaje(
        'No se encontró el paciente seleccionado.',
        true
      );
      return;
    }

    if (this.cargandoTelegram) {
      return;
    }

    this.cargandoTelegram = true;
    this.mensajeTelegram = '';
    this.errorTelegram = false;

    this.codigoVinculacion = '';
    this.enlaceTelegram = '';

    try {
      console.log(
        'Generando enlace para paciente:',
        pacienteId
      );

      const respuesta = await fetch(
        `${this.API_URL}/generar-codigo`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            pacienteId
          }),
          signal: AbortSignal.timeout(15000)
        }
      );

      const datos =
        await respuesta.json() as RespuestaCodigo;

      console.log('Estado HTTP:', respuesta.status);
      console.log('Respuesta del backend:', datos);

      if (!respuesta.ok) {
        throw new Error(
          (datos as any).mensaje ||
          `Error HTTP ${respuesta.status}`
        );
      }

      if (
        typeof datos.codigo !== 'string' ||
        !datos.codigo.trim() ||
        typeof datos.enlace !== 'string' ||
        !datos.enlace.trim()
      ) {
        throw new Error(
          'El backend no devolvió un código y un enlace válidos.'
        );
      }

      this.codigoVinculacion = datos.codigo.trim();
      this.enlaceTelegram = datos.enlace.trim();

      this.mostrarMensaje(
        'Enlace generado correctamente. Pulsa "Abrir Telegram" y después inicia el bot.',
        false
      );

      console.log('Código guardado:', this.codigoVinculacion);
      console.log('Enlace guardado:', this.enlaceTelegram);

    } catch (error) {
      console.error(
        'Error al generar el enlace:',
        error
      );

      this.mostrarMensaje(
        error instanceof Error
          ? error.name === 'TimeoutError'
            ? 'El backend tardó demasiado en responder.'
            : error.message
          : 'No se pudo generar el enlace.',
        true
      );

    } finally {
      this.cargandoTelegram = false;
      this.cdr.detectChanges();

      console.log(
        'Carga de Telegram finalizada:',
        this.cargandoTelegram
      );

      console.log(
        'Enlace visible en el componente:',
        this.enlaceTelegram
      );
    }
  }

  // ---------- Verificar vinculación ----------

  async verificarVinculacionTelegram(): Promise<void> {
    const paciente = this.paciente;
    const codigo = this.codigoVinculacion;

    if (!paciente?.id || !codigo) {
      this.mostrarMensaje(
        'Primero genera un enlace de vinculación.',
        true
      );
      return;
    }

    if (this.cargandoTelegram) {
      return;
    }

    this.cargandoTelegram = true;
    this.mensajeTelegram = '';
    this.errorTelegram = false;

    try {
      const respuesta = await fetch(
        `${this.API_URL}/vinculacion/${encodeURIComponent(codigo)}`,
        {
          signal: AbortSignal.timeout(15000)
        }
      );

      const datos =
        await respuesta.json() as RespuestaVinculacion;

      console.log('Respuesta de verificación:', datos);

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje ||
          'El código expiró o no es válido.'
        );
      }

      if (!datos.vinculada || !datos.chatId) {
        this.mostrarMensaje(
          'La vinculación sigue pendiente. Abre el enlace y pulsa Iniciar en Telegram.',
          false
        );
        return;
      }

      if (datos.pacienteId !== paciente.id) {
        throw new Error(
          'El código corresponde a otro paciente.'
        );
      }

      await this.pacientesService.vincularTelegram(
        paciente.id,
        datos.chatId
      );

      paciente.telegram_chat_id = datos.chatId;
      paciente.telegram_vinculado = 1;

      try {
        const eliminar = await fetch(
          `${this.API_URL}/vinculacion/${encodeURIComponent(codigo)}`,
          {
            method: 'DELETE',
            signal: AbortSignal.timeout(10000)
          }
        );

        if (!eliminar.ok) {
          console.warn(
            'El chat se guardó, pero no se pudo consumir el código temporal.'
          );
        }
      } catch (error) {
        console.warn(
          'El chat se guardó, pero falló la eliminación del código temporal.',
          error
        );
      }

      this.codigoVinculacion = '';
      this.enlaceTelegram = '';

      this.mostrarMensaje(
        '¡Telegram quedó vinculado al paciente correctamente!',
        false
      );

    } catch (error) {
      console.error(
        'Error verificando vinculación:',
        error
      );

      this.mostrarMensaje(
        error instanceof Error
          ? error.name === 'TimeoutError'
            ? 'El backend tardó demasiado en responder.'
            : error.message
          : 'Ocurrió un error al vincular Telegram.',
        true
      );

    } finally {
      this.cargandoTelegram = false;
      this.cdr.detectChanges();
    }
  }

  // ---------- Abrir Telegram ----------

  abrirTelegram(): void {
    const enlace = this.enlaceTelegram.trim();

    if (!enlace) {
      this.mostrarMensaje(
        'Primero genera un enlace de vinculación.',
        true
      );
      return;
    }

    if (!enlace.startsWith('https://t.me/')) {
      this.mostrarMensaje(
        'El enlace de Telegram no es válido.',
        true
      );
      return;
    }

    console.log(
      'Abriendo enlace de Telegram:',
      enlace
    );

    window.open(
      enlace,
      '_blank',
      'noopener,noreferrer'
    );
  }

  // ---------- Mensajes de Telegram ----------

  private mostrarMensaje(
    mensaje: string,
    esError: boolean
  ): void {
    this.mensajeTelegram = mensaje;
    this.errorTelegram = esError;
    this.cdr.detectChanges();
  }
}
