import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Archive, ArchiveRestore, ArrowLeftRight, ChevronDown, Pencil, Plus, TriangleAlert, Wallet } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { formatAmount } from '../../lib/format.js';
import { fromMinorUnits, toMinorUnits } from '../../lib/money.js';
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
export default function AccountsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const currency = user?.finCurrency ?? 'DZD';
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState(null);
  const [prefill, setPrefill] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  useDocumentMeta(t('accounts.title'), t('accounts.intro'));

  const data = useApi(`/fin/comptes${showArchived ? '?includeArchived=true' : ''}`);

  async function run(action, okKey) {
    setMessage(null);
    try {
      await action();
      setMessage({ kind: 'ok', text: t(okKey) });
      setForm(null);
      setPrefill(null);
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
  const open = accounts.filter((account) => !account.archivedAt);
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
          <Button variant="secondary" onClick={() => setForm(form === 'account' ? null : 'account')} aria-expanded={form === 'account'}>
            <Plus size={16} aria-hidden="true" /> {t('accounts.add')}
          </Button>
          {open.length >= 2 && (
            <Button variant="secondary" onClick={() => setForm(form === 'transfer' ? null : 'transfer')} aria-expanded={form === 'transfer'}>
              <ArrowLeftRight size={16} aria-hidden="true" /> {t('accounts.transfer')}
            </Button>
          )}
          <label className="accounts-toggle">
            <input type="checkbox" checked={showArchived} onChange={(event) => setShowArchived(event.target.checked)} />
            {t('accounts.showArchived')}
          </label>
        </div>

        {form === 'account' && (
          <AccountForm
            types={types}
            currency={currency}
            initial={prefill}
            onSubmit={(body) => run(() => api.post('/fin/comptes', body), 'accounts.created')}
          />
        )}
        {form === 'transfer' && <TransferForm accounts={open} onSubmit={(body) => run(() => api.post('/fin/transferts', body), 'accounts.transferred')} />}

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
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setPrefill(suggestion);
                      setForm('account');
                    }}
                  >
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
            {t('accounts.empty')} <Link to="/app/mouvements#saisie">{t('accounts.emptyLink')}</Link>
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
  const [editing, setEditing] = useState(false);
  const [detail, setDetail] = useState(false);
  const typeLabel = types.find((type) => type.id === account.type)?.label ?? account.type;
  const path = `/fin/comptes/${account.id}`;

  return (
    <li className={account.archivedAt ? 'accounts-card accounts-card-archived' : 'accounts-card'} style={{ '--account-color': account.color }}>
      <span className="accounts-icon" aria-hidden="true">
        {account.icon}
      </span>
      <div className="accounts-text">
        <h3 className="accounts-name">{account.label}</h3>
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
        <button type="button" className="accounts-link-button" aria-expanded={detail} onClick={() => setDetail((value) => !value)}>
          <ChevronDown size={14} aria-hidden="true" /> {t('accounts.balanceCurve')}
        </button>
        <button type="button" className="accounts-link-button" aria-expanded={editing} onClick={() => setEditing((value) => !value)}>
          <Pencil size={14} aria-hidden="true" /> {t('accounts.edit')}
        </button>
        <button
          type="button"
          className="accounts-link-button"
          onClick={() => run(() => api.put(`${path}/archive`, { archived: !account.archivedAt }), account.archivedAt ? 'accounts.restored' : 'accounts.archived')}
        >
          {account.archivedAt ? <ArchiveRestore size={14} aria-hidden="true" /> : <Archive size={14} aria-hidden="true" />}{' '}
          {t(account.archivedAt ? 'accounts.restore' : 'accounts.archive')}
        </button>
      </div>

      {editing && (
        <div className="accounts-card-panel">
          <AccountEditForm account={account} onSubmit={(body) => run(() => api.patch(path, body), 'accounts.saved')} />
        </div>
      )}
      {detail && (
        <div className="accounts-card-panel">
          <BalanceHistory account={account} />
        </div>
      )}
    </li>
  );
}

// COM-03: the balance at the end of each of the last six months, as a list
// that reads without the chart (and a bar beside each value for the eye).
function BalanceHistory({ account }) {
  const { t, i18n } = useTranslation();
  const history = useApi(`/fin/comptes/${account.id}/historique`);
  if (history.status === 'loading') return <LoadingState />;
  if (history.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={history.reload} />;
  const points = history.data.points;
  const max = Math.max(1, ...points.map((point) => Math.abs(point.solde ?? 0)));
  return (
    <ul className="accounts-curve" aria-label={t('accounts.balanceCurve')}>
      {points.map((point) => (
        <li key={point.month}>
          <span className="accounts-curve-month">{point.month}</span>
          <span className="accounts-curve-bar" aria-hidden="true">
            <span style={{ inlineSize: `${(Math.abs(point.solde ?? 0) / max) * 100}%` }} className={point.solde < 0 ? 'negative' : ''} />
          </span>
          <span className="accounts-curve-value">{point.solde === null ? '—' : formatAmount(i18n.language, point.solde, account.currency)}</span>
        </li>
      ))}
    </ul>
  );
}

function AccountForm({ types, currency, initial, onSubmit }) {
  const { t } = useTranslation();
  const [state, setState] = useState(() => ({
    label: initial?.label ?? '',
    type: initial?.type ?? types[0]?.id ?? 'AC-01',
    opening: initial ? fromMinorUnits(initial.openingBalance, initial.currency) : '0',
    openingDate: (initial?.openingDate ? new Date(initial.openingDate) : new Date()).toISOString().slice(0, 10),
  }));
  const accountCurrency = initial?.currency ?? currency;
  const [error, setError] = useState(null);

  const submit = (event) => {
    event.preventDefault();
    const openingBalance = toMinorUnits(state.opening, accountCurrency, { allowZero: true });
    if (openingBalance === null) {
      setError(t('accounts.errors.amount'));
      return;
    }
    setError(null);
    onSubmit({ label: state.label.trim(), type: state.type, currency: accountCurrency, openingBalance, openingDate: new Date(state.openingDate).toISOString() });
  };

  return (
    <form className="accounts-form" onSubmit={submit}>
      <div className="fin-field">
        <label htmlFor="account-label">{t('accounts.fields.label')}</label>
        <input id="account-label" value={state.label} maxLength={80} required onChange={(event) => setState({ ...state, label: event.target.value })} />
      </div>
      <div className="fin-field">
        <label htmlFor="account-type">{t('accounts.fields.type')}</label>
        <select id="account-type" value={state.type} onChange={(event) => setState({ ...state, type: event.target.value })}>
          {types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.icon} {type.label}
            </option>
          ))}
        </select>
        <p className="fin-hint">{types.find((type) => type.id === state.type)?.rule}</p>
      </div>
      <div className="fin-field">
        <label htmlFor="account-opening">{t('accounts.fields.opening', { currency: accountCurrency })}</label>
        <input id="account-opening" inputMode="decimal" value={state.opening} onChange={(event) => setState({ ...state, opening: event.target.value })} aria-invalid={Boolean(error)} />
        {error && <p className="form-error">{error}</p>}
      </div>
      <div className="fin-field">
        <label htmlFor="account-opening-date">{t('accounts.fields.openingDate')}</label>
        <input id="account-opening-date" type="date" value={state.openingDate} required onChange={(event) => setState({ ...state, openingDate: event.target.value })} />
      </div>
      <Button type="submit">{t('accounts.save')}</Button>
    </form>
  );
}

// Correcting an account: what tab 04B lets the person change. The type and the
// currency are not here — they decide how every past movement reads.
function AccountEditForm({ account, onSubmit }) {
  const { t } = useTranslation();
  const money = (value) => (value === null || value === undefined ? '' : fromMinorUnits(value, account.currency));
  const [state, setState] = useState({
    label: account.label,
    includeInTotal: account.includeInTotal,
    includeInNetWorth: account.includeInNetWorth,
    minBalanceAlert: money(account.minBalanceAlert),
    overdraftAllowed: money(account.overdraftAllowed),
    note: account.note ?? '',
  });
  const [error, setError] = useState(null);

  const submit = (event) => {
    event.preventDefault();
    const parse = (text) => (text.trim() === '' ? null : toMinorUnits(text, account.currency, { allowZero: true }));
    const minBalanceAlert = parse(state.minBalanceAlert);
    const overdraftAllowed = parse(state.overdraftAllowed);
    if ((state.minBalanceAlert.trim() && minBalanceAlert === null) || (state.overdraftAllowed.trim() && overdraftAllowed === null)) {
      setError(t('accounts.errors.amount'));
      return;
    }
    setError(null);
    onSubmit({
      label: state.label.trim(),
      includeInTotal: state.includeInTotal,
      includeInNetWorth: state.includeInNetWorth,
      minBalanceAlert,
      overdraftAllowed,
      note: state.note.trim() || null,
    });
  };

  const id = (name) => `account-${account.id}-${name}`;
  return (
    <form className="accounts-form" onSubmit={submit}>
      <div className="fin-field">
        <label htmlFor={id('label')}>{t('accounts.fields.label')}</label>
        <input id={id('label')} value={state.label} maxLength={80} required onChange={(event) => setState({ ...state, label: event.target.value })} />
      </div>
      <label className="accounts-toggle">
        <input type="checkbox" checked={state.includeInTotal} onChange={(event) => setState({ ...state, includeInTotal: event.target.checked })} />
        {t('accounts.fields.includeInTotal')}
      </label>
      <label className="accounts-toggle">
        <input type="checkbox" checked={state.includeInNetWorth} onChange={(event) => setState({ ...state, includeInNetWorth: event.target.checked })} />
        {t('accounts.fields.includeInNetWorth')}
      </label>
      <div className="fin-field">
        <label htmlFor={id('min')}>{t('accounts.fields.minBalanceAlert', { currency: account.currency })}</label>
        <input id={id('min')} inputMode="decimal" value={state.minBalanceAlert} onChange={(event) => setState({ ...state, minBalanceAlert: event.target.value })} />
      </div>
      {!account.liability && (
        <div className="fin-field">
          <label htmlFor={id('overdraft')}>{t('accounts.fields.overdraftAllowed', { currency: account.currency })}</label>
          <input id={id('overdraft')} inputMode="decimal" value={state.overdraftAllowed} onChange={(event) => setState({ ...state, overdraftAllowed: event.target.value })} />
        </div>
      )}
      <div className="fin-field">
        <label htmlFor={id('note')}>{t('accounts.fields.note')}</label>
        <input id={id('note')} value={state.note} maxLength={300} onChange={(event) => setState({ ...state, note: event.target.value })} />
      </div>
      {error && <p className="form-error">{error}</p>}
      <Button type="submit">{t('accounts.save')}</Button>
    </form>
  );
}

function TransferForm({ accounts, onSubmit }) {
  const { t } = useTranslation();
  const [state, setState] = useState({ from: accounts[0]?.id ?? '', to: accounts[1]?.id ?? '', amount: '', fee: '', date: new Date().toISOString().slice(0, 10), note: '' });
  const [error, setError] = useState(null);
  const source = accounts.find((account) => account.id === state.from);

  const submit = (event) => {
    event.preventDefault();
    const accountCurrency = source?.currency ?? 'DZD';
    const value = toMinorUnits(state.amount, accountCurrency);
    const fee = state.fee.trim() === '' ? null : toMinorUnits(state.fee, accountCurrency);
    if (value === null || (state.fee.trim() !== '' && fee === null)) {
      setError(t('accounts.errors.amount'));
      return;
    }
    setError(null);
    onSubmit({ fromAccountId: state.from, toAccountId: state.to, value, fee, occurredAt: new Date(state.date).toISOString(), note: state.note.trim() || null });
  };

  return (
    <form className="accounts-form" onSubmit={submit}>
      <p className="fin-hint">{t('accounts.transferHint')}</p>
      {['from', 'to'].map((side) => (
        <div className="fin-field" key={side}>
          <label htmlFor={`transfer-${side}`}>{t(`accounts.fields.${side}`)}</label>
          <select id={`transfer-${side}`} value={state[side]} onChange={(event) => setState({ ...state, [side]: event.target.value })}>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.label} ({account.currency})
              </option>
            ))}
          </select>
        </div>
      ))}
      <div className="fin-field">
        <label htmlFor="transfer-amount">{t('accounts.fields.amount')}</label>
        <input id="transfer-amount" inputMode="decimal" value={state.amount} required onChange={(event) => setState({ ...state, amount: event.target.value })} aria-invalid={Boolean(error)} />
      </div>
      <div className="fin-field">
        <label htmlFor="transfer-fee">{t('accounts.fields.fee')}</label>
        <input id="transfer-fee" inputMode="decimal" value={state.fee} onChange={(event) => setState({ ...state, fee: event.target.value })} />
        <p className="fin-hint">{t('accounts.feeHint')}</p>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="fin-field">
        <label htmlFor="transfer-date">{t('accounts.fields.date')}</label>
        <input id="transfer-date" type="date" value={state.date} required onChange={(event) => setState({ ...state, date: event.target.value })} />
      </div>
      <div className="fin-field">
        <label htmlFor="transfer-note">{t('accounts.fields.note')}</label>
        <input id="transfer-note" value={state.note} maxLength={300} onChange={(event) => setState({ ...state, note: event.target.value })} />
      </div>
      <Button type="submit" disabled={state.from === state.to}>
        {t('accounts.transfer')}
      </Button>
    </form>
  );
}
