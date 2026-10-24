
import { Injectable } from '@angular/core';

import { DatabaseService } from '../../../core/services/database';

export interface Paciente {
  id: number;
  nombre: string;
  telefono: string;
  telegram: string;
}

@Injectable({
  providedIn: 'root'
})
export class Pacientes {

  constructor(
    private databaseService: DatabaseService
  ) {}

  // Obtener todos los pacientes
  async obtenerPacientes(): Promise<Paciente[]> {
    return this.databaseService.query<Paciente>(
      `SELECT id, nombre, telefono, telegram
       FROM pacientes
       ORDER BY nombre ASC`
    );
  }

  // Crear un paciente
  async crearPaciente(
    p: Omit<Paciente, 'id'>
  ): Promise<number> {
    const res = await this.databaseService.run(
      `INSERT INTO pacientes (
         nombre,
         telefono,
         telegram
       )
       VALUES (?, ?, ?)`,
      [
        p.nombre,
        p.telefono ?? '',
        p.telegram ?? ''
      ]
    );

    return res.changes?.lastId ?? 0;
  }

  // Buscar un paciente por ID
  async obtenerPacientePorId(
    id: number
  ): Promise<Paciente | null> {
    const pacientes = await this.databaseService.query<Paciente>(
      `SELECT id, nombre, telefono, telegram
       FROM pacientes
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    return pacientes.length > 0 ? pacientes[0] : null;
  }
}
