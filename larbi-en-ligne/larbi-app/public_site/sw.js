/* FINCLUDIA — service worker for browser notifications (Web Push, P8-24).
 *
 * It does ONE thing: show the notification the server announced, and open the
 * right page when it is clicked. It caches nothing and touches no request, so it
 * can never serve a stale page or hold anybody's data. It is registered only when
 * a person turns browser notifications on, and removed when they turn them off.
 *
 * The push message carries no amount, no name and no label — only that something
 * is waiting and where. The words are chosen here, from the browser's language.
 */
const WORDS = {
  fr: 'Vous avez une nouvelle notification.',
  en: 'You have a new notification.',
  ar: 'لديك إشعار جديد.',
};

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }
  const language = (self.navigator.language || 'fr').slice(0, 2);
  const options = {
    body: WORDS[language] ?? WORDS.fr,
    icon: '/favicon.png',
    badge: '/favicon.png',
    tag: data.tag || 'fincludia',
    // Only an address of THIS site is ever opened.
    data: { url: typeof data.url === 'string' && data.url.startsWith('/') ? data.url : '/app/notifications' },
  };
  event.waitUntil(self.registration.showNotification(data.title || 'FINCLUDIA', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/app/notifications';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const open = windows.find((client) => 'focus' in client);
      if (open) {
        open.navigate(url);
        return open.focus();
      }
      return self.clients.openWindow(url);
    }),
  );
});
