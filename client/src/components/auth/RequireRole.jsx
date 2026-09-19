import { Outlet } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/useAuth.js';
import Button from '../ui/Button.jsx';

// Route guard by role (UX only — every /api/admin route re-checks the role on
// the server). Must be nested inside <RequireAuth>.
export default function RequireRole({ role }) {
  const { user } = useAuth();
  const { t } = useTranslation();

  if (user?.role === role) return <Outlet />;

  return (
    <section className="status-hero" role="alert">
      <div className="status-icon" aria-hidden="true">
        <Lock size={26} strokeWidth={1.6} />
      </div>
      <h1>{t('forbidden.title')}</h1>
      <p>{t('errors.forbidden')}</p>
      <Button to="/">{t('notFound.back')}</Button>
    </section>
  );
}
