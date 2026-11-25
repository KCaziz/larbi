import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, MessageCircleQuestion, Scale, Search } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatAmount, formatDate, formatNumber, formatRatio } from '../../lib/format.js';
import { toMinorUnits } from '../../lib/money.js';
import Button from '../../components/ui/Button.jsx';
import AmountField from '../../components/fincludia/AmountField.jsx';
import Notice from '../../components/ui/Notice.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import { invoicingError } from './Invoicing.jsx';

// P13-05, lot F (2026-11-24): the copilot (closed questions, CNV-08), the
// universal search (REC-001), the simulators and comparators of the client's
// tabs 14 and 15. Every figure is computed by the server; a simulation
// creates and stores nothing (CNV-12).

const SUGGESTED = ['clientBalance', 'invoiceStatus', 'earned', 'cashNow', 'cashNegative', 'overdue', 'stock', 'budget'];
// Where a search result opens.
const TAB_OF = { document: 'sales', contact: 'sales', operation: 'trade', item: 'stock', project: 'projects', holding: 'projects' };

function useFormat(currency) {
  const { t, i18n } = useTranslation();
  return (value, unit) => {
    if (value === null || value === undefined) return t('fincludia.notComputed');
    if (unit === 'money') return formatAmount(i18n.language, value, currency);
    if (unit === 'ratio') return formatRatio(i18n.language, value);
    if (unit === 'days') return t('fincludia.days', { count: Math.round(value) });
    if (unit === 'months') return t('fincludia.months', { count: Math.round(value * 10) / 10 });
    if (unit === 'years') return t('business.tools.years', { n: formatNumber(i18n.language, value, { digits: 1 }) });
    return formatNumber(i18n.language, value, { digits: 2 });
  };
}

export function ToolsSection({ business, can, onOpen }) {
  const readsFinance = can('finance.read');
  return (
    <>
      {readsFinance && <CopilotPanel business={business} />}
      <SearchPanel onOpen={onOpen} />
      <SimulatorsPanel business={business} />
    </>
  );
}

// ---- copilot ---------------------------------------------------------------------

function CopilotPanel({ business }) {
  const { t, i18n } = useTranslation();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState(null);
  const money = (v) => (v === null || v === undefined ? t('fincludia.notComputed') : formatAmount(i18n.language, v, business.currency));

  const ask = async (body) => {
    setError(null);
    try {
      setAnswer(await api.post('/fin/entreprise/copilote', body));
    } catch (err) {
      setError(invoicingError(t, err));
    }
  };

  const text = () => {
    if (!answer) return null;
    if (!answer.intent) return t('business.tools.copilot.unknown');
    if (answer.needs) return t(`business.tools.copilot.needs.${answer.needs}`);
    const v = answer.values;
    const values = {
      ...v,
      amount: money(v.amount),
      paid: money(v.paid),
      outstanding: money(v.outstanding),
      invoiced: money(v.invoiced),
      collected: money(v.collected),
      cash: money(v.cash),
      receivables: money(v.receivables),
      lowest: money(v.lowest),
      value: money(v.value),
      gap: money(v.gap),
      date: v.date ? formatDate(i18n.language, v.date) : '',
      state: v.state ? t(`business.states.${v.state}`) : '',
    };
    if (answer.intent === 'cashNegative' && !v.week) return t('business.tools.copilot.answers.cashNeverNegative', values);
    return t(`business.tools.copilot.answers.${answer.intent}`, values);
  };

  return (
    <section aria-labelledby="business-copilot">
      <h2 id="business-copilot">
        <MessageCircleQuestion size={18} aria-hidden="true" /> {t('business.tools.copilot.title')}
      </h2>
      <p className="business-blocked-intro">{t('business.tools.copilot.intro')}</p>
      <form
        className="tools-ask"
        onSubmit={(e) => {
          e.preventDefault();
          if (question.trim()) ask({ question: question.trim() });
        }}
      >
        <input id="copilot-question" value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={300} placeholder={t('business.tools.copilot.placeholder')} aria-label={t('business.tools.copilot.title')} />
        <Button type="submit" variant="secondary">
          {t('business.tools.copilot.ask')}
        </Button>
      </form>
      <div className="inv-filters">
        {SUGGESTED.map((intent) => (
          <button key={intent} type="button" className="inv-filter" onClick={() => ask({ intent, question })}>
            {t(`business.tools.copilot.questions.${intent}`)}
          </button>
        ))}
      </div>
      {error && <p className="form-error">{error}</p>}
      {answer && (
        <div className="tools-answer" role="status">
          <p>{text()}</p>
          {answer.needs === 'client' && (
            <div className="inv-filters">
              {answer.options.map((c) => (
                <button key={c.id} type="button" className="inv-filter" onClick={() => ask({ intent: 'clientBalance', params: { clientId: c.id } })}>
                  {c.name}
                </button>
              ))}
            </div>
          )}
          {answer.needs === 'invoiceNumber' && (
            <div className="inv-filters">
              {answer.options.map((number) => (
                <button key={number} type="button" className="inv-filter" onClick={() => ask({ intent: 'invoiceStatus', params: { number } })}>
                  {number}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ---- universal search (REC-001) ------------------------------------------------------

function SearchPanel({ onOpen }) {
  const { t } = useTranslation();
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(q.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [q]);
  const results = useApi(debounced.length >= 2 ? `/fin/entreprise/recherche?q=${encodeURIComponent(debounced)}` : null);
  const rows = results.data?.resultats ?? [];

  return (
    <section aria-labelledby="business-search">
      <h2 id="business-search">
        <Search size={18} aria-hidden="true" /> {t('business.tools.search.title')}
      </h2>
      <input id="business-search-input" className="tools-search" value={q} onChange={(e) => setQ(e.target.value)} maxLength={80} placeholder={t('business.tools.search.placeholder')} aria-label={t('business.tools.search.title')} />
      {debounced.length >= 2 &&
        (results.status === 'loading' && !results.data ? (
          <LoadingState />
        ) : rows.length === 0 ? (
          <p className="business-empty">{t('business.tools.search.none')}</p>
        ) : (
          <ul className="trade-pieces tools-results">
            {rows.map((row) => (
              <li key={`${row.type}-${row.id}`}>
                <span>
                  <span className="inv-badge">{t(`business.tools.search.types.${row.type}`)}</span> <strong>{row.title}</strong>
                </span>
                <Button type="button" variant="ghost" onClick={() => onOpen(TAB_OF[row.type])}>
                  {t('business.tools.search.open')}
                </Button>
              </li>
            ))}
          </ul>
        ))}
    </section>
  );
}

// ---- simulators and comparators ----------------------------------------------------------

function InputField({ id, input, currency, value, onChange }) {
  const { t } = useTranslation();
  const label = t(`business.tools.in.${input.key}`);
  if (input.unit === 'money') return <AmountField id={id} label={label} currency={currency} value={value ?? ''} onChange={onChange} required={!input.optional} />;
  return (
    <label>
      {label}
      {input.unit === 'ratio' ? ' (%)' : ''}
      {input.optional && <span className="fin-optional"> {t('fincludia.optional')}</span>}
      <input id={id} type="number" step="any" value={value ?? ''} onChange={(e) => onChange(e.target.value)} required={!input.optional} />
    </label>
  );
}

// From what the person typed to what the server expects: money in minor units, percentages as decimals.
function toInputs(spec, values, currency) {
  const inputs = {};
  for (const input of spec.entrees) {
    const raw = values[input.key];
    if (raw === undefined || raw === '') continue;
    if (input.unit === 'money') inputs[input.key] = toMinorUnits(raw, currency, { allowZero: true });
    else if (input.unit === 'ratio') inputs[input.key] = Number(String(raw).replace(',', '.')) / 100;
    else inputs[input.key] = Number(String(raw).replace(',', '.'));
  }
  return inputs;
}

function SimulatorsPanel({ business }) {
  const { t } = useTranslation();
  const catalogue = useApi('/fin/entreprise/simulateurs');
  const [mode, setMode] = useState('simulate');
  const [code, setCode] = useState('breakEven');
  const [publicFilter, setPublicFilter] = useState('');
  const data = catalogue.data;
  const publics = useMemo(() => [...new Set((data?.catalogue ?? []).flatMap((row) => row.publics.split(';').map((p) => p.trim())).filter(Boolean))].sort(), [data]);

  if (catalogue.status === 'loading' && !data) return <LoadingState />;
  if (!data) return null;
  const rows = (data.catalogue ?? []).filter((row) => !publicFilter || row.publics.includes(publicFilter));

  return (
    <section aria-labelledby="business-simulators">
      <h2 id="business-simulators">
        <Calculator size={18} aria-hidden="true" /> {t('business.tools.sim.title')}
      </h2>
      <p className="business-blocked-intro">{t('business.tools.sim.intro')}</p>
      <div className="inv-filters" role="group">
        {['simulate', 'compare', 'catalogue'].map((m) => (
          <button key={m} type="button" className={mode === m ? 'inv-filter is-on' : 'inv-filter'} aria-pressed={mode === m} onClick={() => setMode(m)}>
            {t(`business.tools.sim.modes.${m}`)}
          </button>
        ))}
      </div>

      {mode === 'simulate' && (
        <>
          <label className="pilot-inline">
            {t('business.tools.sim.choose')}
            <select id="simulator-code" value={code} onChange={(e) => setCode(e.target.value)}>
              {data.simulateurs.map((s) => (
                <option key={s.code} value={s.code}>
                  {t(`business.tools.sims.${s.code}`)}
                </option>
              ))}
            </select>
          </label>
          <SimulatorForm key={code} spec={data.simulateurs.find((s) => s.code === code)} business={business} />
        </>
      )}

      {mode === 'compare' && <Comparator data={data} business={business} />}

      {mode === 'catalogue' && (
        <>
          <label className="pilot-inline">
            {t('business.tools.sim.public')}
            <select value={publicFilter} onChange={(e) => setPublicFilter(e.target.value)}>
              <option value="">{t('business.tools.sim.allPublics')}</option>
              {publics.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <ul className="trade-pieces">
            {rows.map((row, index) => (
              <li key={`${row.nom}-${index}`} className={row.code ? 'dia-status-validated' : 'dia-status-planned'}>
                <span>
                  <strong>{row.nom}</strong> <span className="inv-muted">· {row.publics}</span>
                </span>
                {row.code ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setCode(row.code);
                      setMode('simulate');
                    }}
                  >
                    {t(`business.tools.sims.${row.code}`)}
                  </Button>
                ) : (
                  <span className="inv-muted">{t(`business.tools.sim.reasons.${row.reason}`)}</span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function SimulatorForm({ spec, business }) {
  const { t } = useTranslation();
  const [values, setValues] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const format = useFormat(business.currency);
  if (!spec) return null;

  return (
    <form
      className="business-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        try {
          setResult(await api.post(`/fin/entreprise/simulateurs/${spec.code}`, { inputs: toInputs(spec, values, business.currency) }));
        } catch (err) {
          setError(invoicingError(t, err));
        }
      }}
    >
      <p className="inv-muted">{t(`business.tools.simHelp.${spec.code}`)}</p>
      <div className="business-form-row">
        {spec.entrees.map((input) => (
          <InputField key={input.key} id={`sim-${spec.code}-${input.key}`} input={input} currency={business.currency} value={values[input.key]} onChange={(v) => setValues((p) => ({ ...p, [input.key]: v }))} />
        ))}
      </div>
      <Button type="submit" variant="secondary">
        {t('business.tools.sim.run')}
      </Button>
      {error && <p className="form-error">{error}</p>}
      {result && (
        <div className="tools-answer" role="status">
          {result.regleNonPubliee && <Notice variant="info">{t('business.tools.sim.ruleNotPublished')}</Notice>}
          {result.baremesProvisoires && <Notice variant="info">{t('business.tools.sim.payrollProvisional')}</Notice>}
          <table className="pilot-table">
            <tbody>
              {result.outputs.map((o) => (
                <tr key={o.key}>
                  <th scope="row">{t(`business.tools.out.${o.key}`)}</th>
                  <td>{format(o.value, o.unit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="inv-muted">{t('business.tools.sim.hypothesis')}</p>
        </div>
      )}
    </form>
  );
}

// The same simulator on two or three options, side by side (15_COMPARATEURS).
function Comparator({ data, business }) {
  const { t } = useTranslation();
  const [code, setCode] = useState(data.comparateurs[0]?.code);
  const comparator = data.comparateurs.find((c) => c.code === code);
  const spec = data.simulateurs.find((s) => s.code === comparator?.simulator);
  const count = Math.max(2, comparator?.options ?? 2);
  const [values, setValues] = useState({});
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const format = useFormat(business.currency);
  if (!comparator || !spec) return null;

  return (
    <>
      <label className="pilot-inline">
        {t('business.tools.sim.compareChoose')}
        <select
          id="comparator-code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setValues({});
            setResults(null);
          }}
        >
          {data.comparateurs.map((c) => (
            <option key={c.code} value={c.code}>
              {t(`business.tools.comparators.${c.code}`)}
            </option>
          ))}
        </select>
      </label>
      <form
        className="business-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          try {
            setResults(await Promise.all(Array.from({ length: count }, (_, i) => api.post(`/fin/entreprise/simulateurs/${spec.code}`, { inputs: toInputs(spec, values[i] ?? {}, business.currency) }))));
          } catch (err) {
            setError(invoicingError(t, err));
          }
        }}
      >
        <div className="tools-options">
          {Array.from({ length: count }, (_, i) => (
            <fieldset key={i} className="inv-lines">
              <legend>{t('business.tools.sim.option', { n: i + 1 })}</legend>
              {spec.entrees.map((input) => (
                <InputField
                  key={input.key}
                  id={`cmp-${i}-${input.key}`}
                  input={input}
                  currency={business.currency}
                  value={values[i]?.[input.key]}
                  onChange={(v) => setValues((p) => ({ ...p, [i]: { ...(p[i] ?? {}), [input.key]: v } }))}
                />
              ))}
            </fieldset>
          ))}
        </div>
        <Button type="submit" variant="secondary">
          <Scale size={16} aria-hidden="true" />
          {t('business.tools.sim.compare')}
        </Button>
        {error && <p className="form-error">{error}</p>}
        {results && (
          <div className="pilot-table-wrap">
            <table className="pilot-table">
              <thead>
                <tr>
                  <th scope="col"> </th>
                  {results.map((_, i) => (
                    <th key={i} scope="col">
                      {t('business.tools.sim.option', { n: i + 1 })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results[0].outputs.map((o, row) => (
                  <tr key={o.key}>
                    <th scope="row">{t(`business.tools.out.${o.key}`)}</th>
                    {results.map((r, i) => (
                      <td key={i}>{format(r.outputs[row].value, r.outputs[row].unit)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="inv-muted">{t('business.tools.sim.compareNote')}</p>
          </div>
        )}
      </form>
    </>
  );
}
