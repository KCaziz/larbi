// Financial calendar and recurring expenses (P6-07): the client's screens C23
// (« Calendrier »), SA03 / SA04 (« Plan du mois »), ET04, FA04, and ALG-04
// (« Détection récurrence »).

// What can appear on a day of the calendar. Each kind says where the line comes
// from, because they are not the same promise: a planned movement is something
// the person wrote down, a recurrence occurrence is something we EXPECT from a
// pattern they confirmed, and a provision deadline is a date they set.
//
// A planned event is NOT a transaction until it is confirmed (the client's own
// rule, « Marquer payé »), which is why `planned_expense` and `planned_income`
// are read from the movements already marked `planned` in P6-04 instead of
// being copied into a second table: one row, one reading, no double counting.
export const CALENDAR_EVENT_KINDS = ['planned_expense', 'planned_income', 'recurrence', 'provision'];

// Month or week (the client asks for both).
export const CALENDAR_VIEWS = ['month', 'week'];

// How far ahead the calendar may be asked for, in days. A bound, not an
// opinion: the projection is a simple cumulative sum and a request for ten
// years of it would be a response nobody can read.
export const CALENDAR_MAX_DAYS = 400;

// ALG-04's parameters, as the defaults this application offers. They are
// ARGUMENTS of the algorithm (the engine never holds a hidden coefficient), so
// these are only what the detection endpoint uses when the caller says nothing.
// The client gives « libellé, montant toléré, intervalle » without numbers, so
// these three values are OURS and declared as such.
export const DETECTION_DEFAULTS = {
  amountTolerance: 0.05,
  intervalDays: 30,
  intervalToleranceDays: 5,
  minimumOccurrences: 3,
};

// How far back the detection looks. Three intervals at least are needed for a
// pattern (ALG-04's own minimum), so six months of history is what makes a
// monthly subscription detectable without reading someone's whole life.
export const DETECTION_WINDOW_DAYS = 185;

// Reminders « J-7 / J-1 configurables ». Days BEFORE the due date, stored per
// recurrence and per provision. The channel belongs to P6-18: until it exists,
// these are shown in the interface and pushed nowhere — which is also the
// client's own order (« canal in-app d'abord »).
export const DEFAULT_REMINDER_DAYS = [7, 1];
export const MAX_REMINDER_DAYS = 4;
export const MAX_REMINDER_DAY_VALUE = 60;

// A « jour de tension » is a day where the projected cash falls below this
// floor. Zero is the only floor that needs no decision from anybody: it means
// "the money runs out". A person may raise it for themselves; the client sets no
// threshold, so none is invented.
export const DEFAULT_TENSION_FLOOR = 0;

// A provision is for a dated expense: school fees in September, an insurance
// premium in March. `targetDate` is that date, and the monthly provision (F045)
// counts the months left until it.
export const PROVISION_STATES = ['active', 'reached', 'passed'];

// One account's recurrences and provisions, per page. Neither is a list anybody
// has thousands of.
export const RECURRENCES_PAGE_SIZE = 100;
