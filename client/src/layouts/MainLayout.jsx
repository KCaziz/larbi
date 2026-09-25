import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TriangleAlert } from 'lucide-react';
import Header from '../components/layout/Header.jsx';
import Footer from '../components/layout/Footer.jsx';
import { usePublicSettings } from '../lib/publicSettings.js';

export default function MainLayout() {
  const { t } = useTranslation();
  const settings = usePublicSettings();

  return (
    <>
      {settings.status === 'ready' && settings.data.maintenanceMode && (
        <div className="maintenance-banner" role="status">
          <TriangleAlert size={16} strokeWidth={2} aria-hidden="true" />
          {t('maintenance.banner')}
        </div>
      )}
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
