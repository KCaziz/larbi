import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AccountNav from '../components/layout/AccountNav.jsx';
import Notice from '../components/ui/Notice.jsx';
import '../pages/Pages.css';

// Shared shell for the "logged-in" pages (P1-04). There is no authentication
// yet (P1-06) and no route guard here on purpose: adding one now would mean
// guarding against a session concept that doesn't exist. That guard, and the
// real data these pages show, land with P1-06/P1-07.
export default function AccountLayout() {
  const { t } = useTranslation();

  return (
    <section className="page-section">
      <Notice variant="info">{t('account.layoutNotice')}</Notice>
      <AccountNav />
      <Outlet />
    </section>
  );
}
