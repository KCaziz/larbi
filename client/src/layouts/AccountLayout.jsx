import { Outlet } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AccountNav from '../components/layout/AccountNav.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/ui/Section.jsx';
import '../pages/Pages.css';

// Shared shell for the logged-in pages. Access is guarded by <RequireAuth> in the
// router (UX only); the API enforces the real checks.
export default function AccountLayout() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader icon={UserRound} title={t('account.title')} subtitle={t('account.subtitle')} />
      <Section>
        <AccountNav />
        <Outlet />
      </Section>
    </>
  );
}
