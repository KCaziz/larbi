import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, Landmark, Trash2 } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatAmount, formatDate } from '../../lib/format.js';
import { fromMinorUnits, toMinorUnits } from '../../lib/money.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import AdultOnly from '../../components/fincludia/AdultOnly.jsx';
import AmountField from '../../components/fincludia/AmountField.jsx';
import BackLink from '../../components/fincludia/BackLink.jsx';
import { adultRefusalReason, isAdultRefusal } from '../../lib/adultRefusal.js';
import '../../components/fincludia/Fincludia.css';
import './Wealth.css';

// PAT-02 « Détail actif réel », at its own address (P8-25):
// `/app/patrimoine/:id`. One real asset: its value and the date it was
// established, how quickly it can be turned into money, its valuations over
// time (read from the correction journal, the only record of them) and a new
// valuation — always with its date, so that an old figure never looks fresh.
export default function AssetDetailPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const assets = useApi('/fin/actifs?includeArchived=true');
  const valuations = useApi(`/fin/actifs/${id}/valeurs`);
  const [message, setMessage] = useState(null);
  const asset = assets.data?.assets.find((row) => row.id === id);
  useDocumentMeta(asset?.label ?? t('wealth.title'));

  if (assets.status === 'loading' && !assets.data) return <LoadingState />;
  if (isAdultRefusal(assets.error)) return <AdultOnly reason={adultRefusalReason(assets.error)} />;
  if (assets.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={assets.reload} />;
  if (!asset) return <ErrorState message={t('wealth.notFound')} />;

  async function run(action, okKey, { leave = false } = {}) {
    setMessage(null);
    try {
      await action();
      if (leave) {
        navigate('/app/patrimoine', { state: { message: okKey } });
        return { ok: true };
      }
      setMessage({ kind: 'ok', text: t(okKey) });
      assets.reload();
      valuations.reload();
      return { ok: true };
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 422: 'wealth.errors.refused' })) });
      return { ok: false };
    }
  }

  const values = (valuations.data?.valuations ?? []).filter((change) => change.field === 'value');

  return (
    <>
      <PageHeader icon={Landmark} title={asset.label} subtitle={t(`wealth.kinds.${asset.kind}`, asset.kind)} maxWidth={1040} />
      <div className="wealth-page">
        <BackLink to="/app/patrimoine">{t('wealth.backToList')}</BackLink>
        {message && (
          <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
            {message.text}
          </p>
        )}

        <dl className="wealth-detail">
          <div>
            <dt>{t('wealth.fields.value')}</dt>
            <dd>{formatAmount(i18n.language, asset.value, asset.currency)}</dd>
          </div>
          <div>
            <dt>{t('wealth.fields.valuedAt')}</dt>
            <dd>{formatDate(i18n.language, asset.valuedAt)}</dd>
          </div>
          <div>
            <dt>{t('wealth.fields.liquidity')}</dt>
            <dd>{t(`wealth.liquidity.${asset.liquidity}`)}</dd>
          </div>
          {asset.holder && (
            <div>
              <dt>{t('wealth.fields.holder')}</dt>
              <dd>{asset.holder}</dd>
            </div>
          )}
        </dl>
        {asset.note && <p className="fin-hint">{asset.note}</p>}

        <h2>{t('wealth.valuationsTitle')}</h2>
        {values.length === 0 ? (
          <p className="fin-hint">{t('wealth.noValuation')}</p>
        ) : (
          <ul className="wealth-valuations">
            {values.map((change) => (
              <li key={change.createdAt}>
                <span>{formatDate(i18n.language, change.createdAt)}</span>
                <span>
                  {formatAmount(i18n.language, Number(change.before), asset.currency)} → <strong>{formatAmount(i18n.language, Number(change.after), asset.currency)}</strong>
                </span>
                {change.reason && <span className="fin-hint">{change.reason}</span>}
              </li>
            ))}
          </ul>
        )}

        <Revalue asset={asset} run={run} />

        <div className="wealth-detail-actions">
          <button type="button" className="wealth-icon" onClick={() => run(() => api.delete(`/fin/actifs/${asset.id}`), 'wealth.deleted', { leave: true })} aria-label={t('wealth.delete', { label: asset.label })}>
            <Trash2 size={15} aria-hidden="true" /> {t('wealth.deleteShort')}
          </button>
        </div>
      </div>
    </>
  );
}

// A new valuation: the amount AND the date it was established (the server
// refuses one without the other), and why, optionally.
function Revalue({ asset, run }) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState(fromMinorUnits(asset.value, asset.currency));
  const [valuedAt, setValuedAt] = useState(new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState('');
  const [error, setError] = useState(null);

  const submit = (event) => {
    event.preventDefault();
    const value = toMinorUnits(amount, asset.currency);
    if (value === null) {
      setError(t('wealth.errors.amount'));
      return;
    }
    setError(null);
    run(() => api.patch(`/fin/actifs/${asset.id}`, { value, valuedAt: new Date(valuedAt).toISOString(), ...(reason.trim() ? { reason: reason.trim() } : {}) }), 'wealth.revalued');
  };

  return (
    <form className="wealth-form" onSubmit={submit}>
      <h2>{t('wealth.revalueTitle')}</h2>
      <AmountField id="asset-new-value" label={t('wealth.fields.value')} value={amount} currency={asset.currency} onChange={setAmount} required />
      <div className="fin-field">
        <label htmlFor="asset-new-date">{t('wealth.fields.valuedAt')}</label>
        <input id="asset-new-date" type="date" value={valuedAt} max={new Date().toISOString().slice(0, 10)} required onChange={(event) => setValuedAt(event.target.value)} />
        <p className="fin-hint">
          <AlertTriangle size={13} aria-hidden="true" /> {t('wealth.valuedAtHelp')}
        </p>
      </div>
      <div className="fin-field">
        <label htmlFor="asset-reason">{t('wealth.fields.reason')}</label>
        <input id="asset-reason" value={reason} maxLength={200} onChange={(event) => setReason(event.target.value)} />
      </div>
      {error && <p className="form-error">{error}</p>}
      <Button type="submit">{t('wealth.save')}</Button>
    </form>
  );
}
