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

export function signSession(userId) {
  return jwt.sign({}, env.jwtSecret, {
    subject: userId,
    expiresIn: env.jwtExpiresInSeconds,
    algorithm: 'HS256',
  });
}

export function verifySession(token) {
  return jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
}

export function setSessionCookie(res, userId) {
  res.cookie(SESSION_COOKIE, signSession(userId), {
    ...cookieOptions,
    maxAge: env.jwtExpiresInSeconds * 1000,
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE, cookieOptions);
}
