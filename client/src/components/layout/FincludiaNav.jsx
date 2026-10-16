import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../lib/useApi.js';
import { ACCOUNT_LINKS, GROUP_ICONS, ROUTE_LABELS } from '../../config/fincludiaMenu.js';
import './FincludiaNav.css';

// The navigation of the connected space (P1-12), the client's specification
// § 2-3: nine entries, side menu on a computer, tabs plus a secondary menu on a
// phone, entries shown or hidden according to the public and the age.
//
// WHAT IT SHOWS COMES FROM THE SERVER. `GET /fin/parcours` returns the nine
// groups already reduced to the routes this account may open (`menu`), and this
// component only writes them down. The rule lives in one place, so a menu
// cannot disagree with it — and the hiding is a convenience anyway: every route
// behind an adults-only screen is refused by `requireAdult` on the server,
// which is the statement that counts.
//
// The two layouts are ONE markup switched by CSS, not two component trees:
// rendering the menu twice would double the tab stops and read the same links
// twice to a screen reader.
//
// On a phone the secondary menu is derived from the current route rather than
// held in state: the open group is the group you are in. No toggle means no
// `aria-expanded` to keep truthful, and the whole menu stays reachable with the
// Tab key alone.
export default function FincludiaNav() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const journey = useApi('/fin/parcours');

  const groups = journey.data?.menu ?? null;

  // The group the current route belongs to, for the phone's secondary menu.
  // `startsWith` because a page may have sub-routes (a budget's detail), and
  // the longest match wins so that `/outils/comparateur/comptes` is not claimed
  // by `/outils/comparateur`.
  const matched = groups ? bestMatch(groups, pathname) : null;
  const currentGroup = groups?.find((group) => group.entrees.some((entry) => entry.to === matched));

  const entryLabel = (to) => (ROUTE_LABELS[to] ? t(ROUTE_LABELS[to].labelKey) : to);
  const EntryIcon = (to) => ROUTE_LABELS[to]?.icon ?? null;

  return (
    <nav className="fin-nav" aria-label={t('nav.fincludiaNav')}>
      {/* While the map loads, or when it cannot be read, nothing is guessed:
          the account links are always shown and the FINCLUDIA groups appear
          once the server has said which ones. Showing every group on a failed
          request would offer pages the account cannot open; showing none would
          make a network hiccup look like a smaller product — so the panel says
          which of the two happened. */}
      {journey.status === 'error' && (
        <p className="fin-nav-degraded" role="status">
          {t('nav.menuUnavailable')}
        </p>
      )}

      {groups?.length > 0 && (
        <ul className="fin-nav-groups">
          {groups.map((group) => {
            const GroupIcon = GROUP_ICONS[group.key] ?? null;
            const isCurrent = currentGroup?.key === group.key;
            const single = group.entrees.length === 1;

            return (
              <li
                key={group.key}
                className={`fin-nav-group${isCurrent ? ' fin-nav-group-current' : ''}`}
              >
                {/* A group of one entry IS that entry: a heading above a single
                    link would be a level of menu that leads nowhere. */}
                {single ? (
                  <NavLink to={group.entrees[0].to} className="fin-nav-group-link">
                    {GroupIcon && <GroupIcon size={16} strokeWidth={1.75} aria-hidden="true" />}
                    <span>{t(`nav.groups.${group.key}`)}</span>
                  </NavLink>
                ) : (
                  <>
                    {/* On a phone this is the tab; on a computer it is the
                        heading of the group. Either way it leads to the group's
                        first entry, so the tab is never a dead end. */}
                    <NavLink to={group.entrees[0].to} className="fin-nav-group-link">
                      {GroupIcon && <GroupIcon size={16} strokeWidth={1.75} aria-hidden="true" />}
                      <span>{t(`nav.groups.${group.key}`)}</span>
                    </NavLink>

                    <ul className="fin-nav-entries">
                      {group.entrees.map((entry) => {
                        const Icon = EntryIcon(entry.to);
                        return (
                          <li key={entry.to}>
                            <NavLink
                              to={entry.to}
                              className={({ isActive }) =>
                                isActive ? 'fin-nav-entry active' : 'fin-nav-entry'
                              }
                            >
                              {Icon && <Icon size={15} strokeWidth={1.75} aria-hidden="true" />}
                              <span>{entryLabel(entry.to)}</span>
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <h2 className="fin-nav-heading">{t('nav.accountGroup')}</h2>
      <ul className="fin-nav-entries fin-nav-account">
        {ACCOUNT_LINKS.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) => (isActive ? 'fin-nav-entry active' : 'fin-nav-entry')}
            >
              <span>{t(link.labelKey)}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// The menu route that best describes a path: the longest declared route the
// path starts with. `/budget/42` belongs to `/budget`, and
// `/outils/comparateur/comptes` to itself rather than to `/outils/comparateur`.
function bestMatch(groups, pathname) {
  const routes = groups.flatMap((group) => group.entrees.map((entry) => entry.to));
  return routes
    .filter((route) => pathname === route || pathname.startsWith(`${route}/`))
    .sort((a, b) => b.length - a.length)[0] ?? null;
}
