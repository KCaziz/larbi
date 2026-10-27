// Types de comptes (P8-03) — GÉNÉRÉ par scripts/generate-accounts.py depuis
// l'onglet `04_Comptes` de FINCLUDIA_Gestion_Budgetaire_Personnelle_Centralisee.xlsx.
// Ne pas modifier à la main : relancer le script.
//
// « Les comptes sont la source de vérité des soldes » (ARC-04). Les colonnes
// du client sont gardées en texte ; `nature` et les deux booléens par défaut
// en sont une lecture mécanique (voir le script).

export const ACCOUNT_TYPES = [
  {
    "id": "AC-01",
    "label": "Espèces",
    "natureText": "Actif liquide",
    "nature": "liquid",
    "icon": "💵",
    "color": "#2E7D32",
    "includeInTotalText": "Oui par défaut",
    "includeInNetWorthText": "Oui",
    "includeInTotal": true,
    "includeInNetWorth": true,
    "rule": "Solde manuel ; pas de moyen bancaire."
  },
  {
    "id": "AC-02",
    "label": "Compte courant bancaire",
    "natureText": "Actif liquide",
    "nature": "liquid",
    "icon": "🏦",
    "color": "#2563A6",
    "includeInTotalText": "Oui par défaut",
    "includeInNetWorthText": "Oui",
    "includeInTotal": true,
    "includeInNetWorth": true,
    "rule": "Peut avoir découvert autorisé."
  },
  {
    "id": "AC-03",
    "label": "CCP",
    "natureText": "Actif liquide",
    "nature": "liquid",
    "icon": "📮",
    "color": "#0F766E",
    "includeInTotalText": "Oui par défaut",
    "includeInNetWorthText": "Oui",
    "includeInTotal": true,
    "includeInNetWorth": true,
    "rule": "Compte courant postal."
  },
  {
    "id": "AC-04",
    "label": "Compte d’épargne",
    "natureText": "Actif liquide/épargne",
    "nature": "savings",
    "icon": "🐷",
    "color": "#7E57C2",
    "includeInTotalText": "Oui configurable",
    "includeInNetWorthText": "Oui",
    "includeInTotal": true,
    "includeInNetWorth": true,
    "rule": "Transferts vers ce compte = épargne, pas dépense de consommation."
  },
  {
    "id": "AC-05",
    "label": "Portefeuille / paiement mobile",
    "natureText": "Actif liquide",
    "nature": "liquid",
    "icon": "📱",
    "color": "#14B8A6",
    "includeInTotalText": "Oui configurable",
    "includeInNetWorthText": "Oui",
    "includeInTotal": true,
    "includeInNetWorth": true,
    "rule": "Solde déclaré/importé."
  },
  {
    "id": "AC-06",
    "label": "Compte investissement",
    "natureText": "Actif financier",
    "nature": "investment",
    "icon": "📈",
    "color": "#6D28D9",
    "includeInTotalText": "Non par défaut",
    "includeInNetWorthText": "Oui",
    "includeInTotal": false,
    "includeInNetWorth": true,
    "rule": "Valeur patrimoniale ; transactions d’investissement séparées."
  },
  {
    "id": "AC-07",
    "label": "Carte de crédit / débit différé",
    "natureText": "Passif / dette",
    "nature": "liability",
    "icon": "💳",
    "color": "#C62828",
    "includeInTotalText": "Non",
    "includeInNetWorthText": "Oui comme passif",
    "includeInTotal": false,
    "includeInNetWorth": true,
    "rule": "Les achats débitent le passif ; le règlement réduit la dette."
  },
  {
    "id": "AC-08",
    "label": "Prêt / crédit bancaire",
    "natureText": "Passif / dette",
    "nature": "liability",
    "icon": "🏛️",
    "color": "#B91C1C",
    "includeInTotalText": "Non",
    "includeInNetWorthText": "Oui comme passif",
    "includeInTotal": false,
    "includeInNetWorth": true,
    "rule": "Échéancier, taux/coût, mensualité."
  },
  {
    "id": "AC-09",
    "label": "Créance — argent prêté",
    "natureText": "Actif créance",
    "nature": "receivable",
    "icon": "🤝",
    "color": "#CA8A04",
    "includeInTotalText": "Non par défaut",
    "includeInNetWorthText": "Oui",
    "includeInTotal": false,
    "includeInNetWorth": true,
    "rule": "Somme due à l’utilisateur."
  },
  {
    "id": "AC-10",
    "label": "Autre compte suivi",
    "natureText": "Configurable",
    "nature": "configurable",
    "icon": "🗂️",
    "color": "#64748B",
    "includeInTotalText": "Configurable",
    "includeInNetWorthText": "Configurable",
    "includeInTotal": false,
    "includeInNetWorth": false,
    "rule": "Type libre avec règles explicites."
  }
];

export const ACCOUNT_TYPE_IDS = ACCOUNT_TYPES.map((type) => type.id);
export const accountType = (id) => ACCOUNT_TYPES.find((type) => type.id === id) ?? null;

// The account created when someone records a movement without having any
// (PB-PR-04), and the one savings move into.
export const CASH_ACCOUNT_TYPE = 'AC-01';
export const SAVINGS_ACCOUNT_TYPE = 'AC-04';

// A liability is never added to the cash available (PB-F002) and counts
// negatively in the net position (PB-F003).
export const isLiability = (typeId) => accountType(typeId)?.nature === 'liability';

// Moyens de paiement PM-01 à PM-10 (onglet `05B_Moyens_Paiement`), distincts
// des comptes (P8-07).
export const PAYMENT_METHODS_REFERENCE = [
  {
    "id": "PM-01",
    "label": "Espèces",
    "icon": "💵",
    "color": "#2E7D32",
    "rule": "Compte Espèces recommandé"
  },
  {
    "id": "PM-02",
    "label": "Carte de débit",
    "icon": "💳",
    "color": "#2563A6",
    "rule": "Liée au compte courant choisi"
  },
  {
    "id": "PM-03",
    "label": "Carte de crédit",
    "icon": "💳",
    "color": "#C62828",
    "rule": "Liée à un compte passif carte de crédit"
  },
  {
    "id": "PM-04",
    "label": "Virement bancaire",
    "icon": "🏦",
    "color": "#0F766E",
    "rule": "Compte bancaire source/destination"
  },
  {
    "id": "PM-05",
    "label": "Prélèvement automatique",
    "icon": "🔁",
    "color": "#7E57C2",
    "rule": "Souvent récurrent"
  },
  {
    "id": "PM-06",
    "label": "Paiement mobile",
    "icon": "📱",
    "color": "#14B8A6",
    "rule": "Compte/portefeuille source"
  },
  {
    "id": "PM-07",
    "label": "Paiement en ligne",
    "icon": "🌐",
    "color": "#3B82F6",
    "rule": "Compte/carte choisi"
  },
  {
    "id": "PM-08",
    "label": "Bon d’achat / voucher",
    "icon": "🎟️",
    "color": "#CA8A04",
    "rule": "Peut être suivi hors solde si non monétaire"
  },
  {
    "id": "PM-09",
    "label": "Chèque",
    "icon": "🧾",
    "color": "#64748B",
    "rule": "Compte bancaire source"
  },
  {
    "id": "PM-10",
    "label": "Autre",
    "icon": "➕",
    "color": "#94A3B8",
    "rule": "Description obligatoire"
  }
];
export const PAYMENT_METHOD_IDS = PAYMENT_METHODS_REFERENCE.map((method) => method.id);
