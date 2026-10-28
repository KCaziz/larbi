import { Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../lib/format.js';
import { useApi } from '../../lib/useApi.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import EmptyState from '../../components/cms/EmptyState.jsx';
import EducationPanel from '../../components/fincludia/EducationPanel.jsx';
import '../learn/Certificate.css';
import '../Pages.css';

export default function MyCertificatesPage() {
  const { t, i18n } = useTranslation();
  useDocumentMeta(t('certificate.mine.title'), t('certificate.mine.intro'));
  const { status, data, reload } = useApi('/learn/certificates');

  // Its own screen of the application since P8-02 (FOR-03), no longer a tab of
  // « Mon compte »: the same header as every other screen (P8-21).
  return (
    <>
      <PageHeader icon={Award} title={t('certificate.mine.title')} subtitle={t('certificate.mine.intro')} maxWidth={760} />
      {/* The parcours certificate of the profile, and how to obtain it (P8-17). */}
      <EducationPanel mode="certificates" />
      <div className="fin-page-narrow">
        {status === 'loading' && <LoadingState />}
        {status === 'error' && <ErrorState message={t('certificate.mine.loadError')} onRetry={reload} />}
        {status === 'ready' && data.certificates.length === 0 && (
          <EmptyState icon={Award} title={t('certificate.mine.empty')}>
            <p>{t('certificate.mine.emptyHint')}</p>
            <Button to="/app/formation" arrow>
              {t('certificate.mine.browse')}
            </Button>
          </EmptyState>
        )}
        {status === 'ready' && data.certificates.length > 0 && (
          <div className="certificate-list">
            {data.certificates.map((c) => (
              <article className="certificate-card" key={c.certificateNumber}>
                <Award size={22} strokeWidth={1.6} aria-hidden="true" />
                <h3>{c.certificationTitle}</h3>
                <p>{c.formationTitle}</p>
                <p>{t('certificate.mine.issuedOn', { date: formatDate(i18n.language, c.issuedAt) })}</p>
                <p className="certificate-number" dir="ltr">
                  {c.certificateNumber}
                </p>
                <Button to={`/app/formation/${c.formationSlug}/certificat`} variant="secondary">
                  {t('certificate.mine.view')}
                </Button>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
