import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { formatAmount, formatRatio } from '../../lib/format.js';
import { toMinorUnits } from '../../lib/money.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Notice from '../../components/ui/Notice.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import AmountField from '../../components/fincludia/AmountField.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import '../entreprise/Business.css';

// P13-01 (2026-11-25): InvestLab — the client's real market data 2020–2026
// (Bourse d'Alger, DZAIRINDEX, sovereign debt, deposits, foreign-currency
// accounts, Islamic finance, inflation, metals) and the backtest of its
// section 12. Educational: separate from the real patrimony and from any
// credit decision; never a recommendation. The tables are the document's, as
// published (« — » and N/C are never zero).

const VIEWS = [
  ['market', ['3. ', '3.', '4. ']],
  ['stock', []],
  ['debt', ['5.', '6. ']],
  ['savings', ['7.']],
  ['currencies', ['8.']],
  ['islamic', ['9.']],
  ['metals', ['10. ', '11. ']],
  ['backtest', ['12.', 'Annexe B']],
  ['quality', ['1. ', '2.', '13.', '14. ', 'Annexe A']],
];

// A section belongs to a view by the number its title starts with (« 3.1 » is in « 3. »).
const inView = (title, prefixes) => prefixes.some((p) => (p.endsWith('. ') ? title.startsWith(p) : title.startsWith(p)));

function Sections({ sections, prefixes, exclude = [] }) {
  const list = sections.filter((s) => s.title && inView(s.title, prefixes) && !exclude.some((e) => s.title.startsWith(e)));
  return list.map((s) => (
    <section key={s.title} className="investlab-section" aria-label={s.title}>
      {s.level === 1 ? <h2>{s.title}</h2> : <h3 className="pilot-subtitle">{s.title}</h3>}
      {s.blocks.map((b, i) =>
        b.type === 'para' ? (
          <p key={i} className={b.text.startsWith('Sources') ? 'inv-muted inv-note' : 'forum-body'}>
            {b.text}
          </p>
        ) : (
          <div key={i} className="investlab-table">
            <table className="ledger-table">
              <thead>
                <tr>
                  {b.rows[0].map((c, j) => (
                    <th key={j} scope="col">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.rows.slice(1).map((r, k) => (
                  <tr key={k}>
                    {r.map((c, j) => (
                      <td key={j}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ),
      )}
    </section>
  ));
}

export default function InvestLabPage() {
  const { t } = useTranslation();
  const lab = useApi('/fin/investlab');
  const [view, setView] = useState('market');
  useDocumentMeta(t('investLab.title'), t('investLab.intro'));
  const data = lab.data;
  const prefixes = VIEWS.find(([k]) => k === view)?.[1] ?? [];
  return (
    <>
      <PageHeader icon={LineChart} title={t('investLab.title')} subtitle={t('investLab.intro')} maxWidth={1100} />
      <div className="business-page">
        <Notice variant="info">{t('investLab.notice')}</Notice>
        <div className="business-tabs" role="tablist" aria-label={t('investLab.views')}>
          {VIEWS.map(([key]) => (
            <button key={key} type="button" role="tab" aria-selected={view === key} className={view === key ? 'business-tab is-on' : 'business-tab'} onClick={() => setView(key)}>
              {t(`investLab.tabs.${key}`)}
            </button>
          ))}
        </div>
        {lab.status === 'loading' && !data ? (
          <LoadingState />
        ) : !data ? null : (
          <>
            {view === 'stock' && <StockSheet actions={data.actions} />}
            {view === 'backtest' && <Backtest />}
            {view !== 'stock' && <Sections sections={data.sections} prefixes={prefixes} exclude={view === 'quality' ? ['12.'] : view === 'market' ? ['13.', '14.'] : []} />}
          </>
        )}
      </div>
    </>
  );
}

function StockSheet({ actions }) {
  const { t, i18n } = useTranslation();
  const [ticker, setTicker] = useState(actions[0]?.ticker ?? 'ALL');
  const sheet = useApi(`/fin/investlab/actions/${ticker}`);
  const s = sheet.data?.action;
  const max = s ? Math.max(...s.series.map((p) => p.price ?? 0)) : 0;
  const pct = (v) => (v === null || v === undefined ? '—' : formatRatio(i18n.language, v, { digits: 2 }));
  return (
    <section aria-labelledby="investlab-stock">
      <h2 id="investlab-stock">{t('investLab.stockTitle')}</h2>
      <label className="pilot-inline">
        {t('investLab.share')}
        <select value={ticker} onChange={(e) => setTicker(e.target.value)}>
          {actions.map((a) => (
            <option key={a.ticker} value={a.ticker}>
              {a.ticker} · {a.name}
            </option>
          ))}
        </select>
      </label>
      {sheet.status === 'loading' && !s ? (
        <LoadingState />
      ) : !s ? null : (
        <>
          <p className="inv-muted inv-note">{[s.name, s.sector, t('investLab.compartment', { name: s.compartment }), s.isin].filter(Boolean).join(' · ')}</p>
          <div className="investlab-bars" role="img" aria-label={t('investLab.curve', { name: s.name })}>
            {s.series.map((p) => (
              <div key={p.year} className="investlab-bar">
                <span className="investlab-bar-value">{p.price === null ? t('investLab.notListed') : p.price.toLocaleString(i18n.language)}</span>
                <span className="investlab-bar-fill" style={{ blockSize: p.price ? `${Math.max(4, (p.price / max) * 140)}px` : '2px' }} />
                <span>{p.year}</span>
              </div>
            ))}
          </div>
          <table className="ledger-table">
            <caption>{t('investLab.yearly')}</caption>
            <thead>
              <tr>
                <th scope="col">{t('investLab.year')}</th>
                <th scope="col">{t('investLab.price')}</th>
                <th scope="col">{t('investLab.change')}</th>
                <th scope="col">{t('investLab.dividend')}</th>
                <th scope="col">{t('investLab.dividendYield')}</th>
              </tr>
            </thead>
            <tbody>
              {s.series.map((p) => {
                const d = s.dividends.find((x) => x.year === p.year);
                return (
                  <tr key={p.year}>
                    <td>{p.year === 2026 ? t('investLab.ytd') : p.year}</td>
                    <td>{p.price === null ? t('investLab.notListed') : p.price.toLocaleString(i18n.language)}</td>
                    <td>{pct(p.change)}</td>
                    <td>{d?.dps === null || d?.dps === undefined ? '—' : d.dps.toLocaleString(i18n.language)}</td>
                    <td>{pct(d?.yield)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {s.actions.length > 0 && (
            <ul className="trade-pieces">
              {s.actions.map((a) => (
                <li key={a.date}>
                  <span>
                    {a.date} · {a.operation} · {a.effect} · {a.treatment}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

function Backtest() {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState({ amount: '10000', from: '2020', to: '2026' });
  const [query, setQuery] = useState(new URLSearchParams({ amount: '1000000', from: '2020', to: '2026' }).toString());
  const result = useApi(`/fin/investlab/backtest?${query}`);
  const r = result.data;
  const money = (v) => formatAmount(i18n.language, v, 'DZD');
  const pct = (v) => (v === null || v === undefined ? '—' : formatRatio(i18n.language, v, { digits: 2 }));
  return (
    <section aria-labelledby="investlab-backtest">
      <h2 id="investlab-backtest">{t('investLab.backtestTitle')}</h2>
      <form
        className="business-form business-payment"
        onSubmit={(e) => {
          e.preventDefault();
          const amount = toMinorUnits(form.amount, 'DZD');
          if (amount) setQuery(new URLSearchParams({ amount: String(amount), from: form.from, to: form.to }).toString());
        }}
      >
        <AmountField id="investlab-amount" label={t('investLab.amount')} currency="DZD" value={form.amount} onChange={(v) => setForm((p) => ({ ...p, amount: v }))} required />
        <label>
          {t('investLab.from')}
          <select value={form.from} onChange={(e) => setForm((p) => ({ ...p, from: e.target.value }))}>
            {[2020, 2021, 2022, 2023, 2024, 2025].map((y) => (
              <option key={y} value={y}>
                {t('investLab.endOf', { year: y })}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('investLab.to')}
          <select value={form.to} onChange={(e) => setForm((p) => ({ ...p, to: e.target.value }))}>
            {[2021, 2022, 2023, 2024, 2025, 2026]
              .filter((y) => y > Number(form.from))
              .map((y) => (
                <option key={y} value={y}>
                  {y === 2026 ? t('investLab.ytdDate') : t('investLab.endOf', { year: y })}
                </option>
              ))}
          </select>
        </label>
        <Button type="submit" variant="secondary">
          {t('investLab.compute')}
        </Button>
      </form>
      {result.status === 'loading' && !r ? (
        <LoadingState />
      ) : !r ? null : (
        <>
          {r.notes.map((n) => (
            <p key={n} className="inv-muted inv-note">
              {n}
            </p>
          ))}
          {r.lignes[0]?.final && (
            <div className="fin-figure-grid">
              <FigureCard label={t('investLab.best', { asset: assetName(t, r.lignes[0].asset) })} answer={r.lignes[0].final} />
              <FigureCard label={t('investLab.bestReal')} answer={r.lignes[0].real} />
            </div>
          )}
          <table className="ledger-table">
            <thead>
              <tr>
                <th scope="col">{t('investLab.asset')}</th>
                <th scope="col">{t('investLab.final')}</th>
                <th scope="col">{t('investLab.income')}</th>
                <th scope="col">{t('investLab.nominal')}</th>
                <th scope="col">{t('investLab.real')}</th>
                <th scope="col">{t('investLab.realReturn')}</th>
              </tr>
            </thead>
            <tbody>
              {r.lignes.map((l) => (
                <tr key={l.asset}>
                  <td>{assetName(t, l.asset)}</td>
                  {l.status === 'OK' ? (
                    <>
                      <td>{money(l.final.resultat)}</td>
                      <td>{money(l.income)}</td>
                      <td>{pct(l.nominal)}</td>
                      <td>{l.real.resultat === null ? '—' : money(l.real.resultat)}</td>
                      <td>{pct(l.realReturn)}</td>
                    </>
                  ) : (
                    <td colSpan={5}>{t(`investLab.statuses.${l.status}`)}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="inv-muted inv-note">{t('investLab.backtestRules')}</p>
        </>
      )}
    </section>
  );
}

const assetName = (t, asset) => (['gold', 'silver', 'platinum'].includes(asset) ? t(`investLab.metals.${asset}`) : asset);
