import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeftRight, LifeBuoy, LogOut, Menu, PanelLeftClose, PanelLeftOpen, Plus, UserRound, X } from 'lucide-react';
import { useAuth } from '../auth/useAuth.js';
import { useApi } from '../lib/useApi.js';
import { ASSISTANT_OPEN_EVENT } from '../lib/finControls.js';
import { APP_NAV, NAV_SECTIONS, SETTINGS_LINKS, visibleEntries } from '../config/appNavigation.js';
import GlobalSearch from '../components/layout/GlobalSearch.jsx';
import NotificationBell from '../components/layout/NotificationBell.jsx';
import ChatbotWidget from '../components/assistant/ChatbotWidget.jsx';
import LanguageSwitcher from '../components/ui/LanguageSwitcher.jsx';
import ThemeToggle from '../components/ui/ThemeToggle.jsx';
import brandMark from '../assets/brand/fincludia-mark.png';
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
  const { pathname } = useLocation();
  const journey = useApi('/fin/parcours');
  const declaredMinor = journey.data?.mineurDeclare === true;
  // The count beside « Aujourd'hui »: what is left to do (answer D3). Read
  // again on each page, so a confirmation elsewhere updates it.
  const today = useApi('/fin/aujourdhui');
  const badges = { today: today.data?.aujourdhui?.aFaire?.total ?? 0 };
  const entries = visibleEntries(APP_NAV, { declaredMinor });
  const settings = visibleEntries(SETTINGS_LINKS, { declaredMinor });

  const [expanded, setExpanded] = useState(false);
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
      <AppTopBar settings={settings} />

      <div className="app-body">
        <nav className={`app-sidebar${expanded ? ' app-sidebar-expanded' : ''}`} aria-label={t('appNav.label')}>
          <button
            type="button"
            className="app-sidebar-toggle"
            aria-pressed={expanded}
            title={expanded ? t('nav.collapseMenu') : t('nav.expandMenu')}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? <PanelLeftClose size={18} aria-hidden="true" /> : <PanelLeftOpen size={18} aria-hidden="true" />}
            <span className="sr-only">{expanded ? t('nav.collapseMenu') : t('nav.expandMenu')}</span>
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

// The top bar (tab 03B): « Mon espace » at the head, search, notifications,
// help, the quick add, and the switch between the two applications.
function AppTopBar({ settings }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setProfileOpen(false), [pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch {
      /* the session stays; the button can be pressed again */
    }
  };

  return (
    <header className="app-topbar">
      <Link to="/app" className="app-brand">
        <img src={brandMark} alt="" aria-hidden="true" width="28" height="28" />
        <span>{t('common.brand')}</span>
      </Link>

      {/* « Gestion budgétaire / Gestion commune » (P9-01 point 1): out of the
          financial menu. Gestion commune gets its own address with P9-02. */}
      <nav className="app-switcher" aria-label={t('appNav.switcher')}>
        <NavLink to="/app" className="app-switcher-link app-switcher-current" aria-current="page">
          {t('appNav.budgetApp')}
        </NavLink>
        <NavLink to="/app/espaces" className="app-switcher-link">
          <ArrowLeftRight size={14} aria-hidden="true" />
          {t('appNav.sharedApp')}
        </NavLink>
      </nav>

      <div className="app-topbar-actions">
        <GlobalSearch />
        <Link to="/app/mouvements#saisie" className="app-icon-button" title={t('appNav.quickAdd')}>
          <Plus size={18} aria-hidden="true" />
          <span className="sr-only">{t('appNav.quickAdd')}</span>
        </Link>
        <NotificationBell />
        <button type="button" className="app-icon-button" title={t('nav.assistant')} onClick={() => document.dispatchEvent(new CustomEvent(ASSISTANT_OPEN_EVENT))}>
          <LifeBuoy size={18} aria-hidden="true" />
          <span className="sr-only">{t('nav.assistant')}</span>
        </button>

        <div
          className="app-profile"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setProfileOpen(false);
          }}
        >
          <button type="button" className="app-icon-button" aria-expanded={profileOpen} aria-controls="app-profile-menu" onClick={() => setProfileOpen((value) => !value)}>
            <UserRound size={18} aria-hidden="true" />
            <span className="app-profile-name">{user?.name ?? t('appNav.mySpace')}</span>
          </button>
          {profileOpen && (
            <div id="app-profile-menu" className="app-profile-menu">
              <p className="app-profile-title">{t('appNav.mySpace')}</p>
              <ul>
                {settings.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="app-profile-link">
                      <link.icon size={16} aria-hidden="true" />
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="app-profile-controls">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
              <Link to="/" className="app-profile-link">
                {t('appNav.backToSite')}
              </Link>
              <button type="button" className="app-profile-link" onClick={handleLogout}>
                <LogOut size={16} aria-hidden="true" />
                {t('nav.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
