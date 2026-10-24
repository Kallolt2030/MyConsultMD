
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

  private inicializacion: Promise<void> | null = null;

  async initializeDatabase(): Promise<void> {
    if (this.inicializacion) {
      return this.inicializacion;
    }

    if (this.db && await this.estaAbierta(this.db)) {
      return;
    }

    this.inicializacion = this.crearConexion();

    try {
      await this.inicializacion;
    } catch (error) {
      this.db = null;
      console.error('[SQLite] Error al inicializar:', error);
      throw error;
    } finally {
      this.inicializacion = null;
    }
  }

  private async estaAbierta(
  conexion: SQLiteDBConnection
): Promise<boolean> {
  const estado = await conexion.isDBOpen();
  return estado.result ?? false;
}

  private async crearConexion(): Promise<void> {
    console.log('[SQLite] Buscando conexión...');

    const existe = (
      await this.sqlite.isConnection(this.DB_NAME, false)
    ).result;

    let conexion: SQLiteDBConnection;

    if (existe) {
      conexion = await this.sqlite.retrieveConnection(
        this.DB_NAME,
        false
      );
    } else {
      conexion = await this.sqlite.createConnection(
        this.DB_NAME,
        false,
        'no-encryption',
        1,
        false
      );
    }

    this.db = conexion;

    const abiertaAntes = await this.estaAbierta(conexion);

    console.log('[SQLite] Estado antes de abrir:', abiertaAntes);

    if (!abiertaAntes) {
      console.log('[SQLite] Ejecutando open()...');
      await conexion.open();
    }

    const abiertaDespues = await this.estaAbierta(conexion);

    console.log('[SQLite] Estado después de abrir:', abiertaDespues);

    if (!abiertaDespues) {
      throw new Error(
        `No se pudo abrir la base de datos ${this.DB_NAME}.`
      );
    }

    await this.createTables(conexion);

    console.log('[SQLite] Base de datos inicializada correctamente.');
  }

  private async createTables(
    conexion: SQLiteDBConnection
  ): Promise<void> {
    const tablas = [
      `CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        fecha_registro TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS consultorio (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        profesional TEXT NOT NULL,
        especialidad TEXT,
        tipo_establecimiento TEXT,
        hora_inicio TEXT,
        hora_cierre TEXT,
        dias_laborales TEXT
      )`,

      `CREATE TABLE IF NOT EXISTS pacientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        telefono TEXT,
        telegram TEXT,
        fecha_registro TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS citas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        paciente_id INTEGER NOT NULL,
        fecha TEXT NOT NULL,
        hora TEXT NOT NULL,
        tipo TEXT,
        procedimiento TEXT,
        notas TEXT,
        estado TEXT DEFAULT 'pendiente',
        recordatorio_estado TEXT DEFAULT 'pendiente',
        FOREIGN KEY (paciente_id)
          REFERENCES pacientes(id) ON DELETE CASCADE
      )`
    ];

    for (const sql of tablas) {
      if (!(await this.estaAbierta(conexion))) {
        throw new Error(
          'SQLite se cerró durante la creación de las tablas.'
        );
      }

      await conexion.execute(sql);
    }

    console.log('[SQLite] Tablas verificadas correctamente.');
  }

  private async asegurarInicializada(): Promise<SQLiteDBConnection> {
    await this.initializeDatabase();

    const conexion = this.db;

    if (!conexion || !(await this.estaAbierta(conexion))) {
      throw new Error(
        'SQLite no está abierta después de inicializarse.'
      );
    }

    return conexion;
  }

  async run(
    query: string,
    values: any[] = []
  ): Promise<any> {
    const conexion = await this.asegurarInicializada();
    return conexion.run(query, values);
  }

  async query<T>(
    query: string,
    values: any[] = []
  ): Promise<T[]> {
    const conexion = await this.asegurarInicializada();
    const resultado = await conexion.query(query, values);

    return (resultado.values as T[]) ?? [];
  }

  async execute(query: string): Promise<void> {
    const conexion = await this.asegurarInicializada();
    await conexion.execute(query);
  }
}
