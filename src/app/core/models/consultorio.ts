export interface Consultorio {
  id?: number;
  nombre: string;
  profesional: string;
  especialidad?: string;
  tipo_establecimiento?: string;
  hora_inicio?: string;
  hora_cierre?: string;
  dias_laborales?: string; // CSV: "lunes,martes,miércoles"
}