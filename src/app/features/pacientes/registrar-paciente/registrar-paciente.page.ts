
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonText,
  IonButtons,
  IonSpinner
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import {
  personOutline,
  callOutline,
  chatbubbleOutline,
  arrowBackOutline,
  saveOutline
} from 'ionicons/icons';
import { PacientesService } from '../services/pacientes';



export interface PacienteFormulario {
  id?: number;
  nombre: string;
  telefono: string;
  telegram: string;
}

@Component({
  selector: 'app-registrar-paciente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonText,
    IonButtons,
    IonSpinner
  ],
  templateUrl: './registrar-paciente.page.html',
  styleUrls: ['./registrar-paciente.page.scss']
})
export class RegistrarPacienteComponent implements OnInit {

  @Input() paciente: PacienteFormulario | null = null;

  @Output() guardar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  pacienteForm: PacienteFormulario = this.formularioVacio();

  guardando = false;
  error = '';

  constructor(private pacientesService: PacientesService) {
    addIcons({
      personOutline,
      callOutline,
      chatbubbleOutline,
      arrowBackOutline,
      saveOutline
    });
  }

  ngOnInit(): void {
    if (this.paciente) {
      this.pacienteForm = { ...this.paciente };
    }
  }

  private formularioVacio(): PacienteFormulario {
    return {
      nombre: '',
      telefono: '',
      telegram: ''
    };
  }

  async guardarPaciente(): Promise<void> {
    this.error = '';

    const nombre = this.pacienteForm.nombre.trim();
    const telefono = this.pacienteForm.telefono.trim();
    const telegram = this.pacienteForm.telegram.trim();

    if (!nombre || !telefono) {
      this.error = 'El nombre y el teléfono son obligatorios.';
      return;
    }

    if (!/^[0-9+\s()-]{7,20}$/.test(telefono)) {
      this.error = 'Ingresa un teléfono válido.';
      return;
    }

    this.guardando = true;

    try {
      const datos: PacienteFormulario = {
        ...this.pacienteForm,
        nombre,
        telefono,
        telegram
      };

      if (this.paciente?.id != null) {
        await this.pacientesService.actualizarPaciente(
          this.paciente.id,
          datos
        );
      } else {
        await this.pacientesService.registrarPaciente(datos);
      }

      this.guardar.emit();
    } catch (e) {
      console.error('Error al guardar paciente:', e);
      this.error = 'No se pudo guardar el paciente. Inténtalo nuevamente.';
    } finally {
      this.guardando = false;
    }
  }

  cancelarFormulario(): void {
    this.cancelar.emit();
  }
}
