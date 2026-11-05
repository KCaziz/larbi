import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const SESSION_COOKIE = 'session';

// Session token lives in an httpOnly cookie so page JavaScript (and thus any
// XSS) can never read it. SameSite=Lax blocks cross-site POSTs (CSRF).
export const cookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: 'lax',
  path: '/',
};

export function signSession(userId, sessionId = null) {
  return jwt.sign({}, env.jwtSecret, {
    subject: userId,
    // The id of the revocable session row (P8-20), when there is one.
    ...(sessionId ? { jwtid: sessionId } : {}),
    expiresIn: env.jwtExpiresInSeconds,
    algorithm: 'HS256',
  });
}

export function verifySession(token) {
  return jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
}

export function setSessionCookie(res, userId, sessionId = null) {
  res.cookie(SESSION_COOKIE, signSession(userId, sessionId), {
    ...cookieOptions,
    maxAge: env.jwtExpiresInSeconds * 1000,
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE, cookieOptions);
}
