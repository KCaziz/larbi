import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Ban, Check, Copy, Eye, Lock, Plus, Receipt, Trash2, UserMinus, Users } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { formatAmount, formatDate, formatRatio } from '../../lib/format.js';
import BarList from '../../components/fincludia/charts/BarList.jsx';
import CategoryPicker from '../../components/fincludia/CategoryPicker.jsx';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import AmountField from '../../components/fincludia/AmountField.jsx';
import { fromMinorUnits, toMinorUnits } from '../../lib/money.js';
import '../../components/fincludia/Fincludia.css';
import './Spaces.css';

// The building blocks of Gestion commune (P9-02): the components that used to
// be the accordions of one page `/espaces`, now exported and placed on pages of
// their own under `/partage` (SpacesListPage, SpaceDashboardPage and one page
// per compartment). Nothing here was rewritten: the code moved.
//
// `useSpaceRun` is the one thing added: each page keeps its own message and
// reloads what it shows after a write, as the single page used to for all.
export function useSpaceRun(reload) {
  const { t } = useTranslation();
  const [message, setMessage] = useState(null);
  async function run(action, okKey) {
    setMessage(null);
    try {
      const result = await action();
      setMessage({ kind: 'ok', text: t(okKey) });
      reload?.();
      return { ok: true, result };
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 422: 'spaces.errors.refused', 403: 'spaces.errors.role', 423: 'spaces.errors.closed' })) });
      return { ok: false };
    }
  }
  return [message, run];
}

// Shared spaces (P6-13), the « À plusieurs » hub: screens P01, P04, CO01, CP01,
// FA01.
//
// The page is built around one sentence the client wrote and this screen has to
// make obvious: joining a space shares NOTHING. Every member starts fully
// private, and the only sharing control on this page writes the viewer's own
// row — there is no way to set somebody else's, by design.
export function SpaceForm({ t, currency, references, run, onDone }) {
  const { user } = useAuth();
  const [kind, setKind] = useState('flatshare');
  const [label, setLabel] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState(null);

  async function submit(event) {
    event.preventDefault();
    setError(null);
    if (label.trim().length === 0) {
      setError(t('spaces.errors.label'));
      return;
    }
    // The name the others see is a PERSON's (recette R2-01): the space's own
    // name there made every event read « Nous deux a rejoint l'espace ».
    if (displayName.trim() && displayName.trim().toLowerCase() === label.trim().toLowerCase()) {
      setError(t('spaces.errors.displayNameIsLabel'));
      return;
    }
    const outcome = await run(
      () => api.post('/fin/espaces', { kind, label: label.trim(), currency, ...(displayName.trim() ? { displayName: displayName.trim() } : {}) }),
      'spaces.created',
    );
    if (outcome.ok) onDone();
  }

  return (
    <form className="spaces-form" onSubmit={submit}>
      <div className="spaces-form-grid">
        <label htmlFor="space-kind">
          {t('spaces.fields.kind')}
          <select id="space-kind" value={kind} onChange={(event) => setKind(event.target.value)}>
            {(references?.kinds ?? ['flatshare']).map((option) => (
              <option key={option} value={option}>
                {t(`spaces.kinds.${option}`)}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="space-label">
          {t('spaces.fields.label')}
          <input id="space-label" type="text" value={label} onChange={(event) => setLabel(event.target.value)} required maxLength={80} />
        </label>
        <label htmlFor="space-display">
          {t('spaces.fields.displayName')}
          <input id="space-display" type="text" value={displayName} placeholder={user?.name ?? ''} onChange={(event) => setDisplayName(event.target.value)} maxLength={60} />
        </label>
      </div>
      {/* Why the display name exists at all. */}
      <p className="spaces-help">{t('spaces.displayNameHelp', { name: user?.name ?? '' })}</p>
      {error && <p className="form-error">{error}</p>}
      <div className="spaces-actions">
        <Button type="submit">{t('spaces.save')}</Button>
        <Button type="button" variant="secondary" onClick={onDone}>
          {t('spaces.cancel')}
        </Button>
      </div>
    </form>
  );
}

export function JoinForm({ t, run, onDone }) {
  const [token, setToken] = useState('');

  async function submit(event) {
    event.preventDefault();
    const outcome = await run(() => api.post('/fin/espaces/rejoindre', { token: token.trim() }), 'spaces.joined');
    if (outcome.ok) onDone();
  }

  return (
    <form className="spaces-form" onSubmit={submit}>
      <label htmlFor="space-token">
        {t('spaces.fields.token')}
        <input id="space-token" type="text" value={token} onChange={(event) => setToken(event.target.value)} required minLength={16} maxLength={200} />
      </label>
      <p className="spaces-help">{t('spaces.joinHelp')}</p>
      <div className="spaces-actions">
        <Button type="submit">{t('spaces.joinAction')}</Button>
        <Button type="button" variant="secondary" onClick={onDone}>
          {t('spaces.cancel')}
        </Button>
      </div>
    </form>
  );
}

// What the others actually shared. A member who shared nothing has no block at
// all here — the server does not send one, and neither does this show one.
export function SharedFigures({ t, partage, references }) {
  const others = partage.filter((row) => !row.isMe && Object.keys(row.donnees).length > 0);
  if (others.length === 0) return <p className="spaces-help">{t('spaces.nobodyShares')}</p>;

  return (
    <>
      <h3>{t('spaces.sharedTitle')}</h3>
      <ul className="spaces-shared">
        {others.map((row) => (
          <li key={row.userId}>
            <span className="spaces-member-name">{row.name}</span>
            <div className="fin-cards">
              {(references?.shareableKinds ?? []).map((kind) => {
                const block = row.donnees[kind];
                if (!block) return null;
                return (
                  <div key={kind} className="spaces-shared-card">
                    <FigureCard label={t(`spaces.dataKinds.${kind}`)} answer={block.total} />
                    {/* At "totals" the rows are not in the payload at all, and
                        the text says so instead of showing an empty list. */}
                    {block.lignes === null ? (
                      <p className="spaces-help">{t('spaces.totalsOnly')}</p>
                    ) : (
                      <p className="spaces-help">{t('spaces.rowCount', { count: block.lignes.length })}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

// Couple: « séparation Moi / Nous » (P6-15, screens CP02-CP04). My own money
// stays mine — read from my personal synthesis, never from the space — and
// "Nous" is strictly what the space itself already knows: the shared
// balance and the common goals. Nothing here merges the two.
export function CoupleReview({ t, spaceId }) {
  const mine = useApi('/fin/argent/synthese');
  const goals = useApi(`/fin/espaces/${spaceId}/objectifs-communs`);

  if (!mine.data) return null;

  return (
    <>
      <h3>{t('spaces.review.coupleTitle')}</h3>
      <div className="spaces-review-cols">
        <div>
          <p className="spaces-help">{t('spaces.review.me')}</p>
          <FigureCard label={t('spaces.review.myNetFlow')} answer={mine.data.synthese.fluxNet} />
        </div>
        <div>
          <p className="spaces-help">{t('spaces.review.us')}</p>
          {goals.data && goals.data.goals.length > 0 ? (
            <ul className="spaces-members">
              {goals.data.goals.map((goal) => (
                <li key={goal.id} className="spaces-member">
                  <span className="spaces-member-name">{goal.label}</span>
                  <span>
                    {goal.vue.progres.resultat === null ? t('fincludia.notComputed') : `${Math.round(goal.vue.progres.resultat * 100)} %`}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="spaces-help">{t('spaces.review.noCommonGoal')}</p>
          )}
        </div>
      </div>
    </>
  );
}

// Family: a short review combining what the household already tracks —
// never a new figure of its own. Each number here is read from an endpoint
// that already enforces its own membership check.
export function HouseholdReview({ t, language, spaceId, currency }) {
  const children = useApi(`/fin/espaces/${spaceId}/enfants`);
  const provisions = useApi(`/fin/espaces/${spaceId}/provisions`);
  const goals = useApi(`/fin/espaces/${spaceId}/objectifs-communs`);

  if (!children.data || !provisions.data) return null;
  const monthlyTotal = provisions.data.provisions.reduce((sum, p) => sum + (p.vue.mensuelle.resultat ?? 0), 0);

  return (
    <>
      <h3>{t('spaces.review.householdTitle')}</h3>
      <p className="spaces-help">
        {t('spaces.review.householdSummary', {
          children: children.data.children.length,
          provisions: provisions.data.provisions.length,
          goals: goals.data?.goals.length ?? 0,
          monthly: formatAmount(language, monthlyTotal, currency),
        })}
      </p>
    </>
  );
}

// Shared expenses and settlements (P6-14), screens P02 / P03. Membership and
// role are enforced by the server on every write; this only hides the
// recording forms from a viewer so the refusal is not the first thing they see.
export function SharedExpenses({ t, language, spaceId, space, members }) {
  const [message, setMessage] = useState(null);
  const [addingExpense, setAddingExpense] = useState(false);
  const [addingSettlement, setAddingSettlement] = useState(false);
  const [showRecurrences, setShowRecurrences] = useState(false);

  const references = useApi('/fin/espaces/references-partage');
  const expenses = useApi(`/fin/espaces/${spaceId}/depenses`);
  const settlements = useApi(`/fin/espaces/${spaceId}/reglements`);
  const balances = useApi(`/fin/espaces/${spaceId}/soldes`);
  const live = members.filter((m) => !m.parti);

  async function run(action, okKey) {
    setMessage(null);
    try {
      await action();
      setMessage({ kind: 'ok', text: t(okKey) });
      expenses.reload();
      settlements.reload();
      balances.reload();
      return { ok: true };
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 422: 'spaces.shared.errors.refused', 403: 'spaces.shared.errors.role' })) });
      return { ok: false };
    }
  }

  return (
    <>
      <h3>
        <Receipt size={16} aria-hidden="true" style={{ verticalAlign: 'text-bottom' }} /> {t('spaces.shared.title')}
      </h3>
      {message && (
        <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
          {message.text}
        </p>
      )}

      {balances.data && (
        <>
          <ul className="spaces-members">
            {balances.data.soldes.map((row) => (
              <li key={row.memberId} className="spaces-member">
                <span className="spaces-member-name">{row.name}</span>
                <span>{row.solde.resultat === null ? t('fincludia.notComputed') : formatAmount(language, row.solde.resultat, space.currency)}</span>
              </li>
            ))}
          </ul>
          {balances.data.plan.transferts && balances.data.plan.transferts.length > 0 && (
            <ul className="spaces-help" style={{ listStyle: 'disc', paddingInlineStart: '18px' }}>
              {balances.data.plan.transferts.map((transfer, index) => (
                <li key={index}>
                  {t('spaces.shared.transfer', { from: transfer.fromName, to: transfer.toName, amount: formatAmount(language, transfer.amount, space.currency) })}
                </li>
              ))}
            </ul>
          )}
          {/* « Petit solde »: under the threshold a debt is not proposed, but it
              is still there, and said. */}
          {balances.data.plan.masques && balances.data.plan.masques.length > 0 && (
            <p className="spaces-help">
              {t('spaces.shared.hiddenSmall', { count: balances.data.plan.masques.length, threshold: formatAmount(language, balances.data.plan.seuilPetitSolde, space.currency) })}
            </p>
          )}
        </>
      )}

      <div className="spaces-actions">
        <Button type="button" variant="secondary" onClick={() => setAddingExpense((v) => !v)}>
          <Plus size={15} aria-hidden="true" /> {t('spaces.shared.addExpense')}
        </Button>
        <Button type="button" variant="secondary" onClick={() => setAddingSettlement((v) => !v)}>
          <Plus size={15} aria-hidden="true" /> {t('spaces.shared.addSettlement')}
        </Button>
        <button type="button" className="spaces-plain" onClick={() => setShowRecurrences((v) => !v)}>
          {t('spaces.shared.recurringToggle')}
        </button>
      </div>

      {showRecurrences && <RecurringBills t={t} language={language} spaceId={spaceId} currency={space.currency} members={live} run={run} />}

      {addingExpense && (
        <ExpenseForm
          t={t}
          spaceId={spaceId}
          currency={space.currency}
          members={live}
          references={references.data}
          run={run}
          onDone={() => setAddingExpense(false)}
        />
      )}
      {addingSettlement && (
        <SettlementForm t={t} spaceId={spaceId} currency={space.currency} members={live} run={run} onDone={() => setAddingSettlement(false)} />
      )}

      {expenses.data && (
        <ul className="spaces-list">
          {expenses.data.expenses.map((expense) => (
            <li key={expense.id} className="spaces-row">
              <div className="spaces-open" style={{ cursor: 'default' }}>
                <span className="spaces-row-label">{expense.label}</span>
                <span className="spaces-tag">{formatAmount(language, expense.value, expense.currency)}</span>
                <span className="spaces-row-date">{formatDate(language, expense.occurredAt)}</span>
                <span className="spaces-tag">{t('spaces.shared.paidBy', { name: expense.payer })}</span>
                {expense.lifecycle !== 'done' && <span className="spaces-tag">{t(`spaces.shared.lifecycle.${expense.lifecycle}`)}</span>}
                {expense.splitMode === 'usage' && <span className="spaces-tag">{expense.usageUnit}</span>}
                {expense.subCategory && <span className="spaces-tag">{expense.subCategory}</span>}
                <ExpenseReceipt t={t} spaceId={spaceId} expense={expense} run={run} />
                {expense.lifecycle === 'planned' && new Date(expense.occurredAt) <= new Date() && (
                  <button type="button" className="spaces-icon" onClick={() => run(() => api.post(`/fin/espaces/${spaceId}/depenses/${expense.id}/confirmer`, {}), 'spaces.shared.confirmed')} aria-label={t('spaces.shared.confirm')}>
                    <Check size={15} aria-hidden="true" />
                  </button>
                )}
                {expense.lifecycle !== 'cancelled' && (
                  <button
                    type="button"
                    className="spaces-icon"
                    onClick={() => {
                      if (window.confirm(t('spaces.shared.cancelConfirm'))) run(() => api.post(`/fin/espaces/${spaceId}/depenses/${expense.id}/annuler`, {}), 'spaces.shared.cancelled');
                    }}
                    aria-label={t('spaces.shared.cancel')}
                  >
                    <Ban size={15} aria-hidden="true" />
                  </button>
                )}
                <button
                  type="button"
                  className="spaces-icon"
                  onClick={() => {
                    if (window.confirm(t('spaces.shared.deleteExpenseConfirm'))) run(() => api.delete(`/fin/espaces/${spaceId}/depenses/${expense.id}`), 'spaces.shared.deleted');
                  }}
                  aria-label={t('spaces.shared.delete')}
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
          {expenses.data.expenses.length === 0 && <p className="spaces-help">{t('spaces.shared.noExpense')}</p>}
        </ul>
      )}

      {settlements.data && settlements.data.settlements.length > 0 && (
        <ul className="spaces-list">
          {settlements.data.settlements.map((settlement) => (
            <li key={settlement.id} className="spaces-row">
              <div className="spaces-open" style={{ cursor: 'default' }}>
                <span className="spaces-row-label">
                  {t('spaces.shared.settlementLine', { from: settlement.fromName, to: settlement.toName })}
                </span>
                <span className="spaces-tag">{formatAmount(language, settlement.value, settlement.currency)}</span>
                <span className="spaces-row-date">{formatDate(language, settlement.settledAt)}</span>
                <button
                  type="button"
                  className="spaces-icon"
                  onClick={() => {
                    if (window.confirm(t('spaces.shared.deleteSettlementConfirm'))) run(() => api.delete(`/fin/espaces/${spaceId}/reglements/${settlement.id}`), 'spaces.shared.deleted');
                  }}
                  aria-label={t('spaces.shared.delete')}
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="spaces-help">{t('spaces.shared.declarative')}</p>
    </>
  );
}

// Recurring common bills (P6-15): ALG-04 only ever PROPOSES a candidate from
// past shared expenses. Confirming one creates a shared expense for THIS
// period; the server refuses a second confirmation for the same bill and the
// same month, which is the dedup the client asks for.
export function RecurringBills({ t, language, spaceId, currency, members, run }) {
  const candidates = useApi(`/fin/espaces/${spaceId}/depenses-recurrentes`);
  const [confirming, setConfirming] = useState(null);

  if (candidates.status === 'loading') return <LoadingState />;
  if (!candidates.data) return null;
  if (candidates.data.candidates.length === 0) return <Notice variant="info">{t('spaces.shared.noRecurrence')}</Notice>;

  return (
    <div className="spaces-shared" style={{ marginBlockEnd: '14px' }}>
      <ul className="spaces-list">
        {candidates.data.candidates.map((candidate) => (
          <li key={candidate.label} className="spaces-row">
            <div className="spaces-open" style={{ cursor: 'default' }}>
              <span className="spaces-row-label">{candidate.label}</span>
              <span className="spaces-tag">{formatAmount(language, candidate.amount, currency)}</span>
              <span className="spaces-tag">{t('spaces.shared.occurrences', { count: candidate.occurrences })}</span>
              <button type="button" className="spaces-plain" onClick={() => setConfirming(confirming === candidate.label ? null : candidate.label)}>
                {t('spaces.shared.confirmRecurrence')}
              </button>
            </div>
            {confirming === candidate.label && (
              <ExpenseForm
                t={t}
                spaceId={spaceId}
                currency={currency}
                members={members}
                references={null}
                confirmRecurrence
                initialLabel={candidate.label}
                initialValue={String((candidate.amount / 100).toFixed(2))}
                run={run}
                onDone={() => setConfirming(null)}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// The space's own financial agreement (colocation) / shared note, the client's
// `note` field already carries. Any member reads it; only an admin or the
// owner can change a rule everyone in the space lives under.
export function FinancialAgreement({ t, spaceId, note, canEdit, run, reload }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(note ?? '');

  const submit = async (event) => {
    event.preventDefault();
    const outcome = await run(() => api.patch(`/fin/espaces/${spaceId}`, { note: text.trim() || null }), 'spaces.agreement.saved');
    if (outcome.ok) {
      setEditing(false);
      reload();
    }
  };

  return (
    <>
      <h3>{t('spaces.agreement.title')}</h3>
      {!editing ? (
        <>
          <p className="spaces-help">{note || t('spaces.agreement.none')}</p>
          {canEdit && (
            <button type="button" className="spaces-plain" onClick={() => setEditing(true)}>
              {t('spaces.agreement.edit')}
            </button>
          )}
        </>
      ) : (
        <form className="spaces-form" onSubmit={submit}>
          <label htmlFor="space-agreement-text" className="sr-only">
            {t('spaces.agreement.title')}
          </label>
          <textarea
            id="space-agreement-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={300}
            rows={3}
            style={{ width: '100%', resize: 'vertical', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', background: 'var(--surface)', color: 'var(--text)', font: 'inherit' }}
          />
          <div className="spaces-actions">
            <Button type="submit">{t('spaces.save')}</Button>
            <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
              {t('spaces.cancel')}
            </Button>
          </div>
        </form>
      )}
    </>
  );
}

// The receipt of a shared expense (P9-14): private, readable by the members of the
// space only. A link to read it (never an address to share), a button to replace
// or remove it, and a field to attach one.
function ExpenseReceipt({ t, spaceId, expense, run }) {
  const base = `/fin/espaces/${spaceId}/depenses/${expense.id}/justificatif`;
  const inputId = `receipt-${expense.id}`;
  return (
    <span className="spaces-receipt">
      {expense.receipt && (
        <a className="spaces-tag" href={`/api${base}`} target="_blank" rel="noreferrer">
          {t('spaces.shared.receipt')}
        </a>
      )}
      <label htmlFor={inputId} className="spaces-plain">
        {expense.receipt ? t('spaces.shared.receiptReplace') : t('spaces.shared.receiptAdd')}
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (file) run(() => api.upload(base, file), 'spaces.shared.receiptSaved');
          }}
        />
      </label>
      {expense.receipt && (
        <button type="button" className="spaces-plain" onClick={() => run(() => api.delete(base), 'spaces.shared.receiptRemoved')}>
          {t('spaces.shared.receiptRemove')}
        </button>
      )}
    </span>
  );
}

export function ExpenseForm({ t, spaceId, currency, members, references, run, onDone, confirmRecurrence = false, initialLabel = '', initialValue = '' }) {
  const today = new Date().toISOString().slice(0, 10);
  const [label, setLabel] = useState(initialLabel);
  const [value, setValue] = useState(initialValue);
  const [date, setDate] = useState(today);
  const [splitMode, setSplitMode] = useState('equal');
  const [payerId, setPayerId] = useState(members.find((m) => m.isMe)?.id ?? members[0]?.id ?? '');
  const [participantIds, setParticipantIds] = useState(() => new Set(members.map((m) => m.id)));
  const [weights, setWeights] = useState({});
  const [error, setError] = useState(null);
  // P9-04: a planned expense may be dated ahead; a split by usage names its unit.
  const [planned, setPlanned] = useState(false);
  const [usageUnit, setUsageUnit] = useState('');
  const [collectiveCategory, setCollectiveCategory] = useState('');
  // P9-16: any of the 125 categories; left empty, the common category's own one is used.
  const [categoryId, setCategoryId] = useState('');
  const referenceCategories = useApi('/fin/categories');
  // P9-08: the personal account the payer paid from, if any. One personal
  // expense is created there; it is never asked twice.
  const [personalAccountId, setPersonalAccountId] = useState('');
  const myAccounts = useApi('/fin/comptes');
  const budgetReferences = useApi('/fin/espaces/references-budgets');
  const isMyPayment = payerId === members.find((m) => m.isMe)?.id;
  const needsWeight = ['percent', 'amounts', 'weighted', 'usage'].includes(splitMode);

  const toggle = (id) => {
    const next = new Set(participantIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setParticipantIds(next);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    const amount = toMinorUnits(value, currency);
    if (amount === null || participantIds.size === 0 || !payerId) return;
    const participants = [...participantIds].map((memberId) => {
      if (splitMode === 'percent') return { memberId, weight: Math.round(Number(weights[memberId] ?? 0) * (references?.percentScale ?? 10000) / 100) };
      if (splitMode === 'amounts') return { memberId, weight: toMinorUnits(weights[memberId] ?? '0', currency, { allowZero: true }) ?? 0 };
      if (splitMode === 'weighted' || splitMode === 'usage') return { memberId, weight: Math.round(Number(weights[memberId] ?? 0)) };
      return { memberId };
    });
    const outcome = await run(
      () =>
        confirmRecurrence
          ? api.post(`/fin/espaces/${spaceId}/depenses-recurrentes/confirmer`, {
              label: label.trim(),
              value: amount,
              occurredAt: new Date(date).toISOString(),
              splitMode,
              payerId,
              participants,
              ...(splitMode === 'usage' ? { usageUnit: usageUnit.trim() } : {}),
            })
          : api.post(`/fin/espaces/${spaceId}/depenses`, {
              label: label.trim(),
              value: amount,
              occurredAt: new Date(date).toISOString(),
              splitMode,
              payerId,
              participants,
              ...(planned ? { planned: true } : {}),
              ...(collectiveCategory ? { collectiveCategory } : {}),
              ...(categoryId ? { categoryId } : {}),
              ...(personalAccountId && !planned && isMyPayment ? { personalLink: { accountId: personalAccountId } } : {}),
              ...(splitMode === 'usage' ? { usageUnit: usageUnit.trim() } : {}),
            }),
      'spaces.shared.expenseAdded',
    );
    if (outcome.ok) onDone();
    else setError(t('spaces.shared.errors.refused'));
  };

  return (
    <form className="spaces-form" onSubmit={submit}>
      {error && <p className="form-error">{error}</p>}
      <div className="spaces-form-grid">
        <label htmlFor="shared-expense-label">
          {t('spaces.shared.fields.label')}
          <input id="shared-expense-label" type="text" value={label} onChange={(event) => setLabel(event.target.value)} required maxLength={80} />
        </label>
        <AmountField id="shared-expense-value" label={t('spaces.shared.fields.amount')} value={value} currency={currency} onChange={setValue} required />
        <label htmlFor="shared-expense-date">
          {t('spaces.shared.fields.date')}
          <input id="shared-expense-date" type="date" value={date} max={planned ? undefined : today} onChange={(event) => setDate(event.target.value)} required />
        </label>
        <label htmlFor="shared-expense-payer">
          {t('spaces.shared.fields.payer')}
          <select id="shared-expense-payer" value={payerId} onChange={(event) => setPayerId(event.target.value)}>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="shared-expense-mode">
          {t('spaces.shared.fields.splitMode')}
          <select id="shared-expense-mode" value={splitMode} onChange={(event) => setSplitMode(event.target.value)}>
            {(references?.splitModes ?? ['equal']).map((mode) => (
              <option key={mode} value={mode}>
                {t(`spaces.shared.splitModes.${mode}`)}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="shared-expense-category">
          {t('spaces.shared.fields.category')}
          <select id="shared-expense-category" value={collectiveCategory} onChange={(event) => setCollectiveCategory(event.target.value)}>
            <option value="">{t('spaces.shared.fields.noCategory')}</option>
            {(budgetReferences.data?.categories ?? []).map((category) => (
              <option key={category.key} value={category.key}>
                {category.label}
              </option>
            ))}
          </select>
        </label>
        <div className="fin-field">
          <label htmlFor="shared-expense-reference">{t('spaces.shared.fields.referenceCategory')}</label>
          <CategoryPicker
            id="shared-expense-reference"
            value={categoryId}
            emptyLabel={t('spaces.shared.fields.referenceFromCommon')}
            groups={(referenceCategories.data?.groups ?? [])
              .filter((group) => ['fixed', 'variable', 'seasonal', 'debt', 'shared'].includes(group.code))
              .map((group) => ({ ...group, categories: group.categories.filter((category) => !category.archivedAt) }))}
            onChange={setCategoryId}
          />
        </div>
        {/* No free « sous-catégorie » field (recette R8-02): the picker above
            chooses the category and its sub-category. */}
        {splitMode === 'usage' && (
          <label htmlFor="shared-expense-unit">
            {t('spaces.shared.fields.usageUnit')}
            <input id="shared-expense-unit" type="text" value={usageUnit} onChange={(event) => setUsageUnit(event.target.value)} required maxLength={30} />
          </label>
        )}
      </div>
      {!confirmRecurrence && isMyPayment && !planned && (myAccounts.data?.accounts ?? []).filter((account) => account.currency === currency && !account.archivedAt).length > 0 && (
        <label htmlFor="shared-expense-account">
          {t('spaces.shared.fields.personalAccount')}
          <select id="shared-expense-account" value={personalAccountId} onChange={(event) => setPersonalAccountId(event.target.value)}>
            <option value="">{t('spaces.shared.fields.noPersonalAccount')}</option>
            {myAccounts.data.accounts
              .filter((account) => account.currency === currency && !account.archivedAt)
              .map((account) => (
                <option key={account.id} value={account.id}>
                  {account.label}
                </option>
              ))}
          </select>
          <span className="spaces-help">{t('spaces.shared.fields.personalAccountHelp')}</span>
        </label>
      )}
      {!confirmRecurrence && (
        <label htmlFor="shared-expense-planned" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input id="shared-expense-planned" type="checkbox" checked={planned} onChange={(event) => setPlanned(event.target.checked)} />
          {t('spaces.shared.fields.planned')}
        </label>
      )}

      <p className="spaces-help">{t('spaces.shared.fields.participants')}</p>
      <ul className="spaces-matrix">
        {members.map((member) => (
          <li key={member.id}>
            <label htmlFor={`participant-${member.id}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input id={`participant-${member.id}`} type="checkbox" checked={participantIds.has(member.id)} onChange={() => toggle(member.id)} />
              {member.name}
            </label>
            {needsWeight && participantIds.has(member.id) && (
              <input
                type="number"
                min="0"
                step={splitMode === 'weighted' || splitMode === 'usage' ? '1' : '0.01'}
                aria-label={`${member.name} — ${splitMode === 'weighted' ? t('spaces.shared.fields.weight') : splitMode === 'usage' ? usageUnit || t('spaces.shared.fields.usageUnit') : ''}`}
                placeholder={splitMode === 'percent' ? '%' : splitMode === 'weighted' ? t('spaces.shared.fields.weight') : splitMode === 'usage' ? usageUnit : currency}
                value={weights[member.id] ?? ''}
                onChange={(event) => setWeights({ ...weights, [member.id]: event.target.value })}
              />
            )}
          </li>
        ))}
      </ul>
      {references && <p className="spaces-help">{references.roundingRuleText}</p>}

      <div className="spaces-actions">
        <Button type="submit">{t('spaces.save')}</Button>
        <Button type="button" variant="secondary" onClick={onDone}>
          {t('spaces.cancel')}
        </Button>
      </div>
    </form>
  );
}

export function SettlementForm({ t, spaceId, currency, members, run, onDone }) {
  const today = new Date().toISOString().slice(0, 10);
  const [fromId, setFromId] = useState(members[0]?.id ?? '');
  const [toId, setToId] = useState(members[1]?.id ?? members[0]?.id ?? '');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(today);
  const [error, setError] = useState(null);
  // P9-15: the one who was paid says where the money arrived; the advance goes down by as much.
  const [accountId, setAccountId] = useState('');
  const myAccounts = useApi('/fin/comptes');
  const iAmPaid = members.find((member) => member.id === toId)?.isMe === true;
  const receivingAccounts = (myAccounts.data?.accounts ?? []).filter((account) => account.currency === currency && !account.archivedAt && account.type !== 'AC-09');

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    if (fromId === toId) {
      setError(t('spaces.shared.errors.sameMember'));
      return;
    }
    const amount = toMinorUnits(value, currency);
    if (amount === null) return;
    const outcome = await run(
      () => api.post(`/fin/espaces/${spaceId}/reglements`, { fromId, toId, value: amount, settledAt: new Date(date).toISOString(), ...(iAmPaid && accountId ? { accountId } : {}) }),
      'spaces.shared.settlementAdded',
    );
    if (outcome.ok) onDone();
    else setError(t('spaces.shared.errors.refused'));
  };

  return (
    <form className="spaces-form" onSubmit={submit}>
      {error && <p className="form-error">{error}</p>}
      <div className="spaces-form-grid">
        <label htmlFor="settlement-from">
          {t('spaces.shared.fields.from')}
          <select id="settlement-from" value={fromId} onChange={(event) => setFromId(event.target.value)}>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="settlement-to">
          {t('spaces.shared.fields.to')}
          <select id="settlement-to" value={toId} onChange={(event) => setToId(event.target.value)}>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
        <AmountField id="settlement-value" label={t('spaces.shared.fields.amount')} value={value} currency={currency} onChange={setValue} required />
        <label htmlFor="settlement-date">
          {t('spaces.shared.fields.date')}
          <input id="settlement-date" type="date" value={date} max={today} onChange={(event) => setDate(event.target.value)} required />
        </label>
      </div>
      {iAmPaid && receivingAccounts.length > 0 && (
        <label htmlFor="settlement-account">
          {t('spaces.shared.fields.receivedAccount')}
          <select id="settlement-account" value={accountId} onChange={(event) => setAccountId(event.target.value)}>
            <option value="">{t('spaces.shared.fields.noReceivedAccount')}</option>
            {receivingAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.label}
              </option>
            ))}
          </select>
          <span className="spaces-help">{t('spaces.shared.fields.receivedAccountHelp')}</span>
        </label>
      )}
      <p className="spaces-help">{t('spaces.shared.declarative')}</p>
      <div className="spaces-actions">
        <Button type="submit">{t('spaces.save')}</Button>
        <Button type="button" variant="secondary" onClick={onDone}>
          {t('spaces.cancel')}
        </Button>
      </div>
    </form>
  );
}

// Common goals and envelopes (P6-15): a pot that belongs to the space itself,
// not to one account — the colocation's shared envelope, the couple's shared
// goal. Progress is built from actual contributions, never a free-floating
// number, because several people pay into this one.
export function CommonGoals({ t, language, spaceId, currency }) {
  const [message, setMessage] = useState(null);
  const [creating, setCreating] = useState(false);
  const goals = useApi(`/fin/espaces/${spaceId}/objectifs-communs`);

  async function run(action, okKey) {
    setMessage(null);
    try {
      await action();
      setMessage({ kind: 'ok', text: t(okKey) });
      goals.reload();
      return { ok: true };
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 422: 'spaces.common.errors.refused', 403: 'spaces.common.errors.role' })) });
      return { ok: false };
    }
  }

  return (
    <>
      <h3>{t('spaces.common.title')}</h3>
      {message && (
        <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
          {message.text}
        </p>
      )}

      {/* How far each common goal has come, on one scale (100 % = its target). */}
      {goals.data && goals.data.goals.length >= 2 && (
        <BarList
          caption={t('spaces.common.progressChart')}
          max={1}
          rows={goals.data.goals.map((goal) => ({ key: goal.id, label: goal.label, value: goal.vue.progres.resultat === null ? null : Math.min(1, goal.vue.progres.resultat) }))}
          format={(value) => formatRatio(language, value, { digits: 0 })}
        />
      )}
      {goals.data && goals.data.goals.length > 0 && (
        <ul className="spaces-list">
          {goals.data.goals.map((goal) => (
            <li key={goal.id} className="spaces-row">
              <div className="spaces-detail">
                <div className="spaces-open" style={{ cursor: 'default' }}>
                  <span className="spaces-row-label">{goal.label}</span>
                  <span className="spaces-tag">{formatAmount(language, goal.target, goal.currency)}</span>
                  {goal.targetDate && <span className="spaces-row-date">{formatDate(language, goal.targetDate)}</span>}
                  <button
                    type="button"
                    className="spaces-icon"
                    onClick={() => {
                      if (window.confirm(t('spaces.common.deleteConfirm'))) run(() => api.delete(`/fin/espaces/${spaceId}/objectifs-communs/${goal.id}`), 'spaces.common.deleted');
                    }}
                    aria-label={t('spaces.common.delete')}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>
                <FigureCard label={t('spaces.common.progress')} answer={goal.vue.progres} />
                <p className="spaces-help">{t('spaces.common.allocatedLine', { amount: formatAmount(language, goal.vue.allocated, goal.currency) })}</p>
                <ul className="spaces-members">
                  {goal.vue.parMembre.map((row) => (
                    <li key={row.memberId} className="spaces-member">
                      <span className="spaces-member-name">{row.name}</span>
                      <span>{formatAmount(language, row.amount, goal.currency)}</span>
                    </li>
                  ))}
                </ul>
                {/* F044: what each member's "fair share" of what's left would
                    be by income, shown beside what they actually gave — never
                    a bill, only a comparison, and only once everyone involved
                    has agreed to share their income in this space. */}
                {goal.vue.partEquitable?.disponible ? (
                  <>
                    <p className="spaces-help">{t('spaces.common.fairShareTitle')}</p>
                    <ul className="spaces-members">
                      {goal.vue.partEquitable.parMembre.map((row) => (
                        <li key={row.memberId} className="spaces-member">
                          <span className="spaces-member-name">{row.name}</span>
                          <span>{row.partEquitable === null ? t('fincludia.notComputed') : formatAmount(language, row.partEquitable, goal.currency)}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  goal.vue.partEquitable?.manquants?.length > 0 && (
                    <p className="spaces-help">
                      {t('spaces.common.fairShareMissing', { names: goal.vue.partEquitable.manquants.map((m) => m.name).join(', ') })}
                    </p>
                  )
                )}
                <ContributeForm t={t} spaceId={spaceId} goalId={goal.id} currency={goal.currency} run={run} />
                <GoalCalendar t={t} language={language} spaceId={spaceId} goal={goal} run={run} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="spaces-actions">
        <Button type="button" variant="secondary" onClick={() => setCreating((v) => !v)}>
          <Plus size={15} aria-hidden="true" /> {t('spaces.common.create')}
        </Button>
      </div>
      {creating && <CommonGoalForm t={t} spaceId={spaceId} currency={currency} run={run} onDone={() => setCreating(false)} />}
    </>
  );
}

// P9-17: the calendar of contributions and what each member is expected to put
// in at each due date. Without it, only milestones are announced.
function GoalCalendar({ t, language, spaceId, goal, run }) {
  const [editing, setEditing] = useState(false);
  const members = useApi(editing ? `/fin/espaces/${spaceId}/membres` : null);
  const [everyMonths, setEveryMonths] = useState(String(goal.contributionEveryMonths ?? 1));
  const [firstDue, setFirstDue] = useState(goal.firstDueAt ? goal.firstDueAt.slice(0, 10) : '');
  const [amounts, setAmounts] = useState(() => Object.fromEntries(goal.shares.map((share) => [share.memberId, fromMinorUnits(share.amount, goal.currency)])));
  const url = `/fin/espaces/${spaceId}/objectifs-communs/${goal.id}/calendrier`;

  const save = async (event) => {
    event.preventDefault();
    const shares = Object.entries(amounts)
      .map(([memberId, text]) => ({ memberId, amount: text === '' ? null : toMinorUnits(text, goal.currency) }))
      .filter((share) => share.amount);
    if (shares.length === 0 || !firstDue) return;
    const outcome = await run(() => api.put(url, { calendar: { everyMonths: Number(everyMonths), firstDueAt: new Date(firstDue).toISOString(), shares } }), 'spaces.common.calendarSaved');
    if (outcome.ok) setEditing(false);
  };

  return (
    <div className="spaces-calendar">
      {goal.contributionEveryMonths ? (
        <p className="spaces-help">{t('spaces.common.calendarLine', { months: goal.contributionEveryMonths, date: formatDate(language, goal.firstDueAt) })}</p>
      ) : (
        <p className="spaces-help">{t('spaces.common.calendarNone')}</p>
      )}
      <div className="spaces-actions">
        <Button type="button" variant="secondary" onClick={() => setEditing((v) => !v)}>
          {t('spaces.common.calendarEdit')}
        </Button>
        {goal.contributionEveryMonths && (
          <Button type="button" variant="secondary" onClick={() => run(() => api.put(url, { calendar: null }), 'spaces.common.calendarRemoved')}>
            {t('spaces.common.calendarRemove')}
          </Button>
        )}
      </div>
      {editing && (
        <form className="spaces-form" onSubmit={save}>
          <div className="spaces-form-grid">
            <label htmlFor={`cal-every-${goal.id}`}>
              {t('spaces.common.calendarEvery')}
              <select id={`cal-every-${goal.id}`} value={everyMonths} onChange={(event) => setEveryMonths(event.target.value)}>
                {[1, 2, 3, 6, 12].map((months) => (
                  <option key={months} value={months}>
                    {months === 1 ? t('spaces.common.calendarMonthly') : t('spaces.common.calendarMonths', { count: months })}
                  </option>
                ))}
              </select>
            </label>
            <label htmlFor={`cal-first-${goal.id}`}>
              {t('spaces.common.calendarFirst')}
              <input id={`cal-first-${goal.id}`} type="date" value={firstDue} onChange={(event) => setFirstDue(event.target.value)} required />
            </label>
            {(members.data?.membres ?? []).map((member) => (
              <AmountField
                key={member.id}
                id={`cal-${goal.id}-${member.id}`}
                label={t('spaces.common.calendarShare', { name: member.name })}
                value={amounts[member.id] ?? ''}
                currency={goal.currency}
                onChange={(value) => setAmounts((current) => ({ ...current, [member.id]: value }))}
              />
            ))}
          </div>
          <div className="spaces-actions">
            <Button type="submit">{t('spaces.save')}</Button>
          </div>
        </form>
      )}
    </div>
  );
}

function ContributeForm({ t, spaceId, goalId, currency, run }) {
  const [amount, setAmount] = useState('');
  const submit = async (event) => {
    event.preventDefault();
    const value = toMinorUnits(amount, currency);
    if (value === null) return;
    const outcome = await run(
      () => api.post(`/fin/espaces/${spaceId}/objectifs-communs/${goalId}/contributions`, { amount: value, contributedAt: new Date().toISOString() }),
      'spaces.common.contributionAdded',
    );
    if (outcome.ok) setAmount('');
  };
  return (
    <form className="spaces-contribute-form" onSubmit={submit}>
      <AmountField id={`contribute-${goalId}`} label={t('spaces.common.contribute')} value={amount} currency={currency} onChange={setAmount} required />
      <Button type="submit" variant="secondary">
        {t('spaces.common.add')}
      </Button>
    </form>
  );
}

function CommonGoalForm({ t, spaceId, currency, run, onDone }) {
  const [label, setLabel] = useState('');
  const [target, setTarget] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [error, setError] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    const value = toMinorUnits(target, currency);
    if (value === null) return;
    const outcome = await run(
      () => api.post(`/fin/espaces/${spaceId}/objectifs-communs`, { label: label.trim(), target: value, currency, targetDate: targetDate ? new Date(targetDate).toISOString() : null }),
      'spaces.common.created',
    );
    if (outcome.ok) onDone();
    else setError(t('spaces.common.errors.refused'));
  };

  return (
    <form className="spaces-form" onSubmit={submit}>
      {error && <p className="form-error">{error}</p>}
      <div className="spaces-form-grid">
        <label htmlFor="common-goal-label">
          {t('spaces.common.fields.label')}
          <input id="common-goal-label" type="text" value={label} onChange={(event) => setLabel(event.target.value)} required maxLength={80} />
        </label>
        <AmountField id="common-goal-target" label={t('spaces.common.fields.target')} value={target} currency={currency} onChange={setTarget} required />
        <label htmlFor="common-goal-date">
          {t('spaces.common.fields.targetDate')}
          <input id="common-goal-date" type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} />
        </label>
      </div>
      <div className="spaces-actions">
        <Button type="submit">{t('spaces.save')}</Button>
        <Button type="button" variant="secondary" onClick={onDone}>
          {t('spaces.cancel')}
        </Button>
      </div>
    </form>
  );
}

// Family: children (minimal data) and annual provisions (F045), screens
// FA02-FA06.
export function HouseholdExtras({ t, language, spaceId, currency }) {
  const [message, setMessage] = useState(null);
  const [addingChild, setAddingChild] = useState(false);
  const [addingProvision, setAddingProvision] = useState(false);
  const children = useApi(`/fin/espaces/${spaceId}/enfants`);
  const provisions = useApi(`/fin/espaces/${spaceId}/provisions`);

  async function run(action, okKey) {
    setMessage(null);
    try {
      await action();
      setMessage({ kind: 'ok', text: t(okKey) });
      children.reload();
      provisions.reload();
      return { ok: true };
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 422: 'spaces.household.errors.refused', 403: 'spaces.household.errors.role' })) });
      return { ok: false };
    }
  }

  return (
    <>
      <h3>{t('spaces.household.childrenTitle')}</h3>
      {message && (
        <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
          {message.text}
        </p>
      )}
      {children.data && (
        <ul className="spaces-members">
          {children.data.children.map((child) => (
            <li key={child.id} className="spaces-member">
              <span className="spaces-member-name">{child.firstName}</span>
              <span className="spaces-tag">{child.birthYear}</span>
              <button
                type="button"
                className="spaces-icon"
                onClick={() => {
                  if (window.confirm(t('spaces.household.deleteChildConfirm'))) run(() => api.delete(`/fin/espaces/${spaceId}/enfants/${child.id}`), 'spaces.household.deleted');
                }}
                aria-label={t('spaces.household.delete')}
              >
                <Trash2 size={15} aria-hidden="true" />
              </button>
            </li>
          ))}
          {children.data.children.length === 0 && <p className="spaces-help">{t('spaces.household.noChild')}</p>}
        </ul>
      )}
      <div className="spaces-actions">
        <Button type="button" variant="secondary" onClick={() => setAddingChild((v) => !v)}>
          <Plus size={15} aria-hidden="true" /> {t('spaces.household.addChild')}
        </Button>
      </div>
      {addingChild && <ChildForm t={t} spaceId={spaceId} run={run} onDone={() => setAddingChild(false)} />}

      <h3>{t('spaces.household.provisionsTitle')}</h3>
      {provisions.data && (
        <ul className="spaces-list">
          {provisions.data.provisions.map((provision) => (
            <li key={provision.id} className="spaces-row">
              <div className="spaces-open" style={{ cursor: 'default' }}>
                <span className="spaces-row-label">{provision.label}</span>
                <span className="spaces-tag">{formatAmount(language, provision.plannedAmount, provision.currency)}</span>
                <span className="spaces-row-date">{formatDate(language, provision.targetDate)}</span>
                <span>
                  {provision.vue.mensuelle.resultat === null
                    ? t('fincludia.notComputed')
                    : t('spaces.household.perMonth', { amount: formatAmount(language, provision.vue.mensuelle.resultat, provision.currency) })}
                </span>
                <button
                  type="button"
                  className="spaces-icon"
                  onClick={() => {
                    if (window.confirm(t('spaces.household.deleteProvisionConfirm'))) run(() => api.delete(`/fin/espaces/${spaceId}/provisions/${provision.id}`), 'spaces.household.deleted');
                  }}
                  aria-label={t('spaces.household.delete')}
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
          {provisions.data.provisions.length === 0 && <p className="spaces-help">{t('spaces.household.noProvision')}</p>}
        </ul>
      )}
      <div className="spaces-actions">
        <Button type="button" variant="secondary" onClick={() => setAddingProvision((v) => !v)}>
          <Plus size={15} aria-hidden="true" /> {t('spaces.household.addProvision')}
        </Button>
      </div>
      {addingProvision && <ProvisionForm t={t} spaceId={spaceId} currency={currency} run={run} onDone={() => setAddingProvision(false)} />}
    </>
  );
}

function ChildForm({ t, spaceId, run, onDone }) {
  const [firstName, setFirstName] = useState('');
  const [birthYear, setBirthYear] = useState(String(new Date().getFullYear()));
  const [error, setError] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    const outcome = await run(() => api.post(`/fin/espaces/${spaceId}/enfants`, { firstName: firstName.trim(), birthYear: Number(birthYear) }), 'spaces.household.childAdded');
    if (outcome.ok) onDone();
    else setError(t('spaces.household.errors.refused'));
  };

  return (
    <form className="spaces-form" onSubmit={submit}>
      {error && <p className="form-error">{error}</p>}
      <div className="spaces-form-grid">
        <label htmlFor="child-first-name">
          {t('spaces.household.fields.firstName')}
          <input id="child-first-name" type="text" value={firstName} onChange={(event) => setFirstName(event.target.value)} required maxLength={60} />
        </label>
        <label htmlFor="child-birth-year">
          {t('spaces.household.fields.birthYear')}
          <input id="child-birth-year" type="number" min="1900" max={new Date().getFullYear()} value={birthYear} onChange={(event) => setBirthYear(event.target.value)} required />
        </label>
      </div>
      <p className="spaces-help">{t('spaces.household.minimalDataHelp')}</p>
      <div className="spaces-actions">
        <Button type="submit">{t('spaces.save')}</Button>
        <Button type="button" variant="secondary" onClick={onDone}>
          {t('spaces.cancel')}
        </Button>
      </div>
    </form>
  );
}

function ProvisionForm({ t, spaceId, currency, run, onDone }) {
  const [label, setLabel] = useState('');
  const [plannedAmount, setPlannedAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [alreadyProvisioned, setAlreadyProvisioned] = useState('');
  const [error, setError] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    const planned = toMinorUnits(plannedAmount, currency);
    if (planned === null || !targetDate) return;
    const already = alreadyProvisioned ? toMinorUnits(alreadyProvisioned, currency, { allowZero: true }) : 0;
    const outcome = await run(
      () =>
        api.post(`/fin/espaces/${spaceId}/provisions`, {
          label: label.trim(),
          plannedAmount: planned,
          currency,
          targetDate: new Date(targetDate).toISOString(),
          alreadyProvisioned: already ?? 0,
        }),
      'spaces.household.provisionAdded',
    );
    if (outcome.ok) onDone();
    else setError(t('spaces.household.errors.refused'));
  };

  return (
    <form className="spaces-form" onSubmit={submit}>
      {error && <p className="form-error">{error}</p>}
      <div className="spaces-form-grid">
        <label htmlFor="provision-label">
          {t('spaces.household.fields.label')}
          <input id="provision-label" type="text" value={label} onChange={(event) => setLabel(event.target.value)} required maxLength={80} />
        </label>
        <AmountField id="provision-planned" label={t('spaces.household.fields.plannedAmount')} value={plannedAmount} currency={currency} onChange={setPlannedAmount} required />
        <label htmlFor="provision-date">
          {t('spaces.household.fields.targetDate')}
          <input id="provision-date" type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} required />
        </label>
        <AmountField id="provision-already" label={t('spaces.household.fields.alreadyProvisioned')} value={alreadyProvisioned} currency={currency} onChange={setAlreadyProvisioned} />
      </div>
      <div className="spaces-actions">
        <Button type="submit">{t('spaces.save')}</Button>
        <Button type="button" variant="secondary" onClick={onDone}>
          {t('spaces.cancel')}
        </Button>
      </div>
    </form>
  );
}
