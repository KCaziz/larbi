import { Info, TriangleAlert } from 'lucide-react';
import './Notice.css';

// Reusable callout used for two honest signals we need across several pages:
// "info"  — real content/feature lands in a later task (no fake data shown).
// "action-needed" — the client must supply real info (legal identity, contact
// details, ...) before this can go live; never invented here.
const icons = { info: Info, 'action-needed': TriangleAlert };

export default function Notice({ variant = 'info', children }) {
  const Icon = icons[variant];
  return (
    <div className={`notice notice-${variant}`}>
      <Icon className="notice-icon" size={20} strokeWidth={1.75} aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
