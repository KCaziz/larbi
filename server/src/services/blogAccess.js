import { ACCESS_LEVELS, ROLES, hasAccessLevel } from '../constants/roles.js';

// Who may READ an article's text and files (P3-04). Every decision is made here,
// on the server, from the session: the browser only displays the answer.
//   standard article -> everybody, logged in or not
//   premium article  -> a premium account (administrators can always read)
// Returns null when readable, otherwise the reason the reader is told.
export const LOCK_REASON = { LOGIN: 'login_required', PREMIUM: 'premium_required' };

export function articleLock(user, article) {
  if (article.requiredAccessLevel === ACCESS_LEVELS.STANDARD) return null;
  if (!user) return LOCK_REASON.LOGIN;
  if (user.role === ROLES.ADMIN || hasAccessLevel(user.accessLevel, article.requiredAccessLevel)) return null;
  return LOCK_REASON.PREMIUM;
}

// The access levels of the articles this viewer can read (for database filters).
export function readableLevels(user) {
  const isAdmin = user?.role === ROLES.ADMIN;
  return Object.values(ACCESS_LEVELS).filter((level) => isAdmin || (user ? hasAccessLevel(user.accessLevel, level) : level === ACCESS_LEVELS.STANDARD));
}

// Recommendation score: an article aimed at the viewer's account type comes first.
export const TARGET_BONUS = 3;
export const isTargetedAt = (article, user) => Boolean(user && article.targetAccountTypes?.includes(user.accountType));
