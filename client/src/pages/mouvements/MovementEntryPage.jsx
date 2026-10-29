import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import BackLink from '../../components/fincludia/BackLink.jsx';
import { ListChecks } from 'lucide-react';
import { Entry, useMovementLookups } from './MovementsPage.jsx';
import '../argent/MyMoney.css';
import './Movements.css';

// TRX-02 « Ajouter un revenu ou une dépense » and TRX-03 « Modifier une
// transaction », at their own addresses (P8-25): `/app/mouvements/nouveau`
// (`?copie=<id>` starts from a copy), `/app/mouvements/:id/modifier`. Saved,
// the screen goes back where it came from and says so; « Enregistrer et
// nouveau » stays here.
export default function MovementEntryPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lookups } = useMovementLookups();
  const [message, setMessage] = useState(null);
  const okKey = useRef(null);
  const sourceId = id ?? search.get('copie');
  const editing = Boolean(id);
  const source = useApi(sourceId ? `/fin/transactions/${sourceId}` : null);
  useDocumentMeta(t(editing ? 'movements.editTitle' : 'myMoney.addTitle'));

  if (sourceId && source.status === 'loading' && !source.data) return <LoadingState />;
  if (sourceId && source.status === 'error') return <ErrorState message={t('movements.notFound')} />;

  async function run(action, key) {
    setMessage(null);
    try {
      const data = await action();
      okKey.current = key;
      setMessage({ kind: 'ok', text: t(key) });
      return { ok: true, data };
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 422: 'myMoney.errors.refused' })) });
      return { ok: false };
    }
  }

  const draft = sourceId ? { key: `${editing ? 'edit' : 'copy'}-${sourceId}`, mode: editing ? 'edit' : 'copy', transaction: source.data.transaction } : null;
  const back = editing ? `/app/mouvements/${id}` : '/app/mouvements';

  return (
    <>
      <PageHeader icon={ListChecks} title={t(editing ? 'movements.editTitle' : 'myMoney.addTitle')} subtitle={t('movements.intro')} maxWidth={1040} />
      <div className="money-page">
        <BackLink to={back}>{t(editing ? 'movements.backToMovement' : 'movements.backToList')}</BackLink>
        {message && (
          <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
            {message.text}
          </p>
        )}
        <Entry
          key={draft?.key ?? 'new'}
          currency={user?.finCurrency ?? 'DZD'}
          lookups={lookups}
          draft={draft}
          run={run}
          onDone={() => navigate(back, { state: { message: okKey.current } })}
        />
      </div>
    </>
  );
}
