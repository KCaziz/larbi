import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/httpError.js';
import { fallbackCategories, isKnownDeepLink, resolveIntent } from '../services/finAssistant.service.js';

// FINCLUDIA deterministic assistant (P3-19), public side. No session required
// (the public chatbot button works for anonymous visitors too, like P3-07);
// userId is recorded in the audit log only when a session is present.

const intentView = (i) => ({
  code: i.code,
  label: i.label,
  exampleQuery: i.exampleQuery,
  responseTemplate: i.responseTemplate,
  deepLinkPath: isKnownDeepLink(i.deepLinkPath) ? i.deepLinkPath : null,
});

export async function resolve(req, res) {
  const intents = await prisma.finIntent.findMany({ where: { status: 'published' }, orderBy: { position: 'asc' } });
  const match = resolveIntent(req.body.query, intents);
  const userId = req.user?.id ?? null;

  if (!match) {
    await prisma.finAuditLog.create({ data: { userId, action: 'fallback' } });
    return res.json({ type: 'fallback', categories: fallbackCategories(intents).map(intentView) });
  }

  await prisma.finAuditLog.create({ data: { userId, intentCode: match.code, action: 'resolved' } });
  res.json({ type: 'intent', intent: intentView(match) });
}

export async function listIntentsPublic(req, res) {
  const intents = await prisma.finIntent.findMany({ where: { status: 'published' }, orderBy: { position: 'asc' } });
  res.json({ intents: intents.map(intentView) });
}

export async function getFlow(req, res) {
  const flow = await prisma.finFlow.findFirst({ where: { key: req.params.key, status: 'published' }, include: { steps: { orderBy: { position: 'asc' } } } });
  if (!flow) throw new HttpError(404, 'Not found');
  await prisma.finAuditLog.create({ data: { userId: req.user?.id ?? null, flowKey: flow.key, action: 'flow_started' } });
  res.json({
    flow: {
      key: flow.key,
      name: flow.name,
      steps: flow.steps.map((s) => ({ stepKey: s.stepKey, prompt: s.prompt, options: s.options })),
    },
  });
}
