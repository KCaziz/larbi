import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Scale } from 'lucide-react';
import { api, ApiError } from '../../lib/api.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import { formatAmount, formatNumber, formatRatio } from '../../lib/format.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Notice from '../../components/ui/Notice.jsx';
import Section from '../../components/ui/Section.jsx';
import './Simulators.css';

// Moteur de comparaison (P8-15, écran C19 de l'ancien cahier, surligné par le
// client) : 2 à 3 options comparées sur des critères homogènes, avec le moteur
// de P4-12 (`POST /api/tools/comparaisons`). Les règles de C19 :
// - aucun classement opaque : un score n'existe que si la personne donne des
//   poids, et la méthode s'affiche avec lui ;
// - une donnée manquante est dite, jamais remplacée par zéro ;
// - des devises ou des horizons différents sont refusés, pas convertis (ici
//   tout est saisi en dinars, sur l'horizon que la personne choisit).
const CURRENCY = 'DZD';

// The general-purpose criteria of C19 (« coût, durée, liquidité, risque,
// frais, conditions, compatibilité »). The job-offer and bank-usage criteria
// belong to their own comparators.
const CRITERIA = [
  { key: 'cost', unit: 'money' },
  { key: 'fees', unit: 'money' },
  { key: 'netValue', unit: 'money' },
  { key: 'duration', unit: 'months' },
  { key: 'liquidity', unit: 'points' },
  { key: 'risk', unit: 'points' },
  { key: 'compatibility', unit: 'ratio' },
  { key: 'conditions', unit: 'text' },
];
const DEFAULT_CRITERIA = ['cost', 'duration', 'conditions'];
const emptyOption = () => ({ label: '', values: {} });

// A typed value as the engine reads it: money in centimes, a ratio as a
// decimal, a grade on 0-10, months as an integer, text as typed.
function toEngine(unit, text) {
  const raw = String(text ?? '').trim().replace(',', '.');
  if (raw === '') return undefined;
  if (unit === 'text') return raw;
  const value = Number(raw);
  if (!Number.isFinite(value)) return undefined;
  if (unit === 'money') return Math.round(value * 100);
  if (unit === 'ratio') return value / 100;
  if (unit === 'months') return Math.round(value);
  return value;
}

export default function ComparePage() {
  const { t, i18n } = useTranslation();
  useDocumentMeta(t('compare.title'), t('compare.intro'));
  const [chosen, setChosen] = useState(DEFAULT_CRITERIA);
  const [options, setOptions] = useState([emptyOption(), emptyOption()]);
  const [scored, setScored] = useState(false);
  const [weights, setWeights] = useState({});
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const criteria = CRITERIA.filter((criterion) => chosen.includes(criterion.key));
  const numeric = criteria.filter((criterion) => criterion.unit !== 'text');
  const unitHint = (unit) => t(`compare.units.${unit}`, { currency: CURRENCY });
  const toggle = (key) => setChosen((previous) => (previous.includes(key) ? previous.filter((other) => other !== key) : [...previous, key]));
  const setValue = (index, key, value) =>
    setOptions((previous) => previous.map((option, i) => (i === index ? { ...option, values: { ...option.values, [key]: value } } : option)));

  async function submit(event) {
    event.preventDefault();
    setError(null);
    if (criteria.length === 0) {
      setError(t('compare.errors.noCriterion'));
      return;
    }
    if (options.some((option) => !option.label.trim())) {
      setError(t('compare.errors.labels'));
      return;
    }
    const body = {
      criteria: criteria.map((criterion) => criterion.key),
      options: options.map((option, index) => ({
        key: `o${index + 1}`,
        label: option.label.trim(),
        currency: CURRENCY,
        criteria: Object.fromEntries(
          criteria.map((criterion) => [criterion.key, toEngine(criterion.unit, option.values[criterion.key])]).filter(([, value]) => value !== undefined),
        ),
      })),
    };
    if (scored) {
      body.weights = Object.fromEntries(
        numeric.map((criterion) => [criterion.key, Number(weights[criterion.key])]).filter(([, value]) => Number.isFinite(value) && value > 0),
      );
    }
    setBusy(true);
    try {
      setAnswer(await api.post('/tools/comparaisons', body));
    } catch (err) {
      setAnswer(null);
      setError(err instanceof ApiError && err.status === 400 ? t('compare.errors.input') : t('state.loadError'));
    } finally {
      setBusy(false);
    }
  }

  const comparison = answer?.comparison ?? null;
  const cell = (row, optionKey) => {
    const value = row.values[optionKey];
    if (value === null || value === undefined) return t('simulators.notComputed');
    if (row.unit === 'money') return formatAmount(i18n.language, value, CURRENCY);
    if (row.unit === 'ratio') return formatRatio(i18n.language, value);
    if (row.unit === 'months') return t('simulators.months', { count: value });
    if (row.unit === 'points') return `${formatNumber(i18n.language, value)} / 10`;
    return String(value);
  };

  // « Exporter » (C19): the table as the person sees it, in a CSV a
  // spreadsheet opens. Built here: nothing is sent or stored.
  function exportCsv() {
    const quote = (text) => `"${String(text).replace(/"/g, '""')}"`;
    const lines = [
      [t('comparison.criterion'), ...comparison.options.map((option) => option.label)],
      ...comparison.criteria.map((row) => [t(`comparison.criteria.${row.criterion}`), ...comparison.options.map((option) => cell(row, option.key))]),
    ];
    if (comparison.scores) lines.push([t('comparison.score'), ...comparison.options.map((option) => formatNumber(i18n.language, comparison.scores[option.key].resultat))]);
    const csv = `﻿${lines.map((line) => line.map(quote).join(';')).join('\r\n')}\r\n`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fincludia-comparaison.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader icon={Scale} title={t('compare.title')} subtitle={t('compare.intro')} />

      <Section>
        <div className="narrow">
          <Notice variant="info">{t('compare.disclaimer')}</Notice>
        </div>

        <form className="simulator-form" onSubmit={submit} noValidate>
          <fieldset className="simulator-list compare-criteria">
            <legend>{t('compare.criteriaTitle')}</legend>
            {CRITERIA.map((criterion) => (
              <label key={criterion.key} className="comparison-toggle">
                <input type="checkbox" checked={chosen.includes(criterion.key)} onChange={() => toggle(criterion.key)} />
                {t(`comparison.criteria.${criterion.key}`)}
              </label>
            ))}
          </fieldset>

          {options.map((option, index) => (
            // The index is the row's identity: an option has no id of its own.
            <fieldset className="simulator-list" key={index}>
              <legend>{t('compare.optionNumber', { number: index + 1 })}</legend>
              <div className="simulator-row">
                <div className="form-field">
                  <label htmlFor={`option-${index}-label`}>{t('compare.label')}</label>
                  <input
                    id={`option-${index}-label`}
                    type="text"
                    maxLength={60}
                    required
                    value={option.label}
                    onChange={(e) => setOptions((previous) => previous.map((other, i) => (i === index ? { ...other, label: e.target.value } : other)))}
                  />
                </div>
                {criteria.map((criterion) => (
                  <div className="form-field" key={criterion.key}>
                    <label htmlFor={`option-${index}-${criterion.key}`}>
                      {t(`comparison.criteria.${criterion.key}`)}
                      <span className="simulator-unit"> ({unitHint(criterion.unit)})</span>
                    </label>
                    <input
                      id={`option-${index}-${criterion.key}`}
                      type={criterion.unit === 'text' ? 'text' : 'number'}
                      inputMode={criterion.unit === 'text' ? 'text' : 'decimal'}
                      maxLength={criterion.unit === 'text' ? 280 : undefined}
                      min={criterion.unit === 'points' ? 0 : undefined}
                      max={criterion.unit === 'points' ? 10 : undefined}
                      value={option.values[criterion.key] ?? ''}
                      onChange={(e) => setValue(index, criterion.key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              {options.length > 2 && (
                <Button type="button" variant="ghost" onClick={() => setOptions(options.filter((_, i) => i !== index))}>
                  {t('simulators.removeRow')}
                </Button>
              )}
            </fieldset>
          ))}
          {options.length < 3 && (
            <Button type="button" variant="ghost" onClick={() => setOptions([...options, emptyOption()])}>
              {t('compare.addOption')}
            </Button>
          )}

          {numeric.length > 0 && (
            <div className="comparison-weights">
              <label className="comparison-toggle" htmlFor="compare-scored">
                <input id="compare-scored" type="checkbox" checked={scored} onChange={(e) => setScored(e.target.checked)} />
                {t('compare.useScore')}
              </label>
              <p className="comparison-note">{t('compare.scoreNote')}</p>
              {scored && (
                <div className="simulator-fields">
                  {numeric.map((criterion) => (
                    <div className="form-field" key={criterion.key}>
                      <label htmlFor={`compare-weight-${criterion.key}`}>{t('compare.weightOf', { criterion: t(`comparison.criteria.${criterion.key}`) })}</label>
                      <input
                        id={`compare-weight-${criterion.key}`}
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={weights[criterion.key] ?? ''}
                        onChange={(e) => setWeights((previous) => ({ ...previous, [criterion.key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="simulator-actions">
            <Button type="submit" disabled={busy}>
              {busy ? t('simulators.computing') : t('compare.compare')}
            </Button>
          </div>
        </form>

        {error && (
          <div className="narrow mt-lg">
            <Notice variant="error">{error}</Notice>
          </div>
        )}

        {comparison && (
          <div className="simulator-results mt-lg">
            <h2>{t('compare.resultsTitle')}</h2>
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
                      <th scope="row">
                        {t(`comparison.criteria.${row.criterion}`)}
                        {row.direction && <span className="simulator-unit"> — {t(`comparison.direction.${row.direction}`)}</span>}
                      </th>
                      {comparison.options.map((option) => (
                        <td
                          key={option.key}
                          className={row.best.includes(option.key) ? 'comparison-best' : undefined}
                          aria-label={row.best.includes(option.key) ? t('comparison.bestOnCriterion') : undefined}
                        >
                          {cell(row, option.key)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {comparison.scores && (
                    <tr className="comparison-score-row">
                      <th scope="row">{t('comparison.score')}</th>
                      {comparison.options.map((option) => (
                        <td key={option.key}>{formatNumber(i18n.language, comparison.scores[option.key].resultat)}</td>
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
                      options: warning.missing.map((key) => comparison.options.find((option) => option.key === key)?.label ?? key).join(', '),
                    })}
                  </li>
                ))}
              </ul>
            )}

            <div className="simulator-actions">
              <Button type="button" variant="ghost" onClick={exportCsv}>
                <Download size={16} aria-hidden="true" />
                {t('compare.export')}
              </Button>
              <Button to="/app/outils" variant="ghost" arrow>
                {t('compare.deepen')}
              </Button>
            </div>
          </div>
        )}
      </Section>
    </>
  );
}
