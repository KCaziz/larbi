import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AppTopBar from '../components/layout/AppTopBar.jsx';
import './AppLayout.css';

// The administration's window (recette R8-09, R8-10): the top bar of the two
// applications, its switcher on « Administration », and the back office
// (its own menu, CmsShell) under it. It used to live inside the showcase
// site, whose bar had no room for an administrator's extra button.
export default function AdminShell() {
  const { t } = useTranslation();
  return (
    <div className="app-shell admin-shell">
      <a href="#admin-main" className="skip-link">
        {t('appNav.skipToContent')}
      </a>
      <AppTopBar app="admin" />
      <main id="admin-main" className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
