import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth.js';

// The tools and the learning pages are public: a visitor reads them in the
// showcase site. A signed-in person is sent to the same page INSIDE the
// application (P8-02), so following a link never takes them out of it.
export default function AppRedirectWhenSignedIn() {
  const { status } = useAuth();
  const { pathname, search, hash } = useLocation();
  if (status === 'authenticated') return <Navigate to={`/app${pathname}${search}${hash}`} replace />;
  return <Outlet />;
}
