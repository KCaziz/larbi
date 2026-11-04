import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Circle, ShieldCheck } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { formatAmount } from '../../lib/format.js';
import { toMinorUnits } from '../../lib/money.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import AmountField from '../../components/fincludia/AmountField.jsx';
import Gauge from '../../components/fincludia/charts/Gauge.jsx';
import '../../components/fincludia/Fincludia.css';
import './Reserve.css';

// Safety reserve (P6-09), screen C12. Rebuilt as three steps (recette R6-01):
// the page said « non calculé » without saying what was missing nor where to
// give it. Each step says whether it is done and, when it is not, offers the
// way to do it on the spot — the essential monthly expenses, the target in
// months, then the emergency-fund goal sized from both. The figures come once the three are there.
export default function ReservePage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [message, setMessage] = useState(null);
  const [essential, setEssential] = useState('');
  const [target, setTarget] = useState('');
  const [busy, setBusy] = useState(false);
  useDocumentMeta(t('reserve.title'), t('reserve.intro'));

  const currency = user?.finCurrency ?? 'DZD';
  const reserve = useApi(`/fin/reserve?currency=${currency}`);
  const references = useApi('/fin/reserve/references');
  const formulas = useMemo(() => new Map((references.data?.formulas ?? []).map((formula) => [formula.id, formula])), [references.data]);

  async function act(action, okKey) {
    setMessage(null);
    setBusy(true);
    try {
      await action();
      setMessage({ kind: 'ok', text: t(okKey) });
      reserve.reload();
      return true;
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 400: 'reserve.errors.refused', 422: 'reserve.errors.refused' })) });
      return false;
    } finally {
      setBusy(false);
    }
  }

  if (reserve.status === 'loading' && !reserve.data) return <LoadingState />;
  if (reserve.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={reserve.reload} />;

  const r = reserve.data;
  const hasFund = r.epargneLiquide !== null;
  const hasEssential = r.depensesEssentielles !== null;
  const hasTarget = r.cibleMois !== null && r.cibleMois !== undefined;
  const ready = hasFund && hasEssential && hasTarget;
  const money = (value) => formatAmount(i18n.language, value, currency);

  const createFund = () =>
    act(
      () =>
        api.post('/fin/goals', {
          label: t('reserve.fundName'),
          templateKey: 'emergency',
          target: r.cibleMontant.resultat,
          currency,
          targetDate: null,
        }),
      'reserve.fundCreated',
    );

  const saveEssential = (event) => {
    event.preventDefault();
    const amount = toMinorUnits(essential, currency);
    if (amount === null) return;
    act(() => api.put('/fin/onboarding', { answers: { essentialExpenses: { amount, frequency: 'mensuel' } }, currency }), 'reserve.essentialSaved').then((ok) => ok && setEssential(''));
  };

  const saveTarget = (event) => {
    event.preventDefault();
    act(() => api.put(`/fin/reserve/cible?currency=${currency}`, { targetMonths: target === '' ? null : Number(target) }), 'reserve.targetSaved').then((ok) => ok && setTarget(''));
  };

  return (
    <>
      <PageHeader icon={ShieldCheck} title={t('reserve.title')} subtitle={t('reserve.intro')} />
      <div className="reserve-page">
        <Notice variant="info">{t('reserve.what')}</Notice>

        {message && (
          <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
            {message.text}
          </p>
        )}

        {ready ? (
          <>
            <div className="fin-figure-grid">
              <FigureCard label={t('reserve.months')} answer={r.moisReserve} formula={formulas.get('F014')} />
              <FigureCard label={t('reserve.targetAmount')} answer={r.cibleMontant} formula={formulas.get('F015')} />
              <FigureCard label={t('reserve.gap')} answer={r.manque} formula={formulas.get('F016')} />
            </div>
            {/* G-08: the months covered against the target, in colour and in words. */}
            <Gauge value={r.moisReserve?.resultat ?? null} target={r.cibleMois ?? null} unitLabel={t('reserve.monthsUnit')} caption={t('reserve.gaugeCaption')} />
          </>
        ) : (
          <p className="reserve-missing">{t('reserve.missingIntro')}</p>
        )}

        <ol className="reserve-steps">
          <ReserveStep done={hasEssential} title={t('reserve.steps.essential.title')}>
            {hasEssential && <p>{t(r.sourceDepensesEssentielles === 'declared' ? 'reserve.steps.essential.doneDeclared' : 'reserve.steps.essential.done', { amount: money(r.depensesEssentielles) })}</p>}
            <p className="fin-hint">{t(r.sourceDepensesEssentielles === 'history' ? 'reserve.steps.essential.fromHistory' : 'reserve.steps.essential.how')}</p>
            {/* An estimate only counts while the history is shorter than a
                month: offered then, not when it would change nothing. */}
            {r.sourceDepensesEssentielles !== 'history' && (
            <form className="reserve-inline-form" onSubmit={saveEssential}>
              <AmountField id="reserve-essential" label={t(hasEssential ? 'reserve.steps.essential.change' : 'reserve.steps.essential.declare')} value={essential} currency={currency} onChange={setEssential} required />
              <Button type="submit" variant="secondary" disabled={busy}>
                {t('reserve.save')}
              </Button>
            </form>
            )}
          </ReserveStep>

          <ReserveStep done={hasTarget} title={t('reserve.steps.target.title')}>
            {hasTarget && <p>{t(r.cibleParDefaut ? 'reserve.steps.target.default' : 'reserve.steps.target.done', { months: r.cibleMois })}</p>}
            <form className="reserve-inline-form" onSubmit={saveTarget}>
              <div className="fin-field">
                <label htmlFor="reserve-target">{t('reserve.chooseTarget')}</label>
                <input id="reserve-target" type="number" min="0" max="60" placeholder={r.cibleMois ?? ''} value={target} onChange={(event) => setTarget(event.target.value)} required />
              </div>
              <Button type="submit" variant="secondary" disabled={busy}>
                {t('reserve.save')}
              </Button>
            </form>
            <p className="fin-hint">{t('reserve.chooseTargetHint')}</p>
          </ReserveStep>
          <ReserveStep done={hasFund} title={t('reserve.steps.fund.title')}>
            {hasFund ? (
              <p>
                {t('reserve.steps.fund.done', { amount: money(r.epargneLiquide) })} <Link to="/app/objectifs">{t('reserve.steps.fund.manage')}</Link>
              </p>
            ) : (
              <>
                <p>{t(r.cibleMontant?.resultat > 0 ? 'reserve.steps.fund.todo' : 'reserve.steps.fund.after', { amount: r.cibleMontant?.resultat > 0 ? money(r.cibleMontant.resultat) : '' })}</p>
                <Button type="button" onClick={createFund} disabled={busy || !(r.cibleMontant?.resultat > 0)}>
                  {t('reserve.steps.fund.create')}
                </Button>
              </>
            )}
          </ReserveStep>

        </ol>
      </div>
    </>
  );
}

function ReserveStep({ done, title, children }) {
  const { t } = useTranslation();
  return (
    <li className={`reserve-step${done ? ' reserve-step-done' : ''}`}>
      <h2>
        {done ? <CheckCircle2 size={20} aria-hidden="true" /> : <Circle size={20} aria-hidden="true" />}
        {title}
        <span className="sr-only"> — {t(done ? 'reserve.stepDone' : 'reserve.stepTodo')}</span>
      </h2>
      {children}
    </li>
  );
}
