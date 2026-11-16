import { prisma } from '../config/prisma.js';

// Platform settings (P3-16): the handful of values an administrator edits from
// the admin panel instead of a code change or a redeploy. Fixed list on purpose
// (a free-form key/value store was tried and dropped: nothing ever read an
// admin-invented key, so it was a form that did nothing) — a new setting needs
// a line here and in the admin form, exactly like any other real field.
export const CORE_KEYS = ['maintenanceMode', 'contactEmail', 'contactPhone', 'contactAddress', 'gaMeasurementId'];

// A Google Analytics 4 measurement identifier (P12-06), or nothing.
export const GA_MEASUREMENT_ID = /^(G-[A-Z0-9]{4,15})?$/;

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
    // Public by nature: the website needs it to load Analytics (after consent).
    gaMeasurementId: byKey.gaMeasurementId ?? '',
  };
}

export async function isMaintenanceMode() {
  const row = await prisma.platformSetting.findUnique({ where: { key: 'maintenanceMode' } });
  return row?.value === 'true';
}

// Only ever one of the known keys (see CORE_KEYS above, enforced by the
// validation): a key added later (gaMeasurementId) is created on first save
// if the database update that seeds it was not run.
export function upsertSetting(key, value) {
  return prisma.platformSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
}
