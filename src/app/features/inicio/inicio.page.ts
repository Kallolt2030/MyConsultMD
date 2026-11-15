import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonIcon,
  IonButton,
} from '@ionic/angular';
import { RouterLink, Router } from '@angular/router';

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
  origenDatos: 'api' | 'local' = 'local';
  readonly fechaActual = new Date();

  totalCitas = 0;
  citasPendientes = 0;
  totalPacientes = 0;

  proximasCitas: CitaResumen[] = [];

  constructor(
    private inicio: Inicio,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    console.log('[Inicio] Componente cargado');
    await this.cargarDatosInicio();
  }

  async ionViewWillEnter(): Promise<void> {
    await this.sincronizarYCargar();
  }

  /**
   * 1. Empuja los datos locales a Firestore (silencioso, no bloquea si falla)
   * 2. Carga los datos (usa API si ya están sincronizados, o SQLite local si no)
   */
  private async sincronizarYCargar(): Promise<void> {
    // Sync en segundo plano (si el usuario está offline, falla en silencio)
    this.inicio.sincronizarTodo()
      .then(r => r && console.log('[Inicio] Sync OK:', r))
      .catch(() => {});

    // Cargar datos inmediatamente (la API puede tardar 1-2s en reflejar el sync)
    await this.cargarDatosInicio();
  }

  private async cargarDatosInicio(): Promise<void> {
  try {
    const datos = await this.inicio.cargarDatos();

    this.nombreConsultorio = datos.nombreConsultorio ?? '';
    this.nombreProfesional = datos.nombreProfesional ?? '';
    this.totalCitas = datos.totalCitas ?? 0;
    this.citasPendientes = datos.citasPendientes ?? 0;
    this.totalPacientes = datos.totalPacientes ?? 0;
    this.proximasCitas = datos.proximasCitas ?? [];
    this.origenDatos = datos.origenDatos ?? 'local';   // ⬅️ nuevo

    this.cdr.detectChanges();
  } catch (error) {
    console.error('[Inicio] Error al cargar los datos:', error);
  }
}
irAAgenda(): void {
    this.router.navigate(['tabs/agenda']);
  }
}