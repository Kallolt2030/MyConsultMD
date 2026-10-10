// src/app/core/services/database.service.ts
import { Injectable } from '@angular/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection
} from '@capacitor-community/sqlite';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private sqlite = new SQLiteConnection(CapacitorSQLite);
  private db: SQLiteDBConnection | null = null;
  private readonly DB_NAME = 'myconsult_db';

  async initializeDatabase(): Promise<void> {
    // 1. Verificar si la conexión ya existe
    const isConn = (await this.sqlite.isConnection(this.DB_NAME, false)).result;

    if (isConn) {
      this.db = await this.sqlite.retrieveConnection(this.DB_NAME, false);
    } else {
      // 2. Crear la conexión (sin encriptación por ahora)
      this.db = await this.sqlite.createConnection(
        this.DB_NAME,
        false,           // no encriptada
        'no-encryption',
        1,               // versión del schema
        false            // readOnly
      );
    }

    // 3. Abrir la base de datos
    await this.db.open();

    // 4. Crear las tablas si no existen
    await this.createTables();
  }

  private async createTables(): Promise<void> {
    const queries = `
        -- Usuarios (autenticación local)
        CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        fecha_registro TEXT DEFAULT CURRENT_TIMESTAMP
        );


      -- Consultorio (configuración inicial)
      CREATE TABLE IF NOT EXISTS consultorio (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        profesional TEXT NOT NULL,
        especialidad TEXT,
        tipo_establecimiento TEXT,
        hora_inicio TEXT,
        hora_cierre TEXT,
        dias_laborales TEXT
      );

      -- Pacientes
      CREATE TABLE IF NOT EXISTS pacientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        telefono TEXT,
        telegram TEXT,
        fecha_registro TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- Citas
      CREATE TABLE IF NOT EXISTS citas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        paciente_id INTEGER NOT NULL,
        fecha TEXT NOT NULL,
        hora TEXT NOT NULL,
        tipo TEXT,
        procedimiento TEXT,
        notas TEXT,
        estado TEXT DEFAULT 'pendiente',
        recordatorio_estado TEXT DEFAULT 'pendiente',
        FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
      );
    `;
    await this.db!.execute(queries);
  }

  // --- Helpers genéricos ---
  async run(query: string, values: any[] = []): Promise<any> {
    return this.db!.run(query, values);
  }

  async query<T>(query: string, values: any[] = []): Promise<T[]> {
    const res = await this.db!.query(query, values);
    return (res.values as T[]) ?? [];
  }

  async execute(query: string): Promise<void> {
    await this.db!.execute(query);
  }
}