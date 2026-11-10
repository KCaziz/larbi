import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api.js';
import { formatAmount } from '../../lib/format.js';
import { toMinorUnits } from '../../lib/money.js';
import Button from '../../components/ui/Button.jsx';
import AmountField from '../../components/fincludia/AmountField.jsx';
import { yearByYear } from './GoalYears.jsx';

// P11-03 — two quick simulators on a goal, nothing saved until asked:
//  - « how much a month to reach it by this date? »
//  - « at this much a month, how long? »
// From the capital already set aside and, when the goal has one, its yearly
// rate (interest added each month). « Garder » saves the monthly amount (and
// the date) on the goal.

const monthsUntil = (date, now = new Date()) => {
  const end = new Date(`${date}T00:00:00Z`);
  return Math.max(1, (end.getUTCFullYear() - now.getUTCFullYear()) * 12 + (end.getUTCMonth() - now.getUTCMonth()));
};

// The monthly amount that reaches `target` in `months`, interest included.
export function monthlyNeeded({ capital = 0, target, months, rate = 0 }) {
  const r = rate > 0 ? rate / 12 : 0;
  const grown = r > 0 ? capital * (1 + r) ** months : capital;
  const missing = Math.max(0, target - grown);
  if (missing === 0) return 0;
  return Math.ceil(r > 0 ? (missing * r) / ((1 + r) ** months - 1) : missing / months);
}

export default function GoalPlanner({ goal, run }) {
  const { t, i18n } = useTranslation();
  const money = (value) => formatAmount(i18n.language, value, goal.currency);
  const capital = goal.allocated ?? 0;
  const rate = goal.rate ?? 0;
  const inAYear = new Date(Date.UTC(new Date().getUTCFullYear() + 1, new Date().getUTCMonth(), 1)).toISOString().slice(0, 10);
  const [date, setDate] = useState(goal.targetDate ? new Date(goal.targetDate).toISOString().slice(0, 10) : inAYear);
  const [monthly, setMonthly] = useState('');

  const months = monthsUntil(date);
  const needed = monthlyNeeded({ capital, target: goal.target, months, rate });
  const amount = monthly ? toMinorUnits(monthly, goal.currency) : null;
  const rows = amount ? yearByYear({ capital, monthly: amount, rate, target: goal.target }) : [];
  const reached = rows.find((row) => row.reachedMonth !== null);
  const reachedOn = reached ? new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + reached.reachedMonth, 1)) : null;
  const monthYear = (value) => new Intl.DateTimeFormat(i18n.language === 'tzm' ? 'fr' : i18n.language, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(value);

  return (
    <div className="goals-planner">
      <section className="goals-planner-box" aria-labelledby={`plan-date-${goal.id}`}>
        <h4 id={`plan-date-${goal.id}`}>{t('goals.planner.byDateTitle')}</h4>
        <div className="fin-field">
          <label htmlFor={`plan-date-input-${goal.id}`}>{t('goals.planner.byDateLabel')}</label>
          <input id={`plan-date-input-${goal.id}`} type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(event) => setDate(event.target.value)} />
        </div>
        <p className="goals-planner-result">
          {needed === 0 ? t('goals.planner.alreadyThere') : t('goals.planner.byDateResult', { amount: money(needed), count: months })}
        </p>
        {needed > 0 && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => run(() => api.patch(`/fin/goals/${goal.id}`, { monthlyContribution: needed, targetDate: new Date(`${date}T00:00:00.000Z`).toISOString() }), 'goals.planner.kept')}
          >
            {t('goals.planner.keepByDate')}
          </Button>
        )}
      </section>

      <section className="goals-planner-box" aria-labelledby={`plan-monthly-${goal.id}`}>
        <h4 id={`plan-monthly-${goal.id}`}>{t('goals.planner.byMonthlyTitle')}</h4>
        <AmountField id={`plan-monthly-input-${goal.id}`} label={t('goals.planner.byMonthlyLabel')} value={monthly} currency={goal.currency} onChange={setMonthly} />
        {amount > 0 && (
          <>
            <p className="goals-planner-result">
              {reached
                ? t('goals.planner.byMonthlyResult', { count: reached.reachedMonth, date: monthYear(reachedOn) })
                : t('goals.planner.byMonthlyNever', { years: rows.length, capital: money(rows.at(-1)?.capital ?? 0) })}
            </p>
            <Button type="button" variant="secondary" onClick={() => run(() => api.patch(`/fin/goals/${goal.id}`, { monthlyContribution: amount }), 'goals.planner.kept')}>
              {t('goals.planner.keepMonthly')}
            </Button>
          </>
        )}
      </section>
      <p className="fin-hint">{t(rate > 0 ? 'goals.planner.howRate' : 'goals.planner.how', { capital: money(capital), target: money(goal.target) })}</p>
    </div>
  );
}
