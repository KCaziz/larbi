import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, GraduationCap, HeartPulse, Home, PieChart, Plus, Target, Wallet, Wrench } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { formatAmount, formatDate } from '../../lib/format.js';
import { periodRange } from '../../lib/finControls.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import NextActionCard from '../../components/fincludia/NextActionCard.jsx';
import PeriodSelector from '../../components/fincludia/PeriodSelector.jsx';
import RingChart from '../../components/fincludia/RingChart.jsx';
import '../../components/fincludia/Fincludia.css';
import '../argent/MyMoney.css';
import '../mouvements/Movements.css';
import './Home.css';

// The Accueil (P8-06, tab 03_Accueil_Synthese): ONE screen, the same for every
// profile (ARC-01) — only the learning block depends on the profile. Block by
// block in the client's order: the total balance (or one account), the
// Synthèse beside it, the three central shortcuts, the period, the ring that
// changes with the active tab and filters the movements under it, the tools,
// « Nos budgets », the goals and the emergency fund, the due dates, « Aujourd'hui
// », the financial health and the learning. Nothing is computed here.
const RING_TABS = ['accounts', 'expenses', 'income', 'flow'];

export default function HomePage() {
  const { t, i18n } = useTranslation();
  useDocumentMeta(t('appHome.title'), t('appHome.intro'));
  const [period, setPeriod] = useState('mois');
  const [custom, setCustom] = useState({ from: '', to: '' });
  const [ringTab, setRingTab] = useState('expenses');
  const [slice, setSlice] = useState(null);
  const [accountView, setAccountView] = useState('total');

  const range = periodRange(period, new Date(), custom);
  const periodQuery = range ? `from=${new Date(`${range.from}T00:00:00.000Z`).toISOString()}&to=${new Date(`${range.to}T23:59:59.999Z`).toISOString()}` : '';
  const home = useApi(`/fin/accueil?${periodQuery}`);
  const today = useApi('/fin/aujourdhui');
  // Keep the previous answer on screen while a new period loads.
  const [kept, setKept] = useState(null);
  if (home.data && home.data !== kept) setKept(home.data);
  const data = home.data ?? kept;

  const movementsQuery = useMemo(() => {
    const params = new URLSearchParams({ pageSize: '8' });
    if (range) {
      params.set('from', new Date(`${range.from}T00:00:00.000Z`).toISOString());
      params.set('to', new Date(`${range.to}T23:59:59.999Z`).toISOString());
    }
    if (ringTab === 'expenses') params.set('kind', 'expense');
    if (ringTab === 'income') params.set('kind', 'income');
    if (slice && (ringTab === 'expenses' || ringTab === 'income')) params.set(slice === 'none' ? 'uncategorised' : 'categoryId', slice === 'none' ? 'true' : slice);
    if (slice && ringTab === 'accounts') params.set('accountId', slice);
    return params.toString();
  }, [range?.from, range?.to, ringTab, slice]); // eslint-disable-line react-hooks/exhaustive-deps
  const movements = useApi(`/fin/transactions?${movementsQuery}`);

  if (!data && home.status === 'loading') return <LoadingState />;
  if (home.status === 'error' && !data) return <ErrorState message={t('state.loadError')} onRetry={home.reload} />;

  const { comptes, synthese, budget, objectifs, reserve, echeances } = data;
  const currency = synthese.currency;
  const total = comptes.totals.find((row) => row.currency === currency) ?? comptes.totals[0] ?? null;
  const openAccounts = comptes.accounts.filter((account) => !account.archivedAt);
  const shownAccount = openAccounts.find((account) => account.id === accountView) ?? null;
  const view = today.data?.aujourdhui ?? null;

  // The category of a movement, from the breakdowns the server already named.
  const named = new Map([...synthese.depensesParCategorie, ...synthese.revenusParCategorie].filter((row) => row.categoryId).map((row) => [row.categoryId, `${row.icon ? `${row.icon} ` : ''}${row.label}`]));
  const labelOf = (row) => (row.categoryId ? (named.get(row.categoryId) ?? null) : null);

  const ringRows = {
    accounts: openAccounts
      .filter((account) => !account.liability && account.solde.resultat > 0)
      .map((account) => ({ key: account.id, label: account.label, icon: account.icon, color: account.color, total: account.solde.resultat })),
    expenses: synthese.depensesParCategorie.map((row) => ({ key: row.categoryId ?? 'none', label: row.label ?? t('myMoney.noCategory'), icon: row.icon, color: row.color, total: row.total })),
    income: synthese.revenusParCategorie.map((row) => ({ key: row.categoryId ?? 'none', label: row.label ?? t('myMoney.noCategory'), icon: row.icon, color: row.color, total: row.total })),
    flow: [
      { key: 'in', label: t('appHome.receivedIncome'), color: 'var(--green)', total: synthese.revenus.resultat ?? 0 },
      { key: 'out', label: t('appHome.paidExpenses'), color: 'var(--clay)', total: synthese.depenses.resultat ?? 0 },
    ],
  }[ringTab];

  return (
    <>
      <PageHeader icon={Home} title={t('appHome.title')} subtitle={t('appHome.intro')} maxWidth={1100} />
      <div className="home-page">
        {/* ACC-01 / ACC-02: the balance, total or one account, and the
            Synthèse right beside it. */}
        <section className="home-balance" aria-labelledby="home-balance-title">
          <div className="home-balance-main">
            <h2 id="home-balance-title" className="home-balance-label">
              <label htmlFor="home-account">{t('appHome.balance')}</label>
            </h2>
            <select id="home-account" value={accountView} onChange={(event) => setAccountView(event.target.value)} className="home-account-select">
              <option value="total">{t('appHome.allAccounts')}</option>
              {openAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.label}
                </option>
              ))}
            </select>
            <Link to="/app/comptes" className="home-balance-value">
              {shownAccount
                ? formatAmount(i18n.language, shownAccount.solde.resultat, shownAccount.currency)
                : total?.soldeTotal.resultat === null || !total
                  ? t('fincludia.notComputed')
                  : formatAmount(i18n.language, total.soldeTotal.resultat, total.currency)}
            </Link>
          </div>
          <Link to="/app/synthese" className="home-synthesis-link">
            <PieChart size={18} aria-hidden="true" /> {t('appNav.synthesis')}
          </Link>
        </section>

        {/* ACC-03: the three central shortcuts, always visible. */}
        <nav className="home-shortcuts" aria-label={t('appHome.shortcuts')}>
          <Link to="/app/comptes">
            <Wallet size={18} aria-hidden="true" /> {t('appNav.accounts')}
          </Link>
          <Link to="/app/mouvements">
            <Plus size={18} aria-hidden="true" /> {t('appHome.expensesAndIncome')}
          </Link>
          <button type="button" onClick={() => setRingTab('flow')}>
            {t('appHome.netFlow')} :{' '}
            <strong>{synthese.fluxNet.resultat === null ? t('fincludia.notComputed') : formatAmount(i18n.language, synthese.fluxNet.resultat, currency)}</strong>
          </button>
        </nav>

        {/* ACC-05: the period drives every figure of the page. */}
        <PeriodSelector value={period} onChange={setPeriod} name="home-period" periods={['jour', 'semaine', 'mois', '90jours', 'annee', 'periode']} custom={custom} onCustomChange={setCustom} />

        <div className="fin-figure-grid">
          <FigureCard label={t('movements.tabs.income')} answer={synthese.revenus} />
          <FigureCard label={t('movements.tabs.expense')} answer={synthese.depenses} />
          <FigureCard label={t('appHome.netFlow')} answer={synthese.fluxNet} />
        </div>

        {/* ACC-04 / ACC-06: the tools square, then the ring of the active tab;
            a slice filters the movements under it (ACC-07 / ACC-08). */}
        <section className="home-ring-section" aria-labelledby="home-ring-title">
          <h2 id="home-ring-title" className="sr-only">
            {t('appHome.distribution')}
          </h2>
          <div className="movements-tabs" role="tablist" aria-label={t('appHome.distribution')}>
            {RING_TABS.map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={ringTab === key}
                className={ringTab === key ? 'movements-tab active' : 'movements-tab'}
                onClick={() => {
                  setRingTab(key);
                  setSlice(null);
                }}
              >
                {t(`appHome.ringTabs.${key}`)}
              </button>
            ))}
          </div>
          <div className="home-ring-row">
            <Link to="/app/outils" className="home-tools-tile">
              <Wrench size={22} aria-hidden="true" />
              <span>{t('appNav.tools')}</span>
            </Link>
            <RingChart rows={ringRows} currency={currency} selected={slice} onSelect={ringTab === 'flow' ? null : setSlice} label={t(`appHome.ringTabs.${ringTab}`)} />
          </div>

          {movements.data && (
            <div className="home-movements">
              <ul className="money-list">
                {movements.data.transactions.map((row) => (
                  <li key={row.id} className="money-row">
                    <span className="money-row-date">{formatDate(i18n.language, row.occurredAt)}</span>
                    <span className={row.kind === 'income' || row.kind === 'transfer_in' ? 'money-row-amount money-in' : 'money-row-amount'}>
                      {row.kind === 'income' || row.kind === 'transfer_in' ? '+' : '−'} {formatAmount(i18n.language, row.value, row.currency)}
                    </span>
                    <span className="money-row-category">{labelOf(row) ?? row.note ?? t('myMoney.noCategory')}</span>
                  </li>
                ))}
              </ul>
              {movements.data.transactions.length === 0 && <p className="fin-hint">{t('myMoney.noTransaction')}</p>}
              <Link to={`/app/mouvements${movementsLink(ringTab, slice)}`} className="home-more">
                {t('appHome.allMovements')} <ArrowRight size={14} aria-hidden="true" className="icon-dir" />
              </Link>
            </div>
          )}
        </section>

        {/* « Aujourd'hui » (tab 03B): what is left to do. */}
        {view?.actions?.length > 0 && (
          <section aria-labelledby="home-today">
            <h2 id="home-today">{t('appHome.today')}</h2>
            <NextActionCard action={view.actions[0]} />
          </section>
        )}

        <div className="home-grid">
          {/* « Nos budgets » and its « + », which opens budget management —
              never an implicit entry. */}
          <section className="home-card" aria-labelledby="home-budgets">
            <div className="home-card-head">
              <h2 id="home-budgets">{t('appHome.budgets')}</h2>
              <Link to="/app/budgets" className="app-icon-button" title={t('appHome.manageBudgets')}>
                <Plus size={16} aria-hidden="true" />
                <span className="sr-only">{t('appHome.manageBudgets')}</span>
              </Link>
            </div>
            {!budget ? (
              <p className="fin-hint">
                {t('appHome.noBudget')} <Link to="/app/budgets">{t('appHome.createBudget')}</Link>
              </p>
            ) : (
              <>
                <Link to={`/app/budgets/${budget.id}`}>{budget.label}</Link>
                <ul className="home-budget-lines">
                  {budget.enveloppes.slice(0, 5).map((line) => (
                    <li key={line.id}>
                      <span>{line.label ?? t('budget.noCategory')}</span>
                      <span className="home-meter" aria-hidden="true">
                        <span style={{ inlineSize: `${Math.min(100, Math.round((line.taux.resultat ?? 0) * 100))}%` }} className={line.alerte === 'exceeded' ? 'over' : ''} />
                      </span>
                      <span className="home-budget-rate">{line.taux.resultat === null ? '—' : `${Math.round(line.taux.resultat * 100)} %`}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          {/* At most three priority goals, and the emergency fund. */}
          <section className="home-card" aria-labelledby="home-goals">
            <div className="home-card-head">
              <h2 id="home-goals">
                <Target size={16} aria-hidden="true" /> {t('appNav.goals')}
              </h2>
            </div>
            {objectifs.length === 0 ? (
              <p className="fin-hint">
                <Link to="/app/objectifs">{t('appHome.createGoal')}</Link>
              </p>
            ) : (
              <ul className="home-budget-lines">
                {objectifs.map((goal) => (
                  <li key={goal.id}>
                    <Link to="/app/objectifs">{goal.label}</Link>
                    <span className="home-meter" aria-hidden="true">
                      <span style={{ inlineSize: `${Math.min(100, Math.round((goal.view.progres.resultat ?? 0) * 100))}%` }} />
                    </span>
                    <span className="home-budget-rate">{goal.view.progres.resultat === null ? '—' : `${Math.round(goal.view.progres.resultat * 100)} %`}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="home-reserve">
              <Link to="/app/objectifs/fonds-urgence">{t('appHome.emergencyFund')}</Link> :{' '}
              {reserve.moisReserve.resultat === null ? t('fincludia.notComputed') : t('fincludia.months', { count: Math.round(reserve.moisReserve.resultat * 10) / 10 })}
            </p>
          </section>

          {/* The next due dates, and the way to the calendar. */}
          <section className="home-card" aria-labelledby="home-due">
            <div className="home-card-head">
              <h2 id="home-due">
                <CalendarDays size={16} aria-hidden="true" /> {t('appHome.upcoming')}
              </h2>
              <Link to="/app/calendrier">{t('appHome.calendar')}</Link>
            </div>
            {echeances.length === 0 ? (
              <p className="fin-hint">{t('calendar.nothingPlanned')}</p>
            ) : (
              <ul className="home-budget-lines">
                {echeances.map((event) => (
                  <li key={`${event.kind}-${event.sourceId}-${event.date}`}>
                    <span>{formatDate(i18n.language, event.date)}</span>
                    <span>{event.label ?? t(`calendar.kinds.${event.kind}`)}</span>
                    <span className="home-budget-rate">{formatAmount(i18n.language, event.value, currency)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Financial health with « Voir pourquoi », and the learning block —
              the only part of the page the profile changes. */}
          <section className="home-card" aria-labelledby="home-health">
            <div className="home-card-head">
              <h2 id="home-health">
                <HeartPulse size={16} aria-hidden="true" /> {t('appNav.health')}
              </h2>
            </div>
            {view?.santeFinanciere?.answer ? (
              <p className="home-health-score">
                {view.santeFinanciere.answer.resultat === null ? t('fincludia.notComputed') : `${view.santeFinanciere.answer.resultat} / 100`}
              </p>
            ) : (
              <p className="fin-hint">{t('health.notForYouth')}</p>
            )}
            <Link to="/app/sante">{t('appHome.seeWhy')}</Link>
          </section>

          <section className="home-card" aria-labelledby="home-learning">
            <div className="home-card-head">
              <h2 id="home-learning">
                <GraduationCap size={16} aria-hidden="true" /> {t('appNav.learning')}
              </h2>
            </div>
            <p className="fin-hint">{t('appHome.learningIntro')}</p>
            <Link to="/app/formation">{t('appHome.continueLearning')}</Link>
          </section>
        </div>

        {/* ACC-09: planned, real and the trend of the period. */}
        <dl className="money-extras">
          <dt>{t('myMoney.plannedVsReal')}</dt>
          <dd>
            {t('myMoney.plannedVsRealLine', {
              planned: synthese.prevuReel.prevu === null ? t('fincludia.notComputed') : formatAmount(i18n.language, synthese.prevuReel.prevu, currency),
              real: synthese.prevuReel.reel === null ? t('fincludia.notComputed') : formatAmount(i18n.language, synthese.prevuReel.reel, currency),
            })}
          </dd>
          <dt>{t('myMoney.trend')}</dt>
          <dd>
            {synthese.tendance.variation === null
              ? t('fincludia.notComputed')
              : t('myMoney.trendLine', { amount: formatAmount(i18n.language, synthese.tendance.variation, currency) })}
          </dd>
        </dl>
      </div>
    </>
  );
}

// Where « Voir tous les mouvements » goes: the movements page with the same
// filter as the ring (ACC-07: « le filtre reste synchronisé »).
function movementsLink(tab, slice) {
  if (!slice || tab === 'flow') return '';
  if (tab === 'accounts') return `?compte=${slice}`;
  return slice === 'none' ? '?sansCategorie=1' : `?categorie=${slice}`;
}
