import { useTranslation } from 'react-i18next';
import { formatAmount, formatDate, formatRatio } from '../../lib/format.js';
import './Fincludia.css';

// One computed figure, with everything needed to explain it (P6-03, P6-04, and
// the KPI card of P1-12). The client requires every computed value on screen to
// expose its formula, its variables, its hypotheses and its date of calculation
// — so this component takes an ENGINE ANSWER, never a bare number, and refuses
// to render anything it cannot explain.
//
// "Non calculé" is a first-class state, visibly different from zero: zero is an
// answer ("you saved nothing"), null is the absence of one ("we don't know
// yet"), and showing one for the other is lying.
export default function FigureCard({ label, answer, formula = null, simulation = false, children }) {
  const { t, i18n } = useTranslation();
  if (!answer) return null;

  const unknown = answer.resultat === null || answer.resultat === undefined;
  const value = () => {
    if (unknown) return t('fincludia.notComputed');
    // The engine keeps rates as decimals and the interface shows percentages;
    // a money result carries the currency it was computed in.
    if (answer.unite === 'ratio') return formatRatio(i18n.language, answer.resultat);
    if (answer.unite === 'mois') return t('fincludia.months', { count: answer.resultat });
    if (answer.unite === 'points' || answer.unite === 'nombre') return String(answer.resultat);
    return formatAmount(i18n.language, answer.resultat, answer.unite);
  };

  return (
    <article className={simulation ? 'fin-figure fin-figure-simulation' : 'fin-figure'}>
      <h3 className="fin-figure-label">
        {label}
        {/* A fictional figure says so permanently, not on hover: the client's
            rule is a badge that never leaves the screen. */}
        {simulation && <span className="fin-badge-simulation">{t('fincludia.simulationBadge')}</span>}
      </h3>
      <p className={unknown ? 'fin-figure-value fin-figure-unknown' : 'fin-figure-value'}>{value()}</p>
      {children}

      <details className="fin-why">
        <summary>{t('fincludia.why')}</summary>
        <dl>
          {formula && (
            <>
              <dt>{t('fincludia.whyFormula')}</dt>
              <dd>
                {formula.label} — <code>{formula.rule}</code>
              </dd>
            </>
          )}
          <dt>{t('fincludia.whyReference')}</dt>
          <dd>
            {answer.formule_id} · {t('fincludia.whyVersion', { version: answer.formule_version })}
          </dd>
          {/* The workbook gives an algorithm no "condition" column, so there is
              nothing to show rather than an invented sentence. */}
          {formula?.condition && (
            <>
              <dt>{t('fincludia.whyCondition')}</dt>
              <dd>{formula.condition}</dd>
            </>
          )}
          <dt>{t('fincludia.whyInputs')}</dt>
          <dd>
            {Object.entries(answer.entrees_snapshot ?? {})
              .map(([name, input]) => `${name} = ${input !== null && typeof input === 'object' ? JSON.stringify(input) : input}`)
              .join(' · ') || '—'}
          </dd>
          <dt>{t('fincludia.whyComputedAt')}</dt>
          <dd>{formatDate(i18n.language, answer.calcule_le)}</dd>
        </dl>
        {answer.avertissements && (
          <ul className="fin-warnings">
            {answer.avertissements.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        )}
      </details>
    </article>
  );
}
