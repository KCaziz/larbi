import { prisma } from '../config/prisma.js';
import { REFERENCE_CATEGORIES } from '../constants/finCategoryReference.js';
import { BUDGET_METHODS, METHOD_MAPPING, POCKET_RULES } from '../constants/finBudgetMethods.js';
import { methodAnalysis } from '../services/finBudgetMethods.service.js';
import {
  ALERT_LEVELS,
  BUDGET_RECURRENCES,
  DEFAULT_ALERT_THRESHOLDS,
  ENVELOPE_KINDS,
  MAX_PROPOSAL_MONTHS,
  PROPOSAL_MONTHS,
  PROPOSAL_SOURCES,
} from '../constants/finBudget.js';
import { standardCategoryByKey } from '../constants/finCategories.js';
import { listChanges } from '../services/finChange.service.js';
import {
  BUDGET_ENTITY,
  ENVELOPE_ENTITY,
  createBudget,
  createEnvelope,
  deleteBudget,
  deleteEnvelope,
  duplicateBudget,
  historyByCategory,
  listBudgets,
  loadBudgetData,
  nextPeriod,
  ownBudget,
  setBudgetArchived,
  updateBudget,
  updateEnvelope,
} from '../services/finBudget.service.js';
import { mergeProposals, proposeFromHistory, proposeFromOnboarding } from '../services/finBudgetProposal.service.js';
import { buildBudgetView } from '../services/finBudgetView.service.js';
import { describeFormula } from '../services/finance/describe.js';
import { questionsForPublic } from '../constants/finOnboarding.js';
import { isAdultAgeRange } from '../constants/finPublics.js';
import { createNotification } from '../services/finNotification.service.js';

// Budgets and envelopes (P6-05), screens C06 (« Budget du mois ») and JA03 /
// JA04 (« Plan de répartition »). Session required everywhere, and every read
// and write is scoped to the caller's own rows: there is no administration side
// to somebody's budget.

export function getBudgetReferences(req, res) {
  res.json({
    envelopeKinds: ENVELOPE_KINDS,
    recurrences: BUDGET_RECURRENCES,
    alertLevels: ALERT_LEVELS,
    defaultAlertThresholds: DEFAULT_ALERT_THRESHOLDS,
    proposalSources: PROPOSAL_SOURCES,
    proposalMonths: { default: PROPOSAL_MONTHS, max: MAX_PROPOSAL_MONTHS },
    // The client category groups an envelope may cover (P8-09), with their
    // icon, and the optional methods with their default mapping (tab 12B).
    categoryGroups: [...new Map(REFERENCE_CATEGORIES.filter((c) => c.family !== 'income' && c.group).map((c) => [c.group, { group: c.group, icon: c.icon }])).values()],
    methods: BUDGET_METHODS,
    methodMapping: METHOD_MAPPING,
    pockets: POCKET_RULES,
    // The formulas this screen answers with, in the client's own wording, so
    // the "Pourquoi ?" panel explains them without a second source of truth.
    formulas: ['F002', 'F003', 'F004', 'F009', 'F010', 'F011', 'F012'].map(describeFormula),
  });
}

// ---- budgets ---------------------------------------------------------------

export async function getBudgets(req, res) {
  const budgets = await listBudgets(prisma, req.user.id, { includeArchived: req.query.includeArchived === 'true' });
  res.json({
    budgets: budgets.map(({ _count, ...budget }) => ({
      ...budget,
      enveloppes: _count.envelopes,
      // What the "duplicate" button will create, so the interface can say which
      // period it is offering instead of leaving the person to guess.
      prochainePeriode: nextPeriod(budget.recurrence, budget.periodStart, budget.periodEnd),
    })),
  });
}

export async function postBudget(req, res) {
  res.status(201).json({ budget: await createBudget(prisma, req.user.id, req.body) });
}

export async function patchBudget(req, res) {
  res.json({ budget: await updateBudget(prisma, req.user.id, req.params.id, req.body) });
}

export async function putBudgetArchived(req, res) {
  const { archived, reason } = req.body;
  res.json({ budget: await setBudgetArchived(prisma, req.user.id, req.params.id, archived, { reason }) });
}

export async function removeBudget(req, res) {
  res.json(await deleteBudget(prisma, req.user.id, req.params.id, { reason: req.body?.reason }));
}

export async function postBudgetDuplicate(req, res) {
  res.status(201).json({ budget: await duplicateBudget(prisma, req.user.id, req.params.id, { label: req.body?.label }) });
}

// One budget, computed: the screen's whole content in a single answer.
// One budget read through an optional method (P8-09, tab 12).
export async function getBudgetMethod(req, res) {
  const budget = await ownBudget(prisma, req.user.id, req.params.id);
  const data = await loadBudgetData(prisma, req.user.id, budget);
  const view = buildBudgetView({ budget, ...data });
  res.json(await methodAnalysis(prisma, req.user.id, { method: req.query.methode, budget, view, movements: data.movements }));
}

export async function getBudget(req, res) {
  const budget = await ownBudget(prisma, req.user.id, req.params.id);
  const data = await loadBudgetData(prisma, req.user.id, budget);
  const view = buildBudgetView({ budget, ...data, now: req.query.at ?? new Date() });

  // The envelopes carry category ids; the labels are joined here so the
  // interface never has to guess what a category is called.
  const ids = [...new Set(view.enveloppes.map((line) => line.categoryId).filter(Boolean))];
  const labels = new Map(
    (await prisma.finCategory.findMany({ where: { id: { in: ids } }, select: { id: true, label: true, family: true } })).map((row) => [row.id, row]),
  );
  view.enveloppes = view.enveloppes.map((line) => ({
    ...line,
    // An envelope on a client category group is named by the group (P8-09).
    label: line.categoryGroup ?? (line.categoryId ? (labels.get(line.categoryId)?.label ?? null) : null),
    family: line.categoryId ? (labels.get(line.categoryId)?.family ?? null) : null,
  }));

  // P6-18: an envelope that just crossed a declared threshold is new
  // information — the same level again is not (dedupeBy "level").
  for (const line of view.enveloppes) {
    if (line.alerte.niveau === 'none') continue;
    await createNotification(prisma, req.user.id, {
      type: 'budget_alert',
      params: { niveau: line.alerte.niveau, label: line.label, taux: line.tauxConsommation.resultat },
      link: `/app/budgets/${budget.id}`,
      referenceId: line.id,
      dedupeBy: 'level',
    });
  }

  res.json({ budget, vue: view });
}

export async function getBudgetHistory(req, res) {
  // Ownership first: the trail of a budget that is not the caller's is a 404,
  // like every other verb on it.
  await ownBudget(prisma, req.user.id, req.params.id);
  const changes = await listChanges(prisma, { userId: req.user.id, entity: BUDGET_ENTITY, entityId: req.params.id });
  res.json({ changes });
}

// ---- envelopes -------------------------------------------------------------

export async function postEnvelope(req, res) {
  res.status(201).json({ envelope: await createEnvelope(prisma, req.user.id, req.params.id, req.body) });
}

export async function patchEnvelope(req, res) {
  res.json({ envelope: await updateEnvelope(prisma, req.user.id, req.params.id, req.params.envelopeId, req.body) });
}

export async function removeEnvelope(req, res) {
  res.json(await deleteEnvelope(prisma, req.user.id, req.params.id, req.params.envelopeId, { reason: req.body?.reason }));
}

export async function getEnvelopeHistory(req, res) {
  await ownBudget(prisma, req.user.id, req.params.id);
  const changes = await listChanges(prisma, { userId: req.user.id, entity: ENVELOPE_ENTITY, entityId: req.params.envelopeId });
  res.json({ changes });
}

// ---- proposed distribution -------------------------------------------------

/**
 * A distribution PROPOSED from the person's own data — never written, never
 * applied. The answer says, line by line, where each figure comes from: what
 * they actually spent over the window, or what they declared at sign-up.
 *
 * This is also the bridge the onboarding was waiting for: its declared
 * essential expenses had no table of their own (P6-03), and this is that table.
 */
export async function getBudgetProposal(req, res) {
  const months = req.query.months ?? PROPOSAL_MONTHS;
  const currency = req.query.currency ?? req.user.finCurrency;
  const to = req.query.to ?? new Date();
  // The window ends at `to` and starts `months` whole months earlier.
  const from = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth() - months, to.getUTCDate()));

  const rows = await historyByCategory(prisma, req.user.id, { from, to, currency });
  const history = proposeFromHistory(rows, { months, currency });

  // The onboarding side: only the questions this public was actually asked can
  // produce an envelope (a minor is never asked about debt — P6-03's rule).
  const onboarding = await prisma.finOnboarding.findUnique({
    where: { userId: req.user.id },
    select: { answers: true, currency: true, fictional: true },
  });
  let declared = [];
  if (onboarding && onboarding.currency === currency) {
    const questions = questionsForPublic(req.user.finPublic, { minor: isAdultAgeRange(req.user.finAgeRange) === false });
    const keys = [...new Set(questions.filter((question) => question.kind === 'expense').map((question) => question.category))];
    const standardKeys = keys.filter((key) => standardCategoryByKey(key));
    const categories = await prisma.finCategory.findMany({
      where: { key: { in: standardKeys }, deletedAt: null },
      select: { id: true, key: true },
    });
    const byKey = new Map(categories.map((row) => [row.key, row.id]));
    declared = proposeFromOnboarding(questions, onboarding.answers ?? {}, byKey, { currency });
  }

  res.json({
    fenetre: { debut: from, fin: to, mois: months },
    devise: currency,
    // Both lists, and the merge. The person sees where a figure came from and
    // can take the other one instead: proposed, never imposed.
    historique: history,
    declare: declared,
    proposition: mergeProposals(history, declared),
  });
}
