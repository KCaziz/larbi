import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Flag } from 'lucide-react';
import { errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import BackLink from '../../components/fincludia/BackLink.jsx';
import { GoalDetail } from './GoalsPage.jsx';
import '../../components/fincludia/Fincludia.css';
import './Goals.css';

// OBJ-03 « Détail objectif », at its own address (P8-25):
// `/app/objectifs/:id`. One goal, computed by the server (its view, its
// contributions), with everything that can be done with it.
export default function GoalDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState(location.state?.message ? { kind: 'ok', text: t(location.state.message) } : null);
  const detail = useApi(`/fin/goals/${id}`);
  const references = useApi('/fin/goals/references');
  const accounts = useApi('/fin/comptes');
  const formulas = useMemo(() => new Map((references.data?.formulas ?? []).map((formula) => [formula.id, formula])), [references.data]);
  useDocumentMeta(detail.data?.goal?.label ?? t('goals.title'));

  if (detail.status === 'loading' && !detail.data) return <LoadingState />;
  if (detail.status === 'error') return <ErrorState message={t('goals.notFound')} />;
  const { goal, contributions = [] } = detail.data;

  // A deletion leaves the screen: the goal is gone.
  async function run(action, okKey) {
    setMessage(null);
    try {
      await action();
      if (okKey === 'goals.deleted') {
        navigate('/app/objectifs', { state: { message: okKey } });
        return { ok: true };
      }
      setMessage({ kind: 'ok', text: t(okKey) });
      detail.reload();
      return { ok: true };
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 422: 'goals.errors.refused' })) });
      return { ok: false };
    }
  }

  return (
    <>
      <PageHeader icon={Flag} title={goal.label} subtitle={t('goals.intro')} maxWidth={1040} />
      <div className="goals-page">
        <BackLink to="/app/objectifs">{t('goals.backToList')}</BackLink>
        {message && (
          <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
            {message.text}
          </p>
        )}
        <GoalDetail
          goal={goal}
          formulas={formulas}
          statuses={references.data?.progressStatuses ?? []}
          accounts={accounts.data?.accounts ?? []}
          contributions={contributions}
          run={run}
        />
      </div>
    </>
  );
}
