import { useTranslation } from 'react-i18next';
import { formatAmount } from '../../../lib/format.js';
import './Charts.css';

// Grouped horizontal bars (G-04 planned vs real by category, G-09 actual vs
// target of a method): two bars per row, the SAME scale for every row, the two
// measures named in a written legend, and every value written at the end of its
// bar — nothing exists only as a length. A gap, never a judgement: the chart
// shows the two figures side by side and says nothing about whether it is good.
// `rows`: [{ key, label, a, b }], `names`: { a, b } (the legend), `currency`.
// `a` and `b` are amounts, or null (not computed: no bar, said in words).
export default function GroupedBars({ rows, names, currency, caption, format }) {
  const { t, i18n } = useTranslation();
  const shown = rows.filter((row) => row.a !== null || row.b !== null);
  if (shown.length === 0) return null;
  const max = Math.max(...shown.flatMap((row) => [row.a ?? 0, row.b ?? 0]), 1);
  const write = (value) => (value === null ? t('fincludia.notComputed') : format ? format(value) : formatAmount(i18n.language, value, currency));

  return (
    <figure className="chart">
      <figcaption className="sr-only">{caption}</figcaption>
      <ul className="chart-legend" aria-label={t('charts.legend')}>
        <li className="chart-legend-item">
          <span className="chart-swatch chart-tone-0" aria-hidden="true" />
          <span>{names.a}</span>
        </li>
        <li className="chart-legend-item">
          <span className="chart-swatch chart-tone-1" aria-hidden="true" />
          <span>{names.b}</span>
        </li>
      </ul>
      <ul className="chart-bars">
        {shown.map((row) => (
          <li key={row.key} className="chart-bar-row">
            <span className="chart-bar-label">{row.label}</span>
            {[
              ['a', 0],
              ['b', 1],
            ].map(([field, tone]) => (
              <span key={field} className="chart-bar-line">
                <span className="chart-bar-track" aria-hidden="true">
                  {row[field] !== null && <span className={`chart-bar chart-bar-tone-${tone}`} style={{ inlineSize: `${Math.max(0, (row[field] / max) * 100)}%` }} />}
                </span>
                <span className="chart-bar-value">
                  <span className="sr-only">{field === 'a' ? names.a : names.b} : </span>
                  {write(row[field])}
                </span>
              </span>
            ))}
          </li>
        ))}
      </ul>
    </figure>
  );
}
