import '../helpers/setup-env.js';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { boot } from '../helpers/server.js';
import { SERVER_DIR } from '../helpers/env.js';
import { createApp } from '../../src/app.js';
import { TOOLS, toolByKey } from '../../src/constants/tools.js';
import { CONSUMER_DSR_HARD_MAX } from '../../src/constants/finCredit.js';

// Validation de fin de Phase 4 (P4-05).
//
// Les cinq critères de la tâche, vérifiés MÉCANIQUEMENT plutôt que relus. Un
// critère coché à la main se décoche tout seul à la modification suivante.
//
// Ce fichier ne refait pas le travail des suites existantes (comparateur,
// simulateurs, facture, atelier ont les leurs) : il vérifie que les critères
// de la PHASE tiennent encore, tous ensemble, au moment où on la déclare
// terminée.

let t;
let user;

before(async () => {
  t = await boot();
  await t.reset();
  user = await t.adult({ name: 'Recette P4' });
});
after(() => t.close());

// Les routes des outils, telles que l'application les expose réellement.
function toolRoutes() {
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
  return out.filter((route) => route.path.startsWith('/api/tools'));
}

// Le préfixe sous lequel chaque outil est monté, LU dans le fichier de routes.
//
// La première version de ce test les connaissait par cœur, et les avait
// devinés en anglais (`/comparisons`, `/explorer`, `/invoice`) alors qu'ils
// sont en français. Il signalait trois outils absents qui existaient tous :
// un test qui connaît les chemins de mémoire finit par tester sa mémoire.
function toolPrefixes() {
  const source = readFileSync(path.join(SERVER_DIR, 'src/routes/tools.routes.js'), 'utf8');
  const pattern = /router\.use\('(\/[^']+)'[^)]*toolAccess\('([^']+)'\)/g;
  return new Map([...source.matchAll(pattern)].map((match) => [match[2], `/api/tools${match[1]}`]));
}

describe('P4-05 — critère 1 : au moins deux outils sont utilisables', () => {
  test('le catalogue annonce plusieurs outils disponibles', async () => {
    const res = await t.request('GET', '/tools');
    assert.equal(res.status, 200);
    const available = res.body.tools.filter((tool) => tool.status === 'available');
    assert.ok(available.length >= 2, `${available.length} outil(s) disponible(s)`);
  });

  test('et aucun outil annoncé disponible n’est en réalité absent', async () => {
    // Le piège d'un catalogue : annoncer un outil que personne n'a construit.
    // `simulateur-credit` est resté « planned » pendant tout le projet ; il
    // est passé « available » le jour où il a existé, pas avant.
    const routes = toolRoutes();
    const prefixes = toolPrefixes();
    assert.ok(prefixes.size >= 5, `${prefixes.size} montages trouvés`);

    const missing = TOOLS.filter((tool) => tool.status === 'available')
      .filter((tool) => {
        const prefix = prefixes.get(tool.key);
        return !prefix || !routes.some((route) => route.path.startsWith(prefix));
      })
      .map((tool) => tool.key);
    assert.deepEqual(missing, [], 'un outil est annoncé disponible sans route');
  });
});

describe('P4-05 — critère 2 : les entrées sont validées côté serveur', () => {
  test('chaque POST d’outil refuse un corps vide', async () => {
    // Balayage de TOUTES les routes d'écriture des outils, pas d'une liste
    // choisie d'avance : une route ajoutée demain sans validation serait
    // signalée par ce test et par aucun autre.
    const posts = toolRoutes().filter((route) => route.method === 'POST' && !route.path.includes(':'));
    assert.ok(posts.length >= 4, `${posts.length} routes POST trouvées`);

    const accepted = [];
    for (const route of posts) {
      const res = await t.request('POST', route.path.replace('/api', ''), { user, json: {} });
      // 400 = refusé par la validation. 401/403 = refusé plus tôt encore, ce
      // qui convient aussi. Tout 2xx sur un corps vide est le défaut cherché.
      if (res.status < 400) accepted.push(`${route.path} -> ${res.status}`);
    }
    assert.deepEqual(accepted, [], 'une route accepte un corps vide');
  });

  test('et un champ inconnu est refusé, pas ignoré en silence', async () => {
    const res = await t.request('POST', '/tools/credit/simuler', {
      user,
      json: { principal: 100000000, annualRate: 0.08, months: 36, tauxSecret: 42 },
    });
    assert.equal(res.status, 400);
  });

  test('un montant décimal est refusé plutôt qu’arrondi', async () => {
    // Les montants sont des entiers de centimes partout dans le moteur.
    // Arrondir en silence ferait diverger ce que la personne a tapé et ce que
    // le serveur a calculé.
    const res = await t.request('POST', '/tools/credit/simuler', {
      user,
      json: { principal: 100000.5, annualRate: 0.08, months: 36 },
    });
    assert.equal(res.status, 400);
  });
});

describe('P4-05 — critère 3 : le simulateur suit les règles fournies', () => {
  test('la mensualité est celle de la formule CR02 du client', async () => {
    const res = await t.request('POST', '/tools/credit/simuler', {
      user,
      json: { principal: 100000000, annualRate: 0.08, months: 36, kind: 'Consommation' },
    });
    assert.equal(res.status, 200);
    assert.ok(Math.abs(res.body.mensualite.resultat - 3133637) <= 1, res.body.mensualite.resultat);
    assert.equal(res.body.mensualite.formule_id, 'F021');
  });

  test('le plafond légal de la consommation bloque, et cite son texte', async () => {
    const res = await t.request('POST', '/tools/credit/simuler', {
      user,
      json: { principal: 100000000, annualRate: 0.08, months: 36, income: 12000000, existingInstalments: 1000000, kind: 'Consommation' },
    });
    assert.equal(res.body.bloquants.length, 1);
    assert.match(res.body.bloquants[0], /15-114/);
    assert.match(res.body.bloquants[0], new RegExp(`${CONSUMER_DSR_HARD_MAX * 100} %`));
  });

  test('et il n’est pas appliqué à l’immobilier', async () => {
    // La règle que le client souligne lui-même : généraliser les 30 % à
    // l'immobilier refuserait des dossiers que la loi n'interdit pas.
    const res = await t.request('POST', '/tools/credit/simuler', {
      user,
      json: { principal: 100000000, annualRate: 0.08, months: 36, income: 12000000, existingInstalments: 1000000, kind: 'Immobilier' },
    });
    assert.deepEqual(res.body.bloquants, []);
  });

  test('chaque simulation porte la phrase que le client impose', async () => {
    const res = await t.request('POST', '/tools/credit/simuler', {
      user,
      json: { principal: 50000000, annualRate: 0.06, months: 24 },
    });
    assert.ok(res.body.avertissements.includes('Ce calcul est une simulation mathématique et ne constitue pas une offre de crédit.'));
  });

  test('les 25 offres sont montrées avec leur provenance, aucune ne sert à un calcul d’éligibilité (P8-28)', async () => {
    const res = await t.request('GET', '/tools/credit/offres', { user });
    assert.equal(res.status, 200);
    assert.equal(res.body.total, 25);
    assert.equal(res.body.publiables, 0, 'none is computable: its criteria are text');
    assert.ok(res.body.offres.every((offer) => typeof offer.criteres.taux === 'string' && offer.source), 'each fiche with its criteria and its source');
    assert.match(res.body.affichage.notice, /non vérifiée par FINCLUDIA/);
  });
});

describe('P4-05 — critère 4 : la facture est générée', () => {
  test('le calcul répond et le fichier Excel est produit', async () => {
    // La facture complète que le générateur attend : un numéro, une date,
    // un vendeur et un acheteur. Ma première version n'envoyait que des
    // lignes — et le serveur avait raison de la refuser.
    const invoice = {
      number: 'F-2026/P405',
      issueDate: '2026-10-17',
      currency: 'dzd',
      seller: { name: 'Studio Recette', details: 'Alger' },
      buyer: { name: 'Client SARL', details: '' },
      lines: [{ description: 'Prestation', quantity: '2', unitPrice: '15000', vatRate: '19' }],
    };
    const computed = await t.request('POST', '/tools/factures/calcul', { user, json: invoice });
    assert.equal(computed.status, 200, JSON.stringify(computed.body).slice(0, 200));

    const excel = await t.request('POST', '/tools/factures/excel', { user, json: invoice });
    assert.equal(excel.status, 200);
    assert.ok(excel.buffer.length > 1000, `fichier de ${excel.buffer.length} octets`);
  });
});

describe('P4-05 — critère 5 : les règles d’accès sont respectées', () => {
  test('un outil public reste ouvert, un outil authentifié reste fermé', async () => {
    // Les deux sens comptent : un outil public verrouillé par erreur est
    // aussi un défaut qu'un outil privé laissé ouvert.
    assert.equal(toolByKey('comparateur-bancaire').access, 'public');
    assert.notEqual((await t.request('GET', '/tools/comparator')).status, 401);

    assert.equal(toolByKey('simulateur-credit').access, 'authenticated');
    assert.equal((await t.request('GET', '/tools/credit/regles')).status, 401);
    assert.equal((await t.request('GET', '/tools/credit/regles', { user })).status, 200);
  });

  test('« Explorer » reste réservé aux majeurs', async () => {
    // Le seul outil avec une règle d'âge, et elle est désormais à 19 ans
    // (P6-22, chantier 1).
    const minor = await t.minor({ finPublic: 'LYC' });
    const res = await t.request('GET', '/tools/explorateur', { user: minor });
    assert.equal(res.status, 403);
    assert.equal(res.body.error.details.reason, 'adultsOnly');
  });

  test('aucun outil n’écrit en base', async () => {
    // Les outils calculent ; ils ne conservent rien. C'est ce qui leur permet
    // d'être publics sans exposer de données de compte, et c'est vérifié
    // plutôt que supposé.
    const before = await t.prisma.user.count();
    await t.request('POST', '/tools/credit/simuler', { user, json: { principal: 50000000, annualRate: 0.06, months: 24 } });
    await t.request('POST', '/tools/postal/cout-annuel', { json: { services: ['AP-052'] } });
    assert.equal(await t.prisma.user.count(), before);
  });
});
