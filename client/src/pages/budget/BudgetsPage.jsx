import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Archive, ArchiveRestore, Copy, PiggyBank, Plus, Trash2 } from 'lucide-react';
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
import '../../components/fincludia/Fincludia.css';
import './Budget.css';

// Budgets and envelopes (P6-05), screen C06 « Budget du mois ». This page is
// the list (create, duplicate, archive, delete); one budget's own figures
// (planned/real, alerts, "non affecté") live on BudgetDetailPage.
export default function BudgetsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [showArchived, setShowArchived] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState(null);
  useDocumentMeta(t('budget.title'), t('budget.intro'));

  const budgets = useApi(`/fin/budgets${showArchived ? '?includeArchived=true' : ''}`);

  async function run(action, okKey) {
    setMessage(null);
    try {
      await action();
      setMessage({ kind: 'ok', text: t(okKey) });
      budgets.reload();
      return { ok: true };
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 422: 'budget.errors.refused' })) });
      return { ok: false };
    }
  }

  if (budgets.status === 'loading' && !budgets.data) return <LoadingState />;
  if (budgets.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={budgets.reload} />;

  const list = budgets.data.budgets;

  return (
    <>
      <PageHeader icon={PiggyBank} title={t('budget.title')} subtitle={t('budget.intro')} />
      <div className="budget-page">
        {message && (
          <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
            {message.text}
          </p>
        )}

        <div className="budget-toolbar">
          <label className="budget-check" htmlFor="budget-archived">
            <input id="budget-archived" type="checkbox" checked={showArchived} onChange={(event) => setShowArchived(event.target.checked)} />
            {t('budget.showArchived')}
          </label>
          <Button onClick={() => setCreating((v) => !v)}>
            <Plus size={16} aria-hidden="true" /> {t('budget.create')}
          </Button>
        </div>

        {creating && (
          <CreateBudgetForm
            defaultCurrency={user?.finCurrency ?? 'DZD'}
            onDone={() => {
              setCreating(false);
              budgets.reload();
            }}
            onCancel={() => setCreating(false)}
          />
        )}

        {list.length === 0 ? (
          <Notice variant="info">{t('budget.none')}</Notice>
        ) : (
          <ul className="budget-list">
            {list.map((budget) => (
              <li key={budget.id} className={budget.archivedAt ? 'budget-row budget-row-archived' : 'budget-row'}>
                <Link to={`/budget/${budget.id}`} className="budget-row-main">
                  <strong>{budget.label}</strong>
                  <span className="budget-row-period">
                    {formatDate(i18n.language, budget.periodStart)} – {formatDate(i18n.language, budget.periodEnd)}
                  </span>
                  <span className="budget-row-tag">{t(`budget.recurrences.${budget.recurrence}`)}</span>
                  <span className="budget-row-tag">{t('budget.envelopeCount', { count: budget.enveloppes })}</span>
                </Link>
                <div className="budget-row-actions">
                  {!budget.archivedAt && budget.prochainePeriode && (
                    <button
                      type="button"
                      className="budget-icon"
                      title={t('budget.duplicate')}
                      onClick={() => run(() => api.post(`/fin/budgets/${budget.id}/dupliquer`), 'budget.duplicated')}
                    >
                      <Copy size={15} aria-hidden="true" />
                      <span className="sr-only">{t('budget.duplicate')}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className="budget-icon"
                    title={budget.archivedAt ? t('budget.restore') : t('budget.archive')}
                    onClick={() => run(() => api.put(`/fin/budgets/${budget.id}/archive`, { archived: !budget.archivedAt }), budget.archivedAt ? 'budget.restored' : 'budget.archived')}
                  >
                    {budget.archivedAt ? <ArchiveRestore size={15} aria-hidden="true" /> : <Archive size={15} aria-hidden="true" />}
                    <span className="sr-only">{budget.archivedAt ? t('budget.restore') : t('budget.archive')}</span>
                  </button>
                  <button
                    type="button"
                    className="budget-icon"
                    title={t('budget.delete')}
                    onClick={() => {
                      if (window.confirm(t('budget.deleteConfirm', { label: budget.label }))) {
                        run(() => api.delete(`/fin/budgets/${budget.id}`), 'budget.deleted');
                      }
                    }}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                    <span className="sr-only">{t('budget.delete')}</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function CreateBudgetForm({ defaultCurrency, onDone, onCancel }) {
  const { t } = useTranslation();
  const today = new Date();
  const firstOfMonth = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1)).toISOString().slice(0, 10);
  const lastOfMonth = new Date(Date.UTC(today.getFullYear(), today.getMonth() + 1, 0)).toISOString().slice(0, 10);
  const [form, setForm] = useState({ label: '', periodStart: firstOfMonth, periodEnd: lastOfMonth, recurrence: 'monthly' });
  const [error, setError] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      await api.post('/fin/budgets', {
        label: form.label.trim(),
        periodStart: new Date(form.periodStart).toISOString(),
        periodEnd: new Date(`${form.periodEnd}T23:59:59`).toISOString(),
        currency: defaultCurrency,
        recurrence: form.recurrence,
      });
      onDone();
    } catch (err) {
      setError(t(errorKey(err, { 422: 'budget.errors.refused' })));
    }
  };

  return (
    <form className="budget-create-form" onSubmit={submit}>
      <h2>{t('budget.createTitle')}</h2>
      {error && <p className="form-error" role="alert">{error}</p>}
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
      </div>
      <div className="budget-create-actions">
        <Button type="submit">{t('budget.save')}</Button>
        <button type="button" className="budget-plain" onClick={onCancel}>
          {t('budget.cancel')}
        </button>
      </div>
    </form>
  );
}
