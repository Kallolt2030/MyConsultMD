import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

import {
  Camera,
  CameraResultType,
  CameraSource
} from '@capacitor/camera';

import {
  Directory,
  Filesystem
} from '@capacitor/filesystem';

@Injectable({
  providedIn: 'root'
})
export class FotoPacienteService {

  private readonly carpeta = 'pacientes';

  /**
   * Selecciona una fotografía y la guarda en el almacenamiento privado.
   */
  async seleccionarFoto(
    pacienteId: number,
    origen: 'camara' | 'galeria'
  ): Promise<string> {

    const foto = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: origen === 'camara'
        ? CameraSource.Camera
        : CameraSource.Photos
    });

    if (!foto.webPath) {
      throw new Error('No se pudo obtener la ruta de la fotografía.');
    }

    // Leer la imagen obtenida por la cámara o galería.
    const respuesta = await fetch(foto.webPath);
    const archivo = await respuesta.blob();

    if (!archivo.size) {
      throw new Error('La fotografía está vacía.');
    }

    // Crear carpeta privada.
    await Filesystem.mkdir({
      path: this.carpeta,
      directory: Directory.Data,
      recursive: true
    }).catch(() => {
      // La carpeta puede existir previamente.
    });

    const extension = foto.format || 'jpeg';

    const nombreArchivo =
      `paciente-${pacienteId}-${Date.now()}.${extension}`;

    const ruta = `${this.carpeta}/${nombreArchivo}`;

    // Convertir la imagen a Base64 para guardarla en Filesystem.
    const base64 = await this.convertirABase64(archivo);

    await Filesystem.writeFile({
      path: ruta,
      data: base64,
      directory: Directory.Data
    });

    return ruta;
  }

  /**
   * Convierte un archivo Blob a Base64.
   */
  private convertirABase64(archivo: Blob): Promise<string> {

    return new Promise((resolve, reject) => {

      const lector = new FileReader();

      lector.onload = () => {
        const resultado = lector.result as string;
        const base64 = resultado.split(',')[1];

        if (!base64) {
          reject(new Error('No se pudo convertir la fotografía.'));
          return;
        }

        resolve(base64);
      };

      lector.onerror = () => {
        reject(new Error('Error al leer la fotografía.'));
      };

      lector.readAsDataURL(archivo);
    });
  }

  /**
   * Obtiene la URL para mostrar la fotografía.
   */
  async obtenerUrlFoto(ruta: string): Promise<string> {

    const resultado = await Filesystem.getUri({
      path: ruta,
      directory: Directory.Data
    });

    return Capacitor.convertFileSrc(resultado.uri);
  }

  /**
   * Elimina una fotografía.
   */
  async eliminarFoto(ruta: string): Promise<void> {

    if (!ruta) {
      return;
    }

    await Filesystem.deleteFile({
      path: ruta,
      directory: Directory.Data
    });
  }
}
