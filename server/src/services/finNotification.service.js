// Notifications and alerts (P6-18): the generic engine every other task's own
// signal feeds into — a budget threshold (P6-05), an overdue goal (P6-08), a
// sharing change (P6-13), an upcoming calendar event (P6-07). This file only
// ever writes and reads ONE account's own rows.
import { NOTIFICATIONS_PER_DAY_MAX, NOTIFICATION_PRIORITIES, NOTIFICATION_TYPE_KEYS, REMINDER_WINDOW_DAYS, notificationTypeByKey } from '../constants/finNotification.js';
import { loadCalendarData } from './finCalendar.service.js';

const priorityRank = (priority) => {
  const index = NOTIFICATION_PRIORITIES.indexOf(priority);
  return index === -1 ? NOTIFICATION_PRIORITIES.length : index;
};

// This account's settings, merged with the catalogue's own defaults — so a
// type nobody has ever touched still answers truthfully.
export async function getNotificationSettings(prisma, userId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { finNotificationSettings: true } });
  const stored = user?.finNotificationSettings ?? {};
  return NOTIFICATION_TYPE_KEYS.map((key) => {
    const type = notificationTypeByKey(key);
    const saved = stored[key] ?? {};
    return {
      type: key,
      enabled: saved.enabled ?? type.defaultEnabled,
      optedIn: saved.optedIn ?? false,
      requiresOptIn: type.requiresOptIn,
    };
  });
}

export async function updateNotificationSettings(prisma, userId, changes) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { finNotificationSettings: true } });
  const stored = { ...(user?.finNotificationSettings ?? {}) };
  for (const [key, patch] of Object.entries(changes)) {
    stored[key] = { ...stored[key], ...patch };
  }
  await prisma.user.update({ where: { id: userId }, data: { finNotificationSettings: stored } });
  return getNotificationSettings(prisma, userId);
}

async function isEnabled(prisma, userId, typeKey) {
  const settings = await getNotificationSettings(prisma, userId);
  const setting = settings.find((s) => s.type === typeKey);
  if (!setting || !setting.enabled) return false;
  if (setting.requiresOptIn && !setting.optedIn) return false;
  return true;
}

/**
 * Creates a notification, unless the type is disabled, the daily quota is
 * spent, or the anti-repetition rule says this is not new information.
 *
 * `dedupeBy: 'level'` — a new row only if no EXISTING row (read or not)
 * shares (type, referenceId, params.niveau): an escalation is new, the same
 * level repeated is not.
 * `dedupeBy: 'reference'` — at most one row, ever, per (type, referenceId):
 * a one-off fact, created once.
 */
export async function createNotification(prisma, userId, { type, params = {}, link = null, referenceId = null, dedupeBy = 'reference' }) {
  const kind = notificationTypeByKey(type);
  if (!kind) throw new Error(`Unknown notification type: ${type}`);
  if (!(await isEnabled(prisma, userId, type))) return null;

  const quota = await prisma.finNotification.count({ where: { userId, createdAt: { gte: new Date(Date.now() - 24 * 3600 * 1000) } } });
  if (quota >= NOTIFICATIONS_PER_DAY_MAX) return null;

  const existing = await prisma.finNotification.findFirst({
    where: { userId, type, referenceId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, params: true },
  });
  if (existing) {
    if (dedupeBy === 'reference') return null;
    if (dedupeBy === 'level' && existing.params?.niveau === params.niveau) return null;
  }

  return prisma.finNotification.create({
    data: { userId, type, category: kind.category, priority: kind.priority, params, link, referenceId },
  });
}

export async function listNotifications(prisma, userId, { category, read } = {}) {
  const rows = await prisma.finNotification.findMany({
    where: { userId, ...(category ? { category } : {}), ...(read !== undefined ? { read } : {}) },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  return [...rows].sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || b.createdAt - a.createdAt);
}

/**
 * How many unread notifications EXIST, for the badge of the top bar (P1-12).
 *
 * Deliberately one `count`, and deliberately WITHOUT `generateReminders`: the
 * badge is read on every page of the connected space, and reminder generation
 * costs four queries and writes rows. Paying that on every navigation to keep a
 * number fresh would be the wrong trade.
 *
 * The consequence, stated rather than hidden: a reminder that becomes due is
 * counted only once something has generated it — a visit to the notification
 * centre or the calendar. The badge therefore never over-reports, and can lag.
 * Removing that lag means generating reminders on a schedule, which this
 * platform has no job runner for (see `P5-04`).
 */
export async function countUnread(prisma, userId) {
  return prisma.finNotification.count({ where: { userId, read: false } });
}

export async function markRead(prisma, userId, id, read = true) {
  const row = await prisma.finNotification.findFirst({ where: { id, userId } });
  if (!row) return null;
  return prisma.finNotification.update({ where: { id }, data: { read, readAt: read ? new Date() : null } });
}

export async function markAllRead(prisma, userId) {
  const now = new Date();
  await prisma.finNotification.updateMany({ where: { userId, read: false }, data: { read: true, readAt: now } });
  return { ok: true };
}

/**
 * The client's « rappels J-7/J-1 » (P6-07), generalised to a window: an
 * opt-in reminder for whatever is due within `REMINDER_WINDOW_DAYS`. Called
 * from the listing itself (no background job exists in this platform), so a
 * visit to the notification centre is also what refreshes it — the same
 * lazy-generation pattern as the other triggers below.
 */
export async function generateReminders(prisma, userId) {
  const now = new Date();
  const to = new Date(now.getTime() + REMINDER_WINDOW_DAYS * 24 * 3600 * 1000);
  const { planned, recurrences, provisions } = await loadCalendarData(prisma, userId, { from: now, to });

  for (const row of planned) {
    await createNotification(prisma, userId, {
      type: 'reminder_upcoming',
      params: { kind: 'planned', date: row.occurredAt },
      link: '/calendrier',
      referenceId: `planned:${row.id}`,
    });
  }
  for (const row of recurrences) {
    if (!row.nextDate || row.nextDate > to) continue;
    await createNotification(prisma, userId, {
      type: 'reminder_upcoming',
      params: { kind: 'recurrence', label: row.label, date: row.nextDate },
      link: '/calendrier',
      referenceId: `recurrence:${row.id}:${row.nextDate.toISOString().slice(0, 10)}`,
    });
  }
  for (const row of provisions) {
    await createNotification(prisma, userId, {
      type: 'reminder_upcoming',
      params: { kind: 'provision', label: row.label, date: row.targetDate },
      link: '/calendrier',
      referenceId: `provision:${row.id}`,
    });
  }
}
