// What to do so that a « non calculé » becomes a figure (recette R8-08).
//
// Every answer of the engine lists the inputs it was computed from
// (`entrees_snapshot`). When the result is missing, the first input that is
// missing (null, or an empty count) says what the person has to give, and
// where. The order matters: the most specific input first. Returns
// { key, to } — `key` under `fincludia.howTo`, `to` the screen — or a general
// « record your movements » when nothing more precise is known.
const RULES = [
  [/capital_fonds_urgence/, 'reserveFund', '/app/objectifs/fonds-urgence'],
  [/depenses_essentielles/, 'essentialExpenses', '/app/objectifs/fonds-urgence'],
  [/cible_mois/, 'reserveTarget', '/app/objectifs/fonds-urgence'],
  [/revenu|ressource/, 'income', '/app/budgets/revenus'],
  [/budget|alloue|enveloppe/, 'budget', '/app/budgets/nouveau'],
  [/contribution/, 'contribution', '/app/objectifs'],
  [/echeance|date_cible/, 'goalDate', '/app/objectifs'],
  [/dette|mensualite/, 'debts', '/app/dettes'],
  [/epargne/, 'savings', '/app/objectifs'],
  [/solde|compte/, 'accounts', '/app/comptes'],
  [/depense|mouvement/, 'movements', '/app/mouvements/nouveau'],
];

// The figures whose answer shares its inputs with others: the figure itself
// says what it needs (spending needs movements, not income).
const BY_FORMULA = {
  'PB-F004': ['income', '/app/budgets/revenus'],
  F002: ['income', '/app/budgets/revenus'],
  F001: ['income', '/app/budgets/revenus'],
  'PB-F005': ['movements', '/app/mouvements/nouveau'],
  F003: ['movements', '/app/mouvements/nouveau'],
};

const BUSINESS = {
  ...Object.fromEntries(['E001', 'E002', 'E003', 'E004', 'E005', 'E006', 'E007', 'E008', 'E009', 'E010', 'E011', 'E014'].map((id) => [id, 'businessDocuments'])),
  E012: 'businessCost',
  E013: 'businessQuote',
  // Lot C.
  E015: 'businessStock',
  E016: 'businessDocuments',
  E017: 'businessDocuments',
  E018: 'businessDocuments',
  E019: 'businessNature',
  E020: 'businessDocuments',
  E021: 'businessBudget',
  E022: 'businessBalance',
  E023: 'businessBalance',
  E024: 'businessBalance',
  // Lot D.
  E025: 'businessTradeCost',
  E026: 'businessTradeReception',
  E027: 'businessTradeSale',
  E028: 'businessDocuments',
  E029: 'businessTradeCost',
  // Lot E.
  E030: 'businessProjectExpense',
  E031: 'businessProjectExpense',
  E032: 'businessProjectExpense',
  E033: 'businessProjectMilestone',
  E034: 'businessProjectExpense',
  E035: 'businessHoldingRate',
  // Lot G.
  E036: 'businessHr',
  E037: 'businessHr',
  E038: 'businessHr',
  E039: 'businessCampaign',
  E040: 'businessCampaign',
  // Lot G, second part.
  E041: 'businessPayroll',
  E042: 'businessPayroll',
  E043: 'businessPayroll',
  E044: 'businessLedgerChart',
  E045: 'businessLedger',
  E046: 'businessLedger',
  E047: 'businessLedger',
};

const isMissing = (value) => value === null || value === undefined || value === 0 || (Array.isArray(value) && value.length === 0);

export function howToCompute(answer) {
  // Recette R10-05: no income received yet, but incomes ARE declared — the
  // thing to do is to confirm the one that arrived, not to type it again
  // (which made duplicates).
  if (answer?.formule_id === 'PB-F004' && answer?.entrees_snapshot?.ressources_recurrentes > 0) return { key: 'incomeToConfirm', to: '/app/aujourdhui' };
  // Recette R12-02: the reste à vivre needs an income and the fixed charges; its
  // instalments at 0 are an answer (no debt), never the thing to do.
  if (answer?.formule_id === 'F006') {
    const inputs = answer.entrees_snapshot ?? {};
    if (inputs.revenus_nets_mensuels === null || inputs.revenus_nets_mensuels === undefined) return { key: 'income', to: '/app/budgets/revenus' };
    return { key: 'essentialExpenses', to: '/app/objectifs/fonds-urgence' };
  }
  // P13-05, lot B: a business figure is computed from the business's own
  // documents, never from personal movements.
  const business = BUSINESS[answer?.formule_id];
  if (business) return { key: business, to: '/app/entreprise' };
  const known = BY_FORMULA[answer?.formule_id];
  if (known) return { key: known[0], to: known[1] };
  const inputs = answer?.entrees_snapshot ?? {};
  const missing = Object.entries(inputs)
    .filter(([, value]) => isMissing(value))
    .map(([name]) => name);
  for (const [pattern, key, to] of RULES) {
    if (missing.some((name) => pattern.test(name))) return { key, to };
  }
  return { key: 'movements', to: '/app/mouvements/nouveau' };
}
