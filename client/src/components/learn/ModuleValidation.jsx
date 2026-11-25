import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Target } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatDate } from '../../lib/format.js';
import FigureCard from '../fincludia/FigureCard.jsx';
import Button from '../ui/Button.jsx';
import './ModuleValidation.css';

const STEPS = ['diagnostic', 'method', 'result', 'interpretation', 'decision'];
const RATINGS = [1, 0.5, 0];

// P13-02 — what a FINCLUDIA Academy lesson asks (pedagogical referential, rule
// V10): a module is validated by its QCM, exercise and mission (module score
// 0,50 × QCM + 0,30 × exercise + 0,20 × mission); the integrative case of a path
// is graded on its own weighted grid. An answer is written FIRST; the corrected
// answer appears once it is saved. Nothing shows for another lesson.
export default function ModuleValidation({ slug, courseId }) {
  const base = `/learn/formations/${slug}/courses/${courseId}/competence`;
  const state = useApi(base);
  if (!state.data) return null;
  const { module, case: academyCase } = state.data;
  return (
    <>
      {module && <ModuleBlock base={base} module={module} onChange={(data) => state.setData(data)} />}
      {academyCase && <CaseBlock base={base} item={academyCase} onChange={(data) => state.setData(data)} />}
    </>
  );
}

function useSaver(base, onChange) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const save = async (path, body, done, after) => {
    setBusy(true);
    setMessage(null);
    try {
      // The numbered exercise answers with POST; the rest replaces with PUT.
      onChange(await (path.startsWith('exercice-chiffre') ? api.post : api.put)(`${base}/${path}`, body));
      after?.();
      setMessage({ kind: 'ok', text: t(done) });
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err)) });
    } finally {
      setBusy(false);
    }
  };
  const status = message && (
    <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
      {message.text}
    </p>
  );
  return { busy, save, status };
}

function ModuleBlock({ base, module, onChange }) {
  const { t, i18n } = useTranslation();
  const [answer, setAnswer] = useState(null);
  const [steps, setSteps] = useState(null);
  const [evidence, setEvidence] = useState(null);
  const { busy, save, status } = useSaver(base, onChange);
  const reset = () => {
    setAnswer(null);
    setSteps(null);
    setEvidence(null);
  };

  const text = answer ?? module.exerciseAnswer;
  const ticked = steps ?? module.exerciseSteps;
  const ref = evidence ?? module.evidenceRef;
  const toggle = (i) => setSteps(ticked.includes(i) ? ticked.filter((x) => x !== i) : [...ticked, i].sort());
  const qcmLine =
    module.qcmScore === null
      ? t('academy.qcmNone')
      : module.criticalErrors > 0
        ? t('academy.qcmCritical', { score: module.qcmScore, count: module.criticalErrors })
        : t('academy.qcmScore', { score: module.qcmScore });

  return (
    <section className="academy-module" aria-labelledby="academy-module-title">
      <h2 id="academy-module-title">
        <ShieldCheck size={18} strokeWidth={1.9} aria-hidden="true" /> {t('academy.title', { code: module.code })}
      </h2>
      <p className="academy-rule">{t('academy.rule')}</p>

      <div className="academy-state">
        <FigureCard label={t('academy.mastery')} answer={module.mastery} />
        <ul className="academy-checks">
          <li className={module.qcmScore !== null && module.qcmScore >= 80 && module.criticalErrors === 0 ? 'ok' : ''}>{qcmLine}</li>
          <li className={module.exerciseScore !== null && module.exerciseScore >= 70 ? 'ok' : ''}>
            {module.exerciseScore === null ? t('academy.exerciseNone') : t('academy.exerciseScore', { score: module.exerciseScore })}
          </li>
          <li className={module.missionStatus === 'done' ? 'ok' : ''}>{module.missionStatus === 'done' ? t('academy.missionDone') : t('academy.missionTodo')}</li>
        </ul>
        <p className="academy-verdict" role="status">
          <span className={`academy-badge academy-badge-${module.state}`}>{t(`academy.state.${module.state}`)}</span> {t(`academy.stateHint.${module.state}`)}
          {module.validatedAt && ` ${t('academy.validatedOn', { date: formatDate(i18n.language, module.validatedAt) })}`}
          {module.refreshDue && module.state !== 'refresh' && ` ${t('academy.refreshDue', { date: formatDate(i18n.language, module.refreshDue) })}`}
        </p>
      </div>

      {module.remediation && (
        <div className="academy-remediation">
          <h3>{t(module.remediation.kind === 'redo' ? 'academy.redoTitle' : 'academy.reinforceTitle', { score: module.remediation.score })}</h3>
          <p>{t(module.remediation.kind === 'redo' ? 'academy.redoText' : 'academy.reinforceText')}</p>
          {module.remediation.missed.length > 0 && (
            <ul>
              {module.remediation.missed.map((q) => (
                <li key={q.prompt}>
                  <strong>{q.prompt}</strong>
                  {q.critical && <span className="learn-chip">{t('quiz.critical')}</span>}
                  {q.explanation && <div>{q.explanation}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <h3>{t('academy.exerciseTitle')}</h3>
      <p className="academy-text">{module.exercise || t('academy.exerciseInLesson')}</p>
      <label className="academy-field">
        <span>{t('academy.yourAnswer')}</span>
        <textarea rows={4} maxLength={5000} value={text} onChange={(e) => setAnswer(e.target.value)} />
      </label>
      <Button variant="secondary" disabled={busy || !text.trim()} onClick={() => save('exercice', { answer: text }, 'academy.answerSaved', reset)}>
        {module.correction ? t('academy.saveAnswer') : t('academy.saveAndCorrect')}
      </Button>

      {module.correction && (
        <div className="academy-correction">
          <h4>{t('academy.correctionTitle')}</h4>
          <p className="academy-text">{module.correction}</p>
          <fieldset>
            <legend>{t('academy.stepsLegend')}</legend>
            {STEPS.map((step, i) => (
              <label key={step} className="academy-step">
                <input type="checkbox" checked={ticked.includes(i)} onChange={() => toggle(i)} />
                <span>
                  <strong>{t(`academy.steps.${step}`)}</strong> — {t(`academy.stepsHint.${step}`)}
                </span>
              </label>
            ))}
          </fieldset>
          <Button variant="secondary" disabled={busy} onClick={() => save('exercice', { steps: ticked }, 'academy.stepsSaved', reset)}>
            {t('academy.saveSteps')}
          </Button>
        </div>
      )}

      {module.variant && <VariantExercise base={base} variant={module.variant} onChange={onChange} />}

      <h3>{t('academy.missionTitle')}</h3>
      {module.mission && <p className="academy-text">{module.mission}</p>}
      {module.challenge && <p className="academy-text academy-muted">{t('academy.challenge', { text: module.challenge })}</p>}
      {module.proof && <p className="academy-text academy-muted">{t('academy.proof', { text: module.proof })}</p>}
      <label className="academy-field">
        <span>{t('academy.evidence')}</span>
        <input type="text" maxLength={300} value={ref} onChange={(e) => setEvidence(e.target.value)} placeholder={t('academy.evidencePlaceholder')} />
      </label>
      <div className="academy-actions">
        {module.missionStatus === 'done' ? (
          <Button variant="secondary" disabled={busy} onClick={() => save('mission', { done: false, evidenceRef: ref }, 'academy.missionReopened', reset)}>
            {t('academy.missionUndo')}
          </Button>
        ) : (
          <Button disabled={busy} onClick={() => save('mission', { done: true, evidenceRef: ref }, 'academy.missionSaved', reset)}>
            {t('academy.missionMark')}
          </Button>
        )}
        <Link to="/app/progression">{t('academy.passportLink')}</Link>
      </div>
      {status}
    </section>
  );
}

function CaseBlock({ base, item, onChange }) {
  const { t, i18n } = useTranslation();
  const [answer, setAnswer] = useState(null);
  const [ratings, setRatings] = useState(null);
  const [critical, setCritical] = useState(null);
  const { busy, save, status } = useSaver(base, onChange);
  const reset = () => {
    setAnswer(null);
    setRatings(null);
    setCritical(null);
  };
  const text = answer ?? item.answer;
  const rated = ratings ?? item.ratings ?? item.criteria.map(() => null);
  const criticalError = critical ?? item.criticalError;
  const complete = rated.every((r) => r !== null);
  const rate = (i, value) => setRatings(rated.map((r, j) => (j === i ? value : r)));

  return (
    <section className="academy-module" aria-labelledby="academy-case-title">
      <h2 id="academy-case-title">
        <Target size={18} strokeWidth={1.9} aria-hidden="true" /> {t('academy.caseTitle', { title: item.title })}
      </h2>
      <p className="academy-rule">{t('academy.caseRule', { score: item.passMark })}</p>
      <p className="academy-verdict" role="status">
        {item.score === null && t('academy.caseNotGraded')}
        {item.score !== null && (item.validatedAt ? t('academy.casePassed', { score: item.score, date: formatDate(i18n.language, item.validatedAt) }) : t('academy.caseFailed', { score: item.score }))}
      </p>
      {item.scenario && <p className="academy-text">{item.scenario}</p>}
      {item.tasks && (
        <>
          <h3>{t('academy.caseTasks')}</h3>
          <p className="academy-text">{item.tasks}</p>
        </>
      )}
      <label className="academy-field">
        <span>{t('academy.caseAnswer')}</span>
        <textarea rows={8} maxLength={10000} value={text} onChange={(e) => setAnswer(e.target.value)} />
      </label>
      <Button variant="secondary" disabled={busy || !text.trim()} onClick={() => save('cas', { answer: text }, 'academy.answerSaved', reset)}>
        {item.correction ? t('academy.saveAnswer') : t('academy.saveAndCorrect')}
      </Button>

      {item.correction && (
        <div className="academy-correction">
          <h4>{t('academy.correctionTitle')}</h4>
          <p className="academy-text">{item.correction}</p>
          <div className="skills-scroll">
            <table className="skills-table">
              <caption className="academy-muted">{t('academy.gridLegend')}</caption>
              <thead>
                <tr>
                  <th scope="col">{t('academy.criterion')}</th>
                  <th scope="col">{t('academy.weight')}</th>
                  {RATINGS.map((r) => (
                    <th scope="col" key={r}>
                      {t(`academy.rating.${r === 1 ? 'met' : r === 0.5 ? 'partly' : 'not'}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {item.criteria.map((c, i) => (
                  <tr key={c.label}>
                    <th scope="row">{c.label}</th>
                    <td>{c.weight} %</td>
                    {RATINGS.map((r) => (
                      <td key={r}>
                        <input type="radio" name={`criterion-${i}`} checked={rated[i] === r} onChange={() => rate(i, r)} aria-label={`${c.label} — ${t(`academy.rating.${r === 1 ? 'met' : r === 0.5 ? 'partly' : 'not'}`)}`} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <label className="academy-step">
            <input type="checkbox" checked={criticalError} onChange={(e) => setCritical(e.target.checked)} />
            <span>{t('academy.caseCritical')}</span>
          </label>
          <Button disabled={busy || !complete} onClick={() => save('cas', { ratings: rated, criticalError }, 'academy.stepsSaved', reset)}>
            {t('academy.saveSteps')}
          </Button>
        </div>
      )}
      {status}
    </section>
  );
}

// P13-02 (sections 2 and 21): the same competence with new amounts at each
// attempt; the server checks the answer with a tolerance and shows the working.
function VariantExercise({ base, variant, onChange }) {
  const { t } = useTranslation();
  const [answer, setAnswer] = useState('');
  const { busy, save, status } = useSaver(base, onChange);
  const draw = async () => {
    try {
      onChange(await api.post(`${base}/exercice-chiffre`, {}));
      setAnswer('');
    } catch {
      /* the next click tries again */
    }
  };
  return (
    <div className="academy-correction">
      <h4>{t('academy.variantTitle')}</h4>
      <p className="academy-muted">{t('academy.variantIntro')}</p>
      {!variant.text ? (
        <Button variant="secondary" disabled={busy} onClick={draw}>
          {t('academy.variantStart')}
        </Button>
      ) : (
        <>
          <p className="academy-text">{variant.text}</p>
          {!variant.answered ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                save('exercice-chiffre/reponse', { answer }, 'academy.variantChecked');
              }}
            >
              <label className="academy-field">
                <span>{t('academy.variantAnswer', { unit: variant.unit || '—' })}</span>
                <input type="text" inputMode="decimal" value={answer} onChange={(e) => setAnswer(e.target.value)} maxLength={40} required />
              </label>
              <Button type="submit" variant="secondary" disabled={busy || !answer.trim()}>
                {t('academy.variantCheck')}
              </Button>
            </form>
          ) : (
            <>
              <p role="status" className={variant.correct ? 'academy-verdict' : 'academy-verdict academy-wrong'}>
                {variant.correct ? t('academy.variantRight') : t('academy.variantWrong', { expected: variant.expected, unit: variant.unit })}
              </p>
              <p className="academy-text">{variant.working}</p>
              <Button variant="ghost" disabled={busy} onClick={draw}>
                {t('academy.variantAgain')}
              </Button>
            </>
          )}
          {variant.bestScore !== null && <p className="academy-muted">{t('academy.variantBest', { score: variant.bestScore, attempts: variant.attempts })}</p>}
        </>
      )}
      {status}
    </div>
  );
}
