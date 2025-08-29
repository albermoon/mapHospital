// Configuración simplificada de Google Sheets usando solo API Key pública
// Esta configuración es más simple y evita el error 403

// OPCIÓN RECOMENDADA: Usar solo API Key pública
// Ve a https://console.cloud.google.com/ → Credenciales → Crear credenciales → Clave de API
export const GOOGLE_SHEETS_API_KEY = "TU_API_KEY_AQUI"

// ID de la hoja de cálculo (deberás crear una y reemplazar este ID)
export const SPREADSHEET_ID = "TU_SPREADSHEET_ID_AQUI"

// Nombres de las hojas
export const SHEET_NAMES = {
  ORGANIZATIONS: "Organizaciones",
  HOSPITALS: "Hospitales",
  ASSOCIATIONS: "Asociaciones"
}

// Configuración de las columnas
export const COLUMN_CONFIG = {
  ID: "A",
  NAME: "B", 
  TYPE: "C",
  DESCRIPTION: "D",
  ADDRESS: "E",
  PHONE: "F",
  WEBSITE: "G",
  EMAIL: "H",
  LATITUDE: "I",
  LONGITUDE: "J",
  COUNTRY: "K",
  CITY: "L",
  BEDS: "M",
  SPECIALTIES: "N"
}

/*
INSTRUCCIONES RÁPIDAS PARA SOLUCIONAR EL ERROR 403:

1. CREAR API KEY (5 minutos):
   - Ve a: https://console.cloud.google.com/
   - Crea un proyecto o selecciona uno existente
   - Habilita Google Sheets API
   - Ve a "Credenciales" → "Crear credenciales" → "Clave de API"
   - Copia la API key y reemplaza "TU_API_KEY_AQUI"

2. CREAR HOJA DE GOOGLE SHEETS:
   - Ve a: https://sheets.google.com/
   - Crea una nueva hoja
   - Copia el ID de la URL (la parte larga entre /d/ y /edit)
   - Reemplaza "TU_SPREADSHEET_ID_AQUI"

3. HACER LA HOJA PÚBLICA:
   - En tu hoja, haz clic en "Compartir" (botón azul)
   - Cambia a "Cualquier persona con el enlace puede ver"
   - Haz clic en "Listo"

4. REEMPLAZAR EN TU CÓDIGO:
   - Copia este archivo como googleSheets.js
   - Reemplaza los valores con tus datos reales

EJEMPLO:
export const GOOGLE_SHEETS_API_KEY = "AIzaSyB1234567890abcdefghijklmnopqrstuvwxyz"
export const SPREADSHEET_ID = "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"

NOTA: Esta configuración solo permite LECTURA. Para escritura necesitarás credenciales de servicio.
*/
