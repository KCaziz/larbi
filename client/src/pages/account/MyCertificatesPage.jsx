import { Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../lib/format.js';
import { useApi } from '../../lib/useApi.js';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import EmptyState from '../../components/cms/EmptyState.jsx';
import '../learn/Certificate.css';
import '../Pages.css';

export default function MyCertificatesPage() {
  const { t, i18n } = useTranslation();
  const { status, data, reload } = useApi('/learn/certificates');

  return (
    <div>
      <h2 className="account-heading">{t('certificate.mine.title')}</h2>
      <p>{t('certificate.mine.intro')}</p>

      {status === 'loading' && <LoadingState />}
      {status === 'error' && <ErrorState message={t('certificate.mine.loadError')} onRetry={reload} />}
      {status === 'ready' && data.certificates.length === 0 && (
        <EmptyState icon={Award} title={t('certificate.mine.empty')}>
          <p>{t('certificate.mine.emptyHint')}</p>
          <Button to="/catalogue" arrow>
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
              <Button to={`/catalogue/${c.formationSlug}/certificat`} variant="secondary">
                {t('certificate.mine.view')}
              </Button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
