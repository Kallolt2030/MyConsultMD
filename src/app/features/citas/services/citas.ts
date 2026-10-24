import { Service } from '@angular/core';

@Service()
export class Citas {
    async obtenerCitasPorFecha(fecha: string): Promise<CitaDetalle[]> {
  return this.query<CitaDetalle>(
    `SELECT
       c.id, c.paciente_id, c.fecha, c.hora,
       c.tipo, c.procedimiento, c.notas, c.estado,
       p.nombre AS paciente
     FROM citas c
     INNER JOIN pacientes p ON p.id = c.paciente_id
     WHERE c.fecha = ?
     ORDER BY c.hora ASC`,
    [fecha]
  );
}

async crearCita(cita: NuevaCita): Promise<number> {
  const res = await this.run(
    `INSERT INTO citas
       (paciente_id, fecha, hora, tipo, procedimiento, notas, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      cita.paciente_id,
      cita.fecha,
      cita.hora,
      cita.tipo ?? '',
      cita.procedimiento ?? '',
      cita.notas ?? '',
      cita.estado ?? 'pendiente'
    ]
  );
  return res.changes?.lastId ?? 0;
}

async actualizarCita(id: number, cita: NuevaCita): Promise<void> {
  await this.run(
    `UPDATE citas
       SET paciente_id = ?, fecha = ?, hora = ?,
           tipo = ?, procedimiento = ?, notas = ?
     WHERE id = ?`,
    [
      cita.paciente_id,
      cita.fecha,
      cita.hora,
      cita.tipo ?? '',
      cita.procedimiento ?? '',
      cita.notas ?? '',
      id
    ]
  );
}

async cambiarEstadoCita(id: number, estado: string): Promise<void> {
  await this.run(
    `UPDATE citas SET estado = ? WHERE id = ?`,
    [estado, id]
  );
}

async eliminarCita(id: number): Promise<void> {
  await this.run(`DELETE FROM citas WHERE id = ?`, [id]);
}
}
