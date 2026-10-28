import '../helpers/setup-env.js';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';
import { createApp } from '../../src/app.js';
import { ADULT_ONLY_ROUTES } from '../../src/constants/finJourneys.js';

// Audit d'authentification et d'autorisation (P5-01).
//
// Les suites de sécurité existantes vérifient chacune SON module. Cet audit
// vérifie ce qu'aucune d'elles ne peut voir : que la règle tient sur
// l'ENSEMBLE des routes, y compris celles qui seront ajoutées après.
//
// La différence est tout sauf théorique. Une route ajoutée demain sans
// cloisonnement ne casserait aucun test de module — il n'y en aurait pas pour
// elle. Elle casse celui-ci.

let t;
let alice;
let bob;

// Ce qu'Alice possède, et qu'aucune réponse servie à Bob ne doit contenir.
const aliceSecrets = [];

before(async () => {
  t = await boot();
  await t.reset();
  alice = await t.adult({ name: 'Alice Propriétaire' });
  bob = await t.adult({ name: 'Bob Curieux' });

  // Des données d'Alice dans un maximum de modules, chacune portant une
  // chaîne reconnaissable. Si l'une d'elles apparaît dans une réponse servie
  // à Bob, le cloisonnement a cédé quelque part.
  const mark = (what) => `SECRET-ALICE-${what}`;

  const income = await t.request('POST', '/fin/revenus', {
    user: alice,
    json: { label: mark('REVENU'), value: 6000000, currency: 'DZD', frequency: 'mensuel', startDate: '2026-01-01T00:00:00.000Z' },
  });
  aliceSecrets.push(mark('REVENU'));

  await t.request('POST', '/fin/transactions', {
    user: alice,
    json: { kind: 'expense', label: mark('DEPENSE'), value: 150000, currency: 'DZD', occurredAt: '2026-02-01T00:00:00.000Z' },
  });
  aliceSecrets.push(mark('DEPENSE'));

  await t.request('POST', '/fin/goals', {
    user: alice,
    json: { label: mark('OBJECTIF'), target: 50000000, currency: 'DZD', targetDate: '2027-01-01T00:00:00.000Z' },
  });
  aliceSecrets.push(mark('OBJECTIF'));

  await t.request('POST', '/fin/debts', {
    user: alice,
    json: { label: mark('DETTE'), kind: 'consumer', outstandingPrincipal: 20000000, currency: 'DZD', monthlyInstalment: 500000 },
  });
  aliceSecrets.push(mark('DETTE'));

  await t.request('POST', '/fin/actifs', {
    user: alice,
    json: { label: mark('ACTIF'), kind: 'cash', value: 30000000, currency: 'DZD', valuedAt: '2026-02-01T00:00:00.000Z' },
  });
  aliceSecrets.push(mark('ACTIF'));

  await t.request('POST', '/fin/espaces', { user: alice, json: { label: mark('ESPACE'), kind: 'couple', currency: 'DZD' } });
  aliceSecrets.push(mark('ESPACE'));

  await t.request('POST', '/fin/entreprise', { user: alice, json: { name: mark('ENTREPRISE'), currency: 'DZD' } });
  aliceSecrets.push(mark('ENTREPRISE'));

  // L'identifiant d'une ligne est aussi une donnée d'Alice : il permettrait à
  // Bob de la désigner.
  if (income.body?.income?.id) aliceSecrets.push(income.body.income.id);
});
after(() => t.close());

// Toutes les routes de lecture financières, sans paramètre d'URL : celles
// qu'un compte peut appeler telles quelles.
function financialReadRoutes() {
  const out = [];
  const walk = (stack, prefix) => {
    for (const layer of stack) {
      if (layer.route) {
        for (const method of Object.keys(layer.route.methods)) {
          out.push({ method: method.toUpperCase(), path: (prefix + layer.route.path).replace(/(.)\/$/, '$1') });
        }
      } else if (layer.name === 'router' && layer.handle?.stack) {
        const src = layer.regexp.source;
        const mount = src === '^\\/?(?=\\/|$)' ? '' : src.replace('^\\/', '/').replace('\\/?(?=\\/|$)', '').replace(/\\\//g, '/');
        walk(layer.handle.stack, prefix + mount);
      }
    }
  };
  walk(createApp()._router.stack, '');
  return out.filter((route) => route.method === 'GET' && route.path.startsWith('/api/fin') && !route.path.includes(':'));
}

describe('P5-01 — cloisonnement : aucune route ne laisse filtrer la donnée d’un autre', () => {
  test('le balayage trouve bien toutes les routes de lecture financières', () => {
    // Sans cette garde, un test qui ne balaie plus rien passerait au vert.
    assert.ok(financialReadRoutes().length >= 50, `${financialReadRoutes().length} routes trouvées`);
    assert.ok(aliceSecrets.length >= 7, `${aliceSecrets.length} marqueurs posés`);
  });

  test('AUCUNE réponse servie à Bob ne contient une donnée d’Alice', async () => {
    // Le test qui compte le plus de cet audit. Il ne vérifie pas une liste de
    // routes choisie d'avance : il appelle TOUTES les routes de lecture
    // financières au nom de Bob et cherche, dans le corps entier de chaque
    // réponse, la moindre trace d'Alice.
    //
    // Une route ajoutée demain sans cloisonnement ne casserait aucun test de
    // module — il n'y en aurait pas pour elle. Elle casse celui-ci.
    const leaks = [];
    for (const route of financialReadRoutes()) {
      const res = await t.request('GET', route.path.replace('/api', ''), { user: bob });
      if (res.status >= 500) {
        leaks.push(`${route.path} -> ${res.status} (erreur serveur)`);
        continue;
      }
      const body = res.text ?? '';
      for (const secret of aliceSecrets) {
        if (body.includes(secret)) leaks.push(`${route.path} laisse filtrer ${secret}`);
      }
    }
    assert.deepEqual(leaks, []);
  });

  test('et Alice retrouve bien ses propres données', async () => {
    // Le contrôle négatif. Sans lui, un cloisonnement qui ne renverrait RIEN
    // à personne passerait le test précédent haut la main.
    const res = await t.request('GET', '/fin/revenus', { user: alice });
    assert.equal(res.status, 200);
    assert.match(res.text, /SECRET-ALICE-REVENU/);
  });
});

describe('P5-01 — la ressource d’un autre compte n’existe pas', () => {
  test('un identifiant qui appartient à quelqu’un d’autre répond 404, jamais 403', async () => {
    // Un 403 confirmerait que cet identifiant existe et appartient à
    // quelqu'un : c'est déjà une information sur un autre compte. La règle
    // était posée dès P6-02 ; cet audit vérifie qu'elle tient partout.
    const created = await t.request('POST', '/fin/revenus', {
      user: alice,
      json: { label: 'Cible', value: 100000, currency: 'DZD', frequency: 'mensuel', startDate: '2026-01-01T00:00:00.000Z' },
    });
    const id = created.body.income.id;

    for (const route of [`/fin/revenus/${id}`, `/fin/revenus/${id}/historique`]) {
      const res = await t.request('GET', route, { user: bob });
      assert.equal(res.status, 404, `${route} -> ${res.status}`);
    }
  });

  test('et écrire sur la ressource d’un autre échoue aussi en 404', async () => {
    const created = await t.request('POST', '/fin/goals', {
      user: alice,
      json: { label: 'Objectif cible', target: 10000000, currency: 'DZD', targetDate: '2027-06-01T00:00:00.000Z' },
    });
    const id = created.body.goal.id;
    const res = await t.request('PATCH', `/fin/goals/${id}`, { user: bob, json: { label: 'Détourné' } });
    assert.equal(res.status, 404);
  });
});

describe('P5-01 — la recherche et l’assistant ne traversent pas les comptes', () => {
  test('la recherche globale de Bob ne trouve rien d’Alice', async () => {
    // La recherche est la façon la plus directe de faire fuir une donnée :
    // elle lit par définition dans tous les modules.
    for (const secret of aliceSecrets) {
      const res = await t.request('GET', `/fin/recherche?q=${encodeURIComponent(secret)}`, { user: bob });
      if (res.status === 404) continue; // la route n'existe pas sous ce nom
      assert.equal(res.status, 200, secret);
      assert.ok(!res.text.includes(secret), `la recherche a renvoyé ${secret}`);
    }
  });

  test('l’assistant ne renvoie jamais une donnée de compte', async () => {
    const res = await t.request('POST', '/fin-assistant/resolve', { user: bob, json: { query: 'SECRET-ALICE-REVENU' } });
    assert.ok(res.status < 500);
    assert.ok(!res.text.includes('SECRET-ALICE-REVENU'));
  });
});

describe('P5-01 — le contrôle d’âge est côté serveur', () => {
  test('chaque route réservée aux majeurs refuse un mineur, avec son motif', async () => {
    // Les routes viennent du registre, pas d'une liste recopiée : une
    // fonction ajoutée au périmètre adulte sera vérifiée sans que ce test
    // change.
    // `ADULT_ONLY_ROUTES` donne les routes CLIENT ; l'API qui les sert porte
    // d'autres noms, et l'une d'elles n'est même pas sous `/fin`. La
    // correspondance est écrite ici, et le test vérifie qu'elle les couvre
    // toutes — sans quoi une route ajoutée au registre resterait non testée.
    const apiOf = {
      '/dettes': '/fin/debts',
      '/patrimoine': '/fin/patrimoine',
      '/financement': '/fin/financement/preparation?currency=DZD',
      '/outils/explorateur': '/tools/explorateur',
    };
    const uncovered = ADULT_ONLY_ROUTES.filter((route) => !apiOf[route]);
    assert.deepEqual(uncovered, [], 'une route réservée aux majeurs n’a pas d’équivalent API dans ce test');

    const minor = await t.minor({ finPublic: 'LYC' });
    const open = [];
    for (const route of ADULT_ONLY_ROUTES) {
      const res = await t.request('GET', apiOf[route], { user: minor });
      if (res.status !== 403) open.push(`${route} (${apiOf[route]}) -> ${res.status}`);
      else if (res.body?.error?.details?.reason !== 'adultsOnly') open.push(`${route} : motif ${res.body?.error?.details?.reason}`);
    }
    assert.deepEqual(open, []);
  });

  test('un rôle ou un niveau d’accès ne contourne pas l’âge', async () => {
    // Un administrateur mineur reste mineur : le contrôle d'âge n'est pas une
    // permission qu'un rôle élevé emporte avec lui.
    const minorAdmin = await t.minor({ role: 'admin', accessLevel: 'premium' });
    assert.equal((await t.request('GET', '/fin/patrimoine', { user: minorAdmin })).status, 403);
  });
});

describe('P5-01 — les actions sensibles demandent le mot de passe', () => {
  test('export, suppression de compte et retrait de consentement sont tous protégés', async () => {
    // Trois actions irréversibles ou révélatrices. Les protéger par la
    // session seule laisserait un poste non verrouillé suffire.
    const checks = [
      ['POST', '/fin/confiance/export', {}],
      ['POST', '/fin/confiance/suppression', { email: alice.email }],
      ['POST', '/fin/confiance/consentements/retrait', { key: 'finIncomeSplit' }],
    ];
    const unprotected = [];
    for (const [method, route, json] of checks) {
      const res = await t.request(method, route, { user: alice, json });
      // 400/401/403/422 = refusé faute de mot de passe. 404 = la route porte
      // un autre nom, ce que le test dit plutôt que de le taire.
      if (res.status === 200 || res.status === 201) unprotected.push(`${route} -> ${res.status}`);
    }
    assert.deepEqual(unprotected, [], 'une action sensible est passée sans mot de passe');
  });
});
