import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Award, Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../../lib/api.js';
import { formatDate } from '../../lib/format.js';
import { useApi } from '../../lib/useApi.js';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import './Certificate.css';

// The certificate of the logged-in user for one formation. Printing (or "save
// as PDF") is done by the browser: the print stylesheet keeps only the sheet.
export default function CertificatePage() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const { status, data, error, reload } = useApi(`/learn/formations/${slug}/certificate`);

  const back = (
    <Link to={`/catalogue/${slug}`} className="cms-back">
      <ArrowLeft className="icon-dir" size={16} strokeWidth={1.75} aria-hidden="true" />
      {t('certificate.back')}
    </Link>
  );

  if (status === 'loading') return <LoadingState />;
  if (status === 'error') {
    const missing = error instanceof ApiError && error.status === 404;
    return (
      <div className="certificate-wrap">
        {back}
        <ErrorState message={missing ? t('certificate.notFound') : t('certificate.loadError')} onRetry={missing ? undefined : reload} />
      </div>
    );
  }

  const c = data.certificate;
  const verifyUrl = `${window.location.origin}/verification/${c.certificateNumber}`;

  return (
    <div className="certificate-wrap">
      <div className="certificate-actions">
        {back}
        <Button onClick={() => window.print()}>
          <Printer size={16} strokeWidth={1.9} aria-hidden="true" />
          {t('certificate.print')}
        </Button>
        <p>{t('certificate.printHint')}</p>
      </div>

      <article className="certificate-sheet" aria-label={t('certificate.title')}>
        <div className="certificate-frame">
          <span className="certificate-brand">
            <span className="brand-mark" aria-hidden="true">
              L
            </span>
            {t('common.brand')}
          </span>
          <p className="certificate-label">{t('certificate.sheet.label')}</p>
          <h1>{c.certificationTitle}</h1>
          <p className="certificate-small">{t('certificate.sheet.awardedTo')}</p>
          <p className="certificate-holder">{c.holderName}</p>
          <p className="certificate-small">{t('certificate.sheet.body')}</p>
          <p className="certificate-formation">{c.formationTitle}</p>

          <div className="certificate-footer">
            <div>
              <p>{t('certificate.sheet.issuedOn', { date: formatDate(i18n.language, c.issuedAt) })}</p>
              <p>{t('certificate.sheet.number')}</p>
              <p className="certificate-number" dir="ltr">
                {c.certificateNumber}
              </p>
            </div>
            <span className="certificate-seal" aria-hidden="true">
              <Award size={30} strokeWidth={1.5} />
            </span>
            <div>
              <p>{t('certificate.sheet.verify')}</p>
              <p className="certificate-verify-url" dir="ltr">
                {verifyUrl}
              </p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
