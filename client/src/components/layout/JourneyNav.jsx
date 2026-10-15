import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../lib/useApi.js';
import './AccountNav.css';

// The persistent navigation of the FINCLUDIA screens (P6-17): filtered by the
// journey map of the caller's public (`GET /fin/parcours`), exactly like
// AccountNav's own filtering — a lycéen has no debt entry here either,
// because the server says so, not because this file hides it as a favour.
//
// This stays visible on every FINCLUDIA screen (today, money, budget, goals…)
// so moving between them is navigation within the SAME area, never a
// disorienting jump out of it — and the trailing "Mon compte" entry is the
// one, explicit, always-available way across to the account/settings area,
// which keeps its own matching way back (see AccountNav's last entry).
const journeyLinks = [
  { labelKey: 'nav.today', to: '/aujourdhui' },
  { labelKey: 'nav.money', to: '/mon-argent' },
  { labelKey: 'nav.budget', to: '/budget' },
  { labelKey: 'nav.goals', to: '/objectifs' },
  { labelKey: 'nav.reserve', to: '/reserve' },
  { labelKey: 'nav.debts', to: '/dettes' },
  { labelKey: 'nav.wealth', to: '/patrimoine' },
  { labelKey: 'nav.funding', to: '/financement' },
  { labelKey: 'nav.calendar', to: '/calendrier' },
  { labelKey: 'nav.paper', to: '/portefeuille' },
  { labelKey: 'nav.spaces', to: '/espaces' },
  { labelKey: 'nav.notifications', to: '/notifications' },
  { labelKey: 'nav.trust', to: '/confiance' },
  { labelKey: 'nav.passport', to: '/passeport' },
];

export default function JourneyNav() {
  const { t } = useTranslation();
  const journey = useApi('/fin/parcours');

  // While the map is loading, or if it cannot be read, every entry is shown.
  // Hiding entries on a failed request would make a network hiccup look like a
  // smaller product — and the server refuses what must be refused anyway.
  const allowed = journey.data
    ? new Set(journey.data.ecrans.filter((screen) => screen.autorise && screen.to).map((screen) => screen.to))
    : null;

  const links = journeyLinks.filter((link) => allowed === null || allowed.has(link.to));

  return (
    <nav className="account-nav journey-nav" aria-label={t('nav.journeyNav')}>
      <ul>
        {links.map((link) => (
          <li key={link.to}>
            <NavLink to={link.to} className={({ isActive }) => (isActive ? 'active' : undefined)}>
              {t(link.labelKey)}
            </NavLink>
          </li>
        ))}
        <li className="account-nav-sep">
          <NavLink to="/compte" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            {t('account.nav.myAccount')}
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
