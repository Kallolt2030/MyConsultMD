import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonInput, IonItem, IonSpinner, IonIcon, IonLabel } from '@ionic/angular';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    IonContent,
    IonButton, IonInput, IonItem, IonSpinner, IonIcon, IonLabel
  ]
})
export class LoginPage {
  email = '';
  password = '';
  cargando = false;
  error = '';

mostrarPassword = false;

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit() {
    this.error = '';
    if (!this.email || !this.password) {
      this.error = 'Completa todos los campos.';
      return;
    }

    try {
      this.cargando = true;
      await this.auth.login(this.email, this.password);
      this.router.navigateByUrl('/tabs', { replaceUrl: true });
    } catch (e: any) {
      this.error = e.message ?? 'Error al iniciar sesión.';
    } finally {
      this.cargando = false;
    }
  }
}