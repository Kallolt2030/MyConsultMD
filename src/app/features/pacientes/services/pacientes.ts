import { Injectable } from '@angular/core';
import { DatabaseService } from '../../../core/services/database';

export interface PacienteRegistro {
  id?: number;
  nombre: string;
  telefono: string;
  telegram: string;
  fecha_registro?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PacientesService {

  constructor(
    private databaseService: DatabaseService
  ) {}

  // Obtener todos los pacientes
  async cargarPacientes(): Promise<PacienteRegistro[]> {
    return this.databaseService.query<PacienteRegistro>(
      `SELECT id, nombre, telefono, telegram, fecha_registro
       FROM pacientes
       ORDER BY nombre ASC`
    );
  }

  // Buscar pacientes por nombre o teléfono
  async buscarPacientes(
    texto: string
  ): Promise<PacienteRegistro[]> {
    const busqueda = `%${texto.trim()}%`;

    return this.databaseService.query<PacienteRegistro>(
      `SELECT id, nombre, telefono, telegram, fecha_registro
       FROM pacientes
       WHERE nombre LIKE ?
          OR telefono LIKE ?
       ORDER BY nombre ASC`,
      [busqueda, busqueda]
    );
  }

  // Registrar un paciente
  async registrarPaciente(
    paciente: PacienteRegistro
  ): Promise<void> {
    await this.databaseService.run(
      `INSERT INTO pacientes (
        nombre,
        telefono,
        telegram
      ) VALUES (?, ?, ?)`,
      [
        paciente.nombre.trim(),
        paciente.telefono.trim(),
        paciente.telegram.trim()
      ]
    );
  }

  // Actualizar los datos de un paciente
  async actualizarPaciente(
    id: number,
    paciente: PacienteRegistro
  ): Promise<void> {
    await this.databaseService.run(
      `UPDATE pacientes
       SET nombre = ?,
           telefono = ?,
           telegram = ?
       WHERE id = ?`,
      [
        paciente.nombre.trim(),
        paciente.telefono.trim(),
        paciente.telegram.trim(),
        id
      ]
    );
  }

  // Eliminar un paciente
  async eliminarPaciente(id: number): Promise<void> {
    await this.databaseService.run(
      `DELETE FROM pacientes WHERE id = ?`,
      [id]
    );
  }
}