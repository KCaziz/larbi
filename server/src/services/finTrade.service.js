import {
  INCOTERM_VERSION,
  INCOTERMS,
  MICRO_IMPORT_RULES,
  OPEN_OPERATION_STATUSES,
  REQUIRED_PIECES,
} from '../constants/finTrade.js';
import { HttpError } from '../utils/httpError.js';
import { journal, checkVersion } from './finOrganization.service.js';
import { confirmedValue } from './regulatoryParams.service.js';
import { fxScenario, landedCost, operationView } from './finTradeView.service.js';
import { stockLots } from './finBusinessPilot.service.js';

/**
 * Micro-import and international trade (P13-05, lot D, 2026-11-24): the
 * operations of an organisation, their costs, their file, their reception
 * into stock. Every function receives `ctx`, the organisation already
 * resolved and checked (lot A); every write leaves a line in its journal.
 */

const year = (date) => new Date(date).getUTCFullYear();

/** What the screens need before anything else: the Incoterms, the expected documents, the micro-import rules. */
export async function tradeReferences() {
  const rules = await Promise.all(
    MICRO_IMPORT_RULES.map(async (key) => {
      const value = await confirmedValue(key);
      // DEC-013: a rule not confirmed is « not published », never assumed.
      return { key, confirmed: value !== null, value };
    }),
  );
  return { incoterms: INCOTERMS, versionIncoterms: INCOTERM_VERSION, piecesAttendues: REQUIRED_PIECES, reglesMicroImport: rules };
}

async function findOperation(prisma, businessId, id) {
  const operation = await prisma.finBusinessOperation.findFirst({ where: { id, businessId } });
  if (!operation) throw new HttpError(404, 'Operation not found', { reason: 'operationNotFound' });
  return operation;
}

async function assertBelongs(prisma, businessId, { counterpartyId, itemId }) {
  if (counterpartyId) {
    const contact = await prisma.finBusinessContact.findFirst({ where: { id: counterpartyId, businessId, archivedAt: null, deletedAt: null } });
    if (!contact) throw new HttpError(404, 'Contact not found', { reason: 'contactNotFound' });
  }
  if (itemId) {
    const item = await prisma.finBusinessItem.findFirst({ where: { id: itemId, businessId, archivedAt: null } });
    if (!item) throw new HttpError(404, 'Item not found', { reason: 'itemNotFound' });
  }
}

// DEC-017: an Incoterm without its version and its named place is no Incoterm.
function incotermFields(body) {
  if (!body.incoterm) return body.incoterm === null ? { incoterm: null, incotermVersion: null, namedPlace: null } : {};
  if (!body.namedPlace) throw new HttpError(422, 'An Incoterm needs its named place', { reason: 'namedPlaceRequired' });
  return { incoterm: body.incoterm, incotermVersion: body.incotermVersion ?? INCOTERM_VERSION, namedPlace: body.namedPlace };
}

export async function listOperations(prisma, { business }) {
  const operations = await prisma.finBusinessOperation.findMany({
    where: { businessId: business.id },
    orderBy: [{ createdAt: 'desc' }],
    include: {
      counterparty: { select: { id: true, name: true, kind: true } },
      item: { select: { id: true, name: true, unit: true } },
      costs: { orderBy: { createdAt: 'asc' } },
      pieces: { orderBy: { kind: 'asc' } },
    },
  });
  const ids = operations.map((op) => op.id);
  const entries = await prisma.finBusinessStockMove.findMany({ where: { businessId: business.id, operationId: { in: ids } } });
  const draws = await prisma.finBusinessStockMove.findMany({ where: { businessId: business.id, lotId: { in: entries.map((m) => m.id) } } });
  const documents = await prisma.finBusinessDocument.findMany({
    where: { businessId: business.id, archivedAt: null, deletedAt: null, OR: [{ operationId: { in: ids } }, { docType: 'credit_note' }] },
  });
  return operations.map((operation) => ({
    ...operation,
    calcul: operationView({ operation, costs: operation.costs, pieces: operation.pieces, moves: [...entries, ...draws], documents, base: business.currency }),
  }));
}

export async function createOperation(prisma, ctx, body) {
  const { business } = ctx;
  await assertBelongs(prisma, business.id, body);
  const incoterm = incotermFields(body);
  const numbered = !body.reference;
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await prisma.$transaction(async (tx) => {
        let reference = body.reference;
        if (!reference) {
          const prefix = `OP-${year(body.plannedAt ?? new Date())}-`;
          const taken = await tx.finBusinessOperation.findMany({ where: { businessId: business.id, reference: { startsWith: prefix } }, select: { reference: true } });
          const highest = taken.reduce((max, row) => Math.max(max, Number(row.reference.slice(prefix.length)) || 0), 0);
          reference = `${prefix}${String(highest + 1).padStart(4, '0')}`;
        }
        const operation = await tx.finBusinessOperation.create({
          data: {
            businessId: business.id,
            kind: body.kind,
            reference,
            label: body.label,
            country: body.country,
            counterpartyId: body.counterpartyId ?? null,
            currency: body.currency,
            ...incoterm,
            itemId: body.itemId ?? null,
            quantityOrdered: body.quantityOrdered ?? null,
            plannedAt: body.plannedAt ?? null,
            note: body.note ?? null,
            // The file is opened with every document the kind expects, all missing.
            pieces: { create: REQUIRED_PIECES[body.kind].map((kind) => ({ kind })) },
          },
        });
        await journal(tx, { businessId: business.id, actorId: ctx.member.userId, action: 'operation.created', objectType: 'operation', objectId: operation.id, details: { reference, kind: body.kind } });
        return operation;
      });
    } catch (err) {
      if (err?.code !== 'P2002') throw err;
      if (!numbered || attempt >= 4) throw new HttpError(409, 'This reference already exists', { reason: 'duplicateReference' });
    }
  }
}

export async function updateOperation(prisma, ctx, id, body, ifMatch) {
  const { business } = ctx;
  const operation = await findOperation(prisma, business.id, id);
  checkVersion(operation, ifMatch);
  if (!OPEN_OPERATION_STATUSES.includes(operation.status) && Object.keys(body).some((key) => key !== 'note')) {
    throw new HttpError(409, 'A closed or cancelled operation is not changed', { reason: 'operationClosed' });
  }
  // A reception makes the status « received »: it is not typed by hand.
  if (body.status === 'received' && operation.status !== 'received') {
    throw new HttpError(422, 'An operation is received by its reception', { reason: 'receiveByReception' });
  }
  await assertBelongs(prisma, business.id, body);
  const { incoterm: _i, incotermVersion: _v, namedPlace: _p, ...rest } = body;
  const data = { ...rest, ...('incoterm' in body ? incotermFields(body) : {}) };
  return prisma.$transaction(async (tx) => {
    const updated = await tx.finBusinessOperation.update({ where: { id: operation.id }, data: { ...data, version: { increment: 1 } } });
    await journal(tx, { businessId: business.id, actorId: ctx.member.userId, action: 'operation.updated', objectType: 'operation', objectId: operation.id, details: { reference: operation.reference, fields: Object.keys(body) } });
    return updated;
  });
}

/**
 * A cost of the operation, in its own currency. In another currency than the
 * organisation's, its rate, the date of the rate and its source are required
 * (DEC-015) ; in the same currency, no rate.
 */
export async function addOperationCost(prisma, ctx, id, body) {
  const { business } = ctx;
  const operation = await findOperation(prisma, business.id, id);
  if (!OPEN_OPERATION_STATUSES.includes(operation.status)) throw new HttpError(409, 'A closed or cancelled operation is not changed', { reason: 'operationClosed' });
  // Once received, the lot is in stock at the landed cost of that day: a cost
  // added afterwards would change the operation without changing the stock.
  if (operation.status === 'received') throw new HttpError(409, 'The goods are already in stock at their landed cost', { reason: 'alreadyReceived' });
  const foreign = body.currency !== business.currency;
  if (foreign && (!body.rate || !body.rateDate || !body.rateSource)) {
    throw new HttpError(422, 'A cost in another currency needs its dated and sourced rate', { reason: 'rateRequired', currency: body.currency });
  }
  if (!foreign && body.rate) throw new HttpError(422, 'No rate in the organisation currency', { reason: 'rateNotNeeded' });
  return prisma.$transaction(async (tx) => {
    const cost = await tx.finBusinessOperationCost.create({
      data: {
        operationId: operation.id,
        kind: body.kind,
        label: body.label ?? null,
        amount: body.amount,
        currency: body.currency,
        rate: foreign ? body.rate : null,
        rateDate: foreign ? body.rateDate : null,
        rateSource: foreign ? body.rateSource : null,
        paidAt: body.paidAt ?? null,
      },
    });
    await journal(tx, { businessId: business.id, actorId: ctx.member.userId, action: 'operation.cost', objectType: 'operation', objectId: operation.id, details: { reference: operation.reference, kind: body.kind } });
    return cost;
  });
}

/** A document of the file: where it stands. Only the documents the kind expects. */
export async function setOperationPiece(prisma, ctx, id, body) {
  const { business } = ctx;
  const operation = await findOperation(prisma, business.id, id);
  return prisma.$transaction(async (tx) => {
    const piece = await tx.finBusinessOperationPiece.upsert({
      where: { operationId_kind: { operationId: operation.id, kind: body.kind } },
      create: { operationId: operation.id, kind: body.kind, status: body.status, reference: body.reference ?? null, note: body.note ?? null },
      update: { status: body.status, ...(body.reference !== undefined ? { reference: body.reference } : {}), ...(body.note !== undefined ? { note: body.note } : {}) },
    });
    await journal(tx, { businessId: business.id, actorId: ctx.member.userId, action: 'operation.piece', objectType: 'operation', objectId: operation.id, details: { reference: operation.reference, piece: body.kind, status: body.status } });
    return piece;
  });
}

/**
 * The reception (ECR-0354): the goods enter the stock as ONE lot at the landed
 * cost; what arrived damaged is a loss of that lot (CNV-16). The landed cost
 * must be computable — every foreign cost with its rate — and the net
 * quantity strictly positive.
 */
export async function receiveOperation(prisma, ctx, id, body) {
  const { business } = ctx;
  const operation = await findOperation(prisma, business.id, id);
  if (operation.kind === 'export') throw new HttpError(422, 'An export is shipped, not received', { reason: 'exportNotReceived' });
  if (!OPEN_OPERATION_STATUSES.includes(operation.status) || operation.status === 'received') {
    throw new HttpError(409, 'This operation is already received or closed', { reason: 'alreadyReceived' });
  }
  const itemId = body.itemId ?? operation.itemId;
  if (!itemId) throw new HttpError(422, 'Say which item is received', { reason: 'itemRequired' });
  await assertBelongs(prisma, business.id, { itemId });
  const damaged = body.quantityDamaged ?? 0;
  if (body.quantityReceived - damaged <= 0) throw new HttpError(422, 'Nothing usable was received', { reason: 'netQuantityZero' });
  const costs = await prisma.finBusinessOperationCost.findMany({ where: { operationId: operation.id } });
  const landed = landedCost({ costs, base: business.currency });
  if (landed.total === null) {
    throw new HttpError(422, landed.missingRates > 0 ? 'A cost has no rate' : 'No cost recorded', { reason: landed.missingRates > 0 ? 'rateRequired' : 'noCost' });
  }

  return prisma.$transaction(async (tx) => {
    const { count } = await tx.finBusinessOperation.updateMany({
      where: { id: operation.id, version: operation.version, status: operation.status },
      data: { status: 'received', itemId, version: { increment: 1 } },
    });
    if (count === 0) throw new HttpError(409, 'Changed since you read it', { reason: 'stateChanged' });
    const lot = await tx.finBusinessStockMove.create({
      data: {
        businessId: business.id,
        itemId,
        kind: 'in',
        quantity: body.quantityReceived,
        totalCost: landed.total,
        lotRef: body.lotRef ?? operation.reference,
        movedAt: body.receivedAt,
        operationId: operation.id,
        note: body.note ?? null,
      },
    });
    if (damaged > 0) {
      await tx.finBusinessStockMove.create({
        data: { businessId: business.id, itemId, kind: 'loss', quantity: damaged, lotId: lot.id, movedAt: body.receivedAt, operationId: operation.id, note: body.note ?? null },
      });
    }
    await journal(tx, { businessId: business.id, actorId: ctx.member.userId, action: 'operation.received', objectType: 'operation', objectId: operation.id, details: { reference: operation.reference, received: body.quantityReceived, damaged } });
    const [state] = stockLots(damaged > 0 ? [lot, { id: 'x', kind: 'loss', lotId: lot.id, quantity: damaged }] : [lot]);
    return { lot, net: state.net, unitCost: state.unitCost };
  });
}

/** ECR-0365: what a change of the rates does to the landed cost and the unit margin. */
export async function operationScenario(prisma, { business }, id, { variation, prixVente, fraisVente }) {
  const operation = await findOperation(prisma, business.id, id);
  const costs = await prisma.finBusinessOperationCost.findMany({ where: { operationId: operation.id } });
  const entries = await prisma.finBusinessStockMove.findMany({ where: { operationId: operation.id, kind: 'in' } });
  const losses = await prisma.finBusinessStockMove.findMany({ where: { lotId: { in: entries.map((m) => m.id) }, kind: 'loss' } });
  const netUnits = entries.length > 0 ? stockLots([...entries, ...losses]).reduce((sum, lot) => sum + lot.net, 0) : operation.quantityOrdered;
  return fxScenario({ costs, base: business.currency, variation, netUnits, unitPrice: prixVente ?? null, unitSellingCost: fraisVente ?? 0 });
}
