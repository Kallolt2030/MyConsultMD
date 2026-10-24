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

export interface CitaResumen {
  id: number;
  hora: string;
  paciente: string;
  tipo: string;
  estado: string;
}

export interface CitaDetalle extends CitaResumen {
  paciente_id: number;
  fecha: string;
  procedimiento?: string;
  notas?: string;
}

export interface NuevaCita {
  paciente_id: number;
  fecha: string;
  hora: string;
  tipo?: string;
  procedimiento?: string;
  notas?: string;
  estado?: string;
}