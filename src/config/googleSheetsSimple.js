// Configuración para Google Sheets usando Google Apps Script
// Esta configuración usa tu script personalizado para escritura

// OPCIÓN RECOMENDADA: Usar solo API Key pública para lectura
// Ve a https://console.cloud.google.com/ → Credenciales → Crear credenciales → Clave de API
export const GOOGLE_SHEETS_API_KEY = "TU_API_KEY_AQUI"

// ID de la hoja de cálculo (ya configurado)
export const SPREADSHEET_ID = "1d_azBDupYI4LilIVfNu8u2IeplCIGI6bpJVpHMV_j34"

// Nombres de las hojas (deben coincidir con tu Google Apps Script)
export const SHEET_NAMES = {
  ORGANIZATIONS: "Organizaciones",
  HOSPITALS: "Hospitales",
  ASSOCIATIONS: "Asociaciones"
}

// Configuración de las columnas - NUEVA ESTRUCTURA
export const COLUMN_CONFIG = {
  ID: "A",
  NAME: "B", 
  TYPE: "C",
  ADDRESS: "D",
  PHONE: "E",
  WEBSITE: "F",
  EMAIL: "G",
  LATITUDE: "H",
  LONGITUDE: "I",
  COUNTRY: "J",
  CITY: "K",
  SPECIALTY: "L",
  STATUS: "M"
}

/*
🚀 CONFIGURACIÓN COMPLETA PARA TU APLICACIÓN:

1. CONFIGURAR API KEY PARA LECTURA (5 minutos):
   - Ve a: https://console.cloud.google.com/
   - Crea un proyecto o selecciona uno existente
   - Habilita Google Sheets API
   - Ve a "Credenciales" → "Crear credenciales" → "Clave de API"
   - Copia la API key y reemplaza "TU_API_KEY_AQUI"

2. TU GOOGLE APPS SCRIPT YA ESTÁ CONFIGURADO:
   - URL: https://script.google.com/macros/s/AKfycbyLkK9D8Tdh62PA5lECXKyfGuz889J2S4ktJRNd_wBVmWyTxBv69U4HITQTEPzVsSDUYw/exec
   - Spreadsheet ID: 1d_azBDupYI4LilIVfNu8u2IeplCIGI6bpJVpHMV_j34
   - Hojas: "Hospitales" y "Asociaciones"

3. HACER LA HOJA PÚBLICA PARA LECTURA:
   - En tu hoja, haz clic en "Compartir" (botón azul)
   - Cambia a "Cualquier persona con el enlace puede ver"
   - Haz clic en "Listo"

4. REEMPLAZAR EN TU CÓDIGO:
   - Solo necesitas reemplazar "TU_API_KEY_AQUI" con tu API key real

EJEMPLO:
export const GOOGLE_SHEETS_API_KEY = "AIzaSyB1234567890abcdefghijklmnopqrstuvwxyz"

✅ FUNCIONALIDAD:
- LECTURA: Usando API Key pública
- ESCRITURA: Usando tu Google Apps Script
- Los datos se guardan automáticamente en las hojas correctas según el tipo
- NUEVA ESTRUCTURA: ID, Name, Type, Description, Address, Phone, Website, Email, Latitude, Longitude, Country, City, Specialty, Status

📊 NUEVA ESTRUCTURA DE COLUMNAS:
A: ID | B: Name | C: Type | D: Description | E: Address | F: Phone | G: Website | H: Email | I: Latitude | J: Longitude | K: Country | L: City | M: Specialty | N: Status
*/
