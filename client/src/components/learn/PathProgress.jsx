import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Route } from 'lucide-react';
import { ApiError, api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useCatalogueBase } from '../../lib/useToolsBase.js';
import FigureCard from '../fincludia/FigureCard.jsx';
import Button from '../ui/Button.jsx';
import './ModuleValidation.css';

// P13-02 — the progression of a FINCLUDIA Academy path (sections 22 and 23 of the
// pedagogical referential): the entry test, the status of each module, the level
// reached in this domain and the integrative case. Nothing shows for a course
// that is not an Academy path.
export default function PathProgress({ slug }) {
  const { t } = useTranslation();
  const catalogue = useCatalogueBase();
  const state = useApi(`/learn/formations/${slug}/parcours`);
  const [pretest, setPretest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const path = state.data?.path;
  if (!path) return null;

  const run = async (action) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      const reason = err instanceof ApiError ? err.details?.reason : null;
      setError(reason === 'pretest_done' ? t('academy.pretestDone') : t(errorKey(err)));
    } finally {
      setBusy(false);
    }
  };
  const start = () =>
    run(async () => {
      const res = await api.post(`/learn/formations/${slug}/pretest`, {});
      setPretest(res.pretest);
      setAnswers({});
      setResult(null);
    });
  const submit = () =>
    run(async () => {
      const res = await api.post(`/learn/formations/${slug}/pretest/${pretest.id}/submit`, {
        answers: pretest.questions.map((q) => ({ questionId: q.id, choiceIds: answers[q.id] ? [answers[q.id]] : [] })),
      });
      setResult(res.result);
      setPretest(null);
      state.setData({ path: res.path });
    });

  return (
    <section className="learn-panel academy-path" aria-labelledby="academy-path-title">
      <h2 id="academy-path-title">
        <Route size={18} strokeWidth={1.9} aria-hidden="true" /> {t('academy.pathTitle')}
      </h2>
      <p className="academy-muted">{t('academy.pathRule')}</p>
      <div className="academy-state">
        <FigureCard label={t('academy.pathAverage')} answer={path.average} />
        <ul className="academy-checks">
          <li>{t('academy.pathAcquired', { acquired: path.acquired, total: path.total })}</li>
          <li>{path.reached ? t('academy.pathReached', { level: path.reached }) : t('academy.pathNoLevel')}</li>
          {path.next && <li>{t('academy.pathNext', { level: path.next })}</li>}
          {path.case && (
            <li className={path.case.validated ? 'ok' : ''}>
              <Link to={`${catalogue}/${slug}/cours/${path.case.courseId}`}>{t('academy.pathCase')}</Link> —{' '}
              {path.case.score === null ? t('academy.caseNotGraded') : t(path.case.validated ? 'academy.pathCasePassed' : 'academy.pathCaseFailed', { score: path.case.score })}
            </li>
          )}
        </ul>
        {path.validated && <p className="academy-verdict">{t('academy.pathValidated')}</p>}
      </div>

      <h3>{t('academy.pretestTitle')}</h3>
      {!pretest && !result && (
        <>
          <p>{path.pretest?.submitted ? t('academy.pretestTaken', { score: path.pretest.score, count: path.pretest.exempted.length }) : t('academy.pretestIntro', { score: path.rules.pretest })}</p>
          {!path.pretest?.submitted && (
            <Button variant="secondary" disabled={busy} onClick={start}>
              {path.pretest ? t('academy.pretestResume') : t('academy.pretestStart')}
            </Button>
          )}
        </>
      )}
      {pretest && (
        <div className="academy-pretest">
          {pretest.questions.map((q, i) => (
            <fieldset key={q.id} className="academy-pretest-question">
              <legend>
                {i + 1}. {q.prompt}
              </legend>
              {q.choices.map((c) => (
                <label key={c.id} className="academy-step">
                  <input type="radio" name={`pretest-${q.id}`} checked={answers[q.id] === c.id} onChange={() => setAnswers({ ...answers, [q.id]: c.id })} />
                  <span>{c.text === 'true' ? t('quiz.true') : c.text === 'false' ? t('quiz.false') : c.text}</span>
                </label>
              ))}
            </fieldset>
          ))}
          <Button disabled={busy} onClick={submit}>
            {t('academy.pretestSubmit', { answered: Object.keys(answers).length, total: pretest.questions.length })}
          </Button>
        </div>
      )}
      {result && (
        <div className="academy-correction" role="status">
          <p>
            <strong>{t('academy.pretestScore', { score: result.score })}</strong>{' '}
            {result.score >= result.passMark ? t('academy.pretestExempted', { count: result.exempted }) : t('academy.pretestNoExemption', { score: result.passMark })}
          </p>
          <ul>
            {result.corrections
              .filter((c) => !c.correct)
              .map((c) => (
                <li key={c.questionId}>
                  <strong>{c.prompt}</strong>
                  {c.explanation && <div>{c.explanation}</div>}
                </li>
              ))}
          </ul>
        </div>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <h3>{t('academy.pathModules')}</h3>
      <div className="skills-scroll">
        <table className="skills-table">
          <thead>
            <tr>
              <th scope="col">{t('academy.col.module')}</th>
              <th scope="col">{t('academy.col.level')}</th>
              <th scope="col">{t('academy.col.state')}</th>
            </tr>
          </thead>
          <tbody>
            {path.modules.map((m) => (
              <tr key={m.moduleId}>
                <td>
                  <Link to={`${catalogue}/${slug}/cours/${m.courseId}`}>
                    {m.code} — {m.title}
                  </Link>
                </td>
                <td>{m.level || '—'}</td>
                <td>
                  <span className={`academy-badge academy-badge-${m.state}`}>{t(`academy.state.${m.state}`)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
