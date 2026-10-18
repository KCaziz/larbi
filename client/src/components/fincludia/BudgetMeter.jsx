import { useTranslation } from 'react-i18next';
import { formatAmount, formatRatio } from '../../lib/format.js';

// A planned-vs-real meter for one budget envelope (P6-23, first piece of the
// dashboard visualisations the client asked for). The fill's COLOUR follows
// the envelope's own alert level (none / warning / reached / exceeded), but
// the percentage is always written out next to it in text — colour alone
// never carries the meaning here, per the accessibility rule of `P1-12`
// ("jamais la couleur seule pour porter un sens").
export default function BudgetMeter({ prevu, reel, currency, alertLevel = 'none' }) {
  const { t, i18n } = useTranslation();

  // A prévu of 0 (or none) has no ratio to show: a bar at 0 % would read as
  // "nothing spent" rather than "nothing planned to compare against".
  if (!prevu || prevu <= 0) return null;

  const ratio = reel / prevu;
  const fillPercent = Math.min(Math.max(ratio, 0), 1) * 100;

  const label = t('budget.meterLabel', {
    real: formatAmount(i18n.language, reel, currency),
    planned: formatAmount(i18n.language, prevu, currency),
    percent: formatRatio(i18n.language, ratio),
  });

  return (
    <div className="budget-meter" role="img" aria-label={label}>
      <div className="budget-meter-track">
        <div className={`budget-meter-fill budget-meter-fill-${alertLevel}`} style={{ '--fill': `${fillPercent}%` }} />
      </div>
      <span className="budget-meter-percent" aria-hidden="true">
        {formatRatio(i18n.language, ratio)}
      </span>
    </div>
  );
}
