import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Award, Target } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import BackLink from '../../components/fincludia/BackLink.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import '../../components/fincludia/Fincludia.css';
import './Missions.css';

// The missions of the person's profile (P8-17): short series of choices on a
// FICTIVE sum. The list shows what was played and the best badge earned, and
// says plainly when none is published yet.
export default function MissionsPage() {
  const { t } = useTranslation();
  useDocumentMeta(t('missions.title'), t('missions.intro'));
  const list = useApi('/fin/missions');

  if (list.status === 'loading' && !list.data) return <LoadingState />;
  if (list.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={list.reload} />;

  return (
    <>
      <PageHeader icon={Target} title={t('missions.title')} subtitle={t('missions.intro')} maxWidth={760} />
      <div className="fin-page-narrow">
        <BackLink to="/app/progression">{t('missions.backToProgress')}</BackLink>
        <p className="fin-hint">{t('missions.fictive')}</p>
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
