// The 44 screens of the consolidated specification (tab 05_Ecrans_Detailles,
// codes AUTH-01 to CHAT-01), and how each one is served today (P8-21). This is
// the provenance matrix of the budget management: it distinguishes a screen
// served by ITS OWN PAGE from a screen grouped inside another page, because the
// rule of section 6 (« un écran du client a sa propre adresse ») says the
// second is not finished.
//
//   menu    the client's « Menu » column, verbatim
//   served  'page'    its own address
//           'grouped' a section, a form or a panel of the page at `to`
//           'topbar'  in the top bar of every page (search, notifications, help)
//           'pending' not served yet
//   to      the address (`/app/...`), or the page it is grouped in
//   via     the menu entry a person clicks first to reach it (« trouvable » :
//           two clicks at most, from the navigation)
//   owner   the open task that owes what is missing, when it is not a page
export const APP_SCREENS = [
  { code: 'AUTH-01', label: 'Connexion / création de compte', menu: 'Entrée', served: 'page', to: '/connexion', via: null },
  { code: 'ONB-01', label: 'Profil éducatif', menu: 'Premier démarrage', served: 'grouped', to: '/app/parametres/premiers-pas', via: '/app/parametres/premiers-pas', owner: 'P8-23' },
  { code: 'ONB-02', label: 'Premier revenu', menu: 'Premier démarrage', served: 'grouped', to: '/app/parametres/premiers-pas', via: '/app/parametres/premiers-pas', owner: 'P8-23' },
  { code: 'ACC-01', label: 'Accueil', menu: 'Accueil', served: 'page', to: '/app', via: '/app' },
  { code: 'ACC-02', label: 'Ajouter rapidement', menu: 'Accueil', served: 'grouped', to: '/app/mouvements', via: '/app', owner: 'P8-24' },
  { code: 'COM-01', label: 'Mes comptes', menu: 'Mes comptes', served: 'page', to: '/app/comptes', via: '/app/comptes' },
  { code: 'COM-02', label: 'Créer / modifier un compte', menu: 'Mes comptes', served: 'grouped', to: '/app/comptes', via: '/app/comptes', owner: 'P8-25' },
  { code: 'COM-03', label: 'Détail compte', menu: 'Mes comptes', served: 'grouped', to: '/app/comptes', via: '/app/comptes', owner: 'P8-25' },
  { code: 'COM-04', label: 'Nouveau transfert', menu: 'Mes comptes', served: 'grouped', to: '/app/comptes', via: '/app/comptes', owner: 'P8-25' },
  { code: 'TRX-01', label: 'Revenus / Dépenses / Transferts', menu: 'Accueil > mouvements', served: 'page', to: '/app/mouvements', via: '/app/mouvements' },
  { code: 'TRX-02', label: 'Ajouter un revenu ou une dépense', menu: 'Mouvements', served: 'grouped', to: '/app/mouvements', via: '/app/mouvements', owner: 'P8-25' },
  { code: 'TRX-03', label: 'Détail / modifier transaction', menu: 'Mouvements', served: 'grouped', to: '/app/mouvements', via: '/app/mouvements', owner: 'P8-25' },
  { code: 'TRX-04', label: 'Pointage des achats et transactions', menu: 'Mouvements', served: 'grouped', to: '/app/mouvements', via: '/app/mouvements', owner: 'P8-25' },
  { code: 'BUD-01', label: 'Mes budgets', menu: 'Accueil > budgets', served: 'page', to: '/app/budgets', via: '/app/budgets' },
  { code: 'BUD-02', label: 'Créer / modifier budget', menu: 'Budgets', served: 'grouped', to: '/app/budgets', via: '/app/budgets', owner: 'P8-25' },
  { code: 'BUD-03', label: 'Détail budget', menu: 'Budgets', served: 'page', to: '/app/budgets/:id', via: '/app/budgets' },
  { code: 'BUD-04', label: 'Analyse selon méthode', menu: 'Budgets', served: 'grouped', to: '/app/budgets/:id', via: '/app/budgets', owner: 'P8-25' },
  { code: 'SYN-01', label: 'Synthèse', menu: 'Synthèse', served: 'page', to: '/app/synthese', via: '/app/synthese' },
  { code: 'SYN-02', label: 'Rapport mensuel', menu: 'Synthèse', served: 'grouped', to: '/app/synthese', via: '/app/synthese', owner: 'P8-25' },
  { code: 'CAL-01', label: 'Calendrier financier', menu: 'Calendrier', served: 'page', to: '/app/calendrier', via: '/app/calendrier' },
  { code: 'CAL-02', label: 'Paiement / revenu régulier', menu: 'Calendrier', served: 'grouped', to: '/app/calendrier', via: '/app/calendrier', owner: 'P8-25' },
  { code: 'OBJ-01', label: 'Objectifs & sécurité', menu: 'Objectifs', served: 'page', to: '/app/objectifs', via: '/app/objectifs' },
  { code: 'OBJ-02', label: 'Créer objectif', menu: 'Objectifs', served: 'grouped', to: '/app/objectifs', via: '/app/objectifs', owner: 'P8-25' },
  { code: 'OBJ-03', label: 'Détail objectif', menu: 'Objectifs', served: 'grouped', to: '/app/objectifs', via: '/app/objectifs', owner: 'P8-25' },
  { code: 'OBJ-04', label: 'Fonds d’urgence', menu: 'Objectifs & sécurité', served: 'page', to: '/app/objectifs/fonds-urgence', via: '/app/objectifs' },
  { code: 'DET-01', label: 'Mes dettes', menu: 'Dettes', served: 'page', to: '/app/dettes', via: '/app/dettes', adultsOnly: true },
  { code: 'DET-02', label: 'J’ai prêté', menu: 'Dettes', served: 'grouped', to: '/app/dettes', via: '/app/dettes', adultsOnly: true, owner: 'P8-25' },
  { code: 'DET-03', label: 'On m’a prêté — dette simple', menu: 'Dettes', served: 'grouped', to: '/app/dettes', via: '/app/dettes', adultsOnly: true, owner: 'P8-25' },
  { code: 'DET-04', label: 'Dette bancaire / carte', menu: 'Dettes', served: 'grouped', to: '/app/dettes', via: '/app/dettes', adultsOnly: true, owner: 'P8-25' },
  { code: 'DET-05', label: 'Stratégies de remboursement', menu: 'Dettes', served: 'grouped', to: '/app/dettes', via: '/app/dettes', adultsOnly: true, owner: 'P8-25' },
  { code: 'PAT-01', label: 'Patrimoine réel', menu: 'Patrimoine', served: 'page', to: '/app/patrimoine', via: '/app/patrimoine', adultsOnly: true },
  { code: 'PAT-02', label: 'Détail actif réel', menu: 'Patrimoine', served: 'grouped', to: '/app/patrimoine', via: '/app/patrimoine', adultsOnly: true, owner: 'P8-25' },
  { code: 'PF-01', label: 'Portefeuille fictif', menu: 'Portefeuille fictif', served: 'page', to: '/app/portefeuille', via: '/app/portefeuille' },
  { code: 'OUT-01', label: 'Outils', menu: 'Outils', served: 'page', to: '/app/outils', via: '/app/outils' },
  { code: 'OUT-02', label: 'Atelier de simulation', menu: 'Outils', served: 'page', to: '/app/outils/atelier', via: '/app/outils' },
  { code: 'HEA-01', label: 'Indice de santé financière', menu: 'Santé financière', served: 'page', to: '/app/sante', via: '/app/sante' },
  { code: 'FOR-01', label: 'Formation', menu: 'Formation', served: 'page', to: '/app/formation', via: '/app/formation' },
  { code: 'FOR-02', label: 'Progression', menu: 'Progression', served: 'page', to: '/app/progression', via: '/app/progression' },
  { code: 'FOR-03', label: 'Certificats', menu: 'Certificats', served: 'page', to: '/app/certificats', via: '/app/certificats' },
  { code: 'REP-01', label: 'Rapports & téléchargement', menu: 'Synthèse', served: 'grouped', to: '/app/synthese', via: '/app/synthese', owner: 'P8-25' },
  { code: 'SEA-01', label: 'Recherche globale', menu: 'Barre supérieure', served: 'topbar', to: null, via: null },
  { code: 'NOT-01', label: 'Notifications', menu: 'Barre supérieure', served: 'page', to: '/app/notifications', via: null },
  { code: 'DATA-01', label: 'Données & confiance', menu: 'Paramètres', served: 'page', to: '/app/parametres/confiance', via: '/app/parametres/confiance' },
  { code: 'CHAT-01', label: 'Aide FINCLUDIA', menu: 'Aide', served: 'topbar', to: null, via: null },
];

export const SERVED_KINDS = ['page', 'grouped', 'topbar', 'pending'];
