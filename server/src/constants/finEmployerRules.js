// P13-05, lot G, second part (2026-11-24): payroll (ECR-0265 to 0271) and
// accounting (ECR-0108, 0243 to 0250, 0330).
//
// The user's instruction of 2026-11-24: « mets des valeurs par défaut pour le
// moment et compile les questions à poser au client ». So every value below is
// a DEFAULT, written from the public texts we know of, and never presented as
// confirmed: until the administration confirms it in the window of the
// regulatory values (constants/regulatoryParams.js, keys PAIE-* and SCF-*),
// each screen that uses it says « valeur provisoire, à confirmer », every bulletin
// is a draft and every statement « présentation simplifiée, non certifiée »
// (DEC-001 still holds: a provisional value is shown as such, never hidden).
// The questions this file raises are listed in QUESTIONS_CLIENT.md.
//
// Amounts are in centimes, as everywhere in the engine; rates are decimals.

// ---- payroll --------------------------------------------------------------------------

export const PAYROLL_DEFAULTS = {
  // Salaire national minimum garanti (décret présidentiel 26-01 du 07/01/2026, already used by the payslip decoder).
  snmg: { key: 'PAIE-001', value: 2400000, kind: 'amount', source: 'Décret présidentiel 26-01 du 07/01/2026' },
  // Régime général, décret exécutif 15-236 : 9 % salarié, 25 % employeur, 0,5 % œuvres sociales.
  employeeRate: { key: 'PAIE-002', value: 0.09, kind: 'rate', source: 'Décret exécutif 15-236 du 16/09/2015' },
  employerRate: { key: 'PAIE-003', value: 0.25, kind: 'rate', source: 'Décret exécutif 15-236 du 16/09/2015' },
  socialWorksRate: { key: 'PAIE-004', value: 0.005, kind: 'rate', source: 'Décret exécutif 15-236 du 16/09/2015' },
  // The IRG of salaries: the monthly scale and its two abatements (DGI, page consulted on 2026-10-12).
  irgScale: { key: 'PAIE-005', kind: 'text', source: 'DGI, IRG traitements et salaires (loi de finances 2022)' },
  // The calendar of the employer's declarations.
  calendar: { key: 'PAIE-006', kind: 'text', source: 'DGI (série G50) et CNAS' },
};

// The monthly scale of the IRG on salaries: the annual scale / 12, in centimes.
export const IRG_MONTHLY_SCALE = [
  { upTo: 2000000, rate: 0 },
  { upTo: 4000000, rate: 0.23 },
  { upTo: 8000000, rate: 0.27 },
  { upTo: 16000000, rate: 0.3 },
  { upTo: 32000000, rate: 0.33 },
  { upTo: null, rate: 0.35 },
];

export const IRG_RULES = {
  // Taxable income at or below 30 000 DA a month: no IRG.
  exemptUpTo: 3000000,
  // Abatement of 40 % on the tax, between 1 000 and 1 500 DA a month.
  abatementRate: 0.4,
  abatementMin: 100000,
  abatementMax: 150000,
  // Between 30 000 and 35 000 DA: IRG = IRG after abatement × 137/51 − 27 925/8 (in DA).
  smoothingUpTo: 3500000,
  smoothingFactor: 137 / 51,
  smoothingOffset: (27925 / 8) * 100,
  // The taxable income is rounded down to the 10 DA below.
  roundTo: 1000,
  // Lot H (default): bonuses paid for several months are taxed apart, at a flat 10 %.
  irregularRate: 0.1,
};

// Calendar by default: the IRG withheld is paid by the 20th of the next month
// (G50); the social contributions within 30 days after the month (10 employees or
// more) or after the quarter (fewer than 10).
export const PAYROLL_CALENDAR = { irgDay: 20, socialDays: 30, quarterlyBelow: 10 };

// Lot H (default): an overtime hour is paid at the hourly rate (base / 173.33
// hours) increased by 50 %, the legal minimum.
export const OVERTIME = { monthlyHours: 173.33, premium: 0.5 };

// Lot H (default): an equipment bought for more than this amount (excluding
// tax, centimes) is a fixed asset, not an expense.
export const ASSET_THRESHOLD = 3000000;

// Lot H (default): straight-line depreciation, months by category of asset.
export const ASSET_CATEGORIES = {
  software: { account: '204', months: 36 },
  building: { account: '213', months: 240 },
  equipment: { account: '215', months: 60 },
  vehicle: { account: '218', months: 60 },
  computer: { account: '218', months: 36 },
  furniture: { account: '218', months: 120 },
  other: { account: '218', months: 60 },
};

// Lot H: the fiscal year is the calendar year (SCF default).

export const PAYROLL_RUN_STATUSES = ['draft', 'validated', 'closed'];

// ---- accounting (SCF) ---------------------------------------------------------------------

export const LEDGER_DEFAULTS = {
  chart: { key: 'SCF-001', kind: 'text', source: 'Système comptable financier, arrêté du 26/07/2008 (nomenclature des comptes)' },
  presentation: { key: 'SCF-002', kind: 'text', source: 'Système comptable financier, arrêté du 26/07/2008 (états financiers)' },
};

// The journals. Our list: the client names « journal » without listing them.
export const LEDGER_JOURNALS = ['VT', 'AC', 'BQ', 'CA', 'PA', 'OD', 'AN'];

// The default chart: the classes and main accounts of the SCF nomenclature. An
// organisation may add sub-accounts (4111 under 411…), never an account outside
// these roots. The labels shown on screen are the official names, in French —
// they are the names of the nomenclature, the same in every language.
export const SCF_CHART = [
  ['101', 'Capital émis'],
  ['104', 'Primes liées au capital social'],
  ['106', 'Réserves'],
  ['108', 'Compte de l’exploitant'],
  ['110', 'Report à nouveau (solde créditeur)'],
  ['119', 'Report à nouveau (solde débiteur)'],
  ['120', 'Résultat de l’exercice (bénéfice)'],
  ['129', 'Résultat de l’exercice (perte)'],
  ['131', 'Subventions d’équipement'],
  ['153', 'Provisions pour pensions et obligations similaires'],
  ['158', 'Autres provisions pour charges, passifs non courants'],
  ['164', 'Emprunts auprès des établissements de crédit'],
  ['167', 'Dettes sur contrats de location-financement'],
  ['168', 'Autres emprunts et dettes assimilées'],
  ['204', 'Logiciels informatiques et assimilés'],
  ['207', 'Écart d’acquisition'],
  ['208', 'Autres immobilisations incorporelles'],
  ['211', 'Terrains'],
  ['213', 'Constructions'],
  ['215', 'Installations techniques, matériel et outillage industriel'],
  ['218', 'Autres immobilisations corporelles'],
  ['232', 'Immobilisations corporelles en cours'],
  ['261', 'Titres de filiales'],
  ['275', 'Dépôts et cautionnements versés'],
  ['280', 'Amortissements des immobilisations incorporelles'],
  ['281', 'Amortissements des immobilisations corporelles'],
  ['290', 'Pertes de valeur sur immobilisations incorporelles'],
  ['291', 'Pertes de valeur sur immobilisations corporelles'],
  ['300', 'Stocks de marchandises'],
  ['310', 'Matières premières et fournitures'],
  ['320', 'Autres approvisionnements'],
  ['330', 'En-cours de production de biens'],
  ['355', 'Produits finis'],
  ['380', 'Achats stockés'],
  ['390', 'Pertes de valeur sur stocks'],
  ['401', 'Fournisseurs de stocks et services'],
  ['404', 'Fournisseurs d’immobilisations'],
  ['409', 'Fournisseurs débiteurs : avances et acomptes versés'],
  ['411', 'Clients'],
  ['416', 'Clients douteux'],
  ['419', 'Clients créditeurs : avances reçues'],
  ['421', 'Personnel, rémunérations dues'],
  ['425', 'Personnel, avances et acomptes accordés'],
  ['431', 'Sécurité sociale'],
  ['432', 'Autres organismes sociaux'],
  ['442', 'État, impôts et taxes recouvrables sur des tiers'],
  ['444', 'État, impôts sur les résultats'],
  ['4456', 'Taxes sur le chiffre d’affaires déductibles'],
  ['4457', 'Taxes sur le chiffre d’affaires collectées'],
  ['447', 'Autres impôts, taxes et versements assimilés'],
  ['455', 'Associés, comptes courants'],
  ['467', 'Autres comptes débiteurs ou créditeurs'],
  ['471', 'Opérations en attente d’imputation'],
  ['486', 'Charges constatées d’avance'],
  ['487', 'Produits constatés d’avance'],
  ['491', 'Pertes de valeur sur comptes clients'],
  ['512', 'Banques, comptes courants'],
  ['517', 'Autres organismes financiers'],
  ['519', 'Concours bancaires courants'],
  ['530', 'Caisse'],
  ['581', 'Virements internes'],
  ['600', 'Achats de marchandises vendues'],
  ['601', 'Matières premières'],
  ['602', 'Autres approvisionnements'],
  ['604', 'Achats d’études et de prestations de services'],
  ['607', 'Achats non stockés de matières et fournitures'],
  ['611', 'Sous-traitance générale'],
  ['613', 'Locations'],
  ['615', 'Entretien, réparations et maintenance'],
  ['616', 'Primes d’assurances'],
  ['622', 'Rémunérations d’intermédiaires et honoraires'],
  ['623', 'Publicité, publications, relations publiques'],
  ['624', 'Transports de biens et transport collectif du personnel'],
  ['626', 'Frais postaux et de télécommunications'],
  ['627', 'Services bancaires et assimilés'],
  ['628', 'Cotisations et divers'],
  ['631', 'Rémunérations du personnel'],
  ['635', 'Cotisations aux organismes sociaux'],
  ['642', 'Impôts et taxes non récupérables sur chiffre d’affaires'],
  ['645', 'Autres impôts et taxes'],
  ['651', 'Redevances pour concessions, brevets, licences'],
  ['658', 'Autres charges de gestion courante'],
  ['661', 'Charges d’intérêts'],
  ['666', 'Pertes de change'],
  ['681', 'Dotations aux amortissements, provisions et pertes de valeur'],
  ['695', 'Impôts sur les bénéfices'],
  ['700', 'Ventes de marchandises'],
  ['701', 'Ventes de produits finis'],
  ['706', 'Prestations de services'],
  ['708', 'Produits des activités annexes'],
  ['72', 'Production stockée ou déstockée'],
  ['73', 'Production immobilisée'],
  ['74', 'Subventions d’exploitation'],
  ['752', 'Plus-values sur sorties d’actifs immobilisés non financiers'],
  ['758', 'Autres produits de gestion courante'],
  ['763', 'Revenus des autres formes de créances'],
  ['766', 'Gains de change'],
  ['781', 'Reprises d’exploitation sur pertes de valeur et provisions'],
];

export const SCF_CODES = SCF_CHART.map(([code]) => code);
export const SCF_CLASSES = ['1', '2', '3', '4', '5', '6', '7'];

// The accounts the automatic entries use (ECR-0247), by default.
export const AUTO_ACCOUNTS = {
  sales: '700',
  customers: '411',
  suppliers: '401',
  vatCollected: '4457',
  vatDeductible: '4456',
  bank: '512',
  cash: '530',
  wages: '631',
  socialCharges: '635',
  staffDue: '421',
  staffAdvances: '425',
  social: '431',
  withheldTax: '442',
};

// The purchase families of lot C (EXPENSE_CATEGORIES) → an expense account.
export const EXPENSE_ACCOUNT_OF = {
  marchandises: '600',
  matieres: '601',
  sous_traitance: '611',
  loyer: '613',
  salaires: '631',
  charges_sociales: '635',
  energie: '607',
  telecom: '626',
  transport: '624',
  honoraires: '622',
  assurance: '616',
  entretien: '615',
  marketing: '623',
  banque: '627',
  impots_taxes: '645',
  equipement: '607',
  autre: '628',
};

export const LEDGER_ENTRY_STATUSES = ['draft', 'validated'];
export const LEDGER_SOURCES = ['manual', 'auto', 'import'];
