import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { boot } from '../helpers/server.js';

// Phase 11 (recette du 2026-11-10): start again, all or some parts (P11-01);
// the site's FAQ and the application's (P11-02); a contribution to a goal
// planned for a later day (P11-04).

const PASSWORD = 'Un-mot-de-passe-2026';
let t;
let user;

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  user = await t.adult({ name: 'Phase 11', finCurrency: 'DZD', passwordHash: await bcrypt.hash(PASSWORD, 4) });
});
after(() => t.close());

const ago = (minutes) => new Date(Date.now() - minutes * 60_000).toISOString();
const post = (url, json, who = user) => t.request('POST', url, { user: who, json });

describe('P11-01 — start again', () => {
  test('erases only the parts chosen, keeps the rest, and needs the password', async () => {
    const main = (await post('/fin/comptes', { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 1000000 })).body.account.id;
    await post('/fin/transactions', { kind: 'expense', value: 50000, currency: 'DZD', occurredAt: ago(5), accountId: main });
    await post('/fin/debts', { label: 'Crédit', outstandingPrincipal: 500000, monthlyInstalment: 50000, currency: 'DZD' });
    await post('/fin/goals', { label: 'Voyage', target: 2000000, currency: 'DZD' });

    const preview = (await t.request('GET', '/fin/confiance/reinitialiser', { user })).body.parts;
    assert.equal(preview.debts, 1);
    assert.equal(preview.goals, 1);
    assert.equal(preview.movements, 1);

    const refused = await post('/fin/confiance/reinitialiser', { consent: true, currentPassword: 'faux', parts: ['debts'] });
    assert.equal(refused.status, 403);

    const res = await post('/fin/confiance/reinitialiser', { consent: true, currentPassword: PASSWORD, parts: ['debts'] });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.equal(res.body.effaces.debts, 1);
    const after = (await t.request('GET', '/fin/confiance/reinitialiser', { user })).body.parts;
    assert.equal(after.debts, 0, 'the debts are gone');
    assert.equal(after.goals, 1, 'the goal stays');
    assert.equal(after.movements, 1, 'the movements stay');
  });

  test('« tout » erases every part, and the account itself stays usable', async () => {
    await post('/fin/comptes', { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 1000000 });
    await post('/fin/goals', { label: 'Voyage', target: 2000000, currency: 'DZD' });
    const res = await post('/fin/confiance/reinitialiser', { consent: true, currentPassword: PASSWORD, parts: ['all'] });
    assert.equal(res.status, 200);
    const left = (await t.request('GET', '/fin/confiance/reinitialiser', { user })).body.parts;
    assert.ok(Object.values(left).every((count) => count === 0), JSON.stringify(left));
    assert.equal((await t.request('GET', '/fin/accueil', { user })).status, 200);
  });
});

describe('P11-02 — the site’s FAQ and the application’s', () => {
  test('each place shows its questions, and the questions for both', async () => {
    const admin = await t.adult({ name: 'Admin', role: 'admin' });
    for (const [question, audience] of [['Site ?', 'site'], ['Appli ?', 'app'], ['Les deux ?', 'both']]) {
      const created = await post('/admin/chatbot', { question, answer: '<p>Réponse</p>', language: 'fr', audience }, admin);
      assert.equal(created.status, 201, JSON.stringify(created.body));
      await post(`/admin/chatbot/${created.body.entry.id}/publish`, {}, admin);
    }
    const read = async (audience) => (await t.request('GET', `/chatbot/entries?lang=fr&audience=${audience}`)).body.entries.map((entry) => entry.question).sort();
    assert.deepEqual(await read('site'), ['Les deux ?', 'Site ?']);
    assert.deepEqual(await read('app'), ['Appli ?', 'Les deux ?']);
  });
});

describe('P11-04 — a contribution planned for a later day', () => {
  test('moves no money until confirmed, shows once to confirm, then moves both accounts', async () => {
    const main = (await post('/fin/comptes', { label: 'Courant', type: 'AC-02', currency: 'DZD', openingBalance: 1000000 })).body.account.id;
    const goal = (await post('/fin/goals', { label: 'Voyage', target: 2000000, currency: 'DZD' })).body.goal.id;
    const future = await post(`/fin/goals/${goal}/contributions`, { fromAccountId: main, value: 100000, occurredAt: new Date(Date.now() + 5 * 86400000).toISOString(), planned: true });
    assert.equal(future.status, 201, 'a planned contribution may be dated ahead');

    const due = await post(`/fin/goals/${goal}/contributions`, { fromAccountId: main, value: 200000, occurredAt: ago(2), planned: true });
    const balances = async () => Object.fromEntries((await t.request('GET', '/fin/comptes', { user })).body.accounts.map((row) => [row.label, row.solde.resultat]));
    assert.equal((await balances()).Courant, 1000000, 'planned: nothing moved');

    const toConfirm = (await t.request('GET', '/fin/aujourdhui', { user })).body.aujourdhui.aFaire.paiementsAConfirmer;
    assert.equal(toConfirm.length, 1, 'shown once, by the money leaving');
    const paid = await post(`/fin/transactions/${toConfirm[0].sourceId}/payer`, {});
    assert.equal(paid.status, 200, JSON.stringify(paid.body));
    const now = await balances();
    assert.equal(now.Courant, 800000);
    assert.equal(now.Voyage, 200000, 'the goal’s account received it');
    assert.ok(due.body.accountId);
  });
});
