import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { fakeProvider, signedFakeNotification, SIGNATURE_HEADER } from '../../src/services/payments/providers/fake.js';
import { createOfferSchema, createOrderSchema, updateOfferSchema } from '../../src/validation/payments.schemas.js';

// Payment base (P3-09): signature checking of the simulated provider and the
// validation of what the API accepts, without any database.
const event = { type: 'payment.succeeded', reference: 'fake_1', amount: 1000, currency: 'DZD' };
const verify = ({ body, headers }) => fakeProvider.verifyNotification(Buffer.from(body), headers);

describe('notification signature (simulated provider)', () => {
  test('a genuine notification is accepted and normalised', () => {
    const n = signedFakeNotification(event);
    const parsed = verify(n);
    assert.equal(parsed.type, 'payment.succeeded');
    assert.equal(parsed.reference, 'fake_1');
    assert.equal(parsed.amount, 1000);
    assert.match(parsed.externalId, /^evt_/);
  });

  test('anything else is null, never an exception', () => {
    const n = signedFakeNotification(event);
    assert.equal(verify({ body: n.body.replace('1000', '1001'), headers: n.headers }), null, 'body changed after signing');
    assert.equal(verify({ body: n.body, headers: {} }), null, 'no signature');
    assert.equal(verify({ body: n.body, headers: { [SIGNATURE_HEADER]: 't=abc,v1=zz' } }), null, 'malformed signature');
    assert.equal(verify(signedFakeNotification(event, { timestamp: Math.floor(Date.now() / 1000) - 301 })), null, 'too old');
    assert.equal(verify(signedFakeNotification(event, { timestamp: Math.floor(Date.now() / 1000) + 301 })), null, 'from the future');
    assert.equal(verify(signedFakeNotification({ ...event, type: 'payment.gift' })), null, 'unknown event type');
    assert.equal(verify(signedFakeNotification({ ...event, amount: 10.5 })), null, 'amount not an integer');
  });
});

describe('payment validation', () => {
  test('an order names an offer, and nothing else', () => {
    const id = '00000000-0000-4000-8000-000000000000';
    assert.equal(createOrderSchema.safeParse({ offerId: id }).success, true);
    assert.equal(createOrderSchema.safeParse({ offerId: id, amount: 1 }).success, false);
    assert.equal(createOrderSchema.safeParse({ offerId: 'x' }).success, false);
  });

  test('an offer: integer amount in the smallest unit, ISO currency (upper-cased), premium only', () => {
    assert.deepEqual(createOfferSchema.parse({ name: ' Premium ', amount: 100, currency: 'eur' }), {
      name: 'Premium',
      amount: 100,
      currency: 'EUR',
      description: null,
      accessLevel: 'premium',
      isActive: false,
    });
    assert.equal(createOfferSchema.safeParse({ name: 'P', amount: 1.5, currency: 'EUR' }).success, false);
    assert.equal(createOfferSchema.safeParse({ name: 'P', amount: 100, currency: 'EURO' }).success, false);
    assert.equal(updateOfferSchema.safeParse({ accessLevel: 'admin' }).success, false);
  });
});
