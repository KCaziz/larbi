import { useTranslation } from 'react-i18next';
import LineChart from './charts/LineChart.jsx';

// Revenus against dépenses, step by step (P6-23, G-03, G-05), from
// `/fin/argent/synthese/historique` — the same figures "Mon argent" already
// shows, never a second source. Two lines on ONE axis, never a mixed total: the
// chart kit draws them with its axes, its legend, its table and its sentence.
export default function IncomeExpenseChart({ points, currency }) {
  const { t } = useTranslation();
  return (
    <LineChart
      currency={currency}
      caption={t('myMoney.monthlyTrendTitle')}
      series={[
        { key: 'income', label: t('myMoney.income'), tone: 1, points: points.map((point) => ({ month: point.month, value: point.revenus ?? null })) },
        { key: 'expense', label: t('myMoney.expenses'), tone: 2, points: points.map((point) => ({ month: point.month, value: point.depenses ?? null })) },
      ]}
    />
  );
}
