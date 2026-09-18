import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { footerColumns } from '../../config/navigation.js';
import './Footer.css';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="brand-mark" aria-hidden="true">
              L
            </span>
            {t('common.brand')}
          </Link>
          <p>{t('footer.tagline')}</p>
        </div>

        {footerColumns.map((column) => (
          <nav key={column.titleKey} className="footer-column" aria-label={t(column.titleKey)}>
            <h3>{t(column.titleKey)}</h3>
            <ul>
              {column.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{t(link.labelKey)}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="footer-bottom">
        <p>{t('footer.copyright', { year, brand: t('common.brand') })}</p>
      </div>
    </footer>
  );
}
