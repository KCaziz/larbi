import { useTranslation } from 'react-i18next';
import './Fincludia.css';

// An amount field (P1-12's "champ montant", used by P6-03 and P6-04). The
// conversion to and from the integer minor units the API speaks lives in
// lib/money.js, which already does it per currency and on the digits as text —
// so no page multiplies by 100 and loses a centime of its own.
//
// The currency is always shown next to the amount and is never optional: an
// amount without its currency is meaningless, and would be read next to
// whatever symbol the screen happened to show.

export default function AmountField({ id, label, value, currency, onChange, required = false, hint = null, disabled = false }) {
  const { t } = useTranslation();
  return (
    <div className="fin-field">
      <label htmlFor={id}>
        {label}
        {!required && <span className="fin-optional"> {t('fincludia.optional')}</span>}
      </label>
      <div className="fin-amount">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          disabled={disabled}
        />
        <span className="fin-amount-currency">{currency}</span>
      </div>
      {hint && <p className="fin-hint">{hint}</p>}
    </div>
  );
}
