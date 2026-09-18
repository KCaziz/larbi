import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Navigation.css';

export default function Navigation({ links, onLinkClick, className = '' }) {
  const { t } = useTranslation();

  return (
    <nav className={`main-nav ${className}`.trim()} aria-label={t('nav.main')}>
      <ul>
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
              onClick={onLinkClick}
            >
              {t(link.labelKey)}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
