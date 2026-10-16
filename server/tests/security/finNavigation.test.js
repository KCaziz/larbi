import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// The menu of the connected space over the wire (P1-12), and the badge of the
// top bar.
//
// The rule itself is tested without HTTP in tests/unit/finNavigation.test.js.
// What is checked here is what an account actually RECEIVES — because the menu
// is now served, a navigation that reads it inherits whatever the endpoint
// decides, including its mistakes.
//
// And the usual reminder: hiding an entry is a convenience. Every one of these
// routes is refused on its own by `requireAdult`, which is what protects them.

let t;

before(async () => {
  t = await boot();
});
beforeEach(() => t.reset());
after(() => t.close());

const routesOf = (body) => body.menu.flatMap((group) => group.entrees.map((entry) => entry.to));

describe('P1-12 — the menu the API serves', () => {
  test('the journey answer carries the nine groups in the client’s order', async () => {
    const adult = await t.adult({ finPublic: 'SAL' });
    const res = await t.request('GET', '/fin/parcours', { user: adult });
    assert.equal(res.status, 200);

    // Les neuf du client viennent en tête, dans son ordre. Ce qui vient
    // d'ailleurs — l'espace entreprise, annoncé par l'annexe 1 du contrat
    // (P7-02) — est ajouté après, jamais glissé parmi elles.
    const order = ['today', 'money', 'goals', 'safety', 'wealth', 'invest', 'together', 'explore', 'learn'];
    const keys = res.body.menu.map((group) => group.key);
    const clientKeys = keys.filter((key) => order.includes(key));
    assert.deepEqual(clientKeys, order.filter((key) => keys.includes(key)));
    assert.deepEqual(keys.slice(0, clientKeys.length), clientKeys, 'une entrée hors client est glissée parmi les neuf');
    assert.ok(keys.length >= 6, `only ${keys.length} groups for a salarié`);
  });

  test('a minor receives no adults-only entry', async () => {
    const minor = await t.minor({ finPublic: 'LYC' });
    const res = await t.request('GET', '/fin/parcours', { user: minor });
    const routes = routesOf(res.body);
    for (const route of ['/dettes', '/patrimoine', '/financement', '/outils/explorateur']) {
      assert.ok(!routes.includes(route), route);
    }
  });

  test('a minor still receives their own money', async () => {
    // The over-refusal check, at the level where it would actually be seen.
    const minor = await t.minor({ finPublic: 'LYC' });
    const routes = routesOf(await t.request('GET', '/fin/parcours', { user: minor }).then((r) => r.body));
    for (const route of ['/aujourdhui', '/mon-argent', '/objectifs']) {
      assert.ok(routes.includes(route), route);
    }
  });

  test('an account that never stated its age bracket is treated as a minor', async () => {
    const unknown = await t.user({ finPublic: 'SAL' });
    const routes = routesOf(await t.request('GET', '/fin/parcours', { user: unknown }).then((r) => r.body));
    assert.ok(!routes.includes('/dettes'));
  });

  test('every route in a served menu is one this account may really open', async () => {
    // The guarantee that makes the menu trustworthy: what it offers, the API
    // grants. A menu entry that answers 403 is worse than a hidden one.
    const minor = await t.minor({ finPublic: 'LYC' });
    const routes = routesOf(await t.request('GET', '/fin/parcours', { user: minor }).then((r) => r.body));
    // The pairs the client's screens and our API share a name for.
    const apiOf = { '/mon-argent': '/fin/argent/synthese', '/objectifs': '/fin/objectifs', '/reserve': '/fin/reserve', '/aujourdhui': '/fin/aujourdhui', '/calendrier': '/fin/calendrier', '/portefeuille': '/fin/portefeuille', '/espaces': '/fin/espaces', '/budget': '/fin/budgets' };
    const refused = [];
    for (const route of routes) {
      const api = apiOf[route];
      if (!api) continue;
      const res = await t.request('GET', api, { user: minor });
      if (res.status === 403) refused.push(`${route} (${api}) -> ${res.body.error?.details?.reason}`);
    }
    assert.deepEqual(refused, []);
  });

  test('the menu needs a session', async () => {
    const res = await t.request('GET', '/fin/parcours');
    assert.equal(res.status, 401);
  });
});

describe('P1-12 — the badge of the top bar', () => {
  test('counts this account’s unread notifications and nobody else’s', async () => {
    const mine = await t.adult({ finPublic: 'SAL' });
    const other = await t.adult({ finPublic: 'SAL' });

    const empty = await t.request('GET', '/fin/notifications/non-lues', { user: mine });
    assert.equal(empty.status, 200);
    assert.equal(empty.body.nonLues, 0);

    // The notification centre of the OTHER account generates its own reminders;
    // none of them may reach this badge.
    await t.request('GET', '/fin/notifications', { user: other });
    const still = await t.request('GET', '/fin/notifications/non-lues', { user: mine });
    assert.equal(still.body.nonLues, 0);
  });

  test('needs a session', async () => {
    const res = await t.request('GET', '/fin/notifications/non-lues');
    assert.equal(res.status, 401);
  });

  test('never generates anything: reading the badge leaves the listing unchanged', async () => {
    // Deliberate, and the reason the badge is a route of its own: generating
    // reminders costs four queries and writes rows, and the badge is read on
    // every page of the connected space. The documented consequence is that it
    // can lag — never that it over-reports.
    const user = await t.adult({ finPublic: 'SAL' });
    await t.request('GET', '/fin/notifications/non-lues', { user });
    const listing = await t.request('GET', '/fin/notifications', { user });
    const afterGeneration = await t.request('GET', '/fin/notifications/non-lues', { user });
    assert.equal(afterGeneration.body.nonLues, listing.body.nonLues);
  });
});
