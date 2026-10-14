import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './AccountNav.css';

const links = [
  { labelKey: 'account.nav.profile', to: '/compte/profil' },
  { labelKey: 'account.nav.dashboard', to: '/compte/tableau-de-bord' },
  { labelKey: 'account.nav.formations', to: '/compte/formations' },
  { labelKey: 'account.nav.certificates', to: '/compte/certificats' },
  { labelKey: 'account.nav.type', to: '/compte/type' },
  { labelKey: 'account.nav.premium', to: '/compte/premium' },
  { labelKey: 'account.nav.payments', to: '/compte/paiements' },
  { labelKey: 'account.nav.fincludia', to: '/compte/fincludia' },
  { labelKey: 'account.nav.onboarding', to: '/compte/premiers-pas' },
  { labelKey: 'nav.today', to: '/aujourdhui' },
  { labelKey: 'nav.money', to: '/mon-argent' },
  { labelKey: 'nav.budget', to: '/budget' },
  { labelKey: 'nav.goals', to: '/objectifs' },
  { labelKey: 'nav.reserve', to: '/reserve' },
  { labelKey: 'nav.debts', to: '/dettes' },
  { labelKey: 'nav.funding', to: '/financement' },
  { labelKey: 'nav.notifications', to: '/notifications' },
  { labelKey: 'nav.trust', to: '/confiance' },
  { labelKey: 'nav.passport', to: '/passeport' },
  { labelKey: 'nav.calendar', to: '/calendrier' },
  { labelKey: 'nav.wealth', to: '/patrimoine' },
  { labelKey: 'nav.paper', to: '/portefeuille' },
  { labelKey: 'nav.spaces', to: '/espaces' },
  { labelKey: 'account.nav.categories', to: '/compte/categories' },
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
