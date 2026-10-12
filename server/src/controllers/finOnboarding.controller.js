import { prisma } from '../config/prisma.js';
import { completeOnboarding, getOnboarding, saveAnswers } from '../services/finOnboarding.service.js';

// Progressive financial onboarding (P6-03). Self-service only, session
// required: no financial question is asked of someone we cannot attach the
// answer to, and there is no administration side.

export async function getState(req, res) {
  res.json(await getOnboarding(prisma, req.user));
}

// « Enregistrer et quitter » is this route: it accepts a partial batch and
// answers with the whole new state, so the screen can show the first result and
// the questions still to confirm without a second request.
export async function putAnswers(req, res) {
  res.json(await saveAnswers(prisma, req.user, req.body));
}

export async function postComplete(req, res) {
  res.json(await completeOnboarding(prisma, req.user));
}
