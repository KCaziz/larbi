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
// quelqu'un se trompe.
export const DOCUMENT_SETTLEMENT_STATES = ['unpaid', 'partial', 'paid', 'overpaid'];

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
  { id: 'E010', fn: 'averageSettlementDays', unit: 'days', version: 1, label: 'Délai moyen de règlement', rule: 'moyenne(date_règlement - date_émission) pondérée par le montant réglé', condition: 'Documents soldés uniquement : un document en cours n’a pas de délai' },
];

export const BUSINESS_FORMULA_IDS = BUSINESS_FORMULAS.map((f) => f.id);
export const businessFormulaById = (id) => BUSINESS_FORMULAS.find((f) => f.id === id) ?? null;
