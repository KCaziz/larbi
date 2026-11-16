// Language in the address of the public site (P12-06). French is the default
// and keeps the historical addresses (/formations); English and Arabic live
// under /en/… and /ar/…, so a search engine sees each language as a page of
// its own. The server knows the same rule (server/src/seo/config.js).
// The applications (/app, /partage, /admin) have no language in the address:
// they follow the language chosen by the person.
export const PREFIXED_LANGUAGES = ['en', 'ar'];

// '/ar/blog/x' → 'ar'; anything else → null (no language in the address).
export function languageFromPath(pathname = '') {
  const first = pathname.split('/')[1];
  return PREFIXED_LANGUAGES.includes(first) ? first : null;
}

// '/ar/blog/x' → '/blog/x'; '/ar' → '/'.
export function stripLanguage(pathname = '/') {
  const lang = languageFromPath(pathname);
  if (!lang) return pathname;
  return pathname.slice(lang.length + 1) || '/';
}

// '/blog' in Arabic → '/ar/blog'. French (and Tamazight, which has no address
// of its own yet) keep the address without prefix. Only for public pages.
export function localizePath(path, lang) {
  if (!PREFIXED_LANGUAGES.includes(lang) || typeof path !== 'string' || !path.startsWith('/')) return path;
  if (languageFromPath(path)) return path;
  return path === '/' ? `/${lang}` : `/${lang}${path}`;
}

// The applications: private, not indexed, without a language in the address.
const APPLICATION_PREFIXES = ['/app', '/partage', '/espaces', '/admin'];
export function isApplicationPath(pathname = '/') {
  return APPLICATION_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
