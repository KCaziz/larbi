import {
  CONSUMER_DSR_HARD_MAX,
  CONSUMER_DSR_SOURCE,
  CONSUMER_KINDS,
  CREDIT_FORMULAS,
  CREDIT_MESSAGES,
  CREDIT_RULES,
  INTERNAL_DSR_MARKERS,
} from '../constants/finCredit.js';
import { CREDIT_OFFERS, conventionalOffers, creditOffer, islamicOffers, publishableOffers } from '../constants/finCreditOffers.js';
import { computed } from './finance/contract.js';

/**
 * Simulateur de crédit (P4-02) et comparaison de financements (P4-15).
 *
 * Deux moitiés, et il faut les tenir séparées :
 *
 *   LES MATHÉMATIQUES sont ordinaires et se calculent toujours : une
 *   mensualité d'emprunt amortissable, une capacité, un coût total. Elles ne
 *   dépendent d'aucune banque et ne se bloquent jamais.
 *
 *   LES CRITÈRES D'UNE BANQUE ne se calculent pas, ils se LISENT. Le
 *   référentiel les donne en texte — « 8,00 % épargnant / 8,25 % non-épargnant »,
 *   « Non publié », « Jusqu'à 40 ans » — et aucune de ces 25 offres n'est
 *   publiable tant que le client n'a pas contrôlé les brochures officielles.
 *
 * Ce qui en découle : on simule volontiers sur les chiffres que la personne
 * saisit, et on n'affirme jamais ce qu'une banque fera. Le client le dit en une
 * phrase : « l'établissement prêteur reste décisionnaire ».
 */

const round = (value) => Math.round(value);

/** CR01 — taux périodique mensuel à partir d'un taux annuel (décimal). */
export const monthlyRate = (annualRate) => (typeof annualRate === 'number' ? annualRate / 12 : null);

/**
 * CR02 — mensualité d'un emprunt amortissable.
 *
 * Le cas `i = 0` n'est pas une curiosité mathématique : un financement sans
 * intérêt existe (prêt à taux zéro, certaines formules islamiques sans marge
 * affichée), et la formule générale y divise par zéro.
 */
export function instalment(principal, annualRate, months) {
  if (!Number.isFinite(principal) || !Number.isFinite(months) || months <= 0) return null;
  if (!Number.isFinite(annualRate) || annualRate < 0) return null;
  const i = annualRate / 12;
  if (i === 0) return round(principal / months);
  return round((principal * i) / (1 - (1 + i) ** -months));
}

/** CR06 — capital qu'une mensualité donnée permet d'emprunter. */
export function capitalFor(monthlyPayment, annualRate, months) {
  if (!Number.isFinite(monthlyPayment) || monthlyPayment <= 0 || !Number.isFinite(months) || months <= 0) return null;
  if (!Number.isFinite(annualRate) || annualRate < 0) return null;
  const i = annualRate / 12;
  if (i === 0) return round(monthlyPayment * months);
  return round((monthlyPayment * (1 - (1 + i) ** -months)) / i);
}

/** CR03 / CR04 — taux d'effort avant et après le nouveau crédit. */
export function debtServiceRatio(existingInstalments, income, newInstalment = 0) {
  if (!Number.isFinite(income) || income <= 0) return null;
  if (!Number.isFinite(existingInstalments)) return null;
  return (existingInstalments + (newInstalment || 0)) / income;
}

/**
 * Le plafond de mensualité, et l'essentiel est ce qu'on fait quand on ne le
 * connaît pas.
 *
 * `bankRatio` est le ratio publié par la banque. S'il manque, le plafond LÉGAL
 * s'applique au crédit à la consommation — c'est du droit, pas une estimation —
 * et pour tout autre crédit, il n'y a pas de plafond calculable : le client
 * interdit de généraliser les 30 % à l'immobilier.
 */
export function instalmentCap({ income, existingInstalments = 0, bankRatio = null, kind = null }) {
  if (!Number.isFinite(income) || income <= 0) return { cap: null, ratio: null, source: null, reason: 'revenu_absent' };

  const isConsumer = kind !== null && CONSUMER_KINDS.includes(kind);
  const ratio = bankRatio ?? (isConsumer ? CONSUMER_DSR_HARD_MAX : null);

  if (ratio === null) {
    return {
      cap: null,
      ratio: null,
      source: null,
      // Pas un plafond par défaut : le client interdit explicitement de
      // généraliser le plafond consommation à l'immobilier.
      reason: 'ratio_non_publie',
      message: CREDIT_MESSAGES.missingCriterion,
      markers: INTERNAL_DSR_MARKERS,
    };
  }

  return {
    cap: Math.max(0, round(ratio * income - existingInstalments)),
    ratio,
    source: bankRatio !== null ? 'banque' : CONSUMER_DSR_SOURCE,
    reason: null,
  };
}

/**
 * Une simulation complète, sur les chiffres que la personne saisit.
 *
 * Elle ne consulte aucune offre : c'est une simulation mathématique, et le
 * message que le client impose le dit — « ne constitue pas une offre de
 * crédit ». Confronter le résultat aux critères d'une banque est une autre
 * opération, délibérément séparée (`checkAgainstOffer`).
 */
export function simulate({ principal, annualRate, months, income = null, existingInstalments = 0, fees = 0, insurance = 0, kind = null }, { now = new Date() } = {}) {
  const payment = instalment(principal, annualRate, months);
  const cap = instalmentCap({ income, existingInstalments, bankRatio: null, kind });

  const dsrBefore = debtServiceRatio(existingInstalments, income);
  const dsrAfter = payment === null ? null : debtServiceRatio(existingInstalments, income, payment);

  // CR09 — coût total. `null` dès qu'une composante manque : un coût total
  // amputé des frais se lit comme un coût total.
  const totalCost =
    payment === null || !Number.isFinite(fees) || !Number.isFinite(insurance)
      ? null
      : round(payment * months + fees + insurance - principal);

  const warnings = [CREDIT_MESSAGES.simulation];
  const blocking = [];

  // Le plafond légal de la consommation est un VERROU, pas un avertissement.
  if (cap.ratio === CONSUMER_DSR_HARD_MAX && dsrAfter !== null && dsrAfter > CONSUMER_DSR_HARD_MAX) {
    blocking.push(
      `Avec cette mensualité, le taux d’effort atteindrait ${(dsrAfter * 100).toFixed(1)} %. L’${CONSUMER_DSR_SOURCE.replace(/^Article/, 'article')} plafonne le crédit à la consommation à ${CONSUMER_DSR_HARD_MAX * 100} % des revenus nets réguliers.`,
    );
  }
  if (cap.reason === 'ratio_non_publie') warnings.push(cap.message);

  return {
    mensualite: computed('F021', payment, {
      inputs: { capital: principal, taux_annuel: annualRate, mois: months, formule: CREDIT_FORMULAS.CR02 },
      currency: 'DZD',
      warnings,
      now,
    }),
    coutTotal: computed('F022', totalCost, {
      inputs: { mensualite: payment, mois: months, frais: fees, assurance: insurance, formule: CREDIT_FORMULAS.CR09 },
      currency: 'DZD',
      now,
    }),
    tauxEffortAvant: dsrBefore,
    tauxEffortApres: dsrAfter,
    plafondMensualite: cap,
    bloquants: blocking,
    // Répété dans la réponse, pas seulement sur la page : une interface qui ne
    // lit que les chiffres doit quand même pouvoir dire ce qu'ils ne sont pas.
    avertissements: warnings,
  };
}

/**
 * Confronter une situation aux critères PUBLICS d'une offre.
 *
 * Rend une compatibilité, jamais une éligibilité. Et comme aucune des 25
 * offres n'est publiable aujourd'hui, la réponse le dit avant tout le reste :
 * le client a désactivé la publication tant que les brochures officielles
 * n'ont pas été contrôlées.
 */
export function checkAgainstOffer(ref) {
  const offer = creditOffer(ref);
  if (!offer) return null;

  return {
    offre: {
      ref: offer.ref,
      banque: offer.bank,
      produit: offer.product,
      type: offer.kind,
      islamique: offer.islamic,
    },
    // Les critères sont rendus en TEXTE, tels que le client les a écrits. Les
    // transformer en seuils comparables supposerait de choisir, par exemple,
    // lequel des deux taux « épargnant / non-épargnant » retenir.
    criteres: {
      taux: offer.rateText,
      duree: offer.durationText,
      effort: offer.dsrText,
      apport: offer.downPaymentText,
      age: offer.ageText,
      revenu: offer.incomeText,
    },
    publiable: offer.publishable,
    raisonNonPubliee: offer.publishable ? null : offer.blockedReason,
    statutDeclare: offer.declaredStatus,
    source: offer.source,
    message: offer.publishable ? CREDIT_MESSAGES.compatible : CREDIT_MESSAGES.missingCriterion,
  };
}

/**
 * La comparaison conventionnel / islamique (P4-15).
 *
 * Les deux familles sont rendues SÉPARÉMENT, jamais dans une même colonne
 * triée. C'est la règle que le comparateur bancaire applique déjà (`P4-06`) :
 * une marge bénéficiaire et un taux d'intérêt ne sont pas la même chose, et
 * les aligner pour les classer revient à les assimiler.
 */
export function compareFinancing({ kind = null } = {}) {
  const matches = (rows) => (kind ? rows.filter((row) => row.kind === kind) : rows);
  return {
    conventionnel: matches(conventionalOffers()).map((row) => checkAgainstOffer(row.ref)),
    islamique: matches(islamicOffers()).map((row) => checkAgainstOffer(row.ref)),
    // Dit une fois, en tête de la comparaison.
    regle:
      'Les financements conventionnels et islamiques sont présentés séparément : une marge bénéficiaire et un taux d’intérêt ne sont pas comparables terme à terme.',
    publiables: publishableOffers().length,
    total: CREDIT_OFFERS.length,
    avertissement: CREDIT_MESSAGES.simulation,
  };
}

/** Les règles-cadres, publiées pour que l'écran puisse les citer. */
export const creditRules = () => ({ regles: CREDIT_RULES, messages: CREDIT_MESSAGES, formules: CREDIT_FORMULAS });
