import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Download, FileText, ListChecks, PieChart, Printer } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { formatAmount, formatRatio } from '../../lib/format.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import BackLink from '../../components/fincludia/BackLink.jsx';
import IncomeExpenseChart from '../../components/fincludia/IncomeExpenseChart.jsx';
import '../../components/fincludia/Fincludia.css';
import './Synthesis.css';

// « Synthèse » (P8-10, tab 14_Synthese_Rapports): the month in sections R-01 to
// R-11, each block linking to the screen it comes from; « Aujourd'hui »; the
// download icon top right (CSV, spreadsheet, or the page printed as PDF). The
// report is served by the engine: nothing is computed here.
//
// P8-25: the same screen serves SYN-02 « Rapport mensuel » at its own address,
// `/app/synthese/rapport/:mois` (one month, reopened as it was from a copied
// address), and the list of reports (REP-01) is at `/app/synthese/rapports`.
export const thisMonth = () => new Date().toISOString().slice(0, 7);

export default function SynthesisPage() {
  const { t, i18n } = useTranslation();
  const { mois } = useParams();
  const navigate = useNavigate();
  const isReport = Boolean(mois);
  const month = /^\d{4}-\d{2}$/.test(mois ?? '') ? mois : thisMonth();
  useDocumentMeta(isReport ? t('synthesis.reportTitle', { month }) : t('synthesis.title'), t('synthesis.intro'));
  const setMonth = (value) => navigate(`/app/synthese/rapport/${value}`);
  const report = useApi(`/fin/rapport?mois=${month}`);
  const history = useApi('/fin/argent/synthese/historique');
  const [kept, setKept] = useState(null);
  if (report.data && report.data !== kept) setKept(report.data);
  const data = report.data ?? kept;

  if (!data && report.status === 'loading') return <LoadingState />;
  if (report.status === 'error' && !data) return <ErrorState message={t('state.loadError')} onRetry={report.reload} />;

  const r = data.rapport;
  const s = r.sections;
  const money = (value) => (value === null || value === undefined ? t('fincludia.notComputed') : formatAmount(i18n.language, value, r.currency));

  return (
    <>
      <PageHeader icon={isReport ? FileText : PieChart} title={isReport ? t('synthesis.reportTitle', { month }) : t('synthesis.title')} subtitle={t('synthesis.intro')} maxWidth={1100} />
      <div className="synthesis-page">
        {isReport && <BackLink to="/app/synthese/rapports">{t('synthesis.backToReports')}</BackLink>}
        <div className="synthesis-toolbar">
          <label htmlFor="synthesis-month">
            {t('synthesis.month')}
            <input id="synthesis-month" type="month" value={month} max={thisMonth()} onChange={(event) => event.target.value && setMonth(event.target.value)} />
          </label>
          {/* SYN-02 and REP-01, each at its own address (P8-25). */}
          {!isReport && (
            <Link to={`/app/synthese/rapport/${month}`} className="synthesis-report-link">
              <FileText size={16} aria-hidden="true" /> {t('synthesis.openReport')}
            </Link>
          )}
          <Link to="/app/synthese/rapports" className="synthesis-report-link">
            {t('synthesis.allReports')}
          </Link>
          {/* Tab 03B: the download icon, top right of the Synthèse. */}
          <div className="synthesis-download" role="group" aria-label={t('synthesis.download')}>
            <Download size={18} aria-hidden="true" />
            <a href={`/api/fin/rapport/export?mois=${month}`}>CSV</a>
            <a href={`/api/fin/rapport/export?mois=${month}&format=xlsx`}>XLSX</a>
            <button type="button" onClick={() => window.print()}>
              <Printer size={14} aria-hidden="true" /> PDF
            </button>
          </div>
        </div>
        <p className="fin-hint">{t('synthesis.version', { version: r.version, date: new Date(r.genereLe).toLocaleString(i18n.language) })}</p>

        <Link to="/app/aujourdhui" className="synthesis-today">
          <ListChecks size={18} aria-hidden="true" /> {t('synthesis.today')}
        </Link>

        <section aria-labelledby="r01">
          <h2 id="r01">{t('synthesis.sections.R01')}</h2>
          <div className="fin-figure-grid">
            <FigureCard label={t('movements.tabs.income')} answer={s.R01.revenus} />
            <FigureCard label={t('movements.tabs.expense')} answer={s.R01.depenses} />
            <FigureCard label={t('appHome.netFlow')} answer={s.R01.fluxNet} />
          </div>
          <p className="fin-hint">
            {t('synthesis.vsPrevious', {
              expenses: s.R01.tendance.depenses.resultat === null ? t('fincludia.notComputed') : formatRatio(i18n.language, s.R01.tendance.depenses.resultat),
            })}
          </p>
          {history.data?.points && <IncomeExpenseChart points={history.data.points} currency={history.data.currency} />}
        </section>

        <div className="synthesis-grid">
          <Block id="r02" title={t('synthesis.sections.R02')} to="/app/comptes">
            <ul>
              {s.R02.map((account) => (
                <li key={account.id}>
                  <span>{account.label}</span>
                  <span>
                    {money(account.debut)} → <strong>{money(account.fin)}</strong>
                  </span>
                </li>
              ))}
            </ul>
          </Block>

          <Block id="r03" title={t('synthesis.sections.R03')} to="/app/mouvements">
            <ul>
              {s.R03.topCategories.map((row) => (
                <li key={row.categoryId ?? 'none'}>
                  <span>{row.label ?? t('myMoney.noCategory')}</span>
                  <strong>{money(row.total)}</strong>
                </li>
              ))}
            </ul>
            <p>
              {t('budget.dailyAverage')} : {money(s.R03.moyenneJournaliere.resultat)}
            </p>
          </Block>

          <Block id="r04" title={t('synthesis.sections.R04')} to="/app/budgets">
            {s.R04 ? (
              <>
                <p>
                  {s.R04.label} : {money(s.R04.reel.resultat)} / {money(s.R04.prevu.resultat)}
                </p>
                <p>
                  {t('budget.gap')} : {money(s.R04.reste.resultat)}
                </p>
                {s.R04.depassement > 0 && <p className="synthesis-alert">{t('budget.overspent', { amount: money(s.R04.depassement) })}</p>}
              </>
            ) : (
              <p className="fin-hint">{t('appHome.noBudget')}</p>
            )}
          </Block>

          {s.R05?.poches && (
            <Block id="r05" title={t('synthesis.sections.R05')} to="/app/budgets">
              <ul>
                {s.R05.poches.map((pocket) => (
                  <li key={pocket.cle}>
                    <span>{t(`budget.methods.pockets.${pocket.cle}`, { target: Math.round(pocket.cible * 100) })}</span>
                    <strong>{pocket.part?.resultat === null || !pocket.part ? t('fincludia.notComputed') : formatRatio(i18n.language, pocket.part.resultat)}</strong>
                  </li>
                ))}
              </ul>
            </Block>
          )}

          <Block id="r07" title={t('synthesis.sections.R07')} to="/app/objectifs">
            {s.R07.length === 0 ? (
              <p className="fin-hint">{t('appHome.createGoal')}</p>
            ) : (
              <ul>
                {s.R07.map((goal) => (
                  <li key={goal.id}>
                    <span>{goal.label}</span>
                    <strong>{goal.vue.progres.resultat === null ? '—' : formatRatio(i18n.language, goal.vue.progres.resultat)}</strong>
                  </li>
                ))}
              </ul>
            )}
          </Block>

          <Block id="r08" title={t('synthesis.sections.R08')} to="/app/objectifs/fonds-urgence">
            <p>{s.R08.moisReserve.resultat === null ? t('fincludia.notComputed') : t('fincludia.months', { count: Math.round(s.R08.moisReserve.resultat * 10) / 10 })}</p>
            <p>
              {t('reserve.gap')} : {money(s.R08.manque.resultat)}
            </p>
          </Block>

          {s.R09 && (
            <Block id="r09" title={t('synthesis.sections.R09')} to="/app/dettes">
              <p>
                {t('debts.outstanding')} : {money(s.R09.encours)}
              </p>
              {s.R09.tauxEffort && (
                <p>
                  {t('debts.effortRate')} : {s.R09.tauxEffort.resultat === null ? t('fincludia.notComputed') : formatRatio(i18n.language, s.R09.tauxEffort.resultat)}
                </p>
              )}
            </Block>
          )}

          <Block id="r10" title={t('synthesis.sections.R10')} to="/app/patrimoine">
            <p>
              <strong>{money(s.R10.patrimoineNet.resultat)}</strong>
            </p>
          </Block>

          <Block id="r11" title={t('synthesis.sections.R11')} to="/app/mouvements">
            <p>
              {t('movements.clearingRate')} : {s.R11.tauxPointage.resultat === null ? t('fincludia.notComputed') : formatRatio(i18n.language, s.R11.tauxPointage.resultat)}
            </p>
            {s.R11.nonPointees > 0 && <p className="synthesis-alert">{t('synthesis.toClear', { count: s.R11.nonPointees })}</p>}
            {s.R11.nonCategorisees > 0 && <p>{t('myMoney.uncategorisedCount', { count: s.R11.nonCategorisees })}</p>}
          </Block>

          <Block id="r12" title={t('synthesis.sections.R12')} to="/app/formation">
            <p className="fin-hint">{t('appHome.learningIntro')}</p>
          </Block>
        </div>
      </div>
    </>
  );
}

// One section of the report, linking to the screen it comes from (« chaque
// bloc cliquable »).
function Block({ id, title, to, children }) {
  const { t } = useTranslation();
  return (
    <section className="synthesis-block" aria-labelledby={id}>
      <div className="synthesis-block-head">
        <h2 id={id}>{title}</h2>
        <Link to={to}>{t('calendar.open')}</Link>
      </div>
      {children}
    </section>
  );
}
