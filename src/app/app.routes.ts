import { Routes } from '@angular/router';

// Guards
import { authGuard } from './core/guards/auth-guard';
import { noAuthGuard } from './core/guards/no-auth-guard';
import { setupGuard } from './core/guards/setup-guard';

// Autenticación
import { LoginPage } from './features/auth/login/login.page';
import { RegisterPage } from './features/auth/register/register.page';

// Configuración inicial
import { SetupPage } from './features/setup/setup.page';

// Navegación principal
import { TabsPage } from './features/tabs/tabs.page';

// Inicio
import { InicioPage } from './features/inicio/inicio.page';

// Citas
import { NuevaCitaPage } from './features/citas/nueva-cita/nueva-cita.page';
import { DetalleCitaPage } from './features/citas/detalle-cita/detalle-cita.page';
import { EditarCitaPage } from './features/citas/editar-cita/editar-cita.page';

// Pacientes


import { DetallePacientePage } from './features/pacientes/detalle-paciente/detalle-paciente.page';

// Historial y configuración
import { HistorialPage } from './features/historial/historial.page';
import { ConfiguracionPage } from './features/configuracion/configuracion.page';

// Recordatorios
import { ConfigRecordatoriosPage } from './features/recordatorios/config-recordatorios/config-recordatorios.page';
import { EnviarRecordatorioPage } from './features/recordatorios/enviar-recordatorio/enviar-recordatorio.page';

// Notificaciones
import { NotificacionesPage } from './features/notificaciones/notificaciones.page';
import { AgendaPage } from './features/agenda/agenda.page';
import { PacienteComponent } from './features/pacientes/paciente/paciente.component';
import { RegistrarPacienteComponent } from './features/pacientes/registrar-paciente/registrar-paciente.page';

export const routes: Routes = [
  // Redirección inicial
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  // Autenticación: usuarios sin sesión
  {
    path: 'login',
    component: LoginPage,
    canActivate: [noAuthGuard],
  },
  {
    path: 'register',
    component: RegisterPage,
    canActivate: [noAuthGuard],
  },

  // Configuración inicial del consultorio
  {
    path: 'setup',
    component: SetupPage,
    canActivate: [authGuard], 
  },

  // Navegación principal: requiere sesión y configuración completada
  {
    path: 'tabs',
    component: TabsPage,
    canActivate: [authGuard, setupGuard],
    children: [
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full',
      },
      {
        path: 'inicio',
        component: InicioPage,
      },
      {
        path: 'agenda',
        component: AgendaPage,
      },
      {
        path: 'pacientes',
        component: PacienteComponent,
      },
      {
        path: 'historial',
        component: HistorialPage,
      },
      {
        path: 'configuracion',
        component: ConfiguracionPage,
      },
    ],
  },

  // Gestión de citas: requiere autenticación
  {
    path: 'nueva-cita',
    component: NuevaCitaPage,
    canActivate: [authGuard, setupGuard],
  },
  {
    path: 'detalle-cita/:id',
    component: DetalleCitaPage,
    canActivate: [authGuard, setupGuard],
  },
  {
    path: 'editar-cita/:id',
    component: EditarCitaPage,
    canActivate: [authGuard, setupGuard],
  },

  // Gestión de pacientes: requiere autenticación
  {
    path: 'registrar-paciente',
    component: RegistrarPacienteComponent,
    canActivate: [authGuard, setupGuard],
  },
  {
    path: 'detalle-paciente/:id',
    component: DetallePacientePage,
    canActivate: [authGuard, setupGuard],
  },

  // Recordatorios: requiere autenticación
  {
    path: 'config-recordatorios',
    component: ConfigRecordatoriosPage,
    canActivate: [authGuard, setupGuard],
  },
  {
    path: 'enviar-recordatorio/:id',
    component: EnviarRecordatorioPage,
    canActivate: [authGuard, setupGuard],
  },

  // Notificaciones: requiere autenticación y configuración
  {
    path: 'notificaciones',
    component: NotificacionesPage,
    canActivate: [authGuard, setupGuard],
  },

  // Ruta no encontrada
  {
    path: '**',
    redirectTo: 'tabs',
  },
];
