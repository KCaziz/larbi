import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeftRight, LifeBuoy, LogOut, Plus, UserRound } from 'lucide-react';
import { useAuth } from '../../auth/useAuth.js';
import { useApi } from '../../lib/useApi.js';
import { ASSISTANT_OPEN_EVENT } from '../../lib/finControls.js';
import { SETTINGS_LINKS, visibleEntries } from '../../config/appNavigation.js';
import GlobalSearch from './GlobalSearch.jsx';
import NotificationBell from './NotificationBell.jsx';
import { QuickAddLink } from '../fincludia/QuickAdd.jsx';
import LanguageSwitcher from '../ui/LanguageSwitcher.jsx';
import ThemeToggle from '../ui/ThemeToggle.jsx';
import brandMark from '../../assets/brand/fincludia-mark.png';
import '../../layouts/AppLayout.css';

// The top bar of BOTH applications (tab 03B; recette R2-03): the same bar,
// the same buttons at the same place, whether one is in Gestion budgétaire
// or in Gestion commune — only the highlighted half of the switcher changes.
// `app` is 'budget' or 'shared'.
export default function AppTopBar({ app = 'budget' }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const journey = useApi('/fin/parcours');
  const settings = visibleEntries(SETTINGS_LINKS, { declaredMinor: journey.data?.mineurDeclare === true });
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

  const shared = app === 'shared';

  return (
    <header className="app-topbar">
      <Link to={shared ? '/partage' : '/app'} className="app-brand">
        <img src={brandMark} alt="" aria-hidden="true" width="28" height="28" />
        <span>{t('common.brand')}</span>
      </Link>

      {/* « Gestion budgétaire / Gestion commune » (P9-01 point 1): out of the
          financial menu. Gestion commune has its own address, `/partage` (P9-02). */}
      <nav className="app-switcher" aria-label={t('appNav.switcher')}>
        <NavLink to="/app" className={`app-switcher-link${shared ? '' : ' app-switcher-current'}`} aria-current={shared ? undefined : 'page'}>
          {shared && <ArrowLeftRight size={14} aria-hidden="true" />}
          <span className={shared ? 'app-switcher-text' : undefined}>{t('appNav.budgetApp')}</span>
        </NavLink>
        <NavLink to="/partage" className={`app-switcher-link${shared ? ' app-switcher-current' : ''}`} aria-current={shared ? 'page' : undefined}>
          {!shared && <ArrowLeftRight size={14} aria-hidden="true" />}
          <span className={shared ? undefined : 'app-switcher-text'}>{t('appNav.sharedApp')}</span>
        </NavLink>
      </nav>

      <div className="app-topbar-actions">
        <GlobalSearch />
        <QuickAddLink className="app-icon-button" title={t('appNav.quickAdd')}>
          <Plus size={18} aria-hidden="true" />
          <span className="sr-only">{t('appNav.quickAdd')}</span>
        </QuickAddLink>
        <NotificationBell />
        <button type="button" className="app-icon-button" title={t('nav.assistant')} onClick={() => document.dispatchEvent(new CustomEvent(ASSISTANT_OPEN_EVENT))}>
          <LifeBuoy size={18} aria-hidden="true" />
          <span className="sr-only">{t('nav.assistant')}</span>
        </button>
        {/* Language and theme in the bar itself (recette R4-02), as on the
            site; on a phone they stay in the profile menu. */}
        <div className="app-topbar-prefs">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        <div
          className="app-profile"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setProfileOpen(false);
          }}
        >
          <button type="button" className="app-icon-button" title={user?.name ?? t('appNav.mySpace')} aria-expanded={profileOpen} aria-controls="app-profile-menu" onClick={() => setProfileOpen((value) => !value)}>
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
