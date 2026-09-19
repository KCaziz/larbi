import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Title row of a CMS page: optional back link, title, subtitle, actions.
export default function PageToolbar({ title, subtitle, backTo, backLabel, badge, children }) {
  return (
    <header className="cms-toolbar">
      {backTo && (
        <Link to={backTo} className="cms-back">
          <ArrowLeft className="icon-dir" size={16} strokeWidth={1.75} aria-hidden="true" />
          {backLabel}
        </Link>
      )}
      <div className="cms-toolbar-row">
        <div>
          <h1>
            {title}
            {badge}
          </h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {children && <div className="cms-toolbar-actions">{children}</div>}
      </div>
    </header>
  );
}
