import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocalePath } from '../../i18n/useLocalePath.js';
import './Navigation.css';

export default function Navigation({ links, onLinkClick, className = '' }) {
  const { t } = useTranslation();
  const localePath = useLocalePath();

  return (
    <nav className={`main-nav ${className}`.trim()} aria-label={t('nav.main')}>
      <ul>
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={localePath(link.to)}
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
