import { NavLink } from 'react-router-dom';
import './AccountNav.css';

const links = [
  { label: 'Profil', to: '/compte/profil' },
  { label: 'Tableau de bord', to: '/compte/tableau-de-bord' },
  { label: 'Type de compte', to: '/compte/type' },
  { label: 'Contenus premium', to: '/compte/premium' },
];

export default function AccountNav() {
  return (
    <nav className="account-nav" aria-label="Navigation du compte">
      <ul>
        {links.map((link) => (
          <li key={link.to}>
            <NavLink to={link.to} className={({ isActive }) => (isActive ? 'active' : undefined)}>
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
