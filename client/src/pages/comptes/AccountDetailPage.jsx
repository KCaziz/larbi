import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Archive, ArchiveRestore, Pencil, TriangleAlert, Wallet } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import BackLink from '../../components/fincludia/BackLink.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import { BalanceHistory } from './accountParts.jsx';
import '../../components/fincludia/Fincludia.css';
import './Accounts.css';

// COM-03, « Détail compte », at its own address (P8-25): `/app/comptes/:id`.
// The balance (PB-F001, the server's), the alerts in words, the balance month
// by month, and what can be done with the account: see its movements, correct
// it, archive or restore it.
export default function AccountDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const [message, setMessage] = useState(location.state?.message ? { kind: 'ok', text: location.state.message } : null);
  const data = useApi('/fin/comptes?includeArchived=true');
  const account = data.data?.accounts.find((row) => row.id === id);
  useDocumentMeta(account?.label ?? t('accounts.detailTitle'));

  if (data.status === 'loading' && !data.data) return <LoadingState />;
  if (data.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={data.reload} />;
  if (!account) return <ErrorState message={t('accounts.notFound')} />;
  const typeLabel = data.data.types.find((type) => type.id === account.type)?.label ?? account.type;

  async function toggleArchive() {
    setMessage(null);
    try {
      await api.put(`/fin/comptes/${id}/archive`, { archived: !account.archivedAt });
      setMessage({ kind: 'ok', text: account.archivedAt ? 'accounts.restored' : 'accounts.archived' });
      data.reload();
    } catch (err) {
      setMessage({ kind: 'error', text: errorKey(err, { 422: 'accounts.errors.refused' }) });
    }
  }

  return (
    <>
      <PageHeader icon={Wallet} title={account.label} subtitle={typeLabel} maxWidth={1040} />
      <div className="accounts-page accounts-screen" style={{ '--account-color': account.color }}>
        <BackLink to="/app/comptes">{t('accounts.backToList')}</BackLink>
        {message && (
          <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
            {t(message.text)}
          </p>
        )}

        <div className="fin-figure-grid">
          <FigureCard label={account.liability ? t('accounts.owed') : t('accounts.balance')} answer={account.solde} />
        </div>
        <p className="accounts-meta">
          {!account.includeInTotal && t('accounts.notInTotal')}
          {account.archivedAt && ` ${t('accounts.archivedTag')}`}
        </p>

        {/* AL-P02 / AL-P03: an icon AND a sentence, never the colour alone. */}
        {account.alertes.length > 0 && (
          <ul className="accounts-alerts">
            {account.alertes.map((alert) => (
              <li key={alert}>
                <TriangleAlert size={14} aria-hidden="true" /> {t(`accounts.alerts.${alert}`)}
              </li>
            ))}
          </ul>
        )}

        <div className="accounts-card-actions">
          <Link to={`/app/mouvements?compte=${account.id}`}>{t('accounts.history')}</Link>
          <Link to={`/app/comptes/${account.id}/modifier`}>
            <Pencil size={14} aria-hidden="true" /> {t('accounts.edit')}
          </Link>
          <button type="button" className="accounts-link-button" onClick={toggleArchive}>
            {account.archivedAt ? <ArchiveRestore size={14} aria-hidden="true" /> : <Archive size={14} aria-hidden="true" />}{' '}
            {t(account.archivedAt ? 'accounts.restore' : 'accounts.archive')}
          </button>
        </div>

        <h2 className="accounts-section-title">{t('accounts.balanceCurve')}</h2>
        <BalanceHistory account={account} />
        {account.note && <p className="fin-hint">{account.note}</p>}
      </div>
    </>
  );
}
