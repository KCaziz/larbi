import { Link } from 'react-router-dom';
import { useApi } from '../../lib/useApi.js';
import { formatAmount, formatDate, formatRatio } from '../../lib/format.js';

// The dashboard of a space (P9-02, tab 03, CD-01 to CD-08): the group's balance,
// the month's spending, who paid, who owes what, the budgets, the next bills,
// the tasks and a goal. Every figure is read from the server; nothing here is
// personal, and a block with nothing to say says so rather than showing a zero.
export default function SpaceOverview({ t, language, spaceId, space }) {
  const dash = useApi(`/fin/espaces/${spaceId}/tableau-de-bord`);
  const refs = useApi('/fin/espaces/references-budgets');
  if (!dash.data) return null;
  const d = dash.data.tableau;
  const money = (amount) => formatAmount(language, amount, d.currency);
  const categoryLabel = (key) => {
    const found = refs.data?.categories.find((item) => item.key === key);
    return found ? `${found.icon} ${found.label}` : t('spaces.report.noCategory');
  };
  const at = (path) => `/partage/${spaceId}/${path}`;
  // The vocabulary follows the kind of space (the household says « foyer »).
  const kind = t(`spaces.kinds.${space.kind}`);

  return (
    <section className="space-overview" aria-label={t('spaces.overview.title', { kind })}>
      <div className="space-overview-grid">
        <article className="space-compartment">
          <h3>{t('spaces.overview.balance')}</h3>
          <p className="space-overview-figure">{money(d.soldeGroupe.resultat)}</p>
          <Link to={at('ressources')}>{t('spaces.overview.seePot')}</Link>
        </article>

        <article className="space-compartment">
          <h3>{t('spaces.overview.spend')}</h3>
          <p className="space-overview-figure">{money(d.depenses.total)}</p>
          {d.depenses.tendance === null ? (
            <p className="spaces-help">{t('spaces.overview.noTrend')}</p>
          ) : (
            <p className="spaces-help">{t('spaces.overview.trend', { change: `${d.depenses.tendance > 0 ? '+' : ''}${formatRatio(language, d.depenses.tendance)}` })}</p>
          )}
          <ul className="space-overview-list">
            {d.depenses.parCategorie.slice(0, 4).map((row) => (
              <li key={row.category ?? 'none'}>
                <span>{categoryLabel(row.category)}</span>
                <span>{money(row.value)}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="space-compartment">
          <h3>{t('spaces.overview.whoPaid')}</h3>
          {d.quiAPaye.length === 0 ? (
            <p className="spaces-help">{t('spaces.overview.nobody')}</p>
          ) : (
            <ul className="space-overview-list">
              {d.quiAPaye.map((row) => (
                <li key={row.memberId}>
                  <span>{row.name}</span>
                  <span>{money(row.paid)}</span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="space-compartment">
          <h3>{t('spaces.overview.whoOwes')}</h3>
          {d.quiDoitQuoi.transferts.length === 0 ? (
            <p className="spaces-help">{t('spaces.overview.allSettled')}</p>
          ) : (
            <ul className="space-overview-list">
              {d.quiDoitQuoi.transferts.map((transfer, index) => (
                <li key={index}>{t('spaces.shared.transfer', { from: transfer.from, to: transfer.to, amount: money(transfer.amount) })}</li>
              ))}
            </ul>
          )}
          <Link to={at('depenses')}>{t('spaces.overview.seeExpenses')}</Link>
        </article>

        <article className="space-compartment">
          <h3>{t('spaces.overview.budgets')}</h3>
          {d.budgets.length === 0 ? (
            <p className="spaces-help">{t('spaces.overview.noBudget')}</p>
          ) : (
            <ul className="space-overview-list">
              {d.budgets.slice(0, 4).map((budget) => (
                <li key={budget.id}>
                  <span>{categoryLabel(budget.category)}</span>
                  <span>{budget.reste.resultat === null ? t('fincludia.notComputed') : money(budget.reste.resultat)}</span>
                </li>
              ))}
            </ul>
          )}
          <Link to={at('budgets')}>{t('spaces.overview.seeBudgets')}</Link>
        </article>

        <article className="space-compartment">
          <h3>{t('spaces.overview.bills')}</h3>
          {d.prochainesFactures.length === 0 ? (
            <p className="spaces-help">{t('spaces.overview.noBill')}</p>
          ) : (
            <ul className="space-overview-list">
              {d.prochainesFactures.map((bill) => (
                <li key={bill.id}>
                  <span>
                    {bill.label} · {formatDate(language, bill.date)}
                  </span>
                  <span>{money(bill.amount)}</span>
                </li>
              ))}
            </ul>
          )}
          <Link to={at('calendrier')}>{t('spaces.overview.seeCalendar')}</Link>
        </article>

        <article className="space-compartment">
          <h3>{t('spaces.overview.tasks')}</h3>
          <p className="spaces-help">{t('spaces.overview.tasksCounts', { late: d.taches.enRetard, today: d.taches.aujourdhui })}</p>
          {d.taches.prochaines.length > 0 && (
            <ul className="space-overview-list">
              {d.taches.prochaines.map((task) => (
                <li key={task.id}>
                  <span>{task.title}</span>
                  <span>{formatDate(language, task.dueDate)}</span>
                </li>
              ))}
            </ul>
          )}
          <Link to={at('taches')}>{t('spaces.overview.seeTasks')}</Link>
        </article>

        {d.objectif && (
          <article className="space-compartment">
            <h3>{t('spaces.overview.goal')}</h3>
            <p>{d.objectif.label}</p>
            <p className="space-overview-figure">
              {d.objectif.progression.resultat === null ? t('fincludia.notComputed') : formatRatio(language, d.objectif.progression.resultat)}
            </p>
            <p className="spaces-help">
              {money(d.objectif.allocated)} / {money(d.objectif.target)}
            </p>
            <Link to={at('objectifs')}>{t('spaces.overview.seeGoals')}</Link>
          </article>
        )}
      </div>
    </section>
  );
}
