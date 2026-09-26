import { Mail, MapPin, Phone, Wrench } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Pages.css';

// Shown instead of the page content, on every route but /connexion, to anyone
// who is not a logged-in administrator while maintenance mode is on (P3-16
// follow-up). The API enforces the same rule independently: this is only the
// visible half of it, not the protection itself.
export default function MaintenancePage({ contact }) {
  const { t } = useTranslation();
  const hasContact = contact && (contact.contactPhone || contact.contactEmail || contact.contactAddress);

  return (
    <section className="status-hero">
      <div className="status-icon" aria-hidden="true">
        <Wrench size={26} strokeWidth={1.6} />
      </div>
      <h1>{t('maintenance.title')}</h1>
      <p>{t('maintenance.body')}</p>
      {hasContact && (
        <ul className="contact-direct">
          {contact.contactPhone && (
            <li>
              <Phone size={16} strokeWidth={1.8} aria-hidden="true" />
              <a href={`tel:${contact.contactPhone.replace(/\s+/g, '')}`}>{contact.contactPhone}</a>
            </li>
          )}
          {contact.contactEmail && (
            <li>
              <Mail size={16} strokeWidth={1.8} aria-hidden="true" />
              <a href={`mailto:${contact.contactEmail}`}>{contact.contactEmail}</a>
            </li>
          )}
          {contact.contactAddress && (
            <li>
              <MapPin size={16} strokeWidth={1.8} aria-hidden="true" />
              <span>{contact.contactAddress}</span>
            </li>
          )}
        </ul>
      )}
    </section>
  );
}
