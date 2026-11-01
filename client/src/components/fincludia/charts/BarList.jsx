import { useTranslation } from 'react-i18next';
import './Charts.css';

// One measure, one bar per row (balances of the members, scores of the health
// dimensions, load of each person): the SAME scale for every row, the value
// written at the end of its bar, and — when values can be negative — a baseline
// in the middle with debts going one way and credits the other, never told by
// colour alone (the sign is in the written value, and the legend says which side
// is which). A row with no value says so in words and draws no bar.
// `rows`: [{ key, label, value }]; `format(value)` writes a value;
// `signed`: draw a centre baseline for positive and negative values;
// `max`: a fixed scale end (the health scores are out of 100) instead of the data's own.
export default function BarList({ rows, format, signed = false, max = null, caption, negativeLabel, positiveLabel }) {
  const { t } = useTranslation();
  const known = rows.filter((row) => row.value !== null && row.value !== undefined);
  if (rows.length === 0) return null;
  const scale = max ?? Math.max(...known.map((row) => Math.abs(row.value)), 1);

  return (
    <figure className="chart">
      <figcaption className="sr-only">{caption}</figcaption>
      {signed && positiveLabel && negativeLabel && (
        <ul className="chart-legend" aria-label={t('charts.legend')}>
          <li className="chart-legend-item">
            <span className="chart-swatch chart-tone-1" aria-hidden="true" />
            <span>{positiveLabel}</span>
          </li>
          <li className="chart-legend-item">
            <span className="chart-swatch chart-tone-2" aria-hidden="true" />
            <span>{negativeLabel}</span>
          </li>
        </ul>
      )}
      <ul className="chart-bars">
        {rows.map((row) => {
          const unknown = row.value === null || row.value === undefined;
          const share = unknown ? 0 : Math.min(1, Math.abs(row.value) / scale);
          const negative = !unknown && row.value < 0;
          return (
            <li key={row.key} className="chart-bar-row">
              <span className="chart-bar-label">{row.label}</span>
              <span className="chart-bar-line">
                <span className={signed ? 'chart-bar-track chart-bar-track-signed' : 'chart-bar-track'} aria-hidden="true">
                  {!unknown && (
                    <span
                      className={`chart-bar ${signed ? (negative ? 'chart-bar-neg' : 'chart-bar-pos') : 'chart-bar-tone-0'}`}
                      style={{ inlineSize: `${share * (signed ? 50 : 100)}%` }}
                    />
                  )}
                </span>
                <span className="chart-bar-value">{unknown ? t('fincludia.notComputed') : format(row.value)}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
