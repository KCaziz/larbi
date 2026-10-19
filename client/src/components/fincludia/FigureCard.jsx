import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';
import { formatAmount, formatRatio } from '../../lib/format.js';
import './Fincludia.css';

// One computed figure (P6-03, P6-04, and the KPI card of P1-12). It takes an
// ENGINE ANSWER, never a bare number, so it always carries which formula
// produced it (`formule_id`) — used here only to look up a short, plain-
// language sentence of why the figure exists, never to show the formula
// itself. The technical detail (variables, hypotheses, exact date) that used
// to sit here is gone by design: see TASKS.md, 2026-10-19, for why that is a
// deliberate departure from the client's own "expose the formula" rule.
//
// "Non calculé" is a first-class state, visibly different from zero: zero is
// an answer ("you saved nothing"), null is the absence of one ("we don't know
// yet"), and showing one for the other is lying.
export default function FigureCard({ label, answer, simulation = false, children }) {
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

  const why = t(`fincludia.whyByFormula.${answer.formule_id}`, { defaultValue: t('fincludia.whyGeneric') });

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
        <summary aria-label={t('fincludia.why')} title={t('fincludia.why')}>
          <Info size={13} aria-hidden="true" />
        </summary>
        <p className="fin-why-text">{why}</p>
        {answer.avertissements?.length > 0 && (
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
