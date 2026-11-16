import { Outlet } from 'react-router-dom';
import './cms.css';

// Frame of the administration area's content. Its menu (recette R11-09:
// sections, folding) is the dark sidebar of the administration window since
// the refonte of 2026-11-16 (layouts/AdminShell.jsx, config/adminNav.js), as
// is the « ? » that reopens the guided tour.
export default function CmsShell() {
  return (
    <div className="cms-shell cms-shell-bare">
      <div className="cms-content">
        <Outlet />
      </div>
    </div>
  );
}
