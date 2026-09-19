import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Menu, UserRound, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/useAuth.js';
import Navigation from './Navigation.jsx';
import Button from '../ui/Button.jsx';
import ThemeToggle from '../ui/ThemeToggle.jsx';
import LanguageSwitcher from '../ui/LanguageSwitcher.jsx';
import { mainNavLinks } from '../../config/navigation.js';
import './Header.css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutFailed, setLogoutFailed] = useState(false);
  const { t } = useTranslation();
  const { status, user, logout } = useAuth();
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

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
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="brand" onClick={closeMenu}>
          <span className="brand-mark" aria-hidden="true">
            L
          </span>
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
          <Navigation links={mainNavLinks} onLinkClick={closeMenu} />
          <div className="header-controls">
            <LanguageSwitcher />
            <ThemeToggle />
            {status === 'authenticated' && (
              <div className="auth-actions">
                {user?.role === 'admin' && (
                  <Button to="/admin" variant="secondary" onClick={closeMenu}>
                    <LayoutDashboard size={16} strokeWidth={1.75} aria-hidden="true" />
                    {t('nav.admin')}
                  </Button>
                )}
                <Button
                  to="/compte"
                  variant="secondary"
                  className={user?.role === 'admin' ? 'btn-collapse' : ''}
                  title={t('nav.account')}
                  onClick={closeMenu}
                >
                  <UserRound size={16} strokeWidth={1.75} aria-hidden="true" />
                  <span className="btn-label">{t('nav.account')}</span>
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
