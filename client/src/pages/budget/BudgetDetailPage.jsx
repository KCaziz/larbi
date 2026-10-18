import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Lightbulb, PiggyBank, Plus, Trash2 } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatAmount, formatDate } from '../../lib/format.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import AmountField from '../../components/fincludia/AmountField.jsx';
import BudgetMeter from '../../components/fincludia/BudgetMeter.jsx';
import BudgetDistribution from '../../components/fincludia/BudgetDistribution.jsx';
import { toMinorUnits } from '../../lib/money.js';
import '../../components/fincludia/Fincludia.css';
import './Budget.css';

// One budget, computed (P6-05, screen C06): planned vs real per envelope, the
// alerts at the declared thresholds, and what is still "non affecté". Nothing
// here is recomputed in the browser — every figure is the server's own
// engine answer (formula, version, inputs).
export default function BudgetDetailPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [message, setMessage] = useState(null);
  const [addingEnvelope, setAddingEnvelope] = useState(false);
  const [showProposal, setShowProposal] = useState(false);

  const view = useApi(`/fin/budgets/${id}`);
  const categories = useApi('/fin/categories');
  const references = useApi('/fin/budgets/references');

  useDocumentMeta(view.data?.budget?.label ?? t('budget.title'), t('budget.intro'));

  const formulas = useMemo(() => new Map((references.data?.formulas ?? []).map((formula) => [formula.id, formula])), [references.data]);
  const flatCategories = useMemo(
    () =>
      (categories.data?.groups ?? [])
        // Le serveur refuse une enveloppe sur une catégorie de revenu (on ne
        // budgétise pas son salaire) : ce groupe n'a rien à faire dans ce
        // sélecteur, sous peine d'un 422 que l'utilisateur ne peut pas deviner.
        .filter((group) => group.code !== 'income')
        .flatMap((group) => group.categories.map((category) => ({ ...category, family: group.label }))),
    [categories.data],
  );
  const usedCategoryIds = useMemo(() => new Set((view.data?.vue?.enveloppes ?? []).map((line) => line.categoryId).filter(Boolean)), [view.data]);

  async function run(action, okKey) {
    setMessage(null);
    try {
      await action();
      setMessage({ kind: 'ok', text: t(okKey) });
      view.reload();
      return { ok: true };
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 422: 'budget.errors.refused' })) });
      return { ok: false };
    }
  }

  if (view.status === 'loading' && !view.data) return <LoadingState />;
  if (view.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={view.reload} />;

  const { budget, vue } = view.data;
  const currency = vue.currency;

  return (
    <>
      <PageHeader icon={PiggyBank} title={budget.label} subtitle={t('budget.detailSubtitle')} maxWidth={1040} />
      <div className="budget-page">
        <p>
          <Link to="/budget" className="budget-plain">
            <ChevronLeft size={15} aria-hidden="true" /> {t('budget.backToList')}
          </Link>
        </p>

        {message && (
          <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
            {message.text}
          </p>
        )}

        <p className="budget-period-line">
          {formatDate(i18n.language, vue.periode.debut)} – {formatDate(i18n.language, vue.periode.fin)} ·{' '}
          {t('budget.daysRemaining', { count: vue.periode.joursRestants })}
        </p>

        {vue.avertissements.length > 0 && (
          <div className="fin-warnings">
            {vue.avertissements.map((warning, index) => (
              <p key={index}>{warning}</p>
            ))}
          </div>
        )}

        <div className="fin-figure-grid">
          <FigureCard label={t('budget.resources')} answer={vue.ressources} formula={formulas.get('F002')} />
          <FigureCard label={t('budget.totalPlanned')} answer={vue.totalPrevu} formula={formulas.get('F003')} />
          <FigureCard label={t('budget.totalReal')} answer={vue.totalReel} formula={formulas.get('F003')} />
          <FigureCard label={t('budget.netFlow')} answer={vue.fluxNet} formula={formulas.get('F004')} />
          <FigureCard label={t('budget.remainingToAllocate')} answer={vue.resteAAffecter} formula={formulas.get('F009')} />
          <FigureCard label={t('budget.dailyBudget')} answer={vue.budgetJournalier} formula={formulas.get('F012')} />
        </div>

        {vue.depassementRessources && <Notice variant="action-needed">{t('budget.overResources')}</Notice>}

        {vue.horsEnveloppe?.resultat !== null && vue.horsEnveloppe?.resultat !== undefined && (
          <p className="budget-outside">
            {t('budget.outsideEnvelopes', { amount: formatAmount(i18n.language, vue.horsEnveloppe.resultat, currency) })}
          </p>
        )}

        <section>
          <div className="budget-section-head">
            <h2>{t('budget.envelopes')}</h2>
            <div className="budget-section-actions">
              <button type="button" className="budget-plain" onClick={() => setShowProposal((v) => !v)}>
                <Lightbulb size={15} aria-hidden="true" /> {t('budget.proposalToggle')}
              </button>
              <Button variant="secondary" onClick={() => setAddingEnvelope((v) => !v)}>
                <Plus size={15} aria-hidden="true" /> {t('budget.addEnvelope')}
              </Button>
            </div>
          </div>

          {vue.enveloppes.length > 0 && <BudgetDistribution envelopes={vue.enveloppes} />}

          {showProposal && <Proposal budgetId={id} currency={currency} usedCategoryIds={usedCategoryIds} categories={flatCategories} run={run} />}

          {addingEnvelope && (
            <EnvelopeForm
              budgetId={id}
              currency={currency}
              categories={flatCategories}
              usedCategoryIds={usedCategoryIds}
              onDone={() => {
                setAddingEnvelope(false);
                view.reload();
              }}
              onCancel={() => setAddingEnvelope(false)}
            />
          )}

          {vue.enveloppes.length === 0 ? (
            <Notice variant="info">{t('budget.noEnvelope')}</Notice>
          ) : (
            <ul className="budget-envelope-list">
              {vue.enveloppes.map((line) => (
                <EnvelopeRow key={line.id} budgetId={id} line={line} currency={currency} run={run} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function EnvelopeRow({ budgetId, line, currency, run }) {
  const { t, i18n } = useTranslation();
  const alertClass = { none: '', warning: 'budget-alert-warning', reached: 'budget-alert-reached', exceeded: 'budget-alert-exceeded' }[line.alerte.niveau];

  return (
    <li className={`budget-envelope-row ${alertClass}`}>
      <div className="budget-envelope-head">
        <strong>{line.label ?? t('budget.noCategory')}</strong>
        <span className="budget-row-tag">{t(`budget.envelopeKinds.${line.kind}`)}</span>
        {line.alerte.niveau !== 'none' && <span className="budget-row-tag budget-alert-tag">{t(`budget.alertLevels.${line.alerte.niveau}`)}</span>}
        <button
          type="button"
          className="budget-icon"
          title={t('budget.delete')}
          onClick={() => {
            if (window.confirm(t('budget.deleteEnvelopeConfirm'))) {
              run(() => api.delete(`/fin/budgets/${budgetId}/enveloppes/${line.id}`), 'budget.envelopeDeleted');
            }
          }}
        >
          <Trash2 size={14} aria-hidden="true" />
          <span className="sr-only">{t('budget.delete')}</span>
        </button>
      </div>
      <p className="budget-envelope-amounts">
        {t('budget.plannedVsRealLine', {
          planned: formatAmount(i18n.language, line.prevu, currency),
          real: formatAmount(i18n.language, line.reel, currency),
        })}
        {line.cap !== null && <span className="budget-row-tag">{t('budget.cap', { amount: formatAmount(i18n.language, line.cap, currency) })}</span>}
      </p>
      <BudgetMeter prevu={line.prevu} reel={line.reel} currency={currency} alertLevel={line.alerte.niveau} />
      <FigureCard label={t('budget.gap')} answer={line.ecart} />
      {line.note && <p className="budget-envelope-note">{line.note}</p>}
    </li>
  );
}

function EnvelopeForm({ budgetId, currency, categories, usedCategoryIds, onDone, onCancel }) {
  const { t } = useTranslation();
  const available = categories.filter((category) => !usedCategoryIds.has(category.id));
  const [form, setForm] = useState({ categoryId: available[0]?.id ?? '', kind: 'variable', value: '', cap: '', note: '' });
  const [error, setError] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    const value = toMinorUnits(form.value, currency);
    if (value === null || !form.categoryId) return;
    const cap = form.cap ? toMinorUnits(form.cap, currency) : null;
    try {
      await api.post(`/fin/budgets/${budgetId}/enveloppes`, {
        categoryId: form.categoryId,
        kind: form.kind,
        value,
        cap,
        note: form.note.trim() || null,
      });
      onDone();
    } catch (err) {
      setError(t(errorKey(err, { 422: 'budget.errors.refused' })));
    }
  };

  return (
    <form className="budget-envelope-form" onSubmit={submit}>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="budget-create-grid">
        <div className="fin-field">
          <label htmlFor="env-category">{t('budget.category')}</label>
          <select id="env-category" value={form.categoryId} required onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
            <option value="">{t('budget.chooseCategory')}</option>
            {available.map((category) => (
              <option key={category.id} value={category.id}>
                {category.family} · {category.label}
              </option>
            ))}
          </select>
        </div>
        <div className="fin-field">
          <label htmlFor="env-kind">{t('budget.kind')}</label>
          <select id="env-kind" value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value })}>
            <option value="fixed">{t('budget.envelopeKinds.fixed')}</option>
            <option value="variable">{t('budget.envelopeKinds.variable')}</option>
          </select>
        </div>
        <AmountField id="env-value" label={t('budget.plannedAmount')} value={form.value} currency={currency} onChange={(value) => setForm({ ...form, value })} required />
        <AmountField id="env-cap" label={t('budget.capLabel')} value={form.cap} currency={currency} onChange={(cap) => setForm({ ...form, cap })} hint={t('budget.capHint')} />
      </div>
      <div className="fin-field">
        <label htmlFor="env-note">{t('budget.note')}</label>
        <input id="env-note" value={form.note} maxLength={300} onChange={(event) => setForm({ ...form, note: event.target.value })} />
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

// The proposed distribution (screens JA03 / JA04): figures from the person's
// own history and from what they declared at sign-up, never imposed. Picking
// one only fills the amount field of the "add envelope" form above it — it is
// never written on its own.
function Proposal({ budgetId, currency, usedCategoryIds, categories, run }) {
  const { t, i18n } = useTranslation();
  const proposal = useApi(`/fin/budgets/proposition?currency=${currency}`);

  if (proposal.status === 'loading') return <LoadingState />;
  if (proposal.status === 'error' || !proposal.data) return null;

  const byId = new Map(categories.map((category) => [category.id, category]));
  const rows = proposal.data.proposition.filter((row) => !usedCategoryIds.has(row.categoryId));
  if (rows.length === 0) return <Notice variant="info">{t('budget.noProposal')}</Notice>;

  return (
    <div className="budget-proposal">
      <p className="fin-hint">{t('budget.proposalHint')}</p>
      <ul>
        {rows.map((row) => (
          <li key={row.categoryId}>
            <span>
              {row.label ?? byId.get(row.categoryId)?.label ?? t('budget.noCategory')}{' '}
              <span className="budget-row-tag">{t(`budget.proposalSources.${row.source}`)}</span>
            </span>
            <span>{formatAmount(i18n.language, row.propose, currency)}</span>
            <button
              type="button"
              className="budget-plain"
              onClick={() =>
                run(
                  () => api.post(`/fin/budgets/${budgetId}/enveloppes`, { categoryId: row.categoryId, kind: row.kind, value: row.propose }),
                  'budget.envelopeAdded',
                )
              }
            >
              {t('budget.useProposal')}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
