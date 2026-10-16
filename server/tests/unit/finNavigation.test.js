import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  EXTRA_ROUTES,
  MENU_GROUPS,
  OUT_OF_MENU_ROUTES,
  danglingMenuRoutes,
  menuFor,
  unreachableRoutes,
} from '../../src/constants/finNavigation.js';
import { JOURNEYS, SCREEN_ROUTES, screenEnabledFor } from '../../src/constants/finJourneys.js';

// The menu of the connected space (P1-12): the client's nine entries, reduced
// to what a given public, at a given age, may actually open.
//
// These are the tests of the RULE, with no database and no HTTP. What the API
// serves is checked in tests/security/finNavigation.test.js, and the two are
// separate on purpose: a menu that is right in principle and wrong over the
// wire is still a wrong menu.

const routesOf = (menu) => menu.flatMap((group) => group.entrees.map((entry) => entry.to));
const groupKeys = (menu) => menu.map((group) => group.key);

describe('P1-12 — the nine entries of the client', () => {
  test('the client’s nine come first, in the client’s order', () => {
    // La spécification § 2-3 en nomme neuf, toutes personnelles. Ce qui vient
    // d'ailleurs — ici l'espace entreprise, annoncé par l'annexe 1 du contrat
    // — est ajouté APRÈS, jamais glissé parmi elles : un menu qui mélangerait
    // les deux origines ne pourrait plus être relu face à sa source.
    const clientNine = ['today', 'money', 'goals', 'safety', 'wealth', 'invest', 'together', 'explore', 'learn'];
    const keys = MENU_GROUPS.map((group) => group.key);
    assert.deepEqual(keys.slice(0, clientNine.length), clientNine);
  });

  test('et ce qui ne vient pas du client déclare d’où il vient', () => {
    const clientNine = new Set(['today', 'money', 'goals', 'safety', 'wealth', 'invest', 'together', 'explore', 'learn']);
    const ours = MENU_GROUPS.filter((group) => !clientNine.has(group.key));
    assert.ok(ours.length > 0);
    for (const group of ours) {
      for (const route of group.routes) {
        assert.ok(EXTRA_ROUTES[route], `${route} n'est ni du client ni déclaré comme nôtre`);
        assert.ok(EXTRA_ROUTES[route].origin, route);
        assert.ok(EXTRA_ROUTES[route].task, route);
      }
    }
  });

  test('a group never claims the same route twice, and no two groups share one', () => {
    const all = MENU_GROUPS.flatMap((group) => group.routes);
    assert.deepEqual([...new Set(all)].sort(), [...all].sort(), 'a route appears in two groups');
  });

  test('every served screen is reachable from the navigation, and nothing in the menu is unserved', () => {
    // The two halves of the same contract. A route in no group and not named as
    // belonging to the top bar or the account is a page you can only reach by
    // typing its address; a group pointing at an unserved route is a dead link.
    assert.deepEqual(unreachableRoutes(), []);
    assert.deepEqual(danglingMenuRoutes(), []);
  });

  test('the routes kept out of the menu are kept out for a stated reason', () => {
    // The top bar (notifications) and the account (trust centre, first steps).
    // Listing them in a group as well would show them twice.
    assert.deepEqual(OUT_OF_MENU_ROUTES, ['/notifications', '/confiance', '/compte/premiers-pas']);
  });
});

describe('P1-12 — what each public sees', () => {
  test('every public gets a menu, and no empty group', () => {
    for (const publicCode of Object.keys(JOURNEYS)) {
      const menu = menuFor({ publicCode, adult: true });
      assert.ok(menu.length > 0, publicCode);
      for (const group of menu) assert.ok(group.entrees.length > 0, `${publicCode} / ${group.key}`);
    }
  });

  test('the groups always come in the client’s order, whichever ones survive', () => {
    const order = MENU_GROUPS.map((group) => group.key);
    for (const publicCode of Object.keys(JOURNEYS)) {
      const keys = groupKeys(menuFor({ publicCode, adult: true }));
      assert.deepEqual(keys, order.filter((key) => keys.includes(key)), publicCode);
    }
  });

  test('a lycéen has no debt, no real patrimony and no funding entry', () => {
    // The client's own rule, and the reason the adults-only screens exist: a
    // minor is never shown a debt, a real patrimony or a credit offer.
    const routes = routesOf(menuFor({ publicCode: 'LYC', adult: false }));
    for (const route of ['/dettes', '/patrimoine', '/financement', '/outils/explorateur']) {
      assert.ok(!routes.includes(route), route);
    }
  });

  test('a lycéen still has their own money, their goals and the learning entries', () => {
    const routes = routesOf(menuFor({ publicCode: 'LYC', adult: false }));
    for (const route of ['/aujourdhui', '/mon-argent', '/objectifs', '/portefeuille', '/apprendre']) {
      assert.ok(routes.includes(route), route);
    }
  });

  test('a colocation gets the shared space and not the personal patrimony', () => {
    const routes = routesOf(menuFor({ publicCode: 'COL', adult: true }));
    assert.ok(routes.includes('/espaces'));
    assert.ok(!routes.includes('/patrimoine'));
  });

  test('every route offered to a public is backed by a screen, or declared as ours', () => {
    // Le menu n'invente pas d'entrée. Chaque route qu'il propose vient soit
    // d'un écran que le client a activé pour ce public, soit d'une origine
    // déclarée dans `EXTRA_ROUTES` — et il n'y a pas de troisième cas.
    for (const publicCode of Object.keys(JOURNEYS)) {
      for (const route of routesOf(menuFor({ publicCode, adult: true }))) {
        if (EXTRA_ROUTES[route]) continue;
        const backing = Object.entries(SCREEN_ROUTES)
          .filter(([code, screen]) => screen.to === route && screenEnabledFor(publicCode, code))
          .map(([code]) => code);
        assert.ok(backing.length > 0, `${publicCode}: ${route} is backed by no screen`);
      }
    }
  });
});

describe('P1-12 — age, and the two refusals', () => {
  // `/entreprise` en fait partie depuis P7-02, et pour la même raison que les
  // autres : émettre des factures et porter des dettes fournisseurs ne sont
  // pas des gestes de mineur.
  const ADULT_ROUTES = ['/dettes', '/patrimoine', '/financement', '/outils/explorateur', '/entreprise'];

  test('an adult salarié sees the adults-only entries', () => {
    const routes = routesOf(menuFor({ publicCode: 'SAL', adult: true }));
    for (const route of ADULT_ROUTES) assert.ok(routes.includes(route), route);
  });

  test('the same public without the age bracket sees none of them', () => {
    // Deny by default: unknown is not adult. The menu takes the same side as
    // the server, so the two never contradict each other on screen.
    const routes = routesOf(menuFor({ publicCode: 'SAL', adult: false }));
    for (const route of ADULT_ROUTES) assert.ok(!routes.includes(route), route);
  });

  test('and hiding them costs a salarié nothing else', () => {
    // The failure to guard against is over-refusal. Everything that is not
    // reserved must survive the age filter untouched.
    const adult = routesOf(menuFor({ publicCode: 'SAL', adult: true }));
    const minor = routesOf(menuFor({ publicCode: 'SAL', adult: false }));
    assert.deepEqual(
      adult.filter((route) => !minor.includes(route)).sort(),
      [...ADULT_ROUTES].sort(),
    );
  });

  test('a group that only held adults-only entries disappears rather than showing empty', () => {
    // "Mon patrimoine" is exactly that case: real patrimony and funding, both
    // reserved. A heading with nothing under it reads as something broken.
    assert.ok(groupKeys(menuFor({ publicCode: 'SAL', adult: true })).includes('wealth'));
    assert.ok(!groupKeys(menuFor({ publicCode: 'SAL', adult: false })).includes('wealth'));
  });
});

describe('P1-12 — an account with no public yet', () => {
  test('sees every served route rather than an empty menu', () => {
    // A new account has not chosen a public. Refusing it a menu would lock it
    // out of its own money; `screenEnabledFor(null, …)` is true for this
    // reason, and the menu follows.
    const routes = routesOf(menuFor({ publicCode: null, adult: true }));
    assert.ok(routes.includes('/aujourdhui'));
    assert.ok(routes.includes('/mon-argent'));
    assert.ok(routes.length >= 15, `only ${routes.length} routes`);
  });

  test('but the age rule still applies to it', () => {
    const routes = routesOf(menuFor({ publicCode: null, adult: false }));
    assert.ok(!routes.includes('/dettes'));
  });

  test('and the default arguments are the cautious ones', () => {
    // `menuFor()` with nothing: no public, not an adult. A default that assumed
    // adulthood would make every forgotten argument a leak.
    assert.deepEqual(routesOf(menuFor()), routesOf(menuFor({ publicCode: null, adult: false })));
  });
});
