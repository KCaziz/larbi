// FINCLUDIA common financial data model (P6-02): the metadata socle every
// financial table of Phase 6 reuses, as the client's own file defines it
// (FINCLUDIA_Cahier_des_Charges_Complet.xlsx, onglet "04_Donnees_Objets",
// section « Métadonnée obligatoire »).
//
// The client lists eleven metadata there: valeur, devise, propriétaire /
// périmètre, source, référence_source, date_effet, date_collecte, statut,
// confiance, consentement, version. The phase summary in TASKS.md calls one of
// them "méthode de saisie": that is this file's `source` — the client's own
// wording for it is « Manuelle, importée, document, partenaire, calculée »,
// which IS how the value got in. There is no twelfth field.
//
// `value` and `currency` live on each table (an amount column and an ISO code),
// because their SQL types differ from one object to the next; everything else is
// the shared block documented in prisma/schema.prisma above model FinCategory
// and applied identically by every financial table.

// Périmètre. The client's « Utilisateur, couple, foyer ou espace partagé »;
// P6-02 restates it as « personnel / espace partagé / foyer ». Default is
// `personal` everywhere: the phase rule is « données privées par défaut ; rien
// n'entre dans un espace partagé sans action explicite ».
export const DATA_SCOPES = ['personal', 'couple', 'household', 'space'];
export const DEFAULT_DATA_SCOPE = 'personal';

// Source, i.e. how the value entered FINCLUDIA. Client's five, no other.
export const DATA_SOURCES = ['manual', 'imported', 'document', 'partner', 'computed'];

// Statut. Client's seven, no other. A closed, versioned list — its own rule:
// « Une valeur fictive ne peut pas devenir réelle sans action explicite ».
export const DATA_STATUSES = ['real', 'declared', 'imported', 'computed', 'fictional', 'official', 'to_confirm'];

// THE status that must never be added to the others (phase rule: « réel et
// fictif jamais additionnés », and the « SIMULATION » badge).
export const FICTIONAL_STATUS = 'fictional';

// Niveau de confiance. The client writes « Niveau ou règle de confiance
// lorsque pertinent » and does NOT enumerate the levels: these three are ours,
// declared as such, and the column is nullable so "not stated" stays different
// from "low". If the client answers with its own scale (P6-01 point 5 covers
// the thresholds it still owes), only this list changes.
export const CONFIDENCE_LEVELS = ['high', 'medium', 'low'];

// Consentement, « usages autorisés ». Only the two uses the client's own rules
// actually describe: letting a row into a shared space (« rien n'entre dans un
// espace partagé sans action explicite », P6-13) and letting it leave in an
// export (P6-20). Nothing is inferred beyond those two — an empty list means
// the row is for its owner's eyes and nothing else, which is the default.
export const CONSENT_USES = ['shared_space', 'export'];

// What happened to a row, for the correction trail (`FinChange`). A financial
// row that feeds a history is never erased: it is corrected or logically
// deleted, and the journal says which, when and by whom.
export const CHANGE_ACTIONS = ['create', 'correct', 'archive', 'restore', 'delete'];

// Tables carrying the socle, for the extended consistency control. Every new
// financial table of Phase 6 adds itself here, and `amounts: false` says the
// object has no `value`/`currency` of its own (a category names a line, it is
// not a line), so the currency and integer-amount rules do not apply to it.
export const FINANCIAL_TABLES = [
  { model: 'finCategory', table: 'fin_categories', label: 'category', amounts: false, currency: false },
  { model: 'finIncome', table: 'fin_incomes', label: 'income', amounts: true, currency: true },
  { model: 'finTransaction', table: 'fin_transactions', label: 'transaction', amounts: true, currency: true },
  // An onboarding record holds SEVERAL declared amounts (in `answers`) rather
  // than one `value`, but it does carry the currency they are all expressed in,
  // so the currency rule applies to it and the amount rule does not.
  { model: 'finOnboarding', table: 'fin_onboardings', label: 'onboarding', amounts: false, currency: true },
  // A budget is a period, not an amount: its total is the sum of its envelopes.
  // It does carry the currency they are all expressed in, so the currency rule
  // applies to it and the amount rule does not.
  { model: 'finBudget', table: 'fin_budgets', label: 'budget', amounts: false, currency: true },
  { model: 'finEnvelope', table: 'fin_envelopes', label: 'envelope', amounts: true, currency: true },
  // Goals (P6-08) and debts (P6-10) name their amounts `target` / `allocated`
  // and `outstandingPrincipal` / `monthlyInstalment` rather than `value`, so the
  // single-amount rule does not apply to them; the currency rule does, and so
  // does the whole rest of the socle.
  { model: 'finGoal', table: 'fin_goals', label: 'goal', amounts: false, currency: true },
  { model: 'finDebt', table: 'fin_debts', label: 'debt', amounts: false, currency: true },
  // Calendar and recurring expenses (P6-07). A recurrence carries one amount
  // (`value`) like a movement; a provision names its own `value` and the part
  // already set aside, so the amount rule applies to both.
  { model: 'finRecurrence', table: 'fin_recurrences', label: 'recurrence', amounts: true, currency: true },
  { model: 'finProvision', table: 'fin_provisions', label: 'provision', amounts: true, currency: true },
  // Real patrimony (P6-11). One amount, one currency, and the socle's `status`
  // may never be `fictional` here — checked by its own rule below.
  { model: 'finAsset', table: 'fin_assets', label: 'asset', amounts: true, currency: true },
];
