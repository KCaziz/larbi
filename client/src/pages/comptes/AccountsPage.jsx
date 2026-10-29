import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Archive, ArchiveRestore, ArrowLeftRight, ChevronRight, Pencil, Plus, TriangleAlert, Wallet } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatAmount } from '../../lib/format.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import '../../components/fincludia/Fincludia.css';
import './Accounts.css';

// « Mes comptes » (P8-05, screens COM-01 to COM-04): every account with its
// balance (PB-F001, computed by the server), the total available (PB-F002)
// and the net position (PB-F003); liabilities apart; the alerts in words;
// creating, correcting, archiving an account; one account's detail with its
// balance month by month; moving money between two accounts. The interface
// computes nothing: it shows the engine's answers.
//
// P8-25: the form, the detail and the transfer each have their own address
// (`/app/comptes/nouveau`, `/app/comptes/:id`, `/app/comptes/:id/modifier`,
// `/app/comptes/transfert`); this page leads to them in one click and says
// what happened when the person comes back.
export default function AccountsPage() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [message, setMessage] = useState(location.state?.message ? { kind: 'ok', text: t(location.state.message) } : null);
  const [showArchived, setShowArchived] = useState(false);
  useDocumentMeta(t('accounts.title'), t('accounts.intro'));

  const data = useApi(`/fin/comptes${showArchived ? '?includeArchived=true' : ''}`);

  async function run(action, okKey) {
    setMessage(null);
    try {
      await action();
      setMessage({ kind: 'ok', text: t(okKey) });
      data.reload();
      return { ok: true };
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 422: 'accounts.errors.refused' })) });
      return { ok: false };
    }
  }

  if (data.status === 'loading' && !data.data) return <LoadingState />;
  if (data.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={data.reload} />;

  const { accounts, totals, types, suggestions = [] } = data.data;
  const assets = accounts.filter((account) => !account.liability);
  const liabilities = accounts.filter((account) => account.liability);

  return (
    <>
      <PageHeader icon={Wallet} title={t('accounts.title')} subtitle={t('accounts.intro')} maxWidth={1040} />
      <div className="accounts-page">
        {message && (
          <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
            {message.text}
          </p>
        )}

        {totals.length > 0 && (
          <div className="fin-figure-grid">
            {totals.map((total) => (
              <FigureCard key={`total-${total.currency}`} label={t('accounts.total', { currency: total.currency })} answer={total.soldeTotal} />
            ))}
            {totals.map((total) => (
              <FigureCard key={`net-${total.currency}`} label={t('accounts.netPosition', { currency: total.currency })} answer={total.positionNette} />
            ))}
          </div>
        )}

        <div className="accounts-actions">
          <Button variant="secondary" to="/app/comptes/nouveau">
            <Plus size={16} aria-hidden="true" /> {t('accounts.add')}
          </Button>
          {/* Always offered: with fewer than two accounts, the transfer screen says what is missing. */}
          <Button variant="secondary" to="/app/comptes/transfert">
            <ArrowLeftRight size={16} aria-hidden="true" /> {t('accounts.transfer')}
          </Button>
          <label className="accounts-toggle">
            <input type="checkbox" checked={showArchived} onChange={(event) => setShowArchived(event.target.checked)} />
            {t('accounts.showArchived')}
          </label>
        </div>

        {/* What the person already declared in their patrimony: offered as
            accounts, never created without them. */}
        {suggestions.length > 0 && (
          <section className="accounts-suggestions" aria-labelledby="accounts-suggestions-title">
            <h2 id="accounts-suggestions-title">{t('accounts.suggestions')}</h2>
            <ul>
              {suggestions.map((suggestion) => (
                <li key={suggestion.assetId}>
                  <span>
                    {suggestion.label} · {formatAmount(i18n.language, suggestion.openingBalance, suggestion.currency)}
                  </span>
                  <Button variant="ghost" to={`/app/comptes/nouveau?suggestion=${encodeURIComponent(suggestion.assetId)}`}>
                    {t('accounts.useSuggestion')}
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {accounts.length === 0 ? (
          // The empty state says what to do, and that a first movement creates
          // the « Espèces » account on its own (PB-PR-04).
          <p className="fin-hint">
            {t('accounts.empty')} <Link to="/app/mouvements/nouveau">{t('accounts.emptyLink')}</Link>
          </p>
        ) : (
          <>
            <AccountList accounts={assets} types={types} run={run} />
            {liabilities.length > 0 && (
              <section aria-labelledby="accounts-liabilities-title">
                <h2 id="accounts-liabilities-title" className="accounts-section-title">
                  {t('accounts.liabilities')}
                </h2>
                <p className="fin-hint">{t('accounts.liabilitiesHint')}</p>
                <AccountList accounts={liabilities} types={types} run={run} />
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
}

function AccountList({ accounts, types, run }) {
  return (
    <ul className="accounts-list">
      {accounts.map((account) => (
        <AccountCard key={account.id} account={account} types={types} run={run} />
      ))}
    </ul>
  );
}

function AccountCard({ account, types, run }) {
  const { t, i18n } = useTranslation();
  const typeLabel = types.find((type) => type.id === account.type)?.label ?? account.type;
  const path = `/fin/comptes/${account.id}`;

  return (
    <li className={account.archivedAt ? 'accounts-card accounts-card-archived' : 'accounts-card'} style={{ '--account-color': account.color }}>
      <span className="accounts-icon" aria-hidden="true">
        {account.icon}
      </span>
      <div className="accounts-text">
        <h3 className="accounts-name">
          <Link to={`/app/comptes/${account.id}`}>{account.label}</Link>
        </h3>
        <p className="accounts-meta">
          {typeLabel}
          {!account.includeInTotal && ` · ${t('accounts.notInTotal')}`}
          {account.archivedAt && ` · ${t('accounts.archivedTag')}`}
        </p>
      </div>
      <p className="accounts-balance">
        {account.liability && <span className="accounts-owed">{t('accounts.owed')} </span>}
        {account.solde.resultat === null ? t('fincludia.notComputed') : formatAmount(i18n.language, account.solde.resultat, account.currency)}
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
        <Link to={`/app/comptes/${account.id}`}>
          <ChevronRight className="icon-dir" size={14} aria-hidden="true" /> {t('accounts.detail')}
        </Link>
        <Link to={`/app/comptes/${account.id}/modifier`}>
          <Pencil size={14} aria-hidden="true" /> {t('accounts.edit')}
        </Link>
        <button
          type="button"
          className="accounts-link-button"
          onClick={() => run(() => api.put(`${path}/archive`, { archived: !account.archivedAt }), account.archivedAt ? 'accounts.restored' : 'accounts.archived')}
        >
          {account.archivedAt ? <ArchiveRestore size={14} aria-hidden="true" /> : <Archive size={14} aria-hidden="true" />}{' '}
          {t(account.archivedAt ? 'accounts.restore' : 'accounts.archive')}
        </button>
      </div>

    </li>
  );
}
