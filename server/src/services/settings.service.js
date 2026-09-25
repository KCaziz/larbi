import { prisma } from '../config/prisma.js';

// Platform settings (P3-16): a small key/value store an administrator edits from
// the admin panel instead of a code change or a redeploy. `CORE_KEYS` are the
// ones the rest of the application actually reads today; anything else the
// admin adds is stored and listed the same way (the extensibility the client
// asked for), it just has no dedicated effect yet.
export const CORE_KEYS = ['maintenanceMode', 'contactEmail', 'contactPhone', 'contactAddress'];

export async function getAllSettings() {
  return prisma.platformSetting.findMany({ orderBy: { key: 'asc' } });
}

// What a page that is not the admin panel is allowed to read: never a key an
// admin might add for internal use only. Booleans are stored as the text
// "true" / "false".
export async function getPublicSettings() {
  const rows = await prisma.platformSetting.findMany({ where: { key: { in: CORE_KEYS } } });
  const byKey = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    maintenanceMode: byKey.maintenanceMode === 'true',
    contactEmail: byKey.contactEmail ?? '',
    contactPhone: byKey.contactPhone ?? '',
    contactAddress: byKey.contactAddress ?? '',
  };
}

export async function isMaintenanceMode() {
  const row = await prisma.platformSetting.findUnique({ where: { key: 'maintenanceMode' } });
  return row?.value === 'true';
}

export function upsertSetting(key, value) {
  return prisma.platformSetting.upsert({ where: { key }, create: { key, value }, update: { value } });
}
