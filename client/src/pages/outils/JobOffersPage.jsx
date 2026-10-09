import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Briefcase } from 'lucide-react';
import { api, ApiError } from '../../lib/api.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import { formatAmount, formatNumber, formatRatio } from '../../lib/format.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Notice from '../../components/ui/Notice.jsx';
import Section from '../../components/ui/Section.jsx';
import './Simulators.css';

// Job-offer comparator (P4-12), screen ET08. Two or three offers compared on
// what they really leave: the salary, what can be priced around it, and what the
// job costs. The commute is compared in minutes and never turned into money —
// no formula of the client's catalogue prices someone's time.
const CURRENCY = 'DZD';

// Mirrors the server's schema (validation/comparisons.schemas.js). `money`
// fields are typed in dinars and sent in centimes.
const MONEY_FIELDS = ['net', 'bonuses', 'monetisableBenefits', 'transportCost', 'mealCost', 'annualJobCosts'];
const REQUIRED = ['label', 'net'];
const emptyOffer = () => ({ label: '', net: '', bonuses: '', monetisableBenefits: '', transportCost: '', mealCost: '', annualJobCosts: '', commuteMinutes: '', nonMonetisableBenefits: '' });

const CRITERIA = ['netValue', 'cost', 'commuteMinutes'];

export default function JobOffersPage() {
  const { t, i18n } = useTranslation();
  useDocumentMeta(t('jobOffers.title'));

  const [offers, setOffers] = useState([emptyOffer(), emptyOffer()]);
  // A score exists only if the person asks for one AND can see the weights:
  // that is the client's condition in C19, not a display preference.
  const [scored, setScored] = useState(false);
  const [weights, setWeights] = useState({ netValue: '3', cost: '2', commuteMinutes: '1' });
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const setOffer = (index, key, value) =>
    setOffers((previous) => previous.map((offer, i) => (i === index ? { ...offer, [key]: value } : offer)));

  const amount = (value) => formatAmount(i18n.language, value, CURRENCY);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const body = {
      currency: CURRENCY,
      offers: offers.map((offer) => {
        const sent = { label: offer.label.trim() };
        for (const key of MONEY_FIELDS) {
          if (offer[key] === '') continue;
          const value = Number(offer[key]);
          if (Number.isFinite(value)) sent[key] = Math.round(value * 100);
        }
        if (offer.commuteMinutes !== '') sent.commuteMinutes = Math.round(Number(offer.commuteMinutes));
        if (offer.nonMonetisableBenefits.trim() !== '') sent.nonMonetisableBenefits = offer.nonMonetisableBenefits.trim();
        return sent;
      }),
    };
    if (scored) {
      body.weights = Object.fromEntries(
        Object.entries(weights)
          .map(([key, value]) => [key, Number(value)])
          .filter(([, value]) => Number.isFinite(value) && value > 0),
      );
    }
    try {
      setAnswer(await api.post('/tools/comparaisons/offres-emploi', body));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('state.loadError'));
      setAnswer(null);
    } finally {
      setBusy(false);
    }
  }

  const cell = (row, optionKey) => {
    const value = row.values[optionKey];
    if (value === null || value === undefined) return t('simulators.notComputed');
    if (row.unit === 'money') return amount(value);
    if (row.unit === 'ratio') return formatRatio(i18n.language, value);
    if (row.unit === 'months') return t('simulators.months', { count: value });
    if (row.unit === 'count') return t('jobOffers.minutes', { count: value });
    return String(value);
  };

  const comparison = answer?.comparison ?? null;

  return (
    <>
      <PageHeader icon={Briefcase} title={t('jobOffers.title')} subtitle={t('jobOffers.intro')} />

      <Section>
        <div className="narrow">
          <Notice variant="info">{t('jobOffers.disclaimer')}</Notice>
        </div>

        <form className="simulator-form" onSubmit={submit} noValidate>
          {offers.map((offer, index) => (
            // The index is the row's identity: an offer has no id of its own.
            <fieldset className="simulator-list" key={index}>
              <legend>{t('jobOffers.offerNumber', { number: index + 1 })}</legend>
              <div className="simulator-row">
                {['label', ...MONEY_FIELDS, 'commuteMinutes', 'nonMonetisableBenefits'].map((key) => {
                  const isMoney = MONEY_FIELDS.includes(key);
                  const isText = key === 'label' || key === 'nonMonetisableBenefits';
                  return (
                    <div className="form-field" key={key}>
                      <label htmlFor={`offer-${index}-${key}`}>
                        {t(`jobOffers.fields.${key}`)}
                        {isMoney && <span className="simulator-unit"> ({CURRENCY})</span>}
                        {!REQUIRED.includes(key) && <span className="simulator-unit"> — {t('simulators.optional')}</span>}
                      </label>
                      <input
                        id={`offer-${index}-${key}`}
                        type={isText ? 'text' : 'number'}
                        inputMode={isText ? 'text' : 'decimal'}
                        maxLength={isText ? (key === 'label' ? 60 : 280) : undefined}
                        step={key === 'commuteMinutes' ? '1' : undefined}
                        required={REQUIRED.includes(key)}
                        value={offer[key]}
                        onChange={(e) => setOffer(index, key, e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>
              {offers.length > 2 && (
                <Button type="button" variant="ghost" onClick={() => setOffers(offers.filter((_, i) => i !== index))}>
                  {t('simulators.removeRow')}
                </Button>
              )}
            </fieldset>
          ))}

          {/* The client's bound: two or three offers, never more. */}
          {offers.length < 3 && (
            <Button type="button" variant="ghost" onClick={() => setOffers([...offers, emptyOffer()])}>
              {t('jobOffers.addOffer')}
            </Button>
          )}

          <div className="comparison-weights">
            <label className="comparison-toggle" htmlFor="scored">
              <input id="scored" type="checkbox" checked={scored} onChange={(e) => setScored(e.target.checked)} />
              {t('jobOffers.useScore')}
            </label>
            <p className="comparison-note">{t('jobOffers.scoreNote')}</p>
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
            <Button type="submit" disabled={busy}>
              {busy ? t('simulators.computing') : t('jobOffers.compare')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setOffers([emptyOffer(), emptyOffer()]);
                setAnswer(null);
                setError(null);
              }}
            >
              {t('simulators.reset')}
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
            <h2>{t('jobOffers.resultsTitle')}</h2>

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
                        {/* The direction is shown, so a highlighted cell can be
                            checked by the reader instead of being trusted. */}
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
                      options: warning.missing
                        .map((key) => comparison.options.find((option) => option.key === key)?.label ?? key)
                        .join(', '),
                    })}
                  </li>
                ))}
              </ul>
            )}

            {/* The client's rule: a benefit nobody can price is shown apart,
                never folded into the comparable figures. */}
            {answer.offers.some((offer) => offer.nonMonetisableBenefits) && (
              <div className="comparison-aside">
                <h3>{t('jobOffers.nonMonetisableTitle')}</h3>
                <dl>
                  {answer.offers
                    .filter((offer) => offer.nonMonetisableBenefits)
                    .map((offer) => (
                      <div key={offer.key}>
                        <dt>{offer.label}</dt>
                        <dd>{offer.nonMonetisableBenefits}</dd>
                      </div>
                    ))}
                </dl>
              </div>
            )}

            <ul className="simulator-result-list mt-lg">
              {answer.offers.map((offer) => (
                <li className="simulator-result" key={offer.key}>
                  <div className="simulator-result-head">
                    <span className="simulator-result-name">{offer.label}</span>
                  </div>
                  <ul className="simulator-parts">
                    {Object.entries(offer.resultats).map(([name, result]) => (
                      <li key={name}>
                        <span className="simulator-part-name">{t(`jobOffers.results.${name}`)}</span>
                        <span className={result.resultat === null ? 'simulator-value simulator-value-unknown' : 'simulator-value'}>
                          {result.resultat === null ? t('simulators.notComputed') : amount(result.resultat)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="comparison-note">
                    {t('jobOffers.formulaNote', { formula: offer.resultats.netEconomique.formule_id })}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>
    </>
  );
}
