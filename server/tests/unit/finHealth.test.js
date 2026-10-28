import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  HEALTH_DIMENSIONS,
  READINESS_CRITERIA,
  REFERENTIAL_DIVERGENCES,
  RESERVE_TARGETS,
  scoreIn,
  HEALTH_SCALES,
} from '../../src/constants/finHealth.js';
import { FIN_PUBLIC_CODES } from '../../src/constants/finPublics.js';
import { dataQualityScore, financialHealth, fundingReadiness, reserveTarget } from '../../src/services/finHealth.service.js';

// Barèmes du référentiel maître (P6-22, chantiers 2 et 3).
//
// Ces tests gardent deux choses : que les seuils sont CEUX DU CLIENT, au
// chiffre près, et qu'une mesure absente ne devient jamais un zéro.

describe('P6-22 — les pondérations sont celles du client', () => {
  test('le barème B pèse 100 points sur 7 dimensions', () => {
    assert.equal(HEALTH_DIMENSIONS.length, 7);
    assert.equal(HEALTH_DIMENSIONS.reduce((total, row) => total + row.weight, 0), 100);
    assert.deepEqual(
      HEALTH_DIMENSIONS.map((row) => [row.key, row.weight]),
      [['balance', 25], ['reserve', 20], ['debt', 20], ['savings', 15], ['goals', 10], ['budgets', 5], ['dataQuality', 5]],
    );
  });

  test('la version A de la préparation pèse 100 points sur 6 critères', () => {
    assert.equal(READINESS_CRITERIA.length, 6);
    assert.equal(READINESS_CRITERIA.reduce((total, row) => total + row.weight, 0), 100);
    assert.equal(READINESS_CRITERIA.find((row) => row.key === 'effort').weight, 30);
  });

  test('les bornes des grilles sont celles du document, au chiffre près', () => {
    // Quelques points de contrôle choisis sur les BORNES, là où une erreur de
    // transcription se voit : juste en dessous et juste au-dessus.
    assert.equal(scoreIn(HEALTH_SCALES.balance, 0.1), 100);
    assert.equal(scoreIn(HEALTH_SCALES.balance, 0.0999), 85);
    assert.equal(scoreIn(HEALTH_SCALES.balance, -0.05), 30);
    assert.equal(scoreIn(HEALTH_SCALES.balance, -0.0501), 0);

    assert.equal(scoreIn(HEALTH_SCALES.reserve, 6), 100);
    assert.equal(scoreIn(HEALTH_SCALES.reserve, 5.99), 85);
    assert.equal(scoreIn(HEALTH_SCALES.reserve, 0), 0);

    // La dette est le seul barème où le client borne par le HAUT (0-20 %
    // maîtrisé) : 20 % exactement est encore « maîtrisé », pas « à surveiller ».
    assert.equal(scoreIn(HEALTH_SCALES.debt, 0.2), 100);
    assert.equal(scoreIn(HEALTH_SCALES.debt, 0.3), 80);
    assert.equal(scoreIn(HEALTH_SCALES.debt, 0.51), 0);
  });

  test('les divergences du document sont déclarées, pas tranchées en silence', () => {
    // Le client écrit lui-même « aucune ne doit remplacer l'autre
    // silencieusement ». Un barème choisi par le prestataire parce qu'il
    // fallait bien en choisir un doit se voir.
    assert.ok(REFERENTIAL_DIVERGENCES.length >= 3);
    for (const row of REFERENTIAL_DIVERGENCES) {
      assert.ok(row.chosen && row.alternative && row.why, row.key);
    }
  });
});

describe('P6-22 — une dimension absente n’est jamais un zéro', () => {
  const complete = {
    balance: 0.12,
    reserveMonths: 4,
    debtRatio: 0.25,
    savingsRate: 0.12,
    goalsGap: 0,
    budgetLines: [{ allocated: 1000000, spent: 900000 }],
    dataQuality: { completeness: 80, freshness: 60 },
  };

  test('un dossier complet donne un score et sa bande', () => {
    const result = financialHealth(complete);
    assert.equal(result.answer.resultat, 89);
    assert.equal(result.bande, 'Solide');
    assert.equal(result.partiel, false);
  });

  test('sans aucune mesure, le score est « non calculé », pas 0', () => {
    // La règle du projet. Un 0 se lirait « votre santé financière est au plus
    // bas » alors que la vraie réponse est « nous ne savons pas encore ».
    const result = financialHealth({});
    assert.equal(result.answer.resultat, null);
    assert.equal(result.bande, null);
  });

  test('une dimension manquante sort du calcul et le score le dit', () => {
    const { debtRatio, ...withoutDebt } = complete;
    const result = financialHealth(withoutDebt);
    assert.ok(result.answer.resultat !== null);
    assert.equal(result.partiel, true);
    assert.match(result.answer.avertissements.join(' '), /Score partiel : 6 dimension/);
    assert.match(result.answer.avertissements.join(' '), /Pression de dette/);
  });

  test('et le poids manquant ne pénalise pas : il est retiré du dénominateur', () => {
    // Si la dimension absente était comptée 0, retirer une dimension ferait
    // toujours BAISSER le score. Ici, retirer une dimension faible le fait
    // monter, ce qui prouve que le dénominateur a suivi.
    const withWeakDebt = financialHealth({ ...complete, debtRatio: 0.6 }).answer.resultat;
    const { debtRatio, ...withoutDebt } = complete;
    const withoutIt = financialHealth(withoutDebt).answer.resultat;
    assert.ok(withoutIt > withWeakDebt, `${withoutIt} devrait dépasser ${withWeakDebt}`);
  });

  test('la qualité des données exige ses deux moitiés', () => {
    // 60 % complétude + 40 % fraîcheur : avec une seule des deux, la dimension
    // n'est pas mesurée à moitié, elle est absente.
    assert.equal(dataQualityScore({ completeness: 100 }), null);
    assert.equal(dataQualityScore({ freshness: 100 }), null);
    assert.equal(dataQualityScore({ completeness: 100, freshness: 50 }), 80);
  });

  test('chaque réponse porte le contrat du moteur', () => {
    const result = financialHealth(complete);
    assert.equal(result.answer.formule_id, 'F053');
    assert.ok(result.answer.calcule_le);
    assert.deepEqual(result.answer.entrees_snapshot.dimensions_absentes, []);
    assert.equal(result.answer.entrees_snapshot.poids_retenu, 100);
  });
});

describe('P6-22 — la préparation au financement bloque au lieu de noter bas', () => {
  const base = {
    dsrAfter: 0.25,
    bankDsrCap: 0.5,
    surplusRate: 0.25,
    incomeSituation: 'cdi_verified_12m',
    downPaymentRate: 0.3,
    bankMinimumRate: 0.2,
    reserveMonths: 4,
    fileCompleteness: 90,
  };

  test('un dossier solide reçoit son score et sa bande', () => {
    const result = fundingReadiness(base);
    assert.ok(result.answer.resultat >= 80);
    assert.equal(result.bande, 'Dossier prêt à présenter');
    assert.deepEqual(result.bloquants, []);
  });

  test('au-delà du plafond de la banque, le score n’existe plus', () => {
    // Un 0 noyé dans six critères pondérés laisserait un dossier « presque
    // prêt » alors que la banque le refuse. Le client demande un blocage.
    const result = fundingReadiness({ ...base, dsrAfter: 0.55 });
    assert.equal(result.answer.resultat, null);
    assert.equal(result.bande, null);
    assert.equal(result.bloquants.length, 1);
    assert.match(result.bloquants[0], /plafond publié par la banque/);
  });

  test('un apport sous le minimum de la banque bloque aussi', () => {
    const result = fundingReadiness({ ...base, downPaymentRate: 0.1 });
    assert.equal(result.answer.resultat, null);
    assert.match(result.bloquants[0], /apport est inférieur au minimum/);
  });

  test('sans plafond publié, l’effort ne reçoit aucun score et le dit', () => {
    // « Repère d'abordabilité, pas critère banque » — les mots du client.
    const result = fundingReadiness({ ...base, bankDsrCap: null });
    assert.equal(result.criteres.find((row) => row.key === 'effort').score, null);
    assert.match(result.answer.avertissements.join(' '), /pas critère banque/);
    assert.deepEqual(result.reperesInternes, [0.2, 0.3, 0.4, 0.5]);
  });

  test('sans minimum d’apport publié, aucune conclusion d’éligibilité', () => {
    const result = fundingReadiness({ ...base, bankMinimumRate: null });
    assert.equal(result.criteres.find((row) => row.key === 'downPayment').score, null);
    assert.match(result.answer.avertissements.join(' '), /aucune conclusion d’éligibilité/i);
  });

  test('la stabilité du revenu est annoncée comme une heuristique', () => {
    // Elle n'est pas réglementaire, et le client le signale. Le taire la
    // ferait passer pour un critère bancaire.
    const result = fundingReadiness(base);
    assert.match(result.answer.avertissements.join(' '), /heuristique FINCLUDIA/);
  });

  test('une situation de revenu inconnue laisse le critère absent', () => {
    const result = fundingReadiness({ ...base, incomeSituation: 'inventee' });
    assert.equal(result.criteres.find((row) => row.key === 'incomeStability').score, null);
  });
});

describe('P6-22 — les cibles de réserve, grille A', () => {
  test('chaque public du client a une entrée, même sans cible', () => {
    // EPG n'apparaît dans aucune des deux grilles : son entrée existe avec une
    // cible nulle et la raison, plutôt que d'être absente — une absence se
    // lirait comme un oubli.
    for (const code of FIN_PUBLIC_CODES) assert.ok(RESERVE_TARGETS[code], code);
    assert.equal(RESERVE_TARGETS.EPG.months, null);
    assert.match(RESERVE_TARGETS.EPG.note, /Aucune cible par profil/);
  });

  test('un lycéen n’est jamais alerté sur sa réserve', () => {
    // « Objectif éducatif, sans alerte adulte » : annoncer une situation
    // critique à un lycéen parce qu'il a moins d'un mois de côté, ce serait
    // appliquer une grille d'adulte à un exercice pédagogique.
    const result = reserveTarget('LYC', 0.1);
    assert.equal(result.alerte, false);
    assert.equal(result.bande, null);
    assert.equal(result.cibleMois, 0.5);
  });

  test('un salarié reçoit sa bande de lecture commune', () => {
    assert.equal(reserveTarget('SAL', 0.5).bande, 'critique');
    assert.equal(reserveTarget('SAL', 1.5).bande, 'fragile');
    assert.equal(reserveTarget('SAL', 4).bande, 'adéquat');
    assert.equal(reserveTarget('SAL', 7).bande, 'robuste');
  });

  test('la variante d’un foyer à un seul revenu est montrée, pas choisie', () => {
    // Le public seul ne dit pas combien de revenus entrent dans le foyer. La
    // cible retenue est celle que le client associe au public, et la variante
    // prudente est affichée avec sa condition.
    const family = reserveTarget('FAM', 2);
    assert.equal(family.cibleMois, 4);
    assert.equal(family.variante.months, 6);
    assert.match(family.variante.when, /un seul revenu/);
  });

  test('un colocataire a deux réserves, pas une', () => {
    const flatmate = reserveTarget('COL', 2);
    assert.equal(flatmate.cibleMois, 3);
    assert.equal(flatmate.reservePartagee.months, 1);
  });

  test('sans mesure, l’atteinte de la cible est inconnue, pas « non atteinte »', () => {
    assert.equal(reserveTarget('SAL', null).atteinte, null);
    assert.equal(reserveTarget('EPG', 10).atteinte, null);
  });

  test('un public inconnu ne reçoit pas de cible inventée', () => {
    assert.equal(reserveTarget('XXX', 3), null);
  });
});

describe('P8-16 — « respect des budgets »', () => {
  test('100 within the budgets, then down to 0 at 200 %, not measured without a budget', async () => {
    const { budgetsScore } = await import('../../src/services/finHealth.service.js');
    assert.equal(budgetsScore(0.7), 100);
    assert.equal(budgetsScore(1), 100);
    assert.equal(budgetsScore(1.5), 50);
    assert.equal(budgetsScore(2.5), 0);
    assert.equal(budgetsScore(null), null);
  });

  test('the client’s examples (answer C5): 110 % → 90, 125 % → 75, 180 % → 20, 200 % → 0', async () => {
    const { budgetsScore } = await import('../../src/services/finHealth.service.js');
    assert.deepEqual([0.9, 1, 1.1, 1.25, 1.5, 1.8, 2, 3].map(budgetsScore), [100, 100, 90, 75, 50, 20, 0, 0]);
  });

  test('several budgets: averaged by their allocation, not one budget one vote', async () => {
    const { weightedBudgetsScore } = await import('../../src/services/finHealth.service.js');
    // A 60 000 DA rent kept (100) and a 2 000 DA treat at 200 % (0):
    // (100 × 60 000 + 0 × 2 000) / 62 000 = 96.8 → 97, not the plain mean of 50.
    assert.equal(weightedBudgetsScore([{ allocated: 6000000, spent: 5500000 }, { allocated: 200000, spent: 400000 }]), 97);
    assert.equal(weightedBudgetsScore([]), null, 'no budget: not measured');
    assert.equal(weightedBudgetsScore(null), null);
  });

  test('without any budget the dimension is left out and its weight goes to the others', async () => {
    const { financialHealth } = await import('../../src/services/finHealth.service.js');
    const result = financialHealth({ balance: 0.12, reserveMonths: 4, debtRatio: 0.25, savingsRate: 0.12 });
    const budgets = result.dimensions.find((dimension) => dimension.key === 'budgets');
    assert.equal(budgets.score, null);
    assert.equal(result.partiel, true);
  });
});
