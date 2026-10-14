// Global search (P6-20), "Actions" category: a small, local registry of
// screens the search bar can jump straight to. Pure client-side lexical
// matching — nothing here touches the network, so it is instant and asks
// nothing of the server.
export const SEARCH_SCREENS = [
  { to: '/aujourdhui', labelKey: 'nav.today', keywords: ['aujourdhui', 'accueil', 'tableau de bord'] },
  { to: '/mon-argent', labelKey: 'nav.money', keywords: ['argent', 'depense', 'revenu', 'transaction'] },
  { to: '/budget', labelKey: 'nav.budget', keywords: ['budget', 'enveloppe', 'mois'] },
  { to: '/objectifs', labelKey: 'nav.goals', keywords: ['objectif', 'epargne', 'but', 'projet'] },
  { to: '/reserve', labelKey: 'nav.reserve', keywords: ['reserve', 'securite', 'coussin'] },
  { to: '/dettes', labelKey: 'nav.debts', keywords: ['dette', 'credit', 'emprunt', 'pret'] },
  { to: '/financement', labelKey: 'nav.funding', keywords: ['financement', 'dossier', 'preparation'] },
  { to: '/patrimoine', labelKey: 'nav.wealth', keywords: ['patrimoine', 'actif', 'bien'] },
  { to: '/portefeuille', labelKey: 'nav.paper', keywords: ['portefeuille', 'placement', 'investissement', 'simulation'] },
  { to: '/espaces', labelKey: 'nav.spaces', keywords: ['espace', 'coloc', 'couple', 'famille', 'partage'] },
  { to: '/calendrier', labelKey: 'nav.calendar', keywords: ['calendrier', 'echeance', 'recurrence', 'provision'] },
  { to: '/notifications', labelKey: 'nav.notifications', keywords: ['notification', 'alerte', 'rappel'] },
  { to: '/confiance', labelKey: 'nav.trust', keywords: ['confiance', 'donnees', 'export', 'suppression', 'consentement'] },
  { to: '/apprendre', labelKey: 'nav.apprendre', keywords: ['apprendre', 'glossaire', 'guide', 'definition'] },
  { to: '/compte/profil', labelKey: 'account.nav.profile', keywords: ['profil', 'compte'] },
  { to: '/compte/categories', labelKey: 'account.nav.categories', keywords: ['categorie'] },
];
