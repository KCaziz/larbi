// Les 20 modèles d'objectifs financiers (P6-08, contenu de P6-22) — GÉNÉRÉ
// par scripts/generate-assistant-goals.py depuis l'onglet `22_Objectifs_20`.
// Ne pas modifier à la main : relancer le script.
//
// Ils remplacent les 11 modèles génériques que l'équipe avait écrits.
//
// `defaultTarget` et `horizon` sont du TEXTE, tels que le client les a
// écrits : « 3 mois dépenses essentielles; 6 si revenu variable », « 10-30% du
// prix cible, paramétrable », « 6-36 mois ». Les convertir en nombres
// obligerait à choisir entre les deux valeurs d'une condition, ce qui est
// exactement ce que la condition demande de NE PAS faire.
//
// `rule` porte les conditions du client, et plusieurs sont des interdits :
// « ne pas présumer exigence bancaire » (G06), « jamais proposé sans
// intention » (G08), « utiliser banque uniquement si règle vérifiée » (G07).
export const GOAL_MODELS = [
  {
    "code": "G01",
    "label": "Réserve dedepart",
    "defaultTarget": "1 mois de dépenses essentielles",
    "horizon": "3-12 mois",
    "rule": "Priorité si réserve <1 mois.",
    "source": "ODT / Tableau 160"
  },
  {
    "code": "G02",
    "label": "Fonds d’urgence",
    "defaultTarget": "3 mois dépenses essentielles; 6 si revenu variable",
    "horizon": "6-24 mois",
    "rule": "Priorité haute avant investissement.",
    "source": "ODT / Tableau 160"
  },
  {
    "code": "G03",
    "label": "Caution / installation logement",
    "defaultTarget": "Montant saisi + frais installation",
    "horizon": "1-12 mois",
    "rule": "Étudiant/jeune actif.",
    "source": "ODT / Tableau 160"
  },
  {
    "code": "G04",
    "label": "Ordinateur / matériel études",
    "defaultTarget": "Prix cible",
    "horizon": "1-12 mois",
    "rule": "Lycéen/étudiant.",
    "source": "ODT / Tableau 160"
  },
  {
    "code": "G05",
    "label": "Permis de conduire",
    "defaultTarget": "Coût cible",
    "horizon": "3-18 mois",
    "rule": "Objectif personnel.",
    "source": "ODT / Tableau 160"
  },
  {
    "code": "G06",
    "label": "Véhicule–apport",
    "defaultTarget": "10-30% du prix cible, paramétrable",
    "horizon": "6-36 mois",
    "rule": "Ne pas présumer exigence bancaire.",
    "source": "ODT / Tableau 160"
  },
  {
    "code": "G07",
    "label": "Logement–apport",
    "defaultTarget": "Montant choisi / critère banque sélectionné",
    "horizon": "12-60 mois",
    "rule": "Utiliser banque uniquement si règle vérifiée.",
    "source": "ODT / Tableau 160"
  },
  {
    "code": "G08",
    "label": "Mariage / cérémonie",
    "defaultTarget": "Budget utilisateur",
    "horizon": "6-36 mois",
    "rule": "Optionnel; jamais proposé sans intention.",
    "source": "ODT / Tableau 160"
  },
  {
    "code": "G09",
    "label": "Naissance / arrivée enfant",
    "defaultTarget": "Budget équipement + buffer",
    "horizon": "3-18 mois",
    "rule": "Couple/famille.",
    "source": "ODT / Tableau 160"
  },
  {
    "code": "G10",
    "label": "Études enfant",
    "defaultTarget": "Montant cible et horizon",
    "horizon": "Long terme",
    "rule": "Famille.",
    "source": "ODT / Tableau 160"
  },
  {
    "code": "G11",
    "label": "Formation professionnelle",
    "defaultTarget": "Coût + perte de revenu éventuelle",
    "horizon": "3-24 mois",
    "rule": "Jeune actif/salarié.",
    "source": "ODT / Tableau 160"
  },
  {
    "code": "G12",
    "label": "Voyage",
    "defaultTarget": "Transport + hébergement + budget sur place",
    "horizon": "3-18 mois",
    "rule": "Projet discrétionnaire.",
    "source": "ODT / Tableau 160"
  },
  {
    "code": "G13",
    "label": "Travaux logement",
    "defaultTarget": "Budget travaux + marge de sécurité",
    "horizon": "6-36 mois",
    "rule": "Salarié/famille.",
    "source": "ODT / Tableau 160"
  },
  {
    "code": "G14",
    "label": "Électroménager",
    "defaultTarget": "Prix cible",
    "horizon": "1-12 mois",
    "rule": "Comparer épargne préalable vs financement.",
    "source": "ODT / Tableau 160"
  },
  {
    "code": "G15",
    "label": "Remboursement dette",
    "defaultTarget": "Capital restant / échéancier",
    "horizon": "Variable",
    "rule": "Priorité si pression dette élevée.",
    "source": "ODT / Tableau 160"
  },
  {
    "code": "G16",
    "label": "Provision dépenses annuelles",
    "defaultTarget": "Total annuel / 12",
    "horizon": "Permanent",
    "rule": "Assurance, scolarité, entretien, etc.",
    "source": "ODT / Tableau 160"
  },
  {
    "code": "G17",
    "label": "Épargne long terme",
    "defaultTarget": "Montant/horizon",
    "horizon": "3 ans+",
    "rule": "Avant Invest Lab : réserve et dette vérifiées.",
    "source": "ODT / Tableau 160"
  },
  {
    "code": "G18",
    "label": "Retraite indicative",
    "defaultTarget": "Capital cible pédagogique",
    "horizon": "Long terme",
    "rule": "Projection non contractuelle.",
    "source": "ODT / Tableau 160"
  },
  {
    "code": "G19",
    "label": "Projet entrepreneurial personnel",
    "defaultTarget": "Apport cible",
    "horizon": "6-36 mois",
    "rule": "Sans simuler financement pro complet au MVP.",
    "source": "ODT / Tableau 160"
  },
  {
    "code": "G20",
    "label": "Objectif libre",
    "defaultTarget": "Montant + date + priorité",
    "horizon": "Libre",
    "rule": "Toujours disponible.",
    "source": "ODT / Tableau 160"
  }
];

export const GOAL_MODEL_CODES = GOAL_MODELS.map((row) => row.code);
export const goalModel = (code) => GOAL_MODELS.find((row) => row.code === code) ?? null;

// Le modèle libre, toujours disponible : le client le dit explicitement, et
// c'est ce qui évite qu'une personne doive faire entrer son projet dans une
// case qui ne lui va pas.
export const GOAL_MODEL_FREE = GOAL_MODELS.find((row) => /libre/i.test(row.label ?? '')) ?? null;
