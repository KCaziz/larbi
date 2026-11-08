import { useTranslation } from 'react-i18next';
import { formatAmount } from '../../lib/format.js';

// Recette R9-12: « combien de mois pour atteindre cet objectif », year by year,
// with what is set aside each month. A plain projection of the goal's own
// figures: the capital already set aside, the monthly saving and — when the
// goal has one — its yearly rate, compounded each month. Nothing is guessed:
// without a monthly saving there is nothing to project.
export function yearByYear({ capital = 0, monthly = 0, rate = 0, target, start = new Date(), maxYears = 40 }) {
  if (!(target > 0) || (!(monthly > 0) && !(rate > 0 && capital > 0))) return [];
  const monthlyRate = rate > 0 ? rate / 12 : 0;
  const rows = [];
  let amount = capital;
  for (let year = 1; year <= maxYears; year += 1) {
    const before = amount;
    let interest = 0;
    let reachedMonth = null;
    for (let month = 1; month <= 12; month += 1) {
      const gain = amount * monthlyRate;
      interest += gain;
      amount += gain + monthly;
      if (reachedMonth === null && amount >= target) reachedMonth = (year - 1) * 12 + month;
    }
    const end = new Date(Date.UTC(start.getUTCFullYear() + year, start.getUTCMonth(), 1));
    rows.push({
      year,
      end,
      saved: Math.round(monthly * 12),
      interest: Math.round(interest),
      capital: Math.round(amount),
      share: Math.min(1, amount / target),
      startCapital: Math.round(before),
      reachedMonth,
    });
    if (reachedMonth !== null) break;
  }
  return rows;
}

export default function GoalYears({ rows, currency, target }) {
  const { t, i18n } = useTranslation();
  if (rows.length === 0) return <p className="fin-hint">{t('goals.years.none')}</p>;
  const money = (value) => formatAmount(i18n.language, value, currency);
  const month = (date) => new Intl.DateTimeFormat(i18n.language === 'tzm' ? 'fr' : i18n.language, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
  const reached = rows.find((row) => row.reachedMonth !== null);
  const withInterest = rows.some((row) => row.interest > 0);
  return (
    <div className="goals-years">
      <p className="goals-years-lead">
        {reached
          ? t(reached.reachedMonth < 12 ? 'goals.years.reached' : reached.reachedMonth % 12 === 0 ? 'goals.years.reachedWholeYears' : 'goals.years.reachedYearsMonths', { count: reached.reachedMonth, years: Math.floor(reached.reachedMonth / 12), months: reached.reachedMonth % 12 })
          : t('goals.years.notReached', { years: rows.length, capital: money(rows[rows.length - 1].capital), target: money(target) })}
      </p>
      <div className="goals-years-scroll">
        <table className="goals-years-table">
          <caption className="sr-only">{t('goals.years.caption')}</caption>
          <thead>
            <tr>
              <th scope="col">{t('goals.years.year')}</th>
              <th scope="col">{t('goals.years.saved')}</th>
              {withInterest && <th scope="col">{t('goals.years.interest')}</th>}
              <th scope="col">{t('goals.years.capital')}</th>
              <th scope="col">{t('goals.years.share')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.year} className={row.reachedMonth !== null ? 'goals-years-reached' : undefined}>
                <th scope="row">{t('goals.years.yearLabel', { year: row.year, date: month(row.end) })}</th>
                <td>{money(row.saved)}</td>
                {withInterest && <td>{money(row.interest)}</td>}
                <td>{money(row.capital)}</td>
                <td>{Math.round(row.share * 100)} %</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
