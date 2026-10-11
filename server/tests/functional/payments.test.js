import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Payment base (P3-09) through the real API and database, with the SIMULATED
// provider (the real one is wired in P3-10). Attacks are in security/payments.test.js.

let t;
let admin;
let buyer;
let signedFakeNotification;

const adm = (method, path, json) => t.request(method, `/admin/payments${path}`, { user: admin, json });
const notify = ({ body, headers }) => t.request('POST', '/payments/webhook/fake', { body, headers });

async function offer(data = {}) {
  const res = await adm('POST', '/offers', { name: 'Accès premium', amount: 250000, currency: 'dzd', isActive: true, ...data });
  assert.equal(res.status, 201, res.text);
  return res.body.offer;
}

async function order(user = buyer, offerId) {
  const res = await t.request('POST', '/payments/orders', { user, json: { offerId } });
  assert.equal(res.status, 201, res.text);
  return res.body;
}

// The buyer's click on the simulated provider page (a form post, like a browser).
const fakePage = (redirectUrl, action) =>
  t.request('POST', redirectUrl.replace(/^\/api/, ''), { body: new URLSearchParams({ action }).toString(), headers: { 'content-type': 'application/x-www-form-urlencoded' }, redirect: 'manual' });

const accessOf = async (user) => (await t.prisma.user.findUnique({ where: { id: user.id } })).accessLevel;

before(async () => {
  t = await boot();
  ({ signedFakeNotification } = await import('../../src/services/payments/providers/fake.js'));
});
beforeEach(async () => {
  await t.reset();
  admin = await t.admin();
  buyer = await t.user({ name: 'Acheteur' });
});
after(() => t.close());

describe('offers', () => {
  test('an administrator creates offers (currency upper-cased, inactive unless said); visitors only see active ones, in order', async () => {
    const draft = (await adm('POST', '/offers', { name: 'Brouillon', amount: 100, currency: 'eur' })).body.offer;
    assert.equal(draft.isActive, false);
    assert.equal(draft.currency, 'EUR');
    await offer({ name: 'Annuel' });
    const res = await t.request('GET', '/payments/offers');
    assert.equal(res.status, 200);
    assert.equal(res.body.available, true, 'a provider is configured (the simulated one, in tests)');
    assert.deepEqual(res.body.offers.map((o) => o.name), ['Annuel']);
    assert.deepEqual(Object.keys(res.body.offers[0]).sort(), ['accessLevel', 'amount', 'currency', 'description', 'id', 'name']);
  });

  test('amounts are positive integers in the smallest unit; anything else is refused', async () => {
    for (const amount of [0, -5, 12.5, '100']) assert.equal((await adm('POST', '/offers', { name: 'X', amount, currency: 'DZD' })).status, 400, `amount ${amount}`);
    assert.equal((await adm('POST', '/offers', { name: 'X', amount: 100, currency: 'DZ' })).status, 400);
    assert.equal((await adm('POST', '/offers', { name: 'X', amount: 100, currency: 'DZD', accessLevel: 'gold' })).status, 400);
  });

  test("changing an offer's price never changes an existing order; an ordered offer cannot be deleted", async () => {
    const o = await offer();
    const { order: created } = await order(buyer, o.id);
    assert.equal((await adm('PATCH', `/offers/${o.id}`, { amount: 999 })).status, 200);
    const mine = await t.request('GET', `/payments/orders/${created.id}`, { user: buyer });
    assert.equal(mine.body.order.amount, 250000);
    assert.equal((await adm('DELETE', `/offers/${o.id}`)).status, 409);
    const unused = await offer({ name: 'Jamais commandée' });
    assert.equal((await adm('DELETE', `/offers/${unused.id}`)).status, 204);
  });
});

describe('ordering and paying', () => {
  test('the order copies the price from the server; the browser cannot send an amount', async () => {
    const o = await offer();
    assert.equal((await t.request('POST', '/payments/orders', { user: buyer, json: { offerId: o.id, amount: 1 } })).status, 400);
    const { order: created, redirectUrl } = await order(buyer, o.id);
    assert.equal(created.status, 'pending');
    assert.equal(created.amount, 250000);
    assert.equal(created.currency, 'DZD');
    assert.match(redirectUrl, /^\/api\/payments\/fake\/checkout\/fake_/);
  });

  test('an inactive or unknown offer cannot be ordered; nor what one already has', async () => {
    const inactive = await offer({ isActive: false });
    assert.equal((await t.request('POST', '/payments/orders', { user: buyer, json: { offerId: inactive.id } })).status, 404);
    assert.equal((await t.request('POST', '/payments/orders', { user: buyer, json: { offerId: '00000000-0000-4000-8000-000000000000' } })).status, 404);
    const premium = await t.user({ accessLevel: 'premium' });
    const res = await t.request('POST', '/payments/orders', { user: premium, json: { offerId: (await offer()).id } });
    assert.equal(res.status, 409);
    assert.deepEqual(res.body.error.details, { reason: 'alreadyGranted' });
  });

  test('paying on the provider page: the notification marks the order paid and grants premium, once', async () => {
    const o = await offer();
    const { order: created, redirectUrl } = await order(buyer, o.id);
    const page = await t.request('GET', redirectUrl.replace(/^\/api/, ''));
    assert.equal(page.status, 200);
    assert.match(page.text, /Accès premium/);

    const res = await fakePage(redirectUrl, 'pay');
    assert.equal(res.status, 303);
    assert.equal(res.headers.get('location'), `/paiement/retour?commande=${created.id}`);
    const after = (await t.request('GET', `/payments/orders/${created.id}`, { user: buyer })).body.order;
    assert.equal(after.status, 'paid');
    assert.ok(after.paidAt);
    assert.equal(await accessOf(buyer), 'premium');
    assert.equal(await t.prisma.paymentEvent.count({ where: { orderId: created.id, outcome: 'applied' } }), 1);
    assert.equal((await fakePage(redirectUrl, 'pay')).status, 303, 'paying again on a closed checkout changes nothing');
    assert.equal(await t.prisma.paymentEvent.count({ where: { orderId: created.id, outcome: 'applied' } }), 1);
  });

  test('cancelling on the provider page: order cancelled, no access', async () => {
    const { order: created, redirectUrl } = await order(buyer, (await offer()).id);
    await fakePage(redirectUrl, 'cancel');
    assert.equal((await t.prisma.paymentOrder.findUnique({ where: { id: created.id } })).status, 'cancelled');
    assert.equal(await accessOf(buyer), 'standard');
  });

  test('a refund withdraws the access bought, unless another paid order still grants it', async () => {
    const o = await offer();
    const { order: first, redirectUrl } = await order(buyer, o.id);
    await fakePage(redirectUrl, 'pay');
    const refund = (ref, amount = 250000) => notify(signedFakeNotification({ type: 'payment.refunded', reference: ref, amount, currency: 'DZD' }));
    const firstRef = (await t.prisma.paymentOrder.findUnique({ where: { id: first.id } })).providerReference;
    assert.equal((await refund(firstRef)).status, 200);
    const refunded = await t.prisma.paymentOrder.findUnique({ where: { id: first.id } });
    assert.equal(refunded.status, 'refunded');
    assert.ok(refunded.refundedAt);
    assert.equal(await accessOf(buyer), 'standard');

    // Two paid orders (bought again after the refund): refunding one keeps premium.
    const second = await order(buyer, o.id);
    await fakePage(second.redirectUrl, 'pay');
    await t.prisma.user.update({ where: { id: buyer.id }, data: { accessLevel: 'standard' } });
    const third = await order(buyer, o.id);
    await fakePage(third.redirectUrl, 'pay');
    const secondRef = (await t.prisma.paymentOrder.findUnique({ where: { id: second.order.id } })).providerReference;
    await refund(secondRef);
    assert.equal(await accessOf(buyer), 'premium', 'the third order is still paid');
  });

  test('"my payments" lists only my orders; another person\'s order is a 404', async () => {
    const o = await offer();
    const mine = await order(buyer, o.id);
    const other = await t.user();
    const theirs = await order(other, o.id);
    const list = await t.request('GET', '/payments/orders', { user: buyer });
    assert.deepEqual(list.body.orders.map((x) => x.id), [mine.order.id]);
    assert.equal(list.body.orders[0].offer.name, 'Accès premium');
    assert.equal((await t.request('GET', `/payments/orders/${theirs.order.id}`, { user: buyer })).status, 404);
  });
});

describe('administration and consistency', () => {
  test('the administrator sees every order (read-only), filtered by status', async () => {
    const o = await offer();
    const a = await order(buyer, o.id);
    await fakePage(a.redirectUrl, 'pay');
    await order(await t.user(), o.id);
    const all = await adm('GET', '/orders');
    assert.equal(all.body.orders.length, 2);
    assert.equal(all.body.orders.find((x) => x.status === 'paid').user.email, buyer.email);
    assert.equal((await adm('GET', '/orders?status=paid')).body.orders.length, 1);
    assert.equal((await adm('GET', '/orders?status=')).body.orders.length, 2, 'empty = every status');
    assert.equal((await adm('GET', '/orders?status=whatever')).status, 400);
    assert.equal((await t.request('GET', '/admin/payments/orders', { user: buyer })).status, 403);
  });

  test('the global consistency check: every paid order was paid by a notification and grants its access', async () => {
    const { checkConsistency, privateDirOf } = await import('../../src/services/consistency.service.js');
    const o = await offer();
    const a = await order(buyer, o.id);
    await fakePage(a.redirectUrl, 'pay');
    const payment = (p) => p.filter((x) => /order/.test(x.detail));
    assert.deepEqual(payment(await checkConsistency(t.prisma, { privateDir: privateDirOf(t.storageDir) })), []);

    // Marked paid without any notification (what a bug or a hand edit would do):
    const forged = await order(await t.user(), o.id);
    await t.prisma.paymentOrder.update({ where: { id: forged.order.id }, data: { status: 'paid', paidAt: new Date() } });
    const rules = payment(await checkConsistency(t.prisma, { privateDir: privateDirOf(t.storageDir) })).map((x) => x.rule);
    assert.deepEqual(rules.sort(), ['a paid order grants its access', 'a paid order has the provider notification that paid it']);
  });
});
