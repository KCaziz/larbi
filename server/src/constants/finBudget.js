// Budgets and envelopes (P6-05): the vocabularies of the client's screens C06
// (« Budget du mois »), JA03 and JA04 (« Plan de répartition du premier
// salaire »), and the calculators CAL-01 / CAL-03.
//
// Nothing here prescribes a split. The client is explicit — « aucune règle type
// 50/30/20 imposée » — so there is no preset distribution in this file, only
// the shapes an envelope may take.

// The client's own two kinds of envelope: « fixe / variable ». A fixed envelope
// is a charge the person cannot decide not to pay this month (rent, a
// subscription), a variable one is everything they still have a hand on. The
// distinction is the client's, and F005 / F006 depend on it.
export const ENVELOPE_KINDS = ['fixed', 'variable'];

// « Récurrence » of a budget: whether the period repeats, and how. Used by the
// "duplicate for the next period" action to compute the next period, and shown
// as-is. `none` is a one-off budget (a month someone budgeted once), which must
// stay possible — a mandatory recurrence would invent a commitment.
export const BUDGET_RECURRENCES = ['none', 'monthly', 'quarterly', 'yearly'];
export const DEFAULT_BUDGET_RECURRENCE = 'monthly';

// Alerts: the client asks for « 80 % / 100 % / dépassement, configurables ».
// Thresholds are RATIOS (the engine's convention: a decimal, shown × 100), they
// are stored per budget, and these are only the defaults offered when someone
// creates one. They are arguments everywhere, never a hidden coefficient —
// P4-09's rule — and the answer carries them so a screen can show them.
export const DEFAULT_ALERT_THRESHOLDS = [0.8, 1];
export const MAX_ALERT_THRESHOLDS = 5;

// The level an envelope is at. `exceeded` is the client's « dépassement »: past
// the budget, which is a fact to show, never an error and never a refusal — the
// money is already spent.
export const ALERT_LEVELS = ['none', 'warning', 'reached', 'exceeded'];

// How many past months the automatic distribution looks at. PROPOSED, never
// imposed (the client's own wording): the endpoint writes nothing.
export const PROPOSAL_MONTHS = 3;
export const MAX_PROPOSAL_MONTHS = 12;

// One account's budgets, per page. A budget is a period: nobody has thousands.
export const BUDGETS_PAGE_SIZE = 24;

// The two sources the first distribution may be proposed from, declared so the
// answer says where each figure came from instead of looking like a
// recommendation out of nowhere.
export const PROPOSAL_SOURCES = ['history', 'onboarding'];
