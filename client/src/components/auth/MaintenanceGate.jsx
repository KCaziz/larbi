import { Outlet } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth.js';
import MaintenancePage from '../../pages/MaintenancePage.jsx';
import { usePublicSettings } from '../../lib/publicSettings.js';

// Wraps every route except /connexion (an administrator still needs a way in):
// while maintenance mode is on, only a logged-in administrator sees the page
// they asked for, everyone else gets the maintenance notice instead. Placed as
// a route wrapper (not a check inside MainLayout) so it never subscribes to
// the router's location: doing that in an ancestor of every route made the
// real page content lag a render behind the address bar on every navigation.
// The API enforces the same rule on its own (P3-16 follow-up): this is only
// the visible half of it, never the actual protection.
export default function MaintenanceGate() {
  const settings = usePublicSettings();
  const { status, user } = useAuth();
  const maintenance = settings.status === 'ready' && settings.data.maintenanceMode;
  const isAdmin = status === 'authenticated' && user.role === 'admin';

  if (maintenance && !isAdmin) return <MaintenancePage contact={settings.data} />;
  return <Outlet />;
}
