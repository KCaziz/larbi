// Web Push (P8-24): notifications in the person's BROWSER, in addition to the
// application — only for who accepts it, and only on the browsers they chose.
//
// What is sent is deliberately EMPTY of money: a push travels through the
// browser maker's push service, so the message says only that there is
// something to read, and where. Amounts, names and labels stay in the
// application, behind the session.
//
// The transport is a replaceable object so the tests can check what would be
// sent without a real push service; in production it is the `web-push` library.
import webpush from 'web-push';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

export const pushTransport = { send: (subscription, payload, options) => webpush.sendNotification(subscription, payload, options) };

let configured = false;
export function pushEnabled() {
  if (!env.vapidPublicKey || !env.vapidPrivateKey || !env.vapidSubject) return false;
  if (!configured) {
    webpush.setVapidDetails(env.vapidSubject, env.vapidPublicKey, env.vapidPrivateKey);
    configured = true;
  }
  return true;
}

// The browser's own name, from its User-Agent only.
export function browserLabel(userAgent) {
  const ua = String(userAgent ?? '');
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Navigateur';
  const system = /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Windows/.test(ua) ? 'Windows' : /Mac OS X/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : '';
  return `${browser}${system ? ` · ${system}` : ''}`.slice(0, 80);
}

export const publicKey = () => (pushEnabled() ? env.vapidPublicKey : null);

export async function subscribe(prisma, userId, { endpoint, keys }, userAgent) {
  if (!pushEnabled()) throw new HttpError(503, 'Browser notifications are not available on this server', { reason: 'pushOff' });
  // One browser, one row: subscribing again (even from another account of the
  // same browser) moves it to the person who just asked.
  const label = browserLabel(userAgent);
  const row = await prisma.finPushSubscription.upsert({
    where: { endpoint },
    create: { userId, endpoint, p256dh: keys.p256dh, auth: keys.auth, label },
    update: { userId, p256dh: keys.p256dh, auth: keys.auth, label },
    select: { id: true, label: true, createdAt: true },
  });
  return row;
}

export const listSubscriptions = (prisma, userId) => prisma.finPushSubscription.findMany({ where: { userId }, select: { id: true, label: true, createdAt: true, lastSentAt: true }, orderBy: { createdAt: 'desc' } });

export async function unsubscribe(prisma, userId, { endpoint, id }) {
  const result = await prisma.finPushSubscription.deleteMany({ where: { userId, ...(endpoint ? { endpoint } : { id }) } });
  if (result.count === 0) throw new HttpError(404, 'Subscription not found');
  return { removed: result.count };
}

/**
 * Tells every browser of the person that something is waiting. Never throws: a
 * failing push must not undo the notification it announces. A browser the push
 * service no longer knows (404, 410) is forgotten.
 */
export async function pushToUser(prisma, userId, { link = '/app/notifications', tag = null } = {}) {
  if (!pushEnabled()) return 0;
  let sent = 0;
  try {
    const subscriptions = await prisma.finPushSubscription.findMany({ where: { userId } });
    for (const subscription of subscriptions) {
      try {
        // eslint-disable-next-line no-await-in-loop -- a person has a few browsers
        await pushTransport.send(
          { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
          JSON.stringify({ title: 'FINCLUDIA', body: 'generic', url: link, tag }),
          { TTL: 60 * 60 * 24 },
        );
        sent += 1;
        // eslint-disable-next-line no-await-in-loop
        await prisma.finPushSubscription.update({ where: { id: subscription.id }, data: { lastSentAt: new Date() } });
      } catch (err) {
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          // eslint-disable-next-line no-await-in-loop
          await prisma.finPushSubscription.delete({ where: { id: subscription.id } }).catch(() => null);
        }
      }
    }
  } catch {
    /* the notification is already saved; the push is a courtesy */
  }
  return sent;
}
