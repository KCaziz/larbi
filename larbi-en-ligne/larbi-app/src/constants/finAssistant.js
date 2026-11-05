import { FIN_INTENT_CATALOGUE } from './finIntents.js';

// FINCLUDIA deterministic assistant (P3-19). The 8 intents, their example
// phrasing and their allowed answer are taken as-is from the client's own file
// (FINCLUDIA_Cahier_des_Charges_Complet.xlsx, onglet "13_Chatbot") — not invented.
// "Réponse autorisée" (client's words) is kept here as a comment for each one,
// to show exactly what the client's own document allows, next to the deep
// link this server can actually offer today.
// The collective intent « Dépense partagée » left the personal assistant
// (P8-19, decision P8-01 point 10): shared spending is Gestion commune's, in
// its own application (Phase 9).
export const FIN_INTENTS = [
  { code: 'NAVIGUER', label: 'Naviguer vers un écran', exampleQuery: 'Où ajouter une dépense ?' }, // Ouvrir C07 (pas encore construit)
  { code: 'EXPLIQUER_INDICATEUR', label: 'Expliquer un indicateur', exampleQuery: "C'est quoi mon taux d'épargne ?" }, // Définition validée + valeur personnelle si disponible
  { code: 'CRÉER_OBJECTIF', label: 'Créer un objectif', exampleQuery: 'Je veux acheter une voiture' }, // Créer objectif / simuler / explorer financement
  { code: 'AIDE_BUDGET', label: 'Aide au budget', exampleQuery: 'Comment faire mon budget ?' }, // Arbre revenus -> charges -> variables -> objectif
  { code: 'AIDE_DETTE', label: "Aide au remboursement d'une dette", exampleQuery: 'Comment rembourser plus vite ?' }, // Ouvrir C14 + scénarios prédéfinis
  { code: 'APPRENDRE_TERME', label: 'Apprendre un terme', exampleQuery: "C'est quoi une obligation ?" }, // Résultat recherche apprentissage
  { code: 'CHERCHER_SOLUTION', label: 'Chercher une solution de financement', exampleQuery: 'Financement voiture' }, // Ouvrir Explorer avec filtres, sans promesse
];
export const FIN_INTENT_CODES = FIN_INTENTS.map((i) => i.code);
// The first list AND the client's 25 intentions (constants/finIntents.js): the
// audit log may record either, and the database CHECK lists the same codes.
export const FIN_ALL_INTENT_CODES = [...FIN_INTENT_CODES, ...FIN_INTENT_CATALOGUE.map((i) => i.code)];

// Real, already-built pages the assistant may open today ("Liens profonds").
// An intent whose natural target (C07, C14, P03, "Explorer"...) is not built
// yet must leave deepLinkPath null in the database — the resolver then shows
// a "not available yet" message instead of a wrong or dead link (never fakes
// a destination). Kept in sync by hand with client/src/router/index.jsx.
export const FIN_DEEP_LINK_WHITELIST = [
  '/',
  // The application's own screens (P8-19).
  '/app',
  '/app/comptes',
  '/app/mouvements',
  '/app/synthese',
  '/app/budgets',
  '/app/calendrier',
  '/app/objectifs',
  '/app/dettes',
  '/app/patrimoine',
  '/app/outils',
  '/app/sante',
  '/app/formation',
  // The addresses the client's 25 intentions open (P8-24): each a real page.
  '/app/budgets/nouveau',
  '/app/objectifs/fonds-urgence',
  '/app/dettes/strategies',
  '/app/financement',
  '/app/portefeuille',
  '/app/synthese/rapports',
  '/app/outils/credit',
  '/app/outils/fiche-de-paie',
  '/app/outils/postal',
  '/app/outils/comparateur',
  '/app/outils/simulateurs',
  '/apprendre',
  '/blog',
  '/formations',
  '/outils',
  '/outils/comparateur',
  '/outils/simulateurs',
  '/outils/atelier',
  '/outils/offres-emploi',
  '/contact',
  '/faq',
];

// Where each of the client's 25 intentions (CB01 to CB99, constants/finIntents.js)
// leads, on the application's NEW addresses (P8-24). Only a page that really
// exists is named; an intention with no screen of its own — a minor's rights
// (CB16), general safety advice (CB22), the fallback (CB99) — leads nowhere
// rather than to a wrong page, and the resolver then says so.
export const FIN_INTENT_LINKS = {
  CB01: '/app/budgets',
  CB02: '/app/budgets/nouveau',
  CB03: '/app/budgets',
  CB04: '/app/synthese',
  CB05: '/app/objectifs/fonds-urgence',
  CB06: '/app/objectifs',
  CB07: '/app/dettes',
  CB08: '/app/dettes/strategies',
  CB09: '/app/outils/credit',
  CB10: '/app/outils/simulateurs',
  CB11: '/app/financement',
  CB12: '/app/outils/fiche-de-paie',
  CB13: '/app/outils/fiche-de-paie',
  CB14: '/app/outils/postal',
  CB15: '/app/outils/comparateur',
  CB16: null,
  CB17: '/app/portefeuille',
  CB18: '/app/outils/simulateurs',
  CB19: '/app/outils/comparateur',
  CB20: '/app/objectifs',
  CB21: '/app/synthese/rapports',
  CB22: null,
  CB23: '/app/sante',
  CB24: '/app/outils/comparateur',
  CB99: null,
};

export const FIN_AUDIT_ACTIONS = ['resolved', 'fallback', 'deep_link_opened', 'flow_started', 'flow_step', 'flow_ended', 'not_available'];

// "4 à 6 catégories" when confidence is insufficient (client's own words).
export const FIN_FALLBACK_MAX_CATEGORIES = 6;
export const FIN_FALLBACK_MIN_CATEGORIES = 4;
