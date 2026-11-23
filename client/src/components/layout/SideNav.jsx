import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { bestNavMatch, navLinkProps } from '../../lib/navMatch.js';
import { ArrowRight, CircleCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import brandMark from '../../assets/brand/fincludia-mark.png';
import Waves from '../ui/Waves.jsx';

// The client's sidebar (refonte 2026-11-16), shared by the three windows:
// Gestion budgétaire, Gestion commune and the administration. Dark, the whole
// height of the window, the brand at its head, the sections, then what sits at
// its foot. The styles live in layouts/AppLayout.css.
//
// sections: [{ key, title, entries: [{ key, to, end, label, icon, badge, badgeLabel }] }]
// foot:     [{ key, label, icon, to } | { key, label, icon, onClick }]
export default function SideNav({ label, home, sections, foot = [], promo = false, headExtra = null, toggled = false }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const best = bestNavMatch(pathname, sections.flatMap((section) => section.entries));
  return (
    <nav className={`app-sidebar${toggled ? ' app-sidebar-toggled' : ''}`} aria-label={label}>
      <div className="app-side-head">
        <Link to={home} className="app-side-brand" title={t('common.brand')}>
          <img src={brandMark} alt="" aria-hidden="true" width="30" height="30" />
          <span className="app-side-brand-text">
            <strong>{t('common.brand')}</strong>
          </span>
        </Link>
        {headExtra}
      </div>
      <div className="app-side-scroll">
        {sections.map((section) => (
          <div key={section.key} className="app-nav-section">
            {section.title && <p className="app-nav-heading">{section.title}</p>}
            <ul className="app-nav-list">
              {section.entries.map((entry) => (
                <li key={entry.key ?? entry.to}>
                  <NavLink to={entry.to} end={entry.end} {...navLinkProps(entry, best, 'app-nav-link')} title={entry.label}>
                    <entry.icon size={18} aria-hidden="true" />
                    <span className="app-nav-text">{entry.label}</span>
                    {entry.badge > 0 && (
                      <span className="app-nav-badge" aria-label={entry.badgeLabel}>
                        {entry.badge}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {promo && (
          <aside className="app-side-promo" aria-labelledby="app-side-promo-title">
            <p id="app-side-promo-title" className="app-side-promo-title">
              {t('appNav.promo.title')}
            </p>
            <ul>
              {['budget', 'simulate', 'compare'].map((key) => (
                <li key={key}>
                  <CircleCheck size={14} aria-hidden="true" />
                  {t(`appNav.promo.${key}`)}
                </li>
              ))}
            </ul>
            <Link to="/app/outils" className="app-side-promo-link">
              {t('appNav.promo.cta')} <ArrowRight size={14} aria-hidden="true" className="icon-dir" />
            </Link>
            {/* P13-03: the card's sea, as in the client's model. */}
            <Waves height={58} calm className="app-side-promo-waves" />
          </aside>
        )}
      </div>
      {foot.length > 0 && (
        <div className="app-side-foot">
          {foot.map((item) =>
            item.to ? (
              <NavLink key={item.key} to={item.to} end={item.end} className="app-side-foot-link" title={item.label}>
                <item.icon size={18} aria-hidden="true" />
                <span className="app-side-foot-text">{item.label}</span>
              </NavLink>
            ) : (
              <button key={item.key} type="button" className="app-side-foot-link" title={item.label} onClick={item.onClick}>
                <item.icon size={18} aria-hidden="true" />
                <span className="app-side-foot-text">{item.label}</span>
              </button>
            ),
          )}
        </div>
      )}
    </nav>
  );
}

// Folding the sidebar (recette R4-01), remembered per window on this browser.
// Folded is the exception on a computer and the rule on a tablet, so the stored
// choice means « the other way than the default ».
export function useSidebarFold(storageKey) {
  const [toggled, setToggled] = useState(() => {
    try {
      return localStorage.getItem(storageKey) === '1';
    } catch {
      return false;
    }
  });
  const wide = typeof window !== 'undefined' && window.matchMedia?.('(min-width: 1200px)').matches;
  const folded = wide ? toggled : !toggled;
  const toggle = () =>
    setToggled((value) => {
      try {
        localStorage.setItem(storageKey, value ? '0' : '1');
      } catch {
        /* private window: the choice holds for this visit only */
      }
      return !value;
    });
  return { toggled, folded, toggle };
}
