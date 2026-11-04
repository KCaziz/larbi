import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { useApi } from '../lib/useApi.js';
import { useRevealOnAction } from '../lib/useRevealOnAction.js';
import { APP_NAV, NAV_SECTIONS, SETTINGS_LINKS, visibleEntries } from '../config/appNavigation.js';
import ChatbotWidget from '../components/assistant/ChatbotWidget.jsx';
import QuickAdd from '../components/fincludia/QuickAdd.jsx';
import AppTopBar from '../components/layout/AppTopBar.jsx';
import './AppLayout.css';

// The application's own window (P8-02): apart from the showcase site, with
// its own top bar, its sidebar and, on a phone, a bottom navigation (tab
// 03B). The menu is the client's final one, identical for every profile; the
// adults-only entries leave it only for a declared minor, and the server
// refuses those routes whatever the menu shows.
//
// Widths, as the client wrote them: a fixed sidebar from 1 200 px, a
// collapsible one between 768 and 1 199 px, a bottom bar with a « Plus »
// sheet below 768 px.
export default function AppLayout() {
  const { t } = useTranslation();
  useRevealOnAction();
  const { pathname } = useLocation();
  const journey = useApi('/fin/parcours');
  const declaredMinor = journey.data?.mineurDeclare === true;
  // The count beside « Aujourd'hui »: what is left to do (answer D3). Read
  // again on each page, so a confirmation elsewhere updates it.
  const today = useApi('/fin/aujourdhui');
  const badges = { today: today.data?.aujourdhui?.aFaire?.total ?? 0 };
  const entries = visibleEntries(APP_NAV, { declaredMinor });
  const settings = visibleEntries(SETTINGS_LINKS, { declaredMinor });

  // The sidebar can be folded to its icons and unfolded (recette R4-01), on
  // every width: folded is the exception on a computer, the rule on a tablet.
  // The choice is kept for the next visit.
  const [toggled, setToggled] = useState(() => readSidebarChoice());
  const wide = typeof window !== 'undefined' && window.matchMedia?.('(min-width: 1200px)').matches;
  const folded = wide ? toggled : !toggled;
  const toggleSidebar = () =>
    setToggled((value) => {
      try {
        localStorage.setItem(SIDEBAR_KEY, value ? '0' : '1');
      } catch {
        /* private window: the choice holds for this visit only */
      }
      return !value;
    });
  const [moreOpen, setMoreOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  // A new page closes the phone sheet (adjusting state during render rather
  // than in an effect, as the rest of the application does).
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMoreOpen(false);
    today.reload();
  }

  // The five sections of the menu (answer D3 and the improvements retained).
  const sections = NAV_SECTIONS.map((section) => ({ ...section, entries: entries.filter((entry) => entry.section === section.key) })).filter(
    (section) => section.entries.length > 0,
  );

  return (
    <div className="app-shell">
      <a href="#app-main" className="skip-link">
        {t('appNav.skipToContent')}
      </a>
      <AppTopBar app="budget" />

      <div className="app-body">
        <nav className={`app-sidebar${toggled ? ' app-sidebar-toggled' : ''}`} aria-label={t('appNav.label')}>
          <button type="button" className="app-sidebar-toggle" aria-expanded={!folded} title={folded ? t('nav.expandMenu') : t('nav.collapseMenu')} onClick={toggleSidebar}>
            {folded ? <PanelLeftOpen className="icon-dir" size={18} aria-hidden="true" /> : <PanelLeftClose className="icon-dir" size={18} aria-hidden="true" />}
            <span className="app-nav-text">{folded ? t('nav.expandMenu') : t('nav.collapseMenu')}</span>
          </button>
          {sections.map((section) => (
            <div key={section.key} className="app-nav-section">
              <p className="app-nav-heading">{t(section.labelKey)}</p>
              <NavList entries={section.entries} badges={badges} />
            </div>
          ))}
        </nav>

        <main id="app-main" className="app-main">
          <Outlet />
          <QuickAdd />
        </main>
      </div>

      {/* Phone: the four daily entries and « Plus » for everything else. */}
      <nav className="app-bottom-nav" aria-label={t('appNav.label')}>
        {entries
          .filter((entry) => entry.mobile)
          .map((entry) => (
            <NavLink key={entry.key} to={entry.to} end={entry.end} className="app-bottom-link">
              <entry.icon size={20} aria-hidden="true" />
              <span>{t(entry.labelKey)}</span>
              {badges[entry.key] > 0 && <span className="app-nav-badge">{badges[entry.key]}</span>}
            </NavLink>
          ))}
        <button type="button" className="app-bottom-link" aria-expanded={moreOpen} aria-controls="app-more" onClick={() => setMoreOpen((value) => !value)}>
          {moreOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          <span>{t('appNav.more')}</span>
        </button>
      </nav>
      {moreOpen && (
        <div id="app-more" className="app-more-sheet">
          <NavList entries={entries.filter((entry) => !entry.mobile)} badges={badges} />
          <NavList entries={settings} />
        </div>
      )}

      <ChatbotWidget />
    </div>
  );
}

const SIDEBAR_KEY = 'fincludia.sidebar';
function readSidebarChoice() {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === '1';
  } catch {
    return false;
  }
}

function NavList({ entries, badges = {}, className = '' }) {
  const { t } = useTranslation();
  return (
    <ul className={`app-nav-list ${className}`}>
      {entries.map((entry) => (
        <li key={entry.to}>
          <NavLink to={entry.to} end={entry.end} className="app-nav-link" title={t(entry.labelKey)}>
            <entry.icon size={18} aria-hidden="true" />
            <span className="app-nav-text">{t(entry.labelKey)}</span>
            {badges[entry.key] > 0 && (
              <span className="app-nav-badge" aria-label={t('appNav.toDo', { count: badges[entry.key] })}>
                {badges[entry.key]}
              </span>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
