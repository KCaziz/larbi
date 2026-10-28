import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CalendarClock, CheckCircle2, GraduationCap, HelpCircle, ListChecks, Wallet } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatAmount, formatDate } from '../../lib/format.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import NextActionCard from '../../components/fincludia/NextActionCard.jsx';
import '../../components/fincludia/Fincludia.css';
import './Today.css';

// « Aujourd'hui » (the client's answer D3, 2026-10-28): the list of what is
// left to do — actions to finish, income and payments to confirm, movements to
// clear, due dates, missing answers, alerts and courses to go on with. The
// figures live on the Accueil; this page is the to-do list, and the menu shows
// its count.
//
// It computes nothing: the server sends the list (`aFaire`), already ordered.
export default function TodayPage() {
  const { t, i18n } = useTranslation();
  const today = useApi('/fin/aujourdhui');
  const [message, setMessage] = useState(null);
  useDocumentMeta(t('today.title'), t('today.intro'));

  if (today.status === 'loading' && !today.data) return <LoadingState />;
  if (today.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={today.reload} />;

  const view = today.data.aujourdhui;
  const list = view.aFaire;
  const language = i18n.language;
  const nothing =
    list.actions.length + list.revenusAConfirmer.length + list.paiementsAConfirmer.length + list.echeances.length + list.alertes.length + list.formations.length === 0 &&
    list.aPointer === 0 &&
    list.questions.premiersPas === 0 &&
    list.questions.sante.length === 0;

  async function run(action, okKey) {
    setMessage(null);
    try {
      await action();
      setMessage({ kind: 'ok', text: t(okKey) });
      today.reload();
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 409: 'today.alreadyDone', 422: 'today.refused' })) });
    }
  }
  // A recurrence is confirmed for its occurrence; a planned payment is marked paid.
  const confirm = (event) =>
    event.kind === 'recurrence'
      ? run(() => api.post('/fin/calendrier/occurrences', { recurrenceId: event.sourceId, dueDate: new Date(`${event.dueDate}T00:00:00.000Z`).toISOString(), action: 'confirm' }), 'today.confirmed')
      : run(() => api.post(`/fin/transactions/${event.sourceId}/payer`, {}), 'today.confirmed');

  const toConfirm = (id, titleKey, events) =>
    events.length > 0 && (
      <section aria-labelledby={id}>
        <h2 id={id}>
          <Wallet size={18} aria-hidden="true" /> {t(titleKey)} <span className="today-count">{events.length}</span>
        </h2>
        <ul className="today-upcoming">
          {events.map((event) => (
            <li key={`${event.kind}-${event.sourceId}-${event.dueDate ?? event.date}`} className="today-upcoming-row">
              <span className="today-upcoming-date">{formatDate(language, event.date)}</span>
              <span className="today-upcoming-label">{event.label ?? t('calendar.noLabel')}</span>
              <span className="today-upcoming-amount">{formatAmount(language, event.value, view.currency)}</span>
              <button type="button" className="today-confirm" onClick={() => confirm(event)}>
                <CheckCircle2 size={16} aria-hidden="true" /> {t(event.inflow ? 'today.confirmIncome' : 'today.confirmPayment')}
              </button>
            </li>
          ))}
        </ul>
      </section>
    );

  return (
    <>
      <PageHeader icon={ListChecks} title={t('today.title')} subtitle={t('today.intro')} />
      <div className="today-page">
        {message && (
          <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
            {message.text}
          </p>
        )}

        {nothing && <p className="today-empty">{t('today.nothing')}</p>}

        {/* The first action is THE next one: the server has already ordered them. */}
        {list.actions.length > 0 && (
          <section aria-labelledby="today-actions">
            <h2 id="today-actions">{t('today.actionsTitle')}</h2>
            <NextActionCard action={list.actions[0]} />
            {list.actions.length > 1 && (
              <ul className="today-actions">
                {list.actions.slice(1).map((action) => (
                  <li key={action.key} className={`today-action today-action-${action.priority}`}>
                    <Link to={action.to}>
                      <span className="today-action-label">{t(`today.actions.${action.key}`, action.contexte ?? {})}</span>
                      <ArrowRight size={16} aria-hidden="true" className="icon-dir" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {toConfirm('today-income', 'today.incomeToConfirm', list.revenusAConfirmer)}
        {toConfirm('today-payments', 'today.paymentsToConfirm', list.paiementsAConfirmer)}

        {list.aPointer > 0 && (
          <section aria-labelledby="today-clearing">
            <h2 id="today-clearing">
              <CheckCircle2 size={18} aria-hidden="true" /> {t('today.toClearTitle')}
            </h2>
            <p>
              {t('today.toClear', { count: list.aPointer })}{' '}
              <Link to="/app/mouvements" className="today-link">
                {t('today.goClear')}
              </Link>
            </p>
          </section>
        )}

        {list.alertes.length > 0 && (
          <section aria-labelledby="today-alerts">
            <h2 id="today-alerts">
              <AlertTriangle size={18} aria-hidden="true" /> {t('today.alertsTitle')}
            </h2>
            <ul className="today-alerts">
              {list.alertes.map((alert) => (
                <li key={alert.enveloppe} className="today-alert">
                  <span className="today-alert-label">{alert.categoryLabel ?? t('today.unnamedEnvelope')}</span>
                  <span className="today-alert-level">{t(`today.levels.${alert.level}`)}</span>
                  <Link to="/app/budgets" className="today-link">
                    {t('today.seeBudget')}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {list.echeances.length > 0 && (
          <section aria-labelledby="today-upcoming">
            <h2 id="today-upcoming">
              <CalendarClock size={18} aria-hidden="true" /> {t('today.upcomingTitle')}
            </h2>
            <ul className="today-upcoming">
              {list.echeances.map((event) => (
                <li key={`${event.kind}-${event.sourceId}-${event.dueDate ?? event.date}`} className="today-upcoming-row">
                  <span className="today-upcoming-date">{formatDate(language, event.date)}</span>
                  <span className="today-upcoming-kind">{t(`calendar.kinds.${event.kind}`)}</span>
                  <span className="today-upcoming-label">{event.label ?? event.categoryLabel ?? t('calendar.noLabel')}</span>
                  <span className="today-upcoming-amount">{formatAmount(language, event.value, view.currency)}</span>
                </li>
              ))}
            </ul>
            <Link to="/app/calendrier" className="today-link">
              {t('today.seeCalendar')}
            </Link>
          </section>
        )}

        {(list.questions.premiersPas > 0 || list.questions.sante.length > 0) && (
          <section aria-labelledby="today-questions">
            <h2 id="today-questions">
              <HelpCircle size={18} aria-hidden="true" /> {t('today.questionsTitle')}
            </h2>
            <ul className="today-actions">
              {list.questions.premiersPas > 0 && (
                <li className="today-action">
                  <Link to="/app/parametres/premiers-pas">
                    <span className="today-action-label">{t('today.firstSteps', { count: list.questions.premiersPas })}</span>
                    <ArrowRight size={16} aria-hidden="true" className="icon-dir" />
                  </Link>
                </li>
              )}
              {list.questions.sante.length > 0 && (
                <li className="today-action">
                  <Link to="/app/sante">
                    <span className="today-action-label">{t('today.healthToComplete', { count: list.questions.sante.length })}</span>
                    <ArrowRight size={16} aria-hidden="true" className="icon-dir" />
                  </Link>
                </li>
              )}
            </ul>
          </section>
        )}

        {list.formations.length > 0 && (
          <section aria-labelledby="today-learning">
            <h2 id="today-learning">
              <GraduationCap size={18} aria-hidden="true" /> {t('today.learningTitle')}
            </h2>
            <ul className="today-actions">
              {list.formations.map((course) => (
                <li key={course.id} className="today-action">
                  <Link to={`/app/formation/${course.slug}`}>
                    <span className="today-action-label">{course.title}</span>
                    <ArrowRight size={16} aria-hidden="true" className="icon-dir" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
