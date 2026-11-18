import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';

// Recette R18 (2026-11-18): « Abonnez-vous depuis « Offres » », said when a
// free account tries what needs a subscription (a second account, an
// invitation), must be a LINK to the offers, not a sentence to decode.
// Shows `text` and, when it is one of those refusals, the link after it.
export default function MessageWithOffers({ text }) {
  const { t } = useTranslation();
  const needsOffers = text === t('errors.subscriptionAccounts') || text === t('errors.subscriptionRequired') || text === t('errors.oneScreen');
  if (!needsOffers) return text;
  return (
    <>
      {text}{' '}
      <Link to="/app/parametres/premium" className="offers-link">
        {t('errors.seeOffers')} <ArrowRight size={14} aria-hidden="true" className="icon-dir" />
      </Link>
    </>
  );
}
