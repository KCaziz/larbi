import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Archive, ArchiveRestore, ChevronDown, ChevronUp, Landmark, Plus, Trash2 } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { formatDate } from '../../lib/format.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import AdultOnly from '../../components/fincludia/AdultOnly.jsx';
import { adultRefusalReason, isAdultRefusal } from '../../lib/adultRefusal.js';
import LoadingState from '../../components/ui/LoadingState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import AmountField from '../../components/fincludia/AmountField.jsx';
import { toMinorUnits } from '../../lib/money.js';
import '../../components/fincludia/Fincludia.css';
import './Debts.css';

// Debts (P6-10), screens C13-C14. The "qualification productive / neutre /
// sous pression" the client asks for is deliberately absent: its thresholds
// are still "à valider" (P6-01 point 5), so only the raw indicators are shown.
export default function DebtsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [showArchived, setShowArchived] = useState(false);
  const [creating, setCreating] = useState(false);
  // « J'ai prêté » / « On m'a prêté » (P8-13, D-01 / D-02).
  const [loan, setLoan] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [message, setMessage] = useState(null);
  useDocumentMeta(t('debts.title'), t('debts.intro'));

  const currency = user?.finCurrency ?? 'DZD';
  const debts = useApi(`/fin/debts${showArchived ? '?includeArchived=true' : ''}`);
  const references = useApi('/fin/debts/references');
  const comparison = useApi(showComparison ? `/fin/debts/comparaison?currency=${currency}` : null);
  const accounts = useApi('/fin/comptes');
  const formulas = useMemo(() => new Map((references.data?.formulas ?? []).map((formula) => [formula.id, formula])), [references.data]);

  async function run(action, okKey) {
    setMessage(null);
    try {
      await action();
      setMessage({ kind: 'ok', text: t(okKey) });
      debts.reload();
      return { ok: true };
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 422: 'debts.errors.refused' })) });
      return { ok: false };
    }
  }

  if (debts.status === 'loading' && !debts.data) return <LoadingState />;
  // A refusal reserved to 18+ is not a failed load: retrying cannot help,
  // and the person needs to know whether there is anything to fix.
  if (isAdultRefusal(debts.error)) return <AdultOnly reason={adultRefusalReason(debts.error)} />;
  if (debts.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={debts.reload} />;

  const { debts: list, synthese } = debts.data;
  const owed = list.filter((debt) => debt.direction !== 'lent');
  const lent = list.filter((debt) => debt.direction === 'lent');

  return (
    <>
      <PageHeader icon={Landmark} title={t('debts.title')} subtitle={t('debts.intro')} maxWidth={1040} />
      <div className="debts-page">
        {message && (
          <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
            {message.text}
          </p>
        )}

        <div className="fin-figure-grid">
          <FigureCard label={t('debts.monthlyService')} answer={synthese.serviceMenuel} formula={formulas.get('F017')} />
          {synthese.tauxEffort && <FigureCard label={t('debts.effortRate')} answer={synthese.tauxEffort} formula={formulas.get('F018')} />}
          {/* Outstanding (C13, in red): what I owe, and apart what is owed to me. */}
          <div className="fin-figure">
            <h3 className="fin-figure-label">{t('debts.outstanding')}</h3>
            <p className="fin-figure-value">{formatAmount(i18n.language, synthese.encours, currency)}</p>
          </div>
          <FigureCard label={t('debts.debtToIncome')} answer={synthese.detteRevenuAnnuel} formula={formulas.get('F019')} />
        </div>
        {synthese.avertissements.map((warning, index) => (
          <p key={index} className="fin-hint">
            {warning}
          </p>
        ))}

        <div className="debts-toolbar">
          <label className="debts-check" htmlFor="debts-archived">
            <input id="debts-archived" type="checkbox" checked={showArchived} onChange={(event) => setShowArchived(event.target.checked)} />
            {t('debts.showArchived')}
          </label>
          <button type="button" className="debts-plain" onClick={() => setShowComparison((v) => !v)}>
            {t('debts.compareStrategies')}
          </button>
          <Button variant="secondary" onClick={() => setLoan(loan === 'lent' ? null : 'lent')} aria-expanded={loan === 'lent'}>
            {t('debts.loans.lent')}
          </Button>
          <Button variant="secondary" onClick={() => setLoan(loan === 'borrowed' ? null : 'borrowed')} aria-expanded={loan === 'borrowed'}>
            {t('debts.loans.borrowed')}
          </Button>
          <Button onClick={() => setCreating((v) => !v)}>
            <Plus size={16} aria-hidden="true" /> {t('debts.create')}
          </Button>
        </div>

        {loan && <LoanForm direction={loan} accounts={accounts.data?.accounts ?? []} run={(action, key) => run(action, key).then((res) => (res.ok && setLoan(null), res))} />}

        {showComparison && (
          <div className="debts-comparison">
            <p className="debts-comparison-intro">{t('debts.compareIntro')}</p>
            {comparison.status === 'loading' && !comparison.data && <LoadingState />}
            {comparison.data && comparison.data.avalanche ? (
              <div className="debts-comparison-cols">
                <PayoffPlan title={t('debts.avalanche')} plan={comparison.data.avalanche} currency={currency} />
                <PayoffPlan title={t('debts.snowball')} plan={comparison.data.bouleDeNeige} currency={currency} />
              </div>
            ) : (
              comparison.data && (
                <Notice variant="action-needed">
                  {comparison.data.avertissements.map((warning, index) => (
                    <p key={index}>{warning}</p>
                  ))}
                </Notice>
              )
            )}
          </div>
        )}

        {creating && (
          <CreateDebtForm
            defaultCurrency={currency}
            onDone={() => {
              setCreating(false);
              debts.reload();
            }}
            onCancel={() => setCreating(false)}
          />
        )}

        {owed.length === 0 ? (
          <Notice variant="info">{t('debts.none')}</Notice>
        ) : (
          <ul className="debts-list">
            {owed.map((debt) => (
              <DebtRow key={debt.id} debt={debt} accounts={accounts.data?.accounts ?? []} run={run} />
            ))}
          </ul>
        )}

        {/* Receivables (D-01): money owed TO me — always apart from debts. */}
        {lent.length > 0 && (
          <section aria-labelledby="debts-receivables">
            <h2 id="debts-receivables">{t('debts.receivables', { amount: formatAmount(i18n.language, synthese.creances?.encours ?? 0, currency) })}</h2>
            <ul className="debts-list">
              {lent.map((debt) => (
                <DebtRow key={debt.id} debt={debt} accounts={accounts.data?.accounts ?? []} run={run} />
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}

function PayoffPlan({ title, plan, currency }) {
  const { t, i18n } = useTranslation();
  const result = plan.resultat;
  return (
    <div className="debts-plan">
      <h3>{title}</h3>
      {!result || !result.completed ? (
        <p className="fin-hint">{t('debts.notPayable')}</p>
      ) : (
        <p>{t('debts.payoffSummary', { months: result.months, interest: formatAmount(i18n.language, result.totalInterest, currency) })}</p>
      )}
    </div>
  );
}

function formatAmount(language, amount, currency) {
  try {
    return new Intl.NumberFormat(language === 'tzm' ? 'fr' : language, { style: 'currency', currency }).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(2)} ${currency}`;
  }
}

function DebtRow({ debt, accounts, run }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const usable = accounts.filter((account) => !account.archivedAt && !account.liability && account.currency === debt.currency && account.id !== debt.accountId && account.type !== 'AC-09');
  const [paymentAccount, setPaymentAccount] = useState(usable[0]?.id ?? '');

  const pay = (event) => {
    event.preventDefault();
    const amount = toMinorUnits(paymentAmount, debt.currency);
    if (amount === null) return;
    const body = { amount, currency: debt.currency, paidAt: new Date().toISOString(), ...(debt.accountId && paymentAccount ? { accountId: paymentAccount } : {}) };
    run(() => api.post(`/fin/debts/${debt.id}/paiements`, body), 'debts.paymentRecorded').then((res) => {
      if (res.ok) setPaymentAmount('');
    });
  };

  return (
    <li className={debt.archivedAt ? 'debts-row debts-row-archived' : 'debts-row'}>
      <button type="button" className="debts-row-head" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className="debts-row-title">
          <strong>{debt.label}</strong>
          {debt.lender && <span className="debts-row-tag">{debt.lender}</span>}
          {debt.dueDate && <span className="debts-row-tag">{formatDate(i18n.language, debt.dueDate)}</span>}
        </span>
        <span className="debts-row-amount">{formatAmount(i18n.language, debt.outstandingPrincipal, debt.currency)}</span>
        {open ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
      </button>

      {open && (
        <div className="debts-row-body">
          <p className="debts-detail-line">{t('debts.instalmentLine', { amount: formatAmount(i18n.language, debt.monthlyInstalment, debt.currency) })}</p>
          {debt.purpose && <p className="debts-detail-line">{debt.purpose}</p>}

          <form className="debts-payment-form" onSubmit={pay}>
            <AmountField
              id={`debt-pay-${debt.id}`}
              label={t(debt.direction === 'lent' ? 'debts.recordRepaymentReceived' : 'debts.recordPayment')}
              value={paymentAmount}
              currency={debt.currency}
              onChange={setPaymentAmount}
              required
            />
            {/* On its own account, a payment is a real transfer (P8-13). */}
            {debt.accountId && usable.length > 0 && (
              <div className="fin-field">
                <label htmlFor={`debt-account-${debt.id}`}>{t(debt.direction === 'lent' ? 'debts.toAccount' : 'debts.fromAccount')}</label>
                <select id={`debt-account-${debt.id}`} value={paymentAccount} onChange={(event) => setPaymentAccount(event.target.value)}>
                  {usable.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <Button type="submit" variant="secondary">
              {t('debts.pay')}
            </Button>
          </form>

          <div className="debts-row-actions">
            <button
              type="button"
              className="debts-icon"
              title={debt.archivedAt ? t('debts.restore') : t('debts.archive')}
              onClick={() => run(() => api.put(`/fin/debts/${debt.id}/archive`, { archived: !debt.archivedAt }), debt.archivedAt ? 'debts.restored' : 'debts.archived')}
            >
              {debt.archivedAt ? <ArchiveRestore size={15} aria-hidden="true" /> : <Archive size={15} aria-hidden="true" />}
              <span className="sr-only">{debt.archivedAt ? t('debts.restore') : t('debts.archive')}</span>
            </button>
            <button
              type="button"
              className="debts-icon"
              title={t('debts.delete')}
              onClick={() => {
                if (window.confirm(t('debts.deleteConfirm', { label: debt.label }))) run(() => api.delete(`/fin/debts/${debt.id}`), 'debts.deleted');
              }}
            >
              <Trash2 size={15} aria-hidden="true" />
              <span className="sr-only">{t('debts.delete')}</span>
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

// « J'ai prêté » (D-01) or « On m'a prêté » (D-02): the money really moves the
// day it happens, between the person's account and the loan's own account.
function LoanForm({ direction, accounts, run }) {
  const { t } = useTranslation();
  const usable = accounts.filter((account) => !account.archivedAt && !account.liability && account.type !== 'AC-09');
  const [state, setState] = useState({ counterparty: '', accountId: usable[0]?.id ?? '', amount: '', date: new Date().toISOString().slice(0, 10), dueDate: '' });
  const account = usable.find((row) => row.id === state.accountId);
  if (usable.length === 0) return <p className="fin-hint">{t('debts.loans.noAccount')}</p>;
  const submit = (event) => {
    event.preventDefault();
    const value = toMinorUnits(state.amount, account?.currency ?? 'DZD');
    if (value === null) return;
    run(
      () =>
        api.post('/fin/debts/pret', {
          direction,
          counterparty: state.counterparty.trim(),
          accountId: state.accountId,
          value,
          occurredAt: new Date(`${state.date}T12:00:00.000Z`).toISOString(),
          dueDate: state.dueDate ? new Date(state.dueDate).toISOString() : null,
        }),
      'debts.loans.saved',
    );
  };
  return (
    <form className="debts-create-form" onSubmit={submit}>
      <h2>{t(`debts.loans.${direction}`)}</h2>
      <p className="fin-hint">{t(`debts.loans.${direction}Hint`)}</p>
      <div className="fin-field">
        <label htmlFor="loan-who">{t(`debts.loans.${direction}Who`)}</label>
        <input id="loan-who" value={state.counterparty} maxLength={60} required onChange={(event) => setState({ ...state, counterparty: event.target.value })} />
      </div>
      <div className="fin-field">
        <label htmlFor="loan-account">{t(direction === 'lent' ? 'debts.fromAccount' : 'debts.toAccount')}</label>
        <select id="loan-account" value={state.accountId} onChange={(event) => setState({ ...state, accountId: event.target.value })}>
          {usable.map((row) => (
            <option key={row.id} value={row.id}>
              {row.label}
            </option>
          ))}
        </select>
      </div>
      <AmountField id="loan-amount" label={t('debts.loans.amount')} value={state.amount} currency={account?.currency ?? 'DZD'} onChange={(amount) => setState({ ...state, amount })} required />
      <div className="fin-field">
        <label htmlFor="loan-date">{t('myMoney.date')}</label>
        <input id="loan-date" type="date" value={state.date} max={new Date().toISOString().slice(0, 10)} onChange={(event) => setState({ ...state, date: event.target.value })} />
      </div>
      <div className="fin-field">
        <label htmlFor="loan-due">{t('debts.loans.dueDate')}</label>
        <input id="loan-due" type="date" value={state.dueDate} onChange={(event) => setState({ ...state, dueDate: event.target.value })} />
      </div>
      <Button type="submit">{t('debts.save')}</Button>
    </form>
  );
}

function CreateDebtForm({ defaultCurrency, onDone, onCancel }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ label: '', lender: '', outstandingPrincipal: '', monthlyInstalment: '', rate: '', dueDate: '' });
  const [error, setError] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    const outstandingPrincipal = toMinorUnits(form.outstandingPrincipal, defaultCurrency);
    const monthlyInstalment = toMinorUnits(form.monthlyInstalment, defaultCurrency);
    if (outstandingPrincipal === null || monthlyInstalment === null) return;
    try {
      await api.post('/fin/debts', {
        label: form.label.trim(),
        lender: form.lender.trim() || null,
        outstandingPrincipal,
        monthlyInstalment,
        currency: defaultCurrency,
        rate: form.rate ? Number(form.rate) / 100 : null,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      });
      onDone();
    } catch (err) {
      setError(t(errorKey(err, { 422: 'debts.errors.refused' })));
    }
  };

  return (
    <form className="debts-create-form" onSubmit={submit}>
      <h2>{t('debts.createTitle')}</h2>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="debts-create-grid">
        <div className="fin-field">
          <label htmlFor="new-debt-label">{t('debts.label')}</label>
          <input id="new-debt-label" value={form.label} maxLength={80} required onChange={(event) => setForm({ ...form, label: event.target.value })} />
        </div>
        <div className="fin-field">
          <label htmlFor="new-debt-lender">{t('debts.lender')}</label>
          <input id="new-debt-lender" value={form.lender} maxLength={120} onChange={(event) => setForm({ ...form, lender: event.target.value })} />
        </div>
        <AmountField id="new-debt-principal" label={t('debts.outstandingPrincipal')} value={form.outstandingPrincipal} currency={defaultCurrency} onChange={(v) => setForm({ ...form, outstandingPrincipal: v })} required />
        <AmountField id="new-debt-instalment" label={t('debts.monthlyInstalment')} value={form.monthlyInstalment} currency={defaultCurrency} onChange={(v) => setForm({ ...form, monthlyInstalment: v })} required />
        <div className="fin-field">
          <label htmlFor="new-debt-rate">{t('debts.rate')}</label>
          <input id="new-debt-rate" type="number" step="0.1" min="0" max="100" value={form.rate} onChange={(event) => setForm({ ...form, rate: event.target.value })} />
          <p className="fin-hint">{t('debts.rateHint')}</p>
        </div>
        <div className="fin-field">
          <label htmlFor="new-debt-due">{t('debts.dueDate')}</label>
          <input id="new-debt-due" type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
        </div>
      </div>
      <div className="debts-create-actions">
        <Button type="submit">{t('debts.save')}</Button>
        <button type="button" className="debts-plain" onClick={onCancel}>
          {t('debts.cancel')}
        </button>
      </div>
    </form>
  );
}
