import { useTranslation } from 'react-i18next';
import { Landmark } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import AdultOnly from '../../components/fincludia/AdultOnly.jsx';
import BackLink from '../../components/fincludia/BackLink.jsx';
import { adultRefusalReason, isAdultRefusal } from '../../lib/adultRefusal.js';
import LineChart from '../../components/fincludia/charts/LineChart.jsx';
import { PayoffPlan } from './DebtsPage.jsx';
import '../../components/fincludia/Fincludia.css';
import './Debts.css';

// DET-05 « Stratégies de remboursement », at its own address (P8-25):
// `/app/dettes/strategies`. The two orders of the client (the costliest debt
// first, the smallest first), side by side — compared, never recommended.
// What is still owed at the end of each month under one order of repayment.
// A long horizon is thinned to about sixty points (the last is always kept).
const MAX_POINTS = 60;
function balanceSeries(plan, label, tone, t) {
  const balances = plan?.resultat?.soldes ?? [];
  const step = Math.max(1, Math.ceil(balances.length / MAX_POINTS));
  const points = balances
    .map((value, index) => ({ month: `m${String(index + 1).padStart(4, '0')}`, label: t('debts.curveMonth', { month: index + 1 }), value, index }))
    .filter((point, index) => index % step === step - 1 || index === balances.length - 1)
    .map(({ index, ...point }) => point);
  return { key: label, label, tone, points };
}

export default function DebtStrategiesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const currency = user?.finCurrency ?? 'DZD';
  const comparison = useApi(`/fin/debts/comparaison?currency=${currency}`);
  useDocumentMeta(t('debts.compareStrategies'));

  if (comparison.status === 'loading' && !comparison.data) return <LoadingState />;
  if (isAdultRefusal(comparison.error)) return <AdultOnly reason={adultRefusalReason(comparison.error)} />;
  if (comparison.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={comparison.reload} />;

  return (
    <>
      <PageHeader icon={Landmark} title={t('debts.compareStrategies')} subtitle={t('debts.compareIntro')} maxWidth={1040} />
      <div className="debts-page">
        <BackLink to="/app/dettes">{t('debts.backToList')}</BackLink>
        {comparison.data.avalanche ? (
          <>
          <LineChart
            currency={currency}
            caption={t('debts.curveTitle')}
            xLabel={t('debts.curveMonthHead')}
            series={[balanceSeries(comparison.data.avalanche, t('debts.avalanche'), 0, t), balanceSeries(comparison.data.bouleDeNeige, t('debts.snowball'), 2, t)]}
          />
          <div className="debts-comparison-cols">
            <PayoffPlan title={t('debts.avalanche')} plan={comparison.data.avalanche} currency={currency} />
            <PayoffPlan title={t('debts.snowball')} plan={comparison.data.bouleDeNeige} currency={currency} />
          </div>
          </>
        ) : (
          <Notice variant="action-needed">
            {comparison.data.avertissements.map((warning, index) => (
              <p key={index}>{warning}</p>
            ))}
          </Notice>
        )}
      </div>
    </>
  );
}
