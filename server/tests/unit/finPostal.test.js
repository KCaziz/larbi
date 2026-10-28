import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  POSTAL_BLOCKED_CALCULATIONS,
  POSTAL_CONTROLS,
  POSTAL_COVERAGE,
  POSTAL_PINPAD_SCALE,
  POSTAL_SERVICES,
  POSTAL_UNDOCUMENTED_FAMILIES,
  postalBillableServices,
  postalService,
} from '../../src/constants/finPostal.js';
import {
  annualEquivalent,
  annualTotal,
  pinpadScale,
  publicCatalogue,
  publicView,
  referenceSummary,
} from '../../src/services/finPostal.service.js';

// Référentiel Algérie Poste / CCP (P4-17).
//
// Ces tests gardent une seule chose, et c'est la plus facile à perdre : le
// classeur du client dit que RIEN n'est publiable, et le produit doit continuer
// à le dire même après une relecture distraite qui trouverait dommage de ne pas
// afficher un prix qu'on a sous la main.

describe('P4-17 — le référentiel est celui du client, sans retouche', () => {
  test('les 75 fiches sont là, avec leurs identifiants stables', () => {
    assert.equal(POSTAL_SERVICES.length, 75);
    assert.ok(postalService('AP-001'));
    assert.ok(postalService('AP-075'));
    assert.equal(postalService('AP-999'), null);
  });

  test('aucun identifiant n’apparaît deux fois', () => {
    const ids = POSTAL_SERVICES.map((row) => row.service_id);
    assert.deepEqual([...new Set(ids)].sort(), [...ids].sort());
  });

  test('la nature de chaque fiche est l’une de celles que le client distingue', () => {
    // « tarif ≠ plafond ≠ délai ≠ procédure » est écrit en toutes lettres dans
    // le classeur : c'est la distinction qui empêche d'afficher un plafond de
    // retrait comme s'il s'agissait d'un prix.
    const kinds = new Set(['TARIF', 'PLAFOND', 'DÉLAI', 'PROCÉDURE', 'INFORMATION', 'DÉFINITION']);
    const unknown = POSTAL_SERVICES.filter((row) => !kinds.has(row.entry_kind)).map((row) => row.service_id);
    assert.deepEqual(unknown, []);
  });

  test('un montant absent est null, jamais zéro', () => {
    // Zéro est une réponse (« c'est gratuit »), null en est l'absence. Les
    // confondre ferait passer 29 tarifs inconnus pour des gratuités.
    const free = POSTAL_SERVICES.filter((row) => row.fee_mode === 'GRATUIT_EXPLICITE');
    const unpriced = POSTAL_SERVICES.filter((row) => row.fee_mode === 'NON_CHIFFRÉ');
    assert.ok(free.length > 0 && unpriced.length > 0);
    assert.deepEqual(free.filter((row) => row.fee_amount_dzd !== 0).map((r) => r.service_id), []);
    assert.deepEqual(unpriced.filter((row) => row.fee_amount_dzd !== null).map((r) => r.service_id), []);
  });

  test('le taux plafond TPE est un décimal, pas un pourcentage', () => {
    // 1,5 % s'écrit 0.015 dans le moteur, comme tous les taux du projet.
    const tpe = postalService('AP-053');
    assert.ok(tpe.fee_rate_max > 0 && tpe.fee_rate_max < 1, `taux inattendu : ${tpe.fee_rate_max}`);
    assert.ok(Math.abs(tpe.fee_rate_max - 0.015) < 1e-9);
  });
});

describe('P4-17 — rien n’est publiable, et le produit le dit', () => {
  test('aucune fiche n’est publiable ni calculable', () => {
    assert.deepEqual(POSTAL_SERVICES.filter((row) => row.publishable).map((r) => r.service_id), []);
    assert.deepEqual(POSTAL_SERVICES.filter((row) => row.auto_compute).map((r) => r.service_id), []);
  });

  test('aucune fiche n’est marquée vérifiée', () => {
    // « Jamais VALIDATED sans preuve » (dictionnaire de l'onglet 14).
    const validated = POSTAL_SERVICES.filter((row) => row.verification_status === 'VALIDATED');
    assert.deepEqual(validated.map((r) => r.service_id), []);
  });

  test('la vue publique montre le tarif de la source, et dit qu’il n’est pas vérifié (P8-28)', () => {
    const view = publicView(postalService('AP-009'));
    assert.equal(view.raw_tariff_text, postalService('AP-009').raw_tariff_text);
    assert.equal(view.tarifStatut, 'source_client');
    assert.match(view.tarifRaison, /non vérifiée par FINCLUDIA/);
    // Shown, never computed with.
    assert.equal(view.auto_compute, false);
  });

  test('mais elle garde le service, son canal et ses conditions', () => {
    // Retirer le prix n'est pas retirer l'information : « la carte EDAHABIA se
    // renouvelle au guichet » est un fait de procédure, pas un tarif.
    const view = publicView(postalService('AP-009'));
    assert.equal(view.service_name, 'Création ou renouvellement EDAHABIA');
    assert.ok(view.operation_channel);
    assert.ok(view.raw_conditions);
  });

  test('et elle ne laisse pas filtrer les notes internes', () => {
    const view = publicView(postalService('AP-009'));
    assert.equal(view.review_notes, undefined);
    assert.equal(view.verification_status, undefined);
  });

  test('chaque fiche du catalogue public porte sa provenance (P8-28)', () => {
    // Since 2026-10-28 the amounts are shown: what counts now is that none is
    // shown without saying where it comes from.
    const unsourced = publicCatalogue().filter((row) => row.tarifStatut !== 'source_client' || !row.tarifRaison);
    assert.deepEqual(unsourced.map((r) => r.service_id), []);
  });

  test('le catalogue se filtre par famille et par segment', () => {
    const cards = publicCatalogue({ family: 'cartes_monetique_locale' });
    assert.ok(cards.length > 0);
    assert.ok(cards.every((row) => row.service_family === 'cartes_monetique_locale'));
  });
});

describe('P4-17 — ce qui ne se calcule pas répond null, avec sa raison', () => {
  test('le coût annuel d’une fiche non calculable est null', () => {
    const answer = annualEquivalent(postalService('AP-052'));
    assert.equal(answer.resultat, null);
    assert.equal(answer.raison, 'calcul_non_autorise');
  });

  test('un prix à l’usage n’a pas d’équivalent annuel, même si on l’autorisait', () => {
    // 30 DA par retrait : le coût annuel dépend du nombre de retraits, que
    // nous n'inventons pas. Le classeur le dit lui aussi, ligne par ligne.
    const perWithdrawal = { ...postalService('AP-024'), auto_compute: true };
    const answer = annualEquivalent(perWithdrawal);
    assert.equal(answer.resultat, null);
    assert.equal(answer.raison, 'periodicite_inconnue');
  });

  test('un abonnement mensuel se calcule dès que la ligne l’autorise', () => {
    // La mécanique est juste : c'est la PREUVE qui manque, pas le calcul. Le
    // jour où le client fournit la grille, rien ne change ici.
    const monthly = { ...postalService('AP-052'), auto_compute: true };
    assert.equal(annualEquivalent(monthly).resultat, 9600);
  });

  test('un total qui contient une ligne bloquée est null, pas un total partiel', () => {
    const total = annualTotal(['AP-052', 'AP-063']);
    assert.equal(total.total, null);
    assert.equal(total.bloquees.length, 2);
  });

  test('les composantes d’un forfait ne sont jamais comptées avec leur parent', () => {
    // Le piège que le classeur signale : 800 DA HT et 300 + 300 + 200 sont la
    // MÊME dépense. Les additionner ferait payer le TPE deux fois.
    const total = annualTotal(['AP-052', 'AP-058', 'AP-059', 'AP-060']);
    assert.deepEqual(total.ignorees.map((row) => row.service_id).sort(), ['AP-058', 'AP-059', 'AP-060']);
    assert.deepEqual(total.lignes.map((row) => row.service_id), ['AP-052']);
  });

  test('une composante seule, sans son parent, reste comptée', () => {
    // La règle est « pas deux fois », pas « jamais ».
    const total = annualTotal(['AP-058']);
    assert.deepEqual(total.ignorees, []);
    assert.deepEqual(total.lignes.map((row) => row.service_id), ['AP-058']);
  });

  test('seules les lignes sans parent sont facturables par elles-mêmes', () => {
    const billable = postalBillableServices().map((row) => row.service_id);
    for (const component of ['AP-058', 'AP-059', 'AP-060']) assert.ok(!billable.includes(component), component);
    assert.ok(billable.includes('AP-052'));
  });

  test('le barème PIN PAD est transcrit mais ne calcule rien', () => {
    const scale = pinpadScale();
    assert.equal(scale.calculable, false);
    assert.equal(scale.tranches.length, POSTAL_PINPAD_SCALE.length);
    assert.match(scale.raison, /progressif marginal/);
  });

  test('les trois calculs bloqués nomment le contrôle qui les débloquera', () => {
    assert.equal(POSTAL_BLOCKED_CALCULATIONS.length, 3);
    const controls = new Set(POSTAL_CONTROLS.map((row) => row.code));
    for (const blocked of POSTAL_BLOCKED_CALCULATIONS) {
      assert.ok(controls.has(blocked.control), `${blocked.code} -> ${blocked.control}`);
    }
  });
});

describe('P4-17 — ce que le référentiel ne couvre pas', () => {
  test('les familles non documentées sont nommées, pas omises', () => {
    // Les omettre ferait croire qu'Algérie Poste ne propose ni crédit ni carte
    // internationale. Le classeur l'interdit : « non documenté ne signifie pas
    // impossible ou interdit ».
    assert.deepEqual(POSTAL_UNDOCUMENTED_FAMILIES.sort(), [
      'Cartes internationales',
      'Change / comptes en devises',
      'Crédits / financements',
      'Location de coffre-fort',
    ]);
  });

  test('une fiche citée sous une rubrique non documentée appartient à une AUTRE famille', () => {
    // Contrôle P16 : « ne jamais importer une offre à partir d'une absence de
    // données ». Une rubrique non documentée peut néanmoins citer une fiche —
    // et c'est alors un CONTRE-EXEMPLE, pas une offre : « Change / comptes en
    // devises » cite `AP-017` (Western Union reçu) uniquement pour prévenir
    // qu'un transfert reçu n'est pas une opération de change.
    //
    // Ce qui doit tenir n'est donc pas « aucune référence », mais « aucune
    // fiche ne se range dans cette famille ». La première version de ce test
    // affirmait la mauvaise chose et aurait fait supprimer une mise en garde
    // utile du classeur.
    const undocumented = POSTAL_COVERAGE.filter((row) => row.couverture === 'Non documenté');
    assert.ok(undocumented.length > 0);
    for (const row of undocumented) {
      const own = POSTAL_SERVICES.filter((service) => service.service_family === row.famille);
      assert.deepEqual(own.map((s) => s.service_id), [], row.famille);
      // Et toute fiche citée existe bel et bien : une référence morte ferait
      // passer une mise en garde pour une donnée manquante.
      for (const id of row.references) assert.ok(postalService(id), `${row.famille} cite ${id}`);
    }
  });

  test('le résumé compte ce qui est là et nomme ce qui manque', () => {
    const summary = referenceSummary();
    assert.equal(summary.fiches, 75);
    assert.equal(summary.publiables, 0);
    assert.equal(summary.calculables, 0);
    assert.equal(summary.controlesOuverts, 16);
    assert.equal(summary.parNature.TARIF, 46);
    assert.equal(summary.parNature.PLAFOND, 4);
    assert.equal(summary.parNature.DÉLAI, 7);
    assert.match(summary.avertissementNonDocumente, /ne veut pas dire inexistant/);
  });

  test('chaque contrôle dit ce qu’il attend et ce qu’il bloque', () => {
    assert.equal(POSTAL_CONTROLS.length, 16);
    const incomplete = POSTAL_CONTROLS.filter((row) => !row.preuve || !row.impact || !row.limite);
    assert.deepEqual(incomplete.map((r) => r.code), []);
  });

  test('chaque rubrique du comparateur porte sa précaution d’intégration', () => {
    const missing = POSTAL_COVERAGE.filter((row) => !row.precaution);
    assert.deepEqual(missing.map((r) => r.famille), []);
  });
});
