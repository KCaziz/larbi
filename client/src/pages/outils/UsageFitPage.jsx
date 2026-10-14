import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Landmark } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { api, ApiError } from '../../lib/api.js';
import { formatNumber } from '../../lib/format.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import Section from '../../components/ui/Section.jsx';
import Button from '../../components/ui/Button.jsx';
import './Comparator.css';

// "Adéquation à l'usage" bancaire (P4-13, écran ET06) : Σ(correspondance
// critère × poids) / Σ poids sur des comptes réels déjà publics du
// comparateur — jamais un « meilleur » absolu (le score n'existe que si la
// personne donne ses propres poids, exactement la règle de C19).
const CRITERIA = ['accountFee', 'cardFee', 'transferFee', 'atmFee'];
const MIN = 2;
const MAX = 3;
const ANNUALISED = new Set(['accountFee', 'cardFee']);

export default function UsageFitPage() {
  const { t, i18n } = useTranslation();
  useDocumentMeta(t('bankUsage.title'), t('bankUsage.intro'));
  const { status, data, reload } = useApi('/tools/comparator/themes/comptes');

  const [selected, setSelected] = useState([]);
  const [scored, setScored] = useState(false);
  const [weights, setWeights] = useState({ accountFee: '1', cardFee: '1', transferFee: '1', atmFee: '1' });
  const [answer, setAnswer] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [busy, setBusy] = useState(false);

  const toggle = (id) =>
    setSelected((previous) => (previous.includes(id) ? previous.filter((x) => x !== id) : previous.length < MAX ? [...previous, id] : previous));

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setSubmitError(null);
    const body = { conditionIds: selected };
    if (scored) {
      body.weights = Object.fromEntries(
        Object.entries(weights)
          .map(([key, value]) => [key, Number(value)])
          .filter(([, value]) => Number.isFinite(value) && value > 0),
      );
    }
    try {
      setAnswer(await api.post('/tools/comparator/adequation', body));
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : t('state.loadError'));
      setAnswer(null);
    } finally {
      setBusy(false);
    }
  }

  if (status === 'loading') return <LoadingState />;
  if (status === 'error') return <ErrorState message={t('state.loadError')} onRetry={reload} />;

  const conditions = data.conditions;
  const comparison = answer?.comparison ?? null;

  const feeCell = (row, optionKey) => {
    const value = row.values[optionKey];
    if (value === null || value === undefined) return t('comparator.noCost');
    if (value === 0) return t('comparator.free');
    const amount = value.toLocaleString('fr-DZ');
    return ANNUALISED.has(row.criterion) ? t('comparator.perYear', { amount }) : t('bankUsage.perOperation', { amount });
  };

  return (
    <>
      <PageHeader icon={Landmark} title={t('bankUsage.title')} subtitle={t('bankUsage.intro')} />

      <Section>
        <div className="narrow">
          <Notice variant="info">{t('bankUsage.disclaimer')}</Notice>
        </div>

        <form className="simulator-form" onSubmit={submit} noValidate>
          <fieldset className="simulator-list">
            <legend>{t('bankUsage.pickAccounts', { min: MIN, max: MAX })}</legend>
            <p className="simulator-hypotheses">{t('bankUsage.selectedCount', { count: selected.length, max: MAX })}</p>
            {conditions.length === 0 ? (
              <p className="comparator-disclaimer">{t('bankUsage.noneAvailable')}</p>
            ) : (
              <div className="comparator-cards">
                {conditions.map((c) => (
                  <label key={c.id} className="comparison-toggle condition-card">
                    <input
                      type="checkbox"
                      checked={selected.includes(c.id)}
                      disabled={!selected.includes(c.id) && selected.length >= MAX}
                      onChange={() => toggle(c.id)}
                    />
                    <span>
                      <strong>{c.bank.name}</strong> — {c.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </fieldset>

          <div className="comparison-weights">
            <label className="comparison-toggle" htmlFor="scored">
              <input id="scored" type="checkbox" checked={scored} onChange={(e) => setScored(e.target.checked)} />
              {t('bankUsage.useScore')}
            </label>
            <p className="comparison-note">{t('bankUsage.scoreNote')}</p>
            {scored && (
              <div className="simulator-fields">
                {CRITERIA.map((key) => (
                  <div className="form-field" key={key}>
                    <label htmlFor={`weight-${key}`}>{t('jobOffers.weightOf', { criterion: t(`comparison.criteria.${key}`) })}</label>
                    <input
                      id={`weight-${key}`}
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={weights[key]}
                      onChange={(e) => setWeights((previous) => ({ ...previous, [key]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="simulator-actions">
            <Button type="submit" disabled={busy || selected.length < MIN}>
              {busy ? t('simulators.computing') : t('bankUsage.compare')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSelected([]);
                setAnswer(null);
                setSubmitError(null);
              }}
            >
              {t('simulators.reset')}
            </Button>
          </div>
        </form>

        {submitError && (
          <div className="narrow mt-lg">
            <Notice variant="error">{submitError}</Notice>
          </div>
        )}

        {comparison && (
          <div className="simulator-results mt-lg">
            <h2>{t('bankUsage.resultsTitle')}</h2>

            <div className="comparison-table-wrap">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th scope="col">{t('comparison.criterion')}</th>
                    {comparison.options.map((option) => (
                      <th scope="col" key={option.key}>
                        {option.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparison.criteria.map((row) => (
                    <tr key={row.criterion}>
                      <th scope="row">{t(`comparison.criteria.${row.criterion}`)}</th>
                      {comparison.options.map((option) => (
                        <td
                          key={option.key}
                          className={row.best.includes(option.key) ? 'comparison-best' : undefined}
                          aria-label={row.best.includes(option.key) ? t('comparison.bestOnCriterion') : undefined}
                        >
                          {feeCell(row, option.key)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {comparison.scores && (
                    <tr className="comparison-score-row">
                      <th scope="row">{t('comparison.score')}</th>
                      {comparison.options.map((option) => (
                        <td key={option.key}>{formatNumber(i18n.language, comparison.scores[option.key].resultat, { digits: 2 })}</td>
                      ))}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {comparison.scores && (
              <p className="simulator-hypotheses">
                {t('comparison.scoreMethod', {
                  formula: comparison.scores[comparison.options[0].key].formule_id,
                  weights: Object.entries(comparison.weights)
                    .map(([key, weight]) => `${t(`comparison.criteria.${key}`)} × ${weight}`)
                    .join(' · '),
                })}
              </p>
            )}

            {comparison.warnings.length > 0 && (
              <ul className="simulator-warnings">
                {comparison.warnings.map((warning) => (
                  <li key={warning.criterion}>
                    {t('comparison.missingValue', {
                      criterion: t(`comparison.criteria.${warning.criterion}`),
                      options: warning.missing
                        .map((key) => comparison.options.find((option) => option.key === key)?.label ?? key)
                        .join(', '),
                    })}
                  </li>
                ))}
              </ul>
            )}

            <p className="comparator-disclaimer">{t('bankUsage.noOnlinePayment')}</p>
          </div>
        )}
      </Section>
    </>
  );
}
