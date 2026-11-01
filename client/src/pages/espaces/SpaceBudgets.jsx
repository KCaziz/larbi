import { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatAmount, formatRatio } from '../../lib/format.js';
import { toMinorUnits } from '../../lib/money.js';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import AmountField from '../../components/fincludia/AmountField.jsx';
import GroupedBars from '../../components/fincludia/charts/GroupedBars.jsx';

// The common budgets of one space (P9-05): an envelope per category and month,
// the remainder (COL-F06, which may be negative) and the consumption (COL-F07).
// Read from the server, never recomputed here. The level of an alert is said in
// words as well as shown by the icon.
export default function SpaceBudgets({ t, language, spaceId, space, canEdit, run, feedback }) {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const view = useApi(`/fin/espaces/${spaceId}/budgets?mois=${month}`);
  const [category, setCategory] = useState('COLC-02');
  const [value, setValue] = useState('');

  if (view.status === 'loading' && !view.data) return <LoadingState />;
  if (view.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={view.reload} />;
  const data = view.data.budgets;
  const label = (key) => {
    const found = data.categories.find((item) => item.key === key);
    return found ? `${found.icon} ${found.label}` : key;
  };
  const money = (amount) => formatAmount(language, amount, space.currency);

  async function save(event) {
    event.preventDefault();
    const amount = toMinorUnits(value, space.currency, { allowZero: true });
    if (amount === null) return;
    const outcome = await run(() => api.put(`/fin/espaces/${spaceId}/budgets`, { category, period: month, value: amount }), 'spaces.budgets.saved');
    if (outcome.ok) {
      setValue('');
      view.reload();
    }
  }

  return (
    <>
      {feedback}
      <h2>{t('spaces.budgets.title')}</h2>
      <p className="spaces-help">{t('spaces.budgets.intro')}</p>
      <label htmlFor="space-budget-month">
        {t('spaces.budgets.month')}
        <input id="space-budget-month" type="month" value={month} onChange={(event) => event.target.value && setMonth(event.target.value)} />
      </label>

      {data.budgets.length > 0 && (
        <GroupedBars
          rows={data.budgets.map((line) => ({ key: line.id, label: label(line.category), a: line.value, b: line.spent }))}
          names={{ a: t('budget.planned'), b: t('budget.real') }}
          currency={space.currency}
          caption={t('spaces.budgets.title')}
        />
      )}
      {data.budgets.length === 0 ? (
        <p className="spaces-empty">{t('spaces.budgets.none')}</p>
      ) : (
        <ul className="spaces-list">
          {data.budgets.map((line) => (
            <li key={line.id} className="spaces-row">
              <div className="spaces-open" style={{ cursor: 'default' }}>
                <span className="spaces-row-label">{label(line.category)}</span>
                <span className="spaces-tag">{money(line.value)}</span>
                <span className="spaces-tag">
                  {t('spaces.budgets.used')} : {line.tauxConsommation.resultat === null ? t('fincludia.notComputed') : formatRatio(language, line.tauxConsommation.resultat)}
                </span>
                <span className="spaces-tag">
                  {t('spaces.budgets.left')} : {line.reste.resultat === null ? t('fincludia.notComputed') : money(line.reste.resultat)}
                </span>
                {line.alerte !== 'none' && (
                  <span className="spaces-tag">
                    <AlertTriangle size={13} aria-hidden="true" /> {t(`spaces.budgets.level.${line.alerte}`)}
                  </span>
                )}
                {canEdit && (
                  <button
                    type="button"
                    className="spaces-icon"
                    onClick={async () => {
                      const outcome = await run(() => api.delete(`/fin/espaces/${spaceId}/budgets/${line.id}`), 'spaces.budgets.removed');
                      if (outcome.ok) view.reload();
                    }}
                    aria-label={t('spaces.budgets.remove')}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {data.horsBudget > 0 && <p className="spaces-help">{t('spaces.budgets.outside', { amount: money(data.horsBudget) })}</p>}

      {canEdit ? (
        <form className="spaces-form" onSubmit={save}>
          <div className="spaces-form-grid">
            <label htmlFor="space-budget-category">
              {t('spaces.budgets.category')}
              <select id="space-budget-category" value={category} onChange={(event) => setCategory(event.target.value)}>
                {data.categories.map((item) => (
                  <option key={item.key} value={item.key}>
                    {`${item.icon} ${item.label}`}
                  </option>
                ))}
              </select>
            </label>
            <AmountField id="space-budget-value" label={t('spaces.budgets.amount')} value={value} currency={space.currency} onChange={setValue} required />
          </div>
          <div className="spaces-actions">
            <Button type="submit">{t('spaces.budgets.set')}</Button>
          </div>
        </form>
      ) : (
        <p className="spaces-help">{t('spaces.budgets.adminOnly')}</p>
      )}
    </>
  );
}
