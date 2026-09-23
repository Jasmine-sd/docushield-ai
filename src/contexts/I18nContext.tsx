import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { SUPPORTED_LANGUAGES, Language, LanguageCode, translations, TranslationType } from '../i18n';

interface I18nContextType {
  language: LanguageCode;
  currentLanguage: Language;
  t: TranslationType;
  setLanguage: (lang: LanguageCode) => void;
  dir: 'ltr' | 'rtl';
  isRTL: boolean;
  supportedLanguages: Language[];
}

const STORAGE_KEY = 'docusentry_language';

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as LanguageCode;
      if (saved && translations[saved]) {
        return saved;
      }
      // Check browser language
      const browserLang = navigator.language?.split('-')[0]?.toLowerCase();
      const match = SUPPORTED_LANGUAGES.find(l => l.code === browserLang);
      if (match) {
        return match.code;
      }
    } catch {
      // Fallback
    }
    return 'en';
  });

  const currentLanguage = useMemo(() => {
    return SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const dir = currentLanguage.dir;
  const isRTL = dir === 'rtl';

  const setLanguage = useCallback((newLang: LanguageCode) => {
    if (translations[newLang]) {
      setLanguageState(newLang);
      try {
        localStorage.setItem(STORAGE_KEY, newLang);
      } catch (e) {
        console.error('Failed to save language to localStorage', e);
      }
    }
  }, []);

  // Sync html dir and lang attributes
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    if (isRTL) {
      document.body.classList.add('rtl-mode');
    } else {
      document.body.classList.remove('rtl-mode');
    }
  }, [language, dir, isRTL]);

  const t = useMemo(() => {
    return translations[language] || translations.en;
  }, [language]);

  const value = useMemo(() => ({
    language,
    currentLanguage,
    t,
    setLanguage,
    dir,
    isRTL,
    supportedLanguages: SUPPORTED_LANGUAGES,
  }), [language, currentLanguage, t, setLanguage, dir, isRTL]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};

export const useI18n = useTranslation;
