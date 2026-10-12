import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';
import { PDF, PNG, fileForm } from '../helpers/fixtures.js';

// "Mon argent" (P6-04) through the real API and database: resources, dated
// movements, the history of screen C08, the export, the receipts and the
// synthesis of screen C05.

let t;
let user;
let salary;
let food;

// Dates are relative to now, never fixed: a suite with hard-coded 2026 dates
// starts failing the month it is left behind, and a "future date" test would
// quietly become a past-date test.
const HOUR = 3600 * 1000;
const ago = (hours) => new Date(Date.now() - hours * HOUR).toISOString();
// An hour ago: always inside the current month, which is the period the
// synthesis looks at by default.
const recently = () => ago(1);
const tomorrow = () => new Date(Date.now() + 36 * HOUR).toISOString();

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  user = await t.user();
  // Two categories of the client's own reference (P6-02), by key.
  salary = await t.prisma.finCategory.findFirst({ where: { key: 'income.salaire_net', userId: null }, select: { id: true } });
  food = await t.prisma.finCategory.findFirst({ where: { key: 'variable.alimentation_boissons', userId: null }, select: { id: true } });
});
after(() => t.close());

const addIncome = (json) =>
  t.request('POST', '/fin/revenus', {
    user,
    json: { label: 'Salaire', value: 6000000, currency: 'DZD', frequency: 'mensuel', startDate: ago(200 * 24), ...json },
  });
const addMovement = (json) =>
  t.request('POST', '/fin/transactions', { user, json: { kind: 'expense', value: 250000, currency: 'DZD', occurredAt: recently(), ...json } });
const history = (query = '') => t.request('GET', `/fin/transactions${query}`, { user });

describe('recurring resources', () => {
  test('a resource is stored declared, personal, version 1', async () => {
    const res = await addIncome({ categoryId: salary.id });
    assert.equal(res.status, 201);
    assert.equal(res.body.income.status, 'declared');
    assert.equal(res.body.income.scope, 'personal');
    assert.equal(res.body.income.version, 1);
    assert.equal(res.body.income.frequency, 'mensuel');
  });

  test('a frequency is MANDATORY and must be one the engine knows', async () => {
    const { frequency, ...withoutFrequency } = { frequency: 'mensuel' };
    assert.equal(
      (await t.request('POST', '/fin/revenus', { user, json: { label: 'X', value: 100, currency: 'DZD', startDate: ago(200 * 24), ...withoutFrequency } }))
        .status,
      400,
      'no frequency is refused',
    );
    assert.equal((await addIncome({ frequency: 'quand-je-peux' })).status, 400);
  });

  test('an amount must be a whole number of centimes, and the currency an ISO code', async () => {
    assert.equal((await addIncome({ value: 1500.5 })).status, 400);
    assert.equal((await addIncome({ currency: 'DA' })).status, 400);
    assert.equal((await addIncome({ currency: 'dzd' })).status, 201, 'lower case is accepted and stored upper case');
  });

  test('a resource ending before it starts is refused', async () => {
    assert.equal((await addIncome({ endDate: ago(400 * 24) })).status, 400);
  });

  test('a category that is not usable is refused with a reason', async () => {
    const other = await t.user();
    const theirs = (await t.request('POST', '/fin/categories', { user: other, json: { family: 'income', label: 'Leur revenu' } })).body.category;
    const res = await addIncome({ categoryId: theirs.id });
    assert.equal(res.status, 422);
    assert.deepEqual(res.body.error.details, { reason: 'unknownCategory' });
  });

  test('an archived category cannot be chosen anew', async () => {
    const mine = (await t.request('POST', '/fin/categories', { user, json: { family: 'income', label: 'Ancien job' } })).body.category;
    await t.request('PUT', `/fin/categories/${mine.id}/archive`, { user, json: { archived: true } });
    const res = await addIncome({ categoryId: mine.id });
    assert.equal(res.status, 422);
    assert.deepEqual(res.body.error.details, { reason: 'archivedCategory' });
  });

  test('a correction bumps the version and leaves a journal entry', async () => {
    const income = (await addIncome()).body.income;
    const res = await t.request('PATCH', `/fin/revenus/${income.id}`, { user, json: { value: 6500000, reason: 'augmentation' } });
    assert.equal(res.status, 200);
    assert.equal(res.body.income.version, 2);
    const trail = await t.request('GET', `/fin/revenus/${income.id}/historique`, { user });
    assert.deepEqual(
      trail.body.changes.map((change) => [change.action, change.field, change.reason]),
      [
        ['create', null, null],
        ['correct', 'value', 'augmentation'],
      ],
    );
  });

  test('archiving removes it from the list without deleting it; deleting is logical', async () => {
    const income = (await addIncome()).body.income;
    await t.request('PUT', `/fin/revenus/${income.id}/archive`, { user, json: { archived: true } });
    assert.equal((await t.request('GET', '/fin/revenus', { user })).body.incomes.length, 0);
    assert.equal((await t.request('GET', '/fin/revenus?includeArchived=true', { user })).body.incomes.length, 1);

    await t.request('DELETE', `/fin/revenus/${income.id}`, { user, json: {} });
    assert.equal((await t.request('GET', '/fin/revenus?includeArchived=true', { user })).body.incomes.length, 0);
    const row = await t.prisma.finIncome.findUnique({ where: { id: income.id } });
    assert.ok(row.deletedAt, 'the row survives, dated');
  });
});

describe('entering a movement', () => {
  test('a realised expense is real; a planned one is declared', async () => {
    assert.equal((await addMovement()).body.transaction.status, 'real');
    const planned = await addMovement({ planned: true, occurredAt: tomorrow() });
    assert.equal(planned.body.transaction.status, 'declared');
    assert.equal(planned.body.transaction.planned, true);
  });

  test('a future date is refused unless the expense is planned', async () => {
    const refused = await addMovement({ occurredAt: tomorrow() });
    assert.equal(refused.status, 422);
    assert.deepEqual(refused.body.error.details, { reason: 'futureDate' });
    // And a planned INCOME is not a thing: only an expense can be planned.
    assert.equal((await addMovement({ kind: 'income', planned: true, occurredAt: tomorrow() })).status, 422);
  });

  test('an uncategorised movement is accepted and counted apart', async () => {
    assert.equal((await addMovement({ categoryId: null })).status, 201);
    const res = await t.request('GET', '/fin/argent/synthese', { user });
    assert.equal(res.body.synthese.nonCategorisees, 1);
  });

  test('a suspected duplicate is SIGNALLED, and the movement is still saved', async () => {
    await addMovement({ categoryId: food.id });
    const second = await addMovement({ categoryId: food.id });
    assert.equal(second.status, 201, 'never refused');
    assert.equal(second.body.duplicates.length, 1);
    assert.equal(await t.prisma.finTransaction.count({ where: { userId: user.id } }), 2);
  });

  test('a different amount, kind or category is not a duplicate', async () => {
    await addMovement({ categoryId: food.id });
    assert.deepEqual((await addMovement({ categoryId: food.id, value: 250001 })).body.duplicates, []);
    assert.deepEqual((await addMovement({ categoryId: null })).body.duplicates, []);
  });

  test('a movement far from the first in time is not a duplicate', async () => {
    await addMovement({ categoryId: food.id, occurredAt: ago(3) });
    assert.deepEqual((await addMovement({ categoryId: food.id, occurredAt: ago(10 * 24) })).body.duplicates, []);
  });

  test('the metadata the server owns cannot be set from the body', async () => {
    for (const json of [{ source: 'partner' }, { version: 9 }, { userId: 'x' }, { status: 'official' }, { note: 'x'.repeat(301) }]) {
      assert.equal((await addMovement(json)).status, 400, JSON.stringify(json));
    }
  });

  test('a teaching row may be declared fictional, and says so', async () => {
    const res = await addMovement({ status: 'fictional' });
    assert.equal(res.body.transaction.status, 'fictional');
  });
});

describe('the history of screen C08', () => {
  beforeEach(async () => {
    await addMovement({ value: 100000, categoryId: food.id, note: 'Courses du marché', occurredAt: ago(9 * 24) });
    await addMovement({ value: 900000, categoryId: null, note: 'Réparation', occurredAt: ago(2 * 24) });
    await addMovement({ kind: 'income', value: 500000, categoryId: salary.id, occurredAt: ago(8 * 24) });
    await addMovement({ value: 700000, planned: true, occurredAt: tomorrow() });
  });

  test('everything comes back by default, most recent first', async () => {
    const res = await history();
    assert.equal(res.status, 200);
    assert.equal(res.body.total, 4);
    const dates = res.body.transactions.map((row) => row.occurredAt);
    assert.deepEqual([...dates].sort().reverse(), dates, 'ordered most recent first');
  });

  test('the text search looks in the notes', async () => {
    const res = await history('?text=march');
    assert.equal(res.body.total, 1);
    assert.equal(res.body.transactions[0].note, 'Courses du marché');
  });

  test('filters narrow the set, and the totals follow the filters', async () => {
    const expenses = await history('?kind=expense');
    assert.equal(expenses.body.total, 3);
    // What happened and what is only planned are two totals: the client's own
    // screens distinguish « prevu / reel ».
    assert.equal(expenses.body.totals.real.expense, 100000 + 900000);
    assert.equal(expenses.body.totals.planned.expense, 700000);
    assert.deepEqual(expenses.body.totals.counts, { real: 2, planned: 1, fictional: 0 });

    const incomes = await history('?kind=income');
    assert.equal(incomes.body.totals.real.income, 500000);
    assert.equal(incomes.body.totals.planned, null, 'no planned income: null, not zero');
  });

  test('"only uncategorised" is asked for explicitly', async () => {
    const res = await history('?uncategorised=true');
    assert.equal(res.body.total, 2, 'the uncategorised expense and the planned one');
    assert.ok(res.body.transactions.every((row) => row.categoryId === null));
  });

  test('amount and date bounds work, and an impossible range is refused', async () => {
    assert.equal((await history('?minAmount=500000')).body.total, 3);
    assert.equal((await history('?minAmount=200000&maxAmount=800000')).body.total, 2);
    assert.equal((await history(`?from=${ago(5 * 24)}`)).body.total, 2);
    assert.equal((await history('?minAmount=900&maxAmount=100')).status, 400);
    assert.equal((await history(`?from=${ago(2 * 24)}&to=${ago(9 * 24)}`)).status, 400);
  });

  test('an empty query string is accepted: that is what the interface sends with no filter', async () => {
    // The page builds `/fin/transactions?${query}`, so with nothing filtered the
    // URL really ends in a bare "?" — it must not be read as an unknown filter.
    assert.equal((await history('?')).body.total, 4);
    const exported = await fetch(`${t.baseUrl}/api/fin/transactions/export?`, { headers: { Cookie: `session=${t.signSession(user.id)}` } });
    assert.equal(exported.status, 200);
  });

  test('sorting is a closed list: anything else is refused rather than used as SQL', async () => {
    const res = await history('?sort=amount_desc');
    assert.equal(res.body.transactions[0].value, 900000);
    assert.equal((await history('?sort=value;DROP')).status, 400);
    assert.equal((await history('?unknownFilter=1')).status, 400);
  });

  test('recategorising in place is a correction, journalled', async () => {
    const target = (await history('?text=Réparation')).body.transactions[0];
    const res = await t.request('PATCH', `/fin/transactions/${target.id}`, { user, json: { categoryId: food.id } });
    assert.equal(res.status, 200);
    assert.equal(res.body.transaction.categoryId, food.id);
    const trail = await t.request('GET', `/fin/transactions/${target.id}/historique`, { user });
    assert.ok(trail.body.changes.some((change) => change.action === 'correct'));
  });

  test('pagination says how many pages there are', async () => {
    const res = await history('?pageSize=2');
    assert.equal(res.body.pageSize, 2);
    assert.equal(res.body.pages, 2);
    assert.equal(res.body.transactions.length, 2);
    assert.equal((await history('?pageSize=2&page=2')).body.transactions.length, 2);
  });

  test('the export is a CSV of the SAME filtered set', async () => {
    const res = await fetch(`${t.baseUrl}/api/fin/transactions/export?kind=expense`, { headers: { Cookie: `session=${t.signSession(user.id)}` } });
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /text\/csv/);
    const lines = (await res.text()).trim().split('\r\n');
    assert.equal(lines.length, 4, 'a header and the three expenses');
    assert.ok(lines[0].includes('"amount"'));
    // Centimes as stored: an export that rounded would not match the screen.
    assert.ok(lines.some((line) => line.includes('"900000"')));
  });

  test('a note that looks like a formula is neutralised in the export', async () => {
    await addMovement({ value: 1234, note: '=SUM(A1:A9)' });
    const res = await fetch(`${t.baseUrl}/api/fin/transactions/export?text=SUM`, { headers: { Cookie: `session=${t.signSession(user.id)}` } });
    const body = await res.text();
    assert.ok(body.includes(`"'=SUM(A1:A9)"`), 'prefixed so a spreadsheet cannot execute it');
  });
});

describe('receipts', () => {
  test('an image or a document can be attached, and replaces the previous one', async () => {
    const movement = (await addMovement()).body.transaction;
    // Counted as a DIFFERENCE: reset() empties the tables but not the storage
    // directory, so files other tests uploaded are still sitting there.
    const before = t.storedFiles().length;
    const first = await t.request('POST', `/fin/transactions/${movement.id}/justificatif`, { user, form: fileForm(PNG, { name: 'ticket.png' }) });
    assert.equal(first.status, 201);
    assert.equal(first.body.receipt.kind, 'image');
    assert.equal(t.storedFiles().length, before + 1);
    const firstKey = (await t.prisma.media.findUnique({ where: { id: first.body.receipt.id } })).storageKey;

    const second = await t.request('POST', `/fin/transactions/${movement.id}/justificatif`, {
      user,
      form: fileForm(PDF, { name: 'facture.pdf', type: 'application/pdf' }),
    });
    assert.equal(second.status, 201);
    assert.ok(!t.storedFiles().includes(firstKey), 'the replaced file is gone from disk');
    assert.equal(t.storedFiles().length, before + 1);
    assert.equal(await t.prisma.media.count(), 1, 'and so is its row');
  });

  test('the receipt is served to its owner, privately, never cached', async () => {
    const movement = (await addMovement()).body.transaction;
    await t.request('POST', `/fin/transactions/${movement.id}/justificatif`, { user, form: fileForm(PNG, { name: 'ticket.png' }) });
    const res = await t.request('GET', `/fin/transactions/${movement.id}/justificatif`, { user, raw: false });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('cache-control'), 'private, no-store');
  });

  test('a transaction with no receipt answers 404, and deleting one removes the file', async () => {
    const movement = (await addMovement()).body.transaction;
    assert.equal((await t.request('GET', `/fin/transactions/${movement.id}/justificatif`, { user })).status, 404);
    const added = await t.request('POST', `/fin/transactions/${movement.id}/justificatif`, { user, form: fileForm(PNG, { name: 'ticket.png' }) });
    const key = (await t.prisma.media.findUnique({ where: { id: added.body.receipt.id } })).storageKey;
    assert.equal((await t.request('DELETE', `/fin/transactions/${movement.id}/justificatif`, { user })).status, 200);
    assert.ok(!t.storedFiles().includes(key), 'the file is gone from disk');
    assert.equal(await t.prisma.media.count(), 0);
  });

  test('a file of the wrong kind is refused and leaves nothing behind', async () => {
    const movement = (await addMovement()).body.transaction;
    const res = await t.request('POST', `/fin/transactions/${movement.id}/justificatif`, {
      user,
      form: fileForm(Buffer.from('not a real file'), { name: 'x.exe', type: 'application/octet-stream' }),
    });
    assert.equal(res.status, 415);
    assert.equal(await t.prisma.media.count(), 0, 'nothing was recorded');
    assert.equal(await t.prisma.media.count({ where: { finTransactionId: { not: null } } }), 0);
  });
});

describe('the synthesis of screen C05', () => {
  test('every figure carries its formula, its version and its inputs', async () => {
    await addIncome({ categoryId: salary.id });
    await addMovement({ value: 250000, categoryId: food.id });
    const res = await t.request('GET', '/fin/argent/synthese', { user });
    assert.equal(res.status, 200);
    const s = res.body.synthese;
    assert.equal(s.revenus.formule_id, 'F002');
    assert.equal(s.depenses.formule_id, 'F003');
    assert.equal(s.fluxNet.formule_id, 'F004');
    assert.equal(s.fluxNet.resultat, 6000000 - 250000);
    assert.equal(s.revenus.unite, 'DZD');
    assert.ok(s.revenus.calcule_le);
  });

  test('an empty account says "not computed", never zero', async () => {
    const s = (await t.request('GET', '/fin/argent/synthese', { user })).body.synthese;
    assert.equal(s.revenus.resultat, null);
    assert.equal(s.depenses.resultat, null);
    assert.equal(s.fluxNet.resultat, null);
  });

  test('the breakdown carries the category labels', async () => {
    await addMovement({ value: 250000, categoryId: food.id });
    const s = (await t.request('GET', '/fin/argent/synthese', { user })).body.synthese;
    assert.deepEqual(s.repartition, [{ categoryId: food.id, total: 250000, label: 'Alimentation / boissons' }]);
  });

  test('fictional movements are a separate badged block, never added to the real total', async () => {
    await addMovement({ value: 250000 });
    await addMovement({ value: 9000000, status: 'fictional' });
    const s = (await t.request('GET', '/fin/argent/synthese', { user })).body.synthese;
    assert.equal(s.depenses.resultat, 250000);
    assert.equal(s.simulation.badge, 'SIMULATION');
    assert.equal(s.simulation.depenses, 9000000);
  });

  test('two currencies compute no total and say why', async () => {
    await addMovement({ value: 250000, currency: 'DZD' });
    await addMovement({ value: 1000, currency: 'EUR' });
    const s = (await t.request('GET', '/fin/argent/synthese', { user })).body.synthese;
    assert.equal(s.mixedCurrencies, true);
    assert.equal(s.depenses.resultat, null);
  });

  test('a period can be asked for, and both ends are needed', async () => {
    // Forty days back: outside the current month, so the default synthesis must
    // not see it and the explicit period must.
    await addMovement({ value: 250000, occurredAt: ago(40 * 24) });
    assert.equal((await t.request('GET', '/fin/argent/synthese', { user })).body.synthese.depenses.resultat, null);

    const from = ago(60 * 24);
    const to = ago(30 * 24);
    const res = await t.request('GET', `/fin/argent/synthese?from=${from}&to=${to}`, { user });
    assert.equal(res.body.synthese.depenses.resultat, 250000);
    assert.equal((await t.request('GET', `/fin/argent/synthese?from=${from}`, { user })).status, 400);
  });

  test('the references publish the vocabularies and the formulas used', async () => {
    const res = await t.request('GET', '/fin/argent/references', { user });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.kinds, ['income', 'expense']);
    assert.ok(res.body.paymentMethods.includes('ccp'));
    assert.deepEqual(
      res.body.formulas.map((formula) => formula.id),
      ['F002', 'F003', 'F004'],
    );
    assert.equal(res.body.formulas[0].label, 'Total revenus', "the client's own wording");
  });
});
