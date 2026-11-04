import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Award, RotateCcw, Target } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatAmount } from '../../lib/format.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import '../../components/fincludia/Fincludia.css';
import './Missions.css';

// Playing one mission (P8-17): one choice per step, then the result — what each
// choice did and why, the rule in words, and the badge. It is all fictive:
// nothing here reads or writes the person's own accounts.
export default function MissionPlayPage() {
  const { t, i18n } = useTranslation();
  const { slug } = useParams();
  const mission = useApi(`/fin/missions/${slug}`);
  useDocumentMeta(mission.data?.mission.title ?? t('missions.title'));
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (mission.status === 'loading' && !mission.data) return <LoadingState />;
  if (mission.status === 'error') return <ErrorState message={t('missions.notFound')} />;
  const m = mission.data.mission;
  const money = (value) => formatAmount(i18n.language, value, m.currency);
  const done = m.steps.every((step) => answers[step.key]);

  async function submit(event) {
    event.preventDefault();
    setError(null);
    try {
      const res = await api.post(`/fin/missions/${slug}/jouer`, { choices: m.steps.map((step) => ({ step: step.key, choice: answers[step.key] })) });
      setResult(res.result);
    } catch (err) {
      setError(t(errorKey(err, { 422: 'missions.errors.incomplete' })));
    }
  }

  return (
    <>
      <PageHeader back={{ to: '/app/apprendre/missions', label: t('missions.backToList') }} icon={Target} title={m.title} subtitle={m.summary} maxWidth={760} />
      <div className="fin-page-narrow">
        <p className="fin-hint">{t('missions.startingAmount', { amount: money(m.startingAmount) })}</p>

        {!result ? (
          <form onSubmit={submit} className="mission-form">
            {m.steps.map((step, index) => (
              <fieldset key={step.key} className="mission-step">
                <legend>
                  {index + 1}. {step.prompt}
                </legend>
                {step.choices.map((choice) => (
                  <label key={choice.key} htmlFor={`${step.key}-${choice.key}`} className="mission-choice">
                    <input
                      id={`${step.key}-${choice.key}`}
                      type="radio"
                      name={step.key}
                      value={choice.key}
                      checked={answers[step.key] === choice.key}
                      onChange={() => setAnswers({ ...answers, [step.key]: choice.key })}
                    />
                    {choice.label}
                  </label>
                ))}
              </fieldset>
            ))}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" disabled={!done}>
              {t('missions.seeResult')}
            </Button>
          </form>
        ) : (
          <section aria-labelledby="mission-result" className="mission-result">
            <h2 id="mission-result">{t('missions.result')}</h2>
            <ul className="mission-totals">
              <li>
                <span>{t('missions.cash')}</span>
                <strong>{money(result.cash)}</strong>
              </li>
              <li>
                <span>{t('missions.savings')}</span>
                <strong>{money(result.savings)}</strong>
              </li>
              <li>
                <span>{t('missions.resilience')}</span>
                <strong>{t('missions.points', { count: result.resilience })}</strong>
              </li>
            </ul>
            <p className="mission-badge" role="status">
              <Award size={18} aria-hidden="true" /> {result.badge ? t('missions.badgeEarned', { label: result.badge.label }) : t('missions.noBadge')}
            </p>
            <p className="fin-hint">{t('missions.rule')}</p>
            <h3>{t('missions.whyTitle')}</h3>
            <ol className="mission-trace">
              {result.trace.map((row) => (
                <li key={row.step}>
                  <p>
                    <strong>{row.prompt}</strong> — {row.label}
                  </p>
                  <p className="fin-hint">{row.explanation}</p>
                  <p className="mission-effects">{t('missions.effects', { cash: money(row.cash), savings: money(row.savings), resilience: row.resilience })}</p>
                </li>
              ))}
            </ol>
            <Button
              variant="secondary"
              onClick={() => {
                setAnswers({});
                setResult(null);
              }}
            >
              <RotateCcw size={15} aria-hidden="true" /> {t('missions.replay')}
            </Button>
          </section>
        )}
      </div>
    </>
  );
}
