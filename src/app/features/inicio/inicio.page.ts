
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonIcon,
  IonButton
} from '@ionic/angular';
import { RouterLink } from '@angular/router';

import { CitaResumen } from '../../core/models/cita';
import { Inicio } from './services/inicio';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonIcon,
    IonButton,
    RouterLink
  ]
})
export class InicioPage implements OnInit {
  nombreConsultorio = '';
  nombreProfesional = '';
  readonly fechaActual = new Date();

  totalCitas = 0;
  citasPendientes = 0;
  totalPacientes = 0;

  proximasCitas: CitaResumen[] = [];

  constructor(
    private inicio: Inicio,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    console.log('[Inicio] Componente cargado');
    await this.cargarDatosInicio();
  }

  private async cargarDatosInicio(): Promise<void> {
    try {
      const datos = await this.inicio.cargarDatos();

      console.log('[Inicio] Datos recibidos:', datos);

      this.nombreConsultorio = datos.nombreConsultorio ?? '';
      this.nombreProfesional = datos.nombreProfesional ?? '';
      this.totalCitas = datos.totalCitas ?? 0;
      this.citasPendientes = datos.citasPendientes ?? 0;
      this.totalPacientes = datos.totalPacientes ?? 0;
      this.proximasCitas = datos.proximasCitas ?? [];

      this.cdr.detectChanges();

      console.log('[Inicio] Consultorio:', this.nombreConsultorio);
      console.log('[Inicio] Profesional:', this.nombreProfesional);
    } catch (error) {
      console.error('[Inicio] Error al cargar los datos:', error);
    }
  }

  async ionViewWillEnter(): Promise<void> {
    await this.cargarDatosInicio();
  }

  irAAgenda(): void {
    window.location.href = '/tabs/agenda';
  }

  irPacientes(): void {
    window.location.href = '/tabs/pacientes';
  }

  verHistorial(): void {
    window.location.href = '/tabs/historial';
  }

  abrirNuevaCita(): void {
    window.location.href = '/tabs/agenda/nueva-cita';
  }
}
