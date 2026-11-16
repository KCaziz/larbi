// What every page of ONE space shares (P9-02): its title, the way back to the
// list, and the compartments of that space — a page per compartment, each with
// its own address (`/partage/:id/...`). The vocabulary follows the kind of
// space: the household has its extra compartment, a couple does not.
export const SPACE_SECTIONS = [
  { to: '', key: 'dashboard', end: true },
  { to: 'depenses', key: 'expenses' },
  { to: 'budgets', key: 'budgets' },
  { to: 'ressources', key: 'pot' },
  { to: 'taches', key: 'tasks' },
  { to: 'calendrier', key: 'calendar' },
  { to: 'objectifs', key: 'goals' },
  { to: 'foyer', key: 'household', kinds: ['household'] },
  { to: 'rapport', key: 'report' },
  { to: 'membres', key: 'members' },
];
