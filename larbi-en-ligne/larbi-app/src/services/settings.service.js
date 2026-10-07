import { prisma } from '../config/prisma.js';

// Platform settings (P3-16): the handful of values an administrator edits from
// the admin panel instead of a code change or a redeploy. Fixed list on purpose
// (a free-form key/value store was tried and dropped: nothing ever read an
// admin-invented key, so it was a form that did nothing) — a new setting needs
// a line here and in the admin form, exactly like any other real field.
export const CORE_KEYS = ['maintenanceMode', 'contactEmail', 'contactPhone', 'contactAddress'];

export async function getAllSettings() {
  return prisma.platformSetting.findMany({ orderBy: { key: 'asc' } });
}

// What a page that is not the admin panel is allowed to read. Booleans are
// stored as the text "true" / "false".
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

// Only ever changes the VALUE of one of the four known keys: never creates a
// new one (see CORE_KEYS above).
export function upsertSetting(key, value) {
  return prisma.platformSetting.update({ where: { key }, data: { value } });
}
