import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api.js';
import LineChart from '../../components/fincludia/charts/LineChart.jsx';

// G-06, the balance of the accounts over the last twelve months, from each
// account's own history (`/fin/comptes/:id/historique`): the server computes
// every point, and a month before an account was opened is a gap, not a zero.
// The filter picks one account or up to four at once; the series colours are
// fixed and follow the order of the accounts, never their rank.
const MAX_SERIES = 4;

export default function AccountsBalanceChart({ accounts }) {
  const { t } = useTranslation();
  const usable = accounts.filter((account) => !account.archivedAt).slice(0, MAX_SERIES);
  const [filter, setFilter] = useState('all');
  const [histories, setHistories] = useState({});

  const wanted = filter === 'all' ? usable : usable.filter((account) => account.id === filter);
  const key = wanted.map((account) => account.id).join(',');

  useEffect(() => {
    let cancelled = false;
    Promise.all(wanted.map((account) => api.get(`/fin/comptes/${account.id}/historique?months=12`).then((res) => [account.id, res]).catch(() => [account.id, null]))).then((rows) => {
      if (!cancelled) setHistories(Object.fromEntries(rows));
    });
    return () => {
      cancelled = true;
    };
    // `key` is the list of accounts asked for.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (usable.length === 0) return null;
  const currencies = new Set(wanted.map((account) => account.currency));
  // One axis, one currency: accounts in another currency are never drawn on the same scale.
  const currency = wanted[0]?.currency;
  const series = wanted
    .filter((account) => account.currency === currency && histories[account.id])
    .map((account, index) => ({
      key: account.id,
      label: account.label,
      tone: index,
      points: histories[account.id].points.map((point) => ({ month: point.month, value: point.solde })),
    }));

  return (
    <section aria-labelledby="accounts-chart-title" className="accounts-chart">
      <h2 id="accounts-chart-title">{t('accounts.chartTitle')}</h2>
      {usable.length > 1 && (
        <div className="fin-field">
          <label htmlFor="accounts-chart-filter">{t('accounts.chartFilter')}</label>
          <select id="accounts-chart-filter" value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="all">{t('accounts.chartAll')}</option>
            {usable.map((account) => (
              <option key={account.id} value={account.id}>
                {account.label}
              </option>
            ))}
          </select>
        </div>
      )}
      <LineChart series={series} currency={currency} caption={t('accounts.chartTitle')} />
      {currencies.size > 1 && <p className="fin-hint">{t('accounts.chartCurrencies')}</p>}
    </section>
  );
}
