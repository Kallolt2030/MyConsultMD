
import { Injectable } from '@angular/core';
import { DatabaseService } from '../../../core/services/database';

export interface PacienteRegistro {
  id?: number;
  nombre: string;
  telefono: string;
  telegram: string;
  telegram_chat_id?: string | null;
  telegram_vinculado?: number;
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
      `SELECT
        id,
        nombre,
        telefono,
        telegram,
        telegram_chat_id,
        telegram_vinculado,
        fecha_registro
       FROM pacientes
       ORDER BY nombre ASC`
    );
  }

  // Obtener un paciente por su ID
  async obtenerPaciente(
    id: number
  ): Promise<PacienteRegistro | null> {
    const pacientes = await this.databaseService.query<PacienteRegistro>(
      `SELECT
        id,
        nombre,
        telefono,
        telegram,
        telegram_chat_id,
        telegram_vinculado,
        fecha_registro
       FROM pacientes
       WHERE id = ?`,
      [id]
    );

    return pacientes[0] ?? null;
  }

  // Buscar pacientes por nombre o teléfono
  async buscarPacientes(
    texto: string
  ): Promise<PacienteRegistro[]> {
    const busqueda = `%${texto.trim()}%`;

    return this.databaseService.query<PacienteRegistro>(
      `SELECT
        id,
        nombre,
        telefono,
        telegram,
        telegram_chat_id,
        telegram_vinculado,
        fecha_registro
       FROM pacientes
       WHERE nombre LIKE ?
          OR telefono LIKE ?
          OR telegram LIKE ?
       ORDER BY nombre ASC`,
      [busqueda, busqueda, busqueda]
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

  // Actualizar los datos del paciente sin modificar su vinculación
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

  // Vincular el chat de Telegram con un paciente
  async vincularTelegram(
    id: number,
    chatId: string
  ): Promise<void> {
    const identificador = chatId.trim();

    if (!identificador) {
      throw new Error('El identificador de Telegram es obligatorio.');
    }

    await this.databaseService.run(
      `UPDATE pacientes
       SET telegram_chat_id = ?,
           telegram_vinculado = 1
       WHERE id = ?`,
      [identificador, id]
    );
  }

  // Consultar si un paciente tiene Telegram vinculado
  async tieneTelegramVinculado(
    id: number
  ): Promise<boolean> {
    const resultado = await this.databaseService.query<{
      telegram_vinculado: number;
      telegram_chat_id: string | null;
    }>(
      `SELECT telegram_vinculado, telegram_chat_id
       FROM pacientes
       WHERE id = ?`,
      [id]
    );

    return resultado.length > 0 &&
      resultado[0].telegram_vinculado === 1 &&
      !!resultado[0].telegram_chat_id;
  }

  // Desvincular Telegram sin eliminar al paciente
  async desvincularTelegram(
    id: number
  ): Promise<void> {
    await this.databaseService.run(
      `UPDATE pacientes
       SET telegram_chat_id = NULL,
           telegram_vinculado = 0
       WHERE id = ?`,
      [id]
    );
  }

  // Obtener el chat ID de un paciente vinculado
  async obtenerChatIdTelegram(
    id: number
  ): Promise<string | null> {
    const resultado = await this.databaseService.query<{
      telegram_chat_id: string | null;
      telegram_vinculado: number;
    }>(
      `SELECT telegram_chat_id, telegram_vinculado
       FROM pacientes
       WHERE id = ?`,
      [id]
    );

    if (
      resultado.length === 0 ||
      resultado[0].telegram_vinculado !== 1
    ) {
      return null;
    }

    return resultado[0].telegram_chat_id ?? null;
  }

  // Eliminar un paciente
  async eliminarPaciente(id: number): Promise<void> {
    await this.databaseService.run(
      `DELETE FROM pacientes WHERE id = ?`,
      [id]
    );
  }
}
