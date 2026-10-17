// The job-offer comparator of FINCLUDIA (P4-12), screen ET08: "comparer le gain
// économique de plusieurs offres au-delà du seul salaire".
//
// The client's formula is F048, verbatim: net économique = net + avantages
// monétisables - coûts liés à l'emploi. Two of its rules shape this file:
//
// - A benefit that cannot be priced NEVER enters the figure. Lunch vouchers with
//   a value are an amount; "a good team" is not. The unpriced ones are returned
//   apart, exactly as the client asks, instead of being guessed at a price that
//   would decide the comparison.
// - The commute is compared as TIME, not converted into money. No formula of the
//   catalogue prices an hour of someone's life, and inventing one here would be
//   the single most consequential invention in this screen.

import { computed } from './contract.js';
import * as f from './formulas.js';
import { compareOptions } from './comparison.js';

const entry = (amount, currency) => ({ amount, currency });

// The criteria ET08 compares: the gain, what the job costs, and the time it
// takes. Named here so the API and the interface compare the same three things.
export const JOB_OFFER_CRITERIA = ['netValue', 'cost', 'commuteMinutes'];

export function compareJobOffers({ offers, weights = null, currency, now = new Date() }) {
  const ctx = { currency, now };
  const computedOffers = offers.map((offer, index) => {
    const { label, net, bonuses, monetisableBenefits, transportCost, mealCost, annualJobCosts, commuteMinutes, nonMonetisableBenefits } = offer;

    // F049 — an annual cost (a licence, a training, a season ticket) brought back
    // to the month, so it is not compared against monthly figures at face value.
    const annualNormalised = f.normalizedRecurringCost(annualJobCosts, 'annuel');
    const jobCosts = f.totalExpenses(
      [transportCost, mealCost, annualNormalised ?? 0].map((amount) => entry(amount, currency)),
      { currency },
    );
    const benefits = bonuses + monetisableBenefits;
    const netValue = jobCosts === null ? null : f.jobOfferNetValue({ net, monetisableBenefits: benefits, jobCosts });

    return {
      key: `o${index + 1}`,
      label,
      resultats: {
        coutMensuelAnnualise: computed('F049', annualNormalised, { inputs: { annualJobCosts, frequence: 'annuel' }, ...ctx }),
        coutsEmploi: computed('F003', jobCosts, { inputs: { transportCost, mealCost, annualNormalised }, ...ctx }),
        netEconomique: computed('F048', netValue, { inputs: { net, bonuses, monetisableBenefits, jobCosts }, ...ctx }),
      },
      // Shown next to the figures, never inside them (the client's own rule).
      nonMonetisableBenefits: nonMonetisableBenefits ?? null,
      criteria: { netValue, cost: jobCosts, commuteMinutes },
      currency,
    };
  });

  const comparison = compareOptions({
    options: computedOffers.map(({ key, label, criteria, currency: optionCurrency }) => ({ key, label, criteria, currency: optionCurrency })),
    criteria: JOB_OFFER_CRITERIA,
    weights,
    now,
  });

  return {
    offers: computedOffers.map(({ key, label, resultats, nonMonetisableBenefits }) => ({ key, label, resultats, nonMonetisableBenefits })),
    comparison,
  };
}
