import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';
import { PNG, fileForm } from '../helpers/fixtures.js';

// "Mon argent" (P6-04) and the onboarding (P6-03) hold the most personal data
// in the platform, so this is where the rule "données privées par défaut" is
// checked: one account must not read, change, or even learn the existence of
// another account's money — an administrator included.

// `eraseAccountReceipts` is imported AFTER boot(), not at the top of the file:
// storage.service.js reads STORAGE_DIR when it is first imported, and boot() is
// what points it at the test directory. A static import here would send every
// upload of this file to the real storage directory instead.
let eraseAccountReceipts;
let t;
let owner;
let intruder;
let admin;
let movement;
let income;

const recently = () => new Date(Date.now() - 3600 * 1000).toISOString();

before(async () => {
  t = await boot();
  ({ eraseAccountReceipts } = await import('../../src/services/finMoney.service.js'));
});
beforeEach(async () => {
  await t.reset();
  owner = await t.user();
  intruder = await t.user();
  admin = await t.admin();
  movement = (
    await t.request('POST', '/fin/transactions', {
      user: owner,
      json: { kind: 'expense', value: 250000, currency: 'DZD', occurredAt: recently(), note: 'Médicaments' },
    })
  ).body.transaction;
  income = (
    await t.request('POST', '/fin/revenus', {
      user: owner,
      json: { label: 'Salaire', value: 6000000, currency: 'DZD', frequency: 'mensuel', startDate: recently() },
    })
  ).body.income;
});
after(() => t.close());

describe("another account's money", () => {
  test('is not in their history, their resources or their synthesis', async () => {
    assert.equal((await t.request('GET', '/fin/transactions', { user: intruder })).body.total, 0);
    assert.deepEqual((await t.request('GET', '/fin/revenus', { user: intruder })).body.incomes, []);
    const synthesis = (await t.request('GET', '/fin/argent/synthese', { user: intruder })).body.synthese;
    assert.equal(synthesis.revenus.resultat, null, 'nothing to total, not someone else\'s total');
  });

  test('cannot be read, corrected or deleted — 404, never 403', async () => {
    // A 403 would confirm the id exists and belongs to someone, which is
    // itself information about another account.
    for (const [method, path, json] of [
      ['PATCH', `/fin/transactions/${movement.id}`, { value: 1 }],
      ['DELETE', `/fin/transactions/${movement.id}`, {}],
      ['GET', `/fin/transactions/${movement.id}/historique`, undefined],
      ['PATCH', `/fin/revenus/${income.id}`, { value: 1 }],
      ['DELETE', `/fin/revenus/${income.id}`, {}],
      ['GET', `/fin/revenus/${income.id}/historique`, undefined],
      ['PUT', `/fin/revenus/${income.id}/archive`, { archived: true }],
    ]) {
      const res = await t.request(method, path, { user: intruder, ...(json === undefined ? {} : { json }) });
      assert.equal(res.status, 404, `${method} ${path}`);
    }
    const unchanged = await t.prisma.finTransaction.findUnique({ where: { id: movement.id } });
    assert.equal(unchanged.value, 250000);
    assert.equal(unchanged.deletedAt, null);
  });

  test('is not reachable by an administrator either: money has no admin side', async () => {
    assert.equal((await t.request('GET', '/fin/transactions', { user: admin })).body.total, 0);
    assert.equal((await t.request('PATCH', `/fin/transactions/${movement.id}`, { user: admin, json: { value: 1 } })).status, 404);
    assert.equal((await t.request('GET', `/fin/transactions/${movement.id}/historique`, { user: admin })).status, 404);
  });

  test('a note someone typed never reaches another account, not even through the export', async () => {
    const res = await fetch(`${t.baseUrl}/api/fin/transactions/export`, { headers: { Cookie: `session=${t.signSession(intruder.id)}` } });
    const body = await res.text();
    assert.ok(!body.includes('Médicaments'));
  });

  test('every route needs a session', async () => {
    for (const [method, path] of [
      ['GET', '/fin/transactions'],
      ['GET', '/fin/transactions/export'],
      ['GET', '/fin/revenus'],
      ['GET', '/fin/argent/synthese'],
      ['GET', '/fin/argent/references'],
      ['POST', '/fin/transactions'],
      ['POST', '/fin/revenus'],
    ]) {
      const options = method === 'GET' ? {} : { json: {} };
      assert.equal((await t.request(method, path, options)).status, 401, `${method} ${path}`);
    }
  });
});

describe('receipts are private files', () => {
  let receiptPath;

  beforeEach(async () => {
    await t.request('POST', `/fin/transactions/${movement.id}/justificatif`, { user: owner, form: fileForm(PNG, { name: 'ordonnance.png' }) });
    receiptPath = `/fin/transactions/${movement.id}/justificatif`;
  });

  test('only the owner is served the file', async () => {
    assert.equal((await t.request('GET', receiptPath, { user: owner })).status, 200);
    assert.equal((await t.request('GET', receiptPath, { user: intruder })).status, 404);
    assert.equal((await t.request('GET', receiptPath, { user: admin })).status, 404);
    assert.equal((await t.request('GET', receiptPath)).status, 401);
  });

  test('there is no public URL for a receipt: the stored name is not a route', async () => {
    const media = await t.prisma.media.findFirst({ select: { id: true, storageKey: true } });
    for (const path of [`/uploads/${media.storageKey}`, `/storage/${media.storageKey}`, `/${media.storageKey}`]) {
      const res = await fetch(`${t.baseUrl}${path}`);
      assert.ok(res.status === 404 || res.status === 403, `${path} answered ${res.status}`);
    }
  });

  test('it is served with no-store, and cannot be embedded or executed', async () => {
    const res = await t.request('GET', receiptPath, { user: owner });
    assert.equal(res.headers.get('cache-control'), 'private, no-store');
    assert.equal(res.headers.get('content-security-policy'), "default-src 'none'; sandbox");
  });

  test('another account cannot attach a file to it, nor remove one', async () => {
    assert.equal((await t.request('POST', receiptPath, { user: intruder, form: fileForm(PNG, { name: 'x.png' }) })).status, 404);
    assert.equal((await t.request('DELETE', receiptPath, { user: intruder })).status, 404);
    assert.equal(await t.prisma.media.count(), 1, 'the owner still has their receipt');
  });
});

describe('what an account may not decide about its own rows', () => {
  test('the metadata the server owns cannot be set from the body', async () => {
    const base = { kind: 'expense', value: 100, currency: 'DZD', occurredAt: recently() };
    for (const extra of [{ source: 'partner' }, { version: 9 }, { userId: intruder.id }, { status: 'official' }, { finTransactionId: 'x' }, { createdAt: recently() }]) {
      assert.equal((await t.request('POST', '/fin/transactions', { user: owner, json: { ...base, ...extra } })).status, 400, JSON.stringify(extra));
    }
  });

  test('a correction cannot smuggle in a change of owner', async () => {
    assert.equal((await t.request('PATCH', `/fin/transactions/${movement.id}`, { user: owner, json: { userId: intruder.id } })).status, 400);
    const unchanged = await t.prisma.finTransaction.findUnique({ where: { id: movement.id } });
    assert.equal(unchanged.userId, owner.id);
  });

  test('a movement cannot point at a category belonging to someone else', async () => {
    const theirs = (await t.request('POST', '/fin/categories', { user: intruder, json: { family: 'variable', label: 'Leur poste' } })).body.category;
    const res = await t.request('PATCH', `/fin/transactions/${movement.id}`, { user: owner, json: { categoryId: theirs.id } });
    assert.equal(res.status, 422);
    assert.deepEqual(res.body.error.details, { reason: 'unknownCategory' });
  });

  test('a future date is refused unless the expense is planned — checked by the SERVER', async () => {
    const future = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
    assert.equal(
      (await t.request('POST', '/fin/transactions', { user: owner, json: { kind: 'expense', value: 100, currency: 'DZD', occurredAt: future } })).status,
      422,
    );
    // And a correction cannot move an unplanned movement into the future.
    assert.equal((await t.request('PATCH', `/fin/transactions/${movement.id}`, { user: owner, json: { occurredAt: future } })).status, 422);
  });

  test('the ordering of the history is a closed list, never SQL from the query', async () => {
    for (const sort of ['value; DROP TABLE fin_transactions', 'occurredAt desc', '(select 1)']) {
      const res = await t.request('GET', `/fin/transactions?sort=${encodeURIComponent(sort)}`, { user: owner });
      assert.equal(res.status, 400, sort);
    }
    assert.ok(await t.prisma.finTransaction.findUnique({ where: { id: movement.id } }), 'the table is still there');
  });
});

describe('the onboarding is as private as the rest', () => {
  test('one account never sees or writes another one\'s answers', async () => {
    await t.prisma.user.update({ where: { id: owner.id }, data: { finPublic: 'SAL' } });
    const user = await t.prisma.user.findUnique({ where: { id: owner.id } });
    await t.request('PUT', '/fin/onboarding', { user, json: { answers: { netSalary: { amount: 6000000, frequency: 'mensuel' } } } });

    const theirs = await t.request('GET', '/fin/onboarding', { user: intruder });
    assert.equal(theirs.status, 200);
    assert.equal(theirs.body.completeness.answered, 0, 'their own, empty onboarding');
    assert.equal(theirs.body.result.revenus.resultat, null);
    // An administrator is just another account here.
    assert.equal((await t.request('GET', '/fin/onboarding', { user: admin })).body.completeness.answered, 0);
  });
});

describe('erasing an account erases its money', () => {
  // The privacy text promises a complete and immediate deletion (P6-01 point 9,
  // decided 2026-10-11).
  test('resources, movements, onboarding and trail all go', async () => {
    await t.prisma.user.update({ where: { id: owner.id }, data: { finPublic: 'SAL' } });
    const user = await t.prisma.user.findUnique({ where: { id: owner.id } });
    await t.request('PUT', '/fin/onboarding', { user, json: { answers: { netSalary: { amount: 100000, frequency: 'mensuel' } } } });
    await t.request('POST', `/fin/transactions/${movement.id}/justificatif`, { user: owner, form: fileForm(PNG, { name: 'x.png' }) });
    assert.ok((await t.prisma.finChange.count({ where: { userId: owner.id } })) > 0);

    // The files are swept first: they have no foreign key to cascade through.
    const swept = await eraseAccountReceipts(t.prisma, owner.id);
    assert.equal(swept.length, 1, 'the receipt file was found and removed');
    await t.prisma.user.delete({ where: { id: owner.id } });

    for (const [label, count] of [
      ['transactions', t.prisma.finTransaction.count({ where: { userId: owner.id } })],
      ['incomes', t.prisma.finIncome.count({ where: { userId: owner.id } })],
      ['onboarding', t.prisma.finOnboarding.count({ where: { userId: owner.id } })],
      ['changes', t.prisma.finChange.count({ where: { userId: owner.id } })],
    ]) {
      assert.equal(await count, 0, label);
    }
    assert.equal(await t.prisma.media.count(), 0, 'and the receipt row with it');
    // The client's category reference is NOT part of the account's data.
    assert.equal(await t.prisma.finCategory.count({ where: { userId: null } }), 91 + 98, 'the 91 rows of P6-02 and the 98 universal categories of P8-08');
  });
});
