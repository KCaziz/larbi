// FINCLUDIA simulators, lot 1 (P4-10). One function per entry of
// constants/simulators.js: it composes CATALOGUED formulas and returns each
// value in the client's answer contract, so every figure on screen can say which
// formula produced it, in which version, from which inputs.
//
// Two rules hold everywhere here:
//
// 1. A simulator returns ONLY values that map to a formula of the client's
//    catalogue. Where the client lists an output that is just the difference
//    between two values already returned (the loss of purchasing power =
//    nominal - real value, the "disponible réel" = balance - bills), that
//    difference is left to the interface, which has both contracted operands.
//    Attaching F004 ("revenus - dépenses") to any subtraction would make the
//    identifier meaningless — and the client explicitly warns that F004 and F006
//    must not be confused.
//
// 2. Nothing is assumed. An optional amount left out is 0 because the user said
//    "nothing here", but a missing REQUIRED input makes the value not computable
//    (validation refuses it before we get here).

import { computed } from './contract.js';
import * as f from './formulas.js';
import { yearly } from './money.js';

// `hypotheses` is filled only for simulators that project into the future: the
// client requires the assumptions of a simulation to be visible, and sending the
// field on a plain monthly total would suggest a projection that never happened.
const run = (resultats, hypotheses = null) => ({ resultats, hypotheses });

const entry = (amount, currency) => ({ amount, currency });

export const SIMULATOR_FUNCTIONS = {
  // CAL-01 — Budget mensuel
  'budget-mensuel': (input, ctx) => {
    const { plannedIncome, fixedExpenses, variableExpenses, debtInstalments, plannedSavings } = input;
    const { currency } = ctx;
    const revenus = f.totalIncome([entry(plannedIncome, currency)], { currency });
    const depenses = f.totalExpenses([fixedExpenses, variableExpenses, debtInstalments].map((a) => entry(a, currency)), { currency });
    const chargesObligatoires = f.mandatoryCharges({ fixedCharges: [entry(fixedExpenses, currency)], mandatoryInstalments: [entry(debtInstalments, currency)], currency });
    const epargneNette = f.netSavings(plannedSavings, 0);
    return run({
      revenus: computed('F002', revenus, { inputs: { plannedIncome }, ...ctx }),
      depenses: computed('F003', depenses, { inputs: { fixedExpenses, variableExpenses, debtInstalments }, ...ctx }),
      chargesObligatoires: computed('F005', chargesObligatoires, { inputs: { fixedExpenses, debtInstalments }, ...ctx }),
      fluxNet: computed('F004', f.netFlow(revenus, depenses), { inputs: { revenus, depenses }, ...ctx }),
      resteAVivre: computed('F006', f.livingAllowance({ netIncome: revenus, fixedCharges: fixedExpenses, mandatoryInstalments: debtInstalments }), { inputs: { revenus, fixedExpenses, debtInstalments }, ...ctx }),
      epargneNette: computed('F007', epargneNette, { inputs: { plannedSavings }, ...ctx }),
      tauxEpargne: computed('F008', f.savingsRate(epargneNette, revenus), { inputs: { epargneNette, revenus }, ...ctx }),
      resteAAffecter: computed('F009', f.remainingBudget(revenus, depenses + plannedSavings), { inputs: { revenus, depenses, plannedSavings }, ...ctx }),
    });
  },

  // CAL-02 — Budget jusqu'à la fin du mois
  'budget-fin-de-mois': (input, ctx) => {
    const { currentBalance, remainingDays, remainingBills, dailySpendingReference } = input;
    return run({
      budgetJournalier: computed('F012', f.dailyBudget({ balance: currentBalance, remainingObligations: remainingBills, remainingDays }), { inputs: { currentBalance, remainingBills, remainingDays }, ...ctx }),
      couvertureJours: computed('F013', f.daysOfCover(currentBalance - remainingBills, dailySpendingReference), { inputs: { currentBalance, remainingBills, dailySpendingReference }, ...ctx }),
    });
  },

  // CAL-03 — Enveloppe budgétaire
  enveloppe: (input, ctx) => {
    const { categoryBudget, consumed, daysElapsed, daysInPeriod } = input;
    return run({
      reste: computed('F009', f.remainingBudget(categoryBudget, consumed), { inputs: { categoryBudget, consumed }, ...ctx }),
      tauxConsommation: computed('F010', f.envelopeUsageRate(consumed, categoryBudget), { inputs: { consumed, categoryBudget }, ...ctx }),
      projectionFinPeriode: computed('F011', f.envelopeProjection({ consumed, daysElapsed, daysInPeriod }), { inputs: { consumed, daysElapsed, daysInPeriod }, ...ctx }),
    });
  },

  // CAL-04 — Capacité d'épargne
  'capacite-epargne': (input, ctx) => {
    const { income, expenses, instalments, reservedMargin } = input;
    const capacite = f.savingsCapacity({ income, expenses, instalments, reservedMargin });
    return run({
      fluxNet: computed('F004', f.netFlow(income, expenses + instalments), { inputs: { income, expenses, instalments }, ...ctx }),
      resteAVivre: computed('F006', f.livingAllowance({ netIncome: income, fixedCharges: expenses, mandatoryInstalments: instalments }), { inputs: { income, expenses, instalments }, ...ctx }),
      capaciteMensuelle: computed('F046', capacite, { inputs: { income, expenses, instalments, reservedMargin }, ...ctx }),
      // F001 is the client's frequency-factor row; annualising a monthly amount
      // uses that same table, in the other direction.
      capaciteAnnuelle: computed('F001', capacite === null ? null : yearly(capacite, 'mensuel'), { inputs: { capacite, frequence: 'mensuel' }, ...ctx }),
      tauxEpargne: computed('F008', f.savingsRate(capacite, income), { inputs: { capacite, income }, ...ctx }),
    });
  },

  // CAL-05 — Réserve de sécurité
  'reserve-securite': (input, ctx) => {
    const { liquidSavings, essentialMonthlyExpenses, targetMonths, monthlyContribution } = input;
    const montantCible = f.safetyFundTarget(targetMonths, essentialMonthlyExpenses);
    return run({
      moisCouverts: computed('F014', f.safetyFundMonths(liquidSavings, essentialMonthlyExpenses), { inputs: { liquidSavings, essentialMonthlyExpenses }, ...ctx }),
      montantCible: computed('F015', montantCible, { inputs: { targetMonths, essentialMonthlyExpenses }, ...ctx }),
      manque: computed('F016', montantCible === null ? null : f.safetyFundGap(montantCible, liquidSavings), { inputs: { montantCible, liquidSavings }, ...ctx }),
      moisPourAtteindre: computed('F027', montantCible === null ? null : f.monthsWithoutReturn({ target: montantCible, capital: liquidSavings, contribution: monthlyContribution }), { inputs: { montantCible, liquidSavings, monthlyContribution }, ...ctx }),
    });
  },

  // CAL-06 — Objectif sans rendement
  'objectif-sans-rendement': (input, ctx) => {
    const { target, capital, contribution, monthsLeft } = input;
    return run({
      progression: computed('F025', f.goalProgress(capital, target), { inputs: { capital, target }, ...ctx }),
      reste: computed('F026', f.goalRemaining(target, capital), { inputs: { target, capital }, ...ctx }),
      moisNecessaires: computed('F027', f.monthsWithoutReturn({ target, capital, contribution }), { inputs: { target, capital, contribution }, ...ctx }),
      versementNecessaire: computed('F028', f.paymentWithoutReturn({ target, capital, monthsLeft }), { inputs: { target, capital, monthsLeft }, ...ctx }),
    });
  },

  // CAL-07 — Objectif avec rendement
  'objectif-avec-rendement': (input, ctx) => {
    const { target, capital, contribution, months, monthlyRate } = input;
    const args = { initial: capital, payment: contribution, rate: monthlyRate, periods: months };
    const valeurFuture = f.futureValueTotal(args);
    return run(
      {
        valeurFutureCapital: computed('F029', f.futureValueLumpSum(args), { inputs: args, ...ctx }),
        valeurFutureVersements: computed('F030', f.futureValuePayments(args), { inputs: args, ...ctx }),
        valeurFutureTotale: computed('F031', valeurFuture, { inputs: args, ...ctx }),
        manque: computed('F026', valeurFuture === null ? null : f.goalRemaining(target, valeurFuture), { inputs: { target, valeurFuture }, ...ctx }),
        versementRequis: computed('F032', f.paymentWithReturn({ target, initial: capital, rate: monthlyRate, periods: months }), { inputs: { target, capital, monthlyRate, months }, ...ctx }),
      },
      { rendement_mensuel: monthlyRate, horizon_mois: months },
    );
  },

  // CAL-08 — Inflation / pouvoir d'achat
  inflation: (input, ctx) => {
    const { nominalValue, inflation: inflationRate, years, nominalReturn } = input;
    return run(
      {
        valeurReelle: computed('F033', f.realValue({ nominalValue, inflation: inflationRate, years }), { inputs: { nominalValue, inflation: inflationRate, years }, ...ctx }),
        rendementReel: computed('F034', f.realReturn(nominalReturn, inflationRate), { inputs: { nominalReturn, inflation: inflationRate }, ...ctx }),
      },
      { inflation: inflationRate, horizon_annees: years, rendement_nominal: nominalReturn },
    );
  },

  // CAL-15 — Autonomie financière étudiant
  'autonomie-etudiant': (input, ctx) => {
    const { ownIncome, totalExpenses } = input;
    return run({
      autonomie: computed('F047', f.studentAutonomy(ownIncome, totalExpenses), { inputs: { ownIncome, totalExpenses }, ...ctx }),
      // Negative = the complementary need the client's screen ET03 asks for.
      fluxNet: computed('F004', f.netFlow(ownIncome, totalExpenses), { inputs: { ownIncome, totalExpenses }, ...ctx }),
    });
  },

  // CAL-16 — Provision d'une dépense annuelle ou d'études
  provision: (input, ctx) => {
    const { plannedAmount, alreadyProvisioned, monthsLeft } = input;
    return run({
      provisionMensuelle: computed('F045', f.monthlyProvision({ plannedAmount, alreadyProvisioned, monthsLeft }), { inputs: { plannedAmount, alreadyProvisioned, monthsLeft }, ...ctx }),
      reste: computed('F026', f.goalRemaining(plannedAmount, alreadyProvisioned), { inputs: { plannedAmount, alreadyProvisioned }, ...ctx }),
    });
  },

  // CAL-17 / screen LY10 — Premier salaire (always a teaching simulation)
  'premier-salaire': (input, ctx) => {
    const { net, housing, transport, food, otherExpenses, savingsTarget } = input;
    const { currency } = ctx;
    const depenses = f.totalExpenses([housing, transport, food, otherExpenses].map((a) => entry(a, currency)), { currency });
    const epargne = f.netSavings(savingsTarget, 0);
    return run({
      depenses: computed('F003', depenses, { inputs: { housing, transport, food, otherExpenses }, ...ctx }),
      fluxNet: computed('F004', f.netFlow(net, depenses), { inputs: { net, depenses }, ...ctx }),
      epargneNette: computed('F007', epargne, { inputs: { savingsTarget }, ...ctx }),
      tauxEpargne: computed('F008', f.savingsRate(epargne, net), { inputs: { epargne, net }, ...ctx }),
      resteDisponible: computed('F009', f.remainingBudget(net, depenses + savingsTarget), { inputs: { net, depenses, savingsTarget }, ...ctx }),
    });
  },

  // CAL-29 — Projection retraite indicative
  'projection-retraite': (input, ctx) => {
    const { capital, monthlyContribution, years, monthlyRate, inflation: inflationRate } = input;
    const months = years * 12;
    const args = { initial: capital, payment: monthlyContribution, rate: monthlyRate, periods: months };
    const nominal = f.futureValueTotal(args);
    return run(
      {
        capitalFuturInitial: computed('F029', f.futureValueLumpSum(args), { inputs: args, ...ctx }),
        capitalFuturVersements: computed('F030', f.futureValuePayments(args), { inputs: args, ...ctx }),
        capitalNominal: computed('F031', nominal, { inputs: args, ...ctx }),
        capitalReel: computed('F033', nominal === null ? null : f.realValue({ nominalValue: nominal, inflation: inflationRate, years }), { inputs: { nominal, inflation: inflationRate, years }, ...ctx }),
      },
      { rendement_mensuel: monthlyRate, inflation: inflationRate, horizon_annees: years },
    );
  },

  // Screen LY09 — Préparer mes études
  'budget-etudiant': (input, ctx) => {
    const { housing, transport, food, tuition, telecom, leisure, familySupport, ownResources } = input;
    const { currency } = ctx;
    const depenses = f.totalExpenses([housing, transport, food, tuition, telecom, leisure].map((a) => entry(a, currency)), { currency });
    const ressources = f.totalIncome([familySupport, ownResources].map((a) => entry(a, currency)), { currency });
    return run({
      ressourcesProjetees: computed('F002', ressources, { inputs: { familySupport, ownResources }, ...ctx }),
      depensesProjetees: computed('F003', depenses, { inputs: { housing, transport, food, tuition, telecom, leisure }, ...ctx }),
      // Negative = "besoin complémentaire", the client's own output for LY09.
      fluxNet: computed('F004', f.netFlow(ressources, depenses), { inputs: { ressources, depenses }, ...ctx }),
    });
  },
};
