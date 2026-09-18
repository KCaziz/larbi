import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { footerLinks } from '../../config/navigation.js';
import './Footer.css';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p>{t('footer.copyright', { year, brand: t('common.brand') })}</p>
        <ul>
          {footerLinks.map((link) => (
            <li key={link.to}>
              <Link to={link.to}>{t(link.labelKey)}</Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
