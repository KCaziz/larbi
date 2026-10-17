import { prisma } from '../config/prisma.js';
import { buildReserveView } from '../services/finReserve.service.js';
import { describeFormula } from '../services/finance/describe.js';

// Safety reserve (P6-09), screen C12. Session required; always this account's
// own data.

export function getReserveReferences(req, res) {
  res.json({ formulas: ['F014', 'F015', 'F016'].map(describeFormula) });
}

export async function getReserve(req, res) {
  const currency = req.query.currency ?? req.user.finCurrency;
  const view = await buildReserveView(prisma, req.user.id, { currency, targetMonths: req.user.finReserveTargetMonths });
  res.json(view);
}

export async function putReserveTarget(req, res) {
  const user = await prisma.user.update({ where: { id: req.user.id }, data: { finReserveTargetMonths: req.body.targetMonths }, select: { finReserveTargetMonths: true } });
  const currency = req.query.currency ?? req.user.finCurrency;
  const view = await buildReserveView(prisma, req.user.id, { currency, targetMonths: user.finReserveTargetMonths });
  res.json(view);
}
