// Source of truth for the account categories named in the cahier des
// charges (TASKS.md section 1). Kept as a plain constant, not a DB table:
// new categories can be added here without a migration, matching "autres
// catégories pouvant être ajoutées".
export const ACCOUNT_TYPES = [
  { value: 'auto-entrepreneur', label: 'Auto-entrepreneur' },
  { value: 'pme', label: 'PME' },
  { value: 'pmi', label: 'PMI' },
];
