import { prisma } from '../config/prisma.js';
import { buildProvisionView, createProvision, deleteProvision, listProvisions, updateProvision } from '../services/finSpaceProvision.service.js';
import { describeFormula } from '../services/finance/describe.js';

// Annual household provisions (P6-15, famille), F045.

export function getProvisionReferences(req, res) {
  res.json({ formulas: ['F045'].map(describeFormula) });
}

export async function getProvisions(req, res) {
  const provisions = await listProvisions(prisma, req.user.id, req.params.id, { includeArchived: req.query.includeArchived === 'true' });
  res.json({ provisions: provisions.map((provision) => ({ ...provision, vue: buildProvisionView(provision) })) });
}

export async function postProvision(req, res) {
  const provision = await createProvision(prisma, req.user.id, req.params.id, req.body);
  res.status(201).json({ provision: { ...provision, vue: buildProvisionView(provision) } });
}

export async function patchProvision(req, res) {
  const provision = await updateProvision(prisma, req.user.id, req.params.id, req.params.provisionId, req.body);
  res.json({ provision: { ...provision, vue: buildProvisionView(provision) } });
}

export async function removeProvision(req, res) {
  res.json(await deleteProvision(prisma, req.user.id, req.params.id, req.params.provisionId, { reason: req.body?.reason }));
}
