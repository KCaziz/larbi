import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MainLayout from './MainLayout.jsx';
import i18next from '../i18n/index.js';
import { PREFIXED_LANGUAGES, localizePath } from '../i18n/localePath.js';

// The public site in one language (P12-06).
//
// Under /en and /ar (`lang` given), the address decides the language: the page
// is shown in it, whatever was chosen before. Without prefix, the address is
// the French one: a visitor who chose English or Arabic is taken to the same
// page at its own address, so the address always says the language on screen.
export default function LocaleScope({ lang = null }) {
  const { i18n } = useTranslation();
  const location = useLocation();
  const current = i18n.resolvedLanguage ?? i18n.language;

  // Only when the address changes language — not when the person picks another
  // one in the menu: the menu then opens the page at the new address itself.
  // (The shared instance, not the one of useTranslation(): that one is a new
  // object after each change of language, and would re-run this effect —
  // undoing the visitor's choice before the menu has opened the new address.)
  useEffect(() => {
    if (lang && (i18next.resolvedLanguage ?? i18next.language) !== lang) i18next.changeLanguage(lang);
  }, [lang]);

  if (!lang && PREFIXED_LANGUAGES.includes(current)) {
    return <Navigate replace to={`${localizePath(location.pathname, current)}${location.search}${location.hash}`} />;
  }
  return <MainLayout />;
}
