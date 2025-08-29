# 🔧 SOLUCIÓN AL ERROR 403 DE GOOGLE SHEETS

## 🚨 Problema Identificado
El error 403 indica que no tienes permisos para acceder a la hoja de Google Sheets. Esto puede deberse a:

1. **La hoja no es pública**
2. **Las credenciales no tienen permisos**
3. **La API no está habilitada**
4. **El ID de la hoja es incorrecto**

## 🚀 SOLUCIONES DISPONIBLES

### ✅ SOLUCIÓN 1: Hacer la hoja pública (MÁS SIMPLE - 2 minutos)

1. **Ve a tu hoja de Google Sheets**
2. **Haz clic en "Compartir"** (botón azul en la esquina superior derecha)
3. **Cambia de "Restringido" a "Cualquier persona con el enlace puede ver"**
4. **Haz clic en "Listo"**
5. **Copia el enlace y extrae el ID** (la parte larga entre `/d/` y `/edit`)

**Ejemplo de URL:**
```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
```
**ID extraído:** `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

### ✅ SOLUCIÓN 2: Usar API Key pública (RECOMENDADO - 5 minutos)

1. **Ve a [Google Cloud Console](https://console.cloud.google.com/)**
2. **Crea un proyecto o selecciona uno existente**
3. **Habilita Google Sheets API:**
   - Ve a "APIs y servicios" → "Biblioteca"
   - Busca "Google Sheets API"
   - Haz clic en "Habilitar"
4. **Crea una API Key:**
   - Ve a "APIs y servicios" → "Credenciales"
   - Haz clic en "Crear credenciales" → "Clave de API"
   - Copia la API key generada
5. **Configura en tu código:**
   ```javascript
   export const GOOGLE_SHEETS_API_KEY = "TU_API_KEY_AQUI"
   export const SPREADSHEET_ID = "TU_SPREADSHEET_ID_AQUI"
   ```

### ✅ SOLUCIÓN 3: Credenciales de servicio (MÁS SEGURO - 10 minutos)

1. **Ve a [Google Cloud Console](https://console.cloud.google.com/)**
2. **Crea una cuenta de servicio:**
   - Ve a "IAM y administración" → "Cuentas de servicio"
   - Haz clic en "Crear cuenta de servicio"
   - Dale un nombre y descripción
   - Haz clic en "Crear y continuar"
3. **Asigna permisos:**
   - Selecciona "Editor" o "Lector" según necesites
   - Haz clic en "Continuar" y luego "Listo"
4. **Crea y descarga la clave:**
   - Haz clic en la cuenta de servicio creada
   - Ve a la pestaña "Claves"
   - Haz clic en "Agregar clave" → "Crear nueva clave"
   - Selecciona "JSON" y descarga el archivo
5. **Configura en tu código:**
   ```javascript
   export const GOOGLE_SHEETS_CONFIG = {
     type: "service_account",
     project_id: "TU_PROJECT_ID",
     private_key_id: "TU_PRIVATE_KEY_ID",
     private_key: "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     client_email: "TU_SERVICE_ACCOUNT@TU_PROJECT.iam.gserviceaccount.com",
     // ... resto de configuración
   }
   ```
6. **Comparte tu hoja con la cuenta de servicio:**
   - En tu hoja, haz clic en "Compartir"
   - Añade el email de la cuenta de servicio (client_email)
   - Dale permisos de "Editor" o "Lector"

## 📁 ARCHIVOS DE CONFIGURACIÓN

### Para SOLUCIÓN 1 (Hoja pública):
- Usa `src/config/googleSheetsSimple.js`
- Solo necesitas el `SPREADSHEET_ID`

### Para SOLUCIÓN 2 (API Key):
- Usa `src/config/googleSheetsSimple.js`
- Necesitas `GOOGLE_SHEETS_API_KEY` y `SPREADSHEET_ID`

### Para SOLUCIÓN 3 (Credenciales de servicio):
- Usa `src/config/googleSheets.js`
- Necesitas todo el objeto `GOOGLE_SHEETS_CONFIG`

## 🔄 PASOS PARA IMPLEMENTAR

1. **Elige una solución** de las tres disponibles
2. **Sigue las instrucciones** paso a paso
3. **Configura tu archivo** correspondiente
4. **Reinicia tu aplicación**
5. **Prueba la conexión** con el botón "Probar Conexión"

## 🧪 VERIFICACIÓN

Para verificar que funciona:

1. **Abre la consola del navegador** (F12)
2. **Busca mensajes de éxito** como:
   - "Conexión exitosa con Google Sheets"
   - "Organizaciones cargadas exitosamente"
3. **Verifica que no hay errores 403**
4. **Los datos se cargan** desde Google Sheets

## 🆘 SI SIGUE DANDO ERROR

1. **Verifica que la hoja existe** y el ID es correcto
2. **Confirma que tienes permisos** de acceso
3. **Revisa la consola** para mensajes de error específicos
4. **Usa la SOLUCIÓN 1** (hoja pública) que es la más simple
5. **Verifica que Google Sheets API esté habilitada** en tu proyecto

## 📞 SOPORTE

Si ninguna solución funciona:

1. **Revisa los logs** en la consola del navegador
2. **Verifica la configuración** paso a paso
3. **Prueba con una hoja nueva** y simple
4. **Usa datos de ejemplo** temporalmente mientras resuelves el problema

---

**💡 RECOMENDACIÓN:** Empieza con la **SOLUCIÓN 1** (hoja pública) que es la más simple y rápida de implementar.
