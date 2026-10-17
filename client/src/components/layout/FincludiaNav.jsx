import { useState } from 'react';
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../lib/useApi.js';
import { ACCOUNT_LINKS, GROUP_ICONS, ROUTE_LABELS } from '../../config/fincludiaMenu.js';
import './FincludiaNav.css';

// The navigation of the connected space (P1-12), the client's specification
// § 2-3: nine entries, plus the account's own pages, as one classic sidebar —
// expanded with full labels, or collapsed to an icon-only rail, through a
// toggle the panel carries itself. The sidebar's own width changes with it;
// nothing about the page around it has to know which state it is in.
//
// WHAT IT SHOWS COMES FROM THE SERVER. `GET /fin/parcours` returns the nine
// groups already reduced to the routes this account may open (`menu`), and
// this component only writes them down. The rule lives in one place, so a
// menu cannot disagree with it — and the hiding is a convenience anyway:
// every route behind an adults-only screen is refused by `requireAdult` on
// the server, which is the statement that counts.
export default function FincludiaNav() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const journey = useApi('/fin/parcours');
  const [collapsed, setCollapsed] = useState(false);

  const groups = journey.data?.menu ?? null;

  // The group the current route belongs to, for opening it and for marking
  // its icon in the collapsed rail. `startsWith` because a page may have
  // sub-routes (a budget's detail), and the longest match wins so that
  // `/outils/comparateur/comptes` is not claimed by `/outils/comparateur`.
  const matched = groups ? bestMatch(groups, pathname) : null;
  const currentGroupKey = groups?.find((group) => group.entrees.some((entry) => entry.to === matched))?.key ?? null;

  // Manually opened/closed groups, expanded mode only. The group of the
  // CURRENT page is always shown open on top of this (below), so a deep link
  // or a followed link never lands on a closed accordion.
  const [openGroups, setOpenGroups] = useState(() => new Set());

  const toggleGroup = (key) =>
    setOpenGroups((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const entryLabel = (to) => (ROUTE_LABELS[to] ? t(ROUTE_LABELS[to].labelKey) : to);
  const EntryIcon = (to) => ROUTE_LABELS[to]?.icon ?? null;

  return (
    <nav className={`fin-nav${collapsed ? ' fin-nav-collapsed' : ''}`} aria-label={t('nav.fincludiaNav')}>
      <div className="fin-nav-head">
        {!collapsed && <span className="fin-nav-head-title">{t('nav.fincludiaNav')}</span>}
        <button
          type="button"
          className="fin-nav-collapse-toggle"
          aria-pressed={collapsed}
          title={collapsed ? t('nav.expandMenu') : t('nav.collapseMenu')}
          onClick={() => setCollapsed((v) => !v)}
        >
          {collapsed ? <PanelLeftOpen size={18} strokeWidth={1.75} aria-hidden="true" /> : <PanelLeftClose size={18} strokeWidth={1.75} aria-hidden="true" />}
          <span className="sr-only">{collapsed ? t('nav.expandMenu') : t('nav.collapseMenu')}</span>
        </button>
      </div>

      {journey.status === 'error' && !collapsed && (
        <p className="fin-nav-degraded" role="status">
          {t('nav.menuUnavailable')}
        </p>
      )}

      <div className="fin-nav-body">
        {groups?.length > 0 && (
          <ul className="fin-nav-groups">
            {groups.map((group) => {
              const GroupIcon = GROUP_ICONS[group.key] ?? null;
              const isCurrent = currentGroupKey === group.key;
              const single = group.entrees.length === 1;
              const isOpen = !collapsed && (single || isCurrent || openGroups.has(group.key));
              const groupLabel = t(`nav.groups.${group.key}`);

              // Collapsed: one icon per group, a straight link to its first
              // entry — there is no room for a heading plus a flyout, and a
              // classic icon rail is a set of destinations, not an accordion.
              if (collapsed) {
                return (
                  <li key={group.key} className={isCurrent ? 'fin-nav-rail-item fin-nav-rail-current' : 'fin-nav-rail-item'}>
                    <NavLink to={group.entrees[0].to} className="fin-nav-rail-link" title={groupLabel} aria-label={groupLabel}>
                      {GroupIcon && <GroupIcon size={19} strokeWidth={1.75} aria-hidden="true" />}
                    </NavLink>
                  </li>
                );
              }

              return (
                <li key={group.key} className={`fin-nav-group${isCurrent ? ' fin-nav-group-current' : ''}`}>
                  {/* A group of one entry IS that entry: a heading above a
                      single link would be a level of menu that leads nowhere. */}
                  {single ? (
                    <NavLink to={group.entrees[0].to} className="fin-nav-group-link">
                      {GroupIcon && <GroupIcon size={16} strokeWidth={1.75} aria-hidden="true" />}
                      <span>{groupLabel}</span>
                    </NavLink>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="fin-nav-group-link fin-nav-group-toggle"
                        aria-expanded={isOpen}
                        onClick={() => toggleGroup(group.key)}
                      >
                        {GroupIcon && <GroupIcon size={16} strokeWidth={1.75} aria-hidden="true" />}
                        <span>{groupLabel}</span>
                        <ChevronDown
                          size={15}
                          strokeWidth={1.75}
                          aria-hidden="true"
                          className={isOpen ? 'fin-nav-chevron fin-nav-chevron-open' : 'fin-nav-chevron'}
                        />
                      </button>

                      {isOpen && (
                        <ul className="fin-nav-entries">
                          {group.entrees.map((entry) => {
                            const Icon = EntryIcon(entry.to);
                            return (
                              <li key={entry.to}>
                                <NavLink
                                  to={entry.to}
                                  className={({ isActive }) => (isActive ? 'fin-nav-entry active' : 'fin-nav-entry')}
                                >
                                  {Icon && <Icon size={15} strokeWidth={1.75} aria-hidden="true" />}
                                  <span>{entryLabel(entry.to)}</span>
                                </NavLink>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <div className="fin-nav-sep" role="separator" aria-hidden="true" />

        {!collapsed && <h2 className="fin-nav-heading">{t('nav.accountGroup')}</h2>}
        <ul className={collapsed ? 'fin-nav-groups' : 'fin-nav-entries fin-nav-account'}>
          {ACCOUNT_LINKS.map((link) => {
            const Icon = link.icon;
            const label = t(link.labelKey);
            if (collapsed) {
              return (
                <li key={link.to} className="fin-nav-rail-item">
                  <NavLink to={link.to} className="fin-nav-rail-link" title={label} aria-label={label}>
                    {Icon && <Icon size={19} strokeWidth={1.75} aria-hidden="true" />}
                  </NavLink>
                </li>
              );
            }
            return (
              <li key={link.to}>
                <NavLink to={link.to} className={({ isActive }) => (isActive ? 'fin-nav-entry active' : 'fin-nav-entry')}>
                  {Icon && <Icon size={15} strokeWidth={1.75} aria-hidden="true" />}
                  <span>{label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
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
