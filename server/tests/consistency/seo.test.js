import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LEGACY_PATHS, NOINDEX_PAGES, PREFIXED_LANGUAGES, SEO_LANGUAGES, STATIC_PAGES } from '../../src/seo/config.js';

// The server describes the public site to search engines (src/seo); the
// website builds the same site (client/src). Both must agree, or a search
// engine would be told about pages that do not exist, or miss real ones.

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const client = (file) => readFileSync(path.join(ROOT, 'client/src', file), 'utf8');
const locale = (lang) => JSON.parse(client(`i18n/locales/${lang}.json`));
const lookup = (tree, key) => key.split('.').reduce((node, part) => node?.[part], tree);

describe('search engines: the server and the website agree', () => {
  test('the same languages carry a prefix in the address', () => {
    const match = client('i18n/localePath.js').match(/export const PREFIXED_LANGUAGES = \[([^\]]*)\]/);
    assert.ok(match, 'PREFIXED_LANGUAGES not found in the website');
    const website = [...match[1].matchAll(/'([a-z]+)'/g)].map((m) => m[1]);
    assert.deepEqual(website, PREFIXED_LANGUAGES);
  });

  test('the former addresses redirected by the website are the ones the server keeps alive', () => {
    const source = client('config/appNavigation.js');
    const block = source.slice(source.indexOf('export const LEGACY_REDIRECTS'), source.indexOf('];', source.indexOf('export const LEGACY_REDIRECTS')));
    const website = [...block.matchAll(/{([^}]*)}/g)].map((m) => {
      const from = m[1].match(/from: '([^']+)'/)[1];
      return m[1].includes('prefix: true') ? `${from}*` : from;
    });
    assert.ok(website.length > 10, 'LEGACY_REDIRECTS not read');
    assert.deepEqual([...website].sort(), [...LEGACY_PATHS].sort());
  });

  test('every page the server describes is a route of the website', () => {
    const router = client('router/index.jsx');
    for (const { path: pagePath } of [...STATIC_PAGES, ...NOINDEX_PAGES]) {
      if (pagePath === '/') continue;
      const route = pagePath.slice(1);
      assert.ok(router.includes(`path: '${route}'`), `no route "${route}" in the website`);
    }
  });

  test('every title and description exists in each language of the search engines', () => {
    const ids = [...new Set([...STATIC_PAGES, ...NOINDEX_PAGES].map((p) => p.id).concat(['private', 'notFound']))];
    const templates = ['term', 'comparatorTheme', 'comparatorThemeDescription', 'comparatorSegment', 'comparatorSegmentDescription', 'simulator', 'simulatorDescription'];
    for (const lang of SEO_LANGUAGES) {
      const texts = locale(lang);
      assert.ok(lookup(texts, 'seo.languageName'), `${lang}: seo.languageName`);
      for (const id of ids) {
        for (const field of ['title', 'description']) {
          const value = lookup(texts, `seo.pages.${id}.${field}`);
          assert.ok(typeof value === 'string' && value.trim(), `${lang}: seo.pages.${id}.${field}`);
        }
        // A result page shows about 60 characters of a title, 160 of a description.
        assert.ok(lookup(texts, `seo.pages.${id}.title`).length <= 70, `${lang}: seo.pages.${id}.title is too long`);
        assert.ok(lookup(texts, `seo.pages.${id}.description`).length <= 170, `${lang}: seo.pages.${id}.description is too long`);
      }
      for (const key of templates) assert.ok(lookup(texts, `seo.templates.${key}`), `${lang}: seo.templates.${key}`);
    }
  });
});
