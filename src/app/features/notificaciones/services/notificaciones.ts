import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { DatabaseService } from '../../../core/services/database';

const NOTIF_ID_RESUMEN = 1001;

@Injectable({ providedIn: 'root' })
export class NotificacionDiariaService {
  constructor(private db: DatabaseService) {}

  /**
   * Punto de entrada desde AppComponent.
   * Verifica permisos y programa el resumen de mañana.
   */
  async inicializarNotificaciones(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log('[Notificaciones] Web detectado: se omiten notificaciones locales');
      return;
    }

    // 1. Permisos
    let perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') {
      perm = await LocalNotifications.requestPermissions();
    }
    if (perm.display !== 'granted') {
      console.warn('[Notificaciones] Permiso denegado por el usuario');
      return;
    }

    // 2. Programar (o reprogramar) resumen
    await this.programarResumenManana();
  }

  /**
   * Programa la notificación local con el resumen de citas de mañana a las 06:00.
   * Idempotente: cancelar la pendiente con el mismo ID antes de reagendar.
   */
  async programarResumenManana(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    // --- 1. Cancelar la notificación anterior con el mismo ID (si existe) ---
    const pendientes = await LocalNotifications.getPending();
    const previas = pendientes.notifications.filter(n => n.id === NOTIF_ID_RESUMEN);
    if (previas.length > 0) {
      await LocalNotifications.cancel({ notifications: previas });
    }

    // --- 2. Calcular fecha de mañana en LOCAL (no UTC) ---
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const fecha = `${manana.getFullYear()}-${pad(manana.getMonth() + 1)}-${pad(manana.getDate())}`;

    // --- 3. Consultar citas ---
    const citas = await this.db.query<any>(`
      SELECT c.hora, p.nombre AS paciente
      FROM citas c
      JOIN pacientes p ON p.id = c.paciente_id
      WHERE c.fecha = ?
      ORDER BY c.hora
    `, [fecha]);

    if (citas.length === 0) {
      console.log(`[Notificaciones] Sin citas para ${fecha}, no se programa nada`);
      return;
    }

    // --- 4. Armar cuerpo ---
    const cuerpo = citas.slice(0, 5)
      .map(c => `• ${c.hora} - ${c.paciente}`)
      .join('\n') + (citas.length > 5 ? `\n...y ${citas.length - 5} más` : '');

    // --- 5. Trigger a las 06:00 locales de mañana ---
    const trigger = new Date();
    trigger.setDate(trigger.getDate() + 1);
    trigger.setHours(6, 0, 0, 0);

    // --- 6. Programar ---
    await LocalNotifications.schedule({
      notifications: [{
        id: NOTIF_ID_RESUMEN,
        title: `Tienes ${citas.length} cita(s) mañana`,
        body: cuerpo,
        schedule: { at: trigger, allowWhileIdle: true },
        smallIcon: 'ic_stat_icon_config_sample', // opcional: ícono Android
      }]
    });

    console.log(`[Notificaciones] Resumen programado para ${trigger.toLocaleString()}`);
  }
}