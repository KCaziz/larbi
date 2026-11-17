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
// R16 (2026-11-17): « des couleurs plus marquées, elles ressemblent trop au fond ».
// The chart colours of index.css (contrast ≥ 3:1 on every surface, light and
// dark), in their fixed order; « Autres » in a marked grey too.
const OTHER_COLOR = 'var(--chart-other)';
const DISTINCT_COLORS = Array.from({ length: 8 }, (_, index) => `var(--chart-${index + 1})`);

// WCAG contrast of a #rrggbb colour against another.
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16) / 255).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a, b) => {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
};
// A slice's own colour is kept only when it stands out from the page's surface
// (≥ 3:1): a pale or mint category colour reads as background, and is replaced.
function marked(color) {
  if (!color) return false;
  const value = String(color);
  if (value.startsWith('var(--chart-')) return true;
  if (!/^#[0-9a-f]{6}$/i.test(value) || typeof window === 'undefined') return false;
  const surface = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim();
  return /^#[0-9a-f]{6}$/i.test(surface) ? contrast(value, surface) >= 3 : true;
}

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
    const own = marked(slice.color) ? String(slice.color).toLowerCase() : null;
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
  const radius = 37;
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
      {/* R16: the description on the left, the ring, bigger, on the right. */}
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

      <svg viewBox="0 0 100 100" className="home-ring-svg" role="img" aria-label={label}>
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--bg-alt)" strokeWidth="18" />
        {arcs.map((arc) => (
          <circle
            key={arc.key}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={arc.color ?? OTHER_COLOR}
            strokeWidth={selected === arc.key || hover?.key === arc.key ? 21 : 17}
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
    </div>
  );
}
