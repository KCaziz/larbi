import { useState } from 'react';
import { Download } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatAmount, formatRatio } from '../../lib/format.js';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import RingChart from '../../components/fincludia/RingChart.jsx';
import BarList from '../../components/fincludia/charts/BarList.jsx';

// The report of a space for one month, and its export (P9-10). Everything here
// is what the space holds in common; nothing personal. The export leaves the
// application, so it asks for an explicit consent each time.
export default function SpaceReport({ t, language, spaceId }) {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState(null);
  const report = useApi(`/fin/espaces/${spaceId}/rapport?mois=${month}`);

  if (report.status === 'loading' && !report.data) return <LoadingState />;
  if (report.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={report.reload} />;
  const r = report.data.rapport;
  const money = (amount) => (amount === null ? t('fincludia.notComputed') : formatAmount(language, amount, r.currency));

  async function download(format) {
    setMessage(null);
    try {
      const blob = await api.download(`/fin/espaces/${spaceId}/export`, { consent: true, mois: month, format });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fincludia-espace-${month}.${format}`;
      link.click();
      URL.revokeObjectURL(url);
      // The consent is for ONE file: it is asked again for the next.
      setConsent(false);
    } catch (err) {
      setMessage(t(errorKey(err, {})));
    }
  }

  return (
    <>
      <h2>{t('spaces.report.title')}</h2>
      <p className="spaces-help">{t('spaces.report.intro')}</p>
      <label htmlFor="space-report-month">
        {t('spaces.budgets.month')}
        <input id="space-report-month" type="month" value={month} onChange={(event) => event.target.value && setMonth(event.target.value)} />
      </label>

      <section aria-labelledby="report-spend">
        <h3 id="report-spend">{t('spaces.report.spend')}</h3>
        {r.depenses.count > 0 && (
          <RingChart
            rows={r.depenses.parCategorie.map((row) => ({ key: row.category ?? 'none', label: row.label ?? t('spaces.report.noCategory'), total: row.value }))}
            currency={r.currency}
            label={t('spaces.report.spend')}
          />
        )}
        {r.depenses.count === 0 ? (
          <p className="spaces-empty">{t('spaces.report.noSpend')}</p>
        ) : (
          <table className="spaces-table">
            <caption className="sr-only">{t('spaces.report.spend')}</caption>
            <tbody>
              {r.depenses.parCategorie.map((row) => (
                <tr key={row.category ?? 'none'}>
                  <th scope="row">{row.label ?? t('spaces.report.noCategory')}</th>
                  <td>{money(row.value)}</td>
                </tr>
              ))}
              <tr>
                <th scope="row">{t('spaces.report.total')}</th>
                <td>
                  <strong>{money(r.depenses.total)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </section>

      <section aria-labelledby="report-balances">
        <h3 id="report-balances">{t('spaces.report.balances')}</h3>
        <BarList
          signed
          rows={r.soldes.map((row) => ({ key: row.memberId, label: row.name, value: row.solde.resultat }))}
          format={money}
          caption={t('spaces.report.balances')}
          positiveLabel={t('spaces.overview.owedToThem')}
          negativeLabel={t('spaces.overview.theyOwe')}
        />
        <ul className="spaces-members">
          {r.soldes.map((row) => (
            <li key={row.memberId} className="spaces-member">
              <span className="spaces-member-name">{row.name}</span>
              <span>{money(row.solde.resultat)}</span>
            </li>
          ))}
        </ul>
      </section>

      {r.budgets.length > 0 && (
        <section aria-labelledby="report-budgets">
          <h3 id="report-budgets">{t('spaces.report.budgets')}</h3>
          <ul className="spaces-members">
            {r.budgets.map((budget) => (
              <li key={budget.id} className="spaces-member">
                <span className="spaces-member-name">{budget.category}</span>
                <span>
                  {money(budget.spent)} / {money(budget.value)}
                  {budget.tauxConsommation.resultat !== null && ` (${formatRatio(language, budget.tauxConsommation.resultat)})`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="report-tasks">
        <h3 id="report-tasks">{t('spaces.report.tasks')}</h3>
        <p className="spaces-help">
          {r.taches.tauxTerminees.resultat === null ? t('spaces.tasks.noStats') : t('spaces.tasks.finishedRate', { rate: formatRatio(language, r.taches.tauxTerminees.resultat) })}
        </p>
      </section>

      <section aria-labelledby="report-export">
        <h3 id="report-export">{t('spaces.report.exportTitle')}</h3>
        <p className="spaces-help">{t('spaces.report.exportHelp')}</p>
        <label htmlFor="space-export-consent" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input id="space-export-consent" type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
          {t('spaces.report.consent')}
        </label>
        <div className="spaces-actions">
          <Button type="button" variant="secondary" disabled={!consent} onClick={() => download('csv')}>
            <Download size={15} aria-hidden="true" /> CSV
          </Button>
          <Button type="button" variant="secondary" disabled={!consent} onClick={() => download('xlsx')}>
            <Download size={15} aria-hidden="true" /> XLSX
          </Button>
        </div>
        {message && <p className="form-error">{message}</p>}
      </section>
    </>
  );
}
