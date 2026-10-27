import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import '../../components/fincludia/Fincludia.css';

// « Santé financière » (P8-16, HEA-01): the index (F053) over the seven
// dimensions of the consolidated specification, each sub-score with a short
// « Pourquoi ? » and, when it is not measured yet, « Compléter » towards the
// screen that would measure it. A dimension nobody measured is left out —
// the index is then said partial — never scored 0. The weights stay out of the
// screen (decision P8-01 point 7). Never a credit score.
const COMPLETE = {
  balance: '/app/mouvements',
  reserve: '/app/objectifs/fonds-urgence',
  debt: '/app/dettes',
  savings: '/app/objectifs',
  goals: '/app/objectifs',
  budgets: '/app/budgets',
  dataQuality: '/app/mouvements',
};

export default function HealthPage() {
  const { t } = useTranslation();
  useDocumentMeta(t('health.title'), t('health.intro'));
  const today = useApi('/fin/aujourdhui');

  if (today.status === 'loading' && !today.data) return <LoadingState />;
  if (today.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={today.reload} />;

  const health = today.data.aujourdhui?.santeFinanciere ?? null;

  return (
    <>
      <PageHeader icon={HeartPulse} title={t('health.title')} subtitle={t('health.intro')} maxWidth={760} />
      <div className="fin-page-narrow">
        {!health?.answer ? (
          // A young account: the index is not shown to minors (P6-22).
          <Notice variant="info">{t('health.notForYouth')}</Notice>
        ) : (
          <>
            <FigureCard label={t('health.score')} answer={health.answer} />
            {health.partiel && <p className="fin-hint">{t('health.partial')}</p>}
            <p className="fin-hint">{t('health.notCredit')}</p>
            <ul className="fin-health-dimensions">
              {health.dimensions.map((dimension) => (
                <li key={dimension.key}>
                  <span>
                    <strong>{dimension.label}</strong>
                    <span className="fin-hint"> — {t(`health.why.${dimension.key}`)}</span>
                  </span>
                  {dimension.score === null ? (
                    <Link to={COMPLETE[dimension.key] ?? '/app'}>{t('health.complete')}</Link>
                  ) : (
                    <strong>{`${dimension.score} / 100`}</strong>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
