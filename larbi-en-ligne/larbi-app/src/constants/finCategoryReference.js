// Référentiel universel des catégories (P8-08) — GÉNÉRÉ par
// scripts/generate-categories.py depuis l'onglet `09_Categories` du cahier
// consolidé. Ne pas modifier à la main : relancer le script.
//
// Les 125 catégories du client, mot pour mot. `mergedFrom` nomme l'ancienne
// catégorie (P6-02) que la nouvelle a absorbée : elle en garde la clé et
// l'identifiant, donc ses mouvements. `family` est une lecture mécanique de la
// récurrence typique (voir le script) : elle propose un type d'enveloppe, elle
// ne restreint rien. « Suggéré pour » ne fixe qu'un ordre d'affichage.

export const REFERENCE_CATEGORIES = [
  {
    "key": "income.salaire_net",
    "family": "income",
    "group": "Salaire & emploi",
    "label": "Salaire net",
    "icon": "💼",
    "color": "#2563A6",
    "essential": true,
    "recurrence": "Mensuel",
    "suggestedFor": [
      "Jeune actif",
      "Salarié"
    ],
    "mergedFrom": "income.salaire_net"
  },
  {
    "key": "income.prime",
    "family": "income",
    "group": "Salaire & emploi",
    "label": "Prime / bonus",
    "icon": "⭐",
    "color": "#3B82F6",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Jeune actif",
      "Salarié"
    ],
    "mergedFrom": "income.prime"
  },
  {
    "key": "income.heures_supplementaires",
    "family": "income",
    "group": "Salaire & emploi",
    "label": "Heures supplémentaires",
    "icon": "⏱️",
    "color": "#60A5FA",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Jeune actif",
      "Salarié"
    ],
    "mergedFrom": null
  },
  {
    "key": "income.commission",
    "family": "income",
    "group": "Salaire & emploi",
    "label": "Commission",
    "icon": "🎯",
    "color": "#0EA5E9",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Jeune actif",
      "Salarié"
    ],
    "mergedFrom": null
  },
  {
    "key": "income.indemnite_avantage_monetise",
    "family": "income",
    "group": "Salaire & emploi",
    "label": "Indemnité / avantage monétisé",
    "icon": "🧾",
    "color": "#0284C7",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Jeune actif",
      "Salarié"
    ],
    "mergedFrom": null
  },
  {
    "key": "income.bourse",
    "family": "income",
    "group": "Études & jeunesse",
    "label": "Bourse",
    "icon": "🎓",
    "color": "#7E57C2",
    "essential": true,
    "recurrence": "Mensuel/Trimestriel",
    "suggestedFor": [
      "Lycéen",
      "Étudiant"
    ],
    "mergedFrom": "income.bourse"
  },
  {
    "key": "income.aide_familiale",
    "family": "income",
    "group": "Études & jeunesse",
    "label": "Aide familiale",
    "icon": "👪",
    "color": "#A855F7",
    "essential": true,
    "recurrence": "Variable",
    "suggestedFor": [
      "Lycéen",
      "Étudiant"
    ],
    "mergedFrom": "income.aide_familiale"
  },
  {
    "key": "income.job_etudiant",
    "family": "income",
    "group": "Études & jeunesse",
    "label": "Job étudiant",
    "icon": "🧑‍💼",
    "color": "#8B5CF6",
    "essential": true,
    "recurrence": "Variable",
    "suggestedFor": [
      "Étudiant"
    ],
    "mergedFrom": "income.job_etudiant"
  },
  {
    "key": "income.stage_remunere",
    "family": "income",
    "group": "Études & jeunesse",
    "label": "Stage rémunéré",
    "icon": "🧑‍🎓",
    "color": "#6D28D9",
    "essential": true,
    "recurrence": "Variable",
    "suggestedFor": [
      "Étudiant"
    ],
    "mergedFrom": "income.stage_remunere"
  },
  {
    "key": "income.freelance_mission",
    "family": "income",
    "group": "Indépendant",
    "label": "Freelance / mission",
    "icon": "🧑‍💻",
    "color": "#0F766E",
    "essential": true,
    "recurrence": "Variable",
    "suggestedFor": [
      "Étudiant",
      "Jeune actif",
      "Salarié"
    ],
    "mergedFrom": "income.freelance_mission"
  },
  {
    "key": "income.honoraires_prestations",
    "family": "income",
    "group": "Indépendant",
    "label": "Honoraires / prestations",
    "icon": "🛠️",
    "color": "#14B8A6",
    "essential": true,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous"
    ],
    "mergedFrom": null
  },
  {
    "key": "income.vente_petite_activite",
    "family": "income",
    "group": "Indépendant",
    "label": "Vente / petite activité",
    "icon": "🛍️",
    "color": "#2DD4BF",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous"
    ],
    "mergedFrom": null
  },
  {
    "key": "income.revenu_locatif",
    "family": "income",
    "group": "Patrimoine",
    "label": "Loyer reçu",
    "icon": "🏠",
    "color": "#B45309",
    "essential": true,
    "recurrence": "Mensuel",
    "suggestedFor": [
      "Tous"
    ],
    "mergedFrom": "income.revenu_locatif"
  },
  {
    "key": "income.dividende_revenu_de_placement_declare",
    "family": "income",
    "group": "Patrimoine",
    "label": "Dividendes",
    "icon": "📈",
    "color": "#16A34A",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous"
    ],
    "mergedFrom": "income.dividende_revenu_de_placement_declare"
  },
  {
    "key": "income.interets_rendement",
    "family": "income",
    "group": "Patrimoine",
    "label": "Intérêts / rendement",
    "icon": "💹",
    "color": "#22C55E",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous"
    ],
    "mergedFrom": null
  },
  {
    "key": "income.coupon_obligation_sukuk",
    "family": "income",
    "group": "Patrimoine",
    "label": "Coupon obligation / sukuk",
    "icon": "📜",
    "color": "#4D7C0F",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous"
    ],
    "mergedFrom": null
  },
  {
    "key": "income.pension",
    "family": "income",
    "group": "Social & pensions",
    "label": "Retraite / pension",
    "icon": "🌅",
    "color": "#64748B",
    "essential": true,
    "recurrence": "Mensuel",
    "suggestedFor": [
      "Tous"
    ],
    "mergedFrom": "income.pension"
  },
  {
    "key": "income.allocation_aide",
    "family": "income",
    "group": "Social & pensions",
    "label": "Allocation / aide publique",
    "icon": "🏛️",
    "color": "#475569",
    "essential": true,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous"
    ],
    "mergedFrom": "income.allocation_aide"
  },
  {
    "key": "income.cadeau_don_recu",
    "family": "income",
    "group": "Exceptionnel",
    "label": "Cadeau / don reçu",
    "icon": "🎁",
    "color": "#DB2777",
    "essential": false,
    "recurrence": "Ponctuel",
    "suggestedFor": [
      "Tous"
    ],
    "mergedFrom": null
  },
  {
    "key": "income.heritage_transmission",
    "family": "income",
    "group": "Exceptionnel",
    "label": "Héritage / transmission",
    "icon": "📦",
    "color": "#BE185D",
    "essential": false,
    "recurrence": "Ponctuel",
    "suggestedFor": [
      "Tous"
    ],
    "mergedFrom": null
  },
  {
    "key": "income.remboursement_recu",
    "family": "income",
    "group": "Exceptionnel",
    "label": "Remboursement reçu",
    "icon": "↩️",
    "color": "#0891B2",
    "essential": false,
    "recurrence": "Ponctuel",
    "suggestedFor": [
      "Tous"
    ],
    "mergedFrom": null
  },
  {
    "key": "income.indemnisation_assurance",
    "family": "income",
    "group": "Exceptionnel",
    "label": "Indemnisation assurance",
    "icon": "🛡️",
    "color": "#0369A1",
    "essential": false,
    "recurrence": "Ponctuel",
    "suggestedFor": [
      "Tous"
    ],
    "mergedFrom": null
  },
  {
    "key": "income.vente_dun_actif",
    "family": "income",
    "group": "Exceptionnel",
    "label": "Vente d’un actif",
    "icon": "🏷️",
    "color": "#9A3412",
    "essential": false,
    "recurrence": "Ponctuel",
    "suggestedFor": [
      "Tous"
    ],
    "mergedFrom": null
  },
  {
    "key": "income.autre_revenu",
    "family": "income",
    "group": "Autre",
    "label": "Autre revenu",
    "icon": "➕",
    "color": "#64748B",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous"
    ],
    "mergedFrom": "income.autre_revenu"
  },
  {
    "key": "fixed.loyer",
    "family": "fixed",
    "group": "Logement",
    "label": "Loyer",
    "icon": "🏠",
    "color": "#B45309",
    "essential": true,
    "recurrence": "Mensuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": "fixed.loyer"
  },
  {
    "key": "fixed.credit_immobilier",
    "family": "fixed",
    "group": "Logement",
    "label": "Crédit immobilier",
    "icon": "🏦",
    "color": "#92400E",
    "essential": true,
    "recurrence": "Mensuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": "fixed.credit_immobilier"
  },
  {
    "key": "fixed.copropriete_charges",
    "family": "fixed",
    "group": "Logement",
    "label": "Charges / copropriété",
    "icon": "🏢",
    "color": "#A16207",
    "essential": true,
    "recurrence": "Mensuel/Trimestriel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": "fixed.copropriete_charges"
  },
  {
    "key": "fixed.electricite",
    "family": "fixed",
    "group": "Logement",
    "label": "Électricité",
    "icon": "💡",
    "color": "#EAB308",
    "essential": true,
    "recurrence": "Mensuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": "fixed.electricite"
  },
  {
    "key": "fixed.gaz",
    "family": "fixed",
    "group": "Logement",
    "label": "Gaz",
    "icon": "🔥",
    "color": "#F97316",
    "essential": true,
    "recurrence": "Mensuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": "fixed.gaz"
  },
  {
    "key": "fixed.eau",
    "family": "fixed",
    "group": "Logement",
    "label": "Eau",
    "icon": "💧",
    "color": "#0EA5E9",
    "essential": true,
    "recurrence": "Mensuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": "fixed.eau"
  },
  {
    "key": "variable.entretien_logement",
    "family": "variable",
    "group": "Logement",
    "label": "Entretien logement",
    "icon": "🧰",
    "color": "#78716C",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.reparation",
    "family": "variable",
    "group": "Logement",
    "label": "Réparation",
    "icon": "🔧",
    "color": "#57534E",
    "essential": false,
    "recurrence": "Ponctuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.mobilier_decoration",
    "family": "variable",
    "group": "Logement",
    "label": "Mobilier / décoration",
    "icon": "🛋️",
    "color": "#A78BFA",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "fixed.securite_gardiennage",
    "family": "fixed",
    "group": "Logement",
    "label": "Sécurité / gardiennage",
    "icon": "🔐",
    "color": "#334155",
    "essential": false,
    "recurrence": "Mensuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.alimentation_boissons",
    "family": "variable",
    "group": "Alimentation",
    "label": "Courses alimentaires",
    "icon": "🛒",
    "color": "#16A34A",
    "essential": true,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": "variable.alimentation_boissons"
  },
  {
    "key": "variable.boulangerie_proximite",
    "family": "variable",
    "group": "Alimentation",
    "label": "Boulangerie / proximité",
    "icon": "🥖",
    "color": "#65A30D",
    "essential": true,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.restaurant",
    "family": "variable",
    "group": "Alimentation",
    "label": "Restaurant",
    "icon": "🍽️",
    "color": "#EA580C",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.cafe_snack",
    "family": "variable",
    "group": "Alimentation",
    "label": "Café / snack",
    "icon": "☕",
    "color": "#D97706",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.livraison_repas",
    "family": "variable",
    "group": "Alimentation",
    "label": "Livraison repas",
    "icon": "🛵",
    "color": "#F59E0B",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.repas_ecole_travail",
    "family": "variable",
    "group": "Alimentation",
    "label": "Repas école / travail",
    "icon": "🥗",
    "color": "#84CC16",
    "essential": true,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.transport_public",
    "family": "variable",
    "group": "Transport",
    "label": "Transport public",
    "icon": "🚌",
    "color": "#0284C7",
    "essential": true,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.carburant",
    "family": "variable",
    "group": "Transport",
    "label": "Carburant",
    "icon": "⛽",
    "color": "#0369A1",
    "essential": true,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.taxi_vtc",
    "family": "variable",
    "group": "Transport",
    "label": "Taxi / VTC",
    "icon": "🚕",
    "color": "#0EA5E9",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.parking_peage",
    "family": "variable",
    "group": "Transport",
    "label": "Parking / péage",
    "icon": "🅿️",
    "color": "#64748B",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.entretien_vehicule",
    "family": "variable",
    "group": "Transport",
    "label": "Entretien véhicule",
    "icon": "🔧",
    "color": "#475569",
    "essential": true,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.pieces_pneus",
    "family": "variable",
    "group": "Transport",
    "label": "Pièces / pneus",
    "icon": "🛞",
    "color": "#334155",
    "essential": false,
    "recurrence": "Ponctuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "seasonal.assurance_vehicule",
    "family": "seasonal",
    "group": "Transport",
    "label": "Assurance véhicule",
    "icon": "🛡️",
    "color": "#1D4ED8",
    "essential": true,
    "recurrence": "Annuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.location_vehicule",
    "family": "variable",
    "group": "Transport",
    "label": "Location véhicule",
    "icon": "🚙",
    "color": "#2563A6",
    "essential": false,
    "recurrence": "Ponctuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "fixed.telephone",
    "family": "fixed",
    "group": "Télécom & numérique",
    "label": "Téléphone mobile",
    "icon": "📱",
    "color": "#7C3AED",
    "essential": true,
    "recurrence": "Mensuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": "fixed.telephone"
  },
  {
    "key": "fixed.internet",
    "family": "fixed",
    "group": "Télécom & numérique",
    "label": "Internet",
    "icon": "🌐",
    "color": "#6D28D9",
    "essential": true,
    "recurrence": "Mensuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": "fixed.internet"
  },
  {
    "key": "fixed.streaming_video",
    "family": "fixed",
    "group": "Télécom & numérique",
    "label": "Streaming vidéo",
    "icon": "🎬",
    "color": "#9333EA",
    "essential": false,
    "recurrence": "Mensuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "fixed.musique_media",
    "family": "fixed",
    "group": "Télécom & numérique",
    "label": "Musique / média",
    "icon": "🎵",
    "color": "#A855F7",
    "essential": false,
    "recurrence": "Mensuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "fixed.cloud_stockage",
    "family": "fixed",
    "group": "Télécom & numérique",
    "label": "Cloud / stockage",
    "icon": "☁️",
    "color": "#8B5CF6",
    "essential": false,
    "recurrence": "Mensuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "fixed.logiciel_application",
    "family": "fixed",
    "group": "Télécom & numérique",
    "label": "Logiciel / application",
    "icon": "💻",
    "color": "#4F46E5",
    "essential": false,
    "recurrence": "Mensuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.jeux_video",
    "family": "variable",
    "group": "Télécom & numérique",
    "label": "Jeux vidéo",
    "icon": "🎮",
    "color": "#6366F1",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.materiel_numerique",
    "family": "variable",
    "group": "Télécom & numérique",
    "label": "Matériel numérique",
    "icon": "🖥️",
    "color": "#4338CA",
    "essential": false,
    "recurrence": "Ponctuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.medecin",
    "family": "variable",
    "group": "Santé & bien-être",
    "label": "Médecin",
    "icon": "🩺",
    "color": "#DC2626",
    "essential": true,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.pharmacie",
    "family": "variable",
    "group": "Santé & bien-être",
    "label": "Pharmacie",
    "icon": "💊",
    "color": "#EF4444",
    "essential": true,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.analyses_imagerie",
    "family": "variable",
    "group": "Santé & bien-être",
    "label": "Analyses / imagerie",
    "icon": "🧪",
    "color": "#F43F5E",
    "essential": true,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.dentaire",
    "family": "variable",
    "group": "Santé & bien-être",
    "label": "Dentaire",
    "icon": "🦷",
    "color": "#E11D48",
    "essential": true,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.optique",
    "family": "variable",
    "group": "Santé & bien-être",
    "label": "Optique",
    "icon": "👓",
    "color": "#BE123C",
    "essential": true,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.hospitalisation",
    "family": "variable",
    "group": "Santé & bien-être",
    "label": "Hospitalisation",
    "icon": "🏥",
    "color": "#991B1B",
    "essential": true,
    "recurrence": "Ponctuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "fixed.assurance_mutuelle_sante",
    "family": "fixed",
    "group": "Santé & bien-être",
    "label": "Assurance / mutuelle santé",
    "icon": "🛡️",
    "color": "#9F1239",
    "essential": true,
    "recurrence": "Mensuel/Annuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.hygiene_soins",
    "family": "variable",
    "group": "Santé & bien-être",
    "label": "Hygiène / soins",
    "icon": "🧴",
    "color": "#FB7185",
    "essential": true,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "fixed.sport_salle",
    "family": "fixed",
    "group": "Santé & bien-être",
    "label": "Sport / salle",
    "icon": "🏋️",
    "color": "#F97316",
    "essential": false,
    "recurrence": "Mensuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.bien_etre",
    "family": "variable",
    "group": "Santé & bien-être",
    "label": "Bien-être",
    "icon": "🧘",
    "color": "#FDA4AF",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "fixed.scolarite_etudes",
    "family": "fixed",
    "group": "Éducation & formation",
    "label": "Frais de scolarité / université",
    "icon": "🎓",
    "color": "#2563A6",
    "essential": true,
    "recurrence": "Annuel/Semestriel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": "fixed.scolarite_etudes"
  },
  {
    "key": "variable.livres",
    "family": "variable",
    "group": "Éducation & formation",
    "label": "Livres",
    "icon": "📚",
    "color": "#3B82F6",
    "essential": true,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.etudes_fournitures",
    "family": "variable",
    "group": "Éducation & formation",
    "label": "Fournitures",
    "icon": "✏️",
    "color": "#60A5FA",
    "essential": true,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": "variable.etudes_fournitures"
  },
  {
    "key": "variable.cours_soutien",
    "family": "variable",
    "group": "Éducation & formation",
    "label": "Cours / soutien",
    "icon": "🧑‍🏫",
    "color": "#0EA5E9",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.formation_professionnelle",
    "family": "variable",
    "group": "Éducation & formation",
    "label": "Formation professionnelle",
    "icon": "📘",
    "color": "#0284C7",
    "essential": false,
    "recurrence": "Ponctuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.certification_examen",
    "family": "variable",
    "group": "Éducation & formation",
    "label": "Certification / examen",
    "icon": "📝",
    "color": "#0369A1",
    "essential": false,
    "recurrence": "Ponctuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "fixed.creche_garde",
    "family": "fixed",
    "group": "Enfants & famille",
    "label": "Crèche / garde",
    "icon": "🧸",
    "color": "#DB2777",
    "essential": true,
    "recurrence": "Mensuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.scolarite_enfant",
    "family": "variable",
    "group": "Enfants & famille",
    "label": "Scolarité enfant",
    "icon": "🏫",
    "color": "#BE185D",
    "essential": true,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.transport_enfant",
    "family": "variable",
    "group": "Enfants & famille",
    "label": "Transport enfant",
    "icon": "🚌",
    "color": "#9D174D",
    "essential": true,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.vetements_enfant",
    "family": "variable",
    "group": "Enfants & famille",
    "label": "Vêtements enfant",
    "icon": "👕",
    "color": "#EC4899",
    "essential": true,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.activites_enfant",
    "family": "variable",
    "group": "Enfants & famille",
    "label": "Activités enfant",
    "icon": "⚽",
    "color": "#F472B6",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.argent_de_poche",
    "family": "variable",
    "group": "Enfants & famille",
    "label": "Argent de poche",
    "icon": "🪙",
    "color": "#FDA4AF",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.aide_familiale_versee",
    "family": "variable",
    "group": "Enfants & famille",
    "label": "Aide familiale versée",
    "icon": "🤝",
    "color": "#C026D3",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.habillement",
    "family": "variable",
    "group": "Vêtements & soins personnels",
    "label": "Vêtements",
    "icon": "👕",
    "color": "#9333EA",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": "variable.habillement"
  },
  {
    "key": "variable.chaussures",
    "family": "variable",
    "group": "Vêtements & soins personnels",
    "label": "Chaussures",
    "icon": "👟",
    "color": "#7E22CE",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.coiffeur_esthetique",
    "family": "variable",
    "group": "Vêtements & soins personnels",
    "label": "Coiffeur / esthétique",
    "icon": "💇",
    "color": "#A855F7",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.cosmetiques",
    "family": "variable",
    "group": "Vêtements & soins personnels",
    "label": "Cosmétiques",
    "icon": "🧴",
    "color": "#C084FC",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.produits_menagers",
    "family": "variable",
    "group": "Maison & équipement",
    "label": "Produits ménagers",
    "icon": "🧹",
    "color": "#0F766E",
    "essential": true,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.petit_equipement",
    "family": "variable",
    "group": "Maison & équipement",
    "label": "Petit équipement",
    "icon": "🔌",
    "color": "#14B8A6",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.electromenager",
    "family": "variable",
    "group": "Maison & équipement",
    "label": "Électroménager",
    "icon": "🧺",
    "color": "#0D9488",
    "essential": false,
    "recurrence": "Ponctuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.travaux_renovation",
    "family": "variable",
    "group": "Maison & équipement",
    "label": "Travaux / rénovation",
    "icon": "🧱",
    "color": "#115E59",
    "essential": false,
    "recurrence": "Ponctuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.sorties",
    "family": "variable",
    "group": "Loisirs & culture",
    "label": "Sorties",
    "icon": "🎉",
    "color": "#E11D48",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.cinema_spectacle",
    "family": "variable",
    "group": "Loisirs & culture",
    "label": "Cinéma / spectacle",
    "icon": "🎭",
    "color": "#BE123C",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.culture_livres_loisirs",
    "family": "variable",
    "group": "Loisirs & culture",
    "label": "Culture / livres loisirs",
    "icon": "📖",
    "color": "#9F1239",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.hobbies",
    "family": "variable",
    "group": "Loisirs & culture",
    "label": "Hobbies",
    "icon": "🎨",
    "color": "#F43F5E",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.jeux_divertissement",
    "family": "variable",
    "group": "Loisirs & culture",
    "label": "Jeux / divertissement",
    "icon": "🎲",
    "color": "#FB7185",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.transport_voyage",
    "family": "variable",
    "group": "Voyage & vacances",
    "label": "Transport voyage",
    "icon": "✈️",
    "color": "#0891B2",
    "essential": false,
    "recurrence": "Ponctuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.hebergement",
    "family": "variable",
    "group": "Voyage & vacances",
    "label": "Hébergement",
    "icon": "🏨",
    "color": "#0E7490",
    "essential": false,
    "recurrence": "Ponctuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.restauration_voyage",
    "family": "variable",
    "group": "Voyage & vacances",
    "label": "Restauration voyage",
    "icon": "🍴",
    "color": "#06B6D4",
    "essential": false,
    "recurrence": "Ponctuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.activites_voyage",
    "family": "variable",
    "group": "Voyage & vacances",
    "label": "Activités voyage",
    "icon": "🗺️",
    "color": "#22D3EE",
    "essential": false,
    "recurrence": "Ponctuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.frais_bancaires",
    "family": "variable",
    "group": "Banque & finance",
    "label": "Frais bancaires",
    "icon": "🏦",
    "color": "#475569",
    "essential": true,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "seasonal.frais_carte",
    "family": "seasonal",
    "group": "Banque & finance",
    "label": "Frais carte",
    "icon": "💳",
    "color": "#334155",
    "essential": true,
    "recurrence": "Annuel/Mensuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.frais_de_transfert",
    "family": "variable",
    "group": "Banque & finance",
    "label": "Frais de transfert",
    "icon": "↔️",
    "color": "#64748B",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.interets_agios",
    "family": "variable",
    "group": "Banque & finance",
    "label": "Intérêts / agios",
    "icon": "📉",
    "color": "#B91C1C",
    "essential": true,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.penalites_financieres",
    "family": "variable",
    "group": "Banque & finance",
    "label": "Pénalités financières",
    "icon": "⚠️",
    "color": "#991B1B",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "fixed.remboursement_pret_personnel",
    "family": "fixed",
    "group": "Dettes & engagements",
    "label": "Remboursement prêt personnel",
    "icon": "🤝",
    "color": "#C62828",
    "essential": true,
    "recurrence": "Mensuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "fixed.credit_consommation",
    "family": "fixed",
    "group": "Dettes & engagements",
    "label": "Mensualité crédit consommation",
    "icon": "🧾",
    "color": "#B91C1C",
    "essential": true,
    "recurrence": "Mensuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": "fixed.credit_consommation"
  },
  {
    "key": "fixed.mensualite_financement_vehicule",
    "family": "fixed",
    "group": "Dettes & engagements",
    "label": "Mensualité financement véhicule",
    "icon": "🚗",
    "color": "#991B1B",
    "essential": true,
    "recurrence": "Mensuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "fixed.remboursement_carte_de_credit",
    "family": "fixed",
    "group": "Dettes & engagements",
    "label": "Remboursement carte de crédit",
    "icon": "💳",
    "color": "#7F1D1D",
    "essential": true,
    "recurrence": "Mensuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "fixed.pension_engagement",
    "family": "fixed",
    "group": "Dettes & engagements",
    "label": "Pension / engagement",
    "icon": "📅",
    "color": "#9F1239",
    "essential": true,
    "recurrence": "Mensuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": "fixed.pension_engagement"
  },
  {
    "key": "variable.impot_taxe",
    "family": "variable",
    "group": "Impôts & administration",
    "label": "Impôt / taxe",
    "icon": "🏛️",
    "color": "#52525B",
    "essential": true,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.document_administratif",
    "family": "variable",
    "group": "Impôts & administration",
    "label": "Document administratif",
    "icon": "📄",
    "color": "#71717A",
    "essential": false,
    "recurrence": "Ponctuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.timbre_frais_dossier",
    "family": "variable",
    "group": "Impôts & administration",
    "label": "Timbre / frais dossier",
    "icon": "🧾",
    "color": "#A1A1AA",
    "essential": false,
    "recurrence": "Ponctuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.amende_penalite",
    "family": "variable",
    "group": "Impôts & administration",
    "label": "Amende / pénalité",
    "icon": "🚫",
    "color": "#DC2626",
    "essential": false,
    "recurrence": "Ponctuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.don",
    "family": "variable",
    "group": "Dons & solidarité",
    "label": "Don",
    "icon": "❤️",
    "color": "#E11D48",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.zakat_solidarite",
    "family": "variable",
    "group": "Dons & solidarité",
    "label": "Zakat / solidarité",
    "icon": "🤲",
    "color": "#BE185D",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.cadeau_offert",
    "family": "variable",
    "group": "Dons & solidarité",
    "label": "Cadeau offert",
    "icon": "🎁",
    "color": "#DB2777",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.alimentation_animal",
    "family": "variable",
    "group": "Animaux",
    "label": "Alimentation animal",
    "icon": "🐾",
    "color": "#92400E",
    "essential": true,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.veterinaire",
    "family": "variable",
    "group": "Animaux",
    "label": "Vétérinaire",
    "icon": "🐕",
    "color": "#B45309",
    "essential": true,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.accessoires_animal",
    "family": "variable",
    "group": "Animaux",
    "label": "Accessoires animal",
    "icon": "🦴",
    "color": "#D97706",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.transport_professionnel",
    "family": "variable",
    "group": "Dépenses professionnelles personnelles",
    "label": "Transport professionnel",
    "icon": "💼",
    "color": "#0369A1",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.repas_professionnel",
    "family": "variable",
    "group": "Dépenses professionnelles personnelles",
    "label": "Repas professionnel",
    "icon": "🍽️",
    "color": "#075985",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.materiel_professionnel",
    "family": "variable",
    "group": "Dépenses professionnelles personnelles",
    "label": "Matériel professionnel",
    "icon": "🧰",
    "color": "#0C4A6E",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.formation_pro_autofinancee",
    "family": "variable",
    "group": "Dépenses professionnelles personnelles",
    "label": "Formation pro autofinancée",
    "icon": "📚",
    "color": "#082F49",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.urgence_medicale",
    "family": "variable",
    "group": "Imprévus",
    "label": "Urgence médicale",
    "icon": "🚑",
    "color": "#DC2626",
    "essential": true,
    "recurrence": "Ponctuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.reparation_urgente",
    "family": "variable",
    "group": "Imprévus",
    "label": "Réparation urgente",
    "icon": "🧯",
    "color": "#EA580C",
    "essential": true,
    "recurrence": "Ponctuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.aide_urgente",
    "family": "variable",
    "group": "Imprévus",
    "label": "Aide urgente",
    "icon": "🆘",
    "color": "#F97316",
    "essential": true,
    "recurrence": "Ponctuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.autre_imprevu",
    "family": "variable",
    "group": "Imprévus",
    "label": "Autre imprévu",
    "icon": "⚠️",
    "color": "#F59E0B",
    "essential": true,
    "recurrence": "Ponctuel",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": null
  },
  {
    "key": "variable.autre_depense_variable",
    "family": "variable",
    "group": "Autre",
    "label": "Autre dépense",
    "icon": "➕",
    "color": "#64748B",
    "essential": false,
    "recurrence": "Variable",
    "suggestedFor": [
      "Tous ; ordre suggéré selon profil"
    ],
    "mergedFrom": "variable.autre_depense_variable"
  }
];

// The old standard categories (P6-02) that stay as they are, and were already
// read as essential expenses: they keep that reading.
export const OLD_ESSENTIAL_KEYS = ["fixed.autre_charge_fixe", "fixed.transport_recurrent"];
