'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { SupportedLanguage, TranslationDictionary } from './types';
import {
  translations,
  LANGUAGE_COOKIE_NAME,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
} from './index';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationDictionary;
  isKannada: boolean;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
  initialLanguage?: SupportedLanguage;
}

export function LanguageProvider({
  children,
  initialLanguage = 'en',
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState<SupportedLanguage>(initialLanguage);

  // Sync with client-side localStorage/cookies upon initial mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored === 'kn' || stored === 'en') {
        if (stored !== language) {
          setLanguageState(stored);
        }
      } else {
        // Fallback to cookie if present
        const match = document.cookie.match(new RegExp('(^|;\\s*)' + LANGUAGE_COOKIE_NAME + '=([^;]+)'));
        if (match && (match[2] === 'kn' || match[2] === 'en')) {
          setLanguageState(match[2] as SupportedLanguage);
        }
      }
    } catch {
      // Safe fallback if localStorage/cookies disabled
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
      document.cookie = `${LANGUAGE_COOKIE_NAME}=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLang;
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, []);

  const t = useMemo(() => {
    return translations[language] || translations.en;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      isKannada: language === 'kn',
      supportedLanguages: SUPPORTED_LANGUAGES,
    }),
    [language, setLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Graceful fallback outside provider
    return {
      language: 'en' as SupportedLanguage,
      setLanguage: () => {},
      t: translations.en,
      isKannada: false,
      supportedLanguages: SUPPORTED_LANGUAGES,
    };
  }
  return context;
}
