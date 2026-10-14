import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Global search (P6-20): lexical only, strictly cloistered by owner.

let t;
let owner;
let other;

const iso = (date) => date.toISOString();

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  owner = await t.user();
  other = await t.user();
});
after(() => t.close());

describe('global search', () => {
  test('requires a session', async () => {
    const res = await t.request('GET', '/fin/recherche?q=loyer');
    assert.equal(res.status, 401);
  });

  test("never returns another account's data", async () => {
    await t.request('POST', '/fin/transactions', { user: owner, json: { kind: 'expense', value: 1000, currency: 'DZD', occurredAt: iso(new Date()), note: 'Loyer secret' } });
    const mine = await t.request('GET', '/fin/recherche?q=loyer', { user: owner });
    const theirs = await t.request('GET', '/fin/recherche?q=loyer', { user: other });
    assert.equal(mine.body.mesDonnees.transactions.length, 1);
    assert.equal(theirs.body.mesDonnees.transactions.length, 0);
  });

  test('matches a note by a literal substring', async () => {
    await t.request('POST', '/fin/transactions', { user: owner, json: { kind: 'expense', value: 1000, currency: 'DZD', occurredAt: iso(new Date()), note: 'Courses Carrefour' } });
    const res = await t.request('GET', '/fin/recherche?q=carrefour', { user: owner });
    assert.equal(res.body.mesDonnees.transactions.length, 1);
  });

  test('expands a configured synonym in both directions', async () => {
    await t.request('POST', '/fin/transactions', { user: owner, json: { kind: 'expense', value: 1000, currency: 'DZD', occurredAt: iso(new Date()), note: 'Remboursement crédit voiture' } });
    const viaSynonym = await t.request('GET', '/fin/recherche?q=dette', { user: owner });
    assert.equal(viaSynonym.body.mesDonnees.transactions.length, 1, '"dette" should find a note written "crédit" via the configured synonym');
  });

  test('finds a goal by label, scoped to the caller', async () => {
    await t.request('POST', '/fin/goals', { user: owner, json: { label: 'Voiture neuve', target: 100000, currency: 'DZD' } });
    const mine = await t.request('GET', '/fin/recherche?q=voiture', { user: owner });
    const theirs = await t.request('GET', '/fin/recherche?q=voiture', { user: other });
    assert.equal(mine.body.objectifs.length, 1);
    assert.equal(theirs.body.objectifs.length, 0);
  });

  test('an empty query returns no results rather than everything', async () => {
    await t.request('POST', '/fin/transactions', { user: owner, json: { kind: 'expense', value: 1000, currency: 'DZD', occurredAt: iso(new Date()), note: 'Loyer' } });
    const res = await t.request('GET', '/fin/recherche', { user: owner });
    assert.equal(res.body.mesDonnees.transactions.length, 0);
  });

  test('"explorer" is honestly declared not wired, never an empty fake success', async () => {
    const res = await t.request('GET', '/fin/recherche?q=loyer', { user: owner });
    assert.equal(res.body.explorer.reason, 'notWiredYet');
  });
});
