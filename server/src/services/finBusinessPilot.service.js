import { CASH_FLOOR, CASH_PLAN_WEEKS, DEFAULT_COST_NATURE } from '../constants/finBusiness.js';
import { computed } from './finance/contract.js';
import { creditNotesOf, documentSettlement, documentTotal, isIssuedInvoice } from './finBusinessView.service.js';

/**
 * Piloter l'organisation (P13-05, lot C, 2026-11-23) : stock par lot, besoin
 * en fonds de roulement, délais clients et fournisseurs, seuil de
 * rentabilité, budget, trésorerie disponible et à 13 semaines.
 *
 * Fonctions PURES, comme finBusinessView.service.js : des lignes entrent, des
 * réponses du moteur sortent. `null` reste « non calculable », jamais zéro
 * (CNV-04), et chaque condition non remplie le dit.
 *
 * Ce sont des chiffres de GESTION. Aucun ne suppose le plan comptable (SCF) :
 * le stock est valorisé lot par lot, à son propre coût (CNV-16), sans méthode
 * de valorisation supposée (P7-04).
 */

const DAY = 86400000;
const active = (row) => !row.archivedAt && !row.deletedAt;
const dayStart = (date) => new Date(new Date(date).toISOString().slice(0, 10));
const round = (value) => Math.round(value);
const round3 = (value) => Math.round(value * 1000) / 1000;
const monthOf = (date) => new Date(date).toISOString().slice(0, 7);

// ---- stock (CNV-16) -----------------------------------------------------------

/**
 * Les lots, chacun avec ce qu'il en reste et ce qu'il vaut.
 * Quantité nette = reçue - pertes ; coût unitaire = coût total / quantité
 * nette (une perte renchérit les unités qui restent : c'est la règle du
 * client) ; reste = nette - sorties.
 */
export function stockLots(moves = []) {
  const lots = moves
    .filter((m) => m.kind === 'in')
    .map((m) => ({ id: m.id, itemId: m.itemId, lotRef: m.lotRef ?? null, movedAt: m.movedAt, received: m.quantity, totalCost: m.totalCost, losses: 0, outs: 0 }));
  const byId = new Map(lots.map((lot) => [lot.id, lot]));
  for (const move of moves) {
    if (move.kind === 'in') continue;
    const lot = byId.get(move.lotId);
    if (!lot) continue;
    if (move.kind === 'loss') lot.losses += move.quantity;
    else lot.outs += move.quantity;
  }
  return lots.map((lot) => {
    const net = round3(lot.received - lot.losses);
    const unitCost = net > 0 ? lot.totalCost / net : null;
    const remaining = round3(net - lot.outs);
    return {
      ...lot,
      net,
      unitCost: unitCost === null ? null : round(unitCost),
      remaining,
      value: unitCost === null ? null : round(Math.max(0, remaining) * unitCost),
      // Taux d'avaries : unités perdues / unités reçues.
      lossRate: lot.received > 0 ? lot.losses / lot.received : null,
    };
  });
}

export function stockValue(lots) {
  const valued = lots.filter((lot) => lot.value !== null && lot.remaining > 0);
  if (lots.length === 0) return null;
  return valued.reduce((sum, lot) => sum + lot.value, 0);
}

// ---- documents de la période ----------------------------------------------------

const natureOf = (document) => document.costNature ?? (document.category ? DEFAULT_COST_NATURE[document.category] : null);

/** Le hors taxe d'une facture, net de ses avoirs. */
const netExcl = (document, documents) => document.amountExcl - creditNotesOf(document, documents).reduce((sum, c) => sum + c.amountExcl, 0);

function periodOf({ from, to, now }) {
  const end = to ? new Date(to) : now;
  const start = from ? new Date(from) : new Date(end.getTime() - 90 * DAY);
  return { start, end, days: Math.max(1, Math.round((end - start) / DAY)) };
}

/**
 * Tous les chiffres de pilotage. `documents` et `payments` sont TOUS ceux de
 * l'organisation (les soldes ne dépendent pas de la période choisie) ; la
 * période ne choisit que les ventes et achats dont on parle.
 */
export function pilotFigures({ business, documents = [], payments = [], moves = [], budgets = [], cashPositions = [], now = new Date(), from = null, to = null }) {
  const currency = business.currency;
  const all = documents.filter(active).filter((d) => d.currency === currency);
  const livePayments = payments.filter(active).filter((p) => p.currency === currency);
  const invoices = all.filter(isIssuedInvoice);
  const period = periodOf({ from, to, now });
  const inPeriod = (date) => new Date(date) >= period.start && new Date(date) <= period.end;

  const settled = invoices.map((document) => ({ document, settlement: documentSettlement(document, livePayments, all) }));
  const outstanding = (kind) => settled.filter((r) => r.document.kind === kind && r.settlement.outstanding > 0).reduce((sum, r) => sum + r.settlement.outstanding, 0);
  const hasOpen = (kind) => settled.some((r) => r.document.kind === kind && r.settlement.outstanding > 0);
  const receivables = hasOpen('sale') ? outstanding('sale') : null;
  const payables = hasOpen('purchase') ? outstanding('purchase') : null;

  // Stock.
  const lots = stockLots(moves);
  const stock = stockValue(lots);

  // E016 : BFR simplifié = stock + clients - fournisseurs.
  const known = [stock, receivables, payables].filter((v) => v !== null).length;
  const bfr = known === 0 ? null : (stock ?? 0) + (receivables ?? 0) - (payables ?? 0);

  // E017 / E018 : délais, sur les ventes et achats émis dans la période.
  const periodSales = invoices.filter((d) => d.kind === 'sale' && inPeriod(d.issuedAt));
  const periodPurchases = invoices.filter((d) => d.kind === 'purchase' && inPeriod(d.issuedAt));
  const salesTotal = periodSales.reduce((sum, d) => sum + documentTotal(d), 0);
  const purchasesTotal = periodPurchases.reduce((sum, d) => sum + documentTotal(d), 0);
  const clientDays = salesTotal > 0 ? Math.round(((receivables ?? 0) / salesTotal) * period.days) : null;
  const supplierDays = purchasesTotal > 0 ? Math.round(((payables ?? 0) / purchasesTotal) * period.days) : null;

  // Charges par famille, hors taxe et nettes des avoirs.
  const families = new Map();
  for (const d of periodPurchases) {
    const key = d.category ?? 'unclassified';
    families.set(key, (families.get(key) ?? 0) + netExcl(d, all));
  }
  const chargesByFamily = [...families.entries()].map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);

  // E019 : seuil de rentabilité = charges fixes / (1 - variables / CA).
  const revenue = periodSales.reduce((sum, d) => sum + netExcl(d, all), 0);
  const fixed = periodPurchases.filter((d) => natureOf(d) === 'fixed').reduce((sum, d) => sum + netExcl(d, all), 0);
  const variable = periodPurchases.filter((d) => natureOf(d) === 'variable').reduce((sum, d) => sum + netExcl(d, all), 0);
  const unclassified = periodPurchases.filter((d) => natureOf(d) === null).length;
  const contribution = revenue > 0 ? 1 - variable / revenue : null;
  const breakEven = fixed > 0 && contribution !== null && contribution > 0 ? round(fixed / contribution) : null;

  // E020 : part du premier client.
  const byClient = new Map();
  for (const d of periodSales) if (d.contactId) byClient.set(d.contactId, (byClient.get(d.contactId) ?? 0) + netExcl(d, all));
  const top = Math.max(0, ...byClient.values());
  const concentration = byClient.size > 0 && revenue > 0 ? top / revenue : null;

  // Budget du mois : réel - budget, par famille (E021).
  const month = monthOf(to ?? now);
  const budgetRows = budgets
    .filter((b) => b.month === month)
    .map((b) => {
      const real = invoices
        .filter((d) => d.kind === 'purchase' && d.category === b.category && monthOf(d.issuedAt) === month)
        .reduce((sum, d) => sum + netExcl(d, all), 0);
      return { category: b.category, budget: b.amount, real, gap: real - b.amount };
    });
  const budgetGap = budgetRows.length === 0 ? null : budgetRows.reduce((sum, r) => sum + r.gap, 0);

  // E022 : trésorerie disponible, depuis le dernier solde constaté.
  const cash = cashAvailable({ cashPositions, payments: livePayments, invoices: all, now });

  // E023 : autonomie = trésorerie / consommation nette mensuelle (3 mois).
  const since = new Date(now.getTime() - 90 * DAY);
  const directionOf = new Map(all.map((d) => [d.id, d.kind]));
  let inflow = 0;
  let outflow = 0;
  for (const p of livePayments) {
    if (new Date(p.receivedAt) < since || new Date(p.receivedAt) > now) continue;
    if (directionOf.get(p.documentId) === 'sale') inflow += p.value;
    else if (directionOf.get(p.documentId) === 'purchase') outflow += p.value;
  }
  const burn = (outflow - inflow) / 3;
  const runway = cash.amount !== null && burn > 0 ? Math.round((cash.amount / burn) * 10) / 10 : null;

  const inputs = { devise: currency, periode_jours: period.days };
  return {
    stock: computed('E015', stock, { inputs: { ...inputs, lots: lots.length }, currency, now }),
    bfr: computed('E016', bfr, {
      inputs: { ...inputs, stock_connu: stock !== null, creances_connues: receivables !== null, dettes_connues: payables !== null },
      currency,
      now,
    }),
    delaiClients: computed('E017', clientDays, { inputs: { ...inputs, ventes: periodSales.length }, currency, now }),
    delaiFournisseurs: computed('E018', supplierDays, { inputs: { ...inputs, achats: periodPurchases.length }, currency, now }),
    seuil: computed('E019', breakEven, {
      inputs: { ...inputs, charges_fixes: fixed, charges_variables: variable, achats_non_classes: unclassified },
      currency,
      now,
    }),
    concentration: computed('E020', concentration, { inputs: { ...inputs, clients: byClient.size }, currency, now }),
    budget: computed('E021', budgetGap, { inputs: { ...inputs, mois: month, familles_budgetees: budgetRows.length }, currency, now }),
    tresorerieDisponible: computed('E022', cash.amount, { inputs: { ...inputs, solde_constate: cash.observedAt !== null }, currency, now }),
    autonomie: computed('E023', runway, { inputs: { ...inputs, solde_constate: cash.observedAt !== null, consommation_mensuelle: Math.round(burn) }, currency, now }),
    chargesParFamille: chargesByFamily,
    budgetMois: { mois: month, lignes: budgetRows },
  };
}

/** Le dernier solde constaté, plus ce qui est entré et sorti depuis. */
export function cashAvailable({ cashPositions = [], payments = [], invoices = [], now = new Date() }) {
  const position = cashPositions
    .filter((p) => new Date(p.observedAt) <= now)
    .sort((a, b) => new Date(b.observedAt) - new Date(a.observedAt))[0];
  if (!position) return { amount: null, observedAt: null };
  const directionOf = new Map(invoices.map((d) => [d.id, d.kind]));
  let amount = position.amount;
  for (const p of payments) {
    const at = new Date(p.receivedAt);
    if (at <= new Date(position.observedAt) || at > now) continue;
    if (directionOf.get(p.documentId) === 'sale') amount += p.value;
    else if (directionOf.get(p.documentId) === 'purchase') amount -= p.value;
  }
  return { amount, observedAt: position.observedAt };
}

// ---- trésorerie à 13 semaines --------------------------------------------------

/**
 * Le plan de trésorerie à 13 semaines : le solde disponible, puis chaque
 * semaine ce qui doit entrer (factures de vente à leur échéance) et sortir
 * (factures d'achat à leur échéance, et ce qui reste des budgets du mois).
 *
 * - Une facture échue non réglée est placée en première semaine, et signalée.
 * - Une facture sans échéance n'est placée nulle part : elle est comptée à part.
 * - `retardClients` (jours) décale les encaissements : un scénario, qui ne
 *   crée ni ne modifie rien (CNV-12).
 * Sans solde de départ, rien n'est projeté : le plan l'exige (TST-00030).
 */
export function cashPlan({ business, documents = [], payments = [], budgets = [], cashPositions = [], now = new Date(), clientDelayDays = 0, floor = CASH_FLOOR }) {
  const currency = business.currency;
  const all = documents.filter(active).filter((d) => d.currency === currency);
  const livePayments = payments.filter(active).filter((p) => p.currency === currency);
  const invoices = all.filter(isIssuedInvoice);
  const cash = cashAvailable({ cashPositions, payments: livePayments, invoices: all, now });
  const inputs = { devise: currency, solde_constate: cash.observedAt !== null, retard_clients_jours: clientDelayDays };
  if (cash.amount === null) {
    return { depart: null, semaines: [], enRetard: null, sansEcheance: null, besoin: computed('E024', null, { inputs, currency, now }) };
  }

  const start = dayStart(now);
  const weeks = Array.from({ length: CASH_PLAN_WEEKS }, (_, i) => ({
    debut: new Date(start.getTime() + i * 7 * DAY),
    fin: new Date(start.getTime() + (i + 1) * 7 * DAY - 1),
    encaissements: 0,
    decaissements: 0,
    chargesPrevues: 0,
  }));
  const horizonEnd = weeks[weeks.length - 1].fin;
  const weekOf = (date) => Math.floor((dayStart(date) - start) / (7 * DAY));
  const late = { encaissements: 0, decaissements: 0 };
  const noDue = { encaissements: 0, decaissements: 0 };

  for (const document of invoices) {
    const left = documentSettlement(document, livePayments, all).outstanding;
    if (left <= 0) continue;
    const field = document.kind === 'sale' ? 'encaissements' : 'decaissements';
    if (!document.dueAt) {
      noDue[field] += left;
      continue;
    }
    let due = new Date(document.dueAt);
    if (document.kind === 'sale' && clientDelayDays) due = new Date(due.getTime() + clientDelayDays * DAY);
    let index = weekOf(due);
    if (index < 0) {
      late[field] += left;
      index = 0;
    }
    if (index < weeks.length) weeks[index][field] += left;
  }

  // Ce qui reste des budgets, réparti jour par jour sur le mois, à partir
  // d'aujourd'hui. Le réel déjà enregistré dans la famille en est déduit :
  // une facture de loyer saisie n'est pas comptée deux fois.
  for (const budget of budgets) {
    const [y, m] = budget.month.split('-').map(Number);
    const monthStart = new Date(Date.UTC(y, m - 1, 1));
    const monthEnd = new Date(Date.UTC(y, m, 1));
    if (monthEnd <= start || monthStart > horizonEnd) continue;
    const real = invoices
      .filter((d) => d.kind === 'purchase' && d.category === budget.category && monthOf(d.issuedAt) === budget.month)
      .reduce((sum, d) => sum + d.amountExcl, 0);
    const remaining = Math.max(0, budget.amount - real);
    if (remaining === 0) continue;
    const from = monthStart < start ? start : monthStart;
    const days = Math.round((monthEnd - from) / DAY);
    for (let d = 0; d < days; d += 1) {
      const index = weekOf(new Date(from.getTime() + d * DAY));
      if (index >= 0 && index < weeks.length) weeks[index].chargesPrevues += remaining / days;
    }
  }

  let balance = cash.amount;
  let lowest = Infinity;
  let firstTension = null;
  const rows = weeks.map((week, i) => {
    const encaissements = round(week.encaissements);
    const decaissements = round(week.decaissements + week.chargesPrevues);
    balance += encaissements - decaissements;
    lowest = Math.min(lowest, balance);
    const tension = balance < floor;
    if (tension && firstTension === null) firstTension = i + 1;
    return { semaine: i + 1, debut: week.debut, fin: week.fin, encaissements, decaissements, chargesPrevues: round(week.chargesPrevues), solde: round(balance), tension };
  });

  return {
    depart: { montant: cash.amount, constateLe: cash.observedAt },
    semaines: rows,
    plusBas: round(lowest),
    premiereTension: firstTension,
    enRetard: late,
    sansEcheance: noDue,
    besoin: computed('E024', Math.max(0, round(floor - lowest)), { inputs: { ...inputs, plancher: floor }, currency, now }),
  };
}
