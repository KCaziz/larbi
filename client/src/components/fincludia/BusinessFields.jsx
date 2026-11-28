import { useTranslation } from 'react-i18next';
import { useApi } from '../../lib/useApi.js';
import { WILAYAS } from '../../lib/wilayas.js';

// R20 (2026-11-28): the fields that must not accept anything.
//
// - A currency is chosen among the currencies of the application (the same
//   list as the accounts, served by /fin/devises), never typed.
// - The source of a rate is chosen in a short list; a value already stored
//   (an older free text, the official source proposed by the server) stays
//   shown and selected.
// - A phone number, a NIF, a NIS and a trade register number keep only the
//   characters they may contain while typing, and carry a pattern checked
//   again by the server.

export const FALLBACK_CURRENCIES = ['DZD', 'EUR', 'USD', 'GBP', 'CAD'];

/** The currencies of the application, as the server serves them. */
export function useCurrencies(offline = false) {
  const answer = useApi(offline ? null : '/fin/devises');
  return answer.data?.devises ?? FALLBACK_CURRENCIES;
}

/** A currency, chosen in the list. `exclude` removes one (the base currency of a conversion). */
export function CurrencySelect({ id, value, onChange, exclude, required = true, offline = false, ...rest }) {
  const { t } = useTranslation();
  // `offline`: a public page, without an account — the list of the application, without asking the server.
  const list = useCurrencies(offline).filter((code) => code !== exclude);
  const current = String(value ?? '').toUpperCase();
  const options = current && !list.includes(current) ? [current, ...list] : list;
  return (
    <select id={id} value={current} onChange={(event) => onChange(event.target.value)} required={required} {...rest}>
      {!current && <option value="">{t('fields.chooseCurrency')}</option>}
      {options.map((code) => (
        <option key={code} value={code}>
          {t(`currencies.${code}`, code)}
        </option>
      ))}
    </select>
  );
}

export const RATE_SOURCES = ['official', 'bank', 'exchangeOffice', 'contract', 'other'];

/** Where a rate comes from: a short list, stored as the words shown. */
export function RateSourceSelect({ id, value, onChange, required = false }) {
  const { t } = useTranslation();
  const labels = RATE_SOURCES.map((key) => t(`fields.rateSources.${key}`));
  const current = value ?? '';
  const options = current && !labels.includes(current) ? [current, ...labels] : labels;
  return (
    <select id={id} value={current} onChange={(event) => onChange(event.target.value)} required={required}>
      <option value="">{t('fields.chooseSource')}</option>
      {options.map((label) => (
        <option key={label} value={label}>
          {label}
        </option>
      ))}
    </select>
  );
}

// ---- identifiers and phone ----------------------------------------------------

// The same rules as server/src/validation/fieldRules.js.
export const FIELD_RULES = {
  phone: { pattern: '\\+?[0-9][0-9 .()\\-]{5,23}', keep: /[^0-9 +.()-]/g, inputMode: 'tel', type: 'tel', maxLength: 24 },
  nif: { pattern: '[0-9]{15}|[0-9]{20}', keep: /\D/g, inputMode: 'numeric', maxLength: 20 },
  nis: { pattern: '[0-9]{15}', keep: /\D/g, inputMode: 'numeric', maxLength: 15 },
  rc: { pattern: '[0-9A-Za-z][0-9A-Za-z /\\-]{4,29}', keep: /[^0-9A-Za-z /-]/g, inputMode: 'text', maxLength: 30 },
};

/** Keeps only what the field may contain. */
export const cleanField = (kind, text) => String(text ?? '').replace(FIELD_RULES[kind].keep, '');

/**
 * A phone number, a NIF, a NIS or a trade register number. Letters cannot be
 * typed in a number; the browser refuses the form while the pattern is not
 * met, with the rule in words.
 */
export function RuledInput({ kind, value, onChange, ...rest }) {
  const { t } = useTranslation();
  const rule = FIELD_RULES[kind];
  return (
    <input
      type={rule.type ?? 'text'}
      inputMode={rule.inputMode}
      maxLength={rule.maxLength}
      pattern={rule.pattern}
      title={t(`fields.rules.${kind}`)}
      value={value ?? ''}
      onChange={(event) => onChange(cleanField(kind, event.target.value))}
      {...rest}
    />
  );
}

/** A wilaya, chosen in the list of the 58; a value stored before stays shown. */
export function WilayaSelect({ id, value, onChange, required = false }) {
  const { t } = useTranslation();
  const current = value ?? '';
  const options = current && !WILAYAS.includes(current) ? [current, ...WILAYAS] : WILAYAS;
  return (
    <select id={id} value={current} onChange={(event) => onChange(event.target.value)} required={required}>
      <option value="">{t('fields.chooseWilaya')}</option>
      {options.map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  );
}
