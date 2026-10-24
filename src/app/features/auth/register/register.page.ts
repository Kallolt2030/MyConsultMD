import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonCheckbox, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonSpinner, IonTitle, IonToolbar } from '@ionic/angular';
import { AuthService } from '../services/auth';
import { Router, RouterLink } from '@angular/router';
import { PrivacyNoticeComponent } from '../../../shared/components/privacy-notice/privacy-notice.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  imports: [CommonModule, FormsModule, RouterLink,
    IonContent, IonButton,
    IonInput, IonItem, IonSpinner,
    PrivacyNoticeComponent, IonLabel, IonIcon,IonCheckbox],
})
export class RegisterPage {
  email = '';
  password = '';
  confirmPassword = '';
  aceptaPrivacidad = false;
  cargando = false;
  error = '';
  mostrarPrivacidad = false;
  avisoConsultado = false;


mostrarPassword = false;
mostrarConfirmPassword = false;

aceptarAvisoPrivacidad(): void {
  this.aceptaPrivacidad = true;
  this.mostrarPrivacidad = false;
}

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit() {
    this.error = '';

    if (!this.email || !this.password || !this.confirmPassword) {
      this.error = 'Completa todos los campos.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }
    if (!this.aceptaPrivacidad) {
      this.error = 'Debes aceptar el aviso de privacidad.';
      return;
    }

    

    try {
      this.cargando = true;
      await this.auth.register(this.email, this.password);
      this.router.navigateByUrl('/setup', { replaceUrl: true });
    } catch (e: any) {
      this.error = e.message ?? 'Error al registrar.';
    } finally {
      this.cargando = false;
    }
  }

  abrirAvisoPrivacidad(): void {
  this.mostrarPrivacidad = true;
  this.avisoConsultado = true;
}

cerrarAvisoPrivacidad(): void {
  this.mostrarPrivacidad = false;

  // Al cerrar el aviso, se habilita la aceptación.
  if (this.avisoConsultado) {
    this.aceptaPrivacidad = true;
  }
}

cambioAceptacionPrivacidad(event: CustomEvent): void {
  this.aceptaPrivacidad = event.detail.checked;
}
}
