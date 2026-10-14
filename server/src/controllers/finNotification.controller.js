import { prisma } from '../config/prisma.js';
import { NOTIFICATION_CATEGORIES, NOTIFICATION_TYPES } from '../constants/finNotification.js';
import {
  generateReminders,
  getNotificationSettings,
  listNotifications,
  markAllRead,
  markRead,
  updateNotificationSettings,
} from '../services/finNotification.service.js';

// Notifications and alerts (P6-18), screen C24. Session required everywhere;
// always this account's own rows.

export function getNotificationReferences(req, res) {
  res.json({ categories: NOTIFICATION_CATEGORIES, types: NOTIFICATION_TYPES });
}

export async function getNotifications(req, res) {
  await generateReminders(prisma, req.user.id);
  const notifications = await listNotifications(prisma, req.user.id, { category: req.query.category, read: req.query.read === undefined ? undefined : req.query.read === 'true' });
  res.json({ notifications, nonLues: notifications.filter((n) => !n.read).length });
}

export async function putNotificationRead(req, res) {
  const row = await markRead(prisma, req.user.id, req.params.id, req.body.read ?? true);
  if (!row) return res.status(404).json({ error: { message: 'Notification not found' } });
  res.json({ notification: row });
}

export async function postMarkAllRead(req, res) {
  res.json(await markAllRead(prisma, req.user.id));
}

export async function getSettings(req, res) {
  res.json({ parametres: await getNotificationSettings(prisma, req.user.id) });
}

export async function putSettings(req, res) {
  res.json({ parametres: await updateNotificationSettings(prisma, req.user.id, req.body) });
}
