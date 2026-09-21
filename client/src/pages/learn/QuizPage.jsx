import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Award, CircleCheck, CircleX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, ApiError, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import '../../components/quiz/Quiz.css';
import './Learn.css';

// A quiz, as a learner takes it: introduction -> questions -> result. The questions come without
// their answers (the server keeps them), and the answers are graded by the server: this page
// only shows what the server decided.
const choiceLabel = (t, text) => (text === 'true' ? t('quiz.true') : text === 'false' ? t('quiz.false') : text);

function Question({ question, index, answer, onChange, feedback }) {
  const { t } = useTranslation();
  const name = `q-${question.id}`;
  const chosen = new Set(answer?.choiceIds ?? []);
  const right = new Set(feedback?.correctChoiceIds ?? []);
  const toggle = (id) => {
    if (question.type === 'multiple') {
      const next = new Set(chosen);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      onChange({ choiceIds: [...next] });
    } else {
      onChange({ choiceIds: [id] });
    }
  };
  const hint = question.type === 'multiple' ? t('quiz.hintMultiple') : question.type === 'text' ? t('quiz.hintText') : t('quiz.hintSingle');

  return (
    <fieldset className="quiz-item">
      <legend>
        <span className="sr-only">{t('quiz.questionNumber', { n: index + 1 })}: </span>
        {index + 1}. {question.prompt}
      </legend>
      <small>
        {hint} · {t('quiz.points', { count: question.points })}
      </small>
      {question.type === 'text' ? (
        <input
          className="quiz-text-input"
          type="text"
          maxLength={500}
          value={answer?.text ?? ''}
          disabled={Boolean(feedback)}
          aria-label={question.prompt}
          onChange={(e) => onChange({ text: e.target.value })}
        />
      ) : (
        <div className="quiz-options">
          {question.choices.map((choice) => {
            const isChosen = chosen.has(choice.id);
            const state = feedback ? (right.has(choice.id) ? 'right' : isChosen ? 'wrong' : '') : '';
            return (
              <label key={choice.id} className={`quiz-option ${state}`}>
                <input
                  type={question.type === 'multiple' ? 'checkbox' : 'radio'}
                  name={name}
                  checked={isChosen}
                  disabled={Boolean(feedback)}
                  onChange={() => toggle(choice.id)}
                />
                {choiceLabel(t, choice.text)}
                {state === 'right' && <CircleCheck size={16} strokeWidth={2} aria-label={t('quiz.rightAnswer')} />}
                {state === 'wrong' && <CircleX size={16} strokeWidth={2} aria-label={t('quiz.yourWrongAnswer')} />}
              </label>
            );
          })}
        </div>
      )}
      {feedback && (
        <div className={`quiz-feedback ${feedback.correct ? 'right' : 'wrong'}`} role="status">
          <strong>{feedback.correct ? t('quiz.correct') : t('quiz.incorrect')}</strong>
          {question.type === 'text' && !feedback.correct && feedback.acceptedAnswers?.length > 0 && (
            <span>{t('quiz.acceptedAnswers', { answers: feedback.acceptedAnswers.join(' / ') })}</span>
          )}
          {feedback.explanation && <span>{feedback.explanation}</span>}
        </div>
      )}
    </fieldset>
  );
}

export default function QuizPage() {
  const { slug, quizId } = useParams();
  const { t } = useTranslation();
  const summary = useApi(`/learn/formations/${slug}/quizzes/${quizId}`);
  const [phase, setPhase] = useState('intro'); // intro | taking | result
  const [attempt, setAttempt] = useState(null); // { id }
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [quiz, setQuiz] = useState(null); // fresher summary after an action
  const [enrollment, setEnrollment] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useDocumentMeta(summary.data?.quiz.title ?? t('quiz.title'), '');

  if (summary.status === 'loading') return <LoadingState />;
  if (summary.status === 'error') {
    const status = summary.error instanceof ApiError ? summary.error.status : 0;
    const reason = summary.error instanceof ApiError ? summary.error.details?.reason : null;
    const text =
      status === 403 ? (reason === 'premium_required' ? t('learn.course.premiumRequired') : t('learn.course.notEnrolled'))
      : status === 409 ? t('quiz.unavailable')
      : status === 404 ? t('quiz.notFound')
      : null;
    if (text) {
      return (
        <div className="quiz-page">
          <ErrorState message={text} />
          <p className="center">
            <Button to={`/catalogue/${slug}`} variant="secondary">
              {t('learn.course.goToFormation')}
            </Button>
          </p>
        </div>
      );
    }
    return <ErrorState message={t('quiz.loadError')} onRetry={summary.reload} />;
  }

  const current = quiz ?? summary.data.quiz;
  const openAttempt = summary.data.openAttempt;
  const left = current.maxAttempts === null ? null : Math.max(0, current.maxAttempts - current.attemptsUsed);
  const feedbackOf = (question) => result?.corrections.find((c) => c.questionId === question.id);
  const answeredCount = questions.filter((q) => (q.type === 'text' ? (answers[q.id]?.text ?? '').trim() : (answers[q.id]?.choiceIds ?? []).length)).length;

  const run = async (action) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      const reason = err instanceof ApiError ? err.details?.reason : null;
      setError(reason === 'no_attempts_left' ? t('quiz.noAttemptsLeft') : reason === 'already_submitted' ? t('quiz.alreadySubmitted') : t(errorKey(err)));
    } finally {
      setBusy(false);
    }
  };

  const start = () =>
    run(async () => {
      const res = await api.post(`/learn/formations/${slug}/quizzes/${quizId}/attempts`);
      setAttempt(res.attempt);
      setQuestions(res.questions);
      setAnswers({});
      setResult(null);
      setQuiz(res.quiz);
      setPhase('taking');
    });

  const submit = () =>
    run(async () => {
      const payload = questions.map((q) => ({ questionId: q.id, ...(q.type === 'text' ? { text: answers[q.id]?.text ?? '' } : { choiceIds: answers[q.id]?.choiceIds ?? [] }) }));
      const res = await api.post(`/learn/formations/${slug}/quizzes/${quizId}/attempts/${attempt.id}/submit`, { answers: payload });
      setResult(res.result);
      setQuiz(res.quiz);
      setEnrollment(res.enrollment);
      setPhase('result');
      window.scrollTo?.({ top: 0 });
    });

  const review = () =>
    run(async () => {
      const res = await api.get(`/learn/formations/${slug}/quizzes/${quizId}/result`);
      setResult(res.result);
      setQuestions(res.questions ?? []);
      setAnswers(Object.fromEntries(res.result.corrections.map((c) => [c.questionId, { choiceIds: c.choiceIds, text: c.text }])));
      setPhase('result');
    });

  return (
    <div className="quiz-page">
      <Link to={`/catalogue/${slug}`} className="cms-back">
        <ArrowLeft className="icon-dir" size={16} strokeWidth={1.75} aria-hidden="true" />
        {t('learn.course.goToFormation')}
      </Link>
      <h1>{current.title}</h1>

      {phase === 'intro' && (
        <div className="quiz-panel">
          {summary.data.quiz.instructions && <p>{summary.data.quiz.instructions}</p>}
          <ul className="quiz-facts">
            <li>{t('quiz.facts', { count: current.questionCount, score: current.passingScore })}</li>
            {left !== null && <li>{t('quiz.attemptsLeft', { count: left })}</li>}
            {current.isRequired && <li>{t('quiz.requiredExplain')}</li>}
            {current.bestScore !== null && <li>{t('quiz.bestScore', { score: current.bestScore })}</li>}
          </ul>
          {error && (
            <p className="cms-inline-message error" role="alert">
              {error}
            </p>
          )}
          <div className="quiz-actions">
            {(openAttempt || left === null || left > 0) && (
              <Button onClick={start} disabled={busy} arrow>
                {openAttempt ? t('quiz.resume') : current.attemptsUsed > 0 ? t('quiz.retry') : t('quiz.start')}
              </Button>
            )}
            {!openAttempt && left === 0 && <p className="cms-muted">{t('quiz.noAttemptsLeft')}</p>}
            {current.attemptsUsed > 0 && (
              <Button variant="secondary" onClick={review} disabled={busy}>
                {t('quiz.seeLast')}
              </Button>
            )}
          </div>
        </div>
      )}

      {phase === 'taking' && (
        <form
          className="quiz-taking"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          {questions.map((question, index) => (
            <Question key={question.id} question={question} index={index} answer={answers[question.id]} onChange={(patch) => setAnswers((a) => ({ ...a, [question.id]: { ...a[question.id], ...patch } }))} />
          ))}
          {error && (
            <p className="cms-inline-message error" role="alert">
              {error}
            </p>
          )}
          <div className="quiz-actions">
            <p className="cms-muted" role="status">
              {t('quiz.answered', { done: answeredCount, total: questions.length })}
            </p>
            <Button type="submit" disabled={busy}>
              {busy ? t('state.sending') : t('quiz.submit')}
            </Button>
          </div>
        </form>
      )}

      {phase === 'result' && result && (
        <div className="quiz-taking">
          <div className={`quiz-result ${result.passed ? 'passed' : 'failed'}`} role="status">
            <span className="quiz-score">{result.score} %</span>
            <strong>{result.passed ? t('quiz.resultPassed') : t('quiz.resultFailed', { score: result.passingScore })}</strong>
            <span>{t('quiz.pointsEarned', { earned: result.earnedPoints, total: result.totalPoints })}</span>
            {enrollment?.certification && (
              <span className="learn-chip learn-chip-done">
                <Award size={13} strokeWidth={2} aria-hidden="true" />
                {t('quiz.certified')}
              </span>
            )}
            {!result.passed && left !== 0 && (
              <Button onClick={start} disabled={busy} variant="secondary">
                {t('quiz.retry')}
              </Button>
            )}
            {result.passed && (
              <Button to={`/catalogue/${slug}`} variant="secondary" arrow>
                {t('learn.course.goToFormation')}
              </Button>
            )}
          </div>
          {result.corrections.length === 0 && <p className="cms-muted">{t('quiz.noCorrection')}</p>}
          {questions.map((question, index) => (
            <Question key={question.id} question={question} index={index} answer={answers[question.id]} onChange={() => {}} feedback={feedbackOf(question)} />
          ))}
          <div className="quiz-actions">
            <Button variant="secondary" onClick={() => { setPhase('intro'); summary.reload(); }}>
              {t('quiz.backToQuiz')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
