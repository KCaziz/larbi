import './PageHeader.css';

// Coloured banner at the top of every inner page — gives each page a strong
// identity block that is clearly separated from the content below it.
export default function PageHeader({ icon, title, subtitle }) {
  return (
    <header className="page-header">
      <div className="page-header-inner">
        {icon && (
          <span className="page-header-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </header>
  );
}
