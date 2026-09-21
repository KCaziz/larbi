import rateLimit from 'express-rate-limit';
import { logSecurityEvent } from '../utils/securityLog.js';

// Brute-force / credential-stuffing protection on auth endpoints.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AUTH_RATE_LIMIT) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many attempts, please try again later' } },
});

// Public contact form: stricter, it is unauthenticated and writes to the DB.
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: Number(process.env.CONTACT_RATE_LIMIT) || 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many messages, please try again later' } },
});

// Newsletter subscription: unauthenticated, writes to the DB and sends an e-mail to an
// address chosen by the caller, so it is the most abusable public route (mail bombing).
export const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: Number(process.env.NEWSLETTER_RATE_LIMIT) || 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many attempts, please try again later' } },
});

// Confirmation / unsubscription links: cheap, signed, but still public.
export const newsletterLinkLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: Number(process.env.NEWSLETTER_LINK_RATE_LIMIT) || 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many requests, please try again later' } },
});

// Quiz attempts (P3-13), per ACCOUNT (the routes are behind requireAuth): a real learner starts
// and submits a handful of attempts; this only stops scripted guessing of the answers.
export const quizLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: Number(process.env.QUIZ_RATE_LIMIT) || 40,
  keyGenerator: (req) => `user:${req.user.id}`,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many attempts, please try again later' } },
});

// Public certificate verification: the numbers are unguessable (60 bits), the
// limit protects the database from being hammered by scripts.
export const certificateVerifyLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: Number(process.env.CERTIFICATE_RATE_LIMIT) || 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many requests, please try again later' } },
});

// Protected media (lesson files, covers). Both limiters are keyed by ACCOUNT (the
// routes are behind requireAuth), so sharing an IP address never punishes anyone else.
// In-memory counters: per process. Several instances would need a shared store (P5-06).
const byAccount = (req) => `user:${req.user.id}`;

// Volume: a real learner needs a handful of requests (a video = a few Range calls).
// This only stops scripted bulk downloading.
export const mediaVolumeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: Number(process.env.MEDIA_RATE_LIMIT) || 300,
  keyGenerator: byAccount,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many requests, please try again later' } },
});

// Refused or failed requests only (successful ones are not counted): stops probing
// of ids and of other people's formations without ever affecting normal use.
export const mediaDeniedLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: Number(process.env.MEDIA_DENIED_LIMIT) || 30,
  skipSuccessfulRequests: true,
  keyGenerator: byAccount,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    // Traced once per lock-out, not once per blocked request.
    if (req.rateLimit.used === req.rateLimit.limit + 1) {
      logSecurityEvent('media_probing_blocked', { userId: req.user.id });
    }
    res.status(options.statusCode).json({ error: { message: 'Too many refused requests, please try again later' } });
  },
});

// Public read-only API (blog): generous, per IP. Protects the database from scripts,
// never gets in the way of a person reading.
export const publicReadLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: Number(process.env.PUBLIC_READ_LIMIT) || 240,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many requests, please try again later' } },
});
