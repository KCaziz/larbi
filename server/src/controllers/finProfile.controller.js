import { prisma } from '../config/prisma.js';
import { isAdultAgeRange } from '../constants/finPublics.js';
import { hasCurrentConsents, recordConsents, recordTransition } from '../services/finProfile.service.js';
import { HttpError } from '../utils/httpError.js';

// FINCLUDIA onboarding and profile (P3-18, screen C02). Authenticated only:
// "aucune donnée financière demandée avant le consentement", and consent
// itself needs a known account. No admin side: this is entirely self-service.

const FIN_FIELDS = ['finPublic', 'finSecondaryPublics', 'finAgeRange', 'finCountry', 'finSituation', 'finMainIntention', 'finHorizon', 'finIrregularIncome'];

function toProfile(user, consented) {
  return {
    finPublic: user.finPublic,
    finSecondaryPublics: user.finSecondaryPublics,
    finAgeRange: user.finAgeRange,
    finCountry: user.finCountry,
    finCurrency: user.finCurrency,
    finSituation: user.finSituation,
    finMainIntention: user.finMainIntention,
    finHorizon: user.finHorizon,
    finIrregularIncome: user.finIrregularIncome,
    finOnboardedAt: user.finOnboardedAt,
    isAdult: isAdultAgeRange(user.finAgeRange),
    consented,
  };
}

export async function getFinProfile(req, res) {
  const consented = await hasCurrentConsents(req.user.id);
  res.json({ profile: toProfile(req.user, consented) });
}

export async function updateFinProfile(req, res) {
  const { acceptConsents, ...fields } = req.body;
  const touchesFinData = FIN_FIELDS.some((key) => key in fields);

  if (touchesFinData) {
    const already = await hasCurrentConsents(req.user.id);
    if (!already && !acceptConsents) {
      throw new HttpError(403, 'Consent required', { reason: 'consentRequired' });
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (acceptConsents) await recordConsents(tx, req.user.id);

    // A real change of public (never a first pick FROM nothing, and never
    // clearing it back to nothing) is the "changement de parcours" the client
    // wants kept: it is what moves a person from one FINCLUDIA experience to
    // another, e.g. "étudiant" -> "jeune actif".
    if (fields.finPublic && req.user.finPublic && fields.finPublic !== req.user.finPublic) {
      await recordTransition(tx, req.user.id, req.user.finPublic, fields.finPublic);
    }

    const data = { ...fields };
    const willOnboard = !req.user.finOnboardedAt && fields.finPublic && (acceptConsents || (await hasCurrentConsents(req.user.id)));
    if (willOnboard) data.finOnboardedAt = new Date();

    return tx.user.update({ where: { id: req.user.id }, data });
  });

  const consented = await hasCurrentConsents(updated.id);
  res.json({ profile: toProfile(updated, consented) });
}

export async function listFinTransitions(req, res) {
  const rows = await prisma.finProfileTransition.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' }, take: 50 });
  res.json({ transitions: rows.map((r) => ({ id: r.id, fromPublic: r.fromPublic, toPublic: r.toPublic, createdAt: r.createdAt })) });
}
