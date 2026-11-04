import { useTranslation } from 'react-i18next';
import LineChart from './charts/LineChart.jsx';

// The net-worth curve (P6-23), built from `/fin/patrimoine/historique` — the
// server's own reconstruction of the change journal, never a second source of
// the figure. Drawn by the chart kit: axes, legend, a sentence, and the exact
// points in a table underneath. Fewer than two dates is a message, not a dot.
export default function NetWorthChart({ points, currency }) {
  const { t } = useTranslation();
  return <LineChart currency={currency} caption={t('wealth.historyTitle')} series={[{ key: 'net', label: t('wealth.netWorth', { defaultValue: t('wealth.historyTitle') }), tone: 0, points: points.map((point) => ({ month: point.date.slice(0, 10), value: point.net })) }]} />;
}
