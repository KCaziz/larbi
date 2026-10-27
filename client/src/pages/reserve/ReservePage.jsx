import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { formatAmount } from '../../lib/format.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import '../../components/fincludia/Fincludia.css';
import './Reserve.css';

// Safety reserve (P6-09), screen C12: F014-F016. "Portefeuille fictif et
// actifs illiquides exclus par défaut" — today that simply means this page
// only ever counts real money moved into savings; P6-11/P6-12 (patrimony,
// paper portfolio) are not built yet, so there is nothing illiquid to exclude.
export default function ReservePage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [message, setMessage] = useState(null);
  useDocumentMeta(t('reserve.title'), t('reserve.intro'));

  const currency = user?.finCurrency ?? 'DZD';
  const reserve = useApi(`/fin/reserve?currency=${currency}`);
  const references = useApi('/fin/reserve/references');
  const formulas = useMemo(() => new Map((references.data?.formulas ?? []).map((formula) => [formula.id, formula])), [references.data]);

  const [target, setTarget] = useState('');

  async function saveTarget(event) {
    event.preventDefault();
    setMessage(null);
    try {
      await api.put(`/fin/reserve/cible?currency=${currency}`, { targetMonths: target === '' ? null : Number(target) });
      setMessage({ kind: 'ok', text: t('reserve.targetSaved') });
      reserve.reload();
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 400: 'reserve.errors.refused' })) });
    }
  }

  if (reserve.status === 'loading' && !reserve.data) return <LoadingState />;
  if (reserve.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={reserve.reload} />;

  const r = reserve.data;

  return (
    <>
      <PageHeader icon={ShieldCheck} title={t('reserve.title')} subtitle={t('reserve.intro')} maxWidth={760} />
      <div className="reserve-page">
        {message && (
          <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
            {message.text}
          </p>
        )}

        <div className="fin-figure-grid">
          <FigureCard label={t('reserve.months')} answer={r.moisReserve} formula={formulas.get('F014')} />
          <FigureCard label={t('reserve.targetAmount')} answer={r.cibleMontant} formula={formulas.get('F015')} />
          <FigureCard label={t('reserve.gap')} answer={r.manque} formula={formulas.get('F016')} />
        </div>

        <dl className="reserve-composition">
          <dt>{t('reserve.liquidSavings')}</dt>
          <dd>{r.epargneLiquide === null ? t('fincludia.notComputed') : formatAmount(i18n.language, r.epargneLiquide, currency)}</dd>
          <dt>{t('reserve.essentialExpenses')}</dt>
          <dd>{r.depensesEssentielles === null ? t('fincludia.notComputed') : formatAmount(i18n.language, r.depensesEssentielles, currency)}</dd>
        </dl>

        {r.avertissements.map((warning, index) => (
          <p key={index} className="fin-hint">
            {warning}
          </p>
        ))}

        <form className="reserve-target-form" onSubmit={saveTarget}>
          <div className="fin-field">
            <label htmlFor="reserve-target">{t('reserve.chooseTarget')}</label>
            <input
              id="reserve-target"
              type="number"
              min="0"
              max="60"
              placeholder={r.cibleMois ?? ''}
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
            <p className="fin-hint">{t('reserve.chooseTargetHint')}</p>
          </div>
          <Button type="submit">{t('reserve.save')}</Button>
        </form>
      </div>
    </>
  );
}
