import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, CalendarDays, Check, PiggyBank, Plus, Repeat, Trash2, Wand2 } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { formatAmount, formatDate } from '../../lib/format.js';
import { toMinorUnits } from '../../lib/money.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import AmountField from '../../components/fincludia/AmountField.jsx';
import '../../components/fincludia/Fincludia.css';
import './Calendar.css';

// Financial calendar and recurring expenses (P6-07), screens C23 / SA03 / SA04.
//
// Three things live here, and the page keeps them visibly apart because they are
// three different promises: what is PLANNED (and can be confirmed with
// « Marquer payé »), what RECURS (confirmed subscriptions, plus the candidates
// ALG-04 proposes), and what is being PROVISIONED for a dated expense.
//
// No figure is computed here. Every number comes from the server with its
// formula, its version and its inputs (P4-09), which is also what the
// « Pourquoi ? » panel of each card shows.
export default function CalendarPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const currency = user?.finCurrency ?? 'DZD';
  // The opening balance is DECLARED: there is no account balance anywhere in
  // FINCLUDIA, so without it the server does not project the cash — it says so
  // instead of starting from an imaginary zero.
  const [balance, setBalance] = useState('');
  const [view, setView] = useState('month');
  const [message, setMessage] = useState(null);
  useDocumentMeta(t('calendar.title'), t('calendar.intro'));

  const declared = toMinorUnits(balance, currency, { allowZero: true });
  const query = new URLSearchParams({ vue: view });
  if (declared !== null) query.set('solde', String(declared));

  const calendar = useApi(`/fin/calendrier?${query}`);
  const recurrences = useApi('/fin/recurrences');
  const provisions = useApi('/fin/provisions');
  const subscriptions = useApi('/fin/recurrences/abonnements');
  const references = useApi('/fin/calendrier/references');

  function reloadAll() {
    calendar.reload();
    recurrences.reload();
    provisions.reload();
    subscriptions.reload();
  }

  async function run(action, okKey) {
    setMessage(null);
    try {
      await action();
      setMessage({ kind: 'ok', text: t(okKey) });
      reloadAll();
      return { ok: true };
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 422: 'calendar.errors.refused' })) });
      return { ok: false };
    }
  }

  if (calendar.status === 'loading' && !calendar.data) return <LoadingState />;
  if (calendar.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={calendar.reload} />;

  const cal = calendar.data.calendrier;
  const formulas = references.data?.formulas ?? [];
  const formula = (id) => formulas.find((row) => row.id === id) ?? null;

  return (
    <>
      <PageHeader icon={CalendarDays} title={t('calendar.title')} subtitle={t('calendar.intro')} />
      <div className="calendar-page">
        {message && (
          <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
            {message.text}
          </p>
        )}

        <section aria-labelledby="calendar-period">
          <h2 id="calendar-period">
            {t('calendar.period')}
            <span className="calendar-range">
              {formatDate(i18n.language, cal.periode.debut)} — {formatDate(i18n.language, cal.periode.fin)}
            </span>
          </h2>

          <div className="calendar-controls">
            <div className="calendar-views" role="group" aria-label={t('calendar.viewLabel')}>
              {(references.data?.views ?? ['month', 'week']).map((option) => (
                <button
                  key={option}
                  type="button"
                  className={option === view ? 'calendar-view calendar-view-on' : 'calendar-view'}
                  aria-pressed={option === view}
                  onClick={() => setView(option)}
                >
                  {t(`calendar.views.${option}`)}
                </button>
              ))}
            </div>

            <label className="calendar-balance" htmlFor="calendar-balance">
              {t('calendar.balanceLabel')}
              <input
                id="calendar-balance"
                type="text"
                inputMode="numeric"
                value={balance}
                onChange={(event) => setBalance(event.target.value)}
                placeholder={t('calendar.balancePlaceholder')}
              />
              <span className="calendar-currency">{currency}</span>
            </label>
          </div>

          <div className="fin-cards">
            <FigureCard label={t('calendar.plannedOut')} answer={cal.totalPrevuSorties} formula={formula('F003')} />
            <FigureCard label={t('calendar.plannedIn')} answer={cal.totalPrevuEntrees} formula={formula('F002')} />
            <FigureCard label={t('calendar.realOut')} answer={cal.totalReelSorties} formula={formula('F003')} />
          </div>

          <dl className="calendar-projection">
            <dt>{t('calendar.projectedCash')}</dt>
            <dd>{cal.cashFinProjete === null ? <span className="fin-not-computed">{t('fincludia.notComputed')}</span> : formatAmount(i18n.language, cal.cashFinProjete, cal.currency)}</dd>
            <dt>{t('calendar.firstTensionDay')}</dt>
            <dd>
              {cal.premierJourTension === null ? (
                <span className="fin-not-computed">{t('calendar.noTension')}</span>
              ) : (
                <span className="calendar-tension-flag">
                  <AlertTriangle size={14} aria-hidden="true" /> {formatDate(i18n.language, cal.premierJourTension)}
                </span>
              )}
            </dd>
          </dl>

          {cal.avertissements.length > 0 && (
            <ul className="calendar-warnings">
              {cal.avertissements.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          )}

          <DayList days={cal.jours} currency={cal.currency} language={i18n.language} t={t} run={run} />
        </section>

        <PlanSection t={t} run={run} />
        <RecurrenceSection
          t={t}
          language={i18n.language}
          currency={currency}
          recurrences={recurrences.data?.recurrences ?? []}
          subscriptions={subscriptions.data?.abonnements ?? null}
          formula={formula}
          references={references.data}
          run={run}
        />
        <ProvisionSection
          t={t}
          language={i18n.language}
          currency={currency}
          provisions={provisions.data?.provisions ?? []}
          formula={formula}
          run={run}
        />
      </div>
    </>
  );
}

// The days that have something on them. A calendar of thirty empty rows tells
// nobody anything; the empty days are counted in the period instead.
function DayList({ days, currency, language, t, run }) {
  const busy = days.filter((day) => day.evenements.length > 0);
  if (busy.length === 0) return <p className="calendar-empty">{t('calendar.nothingPlanned')}</p>;

  return (
    <ul className="calendar-days">
      {busy.map((day) => (
        <li key={day.jour} className={day.tension ? 'calendar-day calendar-day-tension' : 'calendar-day'}>
          <div className="calendar-day-head">
            <span className="calendar-day-date">{formatDate(language, day.jour)}</span>
            {day.cashProjete !== null && <span className="calendar-day-cash">{formatAmount(language, day.cashProjete, currency)}</span>}
            {day.tension && (
              <span className="calendar-badge-tension">
                <AlertTriangle size={13} aria-hidden="true" /> {t('calendar.tension')}
              </span>
            )}
          </div>
          <ul className="calendar-events">
            {day.evenements.map((event) => (
              <li key={`${event.kind}-${event.sourceId}-${day.jour}`} className={`calendar-event calendar-event-${event.kind}`}>
                <span className="calendar-event-kind">{t(`calendar.kinds.${event.kind}`)}</span>
                <span className="calendar-event-label">{event.label ?? event.categoryLabel ?? t('calendar.noLabel')}</span>
                <span className="calendar-event-amount">
                  {event.sens === 'in' ? '+' : '−'} {formatAmount(language, event.value, currency)}
                </span>
                {/* A provision shows what is already set aside: the rest is what
                    still has to be found by the due date. */}
                {event.kind === 'provision' && (
                  <span className="calendar-event-note">{t('calendar.provisioned', { amount: formatAmount(language, event.provisioned, currency) })}</span>
                )}
                {/* « Marquer payé »: the same row becomes real. Only a planned
                    movement can be confirmed — a recurrence occurrence is not a
                    row yet, and a provision is not a payment. */}
                {event.confirmable && (
                  <button
                    type="button"
                    className="calendar-pay"
                    onClick={() => run(() => api.post(`/fin/transactions/${event.sourceId}/payer`, {}), 'calendar.paid')}
                  >
                    <Check size={14} aria-hidden="true" /> {t('calendar.markPaid')}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

// « Plan du mois » (SA03): copy last month's planned movements into this one.
// Nothing realised is ever copied — that would invent a payment — and running
// it twice does not double the plan.
function PlanSection({ t, run }) {
  const month = new Date();
  const firstOfMonth = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1)).toISOString();
  const [result, setResult] = useState(null);

  return (
    <section aria-labelledby="calendar-plan">
      <h2 id="calendar-plan">{t('calendar.planTitle')}</h2>
      <p className="calendar-help">{t('calendar.planHelp')}</p>
      <Button
        type="button"
        variant="secondary"
        onClick={async () => {
          const outcome = await run(async () => {
            const res = await api.post('/fin/calendrier/plan', { month: firstOfMonth });
            setResult(res);
          }, 'calendar.planDone');
          if (!outcome.ok) setResult(null);
        }}
      >
        <Plus size={16} aria-hidden="true" /> {t('calendar.copyPlan')}
      </Button>
      {result && (
        <p className="calendar-help" role="status">
          {t('calendar.planResult', { created: result.created.length, skipped: result.skipped })}
        </p>
      )}
    </section>
  );
}

// Confirmed recurrences, their monthly and yearly cost, and the candidates
// ALG-04 proposes. The two are never mixed: a candidate is a proposal the
// person confirms, and the client requires exactly that.
function RecurrenceSection({ t, language, currency, recurrences, subscriptions, formula, references, run }) {
  const [adding, setAdding] = useState(false);
  const [showDetection, setShowDetection] = useState(false);
  const detection = useApi(showDetection ? '/fin/recurrences/detection' : null);

  return (
    <section aria-labelledby="calendar-recurrences">
      <h2 id="calendar-recurrences">
        <Repeat size={18} aria-hidden="true" /> {t('calendar.recurrencesTitle')}
      </h2>

      {subscriptions && (
        <div className="fin-cards">
          <FigureCard label={t('calendar.monthlyCost')} answer={subscriptions.coutMensuel} formula={formula('F003')} />
          <FigureCard label={t('calendar.yearlyCost')} answer={subscriptions.coutAnnuel} formula={formula('F049')} />
        </div>
      )}

      {recurrences.length === 0 ? (
        <p className="calendar-empty">{t('calendar.noRecurrence')}</p>
      ) : (
        <ul className="calendar-list">
          {recurrences.map((row) => (
            <li key={row.id} className="calendar-row">
              <span className="calendar-row-label">{row.label}</span>
              <span className="calendar-row-amount">{formatAmount(language, row.value, row.currency)}</span>
              <span className="calendar-tag">{t(`calendar.frequencies.${row.frequency}`, row.frequency)}</span>
              <span className="calendar-row-date">{formatDate(language, row.nextDate)}</span>
              {row.detected && <span className="calendar-tag calendar-tag-detected">{t('calendar.detected')}</span>}
              <button
                type="button"
                className="calendar-icon"
                onClick={() => run(() => api.delete(`/fin/recurrences/${row.id}`, {}), 'calendar.recurrenceDeleted')}
                aria-label={t('calendar.stopTracking', { label: row.label })}
                title={t('calendar.stopTrackingHelp')}
              >
                <Trash2 size={15} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {/* Deleting a recurrence stops TRACKING it. It cancels nothing: the client
          forbids any automatic termination, and FINCLUDIA never contacts a
          provider. The interface says so rather than leaving it to be assumed. */}
      <p className="calendar-help">{t('calendar.noCancellation')}</p>

      <div className="calendar-actions">
        <Button type="button" variant="secondary" onClick={() => setAdding((value) => !value)}>
          <Plus size={16} aria-hidden="true" /> {t('calendar.addRecurrence')}
        </Button>
        <Button type="button" variant="secondary" onClick={() => setShowDetection((value) => !value)}>
          <Wand2 size={16} aria-hidden="true" /> {t('calendar.detect')}
        </Button>
      </div>

      {adding && <RecurrenceForm t={t} currency={currency} references={references} run={run} onDone={() => setAdding(false)} />}

      {showDetection && (
        <div className="calendar-detection">
          <h3>{t('calendar.detectionTitle')}</h3>
          <p className="calendar-help">{t('calendar.detectionHelp')}</p>
          {detection.status === 'loading' && !detection.data && <LoadingState />}
          {detection.data && detection.data.candidats.length === 0 && <p className="calendar-empty">{t('calendar.noCandidate')}</p>}
          {detection.data && detection.data.candidats.length > 0 && (
            <ul className="calendar-list">
              {detection.data.candidats.map((candidate) => (
                <li key={candidate.label} className="calendar-row">
                  <span className="calendar-row-label">{candidate.label}</span>
                  <span className="calendar-row-amount">{formatAmount(language, candidate.amount, candidate.currency)}</span>
                  <span className="calendar-tag">{t('calendar.occurrences', { count: candidate.occurrences })}</span>
                  <span className="calendar-tag">
                    {candidate.frequency ? t(`calendar.frequencies.${candidate.frequency}`, candidate.frequency) : t('calendar.unknownFrequency')}
                  </span>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={!candidate.frequency}
                    onClick={() =>
                      run(
                        () =>
                          api.post('/fin/recurrences/confirmer', {
                            label: candidate.label,
                            kind: candidate.kind,
                            value: candidate.amount,
                            currency: candidate.currency,
                            frequency: candidate.frequency,
                            nextDate: candidate.nextExpected,
                            categoryId: candidate.categoryId,
                          }),
                        'calendar.confirmed',
                      )
                    }
                  >
                    {t('calendar.confirm')}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

function RecurrenceForm({ t, currency, references, run, onDone }) {
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('mensuel');
  const [kind, setKind] = useState('expense');
  const [nextDate, setNextDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState(null);

  async function submit(event) {
    event.preventDefault();
    setError(null);
    const value = toMinorUnits(amount, currency);
    if (value === null) {
      setError(t('calendar.errors.amount'));
      return;
    }
    const outcome = await run(
      () => api.post('/fin/recurrences', { label: label.trim(), kind, value, currency, frequency, nextDate: new Date(nextDate).toISOString() }),
      'calendar.recurrenceAdded',
    );
    if (outcome.ok) onDone();
  }

  return (
    <form className="calendar-form" onSubmit={submit}>
      <div className="calendar-form-grid">
        <label htmlFor="rec-label">
          {t('calendar.fields.label')}
          <input id="rec-label" type="text" value={label} onChange={(event) => setLabel(event.target.value)} required maxLength={80} />
        </label>
        <AmountField id="rec-amount" label={t('calendar.fields.amount')} value={amount} onChange={setAmount} currency={currency} required />
        <label htmlFor="rec-kind">
          {t('calendar.fields.kind')}
          <select id="rec-kind" value={kind} onChange={(event) => setKind(event.target.value)}>
            <option value="expense">{t('myMoney.kinds.expense')}</option>
            <option value="income">{t('myMoney.kinds.income')}</option>
          </select>
        </label>
        <label htmlFor="rec-frequency">
          {t('calendar.fields.frequency')}
          <select id="rec-frequency" value={frequency} onChange={(event) => setFrequency(event.target.value)}>
            {(references?.frequencies ?? ['mensuel']).map((option) => (
              <option key={option} value={option}>
                {t(`calendar.frequencies.${option}`, option)}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="rec-next">
          {t('calendar.fields.nextDate')}
          <input id="rec-next" type="date" value={nextDate} onChange={(event) => setNextDate(event.target.value)} required />
        </label>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="calendar-actions">
        <Button type="submit">{t('calendar.save')}</Button>
        <Button type="button" variant="secondary" onClick={onDone}>
          {t('calendar.cancel')}
        </Button>
      </div>
    </form>
  );
}

// Provisions: money set aside for a dated expense. A provision NEVER creates a
// realised expense — the client says so, and the page says so too, because
// somebody looking at "3 000 000 for September" needs to know it has not been
// spent.
function ProvisionSection({ t, language, currency, provisions, formula, run }) {
  const [adding, setAdding] = useState(false);

  return (
    <section aria-labelledby="calendar-provisions">
      <h2 id="calendar-provisions">
        <PiggyBank size={18} aria-hidden="true" /> {t('calendar.provisionsTitle')}
      </h2>
      <p className="calendar-help">{t('calendar.provisionsHelp')}</p>

      {provisions.length === 0 ? (
        <p className="calendar-empty">{t('calendar.noProvision')}</p>
      ) : (
        <ul className="calendar-provisions">
          {provisions.map((row) => (
            <li key={row.id} className="calendar-provision">
              <div className="calendar-provision-head">
                <span className="calendar-row-label">{row.label}</span>
                <span className={`calendar-tag calendar-state-${row.etat}`}>{t(`calendar.states.${row.etat}`)}</span>
                <button
                  type="button"
                  className="calendar-icon"
                  onClick={() => run(() => api.delete(`/fin/provisions/${row.id}`, {}), 'calendar.provisionDeleted')}
                  aria-label={t('calendar.deleteProvision', { label: row.label })}
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
              <dl className="calendar-provision-figures">
                <dt>{t('calendar.provisionTarget')}</dt>
                <dd>{formatAmount(language, row.value, row.currency)}</dd>
                <dt>{t('calendar.provisionSoFar')}</dt>
                <dd>{formatAmount(language, row.provisioned, row.currency)}</dd>
                <dt>{t('calendar.provisionLeft')}</dt>
                <dd>{formatAmount(language, row.reste, row.currency)}</dd>
                <dt>{t('calendar.provisionDue')}</dt>
                <dd>{formatDate(language, row.targetDate)}</dd>
              </dl>
              <FigureCard label={t('calendar.monthlyProvision')} answer={row.provisionMensuelle} formula={formula('F045')} />
            </li>
          ))}
        </ul>
      )}

      <Button type="button" variant="secondary" onClick={() => setAdding((value) => !value)}>
        <Plus size={16} aria-hidden="true" /> {t('calendar.addProvision')}
      </Button>
      {adding && <ProvisionForm t={t} currency={currency} run={run} onDone={() => setAdding(false)} />}
    </section>
  );
}

function ProvisionForm({ t, currency, run, onDone }) {
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [already, setAlready] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [error, setError] = useState(null);

  async function submit(event) {
    event.preventDefault();
    setError(null);
    const value = toMinorUnits(amount, currency);
    if (value === null || value <= 0) {
      setError(t('calendar.errors.amount'));
      return;
    }
    const provisioned = already.trim() === '' ? 0 : toMinorUnits(already, currency, { allowZero: true });
    if (provisioned === null) {
      setError(t('calendar.errors.amount'));
      return;
    }
    if (provisioned > value) {
      setError(t('calendar.errors.provisionedAboveValue'));
      return;
    }
    const outcome = await run(
      () => api.post('/fin/provisions', { label: label.trim(), value, currency, provisioned, targetDate: new Date(targetDate).toISOString() }),
      'calendar.provisionAdded',
    );
    if (outcome.ok) onDone();
  }

  return (
    <form className="calendar-form" onSubmit={submit}>
      <div className="calendar-form-grid">
        <label htmlFor="prov-label">
          {t('calendar.fields.label')}
          <input id="prov-label" type="text" value={label} onChange={(event) => setLabel(event.target.value)} required maxLength={80} />
        </label>
        <AmountField id="prov-amount" label={t('calendar.provisionTarget')} value={amount} onChange={setAmount} currency={currency} required />
        <AmountField id="prov-already" label={t('calendar.provisionSoFar')} value={already} onChange={setAlready} currency={currency} />
        <label htmlFor="prov-date">
          {t('calendar.provisionDue')}
          <input id="prov-date" type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} required />
        </label>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="calendar-actions">
        <Button type="submit">{t('calendar.save')}</Button>
        <Button type="button" variant="secondary" onClick={onDone}>
          {t('calendar.cancel')}
        </Button>
      </div>
    </form>
  );
}
