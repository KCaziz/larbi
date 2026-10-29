// The single catalogue of the Tools (P8-15, consolidated cahier OUT-01 and
// OUT-02, tab 23_Calculateurs; last file, tab 12_Calculateurs).
//
// Every calculator the client lists is here, under its own code: CAL-01 to
// CAL-30 and CAL-V7-01 to 05 of the consolidated cahier, CAL-P01 to CAL-P17 of
// the last file — except CAL-21 (« Règlements simplifiés » between members),
// which is collective and belongs to « Gestion commune » (P8-01 point 10).
// The tools that are not calculators (comparator, workshop, payslip…) follow.
//
// Where a calculator lives:
// - `simulator`: a stand-alone simulator, `/outils/simulateurs/<key>`, that
//   computes on the figures the person types;
// - `to`: the screen that applies the same formula to the person's own data.
//   The CAL-P calculators are « branchés sur leur formule PB-F » this way:
//   the screen named here is the one that serves that PB-F.
// A calculator can have both. One that has neither yet is `pending`, with the
// open task that owns it — never hidden, never shown as if it worked.
//
// The families are ours: neither tab groups its calculators. They follow the
// application's menu, so a family reads like the place the person already
// knows.

export const TOOL_FAMILIES = ['budget', 'savings', 'debt', 'wealth', 'income', 'analysis', 'practical'];

// Excluded on purpose, with the reason, so a consistency check can tell a
// deliberate absence from a forgotten one.
export const EXCLUDED_CALCULATORS = { 'CAL-21': 'collective: Gestion commune (Phase 9)' };

const sim = (key) => ({ simulator: key });

export const TOOLS_CATALOGUE = [
  // ---- consolidated cahier, tab 23_Calculateurs ----------------------------
  { code: 'CAL-01', label: 'Budget mensuel', family: 'budget', formulas: 'F002-F010', ...sim('budget-mensuel'), to: '/budgets' },
  { code: 'CAL-02', label: 'Budget jusqu’à fin de mois', family: 'budget', formulas: 'F012-F013', ...sim('budget-fin-de-mois'), to: '/budgets' },
  { code: 'CAL-03', label: 'Enveloppe budgétaire', family: 'budget', formulas: 'F009-F011', ...sim('enveloppe'), to: '/budgets' },
  { code: 'CAL-04', label: 'Capacité d’épargne', family: 'savings', formulas: 'F004,F006-F008,F046', ...sim('capacite-epargne') },
  // The client's handwritten « réserve de sécurité » under its list.
  { code: 'CAL-05', label: 'Réserve de sécurité', family: 'savings', formulas: 'F014-F016', ...sim('reserve-securite'), to: '/objectifs/fonds-urgence' },
  { code: 'CAL-06', label: 'Objectif sans rendement', family: 'savings', formulas: 'F025-F028', ...sim('objectif-sans-rendement'), to: '/objectifs' },
  { code: 'CAL-07', label: 'Objectif avec rendement', family: 'savings', formulas: 'F029-F032', ...sim('objectif-avec-rendement') },
  { code: 'CAL-08', label: 'Inflation / pouvoir d’achat', family: 'savings', formulas: 'F033-F034', ...sim('inflation') },
  { code: 'CAL-09', label: 'Taux d’effort dette', family: 'debt', formulas: 'F017-F019', ...sim('effort-dette'), to: '/dettes' },
  { code: 'CAL-10', label: 'Mensualité de financement', family: 'debt', formulas: 'F020-F023,F056', ...sim('mensualite-financement') },
  { code: 'CAL-11', label: 'Remboursement anticipé', family: 'debt', formulas: 'F024', ...sim('remboursement-anticipe') },
  { code: 'CAL-12', label: 'Stratégies de dettes', family: 'debt', formulas: 'ALG-01', ...sim('strategies-dettes'), to: '/dettes' },
  { code: 'CAL-13', label: 'Patrimoine net', family: 'wealth', formulas: 'F035-F037', to: '/patrimoine' },
  { code: 'CAL-14', label: 'Portefeuille fictif', family: 'wealth', formulas: 'F038-F040', to: '/portefeuille' },
  { code: 'CAL-15', label: 'Autonomie financière étudiant', family: 'budget', formulas: 'F047', ...sim('autonomie-etudiant') },
  { code: 'CAL-16', label: 'Provision études / annuelle', family: 'savings', formulas: 'F045', ...sim('provision'), to: '/calendrier' },
  { code: 'CAL-17', label: 'Premier salaire', family: 'income', formulas: 'F004-F008', ...sim('premier-salaire') },
  { code: 'CAL-18', label: 'Comparateur offres d’emploi', family: 'income', formulas: 'F048', to: '/outils/offres-emploi' },
  { code: 'CAL-19', label: 'Abonnements / récurrences', family: 'budget', formulas: 'F049', to: '/calendrier' },
  { code: 'CAL-24', label: 'Préparation au financement', family: 'debt', formulas: 'F051', to: '/financement', appOnly: true },
  // JA09, named so in the catalogue (« Comparer un financement »).
  { code: 'CAL-25', label: 'Comparer un financement', family: 'debt', formulas: 'F054-F056', to: '/outils/credit', appOnly: true },
  { code: 'CAL-26', label: 'Profil de risque pédagogique', family: 'wealth', formulas: 'F057', to: '/portefeuille' },
  { code: 'CAL-27', label: 'Indice de connaissances financières', family: 'analysis', formulas: 'F052', to: '/progression' },
  { code: 'CAL-28', label: 'Indice de santé financière', family: 'analysis', formulas: 'F053', to: '/sante' },
  { code: 'CAL-29', label: 'Projection retraite indicative', family: 'savings', formulas: 'F031,F033', ...sim('projection-retraite') },
  { code: 'CAL-30', label: 'Simulation logement / immobilier', family: 'debt', formulas: 'F021-F023,F056', ...sim('simulation-logement') },
  { code: 'CAL-V7-01', label: 'Analyse 50/30/20', family: 'analysis', formulas: 'AN-F005-AN-F008', to: '/budgets' },
  { code: 'CAL-V7-02', label: 'Scénarios d’épargne mensuelle', family: 'savings', formulas: 'AN-F009-AN-F012', pending: 'P8-24' },
  { code: 'CAL-V7-03', label: 'Pointage mensuel', family: 'budget', formulas: 'AN-F004', to: '/mouvements' },
  { code: 'CAL-V7-04', label: 'Projection solde fin de mois', family: 'budget', formulas: 'AN-F013', to: '/calendrier' },
  { code: 'CAL-V7-05', label: 'Rapport mensuel', family: 'analysis', formulas: 'Agrégation des formules', to: '/synthese' },

  // ---- last file, tab 12_Calculateurs: each on its PB-F --------------------
  { code: 'CAL-P01', label: 'Solde d’un compte', family: 'budget', formulas: 'PB-F001', to: '/comptes' },
  { code: 'CAL-P02', label: 'Solde total', family: 'budget', formulas: 'PB-F002', to: '/comptes' },
  { code: 'CAL-P03', label: 'Flux net', family: 'analysis', formulas: 'PB-F006', to: '/synthese' },
  { code: 'CAL-P04', label: 'Budget restant', family: 'budget', formulas: 'PB-F008', to: '/budgets' },
  { code: 'CAL-P05', label: 'Reste à allouer', family: 'budget', formulas: 'PB-F009', to: '/budgets' },
  { code: 'CAL-P06', label: 'Moyenne journalière', family: 'budget', formulas: 'PB-F011', to: '/budgets' },
  { code: 'CAL-P07', label: 'Projection fin de période', family: 'budget', formulas: 'PB-F012', to: '/budgets' },
  { code: 'CAL-P08', label: 'Budget quotidien disponible', family: 'budget', formulas: 'PB-F013', ...sim('budget-fin-de-mois'), to: '/budgets' },
  { code: 'CAL-P09', label: 'Objectif', family: 'savings', formulas: 'PB-F014-PB-F016', ...sim('objectif-sans-rendement'), to: '/objectifs' },
  { code: 'CAL-P10', label: 'Fonds d’urgence', family: 'savings', formulas: 'PB-F017-PB-F019', ...sim('reserve-securite'), to: '/objectifs/fonds-urgence' },
  { code: 'CAL-P11', label: 'Ratio dette/revenu', family: 'debt', formulas: 'PB-F020', ...sim('effort-dette'), to: '/dettes' },
  { code: 'CAL-P12', label: 'Stratégie remboursement', family: 'debt', formulas: 'ALG-P01', ...sim('strategies-dettes'), to: '/dettes' },
  { code: 'CAL-P13', label: 'Paiement régulier', family: 'budget', formulas: 'PB-F021', to: '/calendrier' },
  { code: 'CAL-P14', label: 'Prévu vs réel', family: 'analysis', formulas: 'PB-F022', to: '/budgets' },
  { code: 'CAL-P15', label: 'Tendance', family: 'analysis', formulas: 'PB-F023', to: '/synthese' },
  { code: 'CAL-P16', label: 'Mensualité crédit', family: 'debt', formulas: 'Formules V4 F020-F023', ...sim('mensualite-financement'), to: '/outils/credit' },
  { code: 'CAL-P17', label: 'Patrimoine comptes', family: 'wealth', formulas: 'PB-F024', to: '/patrimoine' },

  // Screen LY09 of the first cahier, a simulator of its own (not in either tab).
  { code: 'LY09', label: 'Préparer mes études', family: 'budget', formulas: 'F002-F004', ...sim('budget-etudiant') },

  // ---- the tools that are not calculators ---------------------------------
  { code: 'OUT-COMPARATEUR', label: 'Comparateur bancaire', family: 'practical', to: '/outils/comparateur' },
  { code: 'OUT-POSTAL', label: 'Algérie Poste / CCP', family: 'practical', to: '/outils/postal' },
  // C19 of the first cahier (« moteur de comparaison »), highlighted by the client.
  { code: 'OUT-COMPARER', label: 'Comparer des options', family: 'practical', formulas: 'F054', to: '/outils/comparer', appOnly: true },
  { code: 'OUT-ATELIER', label: 'Atelier de simulation', family: 'practical', to: '/outils/atelier' },
  { code: 'OUT-PAIE', label: 'Décodeur de fiche de paie', family: 'income', to: '/outils/fiche-de-paie', appOnly: true },
  { code: 'OUT-FACTURE', label: 'Générateur de facture', family: 'practical', to: '/outils/facture' },
  { code: 'OUT-EXPLORATEUR', label: 'Explorateur', family: 'practical', to: '/outils/explorateur' },
];

/** The catalogue as the screen reads it: every entry with where it opens. */
export function toolsCatalogue() {
  return {
    familles: TOOL_FAMILIES,
    outils: TOOLS_CATALOGUE.map((tool) => ({
      code: tool.code,
      label: tool.label,
      family: tool.family,
      formulas: tool.formulas ?? null,
      to: tool.to ?? null,
      simulator: tool.simulator ? `/outils/simulateurs/${tool.simulator}` : null,
      appOnly: Boolean(tool.appOnly) || (!tool.simulator && Boolean(tool.to) && !tool.to.startsWith('/outils')),
      pending: tool.pending ?? null,
    })),
  };
}
