
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetallePacientePage } from '../detalle-paciente/detalle-paciente.page';

import { ListaPacientesComponent, PacienteLista } from '../lista-pacientes/lista-pacientes.page';
import { PacienteDetalle } from '../detalle-paciente/detalle-paciente.page';
import { PacienteFormulario, RegistrarPacienteComponent } from '../registrar-paciente/registrar-paciente.page';

@Component({
  selector: 'app-paciente',
  standalone: true,
  templateUrl: './paciente.component.html',
  styleUrls: ['./paciente.component.scss'],
  imports: [
    CommonModule,
    ListaPacientesComponent,
    RegistrarPacienteComponent,
    DetallePacientePage,
  ]
})
export class PacienteComponent {

  vista: 'lista' | 'registro' | 'detalle' = 'lista';

pacienteParaFormulario: PacienteFormulario | null = null;
pacienteParaDetalle: PacienteDetalle | null = null;

abrirRegistro(): void {
  this.pacienteParaFormulario = null;
  this.vista = 'registro';
}

abrirDetalle(paciente: PacienteLista): void {
  this.pacienteParaDetalle = {
    id: paciente.id,
    nombre: paciente.nombre,
    telefono: paciente.telefono,
    telegram: paciente.telegram,
    fecha_registro: paciente.fecha_registro
  };

  this.vista = 'detalle';
}

editarPaciente(paciente: PacienteLista | PacienteDetalle): void {
  this.pacienteParaFormulario = {
    id: paciente.id,
    nombre: paciente.nombre,
    telefono: paciente.telefono,
    telegram: paciente.telegram
  };

  this.vista = 'registro';
}

volverALista(): void {
  this.vista = 'lista';
}

actualizarLista(): void {
  this.vista = 'lista';
}
}
