import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api.js';
import { formatAmount, formatDate } from '../../lib/format.js';
import { toMinorUnits } from '../../lib/money.js';
import { newIdempotencyKey } from '../../lib/organisation.js';
import { useOfficialRate } from '../../lib/officialRate.js';
import Button from '../../components/ui/Button.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import AmountField from '../../components/fincludia/AmountField.jsx';
import { CurrencySelect, RateSourceSelect } from '../../components/fincludia/BusinessFields.jsx';

// P13-05, lot D bis (2026-11-25): the exchange effect on a diaspora project
// (ECR-0378). An amount in the person's currency, converted into the project's
// at a dated reference rate and at scenario rates; impact = amount × (scenario
// rate − reference rate). A simulation changes nothing; a scenario can be kept.

const today = () => new Date().toISOString().slice(0, 10);
const iso = (date) => new Date(`${date}T00:00:00.000Z`).toISOString();

export function ProjectFx({ project, base, contribute, run }) {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState({ amount: '', from: 'EUR', referenceRate: '', referenceDate: today(), rateSource: '', rates: '', label: '' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  const from = form.from.trim().toUpperCase();
  const proposed = useOfficialRate(from, project.currency, form.referenceRate, (official) =>
    setForm((p) => (p.referenceRate === '' ? { ...p, referenceRate: official.rate, referenceDate: official.rateDate, rateSource: official.rateSource } : p)),
  );
  const body = () => ({
    amount: toMinorUnits(form.amount, from),
    from,
    to: project.currency,
    referenceRate: Number(String(form.referenceRate).replace(',', '.')),
    referenceDate: iso(form.referenceDate),
    ...(form.rateSource.trim() ? { rateSource: form.rateSource.trim() } : {}),
    rates: form.rates
      .split(/[;\s]+/)
      .map((x) => Number(x.replace(',', '.')))
      .filter((x) => x > 0)
      .slice(0, 5),
  });
  const simulate = async (variations) => {
    setError(null);
    try {
      setResult(await api.post(`${base}/change/simulation`, { ...body(), variations }));
    } catch (err) {
      setError(err?.details?.reason === 'sameCurrency' ? t('business.fx.sameCurrency') : t('business.fx.failed'));
    }
  };
  const money = (value, currency = project.currency) => formatAmount(i18n.language, value, currency);
  const p = result?.projection;

  return (
    <div className="project-fx">
      <h3 className="pilot-subtitle">{t('business.fx.title')}</h3>
      <p className="inv-muted inv-note">{t('business.fx.intro', { currency: project.currency })}</p>
      <form
        className="business-form"
        onSubmit={(event) => {
          event.preventDefault();
          simulate(false);
        }}
      >
        <div className="business-form-row">
          <label>
            {t('business.fx.from')}
            <CurrencySelect value={form.from} onChange={(v) => setForm((p) => ({ ...p, from: v }))} />
          </label>
          <AmountField id={`fx-amount-${project.id}`} label={t('business.fx.amount')} currency={from || 'EUR'} value={form.amount} onChange={(v) => setForm((x) => ({ ...x, amount: v }))} required />
          <label>
            {t('business.trade.rateField', { from: from || '—', to: project.currency })}
            <input type="number" min="0.000001" step="any" value={form.referenceRate} onChange={set('referenceRate')} required />
          </label>
          <label>
            {t('business.trade.rateDate')}
            <input type="date" value={form.referenceDate} onChange={set('referenceDate')} required />
          </label>
        </div>
        <div className="business-form-row">
          <label>
            {t('business.trade.rateSource')}
            <RateSourceSelect value={form.rateSource} onChange={(v) => setForm((p) => ({ ...p, rateSource: v }))} />
          </label>
          <label>
            {t('business.fx.scenarioRates')}
            <input value={form.rates} onChange={set('rates')} placeholder={t('business.fx.scenarioRatesHint')} />
          </label>
        </div>
        {proposed && <p className="inv-muted inv-note">{t('business.trade.officialProposed')}</p>}
        <div className="inv-actions">
          <Button type="submit" variant="secondary">
            {t('business.fx.convert')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={(event) => {
              if (event.currentTarget.form.reportValidity()) simulate(true);
            }}
          >
            {t('business.fx.variations')}
          </Button>
        </div>
      </form>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {p && (
        <>
          <div className="fin-figure-grid trade-figures">
            <FigureCard label={t('business.fx.reference', { rate: p.coursReference, date: formatDate(i18n.language, p.dateCours) })} answer={p.contreValeurReference} />
          </div>
          {p.resteAFinancer !== null && p.resteAFinancer > 0 && (
            <p className="inv-muted inv-note">{t('business.fx.toCover', { remaining: money(p.resteAFinancer), amount: money(p.pourCouvrirReference, p.de) })}</p>
          )}
          {p.scenarios.length > 0 && (
            <div className="ledger-scroll">
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th scope="col">{t('business.fx.rate')}</th>
                    <th scope="col">{t('business.fx.counterValue')}</th>
                    <th scope="col">{t('business.fx.impact')}</th>
                    {p.resteAFinancer > 0 && <th scope="col">{t('business.fx.toCoverCol', { currency: p.de })}</th>}
                  </tr>
                </thead>
                <tbody>
                  {p.scenarios.map((s) => (
                    <tr key={`${s.source}-${s.rate}`}>
                      <td>
                        {s.rate}
                        {s.variation !== undefined && <span className="inv-muted"> ({s.variation > 0 ? '+' : ''}{Math.round(s.variation * 100)} %)</span>}
                      </td>
                      <td>{money(s.contreValeur.resultat)}</td>
                      <td>{money(s.impact.resultat)}</td>
                      {p.resteAFinancer > 0 && <td>{money(s.pourCouvrir, p.de)}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {p.fourchette && <p className="inv-muted inv-note">{t('business.fx.range', { min: money(p.fourchette.min), max: money(p.fourchette.max) })}</p>}
          {contribute && (
            <form
              className="business-form"
              onSubmit={async (event) => {
                event.preventDefault();
                const done = await run(() => api.post(`${base}/change/scenarios`, { ...body(), label: form.label.trim() }, { idempotencyKey: newIdempotencyKey() }), 'business.fx.saved');
                if (done) {
                  setForm((x) => ({ ...x, label: '' }));
                  simulate(false);
                }
              }}
            >
              <div className="business-form-row">
                <label>
                  {t('business.fx.label')}
                  <input value={form.label} onChange={set('label')} maxLength={160} required />
                </label>
              </div>
              <Button type="submit" variant="ghost">
                {t('business.fx.keep')}
              </Button>
            </form>
          )}
          {result.scenariosConserves.length > 0 && (
            <>
              <h4>{t('business.fx.keptTitle')}</h4>
              <ul className="trade-pieces">
                {result.scenariosConserves.map((s) => (
                  <li key={s.id}>
                    <span>{s.label}</span>
                    <span className="inv-muted">{t('business.fx.keptLine', { amount: money(s.amount, s.fromCurrency), rate: s.referenceRate, date: formatDate(i18n.language, s.referenceDate), rates: (s.rates ?? []).join(' ; ') || '—' })}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
