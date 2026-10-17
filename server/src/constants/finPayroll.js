// Référentiel de paie algérien (P4-14, via P6-22 chantier 5).
//
// Transcrit des onglets `14_Paie_Regles` et `15_IRG_Tranches` du référentiel
// maître du client. Chaque valeur porte sa SOURCE et sa DATE, parce que c'est
// une donnée légale : un taux sans texte ni date n'est pas vérifiable, et un
// taux qu'on ne peut pas vérifier n'a rien à faire sur une fiche de paie.
//
// CE QUE CE FICHIER N'EST PAS : un moteur de paie. Le client l'écrit en tête
// de son propre onglet — « ne pas considérer cette grille isolée comme un
// moteur de paie complet : abattements, régimes et date d'application sont
// nécessaires ». L'écran C15 est un DÉCODEUR : la personne saisit les lignes
// de sa fiche, le produit les explique et signale ce qui ne colle pas. Il ne
// recalcule pas son salaire et ne certifie rien.
//
// La différence est tout sauf théorique. Recalculer un IRG sur un barème dont
// la date d'effet n'est pas confirmée, puis l'afficher à côté du chiffre de
// l'employeur, ferait croire à une erreur de paie là où il n'y a qu'une
// incertitude de notre côté.

export const PAYROLL_SOURCE_NOTE =
  'Valeurs déclarées dans le référentiel du client, avec leur texte et leur date. À revalider auprès de la source avant toute diffusion opposable.';

// ---------------------------------------------------------------------------
// SNMG — salaire national minimum garanti
// ---------------------------------------------------------------------------

export const SNMG = {
  monthly: 2400000, // centimes, soit 24 000 DA
  monthlyHours: 173.33,
  hourly: 13846, // centimes, soit 138,46 DA
  effectiveFrom: '2026-01-01',
  source: 'Décret présidentiel 26-01 du 07/01/2026',
  url: 'https://www.joradp.dz/FTP/jo-francais/2026/F2026001.pdf',
};

// ---------------------------------------------------------------------------
// Cotisations sociales — régime général
// ---------------------------------------------------------------------------

// La répartition par branche, telle que le décret la donne. Les parts sont des
// décimaux, comme tous les taux du moteur : 9 % s'écrit 0.09.
export const SOCIAL_BRANCHES = [
  { key: 'assurances_sociales', label: 'Assurances sociales', employer: 0.115, employee: 0.015, socialWorks: null, total: 0.13 },
  { key: 'accidents_travail', label: 'Accidents du travail et maladies professionnelles', employer: 0.0125, employee: null, socialWorks: null, total: 0.0125 },
  { key: 'retraite', label: 'Retraite', employer: 0.11, employee: 0.0675, socialWorks: 0.005, total: 0.1825 },
  { key: 'chomage', label: 'Assurance chômage', employer: 0.01, employee: 0.005, socialWorks: null, total: 0.015 },
  { key: 'retraite_anticipee', label: 'Retraite anticipée', employer: 0.0025, employee: 0.0025, socialWorks: null, total: 0.005 },
];

export const SOCIAL_TOTALS = {
  employee: 0.09,
  employer: 0.25,
  socialWorks: 0.005,
  overall: 0.345,
  effectiveFrom: '2015-09-16',
  source: 'Décret exécutif 15-236',
  url: 'https://www.joradp.dz/FTP/jo-francais/2015/F2015049.pdf',
  reserve: 'À revalider si un texte plus récent existe.',
};

// ---------------------------------------------------------------------------
// IRG — impôt sur le revenu global, traitements et salaires
// ---------------------------------------------------------------------------

// Le barème est ANNUEL. Les bornes sont en centimes, comme tous les montants
// du moteur ; les taux sont des décimaux.
export const IRG_BRACKETS = [
  { from: 0, to: 24000000, rate: 0 },
  { from: 24000001, to: 48000000, rate: 0.23 },
  { from: 48000001, to: 96000000, rate: 0.27 },
  { from: 96000001, to: 192000000, rate: 0.3 },
  { from: 192000001, to: 384000000, rate: 0.33 },
  { from: 384000001, to: null, rate: 0.35 },
];

export const IRG_SOURCE = {
  consultedAt: '2026-10-12',
  institution: 'DGI',
  url: 'https://mfdgi.gov.dz/fr/particuliers/irg-traitements-et-salaires',
  reserve: 'Barème déclaré dans le document du client : date d’effet et abattements applicables à vérifier.',
};

// Les trois régimes mensuels que la DGI distingue, transcrits sans être
// appliqués. Seul le premier est sans ambiguïté, et c'est le seul que le
// décodeur utilise pour signaler quelque chose.
export const IRG_MONTHLY_REGIMES = [
  {
    key: 'exempt',
    upTo: 3000000, // 30 000 DA
    label: 'Exonération totale',
    rule: 'Revenus mensuels inférieurs ou égaux à 30 000 DA : exonération totale selon la DGI.',
    computable: true,
  },
  {
    key: 'abated',
    from: 3000001,
    upTo: 3500000, // 35 000 DA
    label: 'Barème progressif avec double abattement',
    rule: 'Barème progressif, abattement de 40 % (minimum 1 000 DA, maximum 1 500 DA par mois), puis second abattement : IRG = IRG1 × 137/51 − 27925/8.',
    computable: false,
    why: 'La formule du second abattement est transcrite telle quelle ; son assiette exacte et sa date d’effet ne sont pas confirmées.',
  },
  {
    key: 'standard',
    from: 3500001,
    label: 'Barème progressif annuel avec abattement de 40 %',
    rule: 'Barème progressif annuel 0 / 23 / 27 / 30 / 33 / 35 %, avec abattement de 40 % selon la DGI.',
    computable: false,
    why: 'Les bornes de l’abattement de 40 % et la date d’effet du barème ne sont pas confirmées dans le document.',
  },
];

// Primes et éléments non mensuels : « considérés comme une mensualité
// distincte et retenue de 10 % selon la page DGI, sous réserve des exemptions
// précisées ». Transcrit, non appliqué : « sous réserve des exemptions » veut
// dire que la règle a des exceptions que le document ne liste pas.
export const IRG_BONUS_RULE = {
  rate: 0.1,
  rule: 'Rémunérations, indemnités, primes, gratifications et rappels sont considérés comme une mensualité distincte, avec une retenue de 10 %.',
  reserve: 'Sous réserve des exemptions précisées par la DGI, que le document ne détaille pas.',
  computable: false,
};

// ---------------------------------------------------------------------------
// Les lignes d'une fiche de paie que le décodeur sait nommer
// ---------------------------------------------------------------------------

// `sign` dit comment la ligne entre dans le net : elle s'ajoute au brut ou
// s'en retranche. C'est la seule arithmétique que le décodeur applique, et
// elle vient de la STRUCTURE SAISIE, pas d'une règle légale.
export const PAYSLIP_LINE_KINDS = [
  { key: 'base_salary', label: 'Salaire de base', sign: 1, group: 'brut' },
  { key: 'seniority', label: 'Indemnité d’ancienneté', sign: 1, group: 'brut' },
  { key: 'bonus', label: 'Prime ou gratification', sign: 1, group: 'brut', note: 'bonus' },
  { key: 'allowance', label: 'Indemnité', sign: 1, group: 'brut' },
  { key: 'overtime', label: 'Heures supplémentaires', sign: 1, group: 'brut' },
  { key: 'social_employee', label: 'Cotisation sociale salarié', sign: -1, group: 'retenue', expectedRate: 'employee' },
  { key: 'irg', label: 'IRG', sign: -1, group: 'retenue' },
  { key: 'advance', label: 'Avance ou acompte', sign: -1, group: 'retenue' },
  { key: 'other_deduction', label: 'Autre retenue', sign: -1, group: 'retenue' },
  { key: 'unknown', label: 'Ligne à confirmer', sign: 0, group: 'inconnu' },
];

export const payslipLineKind = (key) => PAYSLIP_LINE_KINDS.find((row) => row.key === key) ?? null;
export const PAYSLIP_LINE_KEYS = PAYSLIP_LINE_KINDS.map((row) => row.key);

// Ce que le décodeur refuse de faire, dit une fois pour toutes et publié avec
// ses réponses. Une limite qu'on ne lit nulle part finit par être oubliée.
export const PAYROLL_DISCLAIMERS = [
  'Ce décodeur explique la fiche que vous saisissez. Il ne la recalcule pas et ne la certifie pas.',
  'Aucune déduction légale n’est ajoutée : le net affiché est celui qui découle des lignes que vous avez saisies.',
  'Les écarts signalés sont des points à vérifier avec votre employeur, jamais une erreur établie.',
];
