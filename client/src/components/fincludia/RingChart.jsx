import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatAmount } from '../../lib/format.js';
import CategoryIcon from './CategoryIcon.jsx';
import '../../pages/accueil/Home.css';

// The ring of the Accueil (P8-06, ACC-04): a part of a whole — accounts,
// spending or income — per category. Each slice keeps the colour the client
// gave its category, whatever its rank; beyond five slices the rest folds into
// « Autres » rather than inventing a colour. A legend with the amount and the
// share is always written beside it (identity is never colour alone), and it
// doubles as the table view and the keyboard path: a click, on the ring or on
// the legend, filters the movements below.
const MAX_SLICES = 5;
const OTHER_COLOR = 'var(--border-strong)';
// Distinct on both light and dark surfaces, for the slices that have no colour of their own.
const DISTINCT_COLORS = ['#2563A6', '#16A34A', '#CA8A04', '#DC2626', '#7C3AED', '#0891B2', '#DB2777', '#EA580C'];

// `center` ({ label, value }) replaces the « Total » written in the middle: the
// net flow is income MINUS spending, never their sum (recette R9-02);
// `shares` hides the percentages where a part of a whole means nothing.
export default function RingChart({ rows, currency, selected, onSelect, label, center = null, shares = true }) {
  const { t, i18n } = useTranslation();
  const [hover, setHover] = useState(null);
  const positive = rows.filter((row) => row.total > 0);
  const total = positive.reduce((sum, row) => sum + row.total, 0);
  // Nothing to share out: the ring is drawn empty, not replaced by a sentence
  // (recette R9-03) — the place stays the same as the figures arrive.
  if (total === 0) {
    return (
      <div className="home-ring home-ring-empty">
        <svg viewBox="0 0 100 100" className="home-ring-svg" role="img" aria-label={label}>
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--bg-alt)" strokeWidth="14" />
          <text x="50" y="53" textAnchor="middle" className="home-ring-center-label">
            {t('appHome.ringNothing')}
          </text>
        </svg>
        <p className="fin-hint">{t('appHome.ringEmpty')}</p>
      </div>
    );
  }

  const sorted = [...positive].sort((a, b) => b.total - a.total);
  const shown = sorted.slice(0, MAX_SLICES);
  const rest = sorted.slice(MAX_SLICES);
  const withOthers = rest.length > 0 ? [...shown, { key: 'other', label: t('appHome.others'), total: rest.reduce((sum, row) => sum + row.total, 0), color: OTHER_COLOR, other: true }] : shown;
  // Two slices of one colour read as one slice (recette R13-07: two accounts of the
  // same type, or expenses with no category, drew a ring of a single colour): a
  // slice whose colour is missing or already taken gets the next free one of the
  // palette. A colour the person chose is kept for the first slice that uses it.
  const taken = new Set();
  const slices = withOthers.map((slice) => {
    if (slice.other) return slice;
    const own = slice.color ? String(slice.color).toLowerCase() : null;
    if (own && !taken.has(own)) {
      taken.add(own);
      return slice;
    }
    const free = DISTINCT_COLORS.find((color) => !taken.has(color.toLowerCase())) ?? DISTINCT_COLORS[taken.size % DISTINCT_COLORS.length];
    taken.add(free.toLowerCase());
    return { ...slice, color: free };
  });

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
          {focus ? focus.label : (center?.label ?? t('appHome.total'))}
        </text>
        <text x="50" y="58" textAnchor="middle" className="home-ring-center-value">
          {formatAmount(i18n.language, focus ? focus.total : (center ? center.value : total), currency)}
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
                {arc.icon && <CategoryIcon emoji={arc.icon} size={13} />} {arc.label}
              </span>
              <span className="home-ring-legend-value">
                {formatAmount(i18n.language, arc.total, currency)}
                {shares && ` · ${share(arc.total)}`}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
