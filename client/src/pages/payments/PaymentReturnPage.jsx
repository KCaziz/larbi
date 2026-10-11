import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CircleCheck, CircleX, Clock, Undo2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useAuth } from '../../auth/useAuth.js';
import { formatMoney } from '../../lib/money.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import Button from '../../components/ui/Button.jsx';
import Section from '../../components/ui/Section.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import PaymentStatus from '../../components/payments/PaymentStatus.jsx';
import '../../components/payments/Payments.css';

const ICONS = { paid: CircleCheck, pending: Clock, failed: CircleX, cancelled: CircleX, refunded: Undo2 };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const POLL_MS = 1500;
const MAX_POLLS = 20;

// Where the provider sends the buyer back (P3-09). Coming back here grants
// NOTHING: the page only reads what the server knows about the order. While the
// provider's notification has not arrived yet, it checks again for a while.
export default function PaymentReturnPage() {
  const { t, i18n } = useTranslation();
  const { refresh } = useAuth();
  const [params] = useSearchParams();
  const orderId = params.get('commande') ?? '';
  const valid = UUID.test(orderId);
  const [state, setState] = useState({ status: valid ? 'loading' : 'error', order: null, polls: 0 });
  useDocumentMeta(t('payments.return.title'));

  useEffect(() => {
    if (!valid) return undefined;
    let cancelled = false;
    let timer;
    const load = async (polls) => {
      try {
        const { order } = await api.get(`/payments/orders/${orderId}`);
        if (cancelled) return;
        setState({ status: 'ready', order, polls });
        if (order.status === 'pending' && polls < MAX_POLLS) timer = setTimeout(() => load(polls + 1), POLL_MS);
        // The access level changed on the server: show it everywhere at once.
        if (order.status === 'paid') refresh().catch(() => {});
      } catch {
        if (!cancelled) setState({ status: 'error', order: null, polls });
      }
    };
    load(0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, valid]);

  if (state.status === 'loading') return <LoadingState />;
  if (state.status === 'error') return <ErrorState message={t('payments.return.notFound')} />;

  const { order } = state;
  const Icon = ICONS[order.status] ?? Clock;
  const stillWaiting = order.status === 'pending' && state.polls >= MAX_POLLS;

  return (
    <Section>
      <div className="payment-return" aria-live="polite">
        <span className="payment-return-icon" aria-hidden="true">
          <Icon size={28} strokeWidth={1.8} />
        </span>
        <h1>{t(`payments.return.${order.status}Title`)}</h1>
        <p>{stillWaiting ? t('payments.return.stillPending') : t(`payments.return.${order.status}Body`)}</p>
        <p>
          {order.offer?.name} — {formatMoney(i18n.language, order.amount, order.currency)} <PaymentStatus status={order.status} />
        </p>
        <div className="payment-return-actions">
          <Button to="/compte/paiements">{t('payments.return.myPayments')}</Button>
          <Button to="/compte/premium" variant="secondary">
            {t('payments.return.premium')}
          </Button>
        </div>
      </div>
    </Section>
  );
}
