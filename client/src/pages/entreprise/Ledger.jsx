import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Check, FileUp, Lock, Plus, Trash2, Undo2, Unlock, Wand2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatAmount, formatDate } from '../../lib/format.js';
import { fractionDigits, toMinorUnits } from '../../lib/money.js';
import { newIdempotencyKey } from '../../lib/organisation.js';
import Button from '../../components/ui/Button.jsx';
import Notice from '../../components/ui/Notice.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import AmountField from '../../components/fincludia/AmountField.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';

// P13-05, lot G, second part (2026-11-24): accounting (ECR-0108, 0243 to 0250,
// 0330), on the default SCF chart until the administration confirms it. Entries
// are drafts until validated; a validated entry is reversed, never changed; the
// statements are simplified and never certified.

const JOURNALS = ['VT', 'AC', 'BQ', 'CA', 'PA', 'OD', 'AN'];
const VIEWS = ['entries', 'balance', 'statements', 'assets', 'bank', 'chart', 'import', 'closing'];
const today = () => new Date().toISOString().slice(0, 10);
const yearStart = () => `${new Date().getUTCFullYear()}-01-01`;

export function LedgerSection({ business, can, run }) {
  const { t } = useTranslation();
  const [view, setView] = useState('entries');
  const [range, setRange] = useState({ from: yearStart(), to: today() });
  const query = new URLSearchParams(range).toString();
  const overview = useApi(`/fin/entreprise/compta?${query}`);
  const write = can('ledger.write');
  const reload = async (action, okKey) => {
    const done = await run(action, okKey);
    if (done) overview.reload();
    return done;
  };
  const data = overview.data;

  return (
    <section aria-labelledby="business-ledger">
      <h2 id="business-ledger">
        <BookOpen size={18} aria-hidden="true" /> {t('business.ledger.title')}
      </h2>
      <p className="business-blocked-intro">{t('business.ledger.intro')}</p>
      {data?.provisoire && <Notice variant="action-needed">{t('business.ledger.provisional')}</Notice>}
      <div className="inv-actions">
        <label className="pilot-inline">
          {t('business.ledger.from')}
          <input type="date" value={range.from} onChange={(e) => setRange((p) => ({ ...p, from: e.target.value }))} />
        </label>
        <label className="pilot-inline">
          {t('business.ledger.to')}
          <input type="date" value={range.to} onChange={(e) => setRange((p) => ({ ...p, to: e.target.value }))} />
        </label>
      </div>
      <div className="business-tabs" role="tablist" aria-label={t('business.ledger.viewsLabel')}>
        {VIEWS.map((key) => (
          <button key={key} type="button" role="tab" aria-selected={view === key} className={view === key ? 'business-tab is-on' : 'business-tab'} onClick={() => setView(key)}>
            {t(`business.ledger.views.${key}`)}
          </button>
        ))}
      </div>
      {overview.status === 'loading' && !data ? (
        <LoadingState />
      ) : !data ? null : (
        <>
          {view === 'entries' && <Entries business={business} chart={data.plan} range={range} write={write} run={reload} counts={data.compteurs} />}
          {view === 'balance' && <Balance business={business} balance={data.balance} range={range} />}
          {view === 'statements' && <Statements business={business} etats={data.etats} />}
          {view === 'assets' && <Assets business={business} write={write} run={reload} />}
          {view === 'bank' && <Bank business={business} chart={data.plan} write={write} run={reload} />}
          {view === 'chart' && <Chart business={business} data={data} write={write} run={reload} />}
          {view === 'import' && <Import write={write} run={reload} />}
          {view === 'closing' && <Closing business={business} data={data} write={write} run={reload} />}
        </>
      )}
    </section>
  );
}

// ---- entries ----------------------------------------------------------------------------

function Entries({ business, chart, range, write, run, counts }) {
  const { t, i18n } = useTranslation();
  const [filter, setFilter] = useState({ journal: '', status: '' });
  const params = new URLSearchParams({ ...range, ...(filter.journal ? { journal: filter.journal } : {}), ...(filter.status ? { status: filter.status } : {}) }).toString();
  const entries = useApi(`/fin/entreprise/compta/ecritures?${params}`);
  const act = async (action, okKey) => {
    const done = await run(action, okKey);
    if (done) entries.reload();
    return done;
  };
  const money = (v) => formatAmount(i18n.language, v, business.currency);
  const list = entries.data?.ecritures ?? [];

  return (
    <>
      <p className="inv-muted inv-note">{t('business.ledger.counts', { drafts: counts.brouillons, validated: counts.validees })}</p>
      {write && (
        <div className="inv-actions">
          <Button type="button" variant="secondary" onClick={() => act(() => api.post('/fin/entreprise/compta/propositions', {}), 'business.ledger.proposed')}>
            <Wand2 size={16} aria-hidden="true" />
            {t('business.ledger.propose')}
          </Button>
        </div>
      )}
      <p className="inv-muted inv-note">{t('business.ledger.proposeHint')}</p>
      {write && <NewEntry business={business} chart={chart} run={act} />}
      <div className="inv-actions">
        <label className="pilot-inline">
          {t('business.ledger.journal')}
          <select value={filter.journal} onChange={(e) => setFilter((p) => ({ ...p, journal: e.target.value }))}>
            <option value="">{t('business.ledger.all')}</option>
            {JOURNALS.map((j) => (
              <option key={j} value={j}>
                {t(`business.ledger.journals.${j}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="pilot-inline">
          {t('business.ledger.status')}
          <select value={filter.status} onChange={(e) => setFilter((p) => ({ ...p, status: e.target.value }))}>
            <option value="">{t('business.ledger.all')}</option>
            <option value="draft">{t('business.ledger.statuses.draft')}</option>
            <option value="validated">{t('business.ledger.statuses.validated')}</option>
          </select>
        </label>
      </div>
      {entries.status === 'loading' && !entries.data ? (
        <LoadingState />
      ) : list.length === 0 ? (
        <p className="business-empty">{t('business.ledger.noEntry')}</p>
      ) : (
        <ul className="business-documents">
          {list.map((e) => (
            <li key={e.id} className="business-document">
              <div className="business-document-head">
                <span className="inv-badge">{t(`business.ledger.journals.${e.journal}`)}</span>
                <strong>{e.number}</strong>
                <span>{e.label}</span>
                <span className="inv-muted">{formatDate(i18n.language, e.date)}</span>
                <span className="business-document-state">{t(`business.ledger.statuses.${e.status}`)}</span>
                {e.source !== 'manual' && <span className="inv-muted">{t(`business.ledger.sources.${e.source}`)}</span>}
              </div>
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th scope="col">{t('business.ledger.account')}</th>
                    <th scope="col">{t('business.ledger.lineLabel')}</th>
                    <th scope="col">{t('business.ledger.debit')}</th>
                    <th scope="col">{t('business.ledger.credit')}</th>
                  </tr>
                </thead>
                <tbody>
                  {e.lines.map((l) => (
                    <tr key={l.id}>
                      <td>{l.account}</td>
                      <td>{l.label ?? ''}</td>
                      <td>{l.debit ? money(l.debit) : ''}</td>
                      <td>{l.credit ? money(l.credit) : ''}</td>
                    </tr>
                  ))}
                  <tr className="ledger-total">
                    <th scope="row" colSpan={2}>
                      {e.balanced ? t('business.ledger.balanced') : t('business.ledger.unbalanced')}
                    </th>
                    <td>{money(e.debit)}</td>
                    <td>{money(e.credit)}</td>
                  </tr>
                </tbody>
              </table>
              {write && (
                <div className="inv-actions">
                  {e.status === 'draft' && (
                    <>
                      <Button type="button" variant="secondary" disabled={!e.balanced} onClick={() => act(() => api.post(`/fin/entreprise/compta/ecritures/${e.id}/valider`, {}), 'business.ledger.validated')}>
                        <Check size={16} aria-hidden="true" />
                        {t('business.ledger.validate')}
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => window.confirm(t('business.ledger.discardConfirm')) && act(() => api.delete(`/fin/entreprise/compta/ecritures/${e.id}`), 'business.ledger.discarded')}>
                        <Trash2 size={16} aria-hidden="true" />
                        {t('business.ledger.discard')}
                      </Button>
                    </>
                  )}
                  {e.status === 'validated' && (
                    <Button type="button" variant="ghost" onClick={() => window.confirm(t('business.ledger.reverseConfirm')) && act(() => api.post(`/fin/entreprise/compta/ecritures/${e.id}/contrepasser`, {}), 'business.ledger.reversed')}>
                      <Undo2 size={16} aria-hidden="true" />
                      {t('business.ledger.reverse')}
                    </Button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

const emptyLine = () => ({ account: '', label: '', debit: '', credit: '' });

function NewEntry({ business, chart, run }) {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState({ journal: 'OD', date: today(), label: '', number: '' });
  const [lines, setLines] = useState([emptyLine(), emptyLine()]);
  const [key, setKey] = useState(newIdempotencyKey);
  const cents = (v) => (v === '' ? 0 : (toMinorUnits(v, business.currency, { allowZero: true }) ?? 0));
  const debit = lines.reduce((s, l) => s + cents(l.debit), 0);
  const credit = lines.reduce((s, l) => s + cents(l.credit), 0);
  const setLine = (i, field, value) => setLines((p) => p.map((l, j) => (j === i ? { ...l, [field]: value } : l)));
  return (
    <form
      className="business-form"
      onSubmit={async (e) => {
        e.preventDefault();
        const body = {
          journal: form.journal,
          date: form.date,
          label: form.label.trim(),
          ...(form.number.trim() ? { number: form.number.trim() } : {}),
          lines: lines
            .filter((l) => l.account.trim())
            .map((l) => ({ account: l.account.trim(), ...(l.label.trim() ? { label: l.label.trim() } : {}), debit: cents(l.debit), credit: cents(l.credit) })),
        };
        if (await run(() => api.post('/fin/entreprise/compta/ecritures', body, { idempotencyKey: key }), 'business.ledger.entryCreated')) {
          setKey(newIdempotencyKey());
          setLines([emptyLine(), emptyLine()]);
          setForm((p) => ({ ...p, label: '', number: '' }));
        }
      }}
    >
      <h3 className="pilot-subtitle">{t('business.ledger.newEntry')}</h3>
      <div className="business-form-row">
        <label>
          {t('business.ledger.journal')}
          <select value={form.journal} onChange={(e) => setForm((p) => ({ ...p, journal: e.target.value }))}>
            {JOURNALS.map((j) => (
              <option key={j} value={j}>
                {t(`business.ledger.journals.${j}`)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('business.ledger.date')}
          <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} required />
        </label>
        <label>
          {t('business.ledger.piece')}
          <input value={form.number} onChange={(e) => setForm((p) => ({ ...p, number: e.target.value }))} maxLength={40} placeholder={t('business.ledger.pieceAuto')} />
        </label>
        <label>
          {t('business.ledger.entryLabel')}
          <input id="ledger-label" value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} maxLength={200} required />
        </label>
      </div>
      <datalist id="ledger-accounts">
        {chart.map((a) => (
          <option key={a.code} value={a.code}>
            {a.label}
          </option>
        ))}
      </datalist>
      {lines.map((l, i) => (
        <div key={i} className="business-form-row ledger-line">
          <label>
            {t('business.ledger.account')}
            <input list="ledger-accounts" inputMode="numeric" value={l.account} onChange={(e) => setLine(i, 'account', e.target.value)} maxLength={10} />
          </label>
          <label>
            {t('business.ledger.lineLabel')}
            <input value={l.label} onChange={(e) => setLine(i, 'label', e.target.value)} maxLength={200} />
          </label>
          <AmountField id={`ledger-debit-${i}`} label={t('business.ledger.debit')} currency={business.currency} value={l.debit} onChange={(v) => setLine(i, 'debit', v)} disabled={l.credit !== ''} />
          <AmountField id={`ledger-credit-${i}`} label={t('business.ledger.credit')} currency={business.currency} value={l.credit} onChange={(v) => setLine(i, 'credit', v)} disabled={l.debit !== ''} />
        </div>
      ))}
      <div className="inv-actions">
        <Button type="button" variant="ghost" onClick={() => setLines((p) => [...p, emptyLine()])}>
          <Plus size={16} aria-hidden="true" />
          {t('business.ledger.addLine')}
        </Button>
        <span className={debit === credit && debit > 0 ? 'inv-muted' : 'business-document-warning'}>
          {t('business.ledger.totals', { debit: formatAmount(i18n.language, debit, business.currency), credit: formatAmount(i18n.language, credit, business.currency) })}
        </span>
      </div>
      <Button type="submit" variant="secondary">
        {t('business.ledger.saveDraft')}
      </Button>
    </form>
  );
}

// ---- balance and general ledger -------------------------------------------------------------

function Balance({ business, balance, range }) {
  const { t, i18n } = useTranslation();
  const [account, setAccount] = useState(null);
  const query = account ? new URLSearchParams({ ...range, account }).toString() : null;
  const ledger = useApi(query ? `/fin/entreprise/compta/grand-livre?${query}` : null);
  const money = (v) => formatAmount(i18n.language, v, business.currency);
  if (balance.comptes.length === 0) return <p className="business-empty">{t('business.ledger.noBalance')}</p>;
  const gl = ledger.data?.grandLivre;
  return (
    <>
      <table className="ledger-table">
        <caption>{t('business.ledger.balanceCaption')}</caption>
        <thead>
          <tr>
            <th scope="col">{t('business.ledger.account')}</th>
            <th scope="col">{t('business.ledger.opening')}</th>
            <th scope="col">{t('business.ledger.debit')}</th>
            <th scope="col">{t('business.ledger.credit')}</th>
            <th scope="col">{t('business.ledger.closing')}</th>
          </tr>
        </thead>
        <tbody>
          {balance.comptes.map((r) => (
            <tr key={r.code}>
              <td>
                <button type="button" className="forum-link" onClick={() => setAccount(r.code)}>
                  {r.code} · {r.label}
                </button>
              </td>
              <td>{money(r.opening)}</td>
              <td>{money(r.debit)}</td>
              <td>{money(r.credit)}</td>
              <td>{money(r.closing)}</td>
            </tr>
          ))}
          <tr className="ledger-total">
            <th scope="row" colSpan={2}>
              {t('business.ledger.totalsRow')}
            </th>
            <td>{money(balance.totaux.debit)}</td>
            <td>{money(balance.totaux.credit)}</td>
            <td>{balance.totaux.ecart === 0 ? t('business.ledger.balanced') : t('business.ledger.gap', { amount: money(balance.totaux.ecart) })}</td>
          </tr>
        </tbody>
      </table>
      {account && (
        <>
          <h3 className="pilot-subtitle">{t('business.ledger.ledgerOf', { account })}</h3>
          {ledger.status === 'loading' && !gl ? (
            <LoadingState />
          ) : gl ? (
            <table className="ledger-table">
              <thead>
                <tr>
                  <th scope="col">{t('business.ledger.date')}</th>
                  <th scope="col">{t('business.ledger.piece')}</th>
                  <th scope="col">{t('business.ledger.lineLabel')}</th>
                  <th scope="col">{t('business.ledger.debit')}</th>
                  <th scope="col">{t('business.ledger.credit')}</th>
                  <th scope="col">{t('business.ledger.runningBalance')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5}>{t('business.ledger.opening')}</td>
                  <td>{money(gl.ouverture)}</td>
                </tr>
                {gl.lignes.map((l, i) => (
                  <tr key={`${l.entryId}-${i}`}>
                    <td>{formatDate(i18n.language, l.date)}</td>
                    <td>{l.number}</td>
                    <td>{l.label}</td>
                    <td>{l.debit ? money(l.debit) : ''}</td>
                    <td>{l.credit ? money(l.credit) : ''}</td>
                    <td>{money(l.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </>
      )}
    </>
  );
}

// ---- statements (SCF presentation) -------------------------------------------------------------------

const ASSET_ROWS = ['immoIncorporelles', 'immoCorporelles', 'immoFinancieres', 'stocks', 'clients', 'impotsActif', 'autresDebiteurs', 'tresorerie'];
const LIABILITY_ROWS = ['capital', 'primesReserves', 'reportNouveau', 'resultatExercice', 'autresCapitaux', 'emprunts', 'provisions', 'fournisseurs', 'impotsPassif', 'autresDettes', 'tresoreriePassif'];
const INCOME_ROWS = [
  ['ventes', false],
  ['production', true],
  ['consommation', false],
  ['valeurAjoutee', true],
  ['personnel', false],
  ['impotsTaxes', false],
  ['ebe', true],
  ['resultatOperationnel', true],
  ['resultatFinancier', true],
  ['avantImpots', true],
  ['impotsResultat', false],
  ['resultatOrdinaire', true],
  ['extraordinaire', false],
  ['resultat', true],
];

function Statements({ business, etats }) {
  const { t, i18n } = useTranslation();
  const money = (v) => formatAmount(i18n.language, v, business.currency);
  const rows = (group, keys) =>
    keys.map((k) => (
      <tr key={k}>
        <th scope="row">{t(`business.ledger.st.${k}`)}</th>
        <td>{money(group[k])}</td>
      </tr>
    ));
  return (
    <>
      <Notice variant="info">{t('business.ledger.notCertified')}</Notice>
      <div className="fin-figure-grid">
        <FigureCard label={t('business.ledger.netIncome')} answer={etats.resultatNet} />
        <FigureCard label={t('business.ledger.wcNeed')} answer={etats.bfr} />
      </div>
      <div className="ledger-statements">
        <table className="ledger-table">
          <caption>{t('business.ledger.st.assets')}</caption>
          <tbody>
            {rows(etats.bilan.actif, ASSET_ROWS)}
            <tr className="ledger-total">
              <th scope="row">{t('business.ledger.st.total')}</th>
              <td>{money(etats.bilan.actif.total)}</td>
            </tr>
          </tbody>
        </table>
        <table className="ledger-table">
          <caption>{t('business.ledger.st.liabilities')}</caption>
          <tbody>
            {rows(etats.bilan.passif, LIABILITY_ROWS)}
            <tr className="ledger-total">
              <th scope="row">{t('business.ledger.st.total')}</th>
              <td>{money(etats.bilan.passif.total)}</td>
            </tr>
          </tbody>
        </table>
        <table className="ledger-table">
          <caption>{t('business.ledger.st.income')}</caption>
          <tbody>
            {INCOME_ROWS.map(([k, total]) => (
              <tr key={k} className={total ? 'ledger-total' : ''}>
                <th scope="row">{t(`business.ledger.st.${k}`)}</th>
                <td>{money(etats.resultat[k])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {Math.round(etats.bilan.ecart) !== 0 && <p className="business-document-warning">{t('business.ledger.st.gap', { amount: money(etats.bilan.ecart) })}</p>}
    </>
  );
}

// ---- fixed assets ----------------------------------------------------------------------------------

const ASSET_CATEGORIES = ['software', 'building', 'equipment', 'vehicle', 'computer', 'furniture', 'other'];

function Assets({ business, write, run }) {
  const { t, i18n } = useTranslation();
  const [year, setYear] = useState(new Date().getUTCFullYear());
  const query = new URLSearchParams({ year: String(year) }).toString();
  const assets = useApi(`/fin/entreprise/compta/immobilisations?${query}`);
  const [form, setForm] = useState({ label: '', category: 'equipment', acquiredAt: today(), cost: '', durationMonths: '' });
  const [key, setKey] = useState(newIdempotencyKey);
  const act = async (action, okKey) => {
    const done = await run(action, okKey);
    if (done) assets.reload();
    return done;
  };
  const money = (v) => formatAmount(i18n.language, v, business.currency);
  const data = assets.data;
  const months = data?.categories?.[form.category];
  return (
    <>
      <p className="inv-muted inv-note">{t('business.ledger.assetsIntro')}</p>
      {write && (
        <form
          className="business-form"
          onSubmit={async (e) => {
            e.preventDefault();
            const body = {
              label: form.label.trim(),
              category: form.category,
              acquiredAt: form.acquiredAt,
              cost: toMinorUnits(form.cost, business.currency),
              ...(form.durationMonths ? { durationMonths: Number(form.durationMonths) } : {}),
            };
            if (await act(() => api.post('/fin/entreprise/compta/immobilisations', body, { idempotencyKey: key }), 'business.ledger.assetCreated')) {
              setKey(newIdempotencyKey());
              setForm((p) => ({ ...p, label: '', cost: '', durationMonths: '' }));
            }
          }}
        >
          <div className="business-form-row">
            <label>
              {t('business.ledger.assetLabel')}
              <input value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} maxLength={160} required />
            </label>
            <label>
              {t('business.ledger.assetCategory')}
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                {ASSET_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {t(`business.ledger.assetCategories.${c}`)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t('business.ledger.acquiredAt')}
              <input type="date" value={form.acquiredAt} onChange={(e) => setForm((p) => ({ ...p, acquiredAt: e.target.value }))} required />
            </label>
            <AmountField id="asset-cost" label={t('business.ledger.assetCost')} currency={business.currency} value={form.cost} onChange={(v) => setForm((p) => ({ ...p, cost: v }))} required />
            <label>
              {t('business.ledger.duration')}
              <input type="number" min="1" max="1200" value={form.durationMonths} placeholder={months ? String(months) : ''} onChange={(e) => setForm((p) => ({ ...p, durationMonths: e.target.value }))} />
            </label>
          </div>
          <Button type="submit" variant="secondary">
            <Plus size={16} aria-hidden="true" />
            {t('business.ledger.addAsset')}
          </Button>
        </form>
      )}
      <div className="inv-actions">
        <label className="pilot-inline">
          {t('business.ledger.year')}
          <input type="number" min="2000" max="2100" value={year} onChange={(e) => setYear(Number(e.target.value))} />
        </label>
        {write && (
          <Button type="button" variant="secondary" onClick={() => act(() => api.post(`/fin/entreprise/compta/dotations/${year}`, {}), 'business.ledger.depreciationProposed')}>
            <Wand2 size={16} aria-hidden="true" />
            {t('business.ledger.proposeDepreciation')}
          </Button>
        )}
      </div>
      {assets.status === 'loading' && !data ? (
        <LoadingState />
      ) : !data || data.immobilisations.length === 0 ? (
        <p className="business-empty">{t('business.ledger.noAsset')}</p>
      ) : (
        <table className="ledger-table">
          <thead>
            <tr>
              <th scope="col">{t('business.ledger.assetLabel')}</th>
              <th scope="col">{t('business.ledger.assetCost')}</th>
              <th scope="col">{t('business.ledger.dotation', { year: data.annee })}</th>
              <th scope="col">{t('business.ledger.cumulated')}</th>
              <th scope="col">{t('business.ledger.netValue')}</th>
            </tr>
          </thead>
          <tbody>
            {data.immobilisations.map((a) => (
              <tr key={a.id}>
                <td>
                  {a.label} · {a.account} · {t('business.ledger.months', { n: a.durationMonths })}
                  {a.disposedAt ? ` · ${t('business.ledger.disposedOn', { date: formatDate(i18n.language, a.disposedAt) })}` : ''}
                  {write && !a.disposedAt && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        const date = window.prompt(t('business.ledger.disposePrompt'), today());
                        if (date) act(() => api.put(`/fin/entreprise/compta/immobilisations/${a.id}`, { disposedAt: date }), 'business.ledger.assetDisposed');
                      }}
                    >
                      {t('business.ledger.dispose')}
                    </Button>
                  )}
                </td>
                <td>{money(a.cost)}</td>
                <td>{money(a.dotation)}</td>
                <td>{money(a.cumul)}</td>
                <td>{money(a.valeurNette)}</td>
              </tr>
            ))}
            <tr className="ledger-total">
              <th scope="row">{t('business.ledger.totalsRow')}</th>
              <td>{money(data.totaux.cout)}</td>
              <td>{money(data.totaux.dotation)}</td>
              <td />
              <td>{money(data.totaux.valeurNette)}</td>
            </tr>
          </tbody>
        </table>
      )}
    </>
  );
}

// ---- bank statement and matching ----------------------------------------------------------------------

function Bank({ business, chart, write, run }) {
  const { t, i18n } = useTranslation();
  const [account, setAccount] = useState('512');
  const query = new URLSearchParams({ account }).toString();
  const bank = useApi(`/fin/entreprise/compta/banque?${query}`);
  const [picking, setPicking] = useState(null);
  const act = async (action, okKey) => {
    const done = await run(action, okKey);
    if (done) bank.reload();
    return done;
  };
  const money = (v) => formatAmount(i18n.language, v, business.currency);
  const data = bank.data;
  return (
    <>
      <p className="inv-muted inv-note">{t('business.ledger.bankIntro')}</p>
      <div className="inv-actions">
        <label className="pilot-inline">
          {t('business.ledger.cashAccount')}
          <select value={account} onChange={(e) => setAccount(e.target.value)}>
            {chart
              .filter((a) => a.code.startsWith('5'))
              .map((a) => (
                <option key={a.code} value={a.code}>
                  {a.code} · {a.label}
                </option>
              ))}
          </select>
        </label>
        {write && (
          <>
            <label className="pilot-inline">
              {t('business.ledger.statementFile')}
              <input
                type="file"
                accept=".csv,.txt"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const content = await readFile(file);
                  await act(() => api.post('/fin/entreprise/compta/banque/releve', { account, content }), 'business.ledger.statementImported');
                  e.target.value = '';
                }}
              />
            </label>
            <Button type="button" variant="ghost" onClick={() => act(() => api.post('/fin/entreprise/compta/banque/pointer', { account }), 'business.ledger.autoMatched')}>
              <Wand2 size={16} aria-hidden="true" />
              {t('business.ledger.autoMatch')}
            </Button>
          </>
        )}
      </div>
      {bank.status === 'loading' && !data ? (
        <LoadingState />
      ) : !data ? null : (
        <>
          <p className="inv-muted inv-note">{t('business.ledger.bankSummary', { lines: data.resume.lignesReleve, matched: data.resume.pointees, open: data.resume.ecrituresNonPointees })}</p>
          {data.releve.length === 0 ? (
            <p className="business-empty">{t('business.ledger.noStatement')}</p>
          ) : (
            <table className="ledger-table">
              <thead>
                <tr>
                  <th scope="col">{t('business.ledger.date')}</th>
                  <th scope="col">{t('business.ledger.lineLabel')}</th>
                  <th scope="col">{t('business.ledger.amount')}</th>
                  <th scope="col">{t('business.ledger.matchedWith')}</th>
                </tr>
              </thead>
              <tbody>
                {data.releve.map((l) => (
                  <tr key={l.id}>
                    <td>{formatDate(i18n.language, l.date)}</td>
                    <td>{l.label}</td>
                    <td>{money(l.amount)}</td>
                    <td>
                      {l.ecriture ? (
                        <>
                          {l.ecriture.number}
                          {write && (
                            <Button type="button" variant="ghost" onClick={() => act(() => api.put(`/fin/entreprise/compta/banque/lignes/${l.id}`, { lineId: null }), 'business.ledger.unmatched')}>
                              {t('business.ledger.unmatch')}
                            </Button>
                          )}
                        </>
                      ) : write ? (
                        picking === l.id ? (
                          <select
                            aria-label={t('business.ledger.pickLine')}
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value) act(() => api.put(`/fin/entreprise/compta/banque/lignes/${l.id}`, { lineId: e.target.value }), 'business.ledger.matched').then(() => setPicking(null));
                            }}
                          >
                            <option value="">{t('business.ledger.pickLine')}</option>
                            {data.nonPointees.map((b) => (
                              <option key={b.id} value={b.id}>
                                {formatDate(i18n.language, b.date)} · {b.number} · {money(b.debit - b.credit)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Button type="button" variant="ghost" onClick={() => setPicking(l.id)}>
                            {t('business.ledger.match')}
                          </Button>
                        )
                      ) : (
                        t('business.ledger.notMatched')
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </>
  );
}

// ---- chart and correspondences ------------------------------------------------------------------

const readFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, 'utf-8');
  });

function Chart({ data, write, run }) {
  const { t } = useTranslation();
  const [account, setAccount] = useState({ code: '', label: '' });
  const [show, setShow] = useState(false);
  const own = data.plan.filter((a) => a.own);
  return (
    <>
      <h3 className="pilot-subtitle">{t('business.ledger.chartTitle')}</h3>
      <p className="inv-muted inv-note">{t('business.ledger.chartIntro', { n: data.plan.length, own: own.length })}</p>
      {write && (
        <form
          className="business-form business-payment"
          onSubmit={async (e) => {
            e.preventDefault();
            if (await run(() => api.post('/fin/entreprise/compta/comptes', { code: account.code.trim(), label: account.label.trim() }), 'business.ledger.accountCreated')) setAccount({ code: '', label: '' });
          }}
        >
          <label>
            {t('business.ledger.subAccount')}
            <input inputMode="numeric" value={account.code} onChange={(e) => setAccount((p) => ({ ...p, code: e.target.value }))} maxLength={10} required />
          </label>
          <label>
            {t('business.ledger.accountLabel')}
            <input value={account.label} onChange={(e) => setAccount((p) => ({ ...p, label: e.target.value }))} maxLength={160} required />
          </label>
          <Button type="submit" variant="secondary">
            <Plus size={16} aria-hidden="true" />
            {t('business.ledger.addAccount')}
          </Button>
        </form>
      )}
      <Button type="button" variant="ghost" aria-expanded={show} onClick={() => setShow(!show)}>
        {show ? t('business.ledger.hideChart') : t('business.ledger.showChart')}
      </Button>
      {show && (
        <table className="ledger-table">
          <tbody>
            {data.plan.map((a) => (
              <tr key={a.code}>
                <td>{a.code}</td>
                <td>
                  {a.label}
                  {a.own && <span className="inv-muted"> · {t('business.ledger.ownAccount')}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3 className="pilot-subtitle">{t('business.ledger.mappingTitle')}</h3>
      <p className="inv-muted inv-note">{t('business.ledger.mappingIntro')}</p>
      <div className="fin-figure-grid">
        <FigureCard label={t('business.ledger.coverage')} answer={data.couverture} />
      </div>
      {write && (
        <label className="business-form">
          {t('business.ledger.chartFile')}
          <input
            type="file"
            accept=".csv,.txt"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const content = await readFile(file);
              await run(() => api.post('/fin/entreprise/compta/correspondances', { content }), 'business.ledger.chartImported');
              e.target.value = '';
            }}
          />
        </label>
      )}
      {data.correspondances.length > 0 && (
        <table className="ledger-table">
          <thead>
            <tr>
              <th scope="col">{t('business.ledger.sourceAccount')}</th>
              <th scope="col">{t('business.ledger.scfAccount')}</th>
            </tr>
          </thead>
          <tbody>
            {data.correspondances.map((m) => (
              <tr key={m.id}>
                <td>
                  {m.sourceCode} · {m.sourceLabel}
                </td>
                <td>
                  {write ? (
                    <input
                      list="ledger-chart-accounts"
                      defaultValue={m.account ?? ''}
                      maxLength={10}
                      aria-label={t('business.ledger.scfAccountFor', { code: m.sourceCode })}
                      onBlur={(e) => {
                        const value = e.target.value.trim();
                        if (value !== (m.account ?? '')) run(() => api.put(`/fin/entreprise/compta/correspondances/${m.id}`, { account: value }), 'business.ledger.mappingSaved');
                      }}
                    />
                  ) : (
                    (m.account ?? t('business.ledger.notMapped'))
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <datalist id="ledger-chart-accounts">
        {data.plan.map((a) => (
          <option key={a.code} value={a.code}>
            {a.label}
          </option>
        ))}
      </datalist>
    </>
  );
}

// ---- import (ECR-0108, 0330) ------------------------------------------------------------------------

function Import({ write, run }) {
  const { t } = useTranslation();
  const [content, setContent] = useState(null);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  if (!write) return <p className="business-empty">{t('business.ledger.importReadOnly')}</p>;
  return (
    <>
      <p className="inv-muted inv-note">{t('business.ledger.importIntro')}</p>
      <pre className="ledger-sample">journal;piece;date;compte;libelle;debit;credit{'\n'}VT;F-001;2026-11-02;411;Facture;11900;{'\n'}VT;F-001;2026-11-02;700;Facture;;10000{'\n'}VT;F-001;2026-11-02;4457;Facture;;1900</pre>
      <label className="business-form">
        {t('business.ledger.entriesFile')}
        <input
          type="file"
          accept=".csv,.txt"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            setReport(null);
            setError(null);
            if (!file) return;
            const text = await readFile(file);
            setContent(text);
            try {
              setReport((await api.post('/fin/entreprise/compta/import', { content: text })).rapport);
            } catch {
              setError(t('business.ledger.importError'));
            }
          }}
        />
      </label>
      {error && <p className="form-error">{error}</p>}
      {report && (
        <div className="trade-details">
          <p>{t('business.ledger.importReport', { lines: report.lignes, pieces: report.pieces.length, rejects: report.rejets.length })}</p>
          {report.rejets.length > 0 && (
            <ul className="trade-pieces">
              {report.rejets.slice(0, 50).map((r, i) => (
                <li key={i} className="dia-status-rejected">
                  <span>
                    {r.line ? t('business.ledger.atLine', { line: r.line }) : t('business.ledger.atPiece', { piece: r.piece })} · {t(`business.ledger.rejects.${r.reason}`)}
                    {r.value ? ` (${r.value})` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {report.applique ? (
            <p className="form-status">{t('business.ledger.imported', { n: report.creees, already: report.dejaImportees })}</p>
          ) : (
            report.valide && (
              <Button
                type="button"
                variant="secondary"
                onClick={async () => {
                  let result = null;
                  const done = await run(async () => {
                    result = (await api.post('/fin/entreprise/compta/import', { content, apply: true })).rapport;
                  }, 'business.ledger.importDone');
                  if (done && result) setReport(result);
                }}
              >
                <FileUp size={16} aria-hidden="true" />
                {t('business.ledger.importApply')}
              </Button>
            )
          )}
        </div>
      )}
    </>
  );
}

// ---- closing, reconciliation, anomalies (ECR-0246, 0248, 0250) ---------------------------------------

function Closing({ business, data, write, run }) {
  const { t, i18n } = useTranslation();
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [check, setCheck] = useState({ account: '512', checkedAt: today(), statementBalance: '', note: '' });
  const money = (v) => formatAmount(i18n.language, v, business.currency);
  const signedCents = (text) => {
    const n = Number(String(text).replace(',', '.'));
    return Number.isFinite(n) ? Math.round(n * 10 ** fractionDigits(business.currency)) : null;
  };
  return (
    <>
      <h3 className="pilot-subtitle">{t('business.ledger.anomaliesTitle')}</h3>
      {data.anomalies.length === 0 ? (
        <p className="inv-muted inv-note">{t('business.ledger.noAnomaly')}</p>
      ) : (
        <ul className="trade-pieces">
          {data.anomalies.map((a, i) => (
            <li key={i} className="dia-status-rejected">
              <span>
                {t(`business.ledger.anomalies.${a.kind}`, { amount: a.ecart !== undefined ? money(a.ecart) : '' })}
                {a.number ? ` · ${a.number}` : ''}
              </span>
            </li>
          ))}
        </ul>
      )}

      <h3 className="pilot-subtitle">{t('business.ledger.closingTitle')}</h3>
      {write && (
        <form
          className="business-form business-payment"
          onSubmit={(e) => {
            e.preventDefault();
            if (window.confirm(t('business.ledger.closeConfirm', { period }))) run(() => api.post(`/fin/entreprise/compta/periodes/${period}/cloturer`, {}), 'business.ledger.periodClosed');
          }}
        >
          <label>
            {t('business.ledger.month')}
            <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} required />
          </label>
          <Button type="submit" variant="secondary">
            <Lock size={16} aria-hidden="true" />
            {t('business.ledger.closeMonth')}
          </Button>
        </form>
      )}
      {data.periodes.length > 0 && (
        <ul className="trade-pieces">
          {data.periodes.map((p) => (
            <li key={p.id} className={p.status === 'closed' ? 'dia-status-validated' : 'dia-status-submitted'}>
              <span>
                {p.period} · {p.status === 'closed' ? t('business.ledger.closedOn', { date: formatDate(i18n.language, p.closedAt) }) : t('business.ledger.reopenedBecause', { reason: p.reopenReason })}
              </span>
              {write && p.status === 'closed' && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    const reason = window.prompt(t('business.ledger.reopenReason'));
                    if (reason?.trim()) run(() => api.post(`/fin/entreprise/compta/periodes/${p.period}/rouvrir`, { reason: reason.trim() }), 'business.ledger.periodReopened');
                  }}
                >
                  <Unlock size={16} aria-hidden="true" />
                  {t('business.ledger.reopen')}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      <h3 className="pilot-subtitle">{t('business.ledger.yearTitle')}</h3>
      <p className="inv-muted inv-note">{t('business.ledger.yearIntro')}</p>
      {write && <YearClose run={run} />}
      {(data.exercices ?? []).length > 0 && (
        <ul className="trade-pieces">
          {data.exercices.map((y) => (
            <li key={y.id} className="dia-status-validated">
              <span>{t('business.ledger.yearClosed', { year: y.year, date: formatDate(i18n.language, y.closedAt), result: money(y.result) })}</span>
            </li>
          ))}
        </ul>
      )}

      <h3 className="pilot-subtitle">{t('business.ledger.bankTitle')}</h3>
      {write && (
        <form
          className="business-form business-payment"
          onSubmit={async (e) => {
            e.preventDefault();
            const statementBalance = signedCents(check.statementBalance);
            if (statementBalance === null) return;
            if (await run(() => api.post('/fin/entreprise/compta/rapprochements', { account: check.account, checkedAt: check.checkedAt, statementBalance, ...(check.note.trim() ? { note: check.note.trim() } : {}) }), 'business.ledger.reconciled')) {
              setCheck((p) => ({ ...p, statementBalance: '', note: '' }));
            }
          }}
        >
          <label>
            {t('business.ledger.cashAccount')}
            <select value={check.account} onChange={(e) => setCheck((p) => ({ ...p, account: e.target.value }))}>
              {data.plan
                .filter((a) => a.code.startsWith('5'))
                .map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.code} · {a.label}
                  </option>
                ))}
            </select>
          </label>
          <label>
            {t('business.ledger.date')}
            <input type="date" value={check.checkedAt} onChange={(e) => setCheck((p) => ({ ...p, checkedAt: e.target.value }))} required />
          </label>
          <label>
            {t('business.ledger.statementBalance', { currency: business.currency })}
            <input type="number" step="0.01" value={check.statementBalance} onChange={(e) => setCheck((p) => ({ ...p, statementBalance: e.target.value }))} required />
          </label>
          <label>
            {t('business.ledger.note')}
            <input value={check.note} onChange={(e) => setCheck((p) => ({ ...p, note: e.target.value }))} maxLength={300} />
          </label>
          <Button type="submit" variant="secondary">
            {t('business.ledger.reconcile')}
          </Button>
        </form>
      )}
      {data.rapprochements.length > 0 && (
        <ul className="business-documents">
          {data.rapprochements.map((c) => (
            <li key={c.id} className="business-document">
              <div className="business-document-head">
                <strong>{c.account}</strong>
                <span className="inv-muted">{formatDate(i18n.language, c.checkedAt)}</span>
                <span className="inv-muted">{t('business.ledger.bankVsBook', { bank: money(c.statementBalance), book: money(c.bookBalance) })}</span>
              </div>
              <div className="fin-figure-grid trade-figures">
                <FigureCard label={t('business.ledger.bankGap')} answer={c.ecart} />
              </div>
              {c.note && <p className="inv-muted inv-note">{c.note}</p>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function YearClose({ run }) {
  const { t } = useTranslation();
  const [year, setYear] = useState(new Date().getUTCFullYear() - 1);
  return (
    <form
      className="business-form business-payment"
      onSubmit={(e) => {
        e.preventDefault();
        if (window.confirm(t('business.ledger.yearConfirm', { year }))) run(() => api.post(`/fin/entreprise/compta/exercices/${year}/cloturer`, {}), 'business.ledger.yearDone');
      }}
    >
      <label>
        {t('business.ledger.year')}
        <input type="number" min="2000" max="2100" value={year} onChange={(e) => setYear(Number(e.target.value))} required />
      </label>
      <Button type="submit" variant="secondary">
        <Lock size={16} aria-hidden="true" />
        {t('business.ledger.closeYear')}
      </Button>
    </form>
  );
}
