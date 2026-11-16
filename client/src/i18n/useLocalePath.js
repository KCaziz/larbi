import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { localizePath } from './localePath.js';

// Turns an address of the public site into the one of the language on screen
// ('/blog' → '/ar/blog' in Arabic), for the menus and links of the public
// pages: the link then leads straight to the right page, for a visitor and for
// a search engine alike.
export function useLocalePath() {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? i18n.language;
  return useCallback((path) => localizePath(path, lang), [lang]);
}
