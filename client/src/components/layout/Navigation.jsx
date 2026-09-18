import { NavLink } from 'react-router-dom';
import './Navigation.css';

export default function Navigation({ links, onLinkClick, className = '' }) {
  return (
    <nav className={`main-nav ${className}`.trim()} aria-label="Navigation principale">
      <ul>
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
              onClick={onLinkClick}
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
