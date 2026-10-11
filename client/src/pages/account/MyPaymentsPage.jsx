import { useTranslation } from 'react-i18next';
import { useApi } from '../../lib/useApi.js';
import { formatDate } from '../../lib/format.js';
import { formatMoney } from '../../lib/money.js';
import LoadingState from '../../components/ui/LoadingState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import PaymentStatus from '../../components/payments/PaymentStatus.jsx';
import '../../components/payments/Payments.css';
import '../Pages.css';

// "My payments" (P3-09): the person's own orders, as the server knows them.
export default function MyPaymentsPage() {
  const { t, i18n } = useTranslation();
  const orders = useApi('/payments/orders');

  return (
    <div>
      <h2 className="account-heading">{t('payments.mine.title')}</h2>
      {orders.status === 'loading' && <LoadingState />}
      {orders.status === 'error' && <ErrorState message={t('state.loadError')} onRetry={orders.reload} />}
      {orders.status === 'ready' &&
        (orders.data.orders.length === 0 ? (
          <Notice variant="info">{t('payments.mine.empty')}</Notice>
        ) : (
          <table className="payments-table">
            <thead>
              <tr>
                <th scope="col">{t('payments.columns.date')}</th>
                <th scope="col">{t('payments.columns.offer')}</th>
                <th scope="col">{t('payments.columns.amount')}</th>
                <th scope="col">{t('payments.columns.status')}</th>
              </tr>
            </thead>
            <tbody>
              {orders.data.orders.map((o) => (
                <tr key={o.id}>
                  <td>{formatDate(i18n.language, o.createdAt)}</td>
                  <td>{o.offer?.name}</td>
                  <td>{formatMoney(i18n.language, o.amount, o.currency)}</td>
                  <td>
                    <PaymentStatus status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
    </div>
  );
}
