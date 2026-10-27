
import {
  Component,
  EventEmitter,
  OnInit,
  Output
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonButton,
  IonIcon,
  IonInput,
  IonSpinner,
  IonAlert,
  IonItem,
  IonBadge
} from '@ionic/angular';

import { addIcons } from 'ionicons';

import {
  searchOutline,
  personOutline,
  personAddOutline,
  callOutline,
  chatbubbleOutline,
  eyeOutline,
  createOutline,
  trashOutline,
  peopleOutline,
  refreshOutline
} from 'ionicons/icons';
import { PacientesService } from '../services/pacientes';



export interface PacienteLista {
  id: number;
  nombre: string;
  telefono: string;
  telegram: string;
  fecha_registro?: string;
}

@Component({
  selector: 'app-lista-pacientes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    IonIcon,
    IonInput,
    IonItem,
    IonSpinner,
    IonBadge,
    IonAlert
  ],
  templateUrl: './lista-pacientes.page.html',
  styleUrls: ['./lista-pacientes.page.scss']
})
export class ListaPacientesComponent implements OnInit {

  @Output() registrar = new EventEmitter<void>();
  @Output() verDetalle = new EventEmitter<PacienteLista>();
  @Output() editar = new EventEmitter<PacienteLista>();
  @Output() eliminado = new EventEmitter<void>();

  pacientes: PacienteLista[] = [];
  busqueda = '';

  cargando = false;
  eliminando = false;
  error = '';

  mostrarConfirmacion = false;
  pacienteAEliminar: PacienteLista | null = null;

  constructor(
    private pacientesService: PacientesService
  ) {
    addIcons({
      searchOutline,
      personOutline,
      personAddOutline,
      callOutline,
      chatbubbleOutline,
      eyeOutline,
      createOutline,
      trashOutline,
      peopleOutline,
      refreshOutline
    });
  }

  ngOnInit(): void {
    void this.cargarPacientes();
  }

  async cargarPacientes(): Promise<void> {
    this.cargando = true;
    this.error = '';

    try {
      const resultado = await this.pacientesService.cargarPacientes();

      this.pacientes = resultado as PacienteLista[];
    } catch (e) {
      console.error('Error al cargar pacientes:', e);
      this.error = 'No se pudieron cargar los pacientes.';
    } finally {
      this.cargando = false;
    }
  }

  get pacientesFiltrados(): PacienteLista[] {
    const texto = this.busqueda.trim().toLowerCase();

    if (!texto) {
      return this.pacientes;
    }

    return this.pacientes.filter(paciente =>
      (paciente.nombre ?? '').toLowerCase().includes(texto) ||
      (paciente.telefono ?? '').toLowerCase().includes(texto) ||
      (paciente.telegram ?? '').toLowerCase().includes(texto)
    );
  }

  abrirRegistro(): void {
    this.registrar.emit();
  }

  abrirDetalle(paciente: PacienteLista): void {
    this.verDetalle.emit(paciente);
  }

  editarPaciente(paciente: PacienteLista): void {
    this.editar.emit(paciente);
  }

  confirmarEliminacion(paciente: PacienteLista): void {
    this.pacienteAEliminar = paciente;
    this.mostrarConfirmacion = true;
  }

  async eliminarPaciente(): Promise<void> {
    if (!this.pacienteAEliminar) {
      return;
    }

    this.eliminando = true;
    this.error = '';

    try {
      await this.pacientesService.eliminarPaciente(
        this.pacienteAEliminar.id
      );

      this.pacientes = this.pacientes.filter(
        paciente => paciente.id !== this.pacienteAEliminar?.id
      );

      this.mostrarConfirmacion = false;
      this.pacienteAEliminar = null;

      this.eliminado.emit();
    } catch (e) {
      console.error('Error al eliminar paciente:', e);
      this.error = 'No se pudo eliminar el paciente.';
    } finally {
      this.eliminando = false;
    }
  }
  cancelarEliminacion(): void {
  this.mostrarConfirmacion = false;
  this.pacienteAEliminar = null;
  }

  async confirmarEliminarPaciente(): Promise<void> {
    await this.eliminarPaciente();
  }
}
