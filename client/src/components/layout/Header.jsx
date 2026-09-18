import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navigation from './Navigation.jsx';
import Button from '../ui/Button.jsx';
import ThemeToggle from '../ui/ThemeToggle.jsx';
import LanguageSwitcher from '../ui/LanguageSwitcher.jsx';
import { mainNavLinks } from '../../config/navigation.js';
import './Header.css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="brand" onClick={closeMenu}>
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
          <span />
          <span />
          <span />
        </button>

        <div id="primary-navigation" className={`nav-panel ${menuOpen ? 'open' : ''}`}>
          <Navigation links={mainNavLinks} onLinkClick={closeMenu} />
          <div className="header-controls">
            <LanguageSwitcher />
            <ThemeToggle />
            <div className="auth-actions">
              <Button to="/connexion" variant="secondary" onClick={closeMenu}>
                {t('nav.login')}
              </Button>
              <Button to="/inscription" variant="primary" onClick={closeMenu}>
                {t('nav.register')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
