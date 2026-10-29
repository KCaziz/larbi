import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { CheckCheck, Copy, Download, ListChecks, Paperclip, Pencil, Plus, Search, Tag, Trash2, TriangleAlert } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { formatAmount, formatDate } from '../../lib/format.js';
import { fromMinorUnits, toMinorUnits } from '../../lib/money.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import AmountField from '../../components/fincludia/AmountField.jsx';
import CategoryOptions from '../../components/fincludia/CategoryOptions.jsx';
import CategoryChip from '../../components/fincludia/CategoryChip.jsx';
import { flowClass, flowOf } from '../../lib/flows.js';
import '../argent/MyMoney.css';
import './Movements.css';

// « Mouvements » (P8-07, screens TRX-01 to TRX-04): revenues, expenses and
// transfers by tab, the complete entry, correcting, duplicating and deleting a
// movement, and the clearing screen (« pointage », AN-F004). Every total comes
// from the server; nothing is recomputed here.
//
// P8-25: the entry (TRX-02), a movement's detail and correction (TRX-03) and
// the clearing (TRX-04) each have their own address — `/app/mouvements/nouveau`,
// `/app/mouvements/:id`, `/app/mouvements/:id/modifier`,
// `/app/mouvements/pointage` — built from the components exported here. This
// page lists, filters and leads to them.
const TABS = ['all', 'income', 'expense', 'transfers'];
const EMPTY_FILTERS = {
  text: '',
  accountId: '',
  categoryId: '',
  tagId: '',
  clearing: '',
  uncategorised: false,
  from: '',
  to: '',
  minAmount: '',
  maxAmount: '',
  sort: 'date_desc',
};

export default function MovementsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const currency = user?.finCurrency ?? 'DZD';
  const [searchParams] = useSearchParams();
  const startFilters = {
    ...EMPTY_FILTERS,
    accountId: searchParams.get('compte') ?? '',
    categoryId: searchParams.get('categorie') ?? '',
    uncategorised: searchParams.get('sansCategorie') === '1',
  };
  const [tab, setTab] = useState('all');
  const [filters, setFilters] = useState(startFilters);
  const [applied, setApplied] = useState(startFilters);
  const location = useLocation();
  const [message, setMessage] = useState(location.state?.message ? { kind: 'ok', text: t(location.state.message) } : null);
  useDocumentMeta(t('movements.title'), t('movements.intro'));

  const query = useMemo(() => buildQuery(applied, tab, currency), [applied, tab, currency]);
  const history = useApi(`/fin/transactions?${query}`);
  const { lookups, accounts, tags, references } = useMovementLookups();

  async function run(action, okKey) {
    setMessage(null);
    try {
      const data = await action();
      setMessage({ kind: 'ok', text: t(okKey) });
      history.reload();
      accounts.reload();
      return { ok: true, data };
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 422: 'myMoney.errors.refused' })) });
      return { ok: false };
    }
  }

  return (
    <>
      <PageHeader icon={ListChecks} title={t('movements.title')} subtitle={t('movements.intro')} maxWidth={1040} />
      <div className="money-page">
        {message && (
          <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
            {message.text}
          </p>
        )}

        <div className="movements-actions">
          <Button to="/app/mouvements/nouveau">
            <Plus size={16} aria-hidden="true" /> {t('myMoney.addTitle')}
          </Button>
          <Button to="/app/mouvements/pointage" variant="secondary">
            <CheckCheck size={16} aria-hidden="true" /> {t('movements.tabs.clearing')}
          </Button>
        </div>

        <div className="movements-tabs" role="tablist" aria-label={t('movements.tabsLabel')}>
          {TABS.map((key) => (
            <button key={key} type="button" role="tab" aria-selected={tab === key} className={tab === key ? 'movements-tab active' : 'movements-tab'} onClick={() => setTab(key)}>
              {t(`movements.tabs.${key}`)}
            </button>
          ))}
        </div>

        <section>
            <Filters filters={filters} setFilters={setFilters} lookups={lookups} references={references.data} query={query} onApply={() => setApplied(filters)} onClear={() => {
              setFilters(EMPTY_FILTERS);
              setApplied(EMPTY_FILTERS);
            }} />
            {history.status === 'error' && <ErrorState message={t('state.loadError')} onRetry={history.reload} />}
            {!history.data && history.status === 'loading' && <LoadingState />}
            {history.data && (
              <History
                data={history.data}
                currency={currency}
                lookups={lookups}
                run={run}
              />
            )}
        </section>

        <TagManager lookups={lookups} reload={tags.reload} />
      </div>
    </>
  );
}

function buildQuery(filters, tab, currency) {
  const params = new URLSearchParams();
  if (tab === 'income' || tab === 'expense') params.set('kind', tab);
  if (tab === 'transfers') params.set('tab', 'transfers');
  if (filters.text) params.set('text', filters.text);
  if (filters.accountId) params.set('accountId', filters.accountId);
  if (filters.tagId) params.set('tagId', filters.tagId);
  if (filters.clearing) params.set('clearing', filters.clearing);
  if (filters.categoryId) params.set('categoryId', filters.categoryId);
  if (filters.uncategorised) params.set('uncategorised', 'true');
  if (filters.from) params.set('from', new Date(filters.from).toISOString());
  if (filters.to) params.set('to', new Date(`${filters.to}T23:59:59`).toISOString());
  const min = toMinorUnits(filters.minAmount, currency, { allowZero: true });
  const max = toMinorUnits(filters.maxAmount, currency, { allowZero: true });
  if (min !== null) params.set('minAmount', String(min));
  if (max !== null) params.set('maxAmount', String(max));
  if (filters.sort && filters.sort !== 'date_desc') params.set('sort', filters.sort);
  return params.toString();
}

// The lists the entry and the rows need to name things (categories, accounts,
// tags, payment methods), shared by the list and the screens of P8-25.
export function useMovementLookups() {
  const categories = useApi('/fin/categories');
  const references = useApi('/fin/argent/references');
  const accounts = useApi('/fin/comptes');
  const tags = useApi('/fin/etiquettes');
  const lookups = useMemo(
    () => ({
      categories: (categories.data?.groups ?? []).flatMap((group) => group.categories),
      categoryGroups: categories.data?.groups ?? [],
      accounts: accounts.data?.accounts ?? [],
      tags: tags.data?.tags ?? [],
      paymentMethods: references.data?.paymentMethodReference ?? [],
    }),
    [categories.data, accounts.data, tags.data, references.data],
  );
  return { lookups, accounts, tags, references };
}

// ---- entry -------------------------------------------------------------------

// The complete entry of TRX-02 (tab 08): amount, description, category and
// sub-category, account, payment method, date, tag, payer, place. « Enregistrer
// et nouveau » keeps the context. A suspected duplicate is asked BEFORE saving
// and never removed for the person (P8-07). The same form corrects a movement
// (with an optional reason) and starts a copy of one.
export function Entry({ currency, lookups, draft, onDone, run }) {
  const { t } = useTranslation();
  const today = new Date().toISOString().slice(0, 10);
  const source = draft?.transaction ?? null;
  const editing = draft?.mode === 'edit';
  const blank = {
    kind: 'expense',
    amount: '',
    occurredAt: today,
    note: '',
    categoryId: '',
    subcategory: '',
    accountId: '',
    paymentMethod: '',
    tagId: '',
    payer: '',
    place: '',
    planned: false,
    reason: '',
  };
  const [form, setForm] = useState(() =>
    source
      ? {
          ...blank,
          kind: source.kind,
          amount: fromMinorUnits(source.value, source.currency),
          occurredAt: editing ? new Date(source.occurredAt).toISOString().slice(0, 10) : today,
          note: source.note ?? '',
          categoryId: source.categoryId ?? '',
          subcategory: source.subcategory ?? '',
          accountId: source.accountId ?? '',
          paymentMethod: source.paymentMethod ?? '',
          tagId: source.tagId ?? '',
          payer: source.payer ?? '',
          place: source.place ?? '',
        }
      : blank,
  );
  const [pendingDuplicates, setPendingDuplicates] = useState(null);
  const account = lookups.accounts.find((row) => row.id === form.accountId);
  const entryCurrency = editing ? source.currency : (account?.currency ?? currency);

  const body = (value) => ({
    kind: form.kind,
    value,
    currency: entryCurrency,
    occurredAt: new Date(form.occurredAt).toISOString(),
    note: form.note.trim() || null,
    categoryId: form.categoryId || null,
    subcategory: form.subcategory.trim() || null,
    paymentMethod: form.paymentMethod || null,
    tagId: form.tagId || null,
    payer: form.payer.trim() || null,
    place: form.place.trim() || null,
    ...(form.accountId ? { accountId: form.accountId } : {}),
  });

  const save = async (keepGoing, { confirmed = false } = {}) => {
    const value = toMinorUnits(form.amount, entryCurrency);
    if (value === null) return;
    if (editing) {
      const res = await run(() => api.patch(`/fin/transactions/${source.id}`, { ...body(value), ...(form.reason.trim() ? { reason: form.reason.trim() } : {}) }), 'movements.corrected');
      if (res.ok) onDone();
      return;
    }
    if (!confirmed) {
      try {
        const check = await api.post('/fin/transactions/doublons', { kind: form.kind, value, currency: entryCurrency, occurredAt: new Date(form.occurredAt).toISOString(), categoryId: form.categoryId || null });
        if (check.duplicates?.length > 0) {
          setPendingDuplicates({ keepGoing, count: check.duplicates.length });
          return;
        }
      } catch {
        /* the check is a courtesy: if it fails, the entry still goes through */
      }
    }
    setPendingDuplicates(null);
    const res = await run(() => api.post('/fin/transactions', { ...body(value), planned: form.planned }), 'myMoney.added');
    if (!res.ok) return;
    setForm(keepGoing ? { ...form, amount: '', note: '', subcategory: '', place: '' } : blank);
    if (!keepGoing) onDone();
  };

  const field = (name) => ({ id: `entry-${name}`, value: form[name], onChange: (event) => setForm({ ...form, [name]: event.target.value }) });

  return (
    <section className="money-entry" id="saisie">
      <h2>
        {editing ? <Pencil size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />} {t(editing ? 'movements.editTitle' : 'myMoney.addTitle')}
      </h2>

      {pendingDuplicates && (
        <Notice variant="action-needed">
          <TriangleAlert size={15} aria-hidden="true" /> {t('movements.duplicateQuestion', { count: pendingDuplicates.count })}{' '}
          <button type="button" className="money-plain" onClick={() => save(pendingDuplicates.keepGoing, { confirmed: true })}>
            {t('movements.saveAnyway')}
          </button>{' '}
          <button type="button" className="money-plain" onClick={() => setPendingDuplicates(null)}>
            {t('finCategories.cancel')}
          </button>
        </Notice>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          save(false);
        }}
      >
        <div className="money-entry-grid">
          <div className="fin-field">
            <label htmlFor="entry-kind">{t('myMoney.kind')}</label>
            <select {...field('kind')} disabled={editing} onChange={(event) => setForm({ ...form, kind: event.target.value, planned: false })}>
              <option value="expense">{t('myMoney.kinds.expense')}</option>
              <option value="income">{t('myMoney.kinds.income')}</option>
            </select>
          </div>

          <AmountField id="entry-amount" label={t('myMoney.amount')} value={form.amount} currency={entryCurrency} onChange={(amount) => setForm({ ...form, amount })} required />

          <div className="fin-field">
            <label htmlFor="entry-occurredAt">{t('myMoney.date')}</label>
            <input type="date" required {...field('occurredAt')} />
          </div>

          <div className="fin-field">
            <label htmlFor="entry-note">{t('movements.description')}</label>
            <input maxLength={300} {...field('note')} />
          </div>

          <div className="fin-field">
            <label htmlFor="entry-categoryId">{t('myMoney.category')}</label>
            <select {...field('categoryId')}>
              <option value="">{t('myMoney.noCategory')}</option>
              <CategoryOptions groups={lookups.categoryGroups} />
            </select>
            {/* P8-27: the chosen category with its colour, icon and group. */}
            {form.categoryId && <CategoryChip category={lookups.categories.find((row) => row.id === form.categoryId)} />}
          </div>

          <div className="fin-field">
            <label htmlFor="entry-subcategory">{t('myMoney.subcategory')}</label>
            <input maxLength={60} {...field('subcategory')} />
          </div>

          <div className="fin-field">
            <label htmlFor="entry-accountId">{t('movements.account')}</label>
            <select {...field('accountId')} disabled={editing}>
              <option value="">{t('movements.defaultAccount')}</option>
              {lookups.accounts
                .filter((row) => !row.archivedAt)
                .map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.icon} {row.label} ({row.currency})
                  </option>
                ))}
            </select>
          </div>

          <div className="fin-field">
            <label htmlFor="entry-paymentMethod">{t('myMoney.paymentMethod')}</label>
            <select {...field('paymentMethod')}>
              <option value="">{t('myMoney.notStated')}</option>
              {lookups.paymentMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.icon} {method.label}
                </option>
              ))}
            </select>
          </div>

          <div className="fin-field">
            <label htmlFor="entry-tagId">{t('movements.tag')}</label>
            <select {...field('tagId')}>
              <option value="">{t('movements.noTag')}</option>
              {lookups.tags
                .filter((tag) => !tag.archivedAt)
                .map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="fin-field">
            <label htmlFor="entry-payer">{t('movements.payer')}</label>
            <input maxLength={80} {...field('payer')} />
          </div>

          <div className="fin-field">
            <label htmlFor="entry-place">{t('movements.place')}</label>
            <input maxLength={120} {...field('place')} />
          </div>

          {editing && (
            <div className="fin-field">
              <label htmlFor="entry-reason">{t('movements.reason')}</label>
              <input maxLength={200} {...field('reason')} />
            </div>
          )}
        </div>

        {!editing && form.kind === 'expense' && (
          <label className="money-check" htmlFor="entry-planned">
            <input id="entry-planned" type="checkbox" checked={form.planned} onChange={(event) => setForm({ ...form, planned: event.target.checked })} />
            {t('myMoney.planned')}
          </label>
        )}

        <div className="money-entry-actions">
          <Button type="submit">{t('myMoney.save')}</Button>
          {!editing && (
            <button type="button" className="money-plain" onClick={() => save(true)}>
              {t('movements.saveAndNew')}
            </button>
          )}
          {draft && (
            <button type="button" className="money-plain" onClick={onDone}>
              {t('finCategories.cancel')}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

// ---- list --------------------------------------------------------------------

function Filters({ filters, setFilters, lookups, references, query, onApply, onClear }) {
  const { t } = useTranslation();
  const set = (name) => (event) => setFilters({ ...filters, [name]: event.target.value });
  return (
    <form
      className="money-filters"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onApply();
      }}
    >
      <div className="money-search">
        <Search size={17} aria-hidden="true" />
        <label className="sr-only" htmlFor="filter-text">
          {t('myMoney.searchLabel')}
        </label>
        <input id="filter-text" type="search" value={filters.text} onChange={set('text')} />
      </div>
      <label className="sr-only" htmlFor="filter-account">
        {t('movements.account')}
      </label>
      <select id="filter-account" value={filters.accountId} onChange={set('accountId')}>
        <option value="">{t('movements.allAccounts')}</option>
        {lookups.accounts.map((row) => (
          <option key={row.id} value={row.id}>
            {row.label}
          </option>
        ))}
      </select>
      <label className="sr-only" htmlFor="filter-category">
        {t('myMoney.category')}
      </label>
      <select id="filter-category" value={filters.categoryId} onChange={(event) => setFilters({ ...filters, categoryId: event.target.value, uncategorised: false })}>
        <option value="">{t('myMoney.allCategories')}</option>
        <CategoryOptions groups={lookups.categoryGroups} />
      </select>
      <label className="sr-only" htmlFor="filter-tag">
        {t('movements.tag')}
      </label>
      <select id="filter-tag" value={filters.tagId} onChange={set('tagId')}>
        <option value="">{t('movements.allTags')}</option>
        {lookups.tags.map((tag) => (
          <option key={tag.id} value={tag.id}>
            {tag.name}
          </option>
        ))}
      </select>
      <label className="sr-only" htmlFor="filter-clearing">
        {t('movements.clearing')}
      </label>
      <select id="filter-clearing" value={filters.clearing} onChange={set('clearing')}>
        <option value="">{t('movements.allClearing')}</option>
        {(references?.clearingStates ?? []).map((state) => (
          <option key={state} value={state}>
            {t(`movements.clearingStates.${state}`)}
          </option>
        ))}
      </select>
      <label className="sr-only" htmlFor="filter-from">
        {t('myMoney.from')}
      </label>
      <input id="filter-from" type="date" value={filters.from} onChange={set('from')} />
      <label className="sr-only" htmlFor="filter-to">
        {t('myMoney.to')}
      </label>
      <input id="filter-to" type="date" value={filters.to} onChange={set('to')} />
      <label className="sr-only" htmlFor="filter-min">
        {t('movements.minAmount')}
      </label>
      <input id="filter-min" inputMode="decimal" placeholder={t('movements.minAmount')} value={filters.minAmount} onChange={set('minAmount')} />
      <label className="sr-only" htmlFor="filter-max">
        {t('movements.maxAmount')}
      </label>
      <input id="filter-max" inputMode="decimal" placeholder={t('movements.maxAmount')} value={filters.maxAmount} onChange={set('maxAmount')} />
      <label className="money-check" htmlFor="filter-uncategorised">
        <input id="filter-uncategorised" type="checkbox" checked={filters.uncategorised} onChange={(event) => setFilters({ ...filters, uncategorised: event.target.checked, categoryId: '' })} />
        {t('myMoney.onlyUncategorised')}
      </label>
      <Button type="submit">{t('myMoney.filter')}</Button>
      <button type="button" className="money-plain" onClick={onClear}>
        {t('myMoney.clear')}
      </button>
      <a className="money-plain" href={`/api/fin/transactions/export?${query}`}>
        <Download size={15} aria-hidden="true" /> {t('myMoney.export')}
      </a>
    </form>
  );
}

function History({ data, currency, lookups, run }) {
  const { t, i18n } = useTranslation();
  const totals = data.totals;
  const money = (value) => (value === null ? t('fincludia.notComputed') : formatAmount(i18n.language, value, totals.currency ?? currency));
  return (
    <>
      {/* Totals OF THE FILTERED SET, transfers excluded (PB-F004, PB-F005). */}
      <p className="money-totals">{t('myMoney.filteredTotals', { count: data.total, income: money(totals.real.income), expenses: money(totals.real.expense) })}</p>
      {data.transactions.length === 0 ? (
        <Notice variant="info">{t('myMoney.noTransaction')}</Notice>
      ) : (
        <ul className="money-list">
          {data.transactions.map((transaction) => (
            <Row key={transaction.id} transaction={transaction} lookups={lookups} run={run} />
          ))}
        </ul>
      )}
      {data.pages > 1 && <p className="money-pages">{t('myMoney.pageOf', { page: data.page, pages: data.pages })}</p>}
    </>
  );
}

const SIGN = { income: '+', transfer_in: '+', expense: '−', transfer_out: '−' };

export function Row({ transaction, lookups, run, detail = true }) {
  const { t, i18n } = useTranslation();
  const transfer = Boolean(transaction.transferId);
  const category = lookups.categories.find((row) => row.id === transaction.categoryId);
  const account = lookups.accounts.find((row) => row.id === transaction.accountId);
  const tag = lookups.tags.find((row) => row.id === transaction.tagId);
  const method = lookups.paymentMethods.find((row) => row.id === transaction.paymentMethod);
  // P8-27: the row wears its flow's colour (income, expense, transfer,
  // savings), and its category its own — never the colour alone.
  const flow = flowOf(transaction, category);

  return (
    <li className={`${transaction.status === 'fictional' ? 'money-row money-row-simulation' : 'money-row'} movements-row ${flowClass(flow)}`}>
      <span className="money-row-date">
        {detail ? <Link to={`/app/mouvements/${transaction.id}`}>{formatDate(i18n.language, transaction.occurredAt)}</Link> : formatDate(i18n.language, transaction.occurredAt)}
      </span>
      <span className="money-row-amount flow-amount">
        {SIGN[transaction.kind]} {formatAmount(i18n.language, transaction.value, transaction.currency)}
      </span>
      <span className="money-row-category">
        {transfer ? <span className="flow-label">{t(`movements.kinds.${transaction.kind}`)}</span> : <CategoryChip category={category} fallback={t('myMoney.noCategory')} />}
        {!transfer && <span className="flow-label">{t(`flows.${flow}`)}</span>}
      </span>
      <span className="money-row-tags">
        {transaction.note && <span className="money-note">{transaction.note}</span>}
        {account && <span className="money-tag">{account.label}</span>}
        {method && <span className="money-tag">{method.label}</span>}
        {tag && (
          <span className="money-tag movements-tag" style={{ '--tag-color': tag.color }}>
            <Tag size={12} aria-hidden="true" /> {tag.name}
          </span>
        )}
        {transaction.payer && <span className="money-tag">{t('movements.paidBy', { payer: transaction.payer })}</span>}
        {transaction.place && <span className="money-tag">{transaction.place}</span>}
        {transaction.planned && <span className="money-tag">{t('myMoney.plannedTag')}</span>}
        {transaction.receipt && (
          <a className="money-tag money-receipt" href={`/api/fin/transactions/${transaction.id}/justificatif`}>
            <Paperclip size={13} aria-hidden="true" /> {t('myMoney.receipt')}
          </a>
        )}
      </span>
      <span className="movements-row-actions">
        <label className="sr-only" htmlFor={`clearing-${transaction.id}`}>
          {t('movements.clearing')}
        </label>
        <select
          id={`clearing-${transaction.id}`}
          className={`movements-clearing movements-clearing-${transaction.clearing}`}
          value={transaction.clearing}
          onChange={(event) => run(() => api.put(`/fin/transactions/${transaction.id}/pointage`, { clearing: event.target.value }), 'movements.cleared')}
        >
          {['unchecked', 'checked', 'reconciled', 'to_verify'].map((state) => (
            <option key={state} value={state}>
              {t(`movements.clearingStates.${state}`)}
            </option>
          ))}
        </select>
        {!transfer && (
          <>
            <Link className="money-icon" title={t('movements.edit')} to={`/app/mouvements/${transaction.id}/modifier`}>
              <Pencil size={15} aria-hidden="true" />
              <span className="sr-only">{t('movements.edit')}</span>
            </Link>
            <Link className="money-icon" title={t('movements.duplicate')} to={`/app/mouvements/nouveau?copie=${transaction.id}`}>
              <Copy size={15} aria-hidden="true" />
              <span className="sr-only">{t('movements.duplicate')}</span>
            </Link>
          </>
        )}
        <button type="button" className="money-icon" title={t('myMoney.delete')} onClick={() => run(() => api.delete(`/fin/transactions/${transaction.id}`), 'myMoney.deleted')}>
          <Trash2 size={15} aria-hidden="true" />
          <span className="sr-only">{t('myMoney.delete')}</span>
        </button>
      </span>
    </li>
  );
}

// ---- clearing (TRX-04) ---------------------------------------------------------

export function ClearingPanel({ lookups, run }) {
  const { t, i18n } = useTranslation();
  const view = useApi('/fin/pointage');
  if (view.status === 'loading' && !view.data) return <LoadingState />;
  if (view.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={view.reload} />;
  const { taux, counts, pending } = view.data;
  const set = async (id, clearing) => {
    await run(() => api.put(`/fin/transactions/${id}/pointage`, { clearing }), 'movements.cleared');
    view.reload();
  };

  return (
    <section className="movements-clearing-panel">
      <div className="fin-figure-grid">
        <FigureCard label={t('movements.clearingRate')} answer={taux} />
      </div>
      <p className="fin-hint">
        {['unchecked', 'checked', 'reconciled', 'to_verify'].map((state) => `${t(`movements.clearingStates.${state}`)} : ${counts[state]}`).join(' · ')}
      </p>
      {pending.length === 0 ? (
        <Notice variant="info">{t('movements.allCleared')}</Notice>
      ) : (
        <ul className="money-list">
          {pending.map((row) => {
            const category = lookups.categories.find((item) => item.id === row.categoryId);
            return (
              <li key={row.id} className="money-row">
                <span className="money-row-date">{formatDate(i18n.language, row.occurredAt)}</span>
                <span className="money-row-amount">{formatAmount(i18n.language, row.value, row.currency)}</span>
                <span className="money-row-category">
                  <CategoryChip category={category} fallback={row.note ?? t('myMoney.noCategory')} compact />
                </span>
                <span className="movements-row-actions">
                  <button type="button" className="money-plain" onClick={() => set(row.id, 'checked')}>
                    <CheckCheck size={15} aria-hidden="true" /> {t('movements.clearingStates.checked')}
                  </button>
                  <button type="button" className="money-plain" onClick={() => set(row.id, 'reconciled')}>
                    {t('movements.clearingStates.reconciled')}
                  </button>
                  {row.clearing !== 'to_verify' && (
                    <button type="button" className="money-plain" onClick={() => set(row.id, 'to_verify')}>
                      {t('movements.clearingStates.to_verify')}
                    </button>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

// ---- tags -------------------------------------------------------------------------

// « Étiquette » (tab 07B): a name and a colour, and optionally a category it
// follows automatically on new movements.
function TagManager({ lookups, reload }) {
  const { t } = useTranslation();
  const [state, setState] = useState({ name: '', color: '#2563A6', autoCategoryId: '' });
  const [error, setError] = useState(null);
  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      await api.post('/fin/etiquettes', { name: state.name.trim(), color: state.color, autoCategoryId: state.autoCategoryId || null });
      setState({ name: '', color: '#2563A6', autoCategoryId: '' });
      reload();
    } catch (err) {
      setError(t(errorKey(err, { 422: 'myMoney.errors.refused' })));
    }
  };
  return (
    <details className="movements-tags">
      <summary>
        <Tag size={15} aria-hidden="true" /> {t('movements.tagsTitle', { count: lookups.tags.length })}
      </summary>
      {lookups.tags.length > 0 && (
        <ul className="movements-tag-list">
          {lookups.tags.map((tag) => (
            <li key={tag.id} className="money-tag movements-tag" style={{ '--tag-color': tag.color }}>
              {tag.name}
              <button type="button" className="money-icon" title={t('myMoney.delete')} onClick={() => api.delete(`/fin/etiquettes/${tag.id}`, {}).then(reload)}>
                <Trash2 size={13} aria-hidden="true" />
                <span className="sr-only">{t('myMoney.delete')}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <form className="movements-tag-form" onSubmit={submit}>
        <div className="fin-field">
          <label htmlFor="tag-name">{t('movements.tagName')}</label>
          <input id="tag-name" value={state.name} maxLength={40} required onChange={(event) => setState({ ...state, name: event.target.value })} />
        </div>
        <div className="fin-field">
          <label htmlFor="tag-color">{t('movements.tagColor')}</label>
          <input id="tag-color" type="color" value={state.color} onChange={(event) => setState({ ...state, color: event.target.value })} />
        </div>
        <div className="fin-field">
          <label htmlFor="tag-auto">{t('movements.tagAuto')}</label>
          <select id="tag-auto" value={state.autoCategoryId} onChange={(event) => setState({ ...state, autoCategoryId: event.target.value })}>
            <option value="">{t('movements.tagAutoNone')}</option>
            <CategoryOptions groups={lookups.categoryGroups} />
          </select>
        </div>
        {error && <p className="form-error">{error}</p>}
        <Button type="submit">{t('movements.addTag')}</Button>
      </form>
    </details>
  );
}
