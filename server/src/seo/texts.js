import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_LANGUAGE, SEO_LANGUAGES } from './config.js';

// The texts of the website, read from the SAME files the website uses: a title
// shown to a search engine is the title the visitor then sees. In the
// repository they are the client's locale files; the deployed package carries
// a copy in ./locales (the packaging copies them next to this file).
const here = path.dirname(fileURLToPath(import.meta.url));
const CANDIDATES = [path.join(here, 'locales'), path.resolve(here, '../../../client/src/i18n/locales')];

let cache = null;

function load() {
  if (cache) return cache;
  const dir = CANDIDATES.find((candidate) => existsSync(path.join(candidate, `${DEFAULT_LANGUAGE}.json`)));
  if (!dir) throw new Error('SEO: the locale files of the website were not found');
  cache = Object.fromEntries(SEO_LANGUAGES.map((lang) => [lang, JSON.parse(readFileSync(path.join(dir, `${lang}.json`), 'utf8'))]));
  return cache;
}

function lookup(tree, key) {
  return key.split('.').reduce((node, part) => (node && typeof node === 'object' ? node[part] : undefined), tree);
}

// Same contract as i18next for what the site uses: `{{name}}` placeholders and
// the French text when a language lacks the key.
export function text(lang, key, vars = {}) {
  const all = load();
  let value = lookup(all[lang] ?? {}, key);
  if (value === undefined) value = lookup(all[DEFAULT_LANGUAGE], key);
  if (typeof value !== 'string') return value ?? '';
  return value.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name) => (vars[name] === undefined ? '' : String(vars[name])));
}

export function resetTextsForTests() {
  cache = null;
}
