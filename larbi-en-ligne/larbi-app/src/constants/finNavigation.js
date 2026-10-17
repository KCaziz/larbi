// The menu of the connected space (P1-12), the client's specification § 2-3.
//
// The client names NINE entries, in this order: Aujourd'hui, Mon argent, Mes
// objectifs, Ma sécurité, Mon patrimoine, Investir & simuler, À plusieurs,
// Explorer, Apprendre. This file is the only place that says which of our
// routes sits under which of them.
//
// What is the client's and what is ours, stated plainly:
//   - the nine names and their order are the CLIENT's (spec § 2-3);
//   - which route goes under which name is OUR arrangement of the screens the
//     client specified. The workbook's tab `19_Cartes_Parcours` says which
//     screens a public sees, never how they are grouped in a menu.
//
// Three served routes are deliberately absent from the nine groups, because the
// client puts them elsewhere in the same spec: the notification centre belongs
// to the TOP BAR, and the trust centre and the first steps belong to the
// account. Listing them in a group as well would show them twice.
//
// The assistant (C26) is not among them because it is not a route at all: it is
// a floating panel on every screen, opened from the top bar as well.
//
// Nothing here is a permission. `menuFor` hides what a public may not open as a
// convenience; every route is guarded on its own (`requireAdult`, `requireAuth`),
// which is the statement that counts.
import { SCREEN_ROUTES, screenEnabledFor } from './finJourneys.js';

// Routes shown in the top bar or under the account rather than in a group.
export const OUT_OF_MENU_ROUTES = ['/notifications', '/confiance', '/compte/premiers-pas'];

// Les routes du menu qui ne viennent PAS de la carte des parcours du client.
//
// `SCREEN_ROUTES` est généré depuis son classeur : y ajouter un écran de notre
// fait corromprait la matrice de provenance de P6-21, qui doit rester lisible
// face à sa source. Les routes qui naissent ailleurs — ici du contrat, pas du
// classeur des parcours — sont donc déclarées à part, avec leur origine.
export const EXTRA_ROUTES = {
  // Espace entreprise (P7-02), annoncé par l'annexe 1 du contrat. Réservé aux
  // majeurs : émettre des factures et porter des dettes fournisseurs ne sont
  // pas des gestes de mineur, et le serveur le refuse de son côté.
  '/entreprise': { adultsOnly: true, origin: 'contrat, annexe 1', task: 'P7-02' },
};

export const MENU_GROUPS = [
  { key: 'today', routes: ['/aujourdhui'] },
  { key: 'money', routes: ['/mon-argent', '/budget', '/calendrier'] },
  { key: 'goals', routes: ['/objectifs'] },
  { key: 'safety', routes: ['/reserve', '/dettes'] },
  { key: 'wealth', routes: ['/patrimoine', '/financement'] },
  {
    key: 'invest',
    routes: ['/portefeuille', '/outils/atelier', '/outils/simulateurs/premier-salaire', '/outils/simulateurs/budget-etudiant'],
  },
  { key: 'together', routes: ['/espaces'] },
  { key: 'explore', routes: ['/outils/comparateur', '/outils/comparateur/comptes', '/outils/explorateur', '/outils/offres-emploi'] },
  { key: 'learn', routes: ['/apprendre', '/passeport'] },
  // La DIXIÈME entrée, et elle n'est pas du client : la spécification § 2-3
  // en nomme neuf, toutes personnelles. L'espace entreprise vient de l'annexe
  // 1 du contrat, donc il est ajouté après les neuf plutôt que glissé parmi
  // elles — un menu qui mélangerait les deux origines ne pourrait plus être
  // relu face à sa source.
  { key: 'business', routes: ['/entreprise'] },
];

// Every route a group claims, for the consistency check below.
const groupedRoutes = () => MENU_GROUPS.flatMap((group) => group.routes);

// Which screens of the client's map lead to a given route.
function screensOf(route) {
  return Object.entries(SCREEN_ROUTES)
    .filter(([, screen]) => screen.to === route)
    .map(([code]) => code);
}

// Is this route reachable by this public, at this age?
//
// A route is offered when AT LEAST ONE of the client's screens behind it is
// enabled for the public: our routes are coarser than the client's screens (one
// page often serves four of them), so requiring all of them would hide a page
// the public is entitled to.
function routeAllowedFor(route, { publicCode, adult }) {
  // Une route qui ne vient pas du classeur des parcours n'a pas de public :
  // elle est offerte à tout le monde, sous réserve de son âge. Le public d'un
  // compte dit quel PARCOURS il suit, pas s'il dirige une entreprise.
  const extra = EXTRA_ROUTES[route];
  if (extra) return extra.adultsOnly !== true || adult;

  const screens = screensOf(route);
  if (screens.length === 0) return false;
  return screens.some((code) => {
    if (!screenEnabledFor(publicCode, code)) return false;
    if (SCREEN_ROUTES[code].adultsOnly === true && !adult) return false;
    return true;
  });
}

// The menu this account should see: the nine groups in the client's order, each
// reduced to the routes it may open, and a group with nothing left is dropped
// rather than shown empty.
export function menuFor({ publicCode = null, adult = false } = {}) {
  return MENU_GROUPS.map((group) => ({
    key: group.key,
    entrees: group.routes
      .filter((route) => routeAllowedFor(route, { publicCode, adult }))
      .map((route) => ({ to: route, ecrans: screensOf(route) })),
  })).filter((group) => group.entrees.length > 0);
}

// Every served route is either in a group or deliberately out of the menu.
// A route that is in neither is unreachable from the navigation — the kind of
// omission nobody notices until a user says a page does not exist. Checked by a
// test rather than trusted.
export function unreachableRoutes() {
  const known = new Set([...groupedRoutes(), ...OUT_OF_MENU_ROUTES, ...Object.keys(EXTRA_ROUTES)]);
  const served = new Set(Object.values(SCREEN_ROUTES).map((screen) => screen.to).filter(Boolean));
  return [...served].filter((route) => !known.has(route)).sort();
}

// And the reverse: a group that claims a route nobody serves.
export function danglingMenuRoutes() {
  const served = new Set([
    ...Object.values(SCREEN_ROUTES).map((screen) => screen.to).filter(Boolean),
    ...Object.keys(EXTRA_ROUTES),
  ]);
  return [...groupedRoutes(), ...OUT_OF_MENU_ROUTES].filter((route) => !served.has(route)).sort();
}
