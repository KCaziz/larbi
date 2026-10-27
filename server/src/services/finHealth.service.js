import {
  DATA_QUALITY_MIX,
  HEALTH_BANDS,
  HEALTH_DIMENSIONS,
  HEALTH_SCALES,
  HEALTH_VERSION,
  INTERNAL_DSR_MARKERS,
  READINESS_BANDS,
  READINESS_BLOCKING,
  READINESS_CRITERIA,
  READINESS_DOWN_PAYMENT,
  READINESS_EFFORT_WITH_CAP,
  READINESS_INCOME_STABILITY,
  READINESS_INCOME_STABILITY_SOURCE,
  READINESS_SCALES,
  READINESS_VERSION,
  READINESS_WITHOUT_BANK_RULES,
  RESERVE_BANDS,
  bandOf,
  reserveTargetFor,
  scoreIn,
} from '../constants/finHealth.js';
import { computed } from './finance/contract.js';

/**
 * Indice de santé financière (F053), préparation au financement (F051) et
 * cibles de réserve (P6-09) — P6-22, chantiers 2 et 3.
 *
 * Fonctions PURES : elles reçoivent des mesures déjà calculées par les modules
 * qui les possèdent et rendent des réponses du moteur. Rien n'est lu en base
 * ici, et aucune mesure n'est recalculée — le taux d'effort vient de `P6-10`,
 * les mois de réserve de `P6-09`, le flux net de `P6-04`.
 *
 * LA RÈGLE QUI GOUVERNE TOUT : une dimension absente n'est pas zéro. Elle sort
 * du calcul, le score devient PARTIEL, et la réponse dit lesquelles manquaient.
 * C'est la condition que le client écrit lui-même pour F053 (« score partiel si
 * besoin »), et c'est aussi la seule lecture honnête : quelqu'un qui n'a pas
 * encore déclaré ses dettes n'a pas une pression de dette nulle, on ne la
 * connaît pas.
 */

// Les poids du client sont en points (25, 20, 15…). `weightedIndex` les
// accepte tels quels puisqu'il divise par la somme des poids RETENUS — ce qui
// est exactement ce qu'il faut pour un score partiel.
const dimensionScore = (key, value) => scoreIn(HEALTH_SCALES[key], value);

/**
 * « Respect des budgets » (P8-16) — real spending over the active budgets,
 * brought to 100 (question C5, default retained until the client answers):
 * 100 while within the budgets, then a proportional decrease, reaching 0 at
 * 200 % of the allocation. No budget: not measured, never 0.
 */
export function budgetsScore(consumption) {
  if (consumption === null || consumption === undefined || !Number.isFinite(consumption)) return null;
  if (consumption <= 1) return 100;
  return Math.max(0, Math.round(100 * (2 - consumption)));
}

/**
 * La qualité des données : 60 % complétude + 40 % fraîcheur, chacune 0-100.
 * Si l'une des deux manque, l'autre ne suffit pas à la représenter : la
 * dimension entière devient absente plutôt que mesurée à moitié.
 */
export function dataQualityScore({ completeness = null, freshness = null } = {}) {
  if (completeness === null || freshness === null) return null;
  return completeness * DATA_QUALITY_MIX.completeness + freshness * DATA_QUALITY_MIX.freshness;
}

/**
 * L'indice de santé financière, barème B.
 *
 * `measures` porte les mesures brutes, chacune pouvant être `null` :
 *   balance          flux net / revenu (décimal)
 *   reserveMonths    mois de réserve
 *   debtRatio        taux d'effort total (décimal)
 *   savingsRate      taux d'épargne nette (décimal)
 *   goalsGap         écart au plan (décimal, 0 = dans la trajectoire)
 *   incomeMonths     mois d'historique de revenu régulier
 *   dataQuality      { completeness, freshness } sur 0-100
 */
export function financialHealth(measures = {}, { now = new Date() } = {}) {
  const scores = {
    balance: dimensionScore('balance', measures.balance ?? null),
    reserve: dimensionScore('reserve', measures.reserveMonths ?? null),
    debt: dimensionScore('debt', measures.debtRatio ?? null),
    savings: dimensionScore('savings', measures.savingsRate ?? null),
    goals: dimensionScore('goals', measures.goalsGap ?? null),
    budgets: budgetsScore(measures.budgetConsumption ?? null),
    dataQuality: dataQualityScore(measures.dataQuality ?? {}),
  };

  const components = HEALTH_DIMENSIONS.map((dimension) => ({
    key: dimension.key,
    label: dimension.label,
    weight: dimension.weight,
    score: scores[dimension.key],
  }));

  const present = components.filter((row) => row.score !== null);
  const missing = components.filter((row) => row.score === null);

  // Aucune dimension mesurable : le score n'est pas 0, il n'existe pas.
  const value = present.length === 0 ? null : weighted(present);

  const inputs = {
    version: HEALTH_VERSION,
    dimensions_retenues: present.map((row) => row.key),
    dimensions_absentes: missing.map((row) => row.key),
    poids_retenu: present.reduce((total, row) => total + row.weight, 0),
  };

  // Un score partiel est annoncé comme tel. Sans cela, 100 sur la seule
  // dimension mesurée se lirait comme 100 sur sept.
  const warnings = [];
  if (present.length > 0 && missing.length > 0) {
    warnings.push(
      `Score partiel : ${present.length} dimension(s) sur ${HEALTH_DIMENSIONS.length}. Manquent : ${missing.map((row) => row.label).join(', ')}.`,
    );
  }

  return {
    answer: computed('F053', value, { inputs, warnings, now }),
    version: HEALTH_VERSION,
    bande: bandOf(HEALTH_BANDS, value),
    dimensions: components,
    partiel: missing.length > 0,
  };
}

const weighted = (rows) => {
  const total = rows.reduce((sum, row) => sum + row.weight, 0);
  if (total === 0) return null;
  return Math.round(rows.reduce((sum, row) => sum + row.score * row.weight, 0) / total);
};

/**
 * L'indice de préparation au financement, version A.
 *
 * Deux choses le distinguent d'un score ordinaire, et toutes deux viennent du
 * client :
 *
 * 1. **Un dépassement du plafond de la banque BLOQUE** au lieu de faire
 *    baisser la moyenne. Un 0 noyé dans six critères pondérés laisserait un
 *    dossier « presque prêt » alors que la banque le refuse.
 * 2. **Sans les règles de la banque, on ne conclut pas.** Faute de plafond
 *    publié, le taux d'effort est présenté comme un « repère d'abordabilité,
 *    pas critère banque » — les mots du client — et l'apport ne reçoit aucun
 *    score du tout.
 */
export function fundingReadiness(input = {}, { now = new Date() } = {}) {
  const blocking = [];
  const notes = [];

  // ---- effort -------------------------------------------------------------
  let effort = null;
  if (input.dsrAfter !== null && input.dsrAfter !== undefined && input.bankDsrCap) {
    const share = input.dsrAfter / input.bankDsrCap;
    effort = scoreIn(READINESS_EFFORT_WITH_CAP, share);
    if (share > 1) blocking.push(READINESS_BLOCKING.effortAboveCap);
  } else if (input.dsrAfter !== null && input.dsrAfter !== undefined) {
    // Le repère interne existe, mais il ne vaut pas critère bancaire et ne
    // produit donc aucun score : il est seulement montré.
    notes.push(READINESS_WITHOUT_BANK_RULES.effort);
  }

  // ---- apport -------------------------------------------------------------
  let downPayment = null;
  if (input.downPaymentRate !== null && input.downPaymentRate !== undefined && input.bankMinimumRate !== null && input.bankMinimumRate !== undefined) {
    const points = (input.downPaymentRate - input.bankMinimumRate) * 100;
    if (points < 0) {
      downPayment = 0;
      blocking.push(READINESS_BLOCKING.downPaymentBelowMinimum);
    } else {
      downPayment = READINESS_DOWN_PAYMENT.find((row) => points >= row.aboveMinimumPoints)?.score ?? 80;
    }
  } else if (input.downPaymentRate !== null && input.downPaymentRate !== undefined) {
    notes.push(READINESS_WITHOUT_BANK_RULES.downPayment);
  }

  const scores = {
    effort,
    budgetCapacity: scoreIn(READINESS_SCALES.budgetCapacity, input.surplusRate ?? null),
    incomeStability: READINESS_INCOME_STABILITY[input.incomeSituation]?.score ?? null,
    downPayment,
    reserve: scoreIn(READINESS_SCALES.reserve, input.reserveMonths ?? null),
    fileCompleteness: input.fileCompleteness ?? null,
  };

  const components = READINESS_CRITERIA.map((criterion) => ({
    key: criterion.key,
    label: criterion.label,
    weight: criterion.weight,
    score: scores[criterion.key],
  }));
  const present = components.filter((row) => row.score !== null);
  const missing = components.filter((row) => row.score === null);
  const value = present.length === 0 ? null : weighted(present);

  const warnings = [...notes];
  if (present.length > 0 && missing.length > 0) {
    warnings.push(`Score partiel : ${present.length} critère(s) sur ${READINESS_CRITERIA.length}.`);
  }
  if (scores.incomeStability !== null) warnings.push(`Stabilité du revenu : ${READINESS_INCOME_STABILITY_SOURCE}.`);

  return {
    answer: computed('F051', blocking.length > 0 ? null : value, {
      inputs: {
        version: READINESS_VERSION,
        criteres_retenus: present.map((row) => row.key),
        criteres_absents: missing.map((row) => row.key),
      },
      warnings,
      now,
    }),
    version: READINESS_VERSION,
    // La bande n'est calculée que si rien ne bloque : « presque prêt » sur un
    // dossier que la banque refuse serait le pire des messages.
    bande: blocking.length > 0 ? null : bandOf(READINESS_BANDS, value),
    bloquants: blocking,
    criteres: components,
    partiel: missing.length > 0,
    reperesInternes: input.bankDsrCap ? null : INTERNAL_DSR_MARKERS,
  };
}

/**
 * La cible de réserve d'un public, et où la personne en est.
 *
 * Le lycéen n'est jamais alerté : le client écrit « objectif éducatif, sans
 * alerte adulte ». Lui annoncer une « situation critique » parce qu'il a
 * moins d'un mois de dépenses de côté, ce serait appliquer une grille d'adulte
 * à un exercice pédagogique.
 */
export function reserveTarget(publicCode, reserveMonths = null) {
  const target = reserveTargetFor(publicCode);
  if (!target) return null;

  const band = target.alert ? bandOf(RESERVE_BANDS, reserveMonths) : null;
  return {
    publicCode,
    cibleMois: target.months,
    premierJalon: target.firstMilestone ?? null,
    plage: target.range ?? null,
    variante: target.variant ?? null,
    reservePartagee: target.shared ?? null,
    note: target.note ?? null,
    alerte: target.alert,
    bande: band,
    // `null` quand la cible n'existe pas pour ce public, et c'est différent de
    // « cible atteinte » : EPG n'a aucune cible dans le référentiel du client.
    atteinte: target.months === null || reserveMonths === null ? null : reserveMonths >= target.months,
  };
}
