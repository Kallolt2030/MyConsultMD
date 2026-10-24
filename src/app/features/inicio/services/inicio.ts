
import { Injectable } from '@angular/core';

import { DatabaseService } from '../../../core/services/database';
import { CitaResumen } from '../../../core/models/cita';
import { Consultorio } from '../../../core/models/consultorio';
import { ResumenDashboard } from '../../../core/models/resumenDashboard';

export interface DatosInicio {
  nombreConsultorio: string;
  nombreProfesional: string;
  totalCitas: number;
  citasPendientes: number;
  totalPacientes: number;
  proximasCitas: CitaResumen[];
}

@Injectable({
  providedIn: 'root'
})
export class Inicio {

  constructor(
    private databaseService: DatabaseService
  ) {}

  async obtenerConsultorio(): Promise<Consultorio | null> {
    const consultorios =
      await this.databaseService.query<Consultorio>(
        `SELECT * FROM consultorio ORDER BY id DESC LIMIT 1`
      );

    return consultorios.length > 0
      ? consultorios[0]
      : null;
  }

  async obtenerProximasCitas(
    fecha: string = this.fechaHoy()
  ): Promise<CitaResumen[]> {
    return this.databaseService.query<CitaResumen>(
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
  }

  async obtenerResumenDashboard(
    fecha: string = this.fechaHoy()
  ): Promise<ResumenDashboard> {
    const [citasRes, pacientesRes] = await Promise.all([
      this.databaseService.query<{
        total: number;
        pendientes: number | null;
      }>(
        `SELECT
           COUNT(*) AS total,
           SUM(
             CASE
               WHEN estado = 'pendiente' THEN 1
               ELSE 0
             END
           ) AS pendientes
         FROM citas
         WHERE fecha = ?`,
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
   * Prepara todos los datos necesarios para la pantalla de inicio.
   */
  async cargarDatos(
    fecha: string = this.fechaHoy()
  ): Promise<DatosInicio> {
    const [consultorio, resumen, proximasCitas] =
      await Promise.all([
        this.obtenerConsultorio(),
        this.obtenerResumenDashboard(fecha),
        this.obtenerProximasCitas(fecha)
      ]);

    return {
      nombreConsultorio:
        consultorio?.nombre ?? 'Mi consultorio',

      nombreProfesional:
        consultorio?.profesional ?? 'Doctor(a)',

      totalCitas: resumen.totalCitas,
      citasPendientes: resumen.citasPendientes,
      totalPacientes: resumen.totalPacientes,
      proximasCitas
    };
  }

  private fechaHoy(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
  }
}
