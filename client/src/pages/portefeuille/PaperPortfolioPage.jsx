import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FlaskConical, Plus, RotateCcw, Scale } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { formatAmount, formatDate, formatRatio } from '../../lib/format.js';
import { toMinorUnits } from '../../lib/money.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import AmountField from '../../components/fincludia/AmountField.jsx';
import '../../components/fincludia/Fincludia.css';
import './PaperPortfolio.css';

// Paper portfolio and investment workshop (P6-12), screens C17 and EP03-EP07.
//
// The SIMULATION badge is permanent and at the top of the page, not a label on
// a figure somebody might scroll past. And the page states its own honest
// limit: there is no instrument catalogue and no published price, because the
// client has supplied neither — the prices here are the person's own.
export default function PaperPortfolioPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const currency = user?.finCurrency ?? 'DZD';
  const [message, setMessage] = useState(null);
  useDocumentMeta(t('paper.title'), t('paper.intro'));

  const portfolio = useApi('/fin/portefeuille');
  const references = useApi('/fin/portefeuille/references');
  const diagnostic = useApi('/fin/portefeuille/diagnostic');
  const journal = useApi('/fin/portefeuille/decisions');

  function reloadAll() {
    portfolio.reload();
    journal.reload();
  }

  async function run(action, okKey) {
    setMessage(null);
    try {
      await action();
      setMessage({ kind: 'ok', text: t(okKey) });
      reloadAll();
      return { ok: true };
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 422: 'paper.errors.refused' })) });
      return { ok: false };
    }
  }

  if (portfolio.status === 'loading' && !portfolio.data) return <LoadingState />;
  if (portfolio.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={portfolio.reload} />;

  const view = portfolio.data.portefeuille;
  const formulas = new Map((portfolio.data.formulas ?? []).map((row) => [row.id, row]));

  return (
    <>
      <PageHeader icon={FlaskConical} title={t('paper.title')} subtitle={t('paper.intro')} maxWidth={1040} />
      <div className="paper-page">
        {/* Permanent, and the first thing on the page. */}
        <p className="fin-badge-simulation paper-badge">{t('fincludia.simulationBadge')}</p>
        <p className="paper-rule">{t('paper.noExecution')}</p>
        {/* The honest limit of this screen, stated rather than left to be
            discovered. */}
        <p className="paper-rule">{t('paper.pricesAreYours')}</p>

        {message && (
          <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
            {message.text}
          </p>
        )}

        <section aria-labelledby="paper-figures">
          <h2 id="paper-figures">
            {t('paper.figuresTitle')}
            <span className="paper-since">{t('paper.since', { date: formatDate(i18n.language, view.depuis) })}</span>
          </h2>
          <div className="fin-cards">
            <FigureCard label={t('paper.invested')} answer={view.valeurInvestie} formula={formulas.get('F038')} simulation />
            <FigureCard label={t('paper.gainLoss')} answer={view.gainPerte} formula={formulas.get('F039')} simulation />
            <FigureCard label={t('paper.return')} answer={view.rendement} formula={formulas.get('F040')} simulation />
          </div>
          <dl className="paper-totals">
            <dt>{t('paper.capital')}</dt>
            <dd>{formatAmount(i18n.language, view.capital, view.currency)}</dd>
            <dt>{t('paper.cash')}</dt>
            <dd>{formatAmount(i18n.language, view.cash, view.currency)}</dd>
            <dt>{t('paper.feeRate')}</dt>
            <dd>{formatRatio(i18n.language, view.feeRate)}</dd>
          </dl>

          {/* « Message éducatif, pas une alarme » — the client's own words. */}
          {view.concentrationSignalee && (
            <p className="paper-notice">{t('paper.concentrationNotice', { share: formatRatio(i18n.language, view.seuilConcentration) })}</p>
          )}
          {view.avertissements.length > 0 && (
            <ul className="paper-warnings">
              {view.avertissements.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          )}
        </section>

        <PositionsSection t={t} language={i18n.language} view={view} formulas={formulas} currency={currency} run={run} />
        <ReadinessSection t={t} diagnostic={diagnostic.data} />
        <RiskSection t={t} references={references.data} />
        <JournalSection t={t} language={i18n.language} decisions={journal.data?.decisions ?? []} currency={view.currency} />

        <section aria-labelledby="paper-reset">
          <h2 id="paper-reset">{t('paper.resetTitle')}</h2>
          {/* Said before the button, because a reset really does clear the
              journal — which is why the export exists. */}
          <p className="paper-help">{t('paper.resetHelp')}</p>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (window.confirm(t('paper.resetConfirm'))) run(() => api.post('/fin/portefeuille/reinitialiser', {}), 'paper.reset');
            }}
          >
            <RotateCcw size={16} aria-hidden="true" /> {t('paper.reset')}
          </Button>
        </section>
      </div>
    </>
  );
}

function PositionsSection({ t, language, view, formulas, currency, run }) {
  const [adding, setAdding] = useState(false);
  const [trading, setTrading] = useState(null);

  return (
    <section aria-labelledby="paper-positions">
      <h2 id="paper-positions">{t('paper.positionsTitle')}</h2>
      {view.positions.length === 0 ? (
        <p className="paper-empty">{t('paper.noPosition')}</p>
      ) : (
        <ul className="paper-list">
          {view.positions.map((position) => (
            <li key={position.id} className="paper-row">
              <span className="paper-row-label">{position.label}</span>
              <span className="paper-tag">{t('paper.units', { count: position.quantity })}</span>
              <span className="paper-row-amount">{formatAmount(language, position.value, view.currency)}</span>
              {/* The simulated price, with the date the person stated it. */}
              <span className="paper-row-price">
                {t('paper.markedAt', { price: formatAmount(language, position.markPrice, view.currency), date: formatDate(language, position.markedAt) })}
              </span>
              <FigureCard label={t('paper.gainLoss')} answer={position.gainPerte} formula={formulas.get('F039')} simulation />
              <button type="button" className="paper-plain" onClick={() => setTrading(trading === position.id ? null : position.id)}>
                {t('paper.trade')}
              </button>
              {trading === position.id && (
                <TradeForm t={t} instrumentId={position.id} currency={currency} run={run} onDone={() => setTrading(null)} />
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="paper-actions">
        <Button type="button" variant="secondary" onClick={() => setAdding((value) => !value)}>
          <Plus size={16} aria-hidden="true" /> {t('paper.addInstrument')}
        </Button>
        {view.positions.filter((position) => position.quantity > 0).length >= 2 && (
          <RebalanceButton t={t} language={language} positions={view.positions.filter((position) => position.quantity > 0)} />
        )}
      </div>
      {adding && <InstrumentForm t={t} currency={currency} run={run} onDone={() => setAdding(false)} />}
    </section>
  );
}

function InstrumentForm({ t, currency, run, onDone }) {
  const [label, setLabel] = useState('');
  const [price, setPrice] = useState('');
  const [markedAt, setMarkedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState(null);

  async function submit(event) {
    event.preventDefault();
    setError(null);
    const markPrice = toMinorUnits(price, currency);
    if (markPrice === null || markPrice <= 0) {
      setError(t('paper.errors.price'));
      return;
    }
    const outcome = await run(
      () => api.post('/fin/portefeuille/instruments', { label: label.trim(), markPrice, markedAt: new Date(markedAt).toISOString() }),
      'paper.instrumentAdded',
    );
    if (outcome.ok) onDone();
  }

  return (
    <form className="paper-form" onSubmit={submit}>
      <div className="paper-form-grid">
        <label htmlFor="paper-label">
          {t('paper.fields.instrument')}
          <input id="paper-label" type="text" value={label} onChange={(event) => setLabel(event.target.value)} required maxLength={80} />
        </label>
        <AmountField id="paper-price" label={t('paper.fields.markPrice')} value={price} onChange={setPrice} currency={currency} required />
        <label htmlFor="paper-marked">
          {t('paper.fields.markedAt')}
          <input id="paper-marked" type="date" value={markedAt} onChange={(event) => setMarkedAt(event.target.value)} required />
        </label>
      </div>
      {/* Why there is no list to pick from. */}
      <p className="paper-help">{t('paper.noCatalogue')}</p>
      {error && <p className="form-error">{error}</p>}
      <div className="paper-actions">
        <Button type="submit">{t('paper.save')}</Button>
        <Button type="button" variant="secondary" onClick={onDone}>
          {t('paper.cancel')}
        </Button>
      </div>
    </form>
  );
}

function TradeForm({ t, instrumentId, currency, run, onDone }) {
  const [kind, setKind] = useState('buy');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState(null);

  async function submit(event) {
    event.preventDefault();
    setError(null);
    const unitPrice = toMinorUnits(price, currency);
    const units = Number.parseInt(quantity, 10);
    if (unitPrice === null || unitPrice <= 0 || !Number.isSafeInteger(units) || units <= 0) {
      setError(t('paper.errors.trade'));
      return;
    }
    const outcome = await run(
      () =>
        api.post('/fin/portefeuille/operations', {
          instrumentId,
          kind,
          quantity: units,
          unitPrice,
          decidedAt: new Date().toISOString(),
          ...(note.trim() ? { note: note.trim() } : {}),
        }),
      'paper.traded',
    );
    if (outcome.ok) onDone();
  }

  return (
    <form className="paper-form paper-form-inline" onSubmit={submit}>
      <div className="paper-form-grid">
        <label htmlFor={`trade-kind-${instrumentId}`}>
          {t('paper.fields.kind')}
          <select id={`trade-kind-${instrumentId}`} value={kind} onChange={(event) => setKind(event.target.value)}>
            <option value="buy">{t('paper.kinds.buy')}</option>
            <option value="sell">{t('paper.kinds.sell')}</option>
          </select>
        </label>
        <label htmlFor={`trade-qty-${instrumentId}`}>
          {t('paper.fields.quantity')}
          <input id={`trade-qty-${instrumentId}`} type="text" inputMode="numeric" value={quantity} onChange={(event) => setQuantity(event.target.value)} required />
        </label>
        <AmountField id={`trade-price-${instrumentId}`} label={t('paper.fields.unitPrice')} value={price} onChange={setPrice} currency={currency} required />
        <label htmlFor={`trade-note-${instrumentId}`}>
          {t('paper.fields.why')}
          <input id={`trade-note-${instrumentId}`} type="text" value={note} onChange={(event) => setNote(event.target.value)} maxLength={300} />
        </label>
      </div>
      {/* The reason is the point of a decision journal. */}
      <p className="paper-help">{t('paper.whyHelp')}</p>
      {error && <p className="form-error">{error}</p>}
      <div className="paper-actions">
        <Button type="submit">{t('paper.record')}</Button>
        <Button type="button" variant="secondary" onClick={onDone}>
          {t('paper.cancel')}
        </Button>
      </div>
    </form>
  );
}

// « Rééquilibrage »: shows the plan, applies nothing. Each line is a trade the
// person then makes themselves, which is also what keeps the journal honest.
function RebalanceButton({ t, language, positions }) {
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);

  async function propose() {
    setError(null);
    // An equal target across what is held: a starting point to read, not a rule
    // being applied. The client forbids an imposed split.
    const share = Math.floor((1 / positions.length) * 10000) / 10000;
    const targets = Object.fromEntries(positions.map((position, index) => [position.id, index === 0 ? 1 - share * (positions.length - 1) : share]));
    try {
      const res = await api.post('/fin/portefeuille/reequilibrage', { targets });
      setPlan(res.plan);
    } catch (err) {
      setError(t(errorKey(err, { 422: 'paper.errors.refused' })));
    }
  }

  return (
    <>
      <Button type="button" variant="secondary" onClick={propose}>
        <Scale size={16} aria-hidden="true" /> {t('paper.rebalance')}
      </Button>
      {error && <p className="form-error">{error}</p>}
      {plan && (
        <div className="paper-plan">
          <h3>{t('paper.rebalanceTitle')}</h3>
          <p className="paper-help">{t('paper.rebalanceHelp')}</p>
          <ul className="paper-list">
            {plan.map((row) => (
              <li key={row.id} className="paper-row">
                <span className="paper-row-label">{row.label}</span>
                <span className="paper-tag">{t(`paper.actions.${row.action}`)}</span>
                {row.action !== 'hold' && <span>{t('paper.units', { count: row.unites })}</span>}
                <span className="paper-row-price">{t('paper.target', { share: formatRatio(language, row.cible) })}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

// « Suis-je prêt à commencer ? » — four questions, and the workshop stays open
// whatever they say.
function ReadinessSection({ t, diagnostic }) {
  if (!diagnostic) return null;
  return (
    <section aria-labelledby="paper-readiness">
      <h2 id="paper-readiness">{t('paper.readinessTitle')}</h2>
      <p className="paper-help">{t('paper.readinessHelp')}</p>
      <ul className="paper-checks">
        {diagnostic.diagnostic.checks.map((check) => (
          <li key={check.key} className={`paper-check paper-check-${check.ok === null ? 'unknown' : check.ok ? 'yes' : 'no'}`}>
            <span>{t(`paper.checks.${check.key}`)}</span>
            <span className="paper-check-answer">{check.ok === null ? t('paper.cannotTell') : check.ok ? t('paper.yes') : t('paper.notYet')}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// The educational risk profile. The score is shown; the label is not invented.
function RiskSection({ t, references }) {
  const [answers, setAnswers] = useState({});
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const questions = references?.riskQuestions ?? [];
  if (questions.length === 0) return null;

  async function submit(event) {
    event.preventDefault();
    setError(null);
    try {
      const res = await api.post('/fin/portefeuille/profil-risque', answers);
      setProfile(res.profil);
    } catch (err) {
      setError(t(errorKey(err, { 422: 'paper.errors.refused' })));
    }
  }

  return (
    <section aria-labelledby="paper-risk">
      <h2 id="paper-risk">{t('paper.riskTitle')}</h2>
      <form className="paper-form" onSubmit={submit}>
        <div className="paper-form-grid">
          {questions.map((question) => (
            <label key={question.key} htmlFor={`risk-${question.key}`}>
              {t(`paper.risk.${question.key}`)}
              <select
                id={`risk-${question.key}`}
                value={answers[question.key] ?? ''}
                onChange={(event) => setAnswers({ ...answers, [question.key]: event.target.value })}
              >
                <option value="">{t('paper.choose')}</option>
                {question.options.map((option) => (
                  <option key={option.key} value={option.key}>
                    {t(`paper.riskOptions.${question.key}.${option.key}`)}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        {error && <p className="form-error">{error}</p>}
        <Button type="submit">{t('paper.computeRisk')}</Button>
      </form>
      {profile && (
        <div className="paper-risk-result">
          <FigureCard label={t('paper.riskScore')} answer={profile.score} simulation />
          {/* Why there is no word next to the number. */}
          {profile.seuilsManquants && <p className="paper-help">{t('paper.riskNoLabel')}</p>}
        </div>
      )}
    </section>
  );
}

function JournalSection({ t, language, decisions, currency }) {
  return (
    <section aria-labelledby="paper-journal">
      <h2 id="paper-journal">{t('paper.journalTitle')}</h2>
      {decisions.length === 0 ? (
        <p className="paper-empty">{t('paper.noDecision')}</p>
      ) : (
        <>
          <ul className="paper-list">
            {decisions.map((decision) => (
              <li key={decision.id} className="paper-row">
                <span className="paper-row-date">{formatDate(language, decision.decidedAt)}</span>
                <span className="paper-tag">{t(`paper.kinds.${decision.kind}`)}</span>
                <span className="paper-row-label">{decision.instrument}</span>
                <span>{t('paper.units', { count: decision.quantity })}</span>
                <span className="paper-row-amount">{formatAmount(language, decision.quantity * decision.unitPrice, currency)}</span>
                {decision.note && <span className="paper-row-note">{decision.note}</span>}
              </li>
            ))}
          </ul>
          <a className="paper-plain" href="/api/fin/portefeuille/decisions/export">
            <Download size={15} aria-hidden="true" /> {t('paper.export')}
          </a>
        </>
      )}
    </section>
  );
}
