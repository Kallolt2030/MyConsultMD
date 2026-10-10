import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { warningOutline, closeOutline, cloudOfflineOutline } from 'ionicons/icons';

@Component({
  selector: 'app-privacy-notice',
  templateUrl: './privacy-notice.component.html',
  standalone: true,
  imports: [
    CommonModule, IonModal, IonHeader, IonToolbar, IonTitle,
    IonContent, IonButton, IonIcon, IonButtons
  ]
})
export class PrivacyNoticeComponent {
    @Input() isOpen = false;

  @Output() cerrar = new EventEmitter<void>();
  @Output() aceptar = new EventEmitter<void>();

  constructor() {
    addIcons({ warningOutline, closeOutline, cloudOfflineOutline });
  }
}