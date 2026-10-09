// FINCLUDIA calculation engine (P4-09). This file is the client's own catalogue
// of formulas (workbook tab `10_Formules`, 57 rows F001-F057) and algorithms
// (tab `11_Algorithmes`, ALG-01 to ALG-04), transcribed as data.
//
// `label`, `rule` and `condition` hold the client's three columns VERBATIM, and
// were extracted from the workbook by script rather than retyped (checked: the
// 57 triplets are identical to the file). They are what makes a result
// explainable — the "Pourquoi ?" panel the client requires on every computed
// value shows the formula as the client wrote it — and when a formula cannot be
// computed, `condition` is the sentence the server answers instead of inventing
// a reason. Nothing here may be reworded or completed from imagination: an
// indicator the client did not define does not exist.
//
// Like the comparator data (P4-06), these texts stay in the language of the
// client's file and are not translated.
//
// `version` is per formula. Changing the maths of a formula means bumping ITS
// version, never editing it in place: a scenario saved earlier keeps the version
// it was computed with (contract field `formule_version`), so an old result stays
// readable and explainable.

// Units. `money` is resolved at answer time to the currency actually used (the
// client's contract says "DZD, %, mois, points, etc."), so the engine never
// hard-codes a currency.
//
// `ratio` is a DECIMAL rate (0.15), not a percentage (15). The client's rule is
// explicit: "les taux sont calculés en décimal et affichés en pourcentage", and
// several formulas write '× '100" as their DISPLAY step. Multiplying here would
// bake the display into the stored value and lose precision, so the engine keeps
// the decimal and the interface formats it.
// `composite` is for the two rows the client writes with two outputs at once
// (F056 "nouveau_RAV ... ; nouvel_effort ...", F057 "score puis catégorie"):
// the result is a record whose own units are documented by the formula.
export const FINANCE_UNITS = ['money', 'ratio', 'months', 'days', 'points', 'count', 'composite'];

// Monthly factor of a recurring amount (F001). The client lists these five
// frequencies and no other: an unknown frequency makes the amount NOT computable
// rather than guessed (its own error case, "fréquence manquante pour ressource
// périodique", screen ET01).
export const FREQUENCY_FACTORS = Object.freeze({
  hebdomadaire: 52 / 12,
  mensuel: 1,
  trimestriel: 1 / 3,
  semestriel: 1 / 6,
  annuel: 1 / 12,
});

export const FREQUENCIES = Object.keys(FREQUENCY_FACTORS);

// How many times a year a recurring amount falls (F049). Derived from the monthly
// factor so the two can never disagree: weekly 12 × 52/12 = 52, quarterly 4...
export const annualOccurrences = (frequency) =>
  FREQUENCY_FACTORS[frequency] === undefined ? null : FREQUENCY_FACTORS[frequency] * 12;

// The 57 formulas. `fn` is the name of the pure function implementing the row in
// services/finance/formulas.js; a unit test checks that the catalogue and the
// implementations match exactly in both directions.
export const FORMULAS = [
  { id: 'F001', fn: 'monthlyAmount', unit: 'money', version: 1, label: 'Normalisation mensuelle', rule: 'montant_mensuel = montant × facteur_fréquence', condition: 'hebdo 52/12 ; trimestriel 1/3 ; semestriel 1/6 ; annuel 1/12' },
  { id: 'F002', fn: 'totalIncome', unit: 'money', version: 1, label: 'Total revenus', rule: 'Σ revenus normalisés admissibles', condition: 'Même période et devise' },
  { id: 'F003', fn: 'totalExpenses', unit: 'money', version: 1, label: 'Total dépenses', rule: 'Σ dépenses admissibles', condition: 'Même période et devise' },
  { id: 'F004', fn: 'netFlow', unit: 'money', version: 1, label: 'Flux net', rule: 'revenus - dépenses', condition: 'Dépenses réalisées de la période' },
  { id: 'F005', fn: 'mandatoryCharges', unit: 'money', version: 1, label: 'Charges obligatoires', rule: 'Σ charges fixes + échéances obligatoires', condition: 'Catégories versionnées' },
  { id: 'F006', fn: 'livingAllowance', unit: 'money', version: 1, label: 'Reste à vivre', rule: 'revenus nets - charges fixes - mensualités obligatoires', condition: 'Ne pas confondre avec flux net' },
  { id: 'F007', fn: 'netSavings', unit: 'money', version: 1, label: 'Épargne nette', rule: 'entrées affectées à l’épargne - retraits d’épargne', condition: 'Affectation explicite' },
  { id: 'F008', fn: 'savingsRate', unit: 'ratio', version: 1, label: 'Taux d’épargne', rule: 'épargne nette / revenus nets × 100', condition: 'Si revenus > 0' },
  { id: 'F009', fn: 'remainingBudget', unit: 'money', version: 1, label: 'Budget restant', rule: 'budget prévu - dépenses réelles', condition: 'Par catégorie/période' },
  { id: 'F010', fn: 'envelopeUsageRate', unit: 'ratio', version: 1, label: 'Taux consommation enveloppe', rule: 'dépenses réelles / budget × 100', condition: 'Si budget > 0' },
  { id: 'F011', fn: 'envelopeProjection', unit: 'money', version: 1, label: 'Projection enveloppe', rule: 'consommé / jours écoulés × jours période', condition: 'Projection seulement' },
  { id: 'F012', fn: 'dailyBudget', unit: 'money', version: 1, label: 'Budget journalier disponible', rule: '(solde - obligations restantes) / jours restants', condition: 'Si jours restants > 0' },
  { id: 'F013', fn: 'daysOfCover', unit: 'days', version: 1, label: 'Couverture en jours', rule: 'disponible réel / dépense journalière de référence', condition: 'Référence configurable' },
  { id: 'F014', fn: 'safetyFundMonths', unit: 'months', version: 1, label: 'Réserve en mois', rule: 'épargne liquide / dépenses essentielles mensuelles', condition: 'Exclure fictif/illiquide' },
  { id: 'F015', fn: 'safetyFundTarget', unit: 'money', version: 1, label: 'Montant cible réserve', rule: 'cible_mois × dépenses essentielles', condition: 'Cible utilisateur/règle' },
  { id: 'F016', fn: 'safetyFundGap', unit: 'money', version: 1, label: 'Manque de réserve', rule: 'max(0, montant cible - épargne liquide)', condition: '—' },
  { id: 'F017', fn: 'monthlyDebtService', unit: 'money', version: 1, label: 'Service mensuel dette', rule: 'Σ mensualités obligatoires', condition: 'Dettes actives' },
  { id: 'F018', fn: 'debtEffortRate', unit: 'ratio', version: 1, label: 'Taux d’effort dette', rule: 'mensualités obligatoires / revenus nets × 100', condition: 'Indicateur pédagogique' },
  { id: 'F019', fn: 'debtToAnnualIncome', unit: 'ratio', version: 1, label: 'Dette / revenu annuel', rule: 'capital restant total / revenus annuels × 100', condition: 'Optionnel' },
  { id: 'F020', fn: 'periodicRate', unit: 'ratio', version: 1, label: 'Taux périodique crédit', rule: 'r = taux_annuel / périodes_par_an', condition: 'Convention précisée' },
  { id: 'F021', fn: 'annuityPayment', unit: 'money', version: 1, label: 'Mensualité annuité', rule: 'M = P×r / (1-(1+r)^(-n))', condition: 'Si r=0 : M=P/n' },
  { id: 'F022', fn: 'totalCreditPayments', unit: 'money', version: 1, label: 'Total paiements crédit', rule: 'M×n + frais + assurance', condition: 'Selon données disponibles' },
  { id: 'F023', fn: 'totalFinancingCost', unit: 'money', version: 1, label: 'Coût total financement', rule: 'total paiements - capital financé', condition: 'Séparer frais/assurance' },
  { id: 'F024', fn: 'earlyRepaymentSaving', unit: 'money', version: 1, label: 'Remboursement anticipé', rule: 'recalcul échéancier ; économie = coût_base - coût_scenario', condition: 'Frais si renseignés' },
  { id: 'F025', fn: 'goalProgress', unit: 'ratio', version: 1, label: 'Progression objectif', rule: 'capital affecté / montant cible × 100', condition: 'Affichage plafonné 100 %' },
  { id: 'F026', fn: 'goalRemaining', unit: 'money', version: 1, label: 'Reste objectif', rule: 'max(0, cible - capital affecté)', condition: '—' },
  { id: 'F027', fn: 'monthsWithoutReturn', unit: 'months', version: 1, label: 'Mois nécessaires sans rendement', rule: 'ceil((cible-capital)/contribution)', condition: 'Si contribution > 0' },
  { id: 'F028', fn: 'paymentWithoutReturn', unit: 'money', version: 1, label: 'Versement mensuel sans rendement', rule: '(cible - capital) / mois restants', condition: 'Si mois restants > 0' },
  { id: 'F029', fn: 'futureValueLumpSum', unit: 'money', version: 1, label: 'Valeur future capital initial', rule: 'C0×(1+r)^n', condition: 'r périodique' },
  { id: 'F030', fn: 'futureValuePayments', unit: 'money', version: 1, label: 'Valeur future versements', rule: 'V×((1+r)^n-1)/r', condition: 'Fin de période ; si r=0 : V×n' },
  { id: 'F031', fn: 'futureValueTotal', unit: 'money', version: 1, label: 'Valeur future totale', rule: 'F029 + F030', condition: 'Hypothèses visibles' },
  { id: 'F032', fn: 'paymentWithReturn', unit: 'money', version: 1, label: 'Versement requis avec rendement', rule: 'V=(cible-C0(1+r)^n)×r / ((1+r)^n-1)', condition: 'Si r=0 utiliser F028' },
  { id: 'F033', fn: 'realValue', unit: 'money', version: 1, label: 'Valeur réelle', rule: 'valeur nominale / (1+inflation)^années', condition: 'Inflation/horizon explicites' },
  { id: 'F034', fn: 'realReturn', unit: 'ratio', version: 1, label: 'Rendement réel', rule: '(1+rendement_nominal)/(1+inflation)-1', condition: '—' },
  { id: 'F035', fn: 'netWorth', unit: 'money', version: 1, label: 'Patrimoine net', rule: 'Σ actifs réels - Σ dettes réelles', condition: 'Valorisations datées' },
  { id: 'F036', fn: 'assetAllocation', unit: 'ratio', version: 1, label: 'Allocation actif', rule: 'valeur actif / total actifs × 100', condition: 'Si total > 0' },
  { id: 'F037', fn: 'maxConcentration', unit: 'ratio', version: 1, label: 'Concentration maximale', rule: 'max(allocation par actif ou classe)', condition: 'Pédagogique' },
  { id: 'F038', fn: 'paperPortfolioValue', unit: 'money', version: 1, label: 'Valeur portefeuille fictif', rule: 'Σ quantité × prix simulé', condition: 'Badge simulation' },
  { id: 'F039', fn: 'paperGainLoss', unit: 'money', version: 1, label: 'Gain/perte fictif', rule: 'valeur actuelle fictive - coût fictif', condition: 'Inclure frais fictifs' },
  { id: 'F040', fn: 'paperReturn', unit: 'ratio', version: 1, label: 'Rendement fictif', rule: 'gain/perte / coût fictif × 100', condition: 'Si coût > 0' },
  { id: 'F041', fn: 'equalShare', unit: 'money', version: 1, label: 'Part égale', rule: 'montant / nombre participants', condition: 'Arrondi documenté' },
  { id: 'F042', fn: 'incomeProportionalShare', unit: 'money', version: 1, label: 'Part proportionnelle revenus', rule: 'montant × revenu_i / Σ revenus', condition: 'Avec consentement' },
  { id: 'F043', fn: 'sharedMemberBalance', unit: 'money', version: 1, label: 'Solde membre partagé', rule: 'payé pour groupe - quote-part due - règlements reçus + règlements versés', condition: 'Positif = à recevoir' },
  { id: 'F044', fn: 'householdContribution', unit: 'money', version: 1, label: 'Contribution foyer proportionnelle', rule: 'dépenses communes × revenu_i / revenu total', condition: 'Mode facultatif' },
  { id: 'F045', fn: 'monthlyProvision', unit: 'money', version: 1, label: 'Provision mensuelle', rule: '(montant prévu - déjà provisionné) / mois restants', condition: 'Si mois restants > 0' },
  { id: 'F046', fn: 'savingsCapacity', unit: 'money', version: 1, label: 'Capacité d’épargne', rule: 'revenus - dépenses - mensualités - marge réservée éventuelle', condition: 'Marge explicite' },
  { id: 'F047', fn: 'studentAutonomy', unit: 'ratio', version: 1, label: 'Autonomie financière étudiant', rule: 'revenus personnels / dépenses totales × 100', condition: 'Définition revenus personnels versionnée' },
  { id: 'F048', fn: 'jobOfferNetValue', unit: 'money', version: 1, label: 'Net économique offre emploi', rule: 'net + avantages monétisables - coûts liés à l’emploi', condition: 'Hypothèses visibles' },
  { id: 'F049', fn: 'normalizedRecurringCost', unit: 'money', version: 1, label: 'Coût récurrent normalisé', rule: 'montant × fréquence annuelle / 12', condition: 'Mensuel et annuel' },
  { id: 'F050', fn: 'shockCoverage', unit: 'months', version: 1, label: 'Couverture déficit choc', rule: 'réserve liquide / déficit mensuel après choc', condition: 'Si déficit > 0' },
  { id: 'F051', fn: 'fundingReadinessIndex', unit: 'points', version: 1, label: 'Indice préparation financement', rule: 'Σ(sous-score_i × poids_i) / Σ poids_i', condition: 'Poids configurables/visibles' },
  { id: 'F052', fn: 'financialKnowledgeIndex', unit: 'points', version: 1, label: 'Indice connaissances financières', rule: 'Σ(dimension_i normalisée × poids_i) / Σ poids_i', condition: 'Dimensions/poids versionnés' },
  { id: 'F053', fn: 'financialHealthIndex', unit: 'points', version: 1, label: 'Indice santé financière', rule: 'Σ(sous-score_i normalisé × poids_i) / Σ poids disponibles', condition: 'Score partiel si besoin' },
  { id: 'F054', fn: 'optionFitScore', unit: 'points', version: 1, label: 'Score adéquation option', rule: 'Σ(correspondance_i × poids_i) / Σ poids_i', condition: 'Aucun classement opaque' },
  { id: 'F055', fn: 'dataAgeDays', unit: 'days', version: 1, label: 'Âge donnée', rule: 'date_courante - date_effet ou date_collecte', condition: 'Seuil par type' },
  { id: 'F056', fn: 'newPaymentImpact', unit: 'composite', version: 1, label: 'Impact nouvelle mensualité', rule: 'nouveau_RAV = RAV_actuel - mensualité ; nouvel_effort=(service_actuel+mensualité)/revenus', condition: 'Ne préjuge pas accord crédit' },
  { id: 'F057', fn: 'riskProfileScore', unit: 'composite', version: 1, label: 'Profil pédagogique risque', rule: 'Σ points réponses × poids puis catégorie par seuils versionnés', condition: 'Seuils non figés' },
];

export const FORMULA_IDS = FORMULAS.map((f) => f.id);
export const formulaById = (id) => FORMULAS.find((f) => f.id === id) ?? null;

// The four algorithms, used where no closed formula is enough (client's wording).
export const ALGORITHMS = [
  { id: 'ALG-01', fn: 'debtPayoffPlan', version: 1, rule: 'Simuler période par période. Priorité au coût le plus élevé ou au capital restant le plus faible ; réallouer la mensualité libérée.' },
  { id: 'ALG-02', fn: 'minimalSettlements', version: 1, rule: 'Calculer soldes nets, séparer créanciers/débiteurs, affecter successivement min(crédit,dette) jusqu’à extinction.' },
  { id: 'ALG-03', fn: 'goalReachDate', version: 1, rule: 'Itérer mensuellement : capital suivant = capital×(1+r)+versement ; arrêter lorsque capital ≥ cible.' },
  { id: 'ALG-04', fn: 'detectRecurrences', version: 1, rule: 'Comparer commerçant/libellé, montant toléré et intervalle ; demander confirmation avant création.' },
];

export const ALGORITHM_IDS = ALGORITHMS.map((a) => a.id);
export const algorithmById = (id) => ALGORITHMS.find((a) => a.id === id) ?? null;

// Guard rails for the iterative algorithms: a user may type an unreachable
// target (contribution smaller than the interest, 0 % return on a huge goal), and
// an unbounded loop would hang the request. Reaching the cap is NOT an error, it
// answers "not reachable within the horizon" — 600 months is 50 years, past any
// horizon the client's screens offer.
export const MAX_ITERATION_MONTHS = 600;
