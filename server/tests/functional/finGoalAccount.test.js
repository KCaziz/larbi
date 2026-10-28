import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Objectifs & sécurité (P8-12): contributions are transfers to the goal's own
// account (never counted twice), PB-F014 to PB-F016, scenarios, the 17
// models, and the emergency fund's default target by profile.

let t;
let user;
const ago = (days) => new Date(Date.now() - days * 86_400_000).toISOString();

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  user = await t.adult({ name: 'Objectifs P8-12', finPublic: 'ETU' });
});
after(() => t.close());

const createGoal = (json = {}) =>
  t.request('POST', '/fin/goals', { user, json: { label: 'Ordinateur', templateKey: 'GO-03', target: 12000000, currency: 'DZD', targetDate: '2027-09-01T00:00:00.000Z', ...json } });

describe('P8-12 — a contribution is a transfer to the goal’s account', () => {
  test('the first contribution creates the goal’s account; the capital follows its balance; the total does not move', async () => {
    const current = (await t.request('POST', '/fin/comptes', { user, json: { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 5000000, openingDate: ago(30) } })).body.account;
    const goal = (await createGoal({ monthlyContribution: 1000000 })).body.goal;
    const res = await t.request('POST', `/fin/goals/${goal.id}/contributions`, { user, json: { fromAccountId: current.id, value: 3000000, occurredAt: ago(1) } });
    assert.equal(res.status, 201, JSON.stringify(res.body).slice(0, 200));

    const detail = (await t.request('GET', `/fin/goals/${goal.id}`, { user })).body;
    assert.equal(detail.goal.allocated, 3000000);
    assert.equal(detail.goal.capitalSource, 'account');
    assert.equal(detail.goal.vue.progres.formule_id, 'PB-F014');
    assert.equal(detail.goal.vue.progres.resultat, 0.25);
    assert.equal(detail.goal.vue.moisMinimum.resultat, 9, 'ceil(9 000 000 / 1 000 000)');
    assert.equal(detail.contributions.length, 1);
    assert.equal(detail.contributions[0].fromAccount.id, current.id);

    // Both accounts are in the total: moving money to the goal changes nothing.
    const accounts = (await t.request('GET', '/fin/comptes', { user })).body;
    assert.equal(accounts.totals[0].soldeTotal.resultat, 5000000);
    const synthesis = (await t.request('GET', '/fin/argent/synthese', { user })).body.synthese;
    assert.equal(synthesis.depenses.resultat, null, 'setting money aside is not spending');
  });

  test('a scenario computes with the person’s own parameters, and saves nothing', async () => {
    const goal = (await createGoal({ allocated: 0 })).body.goal;
    const res = await t.request('POST', `/fin/goals/${goal.id}/scenario`, { user, json: { monthlyContribution: 1000000, inflation: 0, rate: 0 } });
    assert.equal(res.status, 200);
    assert.equal(res.body.scenario.moisPourAtteindre.resultat, 12);
    assert.equal(res.body.scenario.moisPourAtteindre.hypotheses.contribution_mensuelle, 1000000);
  });

  test('a goal can be paused, and the catalogue holds the 17 models', async () => {
    const goal = (await createGoal()).body.goal;
    const res = await t.request('PATCH', `/fin/goals/${goal.id}`, { user, json: { progressStatus: 'paused' } });
    assert.equal(res.body.goal.progressStatus, 'paused');
    const refs = (await t.request('GET', '/fin/goals/references', { user })).body;
    assert.equal(refs.catalogue.length, 17);
    // The client's own codes, GO-01 to GO-17 (answer D1).
    assert.deepEqual(
      refs.catalogue.map((model) => model.code),
      Array.from({ length: 17 }, (_, i) => `GO-${String(i + 1).padStart(2, '0')}`),
    );
    assert.ok(refs.catalogue.every((model) => model.icon && model.color), 'each model has its icon and colour');
  });

  test('« Autre objectif » keeps its own name, icon and colour (answer D1)', async () => {
    const res = await t.request('POST', '/fin/goals', {
      user,
      json: { label: 'Mon atelier', templateKey: null, icon: '🪚', color: '#7C2D12', target: 3000000, currency: 'DZD', targetDate: '2027-06-01T00:00:00.000Z' },
    });
    assert.equal(res.status, 201, JSON.stringify(res.body).slice(0, 200));
    assert.equal(res.body.goal.icon, '🪚');
    assert.equal(res.body.goal.color, '#7C2D12');
    const refused = await t.request('POST', '/fin/goals', { user, json: { label: 'X', color: 'rouge', target: 1000, currency: 'DZD' } });
    assert.equal(refused.status, 400);
    // A goal created under an old code before D1 is still valid once migrated.
    assert.equal((await t.request('POST', '/fin/goals', { user, json: { label: 'Bébé', templateKey: 'GO-12', target: 1000, currency: 'DZD' } })).status, 201);
  });
});

describe('P8-12 — the emergency fund’s target by profile', () => {
  test('a student is offered 2 months, an irregular income 6, and the person can change it', async () => {
    assert.equal((await t.request('GET', '/fin/reserve?currency=DZD', { user })).body.cibleMois, 2);
    await t.request('PUT', '/profile/fin', { user, json: { finIncomeRegularity: 'irregular', acceptConsents: true } });
    const res = (await t.request('GET', '/fin/reserve?currency=DZD', { user })).body;
    assert.equal(res.cibleMois, 6);
    assert.equal(res.cibleParDefaut, true);
    // « Stable | Irrégulier | Saisonnier » (answer C3): seasonal is 6 too.
    await t.request('PUT', '/profile/fin', { user, json: { finIncomeRegularity: 'seasonal' } });
    assert.equal((await t.request('GET', '/fin/reserve?currency=DZD', { user })).body.cibleMois, 6);
    await t.request('PUT', '/profile/fin', { user, json: { finIncomeRegularity: 'stable' } });
    assert.equal((await t.request('GET', '/fin/reserve?currency=DZD', { user })).body.cibleMois, 2);
    assert.equal((await t.request('PUT', '/profile/fin', { user, json: { finIncomeRegularity: 'parfois' } })).status, 400);
    await t.request('PUT', '/profile/fin', { user, json: { finIncomeRegularity: 'irregular' } });
    await t.request('PUT', '/fin/reserve/cible', { user, json: { targetMonths: 4 } });
    assert.equal((await t.request('GET', '/fin/reserve?currency=DZD', { user })).body.cibleMois, 4);
  });
});
