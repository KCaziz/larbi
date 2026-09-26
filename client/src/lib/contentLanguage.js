// Languages an article can exist in: the platform's own (Tamazight has no
// content and falls back to the article's written language).
export const CONTENT_LANGUAGES = ['fr', 'en', 'ar'];

// 'fr-FR' -> 'fr'; a language without content ('tzm') -> null (the API then
// answers with the language the article is written in).
export function contentLanguage(uiLanguage) {
  const base = String(uiLanguage ?? '').slice(0, 2).toLowerCase();
  return CONTENT_LANGUAGES.includes(base) ? base : null;
}

// Adds `lang=` to an API path, so the server picks the translation for the
// language the visitor browses the platform in.
export function withLang(path, uiLanguage) {
  const lang = contentLanguage(uiLanguage);
  if (!lang) return path;
  return `${path}${path.includes('?') ? '&' : '?'}lang=${lang}`;
}

export const textDirection = (lang) => (lang === 'ar' ? 'rtl' : 'ltr');
