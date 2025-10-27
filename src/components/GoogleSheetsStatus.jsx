import React from 'react'
import './GoogleSheetsStatus.css'
import { useTranslation } from '../l10n/i18n'

const GoogleSheetsStatus = ({
  loading,
  error,
  onSyncWithLocal,
  localOrganizations
}) => {
  const { t } = useTranslation()

  return (
    <div className="google-sheets-status">
      <div className="status-header">
        <h3>🔗 {t('googleSheetsStatus')}</h3>
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
    </div>
  )
}

export default GoogleSheetsStatus