# 🚀 Configuración de Google Apps Script para tu Aplicación

## ✅ **Lo que ya tienes configurado:**

- **Google Apps Script**: https://script.google.com/macros/s/AKfycbyLkK9D8Tdh62PA5lECXKyfGuz889J2S4ktJRNd_wBVmWyTxBv69U4HITQTEPzVsSDUYw/exec
- **Spreadsheet ID**: `1d_azBDupYI4LilIVfNu8u2IeplCIGI6bpJVpHMV_j34`
- **Hojas configuradas**: "Hospitales" y "Asociaciones"

## 🔧 **Paso 1: Configurar API Key para lectura (5 minutos)**

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo o selecciona uno existente
3. Habilita la **Google Sheets API**:
   - Ve a "APIs y servicios" → "Biblioteca"
   - Busca "Google Sheets API"
   - Haz clic en "Habilitar"
4. Crea una **API Key**:
   - Ve a "APIs y servicios" → "Credenciales"
   - Haz clic en "Crear credenciales" → "Clave de API"
   - Copia la API key generada

## 📝 **Paso 2: Actualizar tu código**

1. **Copia el archivo de configuración**:
   ```bash
   cp src/config/googleSheets.js src/config/googleSheetsWorking.js
   ```

2. **Edita `src/config/googleSheetsWorking.js`**:
   - Reemplaza `"TU_API_KEY_AQUI"` con tu API key real
   - Ejemplo: `"AIzaSyB1234567890abcdefghijklmnopqrstuvwxyz"`

3. **Actualiza el import en tu aplicación**:
   - Cambia `googleSheetsSimple.js` por `googleSheetsWorking.js` donde sea necesario

## 🌐 **Paso 3: Hacer la hoja pública para lectura**

1. Ve a tu [Google Sheets](https://sheets.google.com/)
2. Abre la hoja con ID: `1d_azBDupYI4LilIVfNu8u2IeplCIGI6bpJVpHMV_j34`
3. Haz clic en **"Compartir"** (botón azul)
4. Cambia a **"Cualquier persona con el enlace puede ver"**
5. Haz clic en **"Listo"**

## 🧪 **Paso 4: Probar la funcionalidad**

1. **Ejecuta tu aplicación**
2. **Añade una nueva organización**:
   - Haz clic en el botón ➕
   - Rellena el formulario
   - Selecciona ubicación en el mapa
   - Haz clic en "Añadir Organización"

3. **Verifica en Google Sheets**:
   - Los datos deberían aparecer en la hoja correcta según el tipo
   - Hospitales → hoja "Hospitales"
   - Asociaciones → hoja "Asociaciones"

## 🔍 **Cómo funciona:**

- **LECTURA**: Tu aplicación lee datos usando la API Key pública
- **ESCRITURA**: Tu aplicación envía datos a tu Google Apps Script
- **El script** guarda automáticamente en la hoja correcta según el tipo

## 🚨 **Solución de problemas:**

### Error 403 (Acceso denegado):
- Verifica que la API Key sea correcta
- Asegúrate de que Google Sheets API esté habilitada
- Verifica que la hoja sea pública

### Error de CORS:
- El modo `no-cors` está configurado para evitar problemas
- Los datos se envían pero no puedes leer la respuesta (esto es normal)

### Datos no aparecen en Google Sheets:
- Verifica que el Google Apps Script esté desplegado
- Revisa los logs del script en [script.google.com](https://script.google.com)

## 📱 **Estructura de datos enviados:**

```javascript
{
  ID: "1",
  Name: "Hospital General",
  Type: "Hospital", // o "Association"
  Address: "Calle Principal 123",
  Phone: "+34 91 123 45 67",
  Website: "https://hospital.com",
  Email: "info@hospital.com",
  Latitude: "40.4168",
  Longitude: "-3.7038",
  Country: "España",
  City: "Madrid",
  Specialty: "Cardiología"
  // Status se establece automáticamente como 0
}
```

## 📊 **NUEVA ESTRUCTURA DE COLUMNAS:**

| Columna | Campo | Descripción |
|---------|-------|-------------|
| A | ID | Identificador único |
| B | Name | Nombre de la organización |
| C | Type | Tipo (Hospital/Association) |
| D | Address | Dirección |
| E | Phone | Teléfono |
| F | Website | Sitio web |
| G | Email | Correo electrónico |
| H | Latitude | Latitud |
| I | Longitude | Longitud |
| J | Country | País |
| K | City | Ciudad |
| L | Specialty | Especialidad |
| M | Status | Estado (0 por defecto) |

## 🎯 **Resultado final:**

✅ **Tu aplicación ahora puede:**
- Leer organizaciones existentes desde Google Sheets
- Añadir nuevas organizaciones que se guardan automáticamente
- Los datos se organizan en hojas separadas por tipo
- Todo funciona sin autenticación compleja

¡Tu aplicación está completamente integrada con Google Sheets! 🎉
