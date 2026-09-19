import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { SearchX, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../../lib/api.js';
import { formatDate } from '../../lib/format.js';
import { useApi } from '../../lib/useApi.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import Section from '../../components/ui/Section.jsx';
import '../Pages.css';
import '../learn/Certificate.css';

// Same format as the server (services/certificate.service.js); the server stays
// the authority, this only saves a request for an obvious typo.
const NUMBER_FORMAT = /^LARBI-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/;

// Public page: no account needed. `/verification` = the form,
// `/verification/:number` = the result for that number.
export default function VerifyCertificatePage() {
  const { number } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [input, setInput] = useState(number ?? '');
  const [formError, setFormError] = useState('');
  const result = useApi(number ? `/certificates/${encodeURIComponent(number)}` : null);

  const submit = (event) => {
    event.preventDefault();
    const normalized = input.trim().toUpperCase();
    if (!NUMBER_FORMAT.test(normalized)) {
      setFormError(t('verify.invalid'));
      return;
    }
    setFormError('');
    navigate(`/verification/${normalized}`);
  };

  return (
    <>
      <PageHeader icon={ShieldCheck} title={t('verify.title')} subtitle={t('verify.intro')} />
      <Section>
        <div className="verify-layout">
          <div className="form-card">
            <form className="verify-form" onSubmit={submit} noValidate>
              <div className="form-field">
                <label htmlFor="certificate-number">{t('verify.label')}</label>
                <input
                  id="certificate-number"
                  name="number"
                  type="text"
                  dir="ltr"
                  autoComplete="off"
                  spellCheck="false"
                  placeholder={t('verify.placeholder')}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  aria-invalid={formError ? 'true' : undefined}
                  aria-describedby={formError ? 'certificate-number-error' : undefined}
                />
              </div>
              <Button type="submit">{t('verify.submit')}</Button>
            </form>
            {formError && (
              <p id="certificate-number-error" className="form-status form-status-error" role="alert">
                {formError}
              </p>
            )}
          </div>

          {number && result.status === 'loading' && <LoadingState />}

          {number && result.status === 'ready' && (
            <section className="verify-result is-valid" aria-live="polite">
              <h2>
                <ShieldCheck size={24} strokeWidth={1.8} aria-hidden="true" />
                {t('verify.valid')}
              </h2>
              <p>{t('verify.validText')}</p>
              <dl className="verify-facts">
                <dt>{t('verify.holder')}</dt>
                <dd>{result.data.certificate.holderName}</dd>
                <dt>{t('verify.certification')}</dt>
                <dd>{result.data.certificate.certificationTitle}</dd>
                <dt>{t('verify.formation')}</dt>
                <dd>{result.data.certificate.formationTitle}</dd>
                <dt>{t('verify.issuedOn')}</dt>
                <dd>{formatDate(i18n.language, result.data.certificate.issuedAt)}</dd>
                <dt>{t('verify.number')}</dt>
                <dd dir="ltr" className="certificate-number">
                  {result.data.certificate.certificateNumber}
                </dd>
              </dl>
              <p className="verify-note">{t('verify.privacy')}</p>
            </section>
          )}

          {number && result.status === 'error' &&
            (result.error instanceof ApiError && result.error.status === 404 ? (
              <section className="verify-result is-unknown" aria-live="polite">
                <h2>
                  <SearchX size={24} strokeWidth={1.8} aria-hidden="true" />
                  {t('verify.unknown')}
                </h2>
                <p>{t('verify.unknownHint')}</p>
                <Link to="/verification">{t('verify.another')}</Link>
              </section>
            ) : (
              <ErrorState
                message={result.error instanceof ApiError && result.error.status === 429 ? t('verify.tooMany') : t('verify.loadError')}
                onRetry={result.reload}
              />
            ))}
        </div>
      </Section>
    </>
  );
}
