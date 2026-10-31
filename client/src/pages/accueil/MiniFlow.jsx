import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatAmount } from '../../lib/format.js';

// G-03 on the Accueil: « devient mini-graphe lors du scroll ». While the ring
// is on screen nothing shows; once the person has scrolled past it, a slim bar
// stays at the top with the net flow of the last months as a small curve and
// the figure written beside it, so the one number that matters does not leave
// the screen. The curve is decoration (`aria-hidden`): the figure carries the
// meaning, and a month with no figure is a gap, never a zero.
export default function MiniFlow({ targetId, points, currency }) {
  const { t, i18n } = useTranslation();
  const [past, setPast] = useState(false);

  // Read on scroll, against the element as it is NOW: the ring's section may be
  // re-created when the page reloads its figures, which an observer bound to the
  // first element would never notice.
  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      const target = document.getElementById(targetId);
      setPast(Boolean(target) && target.getBoundingClientRect().bottom < 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    check();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [targetId]);

  const usable = (points ?? []).filter((point) => point.fluxNet !== null && point.fluxNet !== undefined);
  const show = past && usable.length >= 2;
  if (!show) return <div className="home-miniflow-anchor" />;

  const width = 120;
  const height = 28;
  const values = usable.map((point) => point.fluxNet);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);
  const span = max - min || 1;
  const line = usable.map((point, index) => `${(index / (usable.length - 1)) * width},${height - ((point.fluxNet - min) / span) * height}`).join(' ');
  const last = usable[usable.length - 1].fluxNet;

  return (
    <div className="home-miniflow-anchor">
    <div className="home-miniflow" role="status" aria-label={t('appHome.miniFlow')}>
      <svg viewBox={`0 0 ${width} ${height}`} className="home-miniflow-svg" aria-hidden="true" preserveAspectRatio="none">
        <polyline points={line} fill="none" stroke="var(--accent)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      <span>
        {t('appHome.netFlow')} : <strong>{formatAmount(i18n.language, last, currency)}</strong>
      </span>
    </div>
    </div>
  );
}
