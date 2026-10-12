import { prisma } from '../config/prisma.js';
import { FIN_CONSENT_TEXTS } from '../constants/finPublics.js';

// FINCLUDIA onboarding and profile (P3-18): consent bookkeeping and the
// "changement de parcours" history. No financial data here — this is identity
// only; the financial data model itself is P6-02 (done), in
// services/finCategory.service.js and services/finance/dataModel.js.

// Has this account accepted the CURRENT version of every required text? A text
// whose version was bumped after acceptance makes the old row stale: it no
// longer counts, exactly like it was never accepted.
export async function hasCurrentConsents(userId) {
  const required = Object.entries(FIN_CONSENT_TEXTS);
  const rows = await prisma.finConsent.findMany({ where: { userId }, orderBy: { acceptedAt: 'desc' } });
  return required.every(([textKey, { version }]) => rows.some((r) => r.textKey === textKey && r.version === version));
}

// Records acceptance of the CURRENT version of every required text at once
// (the onboarding screen shows them together). Never partial: FINCLUDIA asks
// for no financial data before every consent is given.
export async function recordConsents(tx, userId) {
  const data = Object.entries(FIN_CONSENT_TEXTS).map(([textKey, { version }]) => ({ userId, textKey, version }));
  await tx.finConsent.createMany({ data });
}

// A change of public is proposed, never forced (client's words): this just
// logs it happened, after the caller has already applied it.
export function recordTransition(tx, userId, fromPublic, toPublic) {
  return tx.finProfileTransition.create({ data: { userId, fromPublic, toPublic } });
}
