import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Recurring common bills (P6-15): ALG-04 only proposes, and the client's own
// rule is « un paiement confirmé crée la dépense partagée sans doublon ».

let t;
let owner;
let flatmate;
let stranger;
let space;
let ownerMemberId;

const iso = (date) => date.toISOString();
const ago = (days) => new Date(Date.now() - days * 24 * 3600 * 1000);

async function join(joiner, role = 'member') {
  const invite = await t.request('POST', `/fin/espaces/${space.id}/invitations`, { user: owner, json: { role } });
  await t.request('POST', '/fin/espaces/rejoindre', { user: joiner, json: { token: invite.body.token } });
}

async function memberId(user) {
  const res = await t.request('GET', `/fin/espaces/${space.id}/membres`, { user });
  return res.body.membres.find((m) => m.isMe).id;
}

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  owner = await t.user();
  flatmate = await t.user();
  stranger = await t.user();
  const res = await t.request('POST', '/fin/espaces', { user: owner, json: { kind: 'flatshare', label: 'Coloc', currency: 'DZD' } });
  space = res.body.space;
  await join(flatmate, 'member');
  ownerMemberId = await memberId(owner);
});
after(() => t.close());

describe('a space the caller is not in', () => {
  test('answers 404 on the recurrence routes', async () => {
    for (const [method, path, json] of [
      ['GET', `/fin/espaces/${space.id}/depenses-recurrentes`, undefined],
      ['POST', `/fin/espaces/${space.id}/depenses-recurrentes/confirmer`, { label: 'Loyer', value: 1000, occurredAt: iso(ago(1)), splitMode: 'equal', payerId: ownerMemberId, participants: [{ memberId: ownerMemberId }] }],
    ]) {
      const res = await t.request(method, path, { user: stranger, ...(json === undefined ? {} : { json }) });
      assert.equal(res.status, 404, `${method} ${path}`);
    }
  });
});

describe('confirming a recurring bill', () => {
  test('is refused a second time for the same bill and the same month (dedup)', async () => {
    const first = await t.request('POST', `/fin/espaces/${space.id}/depenses-recurrentes/confirmer`, {
      user: owner,
      json: { label: 'Loyer', value: 50000, occurredAt: iso(ago(1)), splitMode: 'equal', payerId: ownerMemberId, participants: [{ memberId: ownerMemberId }] },
    });
    assert.equal(first.status, 201);

    const second = await t.request('POST', `/fin/espaces/${space.id}/depenses-recurrentes/confirmer`, {
      user: owner,
      json: { label: 'Loyer', value: 50000, occurredAt: iso(ago(0.5)), splitMode: 'equal', payerId: ownerMemberId, participants: [{ memberId: ownerMemberId }] },
    });
    assert.equal(second.status, 422, 'same label, same calendar month: refused as a duplicate');

    const nextMonthDate = new Date();
    nextMonthDate.setUTCMonth(nextMonthDate.getUTCMonth() - 2);
    const third = await t.request('POST', `/fin/espaces/${space.id}/depenses-recurrentes/confirmer`, {
      user: owner,
      json: { label: 'Loyer', value: 50000, occurredAt: iso(nextMonthDate), splitMode: 'equal', payerId: ownerMemberId, participants: [{ memberId: ownerMemberId }] },
    });
    assert.equal(third.status, 201, 'a different calendar month is not a duplicate');
  });

  test('a viewer cannot confirm one', async () => {
    const viewer = await t.user();
    await join(viewer, 'viewer');
    const res = await t.request('POST', `/fin/espaces/${space.id}/depenses-recurrentes/confirmer`, {
      user: viewer,
      json: { label: 'Loyer', value: 50000, occurredAt: iso(ago(1)), splitMode: 'equal', payerId: ownerMemberId, participants: [{ memberId: ownerMemberId }] },
    });
    assert.equal(res.status, 403);
  });
});

describe('F044: the fair share by income', () => {
  test('is "non disponible", naming who has not shared, until every live member has shared their income', async () => {
    const goal = await t.request('POST', `/fin/espaces/${space.id}/objectifs-communs`, { user: owner, json: { label: 'Vacances', target: 100000, currency: 'DZD' } });
    const res = await t.request('GET', `/fin/espaces/${space.id}/objectifs-communs`, { user: owner });
    const found = res.body.goals.find((g) => g.id === goal.body.goal.id);
    assert.equal(found.vue.partEquitable.disponible, false);
    assert.ok(found.vue.partEquitable.manquants.length > 0);
  });

  test('is computed, proportional to income, once every live member has shared it', async () => {
    await t.request('POST', '/fin/revenus', { user: owner, json: { label: 'Salaire', value: 6000000, currency: 'DZD', frequency: 'mensuel', startDate: iso(ago(60)) } });
    await t.request('POST', '/fin/revenus', { user: flatmate, json: { label: 'Salaire', value: 3000000, currency: 'DZD', frequency: 'mensuel', startDate: iso(ago(60)) } });
    await t.request('PUT', `/fin/espaces/${space.id}/mon-partage`, { user: owner, json: { incomes: 'totals' } });
    await t.request('PUT', `/fin/espaces/${space.id}/mon-partage`, { user: flatmate, json: { incomes: 'totals' } });

    const goal = await t.request('POST', `/fin/espaces/${space.id}/objectifs-communs`, { user: owner, json: { label: 'Vacances', target: 90000, currency: 'DZD' } });
    const res = await t.request('GET', `/fin/espaces/${space.id}/objectifs-communs`, { user: owner });
    const found = res.body.goals.find((g) => g.id === goal.body.goal.id);
    assert.equal(found.vue.partEquitable.disponible, true);
    const total = found.vue.partEquitable.parMembre.reduce((sum, row) => sum + row.partEquitable, 0);
    assert.equal(total, 90000, "the fair shares add up to what's left, exactly");
  });
});
