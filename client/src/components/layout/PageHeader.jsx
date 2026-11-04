import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { backFor } from '../../config/appNavigation.js';
import BackLink from '../fincludia/BackLink.jsx';
import './PageHeader.css';

// Banner at the top of every inner page. `icon` is a lucide-react component.
//
// `maxWidth` lines its text up with the page's own content column below it —
// pages do not all share one width (FINCLUDIA's tool pages sit at 1040px,
// others at 760/920/1100...), and a banner stuck at one fixed width regardless
// looks like it belongs to a different, narrower or wider page than the one
// under it. Omit it only on a page whose content really is 1200px wide.
// Inside the application, one width holds for every page (AppLayout.css).
//
// `back` ({ to, label }) is the way back (recette R3-04), always at the same
// place: the top of the banner. Inside the application a page that does not
// give one goes back to the page above it (`backFor`); `back={false}` says
// there is none.
export default function PageHeader({ icon: Icon, title, subtitle, maxWidth, back, children }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const auto = back === undefined ? backFor(pathname) : null;
  const link = back || (auto && { to: auto.to, label: t('appNav.backTo', { page: t(auto.labelKey) }) });

  return (
    <header className="page-header">
      <div className="page-header-inner" style={maxWidth ? { '--ph-max-width': `${maxWidth}px` } : undefined}>
        {link && <BackLink to={link.to}>{link.label}</BackLink>}
        <div className="page-header-title">
          {Icon && (
            <span className="page-header-icon" aria-hidden="true">
              <Icon size={22} strokeWidth={1.6} />
            </span>
          )}
          <h1>{title}</h1>
        </div>
        {subtitle && <p>{subtitle}</p>}
        {children}
      </div>
    </header>
  );
}
