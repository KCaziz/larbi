// The small shared values of the connected space's common controls (P1-12).
//
// They live outside the components that use them for a plain reason: a module
// that exports both a component and a constant breaks React's fast refresh, so
// every edit to it reloads the page instead of the component.

// The client's four windows, in the client's order. An arbitrary date range is
// a different control answering a different question, and is not one of them.
// P8-06 (ACC-05): « Jour | Semaine | Mois | 90 jours | Année | Période ».
// « periode » is a free range the screen asks for with two dates.
export const PERIODS = ['jour', 'semaine', 'mois', '90jours', 'annee', 'periode'];

// Real and fictional, never both: the engine's rule is that the two are never
// added together, so a screen shows one world at a time.
export const REALITIES = ['reel', 'fictif'];

// The two dates one of the client's four windows stands for, for an endpoint
// that takes a period (`from` / `to`).
//
// « mois » returns null: the server's own default IS the calendar month, so the
// most common choice sends no parameter at all and the existing behaviour is
// untouched.
//
// « semaine » and « 90 jours » are ROLLING windows, and that is a decision
// rather than a shortcut: the first day of the week depends on the locale
// (Monday, Saturday, Sunday), so a calendar week would silently change the
// figure with the reading language. « année » is the calendar year, where no
// such ambiguity exists.
export function periodRange(period, now = new Date(), custom = null) {
  if (period === 'periode') return custom?.from && custom?.to ? { from: custom.from, to: custom.to } : null;
  const day = (d) => d.toISOString().slice(0, 10);
  const shift = (days) => day(new Date(now.getTime() - days * 24 * 3600 * 1000));
  if (period === 'jour') return { from: day(now), to: day(now) };
  if (period === 'semaine') return { from: shift(6), to: day(now) };
  if (period === '90jours') return { from: shift(89), to: day(now) };
  if (period === 'annee') return { from: `${now.getUTCFullYear()}-01-01`, to: day(now) };
  return null;
}

// What the top bar dispatches to open the assistant panel. The assistant is a
// floating panel, not a route, so the bar announces the intent and the widget —
// the one place that owns that state — answers.
export const ASSISTANT_OPEN_EVENT = 'fincludia:assistant-open';
