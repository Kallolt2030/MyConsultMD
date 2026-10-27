
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonBadge
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import {
  personOutline,
  callOutline,
  chatbubbleOutline,
  calendarOutline,
  arrowBackOutline,
  createOutline,
  informationCircleOutline
} from 'ionicons/icons';

export interface PacienteDetalle {
  id: number;
  nombre: string;
  telefono: string;
  telegram: string;
  fecha_registro?: string;
}

@Component({
  selector: 'app-detalle-paciente',
  standalone: true,
  templateUrl: './detalle-paciente.page.html',
  styleUrls: ['./detalle-paciente.page.scss'],
  imports: [
    CommonModule,
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonBadge
  ]
})
export class DetallePacientePage {

  @Input() paciente: PacienteDetalle | null = null;

  @Output() regresar = new EventEmitter<void>();
  @Output() editar = new EventEmitter<PacienteDetalle>();

  constructor() {
    addIcons({
      personOutline,
      callOutline,
      chatbubbleOutline,
      calendarOutline,
      arrowBackOutline,
      createOutline,
      informationCircleOutline
    });
  }

  regresarALista(): void {
    this.regresar.emit();
  }

  editarPaciente(): void {
    if (this.paciente) {
      this.editar.emit(this.paciente);
    }
  }
}

