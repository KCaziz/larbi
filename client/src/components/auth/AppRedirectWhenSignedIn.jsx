import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth.js';
import { stripLanguage } from '../../i18n/localePath.js';

// The tools and the learning pages are public: a visitor reads them in the
// showcase site. A signed-in person is sent to the same page INSIDE the
// application (P8-02), so following a link never takes them out of it.
export default function AppRedirectWhenSignedIn() {
  const { status } = useAuth();
  const { pathname, search, hash } = useLocation();
  // The application has no language in its address (/ar/outils → /app/outils).
  if (status === 'authenticated') return <Navigate to={`/app${stripLanguage(pathname)}${search}${hash}`} replace />;
  return <Outlet />;
}
