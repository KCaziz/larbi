import { createHash } from 'node:crypto';
import { CONTENT_LANGUAGES } from '../constants/blog.js';
import { richTextToPlain } from './sanitize.service.js';
import { slugify } from './slug.service.js';

// Pure helpers for blog articles (no database access: easy to unit-test).

const WORDS_PER_MINUTE = 200;

// Plain text of a (sanitised) HTML body, whitespace collapsed. Stored next to the
// body so search and reading time never have to parse HTML.
export function bodyToText(html) {
  // Block ends and line breaks separate words: "<p>Hello</p><p>World</p>" is two words, not "HelloWorld".
  const spaced = String(html ?? '').replace(/<\/(?:p|h[1-6]|li|blockquote|ul|ol|div)>|<br\s*\/?>|<hr\s*\/?>/gi, ' $&');
  return richTextToPlain(spaced).replace(/\s+/g, ' ').trim();
}

// "3 min read". 0 when there is no text; never less than 1 minute otherwise.
export function readingMinutes(text) {
  const words = String(text ?? '').trim().split(/\s+/).filter(Boolean).length;
  return words === 0 ? 0 : Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

// What a reader sees of an article in `lang`: the translation when there is one,
// the article's own text otherwise (the default). `availableLanguages` lists the
// language it is written in first, then its translations, in platform order.
export function localizeArticle(article, lang) {
  const translations = article.translations ?? [];
  const translation = lang && lang !== article.language ? translations.find((t) => t.language === lang) : null;
  const source = translation ?? article;
  const order = (l) => CONTENT_LANGUAGES.indexOf(l);
  return {
    language: source.language ?? article.language,
    availableLanguages: [article.language, ...translations.map((t) => t.language).sort((a, b) => order(a) - order(b))],
    title: source.title,
    excerpt: source.excerpt,
    body: source.body,
    bodyText: source.bodyText,
    metaTitle: source.metaTitle,
    metaDescription: source.metaDescription,
  };
}

// URL-safe identifier of a tag. A name without any latin letter or digit (Arabic,
// for example) still gets a stable, distinct slug instead of collapsing into one.
export function tagSlug(name) {
  const base = slugify(name, '');
  if (base) return base;
  return `t-${createHash('sha1').update(String(name).trim().toLowerCase()).digest('hex').slice(0, 10)}`;
}

// Cleans a list of tag names typed by an editor: trimmed, blanks dropped,
// duplicates (same slug, so "TVA" and "tva") merged, first spelling kept.
export function normalizeTags(names) {
  const seen = new Map();
  for (const raw of names ?? []) {
    const name = String(raw).replace(/\s+/g, ' ').trim();
    if (!name) continue;
    const slug = tagSlug(name);
    if (!seen.has(slug)) seen.set(slug, { name, slug });
  }
  return [...seen.values()];
}
