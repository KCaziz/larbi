// FINCLUDIA simulators, tab `09_Calculateurs` of the client's workbook. The
// client lists 30 calculators; this file holds the 18 that need no data the
// client still owes us: lot 1 (P4-10, budget / savings / goals / inflation) and
// lot 2 (P4-11, debt and credit).
//
// A simulator is a NAMED COMPOSITION of catalogued formulas, nothing more: it
// reads no stored data, keeps no state, and every value it returns carries the
// formula that produced it (services/finance/contract.js). That is what lets the
// interface answer "Pourquoi ?" on any figure without asking the server again.
//
// `fields` describes the form the interface must draw. The interface renders
// whatever the server declares here, so a new input is one line in this file
// instead of a change on both sides. Labels are NOT here: they are translation
// keys (`simulators.<key>.fields.<field>`), per the project's i18n rule.
//   money : an integer amount in the currency's smallest unit (centimes)
//   rate  : a decimal rate (0.05 = 5 %), may be negative in a simulation
//   count : a whole number of months, days or units
//   text  : a short free label, only to name a row the user added
//   list  : a repeated group of the above (`item`), for the calculators the
//           client describes with a "liste de dettes" rather than fixed slots
// `min`/`max` are only bounds the client states or arithmetic requires; nothing
// is invented as a "reasonable" default.
//
// `default` exists for the one case where 0 would be absurd and silence worse:
// the number of periods per year of a credit. The client's F020 requires the
// convention to be STATED, so it is an input the user can see and change rather
// than a 12 buried in the code.

// `example` is the illustrative set of values the empty state of the workshop
// offers (P4-16, the client's "Catalogue de simulateurs et exemples"). They are
// ROUND, obviously illustrative figures, and the interface loads them into the
// form so the person can see what a simulator does before typing anything. They
// are not a recommendation, a market figure or a default: nothing is computed
// from them unless the person asks.
const da = (units) => units * 100;

const money = (key, extra = {}) => ({ key, type: 'money', min: 0, ...extra });
const count = (key, extra = {}) => ({ key, type: 'count', min: 0, ...extra });
const rate = (key, extra = {}) => ({ key, type: 'rate', ...extra });
const text = (key, extra = {}) => ({ key, type: 'text', maxLength: 60, ...extra });
const list = (key, item, extra = {}) => ({ key, type: 'list', item, minItems: 1, maxItems: 20, ...extra });

export const SIMULATOR_FIELD_TYPES = ['money', 'rate', 'count', 'text', 'list'];

// Monthly credit, the convention of every calculator here. Named so the two
// places that need it cannot disagree.
const MONTHLY_PERIODS = 12;
const periodsPerYear = () => count('periodsPerYear', { min: 1, max: 365, default: MONTHLY_PERIODS });

// `publics` repeats the client's "Publics" column. It is INFORMATIVE only: the
// calculators read no personal data, so none of them is restricted by it — the
// client's own C18 says the simulation workshop works in discovery mode, without
// a profile. Access is decided once, in constants/tools.js.
export const SIMULATORS = [
  {
    key: 'budget-mensuel',
    example: { plannedIncome: da(80_000), fixedExpenses: da(35_000), variableExpenses: da(20_000), debtInstalments: da(8_000), plannedSavings: da(10_000) },
    calculator: 'CAL-01',
    formulas: ['F002', 'F003', 'F004', 'F005', 'F006', 'F007', 'F008', 'F009'],
    publics: ['tous'],
    fields: [
      money('plannedIncome', { required: true }),
      money('fixedExpenses', { required: true }),
      money('variableExpenses', { required: true }),
      money('debtInstalments'),
      money('plannedSavings'),
    ],
  },
  {
    key: 'budget-fin-de-mois',
    example: { currentBalance: da(18_000), remainingDays: 10, remainingBills: da(6_000), dailySpendingReference: da(1_200) },
    calculator: 'CAL-02',
    formulas: ['F012', 'F013'],
    publics: ['etudiant', 'jeune_actif', 'salarie'],
    fields: [
      money('currentBalance', { required: true, min: undefined }),
      count('remainingDays', { required: true, min: 1 }),
      money('remainingBills'),
      money('dailySpendingReference'),
    ],
  },
  {
    key: 'enveloppe',
    example: { categoryBudget: da(20_000), consumed: da(12_000), daysElapsed: 18, daysInPeriod: 30 },
    calculator: 'CAL-03',
    formulas: ['F009', 'F010', 'F011'],
    publics: ['tous'],
    fields: [
      money('categoryBudget', { required: true }),
      money('consumed', { required: true }),
      count('daysElapsed', { required: true, min: 1 }),
      count('daysInPeriod', { required: true, min: 1 }),
    ],
  },
  {
    key: 'capacite-epargne',
    example: { income: da(90_000), expenses: da(55_000), instalments: da(10_000), reservedMargin: da(5_000) },
    calculator: 'CAL-04',
    formulas: ['F001', 'F004', 'F006', 'F008', 'F046'],
    publics: ['etudiant', 'jeune_actif', 'salarie'],
    fields: [
      money('income', { required: true }),
      money('expenses', { required: true }),
      money('instalments'),
      money('reservedMargin'),
    ],
  },
  {
    key: 'reserve-securite',
    example: { liquidSavings: da(150_000), essentialMonthlyExpenses: da(50_000), targetMonths: 6, monthlyContribution: da(10_000) },
    calculator: 'CAL-05',
    formulas: ['F014', 'F015', 'F016', 'F027'],
    publics: ['etudiant', 'jeune_actif', 'salarie'],
    fields: [
      money('liquidSavings', { required: true }),
      money('essentialMonthlyExpenses', { required: true }),
      count('targetMonths', { required: true, min: 1 }),
      money('monthlyContribution'),
    ],
  },
  {
    key: 'objectif-sans-rendement',
    example: { target: da(600_000), capital: da(100_000), contribution: da(20_000), monthsLeft: 24 },
    calculator: 'CAL-06',
    formulas: ['F025', 'F026', 'F027', 'F028'],
    publics: ['tous'],
    fields: [
      money('target', { required: true, min: 1 }),
      money('capital'),
      money('contribution'),
      count('monthsLeft'),
    ],
  },
  {
    key: 'objectif-avec-rendement',
    example: { target: da(2_000_000), capital: da(500_000), contribution: da(20_000), months: 60, monthlyRate: 0.004 },
    calculator: 'CAL-07',
    formulas: ['F026', 'F029', 'F030', 'F031', 'F032'],
    publics: ['etudiant_avance', 'jeune_actif', 'salarie', 'epargnant'],
    fields: [
      money('target', { required: true, min: 1 }),
      money('capital'),
      money('contribution'),
      count('months', { required: true, min: 1 }),
      rate('monthlyRate', { required: true }),
    ],
  },
  {
    key: 'inflation',
    example: { nominalValue: da(1_000_000), inflation: 0.05, years: 10, nominalReturn: 0.03 },
    calculator: 'CAL-08',
    formulas: ['F033', 'F034'],
    publics: ['tous'],
    fields: [
      money('nominalValue', { required: true, min: 1 }),
      rate('inflation', { required: true }),
      count('years', { required: true, min: 1 }),
      rate('nominalReturn'),
    ],
  },
  {
    key: 'autonomie-etudiant',
    example: { ownIncome: da(25_000), totalExpenses: da(60_000) },
    calculator: 'CAL-15',
    formulas: ['F004', 'F047'],
    publics: ['etudiant'],
    fields: [money('ownIncome', { required: true }), money('totalExpenses', { required: true, min: 1 })],
  },
  {
    key: 'provision',
    example: { plannedAmount: da(120_000), alreadyProvisioned: da(30_000), monthsLeft: 9 },
    calculator: 'CAL-16',
    formulas: ['F026', 'F045'],
    publics: ['etudiant', 'famille'],
    fields: [
      money('plannedAmount', { required: true, min: 1 }),
      money('alreadyProvisioned'),
      count('monthsLeft', { required: true, min: 1 }),
    ],
  },
  {
    key: 'premier-salaire',
    example: { net: da(60_000), housing: da(20_000), transport: da(5_000), food: da(12_000), otherExpenses: da(6_000), savingsTarget: da(8_000) },
    calculator: 'CAL-17',
    formulas: ['F003', 'F004', 'F007', 'F008', 'F009'],
    publics: ['lyceen', 'etudiant'],
    fields: [
      money('net', { required: true, min: 1 }),
      money('housing'),
      money('transport'),
      money('food'),
      money('otherExpenses'),
      money('savingsTarget'),
    ],
  },
  {
    key: 'projection-retraite',
    example: { capital: da(500_000), monthlyContribution: da(15_000), years: 25, monthlyRate: 0.003, inflation: 0.04 },
    calculator: 'CAL-29',
    formulas: ['F029', 'F030', 'F031', 'F033'],
    publics: ['salarie', 'famille'],
    fields: [
      money('capital'),
      money('monthlyContribution'),
      count('years', { required: true, min: 1 }),
      rate('monthlyRate', { required: true }),
      rate('inflation', { required: true }),
    ],
  },
  // Screen LY09 "Préparer mes études": the client gives it its own formula
  // (besoin complémentaire = dépenses projetées - ressources projetées), which is
  // F004 applied to projected figures.
  {
    key: 'budget-etudiant',
    example: { housing: da(25_000), transport: da(4_000), food: da(15_000), tuition: da(5_000), telecom: da(2_000), leisure: da(4_000), familySupport: da(40_000), ownResources: da(10_000) },
    calculator: 'LY09',
    formulas: ['F002', 'F003', 'F004'],
    publics: ['lyceen'],
    fields: [
      money('housing'),
      money('transport'),
      money('food'),
      money('tuition'),
      money('telecom'),
      money('leisure'),
      money('familySupport'),
      money('ownResources'),
    ],
  },

  // --- Lot 2 (P4-11): debt and credit, from the USER's own figures ----------
  // These compute from what the person types. The bank-rule simulator (P4-02)
  // will compute from the client's bank data and share the same engine. Nothing
  // here says a credit would be granted, or that an early repayment is allowed
  // by a contract: the client forbids both.

  // CAL-09 — "Taux d'effort dette". The client's output is the effort rate AND
  // its variation before/after a new debt, so F018 is computed twice; the
  // variation itself is the difference of two displayed values, left to the
  // interface (same rule as lot 1).
  {
    key: 'effort-dette',
    example: { instalments: [{ instalment: da(15_000), label: 'Crédit auto' }, { instalment: da(5_000), label: 'Téléphone' }], netIncome: da(100_000), newInstalment: da(10_000), outstandingPrincipal: da(600_000) },
    calculator: 'CAL-09',
    formulas: ['F001', 'F017', 'F018', 'F019'],
    publics: ['jeune_actif', 'salarie', 'famille'],
    fields: [
      list('instalments', [money('instalment', { required: true, min: 1 }), text('label')], { required: true }),
      money('netIncome', { required: true, min: 1 }),
      money('newInstalment'),
      money('outstandingPrincipal'),
    ],
  },

  // CAL-10 — "Mensualité de financement"
  {
    key: 'mensualite-financement',
    example: { creditAmount: da(2_000_000), downPayment: da(200_000), annualRate: 0.06, periodsPerYear: 12, durationMonths: 60, fees: da(10_000), insurance: da(1_000), netIncome: da(120_000), currentLivingAllowance: da(60_000), currentDebtService: da(10_000) },
    calculator: 'CAL-10',
    formulas: ['F020', 'F021', 'F022', 'F023', 'F056'],
    publics: ['jeune_actif', 'salarie', 'famille'],
    fields: [
      money('creditAmount', { required: true, min: 1 }),
      money('downPayment'),
      rate('annualRate', { required: true }),
      periodsPerYear(),
      count('durationMonths', { required: true, min: 1 }),
      money('fees'),
      money('insurance'),
      money('netIncome', { required: true, min: 1 }),
      money('currentLivingAllowance', { required: true }),
      money('currentDebtService'),
    ],
    // Nothing left to finance is not a simulation: refused, so the form can say
    // which field is wrong instead of showing a negative instalment.
    refinements: [{ check: (v) => v.creditAmount - v.downPayment > 0, path: 'downPayment' }],
  },

  // CAL-11 — "Remboursement anticipé". The instalment is derived from the
  // balance, the rate and the remaining duration (F021) instead of being asked
  // twice; the two scenarios are run by the client's own ALG-01 (one debt, with
  // and without the extra payment).
  {
    key: 'remboursement-anticipe',
    example: { balance: da(1_000_000), annualRate: 0.07, periodsPerYear: 12, remainingMonths: 48, extraPayment: da(5_000), earlyRepaymentFees: da(2_000) },
    calculator: 'CAL-11',
    formulas: ['F020', 'F021', 'F024', 'ALG-01'],
    publics: ['jeune_actif', 'salarie', 'famille'],
    fields: [
      money('balance', { required: true, min: 1 }),
      rate('annualRate', { required: true }),
      periodsPerYear(),
      count('remainingMonths', { required: true, min: 1 }),
      money('extraPayment', { required: true, min: 1 }),
      money('earlyRepaymentFees'),
    ],
  },

  // CAL-12 — "Stratégies de dettes". The only calculator the client describes
  // with a LIST ("Liste dettes, soldes, taux, mensualités"), which is why the
  // repeated field type exists.
  {
    key: 'strategies-dettes',
    example: { debts: [{ label: 'Carte', balance: da(300_000), annualRate: 0.18, minimumPayment: da(10_000) }, { label: 'Crédit auto', balance: da(800_000), annualRate: 0.06, minimumPayment: da(20_000) }], extraPayment: da(15_000) },
    calculator: 'CAL-12',
    formulas: ['F017', 'ALG-01'],
    publics: ['salarie', 'jeune_actif', 'famille'],
    fields: [
      list(
        'debts',
        [
          text('label', { required: true }),
          money('balance', { required: true, min: 1 }),
          rate('annualRate', { required: true, min: 0 }),
          money('minimumPayment', { required: true, min: 1 }),
        ],
        { required: true },
      ),
      money('extraPayment'),
    ],
  },

  // CAL-30 — "Simulation logement / immobilier"
  {
    key: 'simulation-logement',
    example: { price: da(9_000_000), downPayment: da(1_500_000), annualRate: 0.055, periodsPerYear: 12, durationMonths: 240, fees: da(50_000), insurance: da(3_000), netIncome: da(180_000), currentLivingAllowance: da(90_000), currentDebtService: da(0), liquidSavings: da(2_000_000) },
    calculator: 'CAL-30',
    formulas: ['F009', 'F020', 'F021', 'F022', 'F023', 'F056'],
    publics: ['jeune_actif', 'salarie', 'famille'],
    fields: [
      money('price', { required: true, min: 1 }),
      money('downPayment'),
      rate('annualRate', { required: true }),
      periodsPerYear(),
      count('durationMonths', { required: true, min: 1 }),
      money('fees'),
      money('insurance'),
      money('netIncome', { required: true, min: 1 }),
      money('currentLivingAllowance', { required: true }),
      money('currentDebtService'),
      money('liquidSavings'),
    ],
    refinements: [{ check: (v) => v.price - v.downPayment > 0, path: 'downPayment' }],
  },
];

export const SIMULATOR_KEYS = SIMULATORS.map((simulator) => simulator.key);
export const simulatorByKey = (key) => SIMULATORS.find((simulator) => simulator.key === key) ?? null;
