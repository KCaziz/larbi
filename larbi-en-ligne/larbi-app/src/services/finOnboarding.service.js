// Progressive financial onboarding (P6-03, screens C03, LY01, ET01, SA01, EP01).
//
// The client's shape: the fewest questions that give a useful first result,
// conditional on the public, each one skippable, each one able to say why it is
// asked, and the whole thing leavable half-done. So nothing here is required,
// nothing blocks, and an inconsistency ASKS instead of refusing.
//
// What is stored: the answers, as answered (a skipped question is recorded AS
// skipped, not as missing). Resource answers also become real FinIncome rows,
// because that table exists and the client's "Revenu" object matches it field
// for field. The amounts whose own table does not exist yet — savings, debt
// instalments, goal target — stay declared on the onboarding record until
// P6-05, P6-08 and P6-11 give them one; they are still computed through the
// versioned engine, so no figure is faked.

import {
  FICTIONAL_START,
  INCONSISTENCY_RATIO,
  KNOWLEDGE_LEVELS,
  MINOR_PUBLIC,
  questionOfRole,
  questionsForPublic,
} from '../constants/finOnboarding.js';
import { isAdultAgeRange } from '../constants/finPublics.js';
import { FREQUENCIES } from '../constants/finance.js';
import { standardCategoryByKey } from '../constants/finCategories.js';
import { HttpError } from '../utils/httpError.js';
import { computed } from './finance/contract.js';
import { describeFormula } from './finance/describe.js';
import { debtEffortRate, monthlyAmount, netFlow, totalExpenses, totalIncome } from './finance/formulas.js';
import { recordChange } from './finChange.service.js';

export const ENTITY = 'onboarding';

// A lycéen is never asked about debt, never shown real patrimony, and never
// offered credit — the client's rule, applied here and not only in the
// interface (rule 2: the server decides). An age bracket that says under 18
// counts too, whichever public the person picked.
export { MINOR_PUBLIC };

const asksAsMinor = (user) => ({ minor: isAdultAgeRange(user.finAgeRange) === false });

// What the API publishes for one question. `why` is the answer to the client's
// own « Pourquoi cette question ? » button.
const toQuestion = (question, answers) => ({
  key: question.key,
  screen: question.screen,
  kind: question.kind,
  category: question.category,
  options: question.options ?? null,
  why: question.why,
  // Resource answers need a frequency: a weekly amount and the same amount per
  // month are not the same resource (F001).
  needsFrequency: question.kind === 'resource' || question.kind === 'expense',
  answer: answers[question.key] ?? null,
});

const isSkipped = (answer) => Boolean(answer?.skipped);
const answeredAmount = (answer) => (!answer || isSkipped(answer) || typeof answer.amount !== 'number' ? null : answer.amount);

// Validates ONE answer against its question. Returns the stored shape, so what
// goes into `answers` is always what the registry declared, never whatever the
// caller sent.
function cleanAnswer(question, raw) {
  if (raw?.skipped) return { skipped: true };

  if (question.kind === 'resource' || question.kind === 'expense') {
    if (!Number.isSafeInteger(raw?.amount) || raw.amount < 0) {
      throw new HttpError(422, 'An amount is a whole number of centimes', { reason: 'amount', question: question.key });
    }
    // An expense estimate defaults to monthly, which is how the client's own
    // question is worded ("dépenses essentielles estimées"); a resource must
    // say its frequency, because that is its own error case on screen ET01.
    const frequency = raw.frequency ?? (question.kind === 'expense' ? 'mensuel' : null);
    if (!FREQUENCIES.includes(frequency)) {
      throw new HttpError(422, 'A periodic amount needs its frequency', { reason: 'frequency', question: question.key });
    }
    return { amount: raw.amount, frequency, ...(raw.confirmed ? { confirmed: true } : {}) };
  }

  if (question.kind === 'amount') {
    if (!Number.isSafeInteger(raw?.amount) || raw.amount < 0) {
      throw new HttpError(422, 'An amount is a whole number of centimes', { reason: 'amount', question: question.key });
    }
    return { amount: raw.amount, ...(raw.confirmed ? { confirmed: true } : {}) };
  }

  if (question.kind === 'choice') {
    if (!question.options.includes(raw?.choice)) {
      throw new HttpError(422, 'Unknown choice', { reason: 'choice', question: question.key });
    }
    return { choice: raw.choice };
  }

  const text = typeof raw?.text === 'string' ? raw.text.trim() : '';
  if (text.length === 0 || text.length > 80) throw new HttpError(422, 'Invalid text', { reason: 'text', question: question.key });
  return { text };
}

// How far along this onboarding is, over the questions THIS public is asked. A
// skipped question counts as dealt with but not as answered: the client asks
// for a "niveau de complétude", which is about how much is known, not about how
// many screens were walked through.
export function completeness(questions, answers) {
  const applicable = questions.length;
  const answered = questions.filter((q) => answers[q.key] && !isSkipped(answers[q.key])).length;
  const skipped = questions.filter((q) => isSkipped(answers[q.key])).length;
  return {
    applicable,
    answered,
    skipped,
    remaining: applicable - answered - skipped,
    // A ratio, not a percentage: the interface formats it (engine convention).
    ratio: applicable === 0 ? null : answered / applicable,
  };
}

// Answers so far apart that one of them is probably a typo. The client's rule
// is explicit: ask for confirmation, never block in silence. So this returns
// QUESTIONS, and an answer the person has confirmed stops being asked about.
export function inconsistencies(questions, answers) {
  const found = [];
  const monthly = (question) => {
    const answer = answers[question.key];
    const amount = answeredAmount(answer);
    if (amount === null) return null;
    return question.kind === 'resource' || question.kind === 'expense' ? monthlyAmount(amount, answer.frequency) : amount;
  };

  const resources = questions.filter((q) => q.kind === 'resource').map(monthly).filter((v) => v !== null);
  const expenses = questions.filter((q) => q.kind === 'expense').map(monthly).filter((v) => v !== null);
  const totalResources = resources.reduce((a, b) => a + b, 0);
  const totalExpense = expenses.reduce((a, b) => a + b, 0);

  for (const question of questions) {
    const answer = answers[question.key];
    if (!answer || isSkipped(answer) || answer.confirmed) continue;
    const amount = monthly(question);
    if (amount === null || amount === 0) continue;
    const other = question.kind === 'resource' ? totalExpense : totalResources;
    if (other > 0 && (amount > other * INCONSISTENCY_RATIO || other > amount * INCONSISTENCY_RATIO)) {
      found.push({ question: question.key, reason: 'outOfScale' });
    }
  }
  return found;
}

// The first useful result the client asks for: a first budget, a first
// indicator, and the completeness level. Everything goes through the contract,
// so each figure says which formula and which version produced it.
export function firstResult({ questions, answers, currency, fictional, now = new Date() }) {
  const monthlyOf = (question) => {
    const answer = answers[question.key];
    const amount = answeredAmount(answer);
    if (amount === null) return null;
    return monthlyAmount(amount, answer.frequency);
  };

  const resourceEntries = questions
    .filter((q) => q.kind === 'resource')
    .map((q) => monthlyOf(q))
    .filter((value) => value !== null)
    .map((amount) => ({ amount, currency }));
  const expenseEntries = questions
    .filter((q) => q.kind === 'expense')
    .map((q) => monthlyOf(q))
    .filter((value) => value !== null)
    .map((amount) => ({ amount, currency }));

  const income = resourceEntries.length === 0 ? null : totalIncome(resourceEntries, { currency });
  const expenses = expenseEntries.length === 0 ? null : totalExpenses(expenseEntries, { currency });
  // Read by ROLE, never by key: which question carries the savings, the debt or
  // the goal depends on the public, and hard-coding a key would silently miss
  // the answer of anyone asked a different screen's version of it.
  const amountOfRole = (role) => {
    const question = questionOfRole(questions, role);
    return question ? answeredAmount(answers[question.key]) : null;
  };
  const choiceOfRole = (role) => {
    const question = questionOfRole(questions, role);
    return question ? (answers[question.key]?.choice ?? null) : null;
  };
  const debt = amountOfRole('debt');

  const inputs = {
    ressources_declarees: resourceEntries.length,
    depenses_declarees: expenseEntries.length,
    mensualites_dette: debt,
    fictif: fictional,
  };
  // A fictional onboarding says so on every figure it produces, so no screen
  // can show one of them as if it described real money.
  const warnings = fictional ? ['SIMULATION : ces montants sont fictifs et ne sont jamais ajoutés à des montants réels.'] : [];
  const answer = (id, result) => computed(id, result, { inputs, currency, warnings, now });

  return {
    revenus: answer('F002', income),
    depenses: answer('F003', expenses),
    // The first budget: what is left each month once the essentials are paid.
    fluxNet: answer('F004', netFlow(income, expenses)),
    // The first indicator. Only when a debt instalment was actually declared:
    // an effort rate of 0 % would read as "no debt", which is an answer, and we
    // do not have it — the question may simply have been skipped.
    tauxEffortDette: debt === null ? null : answer('F018', debtEffortRate(debt, income)),
    epargneDisponible: amountOfRole('savings'),
    objectif: choiceOfRole('goal')
      ? {
          categorie: choiceOfRole('goal'),
          libelle: standardCategoryByKey(choiceOfRole('goal'))?.label ?? null,
          montant: amountOfRole('goalAmount'),
        }
      : null,
  };
}

// ---- storage ---------------------------------------------------------------

const SELECT = {
  id: true,
  currency: true,
  answers: true,
  fictional: true,
  completedAt: true,
  scope: true,
  source: true,
  status: true,
  confidence: true,
  consentUses: true,
  version: true,
};

const EMPTY = (currency, fictional) => ({ currency, answers: {}, fictional, completedAt: null });

// The whole state of someone's onboarding: the questions their public is asked,
// what they answered, how complete it is, what needs confirming, and the first
// result. One call, because the client's screen shows all of it at once.
export async function getOnboarding(prisma, user) {
  const row = await prisma.finOnboarding.findFirst({ where: { userId: user.id, deletedAt: null }, select: SELECT });
  const state = row ?? EMPTY(user.finCurrency, false);
  const questions = questionsForPublic(user.finPublic, asksAsMinor(user));
  const answers = state.answers ?? {};

  return {
    currency: state.currency,
    fictional: state.fictional,
    completedAt: state.completedAt,
    // Offered, not imposed: the client proposes the fictional budget to a
    // lycéen (« commence avec 5 000 DA fictifs »), it does not force it.
    fictionalOffer: user.finPublic === MINOR_PUBLIC && !state.fictional ? FICTIONAL_START : null,
    questions: questions.map((question) => toQuestion(question, answers)),
    completeness: completeness(questions, answers),
    confirmations: inconsistencies(questions, answers),
    result: firstResult({ questions, answers, currency: state.currency, fictional: state.fictional }),
    knowledgeLevels: KNOWLEDGE_LEVELS,
    formulas: ['F002', 'F003', 'F004', 'F018'].map(describeFormula),
  };
}

// Saves a batch of answers. Partial on purpose: the client's « Enregistrer et
// quitter » must work at any point, so this never requires a complete set and
// never refuses because something else is still missing.
export async function saveAnswers(prisma, user, { answers: incoming = {}, fictional, currency }) {
  const questions = questionsForPublic(user.finPublic, asksAsMinor(user));
  const asked = new Map(questions.map((question) => [question.key, question]));

  const cleaned = {};
  for (const [key, raw] of Object.entries(incoming)) {
    const question = asked.get(key);
    // A question this public is not asked is refused rather than stored: for a
    // lycéen that is exactly how "never asked about debt" is enforced on the
    // server, not just hidden in the interface.
    if (!question) {
      throw new HttpError(422, 'This question is not asked for this profile', { reason: 'notAsked', question: key });
    }
    cleaned[key] = cleanAnswer(question, raw);
  }

  const existing = await prisma.finOnboarding.findFirst({ where: { userId: user.id, deletedAt: null }, select: { ...SELECT, userId: true } });
  const nextFictional = fictional ?? existing?.fictional ?? false;
  if (nextFictional && user.finPublic !== MINOR_PUBLIC && !existing?.fictional) {
    // The fictional starter budget is the client's answer to "a lycéen has no
    // real money to manage". Offering it to everyone would turn it into a way
    // of keeping two sets of books.
    throw new HttpError(422, 'The fictional budget is offered to the lycéen experience', { reason: 'fictionalNotOffered' });
  }
  const nextAnswers = { ...(existing?.answers ?? {}), ...cleaned };
  const nextCurrency = currency ?? existing?.currency ?? user.finCurrency;
  const status = nextFictional ? 'fictional' : 'declared';

  await prisma.$transaction(async (tx) => {
    const row = existing
      ? await tx.finOnboarding.update({
          where: { id: existing.id },
          data: { answers: nextAnswers, fictional: nextFictional, currency: nextCurrency, status, version: { increment: 1 } },
          select: SELECT,
        })
      : await tx.finOnboarding.create({
          data: {
            userId: user.id,
            currency: nextCurrency,
            answers: nextAnswers,
            fictional: nextFictional,
            source: 'manual',
            status,
          },
          select: SELECT,
        });

    await recordChange(tx, {
      userId: user.id,
      entity: ENTITY,
      entityId: row.id,
      action: existing ? 'correct' : 'create',
      field: existing ? 'answers' : null,
      after: { questions: Object.keys(cleaned), fictional: nextFictional },
    });

    // Resource answers become real rows of the resources table: they are the
    // same object, and copying them would mean two places to correct.
    for (const [key, answer] of Object.entries(cleaned)) {
      const question = asked.get(key);
      if (question.kind !== 'resource' || isSkipped(answer)) continue;
      await upsertResource(tx, user, { question, answer, currency: nextCurrency, status });
    }

    // The fictional starting balance, once: a fictional movement so the
    // fictional budget has something in it, carrying the fictional status that
    // keeps it out of every real total.
    if (nextFictional && !existing?.fictional) {
      await tx.finTransaction.create({
        data: {
          userId: user.id,
          kind: 'income',
          value: FICTIONAL_START.amount,
          currency: FICTIONAL_START.currency,
          occurredAt: new Date(),
          note: 'Budget fictif de départ (onboarding)',
          source: 'computed',
          status: 'fictional',
        },
      });
    }
  });

  return getOnboarding(prisma, { ...user, finCurrency: nextCurrency });
}

// One resource row per onboarding question, corrected rather than duplicated
// when the person goes back and changes their answer. `sourceRef` names the
// question, which is what makes the row traceable to where it came from.
async function upsertResource(tx, user, { question, answer, currency, status }) {
  const sourceRef = `onboarding:${question.key}`;
  const category = await tx.finCategory.findFirst({ where: { key: question.category, userId: null }, select: { id: true } });
  const existing = await tx.finIncome.findFirst({ where: { userId: user.id, sourceRef, deletedAt: null }, select: { id: true } });
  const data = {
    label: standardCategoryByKey(question.category)?.label ?? question.key,
    categoryId: category?.id ?? null,
    value: answer.amount,
    currency,
    frequency: answer.frequency,
    status,
  };

  if (existing) {
    await tx.finIncome.update({ where: { id: existing.id }, data: { ...data, version: { increment: 1 } } });
    await recordChange(tx, { userId: user.id, entity: 'income', entityId: existing.id, action: 'correct', field: 'value', after: answer.amount });
    return;
  }
  const created = await tx.finIncome.create({
    data: { ...data, userId: user.id, startDate: new Date(), source: 'manual', sourceRef },
    select: { id: true },
  });
  await recordChange(tx, { userId: user.id, entity: 'income', entityId: created.id, action: 'create', after: { sourceRef, value: answer.amount } });
}

// "Terminer" — allowed at any completeness, because the client's own buttons
// let someone leave with questions unanswered. It only dates the end, so a
// screen can stop proposing the flow; nothing is locked.
export async function completeOnboarding(prisma, user) {
  const existing = await prisma.finOnboarding.findFirst({ where: { userId: user.id, deletedAt: null }, select: { id: true, completedAt: true } });
  if (!existing) throw new HttpError(404, 'Nothing to complete');
  if (!existing.completedAt) {
    await prisma.$transaction(async (tx) => {
      await tx.finOnboarding.update({ where: { id: existing.id }, data: { completedAt: new Date() } });
      await recordChange(tx, { userId: user.id, entity: ENTITY, entityId: existing.id, action: 'correct', field: 'completedAt', after: true });
    });
  }
  return getOnboarding(prisma, user);
}
