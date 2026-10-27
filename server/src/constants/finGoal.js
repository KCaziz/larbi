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
// that none of them covers (G09, G10, G13, G16, G17, G19). The other models
// overlap a GO goal and leave the catalogue — never an existing goal.
const KEPT_MODELS = ['G09', 'G10', 'G13', 'G16', 'G17', 'G19'];
// A GO goal that matches an old template keeps that template's key, so the
// goals already created under it are recognised (GO-01 is still
// `emergency`, which the reserve reads).
const GO_TO_KEY = { 'GO-01': 'emergency', 'GO-02': 'studies', 'GO-04': 'license', 'GO-05': 'travel', 'GO-06': 'car', 'GO-07': 'housing', 'GO-08': 'wedding', 'GO-10': 'retirement', 'GO-11': 'project' };
export const GOAL_CATALOG = [
  ...GOAL_CATALOG_GO.map((goal) => ({ ...goal, key: GO_TO_KEY[goal.code] ?? goal.code })),
  ...GOAL_MODELS.filter((model) => KEPT_MODELS.includes(model.code)).map((model) => ({
    code: model.code,
    key: model.code,
    label: model.label,
    icon: null,
    color: null,
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
 * name gets no default: the person chooses.
 */
export function defaultEmergencyMonths({ finPublic = null, irregularIncome = false } = {}) {
  if (irregularIncome) return 6;
  return { LYC: 1, ETU: 2, JAC: 3, SAL: 3 }[finPublic] ?? null;
}

export const MAX_GOALS = 60;
