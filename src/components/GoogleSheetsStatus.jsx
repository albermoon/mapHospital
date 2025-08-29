import React from 'react'
import './GoogleSheetsStatus.css'
import { getEnvironmentInfo } from '../config/environment'

const GoogleSheetsStatus = ({ 
  loading, 
  error, 
  onSyncWithLocal, 
  localOrganizations 
}) => {
  const envInfo = getEnvironmentInfo()

  return (
    <div className="google-sheets-status">
      <div className="status-header">
        <h3>🔗 Estado de Google Sheets</h3>
      </div>

      {/* Información del entorno */}
      <div className="environment-info">
        <h4>🌍 Información del Entorno</h4>
        <div className="env-details">
          <p><strong>Modo:</strong> {envInfo.isDevelopment ? 'Desarrollo' : 'Producción'}</p>
          <p><strong>Google Sheets:</strong> Habilitado</p>
          <p><strong>Navegador:</strong> {envInfo.userAgent.split(' ')[0]}</p>
          <p><strong>Plataforma:</strong> {envInfo.platform}</p>
          <p><strong>En línea:</strong> {envInfo.onLine ? '✅ Sí' : '❌ No'}</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️ Error: {error}</span>
        </div>
      )}

      <div className="status-actions">
        {localOrganizations && localOrganizations.length > 0 && (
          <button 
            className="btn-sync"
            onClick={() => onSyncWithLocal(localOrganizations)}
            disabled={loading}
          >
            {loading ? '🔄 Sincronizando...' : '📊 Sincronizar con Datos Locales'}
          </button>
        )}
      </div>

      {/* Información de debug en desarrollo */}
      {envInfo.isDevelopment && (
        <div className="debug-info">
          <h4>🐛 Información de Debug (Solo Desarrollo)</h4>
          <details>
            <summary>Ver detalles del entorno</summary>
            <pre>{JSON.stringify(envInfo, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  )
}

export default GoogleSheetsStatus

