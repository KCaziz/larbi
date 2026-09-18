import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from './Navigation.jsx';
import Button from '../ui/Button.jsx';
import { mainNavLinks, authNavLinks } from '../../config/navigation.js';
import './Header.css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="brand" onClick={closeMenu}>
          Larbi
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <div id="primary-navigation" className={`nav-panel ${menuOpen ? 'open' : ''}`}>
          <Navigation links={mainNavLinks} onLinkClick={closeMenu} />
          <div className="auth-actions">
            <Button to="/connexion" variant="secondary" onClick={closeMenu}>
              {authNavLinks[0].label}
            </Button>
            <Button to="/inscription" variant="primary" onClick={closeMenu}>
              {authNavLinks[1].label}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
