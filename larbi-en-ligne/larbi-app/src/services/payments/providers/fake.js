import { createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { NOTIFICATION_TOLERANCE_SECONDS, PAYMENT_EVENT } from '../../../constants/payments.js';

// SIMULATED payment provider, for tests and local development ONLY (P3-09).
// It behaves like a real hosted payment page: the browser is sent to a page
// that is not ours (here: /api/payments/fake/checkout/...), and the result
// reaches the server through a SIGNED notification, never through the browser.
// It is refused in production (config/env.js) and its routes are not even
// registered there (routes/payments.routes.js).
//
// Signature: header "x-fake-signature: t=<unix seconds>,v1=<hex HMAC-SHA256 of
// `${t}.${raw body}`>", the scheme most real providers use.

// A secret per process unless one is configured: the simulated page and the
// webhook live in the same process, so they always agree.
const secret = process.env.FAKE_PAYMENT_SECRET || randomBytes(32).toString('hex');

export const SIGNATURE_HEADER = 'x-fake-signature';

const sign = (timestamp, rawBody) => createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');

export const fakeProvider = {
  name: 'fake',

  // A checkout session: the provider's own reference, and where to send the buyer.
  async createCheckout() {
    const reference = `fake_${randomUUID()}`;
    return { reference, redirectUrl: `/api/payments/fake/checkout/${reference}` };
  },

  // Returns the normalised event, or null when the notification is not authentic
  // (missing / wrong signature, too old, malformed). Never throws on bad input.
  verifyNotification(rawBody, headers) {
    const header = String(headers[SIGNATURE_HEADER] ?? '');
    const parts = Object.fromEntries(header.split(',').map((p) => p.trim().split('=')));
    const timestamp = Number(parts.t);
    if (!Number.isInteger(timestamp) || !/^[a-f0-9]{64}$/.test(parts.v1 ?? '')) return null;
    if (Math.abs(Date.now() / 1000 - timestamp) > NOTIFICATION_TOLERANCE_SECONDS) return null;
    const expected = Buffer.from(sign(timestamp, rawBody), 'hex');
    const received = Buffer.from(parts.v1, 'hex');
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

    let data;
    try {
      data = JSON.parse(rawBody.toString('utf8'));
    } catch {
      return null;
    }
    const known = Object.values(PAYMENT_EVENT);
    if (
      typeof data?.id !== 'string' ||
      !data.id ||
      data.id.length > 191 ||
      !known.includes(data.type) ||
      typeof data.reference !== 'string' ||
      !Number.isInteger(data.amount) ||
      typeof data.currency !== 'string'
    ) {
      return null;
    }
    return { externalId: data.id, type: data.type, reference: data.reference, amount: data.amount, currency: data.currency };
  },
};

// Builds a notification exactly as the simulated provider sends it. Used by the
// simulated checkout page, and by the tests (to send genuine ones, and forged ones).
export function signedFakeNotification(event, { timestamp = Math.floor(Date.now() / 1000) } = {}) {
  const body = JSON.stringify({ id: `evt_${randomUUID()}`, ...event });
  return { body, headers: { 'content-type': 'application/json', [SIGNATURE_HEADER]: `t=${timestamp},v1=${sign(timestamp, body)}` } };
}
