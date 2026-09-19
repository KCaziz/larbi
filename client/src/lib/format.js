// Locale-aware date; unsupported UI languages (tamazight) fall back to French.
export function formatDate(language, iso) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat(language === 'tzm' ? 'fr' : language, { dateStyle: 'medium' }).format(new Date(iso));
  } catch {
    return new Date(iso).toLocaleDateString();
  }
}
