import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatMoney } from '../../lib/money.js';
import Button from '../ui/Button.jsx';
import Notice from '../ui/Notice.jsx';
import LoadingState from '../ui/LoadingState.jsx';
import './Payments.css';

// The offers an administrator published, with a button that starts the payment
// (P3-09). The browser only sends the offer's id; the price is the server's.
// Paying happens on the provider's own page: we are sent there, and the result
// comes back to the server through the provider's signed notification.
export default function OffersList() {
  const { t, i18n } = useTranslation();
  const offers = useApi('/payments/offers');
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const buy = async (offer) => {
    setBusyId(offer.id);
    setError(null);
    try {
      const { redirectUrl } = await api.post('/payments/orders', { offerId: offer.id });
      window.location.assign(redirectUrl);
    } catch (err) {
      setError(t(errorKey(err, { 409: 'payments.alreadyGranted', 503: 'payments.unavailable' })));
      setBusyId(null);
    }
  };

  if (offers.status === 'loading') return <LoadingState />;
  if (offers.status === 'error') return null;
  const { available, offers: list } = offers.data;
  if (list.length === 0) return <Notice variant="info">{t('payments.noOffer')}</Notice>;

  return (
    <section className="offers" aria-labelledby="offers-title">
      <h3 id="offers-title">{t('payments.offersTitle')}</h3>
      {!available && <Notice variant="info">{t('payments.unavailable')}</Notice>}
      {error && (
        <p className="form-status form-status-error" role="alert">
          {error}
        </p>
      )}
      <ul className="offer-cards">
        {list.map((offer) => (
          <li key={offer.id} className="offer-card">
            <h4>{offer.name}</h4>
            {offer.description && <p>{offer.description}</p>}
            <p className="offer-price">{formatMoney(i18n.language, offer.amount, offer.currency)}</p>
            <Button onClick={() => buy(offer)} disabled={!available || busyId !== null}>
              <CreditCard size={16} aria-hidden="true" />
              {busyId === offer.id ? t('payments.redirecting') : t('payments.buy')}
            </Button>
          </li>
        ))}
      </ul>
      <p className="form-hint">{t('payments.securityNote')}</p>
    </section>
  );
}
