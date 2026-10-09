// The 57 canonical formulas of FINCLUDIA (P4-09), tab `10_Formules` of the
// client's workbook. One exported function per row, named by the catalogue
// (constants/finance.js), in the client's order.
//
// Every function here is PURE: no database, no clock, no configuration of its
// own. Weights and thresholds are always arguments, because the client requires
// them to be visible and editable (and most are still to be decided, P6-01) —
// the engine must never hold a hidden coefficient that changes someone's score.
//
// Return value: a number (integer centimes for money, decimal for a rate), or
// `null` when the row's own condition is not met. Never 0 as a fallback, never a
// thrown error for ordinary missing data: the client's test sheet asks for
// "non calculable ; pas d'exception serveur".

import { isAmount, isRate, monthly, ratio, roundAmount, splitAmount, splitByWeights, sumAmounts, weightedIndex } from './money.js';

// --- Normalisation and totals (F001-F008) ---------------------------------

// F001 — montant_mensuel = montant × facteur_fréquence
export const monthlyAmount = (amount, frequency) => monthly(amount, frequency);

// F002 — Σ revenus normalisés admissibles (same period, same currency)
export const totalIncome = (entries, { currency } = {}) => sumAmounts(entries, { currency });

// F003 — Σ dépenses admissibles
export const totalExpenses = (entries, { currency } = {}) => sumAmounts(entries, { currency });

// F004 — flux net = revenus - dépenses
export const netFlow = (income, expenses) => (isAmount(income) && isAmount(expenses) ? roundAmount(income - expenses) : null);

// F005 — Σ charges fixes + échéances obligatoires
export function mandatoryCharges({ fixedCharges = [], mandatoryInstalments = [], currency } = {}) {
  const fixed = sumAmounts(fixedCharges, { currency });
  const instalments = sumAmounts(mandatoryInstalments, { currency });
  return isAmount(fixed) && isAmount(instalments) ? roundAmount(fixed + instalments) : null;
}

// F006 — reste à vivre = revenus nets - charges fixes - mensualités obligatoires.
// Deliberately NOT the net flow (F004): the client insists the two are different
// (F004 looks at what was actually spent, F006 at what is already committed).
export function livingAllowance({ netIncome, fixedCharges, mandatoryInstalments } = {}) {
  if (![netIncome, fixedCharges, mandatoryInstalments].every(isAmount)) return null;
  return roundAmount(netIncome - fixedCharges - mandatoryInstalments);
}

// F007 — épargne nette = entrées affectées à l'épargne - retraits d'épargne
export const netSavings = (deposits, withdrawals) =>
  isAmount(deposits) && isAmount(withdrawals) ? roundAmount(deposits - withdrawals) : null;

// F008 — taux d'épargne = épargne nette / revenus nets (decimal; × 100 at display)
export const savingsRate = (netSavingsAmount, netIncome) =>
  isAmount(netSavingsAmount) && isAmount(netIncome) ? ratio(netSavingsAmount, netIncome) : null;

// --- Budget envelopes (F009-F013) -----------------------------------------

// F009 — budget restant = budget prévu - dépenses réelles. May be negative: an
// overspent envelope is a fact to show, not an error to hide.
export const remainingBudget = (planned, actual) =>
  isAmount(planned) && isAmount(actual) ? roundAmount(planned - actual) : null;

// F010 — taux de consommation = dépenses réelles / budget
export const envelopeUsageRate = (actual, budget) => (isAmount(actual) && isAmount(budget) ? ratio(actual, budget) : null);

// F011 — projection = consommé / jours écoulés × jours de la période
export function envelopeProjection({ consumed, daysElapsed, daysInPeriod } = {}) {
  if (!isAmount(consumed) || !isRate(daysElapsed) || !isRate(daysInPeriod)) return null;
  const perDay = ratio(consumed, daysElapsed);
  return perDay === null ? null : roundAmount(perDay * daysInPeriod);
}

// F012 — budget journalier = (solde - obligations restantes) / jours restants
export function dailyBudget({ balance, remainingObligations, remainingDays } = {}) {
  if (!isAmount(balance) || !isAmount(remainingObligations) || !isRate(remainingDays)) return null;
  if (remainingDays <= 0) return null; // client: "si jours restants > 0"
  return roundAmount(ratio(balance - remainingObligations, remainingDays));
}

// F013 — couverture en jours = disponible réel / dépense journalière de référence.
// The reference is configurable (client's condition), so it is an argument.
export const daysOfCover = (available, dailyReference) =>
  isAmount(available) && isAmount(dailyReference) ? ratio(available, dailyReference) : null;

// --- Safety fund (F014-F016) ----------------------------------------------

// F014 — réserve en mois = épargne liquide / dépenses essentielles mensuelles.
// The caller must have already excluded the paper portfolio and illiquid assets
// (client's condition); the engine cannot tell which is which.
export const safetyFundMonths = (liquidSavings, essentialMonthlyExpenses) =>
  isAmount(liquidSavings) && isAmount(essentialMonthlyExpenses) ? ratio(liquidSavings, essentialMonthlyExpenses) : null;

// F015 — montant cible = cible_mois × dépenses essentielles
export const safetyFundTarget = (targetMonths, essentialMonthlyExpenses) =>
  isRate(targetMonths) && targetMonths >= 0 && isAmount(essentialMonthlyExpenses)
    ? roundAmount(targetMonths * essentialMonthlyExpenses)
    : null;

// F016 — manque = max(0, montant cible - épargne liquide)
export const safetyFundGap = (target, liquidSavings) =>
  isAmount(target) && isAmount(liquidSavings) ? Math.max(0, target - liquidSavings) : null;

// --- Debt (F017-F019) ------------------------------------------------------

// F017 — service mensuel = Σ mensualités obligatoires (active debts only)
export const monthlyDebtService = (instalments, { currency } = {}) => sumAmounts(instalments, { currency });

// F018 — taux d'effort = mensualités obligatoires / revenus nets.
// An educational indicator: the client forbids reading a threshold into it until
// the thresholds themselves are validated (P6-01).
export const debtEffortRate = (mandatoryInstalments, netIncome) =>
  isAmount(mandatoryInstalments) && isAmount(netIncome) ? ratio(mandatoryInstalments, netIncome) : null;

// F019 — dette / revenu annuel = capital restant total / revenus annuels
export const debtToAnnualIncome = (outstandingPrincipal, annualIncome) =>
  isAmount(outstandingPrincipal) && isAmount(annualIncome) ? ratio(outstandingPrincipal, annualIncome) : null;

// --- Credit (F020-F024) ----------------------------------------------------

// F020 — r = taux_annuel / périodes_par_an
export const periodicRate = (annualRate, periodsPerYear) =>
  isRate(annualRate) && isRate(periodsPerYear) ? ratio(annualRate, periodsPerYear) : null;

// F021 — M = P×r / (1-(1+r)^(-n)) ; if r = 0, M = P/n
export function annuityPayment({ principal, periodicRate: rate, periods } = {}) {
  if (!isAmount(principal) || !isRate(rate) || !Number.isSafeInteger(periods) || periods <= 0) return null;
  if (rate === 0) return roundAmount(principal / periods);
  if (1 + rate <= 0) return null; // a rate of -100 % or worse has no annuity
  const factor = 1 - (1 + rate) ** -periods;
  if (factor === 0) return null;
  return roundAmount((principal * rate) / factor);
}

// F022 — total = M×n + frais + assurance (whatever of the three is known)
export function totalCreditPayments({ payment, periods, fees = 0, insurance = 0 } = {}) {
  if (!isAmount(payment) || !Number.isSafeInteger(periods) || periods <= 0) return null;
  if (!isAmount(fees) || !isAmount(insurance)) return null;
  return roundAmount(payment * periods + fees + insurance);
}

// F023 — coût total = total paiements - capital financé
export const totalFinancingCost = (totalPayments, financedPrincipal) =>
  isAmount(totalPayments) && isAmount(financedPrincipal) ? roundAmount(totalPayments - financedPrincipal) : null;

// F024 — économie = coût_base - coût_scenario, minus the early-repayment fees
// when they are known. The client forbids assuming a fee of 0 is "no fee": an
// unknown fee is an unknown, so pass it explicitly or leave it out and say so.
export function earlyRepaymentSaving({ baseCost, scenarioCost, fees = 0 } = {}) {
  if (![baseCost, scenarioCost, fees].every(isAmount)) return null;
  return roundAmount(baseCost - scenarioCost - fees);
}

// --- Goals (F025-F028) -----------------------------------------------------

// F025 — progression = capital affecté / montant cible. NOT capped here: the
// client caps the DISPLAY at 100 % and keeps the surplus separately, so capping
// the value would destroy the surplus.
export const goalProgress = (allocated, target) => (isAmount(allocated) && isAmount(target) ? ratio(allocated, target) : null);

// F026 — reste = max(0, cible - capital affecté)
export const goalRemaining = (target, allocated) =>
  isAmount(target) && isAmount(allocated) ? Math.max(0, target - allocated) : null;

// F027 — mois nécessaires = ceil((cible-capital)/contribution), no return
export function monthsWithoutReturn({ target, capital, contribution } = {}) {
  if (![target, capital, contribution].every(isAmount)) return null;
  if (contribution <= 0) return null; // client: "si contribution > 0"
  const missing = target - capital;
  if (missing <= 0) return 0; // already reached
  return Math.ceil(missing / contribution);
}

// F028 — versement = (cible - capital) / mois restants, no return
export function paymentWithoutReturn({ target, capital, monthsLeft } = {}) {
  if (!isAmount(target) || !isAmount(capital) || !isRate(monthsLeft)) return null;
  if (monthsLeft <= 0) return null; // client: "si mois restants > 0"
  return roundAmount(ratio(Math.max(0, target - capital), monthsLeft));
}

// --- Compounding and inflation (F029-F034) ---------------------------------

// F029 — C0×(1+r)^n, r periodic
export function futureValueLumpSum({ initial, rate, periods } = {}) {
  if (!isAmount(initial) || !isRate(rate) || !Number.isSafeInteger(periods) || periods < 0) return null;
  if (1 + rate < 0) return null;
  return roundAmount(initial * (1 + rate) ** periods);
}

// F030 — V×((1+r)^n-1)/r, payments at period end ; if r = 0, V×n
export function futureValuePayments({ payment, rate, periods } = {}) {
  if (!isAmount(payment) || !isRate(rate) || !Number.isSafeInteger(periods) || periods < 0) return null;
  if (rate === 0) return roundAmount(payment * periods);
  if (1 + rate < 0) return null;
  return roundAmount(payment * (((1 + rate) ** periods - 1) / rate));
}

// F031 — valeur future totale = F029 + F030
export function futureValueTotal({ initial, payment, rate, periods } = {}) {
  const lump = futureValueLumpSum({ initial, rate, periods });
  const payments = futureValuePayments({ payment, rate, periods });
  return isAmount(lump) && isAmount(payments) ? roundAmount(lump + payments) : null;
}

// F032 — V = (cible - C0(1+r)^n)×r / ((1+r)^n-1). r = 0 is not this formula:
// the client says to use F028, so answering here would hide that choice.
export function paymentWithReturn({ target, initial, rate, periods } = {}) {
  if (!isAmount(target) || !isAmount(initial) || !isRate(rate) || !Number.isSafeInteger(periods) || periods <= 0) return null;
  if (rate === 0 || 1 + rate < 0) return null;
  const growth = (1 + rate) ** periods;
  const denominator = growth - 1;
  if (denominator === 0) return null;
  return roundAmount(((target - initial * growth) * rate) / denominator);
}

// F033 — valeur réelle = valeur nominale / (1+inflation)^années
export function realValue({ nominalValue, inflation, years } = {}) {
  if (!isAmount(nominalValue) || !isRate(inflation) || !isRate(years)) return null;
  if (1 + inflation <= 0) return null;
  return roundAmount(nominalValue / (1 + inflation) ** years);
}

// F034 — rendement réel = (1+rendement_nominal)/(1+inflation)-1
export function realReturn(nominalReturn, inflation) {
  if (!isRate(nominalReturn) || !isRate(inflation)) return null;
  if (1 + inflation === 0) return null;
  return (1 + nominalReturn) / (1 + inflation) - 1;
}

// --- Wealth (F035-F037) ----------------------------------------------------

// F035 — patrimoine net = Σ actifs réels - Σ dettes réelles. "Réels": the caller
// must not pass the paper portfolio — the client forbids mixing the two totals.
export function netWorth({ assets = [], liabilities = [], currency } = {}) {
  const totalAssets = sumAmounts(assets, { currency, monthlyNormalisation: false });
  const totalLiabilities = sumAmounts(liabilities, { currency, monthlyNormalisation: false });
  return isAmount(totalAssets) && isAmount(totalLiabilities) ? roundAmount(totalAssets - totalLiabilities) : null;
}

// F036 — allocation = valeur actif / total actifs
export const assetAllocation = (assetValue, totalAssets) =>
  isAmount(assetValue) && isAmount(totalAssets) ? ratio(assetValue, totalAssets) : null;

// F037 — concentration = max(allocation par actif ou classe)
export function maxConcentration(allocations) {
  if (!Array.isArray(allocations) || allocations.length === 0) return null;
  if (!allocations.every(isRate)) return null;
  return Math.max(...allocations);
}

// --- Paper portfolio (F038-F040) ------------------------------------------
// Always a simulation: the client requires a permanent "SIMULATION" badge and
// forbids these values from reaching the real net worth (F035).

// F038 — valeur = Σ quantité × prix simulé
export function paperPortfolioValue(positions) {
  if (!Array.isArray(positions)) return null;
  let total = 0;
  for (const position of positions) {
    if (!position || typeof position !== 'object') return null;
    const { quantity, simulatedPrice } = position;
    if (!isRate(quantity) || !isAmount(simulatedPrice)) return null;
    total += quantity * simulatedPrice;
  }
  return roundAmount(total);
}

// F039 — gain/perte = valeur actuelle fictive - coût fictif (fees included)
export const paperGainLoss = (currentValue, cost) =>
  isAmount(currentValue) && isAmount(cost) ? roundAmount(currentValue - cost) : null;

// F040 — rendement = gain/perte / coût fictif
export const paperReturn = (gainLoss, cost) => (isAmount(gainLoss) && isAmount(cost) ? ratio(gainLoss, cost) : null);

// --- Shared spaces (F041-F044) --------------------------------------------

// F041 — part égale = montant / nombre de participants. Returns every share, so
// the caller can see they add up exactly to the amount (client's rule).
export const equalShare = (amount, participants) => splitAmount(amount, participants);

// F042 — part proportionnelle aux revenus = montant × revenu_i / Σ revenus.
// Needs each member's consent to use their income (client's condition): that is
// checked by the caller, not here.
export const incomeProportionalShare = (amount, incomes) => splitByWeights(amount, incomes);

// F043 — solde = payé pour le groupe - quote-part due - règlements reçus
// + règlements versés. Positive means the member is owed money.
export function sharedMemberBalance({ paidForGroup, shareDue, settlementsReceived = 0, settlementsPaid = 0 } = {}) {
  if (![paidForGroup, shareDue, settlementsReceived, settlementsPaid].every(isAmount)) return null;
  return roundAmount(paidForGroup - shareDue - settlementsReceived + settlementsPaid);
}

// F044 — contribution = dépenses communes × revenu_i / revenu total (optional mode)
export const householdContribution = (commonExpenses, incomes) => splitByWeights(commonExpenses, incomes);

// --- Capacity, autonomy, recurring costs (F045-F050) ----------------------

// F045 — provision mensuelle = (montant prévu - déjà provisionné) / mois restants
export function monthlyProvision({ plannedAmount, alreadyProvisioned, monthsLeft } = {}) {
  if (!isAmount(plannedAmount) || !isAmount(alreadyProvisioned) || !isRate(monthsLeft)) return null;
  if (monthsLeft <= 0) return null; // client: "si mois restants > 0"
  return roundAmount(ratio(Math.max(0, plannedAmount - alreadyProvisioned), monthsLeft));
}

// F046 — capacité = revenus - dépenses - mensualités - marge réservée
export function savingsCapacity({ income, expenses, instalments, reservedMargin = 0 } = {}) {
  if (![income, expenses, instalments, reservedMargin].every(isAmount)) return null;
  return roundAmount(income - expenses - instalments - reservedMargin);
}

// F047 — autonomie = revenus personnels / dépenses totales. What counts as a
// "personal" resource is a versioned definition the client still owes us
// (P6-01), so the split is made by the caller and passed in.
export const studentAutonomy = (ownIncome, totalExpenses) =>
  isAmount(ownIncome) && isAmount(totalExpenses) ? ratio(ownIncome, totalExpenses) : null;

// F048 — net économique = net + avantages monétisables - coûts liés à l'emploi.
// Benefits that cannot be priced stay OUT of this number and are listed apart
// (client's rule), otherwise the comparison would pretend to measure them.
export function jobOfferNetValue({ net, monetisableBenefits = 0, jobCosts = 0 } = {}) {
  if (![net, monetisableBenefits, jobCosts].every(isAmount)) return null;
  return roundAmount(net + monetisableBenefits - jobCosts);
}

// F049 — coût récurrent normalisé = montant × fréquence annuelle / 12, i.e. the
// monthly cost of a subscription. The yearly figure the same screen shows is
// `yearly()` in money.js, derived from the same factor.
export const normalizedRecurringCost = (amount, frequency) => monthly(amount, frequency);

// F050 — couverture = réserve liquide / déficit mensuel après choc
export const shockCoverage = (liquidReserve, monthlyDeficit) =>
  isAmount(liquidReserve) && isAmount(monthlyDeficit) && monthlyDeficit > 0 ? ratio(liquidReserve, monthlyDeficit) : null;

// --- Indices (F051-F054) ---------------------------------------------------
// All four are the same shape: Σ(sous-score × poids) / Σ poids, with the weights
// supplied and shown. None of them is a credit score, and none may be presented
// as one (client's rule, repeated on every screen that uses them).

// F051 — indice de préparation au financement (complétude, stabilité, effort
// dette, apport, réserve). Weights still to be given by the client (P6-01).
export const fundingReadinessIndex = (components) => weightedIndex(components);

// F052 — indice de connaissances financières
export const financialKnowledgeIndex = (components) => weightedIndex(components);

// F053 — indice de santé financière. A missing dimension does not zero the
// score: it is left out and the score is partial (client's condition), which is
// why the caller must also show which dimensions were missing.
export const financialHealthIndex = (components) => weightedIndex(components);

// F054 — score d'adéquation d'une option = Σ(correspondance × poids) / Σ poids
export const optionFitScore = (criteria) => weightedIndex(criteria);

// --- Freshness and impact (F055-F057) -------------------------------------

// F055 — âge de la donnée = date courante - date d'effet ou de collecte, in whole
// days. The threshold that makes a value "old" depends on its type and is the
// caller's business (client's condition).
export function dataAgeDays(referenceDate, now) {
  const from = referenceDate instanceof Date ? referenceDate.getTime() : NaN;
  const to = now instanceof Date ? now.getTime() : NaN;
  if (!Number.isFinite(from) || !Number.isFinite(to)) return null;
  return Math.floor((to - from) / 86_400_000);
}

// F056 — impact d'une nouvelle mensualité : nouveau reste à vivre and new debt
// effort rate. Explicitly NOT a credit decision (client's condition): it says
// what the budget would look like, never whether a lender would agree.
export function newPaymentImpact({ livingAllowance: currentLivingAllowance, payment, currentDebtService, netIncome } = {}) {
  if (![currentLivingAllowance, payment, currentDebtService, netIncome].every(isAmount)) return null;
  return {
    livingAllowance: roundAmount(currentLivingAllowance - payment),
    effortRate: ratio(currentDebtService + payment, netIncome),
  };
}

// F057 — profil de risque pédagogique : Σ(points × poids), then a category from
// versioned thresholds. The thresholds are explicitly "non figés" and have not
// been given yet (P6-01), so without them the category is null — the score is
// shown, the label is not invented.
export function riskProfileScore(answers, thresholds = null) {
  if (!Array.isArray(answers) || answers.length === 0) return null;
  let score = 0;
  for (const answer of answers) {
    if (!answer || typeof answer !== 'object') return null;
    const { points, weight } = answer;
    if (!isRate(points) || !isRate(weight) || weight < 0) return null;
    score += points * weight;
  }
  if (!Number.isFinite(score)) return null;
  let category = null;
  if (Array.isArray(thresholds)) {
    for (const threshold of thresholds) {
      if (!threshold || typeof threshold !== 'object') return null;
      if (!isRate(threshold.upTo) || typeof threshold.category !== 'string') return null;
    }
    const match = [...thresholds].sort((a, b) => a.upTo - b.upTo).find((threshold) => score <= threshold.upTo);
    category = match ? match.category : null;
  }
  return { score, category };
}
