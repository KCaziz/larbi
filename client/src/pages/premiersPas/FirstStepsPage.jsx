import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Check, Rocket } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { toMinorUnits } from '../../lib/money.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import AmountField from '../../components/fincludia/AmountField.jsx';
import '../../components/fincludia/Fincludia.css';
import './FirstSteps.css';

// « Premiers pas » (P8-23, tab 02_Premier_Demarrage, PB-PR-03): eight steps,
// each optional except the first, in any order, resumed later. A step is done
// when its data exists; setting one aside never blocks anything, and what is
// not filled in stays « non calculé ».
//
// The steps that have their own screen (accounts, movements, budgets, goals,
// debts) lead to it rather than repeating its form: one form per thing.
const LINKS = {
  P3: '/app/comptes/nouveau',
  P4: '/app/mouvements/nouveau',
  P5: '/app/budgets/nouveau',
  P6: '/app/objectifs/nouveau',
  P7: '/app/dettes',
};

// ONB-01 « Profil éducatif » and ONB-02 « Premier revenu » each have their own
// address, for a link from elsewhere (the Accueil, the assistant, an email).
const PAGES = {
  P0: '/app/parametres/premiers-pas/profil',
  P1: '/app/parametres/premiers-pas/premier-revenu',
};

// The profile labels the categories' « Suggéré pour » column is written in.
const SUGGEST_LABEL = { LYC: 'Lycéen', ETU: 'Étudiant', JAC: 'Jeune actif', SAL: 'Salarié' };

export default function FirstStepsPage() {
  const { t } = useTranslation();
  useDocumentMeta(t('firstSteps.title'), t('firstSteps.intro'));
  const state = useApi('/fin/premiers-pas');
  const [message, setMessage] = useState(null);
  // A step saved on its own page (ONB-01, ONB-02) comes back here and says so.
  const saved = useLocation().state?.message ?? null;

  async function run(action) {
    setMessage(null);
    try {
      await action();
      state.reload();
      return true;
    } catch (err) {
      setMessage(t(errorKey(err, { 422: 'firstSteps.errors.refused', 403: 'account.fin.consentRequired' })));
      return false;
    }
  }

  if (state.status === 'loading' && !state.data) return <LoadingState />;
  if (state.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={state.reload} />;

  const { steps, next, salary, currency } = state.data;
  const setAside = (step, skipped) => run(() => api.put('/fin/premiers-pas/etape', { step, skipped }));

  return (
    <>
      <PageHeader icon={Rocket} title={t('firstSteps.title')} subtitle={t('firstSteps.intro')} maxWidth={760} />
      <div className="fin-page-narrow">
        {message && (
          <p className="form-error" role="alert">
            {message}
          </p>
        )}
        {saved && (
          <p className="form-status" role="status">
            {saved}
          </p>
        )}
        <Notice variant="info">{t('firstSteps.freedom')}</Notice>

        <ol className="steps-list">
          {steps.map((step) => (
            <li key={step.key} className={`steps-item${step.done ? ' steps-done' : ''}${next === step.key ? ' steps-next' : ''}`}>
              <div className="steps-head">
                <span className="steps-mark" aria-hidden="true">
                  {step.done ? <Check size={16} /> : step.key}
                </span>
                <h2>{t(`firstSteps.steps.${step.key}.title`)}</h2>
                <span className="steps-status">
                  {step.done ? t('firstSteps.done') : step.skipped ? t('firstSteps.skipped') : next === step.key ? t('firstSteps.next') : t('firstSteps.todo')}
                </span>
              </div>
              <p className="fin-hint">{t(`firstSteps.steps.${step.key}.hint`)}</p>

              {step.key === 'P0' && <ProfileStep done={step.done} run={run} />}
              {step.key === 'P1' && !step.done && <IncomeStep currency={currency} run={run} />}
              {/* ONB-01 and ONB-02 also have an address of their own (P8-24). */}
              {PAGES[step.key] && (
                <Link className="steps-own-page" to={PAGES[step.key]}>
                  {t('firstSteps.ownPage')}
                </Link>
              )}
              {step.key === 'P2' && <SalaryStep key={salary?.id ?? 'none'} salary={salary} currency={currency} run={run} done={step.done} />}
              {LINKS[step.key] && (
                <div className="steps-actions">
                  <Link className="btn btn-secondary" to={LINKS[step.key]}>
                    {t(step.done ? 'firstSteps.addMore' : 'firstSteps.start')}
                  </Link>
                </div>
              )}

              {!step.required && !step.done && (
                <button type="button" className="steps-skip" onClick={() => setAside(step.key, !step.skipped)}>
                  {t(step.skipped ? 'firstSteps.resume' : 'firstSteps.skip')}
                </button>
              )}
            </li>
          ))}
        </ol>

        {steps.find((step) => step.key === 'P1')?.done && (
          <p>
            <Link to="/app/budgets/revenus">{t('incomes.manage')}</Link>
          </p>
        )}
        {steps.find((step) => step.key === 'P1')?.done && <FirstSalaryPlan />}
      </div>
    </>
  );
}

// P0: the educational profile. The full application opens whatever is chosen
// (ARC-02): it only orders what is recommended to learn.
export function ProfileStep({ done, run }) {
  const { t } = useTranslation();
  const profile = useApi('/profile/fin');
  const publics = t('account.fin.publics', { returnObjects: true });
  const [choice, setChoice] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [problem, setProblem] = useState(null);
  if (!profile.data) return null;
  const { consented, finPublic } = profile.data.profile;
  const COLLECTIVE = ['COL', 'COU', 'FAM'];
  const options = (Array.isArray(publics) ? publics : []).filter(({ code }) => !COLLECTIVE.includes(code));

  // What is missing is said in words (recette R9-07): left to the browser's
  // own bubble, an unticked box made « Enregistrer » look like it did nothing.
  const submit = async (event) => {
    event.preventDefault();
    if (!choice) return setProblem(t('firstSteps.profileMissing'));
    if (!consented && !accepted) return setProblem(t('account.fin.consentRequired'));
    setProblem(null);
    await run(() => api.put('/profile/fin', { finPublic: choice, ...(consented ? {} : { acceptConsents: true }) }));
    profile.reload();
    return undefined;
  };

  if (done) return <p className="steps-value">{options.find((option) => option.code === finPublic)?.label ?? finPublic}</p>;
  return (
    <form className="steps-form" onSubmit={submit} noValidate>
      <div className="fin-field">
        <label htmlFor="steps-profile">{t('account.fin.publicLabel')}</label>
        <select id="steps-profile" value={choice} onChange={(event) => setChoice(event.target.value)}>
          <option value="">{t('firstSteps.choose')}</option>
          {options.map(({ code, label }) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
      </div>
      {/* The two points accepted, written above the box that accepts them. */}
      {!consented && (
        <div className="steps-consent">
          <p>{t('account.fin.consentIntro')}</p>
          <ul>
            <li>{t('account.fin.consentPrivacy')}</li>
            <li>{t('account.fin.consentNoAdvice')}</li>
          </ul>
          <label className="money-check" htmlFor="steps-consent">
            <input id="steps-consent" type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
            {t('account.fin.consentAccept')}
          </label>
        </div>
      )}
      {problem && (
        <p className="form-error" role="alert">
          {problem}
        </p>
      )}
      <Button type="submit">{t('firstSteps.save')}</Button>
    </form>
  );
}

// P1: the first income. A lycéen or a student is offered the incomes of their
// category first (grant, family help, student job, paid internship).
export function IncomeStep({ currency, run }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const categories = useApi('/fin/categories');
  const accounts = useApi('/fin/comptes');
  const profile = useApi('/profile/fin');
  const incomeCategories = (categories.data?.groups ?? []).find((group) => group.code === 'income')?.categories ?? [];
  const finPublic = profile.data?.profile?.finPublic ?? null;
  const suggested = (category) => (SUGGEST_LABEL[finPublic] ? category.suggestedFor?.includes(SUGGEST_LABEL[finPublic]) : false);
  const ordered = [...incomeCategories].sort((a, b) => Number(suggested(b)) - Number(suggested(a)));
  const frequencies = ['mensuel', 'hebdomadaire', 'trimestriel', 'semestriel', 'annuel'];
  const [form, setForm] = useState({ label: '', categoryId: '', amount: '', frequency: 'mensuel', nextDate: new Date().toISOString().slice(0, 10), accountId: '', received: true });
  const [error, setError] = useState(null);
  const own = accounts.data?.accounts?.filter((account) => !account.archivedAt && !account.liability && account.currency === currency) ?? [];

  const submit = async (event) => {
    event.preventDefault();
    const value = toMinorUnits(form.amount, currency);
    if (value === null) {
      setError(t('accounts.errors.amount'));
      return;
    }
    setError(null);
    await run(() =>
      api.post('/fin/premiers-pas/revenu', {
        label: form.label.trim(),
        categoryId: form.categoryId || null,
        value,
        currency,
        frequency: form.frequency,
        nextDate: new Date(`${form.nextDate}T00:00:00.000Z`).toISOString(),
        accountId: form.accountId || null,
        // On or before today, « déjà reçu » credits the account at once (R9-06).
        received: form.received && form.nextDate <= new Date().toISOString().slice(0, 10),
      }),
    );
  };
  const set = (name) => (event) => setForm({ ...form, [name]: event.target.value });
  void user;

  return (
    <form className="steps-form" onSubmit={submit}>
      <div className="fin-field">
        <label htmlFor="income-label">{t('firstSteps.income.label')}</label>
        <input id="income-label" value={form.label} maxLength={80} required onChange={set('label')} />
      </div>
      <div className="fin-field">
        <label htmlFor="income-category">{t('myMoney.category')}</label>
        <select id="income-category" value={form.categoryId} onChange={set('categoryId')}>
          <option value="">{t('myMoney.noCategory')}</option>
          {ordered.map((category) => (
            <option key={category.id} value={category.id}>
              {suggested(category) ? '★ ' : ''}
              {category.label}
            </option>
          ))}
        </select>
      </div>
      <AmountField id="income-amount" label={t('firstSteps.income.amount')} value={form.amount} currency={currency} onChange={(amount) => setForm({ ...form, amount })} required />
      {error && <p className="form-error">{error}</p>}
      <div className="fin-field">
        <label htmlFor="income-frequency">{t('calendar.fields.frequency')}</label>
        <select id="income-frequency" value={form.frequency} onChange={set('frequency')}>
          {frequencies.map((option) => (
            <option key={option} value={option}>
              {t(`calendar.frequencies.${option}`, option)}
            </option>
          ))}
        </select>
      </div>
      <div className="fin-field">
        <label htmlFor="income-date">{t('firstSteps.income.nextDate')}</label>
        <input id="income-date" type="date" value={form.nextDate} required onChange={set('nextDate')} />
      </div>
      <div className="fin-field">
        <label htmlFor="income-account">{t('firstSteps.income.account')}</label>
        <select id="income-account" value={form.accountId} onChange={set('accountId')}>
          <option value="">{t('movements.defaultAccount')}</option>
          {own.map((account) => (
            <option key={account.id} value={account.id}>
              {account.label}
            </option>
          ))}
        </select>
        {own.length === 0 && (
          <p className="fin-hint">
            {t('firstSteps.income.noAccount')} <Link to="/app/comptes/nouveau">{t('accounts.add')}</Link>
          </p>
        )}
      </div>
      {form.nextDate <= new Date().toISOString().slice(0, 10) && (
        <label className="money-check" htmlFor="income-received">
          <input id="income-received" type="checkbox" checked={form.received} onChange={(event) => setForm({ ...form, received: event.target.checked })} />
          {t('firstSteps.income.received')}
        </label>
      )}
      <Button type="submit">{t('firstSteps.save')}</Button>
    </form>
  );
}

// P2: when and how the income is confirmed — the day, the weekend rule, the
// account and whether the credit asks for confirmation (QA-P05). It edits the
// recurrence created by P1.
function SalaryStep({ salary, currency, run, done }) {
  const { t, i18n } = useTranslation();
  const accounts = useApi('/fin/comptes');
  const [editing, setEditing] = useState(false);
  const [problem, setProblem] = useState(null);
  const [form, setForm] = useState(() => ({
    nextDate: salary ? new Date(salary.nextDate).toISOString().slice(0, 10) : '',
    weekendRule: salary?.weekendRule ?? 'previous',
    creationMode: salary?.creationMode ?? 'confirm',
    accountId: salary?.accountId ?? '',
  }));
  if (!salary) return <p className="fin-hint">{t('firstSteps.salary.needIncome')}</p>;
  const own = accounts.data?.accounts?.filter((account) => !account.archivedAt && !account.liability && account.currency === currency) ?? [];
  const set = (name) => (event) => setForm({ ...form, [name]: event.target.value });

  // Done, the step shows what is saved (recette R9-07): the form kept on
  // screen with its first values made a saved step look unsaved.
  if (done && !editing) {
    const account = own.find((row) => row.id === salary.accountId);
    return (
      <div className="steps-saved">
        <p className="steps-value">
          {t('firstSteps.salary.saved', {
            date: new Intl.DateTimeFormat(i18n.language === 'tzm' ? 'fr' : i18n.language, { day: 'numeric', month: 'long' }).format(new Date(salary.nextDate)),
            account: account?.label ?? '—',
            mode: t(`calendar.creationModes.${salary.creationMode}`),
          })}
        </p>
        <button type="button" className="steps-skip" onClick={() => setEditing(true)}>
          {t('firstSteps.edit')}
        </button>
      </div>
    );
  }

  const submit = async (event) => {
    event.preventDefault();
    if (!form.nextDate) return setProblem(t('firstSteps.salary.dateMissing'));
    if (!form.accountId) return setProblem(t('firstSteps.salary.accountMissing'));
    setProblem(null);
    const ok = await run(() =>
      api.patch(`/fin/recurrences/${salary.id}`, {
        nextDate: new Date(`${form.nextDate}T00:00:00.000Z`).toISOString(),
        weekendRule: form.weekendRule,
        creationMode: form.creationMode,
        accountId: form.accountId || null,
      }),
    );
    if (ok) setEditing(false);
    return undefined;
  };

  return (
    <form className="steps-form" onSubmit={submit} noValidate>
      {problem && (
        <p className="form-error" role="alert">
          {problem}
        </p>
      )}
      <div className="fin-field">
        <label htmlFor="salary-date">{t('firstSteps.salary.day')}</label>
        <input id="salary-date" type="date" value={form.nextDate} required onChange={set('nextDate')} />
      </div>
      <div className="fin-field">
        <label htmlFor="salary-weekend">{t('calendar.fields.weekendRule')}</label>
        <select id="salary-weekend" value={form.weekendRule} onChange={set('weekendRule')}>
          {['previous', 'next', 'none'].map((option) => (
            <option key={option} value={option}>
              {t(`calendar.weekendRules.${option}`)}
            </option>
          ))}
        </select>
      </div>
      <div className="fin-field">
        <label htmlFor="salary-account">{t('movements.account')}</label>
        <select id="salary-account" value={form.accountId} required onChange={set('accountId')}>
          <option value="">{t('firstSteps.choose')}</option>
          {own.map((account) => (
            <option key={account.id} value={account.id}>
              {account.label}
            </option>
          ))}
        </select>
      </div>
      <div className="fin-field">
        <label htmlFor="salary-mode">{t('calendar.fields.creationMode')}</label>
        <select id="salary-mode" value={form.creationMode} onChange={set('creationMode')}>
          {['confirm', 'auto_real'].map((option) => (
            <option key={option} value={option}>
              {t(`calendar.creationModes.${option}`)}
            </option>
          ))}
        </select>
        <p className="fin-hint">{t('firstSteps.salary.confirmHint')}</p>
      </div>
      <Button type="submit">{t('firstSteps.save')}</Button>
    </form>
  );
}

// The first-salary plan (JA01, JA03, JA04): once an income exists, the way to
// organise it — a budget, the emergency fund, a goal — each accepted or
// changed on its own screen. Nothing is created for the person.
function FirstSalaryPlan() {
  const { t } = useTranslation();
  const reserve = useApi('/fin/reserve');
  const months = reserve.data?.cibleMois ?? null;
  return (
    <section className="steps-plan" aria-labelledby="steps-plan-title">
      <h2 id="steps-plan-title">{t('firstSteps.plan.title')}</h2>
      <p className="fin-hint">{t('firstSteps.plan.intro')}</p>
      <ul>
        <li>
          <Link to="/app/budgets/nouveau">{t('firstSteps.plan.budget')}</Link>
        </li>
        <li>
          <Link to="/app/objectifs/fonds-urgence">{t('firstSteps.plan.reserve')}</Link>
          {months !== null && ` — ${t('goals.defaultTarget', { count: months })}`}
        </li>
        <li>
          <Link to="/app/objectifs/nouveau">{t('firstSteps.plan.goal')}</Link>
        </li>
      </ul>
    </section>
  );
}
