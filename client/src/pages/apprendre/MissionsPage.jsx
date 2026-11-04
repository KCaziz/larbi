import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Award, CheckCircle2, Circle, Target } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import '../../components/fincludia/Fincludia.css';
import './Missions.css';

// The missions of the person's profile (P8-17): short series of choices on a
// FICTIVE sum. The list shows what was played and the best badge earned, and
// says plainly when none is published yet.
// What the certificate of the parcours still asks (P8-34), condition by condition.
// Pedagogical only: no diploma, no financial approval, no bank score.
function CertificationCard({ t, status }) {
  const conditions = [
    ['missions', t('missions.cert.missions', { done: status.validated, total: status.total })],
    ['average', t('missions.cert.average', { average: Math.round(status.average) })],
    ['finalCase', t('missions.cert.finalCase')],
    ['security', t('missions.cert.security')],
  ];
  return (
    <section className="missions-cert" aria-labelledby="missions-cert-title">
      <h2 id="missions-cert-title">{t('missions.cert.title', { name: status.certification })}</h2>
      <ul>
        {conditions.map(([key, text]) => {
          const ok = !status.missing.includes(key);
          return (
            <li key={key}>
              {ok ? <CheckCircle2 size={16} aria-hidden="true" /> : <Circle size={16} aria-hidden="true" />}
              <span>{text}</span>
              <span className="sr-only">{ok ? t('missions.cert.met') : t('missions.cert.notMet')}</span>
            </li>
          );
        })}
      </ul>
      <p className="fin-hint">{status.eligible ? t('missions.cert.eligible') : t('missions.cert.rules')}</p>
    </section>
  );
}

export default function MissionsPage() {
  const { t } = useTranslation();
  useDocumentMeta(t('missions.title'), t('missions.intro'));
  const list = useApi('/fin/missions');
  const certification = useApi('/fin/missions/certification');

  if (list.status === 'loading' && !list.data) return <LoadingState />;
  if (list.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={list.reload} />;

  return (
    <>
      <PageHeader back={{ to: '/app/progression', label: t('missions.backToProgress') }} icon={Target} title={t('missions.title')} subtitle={t('missions.intro')} maxWidth={760} />
      <div className="fin-page-narrow">
        <p className="fin-hint">{t('missions.fictive')}</p>
        {certification.data?.certification && <CertificationCard t={t} status={certification.data.certification} />}
        {list.data.missions.length === 0 ? (
          <p className="fin-hint">{t('missions.none')}</p>
        ) : (
          <ul className="missions-list">
            {list.data.missions.map((mission) => (
              <li key={mission.slug}>
                <Link to={`/app/apprendre/missions/${mission.slug}`}>
                  <strong>{mission.title}</strong>
                  <span>{mission.summary}</span>
                </Link>
                <span className="missions-meta">
                  {t('missions.steps', { count: mission.steps })}
                  {mission.played > 0 && ` · ${t('missions.played', { count: mission.played })}`}
                  {mission.badge && (
                    <span className="missions-badge">
                      <Award size={14} aria-hidden="true" /> {mission.badge.label}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
