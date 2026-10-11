import { env } from '../../../config/env.js';
import { fakeProvider } from './fake.js';

// The payment provider in use, chosen by PAYMENT_PROVIDER (P3-09). The real one
// is added here when the client has chosen it (P3-10); until then production has
// none and the site says payment is not available yet, instead of pretending.
//
// An adapter exposes:
//   name                                   short id, stored on orders and events
//   createCheckout({ order, offer, user }) -> { reference, redirectUrl }
//   verifyNotification(rawBody, headers)  -> normalised event | null (not authentic)
const PROVIDERS = { fake: fakeProvider };

export function getPaymentProvider() {
  return PROVIDERS[env.paymentProvider] ?? null;
}

export function getPaymentProviderByName(name) {
  const provider = getPaymentProvider();
  return provider && provider.name === name ? provider : null;
}
