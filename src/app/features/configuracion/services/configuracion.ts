
import { Injectable } from '@angular/core';
import { DatabaseService } from '../../../core/services/database';
import { Consultorio } from '../../../core/models/consultorio';

@Injectable({
  providedIn: 'root'
})
export class Configuracion {

  constructor(
    private databaseService: DatabaseService
  ) {}

  async obtenerConsultorio(): Promise<Consultorio | null> {

    console.log('[Configuracion] Consultando consultorio...');

    try {
      const resultado = await this.databaseService.query<Consultorio>(
        `SELECT * FROM consultorio ORDER BY id ASC LIMIT 1`
      );

      console.log('[Configuracion] Resultado:', resultado);

      return resultado.length > 0 ? resultado[0] : null;

    } catch (error) {
      console.error('[Configuracion] Error en consulta:', error);
      throw error;
    }
  }

  async guardarConsultorio(datos: Consultorio): Promise<void> {

    console.log('[Configuracion] Guardando datos...');

    const existente = await this.obtenerConsultorio();

    if (existente) {
      await this.databaseService.run(
        `UPDATE consultorio
         SET nombre = ?,
             profesional = ?,
             especialidad = ?,
             tipo_establecimiento = ?,
             hora_inicio = ?,
             hora_cierre = ?,
             dias_laborales = ?
         WHERE id = ?`,
        [
          datos.nombre,
          datos.profesional,
          datos.especialidad,
          datos.tipo_establecimiento,
          datos.hora_inicio,
          datos.hora_cierre,
          datos.dias_laborales,
          existente.id
        ]
      );
    } else {
      await this.databaseService.run(
        `INSERT INTO consultorio (
          nombre, profesional, especialidad,
          tipo_establecimiento, hora_inicio,
          hora_cierre, dias_laborales
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          datos.nombre,
          datos.profesional,
          datos.especialidad,
          datos.tipo_establecimiento,
          datos.hora_inicio,
          datos.hora_cierre,
          datos.dias_laborales
        ]
      );
    }

    console.log('[Configuracion] Guardado correctamente.');
  }
}
