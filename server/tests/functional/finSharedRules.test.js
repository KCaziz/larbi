import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// P9-04: shared expenses split by weight and by usage (COL-F03), cancelled
// expenses (QC-08), planned expenses, and the small balance (A4): a debt below
// the threshold is no longer PROPOSED, but the balance is never erased.

let t;
let owner;
let flatmate;
let space;
let ownerId;
let flatmateId;

const DAY = 24 * 3600 * 1000;
const iso = (date) => date.toISOString();
const ago = (days) => new Date(Date.now() - days * DAY);
const inDays = (days) => new Date(Date.now() + days * DAY);

async function memberId(user) {
  const res = await t.request('GET', `/fin/espaces/${space.id}/membres`, { user });
  return res.body.membres.find((m) => m.isMe).id;
}

const spend = (json) =>
  t.request('POST', `/fin/espaces/${space.id}/depenses`, {
    user: owner,
    json: { label: 'Facture', value: 1000000, occurredAt: iso(ago(1)), splitMode: 'equal', payerId: ownerId, participants: [{ memberId: ownerId }, { memberId: flatmateId }], ...json },
  });
const balances = () => t.request('GET', `/fin/espaces/${space.id}/soldes`, { user: owner });

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  owner = await t.user();
  flatmate = await t.user();
  space = (await t.request('POST', '/fin/espaces', { user: owner, json: { kind: 'flatshare', label: 'Coloc', currency: 'DZD' } })).body.space;
  const invite = await t.request('POST', `/fin/espaces/${space.id}/invitations`, { user: owner, json: { role: 'member' } });
  assert.equal((await t.request('POST', '/fin/espaces/rejoindre', { user: flatmate, json: { token: invite.body.token } })).status, 201);
  ownerId = await memberId(owner);
  flatmateId = await memberId(flatmate);
});
after(() => t.close());

describe('split by weight and by usage (COL-F03)', () => {
  test('by weight: 1 and 3 share 1 000 000 as 250 000 and 750 000', async () => {
    const res = await spend({ splitMode: 'weighted', participants: [{ memberId: ownerId, weight: 1 }, { memberId: flatmateId, weight: 3 }] });
    assert.equal(res.status, 201, JSON.stringify(res.body).slice(0, 200));
    const shares = Object.fromEntries(res.body.expense.shares.map((s) => [s.memberId, s.share]));
    assert.deepEqual(shares, { [ownerId]: 250000, [flatmateId]: 750000 });
    assert.equal(res.body.expense.shares.find((s) => s.memberId === flatmateId).weight, 3, 'the weight that produced the share is kept');
  });

  test('by weight: a zero or missing weight is refused', async () => {
    assert.equal((await spend({ splitMode: 'weighted', participants: [{ memberId: ownerId, weight: 0 }, { memberId: flatmateId, weight: 3 }] })).status, 422);
    assert.equal((await spend({ splitMode: 'weighted', participants: [{ memberId: ownerId }, { memberId: flatmateId, weight: 3 }] })).status, 400);
  });

  test('by usage: the unit is named, the shares follow the units used, a member may use none', async () => {
    const res = await spend({ splitMode: 'usage', usageUnit: 'kWh', participants: [{ memberId: ownerId, weight: 0 }, { memberId: flatmateId, weight: 120 }] });
    assert.equal(res.status, 201, JSON.stringify(res.body).slice(0, 200));
    assert.equal(res.body.expense.usageUnit, 'kWh');
    assert.deepEqual(res.body.expense.shares.map((s) => s.share).sort((a, b) => a - b), [0, 1000000]);
  });

  test('by usage: no unit, or no usage at all, is refused', async () => {
    assert.equal((await spend({ splitMode: 'usage', participants: [{ memberId: ownerId, weight: 1 }, { memberId: flatmateId, weight: 1 }] })).status, 400);
    assert.equal((await spend({ splitMode: 'usage', usageUnit: 'kWh', participants: [{ memberId: ownerId, weight: 0 }, { memberId: flatmateId, weight: 0 }] })).status, 422);
  });
});

describe('cancelling an expense (QC-08)', () => {
  test('the balances are recomputed, the row and its trace stay, and it cannot be cancelled twice', async () => {
    const expense = (await spend({})).body.expense;
    const before = (await balances()).body.soldes.find((s) => s.memberId === ownerId).solde.resultat;
    assert.equal(before, 500000);

    const cancelled = await t.request('POST', `/fin/espaces/${space.id}/depenses/${expense.id}/annuler`, { user: owner, json: { reason: 'saisie en double' } });
    assert.equal(cancelled.status, 200, JSON.stringify(cancelled.body).slice(0, 200));
    assert.equal(cancelled.body.expense.lifecycle, 'cancelled');

    const after = await balances();
    assert.ok(after.body.soldes.every((s) => s.solde.resultat === 0), 'a cancelled expense counts for nothing');
    const listed = await t.request('GET', `/fin/espaces/${space.id}/depenses`, { user: owner });
    assert.equal(listed.body.expenses.length, 1, 'it stays readable');
    const history = await t.request('GET', `/fin/espaces/${space.id}/depenses/${expense.id}/historique`, { user: owner });
    assert.ok(history.body.changes.some((c) => c.field === 'lifecycle' && c.after === 'cancelled' && c.reason === 'saisie en double'));

    assert.equal((await t.request('POST', `/fin/espaces/${space.id}/depenses/${expense.id}/annuler`, { user: owner, json: {} })).status, 409);
  });

  test('somebody who is neither the payer, the recorder nor an admin cannot cancel it', async () => {
    const expense = (await spend({})).body.expense;
    const res = await t.request('POST', `/fin/espaces/${space.id}/depenses/${expense.id}/annuler`, { user: flatmate, json: {} });
    assert.equal(res.status, 403);
  });
});

describe('planned expenses', () => {
  test('a planned expense may be dated ahead, counts for nothing, and is refused when it is not planned', async () => {
    assert.equal((await spend({ occurredAt: iso(inDays(5)) })).status, 422);
    const planned = await spend({ occurredAt: iso(inDays(5)), planned: true });
    assert.equal(planned.status, 201, JSON.stringify(planned.body).slice(0, 200));
    assert.equal(planned.body.expense.lifecycle, 'planned');
    assert.ok((await balances()).body.soldes.every((s) => s.solde.resultat === 0));
    assert.equal((await t.request('POST', `/fin/espaces/${space.id}/depenses/${planned.body.expense.id}/confirmer`, { user: owner })).status, 422, 'not before its date');
  });
});

describe('the small balance (A4)', () => {
  test('a debt under the threshold is not proposed, but the balance stays', async () => {
    // 100 DA owed (10 000 centimes), under the default 200 DA.
    await spend({ value: 20000 });
    const small = await balances();
    assert.equal(small.body.plan.transferts.length, 0);
    assert.equal(small.body.plan.masques.length, 1, 'the hidden proposal is still reported');
    assert.equal(small.body.soldes.find((s) => s.memberId === ownerId).solde.resultat, 10000, 'the debt is not erased');

    await spend({ value: 1000000 });
    assert.equal((await balances()).body.plan.transferts.length, 1);
  });

  test('the threshold is the space’s, and an admin can change it', async () => {
    await spend({ value: 20000 });
    const changed = await t.request('PATCH', `/fin/espaces/${space.id}`, { user: owner, json: { smallBalance: 5000 } });
    assert.equal(changed.status, 200, JSON.stringify(changed.body).slice(0, 200));
    assert.equal((await balances()).body.plan.transferts.length, 1);
  });
});
