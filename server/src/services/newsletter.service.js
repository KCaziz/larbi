import { createHmac, timingSafeEqual } from 'node:crypto';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { ARTICLE_STATUS } from '../constants/blog.js';
import { mailAvailable, sendMail } from './mail.service.js';

// Newsletter (P3-05). Double opt-in: nobody receives anything until the OWNER of the
// address clicked the link sent to it (the confirmation date is the proof of consent).
//
// Links carry a signed token, `<subscriberId>.<expiry>.<signature>`: HMAC-SHA256 of
// (purpose, id, expiry) with a key derived from JWT_SECRET. Nothing is stored, a token
// cannot be forged, and a confirmation token cannot be used to unsubscribe (or vice versa).

export const SUBSCRIBER_STATUS = { PENDING: 'pending', CONFIRMED: 'confirmed', UNSUBSCRIBED: 'unsubscribed' };
export const LOCALES = ['fr', 'en', 'ar'];
const CONFIRM_TTL_SECONDS = 7 * 24 * 60 * 60;
// One address can be mailed a confirmation at most once every 5 minutes: nobody can
// use the form to flood a mailbox, even by changing IP address.
const RESEND_DELAY_MS = 5 * 60 * 1000;

const KEY = createHmac('sha256', env.jwtSecret).update('newsletter-tokens-v1').digest();
const sign = (purpose, id, expiry) => createHmac('sha256', KEY).update(`${purpose}.${id}.${expiry}`).digest('base64url');

export function makeToken(purpose, id, ttlSeconds = 0) {
  const expiry = ttlSeconds ? Math.floor(Date.now() / 1000) + ttlSeconds : 0;
  return `${id}.${expiry}.${sign(purpose, id, expiry)}`;
}

// Returns the subscriber id, or null for anything that is not a valid, unexpired token.
export function verifyToken(purpose, token) {
  const parts = String(token ?? '').split('.');
  if (parts.length !== 3) return null;
  const [id, expiryText, signature] = parts;
  const expiry = Number(expiryText);
  if (!Number.isInteger(expiry) || expiry < 0) return null;
  if (expiry !== 0 && expiry < Math.floor(Date.now() / 1000)) return null;
  const expected = Buffer.from(sign(purpose, id, expiry));
  const given = Buffer.from(signature);
  return given.length === expected.length && timingSafeEqual(given, expected) ? id : null;
}

export const confirmUrl = (id) => `${env.publicUrl}/newsletter/confirmer?token=${makeToken('confirm', id, CONFIRM_TTL_SECONDS)}`;
export const unsubscribeUrl = (id) => `${env.publicUrl}/newsletter/desinscription?token=${makeToken('unsubscribe', id)}`;

// ---------------------------------------------------------------- e-mail texts
const TEXTS = {
  fr: {
    subject: 'Confirmez votre inscription à la newsletter',
    body: (url) => `Bonjour,\n\nPour confirmer votre inscription à la newsletter, ouvrez ce lien (valable 7 jours) :\n${url}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez simplement ce message : vous ne recevrez rien.`,
    digestSubject: 'Les derniers articles',
    digestIntro: 'Voici les derniers articles publiés :',
    premium: '(réservé aux comptes premium)',
    unsub: 'Se désabonner :',
  },
  en: {
    subject: 'Confirm your newsletter subscription',
    body: (url) => `Hello,\n\nTo confirm your newsletter subscription, open this link (valid for 7 days):\n${url}\n\nIf you did not ask for this, simply ignore this message: you will receive nothing.`,
    digestSubject: 'Latest articles',
    digestIntro: 'Here are the latest published articles:',
    premium: '(premium accounts only)',
    unsub: 'Unsubscribe:',
  },
  ar: {
    subject: 'أكّد اشتراكك في النشرة البريدية',
    body: (url) => `مرحبًا،\n\nلتأكيد اشتراكك في النشرة البريدية، افتح هذا الرابط (صالح لمدة 7 أيام):\n${url}\n\nإذا لم تطلب ذلك، تجاهل هذه الرسالة ولن تتلقى شيئًا.`,
    digestSubject: 'أحدث المقالات',
    digestIntro: 'هذه أحدث المقالات المنشورة:',
    premium: '(للحسابات المميزة فقط)',
    unsub: 'إلغاء الاشتراك:',
  },
};
export const textsFor = (locale) => TEXTS[locale] ?? TEXTS.fr;

// ------------------------------------------------------------------- subscribe
// The public answer never depends on whether the address is already known (no way to
// discover who is subscribed): the caller always gets the same "check your mailbox".
export async function subscribe(email, locale) {
  if (!mailAvailable()) return { available: false };

  let subscriber = await prisma.newsletterSubscriber.findUnique({ where: { email } });
  if (subscriber?.status === SUBSCRIBER_STATUS.CONFIRMED) return { available: true };
  // The delay only concerns an address that is still waiting for its confirmation: a person
  // who unsubscribed and comes back is a new request and is answered at once.
  if (
    subscriber?.status === SUBSCRIBER_STATUS.PENDING &&
    subscriber.lastEmailAt &&
    Date.now() - subscriber.lastEmailAt.getTime() < RESEND_DELAY_MS
  ) {
    return { available: true };
  }

  if (!subscriber) {
    try {
      subscriber = await prisma.newsletterSubscriber.create({ data: { email, locale } });
    } catch (err) {
      // Two simultaneous requests for the same address: the unique index kept one row.
      if (err?.code !== 'P2002') throw err;
      return { available: true };
    }
  } else {
    // A person who left and comes back must confirm again.
    subscriber = await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: { status: SUBSCRIBER_STATUS.PENDING, unsubscribedAt: null, confirmedAt: null, locale },
    });
  }

  const texts = textsFor(subscriber.locale);
  await sendMail({ to: subscriber.email, subject: texts.subject, text: texts.body(confirmUrl(subscriber.id)) });
  await prisma.newsletterSubscriber.update({ where: { id: subscriber.id }, data: { lastEmailAt: new Date() } });
  return { available: true };
}

// ------------------------------------------------------- confirm / unsubscribe
// Both return false when the link is invalid. Both are idempotent: clicking twice
// gives the same result.
export async function confirm(token) {
  const id = verifyToken('confirm', token);
  if (!id) return false;
  const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { id } });
  // A confirmation link must never bring back someone who has unsubscribed since.
  if (!subscriber || subscriber.status === SUBSCRIBER_STATUS.UNSUBSCRIBED) return false;
  if (subscriber.status === SUBSCRIBER_STATUS.PENDING) {
    await prisma.newsletterSubscriber.update({
      where: { id },
      data: { status: SUBSCRIBER_STATUS.CONFIRMED, confirmedAt: new Date() },
    });
  }
  return true;
}

export async function unsubscribe(token) {
  const id = verifyToken('unsubscribe', token);
  if (!id) return false;
  const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { id } });
  if (!subscriber) return true; // already erased: the goal is reached
  if (subscriber.status === SUBSCRIBER_STATUS.PENDING) {
    // Never consented: nothing to remember, the row is erased.
    await prisma.newsletterSubscriber.delete({ where: { id } });
  } else if (subscriber.status === SUBSCRIBER_STATUS.CONFIRMED) {
    // Kept as "unsubscribed" (address + date) so the choice is honoured later.
    await prisma.newsletterSubscriber.update({
      where: { id },
      data: { status: SUBSCRIBER_STATUS.UNSUBSCRIBED, unsubscribedAt: new Date() },
    });
  }
  return true;
}

// ----------------------------------------------------------- digest preparation
const escapeHtml = (text) => text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Builds (does NOT send) the newsletter of the latest published articles, per language,
// and counts who would receive it. `unsubscribeUrl` is left as a placeholder: it is
// personal, filled in for each recipient at sending time, together with the
// List-Unsubscribe headers described in `headers`.
export async function prepareDigest({ limit = 5, since } = {}) {
  const articles = await prisma.article.findMany({
    where: { status: ARTICLE_STATUS.PUBLISHED, ...(since ? { publishedAt: { gte: since } } : {}) },
    orderBy: [{ publishedAt: 'desc' }, { id: 'asc' }],
    take: limit,
    select: { slug: true, title: true, excerpt: true, requiredAccessLevel: true, publishedAt: true },
  });
  const grouped = await prisma.newsletterSubscriber.groupBy({
    by: ['locale'],
    where: { status: SUBSCRIBER_STATUS.CONFIRMED },
    _count: { _all: true },
  });
  const recipientsByLocale = Object.fromEntries(LOCALES.map((l) => [l, grouped.find((g) => g.locale === l)?._count._all ?? 0]));

  const items = articles.map((a) => ({
    title: a.title,
    excerpt: a.excerpt,
    url: `${env.publicUrl}/blog/${a.slug}`,
    premium: a.requiredAccessLevel === 'premium',
    publishedAt: a.publishedAt,
  }));

  const messages = Object.fromEntries(
    LOCALES.map((locale) => {
      const t = textsFor(locale);
      const text = [
        t.digestIntro,
        '',
        ...items.map((i) => `- ${i.title}${i.premium ? ` ${t.premium}` : ''}\n  ${i.excerpt}\n  ${i.url}`),
        '',
        `${t.unsub} {{unsubscribeUrl}}`,
      ].join('\n');
      const html = [
        `<p>${escapeHtml(t.digestIntro)}</p><ul>`,
        ...items.map((i) => `<li><a href="${escapeHtml(i.url)}">${escapeHtml(i.title)}</a>${i.premium ? ` <em>${escapeHtml(t.premium)}</em>` : ''}<br>${escapeHtml(i.excerpt)}</li>`),
        `</ul><p><a href="{{unsubscribeUrl}}">${escapeHtml(t.unsub)}</a></p>`,
      ].join('');
      return [locale, { subject: t.digestSubject, text, html }];
    }),
  );

  return {
    articles: items,
    recipients: { total: Object.values(recipientsByLocale).reduce((a, b) => a + b, 0), byLocale: recipientsByLocale },
    messages,
    // Header to add to each message. The one-click variant (RFC 8058) needs an API endpoint
    // that accepts a POST: to be added together with the real sending.
    headers: { 'List-Unsubscribe': '<{{unsubscribeUrl}}>' },
    sendingAvailable: mailAvailable(),
  };
}
