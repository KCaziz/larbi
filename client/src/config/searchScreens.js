// Global search (P6-20), "Actions" category: a small, local registry of
// screens the search bar can jump straight to. Pure client-side lexical
// matching — nothing here touches the network, so it is instant and asks
// nothing of the server.
//
// Since P8-19 it lists the application's own addresses (`/app/...`) and every
// compartment of the client's navigation, the tools and the account settings:
// one registry for the one engine. Gestion commune keeps its entry (« espaces »)
// until it gets its own application (Phase 9).
export const SEARCH_SCREENS = [
  { to: '/app', labelKey: 'appNav.home', keywords: ['accueil', 'tableau de bord', 'solde', 'aujourdhui'] },
  { to: '/app/aujourdhui', labelKey: 'nav.today', keywords: ['aujourdhui', 'a faire', 'actions', 'rappel'] },
  { to: '/app/comptes', labelKey: 'appNav.accounts', keywords: ['compte', 'solde', 'ccp', 'banque', 'especes', 'carte', 'transfert', 'epargne'] },
  { to: '/app/comptes/nouveau', labelKey: 'accounts.add', keywords: ['nouveau compte', 'ajouter compte', 'creer compte'] },
  { to: '/app/comptes/transfert', labelKey: 'accounts.transfer', keywords: ['transfert', 'virement', 'deplacer argent'] },
  { to: '/app/mouvements', labelKey: 'movements.title', keywords: ['mouvement', 'depense', 'revenu', 'transaction', 'historique', 'pointage', 'etiquette'] },
  { to: '/app/mouvements/nouveau', labelKey: 'myMoney.addTitle', keywords: ['ajouter depense', 'ajouter revenu', 'saisir', 'nouveau mouvement'] },
  { to: '/app/synthese', labelKey: 'appNav.synthesis', keywords: ['synthese', 'rapport', 'mois', 'telecharger', 'export', 'csv', 'pdf'] },
  { to: '/app/budgets', labelKey: 'nav.budget', keywords: ['budget', 'enveloppe', 'mois', '50/30/20', 'methode'] },
  { to: '/app/calendrier', labelKey: 'appNav.calendar', keywords: ['calendrier', 'echeance', 'recurrence', 'salaire', 'abonnement', 'provision'] },
  { to: '/app/objectifs', labelKey: 'appNav.goals', keywords: ['objectif', 'epargne', 'but', 'projet', 'scenario'] },
  { to: '/app/objectifs/fonds-urgence', labelKey: 'goals.emergencyTitle', keywords: ['fonds d urgence', 'reserve', 'securite', 'coussin'] },
  { to: '/app/dettes', labelKey: 'appNav.debts', keywords: ['dette', 'credit', 'emprunt', 'pret', 'creance', 'carte de credit'] },
  { to: '/app/patrimoine', labelKey: 'appNav.wealth', keywords: ['patrimoine', 'actif', 'bien', 'valeur nette'] },
  { to: '/app/portefeuille', labelKey: 'appNav.paper', keywords: ['portefeuille', 'placement', 'investissement', 'simulation'] },
  { to: '/app/outils', labelKey: 'appNav.tools', keywords: ['outil', 'calculateur', 'simulateur', 'comparateur'] },
  { to: '/app/sante', labelKey: 'appNav.health', keywords: ['sante', 'indice', 'score'] },
  { to: '/app/financement', labelKey: 'nav.funding', keywords: ['financement', 'dossier', 'preparation'] },
  { to: '/app/formation', labelKey: 'appNav.learning', keywords: ['formation', 'cours', 'parcours', 'apprendre'] },
  { to: '/app/progression', labelKey: 'appNav.progress', keywords: ['progression', 'competence', 'mission', 'jalon'] },
  { to: '/app/certificats', labelKey: 'appNav.certificates', keywords: ['certificat', 'attestation'] },
  { to: '/app/notifications', labelKey: 'nav.notifications', keywords: ['notification', 'alerte', 'rappel'] },
  { to: '/partage', labelKey: 'appNav.sharedApp', keywords: ['espace', 'coloc', 'couple', 'famille', 'partage', 'gestion commune'] },
  { to: '/app/parametres', labelKey: 'appNav.mySpace', keywords: ['parametre', 'mon espace', 'profil', 'devise', 'preference'] },
  { to: '/app/parametres/premiers-pas', labelKey: 'appNav.settingsOnboarding', keywords: ['premiers pas', 'demarrage', 'premier revenu', 'premier salaire'] },
  { to: '/app/parametres/categories', labelKey: 'appNav.settingsCategories', keywords: ['categorie', 'essentielle'] },
  { to: '/app/parametres/confiance', labelKey: 'appNav.settingsTrust', keywords: ['confiance', 'donnees', 'export', 'suppression', 'consentement', 'confidentialite'] },
  { to: '/app/apprendre', labelKey: 'nav.apprendre', keywords: ['apprendre', 'glossaire', 'guide', 'definition'] },
];
