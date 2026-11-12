import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { ADMIN_NAV_SECTIONS } from '../../config/adminNav.js';
import AdminTour from './AdminTour.jsx';
import './cms.css';

const FOLD_KEY = 'admin-menu-folded';
const readFolded = () => {
  try {
    return localStorage.getItem(FOLD_KEY) === '1';
  } catch {
    return false;
  }
};

// Frame of the administration area: side menu + content. Generic on purpose:
// formations and articles are just different `items` in the menu.
// Recette R11-09: the entries are grouped in sections (like the application's
// menu), the menu scrolls on its own when taller than the screen, and it folds
// to its icons — remembered on this browser only.
export default function CmsShell({ items }) {
  const { t } = useTranslation();
  const [folded, setFolded] = useState(readFolded);

  const toggle = () =>
    setFolded((value) => {
      try {
        localStorage.setItem(FOLD_KEY, value ? '0' : '1');
      } catch {
        // A private window: folding still works for this visit.
      }
      return !value;
    });

  const sections = ADMIN_NAV_SECTIONS.map((key) => ({ key, entries: items.filter((item) => (item.section ?? 'overview') === key) })).filter((section) => section.entries.length > 0);

  return (
    <div className={`cms-shell ${folded ? 'cms-shell-folded' : ''}`}>
      <nav className="cms-menu" aria-label={t('admin.shell.menu')}>
        <div className="cms-menu-title-row">
          {!folded && <p className="cms-menu-title">{t('admin.shell.title')}</p>}
          {!folded && <AdminTour />}
          <button type="button" className="cms-menu-fold" aria-expanded={!folded} title={folded ? t('nav.expandMenu') : t('nav.collapseMenu')} aria-label={folded ? t('nav.expandMenu') : t('nav.collapseMenu')} onClick={toggle}>
            {folded ? <PanelLeftOpen className="icon-dir" size={18} aria-hidden="true" /> : <PanelLeftClose className="icon-dir" size={18} aria-hidden="true" />}
          </button>
        </div>
        <div className="cms-menu-scroll">
          {sections.map((section) => (
            <div key={section.key} className="cms-menu-section">
              {!folded && <p className="cms-menu-section-title">{t(`admin.navSections.${section.key}`)}</p>}
              <ul>
                {section.entries.map(({ to, icon: Icon, labelKey, end }) => (
                  <li key={to}>
                    <NavLink to={to} end={end} title={folded ? t(labelKey) : undefined} aria-label={folded ? t(labelKey) : undefined} className={({ isActive }) => (isActive ? 'active' : undefined)}>
                      <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                      {!folded && <span>{t(labelKey)}</span>}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>
      <div className="cms-content">
        <Outlet />
      </div>
    </div>
  );
}
