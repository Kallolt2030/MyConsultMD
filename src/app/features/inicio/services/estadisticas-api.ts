import { Injectable } from '@angular/core';
import { CitaResumen } from '../../../core/models/cita';

export interface ResumenApi {
  totalCitas: number;
  citasPendientes: number;
  totalPacientes: number;
  proximasCitas: CitaResumen[];
  actualizadoEn?: string;
}

@Injectable({ providedIn: 'root' })
export class EstadisticasApi {
  private readonly base = 'https://telegram-back.vercel.app/api';
  private readonly secreto = ' dddbacbafbbeabbaaacbefdefecdafbbcfcbbaaeddefedcdecedefecbceafcbf'; // ⬅️ cámbialo o usa environment

  async obtenerResumen(): Promise<ResumenApi> {
    const res = await fetch(`${this.base}/estadisticas/resumen`, {
      headers: { Authorization: `Bearer ${this.secreto}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async sincronizarCitas(citas: any[]): Promise<void> {
    await fetch(`${this.base}/citas/sync`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secreto}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ citas })
    });
  }

  async sincronizarPacientes(pacientes: any[]): Promise<void> {
    await fetch(`${this.base}/pacientes/sync`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secreto}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pacientes })
    });
  }
  async syncInicial(
  citas: any[],
  pacientes: any[]
): Promise<{ citas: number; pacientes: number }> {
  // Sincroniza ambos en paralelo
  const [resCitas, resPac] = await Promise.all([
    fetch(`${this.base}/citas/sync`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secreto}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ citas })
    }),
    fetch(`${this.base}/pacientes/sync`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secreto}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pacientes })
    })
  ]);

  const dataCitas = await resCitas.json();
  const dataPac = await resPac.json();

  return {
    citas: dataCitas.sincronizadas ?? 0,
    pacientes: dataPac.sincronizados ?? 0
  };
}
}