import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './BackLink.css';

// The way back from a screen to the page of its menu (P8-25): every screen
// of the client has its own address, so it needs its own way home — a link,
// not the browser's back button, which an address opened from a bookmark
// does not have.
export default function BackLink({ to, children }) {
  return (
    <Link to={to} className="fin-back">
      <ArrowLeft className="icon-dir" size={16} aria-hidden="true" />
      {children}
    </Link>
  );
}
