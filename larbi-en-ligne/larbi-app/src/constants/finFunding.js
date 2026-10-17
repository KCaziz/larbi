// Funding readiness (P6-16), screens JA08 / SA05: an index of the person's
// OWN preparation (completeness, stability, debt effort, down payment,
// reserve) — never a credit score, never a prediction, never a guarantee.
// The client's own words are binding here: "jamais le mot « score de crédit »,
// aucune prédiction ni garantie d'accord."
export const FUNDING_DIMENSIONS = ['completeness', 'stability', 'debtEffort', 'downPayment', 'reserve'];

/**
 * F051 takes its weights as arguments — the mechanism is built — but the
 * client leaves them "à valider" (P6-01 point 5), exactly like F052's and
 * F053's weights. A combined index on invented weights would be a judgement
 * nobody can check, which this project refuses. The screen shows each
 * dimension on its own instead, which is what the client's own
 * "sous-scores... pondérations visibles" rule already asks for everywhere
 * else an index is involved.
 */
export const FUNDING_INDEX_BLOCKED = { formula: 'F051', waitingOn: 'P6-01', reason: 'weights' };

// "Stabilité" has no formula anywhere in the client's workbook — unlike the
// other four dimensions, which are each an existing, already-built figure.
// Inventing one would be exactly the kind of judgement this project refuses
// to manufacture, so it is reported as a declared gap, not a guessed number.
export const STABILITY_BLOCKED = { formula: null, waitingOn: 'P6-01', reason: 'noFormulaSupplied' };
