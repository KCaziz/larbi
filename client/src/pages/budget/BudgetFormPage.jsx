import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Plus } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import BackLink from '../../components/fincludia/BackLink.jsx';
import '../../components/fincludia/Fincludia.css';
import './Budget.css';

// BUD-02 « Créer / modifier budget », at its own address (P8-25):
// `/app/budgets/nouveau` and `/app/budgets/:id/modifier`. A new budget opens
// on its own detail, where its envelopes are added; a corrected one goes back
// to it. The currency stays the one the budget was made in: its envelopes are
// expressed in it.
const day = (date) => new Date(date).toISOString().slice(0, 10);

export default function BudgetFormPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const editing = Boolean(id);
  const view = useApi(editing ? `/fin/budgets/${id}` : null);
  useDocumentMeta(t(editing ? 'budget.editTitle' : 'budget.createTitle'));

  if (editing && view.status === 'loading' && !view.data) return <LoadingState />;
  if (editing && view.status === 'error') return <ErrorState message={t('budget.notFound')} />;
  const budget = editing ? view.data.budget : null;

  return (
    <>
      <PageHeader icon={editing ? Pencil : Plus} title={t(editing ? 'budget.editTitle' : 'budget.createTitle')} subtitle={budget?.label ?? t('budget.intro')} maxWidth={720} />
      <div className="budget-page">
        <BackLink to={editing ? `/app/budgets/${id}` : '/app/budgets'}>{t(editing ? 'budget.backToBudget' : 'budget.backToList')}</BackLink>
        <BudgetForm
          key={budget?.id ?? 'new'}
          budget={budget}
          onSubmit={async (body) => {
            if (editing) {
              await api.patch(`/fin/budgets/${id}`, body);
              navigate(`/app/budgets/${id}`, { state: { message: 'budget.saved' } });
            } else {
              const created = await api.post('/fin/budgets', { ...body, currency: user?.finCurrency ?? 'DZD' });
              navigate(`/app/budgets/${created.budget.id}`, { state: { message: 'budget.created' } });
            }
          }}
        />
      </div>
    </>
  );
}

function BudgetForm({ budget, onSubmit }) {
  const { t } = useTranslation();
  const today = new Date();
  const [form, setForm] = useState(() => ({
    label: budget?.label ?? '',
    periodStart: budget ? day(budget.periodStart) : new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1)).toISOString().slice(0, 10),
    periodEnd: budget ? day(budget.periodEnd) : new Date(Date.UTC(today.getFullYear(), today.getMonth() + 1, 0)).toISOString().slice(0, 10),
    recurrence: budget?.recurrence ?? 'monthly',
    note: budget?.note ?? '',
  }));
  const [error, setError] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      await onSubmit({
        label: form.label.trim(),
        periodStart: new Date(form.periodStart).toISOString(),
        periodEnd: new Date(`${form.periodEnd}T23:59:59`).toISOString(),
        recurrence: form.recurrence,
        ...(budget ? { note: form.note.trim() || null } : {}),
      });
    } catch (err) {
      setError(t(errorKey(err, { 422: 'budget.errors.refused' })));
    }
  };

  return (
    <form className="budget-create-form" onSubmit={submit}>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="budget-create-grid">
        <div className="fin-field">
          <label htmlFor="new-budget-label">{t('budget.label')}</label>
          <input id="new-budget-label" value={form.label} maxLength={80} required onChange={(event) => setForm({ ...form, label: event.target.value })} />
        </div>
        <div className="fin-field">
          <label htmlFor="new-budget-start">{t('budget.periodStart')}</label>
          <input id="new-budget-start" type="date" value={form.periodStart} required onChange={(event) => setForm({ ...form, periodStart: event.target.value })} />
        </div>
        <div className="fin-field">
          <label htmlFor="new-budget-end">{t('budget.periodEnd')}</label>
          <input id="new-budget-end" type="date" value={form.periodEnd} required onChange={(event) => setForm({ ...form, periodEnd: event.target.value })} />
        </div>
        <div className="fin-field">
          <label htmlFor="new-budget-recurrence">{t('budget.recurrence')}</label>
          <select id="new-budget-recurrence" value={form.recurrence} onChange={(event) => setForm({ ...form, recurrence: event.target.value })}>
            {['none', 'monthly', 'quarterly', 'yearly'].map((option) => (
              <option key={option} value={option}>
                {t(`budget.recurrences.${option}`)}
              </option>
            ))}
          </select>
        </div>
        {budget && (
          <div className="fin-field">
            <label htmlFor="new-budget-note">{t('budget.note')}</label>
            <input id="new-budget-note" value={form.note} maxLength={300} onChange={(event) => setForm({ ...form, note: event.target.value })} />
          </div>
        )}
      </div>
      <div className="budget-create-actions">
        <Button type="submit">{t('budget.save')}</Button>
      </div>
    </form>
  );
}
