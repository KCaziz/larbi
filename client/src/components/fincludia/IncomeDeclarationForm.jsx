import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatAmount, formatDate } from '../../lib/format.js';
import { fromMinorUnits, toMinorUnits } from '../../lib/money.js';
import Button from '../ui/Button.jsx';
import AmountField from './AmountField.jsx';

const FREQUENCIES = ['mensuel', 'hebdomadaire', 'trimestriel', 'semestriel', 'annuel'];
const CASH_TYPE = 'AC-01';
const todayKey = () => new Date().toISOString().slice(0, 10);

// Declaring an income, the same way everywhere (recette R11-13): « Revenus »
// and « Premiers pas » both use this form. Four questions in order — what,
// on which account, when, and what happens to the next payments — and, at the
// end, one sentence saying exactly what will happen: whether this payment is
// added to the account, already counted, or asked in « Aujourd'hui ». The
// income, its date and its account are one declaration, never three.
//
// onSubmit receives { label, categoryId, value, currency, frequency, accountId,
// nextDate, received (false | true | 'included'), autoCredit, startDate }.
export default function IncomeDeclarationForm({ currency, accounts = [], income = null, categories = null, onSubmit, submitLabel, newAccountLink = null }) {
  const { t, i18n } = useTranslation();
  const own = accounts.filter((account) => !account.archivedAt && !account.liability && account.currency === currency);
  const firstBank = own.find((account) => account.type !== CASH_TYPE) ?? null;
  const [state, setState] = useState(() => ({
    label: income?.label ?? '',
    categoryId: income?.categoryId ?? '',
    amount: income ? fromMinorUnits(income.value, income.currency) : '',
    frequency: income?.frequency ?? 'mensuel',
    accountId: income ? (income.versement?.accountId ?? '') : (firstBank?.id ?? ''),
    date: (income?.versement?.nextDate ? new Date(income.versement.nextDate) : new Date()).toISOString().slice(0, 10),
    endDate: income?.endDate ? new Date(income.endDate).toISOString().slice(0, 10) : '',
    arrived: null, // 'included' | 'add' | 'notYet' — asked only for a new income whose date has come
    autoCredit: income?.versement?.creationMode === 'auto_real',
  }));
  const [error, setError] = useState(null);
  const set = (patch) => setState((current) => ({ ...current, ...patch }));

  const account = own.find((row) => row.id === state.accountId) ?? null;
  const accountName = account?.label ?? t('incomeForm.cash');
  const snapshot = account?.solde?.entrees_snapshot ?? {};
  const opening = Number(snapshot.solde_initial ?? account?.openingBalance ?? 0);
  const openedOn = snapshot.date_solde_initial ?? account?.openingDate ?? null;
  const asksArrival = !income && state.date <= todayKey();
  const value = toMinorUnits(state.amount, currency);
  const dateText = formatDate(i18n.language, `${state.date}T12:00:00.000Z`);

  const submit = (event) => {
    event.preventDefault();
    if (value === null) {
      setError(t('accounts.errors.amount'));
      return;
    }
    if (asksArrival && !state.arrived) {
      setError(t('incomeForm.needArrived', { date: dateText }));
      return;
    }
    setError(null);
    const nextDate = new Date(`${state.date}T00:00:00.000Z`).toISOString();
    const received = !asksArrival ? false : state.arrived === 'included' ? 'included' : state.arrived === 'add';
    onSubmit({
      label: state.label.trim(),
      categoryId: state.categoryId || null,
      value,
      currency,
      frequency: state.frequency,
      accountId: state.accountId || null,
      nextDate,
      received,
      autoCredit: state.autoCredit,
      endDate: state.endDate ? new Date(`${state.endDate}T00:00:00.000Z`).toISOString() : null,
      // The resource counts from its first payment, or from today when that is ahead.
      startDate: income?.startDate ?? (state.date <= todayKey() ? nextDate : new Date(`${todayKey()}T00:00:00.000Z`).toISOString()),
    });
  };

  // The sentence that says what will happen, built from the answers.
  const summary = [];
  if (value !== null && state.label.trim()) {
    summary.push(t('incomeForm.summary.base', { label: state.label.trim(), amount: formatAmount(i18n.language, value, currency), frequency: t(`calendar.frequencies.${state.frequency}`, state.frequency), account: accountName }));
  }
  if (asksArrival && state.arrived) summary.push(t(`incomeForm.summary.${state.arrived}`, { date: dateText, account: accountName }));
  else if (!asksArrival) summary.push(t(state.autoCredit ? 'incomeForm.summary.futureAuto' : 'incomeForm.summary.futureConfirm', { date: dateText, account: accountName }));
  summary.push(t(state.autoCredit ? 'incomeForm.summary.nextAuto' : 'incomeForm.summary.nextConfirm', { account: accountName }));

  const id = (name) => `income-${income?.id ?? 'new'}-${name}`;
  return (
    <form className="income-declaration" onSubmit={submit}>
      <fieldset>
        <legend>{t('incomeForm.what')}</legend>
        <div className="fin-field">
          <label htmlFor={id('label')}>{t('firstSteps.income.label')}</label>
          <input id={id('label')} value={state.label} maxLength={80} required onChange={(event) => set({ label: event.target.value })} />
        </div>
        {categories && (
          <div className="fin-field">
            <label htmlFor={id('category')}>{t('myMoney.category')}</label>
            <select id={id('category')} value={state.categoryId} onChange={(event) => set({ categoryId: event.target.value })}>
              <option value="">{t('myMoney.noCategory')}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.star ? '★ ' : ''}
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        )}
        <AmountField id={id('amount')} label={t('firstSteps.income.amount')} value={state.amount} currency={currency} onChange={(amount) => set({ amount })} required />
        <div className="fin-field">
          <label htmlFor={id('frequency')}>{t('calendar.fields.frequency')}</label>
          <select id={id('frequency')} value={state.frequency} onChange={(event) => set({ frequency: event.target.value })}>
            {FREQUENCIES.map((option) => (
              <option key={option} value={option}>
                {t(`calendar.frequencies.${option}`, option)}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <fieldset>
        <legend>{t('incomeForm.where')}</legend>
        <div className="fin-field">
          <label htmlFor={id('account')}>{t('firstSteps.income.account')}</label>
          <select id={id('account')} value={state.accountId} onChange={(event) => set({ accountId: event.target.value })}>
            <option value="">{t('movements.defaultAccount')}</option>
            {own.map((row) => (
              <option key={row.id} value={row.id}>
                {row.label}
              </option>
            ))}
          </select>
          {account && opening > 0 && <p className="fin-hint">{t('incomeForm.opening', { account: account.label, amount: formatAmount(i18n.language, opening, currency), date: openedOn ? formatDate(i18n.language, openedOn) : '' })}</p>}
          {own.length === 0 && newAccountLink && (
            <p className="fin-hint">
              {t('firstSteps.income.noAccount')} <Link to={newAccountLink}>{t('accounts.add')}</Link>
            </p>
          )}
        </div>
      </fieldset>

      <fieldset>
        <legend>{t('incomeForm.when')}</legend>
        <div className="fin-field">
          <label htmlFor={id('date')}>{income ? t('firstSteps.income.nextDate') : t('incomeForm.date')}</label>
          <input id={id('date')} type="date" value={state.date} required onChange={(event) => set({ date: event.target.value, arrived: null })} />
          {!income && <p className="fin-hint">{t('incomeForm.dateHint')}</p>}
        </div>
        <div className="fin-field">
          <label htmlFor={id('end')}>{t('incomes.endDate')}</label>
          <input id={id('end')} type="date" value={state.endDate} min={state.date} onChange={(event) => set({ endDate: event.target.value })} />
        </div>
        {asksArrival && (
          <div className="income-declaration-choices" role="radiogroup" aria-label={t('incomeForm.thisPayment', { date: dateText })}>
            <p className="income-declaration-question">{t('incomeForm.thisPayment', { date: dateText })}</p>
            {['included', 'add', 'notYet'].map((choice) => (
              <label key={choice} className="money-check" htmlFor={id(`arrived-${choice}`)}>
                <input id={id(`arrived-${choice}`)} type="radio" name={id('arrived')} checked={state.arrived === choice} onChange={() => set({ arrived: choice })} />
                {t(`incomeForm.arrived.${choice}`, { account: accountName })}
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <fieldset>
        <legend>{t('incomeForm.next')}</legend>
        <label className="money-check" htmlFor={id('next-confirm')}>
          <input id={id('next-confirm')} type="radio" name={id('next')} checked={!state.autoCredit} onChange={() => set({ autoCredit: false })} />
          {t('incomeForm.nextConfirm')}
        </label>
        <label className="money-check" htmlFor={id('next-auto')}>
          <input id={id('next-auto')} type="radio" name={id('next')} checked={state.autoCredit} onChange={() => set({ autoCredit: true })} />
          {t('incomeForm.nextAuto')}
        </label>
      </fieldset>

      <section className="income-declaration-summary" aria-live="polite">
        <h3>{t('incomeForm.summaryTitle')}</h3>
        {summary.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </section>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <Button type="submit">{submitLabel ?? t('accounts.save')}</Button>
    </form>
  );
}
