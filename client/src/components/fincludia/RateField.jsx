import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../lib/format.js';
import { RATE_PERIODS, convertRate } from '../../lib/ratePeriods.js';

// A period beside a rate (recette R11-14): per month, quarter, half-year or
// year. Used alone (RatePeriodSelect) where a form already draws its own input.
export function RatePeriodSelect({ id, value, onChange, label }) {
  const { t } = useTranslation();
  return (
    <select id={id} className="rate-period" value={value} aria-label={label ?? t('rate.periodLabel')} onChange={(event) => onChange(event.target.value)}>
      {RATE_PERIODS.map((period) => (
        <option key={period} value={period}>
          {t(`rate.periods.${period}`)}
        </option>
      ))}
    </select>
  );
}

// What a rate written per month (etc.) is per year — said, never hidden.
export function RateEquivalent({ value, period, target = 'annuel' }) {
  const { t, i18n } = useTranslation();
  if (period === target || value === '' || value === null || value === undefined) return null;
  const converted = convertRate(Number(String(value).replace(',', '.')), period, target);
  if (converted === null) return null;
  return <span className="fin-hint rate-equivalent">{t(`rate.equivalent.${target}`, { value: formatNumber(i18n.language, Math.round(converted * 10000) / 10000, { digits: 3 }) })}</span>;
}

// A whole rate field: the percentage, its period, and its yearly equivalent.
export default function RateField({ id, label, value, period, onChange, onPeriodChange, hint, required = false }) {
  return (
    <div className="fin-field">
      <label htmlFor={id}>{label}</label>
      <div className="rate-field">
        <input id={id} type="number" step="0.001" min="0" max="100" inputMode="decimal" value={value} required={required} onChange={(event) => onChange(event.target.value)} />
        <span className="rate-field-unit">%</span>
        <RatePeriodSelect id={`${id}-period`} value={period} onChange={onPeriodChange} />
      </div>
      <RateEquivalent value={value} period={period} />
      {hint && <p className="fin-hint">{hint}</p>}
    </div>
  );
}
