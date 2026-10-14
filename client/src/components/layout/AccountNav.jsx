import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../lib/useApi.js';
import './AccountNav.css';

// The navigation of the connected space (P6-17).
//
// The FINCLUDIA entries are filtered by the journey map of the caller's public
// (the client's tab `19_Cartes_Parcours`, served by `GET /fin/parcours`): a
// lycéen has no debt and no patrimony entry, because the client says so.
//
// This is a CONVENIENCE, never the protection. The routes behind the
// adults-only screens are guarded by `requireAdult` on the server, so a hidden
// entry and a refused request are two independent statements of the same rule —
// and the one that matters is the server's.
//
// Account entries (/compte/*) are not part of a journey: they are the account
// itself, and everybody has one.
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

// The FINCLUDIA screens, each tied to the route the journey map speaks about.
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

export default function AccountNav() {
  const { t } = useTranslation();
  const journey = useApi('/fin/parcours');

  // While the map is loading, or if it cannot be read, every entry is shown.
  // Hiding entries on a failed request would make a network hiccup look like a
  // smaller product — and the server refuses what must be refused anyway.
  const allowed = journey.data
    ? new Set(journey.data.ecrans.filter((screen) => screen.autorise && screen.to).map((screen) => screen.to))
    : null;

  const links = [
    ...accountLinks,
    ...journeyLinks.filter((link) => allowed === null || allowed.has(link.to)),
  ];

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
