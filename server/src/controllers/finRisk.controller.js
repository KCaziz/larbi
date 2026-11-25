import { prisma } from '../config/prisma.js';
import { resolveOrganization } from '../services/finOrganization.service.js';
import { addRiskAction, completeRiskAction, createRisk, listRisks, reassessRisk, saveProjectFx, simulateProjectFx } from '../services/finRisk.service.js';

// P13-05, lot D bis: the trade risk register (ECR-0370) and the exchange effect
// on a diaspora project (ECR-0378). Read by the finance readers, written by
// those who run the trade; a project stays reached only by its managers or a
// share in force (CNV-14).
const resolve = (req, action) => resolveOrganization(prisma, req, action);

export async function getRisks(req, res) {
  res.json(await listRisks(prisma, await resolve(req, 'finance.read')));
}

export async function postRisk(req, res) {
  res.status(201).json({ risque: await createRisk(prisma, await resolve(req, 'trade.write'), req.body) });
}

export async function putRisk(req, res) {
  res.json({ risque: await reassessRisk(prisma, await resolve(req, 'trade.write'), req.params.id, req.body, req.get('if-match')) });
}

export async function postRiskAction(req, res) {
  res.status(201).json({ risque: await addRiskAction(prisma, await resolve(req, 'trade.write'), req.params.id, req.body) });
}

export async function postRiskActionDone(req, res) {
  res.json({ risque: await completeRiskAction(prisma, await resolve(req, 'trade.write'), req.params.id, req.params.sub) });
}

export async function postProjectFxSimulation(req, res) {
  res.json(await simulateProjectFx(prisma, await resolve(req, 'org.read'), req.params.id, req.body));
}

export async function postProjectFxScenario(req, res) {
  res.status(201).json({ scenario: await saveProjectFx(prisma, await resolve(req, 'org.read'), req.params.id, req.body) });
}
