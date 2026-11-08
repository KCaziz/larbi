import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatAmount } from '../../lib/format.js';

// G-03 on the Accueil: « devient mini-graphe lors du scroll », and the client's
// own words at the recette (R9-17): « le camembert doit devenir plat lorsque
// nous glissons vers le bas ». While the ring is on screen nothing shows; once
// the person has scrolled past it, the SAME ring stays at the top, flattened
// into a slim bar — the same slices, the same colours, the same tab — with its
// figure written beside it. The bar is decoration (`aria-hidden`): the figure
// and the tab's name carry the meaning.
export default function MiniFlow({ targetId, rows, title, figure, currency }) {
  const { i18n } = useTranslation();
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

  const slices = (rows ?? []).filter((row) => row.total > 0);
  const sum = slices.reduce((acc, row) => acc + row.total, 0);
  if (!past || sum === 0) return <div className="home-miniflow-anchor" />;

  return (
    <div className="home-miniflow-anchor">
      <div className="home-miniflow" role="status" aria-label={title}>
        <span className="home-miniflow-bar" aria-hidden="true">
          {slices.map((row) => (
            <span key={row.key} style={{ flexGrow: row.total, background: row.color ?? 'var(--border-strong)' }} />
          ))}
        </span>
        <span>
          {title} : <strong>{formatAmount(i18n.language, figure ?? sum, currency)}</strong>
        </span>
      </div>
    </div>
  );
}
