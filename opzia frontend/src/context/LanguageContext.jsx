// src/context/LanguageContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import en from '../locales/en';
import fr from '../locales/fr';
import ar from '../locales/ar';

const locales = { en, fr, ar };

export const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  // Initialize from localStorage, default to 'en'
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const saved = localStorage.getItem('lang');
    if (saved === 'en' || saved === 'fr' || saved === 'ar') {
      return saved;
    }
    // Detect browser language
    const browserLang = navigator.language?.split('-')[0];
    if (browserLang === 'fr' || browserLang === 'ar') {
      return browserLang;
    }
    return 'en';
  });

  // Apply document-level dir and lang attributes
  useEffect(() => {
    document.documentElement.lang = currentLanguage;
    if (currentLanguage === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [currentLanguage]);

  const changeLanguage = useCallback((lang) => {
    if (locales[lang]) {
      setCurrentLanguage(lang);
      localStorage.setItem('lang', lang);
    }
  }, []);

  const t = useCallback((key, params = {}) => {
    let lookupKey = key;
    // Simple plural support (e.g. key_plural if count !== 1)
    if (params.count !== undefined && params.count !== 1) {
      lookupKey = `${key}_plural`;
    }

    const keys = lookupKey.split('.');
    
    // Attempt lookup in active language
    let translation = locales[currentLanguage];
    let found = true;
    for (const k of keys) {
      if (translation && translation[k] !== undefined) {
        translation = translation[k];
      } else {
        found = false;
        break;
      }
    }

    // Fallback to English if not found
    if (!found) {
      translation = locales['en'];
      for (const k of keys) {
        if (translation && translation[k] !== undefined) {
          translation = translation[k];
        } else {
          translation = key; // ultimate fallback is the key string
          break;
        }
      }
    }

    // Interpolate variables (e.g. {{name}})
    if (typeof translation === 'string') {
      return Object.keys(params).reduce((acc, paramKey) => {
        return acc.replace(new RegExp(`\\{\\{\\s*${paramKey}\\s*\\}\\}`, 'g'), params[paramKey]);
      }, translation);
    }

    return translation;
  }, [currentLanguage]);

  const value = {
    currentLanguage,
    changeLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
