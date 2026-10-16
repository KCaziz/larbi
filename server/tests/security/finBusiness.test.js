import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Espace entreprise (P7-02) : ce que l'API autorise réellement.
//
// Deux garanties, et la seconde existe parce qu'elle est facile à casser :
//   1. une entreprise n'est jamais lisible par un autre compte — aucune route
//      ne prend d'identifiant d'entreprise, elle est déduite de la session ;
//   2. réserver ces routes aux majeurs ne doit RIEN retirer d'autre. Tous les
//      routeurs financiers partagent le préfixe `/fin`, et un
//      `router.use(requireAdult)` sans chemin garderait tout ce qui est
//      déclaré après lui. C'est arrivé en P6-17, et le test est ici pour que
//      cela ne recommence pas.

let t;

before(async () => {
  t = await boot();
});
beforeEach(() => t.reset());
after(() => t.close());

const business = { name: 'Atelier Belkacem', currency: 'DZD', legalForm: 'pme' };
const sale = {
  kind: 'sale',
  number: 'F-2026-001',
  label: 'Prestation de conseil',
  issuedAt: '2026-01-10T00:00:00.000Z',
  amountExcl: 100000,
  taxAmount: 19000,
  currency: 'DZD',
};

async function withBusiness(user) {
  const res = await t.request('POST', '/fin/entreprise', { user, json: business });
  assert.equal(res.status, 201, JSON.stringify(res.body).slice(0, 200));
  return res.body.entreprise;
}

describe('P7-02 — l’espace entreprise est réservé aux majeurs', () => {
  test('un mineur est refusé, avec un motif', async () => {
    const minor = await t.minor({ finPublic: 'LYC' });
    const res = await t.request('GET', '/fin/entreprise', { user: minor });
    assert.equal(res.status, 403);
    assert.equal(res.body.error.details.reason, 'adultsOnly');
  });

  test('un compte sans tranche d’âge est refusé, et sait quoi corriger', async () => {
    const unknown = await t.user();
    const res = await t.request('GET', '/fin/entreprise', { user: unknown });
    assert.equal(res.status, 403);
    assert.equal(res.body.error.details.reason, 'ageUnknown');
  });

  test('et un mineur garde TOUTES les routes qui sont les siennes', async () => {
    // La garde est liée à son chemin. Montée sans chemin, elle refuserait
    // aussi la réserve, le calendrier, l'accueil — tout ce qui suit sur le
    // préfixe `/fin`. Ce test vérifie le sur-refus, pas le refus.
    const minor = await t.minor({ finPublic: 'LYC' });
    const refused = [];
    for (const route of ['/fin/aujourdhui', '/fin/argent/synthese', '/fin/budgets', '/fin/reserve', '/fin/calendrier', '/fin/notifications', '/fin/parcours', '/fin/portefeuille']) {
      const res = await t.request('GET', route, { user: minor });
      if (res.status === 403) refused.push(`${route} -> ${res.body.error?.details?.reason}`);
    }
    assert.deepEqual(refused, [], 'un mineur ne doit jamais perdre ses propres pages');
  });

  test('une session est nécessaire', async () => {
    assert.equal((await t.request('GET', '/fin/entreprise')).status, 401);
    assert.equal((await t.request('POST', '/fin/entreprise', { json: business })).status, 401);
  });
});

describe('P7-02 — une entreprise n’appartient qu’à son compte', () => {
  test('un autre compte ne voit pas l’entreprise d’un autre', async () => {
    const mine = await t.adult();
    const other = await t.adult();
    await withBusiness(mine);

    const res = await t.request('GET', '/fin/entreprise', { user: other });
    assert.equal(res.status, 200);
    assert.equal(res.body.entreprise, null);
  });

  test('ni ses tiers, ni ses documents, ni son tableau de bord', async () => {
    const mine = await t.adult();
    const other = await t.adult();
    await withBusiness(mine);
    await t.request('POST', '/fin/entreprise/tiers', { user: mine, json: { kind: 'client', name: 'Client A' } });
    await t.request('POST', '/fin/entreprise/documents', { user: mine, json: sale });

    // L'autre compte n'a pas d'entreprise : il ne reçoit pas celle du premier,
    // il reçoit un 404 qui dit qu'il n'en a pas.
    for (const route of ['/fin/entreprise/tiers', '/fin/entreprise/documents', '/fin/entreprise/tableau-de-bord']) {
      const res = await t.request('GET', route, { user: other });
      assert.equal(res.status, 404, route);
      assert.equal(res.body.error.details.reason, 'noBusiness', route);
    }
  });

  test('un règlement ne peut pas viser le document d’un autre compte', async () => {
    // Le test qui compte : l'identifiant du document vient de l'URL, donc
    // c'est le seul endroit où un compte pourrait désigner la donnée d'un
    // autre. La requête est bornée à l'entreprise de l'appelant.
    const mine = await t.adult();
    const other = await t.adult();
    await withBusiness(mine);
    const created = await t.request('POST', '/fin/entreprise/documents', { user: mine, json: sale });
    const documentId = created.body.document.id;

    await withBusiness(other);
    const res = await t.request('POST', `/fin/entreprise/documents/${documentId}/reglements`, {
      user: other,
      json: { value: 1000, currency: 'DZD', receivedAt: '2026-01-20T00:00:00.000Z' },
    });
    assert.equal(res.status, 404);
    assert.equal(res.body.error.details.reason, 'documentNotFound');
  });

  test('un compte n’a qu’une entreprise', async () => {
    const user = await t.adult();
    await withBusiness(user);
    const again = await t.request('POST', '/fin/entreprise', { user, json: business });
    assert.equal(again.status, 409);
    assert.equal(again.body.error.details.reason, 'businessExists');
  });
});

describe('P7-02 — les règles que la base ne peut pas tenir', () => {
  test('un document suit la devise de son entreprise', async () => {
    const user = await t.adult();
    await withBusiness(user);
    const res = await t.request('POST', '/fin/entreprise/documents', {
      user,
      json: { ...sale, currency: 'EUR' },
    });
    assert.equal(res.status, 422);
    assert.equal(res.body.error.details.reason, 'currencyMismatch');
  });

  test('un règlement suit la devise de son document', async () => {
    // Cette règle référence une colonne de clé étrangère : MariaDB refuse une
    // telle CHECK (erreur 1901). Elle vit donc dans le service, et c'est ce
    // test qui la garde.
    const user = await t.adult();
    await withBusiness(user);
    const created = await t.request('POST', '/fin/entreprise/documents', { user, json: sale });
    const res = await t.request('POST', `/fin/entreprise/documents/${created.body.document.id}/reglements`, {
      user,
      json: { value: 1000, currency: 'EUR', receivedAt: '2026-01-20T00:00:00.000Z' },
    });
    assert.equal(res.status, 422);
    assert.equal(res.body.error.details.reason, 'currencyMismatch');
  });

  test('un règlement ne dépasse jamais ce qui reste dû', async () => {
    // Un trop-perçu vient presque toujours d'une saisie en double, et le
    // laisser passer fausse les créances sans que personne ne le voie.
    const user = await t.adult();
    await withBusiness(user);
    const created = await t.request('POST', '/fin/entreprise/documents', { user, json: sale });
    const id = created.body.document.id;
    const first = await t.request('POST', `/fin/entreprise/documents/${id}/reglements`, {
      user,
      json: { value: 119000, currency: 'DZD', receivedAt: '2026-01-20T00:00:00.000Z' },
    });
    assert.equal(first.status, 201);

    const second = await t.request('POST', `/fin/entreprise/documents/${id}/reglements`, {
      user,
      json: { value: 1, currency: 'DZD', receivedAt: '2026-01-21T00:00:00.000Z' },
    });
    assert.equal(second.status, 422);
    assert.equal(second.body.error.details.reason, 'overpayment');
  });

  test('un règlement ne précède pas son document', async () => {
    const user = await t.adult();
    await withBusiness(user);
    const created = await t.request('POST', '/fin/entreprise/documents', { user, json: sale });
    const res = await t.request('POST', `/fin/entreprise/documents/${created.body.document.id}/reglements`, {
      user,
      json: { value: 1000, currency: 'DZD', receivedAt: '2025-12-31T00:00:00.000Z' },
    });
    assert.equal(res.status, 422);
    assert.equal(res.body.error.details.reason, 'paymentBeforeIssue');
  });

  test('une vente va à un client, pas à un fournisseur', async () => {
    // Sans cette règle, le total des créances clients compterait des
    // fournisseurs.
    const user = await t.adult();
    await withBusiness(user);
    const supplier = await t.request('POST', '/fin/entreprise/tiers', {
      user,
      json: { kind: 'supplier', name: 'Fournisseur B' },
    });
    const res = await t.request('POST', '/fin/entreprise/documents', {
      user,
      json: { ...sale, contactId: supplier.body.tiers.id },
    });
    assert.equal(res.status, 422);
    assert.equal(res.body.error.details.reason, 'contactKindMismatch');
  });

  test('deux documents ne portent pas le même numéro', async () => {
    const user = await t.adult();
    await withBusiness(user);
    assert.equal((await t.request('POST', '/fin/entreprise/documents', { user, json: sale })).status, 201);
    const again = await t.request('POST', '/fin/entreprise/documents', { user, json: sale });
    assert.equal(again.status, 409);
    assert.equal(again.body.error.details.reason, 'duplicateNumber');
  });

  test('un champ inconnu est refusé, pas ignoré', async () => {
    const user = await t.adult();
    await withBusiness(user);
    const res = await t.request('POST', '/fin/entreprise/documents', {
      user,
      json: { ...sale, number: 'F-2026-002', tauxTva: 19 },
    });
    assert.equal(res.status, 400);
  });
});

describe('P7-02 — le tableau de bord ne prétend pas être une comptabilité', () => {
  test('il nomme les états qu’il ne produit pas, et ce qui leur manque', async () => {
    const user = await t.adult();
    await withBusiness(user);
    const res = await t.request('GET', '/fin/entreprise/tableau-de-bord', { user });
    assert.equal(res.status, 200);

    const keys = res.body.etatsNonProduits.map((s) => s.key).sort();
    assert.deepEqual(keys, ['balance_sheet', 'depreciation', 'income_statement', 'inventory', 'vat_return']);
    assert.match(res.body.avertissement, /ne remplacent pas un bilan/);
  });

  test('sans document, chaque chiffre est « non calculé » et jamais zéro', async () => {
    const user = await t.adult();
    await withBusiness(user);
    const res = await t.request('GET', '/fin/entreprise/tableau-de-bord', { user });
    for (const key of ['encaissements', 'decaissements', 'tresorerie', 'creances', 'dettes']) {
      assert.equal(res.body[key].resultat, null, key);
    }
  });

  test('une vente réglée se retrouve en trésorerie, par le contrat du moteur', async () => {
    const user = await t.adult();
    await withBusiness(user);
    const created = await t.request('POST', '/fin/entreprise/documents', { user, json: sale });
    await t.request('POST', `/fin/entreprise/documents/${created.body.document.id}/reglements`, {
      user,
      json: { value: 119000, currency: 'DZD', receivedAt: '2026-01-20T00:00:00.000Z' },
    });

    const res = await t.request('GET', '/fin/entreprise/tableau-de-bord', { user });
    assert.equal(res.body.encaissements.resultat, 119000);
    assert.equal(res.body.tresorerie.resultat, 119000);
    assert.equal(res.body.creances.resultat, null);
    assert.equal(res.body.encaissements.formule_id, 'E004');
    assert.ok(res.body.encaissements.calcule_le);
  });
});
