import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BellRing, Trash2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import Button from '../../components/ui/Button.jsx';

// Browser notifications (Web Push, P8-24), in addition to the application: only
// for who accepts, browser by browser, and switched off as easily as on. The
// message that reaches the browser carries no amount and no name — it says that
// something is waiting. Nothing is asked or registered until the person chooses.
const urlBase64ToUint8Array = (base64) => {
  const padded = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`.replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(padded);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
};

const supported = () => typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

export default function BrowserPush() {
  const { t } = useTranslation();
  const key = useApi('/fin/notifications/push/cle');
  const browsers = useApi('/fin/notifications/push/navigateurs');
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState(null);
  const [here, setHere] = useState(null); // the subscription of THIS browser, if any
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supported()) return;
    navigator.serviceWorker
      .getRegistration('/sw.js')
      .then((registration) => registration?.pushManager.getSubscription())
      .then((subscription) => setHere(subscription ?? null))
      .catch(() => setHere(null));
  }, [browsers.data]);

  if (key.status === 'loading' && !key.data) return null;
  const publicKey = key.data?.publicKey ?? null;

  async function enable() {
    setBusy(true);
    setMessage(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setMessage(t('notifications.push.denied'));
        return;
      }
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) });
      const json = subscription.toJSON();
      await api.post('/fin/notifications/push/abonnement', { consent: true, endpoint: json.endpoint, keys: json.keys });
      setMessage(t('notifications.push.enabled'));
      setConsent(false);
      browsers.reload();
    } catch {
      setMessage(t('notifications.push.failed'));
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setMessage(null);
    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw.js');
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await api.delete('/fin/notifications/push/abonnement', { body: { endpoint: subscription.endpoint } }).catch(() => null);
        await subscription.unsubscribe();
      }
      setHere(null);
      setMessage(t('notifications.push.disabled'));
      browsers.reload();
    } catch {
      setMessage(t('notifications.push.failed'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="notifications-push" aria-labelledby="notifications-push-title">
      <h3 id="notifications-push-title">
        <BellRing size={16} aria-hidden="true" /> {t('notifications.push.title')}
      </h3>
      <p className="fin-hint">{t('notifications.push.intro')}</p>

      {!supported() && <p className="fin-hint">{t('notifications.push.unsupported')}</p>}
      {supported() && !publicKey && <p className="fin-hint">{t('notifications.push.offOnServer')}</p>}

      {supported() && publicKey && (
        <>
          {here ? (
            <Button type="button" variant="secondary" disabled={busy} onClick={disable}>
              {t('notifications.push.turnOff')}
            </Button>
          ) : (
            <>
              <label className="notifications-check" htmlFor="push-consent">
                <input id="push-consent" type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
                {t('notifications.push.consent')}
              </label>
              <Button type="button" disabled={!consent || busy} onClick={enable}>
                {t('notifications.push.turnOn')}
              </Button>
            </>
          )}
        </>
      )}
      {message && (
        <p className="form-status" role="status">
          {message}
        </p>
      )}

      {(browsers.data?.navigateurs ?? []).length > 0 && (
        <ul className="notifications-push-list" aria-label={t('notifications.push.mine')}>
          {browsers.data.navigateurs.map((row) => (
            <li key={row.id}>
              <span>{row.label}</span>
              <button
                type="button"
                className="notifications-icon"
                aria-label={t('notifications.push.remove', { name: row.label })}
                onClick={async () => {
                  await api.delete('/fin/notifications/push/abonnement', { body: { id: row.id } }).catch(() => null);
                  browsers.reload();
                }}
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
