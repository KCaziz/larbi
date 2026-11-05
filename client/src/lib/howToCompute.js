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

const isMissing = (value) => value === null || value === undefined || value === 0 || (Array.isArray(value) && value.length === 0);

export function howToCompute(answer) {
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
