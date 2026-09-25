import { prisma } from '../../config/prisma.js';
import { HttpError } from '../../utils/httpError.js';

// Administration of issued certificates (P3-16): search and revoke / restore.
// A certificate is never deleted here — revocation only marks it invalid; the
// learner's record of having earned it is not erased.

const escapeLike = (text) => text.replace(/[\\%_]/g, '\\$&');

function where({ query, status }) {
  return {
    ...(status === 'revoked' ? { revokedAt: { not: null } } : {}),
    ...(status === 'active' ? { revokedAt: null } : {}),
    ...(query
      ? {
          OR: [
            { holderName: { contains: escapeLike(query), mode: 'insensitive' } },
            { formationTitle: { contains: escapeLike(query), mode: 'insensitive' } },
            { certificateNumber: { contains: escapeLike(query.toUpperCase()) } },
          ],
        }
      : {}),
  };
}

const toRow = (c) => ({
  id: c.id,
  certificateNumber: c.certificateNumber,
  holderName: c.holderName,
  formationTitle: c.formationTitle,
  certificationTitle: c.certificationTitle ?? c.formationTitle,
  issuedAt: c.issuedAt,
  revoked: Boolean(c.revokedAt),
  revokedAt: c.revokedAt,
  revokedReason: c.revokedReason,
  holderEmail: c.enrollment?.user?.email ?? null,
});

export async function listCertificates(req, res) {
  const { page, limit } = req.query;
  const filter = where(req.query);
  const [total, rows] = await Promise.all([
    prisma.certification.count({ where: filter }),
    prisma.certification.findMany({
      where: filter,
      orderBy: [{ issuedAt: 'desc' }, { id: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
      include: { enrollment: { select: { user: { select: { email: true } } } } },
    }),
  ]);
  res.json({
    certificates: rows.map(toRow),
    pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
  });
}

export async function revokeCertificate(req, res) {
  const updated = await prisma.certification.update({
    where: { id: req.params.id },
    data: { revokedAt: new Date(), revokedReason: req.body.reason ?? null },
  });
  res.json({ certificate: toRow(updated) });
}

export async function restoreCertificate(req, res) {
  const certificate = await prisma.certification.findUnique({ where: { id: req.params.id } });
  if (!certificate) throw new HttpError(404, 'Not found');
  const updated = await prisma.certification.update({
    where: { id: certificate.id },
    data: { revokedAt: null, revokedReason: null },
  });
  res.json({ certificate: toRow(updated) });
}
