# 🔧 Solución al Error "process is not defined"

Este documento explica cómo resolver el error `Uncaught ReferenceError: process is not defined` que puede ocurrir al usar Google APIs en el navegador.

## 🚨 El Problema

El error `process is not defined` ocurre porque:

1. **Google APIs** están diseñadas para funcionar en Node.js
2. **Node.js** tiene variables globales como `process`, `Buffer`, `global`
3. **El navegador** no tiene estas variables globales por defecto
4. **Vite** necesita configuración especial para manejar polyfills

## ✅ Solución Implementada

He implementado una solución completa que incluye:

### 1. **Configuración de Vite** (`vite.config.js`)
```javascript
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  resolve: {
    alias: {
      process: 'process/browser',
      stream: 'stream-browserify',
      util: 'util',
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    include: ['buffer', 'process'],
  },
})
```

### 2. **Polyfills** (`src/polyfills.js`)
```javascript
import { Buffer } from 'buffer'
import process from 'process'

// Hacer disponibles globalmente
window.Buffer = Buffer
window.process = process
window.global = window
```

### 3. **Importación de Polyfills** (`src/main.jsx`)
```javascript
// Importar polyfills primero
import './polyfills.js'
// ... resto de imports
```

## 🛠️ Dependencias Instaladas

```bash
npm install process buffer stream-browserify util
```

## 🔍 Verificación de la Solución

### 1. **Reinicia el servidor de desarrollo**
```bash
npm run dev
```

### 2. **Verifica la consola del navegador**
- No deberías ver el error `process is not defined`
- Deberías ver logs de inicialización de polyfills

### 3. **Prueba la conexión con Google Sheets**
- Haz clic en "🔽 Mostrar Estado de Google Sheets"
- Haz clic en "🧪 Probar Conexión"

## 🚨 Si el Error Persiste

### Opción 1: Verificar que los polyfills se cargan
En la consola del navegador, escribe:
```javascript
console.log('process:', typeof process)
console.log('Buffer:', typeof Buffer)
console.log('global:', typeof global)
```

Deberías ver:
```
process: object
Buffer: function
global: object
```

### Opción 2: Verificar el orden de importación
Asegúrate de que `polyfills.js` se importe **ANTES** de cualquier otro código:
```javascript
// ✅ CORRECTO
import './polyfills.js'
import React from 'react'
// ...

// ❌ INCORRECTO
import React from 'react'
import './polyfills.js'
// ...
```

### Opción 3: Verificar la configuración de Vite
Asegúrate de que `vite.config.js` tenga la configuración correcta y reinicia el servidor.

## 🔧 Configuración Alternativa

Si sigues teniendo problemas, puedes usar esta configuración más agresiva en `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': {},
    'process.platform': '"browser"',
    'process.version': '"v16.0.0"',
  },
  resolve: {
    alias: {
      process: 'process/browser',
      stream: 'stream-browserify',
      util: 'util',
      buffer: 'buffer',
      crypto: 'crypto-browserify',
    },
  },
  optimizeDeps: {
    include: ['buffer', 'process', 'crypto-browserify'],
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
})
```

Y instalar dependencias adicionales:
```bash
npm install crypto-browserify
```

## 📱 Compatibilidad del Navegador

Esta solución es compatible con:
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## 🎯 Próximos Pasos

Una vez resuelto el error:

1. **Prueba la conexión** con Google Sheets
2. **Verifica que las organizaciones** se carguen correctamente
3. **Prueba añadir** una nueva organización
4. **Verifica la sincronización** entre datos locales y Google Sheets

## 🆘 Soporte

Si el error persiste después de seguir estos pasos:

1. **Revisa la consola** del navegador para errores adicionales
2. **Verifica la versión** de Node.js (recomendado: 16+)
3. **Limpia la caché** del navegador
4. **Reinstala las dependencias**: `rm -rf node_modules && npm install`

¡Con esta configuración, tu aplicación debería funcionar correctamente con Google Sheets! 🎉
