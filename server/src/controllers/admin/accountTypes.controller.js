import { prisma } from '../../config/prisma.js';
import { listAllAccountTypes } from '../../services/accountTypes.service.js';
import { uniqueSlug } from '../../services/slug.service.js';
import { HttpError } from '../../utils/httpError.js';

// Administration of account categories (P3-15): create, rename, reorder,
// activate/deactivate, delete. This is the only place the list can change —
// registration and the "my account type" page merely read it.

const toRow = (t) => ({ id: t.id, slug: t.slug, label: t.label, isActive: t.isActive, order: t.order });

export async function listAccountTypes(req, res) {
  const types = await listAllAccountTypes();
  res.json({ accountTypes: types.map(toRow) });
}

export async function createAccountType(req, res) {
  const slug = await uniqueSlug(
    req.body.label,
    async (s) => Boolean(await prisma.accountType.findUnique({ where: { slug: s }, select: { id: true } })),
    'type',
  );
  const last = await prisma.accountType.aggregate({ _max: { order: true } });
  const created = await prisma.accountType.create({
    data: { slug, label: req.body.label, order: (last._max.order ?? 0) + 1 },
  });
  res.status(201).json({ accountType: toRow(created) });
}

export async function updateAccountType(req, res) {
  const updated = await prisma.accountType.update({ where: { id: req.params.id }, data: req.body });
  res.json({ accountType: toRow(updated) });
}

// Deletion is refused while any account uses this category (RESTRICT at the
// application layer, since the reference is a plain string, not a foreign
// key — see accountTypes.service.js): deactivating it is the safe way to
// retire a category without breaking the accounts that still hold it.
export async function deleteAccountType(req, res) {
  const type = await prisma.accountType.findUnique({ where: { id: req.params.id } });
  if (!type) throw new HttpError(404, 'Not found');
  const inUse = await prisma.user.count({ where: { accountType: type.slug } });
  if (inUse > 0) throw new HttpError(409, 'Account type is in use', { users: inUse });
  await prisma.accountType.delete({ where: { id: type.id } });
  res.status(204).end();
}
