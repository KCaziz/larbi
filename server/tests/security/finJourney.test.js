import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';
import { ADULT_ONLY_SCREENS, JOURNEYS, SCREEN_ROUTES, screenEnabledFor } from '../../src/constants/finJourneys.js';

// The journey map of the 8 publics (P6-17), and the 18+ gate it finally applies.
//
// Two guarantees, and the second one exists because breaking it is easy: the
// adults-only routes must be refused server-side, AND every OTHER route must
// stay open. Every financial router is mounted on the same `/fin` prefix, so a
// pathless `router.use(requireAdult)` guards everything declared after it and
// locks a minor out of their own money. That is exactly what happened while
// this task was being written, which is why the second test is here.

let t;

before(async () => {
  t = await boot();
});
beforeEach(() => t.reset());
after(() => t.close());

// Routes a minor must keep: their own money, in every module that is theirs.
const MINOR_KEEPS = [
  '/fin/parcours',
  '/fin/argent/synthese',
  '/fin/budgets',
  '/fin/revenus',
  '/fin/categories',
  '/fin/reserve',
  '/fin/calendrier',
  '/fin/aujourdhui',
  '/fin/notifications',
  '/fin/objectifs-communs',
  '/fin/portefeuille',
  '/fin/espaces',
];

// Routes reserved to adults: debts, real patrimony, credit preparation.
const ADULTS_ONLY = ['/fin/debts', '/fin/patrimoine', '/fin/actifs', '/fin/financement'];

describe('P6-17 — the 18+ gate is applied, at last', () => {
  test('a minor is refused on every adults-only route, with a reason', async () => {
    const minor = await t.minor({ finPublic: 'LYC' });
    for (const route of ADULTS_ONLY) {
      const res = await t.request('GET', route, { user: minor });
      assert.equal(res.status, 403, route);
      assert.equal(res.body.error.details.reason, 'adultsOnly', route);
    }
  });

  test('an account that never gave its age bracket is refused too, and told which to fix', async () => {
    // Deny by default: unknown is not adult. But the refusal must be
    // actionable, or a protection rule becomes a dead end for an adult who
    // simply has not filled their profile.
    const unknown = await t.user();
    for (const route of ADULTS_ONLY) {
      const res = await t.request('GET', route, { user: unknown });
      assert.equal(res.status, 403, route);
      assert.equal(res.body.error.details.reason, 'ageUnknown', route);
    }
  });

  test('an adult passes', async () => {
    const adult = await t.adult({ finPublic: 'SAL' });
    for (const route of ADULTS_ONLY) {
      const res = await t.request('GET', route, { user: adult });
      assert.notEqual(res.status, 403, route);
    }
  });

  test('and a minor keeps every route that is THEIRS', async () => {
    // The guard must be bound to its own paths. Mounted without one, it would
    // refuse everything declared after it on the shared `/fin` prefix — which
    // is a far worse failure than the one it prevents.
    const minor = await t.minor({ finPublic: 'LYC' });
    const refused = [];
    for (const route of MINOR_KEEPS) {
      const res = await t.request('GET', route, { user: minor });
      if (res.status === 403) refused.push(`${route} -> ${res.body.error?.details?.reason}`);
    }
    assert.deepEqual(refused, [], 'a minor must never be locked out of their own money');
  });

  test('the gate cannot be satisfied by a role or an access level', async () => {
    const minorAdmin = await t.minor({ role: 'admin', accessLevel: 'premium' });
    const res = await t.request('GET', '/fin/patrimoine', { user: minorAdmin });
    assert.equal(res.status, 403);
  });
});

describe('P6-17 — the journey map', () => {
  test("it answers with the client's own dashboard name and navigation", async () => {
    const minor = await t.minor({ finPublic: 'LYC' });
    const res = await t.request('GET', '/fin/parcours', { user: minor });
    assert.equal(res.status, 200);
    assert.equal(res.body.tableauPrincipal, 'Parcours financier');
    // The client's own vocabulary, in the client's own order.
    assert.equal(res.body.navigation[0], 'Ma semaine');
    assert.equal(res.body.experience.experience, 'FINCLUDIA Avenir');
    assert.equal(res.body.tableauDeBord, 'myWeek', 'and it says which of our dashboards backs it');
  });

  test('a public never sees a screen that is not in its journey', async () => {
    const minor = await t.minor({ finPublic: 'LYC' });
    const res = await t.request('GET', '/fin/parcours', { user: minor });
    const codes = res.body.ecrans.map((screen) => screen.code);
    // The client's own map: a lycéen has no debt screen and no patrimony screen.
    assert.ok(!codes.includes('C13'), 'no debt screen');
    assert.ok(!codes.includes('C14'));
    assert.ok(!codes.includes('C16'), 'no real patrimony screen');
    assert.equal(res.body.reserveAuxAdultes.autorise, false);
    // And what IS theirs is there.
    assert.ok(codes.includes('C17'), 'the paper portfolio is explicitly theirs');
    assert.ok(codes.includes('LY02'));
  });

  test('a salarié gets the screens a salarié gets', async () => {
    const adult = await t.adult({ finPublic: 'SAL' });
    const res = await t.request('GET', '/fin/parcours', { user: adult });
    assert.equal(res.body.tableauPrincipal, 'Santé financière personnelle');
    const patrimony = res.body.ecrans.find((screen) => screen.code === 'C16');
    assert.ok(patrimony, 'the patrimony screen is in their journey');
    assert.equal(patrimony.autorise, true);
    assert.equal(patrimony.adultsOnly, true);
  });

  test('a screen nobody serves yet says what it is waiting for', async () => {
    const adult = await t.adult({ finPublic: 'SAL' });
    const res = await t.request('GET', '/fin/parcours', { user: adult });
    const payslip = res.body.ecrans.find((screen) => screen.code === 'C15');
    assert.ok(payslip, 'the payslip decoder is in a salarié journey');
    assert.equal(payslip.to, null);
    assert.equal(payslip.indisponible, 'P4-14', 'and it says so rather than looking broken');
    assert.equal(payslip.autorise, false);
  });

  test('somebody with no public yet is not locked out, and is offered the list', async () => {
    const adult = await t.adult();
    const res = await t.request('GET', '/fin/parcours', { user: adult });
    assert.equal(res.body.publicCode, null);
    assert.ok(Array.isArray(res.body.publicsDisponibles));
    assert.ok(res.body.ecrans.length > 0, 'refusing them would lock a new account out of its own money');
  });

  test('it needs a session', async () => {
    assert.equal((await t.request('GET', '/fin/parcours')).status, 401);
    assert.equal((await t.request('GET', '/fin/parcours/carte')).status, 401);
  });
});

describe('P6-17 — the map is the provenance matrix (P6-21)', () => {
  test('every screen of the client is attached to a route or to what it waits for', async () => {
    const adult = await t.adult({ finPublic: 'SAL' });
    const res = await t.request('GET', '/fin/parcours/carte', { user: adult });
    assert.equal(res.status, 200);
    assert.equal(res.body.couverture.total, Object.keys(SCREEN_ROUTES).length);
    for (const [code, screen] of Object.entries(res.body.ecrans)) {
      const attached = screen.to !== null || screen.waitingOn || screen.task;
      assert.ok(attached, `${code} is attached to nothing`);
    }
  });

  test('the eight journeys are all there, each with a dashboard and a navigation', async () => {
    const adult = await t.adult({ finPublic: 'SAL' });
    const res = await t.request('GET', '/fin/parcours/carte', { user: adult });
    assert.equal(Object.keys(res.body.parcours).length, 8);
    for (const [code, journey] of Object.entries(res.body.parcours)) {
      assert.ok(journey.dashboard, `${code} has no dashboard name`);
      assert.ok(journey.nav.length >= 5, `${code} has only ${journey.nav.length} navigation entries`);
      assert.ok(journey.screens.length >= 15, `${code} enables only ${journey.screens.length} screens`);
    }
  });
});

describe('P6-17 — the registry itself', () => {
  test('every screen a journey enables exists in the screen map', () => {
    for (const [code, journey] of Object.entries(JOURNEYS)) {
      for (const screen of journey.screens) {
        assert.ok(SCREEN_ROUTES[screen], `${code} enables unknown screen ${screen}`);
      }
    }
  });

  test('no journey enables an adults-only screen for the minors journey', () => {
    // The client's rule, checked against the client's own map rather than
    // against our reading of it.
    for (const screen of JOURNEYS.LYC.screens) {
      assert.ok(!ADULT_ONLY_SCREENS.includes(screen), `the lycéen journey enables ${screen}`);
    }
  });

  test('a public with no journey is not refused: it has not chosen one', () => {
    assert.equal(screenEnabledFor(null, 'C13'), true);
    assert.equal(screenEnabledFor('NOPE', 'C13'), true);
    // The 18+ gate still applies to them — it protects minors rather than
    // shaping a journey — and that is enforced on the route, not here.
    assert.ok(ADULT_ONLY_SCREENS.includes('C13'));
  });
});
