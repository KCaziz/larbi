// RBAC roles and content access tiers (TASKS.md section 1).
export const ROLES = { USER: 'user', ADMIN: 'admin' };
export const ACCESS_LEVELS = { STANDARD: 'standard', PREMIUM: 'premium' };
// Account status (P3-16): a suspended account keeps its data but cannot authenticate.
export const USER_STATUS = { ACTIVE: 'active', SUSPENDED: 'suspended' };

// A tier grants itself and every lower one.
const LEVEL_RANK = { standard: 0, premium: 1 };
export function hasAccessLevel(userLevel, requiredLevel) {
  return (LEVEL_RANK[userLevel] ?? -1) >= (LEVEL_RANK[requiredLevel] ?? Infinity);
}
