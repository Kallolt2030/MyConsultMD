import { Routes } from '@angular/router';
import { setupGuard } from './core/guards/setup-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs',
    pathMatch: 'full',
  },

  {
    path: 'setup',
    loadComponent: () => import('./features/setup/setup.page').then(m => m.SetupPage),
  },

  



  {
    path: 'tabs',
    loadComponent: () => import('./features/tabs/tabs.page').then(m => m.TabsPage),
    canActivate: [setupGuard],
    children: [
      { path: '',                redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio',          loadComponent: () => import('./features/inicio/inicio.page').then(m => m.InicioPage) },
      { path: 'agenda',          loadComponent: () => import('./features/agenda/agenda.page').then(m => m.AgendaPage) },
      { path: 'lista-pacientes', loadComponent: () => import('./features/pacientes/lista-pacientes/lista-pacientes.page').then(m => m.ListaPacientesPage) },
      { path: 'historial',       loadComponent: () => import('./features/historial/historial.page').then(m => m.HistorialPage) },
      { path: 'configuracion',   loadComponent: () => import('./features/configuracion/configuracion.page').then(m => m.ConfiguracionPage) },
    ],
  },

  {
    path: 'nueva-cita',
    loadComponent: () => import('./features/citas/nueva-cita/nueva-cita.page').then(m => m.NuevaCitaPage),
  },
  {
    path: 'detalle-cita/:id',
    loadComponent: () => import('./features/citas/detalle-cita/detalle-cita.page').then(m => m.DetalleCitaPage),
  },
  {
    path: 'editar-cita/:id',
    loadComponent: () => import('./features/citas/editar-cita/editar-cita.page').then(m => m.EditarCitaPage),
  },




  {
    path: 'registrar-paciente',
    loadComponent: () => import('./features/pacientes/registrar-paciente/registrar-paciente.page').then(m => m.RegistrarPacientePage),
  },
  {
    path: 'detalle-paciente/:id',
    loadComponent: () => import('./features/pacientes/detalle-paciente/detalle-paciente.page').then(m => m.DetallePacientePage),
  },




  {
    path: 'config-recordatorios',
    loadComponent: () => import('./features/recordatorios/config-recordatorios/config-recordatorios.page').then(m => m.ConfigRecordatoriosPage),
  },
  {
    path: 'enviar-recordatorio/:id',
    loadComponent: () => import('./features/recordatorios/enviar-recordatorio/enviar-recordatorio.page').then(m => m.EnviarRecordatorioPage),
  },



  
  {
    path: 'notificaciones',
    loadComponent: () => import('./features/notificaciones/notificaciones.page').then(m => m.NotificacionesPage),
  },

  // 🔹 Comodín 404 (opcional pero recomendado)
  { path: '**', redirectTo: 'tabs' },
];