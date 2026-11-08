import { ACCESS_LEVELS, ROLES, hasAccessLevel } from '../constants/roles.js';
import { HttpError } from '../utils/httpError.js';

// P10-06 — what a subscription opens (client's rule, 2026-11-08): inviting
// other people into a shared space, and several screens at once. An
// administrator is never restricted.
export const isSubscriber = (user) => Boolean(user) && (user.role === ROLES.ADMIN || hasAccessLevel(user.accessLevel, ACCESS_LEVELS.PREMIUM));

export function assertSubscriber(user, feature) {
  if (!isSubscriber(user)) throw new HttpError(403, 'Subscription required', { reason: 'subscriptionRequired', feature });
}
