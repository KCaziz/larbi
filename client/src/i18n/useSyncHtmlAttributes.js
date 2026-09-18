import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from './index.js';

// Keeps <html lang="..."> and <html dir="..."> in sync with the active
// language, on first load and on every language change — needed for Arabic
// to actually render right-to-left, and for accessibility/SEO in general.
export function useSyncHtmlAttributes() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const applyToDocument = (lng) => {
      const lang = SUPPORTED_LANGUAGES.find((entry) => entry.code === lng) ?? SUPPORTED_LANGUAGES[0];
      document.documentElement.lang = lang.code;
      document.documentElement.dir = lang.dir;
    };

    applyToDocument(i18n.resolvedLanguage ?? i18n.language);
    i18n.on('languageChanged', applyToDocument);
    return () => i18n.off('languageChanged', applyToDocument);
  }, [i18n]);
}
