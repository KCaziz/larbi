import { CASH_BASIS_NOTICE, DOCUMENT_DIRECTION } from '../constants/finBusiness.js';
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
export function documentSettlement(document, payments) {
  const mine = payments.filter((p) => p.documentId === document.id && active(p));
  const sameCurrency = mine.filter((p) => p.currency === document.currency);
  const foreign = mine.filter((p) => p.currency !== document.currency);
  const settled = sameCurrency.reduce((sum, p) => sum + p.value, 0);
  const total = documentTotal(document);
  const outstanding = total - settled;

  let state = 'unpaid';
  if (settled > 0 && outstanding > 0) state = 'partial';
  else if (outstanding === 0 && total > 0) state = 'paid';
  else if (outstanding < 0) state = 'overpaid';
  else if (total === 0) state = 'paid';

  return {
    total,
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
export function buildBusinessDashboard({ business, documents = [], payments = [], now = new Date() }) {
  const currency = business.currency;
  const liveDocuments = documents.filter(active);
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
    settlement: documentSettlement(document, livePayments),
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
