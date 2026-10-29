// Barèmes du référentiel maître du client (P6-22, chantiers 2 et 3) :
// indice de santé financière (F053), indice de préparation au financement
// (F051) et cibles de réserve de sécurité (P6-09).
//
// Transcrit des onglets `09_Sante_Poids`, `10_Sante_Baremes`, `11_Readiness`
// et `12_Reserve` du classeur `FINCLUDIA_REFERENTIEL_MAITRE_EXCEL_BLOCAGES`.
// Les seuils sont ceux du client, au chiffre près.
//
// POURQUOI CES TROIS CHOSES VIVENT ENSEMBLE : elles ont la même forme — une
// grille de seuils qui transforme une mesure en sous-score de 0 à 100, puis
// une moyenne pondérée. Écrire trois fois la même machinerie aurait produit
// trois façons différentes d'arrondir et de traiter une dimension absente.
//
// ET CE QUE LE CLIENT SIGNALE LUI-MÊME, repris ici plutôt qu'écarté :
// plusieurs de ces tables existent en DEUX versions non identiques dans son
// propre document. Le choix est déclaré dans `REFERENTIAL_DIVERGENCES`, et il
// doit être confirmé par le client — « aucune ne doit remplacer l'autre
// silencieusement » sont ses mots.

/**
 * Une grille de seuils : des bandes ordonnées de la plus favorable à la moins
 * favorable, chacune avec le sous-score qu'elle vaut.
 *
 * `min` est inclusif, `max` exclusif, `null` veut dire « pas de borne ». Les
 * bandes sont lues dans l'ordre et la première qui contient la valeur gagne,
 * ce qui rend l'ordre significatif et relisible face au document.
 */
const band = (min, max, score, label = null) => ({ min, max, score, label });

// ---------------------------------------------------------------------------
// Indice de santé financière — barème B, 7 dimensions (`09_Sante_Poids`)
// ---------------------------------------------------------------------------

// B-8 since P8-16: « budgets » replaces « stabilité des revenus » (decision
// P8-01 point 4). A new version, so a score read later says which grid it used.
export const HEALTH_VERSION = 'B-8';

export const HEALTH_DIMENSIONS = [
  { key: 'balance', weight: 25, label: 'Solde et équilibre mensuel', basis: 'flux_net / revenu_net' },
  { key: 'reserve', weight: 20, label: 'Réserve / résilience', basis: 'mois de réserve' },
  { key: 'debt', weight: 20, label: 'Pression de dette', basis: 'taux d’effort total' },
  { key: 'savings', weight: 15, label: 'Épargne', basis: 'taux d’épargne nette' },
  { key: 'goals', weight: 10, label: 'Trajectoire des objectifs', basis: 'écart au plan' },
  // P8-16 (decision P8-01 point 4): the consolidated specification's seven
  // dimensions — « stabilité des revenus » leaves, « budgets » takes its 5 %,
  // measured as real spending over the active budgets (tab 11_Tableau_Bord).
  { key: 'budgets', weight: 5, label: 'Respect des budgets', basis: 'dépenses réelles / budgets actifs' },
  { key: 'dataQuality', weight: 5, label: 'Qualité des données', basis: 'complétude + fraîcheur' },
];

// Les grilles de la « Normalisation détaillée (B) » de `10_Sante_Baremes`.
// Les taux sont des décimaux, comme partout dans le moteur : 10 % s'écrit 0.10
// et s'affiche ×100.
export const HEALTH_SCALES = {
  // flux net / revenu
  balance: [
    band(0.1, null, 100),
    band(0.05, 0.1, 85),
    band(0, 0.05, 65),
    band(-0.05, 0, 30),
    band(null, -0.05, 0),
  ],
  // mois de réserve
  reserve: [
    band(6, null, 100),
    band(3, 6, 85),
    band(1, 3, 55),
    band(0.5, 1, 30),
    band(0.0001, 0.5, 10),
    band(null, 0.0001, 0),
  ],
  // taux d'effort total (« barème 8.1 » du document, repris sous `Dette`)
  debt: [
    band(null, 0.2001, 100, 'Maîtrisé'),
    band(0.2001, 0.3001, 80, 'À surveiller'),
    band(0.3001, 0.4001, 50, 'Pression modérée'),
    band(0.4001, 0.5001, 25, 'Pression élevée'),
    band(0.5001, null, 0, 'Pression critique'),
  ],
  // taux d'épargne nette
  savings: [
    band(0.2, null, 100),
    band(0.1, 0.2, 80),
    band(0.05, 0.1, 60),
    band(0, 0.05, 30),
    band(null, 0, 0),
  ],
  // écart au plan des objectifs : 0 = dans ou au-dessus de la trajectoire,
  // 0.10 = 10 % de retard. Une valeur négative (en avance) vaut 100.
  goals: [
    band(null, 0.0001, 100),
    band(0.0001, 0.1001, 80),
    band(0.1001, 0.2501, 50),
    band(0.2501, null, 20),
  ],
  // mois d'historique de revenu régulier
  incomeStability: [
    band(12, null, 100),
    band(6, 12, 80),
    band(3, 6, 60),
    band(0.0001, 3, 30),
    band(null, 0.0001, 0),
  ],
};

// « Qualité des données : 60 % complétude + 40 % fraîcheur, chacune 0-100 ».
export const DATA_QUALITY_MIX = { completeness: 0.6, freshness: 0.4 };

// Les bandes du score global (B).
export const HEALTH_BANDS = [
  band(80, null, null, 'Solide'),
  band(60, 80, null, 'Stable'),
  band(40, 60, null, 'À consolider'),
  band(null, 40, null, 'Priorité sécurité'),
];

// ---------------------------------------------------------------------------
// Indice de préparation au financement — version A (`11_Readiness`)
// ---------------------------------------------------------------------------

export const READINESS_VERSION = 'A';

export const READINESS_CRITERIA = [
  { key: 'effort', weight: 30, label: 'Compatibilité effort de remboursement' },
  { key: 'budgetCapacity', weight: 20, label: 'Capacité budgétaire après nouveau prêt' },
  { key: 'incomeStability', weight: 15, label: 'Stabilité / vérification du revenu' },
  { key: 'downPayment', weight: 15, label: 'Apport personnel' },
  { key: 'reserve', weight: 10, label: 'Réserve de sécurité' },
  { key: 'fileCompleteness', weight: 10, label: 'Complétude du dossier' },
];

export const READINESS_SCALES = {
  // Surplus après crédit / revenu
  budgetCapacity: [
    band(0.2, null, 100),
    band(0.1, 0.2, 80),
    band(0.05, 0.1, 60),
    band(0, 0.05, 30),
    band(null, 0, 0),
  ],
  // Réserve en mois
  reserve: [band(3, null, 100), band(2, 3, 80), band(1, 2, 60), band(0.0001, 1, 30), band(null, 0.0001, 0)],
};

// Stabilité du revenu : une SITUATION, pas une mesure continue. Le client
// l'énumère cas par cas et la marque lui-même « heuristique FINCLUDIA », donc
// elle est transcrite telle quelle et porte cette étiquette.
export const READINESS_INCOME_STABILITY = {
  cdi_verified_12m: { score: 100, label: 'CDI vérifié depuis 12 mois ou plus' },
  cdi_under_12m: { score: 85, label: 'CDI de moins de 12 mois' },
  cdd_covering_term: { score: 70, label: 'CDD couvrant le terme du prêt' },
  cdd_shorter: { score: 30, label: 'CDD plus court que le terme' },
  irregular_verified: { score: 50, label: 'Revenu irrégulier vérifié' },
  unverified: { score: 20, label: 'Revenu non vérifié' },
};
export const READINESS_INCOME_STABILITY_SOURCE = 'heuristique FINCLUDIA (onglet 11_Readiness), non réglementaire';

// L'effort, quand le plafond de la banque est connu. Exprimé en part du
// plafond, pas en taux d'effort absolu.
export const READINESS_EFFORT_WITH_CAP = [
  band(null, 0.7501, 100),
  band(0.7501, 0.9001, 80),
  band(0.9001, 1.0001, 60),
  band(1.0001, null, 0),
];

// Et la règle qui compte le plus dans cette grille : au-delà du plafond de la
// banque, ce n'est pas un score bas, c'est un BLOCAGE. Un score de 0 noyé dans
// une moyenne pondérée laisserait un dossier « presque prêt » alors que la
// banque le refuse.
export const READINESS_BLOCKING = {
  effortAboveCap: 'Le taux d’effort dépasse le plafond publié par la banque : ce dossier ne peut pas être présenté en l’état.',
  downPaymentBelowMinimum: 'L’apport est inférieur au minimum publié par la banque : ce dossier ne peut pas être présenté en l’état.',
};

// Apport, quand le minimum de la banque (R, en points de pourcentage) est connu.
export const READINESS_DOWN_PAYMENT = [
  { aboveMinimumPoints: 10, score: 100 },
  { aboveMinimumPoints: 5, score: 90 },
  { aboveMinimumPoints: 0, score: 80 },
];

// Sans le plafond ni le minimum de la banque, le client interdit de conclure.
// Ces deux phrases sont les siennes, et elles sont affichées telles quelles.
export const READINESS_WITHOUT_BANK_RULES = {
  effort: 'Repère d’abordabilité, pas critère banque.',
  downPayment: 'Minimum d’apport de la banque inconnu : aucune conclusion d’éligibilité.',
};

// Le repère interne, à n'utiliser QUE faute de plafond publié.
export const INTERNAL_DSR_MARKERS = [0.2, 0.3, 0.4, 0.5];

export const READINESS_BANDS = [
  band(80, null, null, 'Dossier prêt à présenter'),
  band(65, 80, null, 'Presque prêt'),
  band(50, 65, null, 'À compléter'),
  band(null, 50, null, 'Préparation insuffisante'),
];

// ---------------------------------------------------------------------------
// Cibles de réserve de sécurité — grille A (`12_Reserve`)
// ---------------------------------------------------------------------------

// La lecture commune, valable pour tout le monde :
//   emergency_months = épargne_liquide / dépenses_essentielles_mensuelles
export const RESERVE_BANDS = [
  band(6, null, null, 'robuste'),
  band(3, 6, null, 'adéquat'),
  band(1, 3, null, 'fragile'),
  band(null, 1, null, 'critique'),
];

/**
 * La cible par public, grille A.
 *
 * `alert: false` pour le lycéen : le client écrit « objectif éducatif, sans
 * alerte adulte ». Prévenir un lycéen qu'il est « en situation critique »
 * parce qu'il a moins d'un mois de dépenses de côté serait appliquer une
 * grille d'adulte à un exercice pédagogique.
 *
 * `variant` quand le client donne deux valeurs selon une situation que le
 * public seul ne dit pas : une famille à deux revenus vise 4 mois, à un seul
 * revenu 6. La cible retenue est celle que le client associe au public, et la
 * variante est affichée avec sa condition au lieu d'être tranchée à sa place.
 *
 * `EPG` (épargnant débutant) n'apparaît dans AUCUNE des deux grilles du
 * client. Sa cible est donc `null` — pas 3 mois « par défaut » : inventer une
 * cible de réserve, c'est inventer un objectif d'épargne.
 */
export const RESERVE_TARGETS = {
  LYC: { months: 0.5, alert: false, note: 'Objectif éducatif, sans alerte adulte.', range: [0, 3] },
  ETU: { months: 2, alert: true, firstMilestone: 1, range: [1, 6] },
  JAC: { months: 3, alert: true, range: [1, 12] },
  SAL: { months: 3, alert: true, range: [1, 12] },
  COU: { months: 4, alert: true, range: [1, 12], variant: { months: 6, when: 'Foyer à un seul revenu ou revenus irréguliers' } },
  FAM: { months: 4, alert: true, range: [1, 12], variant: { months: 6, when: 'Foyer à un seul revenu, revenus irréguliers ou personnes à charge' } },
  COL: { months: 3, alert: true, range: [1, 12], shared: { months: 1, label: 'charges partagées' }, note: 'Deux réserves séparées : personnelle et charges communes.' },
  EPG: { months: null, alert: true, note: 'Aucune cible par profil dans le référentiel du client ; la lecture commune en mois s’applique.' },
  // « Autre / libre » (P8-17, onglet 16_Education) : absent de la grille A.
  AUT: { months: null, alert: true, note: 'Aucune cible par profil dans le référentiel du client ; la lecture commune en mois s’applique.' },
};

// ---------------------------------------------------------------------------
// Ce qui doit être confirmé par le client
// ---------------------------------------------------------------------------

/**
 * Les divergences que le client signale dans son propre document, et le choix
 * fait ici en attendant sa réponse.
 *
 * Elles sont publiées (API et écran) plutôt que notées dans un fichier : un
 * barème choisi par le prestataire parce qu'il fallait bien en choisir un doit
 * se voir, sinon il devient une décision du client par usure.
 */
export const REFERENTIAL_DIVERGENCES = [
  {
    key: 'health_scale',
    subject: 'Indice de santé financière',
    chosen: 'Barème B, 7 dimensions (qualité des données comptée à part).',
    alternative: 'Un barème à 6 dimensions est mentionné dans le document du client, sans être détaillé.',
    why: 'Seul le barème à 7 dimensions est chiffré ; le second ne peut pas être implémenté faute de pondérations.',
  },
  {
    key: 'readiness_version',
    subject: 'Indice de préparation au financement',
    chosen: 'Version A, score mixte à 6 critères pondérés.',
    alternative: 'Le document mêle préparation financière et complétude documentaire ; le client demande de garder les deux usages distincts.',
    why: 'La version A est la seule chiffrée. La complétude du dossier y est un critère parmi six, pas le score.',
  },
  {
    key: 'reserve_grid',
    subject: 'Cibles de réserve de sécurité',
    chosen: 'Grille A, par public.',
    alternative: 'Une grille « profil ancien / général » coexiste avec des valeurs différentes (3 mois pour un salarié, 4 à 6 pour une famille).',
    why: 'La grille A est la plus récente et la plus détaillée ; aucune des deux n’est présentée comme légale par le client.',
  },
];

/** Le sous-score d'une mesure dans une grille, ou `null` si elle est absente. */
export function scoreIn(scale, value) {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const found = scale.find((row) => (row.min === null || value >= row.min) && (row.max === null || value < row.max));
  return found ? found.score : null;
}

/** La bande (son libellé) d'un score ou d'une mesure. */
export function bandOf(bands, value) {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const found = bands.find((row) => (row.min === null || value >= row.min) && (row.max === null || value < row.max));
  return found ? found.label : null;
}

export const reserveTargetFor = (publicCode) => RESERVE_TARGETS[publicCode] ?? null;
