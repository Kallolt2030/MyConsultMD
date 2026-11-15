
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DetallePacientePage } from '../detalle-paciente/detalle-paciente.page';

import {
  ListaPacientesComponent,
  PacienteLista
} from '../lista-pacientes/lista-pacientes.page';

import {
  PacienteDetalle
} from '../detalle-paciente/detalle-paciente.page';

import {
  PacienteFormulario,
  RegistrarPacienteComponent
} from '../registrar-paciente/registrar-paciente.page';

@Component({
  selector: 'app-paciente',
  standalone: true,
  templateUrl: './paciente.component.html',
  styleUrls: ['./paciente.component.scss'],
  imports: [
    CommonModule,
    ListaPacientesComponent,
    RegistrarPacienteComponent,
    DetallePacientePage
  ]
})
export class PacienteComponent {

  vista: 'lista' | 'registro' | 'detalle' = 'lista';

  pacienteParaFormulario: PacienteFormulario | null = null;
  pacienteParaDetalle: PacienteDetalle | null = null;

  // Abrir formulario para registrar paciente
  abrirRegistro(): void {
    this.pacienteParaFormulario = null;
    this.vista = 'registro';
  }

  // Abrir detalle del paciente
  abrirDetalle(paciente: PacienteLista): void {
    this.pacienteParaDetalle = {
      id: paciente.id,
      nombre: paciente.nombre,
      telefono: paciente.telefono,
      telegram: paciente.telegram,
      telegram_chat_id: paciente.telegram_chat_id,
      telegram_vinculado: paciente.telegram_vinculado,
      fecha_registro: paciente.fecha_registro,
      foto: paciente.foto
    };

    this.vista = 'detalle';
  }

  // Editar paciente
  editarPaciente(paciente: PacienteLista | PacienteDetalle): void {
    this.pacienteParaFormulario = {
      id: paciente.id,
      nombre: paciente.nombre,
      telefono: paciente.telefono,
      telegram: paciente.telegram
    };

    this.vista = 'registro';
  }

  // Regresar a la lista
  volverALista(): void {
    this.vista = 'lista';
  }

  // Actualizar lista después de una operación
  actualizarLista(): void {
    this.vista = 'lista';
  }
}
