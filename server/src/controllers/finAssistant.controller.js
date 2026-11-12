import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/httpError.js';
import { fallbackCategories, isKnownDeepLink, resolveIntent } from '../services/finAssistant.service.js';

// FINCLUDIA deterministic assistant (P3-19), public side. No session required
// (the public chatbot button works for anonymous visitors too, like P3-07);
// userId is recorded in the audit log only when a session is present.

// R11-05: in the reader's language when translated, in French otherwise.
const PUBLIC_LANGUAGES = ['fr', 'en', 'ar'];
const langOf = (req) => {
  const asked = req.body?.lang ?? req.query?.lang;
  return PUBLIC_LANGUAGES.includes(asked) ? asked : 'fr';
};
const hasText = (html) => Boolean((html ?? '').replace(/<[^>]*>/g, '').trim());

const intentView = (i, lang = 'fr') => {
  const own = lang === 'fr' ? null : i.translations?.[lang];
  return {
    code: i.code,
    label: own?.label?.trim() ? own.label : i.label,
    exampleQuery: i.exampleQuery,
    responseTemplate: hasText(own?.responseTemplate) ? own.responseTemplate : i.responseTemplate,
    deepLinkPath: isKnownDeepLink(i.deepLinkPath) ? i.deepLinkPath : null,
  };
};

export async function resolve(req, res) {
  const intents = await prisma.finIntent.findMany({ where: { status: 'published' }, orderBy: { position: 'asc' } });
  const match = resolveIntent(req.body.query, intents);
  const userId = req.user?.id ?? null;

  if (!match) {
    await prisma.finAuditLog.create({ data: { userId, action: 'fallback' } });
    return res.json({ type: 'fallback', categories: fallbackCategories(intents).map((i) => intentView(i, langOf(req))) });
  }

  await prisma.finAuditLog.create({ data: { userId, intentCode: match.code, action: 'resolved' } });
  res.json({ type: 'intent', intent: intentView(match, langOf(req)) });
}

export async function listIntentsPublic(req, res) {
  const intents = await prisma.finIntent.findMany({ where: { status: 'published' }, orderBy: { position: 'asc' } });
  res.json({ intents: intents.map((i) => intentView(i, langOf(req))) });
}

// The guided paths an administrator published (R11-03), offered in the panel.
export async function listFlowsPublic(req, res) {
  const flows = await prisma.finFlow.findMany({ where: { status: 'published', steps: { some: {} } }, orderBy: { name: 'asc' }, select: { key: true, name: true } });
  res.json({ flows });
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
