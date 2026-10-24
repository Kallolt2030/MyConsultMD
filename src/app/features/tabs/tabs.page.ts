
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular';


import {
  homeOutline,
  calendarOutline,
  peopleOutline,
  timeOutline,
  settingsOutline,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    RouterModule,
  ],
})
export class TabsPage {
  constructor() {
    addIcons({
      homeOutline,
      calendarOutline,
      peopleOutline,
      timeOutline,
      settingsOutline,
    });
  }
}
