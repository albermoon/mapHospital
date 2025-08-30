# 🔧 Solución para Google Apps Script que no guarda

## Problema Identificado

Tu aplicación no está guardando datos en Google Sheets a través del Google Apps Script. He implementado varias mejoras para solucionarlo:

## 🚨 **PROBLEMA PRINCIPAL: Falta función doGet()**

### ¿Por qué falla el GET?
Cuando haces una petición GET al Google Apps Script, **el script busca la función `doGet()`**. Si no existe, devuelve un error 404 o 500.

### Funciones Requeridas en Google Apps Script:

#### 1. **Para POST (Guardar datos):**
```javascript
function doPost(e) {
  // Tu código para guardar en Google Sheets
  // Esta función SÍ la tienes
}
```

#### 2. **Para GET (Leer datos):**
```javascript
function doGet(e) {
  // Tu código para leer desde Google Sheets
  // Esta función NO la tienes - ES EL PROBLEMA
}
```

## ✅ Cambios Implementados

### 1. Servicio Mejorado (`googleSheetsServiceSimple.js`)
- **Múltiples métodos de envío**: Fetch normal, JSONP y formulario HTML
- **Mejor manejo de errores**: Detección de problemas de CORS y conexión
- **Logging detallado**: Para identificar exactamente dónde falla
- **Detección específica de errores**: 404, 500, CORS, etc.

### 2. Hook Mejorado (`useGoogleSheetsSimple.js`)
- **Verificación de conexión**: Antes de intentar enviar datos
- **Estado de conexión**: Para mostrar el estado actual
- **Fallback local**: Si falla Google Sheets, guarda localmente

### 3. Interfaz de Usuario Mejorada
- **Barra de estado**: Muestra el estado de la conexión en tiempo real
- **Indicador de carga**: Muestra cuando se están guardando datos
- **Botón de reintento**: Para reconectar si hay problemas
- **Mensajes de error específicos**: Te dice exactamente qué está mal

## 🔧 **SOLUCIÓN INMEDIATA: Añadir función doGet()**

### Paso 1: Abrir tu Google Apps Script
1. Ve a [script.google.com](https://script.google.com)
2. Abre tu script existente

### Paso 2: Añadir la función doGet()
```javascript
function doGet(e) {
  try {
    // Obtener la hoja de cálculo
    const spreadsheet = SpreadsheetApp.openById("1d_azBDupYI4LilIVfNu8u2IeplCIGI6bpJVpHMV_j34");
    
    // Obtener la hoja de organizaciones
    const sheet = spreadsheet.getSheetByName("Organizaciones");
    
    // Obtener todos los datos
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    // Convertir a formato JSON
    const organizations = rows.map(row => {
      const org = {};
      headers.forEach((header, index) => {
        org[header] = row[index];
      });
      return org;
    });
    
    // Devolver respuesta JSON
    return ContentService
      .createTextOutput(JSON.stringify(organizations))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // En caso de error, devolver mensaje de error
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### Paso 3: Guardar y Publicar
1. **Guarda** el script (Ctrl+S)
2. **Publica** como web app:
   - Haz clic en "Implementar" > "Nueva implementación"
   - Tipo: "Aplicación web"
   - Ejecutar como: "Tu cuenta"
   - Acceso: "Cualquier persona (incluso anónimos)"
3. **Copia la nueva URL** y actualízala en tu código

## 🧪 Pasos para Probar

### Paso 1: Probar el Google Apps Script
1. Abre el archivo `test-google-script.html` en tu navegador
2. Haz clic en "🚀 Ejecutar Todas las Pruebas"
3. Revisa los resultados para identificar el problema

### Paso 2: Verificar la Consola del Navegador
1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Console"
3. Intenta añadir una organización
4. Revisa los mensajes de error

### Paso 3: Verificar el Estado de la Conexión
1. Mira la barra azul en la parte superior de la aplicación
2. Debería mostrar el estado de la conexión
3. Si hay errores, haz clic en "🔄 Reintentar"

## 🚨 Problemas Comunes y Soluciones

### Problema 1: Error 404 - Script no encontrado
**Síntoma**: Error 404 en la consola
**Causa**: La URL del script es incorrecta o no está publicado
**Solución**: 
- Verifica la URL del script
- Asegúrate de que esté publicado como web app

### Problema 2: Error 500 - Error interno del script
**Síntoma**: Error 500 en la consola
**Causa**: Falta la función `doGet()` o hay un error en el código
**Solución**: 
- Añade la función `doGet()` como se muestra arriba
- Revisa la sintaxis del código

### Problema 3: Error de CORS
**Síntoma**: Error de CORS en la consola
**Causa**: El script no permite acceso desde tu dominio
**Solución**: 
- El script ya implementa métodos alternativos (JSONP, formulario)
- Verifica que tu Google Apps Script esté publicado correctamente

### Problema 4: Script no responde
**Síntoma**: Timeout o error de conexión
**Causa**: El script no está publicado o no es accesible
**Solución**:
- Verifica que la URL del script sea correcta
- Asegúrate de que el script esté publicado como web app
- Revisa los permisos del script

### Problema 5: Datos no se guardan
**Síntoma**: No hay error pero los datos no aparecen en la hoja
**Causa**: Error en la función `doPost()` o estructura de datos incorrecta
**Solución**:
- Verifica la estructura de datos en tu Google Apps Script
- Asegúrate de que las columnas coincidan con el código
- Revisa los logs del Google Apps Script

## 📋 Verificación del Google Apps Script

### 1. Estructura de Datos Esperada
Tu script debe recibir estos campos:
```json
{
  "ID": "string",
  "Name": "string", 
  "Type": "Hospital" | "Association",
  "Address": "string",
  "Phone": "string",
  "Website": "string",
  "Email": "string",
  "Latitude": "number",
  "Longitude": "number",
  "Country": "string",
  "City": "string",
  "Specialty": "string"
}
```

### 2. Configuración del Script
- **Tipo**: Web App
- **Ejecutar como**: Tu cuenta
- **Acceso**: Cualquier persona (incluso anónimos)
- **URL**: Debe coincidir con la del código

### 3. Permisos Requeridos
- Google Sheets API habilitada
- Permisos de escritura en la hoja específica
- Script publicado y accesible públicamente

### 4. Funciones Requeridas
- **`doPost(e)`**: Para recibir y guardar datos ✅ (Ya la tienes)
- **`doGet(e)`**: Para devolver datos ❌ (FALTA - ES EL PROBLEMA)

## 🔍 Debugging Avanzado

### 1. Revisar Logs del Google Apps Script
1. Ve a [script.google.com](https://script.google.com)
2. Abre tu script
3. Ve a "Ejecuciones" para ver logs de errores

### 2. Probar con cURL
```bash
# Probar GET
curl "TU_URL_DEL_SCRIPT"

# Probar POST
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"Name":"Test","Type":"Hospital"}' \
  "TU_URL_DEL_SCRIPT"
```

### 3. Verificar en Google Sheets
1. Abre tu hoja de cálculo
2. Ve a "Herramientas" > "Editor de secuencias de comandos"
3. Revisa si hay errores en la consola

## 📱 Uso de la Aplicación Mejorada

### Indicadores Visuales
- **🟢 Barra verde**: Conexión exitosa (lectura y escritura)
- **🟡 Barra naranja**: Solo escritura disponible
- **🟡 Barra azul**: Verificando conexión
- **🔴 Barra roja**: Error de conexión

### Acciones Disponibles
- **🔄 Reintentar**: Reconectar con Google Apps Script
- **📊 Estado**: Ver información detallada de la conexión
- **⚠️ Alertas**: Notificaciones cuando falla el guardado

## 🆘 Si Nada Funciona

### Opción 1: Usar Solo Almacenamiento Local
- Los datos se guardarán en el navegador
- Se perderán al cerrar la pestaña
- Funciona offline

### Opción 2: Revisar el Google Apps Script
- Verifica la sintaxis del código
- Asegúrate de que esté publicado
- Revisa los permisos y configuraciones
- **AÑADE LA FUNCIÓN doGet()**

### Opción 3: Contactar Soporte
- Proporciona los logs de error
- Incluye la URL del script
- Menciona los pasos que ya probaste

## 📝 Notas Importantes

1. **Modo no-cors**: Ya no se usa, ahora detectamos errores reales
2. **Múltiples métodos**: Si uno falla, se prueba el siguiente
3. **Fallback automático**: Si Google Sheets falla, se guarda localmente
4. **Logging detallado**: Para identificar exactamente dónde está el problema
5. **Función doGet()**: ES OBLIGATORIA para que funcione el GET

## 🎯 Próximos Pasos

1. **AÑADE LA FUNCIÓN doGet()** a tu Google Apps Script
2. **Publica el script** como web app
3. **Prueba la aplicación mejorada**
4. **Usa el archivo de prueba HTML**
5. **Revisa la consola del navegador**
6. **Verifica el estado de la conexión**

## 🎯 **RESUMEN DEL PROBLEMA:**

**Tu Google Apps Script NO tiene la función `doGet()` que es necesaria para manejar peticiones GET. Por eso falla cuando intentas verificar la conexión.**

**SOLUCIÓN: Añade la función `doGet()` como se muestra arriba y el problema se resolverá.**

¡Con estas mejoras deberías poder identificar y solucionar el problema del Google Apps Script!
