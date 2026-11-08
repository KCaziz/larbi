import { useTranslation } from 'react-i18next';
import { useApi } from '../../lib/useApi.js';
import { formatAmount, formatRatio } from '../../lib/format.js';

// P10-03 — the part due to compound interest, under a position bought on the
// pedagogical market when its support pays interest (savings, bonds). The
// figures come from the engine (F029, monthly capitalisation at the support's
// written yearly rate): since the purchase, then 1, 5, 10 and 20 years ahead,
// with simple interest beside it so the « intérêts sur intérêts » show.
export const COMPOUND_CLASSES = ['savings', 'bonds'];

const monthsSince = (date, now = new Date()) => {
  if (!date) return 0;
  const start = new Date(date);
  return Math.max(0, (now.getUTCFullYear() - start.getUTCFullYear()) * 12 + (now.getUTCMonth() - start.getUTCMonth()));
};

export default function CompoundInterest({ support, amount, since, currency }) {
  const { t, i18n } = useTranslation();
  const months = monthsSince(since);
  const data = useApi(amount > 0 ? `/fin/portefeuille/marche/${support.key}/interets?montant=${Math.round(amount)}&mois=${months}` : null);
  const result = data.data?.interets;
  if (!result) return null;
  const money = (value) => formatAmount(i18n.language, value, currency);

  return (
    <details className="paper-compound">
      <summary>{t('paper.compound.title', { rate: formatRatio(i18n.language, result.yearlyReturn) })}</summary>
      <p>
        {result.months === 0 ? t('paper.compound.boughtThisMonth') : t('paper.compound.sinceBuy', {
          count: result.months,
          interest: money(result.interest),
          simple: money(result.simpleInterest),
          onInterest: money(result.onInterest),
        })}
      </p>
      <div className="paper-compound-scroll">
        <table className="paper-compound-table">
          <caption>{t('paper.compound.caption', { amount: money(result.amount) })}</caption>
          <thead>
            <tr>
              <th scope="col">{t('paper.compound.horizon')}</th>
              <th scope="col">{t('paper.compound.value')}</th>
              <th scope="col">{t('paper.compound.simple')}</th>
              <th scope="col">{t('paper.compound.compound')}</th>
              <th scope="col">{t('paper.compound.onInterest')}</th>
            </tr>
          </thead>
          <tbody>
            {result.projection.map((row) => (
              <tr key={row.years}>
                <th scope="row">{t('paper.compound.years', { count: row.years })}</th>
                <td>{money(row.value)}</td>
                <td>{money(row.simpleInterest)}</td>
                <td>{money(row.interest)}</td>
                <td>{money(row.onInterest)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="fin-hint">{t('paper.compound.how')}</p>
    </details>
  );
}
