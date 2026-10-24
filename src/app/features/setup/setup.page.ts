
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';
import { IonButton, IonCheckbox, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonSelect, IonSelectOption, IonSpinner, IonText, IonTextarea, IonTitle, IonToolbar } from '@ionic/angular';
import { DatabaseService } from '../../core/services/database';
import { Setup } from './services/setup';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.page.html',
  styleUrls: ['./setup.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonCheckbox,
    IonIcon,
    IonText,
    IonSpinner
  ]
})
export class SetupPage {
  consultorio = {
    nombre: '',
    profesional: '',
    especialidad: '',
    tipo_establecimiento: '',
    hora_inicio: '09:00',
    hora_cierre: '18:00',
    dias_laborales: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
  };

  diasSemana = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo'
  ];

  cargando = false;
  error = '';

  constructor(
    private setup: Setup,
    private router: Router
  ) {}

  cambiarDia(dia: string, seleccionado: boolean): void {
    if (seleccionado) {
      if (!this.consultorio.dias_laborales.includes(dia)) {
        this.consultorio.dias_laborales = [
          ...this.consultorio.dias_laborales,
          dia
        ];
      }
    } else {
      this.consultorio.dias_laborales =
        this.consultorio.dias_laborales.filter(d => d !== dia);
    }
  }

  async guardarConfiguracion(): Promise<void> {
    this.error = '';

    const c = this.consultorio;

    if (
      !c.nombre.trim() ||
      !c.profesional.trim() ||
      !c.tipo_establecimiento
    ) {
      this.error = 'Completa los campos obligatorios.';
      return;
    }

    if (c.dias_laborales.length === 0) {
      this.error = 'Selecciona al menos un día laboral.';
      return;
    }

    if (c.hora_inicio >= c.hora_cierre) {
      this.error =
        'La hora de cierre debe ser posterior a la hora de apertura.';
      return;
    }

    this.cargando = true;

try {
  await this.setup.guardarConsultorio({
    nombre: c.nombre.trim(),
    profesional: c.profesional.trim(),
    especialidad: c.especialidad.trim(),
    tipo_establecimiento: c.tipo_establecimiento,
    hora_inicio: c.hora_inicio,
    hora_cierre: c.hora_cierre,
    dias_laborales: JSON.stringify(c.dias_laborales)
  });

  console.log('Configuración guardada correctamente');

} catch (error) {
  console.error('Error real al guardar en SQLite:', error);
  this.error = 'No se pudo guardar la configuración.';
  this.cargando = false;
  return;
}

try {
  await this.router.navigateByUrl('/tabs', { replaceUrl: true });
} catch (error) {
  console.error('Error al navegar a las pestañas:', error);
} finally {
  this.cargando = false;
}
  }
}
