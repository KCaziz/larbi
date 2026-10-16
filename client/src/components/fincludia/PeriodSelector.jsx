import { useTranslation } from 'react-i18next';
import { PERIODS } from '../../lib/finControls.js';
import './Fincludia.css';

// The period selector of the connected space (P1-12): week, month, 90 days,
// year. The client's four windows, in the client's order, and nothing else —
// an arbitrary date range is a different control and a different question.
//
// A radio group, not a row of buttons: the four options are mutually exclusive
// and one of them is always chosen, which is what a radio group means. The
// consequence is free keyboard behaviour (arrow keys move between options) and
// a state a screen reader announces as "mois, 2 sur 4" rather than as four
// unrelated buttons.
export default function PeriodSelector({ value, onChange, name = 'fin-period', label = null }) {
  const { t } = useTranslation();

  return (
    <fieldset className="fin-period">
      <legend>{label ?? t('fincludia.period.legend')}</legend>
      <div className="fin-period-options">
        {PERIODS.map((period) => (
          <label key={period} className={value === period ? 'fin-period-option checked' : 'fin-period-option'}>
            <input
              type="radio"
              name={name}
              value={period}
              checked={value === period}
              onChange={() => onChange(period)}
            />
            <span>{t(`fincludia.period.${period}`)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
