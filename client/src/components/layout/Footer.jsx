import { Link } from 'react-router-dom';
import { footerLinks } from '../../config/navigation.js';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p>© {year} Larbi. Tous droits réservés.</p>
        <ul>
          {footerLinks.map((link) => (
            <li key={link.to}>
              <Link to={link.to}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
