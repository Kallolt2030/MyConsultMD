
import { Injectable } from '@angular/core';
import { Consultorio } from '../../../core/models/consultorio';
import { DatabaseService } from '../../../core/services/database';

@Injectable({
  providedIn: 'root'
})
export class Setup {
  constructor(
    private databaseService: DatabaseService
  ) {}

  // Guardar la configuración inicial del consultorio
  async guardarConsultorio(consultorio: {
    nombre: string;
    profesional: string;
    especialidad?: string;
    tipo_establecimiento?: string;
    hora_inicio?: string;
    hora_cierre?: string;
    dias_laborales?: string;
  }): Promise<void> {
    await this.databaseService.run(
      `INSERT INTO consultorio (
        nombre,
        profesional,
        especialidad,
        tipo_establecimiento,
        hora_inicio,
        hora_cierre,
        dias_laborales
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        consultorio.nombre,
        consultorio.profesional,
        consultorio.especialidad ?? '',
        consultorio.tipo_establecimiento ?? '',
        consultorio.hora_inicio ?? '',
        consultorio.hora_cierre ?? '',
        consultorio.dias_laborales ?? ''
      ]
    );
  }

  // Consultar la configuración guardada
  async obtenerConsultorio(): Promise<Consultorio | null> {
    const consultorios =
      await this.databaseService.query<Consultorio>(
        `SELECT * FROM consultorio ORDER BY id DESC LIMIT 1`
      );

    return consultorios.length > 0
      ? consultorios[0]
      : null;
  }

  // Comprobar si existe una configuración
  async existeConsultorio(): Promise<boolean> {
    const resultado =
      await this.databaseService.query<{ total: number }>(
        `SELECT COUNT(*) AS total FROM consultorio`
      );

    return (resultado[0]?.total ?? 0) > 0;
  }
}
