import {
  DATA_QUALITY_MIX,
  GOAL_PRIORITY_WEIGHTS,
  GOAL_SCORE_MIX,
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
  goalPriorityLevel,
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
 * « Respect des budgets » for ONE budget — the client's answer C5
 * (2026-10-28): r = real spending / allocation; 100 if r ≤ 1, 100 × (2 − r)
 * between 1 and 2, 0 from 2 (110 % → 90, 150 % → 50, 200 % → 0).
 */
export function budgetsScore(consumption) {
  if (consumption === null || consumption === undefined || !Number.isFinite(consumption)) return null;
  if (consumption <= 1) return 100;
  return Math.max(0, Math.round(100 * (2 - consumption)));
}

/**
 * The dimension over several budgets: each one's score, averaged WEIGHTED BY
 * ITS ALLOCATION, so that a 2 000 DA budget does not weigh as much as a
 * 60 000 DA rent (answer C5). `lines` = [{ allocated, spent }]. No budget
 * with an allocation: not measured — its weight goes to the other dimensions,
 * it is never 0 nor 100.
 */
export function weightedBudgetsScore(lines) {
  const usable = (lines ?? []).filter((line) => Number.isFinite(line.allocated) && line.allocated > 0 && Number.isFinite(line.spent));
  if (usable.length === 0) return null;
  const totalAllocated = usable.reduce((sum, line) => sum + line.allocated, 0);
  const weighted = usable.reduce((sum, line) => sum + budgetsScore(line.spent / line.allocated) * line.allocated, 0);
  return Math.round(weighted / totalAllocated);
}

/**
 * La qualité des données (client, 2026-11-02) : 40 % complétude + 30 % fraîcheur
 * + 30 % pointage, chacune 0-100. Une composante non applicable (null) est
 * retirée et les autres sont renormalisées ; aucune composante : non calculée,
 * jamais 0.
 */
export function dataQualityScore({ completeness = null, freshness = null, clearing = null } = {}) {
  const parts = [
    [completeness, DATA_QUALITY_MIX.completeness],
    [freshness, DATA_QUALITY_MIX.freshness],
    [clearing, DATA_QUALITY_MIX.clearing],
  ].filter(([value]) => Number.isFinite(value));
  if (parts.length === 0) return null;
  const total = parts.reduce((sum, [, weight]) => sum + weight, 0);
  return Math.round(parts.reduce((sum, [value, weight]) => sum + value * weight, 0) / total);
}

/**
 * Fraîcheur d'une donnée : 100 dans le seuil, 50 entre une et deux fois le
 * seuil, 0 au-delà (client, 2026-11-02). `ageDays` null = donnée absente : non
 * mesurée, pas 0.
 */
export function freshnessOf(ageDays, thresholdDays) {
  if (!Number.isFinite(ageDays) || !Number.isFinite(thresholdDays)) return null;
  if (ageDays <= thresholdDays) return 100;
  return ageDays <= 2 * thresholdDays ? 50 : 0;
}

/**
 * Trajectoire d'un objectif = min(100 ; capital réellement affecté / capital
 * prévu à date × 100). Rien de prévu encore (objectif tout juste créé) : 100.
 */
export function goalTrajectory(allocated, plannedToDate) {
  if (!Number.isFinite(allocated) || !Number.isFinite(plannedToDate)) return null;
  if (plannedToDate <= 0) return 100;
  return Math.min(100, (Math.max(0, allocated) / plannedToDate) * 100);
}

/**
 * Score d'un objectif = 70 % trajectoire + 30 % régularité. Sans rythme de
 * contribution (régularité null), la trajectoire compte seule.
 */
export function goalScore({ trajectory, regularity = null }) {
  if (!Number.isFinite(trajectory)) return null;
  if (!Number.isFinite(regularity)) return Math.round(trajectory);
  return Math.round(trajectory * GOAL_SCORE_MIX.trajectory + regularity * GOAL_SCORE_MIX.regularity);
}

/**
 * La dimension « Objectifs » : la moyenne des scores des objectifs actifs,
 * pondérée par la priorité (haute 3, normale 2, basse 1). `lines` =
 * [{ trajectory, regularity, priority }]. Aucun objectif noté : non calculée,
 * jamais 0, et son poids est redistribué.
 */
export function goalsScore(lines) {
  const scored = (lines ?? [])
    .map((line) => ({ score: goalScore(line), weight: GOAL_PRIORITY_WEIGHTS[goalPriorityLevel(line.priority)] }))
    .filter((row) => row.score !== null);
  if (scored.length === 0) return null;
  const total = scored.reduce((sum, row) => sum + row.weight, 0);
  return Math.round(scored.reduce((sum, row) => sum + row.score * row.weight, 0) / total);
}

/**
 * L'indice de santé financière, barème B.
 *
 * `measures` porte les mesures brutes, chacune pouvant être `null` :
 *   balance          flux net / revenu (décimal)
 *   reserveMonths    mois de réserve
 *   debtRatio        taux d'effort total (décimal)
 *   savingsRate      taux d'épargne nette (décimal)
 *   goalLines        [{ trajectory, regularity, priority }] par objectif actif
 *   incomeMonths     mois d'historique de revenu régulier
 *   budgetLines      [{ allocated, spent }] par budget de la période
 *   dataQuality      { completeness, freshness, clearing } sur 0-100
 */
export function financialHealth(measures = {}, { now = new Date() } = {}) {
  const scores = {
    balance: dimensionScore('balance', measures.balance ?? null),
    reserve: dimensionScore('reserve', measures.reserveMonths ?? null),
    debt: dimensionScore('debt', measures.debtRatio ?? null),
    savings: dimensionScore('savings', measures.savingsRate ?? null),
    goals: goalsScore(measures.goalLines ?? null),
    budgets: weightedBudgetsScore(measures.budgetLines ?? null),
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
