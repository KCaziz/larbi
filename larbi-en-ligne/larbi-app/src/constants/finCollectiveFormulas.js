// Formules et algorithmes de la gestion commune (P9-11) — GÉNÉRÉ par
// scripts/generate-collective-formulas.py depuis les onglets `13_Formules_Algo`
// et `13B_Algorithmes` de FINCLUDIA_Partage_Gestion_Collective_Depenses_Taches.xlsx.
// Ne pas modifier à la main : relancer le script.
//
// `equivalent` : la formule déjà écrite qui fait le même calcul (F041 à F045,
// ALG-02, P6-14). Elle n'est pas écrite deux fois : le moteur sait répondre
// sous les deux identifiants, et l'identifiant collectif est celui que la
// gestion commune expose.

export const COLLECTIVE_FORMULAS = [
  {
    "id": "COL-F01",
    "version": 1,
    "label": "Part égale",
    "rule": "montant / n participants",
    "unit": "money",
    "condition": "Arrondi devise.",
    "equivalent": "F041"
  },
  {
    "id": "COL-F02",
    "version": 1,
    "label": "Part %",
    "rule": "montant × pourcentage_i",
    "unit": "money",
    "condition": "Σ%=100."
  },
  {
    "id": "COL-F03",
    "version": 1,
    "label": "Part pondérée",
    "rule": "montant × poids_i / Σ poids",
    "unit": "money",
    "condition": "Poids positifs."
  },
  {
    "id": "COL-F04",
    "version": 1,
    "label": "Part revenus",
    "rule": "montant × revenu_i / Σ revenus_partagés",
    "unit": "money",
    "condition": "Consentement obligatoire.",
    "equivalent": "F042"
  },
  {
    "id": "COL-F05",
    "version": 1,
    "label": "Solde net membre",
    "rule": "payé_pour_groupe - quote_part_due - règlements_reçus + règlements_versés",
    "unit": "money",
    "condition": "Positif = à recevoir.",
    "equivalent": "F043"
  },
  {
    "id": "COL-F06",
    "version": 1,
    "label": "Budget commun restant",
    "rule": "budget_alloué - Σ dépenses collectives réelles associées",
    "unit": "money",
    "condition": "Peut être négatif."
  },
  {
    "id": "COL-F07",
    "version": 1,
    "label": "Taux consommation budget",
    "rule": "dépenses / budget ×100",
    "unit": "ratio",
    "condition": "Si budget >0."
  },
  {
    "id": "COL-F08",
    "version": 1,
    "label": "Contribution requise",
    "rule": "besoin_collectif - ressources_communes, réparti par règle active",
    "unit": "money",
    "condition": "Sans modifier les comptes personnels avant contribution réelle."
  },
  {
    "id": "COL-F09",
    "version": 1,
    "label": "Provision mensuelle",
    "rule": "(montant prévu - déjà provisionné) / mois restants",
    "unit": "money",
    "condition": "Dépenses annuelles.",
    "equivalent": "F045"
  },
  {
    "id": "COL-F10",
    "version": 1,
    "label": "Progression objectif commun",
    "rule": "capital_affecté / cible ×100",
    "unit": "ratio",
    "condition": "—",
    "equivalent": "F025 / F026"
  },
  {
    "id": "COL-F11",
    "version": 1,
    "label": "Taux tâches terminées",
    "rule": "tâches terminées / tâches échues ou planifiées ×100",
    "unit": "ratio",
    "condition": "Filtre période."
  },
  {
    "id": "COL-F12",
    "version": 1,
    "label": "Charge tâches membre",
    "rule": "Σ poids tâches assignées membre / Σ poids toutes tâches",
    "unit": "ratio",
    "condition": "Indicateur organisationnel, pas jugement."
  },
  {
    "id": "COL-F13",
    "version": 1,
    "label": "Anti-doublon personnel/collectif",
    "rule": "une dépense liée à personal_transaction_id ne crée pas une seconde transaction personnelle",
    "unit": "composite",
    "condition": "Contrainte d’unicité."
  }
];

export const COLLECTIVE_ALGORITHMS = [
  {
    "id": "ALG-C01",
    "version": 1,
    "label": "Règlements simplifiés",
    "rule": "Calculer les soldes nets, séparer créanciers et débiteurs, affecter successivement min(crédit,dette) jusqu’à extinction.",
    "equivalent": "ALG-02"
  },
  {
    "id": "ALG-C02",
    "version": 1,
    "label": "Rattachement budget collectif",
    "rule": "Même période + catégorie/sous-catégorie + espace ; privilégier budget le plus spécifique ; aucune écriture financière créée."
  },
  {
    "id": "ALG-C03",
    "version": 1,
    "label": "Répartition avec arrondis",
    "rule": "Calculer parts théoriques, arrondir à l’unité minimale de devise, affecter l’écart au dernier participant ou selon règle stable versionnée.",
    "equivalent": "P6-14 (arrondi au plus grand reste)"
  },
  {
    "id": "ALG-C04",
    "version": 1,
    "label": "Récurrence tâche/facture",
    "rule": "Générer prochaine occurrence selon fréquence ; une facture prévue reste planifiée jusqu’à confirmation."
  }
];

export const collectiveFormulaById = (id) => COLLECTIVE_FORMULAS.find((formula) => formula.id === id) ?? null;
export const collectiveAlgorithmById = (id) => COLLECTIVE_ALGORITHMS.find((algorithm) => algorithm.id === id) ?? null;
