import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './cms.css';

// Frame of the administration area: side menu + content. Generic on purpose:
// formations and articles are just different `items` in the menu.
export default function CmsShell({ items }) {
  const { t } = useTranslation();

  return (
    <div className="cms-shell">
      <nav className="cms-menu" aria-label={t('admin.shell.menu')}>
        <p className="cms-menu-title">{t('admin.shell.title')}</p>
        <ul>
          {items.map(({ to, icon: Icon, labelKey, end }) => (
            <li key={to}>
              <NavLink to={to} end={end} className={({ isActive }) => (isActive ? 'active' : undefined)}>
                <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                {t(labelKey)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="cms-content">
        <Outlet />
      </div>
    </div>
  );
}
