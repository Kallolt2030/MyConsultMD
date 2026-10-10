import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-editar-cita',
  templateUrl: './editar-cita.page.html',
  styleUrls: ['./editar-cita.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class EditarCitaPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
