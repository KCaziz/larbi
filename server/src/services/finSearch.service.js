// Global search (P6-20): lexical search across this account's OWN financial
// data, plus a small configured synonym expansion. No generative
// interpretation anywhere — every result traces back to a literal `contains`
// match on a term the query itself (or its declared synonyms) produced.
import { SEARCH_RESULTS_MAX, SEARCH_SYNONYMS } from '../constants/finSearch.js';
import { normalise } from './finAssistant.service.js';

const escapeLike = (text) => text.replace(/[\\%_]/g, '\\$&');

// The query, tokenised on whitespace (kept in the person's own spelling, so
// the DB comparison still sees the accents they typed) and expanded with its
// configured synonyms — looked up on the NORMALISED form, in both
// directions, so searching "crédit" also finds a transaction noted "dette"
// and vice versa.
export function expandTerms(query) {
  const rawTokens = String(query ?? '').trim().split(/\s+/).filter((t) => t.length >= 2);
  const terms = new Set(rawTokens);
  for (const token of rawTokens) {
    const key = normalise(token);
    if (SEARCH_SYNONYMS[key]) for (const synonym of SEARCH_SYNONYMS[key]) terms.add(synonym);
    for (const [otherKey, synonyms] of Object.entries(SEARCH_SYNONYMS)) {
      if (synonyms.some((s) => normalise(s) === key)) {
        terms.add(otherKey);
        for (const synonym of synonyms) terms.add(synonym);
      }
    }
  }
  return [...terms].map(escapeLike);
}

const containsAny = (field, terms) => terms.map((term) => ({ [field]: { contains: term } }));

/**
 * "Mes données": this account's own transactions, budgets and debts — never
 * another account's, and never a space's shared rows (those are P6-14's own
 * screen, with their own membership check; merging them here would need the
 * same visibility rules this file has no reason to duplicate).
 */
export async function searchMyData(prisma, userId, query) {
  const terms = expandTerms(query);
  if (terms.length === 0) return { transactions: [], budgets: [], debts: [] };

  const [transactions, budgets, debts] = await Promise.all([
    prisma.finTransaction.findMany({
      where: { userId, deletedAt: null, OR: [...containsAny('note', terms), ...containsAny('subcategory', terms)] },
      select: { id: true, note: true, subcategory: true, value: true, currency: true, occurredAt: true, kind: true },
      orderBy: { occurredAt: 'desc' },
      take: SEARCH_RESULTS_MAX,
    }),
    prisma.finBudget.findMany({
      where: { userId, deletedAt: null, OR: containsAny('label', terms) },
      select: { id: true, label: true, periodStart: true, periodEnd: true },
      take: SEARCH_RESULTS_MAX,
    }),
    prisma.finDebt.findMany({
      where: { userId, deletedAt: null, OR: [...containsAny('label', terms), ...containsAny('lender', terms)] },
      select: { id: true, label: true, lender: true },
      take: SEARCH_RESULTS_MAX,
    }),
  ]);
  return { transactions, budgets, debts };
}

// "Objectifs": this account's own personal goals (P6-08). Common/space goals
// (P6-15) are not included: their visibility follows space membership, a
// different rule this file would otherwise have to duplicate.
export async function searchGoals(prisma, userId, query) {
  const terms = expandTerms(query);
  if (terms.length === 0) return [];
  return prisma.finGoal.findMany({
    where: { userId, deletedAt: null, OR: containsAny('label', terms) },
    select: { id: true, label: true, target: true, currency: true },
    take: SEARCH_RESULTS_MAX,
  });
}
