import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'lucide-react';
import AppTopBar from '../components/layout/AppTopBar.jsx';
import SideNav, { useSidebarFold } from '../components/layout/SideNav.jsx';
import AdminTour from '../components/cms/AdminTour.jsx';
import { ADMIN_NAV_SECTIONS, adminNavItems } from '../config/adminNav.js';
import './AppLayout.css';

// The administration's window (recette R8-09, R8-10): the top bar of the two
// applications, its switcher on « Administration », and — since the refonte of
// 2026-11-16 — the same dark sidebar as the applications, carrying the back
// office's menu (config/adminNav.js) in its sections (recette R11-09).
export default function AdminShell() {
  const { t } = useTranslation();
  const { toggled, folded, toggle } = useSidebarFold('admin-menu-folded');
  const sections = ADMIN_NAV_SECTIONS.map((key) => ({
    key,
    title: t(`admin.navSections.${key}`),
    entries: adminNavItems
      .filter((item) => (item.section ?? 'overview') === key)
      .map((item) => ({ key: item.to, to: item.to, end: item.end, label: t(item.labelKey), icon: item.icon })),
  })).filter((section) => section.entries.length > 0);

  return (
    <div className="app-shell admin-shell">
      <a href="#admin-main" className="skip-link">
        {t('appNav.skipToContent')}
      </a>
      <div className="app-body">
        <SideNav
          label={t('admin.shell.menu')}
          home="/admin"
          sections={sections}
          toggled={toggled}
          headExtra={<AdminTour />}
          foot={[
            { key: 'site', to: '/', end: true, label: t('appNav.backToSite'), icon: ExternalLink },
          ]}
        />
        <div className="app-column">
          <AppTopBar app="admin" menu={{ folded, onToggle: toggle }} />
          <main id="admin-main" className="admin-main">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
