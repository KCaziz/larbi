import { useTranslation } from 'react-i18next';
import { formatAmount, formatDate } from '../../../lib/format.js';
import './Charts.css';

// A line chart on one axis (G-03 net flow, G-06 account balances), built to the
// project's chart rules:
//  - ONE axis: two measures of different scale are two charts, never a second axis;
//  - every series has a name in a written legend (identity is never colour
//    alone) and ends with its last value written beside the line;
//  - a month with no figure is a GAP in the line, not a zero;
//  - the exact points are in a table underneath (the keyboard / screen-reader path);
//  - the zero line is drawn when the data crosses it.
// `series`: [{ key, label, tone, points: [{ month: 'YYYY-MM', value: number | null }] }]
// `tone` picks one of the fixed series colours (never cycled): 0 to 3.
const WIDTH = 600;
const HEIGHT = 160;

export default function LineChart({ series, currency, caption, format, xLabel }) {
  const { t, i18n } = useTranslation();
  const usable = series.filter((item) => item.points.filter((point) => point.value !== null).length >= 1);
  const months = [...new Set(series.flatMap((item) => item.points.map((point) => point.month)))].sort();
  // A point may say how its step is written (« Année 3 »); otherwise it is a month.
  const labels = new Map(series.flatMap((item) => item.points.filter((point) => point.label).map((point) => [point.month, point.label])));
  const stepLabel = (month) => labels.get(month) ?? formatDate(i18n.language, `${month}-01`);
  if (usable.length === 0 || months.length < 2) return null;

  const values = usable.flatMap((item) => item.points.map((point) => point.value)).filter((value) => value !== null);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);
  const span = max - min || 1;
  const x = (month) => (months.indexOf(month) / (months.length - 1)) * WIDTH;
  const y = (value) => HEIGHT - ((value - min) / span) * HEIGHT;
  const money = (value) => (value === null || value === undefined ? t('fincludia.notComputed') : format ? format(value) : formatAmount(i18n.language, value, currency));

  // A gap (a null) breaks the line into runs.
  const runs = (item) => {
    const out = [];
    let current = [];
    for (const point of item.points) {
      if (point.value === null) {
        if (current.length > 0) out.push(current);
        current = [];
      } else {
        current.push(point);
      }
    }
    if (current.length > 0) out.push(current);
    return out;
  };

  return (
    <figure className="chart">
      <figcaption className="sr-only">{caption}</figcaption>
      <ul className="chart-legend" aria-label={t('charts.legend')}>
        {usable.map((item) => {
          const last = [...item.points].reverse().find((point) => point.value !== null);
          return (
            <li key={item.key} className="chart-legend-item">
              <span className={`chart-swatch chart-tone-${item.tone ?? 0}`} aria-hidden="true" />
              <span>{item.label}</span>
              <strong>{money(last?.value ?? null)}</strong>
            </li>
          );
        })}
      </ul>

      <svg className="chart-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" aria-hidden="true">
        {min < 0 && max > 0 && <line className="chart-zero" x1="0" x2={WIDTH} y1={y(0)} y2={y(0)} />}
        {usable.map((item) =>
          runs(item).map((run, index) =>
            run.length === 1 ? (
              <circle key={`${item.key}-${index}`} className={`chart-dot chart-tone-${item.tone ?? 0}`} cx={x(run[0].month)} cy={y(run[0].value)} r="4" />
            ) : (
              <polyline key={`${item.key}-${index}`} className={`chart-line chart-tone-${item.tone ?? 0}`} fill="none" points={run.map((point) => `${x(point.month)},${y(point.value)}`).join(' ')} />
            ),
          ),
        )}
      </svg>

      <details className="chart-details">
        <summary>{t('charts.showTable')}</summary>
        <table className="chart-table">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              <th scope="col">{xLabel ?? t('wealth.historyDate')}</th>
              {usable.map((item) => (
                <th key={item.key} scope="col">
                  {item.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {months.map((month) => (
              <tr key={month}>
                <td>{stepLabel(month)}</td>
                {usable.map((item) => (
                  <td key={item.key}>{money(item.points.find((point) => point.month === month)?.value ?? null)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
