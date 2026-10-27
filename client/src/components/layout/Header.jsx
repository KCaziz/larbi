import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LayoutDashboard, LifeBuoy, LogOut, Menu, UserRound, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/useAuth.js';
import Navigation from './Navigation.jsx';
import GlobalSearch from './GlobalSearch.jsx';
import NotificationBell from './NotificationBell.jsx';
import { ASSISTANT_OPEN_EVENT } from '../../lib/finControls.js';
import Button from '../ui/Button.jsx';
import ThemeToggle from '../ui/ThemeToggle.jsx';
import LanguageSwitcher from '../ui/LanguageSwitcher.jsx';
import { mainNavLinks } from '../../config/navigation.js';
import brandMark from '../../assets/brand/fincludia-mark.png';
import './Header.css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [logoutFailed, setLogoutFailed] = useState(false);
  const { t } = useTranslation();
  const { status, user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const closeMenu = () => setMenuOpen(false);

  // The auth pages (login, register, forgot password) are themselves the
  // destination of "Se connecter" / "Créer un compte" — the full bar (every
  // public link, search, notifications, an admin shortcut) has nothing to
  // offer there and only competes with the one thing the page asks for. A
  // minimal bar — the brand, and a way to leave — reads instead of crowding.
  const isAuthPage = ['/connexion', '/inscription', '/mot-de-passe-oublie'].includes(pathname);

  if (isAuthPage) {
    return (
      <header className="site-header site-header-auth">
        <div className="site-header-inner">
          <Link to="/" className="brand">
            <img src={brandMark} className="brand-mark" alt="" aria-hidden="true" width="32" height="32" />
            {t('common.brand')}
          </Link>
          <div className="header-controls">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>
    );
  }

  // The assistant is a floating panel, not a page: the bar asks for it rather
  // than navigating to it (see <ChatbotWidget>).
  const openAssistant = () => {
    closeMenu();
    document.dispatchEvent(new CustomEvent(ASSISTANT_OPEN_EVENT));
  };

  const handleLogout = async () => {
    setLogoutFailed(false);
    try {
      await logout();
      closeMenu();
      navigate('/');
    } catch {
      setLogoutFailed(true);
    }
  };

  return (
    <header className={`site-header${user?.role === 'admin' ? ' site-header-admin' : ''}`}>
      <div className="site-header-inner">
        {/* La marque officielle de la charte (P1-13), à la place de la lettre
            « L » héritée de l'ancien nom. L'image est décorative : le nom est
            déjà écrit à côté en texte, donc un `alt` le répéterait pour un
            lecteur d'écran. */}
        <Link to="/" className="brand" onClick={closeMenu}>
          <img src={brandMark} className="brand-mark" alt="" aria-hidden="true" width="32" height="32" />
          {t('common.brand')}
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label={menuOpen ? t('nav.menuClose') : t('nav.menuOpen')}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={20} strokeWidth={1.75} /> : <Menu size={20} strokeWidth={1.75} />}
        </button>

        <div id="primary-navigation" className={`nav-panel ${menuOpen ? 'open' : ''}`}>
          {/* Signed in, the public marketing links (home, formations,
              blog...) are not where this person is working — the FINCLUDIA
              sidebar is — so they move behind one "More" button instead of
              sitting in the bar at full length next to search, notifications,
              the assistant and the account controls that ARE used here. */}
          {status === 'authenticated' ? (
            <div
              className="nav-explore"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setExploreOpen(false);
              }}
            >
              <button
                type="button"
                className="nav-explore-toggle"
                aria-expanded={exploreOpen}
                aria-controls="nav-explore-panel"
                onClick={() => setExploreOpen((v) => !v)}
              >
                {t('nav.more')}
                <ChevronDown size={14} strokeWidth={2} aria-hidden="true" className={exploreOpen ? 'nav-explore-chevron open' : 'nav-explore-chevron'} />
              </button>
              {exploreOpen && (
                <div id="nav-explore-panel" className="nav-explore-panel">
                  <Navigation
                    links={mainNavLinks}
                    onLinkClick={() => {
                      closeMenu();
                      setExploreOpen(false);
                    }}
                    className="nav-explore-list"
                  />
                </div>
              )}
            </div>
          ) : (
            <Navigation links={mainNavLinks} onLinkClick={closeMenu} />
          )}
          <div className="header-controls">
            <LanguageSwitcher />
            <ThemeToggle />
            {status === 'authenticated' && <GlobalSearch />}
            {/* The top bar the client specifies (P1-12): global search
                (P6-20), notifications (P6-18), help / assistant (P3-19) and
                the profile. The assistant also floats on every screen as a
                bubble (P3-07); the bar entry is for the people who look for
                help in the bar, which is where the client put it. */}
            {status === 'authenticated' && <NotificationBell />}
            {status === 'authenticated' && (
              <div className="auth-actions">
                <Button
                  variant="secondary"
                  className="btn-collapse"
                  title={t('nav.assistant')}
                  onClick={openAssistant}
                >
                  <LifeBuoy size={16} strokeWidth={1.75} aria-hidden="true" />
                  <span className="btn-label">{t('nav.assistant')}</span>
                </Button>
                {user?.role === 'admin' && (
                  <Button to="/admin" variant="secondary" onClick={closeMenu}>
                    <LayoutDashboard size={16} strokeWidth={1.75} aria-hidden="true" />
                    {t('nav.admin')}
                  </Button>
                )}
                {/* « Accéder à mon espace » (P8-02): the showcase opens the
                    application, in the same tab. */}
                <Button
                  to="/app"
                  variant="secondary"
                  className={user?.role === 'admin' ? 'btn-collapse' : ''}
                  title={t('appNav.openApp')}
                  onClick={closeMenu}
                >
                  <UserRound size={16} strokeWidth={1.75} aria-hidden="true" />
                  <span className="btn-label">{t('appNav.openApp')}</span>
                </Button>
                <Button variant="primary" onClick={handleLogout}>
                  <LogOut size={16} strokeWidth={1.75} aria-hidden="true" />
                  {t('nav.logout')}
                </Button>
              </div>
            )}
            {(status === 'anonymous' || status === 'error') && (
              <div className="auth-actions">
                <Button to="/connexion" variant="secondary" onClick={closeMenu}>
                  {t('nav.login')}
                </Button>
                <Button to="/inscription" variant="primary" onClick={closeMenu}>
                  {t('nav.register')}
                </Button>
              </div>
            )}
            {logoutFailed && (
              <span className="header-error" role="alert">
                {t('errors.generic')}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
