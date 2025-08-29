# 🔗 Configuración de Google Sheets para MapHospital

Este documento te guiará paso a paso para configurar la integración con Google Sheets API.

## 📋 Prerrequisitos

- Tener una cuenta de Google
- Acceso a Google Cloud Console
- Proyecto creado en Google Cloud

## 🚀 Pasos para la Configuración

### 1. Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google Sheets:
   - Ve a "APIs y servicios" > "Biblioteca"
   - Busca "Google Sheets API"
   - Haz clic en "Habilitar"

### 2. Crear Cuenta de Servicio

1. Ve a "APIs y servicios" > "Credenciales"
2. Haz clic en "Crear credenciales" > "Cuenta de servicio"
3. Completa la información:
   - **Nombre**: `maphospital-service`
   - **Descripción**: `Cuenta de servicio para MapHospital`
4. Haz clic en "Crear y continuar"
5. En "Otorgar acceso a esta cuenta de servicio":
   - Selecciona "Editor" como rol
   - Haz clic en "Continuar"
6. Haz clic en "Listo"

### 3. Generar Clave JSON

1. En la lista de cuentas de servicio, haz clic en la que acabas de crear
2. Ve a la pestaña "Claves"
3. Haz clic en "Agregar clave" > "Crear nueva clave"
4. Selecciona "JSON" y haz clic en "Crear"
5. Se descargará un archivo JSON con las credenciales

### 4. Crear Hoja de Cálculo en Google Sheets

1. Ve a [Google Sheets](https://sheets.google.com/)
2. Crea una nueva hoja de cálculo
3. Nómbrala como "MapHospital - Organizaciones"
4. Crea las siguientes hojas:
   - **Organizaciones** (hoja principal)
   - **Hospitales** (opcional)
   - **Asociaciones** (opcional)

### 5. Configurar Encabezados

En la hoja "Organizaciones", añade estos encabezados en la primera fila:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ID | Nombre | Tipo | Descripción | Dirección | Teléfono | Sitio Web | Email | Latitud | Longitud | País | Ciudad | Camas | Especialidades |

### 6. Compartir la Hoja

1. Haz clic en "Compartir" (esquina superior derecha)
2. Añade la cuenta de servicio: `heart-disease@obrasdev.iam.gserviceaccount.com`
3. Dale permisos de "Editor"
4. Haz clic en "Enviar"

### 7. Obtener ID de la Hoja

1. En la URL de tu hoja, copia el ID:
   ```
   https://docs.google.com/spreadsheets/d/TU_ID_AQUI/edit#gid=0
   ```
2. El ID es la parte entre `/d/` y `/edit`

### 8. Actualizar Configuración

1. Abre el archivo `src/config/googleSheets.js`
2. Reemplaza `TU_SPREADSHEET_ID_AQUI` con el ID real de tu hoja:

```javascript
export const SPREADSHEET_ID = "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
```

## 🔧 Verificación de la Configuración

1. Ejecuta la aplicación: `npm run dev`
2. Haz clic en "🔽 Mostrar Estado de Google Sheets"
3. Haz clic en "🧪 Probar Conexión"
4. Si todo está bien, verás "✅ Conectado"

## 📊 Estructura de Datos

### Formato de las Organizaciones

Cada organización se almacena en una fila con estos campos:

- **ID**: Identificador único (número)
- **Nombre**: Nombre de la organización
- **Tipo**: `hospital` o `association`
- **Descripción**: Descripción breve
- **Dirección**: Dirección completa
- **Teléfono**: Número de teléfono (opcional)
- **Sitio Web**: URL del sitio web (opcional)
- **Email**: Dirección de email (opcional)
- **Latitud**: Coordenada de latitud
- **Longitud**: Coordenada de longitud
- **País**: País donde se encuentra
- **Ciudad**: Ciudad donde se encuentra
- **Camas**: Número de camas (solo hospitales)
- **Especialidades**: Lista separada por comas (solo hospitales)

### Ejemplo de Datos

```
1 | Hospital Universitario La Paz | hospital | Centro hospitalario de referencia | Paseo de la Castellana 261 | +34 91 207 10 00 | https://www.hospitaldelapaz.es | informacion@salud.madrid.org | 40.4531 | -3.6883 | Spain | Madrid | 1300 | Pediatría, Cardiología, Neurología, Oncología
```

## 🚨 Solución de Problemas

### Error: "No se pudieron obtener las organizaciones"

- Verifica que la API de Google Sheets esté habilitada
- Confirma que la cuenta de servicio tenga permisos de "Editor"
- Revisa que el ID de la hoja sea correcto

### Error: "No se pudo añadir la organización"

- Verifica que la hoja "Organizaciones" exista
- Confirma que los encabezados estén en la primera fila
- Revisa que la cuenta de servicio tenga permisos de escritura

### Error de Autenticación

- Verifica que el archivo de credenciales esté correcto
- Confirma que la cuenta de servicio esté activa
- Revisa que el proyecto tenga facturación habilitada (si es necesario)

## 🔒 Seguridad

- **NUNCA** subas las credenciales a un repositorio público
- Usa variables de entorno en producción
- Considera usar Google Cloud Secret Manager para mayor seguridad
- Revisa regularmente los permisos de la cuenta de servicio

## 📱 Funcionalidades Disponibles

- ✅ Cargar organizaciones desde Google Sheets
- ✅ Añadir nuevas organizaciones
- ✅ Actualizar organizaciones existentes
- ✅ Eliminar organizaciones
- ✅ Sincronización automática
- ✅ Estado de conexión en tiempo real
- ✅ Fallback a datos locales si no hay conexión

## 🎯 Próximos Pasos

Una vez configurado, podrás:

1. **Sincronizar datos existentes**: Usa el botón "📊 Sincronizar con Datos Locales"
2. **Añadir nuevas organizaciones**: Usa el formulario en el mapa
3. **Editar organizaciones**: Modifica directamente en Google Sheets
4. **Compartir datos**: Comparte la hoja con tu equipo

## 📞 Soporte

Si tienes problemas con la configuración:

1. Revisa la consola del navegador para errores
2. Verifica que todos los pasos se hayan seguido correctamente
3. Confirma que las credenciales sean válidas
4. Revisa los permisos de la cuenta de servicio

¡Con esta configuración, tu aplicación MapHospital estará completamente integrada con Google Sheets! 🎉

