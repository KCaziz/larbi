import { Outlet } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/ui/Section.jsx';
import '../pages/Pages.css';

// The account's own pages. Access is guarded by <RequireAuth> in the router
// (UX only); the API enforces the real checks.
//
// The navigation used to live here, which is why it only existed under
// `/compte`. It now belongs to <FincludiaLayout>, the shell of the whole
// connected space (P1-12), and this layout keeps only the account's heading.
export default function AccountLayout() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader icon={UserRound} title={t('account.title')} subtitle={t('account.subtitle')} />
      <Section>
        <Outlet />
      </Section>
    </>
  );
}
