import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Landmark, Plus, Trash2 } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { formatAmount, formatDate, formatRatio } from '../../lib/format.js';
import { toMinorUnits } from '../../lib/money.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import AdultOnly from '../../components/fincludia/AdultOnly.jsx';
import { adultRefusalReason, isAdultRefusal } from '../../lib/adultRefusal.js';
import LoadingState from '../../components/ui/LoadingState.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import AmountField from '../../components/fincludia/AmountField.jsx';
import NetWorthChart from '../../components/fincludia/NetWorthChart.jsx';
import '../../components/fincludia/Fincludia.css';
import './Wealth.css';

// Real patrimony (P6-11), screens C16 and JA07.
//
// Two things this page says out loud, because both are the client's own rules:
// the fictional is forbidden here (so there is no SIMULATION badge anywhere on
// it), and a valuation older than 90 days is reported rather than quietly
// trusted.
export default function WealthPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const currency = user?.finCurrency ?? 'DZD';
  const [message, setMessage] = useState(null);
  const [adding, setAdding] = useState(false);
  const assetsRef = useRef(null);
  useDocumentMeta(t('wealth.title'), t('wealth.intro'));

  const wealth = useApi('/fin/patrimoine');
  const references = useApi('/fin/patrimoine/references');
  const history = useApi('/fin/patrimoine/historique');

  async function run(action, okKey) {
    setMessage(null);
    try {
      await action();
      setMessage({ kind: 'ok', text: t(okKey) });
      wealth.reload();
      return { ok: true };
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 422: 'wealth.errors.refused' })) });
      return { ok: false };
    }
  }

  if (wealth.status === 'loading' && !wealth.data) return <LoadingState />;
  // A refusal reserved to 18+ is not a failed load: retrying cannot help,
  // and the person needs to know whether there is anything to fix.
  if (isAdultRefusal(wealth.error)) return <AdultOnly reason={adultRefusalReason(wealth.error)} />;
  if (wealth.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={wealth.reload} />;

  const view = wealth.data.patrimoine;
  const formulas = new Map((wealth.data.formulas ?? []).map((row) => [row.id, row]));

  return (
    <>
      <PageHeader icon={Landmark} title={t('wealth.title')} subtitle={t('wealth.intro')} maxWidth={1040} />
      <div className="wealth-page">
        {message && (
          <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
            {message.text}
          </p>
        )}

        {/* The client's sentence, stated rather than implied. */}
        <p className="wealth-rule">{t('wealth.noFictional')}</p>

        <section aria-labelledby="wealth-figures">
          <h2 id="wealth-figures">{t('wealth.figuresTitle')}</h2>
          <div className="fin-cards">
            <FigureCard label={t('wealth.netWorth')} answer={view.patrimoineNet} formula={formulas.get('F035')} />
            <FigureCard label={t('wealth.concentration')} answer={view.concentrationMax} formula={formulas.get('F037')} />
          </div>
          <dl className="wealth-totals">
            <dt>{t('wealth.totalAssets')}</dt>
            <dd>{view.totalActifs === null ? <span className="fin-not-computed">{t('fincludia.notComputed')}</span> : formatAmount(i18n.language, view.totalActifs, view.currency)}</dd>
            <dt>{t('wealth.totalDebts')}</dt>
            <dd>{view.totalDettes === null ? <span className="fin-not-computed">{t('wealth.noDebt')}</span> : formatAmount(i18n.language, view.totalDettes, view.currency)}</dd>
            <dt>{t('wealth.quicklyAvailable')}</dt>
            <dd>
              {view.disponibleRapidement === null ? (
                <span className="fin-not-computed">{t('fincludia.notComputed')}</span>
              ) : (
                formatAmount(i18n.language, view.disponibleRapidement, view.currency)
              )}
            </dd>
          </dl>
          {/* The debts come from P6-10: the figure is not computed twice. */}
          <p className="wealth-help">{t('wealth.debtsFromDebtsPage')}</p>

          {/* « Message éducatif, pas une alarme » — the same restraint the paper
              portfolio asks for. */}
          {view.concentrationSignalee && (
            <p className="wealth-notice">
              {t('wealth.concentrationNotice', { share: formatRatio(i18n.language, view.seuilConcentration) })}
            </p>
          )}

          {view.avertissements.length > 0 && (
            <ul className="wealth-warnings">
              {view.avertissements.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          )}
        </section>

        {history.data?.points?.length >= 2 && (
          <section aria-labelledby="wealth-history">
            <h2 id="wealth-history">{t('wealth.historyTitle')}</h2>
            <NetWorthChart points={history.data.points} currency={view.currency} />
          </section>
        )}

        {view.parType.length > 0 && (
          <section aria-labelledby="wealth-allocation">
            <h2 id="wealth-allocation">{t('wealth.allocationTitle')}</h2>
            <ul className="wealth-breakdown">
              {view.parType.map((row) => (
                <li key={row.kind}>
                  <span>{t(`wealth.kinds.${row.kind}`, row.kind)}</span>
                  <strong>{formatAmount(i18n.language, row.total, view.currency)}</strong>
                  <span className="wealth-share">{row.allocation.resultat === null ? '—' : formatRatio(i18n.language, row.allocation.resultat)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="wealth-assets" ref={assetsRef}>
          <h2 id="wealth-assets">{t('wealth.assetsTitle')}</h2>
          {view.actifs.length === 0 ? (
            <p className="wealth-empty">{t('wealth.noAsset')}</p>
          ) : (
            <ul className="wealth-list">
              {view.actifs.map((row) => (
                <li key={row.id} className={row.valeurAncienne ? 'wealth-row wealth-row-stale' : 'wealth-row'}>
                  <span className="wealth-row-label">{row.label}</span>
                  <span className="wealth-row-meta">
                    <span className="wealth-tag">{t(`wealth.kinds.${row.kind}`, row.kind)}</span>
                    <span className="wealth-tag">{t(`wealth.liquidity.${row.liquidity}`)}</span>
                    <span className="wealth-row-amount">{formatAmount(i18n.language, row.value, row.currency)}</span>
                    <span className="wealth-row-date">
                      {formatDate(i18n.language, row.valuedAt)}
                      {row.valeurAncienne && (
                        <span className="wealth-stale-flag">
                          <AlertTriangle size={13} aria-hidden="true" /> {t('wealth.staleValue', { days: row.ageJours })}
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      className="wealth-icon"
                      onClick={() => run(() => api.delete(`/fin/actifs/${row.id}`), 'wealth.deleted')}
                      aria-label={t('wealth.delete', { label: row.label })}
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}

          <Button type="button" variant="secondary" onClick={() => setAdding((value) => !value)}>
            <Plus size={16} aria-hidden="true" /> {t('wealth.addAsset')}
          </Button>
          {adding && (
            <AssetForm
              t={t}
              currency={currency}
              references={references.data}
              run={run}
              onDone={() => {
                setAdding(false);
                // The confirmation and the updated list are both ABOVE the form:
                // without this, adding from the bottom of a long page leaves the
                // person exactly where they were, having seen neither.
                assetsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            />
          )}
        </section>
      </div>
    </>
  );
}

function AssetForm({ t, currency, references, run, onDone }) {
  const [label, setLabel] = useState('');
  const [kind, setKind] = useState('account');
  const [amount, setAmount] = useState('');
  const [valuedAt, setValuedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [liquidity, setLiquidity] = useState('');
  const [holder, setHolder] = useState('');
  const [error, setError] = useState(null);

  async function submit(event) {
    event.preventDefault();
    setError(null);
    const value = toMinorUnits(amount, currency);
    if (value === null || value <= 0) {
      setError(t('wealth.errors.amount'));
      return;
    }
    const outcome = await run(
      () =>
        api.post('/fin/actifs', {
          label: label.trim(),
          kind,
          value,
          currency,
          valuedAt: new Date(valuedAt).toISOString(),
          // Left out when the person did not choose: the server then applies
          // the default for the kind, and the answer says which.
          ...(liquidity ? { liquidity } : {}),
          ...(holder.trim() ? { holder: holder.trim() } : {}),
        }),
      'wealth.added',
    );
    if (outcome.ok) onDone();
  }

  return (
    <form className="wealth-form" onSubmit={submit}>
      <div className="wealth-form-grid">
        <label htmlFor="asset-label">
          {t('wealth.fields.label')}
          <input id="asset-label" type="text" value={label} onChange={(event) => setLabel(event.target.value)} required maxLength={80} />
        </label>
        <label htmlFor="asset-kind">
          {t('wealth.fields.kind')}
          <select id="asset-kind" value={kind} onChange={(event) => setKind(event.target.value)}>
            {(references?.kinds ?? ['account']).map((option) => (
              <option key={option} value={option}>
                {t(`wealth.kinds.${option}`, option)}
              </option>
            ))}
          </select>
        </label>
        <AmountField id="asset-amount" label={t('wealth.fields.value')} value={amount} onChange={setAmount} currency={currency} required />
        <label htmlFor="asset-date">
          {t('wealth.fields.valuedAt')}
          <input id="asset-date" type="date" value={valuedAt} onChange={(event) => setValuedAt(event.target.value)} required />
        </label>
        <label htmlFor="asset-liquidity">
          {t('wealth.fields.liquidity')}
          <select id="asset-liquidity" value={liquidity} onChange={(event) => setLiquidity(event.target.value)}>
            <option value="">{t('wealth.defaultForKind')}</option>
            {(references?.liquidity ?? []).map((option) => (
              <option key={option} value={option}>
                {t(`wealth.liquidity.${option}`)}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="asset-holder">
          {t('wealth.fields.holder')}
          <input id="asset-holder" type="text" value={holder} onChange={(event) => setHolder(event.target.value)} maxLength={80} />
        </label>
      </div>
      {/* Why the date is required, said where it is asked. */}
      <p className="wealth-help">{t('wealth.valuedAtHelp')}</p>
      {error && <p className="form-error">{error}</p>}
      <div className="wealth-actions">
        <Button type="submit">{t('wealth.save')}</Button>
        <Button type="button" variant="secondary" onClick={onDone}>
          {t('wealth.cancel')}
        </Button>
      </div>
    </form>
  );
}
