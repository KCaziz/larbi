import { CircleAlert, Info, TriangleAlert } from 'lucide-react';
import './Notice.css';

// Reusable callout used for the honest signals we need across several pages:
// "info"  — real content/feature lands in a later task (no fake data shown).
// "action-needed" — the client must supply real info (legal identity, contact
// details, ...) before this can go live; never invented here.
// "error" — something the person did or asked for was refused, and the reason is
// in the message (a rejected form, a request that failed).
const icons = { info: Info, 'action-needed': TriangleAlert, error: CircleAlert };

export default function Notice({ variant = 'info', children }) {
  // An unknown variant falls back to the info icon on purpose: a callout whose
  // whole job is to explain a problem must not be the thing that breaks the
  // page. Before this fallback existed, variant="error" rendered `undefined` as
  // a component and took the entire screen down with it.
  const Icon = icons[variant] ?? Info;
  return (
    <div className={`notice notice-${variant}`}>
      <Icon className="notice-icon" size={20} strokeWidth={1.75} aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
