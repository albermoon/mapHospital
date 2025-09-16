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
        <h3>🔗 Google Sheets Status</h3>
      </div>

      {/* Información del entorno */}
      <div className="environment-info">
        <h4>🌍 Environment Information</h4>
        <div className="env-details">
          <p><strong>Mode:</strong> {envInfo.isDevelopment ? 'Development' : 'Production'}</p>
          <p><strong>Google Sheets:</strong> Enabled</p>
          <p><strong>Browser:</strong> {envInfo.userAgent.split(' ')[0]}</p>
          <p><strong>Platform:</strong> {envInfo.platform}</p>
          <p><strong>Online:</strong> {envInfo.onLine ? '✅ Yes' : '❌ No'}</p>
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
            {loading ? '🔄 Syncing...' : '📊 Sync with Local Data'}
          </button>
        )}
      </div>

      {/* Información de debug en desarrollo */}
      {envInfo.isDevelopment && (
        <div className="debug-info">
          <h4>🐛 Debug Information (Development Only)</h4>
          <details>
            <summary>View environment details</summary>
            <pre>{JSON.stringify(envInfo, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  )
}

export default GoogleSheetsStatus