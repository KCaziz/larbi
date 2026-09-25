import { prisma } from '../../config/prisma.js';
import { isSelectableAccountType, listAllAccountTypes } from '../../services/accountTypes.service.js';
import { HttpError } from '../../utils/httpError.js';

// Administration of user accounts (P3-16): search, view, change account type /
// access level / role, suspend or reactivate. Never returns passwordHash.

// "%" and "_" typed by an admin are ordinary characters (see the blog and newsletter search).
const escapeLike = (text) => text.replace(/[\\%_]/g, '\\$&');

function where({ query, role, accessLevel, status, accountType }) {
  return {
    ...(role ? { role } : {}),
    ...(accessLevel ? { accessLevel } : {}),
    ...(status ? { status } : {}),
    ...(accountType ? { accountType } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: escapeLike(query), mode: 'insensitive' } },
            { email: { contains: escapeLike(query.toLowerCase()) } },
          ],
        }
      : {}),
  };
}

async function labelsBySlug() {
  const types = await listAllAccountTypes();
  return new Map(types.map((t) => [t.slug, t.label]));
}

const toRow = (u, labels) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  accountType: u.accountType,
  accountTypeLabel: labels.get(u.accountType) ?? u.accountType,
  accessLevel: u.accessLevel,
  role: u.role,
  status: u.status,
  createdAt: u.createdAt,
});

export async function listUsers(req, res) {
  const { page, limit } = req.query;
  const filter = where(req.query);
  const [total, rows, labels] = await Promise.all([
    prisma.user.count({ where: filter }),
    prisma.user.findMany({
      where: filter,
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    labelsBySlug(),
  ]);
  res.json({
    users: rows.map((u) => toRow(u, labels)),
    pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
  });
}

export async function getUser(req, res) {
  const [user, labels, formationsCreated, articlesAuthored, enrollments] = await Promise.all([
    prisma.user.findUnique({ where: { id: req.params.id } }),
    labelsBySlug(),
    prisma.formation.count({ where: { createdById: req.params.id } }),
    prisma.article.count({ where: { authorId: req.params.id } }),
    prisma.enrollment.count({ where: { userId: req.params.id } }),
  ]);
  if (!user) throw new HttpError(404, 'Not found');
  res.json({ user: { ...toRow(user, labels), counts: { formationsCreated, articlesAuthored, enrollments } } });
}

export async function updateUser(req, res) {
  if (req.params.id === req.user.id) {
    throw new HttpError(400, 'Use your own profile page to change your own account');
  }
  if (req.body.accountType !== undefined && !(await isSelectableAccountType(req.body.accountType))) {
    throw new HttpError(400, 'Unknown account type');
  }
  const [updated, labels] = await Promise.all([
    prisma.user.update({ where: { id: req.params.id }, data: req.body }),
    labelsBySlug(),
  ]);
  res.json({ user: toRow(updated, labels) });
}
