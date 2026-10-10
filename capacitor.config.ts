import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.myconsult.md',
  appName: 'MyConsult MD',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    CapacitorSQLite: {
      iosDatabaseLocation: 'Library/CapacitorDatabase',
      iosIsEncryption: false,      // cámbialo a true si quieres encriptar (requiere más setup)
      androidIsEncryption: false,  // idem
      androidBiometric: {
        biometricAuth: false,
        biometricTitle: "Biometric login for MyConsult MD"
      }
    }
  }
};

export default config;