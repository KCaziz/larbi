import { AGING_BUCKETS, CASH_BASIS_NOTICE, DOCUMENT_DIRECTION } from '../constants/finBusiness.js';
import { computed } from './finance/contract.js';

/**
 * Les chiffres de l'espace entreprise (P7-02), en fonctions PURES : elles
 * reçoivent des lignes et rendent des réponses du moteur. Aucune ne touche la
 * base — c'est ce qui les rend testables sans serveur et réutilisables par le
 * tableau de bord comme par la fiche d'un document.
 *
 * Tout ce qui est calculé ici est un FAIT DE TRÉSORERIE : ce qui est entré, ce
 * qui est sorti, ce qui reste dû. Rien n'y suppose une norme comptable, et
 * c'est la raison pour laquelle ces chiffres existent alors que le bilan et le
 * compte de résultat sont déclarés bloqués (`BUSINESS_BLOCKED_STATEMENTS`).
 *
 * La règle du projet s'applique sans changement : `null` veut dire « non
 * calculable », jamais zéro. Une entreprise sans aucune vente n'a pas « zéro
 * de créances » tant qu'on n'a rien pour le dire — elle n'a rien à calculer.
 */

const active = (row) => !row.archivedAt && !row.deletedAt;

// P13-05, lot B : seule une facture ÉMISE crée une créance ou une dette
// (CNV-01, FAC-003). Un devis est un engagement commercial, un brouillon n'est
// rien encore, un avoir corrige sa facture et ne compte pas pour lui-même.
// Une ligne de P7-02 sans type est une facture émise : c'est ce qu'elle était.
export const isIssuedInvoice = (document) =>
  (document.docType ?? 'invoice') === 'invoice' && (document.state ?? 'issued') === 'issued' && active(document);

/** Les avoirs émis sur un document, dans sa devise. */
export function creditNotesOf(document, documents = []) {
  return documents.filter(
    (d) => d.docType === 'credit_note' && d.relatedId === document.id && active(d) && d.currency === document.currency,
  );
}

/** Le total d'un document : hors taxe + taxe, tels qu'ils ont été déclarés. */
export function documentTotal(document) {
  return document.amountExcl + document.taxAmount;
}

/**
 * Ce qui a été réglé sur un document.
 *
 * Les règlements d'une autre devise que le document ne sont PAS additionnés :
 * le moteur ne convertit jamais sans un taux daté, et un total mêlant deux
 * devises serait un nombre sans unité. Ils sont comptés comme un avertissement.
 */
export function documentSettlement(document, payments, documents = []) {
  const mine = payments.filter((p) => p.documentId === document.id && active(p));
  const sameCurrency = mine.filter((p) => p.currency === document.currency);
  const foreign = mine.filter((p) => p.currency !== document.currency);
  const settled = sameCurrency.reduce((sum, p) => sum + p.value, 0);
  const total = documentTotal(document);
  // Lot B (FAC-007, CNV-02) : un avoir réduit ce qui est dû sans toucher à la
  // facture. « Solde après règlement partiel » = facture - règlements - avoirs.
  const credited = creditNotesOf(document, documents).reduce((sum, c) => sum + documentTotal(c), 0);
  const net = total - credited;
  const outstanding = net - settled;

  let state = 'unpaid';
  if (credited > 0 && net <= 0 && settled === 0) state = 'cancelled';
  else if (settled > 0 && outstanding > 0) state = 'partial';
  else if (outstanding === 0 && total > 0) state = 'paid';
  else if (outstanding < 0) state = 'overpaid';
  else if (total === 0) state = 'paid';

  return {
    total,
    credited,
    net,
    settled,
    outstanding,
    state,
    // Signalé plutôt qu'absorbé : un règlement dans une autre devise est une
    // information, pas une erreur à taire.
    devisesIgnorees: foreign.map((p) => ({ id: p.id, currency: p.currency, value: p.value })),
  };
}

/**
 * Un document est en retard lorsque son échéance est passée ET qu'il reste dû.
 *
 * Une échéance absente ne rend JAMAIS un document en retard : beaucoup de
 * documents n'en portent pas, et les traiter comme échus transformerait une
 * absence d'information en dette exigible.
 */
export function isOverdue(document, settlement, now) {
  if (!document.dueAt) return false;
  if (settlement.outstanding <= 0) return false;
  return new Date(document.dueAt) < now;
}

/**
 * Le tableau de bord de trésorerie.
 *
 * `documents` et `payments` sont déjà filtrés sur la période et sur
 * l'entreprise par l'appelant ; cette fonction ne décide pas de ce qu'elle
 * voit, elle en rend compte.
 */
export function buildBusinessDashboard({ business, documents = [], payments = [], now = new Date(), from = null, to = null }) {
  const currency = business.currency;
  const allDocuments = documents.filter(active);
  // Seules les factures émises portent des créances, des dettes et des
  // règlements ; devis et avoirs ont leurs propres chiffres plus bas.
  const liveDocuments = allDocuments.filter(isIssuedInvoice);
  const livePayments = payments.filter(active);

  // Les règlements se rattachent au sens de LEUR document : un règlement n'est
  // un encaissement que parce qu'il solde une vente.
  const byDocument = new Map(liveDocuments.map((d) => [d.id, d]));
  const classified = livePayments
    .map((p) => ({ payment: p, document: byDocument.get(p.documentId) ?? null }))
    .filter((row) => row.document !== null && row.payment.currency === currency);

  const inflow = classified.filter((row) => DOCUMENT_DIRECTION[row.document.kind] === 'in');
  const outflow = classified.filter((row) => DOCUMENT_DIRECTION[row.document.kind] === 'out');

  const sum = (rows) => rows.reduce((total, row) => total + row.payment.value, 0);
  // Un ensemble vide rend `null`, pas 0 : « rien n'est entré » et « nous ne
  // savons pas ce qui est entré » ne se lisent pas pareil. L'asymétrie entre
  // deux totaux dont l'un serait gardé et l'autre non est précisément le
  // défaut trouvé dans `totalsByReality` (P6-21).
  const cashIn = inflow.length === 0 ? null : sum(inflow);
  const cashOut = outflow.length === 0 ? null : sum(outflow);
  const balance = cashIn === null && cashOut === null ? null : (cashIn ?? 0) - (cashOut ?? 0);

  const settlements = liveDocuments.map((document) => ({
    document,
    settlement: documentSettlement(document, livePayments, allDocuments),
  }));

  const openSales = settlements.filter((row) => row.document.kind === 'sale' && row.settlement.outstanding > 0);
  const openPurchases = settlements.filter((row) => row.document.kind === 'purchase' && row.settlement.outstanding > 0);
  const overdue = settlements.filter((row) => isOverdue(row.document, row.settlement, now));

  const receivables = openSales.length === 0 ? null : openSales.reduce((t, row) => t + row.settlement.outstanding, 0);
  const payables = openPurchases.length === 0 ? null : openPurchases.reduce((t, row) => t + row.settlement.outstanding, 0);
  const overdueAmount = overdue.length === 0 ? null : overdue.reduce((t, row) => t + row.settlement.outstanding, 0);

  const inputs = {
    documents: liveDocuments.length,
    reglements: classified.length,
    devise: currency,
  };

  return {
    devise: currency,
    // Dit une fois, en tête, plutôt que supposé connu de qui lit les chiffres.
    base: CASH_BASIS_NOTICE,
    encaissements: computed('E004', cashIn, { inputs, currency, now }),
    decaissements: computed('E005', cashOut, { inputs, currency, now }),
    tresorerie: computed('E006', balance, { inputs, currency, now }),
    creances: computed('E007', receivables, { inputs: { ...inputs, ventes_ouvertes: openSales.length }, currency, now }),
    dettes: computed('E008', payables, { inputs: { ...inputs, achats_ouverts: openPurchases.length }, currency, now }),
    echu: computed('E009', overdueAmount, { inputs: { ...inputs, documents_echus: overdue.length }, currency, now }),
    delaiMoyen: computed('E010', averageSettlementDays(settlements, livePayments), {
      inputs: { ...inputs, documents_soldes: settlements.filter((r) => r.settlement.state === 'paid').length },
      currency,
      now,
    }),
    ...invoicingFigures({ allDocuments, settlements, currency, now, from, to, inputs }),
    // Les documents en retard, nommés : un montant échu sans la liste de ce
    // qui le compose n'est pas actionnable.
    enRetard: overdue.map((row) => ({
      id: row.document.id,
      numero: row.document.number,
      libelle: row.document.label,
      sens: row.document.kind,
      echeance: row.document.dueAt,
      resteDu: row.settlement.outstanding,
    })),
  };
}

const inPeriod = (date, from, to) => (!from || new Date(date) >= new Date(from)) && (!to || new Date(date) <= new Date(to));
const startOfDay = (date) => new Date(new Date(date).toISOString().slice(0, 10));
const sumOf = (rows, pick) => (rows.length === 0 ? null : rows.reduce((total, row) => total + pick(row), 0));

/**
 * Les chiffres de la facturation (P13-05, lot B, 19_CYCLE_FACTURE). En hors
 * taxe quand ils parlent d'activité (CA, marge, devis), en total quand ils
 * parlent d'argent dû (balance âgée, à rembourser).
 */
export function invoicingFigures({ allDocuments, settlements, currency, now, from = null, to = null, inputs = {} }) {
  const sales = settlements.filter((row) => row.document.kind === 'sale' && row.document.currency === currency);
  const creditsExcl = (document) => creditNotesOf(document, allDocuments).reduce((sum, c) => sum + c.amountExcl, 0);

  // E011 : CA facturé net des avoirs, chacun à sa date.
  const periodSales = sales.filter((row) => inPeriod(row.document.issuedAt, from, to));
  const saleIds = new Set(sales.map((row) => row.document.id));
  const periodCredits = allDocuments.filter(
    (d) => d.docType === 'credit_note' && saleIds.has(d.relatedId) && d.currency === currency && inPeriod(d.issuedAt, from, to),
  );
  const invoiced =
    periodSales.length === 0 && periodCredits.length === 0
      ? null
      : periodSales.reduce((t, row) => t + row.document.amountExcl, 0) - periodCredits.reduce((t, d) => t + d.amountExcl, 0);

  // E012 : marge indicative, seulement là où le coût est déclaré (CNV-04 :
  // un coût absent n'est pas un coût nul).
  const costed = periodSales.filter((row) => row.document.costExcl !== null && row.document.costExcl !== undefined);
  const margin = sumOf(costed, (row) => row.document.amountExcl - creditsExcl(row.document) - row.document.costExcl);

  // E013 : devis envoyés ou acceptés, pas encore facturés ni expirés.
  const today = startOfDay(now);
  const openQuotes = allDocuments.filter(
    (d) =>
      d.docType === 'quote' &&
      d.currency === currency &&
      (d.state === 'sent' || d.state === 'accepted') &&
      (!d.validUntil || new Date(d.validUntil) >= today),
  );

  // E014 : ce qu'un avoir a rendu dû au client.
  const refunds = sales.filter((row) => row.settlement.outstanding < 0);

  // Balance âgée (FAC-006) : le reste dû des ventes, par jours de retard. Une
  // échéance absente a sa propre ligne : elle n'est ni « à jour » ni « en
  // retard ».
  const open = sales.filter((row) => row.settlement.outstanding > 0);
  let aging = null;
  if (open.length > 0) {
    aging = Object.fromEntries([...AGING_BUCKETS.map((b) => [b.key, 0]), ['noDueDate', 0]]);
    for (const row of open) {
      if (!row.document.dueAt) {
        aging.noDueDate += row.settlement.outstanding;
        continue;
      }
      const late = Math.floor((today - startOfDay(row.document.dueAt)) / 86400000);
      const bucket = AGING_BUCKETS.find((b) => late <= b.max);
      aging[bucket.key] += row.settlement.outstanding;
    }
  }

  return {
    caFacture: computed('E011', invoiced, { inputs: { ...inputs, factures: periodSales.length, avoirs: periodCredits.length }, currency, now }),
    marge: computed('E012', margin, {
      inputs: { ...inputs, factures_avec_cout: costed.length, factures_sans_cout: periodSales.length - costed.length },
      currency,
      now,
    }),
    devisEnCours: computed('E013', sumOf(openQuotes, (d) => d.amountExcl), { inputs: { ...inputs, devis: openQuotes.length }, currency, now }),
    aRembourser: computed('E014', sumOf(refunds, (row) => -row.settlement.outstanding), { inputs: { ...inputs, factures: refunds.length }, currency, now }),
    balanceAgee: aging,
  };
}

/**
 * Le délai moyen entre l'émission d'un document et son règlement complet,
 * pondéré par les montants réglés.
 *
 * Seuls les documents SOLDÉS comptent : un document en cours n'a pas encore de
 * délai, et l'inclure avec le délai écoulé à ce jour ferait baisser la moyenne
 * à chaque nouvelle facture émise — un indicateur qui s'améliore quand on
 * facture davantage ne mesure rien.
 */
export function averageSettlementDays(settlements, payments) {
  const paid = settlements.filter((row) => row.settlement.state === 'paid' || row.settlement.state === 'overpaid');
  if (paid.length === 0) return null;

  let weighted = 0;
  let weight = 0;
  for (const row of paid) {
    const issued = new Date(row.document.issuedAt);
    for (const payment of payments) {
      if (payment.documentId !== row.document.id) continue;
      if (payment.currency !== row.document.currency) continue;
      const days = Math.round((new Date(payment.receivedAt) - issued) / 86400000);
      weighted += days * payment.value;
      weight += payment.value;
    }
  }
  if (weight === 0) return null;
  return Math.round(weighted / weight);
}
