import React from 'react';
import en from './app_en.arb';
import es from './app_es.arb';
import fr from './app_fr.arb';

const clean = ({ ["@@locale"]: _removed, ...rest }) => rest;

const translations = {
    en: clean(en),
    es: clean(es),
    fr: clean(fr),
};

export const I18nContext = React.createContext();

export const useTranslation = () => {
    const context = React.useContext(I18nContext);
    if (!context) throw new Error('useTranslation must be used within an I18nProvider');
    return context;
};

export const I18nProvider = ({ children }) => {
    const [locale, setLocale] = React.useState(() => {
        const browserLang = navigator.language.split('-')[0];
        return ['en', 'es', 'fr'].includes(browserLang) ? browserLang : 'es';
    });

    const t = (key, placeholders = {}) => {
        let translation = translations[locale][key] || key;
        
        // Replace placeholders in the translation
        Object.entries(placeholders).forEach(([placeholder, value]) => {
            translation = translation.replace(`{${placeholder}}`, value);
        });
        
        return translation;
    };

    const changeLanguage = (newLocale) => {
        if (['en', 'es', 'fr'].includes(newLocale)) setLocale(newLocale);
    };

    return (
        <I18nContext.Provider value={{ t, locale, changeLanguage }}>
            {children}
        </I18nContext.Provider>
    );
};
