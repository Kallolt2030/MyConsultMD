
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectorRef
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
  checkmarkCircleOutline
} from 'ionicons/icons';

import { PacientesService } from '../services/pacientes';

export interface PacienteDetalle {
  id: number;
  nombre: string;
  telefono: string;
  telegram: string;
  telegram_chat_id?: string | null;
  telegram_vinculado?: number;
  fecha_registro?: string;
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
export class DetallePacientePage {
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

  constructor(
    private pacientesService: PacientesService,
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
      checkmarkCircleOutline
    });
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

    // Limpiar el enlace anterior al generar uno nuevo.
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

      const datos = await respuesta.json() as RespuestaCodigo;

      console.log(
        'Estado HTTP:',
        respuesta.status
      );

      console.log(
        'Respuesta del backend:',
        datos
      );

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

      // Actualizar el estado del componente.
      this.codigoVinculacion = datos.codigo.trim();
      this.enlaceTelegram = datos.enlace.trim();

      this.mostrarMensaje(
        'Enlace generado correctamente. Pulsa "Abrir Telegram" y después inicia el bot.',
        false
      );

      console.log(
        'Código guardado:',
        this.codigoVinculacion
      );

      console.log(
        'Enlace guardado:',
        this.enlaceTelegram
      );

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

      // Actualizar la vista de Angular.
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

      console.log(
        'Respuesta de verificación:',
        datos
      );

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

      // Comprobar que el código pertenece al paciente actual.
      if (datos.pacienteId !== paciente.id) {
        throw new Error(
          'El código corresponde a otro paciente.'
        );
      }

      // Guardar el chat en SQLite.
      await this.pacientesService.vincularTelegram(
        paciente.id,
        datos.chatId
      );

      // Actualizar los datos mostrados.
      paciente.telegram_chat_id = datos.chatId;
      paciente.telegram_vinculado = 1;

      // Consumir el código temporal.
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

  // ---------- Mensajes ----------

  private mostrarMensaje(
    mensaje: string,
    esError: boolean
  ): void {
    this.mensajeTelegram = mensaje;
    this.errorTelegram = esError;
    this.cdr.detectChanges();
  }
}
