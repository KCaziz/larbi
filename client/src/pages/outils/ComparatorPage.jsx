import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Landmark, Users } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import { formatDate } from '../../lib/format.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import './Comparator.css';

const SEGMENTS = ['particulier', 'professionnel', 'entreprise'];

export default function ComparatorPage() {
  const { t, i18n } = useTranslation();
  const summary = useApi('/tools/comparator');

  useDocumentMeta(t('comparator.title'), t('comparator.subtitle', { count: summary.data?.bankCount ?? '' }));

  if (summary.status === 'loading') return <LoadingState />;
  if (summary.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={summary.reload} />;

  const { themes, bankCount, conditionCount, updatedAt } = summary.data;

  return (
    <>
      <PageHeader icon={Landmark} title={t('comparator.title')} subtitle={t('comparator.subtitle', { count: bankCount })} />

      <div className="comparator-home">
        <p className="comparator-meta">
          <strong>{t('comparator.bankCount', { count: bankCount })}</strong>
          <strong>{t('comparator.conditionCount', { count: conditionCount })}</strong>
          {updatedAt && <span>{t('comparator.updatedAt', { date: formatDate(i18n.language, updatedAt) })}</span>}
        </p>

        <p className="comparator-disclaimer">{t('comparator.disclaimer')}</p>

        <div className="comparator-grid">
          {themes.map((theme) => {
            const counts = (
              <div className="theme-card-counts">
                <span>{t('comparator.conditionCount', { count: theme.conditionCount })}</span>
                <span>{t('comparator.bankCount', { count: theme.bankCount })}</span>
              </div>
            );
            // A rubric of the client's guide with no data in the source file is
            // listed (the guide lists it) but says so, and leads nowhere.
            if (theme.conditionCount === 0) {
              return (
                <div key={theme.key} className="theme-card theme-card-empty">
                  <h3>{t(`comparator.themes.${theme.key}`)}</h3>
                  <span className="theme-card-action">{t('comparator.notDocumented')}</span>
                </div>
              );
            }
            return (
              <Link key={theme.key} to={`/outils/comparateur/${theme.key}`} className="theme-card">
                <h3>{t(`comparator.themes.${theme.key}`)}</h3>
                {counts}
                <span className="theme-card-action">
                  {t('comparator.browseTheme')}
                  <ArrowRight className="icon-dir" size={14} strokeWidth={2} aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>

        {/* A section of its own, not a filter: the same offers read differently
            depending on who opens the account, and that is what visitors asked about. */}
        <section className="comparator-segments" aria-labelledby="comparator-segments-title">
          <h2 id="comparator-segments-title">{t('comparator.segmentsTitle')}</h2>
          <p className="comparator-segments-intro">{t('comparator.segmentsIntro')}</p>
          <div className="segment-cards">
            {SEGMENTS.map((seg) => (
              <Link key={seg} to={`/outils/comparateur/segments/${seg}`} className="segment-card">
                <span className="segment-card-icon" aria-hidden="true">
                  <Users size={20} strokeWidth={1.7} />
                </span>
                <h3>{t(`comparator.segments.${seg}`)}</h3>
                <p>{t(`comparator.segmentCards.${seg}`)}</p>
                <span className="segment-card-action">
                  {t('comparator.segmentCta')}
                  <ArrowRight className="icon-dir" size={14} strokeWidth={2} aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
