import { useTranslation } from 'react-i18next';
import { formatAmount, formatDate } from '../../lib/format.js';

// P10-05 — what a foreign-currency amount is worth in dinars, at the OFFICIAL
// rate (Banque d'Algérie) of a stated reference date; never the parallel
// market. Without an official rate: « À suivre », never a guess.
export default function CounterValue({ value, className = 'fin-hint' }) {
  const { t, i18n } = useTranslation();
  if (!value) return <p className={className}>{t('currencies.counterValueUnknown')}</p>;
  return (
    <p className={className}>
      {t('currencies.counterValue', {
        amount: formatAmount(i18n.language, value.value, value.currency ?? 'DZD'),
        rate: new Intl.NumberFormat(i18n.language === 'tzm' ? 'fr' : i18n.language, { maximumFractionDigits: 4 }).format(value.rate),
        date: formatDate(i18n.language, value.referenceDate),
      })}
    </p>
  );
}
