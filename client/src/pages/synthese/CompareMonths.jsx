import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../lib/useApi.js';
import { formatAmount, formatRatio } from '../../lib/format.js';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import GroupedBars from '../../components/fincludia/charts/GroupedBars.jsx';

// « Comparer deux mois » (P8-24): two months of the person's choosing, side by
// side. Each figure and its change (PB-F023) come from the server; the screen
// shows them and says nothing about whether the change is good. A change that
// cannot be computed (a month at zero) says so, and is never shown as 0 %.
const monthsBack = (count) => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - count, 1)).toISOString().slice(0, 7);
};

export default function CompareMonths() {
  const { t, i18n } = useTranslation();
  const [a, setA] = useState(() => monthsBack(1));
  const [b, setB] = useState(() => monthsBack(0));
  const same = a === b;
  const data = useApi(same ? null : `/fin/rapport/comparaison?mois=${a}&avec=${b}`);

  const c = data.data?.comparaison;
  const money = (answer) => (answer?.resultat === null || answer?.resultat === undefined ? t('fincludia.notComputed') : formatAmount(i18n.language, answer.resultat, c.currency));
  const amount = (value) => (value === null || value === undefined ? t('fincludia.notComputed') : formatAmount(i18n.language, value, c.currency));
  const change = (answer) => (answer?.resultat === null || answer?.resultat === undefined ? t('fincludia.notComputed') : `${answer.resultat > 0 ? '+' : ''}${formatRatio(i18n.language, answer.resultat)}`);

  return (
    <section aria-labelledby="compare-title" className="synthesis-compare">
      <h2 id="compare-title">{t('synthesis.compare.title')}</h2>
      <p className="fin-hint">{t('synthesis.compare.intro')}</p>
      <div className="synthesis-compare-pickers">
        <label htmlFor="compare-a">
          {t('synthesis.compare.first')}
          <input id="compare-a" type="month" value={a} onChange={(event) => event.target.value && setA(event.target.value)} />
        </label>
        <label htmlFor="compare-b">
          {t('synthesis.compare.second')}
          <input id="compare-b" type="month" value={b} onChange={(event) => event.target.value && setB(event.target.value)} />
        </label>
      </div>

      {same && <p className="form-error">{t('synthesis.compare.different')}</p>}
      {!same && data.status === 'loading' && !data.data && <LoadingState />}
      {!same && data.status === 'error' && <ErrorState message={t('state.loadError')} onRetry={data.reload} />}

      {c && !same && (
        <>
          <table className="chart-table synthesis-compare-table">
            <caption className="sr-only">{t('synthesis.compare.title')}</caption>
            <thead>
              <tr>
                <th scope="col" />
                <th scope="col">{a}</th>
                <th scope="col">{b}</th>
                <th scope="col">{t('synthesis.compare.change')}</th>
              </tr>
            </thead>
            <tbody>
              {['revenus', 'depenses', 'fluxNet'].map((key) => (
                <tr key={key}>
                  <th scope="row">{t(`synthesis.compare.${key}`)}</th>
                  <td>{money(c[key].a)}</td>
                  <td>{money(c[key].b)}</td>
                  <td>{change(c[key].variation)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {c.categories.length > 0 && (
            <>
              <h3>{t('synthesis.compare.categories')}</h3>
              <GroupedBars
                rows={c.categories.map((row) => ({ key: row.categoryId ?? 'none', label: row.label ?? t('myMoney.noCategory'), a: row.a ?? null, b: row.b ?? null }))}
                names={{ a, b }}
                currency={c.currency}
                caption={t('synthesis.compare.categories')}
              />
              <table className="chart-table synthesis-compare-table">
                <thead>
                  <tr>
                    <th scope="col" />
                    <th scope="col">{a}</th>
                    <th scope="col">{b}</th>
                  </tr>
                </thead>
                <tbody>
                  {c.categories.map((row) => (
                    <tr key={row.categoryId ?? 'none'}>
                      <th scope="row">{row.label ?? t('myMoney.noCategory')}</th>
                      <td>{amount(row.a)}</td>
                      <td>{amount(row.b)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="fin-hint">{t('synthesis.compare.topFive')}</p>
            </>
          )}
        </>
      )}
    </section>
  );
}
