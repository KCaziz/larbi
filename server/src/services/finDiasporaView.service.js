import { computed } from './finance/contract.js';
import { convert } from './finTradeView.service.js';

/**
 * The diaspora (P13-05, lot E, 2026-11-24), in PURE functions: the figures of
 * a project followed from abroad, and the consolidated patrimony.
 *
 * - An expense counts as realised only when VALIDATED (justified, then
 *   accepted by another person: DEC-018, CNV-13); declared is not paid.
 * - Progress is the accepted milestones, weighted — never the money spent.
 * - No sum of currencies without a dated rate (CNV-10): a missing rate makes
 *   the total « not computable ».
 */

const sum = (rows, pick) => rows.reduce((total, row) => total + pick(row), 0);

export function projectView({ project, expenses = [], milestones = [], now = new Date() }) {
  const currency = project.currency;
  // Each expense into the project's currency, at its own dated rate.
  const lines = expenses.map((e) => ({ ...e, converted: convert(e.amount, e.currency, currency, e.rate) }));
  const live = lines.filter((e) => e.status !== 'rejected');
  const validated = live.filter((e) => e.status === 'validated');
  const missingRates = live.filter((e) => e.converted === null).length;
  const computable = (rows) => rows.every((e) => e.converted !== null);

  const realised = computable(validated) ? sum(validated, (e) => e.converted) : null;
  const declared = computable(live) ? sum(live, (e) => e.converted) : null;
  const paid = computable(validated) ? sum(validated.filter((e) => e.paidAt), (e) => e.converted) : null;
  const remaining = realised === null ? null : project.budget - realised;
  const justified = declared === null || declared === 0 ? null : realised / declared;
  const toFinance = remaining === null ? null : Math.max(0, remaining - project.fundsConfirmed);

  const weights = sum(milestones.filter((m) => m.status !== 'rejected'), (m) => m.weight);
  const accepted = sum(milestones.filter((m) => m.status === 'accepted'), (m) => m.weight);
  const progress = weights === 0 ? null : accepted / weights;

  const today = new Date(now.toISOString().slice(0, 10));
  const late = milestones.filter((m) => m.dueAt && new Date(m.dueAt) < today && m.status !== 'accepted');
  const inputs = { devise: currency, depenses: live.length, validees: validated.length, cours_manquants: missingRates };

  return {
    realise: computed('E030', realised, { inputs, currency, now }),
    reste: computed('E031', remaining, { inputs: { ...inputs, budget: project.budget }, currency, now }),
    justifie: computed('E032', justified, { inputs, currency, now }),
    avancement: computed('E033', progress, { inputs: { jalons: milestones.length, poids_acceptes: accepted, poids_total: weights }, currency, now }),
    aFinancer: computed('E034', toFinance, { inputs: { ...inputs, fonds_confirmes: project.fundsConfirmed }, currency, now }),
    // Three statuses kept apart (CNV-13): declared, validated, paid.
    declare: declared,
    paye: paid,
    aJustifier: live.filter((e) => e.status === 'to_justify').length,
    enAttente: live.filter((e) => e.status === 'submitted').length,
    jalonsEnRetard: late.length,
    lignes: lines,
  };
}

/**
 * The patrimony across countries: the latest valuation of each holding, its
 * mode (declared, estimated, verified), and the consolidated net in the
 * organisation's currency — only with a dated rate for each foreign value.
 */
export function patrimonyView({ holdings = [], base, now = new Date() }) {
  const rows = holdings
    .filter((h) => !h.archivedAt)
    .map((holding) => {
      const values = [...(holding.values ?? [])].sort((a, b) => new Date(b.valuedAt) - new Date(a.valuedAt) || new Date(b.createdAt) - new Date(a.createdAt));
      const latest = values[0] ?? null;
      return {
        ...holding,
        values,
        latest,
        converted: latest ? convert(latest.value, holding.currency, base, latest.rate) : null,
      };
    });
  const valued = rows.filter((r) => r.latest);
  const missingRates = valued.filter((r) => r.converted === null).length;
  const assets = valued.filter((r) => r.kind === 'asset');
  const debts = valued.filter((r) => r.kind === 'debt');
  const net = valued.length === 0 || missingRates > 0 ? null : sum(assets, (r) => r.converted) - sum(debts, (r) => r.converted);

  // By country and currency, in their own currency: never summed across currencies.
  const groups = new Map();
  for (const r of valued) {
    const key = `${r.country}|${r.currency}`;
    const group = groups.get(key) ?? { country: r.country, currency: r.currency, assets: 0, debts: 0 };
    if (r.kind === 'asset') group.assets += r.latest.value;
    else group.debts += r.latest.value;
    groups.set(key, group);
  }
  const byMode = { declared: 0, estimated: 0, verified: 0 };
  for (const r of valued) byMode[r.latest.mode] += 1;

  return {
    lignes: rows,
    parPays: [...groups.values()].map((g) => ({ ...g, net: g.assets - g.debts })),
    parMode: byMode,
    net: computed('E035', net, { inputs: { devise: base, biens: assets.length, dettes: debts.length, cours_manquants: missingRates }, currency: base, now }),
  };
}
