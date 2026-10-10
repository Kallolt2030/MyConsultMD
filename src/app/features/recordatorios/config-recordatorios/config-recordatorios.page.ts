import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-config-recordatorios',
  templateUrl: './config-recordatorios.page.html',
  styleUrls: ['./config-recordatorios.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ConfigRecordatoriosPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
