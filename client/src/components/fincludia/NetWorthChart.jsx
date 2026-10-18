import { useTranslation } from 'react-i18next';
import { formatAmount, formatDate } from '../../lib/format.js';
import './Fincludia.css';

// The net-worth curve (P6-23), built from `/fin/patrimoine/historique` — the
// server's own reconstruction of the change journal, never a second source
// of the figure. The SVG line is decorative (`aria-hidden`): the exact
// points it draws are also listed as a plain table underneath, collapsed by
// default, so nothing here exists only as a shape nobody can read out.
export default function NetWorthChart({ points, currency }) {
  const { t, i18n } = useTranslation();

  // One point is a dot, not a history — nothing to draw a line between.
  if (points.length < 2) return null;

  const values = points.map((point) => point.net);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);
  const span = max - min || 1;

  const width = 600;
  const height = 160;
  const coords = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - ((point.net - min) / span) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="wealth-chart">
      <svg className="wealth-chart-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
        {/* The zero line, when the series crosses it (a debt bigger than what is owned). */}
        {min < 0 && max > 0 && (
          <line
            className="wealth-chart-zero"
            x1="0"
            x2={width}
            y1={height - ((0 - min) / span) * height}
            y2={height - ((0 - min) / span) * height}
          />
        )}
        <polyline className="wealth-chart-line" points={coords} fill="none" />
      </svg>

      <details className="wealth-chart-details">
        <summary>{t('wealth.historyToggle')}</summary>
        <table className="wealth-chart-table">
          <caption className="sr-only">{t('wealth.historyTitle')}</caption>
          <thead>
            <tr>
              <th scope="col">{t('wealth.historyDate')}</th>
              <th scope="col">{t('wealth.historyNet')}</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.date}>
                <td>{formatDate(i18n.language, point.date)}</td>
                <td>{formatAmount(i18n.language, point.net, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
