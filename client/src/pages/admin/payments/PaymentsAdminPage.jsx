import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Plus, Receipt, Tag, Trash2 } from 'lucide-react';
import { api, errorKey } from '../../../lib/api.js';
import { useApi } from '../../../lib/useApi.js';
import { formatDate } from '../../../lib/format.js';
import { formatMoney, fromMinorUnits, toMinorUnits } from '../../../lib/money.js';
import Button from '../../../components/ui/Button.jsx';
import ErrorState from '../../../components/ui/ErrorState.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import ConfirmDialog from '../../../components/cms/ConfirmDialog.jsx';
import DataTable from '../../../components/cms/DataTable.jsx';
import Field from '../../../components/cms/Field.jsx';
import PageToolbar from '../../../components/cms/PageToolbar.jsx';
import PaymentStatus from '../../../components/payments/PaymentStatus.jsx';
import './PaymentsAdmin.css';

// Payment administration (P3-09): the offers people can buy (prices come from
// the client and are typed in here) and the orders, READ-ONLY: an order's status
// only changes through the payment provider's authentic notifications.
export default function PaymentsAdminPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('offers');

  return (
    <>
      <PageToolbar title={t('payments.admin.title')} subtitle={t('payments.admin.subtitle')} />
      <div className="payments-admin-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'offers'} className={tab === 'offers' ? 'active' : ''} onClick={() => setTab('offers')}>
          <Tag size={16} aria-hidden="true" />
          {t('payments.admin.offers')}
        </button>
        <button type="button" role="tab" aria-selected={tab === 'orders'} className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>
          <Receipt size={16} aria-hidden="true" />
          {t('payments.admin.orders')}
        </button>
      </div>
      {tab === 'offers' ? <OffersTab /> : <OrdersTab />}
    </>
  );
}

// ---- Offers ---------------------------------------------------------------------
const emptyForm = { name: '', description: '', price: '', currency: '', isActive: false };

function OffersTab() {
  const { t, i18n } = useTranslation();
  const offers = useApi('/admin/payments/offers');
  const [form, setForm] = useState(null); // null | { id?, name, description, price, currency, isActive }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const run = async (action, okText) => {
    setBusy(true);
    setMessage(null);
    try {
      await action();
      setMessage({ kind: 'ok', text: okText });
      offers.reload();
      return true;
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 409: 'payments.admin.offerHasOrders' })) });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const currency = form ? form.currency.trim().toUpperCase() : '';
  const validCurrency = /^[A-Z]{3}$/.test(currency);
  const amount = validCurrency ? toMinorUnits(form?.price, currency) : null;

  const submit = async (event) => {
    event.preventDefault();
    const body = { name: form.name.trim(), description: form.description.trim() || null, amount, currency, isActive: form.isActive };
    if (await run(() => (form.id ? api.patch(`/admin/payments/offers/${form.id}`, body) : api.post('/admin/payments/offers', body)), t('payments.admin.saved'))) setForm(null);
  };

  const remove = async () => {
    if (await run(() => api.delete(`/admin/payments/offers/${deleteTarget.id}`), t('payments.admin.deleted'))) setDeleteTarget(null);
  };

  if (offers.status === 'loading') return <LoadingState />;
  if (offers.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={offers.reload} />;

  const columns = [
    { key: 'name', header: t('payments.admin.name'), render: (o) => <strong>{o.name}</strong> },
    { key: 'price', header: t('payments.admin.price'), render: (o) => formatMoney(i18n.language, o.amount, o.currency) },
    {
      key: 'active',
      header: t('payments.admin.visibility'),
      render: (o) => (
        <label className="payments-admin-toggle">
          <input type="checkbox" checked={o.isActive} disabled={busy} onChange={() => run(() => api.patch(`/admin/payments/offers/${o.id}`, { isActive: !o.isActive }), t('payments.admin.saved'))} />
          {o.isActive ? t('payments.admin.active') : t('payments.admin.inactive')}
        </label>
      ),
    },
    { key: 'orders', header: t('payments.admin.orders'), render: (o) => o.orderCount },
    {
      key: 'actions',
      header: <span className="sr-only">{t('payments.admin.actions')}</span>,
      render: (o) => (
        <div className="cms-row-actions">
          <button
            type="button"
            className="cms-icon-button"
            title={t('payments.admin.edit')}
            aria-label={`${t('payments.admin.edit')} — ${o.name}`}
            onClick={() => {
              setMessage(null);
              setForm({ id: o.id, name: o.name, description: o.description ?? '', price: fromMinorUnits(o.amount, o.currency), currency: o.currency, isActive: o.isActive });
            }}
          >
            <Pencil size={15} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="cms-icon-button danger"
            title={o.orderCount > 0 ? t('payments.admin.cannotDelete') : t('payments.admin.delete')}
            aria-label={`${t('payments.admin.delete')} — ${o.name}`}
            disabled={o.orderCount > 0}
            onClick={() => setDeleteTarget(o)}
          >
            <Trash2 size={15} aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="payments-admin-section">
      <div className="payments-admin-bar">
        <Button
          onClick={() => {
            setMessage(null);
            setForm({ ...emptyForm });
          }}
          disabled={busy}
        >
          <Plus size={16} aria-hidden="true" />
          {t('payments.admin.add')}
        </Button>
      </div>

      {message && (
        <p className={`cms-inline-message ${message.kind}`} role={message.kind === 'error' ? 'alert' : 'status'}>
          {message.text}
        </p>
      )}

      {form && (
        <form className="payments-admin-form" onSubmit={submit}>
          <h2>{form.id ? t('payments.admin.edit') : t('payments.admin.add')}</h2>
          <Field label={t('payments.admin.name')} htmlFor="po-name" hint={t('payments.admin.nameHint')}>
            <input id="po-name" aria-describedby="po-name-hint" maxLength={120} value={form.name} onChange={(e) => set('name', e.target.value)} required autoFocus />
          </Field>
          <Field label={t('payments.admin.description')} htmlFor="po-desc">
            <textarea id="po-desc" rows={3} maxLength={2000} value={form.description} onChange={(e) => set('description', e.target.value)} />
          </Field>
          <div className="payments-admin-grid">
            <Field label={t('payments.admin.price')} htmlFor="po-price" hint={t('payments.admin.priceHint')}>
              <input id="po-price" aria-describedby="po-price-hint" inputMode="decimal" value={form.price} onChange={(e) => set('price', e.target.value)} required />
            </Field>
            <Field label={t('payments.admin.currency')} htmlFor="po-currency" hint={t('payments.admin.currencyHint')}>
              <input id="po-currency" aria-describedby="po-currency-hint" maxLength={3} value={form.currency} onChange={(e) => set('currency', e.target.value)} required />
            </Field>
          </div>
          {amount !== null && <p className="form-hint">{t('payments.admin.preview', { price: formatMoney(i18n.language, amount, currency) })}</p>}
          {form.price && validCurrency && amount === null && (
            <p className="form-hint form-hint-error" role="alert">
              {t('payments.admin.priceInvalid')}
            </p>
          )}
          <label className="payments-admin-toggle">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} />
            {t('payments.admin.activeLabel')}
          </label>
          {form.id && <p className="form-hint">{t('payments.admin.priceChangeHint')}</p>}
          <div className="payments-admin-actions">
            <Button type="submit" disabled={busy || !form.name.trim() || amount === null}>
              {t('payments.admin.save')}
            </Button>
            <Button variant="secondary" onClick={() => setForm(null)}>
              {t('payments.admin.cancel')}
            </Button>
          </div>
        </form>
      )}

      {offers.data.offers.length === 0 ? <p className="cms-muted">{t('payments.admin.noOffer')}</p> : <DataTable columns={columns} rows={offers.data.offers} />}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('payments.admin.delete')}
        confirmLabel={t('payments.admin.delete')}
        danger
        busy={busy}
        onConfirm={remove}
        onCancel={() => setDeleteTarget(null)}
      >
        <p>{t('payments.admin.deleteConfirm', { name: deleteTarget?.name ?? '' })}</p>
      </ConfirmDialog>
    </div>
  );
}

// ---- Orders (read-only) -----------------------------------------------------------
const STATUSES = ['pending', 'paid', 'failed', 'cancelled', 'refunded'];

function OrdersTab() {
  const { t, i18n } = useTranslation();
  const [status, setStatus] = useState('');
  // An empty status means "all" (the server accepts it).
  const orders = useApi(`/admin/payments/orders?status=${status}`);

  const columns = [
    { key: 'date', header: t('payments.columns.date'), render: (o) => formatDate(i18n.language, o.createdAt) },
    {
      key: 'buyer',
      header: t('payments.admin.buyer'),
      render: (o) => (
        <span className="payments-admin-buyer">
          <strong>{o.user.name}</strong>
          <small>{o.user.email}</small>
        </span>
      ),
    },
    { key: 'offer', header: t('payments.columns.offer'), render: (o) => o.offer.name },
    { key: 'amount', header: t('payments.columns.amount'), render: (o) => formatMoney(i18n.language, o.amount, o.currency) },
    { key: 'status', header: t('payments.columns.status'), render: (o) => <PaymentStatus status={o.status} /> },
  ];

  return (
    <div className="payments-admin-section">
      <div className="payments-admin-bar">
        <label className="payments-admin-filter">
          {t('payments.columns.status')}
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">{t('payments.admin.allStatuses')}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`payments.status.${s}`)}
              </option>
            ))}
          </select>
        </label>
        <p className="form-hint">{t('payments.admin.ordersHint')}</p>
      </div>
      {orders.status === 'loading' && <LoadingState />}
      {orders.status === 'error' && <ErrorState message={t('state.loadError')} onRetry={orders.reload} />}
      {orders.status === 'ready' &&
        (orders.data.orders.length === 0 ? <p className="cms-muted">{t('payments.admin.noOrder')}</p> : <DataTable columns={columns} rows={orders.data.orders} />)}
    </div>
  );
}
