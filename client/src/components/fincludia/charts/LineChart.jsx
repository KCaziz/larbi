import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatAmount, formatDate } from '../../../lib/format.js';
import './Charts.css';

// A line chart on one axis (G-03 net flow, G-06 account balances, and every
// curve of the application), built to the project's chart rules and to the
// recette R7-01:
//  - ONE axis: two measures of different scale are two charts, never a second axis;
//  - the value axis is written (four levels with a grid) and the time axis names
//    its first, middle and last step;
//  - every series has a name in a written legend (identity is never colour
//    alone) and ends with its last value written beside the line;
//  - every step has a dot; hovering or touching the chart shows the values of the
//    nearest step, and a sentence under the chart says in words where each series
//    started and where it is;
//  - a step with no figure is a GAP in the line, not a zero; a curve of a single
//    step is a message, not a lone dot;
//  - the exact points are in a table underneath (the keyboard / screen-reader path).
// `series`: [{ key, label, tone, points: [{ month: 'YYYY-MM' | any sortable key, label?, value: number | null }] }]
// `tone` picks one of the fixed series colours (never cycled): 0 to 3.
const WIDTH = 640;
const HEIGHT = 230;
const PAD = { left: 70, right: 16, top: 14, bottom: 30 };
const TICKS = 4;

// `fromZero` (default): the value axis starts at zero, so a bar of money is never
// exaggerated. A PRICE path (the learning market, R8-12) sets it to false: its
// story is how it moved, which a scale from zero flattens.
export default function LineChart({ series, currency, caption, format, xLabel, fromZero = true }) {
  const { t, i18n } = useTranslation();
  const [hover, setHover] = useState(null);
  const usable = series.filter((item) => item.points.filter((point) => point.value !== null).length >= 1);
  const months = [...new Set(series.flatMap((item) => item.points.map((point) => point.month)))].sort();
  // A point may say how its step is written (« Année 3 »); otherwise it is a month.
  const labels = new Map(series.flatMap((item) => item.points.filter((point) => point.label).map((point) => [point.month, point.label])));
  // A month is written « juin 2026 »; a day, as a date.
  const stepLabel = (month) =>
    labels.get(month) ??
    (month.length === 7 ? new Intl.DateTimeFormat(i18n.language, { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${month}-01T00:00:00Z`)) : formatDate(i18n.language, month));
  if (usable.length === 0) return null;
  if (months.length < 2) return <p className="chart-note">{t('charts.needTwoSteps')}</p>;

  const values = usable.flatMap((item) => item.points.map((point) => point.value)).filter((value) => value !== null);
  const lowest = Math.min(...values);
  const highest = Math.max(...values);
  const margin = fromZero ? 0 : (highest - lowest) * 0.1 || Math.abs(highest) * 0.01 || 1;
  const min = fromZero ? Math.min(lowest, 0) : lowest - margin;
  const max = fromZero ? Math.max(highest, 0) : highest + margin;
  const span = max - min || 1;
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (month) => PAD.left + (months.indexOf(month) / (months.length - 1)) * innerW;
  const y = (value) => PAD.top + innerH - ((value - min) / span) * innerH;
  const money = (value) => (value === null || value === undefined ? t('fincludia.notComputed') : format ? format(value) : formatAmount(i18n.language, value, currency));
  // Short figures for the axis: « 120 k », not « 120 000,00 DZD ».
  const compact = (value) => (format ? format(value) : new Intl.NumberFormat(i18n.language, { notation: 'compact', maximumFractionDigits: 1 }).format(value / 100));

  const ticks = Array.from({ length: TICKS + 1 }, (_, index) => min + (span * index) / TICKS);
  const labelCount = Math.min(months.length, 4);
  const xTicks = [...new Set(Array.from({ length: labelCount }, (_, index) => months[Math.round((index * (months.length - 1)) / (labelCount - 1))]))];

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

  const onMove = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - box.left) / box.width;
    const at = Math.min(months.length - 1, Math.max(0, Math.round(((ratio * WIDTH - PAD.left) / innerW) * (months.length - 1))));
    setHover(months[at]);
  };

  const reading = usable.map((item) => {
    const known = item.points.filter((point) => point.value !== null);
    const first = known[0];
    const last = known[known.length - 1];
    const change = last.value - first.value;
    return { key: item.key, label: item.label, from: money(first.value), to: money(last.value), when: stepLabel(first.month), until: stepLabel(last.month), change, same: known.length < 2 };
  });

  const hovered = hover ? usable.map((item) => ({ item, point: item.points.find((point) => point.month === hover) })).filter((row) => row.point && row.point.value !== null) : [];
  const tipLeft = hover ? Math.min(78, Math.max(22, (x(hover) / WIDTH) * 100)) : 0;

  return (
    <figure className="chart">
      <figcaption className="chart-title">{caption}</figcaption>
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

      <div className="chart-plot">
        <svg className="chart-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} aria-hidden="true" onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setHover(null)}>
          {ticks.map((tick) => (
            <g key={tick}>
              <line className="chart-grid" x1={PAD.left} x2={WIDTH - PAD.right} y1={y(tick)} y2={y(tick)} />
              <text className="chart-axis-text" x={PAD.left - 8} y={y(tick)} textAnchor="end" dominantBaseline="middle">
                {compact(tick)}
              </text>
            </g>
          ))}
          {min < 0 && max > 0 && <line className="chart-zero" x1={PAD.left} x2={WIDTH - PAD.right} y1={y(0)} y2={y(0)} />}
          {xTicks.map((month, index) => (
            <text key={month} className="chart-axis-text" x={x(month)} y={HEIGHT - 8} textAnchor={index === 0 ? 'start' : index === xTicks.length - 1 ? 'end' : 'middle'}>
              {stepLabel(month)}
            </text>
          ))}
          {hover && <line className="chart-guide" x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + innerH} />}
          {usable.map((item) => (
            <g key={item.key} className={`chart-series chart-tone-${item.tone ?? 0}`}>
              {runs(item).map((run, index) => (
                <g key={index}>
                  {usable.length === 1 && run.length > 1 && (
                    <polygon className="chart-area" points={`${x(run[0].month)},${y(Math.max(min, 0))} ${run.map((point) => `${x(point.month)},${y(point.value)}`).join(' ')} ${x(run[run.length - 1].month)},${y(Math.max(min, 0))}`} />
                  )}
                  {run.length > 1 && <polyline className="chart-line" points={run.map((point) => `${x(point.month)},${y(point.value)}`).join(' ')} />}
                  {months.length <= 40 && run.map((point) => <circle key={point.month} className="chart-dot" cx={x(point.month)} cy={y(point.value)} r={hover === point.month ? 5 : 3.5} />)}
                </g>
              ))}
            </g>
          ))}
        </svg>
        {hover && hovered.length > 0 && (
          <div className="chart-tip" style={{ insetInlineStart: `${tipLeft}%` }} role="status">
            <strong>{stepLabel(hover)}</strong>
            {hovered.map(({ item, point }) => (
              <span key={item.key}>
                <span className={`chart-swatch chart-tone-${item.tone ?? 0}`} aria-hidden="true" /> {item.label} : {money(point.value)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* In words, for whoever does not read the curve. */}
      <ul className="chart-reading">
        {reading.map((row) => (
          <li key={row.key}>
            {row.same
              ? t('charts.readingOne', { label: row.label, value: row.to, when: row.until })
              : t(row.change === 0 ? 'charts.readingFlat' : row.change > 0 ? 'charts.readingUp' : 'charts.readingDown', { label: row.label, from: row.from, to: row.to, when: row.when, until: row.until })}
          </li>
        ))}
      </ul>

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
