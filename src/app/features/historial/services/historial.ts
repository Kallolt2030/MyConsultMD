
import { Injectable } from '@angular/core';

import { DatabaseService } from '../../../core/services/database';
import { CitaDetalle } from '../../../core/models/cita';

@Injectable({
  providedIn: 'root'
})
export class Historial {

  constructor(
    private databaseService: DatabaseService
  ) {}

  // Consultar citas realizadas
  async cargarCitasRealizadas(): Promise<CitaDetalle[]> {

    return this.databaseService.query<CitaDetalle>(
      `SELECT
         c.*,
         p.nombre AS paciente
       FROM citas c
       INNER JOIN pacientes p ON p.id = c.paciente_id
       WHERE LOWER(TRIM(c.estado)) = 'realizada'
       ORDER BY c.fecha DESC, c.hora DESC`
    );

  }

  // Diagnóstico de estados registrados
  async comprobarEstados(): Promise<any[]> {

    return this.databaseService.query<any>(
      `SELECT
         estado,
         COUNT(*) AS total
       FROM citas
       GROUP BY estado`
    );

  }

  // Consultar todas las citas para diagnóstico
  async comprobarCitas(): Promise<any[]> {

    return this.databaseService.query<any>(
      `SELECT
         c.id,
         c.fecha,
         c.hora,
         c.estado,
         p.nombre AS paciente
       FROM citas c
       LEFT JOIN pacientes p ON p.id = c.paciente_id
       ORDER BY c.id DESC`
    );

  }

}
