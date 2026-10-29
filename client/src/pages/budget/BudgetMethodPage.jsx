import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Scale } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import BackLink from '../../components/fincludia/BackLink.jsx';
import { MethodPanel } from './BudgetDetailPage.jsx';
import '../../components/fincludia/Fincludia.css';
import './Budget.css';

// BUD-04 « Analyse selon méthode », at its own address (P8-25):
// `/app/budgets/:id/methode`. One budget read through an optional method —
// compared, never judged (ARC-08).
export default function BudgetMethodPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const view = useApi(`/fin/budgets/${id}`);
  const references = useApi('/fin/budgets/references');
  const [message, setMessage] = useState(null);
  useDocumentMeta(t('budget.methods.title'));

  if (view.status === 'loading' && !view.data) return <LoadingState />;
  if (view.status === 'error') return <ErrorState message={t('budget.notFound')} />;

  async function run(action, okKey) {
    setMessage(null);
    try {
      await action();
      setMessage({ kind: 'ok', text: t(okKey) });
      view.reload();
      return { ok: true };
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 422: 'budget.errors.refused' })) });
      return { ok: false };
    }
  }

  return (
    <>
      <PageHeader icon={Scale} title={t('budget.methods.title')} subtitle={view.data.budget.label} maxWidth={1040} />
      <div className="budget-page">
        <BackLink to={`/app/budgets/${id}`}>{t('budget.backToBudget')}</BackLink>
        {message && (
          <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
            {message.text}
          </p>
        )}
        <MethodPanel budgetId={id} budget={view.data.budget} references={references.data} run={run} />
      </div>
    </>
  );
}
