import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  CalendarDays,
  Coins,
  FileText,
  Heart,
  Home,
  LayoutDashboard,
  LayoutGrid,
  LifeBuoy,
  ListChecks,
  PiggyBank,
  Receipt,
  Target,
  Users,
  UsersRound,
  Wallet,
} from 'lucide-react';
import AppTopBar from '../components/layout/AppTopBar.jsx';
import SideNav, { useSidebarFold } from '../components/layout/SideNav.jsx';
import { useRevealOnAction } from '../lib/useRevealOnAction.js';
import { useApi } from '../lib/useApi.js';
import { ASSISTANT_OPEN_EVENT } from '../lib/finControls.js';
import { SPACE_SECTIONS } from '../config/spaceSections.js';
import ChatbotWidget from '../components/assistant/ChatbotWidget.jsx';
import { AnalyticsTracker } from '../components/analytics/Analytics.jsx';
import './AppLayout.css';
import './SharedLayout.css';

const KIND_ICONS = { flatshare: Building2, couple: Heart, household: Home, group: UsersRound };
const SECTION_ICONS = {
  dashboard: LayoutDashboard,
  expenses: Receipt,
  budgets: PiggyBank,
  pot: Coins,
  tasks: ListChecks,
  calendar: CalendarDays,
  goals: Target,
  household: Home,
  report: FileText,
  members: Users,
};

// Gestion commune (P9-02): a solution of its own, apart from the personal
// application, with its own address (`/partage`). Since the refonte of
// 2026-11-16 it has the same dark sidebar as the application: the list of the
// person's spaces and, inside a space, its compartments (the same ones as the
// tabs of SpaceFrame, which stay on a phone).
//
// The top bar is the SAME as Gestion budgétaire's (recette R2-03): one bar for
// both applications, its switcher (decision P9-01 point 1) saying which one is
// open. A space only ever shows what its members chose to share (the privacy
// matrix of P6-13).
export default function SharedLayout() {
  const { t } = useTranslation();
  useRevealOnAction();
  const { pathname } = useLocation();
  const { toggled, folded, toggle } = useSidebarFold('fincludia.shared-sidebar');
  const list = useApi('/fin/espaces');
  const spaces = list.data?.spaces ?? [];
  const currentId = pathname.match(/^\/partage\/([^/]+)/)?.[1] ?? null;
  const current = spaces.find((space) => space.id === currentId) ?? null;

  const sections = [
    {
      key: 'home',
      title: t('shared.nav.title'),
      entries: [{ key: 'all', to: '/partage', end: true, label: t('shared.nav.all'), icon: LayoutGrid }],
    },
    spaces.length > 0 && {
      key: 'spaces',
      title: t('shared.nav.mySpaces'),
      entries: spaces.map((space) => ({ key: space.id, to: `/partage/${space.id}`, end: true, label: space.label, icon: KIND_ICONS[space.kind] ?? UsersRound })),
    },
    current && {
      key: 'current',
      title: current.label,
      entries: SPACE_SECTIONS.filter((section) => !section.kinds || section.kinds.includes(current.kind)).map((section) => ({
        key: section.key,
        to: `/partage/${current.id}${section.to ? `/${section.to}` : ''}`,
        end: section.end,
        label: t(`shared.sections.${section.key}`),
        icon: SECTION_ICONS[section.key] ?? LayoutDashboard,
      })),
    },
  ].filter(Boolean);

  return (
    <div className="app-shell shared-shell">
      <a href="#shared-main" className="skip-link">
        {t('appNav.skipToContent')}
      </a>
      <div className="app-body">
        <SideNav
          label={t('shared.spaceMenu')}
          home="/partage"
          sections={sections}
          toggled={toggled}
          foot={[
            { key: 'budget', to: '/app', label: t('appNav.budgetApp'), icon: Wallet },
            { key: 'help', label: t('appNav.helpSupport'), icon: LifeBuoy, onClick: () => document.dispatchEvent(new CustomEvent(ASSISTANT_OPEN_EVENT)) },
          ]}
        />
        <div className="app-column">
          <AppTopBar app="shared" menu={{ folded, onToggle: toggle }} />
          <main id="shared-main" className="shared-main">
            <Outlet />
          </main>
        </div>
      </div>
      <ChatbotWidget />
      <AnalyticsTracker />
    </div>
  );
}
