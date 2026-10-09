import { randomInt } from 'node:crypto';

// Certificate numbers (P2-05).
//
// Format FINCLUDIA-XXXX-XXXX-XXXX, 12 random characters from a 32-letter alphabet
// without look-alikes (no 0/O, 1/I): 60 bits of entropy. The number is the
// public verification key, so it must not be guessable or sequential.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// The brand prefix lives here alone: the pattern, the generator and the tests
// all derive from it. It used to be spelled out in each of them, and renaming the
// platform then left the tests cutting the number at the wrong character.
export const CERTIFICATE_PREFIX = 'FINCLUDIA-';
export const CERTIFICATE_NUMBER_PATTERN = new RegExp(`^${CERTIFICATE_PREFIX}[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$`);

const chunk = () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');

export const generateCertificateNumber = () => `${CERTIFICATE_PREFIX}${chunk()}-${chunk()}-${chunk()}`;

// Accepts what a person may type ("fincludia-abcd-…", surrounding spaces).
export const normalizeCertificateNumber = (value) => String(value ?? '').trim().toUpperCase();

// A duplicate is astronomically unlikely, but a unique violation would abort the
// surrounding transaction, so uniqueness is checked before inserting.
async function freeNumber(tx) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const number = generateCertificateNumber();
    if (!(await tx.certification.findUnique({ where: { certificateNumber: number } }))) return number;
  }
  throw new Error('Could not generate a unique certificate number');
}

// Creates the certificate of an enrolment. The holder name and titles are copied
// so the certificate stays valid and identical if the account or the formation
// is renamed later. Callers hold the enrolment lock and decided eligibility.
export async function createCertificate(tx, { user, formation, enrollmentId }) {
  return tx.certification.create({
    data: {
      certificateNumber: await freeNumber(tx),
      enrollmentId,
      holderName: user.name,
      formationTitle: formation.title,
      certificationTitle: formation.certificationTitle ?? null,
    },
  });
}
