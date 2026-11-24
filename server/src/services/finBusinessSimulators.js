/**
 * The business simulators (P13-05, lot F, 2026-11-24): the client's tab
 * 14_SIMULATEURS (178 rows) comes down to some thirty distinct management
 * calculations. Each is here once, as a PURE function with the description of
 * its inputs, so that the screen builds its form from it and the server alone
 * computes (CNV-08: « calculs centralisés »).
 *
 * A simulation is a hypothesis: it creates, changes and stores nothing
 * (CNV-12). A result that cannot be computed (division by zero, missing
 * input) is `null`, never 0 (CNV-04). No regulatory rate is assumed: the
 * simulators that need one read the value the administration CONFIRMED, and
 * say « rule not published » otherwise (DEC-001).
 *
 * Units of inputs and outputs: `money` (minor units, centimes), `ratio`
 * (decimal, 0.4 = 40 %), `number`, `days`, `months`, `years`.
 */

const n = (value) => (value === null || value === undefined || Number.isNaN(Number(value)) ? null : Number(value));
const div = (a, b) => (a === null || b === null || b === 0 ? null : a / b);
const round = (value) => (value === null ? null : Math.round(value));
const out = (key, unit, value) => ({ key, unit, value: value === null || value === undefined || !Number.isFinite(value) ? null : unit === 'money' ? Math.round(value) : Math.round(value * 10000) / 10000 });

// Each simulator: its code, the inputs it asks, the function that computes.
export const BUSINESS_SIMULATORS = [
  {
    code: 'disposable',
    inputs: [['cashIn', 'money'], ['cashOut', 'money'], ['futureCharges', 'money'], ['reserve', 'money']],
    run: ({ cashIn, cashOut, futureCharges = 0, reserve = 0 }) => [out('freeIncome', 'money', cashIn - cashOut - futureCharges - reserve)],
  },
  {
    code: 'serviceMargin',
    inputs: [['price', 'money'], ['directCost', 'money'], ['volume', 'number'], ['hours', 'number', true]],
    run: ({ price, directCost, volume, hours }) => {
      const contribution = (price - directCost) * volume;
      return [out('contribution', 'money', contribution), out('marginRate', 'ratio', div(price - directCost, price)), out('hourlyIncome', 'money', hours ? div(contribution, hours) : null)];
    },
  },
  {
    code: 'breakEven',
    inputs: [['fixedCosts', 'money'], ['price', 'money'], ['variableCost', 'money']],
    run: ({ fixedCosts, price, variableCost }) => {
      const unit = price - variableCost;
      const rate = div(unit, price);
      return [out('contributionRate', 'ratio', rate), out('breakEvenRevenue', 'money', rate !== null && rate > 0 ? fixedCosts / rate : null), out('breakEvenUnits', 'number', unit > 0 ? Math.ceil(fixedCosts / unit) : null)];
    },
  },
  {
    code: 'revenueTarget',
    inputs: [['fixedCosts', 'money'], ['targetProfit', 'money'], ['contributionRate', 'ratio']],
    run: ({ fixedCosts, targetProfit, contributionRate }) => [out('revenueNeeded', 'money', contributionRate > 0 ? (fixedCosts + targetProfit) / contributionRate : null)],
  },
  {
    code: 'workingCapital',
    inputs: [['stock', 'money'], ['work', 'money', true], ['receivables', 'money'], ['payables', 'money']],
    run: ({ stock, work = 0, receivables, payables }) => [out('workingCapital', 'money', stock + (work ?? 0) + receivables - payables)],
  },
  {
    code: 'cashCycle',
    inputs: [['receivables', 'money'], ['creditSales', 'money'], ['averageStock', 'money'], ['costOfSales', 'money'], ['payables', 'money'], ['creditPurchases', 'money'], ['days', 'days']],
    run: ({ receivables, creditSales, averageStock, costOfSales, payables, creditPurchases, days }) => {
      const dso = div(receivables, creditSales);
      const dio = div(averageStock, costOfSales);
      const dpo = div(payables, creditPurchases);
      const d = (x) => (x === null ? null : x * days);
      return [out('dso', 'days', d(dso)), out('dio', 'days', d(dio)), out('dpo', 'days', d(dpo)), out('cycle', 'days', dso === null || dio === null || dpo === null ? null : d(dso) + d(dio) - d(dpo))];
    },
  },
  {
    code: 'cashForecast',
    inputs: [['opening', 'money'], ['inflowPerPeriod', 'money'], ['outflowPerPeriod', 'money'], ['periods', 'number'], ['delayPeriods', 'number', true]],
    run: ({ opening, inflowPerPeriod, outflowPerPeriod, periods, delayPeriods = 0 }) => {
      // Inflows shifted by the delay (a late client), outflows on time: the lowest point and when.
      let cash = opening;
      let lowest = opening;
      let first = null;
      const count = Math.min(Math.max(Math.round(periods), 1), 104);
      for (let i = 1; i <= count; i += 1) {
        cash += (i > (delayPeriods ?? 0) ? inflowPerPeriod : 0) - outflowPerPeriod;
        if (cash < lowest) lowest = cash;
        if (cash < 0 && first === null) first = i;
      }
      return [out('closing', 'money', cash), out('lowest', 'money', lowest), out('firstNegativePeriod', 'number', first), out('need', 'money', Math.max(0, -lowest))];
    },
  },
  {
    code: 'runway',
    inputs: [['cash', 'money'], ['monthlyBurn', 'money']],
    run: ({ cash, monthlyBurn }) => [out('runwayMonths', 'months', monthlyBurn > 0 ? cash / monthlyBurn : null)],
  },
  {
    code: 'fundingNeed',
    inputs: [['lowestPlannedCash', 'money'], ['safetyMargin', 'money']],
    run: ({ lowestPlannedCash, safetyMargin }) => [out('need', 'money', Math.max(0, -lowestPlannedCash) + safetyMargin)],
  },
  {
    code: 'unitEconomics',
    inputs: [['marketingSpend', 'money'], ['newClients', 'number'], ['clientsLost', 'number'], ['clientBase', 'number'], ['monthlyContribution', 'money']],
    run: ({ marketingSpend, newClients, clientsLost, clientBase, monthlyContribution }) => {
      const cac = div(marketingSpend, newClients);
      const churn = div(clientsLost, clientBase);
      const lifetime = churn ? 1 / churn : null;
      const ltv = lifetime === null ? null : monthlyContribution * lifetime;
      return [out('cac', 'money', cac), out('churn', 'ratio', churn), out('lifetimeMonths', 'months', lifetime), out('ltv', 'money', ltv), out('ltvToCac', 'number', div(ltv, cac))];
    },
  },
  {
    code: 'growth',
    inputs: [['current', 'money'], ['previous', 'money']],
    run: ({ current, previous }) => [out('growth', 'ratio', div(current - previous, previous))],
  },
  {
    code: 'debtCoverage',
    inputs: [['cashAvailable', 'money'], ['debtService', 'money']],
    run: ({ cashAvailable, debtService }) => [out('dscr', 'number', div(cashAvailable, debtService))],
  },
  {
    code: 'loan',
    inputs: [['principal', 'money'], ['annualRate', 'ratio'], ['months', 'months']],
    run: ({ principal, annualRate, months }) => {
      // The annuity of the client's test case: 1 000 000 at 6 % over 60 months = 19 332.80. The rate is the person's hypothesis.
      const r = annualRate / 12;
      const payment = months > 0 ? (r === 0 ? principal / months : (principal * r) / (1 - (1 + r) ** -months)) : null;
      return [out('monthlyPayment', 'money', payment), out('totalCost', 'money', payment === null ? null : payment * months - principal)];
    },
  },
  {
    code: 'leaseVsBuy',
    inputs: [['price', 'money'], ['resaleValue', 'money'], ['leasePayment', 'money'], ['leaseMonths', 'months'], ['leaseResidual', 'money'], ['loanRate', 'ratio']],
    run: ({ price, resaleValue, leasePayment, leaseMonths, leaseResidual, loanRate }) => {
      const r = loanRate / 12;
      const loanPayment = leaseMonths > 0 ? (r === 0 ? price / leaseMonths : (price * r) / (1 - (1 + r) ** -leaseMonths)) : null;
      return [
        out('cashCost', 'money', price - resaleValue),
        out('loanCost', 'money', loanPayment === null ? null : loanPayment * leaseMonths - resaleValue),
        out('leaseCost', 'money', leasePayment * leaseMonths + leaseResidual - resaleValue),
        out('cashUpFront', 'money', price),
      ];
    },
  },
  {
    code: 'invoiceFinancing',
    inputs: [['eligible', 'money'], ['advanceRate', 'ratio'], ['feeRate', 'ratio']],
    // The client's case TST-00037: 8 M × 80 % = 6,4 M; fees 1 % of 8 M = 80 000; net 6,32 M.
    run: ({ eligible, advanceRate, feeRate }) => {
      const advance = eligible * advanceRate;
      const fees = eligible * feeRate;
      return [out('advance', 'money', advance), out('fees', 'money', fees), out('net', 'money', advance - fees)];
    },
  },
  {
    code: 'landedCost',
    inputs: [['foreignPrice', 'money'], ['rate', 'number'], ['fees', 'money'], ['units', 'number'], ['lostUnits', 'number', true]],
    run: ({ foreignPrice, rate, fees, units, lostUnits = 0 }) => {
      const total = foreignPrice * rate + fees;
      const net = units - (lostUnits ?? 0);
      return [out('landedTotal', 'money', total), out('landedUnit', 'money', net > 0 ? total / net : null)];
    },
  },
  {
    code: 'fxStress',
    inputs: [['foreignAmount', 'money'], ['rate', 'number'], ['variation', 'ratio']],
    run: ({ foreignAmount, rate, variation }) => [out('value', 'money', foreignAmount * rate), out('stressedValue', 'money', foreignAmount * rate * (1 + variation)), out('effect', 'money', foreignAmount * rate * variation)],
  },
  {
    code: 'pricing',
    inputs: [['unitCost', 'money'], ['targetMargin', 'ratio'], ['sellingCost', 'money', true]],
    run: ({ unitCost, targetMargin, sellingCost = 0 }) => {
      const cost = unitCost + (sellingCost ?? 0);
      return [out('priceOnMargin', 'money', targetMargin < 1 ? cost / (1 - targetMargin) : null), out('priceOnMarkup', 'money', cost * (1 + targetMargin)), out('floorPrice', 'money', cost)];
    },
  },
  {
    code: 'payback',
    inputs: [['investment', 'money'], ['annualCashFlow', 'money'], ['years', 'years'], ['discountRate', 'ratio']],
    run: ({ investment, annualCashFlow, years, discountRate }) => {
      let npv = -investment;
      for (let y = 1; y <= Math.min(Math.round(years), 50); y += 1) npv += annualCashFlow / (1 + discountRate) ** y;
      return [out('paybackYears', 'years', annualCashFlow > 0 ? investment / annualCashFlow : null), out('npv', 'money', npv)];
    },
  },
  {
    code: 'stockTurnover',
    inputs: [['costOfSales', 'money'], ['averageStock', 'money'], ['days', 'days']],
    run: ({ costOfSales, averageStock, days }) => {
      const turns = div(costOfSales, averageStock);
      return [out('turns', 'number', turns), out('dio', 'days', turns ? days / turns : null)];
    },
  },
  {
    code: 'oee',
    inputs: [['availability', 'ratio'], ['performance', 'ratio'], ['quality', 'ratio']],
    run: ({ availability, performance, quality }) => [out('oee', 'ratio', availability * performance * quality)],
  },
  {
    code: 'capacity',
    inputs: [['nominal', 'number'], ['used', 'number']],
    run: ({ nominal, used }) => [out('free', 'number', nominal - used), out('loadRate', 'ratio', div(used, nominal))],
  },
  {
    code: 'industrialCost',
    inputs: [['totalCosts', 'money'], ['unitsProduced', 'number'], ['unitsRejected', 'number']],
    run: ({ totalCosts, unitsProduced, unitsRejected }) => {
      const good = unitsProduced - unitsRejected;
      return [out('unitCost', 'money', good > 0 ? totalCosts / good : null), out('scrapRate', 'ratio', div(unitsRejected, unitsProduced))];
    },
  },
  {
    code: 'inflation',
    inputs: [['nominal', 'money'], ['inflationRate', 'ratio'], ['years', 'years']],
    run: ({ nominal, inflationRate, years }) => [out('realValue', 'money', nominal / (1 + inflationRate) ** years), out('priceToKeep', 'money', nominal * (1 + inflationRate) ** years)],
  },
  {
    code: 'earnedValue',
    inputs: [['budget', 'money'], ['percentDone', 'ratio'], ['actualCost', 'money'], ['plannedValue', 'money']],
    run: ({ budget, percentDone, actualCost, plannedValue }) => {
      const ev = budget * percentDone;
      const cpi = div(ev, actualCost);
      return [out('earnedValue', 'money', ev), out('cpi', 'number', cpi), out('spi', 'number', div(ev, plannedValue)), out('estimateAtCompletion', 'money', cpi ? budget / cpi : null)];
    },
  },
  {
    code: 'liquidity',
    inputs: [['currentAssets', 'money'], ['currentLiabilities', 'money'], ['financialDebt', 'money', true], ['equity', 'money', true]],
    run: ({ currentAssets, currentLiabilities, financialDebt, equity }) => [out('currentRatio', 'number', div(currentAssets, currentLiabilities)), out('gearing', 'number', financialDebt === null || equity === null ? null : div(financialDebt, equity))],
  },
  {
    code: 'projectBudget',
    inputs: [['budget', 'money'], ['validatedSpend', 'money'], ['confirmedFunds', 'money']],
    run: ({ budget, validatedSpend, confirmedFunds }) => [out('remaining', 'money', budget - validatedSpend), out('toFinance', 'money', Math.max(0, budget - validatedSpend - confirmedFunds)), out('consumed', 'ratio', div(validatedSpend, budget))],
  },
  {
    code: 'netWorth',
    inputs: [['assets', 'money'], ['debts', 'money']],
    run: ({ assets, debts }) => [out('netWorth', 'money', assets - debts)],
  },
  {
    code: 'budgetVsActual',
    inputs: [['budget', 'money'], ['actual', 'money']],
    run: ({ budget, actual }) => [out('gap', 'money', actual - budget), out('consumed', 'ratio', div(actual, budget))],
  },
  {
    // International payments and diaspora transfers (ECR-0363, DEC-016): what
    // an option costs — percentage, fixed fee, spread on the rate. FINCLUDIA
    // compares; it transfers nothing.
    code: 'transferCost',
    inputs: [['amount', 'money'], ['feeRate', 'ratio'], ['fixedFee', 'money'], ['rateSpread', 'ratio']],
    run: ({ amount, feeRate, fixedFee, rateSpread }) => {
      const cost = amount * feeRate + fixedFee + amount * rateSpread;
      return [out('totalCost', 'money', cost), out('costRate', 'ratio', div(cost, amount)), out('received', 'money', amount - cost)];
    },
  },
  {
    code: 'invoiceBalance',
    inputs: [['invoiceTotal', 'money'], ['paid', 'money'], ['credited', 'money']],
    run: ({ invoiceTotal, paid, credited }) => [out('outstanding', 'money', invoiceTotal - paid - credited)],
  },
  {
    code: 'dilution',
    inputs: [['preMoney', 'money'], ['raise', 'money'], ['founderShare', 'ratio']],
    run: ({ preMoney, raise, founderShare }) => {
      const post = preMoney + raise;
      const investor = div(raise, post);
      return [out('postMoney', 'money', post), out('investorShare', 'ratio', investor), out('founderShareAfter', 'ratio', investor === null ? null : founderShare * (1 - investor))];
    },
  },
  {
    code: 'completeness',
    inputs: [['done', 'number'], ['required', 'number']],
    run: ({ done, required }) => [out('completeness', 'ratio', div(done, required))],
  },
  {
    code: 'regulatoryProvision',
    regulatory: 'PARM-002',
    inputs: [['base', 'money']],
    // DEC-001: the rate is the one the administration confirmed, or nothing.
    run: ({ base }, { rate }) => [out('provision', 'money', rate === null ? null : base * rate)],
  },
];

export const SIMULATOR_CODES = BUSINESS_SIMULATORS.map((s) => s.code);
export const simulatorByCode = (code) => BUSINESS_SIMULATORS.find((s) => s.code === code) ?? null;

/** Runs one simulator on its inputs. Missing required inputs make every output `null`. */
export function runSimulator(code, raw = {}, { rate = null } = {}) {
  const simulator = simulatorByCode(code);
  if (!simulator) return null;
  const inputs = {};
  const missing = [];
  for (const [key, , optional] of simulator.inputs) {
    const value = n(raw[key]);
    if (value === null && !optional) missing.push(key);
    inputs[key] = value;
  }
  if (missing.length > 0) {
    return { code, missing, outputs: simulator.run(Object.fromEntries(simulator.inputs.map(([k]) => [k, 0])), { rate }).map((o) => ({ ...o, value: null })) };
  }
  const outputs = simulator.run(inputs, { rate });
  return {
    code,
    missing: [],
    outputs,
    ...(simulator.regulatory ? { regleNonPubliee: rate === null } : {}),
  };
}

// The comparators of 15_COMPARATEURS that are « the same simulator on two or
// three options » (CMP-001, 002, 003, 006, 007, 009, 011): the screen runs the
// simulator once per option and lays the results side by side.
export const BUSINESS_COMPARATORS = [
  { code: 'equipmentFinancing', simulator: 'leaseVsBuy', options: 1, ref: ['CMP-001', 'CMP-006'] },
  { code: 'twoPrices', simulator: 'serviceMargin', options: 2, ref: ['CMP-002', 'CMP-003'] },
  { code: 'twoSuppliers', simulator: 'landedCost', options: 2, ref: ['CMP-009'] },
  { code: 'receivablesFinancing', simulator: 'invoiceFinancing', options: 2, ref: ['CMP-007', 'CMP-011'] },
  { code: 'twoLoans', simulator: 'loan', options: 2, ref: ['CMP-006'] },
  { code: 'investOptions', simulator: 'payback', options: 3, ref: ['CMP-008'] },
];

/**
 * Where each of the 178 rows of 14_SIMULATEURS goes: one of the simulators
 * above, found by the words of its name. A row none of them covers is said,
 * with its name, rather than silently dropped.
 */
const MAPPING = [
  [/patrimoine/i, 'netWorth'],
  [/ifu|auto-entrepreneur activit/i, 'regulatoryProvision'],
  [/facture et règlement/i, 'invoiceBalance'],
  [/factur.*financ|affacturage|créances.*financ|mobilis/i, 'invoiceFinancing'],
  [/leasing|location|crédit-bail|équipement|achat matériel/i, 'leaseVsBuy'],
  [/crédit|emprunt|mensualit|dette et capacit|finance islamique/i, 'loan'],
  [/dette|dscr|service de dette/i, 'debtCoverage'],
  [/paiement.*(international|extérieur)|transfert/i, 'transferCost'],
  [/coût rendu|import|achat extérieur/i, 'landedCost'],
  [/change|devise|cours d.achat/i, 'fxStress'],
  [/bfr|fonds (de )?roulement/i, 'workingCapital'],
  [/budget.*(réalis|activit|12 mois)|plan budget/i, 'budgetVsActual'],
  [/cycle|délai moyen|dso|dpo/i, 'cashCycle'],
  [/trésorerie|caisse|cash|retard paiement|prévision|forecast|scénarios variables/i, 'cashForecast'],
  [/autonomie|runway/i, 'runway'],
  [/valorisation|dilution|capital risque|exposition investisseur/i, 'dilution'],
  [/besoin.*financ|levée|financement|plan de création/i, 'fundingNeed'],
  [/acquisition|attrition|valeur client|saas|économie unitaire|cac|ltv|mrr/i, 'unitEconomics'],
  [/croissance/i, 'growth'],
  [/seuil/i, 'breakEven'],
  [/objectif ca|chiffre d'affaires cible/i, 'revenueTarget'],
  [/prix|tarif/i, 'pricing'],
  [/marge|prestation|mission|rentabilit|cabinet|productivité/i, 'serviceMargin'],
  [/revenu.*disponible|revenu libre/i, 'disposable'],
  [/investissement|récupération|van|rénov|énergétique|actualisation/i, 'payback'],
  [/rotation|stock|réapprovisionnement/i, 'stockTurnover'],
  [/trs|efficacité/i, 'oee'],
  [/capacité/i, 'capacity'],
  [/coût de revient|coût industriel|coût unitaire|rebut|fabrication/i, 'industrialCost'],
  [/inflation/i, 'inflation'],
  [/valeur acquise|jalon|retard/i, 'earnedValue'],
  [/budget projet|projet/i, 'projectBudget'],
  [/readiness|préparation|complétude/i, 'completeness'],
  [/liquidit|ratio/i, 'liquidity'],
];

// What is not simulated here, and why — said on screen rather than dropped.
const NOT_HERE = [
  [/paie|salari|recrutement|congés|effectif|masse salariale|cnas|charges employeur/i, 'payroll'],
  [/tva|irg|bnc|casnos|ibs|régimes|conformité|écritures|provision|cotisation|fiscal|social/i, 'regulatory'],
  [/incoterm/i, 'elsewhere'],
];

export function classifyWorkbookSimulator(name) {
  for (const [pattern, code] of MAPPING) if (pattern.test(name)) return { code };
  for (const [pattern, reason] of NOT_HERE) if (pattern.test(name)) return { reason };
  return { reason: 'notYet' };
}

export function mapWorkbookSimulator(name) {
  return classifyWorkbookSimulator(name).code ?? null;
}
