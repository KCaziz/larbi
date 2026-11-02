import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';
import { api, ApiError } from '../../lib/api.js';
import { useAuth } from '../../auth/useAuth.js';
import { formatAmount, formatNumber, formatRatio } from '../../lib/format.js';
import LineChart from '../fincludia/charts/LineChart.jsx';
import Button from '../ui/Button.jsx';
import Notice from '../ui/Notice.jsx';
import '../../pages/outils/Simulators.css';

// One FINCLUDIA simulator: its form, its results and its "Pourquoi ?" (P4-10,
// P4-11). Extracted from the simulator page when the workshop (P4-16) needed the
// same thing on a screen of its own: two copies of a form built from a server
// registry would have drifted apart on the first new field type.
//
// The form is drawn from what the SERVER declares, so a new input is one line in
// the registry rather than a change on both sides.
//
// Units at the boundary: the engine works in integer centimes and decimal rates,
// while a person types dinars and percentages. The conversion happens here, in
// one place, and only here.
const CURRENCY = 'DZD';

const toServer = (field, raw) => {
  if (field.type === 'text') {
    const label = String(raw).trim();
    return label === '' ? null : label;
  }
  if (field.type === 'choice') return String(raw);
  const value = Number(raw);
  if (!Number.isFinite(value)) return null;
  if (field.type === 'money') return Math.round(value * 100);
  if (field.type === 'rate') return value / 100;
  return Math.round(value);
};

// What a person types in a row of a repeated field (P4-11), before conversion.
const emptyRow = (item) => Object.fromEntries(item.map((field) => [field.key, '']));

// A composite answer (F056, ALG-01) holds several named parts. Each part says
// how it must be read, because the contract gives the whole answer one unit:
// "composite". Nothing is guessed from the value's shape.
const COMPOSITE_PARTS = {
  livingAllowance: 'money',
  effortRate: 'ratio',
  strategy: 'strategy',
  completed: 'flag',
  months: 'months',
  totalPaid: 'money',
  totalInterest: 'money',
  payoff: 'payoff',
};

// The way back, for the illustrative values of the catalogue: they are declared
// in the engine's units and shown in the person's.
const fromServer = (field, value) => {
  if (field.type === 'money') return value / 100;
  if (field.type === 'rate') return value * 100;
  return value;
};

/**
 * @param simulator  as described by GET /api/tools/simulations/:key
 * @param onSaved    called with the saved scenario; when absent, no save
 *                   affordance is shown at all
 */
export default function SimulatorRunner({ simulator, onSaved = null }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const [values, setValues] = useState({});
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  // What was actually sent for the figures on screen: a scenario is saved from
  // these inputs, never from the results.
  const [sent, setSent] = useState(null);
  const [title, setTitle] = useState('');
  const [saved, setSaved] = useState(null);

  // A repeated field always shows at least one row: an empty list would leave
  // nothing to type into.
  const rowsOf = (field) => values[field.key] ?? [emptyRow(field.item)];
  const setRows = (field, rows) => setValues((previous) => ({ ...previous, [field.key]: rows }));
  // A field with a declared default shows it: it is a stated convention the
  // person can change, not a hidden assumption.
  const isShown = (field) => !field.showWhen || Object.entries(field.showWhen).every(([key, wanted]) => shownValue(simulator.fields.find((other) => other.key === key)) === wanted);
  const shownValue = (field) => values[field.key] ?? (field.default === undefined ? '' : String(field.default));

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const body = { currency: CURRENCY };
    for (const field of simulator.fields) {
      if (field.type === 'list') {
        // Every row the person filled in, in the order they appear on screen.
        // A row left entirely empty is dropped rather than sent as zeros.
        body[field.key] = rowsOf(field)
          .map((row) =>
            Object.fromEntries(
              field.item
                .map((sub) => [sub.key, row[sub.key] === undefined || row[sub.key] === '' ? null : toServer(sub, row[sub.key])])
                .filter(([, value]) => value !== null),
            ),
          )
          .filter((row) => Object.keys(row).length > 0);
        continue;
      }
      // A field that only applies to one answer of another (the kind of a yearly
      // rate) is neither shown nor sent when that answer is not the one chosen.
      if (!isShown(field)) continue;
      const raw = values[field.key];
      // An optional field left empty is not sent: the server treats it as
      // "nothing under this heading" and says so in the snapshot.
      if (raw === undefined || raw === '') continue;
      const converted = toServer(field, raw);
      if (converted !== null) body[field.key] = converted;
    }
    try {
      setAnswer(await api.post(`/tools/simulations/${simulator.key}`, body));
      // Kept so a scenario is saved from exactly what produced the figures on
      // screen, not from whatever the form holds a few edits later.
      setSent(body);
      setSaved(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('state.loadError'));
      setAnswer(null);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setValues({});
    setAnswer(null);
    setError(null);
  }

  const amount = (value) => formatAmount(i18n.language, value, CURRENCY);

  // One part of a composite answer, read as COMPOSITE_PARTS declares it.
  const part = (name, value) => {
    const kind = COMPOSITE_PARTS[name];
    if (value === null || value === undefined) return t('simulators.notComputed');
    if (kind === 'money') return amount(value);
    if (kind === 'ratio') return formatRatio(i18n.language, value);
    if (kind === 'months') return t('simulators.months', { count: Math.round(value) });
    if (kind === 'flag') return value ? t('simulators.plan.completed') : t('simulators.plan.notCompleted');
    if (kind === 'strategy') return t(`simulators.strategies.${value}`);
    return String(value);
  };

  // A step of the series: a year (other simulators) or a month of the horizon
  // (interest, whose horizon may be a few months).
  const stepHead = answer?.serie?.some((row) => row.mois !== undefined) ? t('simulators.serie.step') : t('simulators.serie.year');
  const stepKey = (row) => String(row.mois ?? row.annee * 12).padStart(4, '0');
  const stepLabel = (row) => (row.mois !== undefined && row.annee === undefined ? t('simulators.serie.monthN', { month: row.mois }) : t('simulators.serie.yearN', { year: row.annee }));
  // The assumptions of the interest simulator: a choice is shown in words, the
  // rate as a percentage, the others as they come.
  const hypothesisValue = (name, value) => {
    if (typeof value === 'string') return t(`simulators.choices.${value}`, { defaultValue: value });
    if (name === 'taux_saisi') return formatRatio(i18n.language, value);
    return value;
  };

  const display = (result) => {
    if (result.resultat === null) return t('simulators.notComputed');
    if (typeof result.resultat !== 'number') return null; // composite: rendered as parts
    if (result.unite === 'ratio') return formatRatio(i18n.language, result.resultat);
    if (result.unite === 'mois') return t('simulators.months', { count: Math.round(result.resultat) });
    if (result.unite === 'jours') return t('simulators.days', { count: Math.round(result.resultat) });
    if (result.unite === 'points') return formatNumber(i18n.language, result.resultat);
    return formatAmount(i18n.language, result.resultat, result.unite);
  };

  // The illustrative values of the catalogue, loaded into the form. They are
  // the client's "exemples" for the empty state: visible, editable, and nothing
  // is computed from them until the person asks.
  function loadExample() {
    const example = simulator.example ?? {};
    const next = {};
    for (const field of simulator.fields) {
      const value = example[field.key];
      if (value === undefined) continue;
      if (field.type === 'list') {
        next[field.key] = value.map((row) =>
          Object.fromEntries(
            field.item.map((sub) => [sub.key, row[sub.key] === undefined ? '' : String(fromServer(sub, row[sub.key]))]),
          ),
        );
        continue;
      }
      next[field.key] = String(fromServer(field, value));
    }
    setValues(next);
    setAnswer(null);
    setError(null);
    setSaved(null);
  }

  async function saveScenario(event) {
    event.preventDefault();
    setError(null);
    try {
      const { scenario } = await api.post('/tools/scenarios', { simulator: simulator.key, title: title.trim(), ...sent });
      setSaved(scenario);
      setTitle('');
      onSaved?.(scenario);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('state.loadError'));
    }
  }

  return (
    <>
      <div className="narrow">
        <Notice variant="info">{t('simulators.disclaimer')}</Notice>
      </div>

      {simulator.example && (
        <div className="simulator-actions">
          <Button type="button" variant="ghost" onClick={loadExample}>
            {t('simulators.loadExample')}
          </Button>
          <p className="comparison-note">{t('simulators.exampleNote')}</p>
        </div>
      )}

      <form className="simulator-form" onSubmit={submit} noValidate>
        <div className="simulator-fields">
          {simulator.fields.map((field) =>
            field.type === 'list' ? (
              <fieldset className="simulator-list" key={field.key}>
                <legend>{t(`simulators.fields.${field.key}`)}</legend>
                {rowsOf(field).map((row, index) => (
                  // The index is the row's identity here: a row has no id of
                  // its own, and reordering is not offered.
                  <div className="simulator-row" key={index}>
                    <span className="simulator-row-number">{t('simulators.rowNumber', { number: index + 1 })}</span>
                    {field.item.map((sub) => (
                      <div className="form-field" key={sub.key}>
                        <label htmlFor={`field-${field.key}-${index}-${sub.key}`}>
                          {t(`simulators.fields.${sub.key}`)}
                          {sub.type === 'money' && <span className="simulator-unit"> ({CURRENCY})</span>}
                          {sub.type === 'rate' && <span className="simulator-unit"> (%)</span>}
                          {!sub.required && <span className="simulator-unit"> — {t('simulators.optional')}</span>}
                        </label>
                        <input
                          id={`field-${field.key}-${index}-${sub.key}`}
                          type={sub.type === 'text' ? 'text' : 'number'}
                          inputMode={sub.type === 'text' ? 'text' : 'decimal'}
                          maxLength={sub.type === 'text' ? sub.maxLength : undefined}
                          step={sub.type === 'count' ? '1' : undefined}
                          required={sub.required}
                          value={row[sub.key] ?? ''}
                          onChange={(e) =>
                            setRows(
                              field,
                              rowsOf(field).map((current, i) => (i === index ? { ...current, [sub.key]: e.target.value } : current)),
                            )
                          }
                        />
                      </div>
                    ))}
                    {rowsOf(field).length > (field.minItems ?? 1) && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setRows(field, rowsOf(field).filter((_, i) => i !== index))}
                      >
                        {t('simulators.removeRow')}
                      </Button>
                    )}
                  </div>
                ))}
                {rowsOf(field).length < (field.maxItems ?? 20) && (
                  <Button type="button" variant="ghost" onClick={() => setRows(field, [...rowsOf(field), emptyRow(field.item)])}>
                    {t('simulators.addRow')}
                  </Button>
                )}
              </fieldset>
            ) : !isShown(field) ? null : field.type === 'choice' ? (
              <div className="form-field" key={field.key}>
                <label htmlFor={`field-${field.key}`}>{t(`simulators.fields.${field.key}`)}</label>
                <select id={`field-${field.key}`} value={shownValue(field)} onChange={(e) => setValues((previous) => ({ ...previous, [field.key]: e.target.value }))}>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {t(`simulators.choices.${option}`)}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="form-field" key={field.key}>
                <label htmlFor={`field-${field.key}`}>
                  {t(`simulators.fields.${field.key}`)}
                  {field.type === 'money' && <span className="simulator-unit"> ({CURRENCY})</span>}
                  {field.type === 'rate' && <span className="simulator-unit"> (%)</span>}
                  {!field.required && <span className="simulator-unit"> — {t('simulators.optional')}</span>}
                </label>
                <input
                  id={`field-${field.key}`}
                  type="number"
                  inputMode="decimal"
                  step={field.type === 'count' ? '1' : 'any'}
                  required={field.required}
                  value={shownValue(field)}
                  onChange={(e) => setValues((previous) => ({ ...previous, [field.key]: e.target.value }))}
                />
              </div>
            ),
          )}
        </div>

        <div className="simulator-actions">
          <Button type="submit" disabled={busy}>
            {busy ? t('simulators.computing') : t('simulators.compute')}
          </Button>
          <Button type="button" variant="ghost" onClick={reset}>
            {t('simulators.reset')}
          </Button>
        </div>
      </form>

      {error && (
        <div className="narrow mt-lg">
          <Notice variant="error">{error}</Notice>
        </div>
      )}

      {answer && (
        <div className="simulator-results mt-lg">
          <h2>{t('simulators.resultsTitle')}</h2>

          {answer.hypotheses && (
            <p className="simulator-hypotheses">
              {t('simulators.hypotheses')}{' '}
              {Object.entries(answer.hypotheses)
                .map(([name, value]) => `${t(`simulators.hypothesisNames.${name}`)} : ${hypothesisValue(name, value)}`)
                .join(' · ')}
            </p>
          )}

          <ul className="simulator-result-list">
            {Object.entries(answer.resultats).map(([name, result]) => {
              return (
                <li className="simulator-result" key={name}>
                  <div className="simulator-result-head">
                    <span className="simulator-result-name">{t(`simulators.results.${name}`)}</span>
                    {display(result) !== null && (
                      <strong className={result.resultat === null ? 'simulator-value simulator-value-unknown' : 'simulator-value'}>
                        {display(result)}
                      </strong>
                    )}
                  </div>

                  {/* A composite answer (F056 "RAV et taux d'effort", ALG-01)
                      is one answer with several named parts: the client's own
                      row returns both, so it is not split into two formulas. */}
                  {display(result) === null && (
                    <ul className="simulator-parts">
                      {Object.entries(result.resultat)
                        .filter(([partName]) => partName in COMPOSITE_PARTS)
                        .map(([partName, value]) => (
                          <li key={partName}>
                            <span className="simulator-part-name">{t(`simulators.parts.${partName}`)}</span>
                            {partName === 'payoff' ? (
                              <span className="simulator-value">
                                {value.length === 0
                                  ? t('simulators.notComputed')
                                  : value
                                      .map((step) =>
                                        t('simulators.plan.payoffStep', {
                                          name: result.entrees_snapshot.labels?.[step.id] ?? step.id,
                                          month: step.month,
                                        }),
                                      )
                                      .join(' · ')}
                              </span>
                            ) : (
                              <span className={value === null ? 'simulator-value simulator-value-unknown' : 'simulator-value'}>
                                {part(partName, value)}
                              </span>
                            )}
                          </li>
                        ))}
                    </ul>
                  )}

                  {/* A small, discreet trigger rather than the formula/
                      variables/hypotheses panel this used to open onto — see
                      `FigureCard.jsx` for the same change and why. */}
                  <details className="simulator-why">
                    <summary aria-label={t('simulators.why')} title={t('simulators.why')}>
                      <Info size={13} aria-hidden="true" />
                    </summary>
                    <p className="simulator-why-text">
                      {t(`fincludia.whyByFormula.${result.formule_id}`, { defaultValue: t('fincludia.whyGeneric') })}
                    </p>
                    {result.avertissements && (
                      <ul className="simulator-warnings">
                        {result.avertissements.map((warning) => (
                          <li key={warning}>{warning}</li>
                        ))}
                      </ul>
                    )}
                  </details>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* A step-by-step series (compound interest, year by year). Each value is a
          contract answer of the server; what was paid in is the sum of the person's
          own inputs, and the interest is the difference of the two — shown, with
          the paid-in column, so the reader can see how much is interest and how
          much is their own money. A table, because that is its keyboard and
          screen-reader form too. */}
      {answer?.serie && answer.serie.length > 0 && (
        <section className="simulator-serie mt-lg" aria-labelledby="simulator-serie-title">
          <h2 id="simulator-serie-title">{t('simulators.serie.title')}</h2>
          {/* The curve: what was paid in, and what it became. The gap between the two
              is the interest; the table below gives both, year by year. */}
          <LineChart
            xLabel={stepHead}
            format={(value) => amount(value)}
            caption={t('simulators.serie.title')}
            series={[
              { key: 'value', label: t('simulators.serie.value'), tone: 0, points: answer.serie.map((row) => ({ month: stepKey(row), label: stepLabel(row), value: row.valeur.resultat })) },
              { key: 'paid', label: t('simulators.serie.paid'), tone: 2, points: answer.serie.map((row) => ({ month: stepKey(row), label: stepLabel(row), value: row.verse })) },
            ]}
          />
          <table className="simulator-serie-table">
            <caption className="sr-only">{t('simulators.serie.title')}</caption>
            <thead>
              <tr>
                <th scope="col">{stepHead}</th>
                <th scope="col">{t('simulators.serie.paid')}</th>
                <th scope="col">{t('simulators.serie.interest')}</th>
                <th scope="col">{t('simulators.serie.value')}</th>
              </tr>
            </thead>
            <tbody>
              {answer.serie.map((row) => (
                <tr key={stepKey(row)}>
                  <th scope="row">{stepLabel(row)}</th>
                  <td>{amount(row.verse)}</td>
                  <td>{row.valeur.resultat === null ? t('simulators.notComputed') : amount(row.valeur.resultat - row.verse)}</td>
                  <td>
                    <strong>{row.valeur.resultat === null ? t('simulators.notComputed') : amount(row.valeur.resultat)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="fin-hint">{t('simulators.serie.note')}</p>
        </section>
      )}

      {/* Keeping a scenario needs an account; running a simulation does not
          (the client's C18 works in discovery mode). */}
      {answer &&
        onSaved &&
        (user ? (
          <form className="scenario-save" onSubmit={saveScenario}>
            <div className="form-field">
              <label htmlFor="scenario-title">{t('simulators.scenarioTitle')}</label>
              <input id="scenario-title" type="text" maxLength={120} required value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <Button type="submit" disabled={title.trim() === ''}>
              {t('simulators.saveScenario')}
            </Button>
            {saved && <p className="comparison-note">{t('simulators.scenarioSaved', { title: saved.title })}</p>}
          </form>
        ) : (
          <div className="narrow mt-lg">
            <Notice variant="info">{t('simulators.saveNeedsAccount')}</Notice>
          </div>
        ))}
    </>
  );
}
