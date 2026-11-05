// Méthodes budgétaires facultatives (P8-09) — GÉNÉRÉ par
// scripts/generate-budget-methods.py depuis les onglets `12_Methodes_Budget` et
// `12B_Mapping_Methodes` du cahier consolidé. Ne pas modifier à la main.
//
// « Cadres facultatifs. Ils analysent le mois mais n'imposent pas
// automatiquement de dépenses ou d'épargne. » `pocket` est la poche par défaut,
// lue dans le texte du client (voir le script) et modifiable par l'utilisateur.

export const BUDGET_METHODS = [
  {
    "id": "M-01",
    "label": "50 / 30 / 20",
    "mainPocket": "Besoins essentiels",
    "target": "50 %",
    "otherPockets": "Envies/flexibles 30 % ; épargne + remboursement accéléré 20 %.",
    "rule": "Comparer réel à cible ; mapping catégories modifiable.",
    "status": "Facultatif"
  },
  {
    "id": "M-02",
    "label": "80 / 20",
    "mainPocket": "Dépenses globales",
    "target": "80 %",
    "otherPockets": "Épargne/objectifs 20 %.",
    "rule": "Méthode simple ; pas de distinction besoin/envie.",
    "status": "Facultatif"
  },
  {
    "id": "M-03",
    "label": "Budget base zéro",
    "mainPocket": "Affectations",
    "target": "100 %",
    "otherPockets": "Revenus prévus entièrement affectés à budgets, objectifs, épargne ou marge.",
    "rule": "Reste à allouer vise 0 ; ne touche pas aux comptes tant que pas de transaction.",
    "status": "Facultatif"
  },
  {
    "id": "M-04",
    "label": "Méthode des enveloppes",
    "mainPocket": "Catégories",
    "target": "Personnalisé",
    "otherPockets": "Chaque enveloppe possède un plafond.",
    "rule": "Analyse % consommé + projection.",
    "status": "Facultatif"
  },
  {
    "id": "M-05",
    "label": "Répartition personnalisée",
    "mainPocket": "Poches définies par l’utilisateur",
    "target": "Libre",
    "otherPockets": "Ex. Essentiel / Projets / Loisirs / Épargne.",
    "rule": "Somme cibles =100 % si méthode proportionnelle.",
    "status": "Facultatif"
  }
];

export const METHOD_MAPPING = [
  {
    "group": "Logement",
    "pocketText": "Besoins essentiels",
    "rule": "50/30/20",
    "pocket": "needs"
  },
  {
    "group": "Alimentation",
    "pocketText": "Besoins essentiels",
    "rule": "50/30/20",
    "pocket": "needs"
  },
  {
    "group": "Transport",
    "pocketText": "Besoins essentiels",
    "rule": "50/30/20",
    "pocket": "needs"
  },
  {
    "group": "Santé & bien-être",
    "pocketText": "Besoins essentiels",
    "rule": "50/30/20",
    "pocket": "needs"
  },
  {
    "group": "Éducation & formation",
    "pocketText": "Besoins essentiels ou investissement personnel",
    "rule": "Configurable",
    "pocket": "needs"
  },
  {
    "group": "Télécom & numérique",
    "pocketText": "Besoins ou envies selon sous-catégorie",
    "rule": "Configurable",
    "pocket": "byEssential"
  },
  {
    "group": "Loisirs & culture",
    "pocketText": "Envies / flexibles",
    "rule": "50/30/20",
    "pocket": "wants"
  },
  {
    "group": "Voyage & vacances",
    "pocketText": "Envies / projets",
    "rule": "Configurable",
    "pocket": "wants"
  },
  {
    "group": "Dettes & engagements",
    "pocketText": "Besoins minimum ; remboursement supplémentaire = poche épargne/dette",
    "rule": "Configurable",
    "pocket": "needs"
  },
  {
    "group": "Épargne / objectifs",
    "pocketText": "Épargne & objectifs",
    "rule": "50/30/20",
    "pocket": "savings"
  },
  {
    "group": "Dons & solidarité",
    "pocketText": "Personnalisé",
    "rule": "Configurable",
    "pocket": "unclassified"
  },
  {
    "group": "Autre",
    "pocketText": "À classer",
    "rule": "Utilisateur",
    "pocket": "unclassified"
  }
];

// The pockets an expense can fall in. `byEssential` reads the sub-category's
// « Essentielle ? » flag (needs when essential, wants otherwise).
export const POCKETS = ['needs', 'wants', 'savings', 'unclassified'];
export const POCKET_RULES = [...POCKETS, 'byEssential'];
