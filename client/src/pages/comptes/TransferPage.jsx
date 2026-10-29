import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import BackLink from '../../components/fincludia/BackLink.jsx';
import { TransferForm } from './accountParts.jsx';
import '../../components/fincludia/Fincludia.css';
import './Accounts.css';

// COM-04, « Nouveau transfert », at its own address (P8-25):
// `/app/comptes/transfert`. Money moving between two of the person's
// accounts: neither an income nor an expense (PB-F025).
export default function TransferPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  useDocumentMeta(t('accounts.transferTitle'));
  const data = useApi('/fin/comptes');

  if (data.status === 'loading' && !data.data) return <LoadingState />;
  if (data.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={data.reload} />;
  const open = data.data.accounts.filter((account) => !account.archivedAt);

  async function submit(body) {
    setError(null);
    try {
      await api.post('/fin/transferts', body);
      navigate('/app/comptes', { state: { message: 'accounts.transferred' } });
    } catch (err) {
      setError(t(errorKey(err, { 422: 'accounts.errors.refused' })));
    }
  }

  return (
    <>
      <PageHeader icon={ArrowLeftRight} title={t('accounts.transferTitle')} subtitle={t('accounts.transferHint')} maxWidth={720} />
      <div className="accounts-page accounts-screen">
        <BackLink to="/app/comptes">{t('accounts.backToList')}</BackLink>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {open.length < 2 ? <Notice variant="info">{t('accounts.transferNeedsTwo')}</Notice> : <TransferForm accounts={open} onSubmit={submit} />}
      </div>
    </>
  );
}
