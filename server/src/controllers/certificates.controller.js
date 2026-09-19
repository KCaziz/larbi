import { prisma } from '../config/prisma.js';
import { toPublicCertificate } from '../serializers/learner.js';
import { CERTIFICATE_NUMBER_PATTERN, normalizeCertificateNumber } from '../services/certificate.service.js';
import { HttpError } from '../utils/httpError.js';

// Public verification (no session): "is this certificate genuine?".
// A malformed number and an unknown one answer the same 404, and the format is
// checked first so junk never reaches the database.
export async function verifyCertificate(req, res) {
  const number = normalizeCertificateNumber(req.params.number);
  if (!CERTIFICATE_NUMBER_PATTERN.test(number)) throw new HttpError(404, 'Not found');

  const certification = await prisma.certification.findUnique({ where: { certificateNumber: number } });
  if (!certification) throw new HttpError(404, 'Not found');

  // Never cached: an account deletion must make the certificate unverifiable at once.
  res.set('Cache-Control', 'no-store');
  res.json({ certificate: toPublicCertificate(certification) });
}
