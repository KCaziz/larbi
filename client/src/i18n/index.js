import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import fr from './locales/fr.json';
import { isApplicationPath, languageFromPath } from './localePath.js';

// Tamazight ("tzm") is registered as a selectable language but has no real
// translations yet — every missing key falls back to French (fallbackLng),
// so it never renders untranslated i18next keys to the user.
export const SUPPORTED_LANGUAGES = [
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'tzm', label: 'Tamazight', dir: 'ltr' },
];

// Only the texts of the language in use are downloaded (P12-06): each locale
// file weighs about 300 kB, and a visitor reads one language, not four.
// French is always there: it is the fallback of every missing text.
const LOADERS = {
  en: () => import('./locales/en.json'),
  ar: () => import('./locales/ar.json'),
  tzm: () => import('./locales/tzm.json'),
};

const supported = (lng) => SUPPORTED_LANGUAGES.find((lang) => lang.code === lng?.split('-')[0])?.code ?? 'fr';

export async function loadLanguage(lng) {
  const code = supported(lng);
  if (code === 'fr' || i18n.hasResourceBundle(code, 'translation')) return code;
  const module = await LOADERS[code]();
  i18n.addResourceBundle(code, 'translation', module.default ?? module, true, true);
  return code;
}

// Where the language comes from, in this order (P12-06):
//   1. the address of a public page (/ar/…, /en/…);
//   2. the language the person chose before (kept in this browser);
//   3. on the public site, French — the language of addresses without prefix.
//      Never the browser's language there: a search engine runs in English,
//      and would otherwise see English texts at a French address;
//   4. in the applications, the language of the browser.
const detector = new LanguageDetector();
detector.addDetector({ name: 'address', lookup: () => languageFromPath(window.location.pathname) ?? undefined });
detector.addDetector({ name: 'publicSite', lookup: () => (isApplicationPath(window.location.pathname) ? undefined : 'fr') });

i18n
  .use(detector)
  .use(initReactI18next)
  .init({
    resources: { fr: { translation: fr } },
    // The other languages arrive with loadLanguage(): i18next must not treat
    // them as unknown in the meantime.
    partialBundledLanguages: true,
    fallbackLng: 'fr',
    supportedLngs: SUPPORTED_LANGUAGES.map((lang) => lang.code),
    interpolation: { escapeValue: false },
    detection: {
      order: ['address', 'localStorage', 'publicSite', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'lang',
    },
  });

// Every change of language (menu, profile, address) first downloads the texts,
// so the page never shows a mix of the old and the new language.
const changeLanguage = i18n.changeLanguage.bind(i18n);
i18n.changeLanguage = async (lng, callback) => {
  if (lng) await loadLanguage(lng);
  return changeLanguage(lng, callback);
};


export default i18n;
