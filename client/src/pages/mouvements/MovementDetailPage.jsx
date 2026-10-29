import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Copy, History, ListChecks, Pencil } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatDate } from '../../lib/format.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import BackLink from '../../components/fincludia/BackLink.jsx';
import { Row, useMovementLookups } from './MovementsPage.jsx';
import '../argent/MyMoney.css';
import './Movements.css';

// TRX-03 « Détail transaction », at its own address (P8-25):
// `/app/mouvements/:id`. The movement as the list shows it, with its clearing,
// what can be done with it (correct, copy, delete) and the trail of its
// corrections — who changed what, and why when a reason was given.
export default function MovementDetailPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { lookups } = useMovementLookups();
  const movement = useApi(`/fin/transactions/${id}`);
  const trail = useApi(`/fin/transactions/${id}/historique`);
  const [message, setMessage] = useState(location.state?.message ? { kind: 'ok', text: t(location.state.message) } : null);
  useDocumentMeta(t('movements.detailTitle'));

  if (movement.status === 'loading' && !movement.data) return <LoadingState />;
  if (movement.status === 'error') return <ErrorState message={t('movements.notFound')} />;
  const transaction = movement.data.transaction;

  // The row's own actions (clearing, delete) go through here: a deletion
  // leaves the screen, since the movement is gone.
  async function run(action, key) {
    setMessage(null);
    try {
      await action();
      if (key === 'myMoney.deleted') {
        navigate('/app/mouvements', { state: { message: key } });
        return { ok: true };
      }
      setMessage({ kind: 'ok', text: t(key) });
      movement.reload();
      trail.reload();
      return { ok: true };
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 422: 'myMoney.errors.refused' })) });
      return { ok: false };
    }
  }

  return (
    <>
      <PageHeader icon={ListChecks} title={t('movements.detailTitle')} subtitle={formatDate(i18n.language, transaction.occurredAt)} maxWidth={1040} />
      <div className="money-page">
        <BackLink to="/app/mouvements">{t('movements.backToList')}</BackLink>
        {message && (
          <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
            {message.text}
          </p>
        )}
        <ul className="money-list">
          <Row transaction={transaction} lookups={lookups} run={run} detail={false} />
        </ul>

        {!transaction.transferId && (
          <div className="movements-actions">
            <Link className="btn btn-secondary" to={`/app/mouvements/${id}/modifier`}>
              <Pencil size={16} aria-hidden="true" /> {t('movements.edit')}
            </Link>
            <Link className="btn btn-ghost" to={`/app/mouvements/nouveau?copie=${id}`}>
              <Copy size={16} aria-hidden="true" /> {t('movements.duplicate')}
            </Link>
          </div>
        )}

        <h2 className="movements-trail-title">
          <History size={18} aria-hidden="true" /> {t('movements.trailTitle')}
        </h2>
        {trail.status === 'loading' && !trail.data ? (
          <LoadingState />
        ) : (trail.data?.changes ?? []).length === 0 ? (
          <p className="fin-hint">{t('movements.trailEmpty')}</p>
        ) : (
          <ul className="movements-trail">
            {trail.data.changes.map((change) => (
              <li key={change.id}>
                <span>{formatDate(i18n.language, change.createdAt)}</span> — {t(`movements.trailActions.${change.action}`, { defaultValue: change.action })}
                {change.reason && <span className="fin-hint"> · {change.reason}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
