
import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonButton,
  IonBadge,
  IonSpinner
} from '@ionic/angular';

import { Historial } from './services/historial';
import { CitaDetalle } from '../../core/models/cita';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonIcon,
    IonButton,
    IonBadge,
    IonSpinner,
    CommonModule,
    FormsModule
  ]
})
export class HistorialPage implements OnInit {

  citas: CitaDetalle[] = [];

  cargando = false;
  error = '';
  busqueda = '';

  constructor(
    private historialService: Historial,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarHistorial();
  }

  ionViewWillEnter() {
    this.cargarHistorial();
  }

  get citasFiltradas(): CitaDetalle[] {
    const texto = this.busqueda.trim().toLowerCase();

    if (!texto) {
      return this.citas;
    }

    return this.citas.filter(cita =>
      (cita.paciente || '').toLowerCase().includes(texto)
    );
  }

  async cargarHistorial() {
    console.log('Iniciando carga del historial...');

    this.cargando = true;
    this.error = '';

    try {
      const resultado =
        await this.historialService.cargarCitasRealizadas();

      console.log('RESULTADO DEL HISTORIAL:', resultado);

      this.citas = resultado || [];

      console.log('TOTAL DE CITAS:', this.citas.length);

    } catch (error) {
      console.error('ERROR AL CARGAR HISTORIAL:', error);

      this.error = 'No se pudo cargar el historial de citas.';
    } finally {
      this.cargando = false;
      this.changeDetector.detectChanges();
    }
  }
}
