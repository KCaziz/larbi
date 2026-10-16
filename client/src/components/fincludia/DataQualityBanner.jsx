import { useTranslation } from 'react-i18next';
import { Clock, FileQuestion, PenLine } from 'lucide-react';
import './Fincludia.css';

// The client's « bannière de qualité des données » (P1-12, tab
// `14_Etats_Alertes`): data missing, data old, or data only declared.
//
// It is a FACT ABOUT THE FIGURES ON THIS SCREEN, not a scolding and not an
// error: "these figures are 46 days old" is something the reader can act on,
// and hiding it would let an old number pass for a current one. So it is a
// `role="status"`, never an alert, and it never blocks anything.
//
// Three cases, three different statements:
//   missing   nothing has been collected at all — the figures are empty
//             because there is nothing to compute, which is the empty state
//             and not a quality problem. Shown only when asked for, because
//             on most screens the empty state says it better.
//   old       the newest input is older than the threshold the server applied
//             (F055, with its own answer contract, so the day count is the
//             engine's and carries its date of calculation).
//   declared  the figures rest on amounts the person typed rather than on
//             anything imported. The metadata socle (P6-02) records that per
//             row as `source`; a screen that counted them passes the count.
//
// Nothing here is carried by colour alone: each case has its own icon and its
// own sentence.
export default function DataQualityBanner({ quality = null, declaredOnly = null, showMissing = false }) {
  const { t } = useTranslation();

  const stale = quality?.stale === true;
  const days = quality?.age?.resultat ?? null;
  const missing = showMissing && quality?.stale === null;
  const declared = typeof declaredOnly === 'number' ? declaredOnly > 0 : declaredOnly === true;

  if (!stale && !missing && !declared) return null;

  return (
    <div className="fin-quality" role="status">
      {missing && (
        <p className="fin-quality-line">
          <FileQuestion size={15} aria-hidden="true" />
          {t('fincludia.quality.missing')}
        </p>
      )}
      {/* F055 can answer "not computable" even when it has a date, and then
          there is no number of days to show — so the sentence without the
          count is a separate one rather than a "null jours". */}
      {stale && (
        <p className="fin-quality-line">
          <Clock size={15} aria-hidden="true" />
          {days === null
            ? t('fincludia.quality.oldUnknown', { seuil: quality.seuilJours })
            : t('fincludia.quality.old', { days, seuil: quality.seuilJours })}
        </p>
      )}
      {declared && (
        <p className="fin-quality-line">
          <PenLine size={15} aria-hidden="true" />
          {typeof declaredOnly === 'number'
            ? t('fincludia.quality.declaredCount', { count: declaredOnly })
            : t('fincludia.quality.declared')}
        </p>
      )}
    </div>
  );
}
