import { useState } from 'react';
import { ListChecks, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, errorKey } from '../../lib/api.js';
import Button from '../ui/Button.jsx';
import QuizEditor from './QuizEditor.jsx';
import './Quiz.css';

// "Quiz" area of a lesson, of a chapter or of the end of the formation: add one, or open the
// one that exists to edit it. `formation.quizzes` (from the API) says which targets have one.
export default function QuizAttach({ formation, scope, courseId, sectionId, onChanged }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const quiz = (formation.quizzes ?? []).find(
    (q) => q.scope === scope && (scope === 'course' ? q.courseId === courseId : scope === 'section' ? q.sectionId === sectionId : true),
  );

  const create = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.post(`/admin/formations/${formation.id}/quizzes`, {
        title: t(`admin.quiz.defaultTitle.${scope}`),
        scope,
        ...(scope === 'course' ? { courseId } : {}),
        ...(scope === 'section' ? { sectionId } : {}),
      });
      await onChanged();
      setOpen(true);
    } catch (err) {
      setError(t(errorKey(err)));
    } finally {
      setBusy(false);
    }
  };

  if (!quiz) {
    return (
      <div className="quiz-attach">
        <Button variant="secondary" onClick={create} disabled={busy}>
          <Plus size={16} strokeWidth={2} aria-hidden="true" />
          {t(`admin.quiz.add.${scope}`)}
        </Button>
        {error && (
          <p className="cms-inline-message error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="quiz-attach">
      <div className="quiz-attach-row">
        <ListChecks size={18} strokeWidth={1.8} aria-hidden="true" className="cms-block-icon" />
        <strong>{quiz.title}</strong>
        <span className="cms-muted">{t('admin.quiz.rowInfo', { questions: quiz.questionCount, points: quiz.totalPoints })}</span>
        {quiz.isRequired && <span className="learn-chip">{t('admin.quiz.requiredBadge')}</span>}
        {quiz.isComplete ? <span className="quiz-ok">{t('admin.quiz.question.complete')}</span> : <span className="dash-missing">{t('admin.quiz.question.incomplete')}</span>}
        <Button variant="secondary" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          {open ? t('admin.quiz.close') : t('admin.quiz.edit')}
        </Button>
      </div>
      {open && (
        <QuizEditor
          quizId={quiz.id}
          onChanged={onChanged}
          onDeleted={() => {
            setOpen(false);
            onChanged();
          }}
        />
      )}
    </div>
  );
}
