import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calculator } from 'lucide-react';
import { api, ApiError } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import { formatAmount, formatNumber, formatRatio } from '../../lib/format.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import NotFoundPage from '../NotFoundPage.jsx';
import Section from '../../components/ui/Section.jsx';
import './Simulators.css';

// One FINCLUDIA simulator (P4-10). The form is drawn from what the SERVER
// declares, so a new input never has to be added on both sides.
//
// Units at the boundary: the engine works in integer centimes and decimal rates,
// while a person types dinars and percentages. The conversion happens here, in
// one place, and only here.
const CURRENCY = 'DZD';

const toServer = (field, raw) => {
  const value = Number(raw);
  if (!Number.isFinite(value)) return null;
  if (field.type === 'money') return Math.round(value * 100);
  if (field.type === 'rate') return value / 100;
  return Math.round(value);
};

export default function SimulatorPage() {
  const { key } = useParams();
  const { t, i18n } = useTranslation();
  const detail = useApi(`/tools/simulations/${key}`);

  const [values, setValues] = useState({});
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const simulator = detail.data?.simulator ?? null;
  const formulas = useMemo(() => new Map((simulator?.formulas ?? []).map((f) => [f.id, f])), [simulator]);

  useDocumentMeta(simulator ? t(`simulators.list.${simulator.key}.title`) : t('simulators.title'));

  if (detail.status === 'loading') return <LoadingState />;
  if (detail.status === 'error') {
    if (detail.error instanceof ApiError && detail.error.status === 404) return <NotFoundPage />;
    return <ErrorState message={t('state.loadError')} onRetry={detail.reload} />;
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const body = { currency: CURRENCY };
    for (const field of simulator.fields) {
      const raw = values[field.key];
      // An optional field left empty is not sent: the server treats it as
      // "nothing under this heading" and says so in the snapshot.
      if (raw === undefined || raw === '') continue;
      const converted = toServer(field, raw);
      if (converted !== null) body[field.key] = converted;
    }
    try {
      setAnswer(await api.post(`/tools/simulations/${simulator.key}`, body));
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

  const display = (result) => {
    if (result.resultat === null) return t('simulators.notComputed');
    if (typeof result.resultat !== 'number') return JSON.stringify(result.resultat);
    if (result.unite === 'ratio') return formatRatio(i18n.language, result.resultat);
    if (result.unite === 'mois') return t('simulators.months', { count: Math.round(result.resultat) });
    if (result.unite === 'jours') return t('simulators.days', { count: Math.round(result.resultat) });
    if (result.unite === 'points') return formatNumber(i18n.language, result.resultat);
    return formatAmount(i18n.language, result.resultat, result.unite);
  };

  return (
    <>
      <PageHeader
        icon={Calculator}
        title={t(`simulators.list.${simulator.key}.title`)}
        subtitle={t(`simulators.list.${simulator.key}.body`)}
      />

      <Section>
        <div className="narrow">
          <Notice variant="info">{t('simulators.disclaimer')}</Notice>
        </div>

        <form className="simulator-form" onSubmit={submit} noValidate>
          <div className="simulator-fields">
            {simulator.fields.map((field) => (
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
                  value={values[field.key] ?? ''}
                  onChange={(e) => setValues((previous) => ({ ...previous, [field.key]: e.target.value }))}
                />
              </div>
            ))}
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
                  .map(([name, value]) => `${t(`simulators.hypothesisNames.${name}`)} : ${value}`)
                  .join(' · ')}
              </p>
            )}

            <ul className="simulator-result-list">
              {Object.entries(answer.resultats).map(([name, result]) => {
                const formula = formulas.get(result.formule_id);
                return (
                  <li className="simulator-result" key={name}>
                    <div className="simulator-result-head">
                      <span className="simulator-result-name">{t(`simulators.results.${name}`)}</span>
                      <strong className={result.resultat === null ? 'simulator-value simulator-value-unknown' : 'simulator-value'}>
                        {display(result)}
                      </strong>
                    </div>

                    {/* "Pourquoi ?" — the client requires every figure to expose
                        its formula, its variables and its date of calculation. */}
                    <details className="simulator-why">
                      <summary>{t('simulators.why')}</summary>
                      <dl>
                        <dt>{t('simulators.whyFormula')}</dt>
                        <dd>
                          {formula.label} — <code>{formula.rule}</code>
                        </dd>
                        <dt>{t('simulators.whyReference')}</dt>
                        <dd>
                          {result.formule_id} · {t('simulators.whyVersion', { version: result.formule_version })}
                        </dd>
                        <dt>{t('simulators.whyCondition')}</dt>
                        <dd>{formula.condition}</dd>
                        <dt>{t('simulators.whyInputs')}</dt>
                        <dd>
                          {Object.entries(result.entrees_snapshot)
                            .map(([inputName, value]) => `${inputName} = ${value}`)
                            .join(' · ') || '—'}
                        </dd>
                      </dl>
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
      </Section>
    </>
  );
}
