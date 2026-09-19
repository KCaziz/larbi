import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './AccountNav.css';

const links = [
  { labelKey: 'account.nav.profile', to: '/compte/profil' },
  { labelKey: 'account.nav.dashboard', to: '/compte/tableau-de-bord' },
  { labelKey: 'account.nav.formations', to: '/compte/formations' },
  { labelKey: 'account.nav.type', to: '/compte/type' },
  { labelKey: 'account.nav.premium', to: '/compte/premium' },
];

export default function AccountNav() {
  const { t } = useTranslation();

  return (
    <nav className="account-nav" aria-label={t('nav.accountNav')}>
      <ul>
        {links.map((link) => (
          <li key={link.to}>
            <NavLink to={link.to} className={({ isActive }) => (isActive ? 'active' : undefined)}>
              {t(link.labelKey)}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
