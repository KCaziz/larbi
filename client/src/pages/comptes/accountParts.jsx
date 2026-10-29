import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../lib/useApi.js';
import { formatAmount } from '../../lib/format.js';
import { fromMinorUnits, toMinorUnits } from '../../lib/money.js';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';

// The pieces of « Mes comptes » that the list, the detail, the form and the
// transfer screens share (P8-25: each screen of the client at its own
// address, COM-02 to COM-04).

// COM-03: the balance at the end of each of the last six months, as a list
// that reads without the chart (and a bar beside each value for the eye).
export function BalanceHistory({ account }) {
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

export function AccountForm({ types, currency, initial, onSubmit }) {
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
export function AccountEditForm({ account, onSubmit }) {
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

export function TransferForm({ accounts, onSubmit }) {
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
