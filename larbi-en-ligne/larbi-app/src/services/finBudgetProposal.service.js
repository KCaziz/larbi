// The automatic distribution of a budget (P6-05): « répartition automatique
// selon l'historique **proposée, jamais imposée** », and the first allocation of
// screens JA03 / JA04.
//
// PROPOSED means exactly that: these functions write nothing. They return
// figures with their source and their observation window, and the person keeps
// every one, changes it, or ignores the lot. There is no preset split in this
// file — the client forbids one (« aucune règle type 50/30/20 imposée »).
//
// Pure functions: the database work is in finBudget.service.js.

import { computed } from './finance/contract.js';
import { monthlyAmount, totalExpenses } from './finance/formulas.js';

// Which of the client's eight families is an obligation the person cannot
// decide not to pay this month, and so becomes a `fixed` envelope. This is a
// DEFAULT for a proposal, nothing more: the person switches an envelope from
// fixed to variable whenever they disagree, and F005 / F006 then follow what
// they said rather than what we guessed.
const FIXED_FAMILIES = new Set(['fixed', 'debt']);
export const kindForFamily = (family) => (FIXED_FAMILIES.has(family) ? 'fixed' : 'variable');

// A budget plans what goes OUT, or what is set aside. Pointing an envelope at an
// income category would be meaningless — one does not budget an expense against
// one's salary — so that single family is refused. Everything else is allowed,
// savings included: « chaque dinar affectable » covers putting money aside.
export const BUDGETABLE_FAMILY_EXCLUSIONS = ['income'];
export const isBudgetableFamily = (family) => !BUDGETABLE_FAMILY_EXCLUSIONS.includes(family);

/**
 * A distribution proposed from what the person actually spent.
 *
 * `rows` is one entry per category, already summed over the window and already
 * filtered to ONE currency by the caller (the engine never converts without a
 * dated rate).
 *
 * The suggested amount is the observed total divided by the number of months
 * observed — stated as such, with both numbers visible, so nobody has to take
 * it on trust. The total itself goes through F003; the division by the window is
 * arithmetic the answer shows rather than a formula of the client's catalogue,
 * and inventing a formula id for it would be worse than saying so.
 */
export function proposeFromHistory(rows, { months, currency, now = new Date() } = {}) {
  if (!Number.isSafeInteger(months) || months < 1) return [];
  return rows
    .filter((row) => row.categoryId && row.total > 0 && isBudgetableFamily(row.family))
    .map((row) => ({
      categoryId: row.categoryId,
      family: row.family,
      label: row.label ?? null,
      kind: kindForFamily(row.family),
      source: 'history',
      moisObserves: months,
      // Rounded to the centime, which is the unit everything is stored in.
      propose: Math.round(row.total / months),
      observe: computed('F003', totalExpenses([{ amount: row.total, currency }], { currency }), {
        inputs: { categorie: row.categoryId, mois_observes: months, total_observe: row.total },
        currency,
        now,
      }),
    }))
    .sort((a, b) => b.propose - a.propose);
}

/**
 * A distribution proposed from what the onboarding already knows (P6-03).
 *
 * This is the bridge the onboarding was waiting for: its declared essential
 * expenses were kept as answers because no table held them, and this is that
 * table. Each expense answer is normalised to the month (F001) and offered as an
 * envelope on the standard category the question already declared.
 *
 * `questions`  the questions this public is asked (so a question nobody was
 *              asked can never produce an envelope)
 * `answers`    the stored answers
 * `categoryIdByKey`  standard category key -> row id, resolved by the caller
 */
export function proposeFromOnboarding(questions, answers, categoryIdByKey, { currency, now = new Date() } = {}) {
  const proposals = [];
  for (const question of questions) {
    if (question.kind !== 'expense') continue;
    const answer = answers?.[question.key];
    if (!answer || answer.skipped || typeof answer.amount !== 'number') continue;
    const monthly = monthlyAmount(answer.amount, answer.frequency);
    // A frequency the engine cannot normalise is reported by the onboarding
    // itself; here it simply produces no proposal rather than a wrong one.
    if (monthly === null) continue;
    const categoryId = categoryIdByKey.get(question.category) ?? null;
    if (!categoryId) continue;
    const family = question.category.split('.')[0];
    if (!isBudgetableFamily(family)) continue;
    proposals.push({
      categoryId,
      family,
      label: null,
      kind: kindForFamily(family),
      source: 'onboarding',
      moisObserves: null,
      propose: monthly,
      // F001 — the declared amount brought back to the month. The snapshot says
      // which question it came from, so the figure is traceable to the sentence
      // the person answered.
      observe: computed('F001', monthly, {
        inputs: { question: question.key, montant_declare: answer.amount, frequence: answer.frequency },
        currency,
        now,
      }),
    });
  }
  return proposals;
}

/**
 * The two sources, merged into one proposal per category.
 *
 * History wins over the onboarding when both know a category: what somebody
 * actually spent is a measurement, what they estimated at sign-up is a guess,
 * and the answer still says which source each line came from.
 */
export function mergeProposals(history, onboarding) {
  const byCategory = new Map();
  for (const line of onboarding) byCategory.set(line.categoryId, line);
  for (const line of history) byCategory.set(line.categoryId, line);
  return [...byCategory.values()].sort((a, b) => b.propose - a.propose);
}
