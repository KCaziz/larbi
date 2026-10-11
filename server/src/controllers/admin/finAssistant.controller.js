import { prisma } from '../../config/prisma.js';
import { FIN_INTENTS } from '../../constants/finAssistant.js';
import { sanitizeRichText, richTextToPlain } from '../../services/sanitize.service.js';
import { isKnownDeepLink } from '../../services/finAssistant.service.js';
import { HttpError } from '../../utils/httpError.js';

// Administration of the FINCLUDIA deterministic assistant (P3-19): the 8
// intents are seeded once from the client's own closed list (never created or
// renamed freely — code is fixed), keywords/response/deep-link are editable;
// flows (state machine) and the audit log are managed here too.

const intentRow = (i) => ({
  id: i.id,
  code: i.code,
  label: i.label,
  exampleQuery: i.exampleQuery,
  keywords: i.keywords,
  responseTemplate: i.responseTemplate,
  deepLinkPath: i.deepLinkPath,
  deepLinkAvailable: isKnownDeepLink(i.deepLinkPath),
  status: i.status,
  updatedAt: i.updatedAt,
});

// The 8 rows exist once the admin first opens this screen (idempotent): the
// closed catalogue IS the client's file, not something an admin invents.
export async function listIntents(req, res) {
  const existing = await prisma.finIntent.findMany();
  const byCode = new Map(existing.map((i) => [i.code, i]));
  const missing = FIN_INTENTS.filter((i) => !byCode.has(i.code));
  if (missing.length) {
    await prisma.finIntent.createMany({
      data: missing.map((i, index) => ({ code: i.code, label: i.label, exampleQuery: i.exampleQuery, responseTemplate: '<p></p>', position: index })),
    });
  }
  const rows = await prisma.finIntent.findMany({ orderBy: { position: 'asc' } });
  res.json({ intents: rows.map(intentRow) });
}

export async function updateIntent(req, res) {
  const existing = await prisma.finIntent.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new HttpError(404, 'Not found');
  const data = { ...req.body };
  if ('responseTemplate' in data) data.responseTemplate = sanitizeRichText(data.responseTemplate) ?? '<p></p>';
  const updated = await prisma.finIntent.update({ where: { id: existing.id }, data });
  res.json({ intent: intentRow(updated) });
}

async function setIntentStatus(req, res, status) {
  const existing = await prisma.finIntent.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new HttpError(404, 'Not found');
  if (status === 'published' && !richTextToPlain(existing.responseTemplate)) throw new HttpError(422, 'A response is required before publishing');
  const updated = await prisma.finIntent.update({ where: { id: existing.id }, data: { status } });
  res.json({ intent: intentRow(updated) });
}
export const publishIntent = (req, res) => setIntentStatus(req, res, 'published');
export const unpublishIntent = (req, res) => setIntentStatus(req, res, 'draft');

// ---- Flows ----------------------------------------------------------------------

const flowRow = (f) => ({ id: f.id, key: f.key, name: f.name, status: f.status, stepCount: f.steps?.length ?? f._count?.steps ?? 0 });
const stepRow = (s) => ({ id: s.id, stepKey: s.stepKey, prompt: s.prompt, options: s.options, position: s.position });

export async function listFlows(req, res) {
  const flows = await prisma.finFlow.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { steps: true } } } });
  res.json({ flows: flows.map(flowRow) });
}

export async function createFlow(req, res) {
  const key = req.body.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'parcours';
  let candidate = key;
  let n = 2;
  while (await prisma.finFlow.findUnique({ where: { key: candidate }, select: { id: true } })) {
    candidate = `${key}-${n}`;
    n += 1;
  }
  const created = await prisma.finFlow.create({ data: { key: candidate, name: req.body.name } });
  res.status(201).json({ flow: flowRow(created) });
}

export async function getFlow(req, res) {
  const flow = await prisma.finFlow.findUnique({ where: { id: req.params.id }, include: { steps: { orderBy: { position: 'asc' } } } });
  if (!flow) throw new HttpError(404, 'Not found');
  res.json({ flow: { ...flowRow(flow), steps: flow.steps.map(stepRow) } });
}

async function setFlowStatus(req, res, status) {
  const existing = await prisma.finFlow.findUnique({ where: { id: req.params.id }, include: { _count: { select: { steps: true } } } });
  if (!existing) throw new HttpError(404, 'Not found');
  if (status === 'published' && existing._count.steps === 0) throw new HttpError(422, 'At least one step is required before publishing');
  const updated = await prisma.finFlow.update({ where: { id: existing.id }, data: { status } });
  res.json({ flow: flowRow(updated) });
}
export const publishFlow = (req, res) => setFlowStatus(req, res, 'published');
export const unpublishFlow = (req, res) => setFlowStatus(req, res, 'draft');

export async function deleteFlow(req, res) {
  const existing = await prisma.finFlow.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new HttpError(404, 'Not found');
  await prisma.finFlow.delete({ where: { id: existing.id } });
  res.status(204).end();
}

export async function createStep(req, res) {
  const flow = await prisma.finFlow.findUnique({ where: { id: req.params.id } });
  if (!flow) throw new HttpError(404, 'Not found');
  const dup = await prisma.finFlowStep.findUnique({ where: { flowId_stepKey: { flowId: flow.id, stepKey: req.body.stepKey } } });
  if (dup) throw new HttpError(409, 'A step with this key already exists in this flow');
  const last = await prisma.finFlowStep.aggregate({ where: { flowId: flow.id }, _max: { position: true } });
  const created = await prisma.finFlowStep.create({ data: { flowId: flow.id, stepKey: req.body.stepKey, prompt: req.body.prompt, options: req.body.options, position: (last._max.position ?? -1) + 1 } });
  res.status(201).json({ step: stepRow(created) });
}

export async function updateStep(req, res) {
  const existing = await prisma.finFlowStep.findUnique({ where: { id: req.params.stepId } });
  if (!existing || existing.flowId !== req.params.id) throw new HttpError(404, 'Not found');
  const updated = await prisma.finFlowStep.update({ where: { id: existing.id }, data: req.body });
  res.json({ step: stepRow(updated) });
}

export async function deleteStep(req, res) {
  const existing = await prisma.finFlowStep.findUnique({ where: { id: req.params.stepId } });
  if (!existing || existing.flowId !== req.params.id) throw new HttpError(404, 'Not found');
  await prisma.finFlowStep.delete({ where: { id: existing.id } });
  res.status(204).end();
}

// ---- Audit log (read-only) -------------------------------------------------------
export async function listAuditLog(req, res) {
  const rows = await prisma.finAuditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ entries: rows.map((r) => ({ id: r.id, intentCode: r.intentCode, flowKey: r.flowKey, stepKey: r.stepKey, action: r.action, createdAt: r.createdAt })) });
}
