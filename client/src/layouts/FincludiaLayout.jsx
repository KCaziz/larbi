import { Outlet } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import FincludiaNav from '../components/layout/FincludiaNav.jsx';
import './FincludiaLayout.css';

// The shell of the connected space (P1-12, client specification § 2-3): a
// classic sidebar beside the page, which owns its own expanded/collapsed
// state entirely — this layout only places it next to the content and never
// has to know which of the two it currently is. That is what keeps the
// content column from ever jumping to a different size or position: it is
// always `flex: 1` next to whatever width the sidebar currently claims,
// never a replacement for it.
//
// This layout also wraps pages that stay public (the glossary, the bank
// comparator...): a signed-in account must never lose the menu by following
// a link that happens to also be open to a visitor. A visitor sees the page
// alone, with nothing of the shell added around it.
//
// Access is guarded by <RequireAuth> above the account-only routes (UX only)
// and by the API on every request (the rule).
export default function FincludiaLayout() {
  const { status } = useAuth();

  if (status !== 'authenticated') return <Outlet />;

  return (
    <div className="fin-shell">
      <FincludiaNav />
      <div className="fin-shell-main">
        <Outlet />
      </div>
    </div>
  );
}
