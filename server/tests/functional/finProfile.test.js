import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// FINCLUDIA onboarding and profile (P3-18) through the real API and database.

let t;
let user;

const get = () => t.request('GET', '/profile/fin', { user });
const put = (json) => t.request('PUT', '/profile/fin', { user, json });

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  user = await t.user();
});
after(() => t.close());

describe('reading the profile', () => {
  test('a fresh account has no public yet, DZD by default, and no consent', async () => {
    const res = await get();
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.profile.finPublic, null);
    assert.equal(res.body.profile.finCurrency, 'DZD');
    assert.equal(res.body.profile.isAdult, null, 'unknown age bracket: neither adult nor minor');
    assert.equal(res.body.profile.consented, false);
  });

  test('needs a session', async () => {
    assert.equal((await t.request('GET', '/profile/fin')).status, 401);
  });
});

describe('consent gate', () => {
  test('setting any FINCLUDIA field without consent is refused (403)', async () => {
    const res = await put({ finAgeRange: '25-34' });
    assert.equal(res.status, 403);
    assert.deepEqual(res.body.error.details, { reason: 'consentRequired' });
    assert.equal((await get()).body.profile.finAgeRange, null, 'nothing was written');
  });

  test('accepting consent in the same call writes the data and the consent together', async () => {
    const res = await put({ finPublic: 'ETU', finAgeRange: '18-24', acceptConsents: true });
    assert.equal(res.status, 200);
    assert.equal(res.body.profile.finPublic, 'ETU');
    assert.equal(res.body.profile.consented, true);
    assert.ok(res.body.profile.finOnboardedAt, 'onboarding date is stamped on first completion');
    assert.equal(await t.prisma.finConsent.count({ where: { userId: user.id } }), 2, 'both required texts');
  });

  test('once consent is given, later updates need no acceptConsents again', async () => {
    await put({ finPublic: 'ETU', acceptConsents: true });
    const res = await put({ finHorizon: 'court terme' });
    assert.equal(res.status, 200);
    assert.equal(res.body.profile.finHorizon, 'court terme');
  });

  test('acceptConsents only accepts true, never false (cannot be silently skipped)', async () => {
    assert.equal((await put({ finAgeRange: '25-34', acceptConsents: false })).status, 400);
  });
});

describe('profile and public', () => {
  test('publics outside the closed list of 8 are refused', async () => {
    assert.equal((await put({ finPublic: 'XXX', acceptConsents: true })).status, 400);
  });

  test('a secondary public cannot repeat the primary one, and up to 7 others are accepted', async () => {
    const dup = await put({ finPublic: 'SAL', finSecondaryPublics: ['SAL'], acceptConsents: true });
    assert.equal(dup.status, 400);
    const ok = await put({ finPublic: 'SAL', finSecondaryPublics: ['COL'], acceptConsents: true });
    assert.equal(ok.status, 200);
    assert.deepEqual(ok.body.profile.finSecondaryPublics, ['COL']);
  });

  test('"Je ne sais pas" / "Modifier plus tard": every field is optional, consent alone is enough to proceed', async () => {
    const res = await put({ acceptConsents: true });
    assert.equal(res.status, 200);
    assert.equal(res.body.profile.finPublic, null);
    assert.equal(res.body.profile.consented, true);
  });

  test('extra, unknown fields are refused (the price-style strict schema)', async () => {
    assert.equal((await put({ finPublic: 'SAL', isAdult: true, acceptConsents: true })).status, 400);
  });
});

describe('changement de parcours (transitions)', () => {
  test('a real change of public is logged; the first pick and clearing are not', async () => {
    await put({ finPublic: 'ETU', acceptConsents: true });
    assert.deepEqual((await t.request('GET', '/profile/fin/transitions', { user })).body.transitions, [], 'first pick is not a transition');

    await put({ finPublic: 'JAC' });
    const list = (await t.request('GET', '/profile/fin/transitions', { user })).body.transitions;
    assert.equal(list.length, 1);
    assert.deepEqual([list[0].fromPublic, list[0].toPublic], ['ETU', 'JAC']);

    await put({ finPublic: null });
    assert.equal((await t.request('GET', '/profile/fin/transitions', { user })).body.transitions.length, 1, 'clearing is not logged either');
  });

  test('never forced: nothing changes the public except an explicit request naming it', async () => {
    await put({ finPublic: 'SAL', acceptConsents: true });
    await put({ finHorizon: 'long terme' });
    assert.equal((await get()).body.profile.finPublic, 'SAL');
  });

  test('transitions belong to their own account only', async () => {
    const other = await t.user();
    await put({ finPublic: 'ETU', acceptConsents: true });
    await put({ finPublic: 'JAC' });
    const theirs = await t.request('GET', '/profile/fin/transitions', { user: other });
    assert.deepEqual(theirs.body.transitions, []);
  });
});
