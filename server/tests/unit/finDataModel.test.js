import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  CATEGORY_FAMILIES,
  CATEGORY_FAMILY_CODES,
  STANDARD_CATEGORIES,
  STANDARD_CATEGORY_KEYS,
  categoryFamilyByCode,
  standardCategoriesOfFamily,
  standardCategoryByKey,
} from '../../src/constants/finCategories.js';
import { CONFIDENCE_LEVELS, CONSENT_USES, DATA_SCOPES, DATA_SOURCES, DATA_STATUSES, FICTIONAL_STATUS, FINANCIAL_TABLES } from '../../src/constants/finData.js';
import { checkFinancialRow, isCurrencyCode, isFictional, isReal, totalsByReality } from '../../src/services/finance/dataModel.js';
import { JOURNALLED_FIELDS, diffFields } from '../../src/services/finChange.service.js';

// The common financial data model (P6-02): the category reference, the metadata
// socle and the correction trail, checked as pure data and pure functions.

const row = (over = {}) => ({
  status: 'real',
  scope: 'personal',
  source: 'manual',
  consentUses: [],
  version: 1,
  effectiveAt: new Date('2026-10-12T00:00:00Z'),
  collectedAt: new Date('2026-10-12T00:00:00Z'),
  currency: 'DZD',
  value: 150000,
  ...over,
});

describe("the client's category reference", () => {
  test('holds the 8 families: the 91 rows of P6-02 plus the 98 universal categories none of them covered (P8-08)', () => {
    assert.equal(CATEGORY_FAMILIES.length, 8);
    // 125 universal categories, 27 of which absorbed an old row in place.
    assert.equal(STANDARD_CATEGORIES.length, 91 + 98);
  });

  test('every category belongs to a declared family, and every family has categories', () => {
    for (const category of STANDARD_CATEGORIES) {
      assert.ok(CATEGORY_FAMILY_CODES.includes(category.family), `${category.key}: unknown family`);
    }
    for (const code of CATEGORY_FAMILY_CODES) {
      assert.ok(standardCategoriesOfFamily(code).length > 0, `${code} has no category`);
    }
  });

  test('keys are unique, and built from the family and the label', () => {
    assert.equal(new Set(STANDARD_CATEGORY_KEYS).size, STANDARD_CATEGORY_KEYS.length);
    for (const category of STANDARD_CATEGORIES) {
      assert.ok(category.key.startsWith(`${category.family}.`), `${category.key} is not in its family`);
      assert.match(category.key, /^[a-z]+\.[a-z0-9_]+$/);
    }
  });

  test('labels repeat ACROSS families but never inside one', () => {
    for (const code of CATEGORY_FAMILY_CODES) {
      const labels = standardCategoriesOfFamily(code).map((c) => c.label);
      assert.equal(new Set(labels).size, labels.length, `${code} has a duplicate label`);
    }
    // "Loyer" is both a fixed charge and a shared expense in the client's file:
    // that is exactly why the family is part of the key.
    const loyer = STANDARD_CATEGORIES.filter((c) => c.label === 'Loyer');
    assert.equal(loyer.length, 2);
    assert.deepEqual(
      loyer.map((c) => c.family).sort(),
      ['fixed', 'shared'],
    );
  });

  test('every family keeps an "Autre" category — the client\'s own rule', () => {
    for (const code of CATEGORY_FAMILY_CODES) {
      const others = standardCategoriesOfFamily(code).filter((c) => c.label.startsWith('Autre'));
      assert.ok(others.length >= 1, `${code} must offer an "Autre" category`);
    }
  });

  test('lookups answer, and answer null rather than throwing', () => {
    assert.equal(standardCategoryByKey('income.salaire_net').label, 'Salaire net');
    assert.equal(standardCategoryByKey('income.nope'), null);
    assert.equal(categoryFamilyByCode('debt').label, 'Dettes / passifs');
    assert.equal(categoryFamilyByCode('nope'), null);
  });
});

describe('the metadata socle', () => {
  test('a complete row is valid', () => {
    assert.deepEqual(checkFinancialRow(row()), []);
  });

  test('an object with no amount of its own is valid without currency or value', () => {
    const { currency, value, ...noAmount } = row();
    assert.deepEqual(checkFinancialRow(noAmount, { amounts: false }), []);
    // ...but the same row IS incomplete when it is supposed to carry an amount.
    assert.deepEqual(checkFinancialRow(noAmount), ['no currency', 'amount is not a whole number of centimes']);
  });

  test('a value nobody declared is refused in every vocabulary', () => {
    assert.deepEqual(checkFinancialRow(row({ status: 'maybe' })), ['unknown status "maybe"']);
    assert.deepEqual(checkFinancialRow(row({ scope: 'planet' })), ['unknown scope "planet"']);
    assert.deepEqual(checkFinancialRow(row({ source: 'telepathy' })), ['unknown source "telepathy"']);
    assert.deepEqual(checkFinancialRow(row({ confidence: 'vibes' })), ['unknown confidence "vibes"']);
    assert.deepEqual(checkFinancialRow(row({ consentUses: ['resale'] })), ['consent uses are not a list of declared uses']);
  });

  test('confidence is optional — the client says "lorsque pertinent"', () => {
    for (const confidence of [undefined, null, ...CONFIDENCE_LEVELS]) {
      assert.deepEqual(checkFinancialRow(row({ confidence })), [], `confidence ${confidence}`);
    }
  });

  test('the same consent use twice is refused: it would look like a change in the trail', () => {
    assert.deepEqual(checkFinancialRow(row({ consentUses: ['export', 'export'] })), ['the same consent use is listed twice']);
  });

  test('an amount is a whole number of centimes, never a float', () => {
    assert.deepEqual(checkFinancialRow(row({ value: 1500.5 })), ['amount is not a whole number of centimes']);
    assert.deepEqual(checkFinancialRow(row({ value: Number.MAX_SAFE_INTEGER + 2 })), ['amount is not a whole number of centimes']);
    assert.deepEqual(checkFinancialRow(row({ value: -2500 })), [], 'a negative amount is a legitimate flow');
  });

  test('a currency is required and must be an ISO code', () => {
    assert.ok(isCurrencyCode('DZD'));
    assert.ok(!isCurrencyCode('dzd'), 'stored upper case');
    assert.ok(!isCurrencyCode('DINAR'));
    assert.ok(!isCurrencyCode(''));
    assert.deepEqual(checkFinancialRow(row({ currency: 'DA' })), ['no currency']);
  });

  test('dates and version are checked', () => {
    assert.deepEqual(checkFinancialRow(row({ effectiveAt: '2026-10-12' })), ['no effective date']);
    assert.deepEqual(checkFinancialRow(row({ collectedAt: new Date('nope') })), ['no collection date']);
    assert.deepEqual(checkFinancialRow(row({ version: 0 })), ['version is not a positive integer']);
    assert.deepEqual(checkFinancialRow(row({ version: 1.5 })), ['version is not a positive integer']);
  });

  test('anything that is not a record is reported, not crashed on', () => {
    for (const value of [null, undefined, 42, 'row']) assert.deepEqual(checkFinancialRow(value), ['not a record']);
  });

  test('every vocabulary holds exactly what the client listed', () => {
    assert.deepEqual(DATA_SCOPES, ['personal', 'couple', 'household', 'space']);
    assert.deepEqual(DATA_SOURCES, ['manual', 'imported', 'document', 'partner', 'computed']);
    assert.deepEqual(DATA_STATUSES, ['real', 'declared', 'imported', 'computed', 'fictional', 'official', 'to_confirm']);
    assert.ok(DATA_STATUSES.includes(FICTIONAL_STATUS));
    assert.deepEqual(CONSENT_USES, ['shared_space', 'export']);
  });

  test('every table declared as financial names a model and says whether it carries amounts', () => {
    for (const entry of FINANCIAL_TABLES) {
      assert.equal(typeof entry.model, 'string');
      assert.equal(typeof entry.table, 'string');
      assert.equal(typeof entry.label, 'string');
      assert.equal(typeof entry.amounts, 'boolean');
    }
  });

  test('a table read as « live rows » has a deletedAt column, unless it says it has none', () => {
    // fin_occurrences (P8-11) joined the registry without a deletedAt, and the
    // inventory and the export, which filter on it, answered 500.
    const schema = readFileSync(new URL('../../prisma/schema.prisma', import.meta.url), 'utf8');
    const columnsOf = new Map(
      [...schema.matchAll(/^model \w+ \{([\s\S]*?)^\}/gm)].map((m) => [m[1].match(/@@map\("(\w+)"\)/)?.[1], m[1]]),
    );
    for (const entry of FINANCIAL_TABLES) {
      const body = columnsOf.get(entry.table);
      assert.ok(body, `${entry.table} is a mapped model`);
      assert.equal(/^\s+deletedAt\s/m.test(body), entry.softDelete !== false, `${entry.table}: deletedAt and softDelete agree`);
    }
  });
});

describe('real and fictional are never added together', () => {
  test('each total is computed on its own, and the counts say what was seen', () => {
    const totals = totalsByReality(
      [row({ value: 10000 }), row({ value: 2500 }), row({ status: FICTIONAL_STATUS, value: 500000000 })],
      { currency: 'DZD' },
    );
    assert.equal(totals.real, 12500);
    assert.equal(totals.fictional, 500000000);
    assert.deepEqual(totals.counts, { real: 2, fictional: 1, unknown: 0 });
  });

  test('a row whose status cannot be read lands in NEITHER total', () => {
    const totals = totalsByReality([row({ value: 10000 }), row({ status: 'maybe', value: 999 })], { currency: 'DZD' });
    assert.equal(totals.real, 10000, 'the unreadable row is not counted as real');
    assert.equal(totals.fictional, null);
    assert.deepEqual(totals.counts, { real: 1, fictional: 0, unknown: 1 });
  });

  test('no fictional row at all gives null, not 0 — "nothing to simulate" is not "zero"', () => {
    const totals = totalsByReality([row({ value: 700 })], { currency: 'DZD' });
    assert.equal(totals.fictional, null);
  });

  test('a mixed-currency total is not computable (no dated rate, no invented conversion)', () => {
    const totals = totalsByReality([row({ value: 700 }), row({ value: 700, currency: 'EUR' })], { currency: 'DZD' });
    assert.equal(totals.real, null);
  });

  test('isReal and isFictional read the status, and an unreadable status is neither', () => {
    assert.ok(isReal(row()));
    assert.ok(!isFictional(row()));
    assert.ok(isFictional(row({ status: FICTIONAL_STATUS })));
    assert.ok(!isReal(row({ status: FICTIONAL_STATUS })));
    assert.ok(!isReal(row({ status: 'maybe' })));
    assert.ok(!isFictional(row({ status: 'maybe' })));
  });

  test('a list that is not a list is null, never an empty total', () => {
    assert.equal(totalsByReality(null), null);
  });
});

describe('the correction trail', () => {
  test('only declared fields are journalled', () => {
    assert.deepEqual(JOURNALLED_FIELDS.category.includes('label'), true);
    const changes = diffFields('category', { label: 'A', scope: 'personal' }, { label: 'B', scope: 'couple' });
    assert.deepEqual(changes, [
      { field: 'label', before: 'A', after: 'B' },
      { field: 'scope', before: 'personal', after: 'couple' },
    ]);
  });

  test('a field nobody declared is ignored, and an unknown entity journals nothing', () => {
    assert.deepEqual(diffFields('category', { label: 'A', secret: 1 }, { label: 'A', secret: 2 }), []);
    assert.deepEqual(diffFields('nothing', { label: 'A' }, { label: 'B' }), []);
  });

  test('a change that changed nothing journals nothing', () => {
    assert.deepEqual(diffFields('category', { label: 'A', consentUses: ['export'] }, { label: 'A', consentUses: ['export'] }), []);
  });

  test('a list field is compared by content, not by identity', () => {
    const changes = diffFields('category', { consentUses: [] }, { consentUses: ['shared_space'] });
    assert.deepEqual(changes, [{ field: 'consentUses', before: [], after: ['shared_space'] }]);
  });
});

describe('P8-27 — every category has a colour', () => {
  test('each standard category, each group of the 125, each family', async () => {
    const { STANDARD_CATEGORIES, GROUP_COLORS, FAMILY_COLORS, CATEGORY_FAMILY_CODES, categoryColor } = await import('../../src/constants/finCategories.js');
    const hex = /^#[0-9A-Fa-f]{6}$/;
    assert.deepEqual(STANDARD_CATEGORIES.filter((c) => !hex.test(categoryColor(c) ?? '')).map((c) => c.key), []);
    assert.ok(CATEGORY_FAMILY_CODES.every((family) => hex.test(FAMILY_COLORS[family])), 'a colour per family');
    const groups = new Set(STANDARD_CATEGORIES.filter((c) => c.group).map((c) => `${c.family}:${c.group}`));
    assert.deepEqual([...groups].filter((key) => !GROUP_COLORS[key]), [], 'a colour per group');
    // A person's own category without a colour takes its family's.
    assert.equal(categoryColor({ family: 'variable', color: null, group: null }), FAMILY_COLORS.variable);
  });
});
