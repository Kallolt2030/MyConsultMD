import { Injectable } from '@angular/core';

import { DatabaseService } from '../../../core/services/database';
import { CitaResumen } from '../../../core/models/cita';
import { Consultorio } from '../../../core/models/consultorio';
import { ResumenDashboard } from '../../../core/models/resumenDashboard';
import { EstadisticasApi } from './estadisticas-api';

export interface DatosInicio {
  nombreConsultorio: string;
  nombreProfesional: string;
  totalCitas: number;
  citasPendientes: number;
  totalPacientes: number;
  proximasCitas: CitaResumen[];
  origenDatos: 'api' | 'local';   // ⬅️ nuevo (útil para mostrar "En línea"/"Local")
}

@Injectable({ providedIn: 'root' })
export class Inicio {

  constructor(
    private databaseService: DatabaseService,
    private estadisticasApi: EstadisticasApi   // ⬅️ nuevo
  ) {}

  async obtenerConsultorio(): Promise<Consultorio | null> {
    const consultorios = await this.databaseService.query<Consultorio>(
      `SELECT * FROM consultorio ORDER BY id DESC LIMIT 1`
    );
    return consultorios.length > 0 ? consultorios[0] : null;
  }

  async obtenerProximasCitas(fecha: string = this.fechaHoy()): Promise<CitaResumen[]> {
  const filas = await this.databaseService.query<CitaResumen>(
    `SELECT
       c.id AS id,
       c.hora AS hora,
       c.tipo AS tipo,
       c.estado AS estado,
       p.nombre AS paciente
     FROM citas c
     INNER JOIN pacientes p ON p.id = c.paciente_id
     WHERE c.fecha = ?
     ORDER BY c.hora ASC`,
    [fecha]
  );

  return filas.map(f => ({
    ...f,
    estado: this.normalizarEstado(f.estado)
  }));
}

private normalizarEstado(e: string): string {
  const v = (e || '').toLowerCase();
  if (v === 'pendiente') return 'Pendiente';
  if (v === 'realizada') return 'Realizada';
  if (v === 'cancelada') return 'Cancelada';
  return e;
}

  async obtenerResumenDashboard(fecha: string = this.fechaHoy()): Promise<ResumenDashboard> {
    const [citasRes, pacientesRes] = await Promise.all([
      this.databaseService.query<{ total: number; pendientes: number | null }>(
        `SELECT
           COUNT(*) AS total,
           SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) AS pendientes
         FROM citas WHERE fecha = ?`,
        [fecha]
      ),
      this.databaseService.query<{ total: number }>(
        `SELECT COUNT(*) AS total FROM pacientes`
      )
    ]);

    return {
      totalCitas: citasRes[0]?.total ?? 0,
      citasPendientes: citasRes[0]?.pendientes ?? 0,
      totalPacientes: pacientesRes[0]?.total ?? 0
    };
  }

  /**
   * Datos para la pantalla de inicio.
   * Intenta la API (Vercel + Firestore); si falla, cae a SQLite local.
   */
  async cargarDatos(fecha: string = this.fechaHoy()): Promise<DatosInicio> {
    const consultorio = await this.obtenerConsultorio();

    // 1) Intentar API
    try {
      const r = await this.estadisticasApi.obtenerResumen();
      return {
        nombreConsultorio: consultorio?.nombre ?? 'Mi consultorio',
        nombreProfesional: consultorio?.profesional ?? 'Doctor(a)',
        totalCitas: r.totalCitas,
        citasPendientes: r.citasPendientes,
        totalPacientes: r.totalPacientes,
        proximasCitas: r.proximasCitas,
        origenDatos: 'api'
      };
    } catch (e) {
      console.warn('[Inicio] API no disponible, usando SQLite local:', e);
    }

    // 2) Fallback a SQLite local
    const [resumen, proximasCitas] = await Promise.all([
      this.obtenerResumenDashboard(fecha),
      this.obtenerProximasCitas(fecha)
    ]);

    return {
      nombreConsultorio: consultorio?.nombre ?? 'Mi consultorio',
      nombreProfesional: consultorio?.profesional ?? 'Doctor(a)',
      totalCitas: resumen.totalCitas,
      citasPendientes: resumen.citasPendientes,
      totalPacientes: resumen.totalPacientes,
      proximasCitas,
      origenDatos: 'local'
    };
  }

  /**
 * Sube TODO lo local a Firestore. Úsalo al abrir la app o al presionar un botón.
 */
async sincronizarTodo(): Promise<{ citas: number; pacientes: number } | null> {
  try {
    const pacientes = await this.databaseService.query<any>(
      `SELECT id, nombre, telefono, telegram_vinculado, fecha_registro FROM pacientes`
    );

    const citas = await this.databaseService.query<any>(
      `SELECT c.id, c.fecha, c.hora, c.tipo, c.procedimiento, c.estado,
              p.nombre AS paciente, p.id AS paciente_id
       FROM citas c
       INNER JOIN pacientes p ON p.id = c.paciente_id
       WHERE c.fecha >= date('now')`
    );

    const r = await this.estadisticasApi.syncInicial(citas, pacientes);
    console.log('[sync] OK:', r);
    return r;
  } catch (e) {
    console.warn('[sync] Falló (offline?):', e);
    return null;
  }
}

  private fechaHoy(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}