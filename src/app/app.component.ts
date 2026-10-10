import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { DatabaseService } from './core/services/database';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(private db: DatabaseService) {}

  async ngOnInit() {
    await this.db.initializeDatabase();
    console.log('Base de datos MyConsult MD lista');
  }
}
