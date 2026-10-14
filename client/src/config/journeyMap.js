// Carte des parcours (P6-17), onglet client « 19_Cartes_Parcours » : la
// navigation visible de chacun des 8 publics, reprise mot pour mot de ce
// classeur — jamais réinventée. Chaque libellé porte une route RÉELLE quand
// l'écran existe déjà (très souvent un écran du socle commun, réutilisé sous
// plusieurs libellés selon le public plutôt que recopié) ; `to: null` dit
// honnêtement qu'il n'existe pas encore plutôt que de fabriquer un lien mort.
//
// « Chatbot aide » figure dans la navigation visible de chaque public selon
// le classeur, mais ce n'est pas une page : l'assistant (P3-07) est déjà une
// bulle flottante sur chaque écran, donc aucune entrée n'est ajoutée ici pour
// lui — une entrée de plus pointerait vers rien de nouveau.
export const JOURNEY_NAV = {
  LYC: [
    { label: 'Ma semaine', to: '/aujourdhui' },
    { label: 'Mon argent', to: '/mon-argent' },
    { label: 'Mon objectif', to: '/objectifs' },
    // Défis & missions (LY03) : tâche P2-10, abandonnée par décision du
    // client le 2026-10-11 — jamais reprise ici sous un autre nom.
    { label: 'Défis', to: null },
    { label: 'Apprendre', to: '/apprendre' },
    { label: 'Portefeuille fictif', to: '/portefeuille' },
  ],
  ETU: [
    { label: 'Aujourd’hui', to: '/aujourdhui' },
    { label: 'Mon mois', to: '/budget' },
    { label: 'Autonomie', to: '/outils/simulateurs/autonomie-etudiant' },
    { label: 'Mes objectifs', to: '/objectifs' },
    { label: 'Revenus & opportunités', to: '/outils/offres-emploi' },
    { label: 'Apprendre', to: '/apprendre' },
    { label: 'Investir & simuler', to: '/outils/atelier' },
  ],
  JAC: [
    { label: 'Aujourd’hui', to: '/aujourdhui' },
    { label: 'Salaire', to: '/mon-argent' },
    { label: 'Mon argent', to: '/mon-argent' },
    { label: 'Ma sécurité', to: '/reserve' },
    { label: 'Mes objectifs', to: '/objectifs' },
    { label: 'Mon patrimoine', to: '/patrimoine' },
    { label: 'Investir & simuler', to: '/outils/atelier' },
    { label: 'Apprendre', to: '/apprendre' },
    { label: 'Explorer', to: '/outils/explorateur' },
  ],
  SAL: [
    { label: 'Aujourd’hui', to: '/aujourdhui' },
    { label: 'Mon argent', to: '/mon-argent' },
    { label: 'Salaire', to: '/mon-argent' },
    { label: 'Ma sécurité', to: '/reserve' },
    { label: 'Mes objectifs', to: '/objectifs' },
    { label: 'Mon patrimoine', to: '/patrimoine' },
    { label: 'Investir & simuler', to: '/outils/atelier' },
    { label: 'Explorer', to: '/outils/explorateur' },
    { label: 'Apprendre', to: '/apprendre' },
  ],
  COL: [
    { label: 'Espace colocation', to: '/espaces' },
    { label: 'Dépenses', to: '/espaces' },
    { label: 'Soldes', to: '/espaces' },
    { label: 'Budget commun', to: '/espaces' },
    { label: 'Calendrier', to: '/calendrier' },
    { label: 'Historique', to: '/espaces' },
  ],
  COU: [
    { label: 'Notre mois', to: '/budget' },
    { label: 'Nos objectifs', to: '/objectifs' },
    { label: 'Notre sécurité', to: '/reserve' },
    { label: 'Notre patrimoine', to: '/patrimoine' },
    { label: 'À partager', to: '/espaces' },
    { label: 'Calendrier', to: '/calendrier' },
    { label: 'Apprendre', to: '/apprendre' },
  ],
  FAM: [
    { label: 'Aujourd’hui foyer', to: '/aujourdhui' },
    { label: 'Budget familial', to: '/budget' },
    { label: 'Calendrier', to: '/calendrier' },
    { label: 'Enfants & projets', to: '/espaces' },
    { label: 'Sécurité', to: '/reserve' },
    { label: 'Patrimoine familial', to: '/patrimoine' },
    { label: 'Apprendre', to: '/apprendre' },
  ],
  EPG: [
    { label: 'Aujourd’hui', to: '/aujourdhui' },
    { label: 'Ma capacité d’épargne', to: '/outils/simulateurs/capacite-epargne' },
    { label: 'Ma réserve', to: '/reserve' },
    { label: 'Mes objectifs', to: '/objectifs' },
    { label: 'Inflation', to: '/outils/simulateurs/inflation' },
    { label: 'Investir & simuler', to: '/outils/atelier' },
    { label: 'Apprendre', to: '/apprendre' },
    { label: 'Explorer', to: '/outils/explorateur' },
  ],
};

export const journeyNavFor = (finPublic) => JOURNEY_NAV[finPublic] ?? null;
