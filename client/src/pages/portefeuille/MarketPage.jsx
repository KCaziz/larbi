import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LineChart as LineIcon } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatAmount, formatRatio } from '../../lib/format.js';
import { toMinorUnits } from '../../lib/money.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import AmountField from '../../components/fincludia/AmountField.jsx';
import LineChart from '../../components/fincludia/charts/LineChart.jsx';
import '../outils/PostalReference.css';
import './PaperPortfolio.css';

// The pedagogical market (screen EP06, recette R8-12): one card per kind of
// placement — its written hypotheses, its simulated history and what that
// history shows, « what if I placed this amount », and a fictional purchase
// into the training portfolio. Everything is an EXAMPLE: the supports are
// archetypes with generic names, the histories are simulated from the
// hypotheses, and the badge says so on every card.
export default function MarketPage() {
  const { t, i18n } = useTranslation();
  const market = useApi('/fin/portefeuille/marche');
  const [assetClass, setAssetClass] = useState('');
  const [compared, setCompared] = useState([]);
  useDocumentMeta(t('market.title'), t('market.intro'));

  if (market.status === 'loading' && !market.data) return <LoadingState />;
  if (market.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={market.reload} />;

  const { supports, inflation, hypothesesDate, version } = market.data;
  const classes = [...new Set(supports.map((support) => support.assetClass))];
  const shown = supports.filter((support) => !assetClass || support.assetClass === assetClass);
  const toggleCompared = (key) => setCompared((list) => (list.includes(key) ? list.filter((row) => row !== key) : [...list, key].slice(-4)));

  return (
    <>
      <PageHeader icon={LineIcon} title={t('market.title')} subtitle={t('market.intro')} back={{ to: '/app/portefeuille', label: t('market.backToPortfolio') }} />
      <div className="market-page">
        <Notice variant="info">
          <strong>{t('market.fictionTitle')}</strong> {t('market.fictionBody', { date: hypothesesDate, version, inflation: formatRatio(i18n.language, inflation) })}
        </Notice>

        <div className="postal-chips" role="group" aria-label={t('market.filter')}>
          <button type="button" className="postal-chip" aria-pressed={assetClass === ''} onClick={() => setAssetClass('')}>
            {t('market.all')}
          </button>
          {classes.map((key) => (
            <button key={key} type="button" className="postal-chip" aria-pressed={assetClass === key} onClick={() => setAssetClass(key)}>
              {t(`market.classes.${key}`)}
            </button>
          ))}
        </div>

        {compared.length >= 2 && <Comparison supports={supports.filter((support) => compared.includes(support.key))} />}

        <ul className="market-list">
          {shown.map((support) => (
            <SupportCard key={support.key} support={support} compared={compared.includes(support.key)} onCompare={() => toggleCompared(support.key)} />
          ))}
        </ul>
      </div>
    </>
  );
}

const percent = (language, value) => (value === null || value === undefined ? '—' : formatRatio(language, value));

function SupportCard({ support, compared, onCompare }) {
  const { t, i18n } = useTranslation();
  const name = t(`market.supports.${support.key}.name`);
  const m = support.measures;
  return (
    <li className="market-card">
      <div className="market-card-head">
        <div>
          <h2>{name}</h2>
          <p className="market-class">{t(`market.classes.${support.assetClass}`)}</p>
        </div>
        <span className="market-badge">{t('market.badge')}</span>
      </div>
      <p>{t(`market.supports.${support.key}.description`)}</p>

      <RiskScale level={support.risk} />

      <dl className="market-facts">
        <dt>{t('market.facts.price')}</dt>
        <dd>{t('market.facts.priceValue', { price: formatAmount(i18n.language, support.price, 'DZD'), month: support.priceMonth })}</dd>
        <dt>{t('market.facts.expected')}</dt>
        <dd>{t('market.facts.expectedValue', { rate: percent(i18n.language, support.yearlyReturn), real: percent(i18n.language, support.realReturn) })}</dd>
        <dt>{t('market.facts.volatility')}</dt>
        <dd>{percent(i18n.language, support.volatility)}</dd>
        <dt>{t('market.facts.liquidity')}</dt>
        <dd>{t(`market.liquidity.${support.liquidity}`)}</dd>
        <dt>{t('market.facts.horizon')}</dt>
        <dd>{support.horizonMonths === 0 ? t('market.horizonNone') : t('market.horizonMonths', { count: support.horizonMonths })}</dd>
      </dl>

      <LineChart
        series={[{ key: support.key, label: name, tone: 0, points: support.series.map((point) => ({ month: point.month, value: point.price })) }]}
        currency="DZD"
        fromZero={false}
        caption={t('market.chartCaption', { name })}
      />

      <h3>{t('market.seen.title')}</h3>
      <ul className="market-seen">
        <li>{t('market.seen.lastYear', { value: percent(i18n.language, m.lastYear) })}</li>
        <li>{t('market.seen.perYear', { value: percent(i18n.language, m.perYear) })}</li>
        <li>{t('market.seen.volatility', { value: percent(i18n.language, m.volatility) })}</li>
        <li>{t('market.seen.worstMonth', { value: percent(i18n.language, m.worstMonth) })}</li>
        <li>{t('market.seen.largestFall', { value: percent(i18n.language, m.largestFall) })}</li>
      </ul>

      <Projection support={support} />
      <Purchase support={support} name={name} />

      <label className="market-compare">
        <input type="checkbox" checked={compared} onChange={onCompare} /> {t('market.compare')}
      </label>
    </li>
  );
}

// Risk from 1 to 7, in boxes AND in words: never the colour alone.
function RiskScale({ level }) {
  const { t } = useTranslation();
  return (
    <div className="market-risk" aria-label={t('market.riskLabel', { level })}>
      <span className="market-risk-text">{t('market.riskLabel', { level })}</span>
      <span className="market-risk-boxes" aria-hidden="true">
        {[1, 2, 3, 4, 5, 6, 7].map((step) => (
          <span key={step} className={step <= level ? `market-risk-box market-risk-on market-risk-${level}` : 'market-risk-box'} />
        ))}
      </span>
    </div>
  );
}

function Projection({ support }) {
  const { t, i18n } = useTranslation();
  const [amount, setAmount] = useState('100000');
  const [years, setYears] = useState(String(Math.max(1, Math.round(support.horizonMonths / 12)) || 1));
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const money = (value) => formatAmount(i18n.language, value, 'DZD');

  async function submit(event) {
    event.preventDefault();
    setError(null);
    const montant = toMinorUnits(amount, 'DZD');
    if (montant === null) return;
    try {
      setResult((await api.get(`/fin/portefeuille/marche/${support.key}/projection?montant=${montant}&annees=${years}`)).projection);
    } catch (err) {
      setError(t(errorKey(err)));
    }
  }

  return (
    <form className="market-projection" onSubmit={submit}>
      <h3>{t('market.projection.title')}</h3>
      <div className="market-inline">
        <AmountField id={`proj-amount-${support.key}`} label={t('market.projection.amount')} value={amount} currency="DZD" onChange={setAmount} required />
        <div className="fin-field">
          <label htmlFor={`proj-years-${support.key}`}>{t('market.projection.years')}</label>
          <input id={`proj-years-${support.key}`} type="number" min="1" max="30" value={years} onChange={(event) => setYears(event.target.value)} required />
        </div>
        <Button type="submit" variant="secondary">
          {t('market.projection.run')}
        </Button>
      </div>
      {error && <p className="form-error">{error}</p>}
      {result && (
        <div className="market-projection-result" role="status">
          <p>{t('market.projection.range', { low: money(result.low), median: money(result.median), high: money(result.high), years: result.years })}</p>
          <p>{t('market.projection.today', { value: money(result.medianInTodayMoney) })}</p>
          <p>{t('market.projection.loss', { value: formatRatio(i18n.language, result.chanceOfLoss) })}</p>
          <p className="fin-hint">{t('market.projection.notAPromise')}</p>
        </div>
      )}
    </form>
  );
}

// A fictional purchase into the training portfolio: the support is added at
// the month's simulated price (once), then the units are bought with the
// pretend capital, and the person lands on the portfolio.
function Purchase({ support, name }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [units, setUnits] = useState('1');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function buy(event) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { instruments } = await api.get('/fin/portefeuille/instruments');
      let instrument = instruments.find((row) => row.label === name);
      if (!instrument) {
        instrument = (await api.post('/fin/portefeuille/instruments', { label: name, markPrice: support.price, markedAt: new Date().toISOString(), note: t('market.instrumentNote') })).instrument;
      }
      await api.post('/fin/portefeuille/operations', {
        instrumentId: instrument.id,
        kind: 'buy',
        quantity: Number(units),
        unitPrice: support.price,
        decidedAt: new Date().toISOString(),
        note: t('market.purchaseNote'),
      });
      navigate('/app/portefeuille', { state: { message: 'market.bought' } });
    } catch (err) {
      setError(t(errorKey(err, { 422: 'market.buyRefused' })));
      setBusy(false);
    }
  }

  return (
    <form className="market-inline market-buy" onSubmit={buy}>
      <div className="fin-field">
        <label htmlFor={`buy-${support.key}`}>{t('market.buy.units')}</label>
        <input id={`buy-${support.key}`} type="number" min="1" max="1000000" step="1" value={units} onChange={(event) => setUnits(event.target.value)} required />
      </div>
      <Button type="submit" disabled={busy}>
        {t('market.buy.submit')}
      </Button>
      {error && <p className="form-error">{error}</p>}
    </form>
  );
}

// Several supports on one chart, each from a base of 100 at the start: the
// same scale for a 1 000 DA and a 15 000 DA support.
function Comparison({ supports }) {
  const { t, i18n } = useTranslation();
  return (
    <section className="market-comparison" aria-labelledby="market-comparison">
      <h2 id="market-comparison">{t('market.comparison.title')}</h2>
      <p className="fin-hint">{t('market.comparison.intro')}</p>
      <LineChart
        series={supports.map((support, index) => ({
          key: support.key,
          label: t(`market.supports.${support.key}.name`),
          tone: index,
          points: support.series.map((point) => ({ month: point.month, value: Math.round((point.price / support.series[0].price) * 1000) / 10 })),
        }))}
        format={(value) => new Intl.NumberFormat(i18n.language === 'tzm' ? 'fr' : i18n.language, { maximumFractionDigits: 1 }).format(value)}
        fromZero={false}
        caption={t('market.comparison.title')}
      />
    </section>
  );
}
