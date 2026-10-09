// FINCLUDIA simulators, lot 1 (P4-10), tab `09_Calculateurs` of the client's
// workbook. The client lists 30 calculators; this file holds the 13 that need
// neither debt/credit maths (lot 2, P4-11) nor data the client still owes us.
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
// `min`/`max` are only bounds the client states or arithmetic requires; nothing
// is invented as a "reasonable" default.

const money = (key, extra = {}) => ({ key, type: 'money', min: 0, ...extra });
const count = (key, extra = {}) => ({ key, type: 'count', min: 0, ...extra });
const rate = (key, extra = {}) => ({ key, type: 'rate', ...extra });

export const SIMULATOR_FIELD_TYPES = ['money', 'rate', 'count'];

// `publics` repeats the client's "Publics" column. It is INFORMATIVE only: the
// calculators read no personal data, so none of them is restricted by it — the
// client's own C18 says the simulation workshop works in discovery mode, without
// a profile. Access is decided once, in constants/tools.js.
export const SIMULATORS = [
  {
    key: 'budget-mensuel',
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
    calculator: 'CAL-15',
    formulas: ['F004', 'F047'],
    publics: ['etudiant'],
    fields: [money('ownIncome', { required: true }), money('totalExpenses', { required: true, min: 1 })],
  },
  {
    key: 'provision',
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
];

export const SIMULATOR_KEYS = SIMULATORS.map((simulator) => simulator.key);
export const simulatorByKey = (key) => SIMULATORS.find((simulator) => simulator.key === key) ?? null;
