// Les 19 catégories collectives du client (P9-05) — GÉNÉRÉ par
// scripts/generate-collective-categories.py depuis l'onglet `12_Categories` de
// FINCLUDIA_Partage_Gestion_Collective_Depenses_Taches.xlsx.
// Ne pas modifier à la main : relancer le script.
//
// Affichées en premier dans un espace (règle du client B4, « collective_default »).
// Leur correspondance avec les 125 catégories du référentiel personnel n'est
// pas écrite ici : le classeur ne la donne pas, et elle est une question au
// client plutôt qu'une décision de notre part.

export const COLLECTIVE_CATEGORIES = [
  {
    "key": "COLC-01",
    "label": "Loyer / logement",
    "icon": "🏠",
    "color": "#B45309"
  },
  {
    "key": "COLC-02",
    "label": "Courses",
    "icon": "🛒",
    "color": "#16A34A"
  },
  {
    "key": "COLC-03",
    "label": "Électricité",
    "icon": "💡",
    "color": "#EAB308"
  },
  {
    "key": "COLC-04",
    "label": "Gaz",
    "icon": "🔥",
    "color": "#F97316"
  },
  {
    "key": "COLC-05",
    "label": "Eau",
    "icon": "💧",
    "color": "#0EA5E9"
  },
  {
    "key": "COLC-06",
    "label": "Internet",
    "icon": "🌐",
    "color": "#7C3AED"
  },
  {
    "key": "COLC-07",
    "label": "Ménage",
    "icon": "🧹",
    "color": "#0F766E"
  },
  {
    "key": "COLC-08",
    "label": "Équipement commun",
    "icon": "🛋️",
    "color": "#A78BFA"
  },
  {
    "key": "COLC-09",
    "label": "Transport commun",
    "icon": "🚌",
    "color": "#0284C7"
  },
  {
    "key": "COLC-10",
    "label": "Enfants",
    "icon": "🧸",
    "color": "#DB2777"
  },
  {
    "key": "COLC-11",
    "label": "Santé partagée",
    "icon": "🩺",
    "color": "#DC2626"
  },
  {
    "key": "COLC-12",
    "label": "Scolarité",
    "icon": "🎓",
    "color": "#2563A6"
  },
  {
    "key": "COLC-13",
    "label": "Abonnements communs",
    "icon": "🔁",
    "color": "#6D28D9"
  },
  {
    "key": "COLC-14",
    "label": "Sorties",
    "icon": "🎉",
    "color": "#E11D48"
  },
  {
    "key": "COLC-15",
    "label": "Vacances / voyage",
    "icon": "✈️",
    "color": "#0891B2"
  },
  {
    "key": "COLC-16",
    "label": "Projet commun",
    "icon": "🎯",
    "color": "#CA8A04"
  },
  {
    "key": "COLC-17",
    "label": "Animaux",
    "icon": "🐾",
    "color": "#92400E"
  },
  {
    "key": "COLC-18",
    "label": "Événement / fête",
    "icon": "🎂",
    "color": "#F43F5E"
  },
  {
    "key": "COLC-19",
    "label": "Autre",
    "icon": "➕",
    "color": "#64748B"
  }
];

export const COLLECTIVE_CATEGORY_KEYS = COLLECTIVE_CATEGORIES.map((category) => category.key);
