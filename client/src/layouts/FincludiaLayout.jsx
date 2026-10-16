import { Outlet } from 'react-router-dom';
import FincludiaNav from '../components/layout/FincludiaNav.jsx';
import './FincludiaLayout.css';

// The shell of the connected space (P1-12, client specification § 2-3): the
// navigation beside the page on a computer, above it on a phone.
//
// Before this, every FINCLUDIA screen was a route of its own with no shell, and
// the only menu lived under `/compte`: the fourteen screens of the product were
// reachable by typing their address. One shell for the whole connected space
// means the menu is rendered once, in one place, for every screen that belongs
// to it — including the account's own pages, which nest inside it.
//
// Access is guarded by <RequireAuth> above this layout (UX only) and by the API
// on every request (the rule).
export default function FincludiaLayout() {
  return (
    <div className="fin-shell">
      <FincludiaNav />
      <div className="fin-shell-main">
        <Outlet />
      </div>
    </div>
  );
}
