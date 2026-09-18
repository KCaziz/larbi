import { Outlet } from 'react-router-dom';
import AccountNav from '../components/layout/AccountNav.jsx';
import Notice from '../components/ui/Notice.jsx';
import '../pages/Pages.css';

// Shared shell for the "logged-in" pages (P1-04). There is no authentication
// yet (P1-06) and no route guard here on purpose: adding one now would mean
// guarding against a session concept that doesn't exist. That guard, and the
// real data these pages show, land with P1-06/P1-07.
export default function AccountLayout() {
  return (
    <section className="page-section">
      <Notice variant="info">
        Espace compte — aperçu structurel. Les données réelles et la protection
        d'accès arrivent avec l'authentification (P1-06) et son intégration (P1-07).
      </Notice>
      <AccountNav />
      <Outlet />
    </section>
  );
}
