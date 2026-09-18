import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import fr from './locales/fr.json';
import en from './locales/en.json';
import ar from './locales/ar.json';
import tzm from './locales/tzm.json';

// Tamazight ("tzm") is registered as a selectable language but has no real
// translations yet — every missing key falls back to French (fallbackLng),
// so it never renders untranslated i18next keys to the user.
export const SUPPORTED_LANGUAGES = [
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'tzm', label: 'Tamazight', dir: 'ltr' },
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
      ar: { translation: ar },
      tzm: { translation: tzm },
    },
    fallbackLng: 'fr',
    supportedLngs: SUPPORTED_LANGUAGES.map((lang) => lang.code),
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'lang',
    },
  });

export default i18n;
