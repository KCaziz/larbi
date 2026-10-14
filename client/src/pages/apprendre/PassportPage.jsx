import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BookOpen, Printer } from 'lucide-react';
import { formatDate } from '../../lib/format.js';
import { useApi } from '../../lib/useApi.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import '../../components/fincludia/Fincludia.css';
import './Passport.css';

// Passeport de connaissances financières (P2-09), écrans LY11/LY12/ET09. Ce
// n'est jamais un score bancaire, jamais une mesure de solvabilité — la
// mention du client, répétée à l'écran. L'indice global (F052) reste bloqué
// tant que ses poids ne sont pas fournis (P6-01) : chaque dimension est
// montrée seule, comme pour P6-06 et P6-16.
export default function PassportPage() {
  const { t, i18n } = useTranslation();
  useDocumentMeta(t('passport.title'), t('passport.intro'));
  const { status, data, reload } = useApi('/fin/passeport');

  if (status === 'loading') return <LoadingState />;
  if (status === 'error') return <ErrorState message={t('state.loadError')} onRetry={reload} />;

  const p = data;
  const title = t(`passport.titles.${p.titre}`);

  const percent = (ratio) => (ratio === null ? t('fincludia.notComputed') : `${Math.round(ratio * 100)} %`);
  const securityLabel = (value) => {
    if (value && typeof value === 'object') return t('passport.securityModule.unavailable');
    if (value === null) return t('passport.securityModule.notStarted');
    return value === 1 ? t('passport.securityModule.completed') : t('passport.securityModule.inProgress');
  };

  return (
    <div className="passport-wrap">
      <div className="passport-actions">
        <PageHeader icon={BookOpen} title={title} subtitle={t('passport.intro')} />
        <Button onClick={() => window.print()}>
          <Printer size={16} strokeWidth={1.9} aria-hidden="true" />
          {t('passport.print')}
        </Button>
      </div>

      <Notice variant="info">{t('passport.disclaimer')}</Notice>

      <article className="passport-sheet">
        <h2>{t('passport.dimensionsTitle')}</h2>
        <div className="fin-figure-grid">
          <article className="fin-figure">
            <h3 className="fin-figure-label">{t('passport.dimensions.formationsCompletion')}</h3>
            <p className={p.dimensions.formationsCompletion === null ? 'fin-figure-value fin-figure-unknown' : 'fin-figure-value'}>
              {percent(p.dimensions.formationsCompletion)}
            </p>
          </article>
          <article className="fin-figure">
            <h3 className="fin-figure-label">{t('passport.dimensions.quizzesAverage')}</h3>
            <p className={p.dimensions.quizzesAverage === null ? 'fin-figure-value fin-figure-unknown' : 'fin-figure-value'}>
              {percent(p.dimensions.quizzesAverage)}
            </p>
          </article>
          <article className="fin-figure">
            <h3 className="fin-figure-label">{t('passport.dimensions.securityModule')}</h3>
            <p className="fin-figure-value">{securityLabel(p.dimensions.securityModule)}</p>
            {p.dimensions.securityModule && typeof p.dimensions.securityModule === 'object' && (
              <p className="fin-hint">{t('passport.securityModule.unavailableHint')}</p>
            )}
          </article>
        </div>
        <p className="passport-global-note">{t('passport.globalBlockedNote')}</p>

        <h2>{t('passport.completedTitle')}</h2>
        {p.formationsTerminees.length === 0 ? (
          <p className="comparator-disclaimer">{t('passport.noCompleted')}</p>
        ) : (
          <ul className="passport-list">
            {p.formationsTerminees.map((row, index) => (
              <li key={`${row.formation.slug}-${index}`}>
                <span>{row.formation.title}</span>
                <span className="passport-date">{formatDate(i18n.language, row.completedAt)}</span>
                {row.certified && (
                  <Link to="/compte/certificats" className="passport-cert-link">
                    {t('passport.seeCertificate')}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}

        <h2>{t('passport.nextStepsTitle')}</h2>
        {p.etapesSuivantes.length === 0 ? (
          <p className="comparator-disclaimer">
            {t('passport.noNextSteps')} <Link to="/catalogue">{t('passport.browseCatalogue')}</Link>
          </p>
        ) : (
          <ul className="passport-list passport-next-steps">
            {p.etapesSuivantes.map((entry) => (
              <li key={entry.formation.slug}>
                <span>{entry.formation.title}</span>
                <ul>
                  {entry.remaining.map((courseTitle) => (
                    <li key={courseTitle}>{courseTitle}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}

        <h2>{t('passport.quizzesTitle')}</h2>
        {p.quizReussis.length === 0 ? (
          <p className="comparator-disclaimer">{t('passport.noQuizzes')}</p>
        ) : (
          <ul className="passport-list">
            {p.quizReussis.map((quiz, index) => (
              <li key={`${quiz.quizTitle}-${index}`}>
                <span>
                  {quiz.quizTitle} <span className="passport-formation-title">({quiz.formationTitle})</span>
                </span>
                <span className="passport-date">
                  {quiz.score} % — {formatDate(i18n.language, quiz.passedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </article>
    </div>
  );
}
