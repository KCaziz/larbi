import './Notice.css';

// Reusable callout used for two honest signals we need across several pages:
// "info"  — real content/feature lands in a later task (no fake data shown).
// "action-needed" — the client must supply real info (legal identity, contact
// details, ...) before this can go live; never invented here.
const icons = { info: 'ℹ️', 'action-needed': '⚠️' };

export default function Notice({ variant = 'info', children }) {
  return (
    <div className={`notice notice-${variant}`}>
      <span className="notice-icon" aria-hidden="true">
        {icons[variant]}
      </span>
      <div>{children}</div>
    </div>
  );
}
