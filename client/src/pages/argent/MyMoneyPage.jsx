import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Paperclip, Plus, Search, Trash2, TriangleAlert, Wallet } from 'lucide-react';
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
import PeriodSelector from '../../components/fincludia/PeriodSelector.jsx';
import IncomeExpenseChart from '../../components/fincludia/IncomeExpenseChart.jsx';
import { periodRange } from '../../lib/finControls.js';
import { toMinorUnits } from '../../lib/money.js';
import './MyMoney.css';

// "Mon argent" (P6-04): the synthesis of screen C05, the quick entry of C07 and
// the history of C08, on one page because that is how the client's own screens
// chain together.
//
// Every figure here comes from the server with its formula, its version and its
// inputs: nothing is recomputed in the browser, and "non calculé" is shown as
// itself, never as zero.
const EMPTY_FILTERS = { text: '', kind: '', categoryId: '', uncategorised: false, from: '', to: '', minAmount: '', maxAmount: '', sort: 'date_desc' };

export default function MyMoneyPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [period, setPeriod] = useState('mois');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [applied, setApplied] = useState(EMPTY_FILTERS);
  const [message, setMessage] = useState(null);
  useDocumentMeta(t('myMoney.title'), t('myMoney.intro'));

  const query = useMemo(() => buildQuery(applied, user?.finCurrency ?? 'DZD'), [applied, user]);
  // The client's four windows (P1-12). The server computes the figures for the
  // period it is given; the browser only says which window was chosen, and
  // « mois » says nothing at all because that is already the server's default.
  //
  // The query string is built WITHOUT its `?`, and the `?` is written in the
  // URL itself, like the history request below. That is not a style choice: the
  // project's consistency check reads the literal path of every call to make
  // sure the server serves that method there, and it can only do that when the
  // part before the `?` is literal.
  const periodQuery = useMemo(() => {
    const range = periodRange(period);
    return range ? `from=${range.from}&to=${range.to}` : '';
  }, [period]);
  const synthesis = useApi(`/fin/argent/synthese?${periodQuery}`);
  // Changing the period changes the REQUEST, and `useApi` clears its data on a
  // path change — for a good reason in general (two different resources must
  // never be shown under each other's URL). Here the two requests are the same
  // resource over two windows, so the previous answer stays on screen while the
  // next one loads.
  //
  // Without this, choosing a period replaced the whole page with the loading
  // state, which unmounts the selector the person had just used along with
  // their scroll position: the control disappeared at the moment it was used.
  // The client's loading rule (tab `14_Etats_Alertes`) asks for the opposite —
  // a skeleton, and nothing lost.
  // State adjusted during render rather than a ref: React re-renders at once
  // with the new value, and a ref written while rendering is a value the next
  // render may not see.
  const [kept, setKept] = useState(null);
  if (synthesis.data && synthesis.data !== kept) setKept(synthesis.data);
  const loaded = synthesis.data ?? kept;
  const refreshing = synthesis.status === 'loading' && !synthesis.data;
  const history = useApi(`/fin/transactions?${query}`);
  // Revenus vs dépenses over the last few months (P6-23) — independent of the
  // period selector above, which only moves the CURRENT synthesis.
  const moneyHistory = useApi('/fin/argent/synthese/historique');
  const categories = useApi('/fin/categories');
  const references = useApi('/fin/argent/references');

  // From the kept answer, never from the in-flight one: while a window reloads
  // it would fall back to the account's default currency and the amounts
  // already on screen would be relabelled for an instant.
  const currency = loaded?.synthese?.currency ?? user?.finCurrency ?? 'DZD';
  const formulas = useMemo(() => new Map((references.data?.formulas ?? []).map((formula) => [formula.id, formula])), [references.data]);
  const flatCategories = useMemo(
    () => (categories.data?.groups ?? []).flatMap((group) => group.categories.map((category) => ({ ...category, family: group.label }))),
    [categories.data],
  );

  async function run(action, okKey) {
    setMessage(null);
    try {
      const data = await action();
      setMessage({ kind: 'ok', text: t(okKey) });
      history.reload();
      synthesis.reload();
      return { ok: true, data };
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 422: 'myMoney.errors.refused' })) });
      return { ok: false };
    }
  }

  if (!loaded && synthesis.status === 'loading') return <LoadingState />;
  if (synthesis.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={synthesis.reload} />;

  const s = loaded.synthese;

  return (
    <>
      <PageHeader icon={Wallet} title={t('myMoney.title')} subtitle={t('myMoney.intro')} maxWidth={1040} />
      <div className="money-page">
        {message && (
          <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
            {message.text}
          </p>
        )}

        {/* Several currencies in one account: nothing is totalled, because
            converting without a dated rate would produce a wrong number. */}
        {s.mixedCurrencies && <Notice variant="action-needed">{t('myMoney.mixedCurrencies')}</Notice>}

        <section aria-busy={refreshing || undefined}>
          <PeriodSelector value={period} onChange={setPeriod} name="money-period" />
          <h2>
            {t('myMoney.synthesisTitle')}{' '}
            <span className="money-period">
              {formatDate(i18n.language, loaded.periode.debut)} – {formatDate(i18n.language, loaded.periode.fin)}
            </span>
          </h2>
          <div className="fin-figure-grid">
            <FigureCard label={t('myMoney.income')} answer={s.revenus} formula={formulas.get('F002')} />
            <FigureCard label={t('myMoney.expenses')} answer={s.depenses} formula={formulas.get('F003')} />
            <FigureCard label={t('myMoney.netFlow')} answer={s.fluxNet} formula={formulas.get('F004')} />
          </div>

          {moneyHistory.data?.points && (
            <IncomeExpenseChart points={moneyHistory.data.points} currency={moneyHistory.data.currency} />
          )}

          {/* Real and fictional are never added: the simulation block is a
              separate card with a permanent badge. */}
          {s.simulation && (
            <div className="money-simulation">
              <h3>
                {t('myMoney.simulationTitle')} <span className="fin-badge-simulation">{s.simulation.badge}</span>
              </h3>
              <p>
                {t('myMoney.simulationLine', {
                  income: s.simulation.revenus === null ? t('fincludia.notComputed') : formatAmount(i18n.language, s.simulation.revenus, currency),
                  expenses: s.simulation.depenses === null ? t('fincludia.notComputed') : formatAmount(i18n.language, s.simulation.depenses, currency),
                })}
              </p>
            </div>
          )}

          <dl className="money-extras">
            <dt>{t('myMoney.plannedVsReal')}</dt>
            <dd>
              {t('myMoney.plannedVsRealLine', {
                planned: s.prevuReel.prevu === null ? t('fincludia.notComputed') : formatAmount(i18n.language, s.prevuReel.prevu, currency),
                real: s.prevuReel.reel === null ? t('fincludia.notComputed') : formatAmount(i18n.language, s.prevuReel.reel, currency),
              })}
            </dd>
            <dt>{t('myMoney.trend')}</dt>
            <dd>
              {s.tendance.variation === null
                ? t('fincludia.notComputed')
                : t('myMoney.trendLine', { amount: formatAmount(i18n.language, s.tendance.variation, currency) })}
            </dd>
            {s.nonCategorisees > 0 && (
              <>
                <dt>{t('myMoney.uncategorised')}</dt>
                <dd>
                  <button type="button" className="money-plain" onClick={() => setApplied({ ...EMPTY_FILTERS, uncategorised: true })}>
                    {t('myMoney.uncategorisedCount', { count: s.nonCategorisees })}
                  </button>
                </dd>
              </>
            )}
          </dl>

          {s.repartition.length > 0 && (
            <div className="money-breakdown">
              <h3>{t('myMoney.breakdown')}</h3>
              <ul>
                {s.repartition.map((row) => (
                  <li key={row.categoryId ?? 'none'}>
                    <span>{row.label ?? t('myMoney.noCategory')}</span>
                    <strong>{formatAmount(i18n.language, row.total, currency)}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <QuickEntry currency={currency} categoryGroups={categories.data?.groups ?? []} references={references.data} run={run} />

        <section>
          <h2>{t('myMoney.historyTitle')}</h2>

          <form
            className="money-filters"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              setApplied(filters);
            }}
          >
            <div className="money-search">
              <Search size={17} aria-hidden="true" />
              <label className="sr-only" htmlFor="money-text">
                {t('myMoney.searchLabel')}
              </label>
              <input id="money-text" type="search" value={filters.text} onChange={(event) => setFilters({ ...filters, text: event.target.value })} />
            </div>

            <label className="sr-only" htmlFor="money-kind">
              {t('myMoney.kind')}
            </label>
            <select id="money-kind" value={filters.kind} onChange={(event) => setFilters({ ...filters, kind: event.target.value })}>
              <option value="">{t('myMoney.allKinds')}</option>
              <option value="income">{t('myMoney.kinds.income')}</option>
              <option value="expense">{t('myMoney.kinds.expense')}</option>
            </select>

            <label className="sr-only" htmlFor="money-category">
              {t('myMoney.category')}
            </label>
            <select id="money-category" value={filters.categoryId} onChange={(event) => setFilters({ ...filters, categoryId: event.target.value, uncategorised: false })}>
              <option value="">{t('myMoney.allCategories')}</option>
              <CategoryOptions groups={categories.data?.groups ?? []} />
            </select>

            <label className="sr-only" htmlFor="money-from">
              {t('myMoney.from')}
            </label>
            <input id="money-from" type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} />
            <label className="sr-only" htmlFor="money-to">
              {t('myMoney.to')}
            </label>
            <input id="money-to" type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} />

            <label className="sr-only" htmlFor="money-sort">
              {t('myMoney.sort')}
            </label>
            <select id="money-sort" value={filters.sort} onChange={(event) => setFilters({ ...filters, sort: event.target.value })}>
              {(references.data?.sorts ?? []).map((sort) => (
                <option key={sort} value={sort}>
                  {t(`myMoney.sorts.${sort}`)}
                </option>
              ))}
            </select>

            <label className="money-check" htmlFor="money-uncategorised">
              <input
                id="money-uncategorised"
                type="checkbox"
                checked={filters.uncategorised}
                onChange={(event) => setFilters({ ...filters, uncategorised: event.target.checked, categoryId: '' })}
              />
              {t('myMoney.onlyUncategorised')}
            </label>

            <Button type="submit">{t('myMoney.filter')}</Button>
            <button
              type="button"
              className="money-plain"
              onClick={() => {
                setFilters(EMPTY_FILTERS);
                setApplied(EMPTY_FILTERS);
              }}
            >
              {t('myMoney.clear')}
            </button>
            {/* The export carries the SAME filters as the list on screen: an
                export that did not match what is shown would be a trap. */}
            <a className="money-plain" href={`/api/fin/transactions/export?${query}`}>
              <Download size={15} aria-hidden="true" /> {t('myMoney.export')}
            </a>
          </form>

          {history.status === 'error' && <ErrorState message={t('state.loadError')} onRetry={history.reload} />}
          {/* Rendered from whatever is loaded, including during a reload: the
              list must not vanish every time a movement is saved. */}
          {history.data && <History data={history.data} categories={flatCategories} currency={currency} run={run} />}
        </section>
      </div>
    </>
  );
}

// The 91 categories as <optgroup>s by family. A flat list would put the family
// name in every option, and a <select> is as wide as its widest option — which
// is what pushed the page past the viewport.
function CategoryOptions({ groups }) {
  return groups
    .filter((group) => group.categories.length > 0)
    .map((group) => (
      <optgroup key={group.code} label={group.label}>
        {group.categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.label}
          </option>
        ))}
      </optgroup>
    ));
}

function buildQuery(filters, currency) {
  const params = new URLSearchParams();
  if (filters.text) params.set('text', filters.text);
  if (filters.kind) params.set('kind', filters.kind);
  if (filters.categoryId) params.set('categoryId', filters.categoryId);
  if (filters.uncategorised) params.set('uncategorised', 'true');
  if (filters.from) params.set('from', new Date(filters.from).toISOString());
  if (filters.to) params.set('to', new Date(`${filters.to}T23:59:59`).toISOString());
  // 0 is a legitimate bound here ("expenses of exactly nothing upwards"), so
  // the conversion is allowed to return it instead of reading it as empty.
  const min = toMinorUnits(filters.minAmount, currency, { allowZero: true });
  const max = toMinorUnits(filters.maxAmount, currency, { allowZero: true });
  if (min !== null) params.set('minAmount', String(min));
  if (max !== null) params.set('maxAmount', String(max));
  if (filters.sort && filters.sort !== 'date_desc') params.set('sort', filters.sort);
  return params.toString();
}

// Quick entry (screen C07), with the client's own « Enregistrer et ajouter »:
// the form keeps its type, its date and its category so a series of movements
// can be entered without starting over each time.
function QuickEntry({ currency, categoryGroups, references, run }) {
  const { t } = useTranslation();
  const today = new Date().toISOString().slice(0, 10);
  const blank = { kind: 'expense', amount: '', occurredAt: today, categoryId: '', subcategory: '', paymentMethod: '', note: '', shared: false, planned: false };
  const [form, setForm] = useState(blank);
  const [duplicates, setDuplicates] = useState([]);

  const submit = async (keepGoing) => {
    const amount = toMinorUnits(form.amount, currency);
    if (amount === null) return;
    const res = await run(
      () =>
        api.post('/fin/transactions', {
          kind: form.kind,
          value: amount,
          currency,
          occurredAt: new Date(form.occurredAt).toISOString(),
          categoryId: form.categoryId || null,
          subcategory: form.subcategory.trim() || null,
          paymentMethod: form.paymentMethod || null,
          note: form.note.trim() || null,
          shared: form.shared,
          planned: form.planned,
        }),
      'myMoney.added',
    );
    if (!res.ok) return;
    setDuplicates(res.data.duplicates ?? []);
    // "Enregistrer et ajouter" keeps the context, only the amount and the note
    // are cleared: those are what change from one movement to the next.
    setForm(keepGoing ? { ...form, amount: '', note: '', subcategory: '' } : blank);
  };

  return (
    <section className="money-entry">
      <h2>
        <Plus size={18} aria-hidden="true" /> {t('myMoney.addTitle')}
      </h2>

      {/* A suspected duplicate is SIGNALLED, never refused: two identical
          coffees in one morning are perfectly real. */}
      {duplicates.length > 0 && (
        <Notice variant="action-needed">
          <TriangleAlert size={15} aria-hidden="true" /> {t('myMoney.duplicate', { count: duplicates.length })}
        </Notice>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit(false);
        }}
      >
        <div className="money-entry-grid">
          <div className="fin-field">
            <label htmlFor="entry-kind">{t('myMoney.kind')}</label>
            <select id="entry-kind" value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value, planned: false })}>
              <option value="expense">{t('myMoney.kinds.expense')}</option>
              <option value="income">{t('myMoney.kinds.income')}</option>
            </select>
          </div>

          <AmountField id="entry-amount" label={t('myMoney.amount')} value={form.amount} currency={currency} onChange={(amount) => setForm({ ...form, amount })} required />

          <div className="fin-field">
            <label htmlFor="entry-date">{t('myMoney.date')}</label>
            <input id="entry-date" type="date" value={form.occurredAt} onChange={(event) => setForm({ ...form, occurredAt: event.target.value })} required />
            {/* A future date is only legitimate for a planned expense: the
                server refuses the rest, so the hint says so here too. */}
            <p className="fin-hint">{t('myMoney.futureHint')}</p>
          </div>

          <div className="fin-field">
            <label htmlFor="entry-category">{t('myMoney.category')}</label>
            <select id="entry-category" value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
              <option value="">{t('myMoney.noCategory')}</option>
              <CategoryOptions groups={categoryGroups} />
            </select>
          </div>

          <div className="fin-field">
            <label htmlFor="entry-subcategory">{t('myMoney.subcategory')}</label>
            <input id="entry-subcategory" value={form.subcategory} maxLength={60} onChange={(event) => setForm({ ...form, subcategory: event.target.value })} />
          </div>

          <div className="fin-field">
            <label htmlFor="entry-payment">{t('myMoney.paymentMethod')}</label>
            <select id="entry-payment" value={form.paymentMethod} onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })}>
              <option value="">{t('myMoney.notStated')}</option>
              {(references?.paymentMethods ?? []).map((method) => (
                <option key={method} value={method}>
                  {t(`myMoney.paymentMethods.${method}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="fin-field">
          <label htmlFor="entry-note">{t('myMoney.note')}</label>
          <input id="entry-note" value={form.note} maxLength={300} onChange={(event) => setForm({ ...form, note: event.target.value })} />
        </div>

        <div className="money-entry-flags">
          <label className="money-check" htmlFor="entry-shared">
            <input id="entry-shared" type="checkbox" checked={form.shared} onChange={(event) => setForm({ ...form, shared: event.target.checked })} />
            {t('myMoney.shared')}
          </label>
          {form.kind === 'expense' && (
            <label className="money-check" htmlFor="entry-planned">
              <input id="entry-planned" type="checkbox" checked={form.planned} onChange={(event) => setForm({ ...form, planned: event.target.checked })} />
              {t('myMoney.planned')}
            </label>
          )}
        </div>

        <div className="money-entry-actions">
          <Button type="submit">{t('myMoney.save')}</Button>
          <button type="button" className="money-plain" onClick={() => submit(true)}>
            {t('myMoney.saveAndAdd')}
          </button>
        </div>
      </form>
    </section>
  );
}

function History({ data, categories, currency, run }) {
  const { t, i18n } = useTranslation();
  const totals = data.totals;

  return (
    <>
      {/* Totals OF THE FILTERED SET: a total that ignored the filters would
          describe a list nobody is looking at. */}
      <p className="money-totals">
        {t('myMoney.filteredTotals', {
          count: data.total,
          income: totals.real.income === null ? t('fincludia.notComputed') : formatAmount(i18n.language, totals.real.income, totals.currency ?? currency),
          expenses: totals.real.expense === null ? t('fincludia.notComputed') : formatAmount(i18n.language, totals.real.expense, totals.currency ?? currency),
        })}
        {/* Planned and fictional are reported BESIDE the real total, never
            inside it: one has not happened, the other is not real money. */}
        {totals.planned && (
          <span className="money-tag">
            {t('myMoney.plusPlanned', {
              count: totals.counts.planned,
              amount:
                totals.planned.expense === null ? t('fincludia.notComputed') : formatAmount(i18n.language, totals.planned.expense, totals.currency ?? currency),
            })}
          </span>
        )}
        {totals.fictional && <span className="fin-badge-simulation">{t('myMoney.plusFictional', { count: totals.counts.fictional })}</span>}
      </p>

      {data.transactions.length === 0 ? (
        <Notice variant="info">{t('myMoney.noTransaction')}</Notice>
      ) : (
        <ul className="money-list">
          {data.transactions.map((transaction) => (
            <Row key={transaction.id} transaction={transaction} categories={categories} run={run} />
          ))}
        </ul>
      )}

      {data.pages > 1 && <p className="money-pages">{t('myMoney.pageOf', { page: data.page, pages: data.pages })}</p>}
    </>
  );
}

function Row({ transaction, categories, run }) {
  const { t, i18n } = useTranslation();
  const fictional = transaction.status === 'fictional';

  return (
    <li className={fictional ? 'money-row money-row-simulation' : 'money-row'}>
      <span className="money-row-date">{formatDate(i18n.language, transaction.occurredAt)}</span>
      <span className={transaction.kind === 'income' ? 'money-row-amount money-in' : 'money-row-amount'}>
        {transaction.kind === 'income' ? '+' : '−'} {formatAmount(i18n.language, transaction.value, transaction.currency)}
      </span>

      {/* Recategorisation in place (screen C08): the most common correction,
          so it does not need a form of its own. */}
      <span className="money-row-category">
        <label className="sr-only" htmlFor={`cat-${transaction.id}`}>
          {t('myMoney.category')}
        </label>
        <select
          id={`cat-${transaction.id}`}
          value={transaction.categoryId ?? ''}
          onChange={(event) => run(() => api.patch(`/fin/transactions/${transaction.id}`, { categoryId: event.target.value || null }), 'myMoney.recategorised')}
        >
          <option value="">{t('myMoney.noCategory')}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </span>

      <span className="money-row-tags">
        {transaction.note && <span className="money-note">{transaction.note}</span>}
        {transaction.planned && <span className="money-tag">{t('myMoney.plannedTag')}</span>}
        {transaction.shared && <span className="money-tag">{t('myMoney.sharedTag')}</span>}
        {fictional && <span className="fin-badge-simulation">{t('fincludia.simulationBadge')}</span>}
        {transaction.receipt && (
          <a className="money-tag money-receipt" href={`/api/fin/transactions/${transaction.id}/justificatif`}>
            <Paperclip size={13} aria-hidden="true" /> {t('myMoney.receipt')}
          </a>
        )}
      </span>

      <button
        type="button"
        className="money-icon"
        title={t('myMoney.delete')}
        onClick={() => run(() => api.delete(`/fin/transactions/${transaction.id}`), 'myMoney.deleted')}
      >
        <Trash2 size={15} aria-hidden="true" />
        <span className="sr-only">{t('myMoney.delete')}</span>
      </button>
    </li>
  );
}
