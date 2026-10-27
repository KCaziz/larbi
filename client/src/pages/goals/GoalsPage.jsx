import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Archive, ArchiveRestore, ChevronDown, ChevronUp, Flag, Plus, Trash2 } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { formatAmount, formatDate } from '../../lib/format.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import AmountField from '../../components/fincludia/AmountField.jsx';
import { toMinorUnits } from '../../lib/money.js';
import '../../components/fincludia/Fincludia.css';
import './Goals.css';

// Financial goals (P6-08), screens C09-C11. The client's catalogue of
// templates only ever supplies a label — never a suggested amount, which the
// client explicitly forbids as a preselected recommendation.
export default function GoalsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [showArchived, setShowArchived] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState(null);
  useDocumentMeta(t('goals.title'), t('goals.intro'));

  const goals = useApi(`/fin/goals${showArchived ? '?includeArchived=true' : ''}`);
  const references = useApi('/fin/goals/references');
  const formulas = useMemo(() => new Map((references.data?.formulas ?? []).map((formula) => [formula.id, formula])), [references.data]);
  // The 17 models since P8-12 (GO-01 to GO-11 and six kept models).
  const templates = references.data?.catalogue ?? references.data?.templates ?? [];
  // « Objectifs & sécurité »: the emergency fund heads the page (P8-12).
  const reserve = useApi(`/fin/reserve?currency=${user?.finCurrency ?? 'DZD'}`);
  const accounts = useApi('/fin/comptes');

  async function run(action, okKey) {
    setMessage(null);
    try {
      await action();
      setMessage({ kind: 'ok', text: t(okKey) });
      goals.reload();
      return { ok: true };
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 422: 'goals.errors.refused' })) });
      return { ok: false };
    }
  }

  if (goals.status === 'loading' && !goals.data) return <LoadingState />;
  if (goals.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={goals.reload} />;

  const list = goals.data.goals;

  return (
    <>
      <PageHeader icon={Flag} title={t('goals.title')} subtitle={t('goals.intro')} maxWidth={1040} />
      <div className="goals-page">
        {message && (
          <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
            {message.text}
          </p>
        )}

        {reserve.data && (
          <section className="goals-emergency" aria-labelledby="goals-emergency-title">
            <h2 id="goals-emergency-title">🛟 {t('goals.emergencyTitle')}</h2>
            <div className="fin-figure-grid">
              <FigureCard label={t('reserve.months')} answer={reserve.data.moisReserve} />
              <FigureCard label={t('reserve.targetAmount')} answer={reserve.data.cibleMontant} />
              <FigureCard label={t('reserve.gap')} answer={reserve.data.manque} />
            </div>
            {reserve.data.cibleParDefaut && <p className="fin-hint">{t('goals.defaultTarget', { count: reserve.data.cibleMois })}</p>}
            <Link to="/app/objectifs/fonds-urgence">{t('goals.emergencyDetail')}</Link>
          </section>
        )}

        <div className="goals-toolbar">
          <label className="goals-check" htmlFor="goals-archived">
            <input id="goals-archived" type="checkbox" checked={showArchived} onChange={(event) => setShowArchived(event.target.checked)} />
            {t('goals.showArchived')}
          </label>
          <Button onClick={() => setCreating((v) => !v)}>
            <Plus size={16} aria-hidden="true" /> {t('goals.create')}
          </Button>
        </div>

        {creating && (
          <CreateGoalForm
            templates={templates}
            defaultCurrency={user?.finCurrency ?? 'DZD'}
            onDone={() => {
              setCreating(false);
              goals.reload();
            }}
            onCancel={() => setCreating(false)}
          />
        )}

        {list.length === 0 ? (
          <Notice variant="info">{t('goals.none')}</Notice>
        ) : (
          <ul className="goals-list">
            {list.map((goal) => (
              <GoalRow key={goal.id} goal={goal} formulas={formulas} statuses={references.data?.progressStatuses ?? []} accounts={accounts.data?.accounts ?? []} run={run} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function GoalRow({ goal, formulas, statuses, accounts, run }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  // The detail — contributions and their source account — is read when the
  // goal is opened.
  const detail = useApi(open ? `/fin/goals/${goal.id}` : null);
  const progress = Math.min(1, goal.vue.progres.resultat ?? 0);

  return (
    <li className={goal.archivedAt ? 'goals-row goals-row-archived' : 'goals-row'}>
      <button type="button" className="goals-row-head" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className="goals-row-title">
          <strong>{goal.label}</strong>
          {goal.status === 'fictional' && <span className="fin-badge-simulation">{t('fincludia.simulationBadge')}</span>}
          {goal.progressStatus && goal.progressStatus !== 'active' && <span className="goals-row-tag">{t(`goals.statuses.${goal.progressStatus}`)}</span>}
          {goal.targetDate && <span className="goals-row-tag">{formatDate(i18n.language, goal.targetDate)}</span>}
        </span>
        <span className="goals-progress-track" aria-hidden="true">
          <span className="goals-progress-fill" style={{ width: `${progress * 100}%` }} />
        </span>
        {open ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
      </button>

      {open && (
        <div className="goals-row-body">
          {/* Tab 10B: the progress ring, % at the centre, capital over target. */}
          <div className="goals-detail-head">
            <ProgressRing value={goal.vue.progres.resultat} />
            <p className="goals-capital">
              {t('goals.capitalOverTarget', { capital: formatAmount(i18n.language, goal.allocated, goal.currency), target: formatAmount(i18n.language, goal.target, goal.currency) })}
              {goal.vue.excedent > 0 && <span className="goals-row-tag">{t('goals.excess', { amount: formatAmount(i18n.language, goal.vue.excedent, goal.currency) })}</span>}
              {goal.capitalSource === 'account' && <span className="fin-hint"> {t('goals.capitalFromAccount')}</span>}
            </p>
            <label className="goals-status" htmlFor={`goal-status-${goal.id}`}>
              {t('goals.status')}
              <select
                id={`goal-status-${goal.id}`}
                value={goal.progressStatus ?? 'active'}
                onChange={(event) => run(() => api.patch(`/fin/goals/${goal.id}`, { progressStatus: event.target.value }), 'goals.updated')}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {t(`goals.statuses.${status}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="fin-figure-grid">
            <FigureCard label={t('goals.progress')} answer={goal.vue.progres} formula={formulas.get('F025')} />
            <FigureCard label={t('goals.remaining')} answer={goal.vue.reste} formula={formulas.get('F026')} />
            <FigureCard label={t('goals.minimumMonths')} answer={goal.vue.moisMinimum} />
            {goal.vue.contributionRequise && (
              <FigureCard label={t('goals.requiredContribution')} answer={goal.vue.contributionRequise} formula={formulas.get('F028')} />
            )}
          </div>

          {goal.vue.trajectoire.atteignable === true && goal.vue.trajectoire.dateEstimee && (
            <p className="goals-estimate">{t('goals.estimatedDate', { date: formatDate(i18n.language, goal.vue.trajectoire.dateEstimee) })}</p>
          )}
          {goal.vue.avertissements.map((warning, index) => (
            <p key={index} className="fin-hint">
              {warning}
            </p>
          ))}

          <EditGoalForm goal={goal} run={run} />

          {goal.status !== 'fictional' && <ContributionForm goal={goal} accounts={accounts} run={(action, key) => run(action, key).then((res) => (detail.reload(), res))} />}
          {detail.data?.contributions?.length > 0 && (
            <section className="goals-contributions">
              <h3>{t('goals.contributions')}</h3>
              <ul>
                {detail.data.contributions.map((row) => (
                  <li key={row.id}>
                    <span>{formatDate(i18n.language, row.occurredAt)}</span>
                    <span>{row.fromAccount ? t('goals.fromAccount', { account: row.fromAccount.label }) : ''}</span>
                    <strong>{formatAmount(i18n.language, row.value, row.currency)}</strong>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <ScenarioForm goal={goal} />

          <div className="goals-row-actions">
            <button
              type="button"
              className="goals-icon"
              title={goal.archivedAt ? t('goals.restore') : t('goals.archive')}
              onClick={() => run(() => api.put(`/fin/goals/${goal.id}/archive`, { archived: !goal.archivedAt }), goal.archivedAt ? 'goals.restored' : 'goals.archived')}
            >
              {goal.archivedAt ? <ArchiveRestore size={15} aria-hidden="true" /> : <Archive size={15} aria-hidden="true" />}
              <span className="sr-only">{goal.archivedAt ? t('goals.restore') : t('goals.archive')}</span>
            </button>
            <button
              type="button"
              className="goals-icon"
              title={t('goals.delete')}
              onClick={() => {
                if (window.confirm(t('goals.deleteConfirm', { label: goal.label }))) run(() => api.delete(`/fin/goals/${goal.id}`), 'goals.deleted');
              }}
            >
              <Trash2 size={15} aria-hidden="true" />
              <span className="sr-only">{t('goals.delete')}</span>
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

// The progress ring of tab 10B: % at the centre, never a colour alone.
function ProgressRing({ value }) {
  const ratio = Math.max(0, Math.min(1, value ?? 0));
  const circumference = 2 * Math.PI * 40;
  return (
    <svg viewBox="0 0 100 100" className="goals-ring" role="img" aria-label={value === null ? '—' : `${Math.round(ratio * 100)} %`}>
      <circle cx="50" cy="50" r="40" fill="none" stroke="var(--bg-alt)" strokeWidth="12" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="var(--accent)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${ratio * circumference} ${circumference}`} transform="rotate(-90 50 50)" />
      <text x="50" y="55" textAnchor="middle" className="goals-ring-text">
        {value === null ? '—' : `${Math.round(ratio * 100)} %`}
      </text>
    </svg>
  );
}

// A real contribution (ARC-04): a transfer from one of the person's accounts
// to the goal's own account, created on the first contribution.
function ContributionForm({ goal, accounts, run }) {
  const { t } = useTranslation();
  const sources = accounts.filter((account) => !account.archivedAt && !account.liability && account.currency === goal.currency && account.id !== goal.accountId);
  const [state, setState] = useState({ from: sources[0]?.id ?? '', amount: '', date: new Date().toISOString().slice(0, 10) });
  if (sources.length === 0) return <p className="fin-hint">{t('goals.noSourceAccount')}</p>;
  const submit = (event) => {
    event.preventDefault();
    const value = toMinorUnits(state.amount, goal.currency);
    if (value === null) return;
    run(() => api.post(`/fin/goals/${goal.id}/contributions`, { fromAccountId: state.from, value, occurredAt: new Date(`${state.date}T12:00:00.000Z`).toISOString() }), 'goals.contributed').then(
      (res) => res?.ok && setState({ ...state, amount: '' }),
    );
  };
  return (
    <form className="goals-edit-form" onSubmit={submit}>
      <div className="fin-field">
        <label htmlFor={`goal-from-${goal.id}`}>{t('goals.contributeFrom')}</label>
        <select id={`goal-from-${goal.id}`} value={state.from} onChange={(event) => setState({ ...state, from: event.target.value })}>
          {sources.map((account) => (
            <option key={account.id} value={account.id}>
              {account.label}
            </option>
          ))}
        </select>
      </div>
      <AmountField id={`goal-contribute-${goal.id}`} label={t('goals.contribution')} value={state.amount} currency={goal.currency} onChange={(amount) => setState({ ...state, amount })} required />
      <div className="fin-field">
        <label htmlFor={`goal-date-${goal.id}`}>{t('myMoney.date')}</label>
        <input id={`goal-date-${goal.id}`} type="date" value={state.date} max={new Date().toISOString().slice(0, 10)} onChange={(event) => setState({ ...state, date: event.target.value })} />
      </div>
      <Button type="submit" variant="secondary">
        {t('goals.contribute')}
      </Button>
    </form>
  );
}

// Scenarios (C11, in red): contribution, horizon, inflation, hypothetical
// return and yearly raise — typed by the person, computed by the server,
// never saved.
function ScenarioForm({ goal }) {
  const { t, i18n } = useTranslation();
  const [state, setState] = useState({ contribution: goal.monthlyContribution ? String(goal.monthlyContribution / 100) : '', months: '', inflation: '', rate: '', raise: '' });
  const [result, setResult] = useState(null);
  const percent = (text) => (text === '' ? undefined : Number(String(text).replace(',', '.')) / 100);
  const submit = async (event) => {
    event.preventDefault();
    const contribution = state.contribution ? toMinorUnits(state.contribution, goal.currency, { allowZero: true }) : undefined;
    const body = {
      ...(contribution !== undefined && contribution !== null ? { monthlyContribution: contribution } : {}),
      ...(state.months ? { months: Number(state.months) } : {}),
      ...(state.inflation !== '' ? { inflation: percent(state.inflation) } : {}),
      ...(state.rate !== '' ? { rate: percent(state.rate) } : {}),
      ...(state.raise !== '' ? { annualIncrease: percent(state.raise) } : {}),
    };
    try {
      setResult((await api.post(`/fin/goals/${goal.id}/scenario`, body)).scenario);
    } catch {
      setResult(null);
    }
  };
  const field = (name, label, props = {}) => (
    <div className="fin-field">
      <label htmlFor={`scenario-${name}-${goal.id}`}>{label}</label>
      <input id={`scenario-${name}-${goal.id}`} inputMode="decimal" value={state[name]} onChange={(event) => setState({ ...state, [name]: event.target.value })} {...props} />
    </div>
  );
  return (
    <details className="goals-scenario">
      <summary>{t('goals.scenario.title')}</summary>
      <form className="goals-edit-form" onSubmit={submit}>
        <AmountField id={`scenario-contribution-${goal.id}`} label={t('goals.monthlyContribution')} value={state.contribution} currency={goal.currency} onChange={(contribution) => setState({ ...state, contribution })} />
        {field('months', t('goals.scenario.months'))}
        {field('inflation', t('goals.scenario.inflation'))}
        {field('rate', t('goals.scenario.rate'))}
        {field('raise', t('goals.scenario.raise'))}
        <Button type="submit" variant="secondary">
          {t('goals.scenario.run')}
        </Button>
      </form>
      {result && (
        <div className="goals-scenario-result">
          <FigureCard label={t('goals.scenario.monthsToReach')} answer={result.moisPourAtteindre} />
          {result.dateAtteinte && <p>{t('goals.estimatedDate', { date: formatDate(i18n.language, result.dateAtteinte) })}</p>}
          {result.capitalFinHorizon !== null && (
            <p>
              {t('goals.scenario.atHorizon', {
                capital: formatAmount(i18n.language, result.capitalFinHorizon, goal.currency),
                target: formatAmount(i18n.language, result.cibleFinHorizon, goal.currency),
              })}
            </p>
          )}
          <p className="fin-hint">{t('goals.scenario.disclaimer')}</p>
        </div>
      )}
    </details>
  );
}

function EditGoalForm({ goal, run }) {
  const { t } = useTranslation();
  const [allocated, setAllocated] = useState(String((goal.allocated / 100).toFixed(2)));
  const [contribution, setContribution] = useState(goal.monthlyContribution ? String((goal.monthlyContribution / 100).toFixed(2)) : '');

  const submit = (event) => {
    event.preventDefault();
    const allocatedValue = toMinorUnits(allocated, goal.currency, { allowZero: true });
    const contributionValue = contribution ? toMinorUnits(contribution, goal.currency, { allowZero: true }) : null;
    if (allocatedValue === null) return;
    run(() => api.patch(`/fin/goals/${goal.id}`, { ...(goal.capitalSource !== 'account' ? { allocated: allocatedValue } : {}), monthlyContribution: contributionValue }), 'goals.updated');
  };

  return (
    <form className="goals-edit-form" onSubmit={submit}>
      {/* On its own account, the capital IS the account's balance: it is
          moved by contributions, never typed (« jamais déduite deux fois »). */}
      {goal.capitalSource !== 'account' && (
        <AmountField id={`goal-allocated-${goal.id}`} label={t('goals.allocated')} value={allocated} currency={goal.currency} onChange={setAllocated} required />
      )}
      <AmountField id={`goal-contribution-${goal.id}`} label={t('goals.monthlyContribution')} value={contribution} currency={goal.currency} onChange={setContribution} />
      <Button type="submit" variant="secondary">
        {t('goals.save')}
      </Button>
    </form>
  );
}

function CreateGoalForm({ templates, defaultCurrency, onDone, onCancel }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ label: '', templateKey: '', target: '', targetDate: '', rate: '' });
  const [error, setError] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    const target = toMinorUnits(form.target, defaultCurrency);
    if (target === null) return;
    try {
      await api.post('/fin/goals', {
        label: form.label.trim(),
        templateKey: form.templateKey || null,
        target,
        currency: defaultCurrency,
        targetDate: form.targetDate ? new Date(form.targetDate).toISOString() : null,
        rate: form.rate ? Number(form.rate) / 100 : null,
      });
      onDone();
    } catch (err) {
      setError(t(errorKey(err, { 422: 'goals.errors.refused' })));
    }
  };

  return (
    <form className="goals-create-form" onSubmit={submit}>
      <h2>{t('goals.createTitle')}</h2>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="goals-create-grid">
        <div className="fin-field">
          <label htmlFor="new-goal-template">{t('goals.template')}</label>
          <select
            id="new-goal-template"
            value={form.templateKey}
            onChange={(event) => {
              const chosen = templates.find((tpl) => tpl.key === event.target.value);
              setForm({ ...form, templateKey: event.target.value, label: form.label || chosen?.label || '' });
            }}
          >
            <option value="">{t('goals.customTemplate')}</option>
            {templates.map((tpl) => (
              <option key={tpl.key} value={tpl.key}>
                {tpl.icon ? `${tpl.icon} ` : ''}
                {tpl.label}
              </option>
            ))}
          </select>
        </div>
        <div className="fin-field">
          <label htmlFor="new-goal-label">{t('goals.label')}</label>
          <input id="new-goal-label" value={form.label} maxLength={80} required onChange={(event) => setForm({ ...form, label: event.target.value })} />
        </div>
        <AmountField id="new-goal-target" label={t('goals.target')} value={form.target} currency={defaultCurrency} onChange={(target) => setForm({ ...form, target })} required />
        <div className="fin-field">
          <label htmlFor="new-goal-date">{t('goals.targetDate')}</label>
          {/* C09 (in red): the amount and the horizon are asked at creation —
              no computation runs without them. */}
          <input id="new-goal-date" type="date" value={form.targetDate} required onChange={(event) => setForm({ ...form, targetDate: event.target.value })} />
        </div>
        <div className="fin-field">
          <label htmlFor="new-goal-rate">{t('goals.rate')}</label>
          <input id="new-goal-rate" type="number" step="0.1" min="0" max="100" value={form.rate} onChange={(event) => setForm({ ...form, rate: event.target.value })} />
          <p className="fin-hint">{t('goals.rateHint')}</p>
        </div>
      </div>
      <div className="goals-create-actions">
        <Button type="submit">{t('goals.save')}</Button>
        <button type="button" className="goals-plain" onClick={onCancel}>
          {t('goals.cancel')}
        </button>
      </div>
    </form>
  );
}
