// Configuración de entorno para la aplicación
export const ENV_CONFIG = {
  // Verificar si estamos en desarrollo o producción
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  isTest: Boolean(import.meta.env.VITE_TEST_MODE) || false,
  
  // Configuración de Google Sheets
  googleSheets: {
    enabled: import.meta.env.VITE_GOOGLE_SHEETS_ENABLED !== 'false',
    debugMode: import.meta.env.DEV, // Modo debug en desarrollo
  },
  
  // Configuración de la aplicación
  app: {
    name: 'MapHospital',
    version: '1.0.0',
    defaultMapCenter: [50.8503, 4.3517], // Bruselas
    defaultMapZoom: 5,
  }
}

// Función para verificar si el entorno está configurado correctamente
export const validateEnvironment = () => {
  const issues = []
  
  // Verificar que las credenciales estén disponibles
  if (!window.process) {
    issues.push('Polyfills no están cargados correctamente')
  }
  
  // Verificar que Google APIs estén disponibles
  if (typeof google === 'undefined') {
    issues.push('Google APIs no están disponibles')
  }
  
  return {
    isValid: issues.length === 0,
    issues
  }
}

// Función para obtener información del entorno
export const getEnvironmentInfo = () => {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    timestamp: new Date().toISOString(),
    ...ENV_CONFIG
  }
}
