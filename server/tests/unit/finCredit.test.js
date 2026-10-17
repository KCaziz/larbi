import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONSUMER_DSR_HARD_MAX, CREDIT_MESSAGES, CREDIT_RULES } from '../../src/constants/finCredit.js';
import { CREDIT_OFFERS, creditOffer, publishableOffers } from '../../src/constants/finCreditOffers.js';
import {
  capitalFor,
  checkAgainstOffer,
  compareFinancing,
  debtServiceRatio,
  instalment,
  instalmentCap,
  simulate,
} from '../../src/services/finCredit.service.js';

// Simulateur de crédit (P4-02) et comparaison de financements (P4-15).
//
// La ligne que ces tests défendent : on simule volontiers sur les chiffres que
// la personne saisit, et on n'affirme JAMAIS ce qu'une banque fera.

describe('P4-02 — les mathématiques, qui ne dépendent d’aucune banque', () => {
  test('la mensualité suit la formule du client (CR02)', () => {
    // 1 000 000 DA sur 36 mois à 8 % : vérifié à la main sur la formule
    // M = P×i / (1−(1+i)^−n), i = 0,08/12.
    const payment = instalment(100000000, 0.08, 36);
    assert.ok(Math.abs(payment - 3133637) <= 1, payment);
  });

  test('un financement sans intérêt n’est pas une division par zéro', () => {
    // Ce n'est pas une curiosité : un prêt à taux zéro existe, et certaines
    // formules islamiques n'affichent aucune marge. La formule générale y
    // diviserait par zéro.
    assert.equal(instalment(120000000, 0, 24), 5000000);
  });

  test('une entrée absurde ne produit pas un chiffre', () => {
    assert.equal(instalment(100000, 0.08, 0), null);
    assert.equal(instalment(100000, -0.01, 12), null);
    assert.equal(instalment(null, 0.08, 12), null);
  });

  test('le capital et la mensualité sont réciproques', () => {
    // La meilleure vérification d'une paire de formules : faire l'aller-retour.
    const payment = instalment(100000000, 0.06, 60);
    const back = capitalFor(payment, 0.06, 60);
    assert.ok(Math.abs(back - 100000000) < 100, `${back} ≠ 100000000`);
  });

  test('le taux d’effort est nul sans revenu, pas zéro', () => {
    // Un taux d'effort de 0 % se lirait « vous n'avez aucune dette ». La vraie
    // réponse est « nous ne connaissons pas votre revenu ».
    assert.equal(debtServiceRatio(500000, 0), null);
    assert.equal(debtServiceRatio(500000, null), null);
    assert.equal(debtServiceRatio(0, 10000000), 0);
  });
});

describe('P4-02 — le plafond légal, et ce qu’il ne couvre pas', () => {
  test('le crédit à la consommation est plafonné à 30 % par la loi', () => {
    const cap = instalmentCap({ income: 10000000, existingInstalments: 0, kind: 'Consommation' });
    assert.equal(cap.ratio, CONSUMER_DSR_HARD_MAX);
    assert.equal(cap.cap, 3000000);
    assert.match(cap.source, /15-114/);
  });

  test('et les mensualités existantes s’en déduisent', () => {
    const cap = instalmentCap({ income: 10000000, existingInstalments: 1000000, kind: 'Consommation' });
    assert.equal(cap.cap, 2000000);
  });

  test('le plafond n’est JAMAIS généralisé à l’immobilier', () => {
    // Le client l'écrit en tête de son onglet. L'appliquer à un crédit
    // immobilier refuserait des dossiers que la loi n'interdit pas — et
    // plusieurs offres immobilières du référentiel annoncent 40 % ou 50 %.
    const cap = instalmentCap({ income: 10000000, kind: 'Immobilier' });
    assert.equal(cap.cap, null);
    assert.equal(cap.ratio, null);
    assert.equal(cap.reason, 'ratio_non_publie');
    assert.equal(cap.message, CREDIT_MESSAGES.missingCriterion);
  });

  test('un ratio publié par la banque l’emporte sur le repère interne', () => {
    const cap = instalmentCap({ income: 10000000, bankRatio: 0.45, kind: 'Immobilier' });
    assert.equal(cap.ratio, 0.45);
    assert.equal(cap.source, 'banque');
  });

  test('sans plafond calculable, les repères internes sont offerts comme tels', () => {
    const cap = instalmentCap({ income: 10000000, kind: 'Immobilier' });
    assert.deepEqual(cap.markers, [0.2, 0.3, 0.4, 0.5]);
  });

  test('un dépassement du plafond légal BLOQUE la simulation', () => {
    const result = simulate({ principal: 100000000, annualRate: 0.08, months: 36, income: 12000000, existingInstalments: 1000000, kind: 'Consommation' });
    assert.equal(result.bloquants.length, 1);
    assert.match(result.bloquants[0], /15-114/);
    assert.match(result.bloquants[0], /30 %/);
  });

  test('et le même dossier en immobilier ne bloque pas', () => {
    // Même taux d'effort, autre nature de crédit : la loi ne dit rien.
    const result = simulate({ principal: 100000000, annualRate: 0.08, months: 36, income: 12000000, existingInstalments: 1000000, kind: 'Immobilier' });
    assert.deepEqual(result.bloquants, []);
  });
});

describe('P4-02 — ce que la simulation affirme, et ce qu’elle refuse d’affirmer', () => {
  const base = { principal: 100000000, annualRate: 0.06, months: 60, income: 20000000, existingInstalments: 0, fees: 500000, insurance: 200000 };

  test('chaque simulation porte la phrase imposée par le client', () => {
    // Reprise mot pour mot : c'est une phrase juridique autant que
    // commerciale, et la reformuler changerait ce que le produit affirme.
    const result = simulate(base);
    assert.ok(result.avertissements.includes('Ce calcul est une simulation mathématique et ne constitue pas une offre de crédit.'));
    assert.ok(result.mensualite.avertissements.includes(CREDIT_MESSAGES.simulation));
  });

  test('le coût total exige toutes ses composantes', () => {
    // Un coût total amputé des frais se lit comme un coût total.
    assert.ok(simulate(base).coutTotal.resultat > 0);
    assert.equal(simulate({ ...base, fees: null }).coutTotal.resultat, null);
  });

  test('chaque chiffre cite la formule du client dont il sort', () => {
    const result = simulate(base);
    assert.match(result.mensualite.entrees_snapshot.formule, /M = P×i/);
    assert.match(result.coutTotal.entrees_snapshot.formule, /frais/);
  });

  test('les règles-cadres rappellent que la banque décide', () => {
    const decision = CREDIT_RULES.find((row) => row.key === 'final_decision');
    assert.match(decision.rule, /reste décisionnaire/);
    assert.match(decision.rule, /jamais une décision/);
  });
});

describe('P4-15 — les offres : aucune publiable, et chacune dit pourquoi', () => {
  test('les 25 fiches du client sont là', () => {
    assert.equal(CREDIT_OFFERS.length, 25);
  });

  test('aucune n’est publiable, conformément au classeur', () => {
    // « Publication désactivée avant contrôle des brochures/pages
    // officielles » : les mots du client, en tête de son onglet.
    assert.deepEqual(publishableOffers(), []);
  });

  test('un statut VIDE ne vaut pas autorisation', () => {
    // Le défaut qu'a eu la première version du script : `ODT-CR-015` n'a pas
    // de statut proposé, et sortait « publiable ». Son statut déclaré dit
    // pourtant « conflit officiel – bloquer production ». Une absence lue
    // comme une permission est exactement ce que le client interdit ailleurs.
    const offer = creditOffer('ODT-CR-015');
    assert.equal(offer.proposedStatus, null);
    assert.equal(offer.publishable, false);
    assert.match(offer.blockedReason, /bloquer production/);
  });

  test('chaque offre non publiable porte sa raison', () => {
    const silent = CREDIT_OFFERS.filter((row) => !row.publishable && !row.blockedReason);
    assert.deepEqual(silent.map((row) => row.ref), []);
  });

  test('les critères sortent en texte, jamais convertis en seuils', () => {
    // « 8,00 % épargnant / 8,25 % non-épargnant » : choisir lequel retenir
    // serait une décision commerciale déguisée en conversion.
    const checked = checkAgainstOffer('ODT-CR-001');
    assert.equal(typeof checked.criteres.taux, 'string');
    assert.match(checked.criteres.taux, /épargnant/);
    assert.equal(checked.publiable, false);
  });

  test('une référence inconnue ne renvoie rien d’inventé', () => {
    assert.equal(checkAgainstOffer('ODT-CR-999'), null);
  });
});

describe('P4-15 — conventionnel et islamique ne sont jamais dans la même colonne', () => {
  test('les deux familles sont rendues séparément', () => {
    const comparison = compareFinancing();
    assert.equal(comparison.islamique.length, 4);
    assert.equal(comparison.conventionnel.length, 21);
    assert.equal(comparison.islamique.length + comparison.conventionnel.length, CREDIT_OFFERS.length);
  });

  test('et la raison est dite, pas sous-entendue', () => {
    // Même règle que le comparateur bancaire de P4-06 : une marge bénéficiaire
    // et un taux d'intérêt ne s'assimilent pas.
    assert.match(compareFinancing().regle, /marge bénéficiaire/);
    assert.match(compareFinancing().regle, /séparément/);
  });

  test('aucune offre islamique ne se retrouve côté conventionnel', () => {
    const comparison = compareFinancing();
    assert.ok(comparison.islamique.every((row) => row.offre.islamique));
    assert.ok(comparison.conventionnel.every((row) => !row.offre.islamique));
  });

  test('la comparaison annonce combien d’offres sont réellement publiables', () => {
    const comparison = compareFinancing();
    assert.equal(comparison.publiables, 0);
    assert.equal(comparison.total, 25);
    assert.match(comparison.avertissement, /ne constitue pas une offre de crédit/);
  });
});
