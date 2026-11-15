import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { DatabaseService } from './core/services/database';
import { NotificacionDiariaService } from './features/notificaciones/services/notificaciones';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, RouterModule],
  changeDetection: ChangeDetectionStrategy.Default
})
export class AppComponent implements OnInit {

  constructor(
    private db: DatabaseService,
    private notificaciones: NotificacionDiariaService
  ) {}

  async ngOnInit(): Promise<void> {
    // 1. Base de datos primero (las notificaciones la consultan)
    let dbLista = false;
    try {
      await this.db.initializeDatabase();
      dbLista = true;
      console.log('[AppComponent] Base de datos MyConsult MD lista');
    } catch (error) {
      console.error('[AppComponent] Error al inicializar SQLite:', error);
    }

    // 2. Notificaciones solo si la BD está operativa
    if (!dbLista) {
      console.warn('[AppComponent] Notificaciones omitidas: BD no inicializada');
      return;
    }

    try {
      await this.notificaciones.inicializarNotificaciones();
      console.log('[AppComponent] Notificaciones inicializadas');
    } catch (error) {
      console.error('[AppComponent] Error con notificaciones:', error);
    }
  }
}