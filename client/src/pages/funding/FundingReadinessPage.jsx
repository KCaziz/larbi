import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, Download, FileCheck, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import AdultOnly from '../../components/fincludia/AdultOnly.jsx';
import { adultRefusalReason, isAdultRefusal } from '../../lib/adultRefusal.js';
import LoadingState from '../../components/ui/LoadingState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import '../../components/fincludia/Fincludia.css';
import './Funding.css';

// Funding readiness (P6-16), screens JA08 / SA05. The client's own words are
// binding: never the phrase "score de crédit", no prediction, no guarantee of
// agreement. The global index (F051) stays blocked until the client supplies
// its weights (P6-01) — this page shows each dimension on its own instead,
// exactly like the "santé financière" of the home dashboard (P6-06).
// « Compléter » (SA05): where each missing element is filled in. The
// stability dimension has no screen: it waits for the client's weights.
const COMPLETE_AT = {
  public: '/app/parametres/fincludia',
  income: '/app/parametres/premiers-pas',
  reserveTarget: '/app/objectifs/fonds-urgence',
  wealth: '/app/patrimoine',
  debtEffort: '/app/dettes',
};

export default function FundingReadinessPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [message, setMessage] = useState(null);
  const [exporting, setExporting] = useState(false);
  useDocumentMeta(t('funding.title'), t('funding.intro'));

  const currency = user?.finCurrency ?? 'DZD';
  const readiness = useApi(`/fin/financement/preparation?currency=${currency}`);

  async function exportFile() {
    setMessage(null);
    setExporting(true);
    try {
      const data = await api.post(`/fin/financement/export?currency=${currency}`, { consent: true });
      const blob = new Blob([JSON.stringify(data.export, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'preparation-financement.json';
      link.click();
      URL.revokeObjectURL(url);
      setMessage({ kind: 'ok', text: t('funding.exported') });
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 400: 'funding.errors.refused' })) });
    } finally {
      setExporting(false);
    }
  }

  if (readiness.status === 'loading' && !readiness.data) return <LoadingState />;
  // A refusal reserved to 18+ is not a failed load: retrying cannot help,
  // and the person needs to know whether there is anything to fix.
  if (isAdultRefusal(readiness.error)) return <AdultOnly reason={adultRefusalReason(readiness.error)} />;
  if (readiness.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={readiness.reload} />;

  const r = readiness.data;

  return (
    <>
      <PageHeader icon={FileCheck} title={t('funding.title')} subtitle={t('funding.intro')} maxWidth={1040} />
      <div className="funding-page">
        <Notice variant="info">{t('funding.disclaimer')}</Notice>

        {message && (
          <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
            {message.text}
          </p>
        )}

        <h2>{t('funding.dimensionsTitle')}</h2>
        <div className="fin-figure-grid">
          <CompletenessCard t={t} completeness={r.dimensions.completeness} />
          <DimensionBlocked t={t} />
          <FigureCard label={t('funding.debtEffort')} answer={r.dimensions.debtEffort} />
          <FigureCard label={t('funding.downPayment')} answer={r.dimensions.downPayment} />
          <FigureCard label={t('funding.reserve')} answer={r.dimensions.reserve} />
        </div>

        <p className="funding-global-note">{t('funding.globalBlockedNote')}</p>

        {r.piecesManquantes.length > 0 && (
          <>
            <h2>{t('funding.checklistTitle')}</h2>
            <ul className="funding-checklist">
              {r.piecesManquantes.map((key) => (
                <li key={key}>
                  {t(`funding.pieces.${key}`)}
                  {COMPLETE_AT[key] && (
                    <>
                      {' — '}
                      <Link to={COMPLETE_AT[key]}>{t('funding.complete')}</Link>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="funding-actions">
          <Button onClick={exportFile} disabled={exporting}>
            <Download size={16} aria-hidden="true" /> {t('funding.export')}
          </Button>
          <p className="fin-hint">{t('funding.exportConsentHint')}</p>
          {/* « Simuler » and « Comparer » (SA05): the two tools that come next. */}
          <div className="funding-next">
            <Button to="/app/outils/credit" variant="ghost">
              <Calculator size={16} aria-hidden="true" /> {t('funding.simulate')}
            </Button>
            <Button to="/app/outils/comparer" variant="ghost">
              <Scale size={16} aria-hidden="true" /> {t('funding.compare')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function CompletenessCard({ t, completeness }) {
  return (
    <article className="fin-figure">
      <h3 className="fin-figure-label">{t('funding.completeness')}</h3>
      <p className="fin-figure-value">{Math.round(completeness.ratio * 100)} %</p>
      <ul className="funding-completeness-list">
        {completeness.checks.map((check) => (
          <li key={check.key} className={check.done ? 'funding-check-done' : 'funding-check-missing'}>
            {t(`funding.pieces.${check.key}`)}
          </li>
        ))}
      </ul>
    </article>
  );
}

function DimensionBlocked({ t }) {
  return (
    <article className="fin-figure">
      <h3 className="fin-figure-label">{t('funding.stability')}</h3>
      <p className="fin-figure-value fin-figure-unknown">{t('fincludia.notComputed')}</p>
      <p className="fin-hint">{t('funding.stabilityBlocked')}</p>
    </article>
  );
}
