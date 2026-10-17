import { prisma } from '../config/prisma.js';
import { buildFundingReadiness } from '../services/finFunding.service.js';
import { describeFormula } from '../services/finance/describe.js';

// Funding readiness (P6-16), screens JA08 / SA05. Never a credit score, never
// a prediction, never a guarantee of agreement — the client's own words.

export function getFundingReferences(req, res) {
  res.json({ formulas: ['F051', 'F018', 'F014', 'F007'].map(describeFormula) });
}

export async function getFundingReadiness(req, res) {
  const currency = req.query.currency ?? req.user.finCurrency;
  res.json(await buildFundingReadiness(prisma, req.user.id, { currency }));
}

// The export the client asks for, gated by an explicit consent on the call
// itself — never inferred from merely opening the screen. Logging an export
// as a sensitive action is P6-19's own ledger (centre de confiance); this
// route only refuses to run without `consent: true` in the body.
export async function postFundingExport(req, res) {
  const currency = req.query.currency ?? req.user.finCurrency;
  const readiness = await buildFundingReadiness(prisma, req.user.id, { currency });
  res.json({ export: readiness, exporteLe: new Date().toISOString() });
}
