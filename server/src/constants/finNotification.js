// Notifications and alerts (P6-18), screen C24, onglet « 14_Etats_Alertes ».
import { ACTION_PRIORITIES } from './finDashboard.js';

// The client's three filters on the notification list.
export const NOTIFICATION_CATEGORIES = ['action', 'information', 'securite'];

// The client's own ordering for competing alerts, reused from the home
// dashboard (P6-06) rather than redeclared: one list, one source of truth.
export const NOTIFICATION_PRIORITIES = ACTION_PRIORITIES;

/**
 * The closed catalogue of notification types. Nothing is ever free text: a
 * type decides its category (filter), its priority (sort order), whether it
 * needs explicit opt-in (the client's "rappels uniquement sur consentement"),
 * and whether it is on by default.
 *
 * `securite` has no wired trigger yet — nothing in FINCLUDIA currently raises
 * a security event — so the category exists and is filterable, but the list
 * documents that gap rather than inventing a fake alert to fill it.
 */
export const NOTIFICATION_TYPES = [
  // P6-05: an envelope crosses one of its declared thresholds.
  { key: 'budget_alert', category: 'action', priority: 'budget', requiresOptIn: false, defaultEnabled: true },
  // P6-08: a common or personal goal's target date has passed, unreached.
  { key: 'goal_overdue', category: 'action', priority: 'echeance', requiresOptIn: false, defaultEnabled: true },
  // P6-08: a goal reaches a round milestone of its progress.
  { key: 'goal_milestone', category: 'information', priority: 'apprentissage', requiresOptIn: false, defaultEnabled: true },
  // P6-13: another member of a shared space changed what they share.
  { key: 'sharing_changed', category: 'information', priority: 'apprentissage', requiresOptIn: false, defaultEnabled: true },
  // P6-07: a planned payment, recurrence or provision is coming up. Opt-in
  // only — the client's own rule, stated for exactly this case. `enabled`
  // defaults to true like every other type ("not turned off"); the actual
  // gate is `optedIn`, which defaults to false and is the ONLY thing that
  // makes `requiresOptIn: true` mean something.
  { key: 'reminder_upcoming', category: 'action', priority: 'echeance', requiresOptIn: true, defaultEnabled: true },
];

export const NOTIFICATION_TYPE_KEYS = NOTIFICATION_TYPES.map((t) => t.key);
export const notificationTypeByKey = (key) => NOTIFICATION_TYPES.find((t) => t.key === key) ?? null;

// Anti-repetition: an ESCALATING signal (a threshold level going up) is new
// information and gets a new row; the same level does not. A ONE-OFF fact
// (a goal going overdue) is created once per reference, full stop — matching
// is done by the caller via `dedupeBy` ('level' vs 'reference').
export const NOTIFICATIONS_PER_DAY_MAX = 30;
export const REMINDER_WINDOW_DAYS = 7;
