// Espace entreprise (P7-02) — le socle de l'ERP annoncé par l'annexe 1 du
// contrat : entreprises, PME, PMI, micro-entreprises, auto-entrepreneurs,
// micro-importateurs et professions libérales.
//
// La ligne de partage de tout ce module, et il vaut la peine de la poser une
// fois pour toutes :
//
//   CE QUI SE CALCULE SANS RÉFÉRENTIEL COMPTABLE — ce qui est réellement entré
//   et sorti, qui doit quoi, depuis combien de temps — est calculé ici. Ce sont
//   des faits de trésorerie : ils ne dépendent d'aucune norme, seulement des
//   documents que l'entreprise a émis et des règlements qu'elle a reçus.
//
//   CE QUI SUPPOSE UNE NORME — bilan, compte de résultat, TVA à déclarer,
//   amortissements, stock — n'est pas calculé, et dit pourquoi. Ces états
//   supposent le Système Comptable Financier algérien et des règles fiscales
//   datées que le client n'a pas fournies.
//
// Un « compte de résultat » inventé serait faux ET présenté comme comptable.
// C'est la seule chose que ce module refuse absolument de produire.

export const BUSINESS_CONTACT_KINDS = ['client', 'supplier'];
export const BUSINESS_DOCUMENT_KINDS = ['sale', 'purchase'];

// Le sens d'un document : une vente fait entrer de l'argent, un achat en fait
// sortir. Rien d'autre n'en dépend, mais tout en dépend.
export const DOCUMENT_DIRECTION = { sale: 'in', purchase: 'out' };

// P13-05, lot B (19_CYCLE_FACTURE) : un devis, une facture et un avoir sont
// tous des documents. Leur cycle :
//   devis   : brouillon → envoyé → accepté | refusé → facturé
//   facture : brouillon → émise (une facture émise ne se réécrit plus : CNV-02)
//   avoir   : émis, toujours rattaché à la facture qu'il corrige
export const DOCUMENT_TYPES = ['quote', 'invoice', 'credit_note'];
export const DOCUMENT_STATES = {
  quote: ['draft', 'sent', 'accepted', 'refused', 'invoiced'],
  invoice: ['draft', 'issued'],
  credit_note: ['issued'],
};
// Les numéros que FINCLUDIA attribue aux documents ÉMIS par l'organisation
// (un achat garde le numéro de son fournisseur) : préfixe, année, rang.
export const DOCUMENT_NUMBER_PREFIX = { quote: 'DEV', invoice: 'FAC', credit_note: 'AV' };

// Les canaux d'une relance (FAC-008). FINCLUDIA prépare le texte ; la
// personne l'envoie par son propre canal et l'enregistre.
export const REMINDER_CHANNELS = ['email', 'telephone', 'sms', 'courrier', 'visite', 'autre'];

// P13-05, lot C : les familles de dépenses. Liste de NOTRE fait, pour classer
// et budgéter — ce n'est pas un plan comptable (le SCF reste au comptable,
// CNV-06). Chaque famille a une nature par défaut, que la personne peut
// changer pièce par pièce : le seuil de rentabilité sépare charges fixes et
// variables.
export const EXPENSE_CATEGORIES = [
  'marchandises',
  'matieres',
  'sous_traitance',
  'loyer',
  'salaires',
  'charges_sociales',
  'energie',
  'telecom',
  'transport',
  'honoraires',
  'assurance',
  'entretien',
  'marketing',
  'banque',
  'impots_taxes',
  'equipement',
  'autre',
];
export const COST_NATURES = ['fixed', 'variable'];
export const DEFAULT_COST_NATURE = {
  marchandises: 'variable',
  matieres: 'variable',
  sous_traitance: 'variable',
  transport: 'variable',
  energie: 'variable',
  loyer: 'fixed',
  salaires: 'fixed',
  charges_sociales: 'fixed',
  telecom: 'fixed',
  honoraires: 'fixed',
  assurance: 'fixed',
  entretien: 'fixed',
  marketing: 'fixed',
  banque: 'fixed',
  impots_taxes: 'fixed',
  equipement: 'fixed',
  autre: 'fixed',
};

// Les mouvements de stock (CNV-16) : une entrée EST un lot ; pertes et
// sorties nomment le lot d'où elles viennent.
export const STOCK_MOVE_KINDS = ['in', 'out', 'loss'];

// La trésorerie à 13 semaines : l'horizon, et le plancher sous lequel une
// semaine est « en tension ». Zéro tant que l'organisation n'en a pas fixé un.
export const CASH_PLAN_WEEKS = 13;
export const CASH_FLOOR = 0;

// La balance âgée des créances : jours de retard par tranche (FAC-006).
export const AGING_BUCKETS = [
  { key: 'notDue', max: 0 },
  { key: 'd30', max: 30 },
  { key: 'd60', max: 60 },
  { key: 'd90', max: 90 },
  { key: 'over90', max: Infinity },
];

// Les formes juridiques que le contrat énumère. Liste de NOTRE fait : le
// client les nomme dans l'annexe 1 sans les définir, et aucune obligation
// légale n'y est attachée ici — ce serait du droit, pas du logiciel.
export const BUSINESS_LEGAL_FORMS = [
  'auto_entrepreneur',
  'micro_entreprise',
  'profession_liberale',
  'micro_importateur',
  'startup',
  'pme',
  'pmi',
  'entreprise',
  'autre',
];

// Moyens de règlement. Même remarque que pour les mouvements personnels
// (P6-04) : le client demande le champ et n'énumère rien, donc la liste est de
// nous et « non précisé » reste distinct de « espèces ».
export const BUSINESS_PAYMENT_METHODS = ['especes', 'cheque', 'virement', 'carte', 'ccp', 'effet', 'autre'];

// L'état d'un document, DÉDUIT de ses règlements et jamais saisi : un document
// que l'on peut marquer « payé » à la main est un document qui ment dès que
// quelqu'un se trompe. « cancelled » : entièrement annulé par avoir, sans
// règlement (lot B).
export const DOCUMENT_SETTLEMENT_STATES = ['unpaid', 'partial', 'paid', 'overpaid', 'cancelled'];

// Les états financiers que le contrat annonce et que ce module NE produit PAS.
// Déclarés un par un, avec ce qui manque : un écran qui dit « indisponible »
// sans dire pourquoi se lit comme une fonction oubliée.
export const BUSINESS_BLOCKED_STATEMENTS = [
  {
    key: 'balance_sheet',
    label: 'Bilan',
    needs: 'Plan comptable et règles de présentation du Système Comptable Financier algérien (classes, rubriques, règles d’évaluation).',
  },
  {
    key: 'income_statement',
    label: 'Compte de résultat',
    needs: 'Mêmes règles, plus le rattachement des charges et produits à l’exercice — un résultat n’est pas une différence d’encaissements.',
  },
  {
    key: 'vat_return',
    label: 'Déclaration de TVA',
    needs: 'Taux en vigueur datés, régime d’imposition de l’entreprise, règles de déductibilité et périodicité déclarative.',
  },
  {
    key: 'depreciation',
    label: 'Amortissements',
    needs: 'Durées et modes d’amortissement admis, et le registre des immobilisations.',
  },
  {
    key: 'inventory',
    label: 'Stocks',
    needs: 'Méthode de valorisation retenue (CMP, FIFO…) et les mouvements d’entrée et de sortie.',
  },
];

// La phrase que les écrans affichent au-dessus de tout chiffre d'entreprise.
// Elle est ici, en un seul endroit, pour ne pas être reformulée au fil des
// pages jusqu'à perdre ce qu'elle protège.
export const CASH_BASIS_NOTICE =
  'Ces chiffres sont des faits de trésorerie : ce qui est réellement entré et sorti, d’après vos documents et vos règlements. Ce ne sont pas des états comptables, et ils ne remplacent pas un bilan ni une déclaration.';

export const contactKindExists = (kind) => BUSINESS_CONTACT_KINDS.includes(kind);
export const documentKindExists = (kind) => BUSINESS_DOCUMENT_KINDS.includes(kind);

// ---------------------------------------------------------------------------
// Les chiffres de l'espace entreprise, et leur contrat.
//
// Ils ne sont PAS ajoutés au catalogue F001-F057 : celui-là est la liste du
// client, et y glisser des identifiants de notre fait la rendrait impossible à
// relire face à son classeur. Ceux-ci portent donc un préfixe `E`, et il est
// écrit ici qu'ils sont de nous.
//
// Chacun est un fait de trésorerie. Aucun ne suppose une norme comptable, et
// c'est exactement pourquoi ils peuvent être calculés alors que le bilan ne le
// peut pas (voir `BUSINESS_BLOCKED_STATEMENTS`).
export const BUSINESS_FORMULAS = [
  { id: 'E001', fn: 'documentTotal', unit: 'money', version: 1, label: 'Total d’un document', rule: 'total_ttc = montant_ht + taxe', condition: 'Taxe déclarée sur le document, jamais déduite d’un taux supposé' },
  { id: 'E002', fn: 'documentSettled', unit: 'money', version: 1, label: 'Réglé sur un document', rule: 'Σ règlements du document', condition: 'Même devise que le document' },
  { id: 'E003', fn: 'documentOutstanding', unit: 'money', version: 1, label: 'Reste dû', rule: 'total_ttc - Σ règlements', condition: 'Négatif si trop-perçu, et alors signalé' },
  { id: 'E004', fn: 'cashIn', unit: 'money', version: 1, label: 'Encaissements', rule: 'Σ règlements reçus sur documents de vente', condition: 'Sur la période et dans la devise de l’entreprise' },
  { id: 'E005', fn: 'cashOut', unit: 'money', version: 1, label: 'Décaissements', rule: 'Σ règlements versés sur documents d’achat', condition: 'Sur la période et dans la devise de l’entreprise' },
  { id: 'E006', fn: 'cashBalance', unit: 'money', version: 1, label: 'Solde de trésorerie', rule: 'encaissements - décaissements', condition: 'Ce n’est pas un résultat comptable' },
  { id: 'E007', fn: 'receivables', unit: 'money', version: 1, label: 'Créances clients', rule: 'Σ reste dû des ventes non soldées', condition: 'Documents actifs uniquement' },
  { id: 'E008', fn: 'payables', unit: 'money', version: 1, label: 'Dettes fournisseurs', rule: 'Σ reste dû des achats non soldés', condition: 'Documents actifs uniquement' },
  { id: 'E009', fn: 'overdueAmount', unit: 'money', version: 1, label: 'Échu non réglé', rule: 'Σ reste dû des documents dont l’échéance est passée', condition: 'Une échéance absente n’est jamais comptée comme échue' },
  { id: 'E011', fn: 'invoicedNet', unit: 'money', version: 1, label: 'Chiffre d’affaires facturé net des avoirs', rule: 'Σ hors taxe des factures de vente émises - Σ hors taxe de leurs avoirs', condition: 'Factures émises sur la période ; un devis ou un brouillon ne compte pas' },
  { id: 'E012', fn: 'indicativeMargin', unit: 'money', version: 1, label: 'Marge indicative', rule: 'Σ (hors taxe net des avoirs - coûts directs déclarés)', condition: 'Seules les factures dont le coût est déclaré ; sans coût, non calculable. Avant impôts et charges' },
  { id: 'E013', fn: 'openQuotes', unit: 'money', version: 1, label: 'Devis en cours', rule: 'Σ hors taxe des devis envoyés ou acceptés, non facturés et non expirés', condition: 'Un engagement commercial, jamais un encaissement' },
  { id: 'E014', fn: 'refundDue', unit: 'money', version: 1, label: 'À rembourser aux clients', rule: 'Σ (règlements + avoirs - total) des factures où ils dépassent le total', condition: 'Un trop-perçu né d’un avoir, à traiter séparément' },
  { id: 'E015', fn: 'stockValue', unit: 'money', version: 1, label: 'Valeur du stock au coût des lots', rule: 'Σ quantité restante du lot × (coût total du lot / quantité nette du lot)', condition: 'Quantité nette = reçue - pertes ; un lot sans quantité nette n’a pas de coût unitaire' },
  { id: 'E016', fn: 'workingCapital', unit: 'money', version: 1, label: 'Besoin en fonds de roulement simplifié', rule: 'stock au coût + créances clients - dettes fournisseurs', condition: 'Au moins un des trois connu ; les autres comptés à zéro et signalés' },
  { id: 'E017', fn: 'clientDays', unit: 'days', version: 1, label: 'Délai moyen de paiement des clients', rule: 'créances clients / ventes émises sur la période × jours de la période', condition: 'Ventes sur la période ; sinon non calculable' },
  { id: 'E018', fn: 'supplierDays', unit: 'days', version: 1, label: 'Délai moyen de paiement des fournisseurs', rule: 'dettes fournisseurs / achats reçus sur la période × jours de la période', condition: 'Achats sur la période ; sinon non calculable' },
  { id: 'E019', fn: 'breakEven', unit: 'money', version: 1, label: 'Seuil de rentabilité', rule: 'charges fixes / (1 - charges variables / chiffre d’affaires hors taxe)', condition: 'Charges classées fixes ou variables, et marge sur coûts variables positive' },
  { id: 'E020', fn: 'clientConcentration', unit: 'ratio', version: 1, label: 'Part du premier client', rule: 'CA hors taxe du premier client / CA hors taxe total', condition: 'Ventes rattachées à un client sur la période' },
  { id: 'E021', fn: 'budgetGap', unit: 'money', version: 1, label: 'Écart au budget', rule: 'Σ dépenses réelles hors taxe - Σ budget, sur les familles budgétées du mois', condition: 'Un budget saisi pour le mois' },
  { id: 'E022', fn: 'cashAvailable', unit: 'money', version: 1, label: 'Trésorerie disponible', rule: 'dernier solde constaté + encaissements - décaissements depuis', condition: 'Un solde constaté saisi ; sans lui, non calculable' },
  { id: 'E023', fn: 'runway', unit: 'months', version: 1, label: 'Autonomie', rule: 'trésorerie disponible / consommation nette mensuelle moyenne des 3 derniers mois', condition: 'Consommation nette positive ; si les entrées couvrent les sorties, pas d’autonomie à calculer' },
  { id: 'E024', fn: 'cashNeed', unit: 'money', version: 1, label: 'Besoin de trésorerie sur 13 semaines', rule: 'max(0, plancher - solde projeté le plus bas)', condition: 'Un solde constaté de départ ; flux datés par leur échéance' },
  { id: 'E010', fn: 'averageSettlementDays', unit: 'days', version: 1, label: 'Délai moyen de règlement', rule: 'moyenne(date_règlement - date_émission) pondérée par le montant réglé', condition: 'Documents soldés uniquement : un document en cours n’a pas de délai' },
];

export const BUSINESS_FORMULA_IDS = BUSINESS_FORMULAS.map((f) => f.id);
export const businessFormulaById = (id) => BUSINESS_FORMULAS.find((f) => f.id === id) ?? null;
