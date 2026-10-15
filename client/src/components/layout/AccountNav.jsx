import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './AccountNav.css';

// The navigation of the account/settings area (P6-17 follow-up): profile,
// formations, certificates, account type, payments, the FINCLUDIA profile
// form and the onboarding/categories screens. These stay in frame — the
// `<Outlet/>` of AccountLayout swaps between them without ever leaving this
// nav bar.
//
// The FINCLUDIA screens (today, money, budget, goals…) used to be mixed into
// this SAME list, even though clicking one of them left this area entirely
// (a different layout, no nav bar, no way back) — exactly the inconsistency
// reported: some entries stayed "in place", others silently redirected. They
// now live in their own persistent nav (`JourneyNav.jsx`), and the one link
// below ("Retour à FINCLUDIA") is the explicit, always-available way back —
// the equivalent of JourneyNav's own trailing "Mon compte" entry.
const accountLinks = [
  { labelKey: 'account.nav.profile', to: '/compte/profil' },
  { labelKey: 'account.nav.dashboard', to: '/compte/tableau-de-bord' },
  { labelKey: 'account.nav.formations', to: '/compte/formations' },
  { labelKey: 'account.nav.certificates', to: '/compte/certificats' },
  { labelKey: 'account.nav.type', to: '/compte/type' },
  { labelKey: 'account.nav.premium', to: '/compte/premium' },
  { labelKey: 'account.nav.payments', to: '/compte/paiements' },
  { labelKey: 'account.nav.fincludia', to: '/compte/fincludia' },
  { labelKey: 'account.nav.onboarding', to: '/compte/premiers-pas' },
  { labelKey: 'account.nav.categories', to: '/compte/categories' },
];

export default function AccountNav() {
  const { t } = useTranslation();

  return (
    <nav className="account-nav" aria-label={t('nav.accountNav')}>
      <ul>
        {accountLinks.map((link) => (
          <li key={link.to}>
            <NavLink to={link.to} className={({ isActive }) => (isActive ? 'active' : undefined)}>
              {t(link.labelKey)}
            </NavLink>
          </li>
        ))}
        <li className="account-nav-sep">
          <NavLink to="/aujourdhui">{t('account.nav.backToFincludia')}</NavLink>
        </li>
      </ul>
    </nav>
  );
}
