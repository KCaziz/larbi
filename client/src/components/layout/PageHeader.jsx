import './PageHeader.css';

// Banner at the top of every inner page. `icon` is a lucide-react component.
export default function PageHeader({ icon: Icon, title, subtitle }) {
  return (
    <header className="page-header">
      <div className="page-header-inner">
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
