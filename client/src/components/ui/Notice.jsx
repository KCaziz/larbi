import './Notice.css';

// Reusable callout used for two honest signals we need across several pages:
// "info"  — real content/feature lands in a later task (no fake data shown).
// "action-needed" — the client must supply real info (legal identity, contact
// details, ...) before this can go live; never invented here.
export default function Notice({ variant = 'info', children }) {
  return <div className={`notice notice-${variant}`}>{children}</div>;
}
