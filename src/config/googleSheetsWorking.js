// CONFIGURACIÓN FUNCIONAL DE GOOGLE SHEETS
// Copia este archivo como googleSheets.js para usar inmediatamente

// OPCIÓN 1: Solo API Key (RECOMENDADO para desarrollo)
// Ve a https://console.cloud.google.com/ → Credenciales → Crear credenciales → Clave de API
export const GOOGLE_SHEETS_API_KEY = "TU_API_KEY_AQUI"

// OPCIÓN 2: Credenciales de servicio (para producción)
export const GOOGLE_SHEETS_CONFIG = {
  type: "service_account",
  project_id: "obrasdev",
  private_key_id: "8826348cbda04d6d8712f465963afac006920e6c",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCz0d5cfXTb489p\nbZQpzvgbDvJDQccTNrWqi9FajiD5iNyVAM7O6a96QoqeICdn7kLmKo7uZqfMiWtW\nUOZ8Y01f+NqmzGa0d3q7hmVAuPVIiz0DB1zXXmsy37KGaky2BMujATlqv0NrX2Cy\nujmgXHlGhndeMAktLr77CY9ZFcHKjbHzO2ZwputTzXS5SL+btBxUIeNi2cAKIDvM\nr8QS9H9I6kJeOmp1JylLRg/v5wkEj3hgGM95EfoETixgsiGVuNJq7RgjQtPelXvI\nspF+R3+15Z26YiUC/OE2YyfdeIyj6i+L+V4GAcvEPE46xbMhiRlUbZQ2ijDM360o\nueObZs3xAgMBAAECggEAChs2J3XtnBuA9r3v4SxUCWvySxFmrOUa72Di/UyWUdqn\n+xU2ilkxQZUn0UdMBQKrw9/fH0r/DKHUjzSwyjY9N7L20app7flLw+pZGnrKs68P\nrhyQfTzomCK2bT41iC1bfJJ/CvQrnTHub10ZYV070QORsJDRPeGDXlHlOpkxxmkk\nHNw5rVINqpczg2Te3MN3nPQVXWZVNvttwSYHAcpUfe9t8hAg25Ylp4FORj/RxqMI\n7rsOf9kche2tPlt2tGPB4aJ8ie9pF1Ajth3YHySq3e+KegObj/qjYE+MbbWaZUIQ\n7uFyVGgvWYz2d6P7ZYowydUfLiHkZ6LHsCTyNa4wIQKBgQDnuXd6lcSvz4/5H75u\nR4mMD3H6Et0V4KEjTJxmguwKqFvXbSJgZXk3LTml76fpR0MLej60gHI2XXwhDFeu\nTrMs+CCCX7b3G9Hlmp3+EdEIwNSl4e6iPY4kJqFX4dYdDOpNy8eGZTZbczqhsa0E\nai798cS/Vyb8VXM8CDf5gfC9tQKBgQDGqGOxXZzwjGGSB+IaubWWlkHvyfYWudTD\nkyJp2qHCCMTSuIOQl1MLEdePs73BXrgXVW1RfaHS0tMfBPqaNXmyO5a7W8KDMQxO\ntsCxeQLP7LKaDGL/rB6rnrp8igTvvQ4ALFwzbXdbn4W6HbUVSdhYuypQOLFhfYzU\nouVe6ZHUzQKBgEbo+4X4xNqkIsOykhy/KXlB1LgZA6zJM6ZQsF+yWrccNBalX+qt\nwr0+yrBbuT9qvjqJ6xxjXhAC5ZRbaY1+qdfuCky7K4tM6RthCE4Sd6w9DhXBILxn\nJ9MqOx9gjZwQMrchz+nxmQO9LEkEzRRXxg+R54pCCj0XjQ7m2PIycFAtAoGAJHf/\nLS1RRTuQId2+nUdgVY+p9RovSga9T1XwaFxRe6xebYyf4mhVP1/8IY5OlHQN+YKe\nOeqFTY2UYkposuyENbsItcZnk+vqJX0ZLLtZT9BVDUCe3+66Bqlx9LDlrRkYu+Fo\n36wF0FUdmIghmRHgXJGnd+igb5Q7yUFKOD1KnzUCgYAU31jNcelH31/Z+QFzeNaE\nmXepGYDVPvZbWwsfb7tvkV4TfOqs1PeZdi3dDU6+dmjjNnYliDstEz5+F6o0jpJD\nHEjG2WisCaOWtGFIKvi6sxLRvfVf+AU4iADmt7HhxK4F8zBAr3eNN8rTSQ0CSWn0\nnmrcvP7nGBQS+e09JLTsEg==\n-----END PRIVATE KEY-----\n",
  client_email: "heart-disease@obrasdev.iam.gserviceaccount.com",
  client_id: "110048115385749092066",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/heart-disease%40obrasdev.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
}

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
🚀 INSTRUCCIONES RÁPIDAS PARA SOLUCIONAR EL ERROR 403:

PASO 1: Crear hoja de Google Sheets
- Ve a https://sheets.google.com/
- Crea una nueva hoja
- Copia el ID de la URL (parte entre /d/ y /edit)
- Reemplaza "TU_SPREADSHEET_ID_AQUI" con ese ID

PASO 2: Hacer la hoja pública
- En tu hoja, haz clic en "Compartir" (botón azul)
- Cambia a "Cualquier persona con el enlace puede ver"
- Haz clic en "Listo"

PASO 3: Configurar API Key (opcional pero recomendado)
- Ve a https://console.cloud.google.com/
- Habilita Google Sheets API
- Crea una API Key
- Reemplaza "TU_API_KEY_AQUI" con tu API key

PASO 4: Probar
- Reinicia tu aplicación
- Haz clic en "Probar Conexión"
- Deberías ver "✅ Conectado a Google Sheets"

💡 TIP: Si solo quieres hacer la hoja pública, puedes saltarte el PASO 3.
   La aplicación funcionará con datos de ejemplo hasta que configures todo.

📖 Para instrucciones detalladas, lee: SOLUCION_ERROR_403.md
*/
