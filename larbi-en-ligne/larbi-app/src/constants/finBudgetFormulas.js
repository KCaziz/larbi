// Formules de la gestion budgétaire personnelle (P8-01 point 1) et formules
// d'analyse AN-F001 à AN-F016 (onglet `24_Formules` du consolidé) — GÉNÉRÉ par
// scripts/generate-budget-formulas.py depuis l'onglet `13_Formules` de
// FINCLUDIA_Gestion_Budgetaire_Personnelle_Centralisee.xlsx.
// Ne pas modifier à la main : relancer le script.
//
// Les « règles de calcul définitives » du client. Là où une PB-F recouvre une
// F du premier cahier, la PB-F prime. Seule l'unité est de nous : le contrat
// de réponse l'exige et le classeur ne la donne pas en colonne.

export const BUDGET_FORMULAS = [
  {
    "id": "PB-F001",
    "unit": "money",
    "version": 1,
    "label": "Solde courant compte",
    "rule": "solde_initial + Σ crédits réalisés - Σ débits réalisés + Σ transferts entrants - Σ transferts sortants",
    "condition": "Même compte/devise ; statuts réalisés uniquement."
  },
  {
    "id": "PB-F002",
    "unit": "money",
    "version": 1,
    "label": "Solde total",
    "rule": "Σ solde_courant des comptes avec include_in_total = vrai et nature actif/liquide",
    "condition": "Les comptes passifs ne sont pas additionnés comme cash disponible."
  },
  {
    "id": "PB-F003",
    "unit": "money",
    "version": 1,
    "label": "Position nette comptes",
    "rule": "Σ actifs inclus patrimoine - Σ passifs inclus patrimoine",
    "condition": "Vue patrimoine, distincte du solde total disponible."
  },
  {
    "id": "PB-F004",
    "unit": "money",
    "version": 1,
    "label": "Total revenus",
    "rule": "Σ transactions type=Revenu et statut=Réalisé",
    "condition": "Exclut transferts."
  },
  {
    "id": "PB-F005",
    "unit": "money",
    "version": 1,
    "label": "Total dépenses",
    "rule": "Σ transactions type=Dépense et statut=Réalisé",
    "condition": "Exclut transferts."
  },
  {
    "id": "PB-F006",
    "unit": "money",
    "version": 1,
    "label": "Flux net",
    "rule": "PB-F004 - PB-F005",
    "condition": "Par période/filtre."
  },
  {
    "id": "PB-F007",
    "unit": "money",
    "version": 1,
    "label": "Budget alloué total",
    "rule": "Σ montants_alloués des budgets actifs de la période",
    "condition": "N’affecte aucun compte."
  },
  {
    "id": "PB-F008",
    "unit": "money",
    "version": 1,
    "label": "Budget restant catégorie",
    "rule": "montant_alloué - Σ dépenses réelles éligibles de même période + ajustements de report",
    "condition": "Peut être négatif si dépassement."
  },
  {
    "id": "PB-F009",
    "unit": "money",
    "version": 1,
    "label": "Reste à allouer",
    "rule": "revenus_prévus - Σ budgets_alloués - allocations hors budget explicitement planifiées",
    "condition": "Indicateur de planification, pas solde bancaire."
  },
  {
    "id": "PB-F010",
    "unit": "ratio",
    "version": 1,
    "label": "Taux consommation budget",
    "rule": "dépenses éligibles / montant_alloué × 100",
    "condition": "Si budget >0."
  },
  {
    "id": "PB-F011",
    "unit": "money",
    "version": 1,
    "label": "Moyenne journalière dépenses",
    "rule": "Σ dépenses réelles période / nombre de jours écoulés",
    "condition": "Pour mois en cours : jours écoulés >=1."
  },
  {
    "id": "PB-F012",
    "unit": "money",
    "version": 1,
    "label": "Projection dépenses fin période",
    "rule": "moyenne_journalière × nombre_jours_période",
    "condition": "Projection indicative."
  },
  {
    "id": "PB-F013",
    "unit": "money",
    "version": 1,
    "label": "Budget quotidien disponible",
    "rule": "max(0, budget_restant) / jours_restants",
    "condition": "Si jours_restants >0 ; afficher dépassement séparément."
  },
  {
    "id": "PB-F014",
    "unit": "ratio",
    "version": 1,
    "label": "Progression objectif",
    "rule": "capital_affecté / cible ×100",
    "condition": "Affichage plafonné à 100 %, excédent séparé."
  },
  {
    "id": "PB-F015",
    "unit": "money",
    "version": 1,
    "label": "Reste objectif",
    "rule": "max(0, cible-capital_affecté)",
    "condition": "—"
  },
  {
    "id": "PB-F016",
    "unit": "months",
    "version": 1,
    "label": "Mois minimum objectif",
    "rule": "ceil(reste_objectif / contribution_mensuelle)",
    "condition": "Si contribution >0 ; sinon non calculable."
  },
  {
    "id": "PB-F017",
    "unit": "money",
    "version": 1,
    "label": "Cible fonds urgence",
    "rule": "dépenses_essentielles_mensuelles × cible_mois",
    "condition": "Cible_mois pédagogique et modifiable."
  },
  {
    "id": "PB-F018",
    "unit": "months",
    "version": 1,
    "label": "Mois de fonds d’urgence",
    "rule": "capital_fonds_urgence / dépenses_essentielles_mensuelles",
    "condition": "Exclure actifs illiquides."
  },
  {
    "id": "PB-F019",
    "unit": "money",
    "version": 1,
    "label": "Manque fonds urgence",
    "rule": "max(0, cible_fonds - capital_fonds)",
    "condition": "—"
  },
  {
    "id": "PB-F020",
    "unit": "ratio",
    "version": 1,
    "label": "Ratio dette/revenu",
    "rule": "Σ mensualités obligatoires / revenus_nets ×100",
    "condition": "Indicateur descriptif."
  },
  {
    "id": "PB-F021",
    "unit": "date",
    "version": 1,
    "label": "Prochaine date récurrence",
    "rule": "fonction(date_début, fréquence, règle jour, date_fin)",
    "condition": "Aucune création après date_fin."
  },
  {
    "id": "PB-F022",
    "unit": "money",
    "version": 1,
    "label": "Écart prévu/réel",
    "rule": "réel - prévu",
    "condition": "Montant et % si prévu ≠0."
  },
  {
    "id": "PB-F023",
    "unit": "ratio",
    "version": 1,
    "label": "Tendance",
    "rule": "(valeur_période - valeur_période_précédente) / |valeur_période_précédente| ×100",
    "condition": "Si base précédente ≠0."
  },
  {
    "id": "PB-F024",
    "unit": "money",
    "version": 1,
    "label": "Patrimoine net issu comptes",
    "rule": "Σ comptes/actifs patrimoniaux - Σ dettes/passifs",
    "condition": "Complété par autres actifs patrimoniaux si module activé."
  },
  {
    "id": "PB-F025",
    "unit": "money",
    "version": 1,
    "label": "Impact transfert sur solde total",
    "rule": "0 si source et destination sont toutes deux incluses dans le total et même devise ; sinon variation = delta des comptes inclus",
    "condition": "Le transfert reste exclu revenus/dépenses."
  },
  {
    "id": "PB-F026",
    "unit": "count",
    "version": 1,
    "label": "Anti-double impact budget",
    "rule": "une dépense réelle est agrégée une seule fois par transaction_id ; budget_id ne crée aucune seconde écriture",
    "condition": "Contrainte d’unicité."
  },
  {
    "id": "PB-F027",
    "unit": "money",
    "version": 1,
    "label": "Solde carte de crédit",
    "rule": "solde_initial_passif + achats carte + frais/intérêts - remboursements",
    "condition": "Passif ; non ajouté au solde cash."
  },
  {
    "id": "AN-F001",
    "unit": "money",
    "version": 1,
    "label": "Dépenses essentielles",
    "rule": "Σ dépenses réalisées dont catégorie/sous-catégorie = essentielle",
    "condition": "Classification versionnée et modifiable"
  },
  {
    "id": "AN-F002",
    "unit": "money",
    "version": 1,
    "label": "Dépenses flexibles",
    "rule": "Σ dépenses réalisées classées flexibles/discrétionnaires",
    "condition": "Classification visible"
  },
  {
    "id": "AN-F003",
    "unit": "ratio",
    "version": 1,
    "label": "Taux budgets respectés",
    "rule": "nombre budgets actifs avec consommation ≤100 % / nombre budgets actifs ×100",
    "condition": "Si au moins un budget"
  },
  {
    "id": "AN-F004",
    "unit": "ratio",
    "version": 1,
    "label": "Taux de pointage",
    "rule": "transactions pointées ou rapprochées / transactions réelles éligibles ×100",
    "condition": "Exclure transactions supprimées"
  },
  {
    "id": "AN-F005",
    "unit": "ratio",
    "version": 1,
    "label": "Part besoins",
    "rule": "dépenses classées besoins / revenus réalisés ×100",
    "condition": "Méthode 50/30/20"
  },
  {
    "id": "AN-F006",
    "unit": "ratio",
    "version": 1,
    "label": "Part envies",
    "rule": "dépenses classées envies / revenus réalisés ×100",
    "condition": "Méthode 50/30/20"
  },
  {
    "id": "AN-F007",
    "unit": "ratio",
    "version": 1,
    "label": "Part épargne/dette accélérée",
    "rule": "(épargne nette + remboursement dette au-delà du minimum) / revenus ×100",
    "condition": "Mapping visible"
  },
  {
    "id": "AN-F008",
    "unit": "ratio",
    "version": 1,
    "label": "Écart à cible méthode",
    "rule": "part_réelle - part_cible",
    "condition": "Par poche"
  },
  {
    "id": "AN-F009",
    "unit": "money",
    "version": 1,
    "label": "Épargne scénario flexible",
    "rule": "capacité_actuelle + réduction_simulée_dépenses_flexibles",
    "condition": "Simulation uniquement"
  },
  {
    "id": "AN-F010",
    "unit": "money",
    "version": 1,
    "label": "Réduction flexible simulée",
    "rule": "dépenses_flexibles × taux_réduction_saisi",
    "condition": "Taux 0-100 %"
  },
  {
    "id": "AN-F011",
    "unit": "ratio",
    "version": 1,
    "label": "Taux d’épargne scénario",
    "rule": "épargne_scenario / revenus ×100",
    "condition": "Revenus >0"
  },
  {
    "id": "AN-F012",
    "unit": "composite",
    "version": 1,
    "label": "Effet scénario objectif",
    "rule": "nouvelle_contribution appliquée au moteur objectif",
    "condition": "Hypothèses visibles"
  },
  {
    "id": "AN-F013",
    "unit": "money",
    "version": 1,
    "label": "Solde projeté fin mois",
    "rule": "solde_courant + revenus_prévus_confirmables - dépenses/échéances_prévues - projection_variable",
    "condition": "Prévu séparé du réel"
  },
  {
    "id": "AN-F014",
    "unit": "ratio",
    "version": 1,
    "label": "Variation mensuelle",
    "rule": "(valeur_mois - valeur_mois_précédent)/ABS(valeur_mois_précédent)×100",
    "condition": "Base précédente ≠0"
  },
  {
    "id": "AN-F015",
    "unit": "ratio",
    "version": 1,
    "label": "Part catégorie",
    "rule": "dépenses_catégorie / dépenses_totales ×100",
    "condition": "Dépenses >0"
  },
  {
    "id": "AN-F016",
    "unit": "ratio",
    "version": 1,
    "label": "Part compte",
    "rule": "solde_compte / Σ soldes comptes inclus ×100",
    "condition": "Total ≠0"
  }
];

export const budgetFormulaById = (id) => BUDGET_FORMULAS.find((formula) => formula.id === id) ?? null;
