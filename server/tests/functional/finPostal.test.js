import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';
import { POSTAL_SERVICES } from '../../src/constants/finPostal.js';

// L'API du référentiel Algérie Poste / CCP (P4-17).
//
// Les règles sont testées sans HTTP dans tests/unit/finPostal.test.js. Ce qui
// est vérifié ici est ce qui sort réellement par le réseau — parce que c'est
// là qu'un tarif invérifiable deviendrait public, et qu'une vue correcte en
// mémoire ne prouve rien sur ce que le serveur envoie.

let t;

before(async () => {
  t = await boot();
});
after(() => t.close());

describe('P4-17 — le référentiel postal par l’API', () => {
  test('le résumé est public et annonce qu’aucune ligne n’est publiable', async () => {
    const res = await t.request('GET', '/tools/postal');
    assert.equal(res.status, 200);
    assert.equal(res.body.fiches, 75);
    assert.equal(res.body.publiables, 0);
    assert.equal(res.body.calculables, 0);
    assert.equal(res.body.controlesOuverts, 16);
  });

  test('le catalogue est servi sans session', async () => {
    // Données de référence, pas données de compte : même règle que le
    // comparateur bancaire.
    const res = await t.request('GET', '/tools/postal/services');
    assert.equal(res.status, 200);
    assert.equal(res.body.services.length, 75);
  });

  test('les tarifs sont montrés, à la demande du client (P8-28), tels que sa source les donne', async () => {
    // Until 2026-10-28 every amount was withheld. The client asked for the
    // referential to be integrated: the tariff is shown as its source says.
    const res = await t.request('GET', '/tools/postal/services');
    const edahabia = res.body.services.find((row) => row.service_id === 'AP-009');
    assert.equal(edahabia.raw_tariff_text, POSTAL_SERVICES.find((row) => row.service_id === 'AP-009').raw_tariff_text);
  });

  test('chaque fiche dit d’où vient son tarif, et qu’il n’est pas vérifié par FINCLUDIA', async () => {
    const res = await t.request('GET', '/tools/postal/services');
    const silent = res.body.services.filter((row) => row.tarifStatut !== 'source_client' || !/non vérifiée par FINCLUDIA/.test(row.tarifRaison ?? ''));
    assert.deepEqual(silent.map((r) => r.service_id), []);
  });

  test('les notes internes ne sortent pas', async () => {
    const res = await t.request('GET', '/tools/postal/services');
    const leaked = res.body.services.filter((row) => 'review_notes' in row || 'verification_status' in row);
    assert.deepEqual(leaked.map((r) => r.service_id), []);
  });

  test('une fiche se lit par son identifiant, et un identifiant inconnu répond 404', async () => {
    const ok = await t.request('GET', '/tools/postal/services/AP-009');
    assert.equal(ok.status, 200);
    assert.equal(ok.body.service.service_name, 'Création ou renouvellement EDAHABIA');
    assert.equal(ok.body.service.fee_amount_dzd, POSTAL_SERVICES.find((row) => row.service_id === 'AP-009').fee_amount_dzd, 'the source’s tariff (P8-28)');
    assert.equal(ok.body.service.tarifStatut, 'source_client');

    const missing = await t.request('GET', '/tools/postal/services/AP-999');
    assert.equal(missing.status, 404);
  });

  test('le filtre par famille refuse une famille qui n’existe pas', async () => {
    const ok = await t.request('GET', '/tools/postal/services?famille=cartes_monetique_locale');
    assert.equal(ok.status, 200);
    assert.ok(ok.body.services.length > 0);

    const bad = await t.request('GET', '/tools/postal/services?famille=credits');
    assert.equal(bad.status, 400);
  });

  test('les 16 contrôles sont publiés, ouverts', async () => {
    const res = await t.request('GET', '/tools/postal/controles');
    assert.equal(res.status, 200);
    assert.equal(res.body.controles.length, 16);
    assert.ok(res.body.controles.every((row) => row.statut === 'ouvert'));
  });

  test('le barème PIN PAD est servi, et annoncé non calculable', async () => {
    const res = await t.request('GET', '/tools/postal/pinpad');
    assert.equal(res.status, 200);
    assert.equal(res.body.calculable, false);
    assert.ok(res.body.tranches.length >= 4);
  });

  test('le coût annuel répond null avec sa raison, ligne par ligne', async () => {
    const res = await t.request('POST', '/tools/postal/cout-annuel', { json: { services: ['AP-052', 'AP-063'] } });
    assert.equal(res.status, 200);
    assert.equal(res.body.total, null);
    assert.equal(res.body.bloquees.length, 2);
    assert.ok(res.body.bloquees.every((row) => row.raison === 'calcul_non_autorise'));
  });

  test('le forfait TPE et ses composantes ne sont jamais comptés deux fois', async () => {
    const res = await t.request('POST', '/tools/postal/cout-annuel', {
      json: { services: ['AP-052', 'AP-058', 'AP-059', 'AP-060'] },
    });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.ignorees.map((row) => row.service_id).sort(), ['AP-058', 'AP-059', 'AP-060']);
  });

  test('un identifiant inventé est refusé plutôt qu’ignoré', async () => {
    const res = await t.request('POST', '/tools/postal/cout-annuel', { json: { services: ['AP-052', 'AP-999'] } });
    assert.equal(res.status, 400);
  });

  test('une sélection vide est refusée', async () => {
    const res = await t.request('POST', '/tools/postal/cout-annuel', { json: { services: [] } });
    assert.equal(res.status, 400);
  });

  test('un champ inconnu dans le corps est refusé, pas ignoré', async () => {
    const res = await t.request('POST', '/tools/postal/cout-annuel', {
      json: { services: ['AP-052'], remise: 50 },
    });
    assert.equal(res.status, 400);
  });

  test('le référentiel ne touche jamais la base', async () => {
    // Il est généré depuis le classeur : aucune route ne doit lire une table.
    // Si l'une d'elles le faisait, elle deviendrait dépendante d'un compte et
    // ne pourrait plus être publique.
    const before = await t.prisma.user.count();
    await t.request('GET', '/tools/postal/services');
    await t.request('POST', '/tools/postal/cout-annuel', { json: { services: ['AP-052'] } });
    assert.equal(await t.prisma.user.count(), before);
  });
});
