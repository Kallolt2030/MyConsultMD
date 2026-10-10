export interface Cita {
  id?: number;
  paciente_id: number;
  fecha: string;      // YYYY-MM-DD
  hora: string;       // HH:mm
  tipo?: string;
  procedimiento?: string;
  notas?: string;
  estado?: 'pendiente' | 'realizada' | 'cancelada';
  recordatorio_estado?: 'pendiente' | 'enviado' | 'error';
  paciente_nombre?: string; // opcional, para joins
}