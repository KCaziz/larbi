import './PageHeader.css';

// Banner at the top of every inner page. `icon` is a lucide-react component.
//
// `maxWidth` lines its text up with the page's own content column below it —
// pages do not all share one width (FINCLUDIA's tool pages sit at 1040px,
// others at 760/920/1100...), and a banner stuck at one fixed width regardless
// looks like it belongs to a different, narrower or wider page than the one
// under it. Omit it only on a page whose content really is 1200px wide.
export default function PageHeader({ icon: Icon, title, subtitle, maxWidth }) {
  return (
    <header className="page-header">
      <div className="page-header-inner" style={maxWidth ? { '--ph-max-width': `${maxWidth}px` } : undefined}>
        {Icon && (
          <span className="page-header-icon" aria-hidden="true">
            <Icon size={22} strokeWidth={1.6} />
          </span>
        )}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </header>
  );
}
