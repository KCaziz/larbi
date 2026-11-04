import { Link } from 'react-router-dom';
import { useApi } from '../../lib/useApi.js';
import { formatAmount, formatDate, formatRatio } from '../../lib/format.js';
import RingChart from '../../components/fincludia/RingChart.jsx';
import BarList from '../../components/fincludia/charts/BarList.jsx';
import GroupedBars from '../../components/fincludia/charts/GroupedBars.jsx';
import LineChart from '../../components/fincludia/charts/LineChart.jsx';

// The months behind the dashboard: what the pot held at the end of each, and what
// each member paid in each. The chart kit allows four series, so the three
// members who paid most are drawn and the others are drawn together.
function HistoryCharts({ t, history }) {
  const { points, members, currency } = history;
  const total = (memberId) => points.reduce((sum, point) => sum + (point.paye[memberId] ?? 0), 0);
  const ranked = [...members].sort((a, b) => total(b.memberId) - total(a.memberId));
  const shown = ranked.length > 4 ? ranked.slice(0, 3) : ranked;
  const rest = ranked.slice(shown.length);
  const series = shown.map((member, index) => ({ key: member.memberId, label: member.name ?? t('spaces.report.noCategory'), tone: index, points: points.map((point) => ({ month: point.month, value: point.paye[member.memberId] ?? 0 })) }));
  if (rest.length > 0) series.push({ key: 'others', label: t('spaces.overview.others'), tone: 3, points: points.map((point) => ({ month: point.month, value: rest.reduce((sum, member) => sum + (point.paye[member.memberId] ?? 0), 0) })) });
  return (
    <article className="space-compartment space-compartment-wide">
      <h3>{t('spaces.overview.history')}</h3>
      <LineChart currency={currency} caption={t('spaces.overview.potChart')} series={[{ key: 'pot', label: t('spaces.overview.balance'), tone: 0, points: points.map((point) => ({ month: point.month, value: point.soldeGroupe })) }]} />
      <LineChart currency={currency} caption={t('spaces.overview.paidChart')} series={series} />
    </article>
  );
}

// The dashboard of a space (P9-02, tab 03, CD-01 to CD-08): the group's balance,
// the month's spending, who paid, who owes what, the budgets, the next bills,
// the tasks and a goal. Every figure is read from the server; nothing here is
// personal, and a block with nothing to say says so rather than showing a zero.
export default function SpaceOverview({ t, language, spaceId, space }) {
  const dash = useApi(`/fin/espaces/${spaceId}/tableau-de-bord`);
  const refs = useApi('/fin/espaces/references-budgets');
  const history = useApi(`/fin/espaces/${spaceId}/historique-mensuel`);
  if (!dash.data) return null;
  const d = dash.data.tableau;
  const money = (amount) => formatAmount(language, amount, d.currency);
  const categoryLabel = (key) => {
    const found = refs.data?.categories.find((item) => item.key === key);
    return found ? found.label : t('spaces.report.noCategory');
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

        {history.data && <HistoryCharts t={t} history={history.data.historique} />}

        <article className="space-compartment">
          <h3>{t('spaces.overview.spend')}</h3>
          <p className="space-overview-figure">{money(d.depenses.total)}</p>
          {d.depenses.tendance === null ? (
            <p className="spaces-help">{t('spaces.overview.noTrend')}</p>
          ) : (
            <p className="spaces-help">{t('spaces.overview.trend', { change: `${d.depenses.tendance > 0 ? '+' : ''}${formatRatio(language, d.depenses.tendance)}` })}</p>
          )}
          {/* The ring: the month's spending by collective category, each slice the colour the client gave it. */}
          <RingChart
            rows={d.depenses.parCategorie.map((row) => {
              const found = refs.data?.categories.find((item) => item.key === row.category);
              return { key: row.category ?? 'none', label: found ? found.label : t('spaces.report.noCategory'), icon: found?.icon, color: found?.color, total: row.value };
            })}
            currency={d.currency}
            label={t('spaces.overview.spend')}
          />
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
          {/* Everybody's balance on one baseline: owed to them on one side, owed by them on the other. */}
          <BarList
            signed
            rows={d.quiDoitQuoi.soldes.map((row) => ({ key: row.memberId, label: row.name, value: row.solde.resultat }))}
            format={money}
            caption={t('spaces.overview.whoOwes')}
            positiveLabel={t('spaces.overview.owedToThem')}
            negativeLabel={t('spaces.overview.theyOwe')}
          />
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
            <GroupedBars
              rows={d.budgets.slice(0, 6).map((budget) => ({ key: budget.id, label: categoryLabel(budget.category), a: budget.value, b: budget.spent }))}
              names={{ a: t('budget.planned'), b: t('budget.real') }}
              currency={d.currency}
              caption={t('spaces.overview.budgets')}
            />
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
