import { REQUIRED_PIECES } from '../constants/finTrade.js';
import { computed } from './finance/contract.js';
import { creditNotesOf, isIssuedInvoice } from './finBusinessView.service.js';
import { stockLots } from './finBusinessPilot.service.js';

/**
 * Micro-import and international trade (P13-05, lot D, 2026-11-24), in PURE
 * functions: the landed cost, the margin of an operation, the completeness of
 * its file, an exchange-rate scenario.
 *
 * Two rules hold everywhere:
 * - no sum of currencies before conversion, and no conversion without a rate
 *   that is dated and sourced (DEC-015, CNV-10). A missing rate makes the
 *   total « not computable », never a guess;
 * - duties are what the customs notice says (DEC-014): declared as a cost,
 *   never computed from a tariff. Their absence is said, not filled with zero.
 */

// The minor units of a currency (DZD 2, JPY 0, KWD 3): amounts are stored in
// minor units of their own currency, so a conversion goes through units.
export function fractionDigits(currency) {
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits;
  } catch {
    return 2;
  }
}

/**
 * Converts `amount` (minor units of `from`) into minor units of `to`, at
 * `rate` = how many `to` for one `from`. Same currency: unchanged. Another
 * currency without a rate: null.
 */
export function convert(amount, from, to, rate) {
  if (from === to) return amount;
  if (!rate || rate <= 0) return null;
  return Math.round((amount / 10 ** fractionDigits(from)) * rate * 10 ** fractionDigits(to));
}

/** The landed cost of an operation, line by line, in the organisation's currency. */
export function landedCost({ costs = [], base, netUnits = null }) {
  const lines = costs.map((cost) => ({ ...cost, converted: convert(cost.amount, cost.currency, base, cost.rate) }));
  const missingRates = lines.filter((line) => line.converted === null).length;
  const total = lines.length === 0 || missingRates > 0 ? null : lines.reduce((sum, line) => sum + line.converted, 0);
  const paid = lines.filter((line) => line.paidAt && line.converted !== null).reduce((sum, line) => sum + line.converted, 0);
  const byKind = {};
  for (const line of lines) if (line.converted !== null) byKind[line.kind] = (byKind[line.kind] ?? 0) + line.converted;
  return {
    lines,
    total,
    // CAL-0054: total / net units, strictly positive.
    unit: total !== null && netUnits !== null && netUnits > 0 ? Math.round(total / netUnits) : null,
    missingRates,
    dutiesDeclared: costs.some((cost) => cost.kind === 'duties'),
    // CNV-09: an engaged cost is not a payment.
    engaged: total,
    paid,
  };
}

/** The file: which expected documents are accepted, and whether it is ready. */
export function fileState(kind, pieces = []) {
  const required = REQUIRED_PIECES[kind] ?? [];
  const accepted = required.filter((key) => pieces.some((p) => p.kind === key && p.status === 'accepted'));
  return {
    required: required.length,
    accepted: accepted.length,
    ratio: required.length === 0 ? null : accepted.length / required.length,
    ready: required.length > 0 && accepted.length === required.length,
    missing: required.filter((key) => !accepted.includes(key)),
  };
}

/**
 * The view of one operation: landed cost, the lot it made, its sales, its
 * margin (CAL-0040: net sales − landed cost of the units sold), its file.
 */
export function operationView({ operation, costs = [], pieces = [], moves = [], documents = [], base, now = new Date() }) {
  // The lots this operation's reception made, with what was drawn from them.
  // Each movement once: a loss of the reception is both « of the operation »
  // and « drawn from its lot », and must not be counted twice.
  const unique = [...new Map(moves.map((m) => [m.id, m])).values()];
  const entries = unique.filter((m) => m.kind === 'in' && m.operationId === operation.id);
  const ids = new Set(entries.map((m) => m.id));
  const lots = stockLots([...entries, ...unique.filter((m) => m.kind !== 'in' && ids.has(m.lotId))]);
  const netUnits = lots.length > 0 ? lots.reduce((sum, lot) => sum + lot.net, 0) : null;
  const cost = landedCost({ costs, base, netUnits });

  const sales = documents.filter((d) => d.operationId === operation.id && d.kind === 'sale' && isIssuedInvoice(d) && d.currency === base);
  const revenue = sales.length === 0 ? null : sales.reduce((sum, d) => sum + d.amountExcl - creditNotesOf(d, documents).reduce((s, c) => s + c.amountExcl, 0), 0);
  const unitsSold = lots.reduce((sum, lot) => sum + lot.outs, 0);
  let costOfSold = null;
  if (lots.length > 0) costOfSold = cost.unit === null ? null : Math.round(unitsSold * cost.unit);
  else costOfSold = cost.total;
  const margin = revenue === null || costOfSold === null ? null : revenue - costOfSold;

  const file = fileState(operation.kind, pieces);
  const inputs = { devise: base, devise_operation: operation.currency, couts: costs.length, cours_manquants: cost.missingRates, droits_declares: cost.dutiesDeclared };
  return {
    // Without a duties line, the screen says « excluding duties » (DEC-014):
    // `droitsDeclares` below, never a zero slipped into the total.
    coutRendu: computed('E025', cost.total, { inputs, currency: base, now }),
    coutUnitaire: computed('E026', cost.unit, { inputs: { ...inputs, unites_nettes: netUnits }, currency: base, now }),
    marge: computed('E027', margin, { inputs: { ...inputs, ventes: sales.length, unites_vendues: unitsSold }, currency: base, now }),
    dossier: { ...file, completude: computed('E028', file.ratio, { inputs: { attendues: file.required, acceptees: file.accepted }, currency: base, now }) },
    lignes: cost.lines,
    engage: cost.engaged,
    paye: cost.paid,
    droitsDeclares: cost.dutiesDeclared,
    lots,
    ventes: revenue,
  };
}

/**
 * ECR-0365: the effect of a change of the rates on the landed cost, the unit
 * cost and the unit margin. Stressed rate = rate × (1 + variation). Nothing is
 * created or changed (CNV-12).
 */
export function fxScenario({ costs = [], base, variation, netUnits = null, unitPrice = null, unitSellingCost = 0, now = new Date() }) {
  const reference = landedCost({ costs, base, netUnits });
  const stressedCosts = costs.map((cost) => (cost.currency === base ? cost : { ...cost, rate: cost.rate ? cost.rate * (1 + variation) : null }));
  const stressed = landedCost({ costs: stressedCosts, base, netUnits });
  const delta = reference.total === null || stressed.total === null ? null : stressed.total - reference.total;
  const unitMargin = (unit) => (unit === null || unitPrice === null ? null : unitPrice - unit - (unitSellingCost ?? 0));
  const inputs = { devise: base, variation, cours_manquants: reference.missingRates };
  return {
    variation,
    reference: { total: reference.total, unitaire: reference.unit, margeUnitaire: unitMargin(reference.unit) },
    scenario: { total: stressed.total, unitaire: stressed.unit, margeUnitaire: unitMargin(stressed.unit) },
    effet: computed('E029', delta, { inputs, currency: base, now }),
  };
}
