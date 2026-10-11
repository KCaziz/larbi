import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/httpError.js';
import { SESSION_COOKIE, verifySession } from '../services/token.service.js';
import { hasAccessLevel } from '../constants/roles.js';
import { isAdultAgeRange } from '../constants/finPublics.js';

// Loads the user from the DB on every request (not from token claims), so a
// role/level change or account deletion takes effect immediately.
export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[SESSION_COOKIE];
    if (!token) throw new HttpError(401, 'Authentication required');

    let payload;
    try {
      payload = verifySession(token);
    } catch {
      throw new HttpError(401, 'Invalid or expired session');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    // A suspended account (P3-16) is treated exactly like a deleted one: the
    // session dies at once, on every route, without revealing why.
    if (!user || user.status === 'suspended') throw new HttpError(401, 'Invalid or expired session');

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export const requireRole =
  (...roles) =>
  (req, res, next) =>
    roles.includes(req.user?.role) ? next() : next(new HttpError(403, 'Forbidden'));

export const requireAccessLevel = (level) => (req, res, next) =>
  hasAccessLevel(req.user?.accessLevel, level)
    ? next()
    : next(new HttpError(403, 'Premium access required'));

// Functions reserved to adults (FINCLUDIA, P3-18 / rule 18 of TASKS.md): refused
// server-side, never only hidden in the UI. Deny by default — an account that
// has not given its age bracket yet (isAdultAgeRange -> null) is treated the
// same as a minor, not the same as an adult.
export const requireAdult = (req, res, next) =>
  isAdultAgeRange(req.user?.finAgeRange) === true ? next() : next(new HttpError(403, 'Reserved to adults'));

// For public routes whose answer depends on WHO asks (blog: premium articles).
// Never rejects: no cookie, an expired session or a deleted account simply mean
// "anonymous" (req.user = null). The decision itself is made by the controller.
export async function optionalAuth(req, res, next) {
  req.user = null;
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return next();
  try {
    const payload = verifySession(token);
    req.user = await prisma.user.findUnique({ where: { id: payload.sub } });
  } catch (err) {
    // A bad token is "anonymous"; a database failure is a real error.
    if (err?.name !== 'JsonWebTokenError' && err?.name !== 'TokenExpiredError' && err?.name !== 'NotBeforeError') {
      return next(err);
    }
  }
  return next();
}
