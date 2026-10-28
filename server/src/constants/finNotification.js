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
// The families the person sets one by one (the client's answer D7,
// 2026-10-28): budgets, revenus, échéances, dettes, objectifs, formation,
// sécurité. A family is a group of types; turning a family off turns off its
// types. Account alerts belong to « budgets » (budgets et comptes).
export const NOTIFICATION_FAMILIES = ['budgets', 'revenus', 'echeances', 'dettes', 'objectifs', 'formation', 'securite'];

export const NOTIFICATION_TYPES = [
  // AL-P04 / AL-P05 (P6-05): an envelope crosses 80 % or 100 %.
  { key: 'budget_alert', family: 'budgets', alert: 'AL-P04', category: 'action', priority: 'budget', requiresOptIn: false, defaultEnabled: true },
  // AL-P02 / AL-P03 (P8-05): an account under its threshold, or in the red.
  { key: 'account_alert', family: 'budgets', alert: 'AL-P02', category: 'action', priority: 'securite', requiresOptIn: false, defaultEnabled: true },
  // AL-P01 (P8-11): an expected income whose date has come — confirm it.
  { key: 'income_to_confirm', family: 'revenus', alert: 'AL-P01', category: 'action', priority: 'echeance', requiresOptIn: false, defaultEnabled: true },
  // AL-P06 (P6-07): a payment, recurrence or provision is coming up. Opt-in
  // only — the client's own rule for reminders. `enabled` defaults to true
  // like every other type; the gate is `optedIn`, false by default.
  { key: 'reminder_upcoming', family: 'echeances', alert: 'AL-P06', category: 'action', priority: 'echeance', requiresOptIn: true, defaultEnabled: true },
  // AL-P07: a planned or regular payment whose date has passed, unconfirmed.
  { key: 'payment_to_confirm', family: 'echeances', alert: 'AL-P07', category: 'action', priority: 'echeance', requiresOptIn: false, defaultEnabled: true },
  // AL-P10: a debt's due date in 3 days, or passed (referential, tab 13).
  { key: 'debt_due', family: 'dettes', alert: 'AL-P10', category: 'action', priority: 'echeance', requiresOptIn: false, defaultEnabled: true },
  // AL-P10: the share of income taken by instalments, at the referential's
  // levels (30 %, 40 %, 50 %).
  { key: 'debt_ratio', family: 'dettes', alert: 'AL-P10', category: 'information', priority: 'budget', requiresOptIn: false, defaultEnabled: true },
  // AL-P08 (P6-08): a goal's date has passed, unreached.
  { key: 'goal_overdue', family: 'objectifs', alert: 'AL-P08', category: 'action', priority: 'echeance', requiresOptIn: false, defaultEnabled: true },
  // AL-P08: a goal reaches a quarter, a half, three quarters, all of it.
  { key: 'goal_milestone', family: 'objectifs', alert: 'AL-P08', category: 'information', priority: 'apprentissage', requiresOptIn: false, defaultEnabled: true },
  // AL-P08: the planned monthly contribution has not been made this month.
  { key: 'goal_contribution_missed', family: 'objectifs', alert: 'AL-P08', category: 'action', priority: 'budget', requiresOptIn: false, defaultEnabled: true },
  // AL-P09: the emergency fund under one month, under its target, or reached.
  { key: 'emergency_fund', family: 'objectifs', alert: 'AL-P09', category: 'action', priority: 'securite', requiresOptIn: false, defaultEnabled: true },
  // AL-P12: a course started and left for a week.
  { key: 'learning_to_continue', family: 'formation', alert: 'AL-P12', category: 'information', priority: 'apprentissage', requiresOptIn: false, defaultEnabled: true },
  // P6-13: another member of a shared space changed what they share.
  { key: 'sharing_changed', family: 'securite', alert: null, category: 'information', priority: 'apprentissage', requiresOptIn: false, defaultEnabled: true },
];

export const NOTIFICATION_TYPE_KEYS = NOTIFICATION_TYPES.map((t) => t.key);
export const notificationTypeByKey = (key) => NOTIFICATION_TYPES.find((t) => t.key === key) ?? null;

// Anti-repetition: an ESCALATING signal (a threshold level going up) is new
// information and gets a new row; the same level does not. A ONE-OFF fact
// (a goal going overdue) is created once per reference, full stop — matching
// is done by the caller via `dedupeBy` ('level' vs 'reference').
export const NOTIFICATIONS_PER_DAY_MAX = 30;
export const REMINDER_WINDOW_DAYS = 7;
