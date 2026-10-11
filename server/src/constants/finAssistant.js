// FINCLUDIA deterministic assistant (P3-19). The 8 intents, their example
// phrasing and their allowed answer are taken as-is from the client's own file
// (FINCLUDIA_Cahier_des_Charges_Complet.xlsx, onglet "13_Chatbot") — not invented.
// "Réponse autorisée" (client's words) is kept here as a comment for each one,
// to show exactly what the client's own document allows, next to the deep
// link this server can actually offer today.
export const FIN_INTENTS = [
  { code: 'NAVIGUER', label: 'Naviguer vers un écran', exampleQuery: 'Où ajouter une dépense ?' }, // Ouvrir C07 (pas encore construit)
  { code: 'EXPLIQUER_INDICATEUR', label: 'Expliquer un indicateur', exampleQuery: "C'est quoi mon taux d'épargne ?" }, // Définition validée + valeur personnelle si disponible
  { code: 'CRÉER_OBJECTIF', label: 'Créer un objectif', exampleQuery: 'Je veux acheter une voiture' }, // Créer objectif / simuler / explorer financement
  { code: 'AIDE_BUDGET', label: 'Aide au budget', exampleQuery: 'Comment faire mon budget ?' }, // Arbre revenus -> charges -> variables -> objectif
  { code: 'AIDE_DETTE', label: "Aide au remboursement d'une dette", exampleQuery: 'Comment rembourser plus vite ?' }, // Ouvrir C14 + scénarios prédéfinis
  { code: 'APPRENDRE_TERME', label: 'Apprendre un terme', exampleQuery: "C'est quoi une obligation ?" }, // Résultat recherche apprentissage
  { code: 'CHERCHER_SOLUTION', label: 'Chercher une solution de financement', exampleQuery: 'Financement voiture' }, // Ouvrir Explorer avec filtres, sans promesse
  { code: 'DÉPENSE_PARTAGÉE', label: 'Dépense partagée', exampleQuery: 'Qui doit quoi ?' }, // Lire solde autorisé et ouvrir P03
];
export const FIN_INTENT_CODES = FIN_INTENTS.map((i) => i.code);

// Real, already-built pages the assistant may open today ("Liens profonds").
// An intent whose natural target (C07, C14, P03, "Explorer"...) is not built
// yet must leave deepLinkPath null in the database — the resolver then shows
// a "not available yet" message instead of a wrong or dead link (never fakes
// a destination). Kept in sync by hand with client/src/router/index.jsx.
export const FIN_DEEP_LINK_WHITELIST = [
  '/',
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

export const FIN_AUDIT_ACTIONS = ['resolved', 'fallback', 'deep_link_opened', 'flow_started', 'flow_step', 'flow_ended', 'not_available'];

// "4 à 6 catégories" when confidence is insufficient (client's own words).
export const FIN_FALLBACK_MAX_CATEGORIES = 6;
export const FIN_FALLBACK_MIN_CATEGORIES = 4;
