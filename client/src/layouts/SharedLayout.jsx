import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeftRight, LogOut } from 'lucide-react';
import { useAuth } from '../auth/useAuth.js';
import LanguageSwitcher from '../components/ui/LanguageSwitcher.jsx';
import ThemeToggle from '../components/ui/ThemeToggle.jsx';
import brandMark from '../assets/brand/fincludia-mark.png';
import './SharedLayout.css';

// Gestion commune (P9-02): a solution of its own, apart from the personal
// application, with its own address (`/partage`), its own top bar and its own
// menu — one entry, « Mes espaces », and, inside a space, its compartments.
//
// The only door between the two applications is the switcher in the top bar
// (decision P9-01 point 1): nothing of Gestion commune appears in the personal
// menu, and nothing personal appears here. A space only ever shows what its
// members chose to share (the privacy matrix of P6-13).
export default function SharedLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch {
      /* the session stays; the button can be pressed again */
    }
  };

  return (
    <div className="shared-shell">
      <a href="#shared-main" className="skip-link">
        {t('appNav.skipToContent')}
      </a>
      <header className="shared-topbar">
        <Link to="/partage" className="app-brand">
          <img src={brandMark} alt="" aria-hidden="true" width="28" height="28" />
          <span>{t('common.brand')}</span>
        </Link>
        <nav className="app-switcher" aria-label={t('appNav.switcher')}>
          <NavLink to="/app" className="app-switcher-link">
            <ArrowLeftRight size={14} aria-hidden="true" />
            <span className="app-switcher-text">{t('appNav.budgetApp')}</span>
          </NavLink>
          <NavLink to="/partage" className="app-switcher-link app-switcher-current" aria-current="page">
            {t('appNav.sharedApp')}
          </NavLink>
        </nav>
        <div className="shared-topbar-actions">
          <LanguageSwitcher />
          <ThemeToggle />
          <span className="shared-user">{user?.name}</span>
          <button type="button" className="app-icon-button" onClick={handleLogout} title={t('nav.logout')}>
            <LogOut size={18} aria-hidden="true" />
            <span className="sr-only">{t('nav.logout')}</span>
          </button>
        </div>
      </header>
      <main id="shared-main" className="shared-main">
        <Outlet />
      </main>
    </div>
  );
}
