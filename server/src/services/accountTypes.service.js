import { prisma } from '../config/prisma.js';

// Account categories (P3-15): a real table an administrator manages from the
// admin panel, not a hardcoded list. `User.accountType` and
// `Article.targetAccountTypes` keep storing the plain slug (unchanged since
// P1-06 / P3-04): this service is the single place that checks a slug against
// what currently exists, so the whitelist can grow without a code change.

export function listActiveAccountTypes() {
  return prisma.accountType.findMany({ where: { isActive: true }, orderBy: [{ order: 'asc' }, { label: 'asc' }] });
}

export function listAllAccountTypes() {
  return prisma.accountType.findMany({ orderBy: [{ order: 'asc' }, { label: 'asc' }] });
}

// Selectable at registration or when a user picks their own category.
export async function isSelectableAccountType(slug) {
  return Boolean(await prisma.accountType.findFirst({ where: { slug, isActive: true }, select: { id: true } }));
}

// Looser check for content that TARGETS a category (P3-04 recommendations): a
// category deactivated after an article was aimed at it should not suddenly
// make that article "invalid", only stop being offered for new choices.
export async function accountTypeExists(slug) {
  return Boolean(await prisma.accountType.findUnique({ where: { slug }, select: { id: true } }));
}
