// The journey map of the 8 publics (P6-17), generated from the client's own
// tab `19_Cartes_Parcours` by scripts/generate-journeys.py — extracted, never
// retyped, exactly as the category reference of P6-02 was.
//
// It answers three questions per public, in the client's own words: which
// dashboard is the main one, what the visible navigation says, and which
// screens are enabled. The spec is explicit that common screens are reused
// BY CONFIGURATION and never copied — so this file is configuration, and
// there is no second implementation of a screen anywhere.
//
// `SCREEN_ROUTES` doubles as the provenance matrix P6-21 asks for (tab
// `18_Provenance`): every screen the client specified, attached either to the
// route we serve or to the task that still owes it.

// A client screen code -> what we actually serve.
//   to          the route, or null when nothing is served yet
//   task        the task that delivered it
//   waitingOn   what it waits for, when nothing is served
//   adultsOnly  reserved to 18+ (the client: a lycéen is never shown a debt,
//               a real patrimony or a credit offer)
//   note        why a mapping is not one-to-one, where that is not obvious
export const SCREEN_ROUTES = {
  C04: { label: 'Accueil — Aujourd’hui', to: '/aujourdhui', task: 'P6-06' },
  C05: { label: 'Mon argent — synthèse', to: '/mon-argent', task: 'P6-04' },
  C06: { label: 'Créer / modifier un budget', to: '/budget', task: 'P6-05' },
  C07: { label: 'Ajouter une dépense / revenu', to: '/mon-argent', task: 'P6-04', note: 'panneau de saisie rapide de la page « Mon argent »' },
  C08: { label: 'Historique & recherche des transactions', to: '/mon-argent', task: 'P6-04', note: 'historique et filtres de la page « Mon argent »' },
  C09: { label: 'Objectifs — catalogue', to: '/objectifs', task: 'P6-08' },
  C10: { label: 'Créer un objectif', to: '/objectifs', task: 'P6-08', note: 'formulaire de création sur la page des objectifs' },
  C11: { label: 'Détail objectif / Moteur d’objectifs financiers', to: '/objectifs', task: 'P6-08', note: 'détail déplié sur la page des objectifs' },
  C12: { label: 'Réserve de sécurité', to: '/reserve', task: 'P6-09' },
  C13: { label: 'Dettes — synthèse', to: '/dettes', task: 'P6-10', adultsOnly: true },
  C14: { label: 'Détail dette / Analyse de l’endettement', to: '/dettes', task: 'P6-10', adultsOnly: true, note: 'détail et comparaison ALG-01 sur la page des dettes' },
  C15: { label: 'Décodeur de fiche de paie', to: null, waitingOn: 'P4-14', adultsOnly: true, note: 'barèmes de paie à fournir par le client' },
  C16: { label: 'Patrimoine réel', to: '/patrimoine', task: 'P6-11', adultsOnly: true },
  C17: { label: 'Portefeuille fictif', to: '/portefeuille', task: 'P6-12' },
  C18: { label: 'Atelier de simulation', to: '/outils/atelier', task: 'P4-16' },
  C19: { label: 'Moteur de comparaison', to: '/outils/comparateur', task: 'P4-12' },
  C20: { label: 'Explorer / recherche de solutions', to: '/outils/explorateur', task: 'P4-13', adultsOnly: true },
  C21: { label: 'Apprendre — recherche & contenu', to: '/apprendre', task: 'P2-08' },
  C22: { label: 'Recherche globale', to: null, task: 'P6-20', note: 'barre de recherche de l\'en-tête, présente sur toutes les pages : pas une route' },
  C23: { label: 'Calendrier financier', to: '/calendrier', task: 'P6-07' },
  C24: { label: 'Centre de notifications', to: '/notifications', task: 'P6-18' },
  C25: { label: 'Centre de confiance & données', to: '/confiance', task: 'P6-19' },
  C26: { label: 'Chatbot simple FINCLUDIA', to: null, task: 'P3-19', note: "bulle d'assistant présente sur toutes les pages, ouverte aussi depuis la barre supérieure : pas une route" },
  CO01: { label: 'Créer une colocation', to: '/espaces', task: 'P6-13' },
  CO02: { label: 'Tableau de bord colocation', to: '/espaces', task: 'P6-15' },
  CO03: { label: 'Factures & abonnements communs', to: '/espaces', task: 'P6-15' },
  CO04: { label: 'Enveloppes communes', to: '/espaces', task: 'P6-15' },
  CO05: { label: 'Accord financier de colocation', to: '/espaces', task: 'P6-15' },
  CO06: { label: 'Objectifs communs', to: '/espaces', task: 'P6-15' },
  CP01: { label: 'Créer espace couple', to: '/espaces', task: 'P6-13' },
  CP02: { label: 'Tableau de bord couple', to: '/espaces', task: 'P6-15' },
  CP03: { label: 'Objectif commun', to: '/espaces', task: 'P6-15' },
  CP04: { label: 'Revue financière du couple', to: '/espaces', task: 'P6-15' },
  EP01: { label: 'Diagnostic épargne', to: '/compte/premiers-pas', task: 'P6-03', note: 'diagnostic épargne : les questions EP01 de l’onboarding' },
  EP02: { label: 'Tableau de bord Parcours d’épargne', to: '/aujourdhui', task: 'P6-06' },
  EP03: { label: 'Profil de risque pédagogique', to: '/portefeuille', task: 'P6-12', note: 'profil de risque pédagogique F057' },
  EP04: { label: 'Suis-je prêt à commencer ?', to: '/portefeuille', task: 'P6-12', note: '« Suis-je prêt à commencer ? » : répond, ne bloque jamais' },
  EP05: { label: 'Comprendre les placements', to: '/apprendre', task: 'P2-08' },
  EP06: { label: 'Marché pédagogique', to: null, waitingOn: 'P6-01', note: 'marché pédagogique : instruments et prix de référence à fournir par le client' },
  EP07: { label: 'Journal de décisions et export du laboratoire', to: '/portefeuille', task: 'P6-12', note: 'journal de décisions et son export' },
  ET01: { label: 'Onboarding étudiant', to: '/compte/premiers-pas', task: 'P6-03' },
  ET02: { label: 'Tableau de bord étudiant', to: '/aujourdhui', task: 'P6-06' },
  ET03: { label: 'Autonomie financière', to: '/aujourdhui', task: 'P6-06', note: 'autonomie financière F047, carte du tableau de bord étudiant' },
  ET04: { label: 'Dépenses d’études et provisions', to: '/calendrier', task: 'P6-07', note: 'provisions de dépenses d’études' },
  ET06: { label: 'Comparateur banque / CCP étudiant', to: '/outils/comparateur/comptes', task: 'P4-07' },
  ET07: { label: 'Premier emploi et fiche de paie', to: null, waitingOn: 'P4-14', adultsOnly: true },
  ET08: { label: 'Comparateur d’offres d’emploi', to: '/outils/offres-emploi', task: 'P4-12' },
  ET09: { label: 'Passeport financier étudiant', to: '/passeport', task: 'P2-09' },
  FA01: { label: 'Créer foyer', to: '/espaces', task: 'P6-13' },
  FA02: { label: 'Tableau de bord Finances du foyer', to: '/espaces', task: 'P6-15' },
  FA03: { label: 'Enfants & projets', to: '/espaces', task: 'P6-15' },
  FA04: { label: 'Dépenses annuelles et provisions', to: '/espaces', task: 'P6-15' },
  FA05: { label: 'Enfants et projets associés', to: '/espaces', task: 'P6-15' },
  FA06: { label: 'Revue du foyer', to: '/espaces', task: 'P6-15' },
  JA01: { label: 'Transition premier revenu', to: '/aujourdhui', task: 'P6-06', note: 'tableau de bord « Premier revenu »' },
  JA02: { label: 'Tableau de bord jeune actif', to: '/aujourdhui', task: 'P6-06' },
  JA03: { label: 'Plan premier salaire', to: '/budget', task: 'P6-05', note: 'plan de répartition du premier salaire' },
  JA04: { label: 'Organiser mon premier revenu', to: '/budget', task: 'P6-05', note: 'même plan de répartition, vu depuis le budget' },
  JA07: { label: 'Mes premiers actifs', to: '/patrimoine', task: 'P6-11', adultsOnly: true },
  JA08: { label: 'Préparation au financement', to: '/financement', task: 'P6-16', adultsOnly: true },
  JA09: { label: 'Comparer un financement', to: null, waitingOn: 'P4-15', adultsOnly: true, note: 'offres de financement à fournir par le client' },
  LY01: { label: 'Onboarding lycéen', to: '/compte/premiers-pas', task: 'P6-03' },
  LY02: { label: 'Accueil — Ma semaine financière', to: '/aujourdhui', task: 'P6-06', note: 'tableau de bord « Ma semaine »' },
  LY03: { label: 'Défis & missions', to: null, waitingOn: 'P2-10', note: 'défis et missions : tâche abandonnée par le client le 2026-10-11' },
  LY09: { label: 'Préparer mes études', to: '/outils/simulateurs/budget-etudiant', task: 'P4-10' },
  LY10: { label: 'Simulation de premier salaire', to: '/outils/simulateurs/premier-salaire', task: 'P4-10' },
  LY11: { label: 'Sécurité numérique', to: null, waitingOn: 'P2-08', note: 'sécurité numérique : contenu pédagogique, pas encore rédigé' },
  LY12: { label: 'Passeport Avenir', to: '/passeport', task: 'P2-09' },
  P01: { label: 'Hub “À plusieurs”', to: '/espaces', task: 'P6-13' },
  P02: { label: 'Dépense partagée', to: '/espaces', task: 'P6-14' },
  P03: { label: 'Règlements — qui doit quoi à qui', to: '/espaces', task: 'P6-14', note: 'règlements et plan ALG-02, dans l’espace' },
  P04: { label: 'Permissions couple / foyer', to: '/espaces', task: 'P6-13', note: 'matrice de permissions, dans l’espace' },
  P05: { label: 'Tableau de bord partagé', to: '/espaces', task: 'P6-15' },
  SA01: { label: 'Onboarding salarié', to: '/compte/premiers-pas', task: 'P6-03' },
  SA02: { label: 'Tableau de bord Santé financière personnelle', to: '/aujourdhui', task: 'P6-06' },
  SA03: { label: 'Plan du mois', to: '/calendrier', task: 'P6-07', note: 'plan du mois : copie des paiements planifiés du mois précédent' },
  SA04: { label: 'Abonnements et dépenses récurrentes', to: '/calendrier', task: 'P6-07', note: 'abonnements et récurrences détectées (ALG-04)' },
  SA05: { label: 'Préparation au financement', to: '/financement', task: 'P6-16', adultsOnly: true },
};

export const SCREEN_CODES = Object.keys(SCREEN_ROUTES);
export const screenByCode = (code) => SCREEN_ROUTES[code] ?? null;

// Screens reserved to adults, as a set: the one list the route guard reads.
export const ADULT_ONLY_SCREENS = SCREEN_CODES.filter((code) => SCREEN_ROUTES[code].adultsOnly);
// And the routes they sit on, deduplicated — what `requireAdult` protects.
export const ADULT_ONLY_ROUTES = [
  ...new Set(ADULT_ONLY_SCREENS.map((code) => SCREEN_ROUTES[code].to).filter(Boolean)),
];

// Per public: the main dashboard, the visible navigation and the enabled
// screens — the client's own words, in the client's own order.
export const JOURNEYS = {
  LYC: {
    dashboard: 'Parcours financier',
    nav: ['Ma semaine', 'Mon argent', 'Mon objectif', 'Défis', 'Apprendre', 'Portefeuille fictif (option pédagogique)', 'Chatbot aide'],
    screens: ['LY01', 'LY02', 'LY03', 'LY09', 'LY10', 'LY11', 'LY12', 'C04', 'C07', 'C09', 'C10', 'C11', 'C17', 'C21', 'C22', 'C24', 'C26'],
  },
  ETU: {
    dashboard: 'Santé financière étudiante',
    nav: ['Aujourd’hui', 'Mon mois', 'Autonomie', 'Mes objectifs', 'Revenus & opportunités', 'Apprendre', 'Investir & simuler (avancé)', 'Chatbot aide'],
    screens: ['ET01', 'ET02', 'ET03', 'ET04', 'ET06', 'ET07', 'ET08', 'ET09', 'C04', 'C05', 'C06', 'C07', 'C08', 'C09', 'C10', 'C11', 'C12', 'C15', 'C17', 'C18', 'C19', 'C20', 'C21', 'C22', 'C23', 'C24', 'C25', 'C26'],
  },
  JAC: {
    dashboard: 'Tableau de bord Premier Revenu',
    nav: ['Aujourd’hui', 'Salaire', 'Mon argent', 'Ma sécurité', 'Mes objectifs', 'Mon patrimoine', 'Investir & simuler', 'Apprendre', 'Explorer', 'Chatbot aide'],
    screens: ['JA01', 'JA02', 'JA03', 'JA04', 'JA07', 'JA08', 'JA09', 'C04', 'C05', 'C06', 'C07', 'C08', 'C09', 'C10', 'C11', 'C12', 'C13', 'C14', 'C15', 'C16', 'C17', 'C18', 'C19', 'C20', 'C21', 'C22', 'C23', 'C24', 'C25', 'C26'],
  },
  SAL: {
    dashboard: 'Santé financière personnelle',
    nav: ['Aujourd’hui', 'Mon argent', 'Salaire', 'Ma sécurité', 'Mes objectifs', 'Mon patrimoine', 'Investir & simuler', 'Explorer', 'Apprendre', 'Chatbot aide'],
    screens: ['SA01', 'SA02', 'SA03', 'SA04', 'SA05', 'C04', 'C05', 'C06', 'C07', 'C08', 'C09', 'C10', 'C11', 'C12', 'C13', 'C14', 'C15', 'C16', 'C17', 'C18', 'C19', 'C20', 'C21', 'C22', 'C23', 'C24', 'C25', 'C26'],
  },
  COL: {
    dashboard: 'Budget partagé',
    nav: ['Espace colocation', 'Dépenses', 'Soldes', 'Budget commun', 'Calendrier', 'Historique', 'Chatbot aide'],
    screens: ['CO01', 'CO02', 'CO03', 'CO04', 'CO05', 'CO06', 'P01', 'P02', 'P03', 'P04', 'P05', 'C06', 'C07', 'C08', 'C09', 'C10', 'C18', 'C22', 'C23', 'C24', 'C25', 'C26'],
  },
  COU: {
    dashboard: 'Finances du couple',
    nav: ['Notre mois', 'Nos objectifs', 'Notre sécurité', 'Notre patrimoine', 'À partager', 'Calendrier', 'Apprendre', 'Chatbot aide'],
    screens: ['CP01', 'CP02', 'CP03', 'CP04', 'P01', 'P02', 'P03', 'P04', 'P05', 'C05', 'C06', 'C07', 'C09', 'C10', 'C11', 'C12', 'C13', 'C16', 'C18', 'C19', 'C21', 'C22', 'C23', 'C24', 'C25', 'C26'],
  },
  FAM: {
    dashboard: 'Finances du foyer',
    nav: ['Aujourd’hui foyer', 'Budget familial', 'Calendrier', 'Enfants & projets', 'Sécurité', 'Patrimoine familial', 'Apprendre', 'Chatbot aide'],
    screens: ['FA01', 'FA02', 'FA03', 'FA04', 'FA05', 'FA06', 'P01', 'P02', 'P03', 'P04', 'P05', 'C05', 'C06', 'C07', 'C09', 'C10', 'C11', 'C12', 'C13', 'C16', 'C18', 'C19', 'C21', 'C22', 'C23', 'C24', 'C25', 'C26'],
  },
  EPG: {
    dashboard: 'Parcours d’épargne',
    nav: ['Aujourd’hui', 'Ma capacité d’épargne', 'Ma réserve', 'Mes objectifs', 'Inflation', 'Investir & simuler', 'Apprendre', 'Explorer', 'Chatbot aide'],
    screens: ['EP01', 'EP02', 'EP03', 'EP04', 'EP05', 'EP06', 'EP07', 'C04', 'C05', 'C06', 'C07', 'C08', 'C09', 'C10', 'C11', 'C12', 'C16', 'C17', 'C18', 'C19', 'C20', 'C21', 'C22', 'C24', 'C25', 'C26'],
  },
};

export const JOURNEY_CODES = Object.keys(JOURNEYS);
export const journeyFor = (publicCode) => JOURNEYS[publicCode] ?? null;

/**
 * Whether a public may open a screen.
 *
 * A screen absent from a public’s journey is NOT theirs: that is the whole
 * point of the map. Somebody with no public yet is not refused — they have not
 * chosen a journey, and refusing them would lock a new account out of its own
 * money — but the adults-only rule still applies to them, because it protects
 * minors rather than shaping a journey.
 */
export function screenEnabledFor(publicCode, code) {
  const journey = journeyFor(publicCode);
  if (!journey) return true;
  return journey.screens.includes(code);
}
