import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/useAuth.js';
import ErrorState from '../ui/ErrorState.jsx';
import LoadingState from '../ui/LoadingState.jsx';

// Route guard (UX only — the API enforces the real access control).
export default function RequireAuth() {
  const { status, retry } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  if (status === 'loading') return <LoadingState />;
  if (status === 'error') return <ErrorState message={t('state.sessionError')} onRetry={retry} />;
  if (status === 'anonymous') {
    return <Navigate to="/connexion" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
