import { Link } from 'react-router-dom';
import './Button.css';

export default function Button({
  children,
  to,
  variant = 'primary',
  className = '',
  ...props
}) {
  const classes = `btn btn-${variant} ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
