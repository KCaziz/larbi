import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api, errorKey } from '../../../lib/api.js';
import { useApi } from '../../../lib/useApi.js';
import { formatDate } from '../../../lib/format.js';
import Button from '../../../components/ui/Button.jsx';
import ErrorState from '../../../components/ui/ErrorState.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import Field from '../../../components/cms/Field.jsx';
import PageToolbar from '../../../components/cms/PageToolbar.jsx';

// P10-05 — the official exchange rates (Banque d'Algérie) the application uses
// for the counter-value of foreign-currency accounts and assets. One rate per
// currency and reference date: recording a date again corrects it. Never the
// parallel market.
export default function CurrencyRatesAdminPage() {
  const { t, i18n } = useTranslation();
  const rates = useApi('/admin/fin/cours');
  const [form, setForm] = useState({ currency: 'EUR', rate: '', referenceDate: new Date().toISOString().slice(0, 10), source: '' });
  const [message, setMessage] = useState(null);

  if (rates.status === 'loading' && !rates.data) return <LoadingState />;
  if (rates.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={rates.reload} />;

  async function submit(event) {
    event.preventDefault();
    setMessage(null);
    const rate = Number(String(form.rate).replace(',', '.'));
    if (!(rate > 0)) {
      setMessage({ kind: 'error', text: t('adminRates.errors.rate') });
      return;
    }
    try {
      await api.post('/admin/fin/cours', {
        currency: form.currency,
        rate,
        referenceDate: new Date(`${form.referenceDate}T00:00:00.000Z`).toISOString(),
        source: form.source.trim() || t('adminRates.defaultSource', { date: formatDate(i18n.language, `${form.referenceDate}T00:00:00.000Z`) }),
      });
      setMessage({ kind: 'ok', text: t('adminRates.saved') });
      setForm({ ...form, rate: '' });
      rates.reload();
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err)) });
    }
  }

  const number = (value) => new Intl.NumberFormat(i18n.language === 'tzm' ? 'fr' : i18n.language, { maximumFractionDigits: 4 }).format(value);

  return (
    <>
      <PageToolbar title={t('adminRates.title')} subtitle={t('adminRates.intro')} />
      {message && (
        <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
          {message.text}
        </p>
      )}

      <table className="cms-table">
        <caption className="sr-only">{t('adminRates.caption')}</caption>
        <thead>
          <tr>
            <th scope="col">{t('adminRates.currency')}</th>
            <th scope="col">{t('adminRates.rate')}</th>
            <th scope="col">{t('adminRates.date')}</th>
            <th scope="col">{t('adminRates.source')}</th>
          </tr>
        </thead>
        <tbody>
          {rates.data.cours.map((row) => (
            <tr key={row.currency}>
              <th scope="row">{t(`currencies.${row.currency}`, row.currency)}</th>
              <td>{row.rate === null ? t('adminRates.none') : t('adminRates.perUnit', { currency: row.currency, rate: number(row.rate) })}</td>
              <td>{row.referenceDate ? formatDate(i18n.language, row.referenceDate) : '—'}</td>
              <td>{row.source ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <form className="cms-form" onSubmit={submit}>
        <h2>{t('adminRates.addTitle')}</h2>
        <p className="fin-hint">{t('adminRates.addHint')}</p>
        <Field label={t('adminRates.currency')} htmlFor="rate-currency">
          <select id="rate-currency" value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })}>
            {rates.data.cours.map((row) => (
              <option key={row.currency} value={row.currency}>
                {t(`currencies.${row.currency}`, row.currency)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('adminRates.rateLabel', { currency: form.currency })} htmlFor="rate-value">
          <input id="rate-value" inputMode="decimal" value={form.rate} onChange={(event) => setForm({ ...form, rate: event.target.value })} required />
        </Field>
        <Field label={t('adminRates.date')} htmlFor="rate-date">
          <input id="rate-date" type="date" value={form.referenceDate} onChange={(event) => setForm({ ...form, referenceDate: event.target.value })} required />
        </Field>
        <Field label={t('adminRates.source')} htmlFor="rate-source" hint={t('adminRates.sourceHint')}>
          <input id="rate-source" value={form.source} maxLength={200} onChange={(event) => setForm({ ...form, source: event.target.value })} />
        </Field>
        <Button type="submit">{t('adminRates.save')}</Button>
      </form>
    </>
  );
}
