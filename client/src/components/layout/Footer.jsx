import { Link } from 'react-router-dom';
import { Mail, MessageCircle, Phone, MapPin, Send, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { footerColumns } from '../../config/navigation.js';
import { contactInfo, socialLinks } from '../../config/contact.js';
import './Footer.css';

// lucide-react ships no brand logos: the icon is picked by type of contact, the
// platform's own name (shown next to it) is what tells them apart.
function socialIcon(platform) {
  const key = platform.toLowerCase();
  if (key.includes('whatsapp')) return MessageCircle;
  if (key.includes('telegram')) return Send;
  return Globe;
}

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  const hasContact = contactInfo.phone || contactInfo.email || contactInfo.address;

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

          {hasContact && (
            <ul className="footer-contact">
              {contactInfo.phone && (
                <li>
                  <Phone size={15} strokeWidth={1.8} aria-hidden="true" />
                  <a href={`tel:${contactInfo.phone.replace(/\s+/g, '')}`}>{contactInfo.phone}</a>
                </li>
              )}
              {contactInfo.email && (
                <li>
                  <Mail size={15} strokeWidth={1.8} aria-hidden="true" />
                  <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
                </li>
              )}
              {contactInfo.address && (
                <li>
                  <MapPin size={15} strokeWidth={1.8} aria-hidden="true" />
                  <span>{contactInfo.address}</span>
                </li>
              )}
            </ul>
          )}

          {socialLinks.length > 0 && (
            <ul className="footer-social" aria-label={t('footer.social')}>
              {socialLinks.map(({ platform, url }) => {
                const Icon = socialIcon(platform);
                return (
                  <li key={platform}>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                      {platform}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
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
