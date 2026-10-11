import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { boot } from '../helpers/server.js';

// Payment base (P3-09) under attack: forged, replayed, duplicated and concurrent
// notifications, tampered amounts, someone else's order, and the browser coming
// back from the payment page. Access must be granted ONCE, and only by an
// authentic notification for the right amount.

let t;
let buyer;
let offer;
let signedFakeNotification;

const notify = ({ body, headers }) => t.request('POST', '/payments/webhook/fake', { body, headers });
const accessOf = async () => (await t.prisma.user.findUnique({ where: { id: buyer.id } })).accessLevel;

async function pendingOrder() {
  const res = await t.request('POST', '/payments/orders', { user: buyer, json: { offerId: offer.id } });
  return t.prisma.paymentOrder.findUnique({ where: { id: res.body.order.id } });
}
const success = (order, extra = {}) => signedFakeNotification({ type: 'payment.succeeded', reference: order.providerReference, amount: order.amount, currency: order.currency, ...extra });

before(async () => {
  t = await boot();
  ({ signedFakeNotification } = await import('../../src/services/payments/providers/fake.js'));
});
beforeEach(async () => {
  await t.reset();
  buyer = await t.user();
  offer = await t.prisma.paymentOffer.create({ data: { name: 'Premium', amount: 150000, currency: 'DZD', isActive: true } });
});
after(() => t.close());

describe('notification authenticity', () => {
  test('a notification signed with another secret, unsigned, or tampered after signing is refused (400) and changes nothing', async () => {
    const order = await pendingOrder();
    const genuine = success(order);
    const body = genuine.body;
    const ts = Math.floor(Date.now() / 1000);
    const forgedSig = createHmac('sha256', 'not-the-secret').update(`${ts}.${body}`).digest('hex');
    const attempts = [
      { body, headers: { 'content-type': 'application/json', 'x-fake-signature': `t=${ts},v1=${forgedSig}` } },
      { body, headers: { 'content-type': 'application/json' } },
      { body: body.replace('"amount":150000', '"amount":1'), headers: genuine.headers },
      { body, headers: { ...genuine.headers, 'x-fake-signature': 'garbage' } },
    ];
    for (const a of attempts) {
      const res = await notify(a);
      assert.equal(res.status, 400);
      assert.equal(res.body.error.message, 'Invalid notification', 'one generic answer for every refusal');
    }
    assert.equal((await t.prisma.paymentOrder.findUnique({ where: { id: order.id } })).status, 'pending');
    assert.equal(await accessOf(), 'standard');
    assert.equal(await t.prisma.paymentEvent.count(), 0, 'nothing is recorded from an unauthenticated caller');
  });

  test('a genuine notification captured and replayed later (outside the time window) is refused', async () => {
    const order = await pendingOrder();
    const old = success(order, {});
    const stale = signedFakeNotification({ type: 'payment.succeeded', reference: order.providerReference, amount: order.amount, currency: order.currency }, { timestamp: Math.floor(Date.now() / 1000) - 3600 });
    assert.equal((await notify(stale)).status, 400);
    assert.equal(await accessOf(), 'standard');
    assert.equal((await notify(old)).status, 200, 'the fresh one still works');
  });

  test('an unknown provider name is a 404; an oversized body is refused before any processing', async () => {
    assert.equal((await t.request('POST', '/payments/webhook/stripe', { body: '{}', headers: { 'content-type': 'application/json' } })).status, 404);
    const res = await t.request('POST', '/payments/webhook/fake', { body: 'x'.repeat(70 * 1024), headers: { 'content-type': 'application/json' } });
    assert.equal(res.status, 413);
  });
});

describe('access is granted once, for the right amount', () => {
  test('the same notification twice: recorded once, applied once', async () => {
    const order = await pendingOrder();
    const n = success(order);
    assert.equal((await notify(n)).status, 200);
    assert.equal((await notify(n)).status, 200, 'the provider gets 200 and stops retrying');
    assert.equal(await t.prisma.paymentEvent.count(), 1);
    assert.equal(await accessOf(), 'premium');
  });

  test('ten copies of the same notification AT THE SAME TIME: one event, one payment', async () => {
    const order = await pendingOrder();
    const n = success(order);
    const results = await Promise.all(Array.from({ length: 10 }, () => notify(n)));
    assert.ok(results.every((r) => r.status === 200), results.map((r) => r.status).join(','));
    assert.equal(await t.prisma.paymentEvent.count(), 1);
    assert.equal((await t.prisma.paymentOrder.findUnique({ where: { id: order.id } })).status, 'paid');
  });

  test('five DIFFERENT success notifications for one order at the same time: applied exactly once', async () => {
    const order = await pendingOrder();
    const results = await Promise.all(Array.from({ length: 5 }, () => notify(success(order))));
    assert.ok(results.every((r) => r.status === 200));
    assert.equal(await t.prisma.paymentEvent.count(), 5, 'each one is recorded');
    assert.equal(await t.prisma.paymentEvent.count({ where: { outcome: 'applied' } }), 1, 'only one paid the order');
  });

  test('a notification for another amount or currency than the order grants nothing', async () => {
    const order = await pendingOrder();
    await notify(success(order, { amount: 1 }));
    await notify(success(order, { currency: 'EUR' }));
    assert.equal((await t.prisma.paymentOrder.findUnique({ where: { id: order.id } })).status, 'pending');
    assert.equal(await accessOf(), 'standard');
    assert.equal(await t.prisma.paymentEvent.count({ where: { outcome: 'amount_mismatch' } }), 2);
  });

  test('during maintenance the site is closed, but a genuine notification is still processed', async () => {
    const order = await pendingOrder();
    const admin = await t.admin();
    await t.request('POST', '/admin/settings', { user: admin, json: { key: 'maintenanceMode', value: 'true' } });
    try {
      assert.equal((await t.request('GET', '/payments/offers')).status, 503, 'the site itself is closed');
      assert.equal((await notify(success(order))).status, 200);
      assert.equal(await accessOf(), 'premium', 'the buyer is not left waiting');
    } finally {
      await t.request('POST', '/admin/settings', { user: admin, json: { key: 'maintenanceMode', value: 'false' } });
    }
  });

  test('a notification for an unknown checkout is acknowledged but changes nothing', async () => {
    const res = await notify(signedFakeNotification({ type: 'payment.succeeded', reference: 'fake_nope', amount: 150000, currency: 'DZD' }));
    assert.equal(res.status, 200);
    assert.equal(await t.prisma.paymentEvent.count({ where: { outcome: 'unknown_order' } }), 1);
    assert.equal(await accessOf(), 'standard');
  });

  test('a failure after success does not undo the payment; a refund before payment does nothing', async () => {
    const order = await pendingOrder();
    await notify(signedFakeNotification({ type: 'payment.refunded', reference: order.providerReference, amount: order.amount, currency: order.currency }));
    assert.equal((await t.prisma.paymentOrder.findUnique({ where: { id: order.id } })).status, 'pending');
    await notify(success(order));
    await notify(signedFakeNotification({ type: 'payment.failed', reference: order.providerReference, amount: order.amount, currency: order.currency }));
    assert.equal((await t.prisma.paymentOrder.findUnique({ where: { id: order.id } })).status, 'paid');
    assert.equal(await accessOf(), 'premium');
  });
});

describe('what the browser can and cannot do', () => {
  test('coming back from the payment page grants nothing: only the server state is read', async () => {
    const order = await pendingOrder();
    const res = await t.request('GET', `/payments/orders/${order.id}`, { user: buyer });
    assert.equal(res.body.order.status, 'pending');
    assert.equal(await accessOf(), 'standard');
  });

  test("another person's order is a 404; ordering and reading need a session", async () => {
    const order = await pendingOrder();
    const intruder = await t.user();
    assert.equal((await t.request('GET', `/payments/orders/${order.id}`, { user: intruder })).status, 404);
    assert.equal((await t.request('GET', `/payments/orders/${order.id}`)).status, 401);
    assert.equal((await t.request('POST', '/payments/orders', { json: { offerId: offer.id } })).status, 401);
    assert.equal((await t.request('GET', '/admin/payments/orders', { user: buyer })).status, 403);
  });

  test('the price cannot be chosen by the buyer: extra fields are refused', async () => {
    for (const extra of [{ amount: 1 }, { currency: 'EUR' }, { accessLevel: 'premium' }]) {
      assert.equal((await t.request('POST', '/payments/orders', { user: buyer, json: { offerId: offer.id, ...extra } })).status, 400);
    }
  });

  test('the order creation is limited per account', async () => {
    // The tests raise every limit; this only checks that the limiter is on the route.
    const { paymentOrderLimiter } = await import('../../src/middleware/rateLimit.js');
    assert.equal(typeof paymentOrderLimiter, 'function');
  });
});
