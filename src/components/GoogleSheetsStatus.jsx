import React from 'react'
import './GoogleSheetsStatus.css'
import { getEnvironmentInfo } from '../config/environment'
import { useTranslation } from '../l10n/i18n'

const GoogleSheetsStatus = ({
  loading,
  error,
  onSyncWithLocal,
  localOrganizations
}) => {
  const { t } = useTranslation()
  const envInfo = getEnvironmentInfo()

  return (
    <div className="google-sheets-status">
      <div className="status-header">
        <h3>🔗 {t('googleSheetsStatus')}</h3>
      </div>

      {/* Información del entorno */}
      <div className="environment-info">
        <h4>🌍 {t('environmentInformation')}</h4>
        <div className="env-details">
          <p><strong>{t('mode')}:</strong> {envInfo.isDevelopment ? t('development') : t('production')}</p>
          <p><strong>{t('googleSheets')}:</strong> {t('enabled')}</p>
          <p><strong>{t('browser')}:</strong> {envInfo.userAgent.split(' ')[0]}</p>
          <p><strong>{t('platform')}:</strong> {envInfo.platform}</p>
          <p><strong>{t('online')}:</strong> {envInfo.onLine ? `✅ ${t('yes')}` : `❌ ${t('no')}`}</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️ {t('error')}: {error}</span>
        </div>
      )}

      <div className="status-actions">
        {localOrganizations && localOrganizations.length > 0 && (
          <button
            className="btn-sync"
            onClick={() => onSyncWithLocal(localOrganizations)}
            disabled={loading}
          >
            {loading ? `🔄 ${t('syncing')}...` : `📊 ${t('syncWithLocalData')}`}
          </button>
        )}
      </div>

      {/* Información de debug en desarrollo */}
      {envInfo.isDevelopment && (
        <div className="debug-info">
          <h4>🐛 {t('debugInformation')} ({t('developmentOnly')})</h4>
          <details>
            <summary>{t('viewEnvironmentDetails')}</summary>
            <pre>{JSON.stringify(envInfo, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  )
}

export default GoogleSheetsStatus