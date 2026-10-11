import { prisma } from '../../config/prisma.js';
import { EVENT_OUTCOME, ORDER_STATUS, PAYMENT_EVENT } from '../../constants/payments.js';
import { HttpError } from '../../utils/httpError.js';
import { logSecurityEvent } from '../../utils/securityLog.js';
import { getPaymentProvider } from './providers/index.js';

// Payment logic that does not depend on the provider (P3-09). The rules that
// matter most:
//  - the price ALWAYS comes from the server (the browser only names an offer);
//  - access is granted ONLY from an authentic provider notification, inside a
//    transaction, at most once, whatever the number of notifications;
//  - the browser coming back from the payment page grants nothing.

const isUniqueViolation = (err) => err?.code === 'P2002';

// ---- Orders -------------------------------------------------------------------

export async function createOrder(user, offerId) {
  const provider = getPaymentProvider();
  if (!provider) throw new HttpError(503, 'Payment is not available', { reason: 'unavailable' });

  const offer = await prisma.paymentOffer.findFirst({ where: { id: offerId, isActive: true } });
  if (!offer) throw new HttpError(404, 'Not found');
  // Paying for what one already has would only produce a refund request.
  if (user.accessLevel === offer.accessLevel) throw new HttpError(409, 'Access already granted', { reason: 'alreadyGranted' });

  const order = await prisma.paymentOrder.create({
    data: {
      userId: user.id,
      offerId: offer.id,
      amount: offer.amount,
      currency: offer.currency,
      accessLevel: offer.accessLevel,
      provider: provider.name,
    },
  });
  const checkout = await provider.createCheckout({ order, offer, user });
  const saved = await prisma.paymentOrder.update({ where: { id: order.id }, data: { providerReference: checkout.reference } });
  return { order: saved, redirectUrl: checkout.redirectUrl };
}

// ---- Notifications ------------------------------------------------------------

// `event` is what an adapter's verifyNotification returned: already AUTHENTIC.
// Returns { duplicate, outcome }. Idempotent: the same notification twice (or
// two at once) is recorded once and applied once.
export async function processNotification(providerName, event) {
  // The order row is locked first, so notifications for one order are processed
  // one after the other. A deadlock / write conflict the database still reports
  // under heavy concurrency is retried: the transaction had no effect.
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await processOnce(providerName, event);
    } catch (err) {
      if (err?.code !== 'P2034' || attempt >= 3) throw err;
    }
  }
}

async function processOnce(providerName, event) {
  return prisma.$transaction(async (tx) => {
    const [locked] = await tx.$queryRaw`SELECT id FROM payment_orders WHERE providerReference = ${event.reference} FOR UPDATE`;
    const order = locked ? await tx.paymentOrder.findUnique({ where: { id: locked.id } }) : null;

    let record;
    try {
      record = await tx.paymentEvent.create({
        data: { provider: providerName, externalId: event.externalId, type: event.type, orderId: order?.id ?? null, outcome: EVENT_OUTCOME.IGNORED },
      });
    } catch (err) {
      if (isUniqueViolation(err)) return { duplicate: true, outcome: null };
      throw err;
    }

    const outcome = order ? await applyEvent(tx, order, event) : EVENT_OUTCOME.UNKNOWN_ORDER;
    if (outcome !== EVENT_OUTCOME.IGNORED) await tx.paymentEvent.update({ where: { id: record.id }, data: { outcome } });
    return { duplicate: false, outcome };
  });
}

// Every status change is a CONDITIONAL update ("only if it is still X"): two
// different notifications racing for the same order cannot both apply.
async function transition(tx, order, from, data) {
  const { count } = await tx.paymentOrder.updateMany({ where: { id: order.id, status: { in: from } }, data });
  return count === 1;
}

async function applyEvent(tx, order, event) {
  switch (event.type) {
    case PAYMENT_EVENT.SUCCEEDED: {
      // What was paid must be exactly what was ordered: a notification for
      // another amount (tampering, or a provider-side mistake) grants nothing.
      if (event.amount !== order.amount || event.currency !== order.currency) {
        logSecurityEvent('payment_amount_mismatch', { orderId: order.id, provider: order.provider });
        return EVENT_OUTCOME.AMOUNT_MISMATCH;
      }
      const paid = await transition(tx, order, [ORDER_STATUS.PENDING, ORDER_STATUS.FAILED, ORDER_STATUS.CANCELLED], {
        status: ORDER_STATUS.PAID,
        paidAt: new Date(),
      });
      if (!paid) return EVENT_OUTCOME.IGNORED;
      await tx.user.update({ where: { id: order.userId }, data: { accessLevel: order.accessLevel } });
      return EVENT_OUTCOME.APPLIED;
    }
    case PAYMENT_EVENT.FAILED:
    case PAYMENT_EVENT.CANCELLED: {
      const status = event.type === PAYMENT_EVENT.FAILED ? ORDER_STATUS.FAILED : ORDER_STATUS.CANCELLED;
      return (await transition(tx, order, [ORDER_STATUS.PENDING], { status })) ? EVENT_OUTCOME.APPLIED : EVENT_OUTCOME.IGNORED;
    }
    case PAYMENT_EVENT.REFUNDED: {
      const refunded = await transition(tx, order, [ORDER_STATUS.PAID], { status: ORDER_STATUS.REFUNDED, refundedAt: new Date() });
      if (!refunded) return EVENT_OUTCOME.IGNORED;
      // Default rule until the client decides (P3-08): the access bought goes
      // away with the refund, unless another paid order still grants it.
      const stillPaid = await tx.paymentOrder.count({ where: { userId: order.userId, status: ORDER_STATUS.PAID, accessLevel: order.accessLevel } });
      if (stillPaid === 0) await tx.user.update({ where: { id: order.userId }, data: { accessLevel: 'standard' } });
      return EVENT_OUTCOME.APPLIED;
    }
    default:
      return EVENT_OUTCOME.IGNORED;
  }
}
