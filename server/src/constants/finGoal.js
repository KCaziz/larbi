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
export const GOAL_TEMPLATE_KEYS = GOAL_TEMPLATES.map((t) => t.key);

export const MAX_GOALS = 60;
