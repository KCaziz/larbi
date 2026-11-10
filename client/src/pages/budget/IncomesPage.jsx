import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Archive, ArchiveRestore, Pencil, Plus, Trash2, Wallet } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { formatAmount, formatDate } from '../../lib/format.js';
import { fromMinorUnits, toMinorUnits } from '../../lib/money.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import AmountField from '../../components/fincludia/AmountField.jsx';
import BarList from '../../components/fincludia/charts/BarList.jsx';
import '../../components/fincludia/Fincludia.css';
import '../comptes/Accounts.css';

// « Revenus prévus » (P8-24): the incomes the person declared, the base of the
// budget's « reste à allouer » (PB-F009). They were only created by « Premiers
// pas » and by the payslip, and nothing listed, corrected or archived them.
// A declared income is what is EXPECTED: it never changes a balance (only a
// confirmed occurrence does, from the calendar).
const FREQUENCIES = ['mensuel', 'hebdomadaire', 'trimestriel', 'semestriel', 'annuel'];

export default function IncomesPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const currency = user?.finCurrency ?? 'DZD';
  useDocumentMeta(t('incomes.title'), t('incomes.intro'));
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState(null); // an income, or 'new'
  const [message, setMessage] = useState(null);
  const list = useApi(`/fin/revenus${showArchived ? '?includeArchived=true' : ''}`);
  // Recette R10-05: the account each income comes in on.
  const accounts = useApi('/fin/comptes');
  const ownAccounts = (accounts.data?.accounts ?? []).filter((account) => !account.archivedAt && !account.liability);

  async function run(action, okKey) {
    setMessage(null);
    try {
      await action();
      setMessage({ kind: 'ok', text: t(okKey) });
      setEditing(null);
      list.reload();
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 422: 'incomes.errors.refused' })) });
    }
  }

  if (list.status === 'loading' && !list.data) return <LoadingState />;
  if (list.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={list.reload} />;
  const incomes = list.data.incomes;

  return (
    <>
      <PageHeader back={{ to: '/app/budgets', label: t('budget.backToList') }} icon={Wallet} title={t('incomes.title')} subtitle={t('incomes.intro')} maxWidth={760} />
      <div className="fin-page-narrow">
        {message && (
          <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
            {message.text}
          </p>
        )}
        <Notice variant="info">{t('incomes.expectedNote')}</Notice>

        <div className="accounts-actions">
          <Button onClick={() => setEditing(editing === 'new' ? null : 'new')} aria-expanded={editing === 'new'}>
            <Plus size={16} aria-hidden="true" /> {t('incomes.add')}
          </Button>
          <label className="accounts-toggle">
            <input type="checkbox" checked={showArchived} onChange={(event) => setShowArchived(event.target.checked)} />
            {t('accounts.showArchived')}
          </label>
        </div>

        {editing === 'new' && <IncomeForm currency={currency} accounts={ownAccounts} onSubmit={(body) => run(() => api.post('/fin/revenus', body), 'incomes.added')} />}

        {/* The expected income per month by source, one scale for all (F001). */}
        {incomes.filter((income) => !income.archivedAt && income.currency === currency && income.monthlyValue !== null).length >= 2 && (
          <BarList
            caption={t('incomes.sourcesChart')}
            rows={incomes
              .filter((income) => !income.archivedAt && income.currency === currency && income.monthlyValue !== null)
              .map((income) => ({ key: income.id, label: income.label, value: income.monthlyValue }))}
            format={(value) => formatAmount(i18n.language, value, currency)}
          />
        )}
        {incomes.length === 0 ? (
          <p className="fin-hint">{t('incomes.none')}</p>
        ) : (
          <ul className="fin-health-dimensions">
            {incomes.map((income) => (
              <li key={income.id}>
                <span>
                  <strong>{income.label}</strong>
                  <span className="fin-hint">
                    {' '}
                    — {t(`calendar.frequencies.${income.frequency}`, income.frequency)}
                    {income.archivedAt && ` · ${t('accounts.archivedTag')}`}
                  </span>
                  {/* Recette R10-05: where and when it comes in, or that it is not linked yet. */}
                  <span className="fin-hint incomes-versement">
                    {income.versement
                      ? t('incomes.comesIn', {
                          account: ownAccounts.find((account) => account.id === income.versement.accountId)?.label ?? t('movements.defaultAccount'),
                          date: formatDate(i18n.language, income.versement.nextDate),
                        })
                      : t('incomes.notLinked')}
                  </span>
                </span>
                <span>
                  <strong>{formatAmount(i18n.language, income.value, income.currency)}</strong>{' '}
                  <button type="button" className="accounts-link-button" onClick={() => setEditing(editing?.id === income.id ? null : income)} aria-expanded={editing?.id === income.id}>
                    <Pencil size={14} aria-hidden="true" /> {t('accounts.edit')}
                  </button>{' '}
                  <button
                    type="button"
                    className="accounts-link-button"
                    onClick={() => run(() => api.put(`/fin/revenus/${income.id}/archive`, { archived: !income.archivedAt }), income.archivedAt ? 'accounts.restored' : 'accounts.archived')}
                  >
                    {income.archivedAt ? <ArchiveRestore size={14} aria-hidden="true" /> : <Archive size={14} aria-hidden="true" />} {t(income.archivedAt ? 'accounts.restore' : 'accounts.archive')}
                  </button>{' '}
                  <button
                    type="button"
                    className="accounts-link-button accounts-danger"
                    onClick={() => {
                      if (window.confirm(t('incomes.deleteConfirm', { label: income.label }))) run(() => api.delete(`/fin/revenus/${income.id}`, {}), 'incomes.deleted');
                    }}
                  >
                    <Trash2 size={14} aria-hidden="true" /> {t('accounts.delete')}
                  </button>
                </span>
                {editing?.id === income.id && (
                  <IncomeForm key={income.id} currency={income.currency} income={income} accounts={ownAccounts} onSubmit={(body) => run(() => api.patch(`/fin/revenus/${income.id}`, body), 'incomes.saved')} />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function IncomeForm({ currency, income = null, accounts = [], onSubmit }) {
  const { t } = useTranslation();
  const [state, setState] = useState(() => ({
    label: income?.label ?? '',
    amount: income ? fromMinorUnits(income.value, income.currency) : '',
    frequency: income?.frequency ?? 'mensuel',
    startDate: (income?.startDate ? new Date(income.startDate) : new Date()).toISOString().slice(0, 10),
    endDate: income?.endDate ? new Date(income.endDate).toISOString().slice(0, 10) : '',
    // Recette R10-05: the account it comes in on, and its next payment.
    accountId: income?.versement?.accountId ?? '',
    nextDate: (income?.versement?.nextDate ? new Date(income.versement.nextDate) : new Date()).toISOString().slice(0, 10),
    received: false,
  }));
  const [error, setError] = useState(null);
  const set = (name) => (event) => setState({ ...state, [name]: event.target.value });

  const submit = (event) => {
    event.preventDefault();
    const value = toMinorUnits(state.amount, currency);
    if (value === null) {
      setError(t('accounts.errors.amount'));
      return;
    }
    setError(null);
    const base = {
      label: state.label.trim(),
      value,
      frequency: state.frequency,
      startDate: new Date(`${state.startDate}T00:00:00.000Z`).toISOString(),
      endDate: state.endDate ? new Date(`${state.endDate}T00:00:00.000Z`).toISOString() : null,
    };
    const link = { accountId: state.accountId || null, nextDate: new Date(`${state.nextDate}T00:00:00.000Z`).toISOString() };
    onSubmit(income ? { ...base, ...link } : { ...base, ...link, currency, received: state.received });
  };

  return (
    <form className="accounts-form" onSubmit={submit}>
      <div className="fin-field">
        <label htmlFor="income-form-label">{t('firstSteps.income.label')}</label>
        <input id="income-form-label" value={state.label} maxLength={80} required onChange={set('label')} />
      </div>
      <AmountField id="income-form-amount" label={t('firstSteps.income.amount')} value={state.amount} currency={currency} onChange={(amount) => setState({ ...state, amount })} required />
      {error && <p className="form-error">{error}</p>}
      <div className="fin-field">
        <label htmlFor="income-form-frequency">{t('calendar.fields.frequency')}</label>
        <select id="income-form-frequency" value={state.frequency} onChange={set('frequency')}>
          {FREQUENCIES.map((option) => (
            <option key={option} value={option}>
              {t(`calendar.frequencies.${option}`, option)}
            </option>
          ))}
        </select>
      </div>
      <div className="fin-field">
        <label htmlFor="income-form-start">{t('incomes.startDate')}</label>
        <input id="income-form-start" type="date" value={state.startDate} required onChange={set('startDate')} />
      </div>
      <div className="fin-field">
        <label htmlFor="income-form-end">{t('incomes.endDate')}</label>
        <input id="income-form-end" type="date" value={state.endDate} onChange={set('endDate')} />
      </div>
      <div className="fin-field">
        <label htmlFor="income-form-account">{t('firstSteps.income.account')}</label>
        <select id="income-form-account" value={state.accountId} onChange={set('accountId')}>
          <option value="">{t('movements.defaultAccount')}</option>
          {accounts
            .filter((account) => account.currency === currency)
            .map((account) => (
              <option key={account.id} value={account.id}>
                {account.label}
              </option>
            ))}
        </select>
      </div>
      <div className="fin-field">
        <label htmlFor="income-form-next">{t('firstSteps.income.nextDate')}</label>
        <input id="income-form-next" type="date" value={state.nextDate} required onChange={set('nextDate')} />
      </div>
      {!income && state.nextDate <= new Date().toISOString().slice(0, 10) && (
        <label className="money-check" htmlFor="income-form-received">
          <input id="income-form-received" type="checkbox" checked={state.received} onChange={(event) => setState({ ...state, received: event.target.checked })} />
          {t('firstSteps.income.received')}
        </label>
      )}
      <p className="fin-hint">{t('incomes.linkHint')}</p>
      <Button type="submit">{t('accounts.save')}</Button>
    </form>
  );
}
