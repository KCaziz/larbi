import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Archive, ArchiveRestore, ChevronDown, ChevronUp, Flag, Plus, Trash2 } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { formatDate } from '../../lib/format.js';
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
  const templates = references.data?.templates ?? [];

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
              <GoalRow key={goal.id} goal={goal} formulas={formulas} run={run} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function GoalRow({ goal, formulas, run }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const progress = Math.min(1, goal.vue.progres.resultat ?? 0);

  return (
    <li className={goal.archivedAt ? 'goals-row goals-row-archived' : 'goals-row'}>
      <button type="button" className="goals-row-head" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className="goals-row-title">
          <strong>{goal.label}</strong>
          {goal.status === 'fictional' && <span className="fin-badge-simulation">{t('fincludia.simulationBadge')}</span>}
          {goal.targetDate && <span className="goals-row-tag">{formatDate(i18n.language, goal.targetDate)}</span>}
        </span>
        <span className="goals-progress-track" aria-hidden="true">
          <span className="goals-progress-fill" style={{ width: `${progress * 100}%` }} />
        </span>
        {open ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
      </button>

      {open && (
        <div className="goals-row-body">
          <div className="fin-figure-grid">
            <FigureCard label={t('goals.progress')} answer={goal.vue.progres} formula={formulas.get('F025')} />
            <FigureCard label={t('goals.remaining')} answer={goal.vue.reste} formula={formulas.get('F026')} />
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

function EditGoalForm({ goal, run }) {
  const { t } = useTranslation();
  const [allocated, setAllocated] = useState(String((goal.allocated / 100).toFixed(2)));
  const [contribution, setContribution] = useState(goal.monthlyContribution ? String((goal.monthlyContribution / 100).toFixed(2)) : '');

  const submit = (event) => {
    event.preventDefault();
    const allocatedValue = toMinorUnits(allocated, goal.currency, { allowZero: true });
    const contributionValue = contribution ? toMinorUnits(contribution, goal.currency, { allowZero: true }) : null;
    if (allocatedValue === null) return;
    run(() => api.patch(`/fin/goals/${goal.id}`, { allocated: allocatedValue, monthlyContribution: contributionValue }), 'goals.updated');
  };

  return (
    <form className="goals-edit-form" onSubmit={submit}>
      <AmountField id={`goal-allocated-${goal.id}`} label={t('goals.allocated')} value={allocated} currency={goal.currency} onChange={setAllocated} required />
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
          <select id="new-goal-template" value={form.templateKey} onChange={(event) => setForm({ ...form, templateKey: event.target.value })}>
            <option value="">{t('goals.customTemplate')}</option>
            {templates.map((tpl) => (
              <option key={tpl.key} value={tpl.key}>
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
          <input id="new-goal-date" type="date" value={form.targetDate} onChange={(event) => setForm({ ...form, targetDate: event.target.value })} />
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
