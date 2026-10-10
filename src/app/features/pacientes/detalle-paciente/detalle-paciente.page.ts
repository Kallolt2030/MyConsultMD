import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-detalle-paciente',
  templateUrl: './detalle-paciente.page.html',
  styleUrls: ['./detalle-paciente.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class DetallePacientePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
