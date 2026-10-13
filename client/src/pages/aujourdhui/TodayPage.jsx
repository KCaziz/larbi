import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CalendarClock, Clock, Compass, Target } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { formatAmount, formatDate } from '../../lib/format.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import '../../components/fincludia/Fincludia.css';
import './Today.css';

// The "Aujourd'hui" home screen (P6-06), screens C04 / LY02 / ET02 / JA02 /
// SA02. It answers one question — « où j'en suis, que faire maintenant ? » —
// and the server decides what it may show: three to five figures, one to three
// actions, the alerts that are facts, the nearest due dates.
//
// This page computes NOTHING. Every figure arrives wrapped in the engine's
// answer contract (P4-09) and FigureCard shows it with its formula, its version
// and its inputs; a figure that is not computable arrives as an invitation to
// complete, which is what the card then shows instead of a zero.
export default function TodayPage() {
  const { t, i18n } = useTranslation();
  const today = useApi('/fin/aujourdhui');
  useDocumentMeta(t('today.title'), t('today.intro'));

  if (today.status === 'loading' && !today.data) return <LoadingState />;
  if (today.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={today.reload} />;

  const view = today.data.aujourdhui;
  const formulas = new Map((today.data.formulas ?? []).map((row) => [row.id, row]));

  return (
    <>
      <PageHeader icon={Compass} title={t('today.title')} subtitle={t(`today.dashboards.${view.titre}`, t('today.intro'))} />
      <div className="today-page">
        {/* The client's « bannière de qualité »: a fact about the figures, not a
            scolding. Shown only when the data really is old. */}
        {view.qualite?.stale && (
          <p className="today-quality" role="status">
            <Clock size={15} aria-hidden="true" />
            {t('today.staleData', { days: view.qualite.age.resultat })}
          </p>
        )}

        {view.periode && (
          <p className="today-period">
            {formatDate(i18n.language, view.periode.debut)} — {formatDate(i18n.language, view.periode.fin)}
          </p>
        )}

        {/* Actions first: the screen answers "what do I do now", and the server
            has already capped and ordered them (sécurité > échéance > budget >
            apprentissage). */}
        {view.actions.length > 0 && (
          <section aria-labelledby="today-actions">
            <h2 id="today-actions">{t('today.actionsTitle')}</h2>
            <ul className="today-actions">
              {view.actions.map((action) => (
                <li key={action.key} className={`today-action today-action-${action.priority}`}>
                  <Link to={action.to}>
                    <span className="today-action-label">{t(`today.actions.${action.key}`, action.contexte ?? {})}</span>
                    <ArrowRight size={16} aria-hidden="true" className="icon-dir" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {view.alertes.length > 0 && (
          <section aria-labelledby="today-alerts">
            <h2 id="today-alerts">
              <AlertTriangle size={18} aria-hidden="true" /> {t('today.alertsTitle')}
            </h2>
            <ul className="today-alerts">
              {view.alertes.map((alert) => (
                <li key={alert.enveloppe} className="today-alert">
                  <span className="today-alert-label">{alert.categoryLabel ?? t('today.unnamedEnvelope')}</span>
                  <span className="today-alert-level">{t(`today.levels.${alert.level}`)}</span>
                  <Link to="/budget" className="today-link">
                    {t('today.seeBudget')}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="today-kpis">
          <h2 id="today-kpis">{t('today.figuresTitle')}</h2>
          <div className="fin-cards">
            {view.kpis.map((kpi) => (
              <div key={kpi.key} className="today-kpi">
                <FigureCard label={t(`today.kpis.${kpi.key}`)} answer={kpi.answer} formula={formulas.get(kpi.formule) ?? null}>
                  {/* « Une carte non calculable devient une invitation à
                      compléter »: the card says what to do, and where. */}
                  {kpi.invitation && (
                    <Link to={invitationTarget(kpi.invitation)} className="today-invitation">
                      {t(`today.invitations.${kpi.invitation}`)}
                      <ArrowRight size={14} aria-hidden="true" className="icon-dir" />
                    </Link>
                  )}
                </FigureCard>
              </div>
            ))}
          </div>
        </section>

        {view.objectifPrioritaire && (
          <section aria-labelledby="today-goal">
            <h2 id="today-goal">
              <Target size={18} aria-hidden="true" /> {t('today.goalTitle')}
            </h2>
            <div className="today-goal">
              <span className="today-goal-label">{view.objectifPrioritaire.label}</span>
              <FigureCard label={t('today.goalProgress')} answer={view.objectifPrioritaire.progres} formula={formulas.get('F025') ?? null} />
              <Link to="/objectifs" className="today-link">
                {t('today.seeGoals')}
              </Link>
            </div>
          </section>
        )}

        {view.echeances.length > 0 && (
          <section aria-labelledby="today-upcoming">
            <h2 id="today-upcoming">
              <CalendarClock size={18} aria-hidden="true" /> {t('today.upcomingTitle')}
            </h2>
            <ul className="today-upcoming">
              {view.echeances.map((event) => (
                <li key={`${event.kind}-${event.sourceId}`} className="today-upcoming-row">
                  <span className="today-upcoming-date">{formatDate(i18n.language, event.date)}</span>
                  <span className="today-upcoming-kind">{t(`calendar.kinds.${event.kind}`)}</span>
                  <span className="today-upcoming-label">{event.label ?? event.categoryLabel ?? t('calendar.noLabel')}</span>
                  <span className="today-upcoming-amount">{formatAmount(i18n.language, event.value, view.currency)}</span>
                </li>
              ))}
            </ul>
            <Link to="/calendrier" className="today-link">
              {t('today.seeCalendar')}
            </Link>
          </section>
        )}

        {/* What is deliberately NOT here, said out loud rather than left as a
            gap: the overall financial-health score waits on weights the client
            still owes, and publishing one on invented weights would be a
            judgement nobody could check. */}
        {view.santeFinanciere && (
          <p className="today-pending">
            {t('today.healthPending', { formula: view.santeFinanciere.formula, task: view.santeFinanciere.waitingOn })}
          </p>
        )}

        {/* Somebody who has not picked a public gets the general dashboard and
            is told what choosing one would change. */}
        {today.data.tableauxDisponibles && (
          <p className="today-pending">
            {t('today.pickPublic')} <Link to="/compte/fincludia">{t('today.pickPublicLink')}</Link>
          </p>
        )}
      </div>
    </>
  );
}

// Where each invitation sends the person. Kept next to the page that renders
// them so a new invitation cannot be added without somewhere to go.
function invitationTarget(invitation) {
  const targets = {
    addMovement: '/mon-argent',
    addIncome: '/mon-argent',
    createBudget: '/budget',
    setReserve: '/reserve',
    createGoal: '/objectifs',
    addDebt: '/dettes',
    addRecurrence: '/calendrier',
  };
  return targets[invitation] ?? '/mon-argent';
}
