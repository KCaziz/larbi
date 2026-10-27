import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatAmount } from '../../lib/format.js';

// The ring of the Accueil (P8-06, ACC-04): a part of a whole — accounts,
// spending or income — per category. Each slice keeps the colour the client
// gave its category, whatever its rank; beyond five slices the rest folds into
// « Autres » rather than inventing a colour. A legend with the amount and the
// share is always written beside it (identity is never colour alone), and it
// doubles as the table view and the keyboard path: a click, on the ring or on
// the legend, filters the movements below.
const MAX_SLICES = 5;
const OTHER_COLOR = 'var(--border-strong)';

export default function RingChart({ rows, currency, selected, onSelect, label }) {
  const { t, i18n } = useTranslation();
  const [hover, setHover] = useState(null);
  const positive = rows.filter((row) => row.total > 0);
  const total = positive.reduce((sum, row) => sum + row.total, 0);
  if (total === 0) return <p className="fin-hint">{t('appHome.ringEmpty')}</p>;

  const sorted = [...positive].sort((a, b) => b.total - a.total);
  const shown = sorted.slice(0, MAX_SLICES);
  const rest = sorted.slice(MAX_SLICES);
  const slices = rest.length > 0 ? [...shown, { key: 'other', label: t('appHome.others'), total: rest.reduce((sum, row) => sum + row.total, 0), color: OTHER_COLOR, other: true }] : shown;

  // A ring of radius 40 in a 100 × 100 box; each slice is an arc of the same
  // circle, separated by a 2-unit gap of the surface.
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const gap = slices.length > 1 ? 2 : 0;
  let offset = 0;
  const arcs = slices.map((slice) => {
    const length = (slice.total / total) * circumference;
    const arc = { ...slice, dash: Math.max(0, length - gap), offset };
    offset += length;
    return arc;
  });
  const focus = hover ?? arcs.find((arc) => arc.key === selected) ?? null;
  const share = (value) => `${Math.round((value / total) * 100)} %`;

  return (
    <div className="home-ring">
      <svg viewBox="0 0 100 100" className="home-ring-svg" role="img" aria-label={label}>
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--bg-alt)" strokeWidth="14" />
        {arcs.map((arc) => (
          <circle
            key={arc.key}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={arc.color ?? OTHER_COLOR}
            strokeWidth={selected === arc.key || hover?.key === arc.key ? 16 : 12}
            strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
            strokeDashoffset={-arc.offset}
            transform="rotate(-90 50 50)"
            className="home-ring-arc"
            onMouseEnter={() => setHover(arc)}
            onMouseLeave={() => setHover(null)}
            onClick={() => !arc.other && onSelect?.(selected === arc.key ? null : arc.key)}
          >
            <title>{`${arc.label} : ${formatAmount(i18n.language, arc.total, currency)} (${share(arc.total)})`}</title>
          </circle>
        ))}
        <text x="50" y="47" textAnchor="middle" className="home-ring-center-label">
          {focus ? focus.label : t('appHome.total')}
        </text>
        <text x="50" y="58" textAnchor="middle" className="home-ring-center-value">
          {formatAmount(i18n.language, focus ? focus.total : total, currency)}
        </text>
      </svg>

      <ul className="home-ring-legend">
        {arcs.map((arc) => (
          <li key={arc.key}>
            <button
              type="button"
              className={selected === arc.key ? 'home-ring-legend-item active' : 'home-ring-legend-item'}
              aria-pressed={selected === arc.key}
              disabled={arc.other}
              onClick={() => onSelect?.(selected === arc.key ? null : arc.key)}
            >
              <span className="home-ring-swatch" style={{ background: arc.color ?? OTHER_COLOR }} aria-hidden="true" />
              <span className="home-ring-legend-label">
                {arc.icon ? `${arc.icon} ` : ''}
                {arc.label}
              </span>
              <span className="home-ring-legend-value">
                {formatAmount(i18n.language, arc.total, currency)} · {share(arc.total)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
