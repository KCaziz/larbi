// The category reference (P6-02): the client's 91 standard categories, what a
// user changed about them, and the categories the user created.
//
// Three shapes live in the same table (see prisma/schema.prisma):
//   standard  userId null, `key` set        — the client's reference, read-only
//   own       userId set,  baseKey null     — a category this user created
//   override  userId set,  baseKey set      — this user's label for a standard
//                                             one, or (archivedAt) hidden for them
//
// A standard row is NEVER written to: one account's choice must not change what
// another account sees.

import { CATEGORY_FAMILIES, categoryFamilyByCode } from '../constants/finCategories.js';
import { DEFAULT_DATA_SCOPE } from '../constants/finData.js';
import { HttpError } from '../utils/httpError.js';
import { listChanges, recordChange, recordCorrection } from './finChange.service.js';

export const ENTITY = 'category';

// A user cannot keep hundreds of categories straight, and an unbounded list is
// also an unbounded write surface. Per family, so one family filling up never
// blocks another.
export const MAX_OWN_PER_FAMILY = 40;

const SELECT = {
  id: true,
  userId: true,
  family: true,
  key: true,
  baseKey: true,
  label: true,
  scope: true,
  source: true,
  sourceRef: true,
  status: true,
  consentUses: true,
  effectiveAt: true,
  collectedAt: true,
  version: true,
  archivedAt: true,
  deletedAt: true,
};

// What the API returns for one category. `origin` says where the label comes
// from, so an interface can show the client's reference and the person's own
// additions differently without guessing from the shape of the row.
const toCategory = (row, { origin, customised = false, archived = false, reference = null }) => ({
  id: row.id,
  key: row.key ?? null,
  family: row.family,
  label: row.label,
  origin,
  customised,
  archived,
  // The client's own wording, kept visible even when the person renamed it: a
  // standard category must stay findable under the name the reference gives it.
  reference,
  scope: row.scope,
  status: row.status,
  consentUses: row.consentUses ?? [],
  version: row.version,
});

// The catalogue this user actually sees: the standard reference with their own
// renames and hidings applied, plus their own categories. Logically deleted rows
// are left out everywhere — they only exist for the history that used them.
export async function listCategories(prisma, userId, { includeArchived = false } = {}) {
  const [standard, mine] = await Promise.all([
    prisma.finCategory.findMany({ where: { userId: null, deletedAt: null }, select: SELECT, orderBy: { key: 'asc' } }),
    userId
      ? prisma.finCategory.findMany({ where: { userId, deletedAt: null }, select: SELECT, orderBy: { createdAt: 'asc' } })
      : Promise.resolve([]),
  ]);

  const overrides = new Map(mine.filter((row) => row.baseKey).map((row) => [row.baseKey, row]));
  const own = mine.filter((row) => !row.baseKey);

  const cards = [];
  for (const row of standard) {
    const override = overrides.get(row.key);
    const archived = Boolean(override?.archivedAt);
    if (archived && !includeArchived) continue;
    // What the person sees comes from their override when there is one, and so
    // does its metadata: a label they typed is "declared", not the client's
    // "official" reference, and saying otherwise would misreport its source.
    const merged = override ? { ...row, ...override, id: row.id, key: row.key } : row;
    cards.push(
      toCategory(merged, {
        origin: 'standard',
        customised: Boolean(override),
        archived,
        reference: override && override.label !== row.label ? row.label : null,
      }),
    );
  }
  for (const row of own) {
    if (row.archivedAt && !includeArchived) continue;
    cards.push(toCategory(row, { origin: 'own', archived: Boolean(row.archivedAt) }));
  }

  // Grouped by family, in the client's own order — that is how its onglet
  // "03_Categories" reads, and how its screens offer categories.
  return CATEGORY_FAMILIES.map((family) => ({
    code: family.code,
    label: family.label,
    categories: cards.filter((card) => card.family === family.code),
  }));
}

// One of the user's OWN rows (own category or override). A row belonging to
// someone else, or a standard row, is "not found": an account must not be able
// to tell apart "does not exist" from "is not yours".
async function ownRow(prisma, userId, id) {
  const row = await prisma.finCategory.findFirst({ where: { id, userId, deletedAt: null }, select: SELECT });
  if (!row) throw new HttpError(404, 'Category not found');
  return row;
}

const cleanLabel = (label) => label.trim().replace(/\s+/g, ' ');

// Two categories with the same name in the same family would be impossible to
// tell apart in a picker. Compared case-insensitively, against the standard
// labels the person sees AND their own rows.
async function assertLabelFree(prisma, userId, family, label, { exceptId = null } = {}) {
  const groups = await listCategories(prisma, userId, { includeArchived: true });
  const group = groups.find((g) => g.code === family);
  const lower = label.toLocaleLowerCase('fr');
  const taken = (group?.categories ?? []).some((card) => card.id !== exceptId && card.label.toLocaleLowerCase('fr') === lower);
  if (taken) throw new HttpError(409, 'Category label already used', { reason: 'labelTaken' });
}

export async function createCategory(prisma, userId, { family, label, scope = DEFAULT_DATA_SCOPE, consentUses = [] }) {
  if (!categoryFamilyByCode(family)) throw new HttpError(422, 'Unknown category family', { reason: 'unknownFamily' });
  const clean = cleanLabel(label);
  await assertLabelFree(prisma, userId, family, clean);

  const count = await prisma.finCategory.count({ where: { userId, family, baseKey: null, deletedAt: null } });
  if (count >= MAX_OWN_PER_FAMILY) throw new HttpError(422, 'Too many categories in this family', { reason: 'tooMany', limit: MAX_OWN_PER_FAMILY });

  return prisma.$transaction(async (tx) => {
    const row = await tx.finCategory.create({
      // A category the person typed: source "manuelle", statut "déclarée".
      // Nothing here is official — only the client's reference is.
      data: { userId, family, label: clean, scope, consentUses, source: 'manual', status: 'declared' },
      select: SELECT,
    });
    await recordChange(tx, { userId, entity: ENTITY, entityId: row.id, action: 'create', after: { family, label: clean, scope, consentUses } });
    return toCategory(row, { origin: 'own' });
  });
}

export async function updateCategory(prisma, userId, id, { label, scope, consentUses, reason }) {
  const row = await ownRow(prisma, userId, id);
  const data = {};
  if (label !== undefined) {
    const clean = cleanLabel(label);
    await assertLabelFree(prisma, userId, row.family, clean, { exceptId: id });
    data.label = clean;
  }
  if (scope !== undefined) data.scope = scope;
  if (consentUses !== undefined) data.consentUses = consentUses;
  const origin = row.baseKey ? 'standard' : 'own';
  if (Object.keys(data).length === 0) {
    return toCategory(row, { origin, customised: Boolean(row.baseKey), archived: Boolean(row.archivedAt) });
  }

  return prisma.$transaction(async (tx) => {
    // A correction bumps the object's version (socle field "version"): a history
    // that quoted version 1 keeps quoting the label of version 1.
    const updated = await tx.finCategory.update({ where: { id }, data: { ...data, version: { increment: 1 } }, select: SELECT });
    await recordCorrection(tx, { userId, entity: ENTITY, entityId: id, before: row, after: updated, reason: reason ?? null });
    return toCategory(updated, { origin, customised: Boolean(updated.baseKey), archived: Boolean(updated.archivedAt) });
  });
}

// Hiding, not deleting: an archived category stops being offered, and stays
// readable by whatever already pointed at it.
export async function setArchived(prisma, userId, id, archived, { reason } = {}) {
  const row = await ownRow(prisma, userId, id);
  const archivedAt = archived ? new Date() : null;
  return prisma.$transaction(async (tx) => {
    const updated = await tx.finCategory.update({ where: { id }, data: { archivedAt }, select: SELECT });
    await recordChange(tx, {
      userId,
      entity: ENTITY,
      entityId: id,
      action: archived ? 'archive' : 'restore',
      field: 'archivedAt',
      before: row.archivedAt,
      after: archivedAt,
      reason: reason ?? null,
    });
    return toCategory(updated, { origin: updated.baseKey ? 'standard' : 'own', customised: Boolean(updated.baseKey), archived });
  });
}

// Logical deletion ("suppression logique"). The row stays, so a total computed
// last month still knows what its lines were called; it simply leaves the
// catalogue. Nothing in FINCLUDIA physically deletes a financial row except the
// account-wide erasure the privacy text promises (ON DELETE CASCADE).
export async function deleteCategory(prisma, userId, id, { reason } = {}) {
  const row = await ownRow(prisma, userId, id);
  await prisma.$transaction(async (tx) => {
    await tx.finCategory.update({ where: { id }, data: { deletedAt: new Date() } });
    await recordChange(tx, { userId, entity: ENTITY, entityId: id, action: 'delete', field: 'deletedAt', before: null, after: true, reason: reason ?? null });
  });
  return { id, key: row.key };
}

// The correction trail of one of the caller's categories. A category that is
// not theirs is "not found", exactly like the other verbs: an interface must
// never be told that an id exists but belongs to someone else. A LOGICALLY
// DELETED row still answers — its history is precisely what someone reads to
// find out what happened to it.
export async function listCategoryChanges(prisma, userId, id) {
  const row = await prisma.finCategory.findFirst({ where: { id, userId }, select: { id: true } });
  if (!row) throw new HttpError(404, 'Category not found');
  return listChanges(prisma, { userId, entity: ENTITY, entityId: id });
}

// Customising a standard category: an override row of this account. Renaming it
// and hiding it are the same operation from the client's point of view
// ("standard et personnalisables"), so they share one entry point.
export async function customiseStandard(prisma, userId, key, { label, hidden, reason }) {
  const standard = await prisma.finCategory.findFirst({ where: { key, userId: null, deletedAt: null }, select: SELECT });
  if (!standard) throw new HttpError(404, 'Category not found');

  const existing = await prisma.finCategory.findFirst({ where: { userId, baseKey: key, deletedAt: null }, select: SELECT });
  const clean = label === undefined ? null : cleanLabel(label);
  if (clean !== null) await assertLabelFree(prisma, userId, standard.family, clean, { exceptId: standard.id });

  return prisma.$transaction(async (tx) => {
    const archivedAt = hidden === undefined ? (existing?.archivedAt ?? null) : hidden ? new Date() : null;
    const nextLabel = clean ?? existing?.label ?? standard.label;
    let row;
    if (existing) {
      row = await tx.finCategory.update({ where: { id: existing.id }, data: { label: nextLabel, archivedAt, version: { increment: 1 } }, select: SELECT });
      await recordCorrection(tx, { userId, entity: ENTITY, entityId: existing.id, before: existing, after: row, reason: reason ?? null });
    } else {
      row = await tx.finCategory.create({
        data: {
          userId,
          baseKey: key,
          family: standard.family,
          label: nextLabel,
          scope: standard.scope,
          consentUses: [],
          source: 'manual',
          status: 'declared',
          archivedAt,
        },
        select: SELECT,
      });
      await recordChange(tx, { userId, entity: ENTITY, entityId: row.id, action: 'create', after: { baseKey: key, label: nextLabel, hidden: Boolean(archivedAt) } });
    }
    return toCategory({ ...standard, ...row, id: standard.id, key: standard.key }, {
      origin: 'standard',
      customised: true,
      archived: Boolean(archivedAt),
      reference: row.label !== standard.label ? standard.label : null,
    });
  });
}

// Back to the client's reference: the override disappears (logically, with its
// own journal row) and the standard label and visibility come back.
export async function resetStandard(prisma, userId, key) {
  const existing = await prisma.finCategory.findFirst({ where: { userId, baseKey: key, deletedAt: null }, select: SELECT });
  if (!existing) throw new HttpError(404, 'Category not found');
  await prisma.$transaction(async (tx) => {
    await tx.finCategory.update({ where: { id: existing.id }, data: { deletedAt: new Date() } });
    await recordChange(tx, { userId, entity: ENTITY, entityId: existing.id, action: 'delete', field: 'deletedAt', before: null, after: true });
  });
  return { key };
}
