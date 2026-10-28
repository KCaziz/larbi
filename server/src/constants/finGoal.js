import { GOAL_CATALOG_GO } from './finGoalCatalog.js';
import { GOAL_MODELS } from './finGoalModels.js';

// Financial goals (P6-08), screens C09-C11. The catalogue of templates the
// client lists (onglet "09_Objectifs"): a label only, never a suggested
// amount — the client is explicit that example values must never be
// preselected as a recommendation.
export const GOAL_TEMPLATES = [
  { key: 'emergency', label: 'Urgence' },
  { key: 'studies', label: 'Études' },
  { key: 'license', label: 'Permis' },
  { key: 'car', label: 'Voiture' },
  { key: 'housing', label: 'Logement' },
  { key: 'travel', label: 'Voyage' },
  { key: 'wedding', label: 'Mariage' },
  { key: 'child', label: 'Enfant' },
  { key: 'retirement', label: 'Retraite' },
  { key: 'project', label: 'Projet' },
  { key: 'investment', label: 'Investissement' },
];
// The catalogue since P8-12 (decision P8-01 point 2): the client's 11 goals
// GO-01 to GO-11 (generated), plus the six models of the master referential
// that none of them covers. The other models overlap a GO goal and leave the
// catalogue — never an existing goal. The client numbered the six GO-12 to
// GO-17 (answer D1, 2026-10-28); a migration moved the goals already created.
const KEPT_MODELS = {
  G09: { code: 'GO-12', label: 'Naissance d’un enfant', icon: '👶', color: '#EC4899' },
  G10: { code: 'GO-13', label: 'Études d’un enfant', icon: '🧒', color: '#7C3AED' },
  G13: { code: 'GO-14', label: 'Travaux du logement', icon: '🛠️', color: '#B45309' },
  G16: { code: 'GO-15', label: 'Provision pour dépenses annuelles', icon: '📅', color: '#0891B2' },
  G17: { code: 'GO-16', label: 'Épargne long terme', icon: '🌱', color: '#15803D' },
  G19: { code: 'GO-17', label: 'Projet entrepreneurial', icon: '🚀', color: '#C2410C' },
};
// A GO goal that matches an old template keeps that template's key, so the
// goals already created under it are recognised (GO-01 is still
// `emergency`, which the reserve reads).
const GO_TO_KEY = { 'GO-01': 'emergency', 'GO-02': 'studies', 'GO-04': 'license', 'GO-05': 'travel', 'GO-06': 'car', 'GO-07': 'housing', 'GO-08': 'wedding', 'GO-10': 'retirement', 'GO-11': 'project' };
export const GOAL_CATALOG = [
  ...GOAL_CATALOG_GO.map((goal) => ({ ...goal, key: GO_TO_KEY[goal.code] ?? goal.code })),
  ...GOAL_MODELS.filter((model) => KEPT_MODELS[model.code]).map((model) => ({
    ...KEPT_MODELS[model.code],
    key: KEPT_MODELS[model.code].code,
    model: model.code,
    calculation: model.defaultTarget,
    target: model.horizon,
    rule: model.rule,
  })),
];

// Every key a goal may carry: the catalogue's, and the old templates' so that
// no goal created before P8-12 becomes invalid.
export const GOAL_TEMPLATE_KEYS = [...new Set([...GOAL_TEMPLATES.map((t) => t.key), ...GOAL_CATALOG.map((goal) => goal.key)])];

// « En cours / Atteint / En pause / Arrêté » (tab 10B).
export const GOAL_PROGRESS_STATUSES = ['active', 'reached', 'paused', 'stopped'];

/**
 * GO-01's target in months, by educational profile (decision P8-01 point 3):
 * lycéen 1 (educational), étudiant 2, jeune actif or salarié 3, irregular
 * income 6 — always changeable by the person. A profile the client does not
 * name gets no default: the person chooses. A seasonal income is as
 * uncertain from one month to the next as an irregular one: 6 too.
 */
export function defaultEmergencyMonths({ finPublic = null, incomeRegularity = 'stable' } = {}) {
  if (incomeRegularity === 'irregular' || incomeRegularity === 'seasonal') return 6;
  return { LYC: 1, ETU: 2, JAC: 3, SAL: 3 }[finPublic] ?? null;
}

// « Régularité du revenu » (the client's answer C3, 2026-10-28).
export const FIN_INCOME_REGULARITIES = ['stable', 'irregular', 'seasonal'];

export const MAX_GOALS = 60;
