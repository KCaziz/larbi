import { useTranslation } from 'react-i18next';
import './Charts.css';

// A gauge (G-08, the emergency fund): the months covered against a target. The
// state is said in colour AND in words, and the figures are written, so the
// shape is never the only way to read it. With no target the gauge says so and
// draws nothing: « no target » is not « 0 % of the target ».
export default function Gauge({ value, target, unitLabel, caption }) {
  const { t } = useTranslation();
  if (value === null || value === undefined) return <p className="fin-hint">{t('fincludia.notComputed')}</p>;
  const hasTarget = target !== null && target !== undefined && target > 0;
  const share = hasTarget ? Math.min(1, value / target) : 0;
  const tone = !hasTarget ? 'none' : share >= 1 ? 'good' : share >= 0.5 ? 'warn' : 'low';

  return (
    <figure className="chart chart-gauge">
      <figcaption className="sr-only">{caption}</figcaption>
      <div
        className="chart-gauge-track"
        role="meter"
        aria-valuemin="0"
        aria-valuemax={hasTarget ? target : value || 1}
        aria-valuenow={value}
        aria-valuetext={`${value} ${unitLabel}${hasTarget ? ` / ${target} ${unitLabel}` : ''}`}
        aria-label={caption}
      >
        <span className={`chart-gauge-fill chart-gauge-${tone}`} style={{ inlineSize: `${share * 100}%` }} />
      </div>
      <p className="chart-gauge-text">
        <strong>
          {value} {unitLabel}
        </strong>
        {hasTarget ? ` / ${target} ${unitLabel}` : ` — ${t('charts.noTarget')}`}
        {hasTarget ? ` · ${t(`charts.state.${tone}`)}` : ''}
      </p>
    </figure>
  );
}
