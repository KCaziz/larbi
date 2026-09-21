import { CircleCheck, ListChecks } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button.jsx';
import './Quiz.css';

// A quiz announced on a lesson page or on the formation page. `quiz` = summary from the API
// (what it is and how this learner is doing: never the questions).
export default function QuizCard({ quiz, slug, canOpen }) {
  const { t } = useTranslation();
  const left = quiz.maxAttempts === null ? null : Math.max(0, quiz.maxAttempts - quiz.attemptsUsed);
  return (
    <section className="quiz-card" aria-label={quiz.title}>
      <ListChecks size={22} strokeWidth={1.7} aria-hidden="true" className="cms-block-icon" />
      <span className="quiz-card-text">
        <strong>{quiz.title}</strong>
        <small>
          {t('quiz.facts', { count: quiz.questionCount, score: quiz.passingScore })}
          {left !== null ? ` · ${t('quiz.attemptsLeft', { count: left })}` : ''}
        </small>
      </span>
      {quiz.isRequired && <span className="learn-chip">{t('quiz.required')}</span>}
      {quiz.passed && (
        <span className="learn-chip learn-chip-done">
          <CircleCheck size={13} strokeWidth={2} aria-hidden="true" />
          {t('quiz.passed', { score: quiz.bestScore })}
        </span>
      )}
      {!quiz.passed && quiz.bestScore !== null && <span className="learn-chip">{t('quiz.bestScore', { score: quiz.bestScore })}</span>}
      {canOpen && (
        <Button to={`/catalogue/${slug}/quiz/${quiz.id}`} variant={quiz.passed ? 'secondary' : 'primary'} arrow>
          {quiz.attemptsUsed > 0 ? t('quiz.open') : t('quiz.start')}
        </Button>
      )}
    </section>
  );
}
