// The tips of the help panel, one short list per page of the application
// (SUIVI_RECETTE R4-05): what to do here, and the small thing people miss. The
// texts are in the translations (`tips.<page>`), written in plain words.
const PAGES = ['accueil', 'comptes', 'mouvements', 'budgets', 'objectifs', 'dettes', 'calendrier', 'synthese', 'sante'];

/** The key of the tips for an address of the application or of Gestion commune, or null. */
export function tipsKeyFor(pathname) {
  if (pathname.startsWith('/partage')) return 'partage';
  const match = pathname.match(/^\/app(?:\/([^/]+))?/);
  if (!match) return null;
  const page = match[1] ?? 'accueil';
  if (page === 'aujourdhui') return 'accueil';
  return PAGES.includes(page) ? page : null;
}
