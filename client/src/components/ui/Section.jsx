import './Section.css';

// A full-width band with a centred, decorated heading. `alt` alternates the
// background so consecutive sections read as distinct blocks instead of one
// continuous document.
export default function Section({ alt = false, title, subtitle, className = '', children }) {
  return (
    <section className={`section ${alt ? 'section-alt' : ''} ${className}`.trim()}>
      <div className="section-inner">
        {title && (
          <div className="section-head">
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
