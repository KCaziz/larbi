// The pure side of shared expenses (P6-14): the split, the balances and the
// settlement plan. No database, no clock of its own.
//
// Three rules the client states, applied here so no caller has to remember
// them:
//
//   1. THE SHARES ADD UP TO THE AMOUNT, EXACTLY — whatever the mode. The
//      rounding rule is documented and published by the API.
//   2. THE PAYER MAY NOT PARTICIPATE. Somebody can pay for the others without
//      owing anything, which is why the shares are a table and not a column.
//   3. MINIMISING THE TRANSFERS NEVER CHANGES ANYBODY'S NET DEBT. ALG-02
//      reduces the NUMBER of payments; that invariant is asserted here rather
//      than trusted, because a "simplification" that moved money between
//      people would be a different debt.

import { PARTICIPANTS_MAX, PERCENT_SCALE, SPLIT_MODES } from '../constants/finShared.js';
import { HttpError } from '../utils/httpError.js';
import { minimalSettlements } from './finance/algorithms.js';
import { computed } from './finance/contract.js';
import { equalShare, incomeProportionalShare, sharedMemberBalance } from './finance/formulas.js';

/**
 * The shares of one expense, whatever the mode — and they add up to the amount.
 *
 * `participants` is a list of `{ memberId, weight? }` in the order the person
 * gave them, which is also the order the rounding rule breaks ties in. The
 * weights mean something different in each mode, and each mode says what it
 * needs.
 */
export function computeShares({ mode, amount, participants, incomes = null }) {
  if (!SPLIT_MODES.includes(mode)) throw new HttpError(422, 'Unknown split mode', { reason: 'unknownSplitMode' });
  if (participants.length === 0) throw new HttpError(422, 'A shared expense needs at least one participant', { reason: 'noParticipant' });
  if (participants.length > PARTICIPANTS_MAX) throw new HttpError(422, 'Too many participants', { reason: 'tooManyParticipants' });

  if (mode === 'equal') {
    // F041 — the amount over the participants, every centime placed.
    const shares = equalShare(amount, participants.length);
    return participants.map((participant, index) => ({ ...participant, share: shares[index], weight: null }));
  }

  if (mode === 'amounts') {
    // Typed one by one. The client's rule is checked, never patched: adjusting
    // somebody's figure silently would be worse than refusing the request.
    const total = participants.reduce((sum, participant) => sum + (participant.weight ?? 0), 0);
    if (total !== amount) {
      throw new HttpError(422, 'The shares do not add up to the amount', { reason: 'sharesMismatch', total, amount });
    }
    return participants.map((participant) => ({ ...participant, share: participant.weight, weight: null }));
  }

  if (mode === 'percent') {
    const total = participants.reduce((sum, participant) => sum + (participant.weight ?? 0), 0);
    if (total !== PERCENT_SCALE) {
      throw new HttpError(422, 'The percentages do not add up to 100 %', { reason: 'percentMismatch', total, expected: PERCENT_SCALE });
    }
    const shares = incomeProportionalShare(
      amount,
      participants.map((participant) => participant.weight),
    );
    return participants.map((participant, index) => ({ ...participant, share: shares[index], weight: participant.weight }));
  }

  // income_proportional — F042 proper. The incomes come from the caller, which
  // is also where the consent was checked (see incomesForSplit).
  if (!incomes) throw new HttpError(422, 'The income split needs the participants incomes', { reason: 'incomesMissing' });
  const weights = participants.map((participant) => incomes.get(participant.memberId) ?? null);
  if (weights.some((weight) => weight === null)) {
    throw new HttpError(422, 'An income is missing for this split', { reason: 'incomesMissing' });
  }
  if (weights.reduce((sum, weight) => sum + weight, 0) === 0) {
    // Every participant declares nothing: a proportional split has no meaning,
    // and dividing by a total income of zero would be an invented answer.
    throw new HttpError(422, 'No declared income to split in proportion to', { reason: 'incomesZero' });
  }
  const shares = incomeProportionalShare(amount, weights);
  return participants.map((participant, index) => ({ ...participant, share: shares[index], weight: weights[index] }));
}

/**
 * The balance of every member of a space (F043).
 *
 * Sign convention, published by the API and repeated here because it is the one
 * thing a reader must never have to guess: POSITIVE means the group owes money
 * TO the member.
 *
 * The balances of a space always add up to zero, by construction: every expense
 * puts its full amount on its payer and the same total back on its
 * participants, and every settlement moves one amount between two members.
 */
export function buildBalances({ members, expenses = [], settlements = [], currency, now = new Date() }) {
  const paidForGroup = new Map();
  const shareDue = new Map();
  const received = new Map();
  const paid = new Map();
  for (const member of members) {
    paidForGroup.set(member.id, 0);
    shareDue.set(member.id, 0);
    received.set(member.id, 0);
    paid.set(member.id, 0);
  }

  const add = (map, key, amount) => {
    if (!map.has(key)) return;
    map.set(key, map.get(key) + amount);
  };

  for (const expense of expenses) {
    add(paidForGroup, expense.payerId, expense.value);
    for (const share of expense.shares) add(shareDue, share.memberId, share.share);
  }
  for (const settlement of settlements) {
    // F043's own last two terms: the one who pays reduces what they owe, the
    // one who is paid reduces what they are owed.
    add(paid, settlement.fromId, settlement.value);
    add(received, settlement.toId, settlement.value);
  }

  return members.map((member) => {
    const inputs = {
      membre: member.id,
      paye_pour_le_groupe: paidForGroup.get(member.id),
      quote_part_due: shareDue.get(member.id),
      reglements_recus: received.get(member.id),
      reglements_verses: paid.get(member.id),
    };
    return {
      memberId: member.id,
      userId: member.userId,
      name: member.displayName ?? member.user?.name ?? null,
      parti: member.leftAt !== null,
      // The four terms, so the figure can be taken apart rather than trusted.
      composition: inputs,
      solde: computed(
        'F043',
        sharedMemberBalance({
          paidForGroup: paidForGroup.get(member.id),
          shareDue: shareDue.get(member.id),
          settlementsReceived: received.get(member.id),
          settlementsPaid: paid.get(member.id),
        }),
        { inputs, currency, now },
      ),
    };
  });
}

/**
 * « Qui doit quoi à qui », with the fewest transfers (ALG-02).
 *
 * And the assertion that matters: minimising changes the NUMBER of payments,
 * never anybody's net position. Verified here rather than trusted — the client
 * states it as a requirement, and a plan that quietly moved money between two
 * people would be a different debt wearing the same name.
 */
export function settlementPlan(balances, { currency, now = new Date() } = {}) {
  const entries = balances
    .filter((row) => row.solde.resultat !== null && row.solde.resultat !== 0)
    .map((row) => ({ member: row.memberId, balance: row.solde.resultat }));

  if (entries.length === 0) {
    // Nothing to settle is a real answer, and a different one from "we could
    // not work it out".
    return { transferts: [], equilibre: true, algorithme: 'ALG-02', avertissements: [] };
  }

  const transfers = minimalSettlements(entries);
  if (transfers === null) {
    // ALG-02 refuses a set whose balances do not add up to zero. That should be
    // impossible here, so it is REPORTED rather than hidden: it would mean the
    // stored expenses and settlements no longer agree with each other.
    return {
      transferts: null,
      equilibre: false,
      algorithme: 'ALG-02',
      avertissements: ['Les soldes de cet espace ne s’annulent pas : aucun plan de remboursement n’est proposé tant que ce n’est pas corrigé.'],
    };
  }

  // The invariant, verified: each member's net movement under the plan equals
  // exactly what their balance said.
  const net = new Map(entries.map((entry) => [entry.member, 0]));
  for (const transfer of transfers) {
    net.set(transfer.from, (net.get(transfer.from) ?? 0) + transfer.amount);
    net.set(transfer.to, (net.get(transfer.to) ?? 0) - transfer.amount);
  }
  const drift = entries.filter((entry) => (net.get(entry.member) ?? 0) !== -entry.balance);
  if (drift.length > 0) {
    // A programming error, not user data: fail loudly rather than present a
    // plan that changes what people owe.
    throw new Error('ALG-02 changed a net position, which it must never do');
  }

  return {
    transferts: transfers.map((transfer) => ({
      from: transfer.from,
      to: transfer.to,
      amount: transfer.amount,
      // The plan is a computed answer, not a list somebody typed, so each
      // transfer carries the contract too.
      montant: computed('ALG-02', transfer.amount, { inputs: { de: transfer.from, vers: transfer.to, soldes: entries }, currency, now }),
    })),
    equilibre: true,
    algorithme: 'ALG-02',
    avertissements: [],
  };
}
