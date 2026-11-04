import '../helpers/setup-env.js';
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { SERVER_DIR } from '../helpers/env.js';
import { FINANCIAL_TABLES } from '../../src/constants/finData.js';

// What a person reads on screen (SUIVI_RECETTE R5): no raw translation key, no
// mention of the client, no formula or internal calculation.

const CLIENT = path.resolve(SERVER_DIR, '..', 'client');
const load = (lang) => JSON.parse(readFileSync(path.join(CLIENT, 'src/i18n/locales', `${lang}.json`), 'utf8'));
const leaves = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? leaves(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]]));

describe('the texts a person reads', () => {
  test('every table of the data inventory has its name in every language (no raw key on /parametres/confiance)', () => {
    for (const lang of ['fr', 'en', 'ar']) {
      const tables = load(lang).trust.tables;
      const missing = FINANCIAL_TABLES.map((table) => table.label).filter((label) => !tables[label]);
      assert.deepEqual(missing, [], lang);
    }
  });

  // « Client » as a customer of the person (an invoice, receivables) is fine; the
  // client OF THE PROJECT, a workbook, a tab, a formula code, are not.
  const FORBIDDEN = [
    /\b(le|du|au|ce|notre|son|the|our) client\b/i,
    /classeur|workbook/i,
    /\bonglet\b/i,
    /\bF\d{3}\b/,
    /\b(ALG|PB|AN|COL|INT)-[A-Z]?\d/,
    /\bformules?\b|\bformulas?\b/i,
    /à valider par|en attente du client/i,
  ];
  test('no text mentions the client of the project, a workbook, a tab or a formula', () => {
    for (const lang of ['fr', 'en', 'ar', 'tzm']) {
      const hits = leaves(load(lang))
        // « onglet » is a real word of the administration screens (their own tabs).
        .filter(([key, value]) => typeof value === 'string' && FORBIDDEN.some((pattern) => pattern.test(value) && !(key.startsWith('admin.') && /onglet/.test(pattern.source))))
        .map(([key]) => key);
      assert.deepEqual(hits, [], lang);
    }
  });
});

describe('the errors a person reads', () => {
  test('no screen shows the text of a server error: it goes through a translated message', () => {
    const files = [];
    const walk = (dir) => {
      for (const name of readdirSync(dir)) {
        const full = path.join(dir, name);
        if (statSync(full).isDirectory()) walk(full);
        else if (/\.jsx?$/.test(name)) files.push(full);
      }
    };
    walk(path.join(CLIENT, 'src'));
    const offenders = files.filter((file) => /ApiError \? \w+\.message|\{\s*(err|error|e)\.message\s*\}/.test(readFileSync(file, 'utf8'))).map((file) => path.relative(CLIENT, file));
    assert.deepEqual(offenders, []);
  });
});

describe('the icons', () => {
  test('every emoji the server gives a category, an account or a goal has its real icon (R3-06)', async () => {
    const { REFERENCE_CATEGORIES } = await import('../../src/constants/finCategoryReference.js');
    const { COLLECTIVE_CATEGORIES } = await import('../../src/constants/finCollectiveCategories.js');
    const { ACCOUNT_TYPES, PAYMENT_METHODS_REFERENCE } = await import('../../src/constants/finAccounts.js');
    const goalSource = readFileSync(path.join(SERVER_DIR, 'src/constants/finGoal.js'), 'utf8');
    const emojis = new Set(
      [...REFERENCE_CATEGORIES, ...COLLECTIVE_CATEGORIES, ...ACCOUNT_TYPES, ...PAYMENT_METHODS_REFERENCE].map((row) => row.icon).concat([...goalSource.matchAll(/icon: '([^']+)'/g)].map((m) => m[1])),
    );
    const source = readFileSync(path.join(CLIENT, 'src/components/fincludia/CategoryIcon.jsx'), 'utf8');
    const missing = [...emojis].filter((emoji) => emoji && !source.includes(emoji.replace(/️/g, '')));
    assert.ok(emojis.size > 100);
    assert.deepEqual(missing, []);
  });
});
