import React from 'react'
import { useTranslation } from '../l10n/i18n'

const LanguageSelector = () => {
  const { changeLanguage, currentLocale } = useTranslation()

  return (
    <div className="language-selector">
      <button
        className={`language-btn ${currentLocale === 'es' ? 'active' : ''}`}
        onClick={() => changeLanguage('es')}
        title="Español"
      >
        ES
      </button>
      <button
        className={`language-btn ${currentLocale === 'en' ? 'active' : ''}`}
        onClick={() => changeLanguage('en')}
        title="English"
      >
        EN
      </button>
      <button
        className={`language-btn ${currentLocale === 'fr' ? 'active' : ''}`}
        onClick={() => changeLanguage('fr')}
        title="French"
      >
        FR
      </button>
    </div>
  )
}

export default LanguageSelector