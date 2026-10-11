import { prisma } from '../config/prisma.js';
import { EVENT_OUTCOME, ORDER_STATUS, PAYMENT_EVENT } from '../constants/payments.js';
import { createOrder, processNotification } from '../services/payments/payment.service.js';
import { getPaymentProvider, getPaymentProviderByName } from '../services/payments/providers/index.js';
import { fakeProvider, signedFakeNotification } from '../services/payments/providers/fake.js';
import { HttpError } from '../utils/httpError.js';
import { logSecurityEvent } from '../utils/securityLog.js';

// Payment API (P3-09). Offers are public; orders belong to their buyer only
// (rule 6: another person's order is a 404, not a 403, so ids cannot be probed).

const publicOffer = (o) => ({ id: o.id, name: o.name, description: o.description, amount: o.amount, currency: o.currency, accessLevel: o.accessLevel });

const myOrder = (o) => ({
  id: o.id,
  status: o.status,
  amount: o.amount,
  currency: o.currency,
  accessLevel: o.accessLevel,
  offer: o.offer ? { id: o.offer.id, name: o.offer.name } : null,
  createdAt: o.createdAt,
  paidAt: o.paidAt,
  refundedAt: o.refundedAt,
});

export async function listOffers(req, res) {
  const offers = await prisma.paymentOffer.findMany({ where: { isActive: true }, orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] });
  res.json({ available: Boolean(getPaymentProvider()), offers: offers.map(publicOffer) });
}

export async function startOrder(req, res) {
  const { order, redirectUrl } = await createOrder(req.user, req.body.offerId);
  res.status(201).json({ order: myOrder(order), redirectUrl });
}

export async function listMyOrders(req, res) {
  const orders = await prisma.paymentOrder.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { offer: { select: { id: true, name: true } } },
  });
  res.json({ orders: orders.map(myOrder) });
}

// What the return page reads: the state the SERVER knows. Coming back from the
// payment page changes nothing by itself.
export async function getMyOrder(req, res) {
  const order = await prisma.paymentOrder.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: { offer: { select: { id: true, name: true } } },
  });
  if (!order) throw new HttpError(404, 'Not found');
  res.json({ order: myOrder(order) });
}

// ---- Provider notifications (webhook) -------------------------------------------
// Public by nature (the provider calls it), so: raw body (the signature covers the
// exact bytes), size limit, rate limit, and the same generic answer for every
// refusal. An authentic notification always gets 200, even when it changes
// nothing (duplicate, unknown order), so the provider stops retrying it.
export async function receiveNotification(req, res) {
  const provider = getPaymentProviderByName(req.params.provider);
  if (!provider) throw new HttpError(404, 'Not found');
  const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
  const event = provider.verifyNotification(raw, req.headers);
  if (!event) {
    logSecurityEvent('payment_notification_rejected', { provider: provider.name, ip: req.ip });
    throw new HttpError(400, 'Invalid notification');
  }
  await processNotification(provider.name, event);
  res.json({ received: true });
}

// ---- Simulated provider pages (development and tests ONLY) ----------------------
// Stand in for the provider's hosted payment page. Not registered in production.

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

async function pendingFakeOrder(reference) {
  const order = await prisma.paymentOrder.findUnique({ where: { providerReference: reference }, include: { offer: true } });
  if (!order || order.provider !== fakeProvider.name) throw new HttpError(404, 'Not found');
  return order;
}

export async function fakeCheckoutPage(req, res) {
  const order = await pendingFakeOrder(req.params.reference);
  const action = `/api/payments/fake/checkout/${encodeURIComponent(order.providerReference)}`;
  res.type('html').send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Simulated payment</title></head>
<body style="font-family:system-ui,sans-serif;max-width:480px;margin:48px auto;padding:0 16px">
<p><strong>Simulated payment provider</strong> — development and tests only. No money moves.</p>
<h1 style="font-size:1.4rem">${escapeHtml(order.offer.name)}</h1>
<p id="amount">${order.amount} (${escapeHtml(order.currency)}, smallest unit)</p>
${order.status === ORDER_STATUS.PENDING ? `<form method="post" action="${action}"><button name="action" value="pay">Pay</button> <button name="action" value="cancel">Cancel</button></form>` : `<p>This checkout is closed (${escapeHtml(order.status)}).</p>`}
</body></html>`);
}

// The buyer's choice on the simulated page becomes a SIGNED notification that
// goes through exactly the same verification and processing as a real one.
export async function fakeCheckoutSubmit(req, res) {
  const order = await pendingFakeOrder(req.params.reference);
  const type = req.body.action === 'pay' ? PAYMENT_EVENT.SUCCEEDED : PAYMENT_EVENT.CANCELLED;
  const { body, headers } = signedFakeNotification({ type, reference: order.providerReference, amount: order.amount, currency: order.currency });
  const event = fakeProvider.verifyNotification(Buffer.from(body), headers);
  const result = await processNotification(fakeProvider.name, event);
  if (result.outcome === EVENT_OUTCOME.AMOUNT_MISMATCH) throw new HttpError(409, 'Amount mismatch');
  res.redirect(303, `/paiement/retour?commande=${order.id}`);
}
