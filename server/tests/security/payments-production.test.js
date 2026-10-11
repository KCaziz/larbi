import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// P3-09 — payment in PRODUCTION mode. No real provider is wired yet (P3-10), so
// the default is "none": the site says payment is not available instead of
// pretending, and the simulated provider does not exist at all.

let t;
before(async () => {
  t = await boot({ production: true });
  await t.reset();
});
after(() => t.close());

describe('no payment provider configured', () => {
  test('offers are listed, but payment is announced as not available', async () => {
    await t.prisma.paymentOffer.create({ data: { name: 'Premium', amount: 100, currency: 'DZD', isActive: true } });
    const res = await t.request('GET', '/payments/offers');
    assert.equal(res.status, 200);
    assert.equal(res.body.available, false);
    assert.equal(res.body.offers.length, 1);
  });

  test('starting a payment answers 503 and creates no order', async () => {
    const offer = await t.prisma.paymentOffer.findFirst();
    const res = await t.request('POST', '/payments/orders', { user: await t.user(), json: { offerId: offer.id } });
    // The page knows it from the offers list (available: false); in production a
    // 5xx answer carries no detail at all (errorHandler).
    assert.equal(res.status, 503);
    assert.equal(await t.prisma.paymentOrder.count(), 0);
  });

  test('the simulated provider page and its notifications do not exist in production', async () => {
    assert.equal((await t.request('GET', '/payments/fake/checkout/fake_x')).status, 404);
    assert.equal((await t.request('POST', '/payments/fake/checkout/fake_x', { json: { action: 'pay' } })).status, 404);
    assert.equal((await t.request('POST', '/payments/webhook/fake', { body: '{}', headers: { 'content-type': 'application/json' } })).status, 404);
  });

  test('the simulated provider cannot be switched on in production', async () => {
    const { spawnSync } = await import('node:child_process');
    const res = spawnSync(process.execPath, ['--input-type=module', '-e', "await import('./src/config/env.js')"], {
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: 'production', PAYMENT_PROVIDER: 'fake' },
      encoding: 'utf8',
    });
    assert.notEqual(res.status, 0);
    assert.match(res.stderr, /PAYMENT_PROVIDER=fake is for development and tests only/);
  });
});
