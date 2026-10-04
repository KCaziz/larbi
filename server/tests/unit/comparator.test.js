import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { COMPARATOR_SEGMENTS, COMPARATOR_THEMES, THEME_KEYS } from '../../src/constants/comparator.js';
import { TOOLS, TOOL_ACCESS } from '../../src/constants/tools.js';
import { toolAccess } from '../../src/middleware/toolAccess.js';
import { annualCost, cleanValues, parseAmount, parseYearlyAmount, periodFactor } from '../../src/services/comparator.service.js';
import { SERVER_DIR } from '../helpers/env.js';

// Bank comparator (P4-06): the ONLY numbers derived from the client's texts are
// estimated yearly costs. Every one of them is checked here against the client's
// own file, and every ambiguous text must stay unranked (null), never guessed.

// The rows of the data migration, read straight from its SQL (what really ships).
function migrationRows() {
  const dir = path.join(SERVER_DIR, 'prisma', 'migrations');
  const name = readdirSync(dir).find((d) => d.endsWith('_comparator_data'));
  const sql = readFileSync(path.join(dir, name, 'migration.sql'), 'utf8');
  return [...sql.matchAll(/^ {2}\('c1[^']*', '[^']*', '([^']+)', '([^']+)', (?:NULL|'(?:[^']|'')*'), '((?:[^']|'')*)', '((?:[^']|'')*)'::jsonb/gm)].map((m) => ({
    theme: m[1],
    segment: m[2],
    label: m[3].replace(/''/g, "'"),
    values: JSON.parse(m[4].replace(/''/g, "'")),
  }));
}

describe('amounts', () => {
  test('plain amounts, French grouping and decimal comma; "Gratuit" / "Franco" are 0', () => {
    for (const [text, expected] of [
      ['100 DA', 100],
      ['1 000 DA', 1000],
      ['1 260,5 DA', 1260.5],
      ['180 DA (TTC)', 180],
      ['3 750 DA', 3750],
      ['Gratuit', 0],
      ['franco', 0],
      ['  2 500   DA ', 2500],
    ]) {
      assert.equal(parseAmount(text), expected, text);
    }
  });

  test('anything that is not a plain amount is null (never guessed)', () => {
    for (const text of ['0,25% (Max 3 500 DA)', '1 800 DA + 700 DA/chargement', '800 DA (frais de gestion)', '426,89 DA (renouvellement)', '100 DA/mois', 'Non spécifié', 'TR + Marge', '', null, undefined, '12', 'DA']) {
      assert.equal(parseAmount(text), null, String(text));
    }
  });

  test('yearly amounts: "/ An" as is, "/ 2 ans" spread over two years', () => {
    assert.equal(parseYearlyAmount('17 000 DA / An'), 17000);
    assert.equal(parseYearlyAmount('17 000 DA / 2 ans'), 8500);
    assert.equal(parseYearlyAmount('4 500 DA'), 4500);
    assert.equal(parseYearlyAmount('100 DA/mois'), null, 'a monthly fee is not a yearly amount');
    assert.equal(parseYearlyAmount('17 000 DA / 0 ans'), null);
  });

  test('periodicity: monthly x12, quarterly x4, half-yearly x2, yearly x1; unknown is null', () => {
    assert.equal(periodFactor('Mensuel'), 12);
    assert.equal(periodFactor('trimestriel'), 4);
    assert.equal(periodFactor('Semestrielle'), 2);
    assert.equal(periodFactor('ANNUEL'), 1);
    assert.equal(periodFactor('·'), null);
    assert.equal(periodFactor('Par opération'), null);
  });
});

describe('estimated yearly cost on the client file', () => {
  const rows = migrationRows();
  const cost = (theme, label) => {
    const row = rows.find((r) => r.theme === theme && r.label === label);
    return annualCost(row.theme, row.values);
  };

  test('the migration really holds the client file (152 conditions in 8 rubrics)', () => {
    assert.equal(rows.length, 152);
    const byTheme = Object.fromEntries(THEME_KEYS.map((k) => [k, rows.filter((r) => r.theme === k).length]));
    assert.deepEqual(byTheme, {
      comptes: 26,
      'versements-retraits': 25,
      'carte-locale': 12,
      epargne: 28,
      'coffres-forts': 0,
      credits: 27,
      virements: 0,
      'carte-internationale': 12,
      devises: 21,
      'operations-diverses': 1,
      cheques: 0,
    });
  });

  test('accounts: fee x periodicity, every row computable', () => {
    const accounts = rows.filter((r) => r.theme === 'comptes');
    assert.ok(accounts.every((r) => annualCost('comptes', r.values) !== null), 'every account fee of the file is a plain amount');
    assert.equal(cost('comptes', 'Compte Chèque (Particulier)'), 1200); // Al Baraka: 100 DA mensuel
    assert.equal(annualCost('comptes', { fee: '1 260,5 DA', period: 'Trimestriel' }), 5042); // Natixis
    assert.equal(annualCost('comptes', { fee: '180 DA (TTC)', period: 'Mensuel' }), 2160); // Fransabank
    assert.equal(annualCost('comptes', { fee: '3 750 DA', period: 'Annuel' }), 3750); // HSBC
    assert.equal(annualCost('comptes', { fee: 'Gratuit' }), 0, 'free: the periodicity does not matter');
    assert.equal(annualCost('comptes', { fee: '500 DA' }), null, 'an amount without periodicity is not a yearly cost');
  });

  test('cards: the yearly fee when it is unambiguous, null otherwise', () => {
    const expected = {
      'carte-locale': { 'Carte CIB': 0, 'CIB Classique': 200, 'CIB Gold': 3000, 'CIB Classic / Gold': 0, 'CIB Classic': null },
      'carte-internationale': { 'Carte Visa Classique': null, 'Carte Visa Gold': 4500, 'Mastercard Titanium': 8500, 'Carte Mastercard Platinum': 17000, 'Mastercard Prépayée': 2500 },
    };
    for (const [theme, labels] of Object.entries(expected)) {
      for (const [label, value] of Object.entries(labels)) {
        const matching = rows.filter((r) => r.theme === theme && r.label === label).map((r) => annualCost(theme, r.values));
        assert.ok(matching.length > 0, `${theme} / ${label} exists`);
        if (value === null) assert.ok(matching.includes(null), `${theme} / ${label}: at least one row is not ranked`);
        else assert.ok(matching.includes(value), `${theme} / ${label}: ${value} in ${matching}`);
      }
    }
    // the three ambiguous cotisations of the file stay unranked
    for (const text of ['1 800 DA + 700 DA/chargement', '800 DA (frais de gestion)', '426,89 DA (renouvellement)']) {
      assert.ok(rows.some((r) => r.values.annualFee === text), text);
      assert.equal(annualCost('carte-locale', { annualFee: text }), null, text);
    }
  });

  test('savings, credits, withdrawals and currency operations are never ranked', () => {
    for (const r of rows.filter((x) => ['epargne', 'credits', 'versements-retraits', 'devises', 'operations-diverses'].includes(x.theme))) {
      assert.equal(annualCost(r.theme, r.values), null, `${r.theme} / ${r.label}`);
    }
  });

  test('the documented corrections of the source file are in the migration, nothing else is invented', () => {
    const hsbc = rows.find((r) => r.theme === 'credits' && r.label === 'Découvert');
    assert.deepEqual(hsbc.values, { rate: 'Taux de référence + 7,25%' }, 'a rate is shown as a rate');
    const smart = rows.filter((r) => r.label.startsWith('Pack'));
    assert.deepEqual(smart.map((r) => [r.theme, r.label, r.values]), [['operations-diverses', 'Pack "Smart" (E-banking, SMS)', { fee: '100 DA/mois' }]]);
    assert.ok(!rows.some((r) => Object.values(r.values).some((v) => v === '·')), 'the empty-cell marker is not data');
    assert.equal(rows.filter((r) => r.segment !== 'non_precise').length, 20, 'as many stated segments as lines in the client tab 12');
  });
});

describe('rubrics, values and access', () => {
  test('11 rubrics with distinct keys and columns; a metric only reads its own columns', () => {
    assert.equal(COMPARATOR_THEMES.length, 11);
    assert.equal(new Set(THEME_KEYS).size, 11);
    for (const theme of COMPARATOR_THEMES) {
      assert.equal(new Set(theme.fields).size, theme.fields.length, theme.key);
      if (theme.metric) for (const field of [theme.metric.amount, theme.metric.period].filter(Boolean)) assert.ok(theme.fields.includes(field), `${theme.key}.${field}`);
    }
    assert.deepEqual(COMPARATOR_SEGMENTS, ['particulier', 'professionnel', 'entreprise', 'non_precise']);
  });

  test('cleanValues keeps the rubric columns (trimmed, non empty) and reports the others', () => {
    assert.deepEqual(cleanValues('comptes', { fee: '  100   DA ', period: 'Mensuel', rate: '3%', other: 'x', empty: '' }), {
      values: { fee: '100 DA', period: 'Mensuel' },
      unknown: ['rate', 'other', 'empty'],
    });
    assert.deepEqual(cleanValues('epargne', { rate: '   ' }), { values: {}, unknown: [] });
  });

  test('every tool has a known access rule; a public tool needs no session, others do', async () => {
    assert.ok(TOOLS.every((tool) => TOOL_ACCESS.includes(tool.access)));
    assert.equal(TOOLS.find((tool) => tool.key === 'comparateur-bancaire').access, 'public');
    const run = (middlewares, req) =>
      new Promise((resolve) => {
        const [first] = middlewares;
        first(req, {}, (err) => resolve(err ?? 'next'));
      });
    assert.equal(await run(toolAccess('comparateur-bancaire'), { cookies: {} }), 'next');
    const refused = await run(toolAccess('simulateur-credit'), { cookies: {} });
    assert.equal(refused.statusCode, 401, 'an "authenticated" tool refuses a visitor without session');
    assert.throws(() => toolAccess('unknown-tool'), /Unknown tool/);
  });
});
