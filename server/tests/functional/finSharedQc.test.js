import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// The client's eight collective scenarios (tab 16 of the shared workbook), with
// the client's own figures, in centimes (9 000 DA = 900 000). QC-04, QC-06, QC-07
// and QC-08 are also proved where their feature lives (finSharedPersonalLink,
// finSpaceBudget, finSpaceTask, finSharedRules); this file holds the three that
// are pure arithmetic and the one about privacy, so the eight can be read in
// one place.

let t;
let a;
let b;
let c;
let space;
let idA;
let idB;
let idC;

const DAY = 24 * 3600 * 1000;
const iso = (date) => date.toISOString();
const yesterday = () => iso(new Date(Date.now() - DAY));

async function join(user) {
  const invite = await t.request('POST', `/fin/espaces/${space.id}/invitations`, { user: a, json: { role: 'member' } });
  assert.equal((await t.request('POST', '/fin/espaces/rejoindre', { user, json: { token: invite.body.token } })).status, 201);
  return (await t.request('GET', `/fin/espaces/${space.id}/membres`, { user })).body.membres.find((m) => m.isMe).id;
}
const spend = (json) => t.request('POST', `/fin/espaces/${space.id}/depenses`, { user: a, json: { label: 'Dépense', occurredAt: yesterday(), splitMode: 'equal', ...json } });
const balances = async () => {
  const res = await t.request('GET', `/fin/espaces/${space.id}/soldes`, { user: a });
  return { net: Object.fromEntries(res.body.soldes.map((row) => [row.memberId, row.solde.resultat])), plan: res.body.plan };
};

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  a = await t.user();
  b = await t.user();
  c = await t.user();
  space = (await t.request('POST', '/fin/espaces', { user: a, json: { kind: 'group', label: 'Groupe', currency: 'DZD' } })).body.space;
  idA = (await t.request('GET', `/fin/espaces/${space.id}/membres`, { user: a })).body.membres.find((m) => m.isMe).id;
  idB = await join(b);
  idC = await join(c);
});
after(() => t.close());

describe('the client’s collective scenarios', () => {
  test('QC-01 — A pays 9 000 for A, B and C: 3 000 each; A +6 000, B and C −3 000', async () => {
    const res = await spend({ value: 900000, payerId: idA, participants: [{ memberId: idA }, { memberId: idB }, { memberId: idC }] });
    assert.deepEqual(res.body.expense.shares.map((s) => s.share), [300000, 300000, 300000]);
    const { net } = await balances();
    assert.deepEqual(net, { [idA]: 600000, [idB]: -300000, [idC]: -300000 });
  });

  test('QC-02 — A pays 6 000 for B and C only: A +6 000, B and C −3 000, A’s share 0', async () => {
    const res = await spend({ value: 600000, payerId: idA, participants: [{ memberId: idB }, { memberId: idC }] });
    assert.ok(!res.body.expense.shares.some((s) => s.memberId === idA), 'A owes no share');
    const { net } = await balances();
    assert.deepEqual(net, { [idA]: 600000, [idB]: -300000, [idC]: -300000 });
  });

  test('QC-03 — crossed balances are settled with fewer transfers, and nobody’s net changes', async () => {
    // A pays for B and C; B pays for A and C; C pays for A and B — crossed debts.
    await spend({ value: 900000, payerId: idA, participants: [{ memberId: idA }, { memberId: idB }, { memberId: idC }] });
    await spend({ value: 300000, payerId: idB, participants: [{ memberId: idA }, { memberId: idB }, { memberId: idC }] });
    await spend({ value: 150000, payerId: idC, participants: [{ memberId: idA }, { memberId: idB }] });
    const { net, plan } = await balances();
    assert.equal(Object.values(net).reduce((x, y) => x + y, 0), 0, 'the balances of a space add up to zero');
    assert.ok(plan.transferts.length <= 2, 'at most n − 1 transfers for three people');
    // Applying the plan brings every member to zero: the nets are unchanged by the minimisation.
    const after = { ...net };
    for (const transfer of [...plan.transferts, ...(plan.masques ?? [])]) {
      after[transfer.from] += transfer.amount;
      after[transfer.to] -= transfer.amount;
    }
    assert.ok(Object.values(after).every((value) => value === 0), JSON.stringify(after));
  });

  test('QC-05 — B tries to see A’s personal transactions: refused, nothing exposed', async () => {
    const account = (await t.request('POST', '/fin/comptes', { user: a, json: { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 1000000, openingDate: iso(new Date(Date.now() - 30 * DAY)) } })).body.account;
    const mine = (await t.request('POST', '/fin/transactions', { user: a, json: { kind: 'expense', value: 12345, currency: 'DZD', occurredAt: yesterday(), accountId: account.id, note: 'secret' } })).body.transaction;
    await spend({ value: 900000, payerId: idA, participants: [{ memberId: idA }, { memberId: idB }], personalLink: { transactionId: mine.id } }).catch(() => null);

    const direct = await t.request('GET', `/fin/transactions/${mine.id}`, { user: b });
    assert.equal(direct.status, 404);
    const listed = await t.request('GET', '/fin/transactions', { user: b });
    assert.ok(!JSON.stringify(listed.body).includes(mine.id));
    for (const path of ['/depenses', '/soldes', '/rapport', '/activite', '/calendrier']) {
      const body = JSON.stringify((await t.request('GET', `/fin/espaces/${space.id}${path}`, { user: b })).body);
      assert.ok(!body.includes(mine.id) && !body.includes('secret') && !body.includes(account.id), `${path} leaks`);
    }
  });
});
