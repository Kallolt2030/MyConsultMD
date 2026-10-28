import { Injectable } from '@angular/core';

import { DatabaseService } from '../../../core/services/database';
import { CitaDetalle } from '../../../core/models/cita';
import { Paciente } from '../../../core/models/paciente';

@Injectable({
  providedIn: 'root'
})
export class Agenda {

  constructor(
    private databaseService: DatabaseService
  ) {}

  // Obtener las consultas de una fecha
  async cargarCitas(fecha: string): Promise<CitaDetalle[]> {
    return this.databaseService.query<CitaDetalle>(
      `SELECT
         c.*,
         p.nombre AS paciente
       FROM citas c
       INNER JOIN pacientes p ON p.id = c.paciente_id
       WHERE c.fecha = ?
       ORDER BY c.hora ASC`,
      [fecha]
    );
  }

  // Obtener una consulta por su identificador
  async obtenerCitaPorId(id: number): Promise<CitaDetalle | null> {
    const citas = await this.databaseService.query<CitaDetalle>(
      `SELECT
         c.*,
         p.nombre AS paciente
       FROM citas c
       INNER JOIN pacientes p ON p.id = c.paciente_id
       WHERE c.id = ?
       LIMIT 1`,
      [id]
    );

    return citas.length > 0 ? citas[0] : null;
  }

  // Obtener los pacientes para los formularios
  async cargarPacientes(): Promise<Paciente[]> {
    return this.databaseService.query<Paciente>(
      `SELECT
         id,
         nombre,
         telefono,
         telegram
       FROM pacientes
       ORDER BY nombre ASC`
    );
  }

  // Registrar una nueva consulta
  async crearCita(cita: {
    paciente_id: number;
    fecha: string;
    hora: string;
    tipo: string;
    procedimiento: string;
    notas: string;
  }): Promise<void> {
    await this.databaseService.run(
      `INSERT INTO citas (
         paciente_id,
         fecha,
         hora,
         tipo,
         procedimiento,
         notas,
         estado
       )
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        cita.paciente_id,
        cita.fecha,
        cita.hora,
        cita.tipo,
        cita.procedimiento,
        cita.notas,
        'pendiente'
      ]
    );
  }

  // Actualizar una consulta existente
  async actualizarCita(
    id: number,
    cita: {
      paciente_id: number;
      fecha: string;
      hora: string;
      tipo: string;
      procedimiento: string;
      notas: string;
    }
  ): Promise<void> {
    await this.databaseService.run(
      `UPDATE citas
       SET paciente_id = ?,
           fecha = ?,
           hora = ?,
           tipo = ?,
           procedimiento = ?,
           notas = ?
       WHERE id = ?`,
      [
        cita.paciente_id,
        cita.fecha,
        cita.hora,
        cita.tipo,
        cita.procedimiento,
        cita.notas,
        id
      ]
    );
  }

  // Cambiar el estado de una consulta
  async cambiarEstadoCita(
    id: number,
    estado: 'pendiente' | 'realizada' | 'cancelada'
  ): Promise<void> {
    await this.databaseService.run(
      `UPDATE citas
       SET estado = ?
       WHERE id = ?`,
      [estado, id]
    );
  }

  // Eliminar una consulta
  async eliminarCita(id: number): Promise<void> {
    await this.databaseService.run(
      `DELETE FROM citas
       WHERE id = ?`,
      [id]
    );
  }

}
