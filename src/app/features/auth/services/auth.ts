// src/app/features/auth/services/auth.service.ts
import { Injectable } from '@angular/core';
import * as bcrypt from 'bcryptjs';
import { Preferences } from '@capacitor/preferences';
import { DatabaseService } from '../../../core/services/database';
import { Usuario } from '../../../core/models/usuario';

const SESSION_KEY = 'myconsult_session';
const SALT_ROUNDS = 10;

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private db: DatabaseService) {}

  // ---------- REGISTER ----------
  async register(email: string, password: string): Promise<void> {
    const existe = await this.existeUsuario(email);
    if (existe) {
      throw new Error('Ya existe una cuenta con ese correo.');
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    await this.db.run(
      'INSERT INTO usuarios (email, password_hash) VALUES (?, ?)',
      [email.toLowerCase().trim(), hash]
    );

    // Login automático tras registro
    await this.setSession(email);
  }

  // ---------- LOGIN ----------
  async login(email: string, password: string): Promise<void> {
    const usuarios = await this.db.query<Usuario>(
      'SELECT * FROM usuarios WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (!usuarios.length) {
      throw new Error('No existe una cuenta con ese correo.');
    }

    const ok = await bcrypt.compare(password, usuarios[0].password_hash!);
    if (!ok) {
      throw new Error('Contraseña incorrecta.');
    }

    await this.setSession(usuarios[0].email);
  }

  // ---------- SESIÓN ----------
  async setSession(email: string): Promise<void> {
    await Preferences.set({ key: SESSION_KEY, value: email });
  }

  async getSession(): Promise<string | null> {
    const { value } = await Preferences.get({ key: SESSION_KEY });
    return value;
  }

  async isLoggedIn(): Promise<boolean> {
    return (await this.getSession()) !== null;
  }

  async logout(): Promise<void> {
    await Preferences.remove({ key: SESSION_KEY });
  }

  // ---------- UTILS ----------
  async existeUsuario(email: string): Promise<boolean> {
    const res = await this.db.query<Usuario>(
      'SELECT id FROM usuarios WHERE email = ?',
      [email.toLowerCase().trim()]
    );
    return res.length > 0;
  }

  async hayAlgunUsuario(): Promise<boolean> {
    const res = await this.db.query<{ total: number }>(
      'SELECT COUNT(*) as total FROM usuarios'
    );
    return (res[0]?.total ?? 0) > 0;
  }
}