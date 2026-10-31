import { prisma } from '../config/prisma.js';
import { createFirstIncome, firstStepsState, setStepSkipped } from '../services/finFirstSteps.service.js';

export async function getFirstSteps(req, res) {
  res.json(await firstStepsState(prisma, req.user.id));
}

export async function putStep(req, res) {
  await setStepSkipped(prisma, req.user.id, req.body.step, req.body.skipped);
  res.json(await firstStepsState(prisma, req.user.id));
}

export async function postFirstIncome(req, res) {
  res.status(201).json(await createFirstIncome(prisma, req.user.id, req.body));
}
