import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Calculator, Check, Download, Lock, Printer, RefreshCw, Trash2, Undo2, Wallet } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatAmount, formatDate, formatRatio } from '../../lib/format.js';
import { fromMinorUnits, toMinorUnits } from '../../lib/money.js';
import { currentOrganisation, newIdempotencyKey } from '../../lib/organisation.js';
import Button from '../../components/ui/Button.jsx';
import Notice from '../../components/ui/Notice.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import AmountField from '../../components/fincludia/AmountField.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';

// P13-05, lot G, second part (2026-11-24): payroll (ECR-0265 to 0271), on
// default rules until the administration confirms them. Every result says so,
// and a bulletin printed while a rule is provisional is a draft.

const VARIABLES = ['baseSalary', 'overtime', 'bonuses', 'irregularBonuses', 'nonContributable', 'absenceDeduction', 'netDeductions'];
const thisMonth = () => new Date().toISOString().slice(0, 7);

export function PayrollSection({ business, can, run }) {
  const { t, i18n } = useTranslation();
  const pay = useApi('/fin/entreprise/paie');
  const [openRun, setOpenRun] = useState(null);
  const manage = can('payroll.manage');
  const reload = async (action, okKey) => {
    const done = await run(action, okKey);
    if (done) pay.reload();
    return done;
  };
  const data = pay.data;
  const money = (v) => formatAmount(i18n.language, v, business.currency);
  if (pay.status === 'loading' && !data) return <LoadingState />;
  if (!data) return null;
  const rules = data.regles;

  return (
    <section aria-labelledby="business-payroll">
      <h2 id="business-payroll">
        <Wallet size={18} aria-hidden="true" /> {t('business.pay.title')}
      </h2>
      <p className="business-blocked-intro">{t('business.pay.intro')}</p>
      {rules.provisoire && <Notice variant="action-needed">{t('business.pay.provisional')}</Notice>}
      <p className="inv-muted inv-note">
        {t('business.pay.rules', {
          snmg: money(rules.snmg),
          employee: formatRatio(i18n.language, rules.employeeRate, { digits: 2 }),
          employer: formatRatio(i18n.language, rules.employerRate, { digits: 2 }),
          works: formatRatio(i18n.language, rules.socialWorksRate, { digits: 2 }),
        })}
      </p>

      <div className="fin-figure-grid">
        <FigureCard label={t('business.pay.mass12')} answer={data.masse12mois} />
      </div>
      {data.parMois.length > 0 && (
        <table className="ledger-table">
          <caption>{t('business.pay.byMonth')}</caption>
          <thead>
            <tr>
              <th scope="col">{t('business.pay.month')}</th>
              <th scope="col">{t('business.pay.headcount')}</th>
              <th scope="col">{t('business.pay.gross')}</th>
              <th scope="col">{t('business.pay.cost')}</th>
            </tr>
          </thead>
          <tbody>
            {data.parMois.map((m) => (
              <tr key={m.periode}>
                <td>{m.periode}</td>
                <td>{m.salaries}</td>
                <td>{money(m.brut)}</td>
                <td>{money(m.cout)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3 className="pilot-subtitle">{t('business.pay.conditionsTitle')}</h3>
      {data.salaries.length === 0 ? (
        <p className="business-empty">{t('business.pay.noEmployee')}</p>
      ) : (
        <ul className="business-documents">
          {data.salaries.map((e) => (
            <Conditions key={e.id} employee={e} business={business} manage={manage} run={reload} />
          ))}
        </ul>
      )}

      <Simulator business={business} />

      <h3 className="pilot-subtitle">{t('business.pay.runsTitle')}</h3>
      <AnnualStatement />
      {manage && <NewRun run={reload} />}
      {data.lots.length === 0 ? (
        <p className="business-empty">{t('business.pay.noRun')}</p>
      ) : (
        <ul className="business-documents">
          {data.lots.map((r) => (
            <li key={r.id} className="business-document">
              <div className="business-document-head">
                <strong>{r.period}</strong>
                <span className="inv-muted">{t('business.pay.slipsCount', { n: r.slips.length })}</span>
                <span className="inv-muted">{t('business.pay.totalNet', { amount: money(r.totaux.net) })}</span>
                <span className="business-document-state">{t(`business.pay.statuses.${r.status}`)}</span>
                {r.provisional && <span className="inv-badge">{t('business.pay.provisionalBadge')}</span>}
              </div>
              <Button type="button" variant="ghost" aria-expanded={openRun === r.id} onClick={() => setOpenRun(openRun === r.id ? null : r.id)}>
                {openRun === r.id ? t('business.pay.hide') : t('business.pay.open')}
              </Button>
              {openRun === r.id && <RunDetail id={r.id} business={business} manage={manage} run={reload} onGone={() => setOpenRun(null)} />}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Conditions({ employee, business, manage, run }) {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState({
    employeeNumber: employee.employeeNumber ?? '',
    socialNumber: employee.socialNumber ?? '',
    baseSalary: employee.baseSalary === null || employee.baseSalary === undefined ? '' : fromMinorUnits(employee.baseSalary, business.currency),
    partTime: employee.partTime,
  });
  const left = Boolean(employee.endedAt);
  return (
    <li className={`business-document ${left ? 'dia-project-cancelled' : ''}`}>
      <div className="business-document-head">
        <strong>{employee.fullName}</strong>
        <span>{employee.position}</span>
        {employee.employeeNumber && <span className="inv-muted">{t('business.pay.number', { n: employee.employeeNumber })}</span>}
        <span className="business-document-state">
          {employee.baseSalary === null ? t('business.pay.noSalary') : t('business.pay.baseOf', { amount: formatAmount(i18n.language, employee.baseSalary, business.currency) })}
        </span>
      </div>
      {manage && !left && (
        <form
          className="business-form business-payment"
          onSubmit={(e) => {
            e.preventDefault();
            const body = {
              employeeNumber: form.employeeNumber.trim() || null,
              socialNumber: form.socialNumber.trim() || null,
              baseSalary: form.baseSalary === '' ? null : toMinorUnits(form.baseSalary, business.currency, { allowZero: true }),
              partTime: form.partTime,
            };
            run(() => api.put(`/fin/entreprise/paie/salaries/${employee.id}`, body, { ifMatch: employee.version }), 'business.pay.conditionsSaved');
          }}
        >
          <label>
            {t('business.pay.numberField')}
            <input value={form.employeeNumber} onChange={(e) => setForm((p) => ({ ...p, employeeNumber: e.target.value }))} maxLength={30} />
          </label>
          <label>
            {t('business.pay.socialNumber')}
            <input value={form.socialNumber} onChange={(e) => setForm((p) => ({ ...p, socialNumber: e.target.value }))} maxLength={30} />
          </label>
          <AmountField id={`base-${employee.id}`} label={t('business.pay.baseSalary')} currency={business.currency} value={form.baseSalary} onChange={(v) => setForm((p) => ({ ...p, baseSalary: v }))} />
          <label className="pilot-check">
            <input type="checkbox" checked={form.partTime} onChange={(e) => setForm((p) => ({ ...p, partTime: e.target.checked }))} />
            {t('business.pay.partTime')}
          </label>
          <Button type="submit" variant="secondary">
            {t('business.pay.save')}
          </Button>
        </form>
      )}
      {manage && !left && (
        <div className="inv-actions">
          <span className="inv-muted">{employee.acces ? t('business.pay.accessOn') : t('business.pay.accessOff')}</span>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              const email = window.prompt(t('business.pay.accessPrompt'));
              if (email?.trim()) run(() => api.put(`/fin/entreprise/paie/salaries/${employee.id}/acces`, { email: email.trim() }), 'business.pay.accessGiven');
            }}
          >
            {t('business.pay.giveAccess')}
          </Button>
          {employee.acces && (
            <Button type="button" variant="ghost" onClick={() => run(() => api.put(`/fin/entreprise/paie/salaries/${employee.id}/acces`, { email: null }), 'business.pay.accessRemoved')}>
              {t('business.pay.removeAccess')}
            </Button>
          )}
        </div>
      )}
    </li>
  );
}

function VariableFields({ idPrefix, business, values, onChange, disabled = false }) {
  const { t } = useTranslation();
  return (
    <div className="business-form-row">
      {VARIABLES.map((k) => (
        <AmountField key={k} id={`${idPrefix}-${k}`} label={t(`business.pay.vars.${k}`)} currency={business.currency} value={values[k]} onChange={(v) => onChange(k, v)} disabled={disabled} />
      ))}
    </div>
  );
}

const toBody = (values, currency) => Object.fromEntries(VARIABLES.filter((k) => values[k] !== '' && values[k] !== undefined).map((k) => [k, toMinorUnits(values[k], currency, { allowZero: true })]));

/** A bulletin simulated, never saved (ECR-0267). */
function Simulator({ business }) {
  const { t } = useTranslation();
  const [values, setValues] = useState(Object.fromEntries(VARIABLES.map((k) => [k, ''])));
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  return (
    <>
      <h3 className="pilot-subtitle">
        <Calculator size={16} aria-hidden="true" /> {t('business.pay.simTitle')}
      </h3>
      <form
        className="business-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          try {
            setResult((await api.post('/fin/entreprise/paie/simulation', toBody(values, business.currency))).simulation);
          } catch {
            setError(t('business.pay.simError'));
          }
        }}
      >
        <VariableFields idPrefix="sim" business={business} values={values} onChange={(k, v) => setValues((p) => ({ ...p, [k]: v }))} />
        <Button type="submit" variant="secondary">
          {t('business.pay.simulate')}
        </Button>
      </form>
      {error && <p className="form-error">{error}</p>}
      {result && (
        <>
          <div className="fin-figure-grid">
            <FigureCard label={t('business.pay.net')} answer={result.netEstime} />
            <FigureCard label={t('business.pay.cost')} answer={result.coutEmployeur} />
          </div>
          <SlipLines slip={result} currency={business.currency} />
        </>
      )}
    </>
  );
}

function SlipLines({ slip, currency }) {
  const { t, i18n } = useTranslation();
  const money = (v) => formatAmount(i18n.language, v, currency);
  const rows = [
    ['gross', slip.gross],
    ['employeeContrib', -slip.employeeContrib],
    ['taxable', slip.taxable],
    ['irg', -slip.irg],
    ['irgIrregular', -(slip.irgIrregular ?? 0)],
    ['netDeductions', -slip.netDeductions],
    ['net', slip.net],
    ['employerContrib', slip.employerContrib],
    ['socialWorks', slip.socialWorks],
    ['employerCost', slip.employerCost],
  ];
  return (
    <>
      <table className="ledger-table">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} className={['net', 'employerCost'].includes(k) ? 'ledger-total' : ''}>
              <th scope="row">{t(`business.pay.lines.${k}`)}</th>
              <td>{money(v)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {(slip.anomalies ?? []).map((a) => (
        <p key={a} className="business-document-warning">
          {t(`business.pay.anomalies.${a}`)}
        </p>
      ))}
    </>
  );
}

function NewRun({ run }) {
  const { t } = useTranslation();
  const [period, setPeriod] = useState(thisMonth());
  const [key, setKey] = useState(newIdempotencyKey);
  return (
    <form
      className="business-form business-payment"
      onSubmit={async (e) => {
        e.preventDefault();
        if (await run(() => api.post('/fin/entreprise/paie/lots', { period }, { idempotencyKey: key }), 'business.pay.runCreated')) setKey(newIdempotencyKey());
      }}
    >
      <label>
        {t('business.pay.month')}
        <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} required />
      </label>
      <Button type="submit" variant="secondary">
        {t('business.pay.prepare')}
      </Button>
    </form>
  );
}

function RunDetail({ id, business, manage, run, onGone }) {
  const { t, i18n } = useTranslation();
  const detail = useApi(`/fin/entreprise/paie/lots/${id}`);
  const [printing, setPrinting] = useState(null);
  const lot = detail.data?.lot;
  const act = async (action, okKey) => {
    const done = await run(action, okKey);
    if (done) detail.reload();
    return done;
  };
  if (detail.status === 'loading' && !lot) return <LoadingState />;
  if (!lot) return null;
  const money = (v) => formatAmount(i18n.language, v, business.currency);
  const base = `/fin/entreprise/paie/lots/${id}`;
  const draft = lot.status === 'draft';
  const d = lot.declarations;

  return (
    <div className="trade-details">
      {lot.provisional && <Notice variant="action-needed">{t('business.pay.provisionalRun')}</Notice>}
      <div className="fin-figure-grid trade-figures">
        <FigureCard label={t('business.pay.runCost')} answer={lot.masse} />
      </div>
      <p className="inv-muted inv-note">
        {t('business.pay.runTotals', { gross: money(lot.totaux.gross), net: money(lot.totaux.net), irg: money(lot.totaux.irg), social: money(lot.totaux.employeeContrib + lot.totaux.employerContrib + lot.totaux.socialWorks) })}
      </p>
      {lot.anomalies > 0 && <p className="business-document-warning">{t('business.pay.runAnomalies', { n: lot.anomalies })}</p>}

      {manage && (
        <div className="inv-actions">
          {draft && (
            <Button type="button" variant="ghost" onClick={() => act(() => api.post(`${base}/recalculer`, {}), 'business.pay.recomputed')}>
              <RefreshCw size={16} aria-hidden="true" />
              {t('business.pay.recompute')}
            </Button>
          )}
          {draft && lot.peutValider && (
            <Button type="button" variant="secondary" onClick={() => act(() => api.post(`${base}/valider`, {}), 'business.pay.validated')}>
              <Check size={16} aria-hidden="true" />
              {t('business.pay.validate')}
            </Button>
          )}
          {draft && !lot.peutValider && <span className="inv-muted">{t('business.pay.otherValidates')}</span>}
          {lot.status === 'validated' && (
            <>
              <Button type="button" variant="ghost" onClick={() => act(() => api.post(`${base}/rouvrir`, {}), 'business.pay.reopened')}>
                <Undo2 size={16} aria-hidden="true" />
                {t('business.pay.reopen')}
              </Button>
              <Button type="button" variant="secondary" onClick={() => act(() => api.post(`${base}/cloturer`, {}), 'business.pay.closed')}>
                <Lock size={16} aria-hidden="true" />
                {t('business.pay.close')}
              </Button>
            </>
          )}
          {draft && (
            <Button
              type="button"
              variant="ghost"
              onClick={async () => {
                if (window.confirm(t('business.pay.discardConfirm')) && (await run(() => api.delete(base), 'business.pay.discarded'))) onGone();
              }}
            >
              <Trash2 size={16} aria-hidden="true" />
              {t('business.pay.discard')}
            </Button>
          )}
        </div>
      )}

      <ul className="business-documents">
        {lot.slips.map((s) => (
          <Slip key={s.id} slip={s} business={business} editable={manage && draft} onSave={(body) => act(() => api.put(`${base}/bulletins/${s.id}`, body), 'business.pay.slipSaved')} onPrint={() => setPrinting(s)} />
        ))}
      </ul>

      <h4 className="pilot-subtitle">{t('business.pay.declarationsTitle')}</h4>
      <ul className="trade-pieces">
        <li>
          <span>{t('business.pay.declSocial', { amount: money(d.cotisations), base: money(d.assiette) })}</span>
          <span className="business-document-state">{t(d.trimestriel ? 'business.pay.dueQuarterly' : 'business.pay.dueMonthly', { date: formatDate(i18n.language, d.echeanceCotisations) })}</span>
        </li>
        <li>
          <span>{t('business.pay.declIrg', { amount: money(d.irgRetenu) })}</span>
          <span className="business-document-state">{t('business.pay.dueOn', { date: formatDate(i18n.language, d.echeanceIrg) })}</span>
        </li>
      </ul>
      <p className="inv-muted inv-note">{t('business.pay.declarationsNote')}</p>
      {printing && <PayslipPrint slip={printing} lot={lot} business={business} onDone={() => setPrinting(null)} />}
    </div>
  );
}

function Slip({ slip, business, editable, onSave, onPrint }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(() => Object.fromEntries(VARIABLES.map((k) => [k, fromMinorUnits(slip[k], business.currency)])));
  return (
    <li className="business-document">
      <div className="business-document-head">
        <strong>{slip.nom}</strong>
        {slip.matricule && <span className="inv-muted">{t('business.pay.number', { n: slip.matricule })}</span>}
        <span className="inv-muted">{t('business.pay.grossNet', { gross: formatAmount(i18n.language, slip.gross, business.currency), net: formatAmount(i18n.language, slip.net, business.currency) })}</span>
        {(slip.anomalies ?? []).length > 0 && <span className="business-document-state">{t('business.pay.toCheck')}</span>}
      </div>
      <div className="inv-actions">
        <Button type="button" variant="ghost" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? t('business.pay.hide') : t('business.pay.details')}
        </Button>
        <Button type="button" variant="ghost" onClick={onPrint}>
          <Printer size={16} aria-hidden="true" />
          {t('business.pay.print')}
        </Button>
      </div>
      {open && (
        <div className="trade-details">
          {editable ? (
            <form
              className="business-form"
              onSubmit={(e) => {
                e.preventDefault();
                onSave(toBody(values, business.currency));
              }}
            >
              <VariableFields idPrefix={`slip-${slip.id}`} business={business} values={values} onChange={(k, v) => setValues((p) => ({ ...p, [k]: v }))} />
              <Button type="submit" variant="secondary">
                {t('business.pay.save')}
              </Button>
            </form>
          ) : null}
          <SlipLines slip={slip} currency={business.currency} />
        </div>
      )}
    </li>
  );
}

/** The printable bulletin (ECR-0269): a draft while a rule is provisional or the run is not validated. */
function PayslipPrint({ slip, lot, business, onDone }) {
  const { t, i18n } = useTranslation();
  const [finish] = useState(() => onDone);
  useEffect(() => {
    document.body.classList.add('printing-document');
    const done = () => finish();
    window.addEventListener('afterprint', done);
    const timer = window.setTimeout(() => window.print(), 80);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('afterprint', done);
      document.body.classList.remove('printing-document');
    };
  }, [finish]);
  const money = (v) => formatAmount(i18n.language, v, business.currency);
  const draft = lot.provisional || lot.status === 'draft';
  const rows = [
    ['baseSalary', slip.baseSalary],
    ['overtime', slip.overtime],
    ['bonuses', slip.bonuses],
    ['irregularBonuses', slip.irregularBonuses ?? 0],
    ['nonContributable', slip.nonContributable],
    ['absenceDeduction', -slip.absenceDeduction],
  ].filter(([, v]) => v !== 0);
  return createPortal(
    <div className="print-sheet-root">
      <article className="print-sheet" dir={i18n.dir?.() ?? 'ltr'}>
        <header className="print-head">
          <div>
            <strong className="print-org">{business.tradeName || business.name}</strong>
            {business.wilaya && <div>{business.wilaya}</div>}
          </div>
          <div className="print-title">
            <h1>{t('business.pay.printTitle')}</h1>
            <div>{lot.period}</div>
          </div>
        </header>
        {draft && <p className="print-draft">{t('business.pay.printDraft')}</p>}
        <section className="print-to">
          <strong>{slip.nom}</strong>
          {slip.poste && <div>{slip.poste}</div>}
          {slip.matricule && <div className="print-small">{t('business.pay.number', { n: slip.matricule })}</div>}
        </section>
        <table className="print-lines">
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k}>
                <td>{t(`business.pay.vars.${k}`)}</td>
                <td>{money(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <table className="print-totals">
          <tbody>
            {[
              ['gross', slip.gross],
              ['employeeContrib', -slip.employeeContrib],
              ['taxable', slip.taxable],
              ['irg', -slip.irg],
              ['irgIrregular', -(slip.irgIrregular ?? 0)],
              ['netDeductions', -slip.netDeductions],
            ].map(([k, v]) => (
              <tr key={k}>
                <th scope="row">{t(`business.pay.lines.${k}`)}</th>
                <td>{money(v)}</td>
              </tr>
            ))}
            <tr className="print-grand">
              <th scope="row">{t('business.pay.lines.net')}</th>
              <td>{money(slip.net)}</td>
            </tr>
          </tbody>
        </table>
        <p className="print-small">{t('business.pay.printEmployer', { contrib: money(slip.employerContrib + slip.socialWorks), cost: money(slip.employerCost) })}</p>
      </article>
    </div>,
    document.body,
  );
}

/** The annual statement of salaries (CSV): one line per employee, validated runs only. */
function AnnualStatement() {
  const { t } = useTranslation();
  const [year, setYear] = useState(new Date().getUTCFullYear() - 1);
  return (
    <div className="inv-actions">
      <label className="pilot-inline">
        {t('business.pay.annualYear')}
        <input type="number" min="2000" max="2100" value={year} onChange={(e) => setYear(e.target.value)} />
      </label>
      <Button
        type="button"
        variant="ghost"
        onClick={async () => {
          try {
            const organisation = currentOrganisation();
            const query = new URLSearchParams({ year: String(year) }).toString();
            const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/fin/entreprise/paie/declaration-annuelle?${query}`, {
              credentials: 'include',
              cache: 'no-store',
              headers: organisation ? { 'X-Organisation': organisation } : {},
            });
            if (!response.ok) throw new Error(String(response.status));
            const url = URL.createObjectURL(await response.blob());
            const link = document.createElement('a');
            link.href = url;
            link.download = `fincludia-salaires-${year}.csv`;
            link.click();
            URL.revokeObjectURL(url);
          } catch {
            window.alert(t('business.pay.annualFailed'));
          }
        }}
      >
        <Download size={16} aria-hidden="true" />
        {t('business.pay.annualDownload')}
      </Button>
    </div>
  );
}
