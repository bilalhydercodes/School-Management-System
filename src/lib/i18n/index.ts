import { en } from './translations/en';
import { kn } from './translations/kn';
import type { SupportedLanguage, TranslationDictionary } from './types';

export * from './types';

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en,
  kn,
};

export const SUPPORTED_LANGUAGES: Array<{
  code: SupportedLanguage;
  name: string;
  nativeName: string;
}> = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
];

export const LANGUAGE_COOKIE_NAME = 'alpha_portal_lang';
export const LANGUAGE_STORAGE_KEY = 'alpha_portal_lang';

export function getTranslation(lang: SupportedLanguage = 'en'): TranslationDictionary {
  return translations[lang] || translations.en;
}
