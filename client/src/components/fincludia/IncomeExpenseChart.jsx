import { useTranslation } from 'react-i18next';
import { formatAmount, formatDate } from '../../lib/format.js';
import './Fincludia.css';

// Revenus vs dépenses over the last few months (P6-23), from
// `/fin/argent/synthese/historique` — the same figures "Mon argent" already
// shows for the current month, never a second source. Two lines, never a
// mixed total of the two: the legend names which colour is which, and the
// accessible table underneath repeats the exact numbers for both.
export default function IncomeExpenseChart({ points, currency }) {
  const { t, i18n } = useTranslation();

  const usable = points.filter((point) => point.revenus !== null || point.depenses !== null);
  if (usable.length < 2) return null;

  const values = points.flatMap((point) => [point.revenus, point.depenses]).filter((value) => value !== null);
  const max = Math.max(...values, 0);
  const width = 600;
  const height = 160;

  const line = (field) =>
    points
      .map((point, index) => {
        if (point[field] === null) return null;
        const x = (index / (points.length - 1)) * width;
        const y = max === 0 ? height : height - (point[field] / max) * height;
        return `${x},${y}`;
      })
      .filter(Boolean)
      .join(' ');

  return (
    <div className="wealth-chart">
      <div className="wealth-chart-legend" aria-hidden="true">
        <span className="wealth-chart-legend-item">
          <span className="wealth-chart-swatch wealth-chart-swatch-income" /> {t('myMoney.income')}
        </span>
        <span className="wealth-chart-legend-item">
          <span className="wealth-chart-swatch wealth-chart-swatch-expense" /> {t('myMoney.expenses')}
        </span>
      </div>

      <svg className="wealth-chart-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
        <polyline className="wealth-chart-line wealth-chart-line-income" points={line('revenus')} fill="none" />
        <polyline className="wealth-chart-line wealth-chart-line-expense" points={line('depenses')} fill="none" />
      </svg>

      <details className="wealth-chart-details">
        <summary>{t('wealth.historyToggle')}</summary>
        <table className="wealth-chart-table">
          <caption className="sr-only">{t('myMoney.monthlyTrendTitle')}</caption>
          <thead>
            <tr>
              <th scope="col">{t('wealth.historyDate')}</th>
              <th scope="col">{t('myMoney.income')}</th>
              <th scope="col">{t('myMoney.expenses')}</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.month}>
                <td>{formatDate(i18n.language, `${point.month}-01`)}</td>
                <td>{point.revenus === null ? t('fincludia.notComputed') : formatAmount(i18n.language, point.revenus, currency)}</td>
                <td>{point.depenses === null ? t('fincludia.notComputed') : formatAmount(i18n.language, point.depenses, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
