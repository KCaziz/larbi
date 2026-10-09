import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { ALGORITHMS, FINANCE_UNITS, FORMULAS, FREQUENCIES, MAX_ITERATION_MONTHS, annualOccurrences, formulaById } from '../../src/constants/finance.js';
import * as formulas from '../../src/services/finance/formulas.js';
import * as algorithms from '../../src/services/finance/algorithms.js';
import { computed, isNotComputed } from '../../src/services/finance/contract.js';
import { isAmount, ratio, splitAmount, splitByWeights, sumAmounts, weightedIndex, yearly } from '../../src/services/finance/money.js';

// FINCLUDIA calculation engine (P4-09). The client's workbook asks for a unit
// test per calculation, with eight cases each (tab `16_QA_Tests`): nominal, zero
// denominator, missing value, extreme value, mixed currency, old data,
// real/fictional, permissions. The first seven are checked here; permissions are
// an API concern and belong to the functional tests of the screens that use the
// engine.
//
// Where a result could be written as a magic number, the test checks the
// RELATIONSHIP instead (an annuity really amortises its loan, F031 = F029 + F030,
// F032 really reaches the target). Re-typing the same constant twice proves
// nothing; these properties would catch a wrong formula.

// Amounts are integer centimes everywhere: 100_00 reads as "100,00 DA".
const DA = (units) => units * 100;

describe('the catalogue and the implementations match', () => {
  test("every one of the client's 57 formulas has an implementation, and nothing else is exported", () => {
    assert.equal(FORMULAS.length, 57);
    const exported = Object.keys(formulas).sort();
    const catalogued = FORMULAS.map((f) => f.fn).sort();
    assert.deepEqual(exported, catalogued);
  });

  test('the 4 algorithms have an implementation', () => {
    assert.equal(ALGORITHMS.length, 4);
    for (const algorithm of ALGORITHMS) assert.equal(typeof algorithms[algorithm.fn], 'function', algorithm.id);
  });

  test('ids are unique, in the order of the client file, and every unit is known', () => {
    const ids = FORMULAS.map((f) => f.id);
    assert.equal(new Set(ids).size, ids.length);
    assert.deepEqual(ids, [...ids].sort());
    assert.equal(ids[0], 'F001');
    assert.equal(ids.at(-1), 'F057');
    for (const formula of FORMULAS) {
      assert.ok(FINANCE_UNITS.includes(formula.unit), `${formula.id}: ${formula.unit}`);
      assert.ok(Number.isInteger(formula.version) && formula.version >= 1, formula.id);
      // label, rule and condition are the client's own three columns: they are
      // what the "Pourquoi ?" panel shows, so none of them may be empty.
      for (const field of ['label', 'rule', 'condition']) {
        assert.equal(typeof formula[field], 'string', `${formula.id}.${field}`);
        assert.ok(formula[field].trim().length > 0, `${formula.id}.${field} is empty`);
      }
    }
  });
});

describe('shared rules of the engine', () => {
  test('a zero denominator is never computable, and never 0', () => {
    assert.equal(ratio(100, 0), null);
    assert.equal(formulas.savingsRate(DA(100), 0), null);
    assert.equal(formulas.safetyFundMonths(DA(1000), 0), null);
    assert.equal(formulas.debtEffortRate(DA(200), 0), null);
    assert.equal(formulas.envelopeUsageRate(DA(50), 0), null);
    assert.equal(formulas.goalProgress(DA(10), 0), null);
    assert.equal(formulas.paperReturn(DA(10), 0), null);
    assert.equal(formulas.studentAutonomy(DA(10), 0), null);
    assert.equal(formulas.assetAllocation(DA(10), 0), null);
    assert.equal(formulas.debtToAnnualIncome(DA(10), 0), null);
  });

  test('a missing or non-integer amount is not computable', () => {
    assert.equal(formulas.netFlow(undefined, DA(10)), null);
    assert.equal(formulas.netFlow(DA(10), null), null);
    assert.equal(formulas.netFlow(10.5, DA(10)), null, 'centimes are integers, not decimals');
    assert.equal(formulas.livingAllowance({ netIncome: DA(100) }), null, 'a missing field is not zero');
    assert.equal(formulas.monthlyAmount(DA(100), 'quinzomadaire'), null, 'an unknown frequency is never assumed monthly');
    assert.equal(formulas.monthlyAmount(DA(100), undefined), null);
  });

  test('an extreme value overflows into "not computable" instead of a wrong number', () => {
    assert.equal(formulas.netFlow(Number.MAX_SAFE_INTEGER, -10), null);
    assert.equal(formulas.safetyFundTarget(1e300, Number.MAX_SAFE_INTEGER), null);
    assert.equal(sumAmounts([{ amount: Number.MAX_SAFE_INTEGER, currency: 'DZD' }, { amount: DA(1), currency: 'DZD' }], { currency: 'DZD' }), null);
  });

  test('mixing currencies is refused: converting would invent an exchange rate', () => {
    const entries = [{ amount: DA(100), currency: 'DZD' }, { amount: DA(50), currency: 'EUR' }];
    assert.equal(formulas.totalIncome(entries, { currency: 'DZD' }), null);
    assert.equal(formulas.totalExpenses(entries, { currency: 'DZD' }), null);
    assert.equal(formulas.netWorth({ assets: entries, currency: 'DZD' }), null);
    assert.equal(formulas.totalIncome([{ amount: DA(100), currency: 'DZD' }], { currency: 'DZD' }), DA(100));
  });

  test('every frequency of the client file, and no other', () => {
    assert.deepEqual(FREQUENCIES, ['hebdomadaire', 'mensuel', 'trimestriel', 'semestriel', 'annuel']);
    assert.equal(formulas.monthlyAmount(DA(1200), 'annuel'), DA(100));
    assert.equal(formulas.monthlyAmount(DA(300), 'trimestriel'), DA(100));
    assert.equal(formulas.monthlyAmount(DA(600), 'semestriel'), DA(100));
    assert.equal(formulas.monthlyAmount(DA(100), 'mensuel'), DA(100));
    assert.equal(formulas.monthlyAmount(DA(1000), 'hebdomadaire'), Math.round(DA(1000) * (52 / 12)));
    assert.equal(annualOccurrences('hebdomadaire'), 52);
    assert.equal(annualOccurrences('mensuel'), 12);
    assert.equal(annualOccurrences('inconnue'), null);
    assert.equal(yearly(DA(100), 'mensuel'), DA(1200));
  });

  test('shares always add up exactly to the amount they split', () => {
    assert.deepEqual(splitAmount(DA(10), 3), [334, 333, 333]);
    assert.equal(splitAmount(DA(10), 3).reduce((a, b) => a + b, 0), DA(10));
    assert.deepEqual(splitAmount(-DA(10), 3), [-334, -333, -333], 'a refund keeps its sign');
    assert.equal(splitAmount(DA(10), 0), null);
    for (const count of [2, 3, 7, 11, 13]) {
      for (const total of [1, 99, DA(33.33), DA(1000), 123_457]) {
        assert.equal(splitAmount(total, count).reduce((a, b) => a + b, 0), total, `${total}/${count}`);
      }
    }
  });

  test('proportional shares also add up exactly, largest remainder first', () => {
    assert.deepEqual(splitByWeights(DA(10), [2, 1]), [667, 333]);
    assert.deepEqual(splitByWeights(DA(10), [1, 1, 1]), [334, 333, 333]);
    assert.equal(splitByWeights(DA(10), [0, 0]), null, 'no income declared: not computable, not an equal split');
    for (const weights of [[1, 2, 3], [7, 11], [1, 1, 1, 1, 1, 1, 1]]) {
      const total = DA(1234.56);
      assert.equal(splitByWeights(total, weights).reduce((a, b) => a + b, 0), total);
    }
  });

  test('a weighted index needs weights, and a missing dimension makes it partial, not zero', () => {
    assert.equal(weightedIndex([{ score: 80, weight: 1 }, { score: 40, weight: 1 }]), 60);
    assert.equal(weightedIndex([{ score: 80, weight: 3 }, { score: 40, weight: 1 }]), 70);
    assert.equal(weightedIndex([{ score: 80, weight: 1 }, { score: null, weight: 9 }]), 80, 'the missing dimension is left out');
    assert.equal(weightedIndex([{ score: null, weight: 1 }]), null, 'nothing known: not computable, not 0');
    assert.equal(weightedIndex([]), null);
    assert.equal(weightedIndex([{ score: 80, weight: 0 }]), null, 'a zero total weight is a zero denominator');
  });
});

describe('totals, budget and envelopes (F002-F013)', () => {
  const income = [{ amount: DA(90_000), currency: 'DZD', frequency: 'mensuel' }, { amount: DA(120_000), currency: 'DZD', frequency: 'annuel' }];

  test('F002 / F003 normalise every entry to the month before summing', () => {
    assert.equal(formulas.totalIncome(income, { currency: 'DZD' }), DA(100_000));
    assert.equal(formulas.totalExpenses([{ amount: DA(30_000), currency: 'DZD', frequency: 'mensuel' }], { currency: 'DZD' }), DA(30_000));
  });

  test('F004 flux net, F005 charges obligatoires, F006 reste à vivre are three different numbers', () => {
    assert.equal(formulas.netFlow(DA(100_000), DA(70_000)), DA(30_000));
    const charges = formulas.mandatoryCharges({
      fixedCharges: [{ amount: DA(40_000), currency: 'DZD', frequency: 'mensuel' }],
      mandatoryInstalments: [{ amount: DA(15_000), currency: 'DZD', frequency: 'mensuel' }],
      currency: 'DZD',
    });
    assert.equal(charges, DA(55_000));
    assert.equal(formulas.livingAllowance({ netIncome: DA(100_000), fixedCharges: DA(40_000), mandatoryInstalments: DA(15_000) }), DA(45_000));
  });

  test('F007 / F008 savings and savings rate', () => {
    assert.equal(formulas.netSavings(DA(20_000), DA(5_000)), DA(15_000));
    assert.equal(formulas.savingsRate(DA(15_000), DA(100_000)), 0.15, 'a decimal, displayed as 15 %');
  });

  test('F009 / F010 / F011 envelopes, including an overspent one', () => {
    assert.equal(formulas.remainingBudget(DA(20_000), DA(23_000)), -DA(3_000), 'overspending is shown, not clamped to 0');
    assert.equal(formulas.envelopeUsageRate(DA(23_000), DA(20_000)), 1.15);
    assert.equal(formulas.envelopeProjection({ consumed: DA(10_000), daysElapsed: 10, daysInPeriod: 30 }), DA(30_000));
    assert.equal(formulas.envelopeProjection({ consumed: DA(10_000), daysElapsed: 0, daysInPeriod: 30 }), null);
  });

  test('F012 / F013 daily budget and days of cover', () => {
    assert.equal(formulas.dailyBudget({ balance: DA(30_000), remainingObligations: DA(10_000), remainingDays: 20 }), DA(1_000));
    assert.equal(formulas.dailyBudget({ balance: DA(30_000), remainingObligations: DA(10_000), remainingDays: 0 }), null);
    assert.equal(formulas.daysOfCover(DA(20_000), DA(1_000)), 20);
  });
});

describe('safety fund and debt (F014-F019)', () => {
  test('F014 / F015 / F016 reserve in months, target and gap', () => {
    assert.equal(formulas.safetyFundMonths(DA(300_000), DA(100_000)), 3);
    assert.equal(formulas.safetyFundTarget(6, DA(100_000)), DA(600_000));
    assert.equal(formulas.safetyFundGap(DA(600_000), DA(300_000)), DA(300_000));
    assert.equal(formulas.safetyFundGap(DA(600_000), DA(900_000)), 0, 'an exceeded target is a gap of zero, which is a real answer');
  });

  test('F017 / F018 / F019 debt service and effort', () => {
    assert.equal(formulas.monthlyDebtService([{ amount: DA(15_000), currency: 'DZD', frequency: 'mensuel' }], { currency: 'DZD' }), DA(15_000));
    assert.equal(formulas.debtEffortRate(DA(15_000), DA(100_000)), 0.15);
    assert.equal(formulas.debtToAnnualIncome(DA(600_000), DA(1_200_000)), 0.5);
  });
});

describe('credit (F020-F024)', () => {
  test('F020 periodic rate', () => {
    assert.equal(formulas.periodicRate(0.06, 12), 0.005);
    assert.equal(formulas.periodicRate(0.06, 0), null);
  });

  test('F021 with no interest is exactly the principal split over the term', () => {
    assert.equal(formulas.annuityPayment({ principal: DA(120_000), periodicRate: 0, periods: 12 }), DA(10_000));
    assert.equal(formulas.annuityPayment({ principal: DA(120_000), periodicRate: 0.01, periods: 0 }), null);
  });

  test('F021 with interest really amortises the loan (schedule ends at zero)', () => {
    const principal = DA(1_000_000);
    const rate = 0.005;
    const periods = 60;
    const payment = formulas.annuityPayment({ principal, periodicRate: rate, periods });
    assert.ok(payment > principal / periods, 'interest makes the payment bigger than a plain split');
    let balance = principal;
    for (let i = 0; i < periods; i += 1) balance = balance * (1 + rate) - payment;
    assert.ok(Math.abs(balance) < DA(1), `the loan is repaid, remainder ${balance}`);
  });

  test('F022 / F023 / F024 total paid, cost and the saving of paying early', () => {
    assert.equal(formulas.totalCreditPayments({ payment: DA(10_000), periods: 12, fees: DA(5_000), insurance: DA(1_000) }), DA(126_000));
    assert.equal(formulas.totalFinancingCost(DA(126_000), DA(120_000)), DA(6_000));
    assert.equal(formulas.earlyRepaymentSaving({ baseCost: DA(50_000), scenarioCost: DA(30_000), fees: DA(2_000) }), DA(18_000));
    assert.equal(formulas.earlyRepaymentSaving({ baseCost: DA(50_000), scenarioCost: DA(30_000) }), DA(20_000), 'no fee given: the fee is not invented, only omitted');
  });
});

describe('goals (F025-F028)', () => {
  test('F025 keeps the surplus instead of capping the value at 100 %', () => {
    assert.equal(formulas.goalProgress(DA(50_000), DA(200_000)), 0.25);
    assert.equal(formulas.goalProgress(DA(250_000), DA(200_000)), 1.25, 'the display caps at 100 %, the value does not');
  });

  test('F026 / F027 / F028 remaining, months needed and monthly payment', () => {
    assert.equal(formulas.goalRemaining(DA(200_000), DA(50_000)), DA(150_000));
    assert.equal(formulas.goalRemaining(DA(200_000), DA(220_000)), 0);
    assert.equal(formulas.monthsWithoutReturn({ target: DA(200_000), capital: DA(50_000), contribution: DA(10_000) }), 15);
    assert.equal(formulas.monthsWithoutReturn({ target: DA(200_000), capital: DA(50_000), contribution: DA(10_001) }), 15, 'rounded up: a part-month is a month');
    assert.equal(formulas.monthsWithoutReturn({ target: DA(200_000), capital: DA(50_000), contribution: 0 }), null);
    assert.equal(formulas.monthsWithoutReturn({ target: DA(200_000), capital: DA(250_000), contribution: DA(10_000) }), 0);
    assert.equal(formulas.paymentWithoutReturn({ target: DA(200_000), capital: DA(50_000), monthsLeft: 15 }), DA(10_000));
    assert.equal(formulas.paymentWithoutReturn({ target: DA(200_000), capital: DA(50_000), monthsLeft: 0 }), null);
  });
});

describe('compounding and inflation (F029-F034)', () => {
  test('F029 / F030 / F031: the total is the sum of its two parts', () => {
    const args = { initial: DA(100_000), payment: DA(10_000), rate: 0.005, periods: 24 };
    const lump = formulas.futureValueLumpSum(args);
    const payments = formulas.futureValuePayments(args);
    assert.equal(formulas.futureValueTotal(args), lump + payments);
    assert.ok(lump > args.initial, 'a positive return grows the capital');
    assert.ok(payments > args.payment * args.periods, 'payments earn a return too');
  });

  test('F030 with no return is exactly the payments added up', () => {
    assert.equal(formulas.futureValuePayments({ payment: DA(10_000), rate: 0, periods: 24 }), DA(240_000));
  });

  test('F032 computes the payment that really reaches the target', () => {
    const target = DA(2_000_000);
    const initial = DA(500_000);
    const rate = 0.004;
    const periods = 36;
    const payment = formulas.paymentWithReturn({ target, initial, rate, periods });
    const reached = formulas.futureValueTotal({ initial, payment, rate, periods });
    assert.ok(Math.abs(reached - target) < DA(10), `reached ${reached} for a target of ${target}`);
  });

  test('F032 refuses a zero return: the client says to use F028 there', () => {
    assert.equal(formulas.paymentWithReturn({ target: DA(100), initial: 0, rate: 0, periods: 12 }), null);
  });

  test('F033 / F034 inflation: a negative return is allowed in a simulation', () => {
    assert.equal(formulas.realValue({ nominalValue: DA(110_000), inflation: 0.1, years: 1 }), DA(100_000));
    assert.equal(formulas.realReturn(0.1, 0.1), 0);
    assert.ok(formulas.realReturn(0.02, 0.1) < 0, 'inflation above the return loses purchasing power');
    assert.ok(formulas.futureValueLumpSum({ initial: DA(100_000), rate: -0.02, periods: 12 }) < DA(100_000));
  });
});

describe('wealth, and the wall between real and fictional (F035-F040)', () => {
  const assets = [{ amount: DA(2_000_000), currency: 'DZD' }, { amount: DA(500_000), currency: 'DZD' }];
  const liabilities = [{ amount: DA(800_000), currency: 'DZD' }];

  test('F035 net worth = real assets - real debts', () => {
    assert.equal(formulas.netWorth({ assets, liabilities, currency: 'DZD' }), DA(1_700_000));
  });

  test('F036 / F037 allocation and concentration', () => {
    assert.equal(formulas.assetAllocation(DA(2_000_000), DA(2_500_000)), 0.8);
    assert.equal(formulas.maxConcentration([0.8, 0.2]), 0.8);
    assert.equal(formulas.maxConcentration([]), null);
  });

  test('F038 / F039 / F040 the paper portfolio computes on its own, and never reaches F035', () => {
    const positions = [{ quantity: 10, simulatedPrice: DA(1_500) }, { quantity: 5, simulatedPrice: DA(3_000) }];
    const value = formulas.paperPortfolioValue(positions);
    assert.equal(value, DA(30_000));
    const gain = formulas.paperGainLoss(value, DA(25_000));
    assert.equal(gain, DA(5_000));
    assert.equal(formulas.paperReturn(gain, DA(25_000)), 0.2);
    // The wall: the paper value is not an asset. Net worth is unchanged whether
    // the portfolio exists or not — the client forbids one total holding both.
    assert.equal(formulas.netWorth({ assets, liabilities, currency: 'DZD' }), DA(1_700_000));
  });
});

describe('shared spaces (F041-F044)', () => {
  test('F041 / F042 shares of a shared expense', () => {
    assert.deepEqual(formulas.equalShare(DA(3_000), 4), [DA(750), DA(750), DA(750), DA(750)]);
    assert.deepEqual(formulas.incomeProportionalShare(DA(3_000), [DA(100_000), DA(50_000)]), [DA(2_000), DA(1_000)]);
  });

  test('F043 a member balance is positive when the member is owed money', () => {
    assert.equal(formulas.sharedMemberBalance({ paidForGroup: DA(10_000), shareDue: DA(2_500) }), DA(7_500));
    assert.equal(formulas.sharedMemberBalance({ paidForGroup: 0, shareDue: DA(2_500) }), -DA(2_500));
    assert.equal(formulas.sharedMemberBalance({ paidForGroup: DA(10_000), shareDue: DA(2_500), settlementsReceived: DA(7_500) }), 0, 'once settled, the balance is zero');
  });

  test('F044 household contribution follows the incomes it is given', () => {
    assert.deepEqual(formulas.householdContribution(DA(90_000), [DA(120_000), DA(60_000)]), [DA(60_000), DA(30_000)]);
  });
});

describe('capacity, autonomy, recurring costs (F045-F050)', () => {
  test('F045 monthly provision of an annual expense', () => {
    assert.equal(formulas.monthlyProvision({ plannedAmount: DA(60_000), alreadyProvisioned: DA(0), monthsLeft: 6 }), DA(10_000));
    assert.equal(formulas.monthlyProvision({ plannedAmount: DA(60_000), alreadyProvisioned: DA(30_000), monthsLeft: 6 }), DA(5_000));
    assert.equal(formulas.monthlyProvision({ plannedAmount: DA(60_000), alreadyProvisioned: DA(0), monthsLeft: 0 }), null);
  });

  test('F046 / F047 savings capacity and student autonomy', () => {
    assert.equal(formulas.savingsCapacity({ income: DA(100_000), expenses: DA(60_000), instalments: DA(15_000), reservedMargin: DA(5_000) }), DA(20_000));
    assert.equal(formulas.studentAutonomy(DA(30_000), DA(60_000)), 0.5);
  });

  test('F048 a job offer is compared after its costs, not on salary alone', () => {
    const near = formulas.jobOfferNetValue({ net: DA(80_000), monetisableBenefits: DA(5_000), jobCosts: DA(3_000) });
    const far = formulas.jobOfferNetValue({ net: DA(85_000), monetisableBenefits: 0, jobCosts: DA(15_000) });
    assert.equal(near, DA(82_000));
    assert.equal(far, DA(70_000));
    assert.ok(near > far, 'the lower salary is worth more once travel is paid for');
  });

  test('F049 / F050 recurring cost and the cover of a shock', () => {
    assert.equal(formulas.normalizedRecurringCost(DA(1_200), 'annuel'), DA(100));
    assert.equal(formulas.shockCoverage(DA(300_000), DA(50_000)), 6);
    assert.equal(formulas.shockCoverage(DA(300_000), 0), null, 'no deficit: nothing to cover');
  });
});

describe('indices — none of them is a credit score (F051-F054)', () => {
  test('the four share one shape: weights in, weighted mean out', () => {
    const components = [{ score: 60, weight: 2 }, { score: 90, weight: 1 }];
    assert.equal(formulas.fundingReadinessIndex(components), 70);
    assert.equal(formulas.financialKnowledgeIndex(components), 70);
    assert.equal(formulas.financialHealthIndex(components), 70);
    assert.equal(formulas.optionFitScore(components), 70);
  });

  test('without weights nothing is scored: the engine holds no hidden coefficient', () => {
    for (const index of [formulas.fundingReadinessIndex, formulas.financialKnowledgeIndex, formulas.financialHealthIndex, formulas.optionFitScore]) {
      assert.equal(index([]), null);
      assert.equal(index(undefined), null);
      assert.equal(index([{ score: 50 }]), null, 'a component without its weight is refused');
    }
  });

  test('F053 stays partial when a dimension is missing', () => {
    assert.equal(formulas.financialHealthIndex([{ score: 80, weight: 1 }, { score: null, weight: 1 }]), 80);
  });
});

describe('freshness and impact (F055-F057)', () => {
  test('F055 the age of a value, in whole days', () => {
    const now = new Date('2026-10-09T12:00:00Z');
    assert.equal(formulas.dataAgeDays(new Date('2026-09-29T12:00:00Z'), now), 10);
    assert.equal(formulas.dataAgeDays(new Date('2026-10-09T11:00:00Z'), now), 0);
    assert.equal(formulas.dataAgeDays('2026-09-29', now), null, 'a string is not a date');
    assert.equal(formulas.dataAgeDays(new Date('nonsense'), now), null);
  });

  test('F056 shows what a new instalment would do, and says nothing about a lender', () => {
    const impact = formulas.newPaymentImpact({ livingAllowance: DA(45_000), payment: DA(12_000), currentDebtService: DA(15_000), netIncome: DA(100_000) });
    assert.deepEqual(impact, { livingAllowance: DA(33_000), effortRate: 0.27 });
    assert.equal(formulas.newPaymentImpact({ livingAllowance: DA(45_000), payment: DA(12_000), currentDebtService: DA(15_000), netIncome: 0 }).effortRate, null);
  });

  test('F057 gives the score but never invents the category', () => {
    const answers = [{ points: 3, weight: 2 }, { points: 1, weight: 1 }];
    assert.deepEqual(formulas.riskProfileScore(answers), { score: 7, category: null }, 'no thresholds yet (P6-01): no label');
    assert.deepEqual(formulas.riskProfileScore(answers, [{ upTo: 5, category: 'prudent' }, { upTo: 10, category: 'equilibre' }]), { score: 7, category: 'equilibre' });
    assert.equal(formulas.riskProfileScore([]), null);
    assert.equal(formulas.riskProfileScore(answers, [{ upTo: 3, category: 'prudent' }]).category, null, 'a score above every threshold is not forced into the last bucket');
  });
});

describe('algorithms (ALG-01 to ALG-04)', () => {
  test('ALG-01 repays the debts and reallocates each freed instalment', () => {
    const plan = algorithms.debtPayoffPlan({ debts: [{ id: 'a', principal: DA(10_000), monthlyRate: 0, minimumPayment: DA(5_000) }] });
    assert.equal(plan.completed, true);
    assert.equal(plan.months, 2);
    assert.equal(plan.totalPaid, DA(10_000));
    assert.equal(plan.totalInterest, 0);
    assert.deepEqual(plan.payoff, [{ id: 'a', month: 2 }]);
  });

  test('ALG-01 avalanche never costs more interest than snowball', () => {
    const debts = [
      { id: 'cher', principal: DA(80_000), monthlyRate: 0.03, minimumPayment: DA(1_000) },
      { id: 'petit', principal: DA(20_000), monthlyRate: 0.005, minimumPayment: DA(1_000) },
    ];
    const avalanche = algorithms.debtPayoffPlan({ debts, extraPayment: DA(4_000), strategy: 'avalanche' });
    const snowball = algorithms.debtPayoffPlan({ debts, extraPayment: DA(4_000), strategy: 'snowball' });
    assert.equal(avalanche.completed, true);
    assert.equal(snowball.completed, true);
    assert.ok(avalanche.totalInterest <= snowball.totalInterest, `${avalanche.totalInterest} vs ${snowball.totalInterest}`);
    assert.equal(avalanche.payoff.length, 2);
    assert.deepEqual(avalanche.payoff.map((p) => p.id).sort(), ['cher', 'petit']);
  });

  test('ALG-01 says so when the minimums do not even cover the interest', () => {
    const plan = algorithms.debtPayoffPlan({ debts: [{ id: 'a', principal: DA(1_000_000), monthlyRate: 0.05, minimumPayment: DA(100) }] });
    assert.equal(plan.completed, false);
    assert.equal(plan.months, null, 'no invented date');
    assert.equal(plan.remaining.length, 1);
  });

  test('ALG-01 refuses nonsense input', () => {
    assert.equal(algorithms.debtPayoffPlan({ debts: [] }), null);
    assert.equal(algorithms.debtPayoffPlan({ debts: [{ id: 'a', principal: DA(100), monthlyRate: 0, minimumPayment: 0 }] }), null);
    assert.equal(algorithms.debtPayoffPlan({ debts: [{ id: 'a', principal: DA(100), monthlyRate: 0, minimumPayment: DA(10) }], strategy: 'magique' }), null);
    assert.equal(
      algorithms.debtPayoffPlan({ debts: [{ id: 'a', principal: DA(100), monthlyRate: 0, minimumPayment: DA(10) }, { id: 'a', principal: DA(100), monthlyRate: 0, minimumPayment: DA(10) }] }),
      null,
      'two debts cannot share an id',
    );
  });

  test('ALG-02 settles everyone without changing a single net position', () => {
    const balances = [{ member: 'A', balance: DA(500) }, { member: 'B', balance: -DA(300) }, { member: 'C', balance: -DA(200) }];
    const transfers = algorithms.minimalSettlements(balances);
    assert.equal(transfers.length, 2);
    for (const { member, balance } of balances) {
      const paid = transfers.filter((t) => t.from === member).reduce((sum, t) => sum + t.amount, 0);
      const received = transfers.filter((t) => t.to === member).reduce((sum, t) => sum + t.amount, 0);
      assert.equal(received - paid, balance, `${member} keeps their net position`);
    }
  });

  test('ALG-02 needs fewer transfers than paying everyone back one by one', () => {
    const balances = [
      { member: 'A', balance: DA(300) },
      { member: 'B', balance: DA(100) },
      { member: 'C', balance: -DA(200) },
      { member: 'D', balance: -DA(200) },
    ];
    const transfers = algorithms.minimalSettlements(balances);
    assert.ok(transfers.length <= 3, `${transfers.length} transfers`);
    assert.equal(transfers.reduce((sum, t) => sum + t.amount, 0), DA(400));
  });

  test('ALG-02 refuses balances that do not add up to zero', () => {
    assert.equal(algorithms.minimalSettlements([{ member: 'A', balance: DA(500) }]), null);
    assert.equal(algorithms.minimalSettlements([]), null);
    assert.deepEqual(algorithms.minimalSettlements([{ member: 'A', balance: 0 }]), [], 'all square: nothing to transfer');
  });

  test('ALG-03 agrees with F027 when there is no return', () => {
    const args = { capital: DA(50_000), target: DA(200_000), contribution: DA(10_000) };
    assert.equal(algorithms.goalReachDate({ ...args, monthlyRate: 0 }).months, formulas.monthsWithoutReturn(args));
  });

  test('ALG-03 reaches the target sooner with a return, and says when it never will', () => {
    const args = { capital: DA(50_000), target: DA(200_000), contribution: DA(10_000) };
    const withReturn = algorithms.goalReachDate({ ...args, monthlyRate: 0.01 });
    const without = algorithms.goalReachDate({ ...args, monthlyRate: 0 });
    assert.ok(withReturn.months < without.months);
    assert.ok(withReturn.finalCapital >= args.target);
    const never = algorithms.goalReachDate({ capital: 0, target: DA(200_000), contribution: 0, monthlyRate: 0 });
    assert.deepEqual(never, { months: null, completed: false, finalCapital: 0 });
    assert.deepEqual(algorithms.goalReachDate({ capital: DA(200_000), target: DA(200_000), contribution: 0 }), { months: 0, completed: true, finalCapital: DA(200_000) });
  });

  test('ALG-03 stops at the horizon instead of looping forever', () => {
    const slow = algorithms.goalReachDate({ capital: 0, target: Number.MAX_SAFE_INTEGER - 1, contribution: 1, monthlyRate: 0 });
    assert.equal(slow.completed, false);
    assert.ok(slow.finalCapital <= MAX_ITERATION_MONTHS);
  });

  test('ALG-04 proposes a recurrence and never confirms it itself', () => {
    const day = 86_400_000;
    const base = new Date('2026-07-01T00:00:00Z').getTime();
    const transactions = [0, 30, 60].map((offset) => ({ label: 'Abonnement Internet', amount: DA(2_500), date: new Date(base + offset * day) }));
    const [candidate] = algorithms.detectRecurrences(transactions);
    assert.equal(candidate.amount, DA(2_500));
    assert.equal(candidate.occurrences, 3);
    assert.equal(candidate.averageIntervalDays, 30);
    assert.equal(candidate.confirmed, false, 'the user confirms, the server never decides');
    assert.equal(candidate.nextExpected.toISOString(), new Date(base + 90 * day).toISOString());
  });

  test('ALG-04 ignores what is not regular enough', () => {
    const day = 86_400_000;
    const base = new Date('2026-07-01T00:00:00Z').getTime();
    const varying = [0, 30, 60].map((offset, index) => ({ label: 'Courses', amount: DA(2_000 + index * 900), date: new Date(base + offset * day) }));
    assert.deepEqual(algorithms.detectRecurrences(varying), [], 'amounts too far apart');
    const irregular = [0, 10, 75].map((offset) => ({ label: 'Divers', amount: DA(1_000), date: new Date(base + offset * day) }));
    assert.deepEqual(algorithms.detectRecurrences(irregular), [], 'intervals too far apart');
    const twice = [0, 30].map((offset) => ({ label: 'Deux fois', amount: DA(1_000), date: new Date(base + offset * day) }));
    assert.deepEqual(algorithms.detectRecurrences(twice), [], 'two occurrences are not a habit');
    assert.deepEqual(algorithms.detectRecurrences([{ label: '   ', amount: DA(1_000), date: new Date(base) }]), [], 'never grouped on the amount alone');
    assert.equal(algorithms.detectRecurrences([{ label: 'x', amount: 10.5, date: new Date(base) }]), null);
  });
});

describe('the answer contract of every critical calculation', () => {
  test('carries the fields the client requires, with the currency as the unit', () => {
    const now = new Date('2026-10-09T08:30:00Z');
    const answer = computed('F006', DA(45_000), { inputs: { netIncome: DA(100_000) }, currency: 'DZD', now });
    assert.deepEqual(answer, {
      resultat: DA(45_000),
      unite: 'DZD',
      formule_id: 'F006',
      formule_version: formulaById('F006').version,
      entrees_snapshot: { netIncome: DA(100_000) },
      calcule_le: '2026-10-09T08:30:00.000Z',
    });
    assert.equal(isNotComputed(answer), false);
  });

  test('a rate is a decimal, to be displayed as a percentage', () => {
    assert.equal(computed('F008', 0.15, {}).unite, 'ratio');
    assert.equal(computed('F014', 3, {}).unite, 'mois');
    assert.equal(computed('F053', 72, {}).unite, 'points');
  });

  test('"not computable" explains itself with the condition the client wrote', () => {
    const answer = computed('F008', null, { inputs: { netIncome: 0 } });
    assert.equal(answer.resultat, null);
    assert.deepEqual(answer.avertissements, ['Si revenus > 0']);
    assert.equal(isNotComputed(answer), true);
  });

  test('hypotheses, warnings and sources only appear when they apply', () => {
    const plain = computed('F004', DA(30_000), { currency: 'DZD' });
    assert.ok(!('hypotheses' in plain) && !('avertissements' in plain) && !('versions_sources' in plain));
    const simulation = computed('F031', DA(500_000), {
      currency: 'DZD',
      hypotheses: { rendement: 0.005, horizon: 24 },
      warnings: ['Épargne déclarée, non vérifiée'],
      sources: { comparateur: '2026-10-04' },
    });
    assert.deepEqual(simulation.hypotheses, { rendement: 0.005, horizon: 24 });
    assert.deepEqual(simulation.avertissements, ['Épargne déclarée, non vérifiée']);
    assert.deepEqual(simulation.versions_sources, { comparateur: '2026-10-04' });
  });

  test('refuses to answer with a money value whose currency is unknown, or an unknown formula', () => {
    assert.throws(() => computed('F004', DA(10), {}), /currency/);
    assert.throws(() => computed('F999', 1, {}), /Unknown formula/);
  });

  test('works for the algorithms too', () => {
    const answer = computed('ALG-03', { months: 15, completed: true }, { inputs: { target: DA(200_000) } });
    assert.equal(answer.formule_id, 'ALG-03');
    assert.equal(answer.unite, 'composite');
    assert.equal(answer.formule_version, 1);
  });

  test('every formula of the catalogue can be wrapped, computed or not', () => {
    for (const formula of FORMULAS) {
      const answer = computed(formula.id, null, { currency: 'DZD' });
      assert.equal(answer.formule_id, formula.id);
      assert.ok(answer.calcule_le.endsWith('Z'));
      assert.ok(isAmount(DA(1)));
    }
  });
});
