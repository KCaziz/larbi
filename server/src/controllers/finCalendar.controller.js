import { prisma } from '../config/prisma.js';
import { accountsWithBalances } from '../services/finAccount.service.js';
import { occurrencesWithOutcome, recordOccurrence, settleAutomatic } from '../services/finOccurrence.service.js';
import {
  CALENDAR_EVENT_KINDS,
  CALENDAR_MAX_DAYS,
  CALENDAR_VIEWS,
  DEFAULT_REMINDER_DAYS,
  DEFAULT_TENSION_FLOOR,
  DETECTION_DEFAULTS,
  DETECTION_WINDOW_DAYS,
} from '../constants/finCalendar.js';
import { FREQUENCIES } from '../constants/finance.js';
import { listChanges } from '../services/finChange.service.js';
import {
  PROVISION_ENTITY,
  RECURRENCE_ENTITY,
  confirmCandidate,
  copyPlanFromPreviousMonth,
  createProvision,
  createRecurrence,
  deleteProvision,
  deleteRecurrence,
  detectCandidates,
  listProvisions,
  listRecurrences,
  loadCalendarData,
  markPlannedPaid,
  setRecurrenceArchived,
  updateProvision,
  updateRecurrence,
} from '../services/finCalendar.service.js';
import { buildCalendar, buildProvisionView, collectEvents, recurringCost } from '../services/finCalendarView.service.js';
import { describeFormula } from '../services/finance/describe.js';
import { HttpError } from '../utils/httpError.js';

// Financial calendar and recurring expenses (P6-07), screens C23 / SA03 / SA04
// / ET04 / FA04. Session required everywhere, and every read and write is
// scoped to the caller's own rows.

// The month `date` falls in, both ends included. The default period of the
// calendar, like the synthesis of P6-04.
const monthRange = (date = new Date()) => ({
  from: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)),
  to: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1) - 1),
});

// The week `date` falls in, Monday to Sunday (the client's « mois / semaine »).
function weekRange(date = new Date()) {
  const day = date.getUTCDay();
  // getUTCDay is 0 on Sunday: Monday is the start of the week here, so Sunday
  // belongs to the week that began six days earlier.
  const back = day === 0 ? 6 : day - 1;
  const from = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - back));
  return { from, to: new Date(from.getTime() + 7 * 24 * 3600 * 1000 - 1) };
}

export function getCalendarReferences(req, res) {
  res.json({
    eventKinds: CALENDAR_EVENT_KINDS,
    views: CALENDAR_VIEWS,
    frequencies: FREQUENCIES,
    defaultReminderDays: DEFAULT_REMINDER_DAYS,
    defaultTensionFloor: DEFAULT_TENSION_FLOOR,
    maxDays: CALENDAR_MAX_DAYS,
    detection: { defaults: DETECTION_DEFAULTS, windowDays: DETECTION_WINDOW_DAYS },
    // The formulas this screen answers with, in the client's own wording.
    formulas: ['F002', 'F003', 'F045', 'F049', 'ALG-04'].map(describeFormula),
  });
}

// ---- the calendar ----------------------------------------------------------

export async function getCalendar(req, res) {
  const currency = req.query.currency ?? req.user.finCurrency;
  const range = req.query.from
    ? { from: req.query.from, to: req.query.to }
    : req.query.vue === 'week'
      ? weekRange()
      : monthRange();

  // « Créer automatiquement comme réalisé »: the due occurrences become real
  // before the calendar is read, so it shows them as done (P8-11).
  await settleAutomatic(prisma, req.user.id);
  const data = await loadCalendarData(prisma, req.user.id, range);
  const events = collectEvents({ ...data, from: range.from, to: range.to, currency, occurrencesOf: occurrencesWithOutcome });
  // C23 (in red) and diagnostic n°2, C7: the projected cash starts from the
  // balance of the accounts (PB-F002), never from a figure typed by hand.
  const { totals } = await accountsWithBalances(prisma, req.user.id);
  const openingBalance = totals.find((total) => total.currency === currency)?.soldeTotal.resultat ?? null;
  const calendar = buildCalendar({
    events,
    from: range.from,
    to: range.to,
    currency,
    openingBalance,
    tensionFloor: req.query.seuilTension ?? DEFAULT_TENSION_FLOOR,
    realised: data.realised,
  });

  // The events carry category ids; the labels are joined here so the interface
  // never has to guess what a category is called.
  const ids = [...new Set(events.map((event) => event.categoryId).filter(Boolean))];
  const labels = new Map(
    (await prisma.finCategory.findMany({ where: { id: { in: ids } }, select: { id: true, label: true } })).map((row) => [row.id, row.label]),
  );
  calendar.jours = calendar.jours.map((day) => ({
    ...day,
    evenements: day.evenements.map((event) => ({ ...event, categoryLabel: event.categoryId ? (labels.get(event.categoryId) ?? null) : null })),
  }));

  res.json({ calendrier: calendar });
}

// ---- recurrences -----------------------------------------------------------

export async function postOccurrence(req, res) {
  res.status(201).json({ occurrence: await recordOccurrence(prisma, req.user.id, req.body) });
}

export async function getRecurrences(req, res) {
  const recurrences = await listRecurrences(prisma, req.user.id, { includeArchived: req.query.includeArchived === 'true' });
  res.json({ recurrences });
}

export async function postRecurrence(req, res) {
  res.status(201).json({ recurrence: await createRecurrence(prisma, req.user.id, req.body) });
}

export async function patchRecurrence(req, res) {
  res.json({ recurrence: await updateRecurrence(prisma, req.user.id, req.params.id, req.body) });
}

export async function putRecurrenceArchived(req, res) {
  const { archived, reason } = req.body;
  res.json({ recurrence: await setRecurrenceArchived(prisma, req.user.id, req.params.id, archived, { reason }) });
}

export async function removeRecurrence(req, res) {
  // Note for whoever reads the interface text: this stops TRACKING a
  // subscription. It cancels nothing — the client forbids any automatic
  // termination, and FINCLUDIA never contacts a provider.
  res.json(await deleteRecurrence(prisma, req.user.id, req.params.id, { reason: req.body?.reason }));
}

export async function getRecurrenceHistory(req, res) {
  const row = await prisma.finRecurrence.findFirst({ where: { id: req.params.id, userId: req.user.id }, select: { id: true } });
  if (!row) throw new HttpError(404, 'Recurrence not found');
  const changes = await listChanges(prisma, { userId: req.user.id, entity: RECURRENCE_ENTITY, entityId: req.params.id });
  res.json({ changes });
}

// What the confirmed recurrences cost, per month and per year (the client's
// « coût mensuel / annuel des abonnements »).
export async function getSubscriptionCost(req, res) {
  const currency = req.query.currency ?? req.user.finCurrency;
  const recurrences = await listRecurrences(prisma, req.user.id);
  res.json({ abonnements: recurringCost(recurrences, { currency }) });
}

// ---- detection (ALG-04) ----------------------------------------------------

export async function getDetection(req, res) {
  const { currency, ...options } = req.query;
  const candidates = await detectCandidates(prisma, req.user.id, {
    currency: currency ?? req.user.finCurrency,
    options,
  });
  res.json({
    // CANDIDATES. The client requires « proposée puis confirmée »: this route
    // writes nothing, and every line says `confirmed: false`.
    candidats: candidates,
    fenetreJours: DETECTION_WINDOW_DAYS,
    algorithme: describeFormula('ALG-04'),
  });
}

export async function postRecurrenceConfirmed(req, res) {
  res.status(201).json({ recurrence: await confirmCandidate(prisma, req.user.id, req.body) });
}

// ---- provisions ------------------------------------------------------------

export async function getProvisions(req, res) {
  const provisions = await listProvisions(prisma, req.user.id, { includeArchived: req.query.includeArchived === 'true' });
  res.json({
    // Each one computed (F045): what is left to set aside, per month.
    provisions: provisions.map((provision) => buildProvisionView(provision)),
  });
}

export async function postProvision(req, res) {
  res.status(201).json({ provision: await createProvision(prisma, req.user.id, req.body) });
}

export async function patchProvision(req, res) {
  res.json({ provision: await updateProvision(prisma, req.user.id, req.params.id, req.body) });
}

export async function removeProvision(req, res) {
  res.json(await deleteProvision(prisma, req.user.id, req.params.id, { reason: req.body?.reason }));
}

export async function getProvisionHistory(req, res) {
  const row = await prisma.finProvision.findFirst({ where: { id: req.params.id, userId: req.user.id }, select: { id: true } });
  if (!row) throw new HttpError(404, 'Provision not found');
  const changes = await listChanges(prisma, { userId: req.user.id, entity: PROVISION_ENTITY, entityId: req.params.id });
  res.json({ changes });
}

// ---- planned movements -----------------------------------------------------

export async function postMarkPaid(req, res) {
  const { occurredAt, value, reason } = req.body ?? {};
  res.json({ transaction: await markPlannedPaid(prisma, req.user.id, req.params.id, { occurredAt, value, reason }) });
}

export async function postCopyPlan(req, res) {
  const result = await copyPlanFromPreviousMonth(prisma, req.user.id, {
    month: req.body.month,
    currency: req.body.currency ?? req.user.finCurrency,
  });
  res.status(201).json(result);
}
