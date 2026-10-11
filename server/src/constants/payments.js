// Payment (P3-09). Kept in sync with the CHECK constraints of the
// `payments` migration.
export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

// What a provider can tell us about a checkout, once its notification is
// authenticated. Each adapter translates its own vocabulary into these.
export const PAYMENT_EVENT = {
  SUCCEEDED: 'payment.succeeded',
  FAILED: 'payment.failed',
  CANCELLED: 'payment.cancelled',
  REFUNDED: 'payment.refunded',
};

export const EVENT_OUTCOME = {
  APPLIED: 'applied',
  IGNORED: 'ignored',
  UNKNOWN_ORDER: 'unknown_order',
  AMOUNT_MISMATCH: 'amount_mismatch',
};

// Access levels a purchase may grant (only premium exists, P1-06 / P3-04).
export const PURCHASABLE_ACCESS_LEVELS = ['premium'];

// Largest notification body accepted (bytes): real ones are a few kilobytes.
export const MAX_NOTIFICATION_BYTES = 64 * 1024;

// A signed notification older (or further in the future) than this is refused:
// a captured notification cannot be replayed later.
export const NOTIFICATION_TOLERANCE_SECONDS = 300;
