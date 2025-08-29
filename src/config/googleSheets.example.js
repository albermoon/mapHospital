// ARCHIVO DE EJEMPLO - NO USAR EN PRODUCCIÓN
// Copia este archivo a googleSheets.js y configura tus credenciales

// Configuración de Google Sheets API
export const GOOGLE_SHEETS_CONFIG = {
  // OPCIÓN 1: Credenciales de servicio (recomendado para producción)
  type: "service_account",
  project_id: "TU_PROJECT_ID",
  private_key_id: "TU_PRIVATE_KEY_ID",
  private_key: "-----BEGIN PRIVATE KEY-----\nTU_PRIVATE_KEY_AQUI\n-----END PRIVATE KEY-----\n",
  client_email: "TU_SERVICE_ACCOUNT@TU_PROJECT.iam.gserviceaccount.com",
  client_id: "TU_CLIENT_ID",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/TU_SERVICE_ACCOUNT%40TU_PROJECT.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
}

// OPCIÓN 2: API Key pública (solo para lectura, más simple)
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
INSTRUCCIONES PARA SOLUCIONAR EL ERROR 403:

1. HACER LA HOJA PÚBLICA (MÁS SIMPLE):
   - Ve a tu hoja de Google Sheets
   - Haz clic en "Compartir" (botón azul en la esquina superior derecha)
   - Cambia de "Restringido" a "Cualquier persona con el enlace puede ver"
   - Copia el enlace y extrae el ID de la URL

2. CREAR UNA API KEY PÚBLICA:
   - Ve a Google Cloud Console: https://console.cloud.google.com/
   - Crea un proyecto o selecciona uno existente
   - Habilita Google Sheets API
   - Ve a "Credenciales" → "Crear credenciales" → "Clave de API"
   - Copia la API key y úsala en GOOGLE_SHEETS_API_KEY

3. USAR CREDENCIALES DE SERVICIO (MÁS SEGURO):
   - Ve a Google Cloud Console
   - Ve a "Credenciales" → "Crear credenciales" → "Cuenta de servicio"
   - Descarga el archivo JSON
   - Copia los valores al objeto GOOGLE_SHEETS_CONFIG
   - Comparte tu hoja con la cuenta de servicio (client_email)

4. VERIFICAR PERMISOS:
   - Asegúrate de que la hoja existe y el ID es correcto
   - Verifica que tienes permisos de lectura/escritura
   - Si usas credenciales de servicio, compártela con esa cuenta

NOTA: Para desarrollo, la opción 1 (hoja pública) es la más simple.
Para producción, considera usar credenciales de servicio.
*/

