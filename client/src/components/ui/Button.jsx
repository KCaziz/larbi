import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './Button.css';

// `arrow` appends a direction-aware arrow (flipped in RTL by .icon-dir).
export default function Button({
  children,
  to,
  variant = 'primary',
  arrow = false,
  className = '',
  ...props
}) {
  const classes = `btn btn-${variant} ${className}`.trim();
  const content = (
    <>
      {children}
      {arrow && <ArrowRight className="icon-dir" size={16} strokeWidth={2} aria-hidden="true" />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {content}
    </button>
  );
}
