import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Pencil, Plus } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import BackLink from '../../components/fincludia/BackLink.jsx';
import { AccountEditForm, AccountForm } from './accountParts.jsx';
import '../../components/fincludia/Fincludia.css';
import './Accounts.css';

// COM-02, « Créer / modifier un compte », at its own address (P8-25):
// `/app/comptes/nouveau` (and `?suggestion=<asset>` to start from what the
// person declared in their patrimony), `/app/comptes/:id/modifier`. Saved, the
// screen goes back to « Mes comptes », which says what happened.
export default function AccountFormPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState(null);
  const editing = Boolean(id);
  useDocumentMeta(t(editing ? 'accounts.editTitle' : 'accounts.addTitle'));

  const data = useApi('/fin/comptes?includeArchived=true');
  if (data.status === 'loading' && !data.data) return <LoadingState />;
  if (data.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={data.reload} />;

  const { accounts, types, suggestions = [] } = data.data;
  const account = editing ? accounts.find((row) => row.id === id) : null;
  if (editing && !account) return <ErrorState message={t('accounts.notFound')} />;
  const suggestion = suggestions.find((row) => row.assetId === search.get('suggestion')) ?? null;

  async function save(action, okKey, to) {
    setError(null);
    try {
      await action();
      navigate(to, { state: { message: okKey } });
    } catch (err) {
      setError(t(errorKey(err, { 422: 'accounts.errors.refused' })));
    }
  }

  return (
    <>
      <PageHeader icon={editing ? Pencil : Plus} title={editing ? t('accounts.editTitle') : t('accounts.addTitle')} subtitle={editing ? account.label : t('accounts.intro')} maxWidth={720} />
      <div className="accounts-page accounts-screen">
        <BackLink to={editing ? `/app/comptes/${id}` : '/app/comptes'}>{t(editing ? 'accounts.backToAccount' : 'accounts.backToList')}</BackLink>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {editing ? (
          <AccountEditForm account={account} onSubmit={(body) => save(() => api.patch(`/fin/comptes/${id}`, body), 'accounts.saved', `/app/comptes/${id}`)} />
        ) : (
          <AccountForm types={types} currency={user?.finCurrency ?? 'DZD'} initial={suggestion} onSubmit={(body) => save(() => api.post('/fin/comptes', body), 'accounts.created', '/app/comptes')} />
        )}
      </div>
    </>
  );
}
