import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { DatabaseService } from './core/services/database';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, RouterModule],
  changeDetection: ChangeDetectionStrategy.Default
})
export class AppComponent implements OnInit {
  constructor(private db: DatabaseService) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.db.initializeDatabase();
      console.log('[AppComponent] Base de datos MyConsult MD lista');
    } catch (error) {
      console.error('[AppComponent] Error al inicializar SQLite:', error);
    }
  }
}
