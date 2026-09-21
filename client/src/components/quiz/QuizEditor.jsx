import { useCallback, useEffect, useState } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CircleCheck, GripVertical, ListChecks, Plus, TextCursorInput, ToggleLeft, Trash2, CircleDot, SquareCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, errorKey } from '../../lib/api.js';
import Button from '../ui/Button.jsx';
import ErrorState from '../ui/ErrorState.jsx';
import LoadingState from '../ui/LoadingState.jsx';
import ConfirmDialog from '../cms/ConfirmDialog.jsx';
import Field from '../cms/Field.jsx';
import LinesInput from '../cms/LinesInput.jsx';
import './Quiz.css';

// Editor of ONE quiz: its settings, then its questions (four types), reordered by drag and drop.
// Every question is saved on its own with its own button and tells what is still missing; a quiz
// that is not complete is never shown to learners and blocks the publication of the formation.

const TYPES = [
  { type: 'single', icon: CircleDot },
  { type: 'multiple', icon: SquareCheck },
  { type: 'true_false', icon: ToggleLeft },
  { type: 'text', icon: TextCursorInput },
];
const ICON = Object.fromEntries(TYPES.map((x) => [x.type, x.icon]));

const toDraft = (q) => ({
  prompt: q.prompt,
  explanation: q.explanation,
  points: q.points,
  choices: q.choices.map((c) => ({ id: c.id, text: c.text, isCorrect: c.isCorrect })),
  correctTrue: q.type === 'true_false' ? Boolean(q.choices.find((c) => c.text === 'true')?.isCorrect) : true,
  acceptedAnswers: q.acceptedAnswers,
});

function QuestionCard({ question, index, onSaved, onDelete }) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question.id });
  const [saved, setSaved] = useState(() => toDraft(question));
  const [draft, setDraft] = useState(() => toDraft(question));
  const [problems, setProblems] = useState(question.problems);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const Icon = ICON[question.type];
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const set = (patch) => {
    setMessage(null);
    setDraft((d) => ({ ...d, ...patch }));
  };
  const id = `q-${question.id}`;

  const save = async () => {
    setSaving(true);
    setMessage(null);
    const body = { prompt: draft.prompt, explanation: draft.explanation, points: Number(draft.points) || 1 };
    if (question.type === 'text') body.acceptedAnswers = draft.acceptedAnswers;
    else if (question.type === 'true_false') body.correctTrue = draft.correctTrue;
    else body.choices = draft.choices;
    try {
      const res = await api.patch(`/admin/questions/${question.id}`, body);
      const next = toDraft(res.question);
      setSaved(next);
      setDraft(next);
      setProblems(res.question.problems);
      setMessage({ type: 'ok', text: t('admin.quiz.question.saved') });
      onSaved(res.isComplete);
    } catch (err) {
      setMessage({ type: 'error', text: t(errorKey(err)) });
    } finally {
      setSaving(false);
    }
  };

  const setChoice = (i, patch) => set({ choices: draft.choices.map((c, j) => (j === i ? { ...c, ...patch } : c)) });
  const markCorrect = (i, checked) =>
    set({ choices: draft.choices.map((c, j) => (question.type === 'single' ? { ...c, isCorrect: j === i } : j === i ? { ...c, isCorrect: checked } : c)) });

  return (
    <li ref={setNodeRef} className={`quiz-question ${isDragging ? 'dragging' : ''}`} style={{ transform: CSS.Translate.toString(transform), transition }}>
      <div className="quiz-question-head">
        <button type="button" className="cms-grip" {...attributes} {...listeners} aria-label={t('admin.quiz.question.drag')} title={t('admin.quiz.question.drag')}>
          <GripVertical size={18} strokeWidth={1.8} aria-hidden="true" />
        </button>
        <span className="quiz-question-number" aria-hidden="true">
          {index + 1}
        </span>
        <Icon size={16} strokeWidth={1.8} aria-hidden="true" className="cms-block-icon" />
        <strong>{t(`admin.quiz.types.${question.type}`)}</strong>
        {problems.length > 0 ? (
          <span className="dash-missing" title={problems.map((p) => t(`admin.quiz.problems.${p}`)).join(', ')}>
            {t('admin.quiz.question.incomplete')}
          </span>
        ) : (
          <span className="quiz-ok">
            <CircleCheck size={15} strokeWidth={2} aria-hidden="true" /> {t('admin.quiz.question.complete')}
          </span>
        )}
        <span className="cms-block-actions">
          <button type="button" className="cms-icon-button danger" onClick={onDelete} aria-label={`${t('admin.quiz.question.delete')} ${index + 1}`} title={t('admin.quiz.question.delete')}>
            <Trash2 size={16} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </span>
      </div>

      <div className="quiz-question-body">
        {problems.length > 0 && (
          <ul className="quiz-problems">
            {problems.map((p) => (
              <li key={p}>{t(`admin.quiz.problems.${p}`)}</li>
            ))}
          </ul>
        )}
        <Field label={t('admin.quiz.question.prompt')} htmlFor={`${id}-prompt`}>
          <textarea id={`${id}-prompt`} rows={2} maxLength={1000} value={draft.prompt} onChange={(e) => set({ prompt: e.target.value })} />
        </Field>

        {(question.type === 'single' || question.type === 'multiple') && (
          <fieldset className="quiz-choices">
            <legend>{t(question.type === 'single' ? 'admin.quiz.question.choicesSingle' : 'admin.quiz.question.choicesMultiple')}</legend>
            {draft.choices.map((choice, i) => (
              <div key={choice.id ?? `new-${i}`} className="quiz-choice">
                <input
                  type={question.type === 'single' ? 'radio' : 'checkbox'}
                  name={`${id}-correct`}
                  checked={choice.isCorrect}
                  onChange={(e) => markCorrect(i, e.target.checked)}
                  aria-label={t('admin.quiz.question.markCorrect', { n: i + 1 })}
                />
                <input type="text" maxLength={300} value={choice.text} placeholder={t('admin.quiz.question.choicePlaceholder', { n: i + 1 })} aria-label={t('admin.quiz.question.choiceText', { n: i + 1 })} onChange={(e) => setChoice(i, { text: e.target.value })} />
                <button type="button" className="cms-icon-button danger" disabled={draft.choices.length <= 2} onClick={() => set({ choices: draft.choices.filter((_, j) => j !== i) })} aria-label={t('admin.quiz.question.removeChoice', { n: i + 1 })} title={t('admin.quiz.question.removeChoiceShort')}>
                  <Trash2 size={15} strokeWidth={1.8} aria-hidden="true" />
                </button>
              </div>
            ))}
            <Button variant="secondary" onClick={() => set({ choices: [...draft.choices, { text: '', isCorrect: false }] })} disabled={draft.choices.length >= 10}>
              <Plus size={16} strokeWidth={2} aria-hidden="true" />
              {t('admin.quiz.question.addChoice')}
            </Button>
          </fieldset>
        )}

        {question.type === 'true_false' && (
          <fieldset className="quiz-choices">
            <legend>{t('admin.quiz.question.rightAnswer')}</legend>
            {[true, false].map((value) => (
              <label key={String(value)} className="cms-check">
                <input type="radio" name={`${id}-tf`} checked={draft.correctTrue === value} onChange={() => set({ correctTrue: value })} />
                {t(value ? 'admin.quiz.question.true' : 'admin.quiz.question.false')}
              </label>
            ))}
          </fieldset>
        )}

        {question.type === 'text' && (
          <Field label={t('admin.quiz.question.accepted')} htmlFor={`${id}-accepted`} hint={t('admin.quiz.question.acceptedHint')}>
            <LinesInput id={`${id}-accepted`} value={draft.acceptedAnswers} onChange={(v) => set({ acceptedAnswers: v })} max={10} placeholder={t('admin.quiz.question.acceptedPlaceholder')} describedBy={`${id}-accepted-hint`} />
          </Field>
        )}

        <div className="quiz-question-options">
          <Field label={t('admin.quiz.question.points')} htmlFor={`${id}-points`}>
            <input id={`${id}-points`} type="number" min="1" max="100" inputMode="numeric" value={draft.points} onChange={(e) => set({ points: e.target.value })} />
          </Field>
          <Field label={t('admin.quiz.question.explanation')} htmlFor={`${id}-explanation`} hint={t('admin.quiz.question.explanationHint')}>
            <textarea id={`${id}-explanation`} rows={2} maxLength={1000} value={draft.explanation} onChange={(e) => set({ explanation: e.target.value })} aria-describedby={`${id}-explanation-hint`} />
          </Field>
        </div>

        <div className="cms-course-actions">
          {message && (
            <p className={`cms-inline-message ${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>
              {message.text}
            </p>
          )}
          <Button variant="secondary" onClick={() => setDraft(saved)} disabled={!dirty || saving}>
            {t('admin.save.discard')}
          </Button>
          <Button onClick={save} disabled={!dirty || saving}>
            {saving ? t('admin.save.saving') : t('admin.quiz.question.save')}
          </Button>
        </div>
      </div>
    </li>
  );
}

export default function QuizEditor({ quizId, onChanged, onDeleted }) {
  const { t } = useTranslation();
  const [state, setState] = useState({ status: 'loading', quiz: null });
  const [settings, setSettings] = useState(null);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toDelete, setToDelete] = useState(null); // { type: 'quiz' | 'question', id }
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const toSettings = (q) => ({
    title: q.title,
    instructions: q.instructions,
    passingScore: q.passingScore,
    maxAttempts: q.maxAttempts ?? '',
    shuffleQuestions: q.shuffleQuestions,
    isRequired: q.isRequired,
    showCorrection: q.showCorrection,
  });

  useEffect(() => {
    const controller = new AbortController();
    api
      .get(`/admin/quizzes/${quizId}`, { signal: controller.signal })
      .then(({ quiz }) => {
        setState({ status: 'ready', quiz });
        setSettings(toSettings(quiz));
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setState({ status: 'error', quiz: null });
      });
    return () => controller.abort();
  }, [quizId, attempt]);

  const guarded = useCallback(
    async (action) => {
      setError(null);
      try {
        return await action();
      } catch (err) {
        setError(t(errorKey(err)));
        return undefined;
      }
    },
    [t],
  );

  if (state.status === 'loading') return <LoadingState />;
  if (state.status === 'error') return <ErrorState message={t('admin.quiz.loadError')} onRetry={() => { setState({ status: 'loading', quiz: null }); setAttempt((n) => n + 1); }} />;

  const { quiz } = state;
  const setQuiz = (patch) => setState((s) => ({ status: 'ready', quiz: { ...s.quiz, ...patch } }));
  const dirty = JSON.stringify(settings) !== JSON.stringify(toSettings(quiz));
  const setField = (patch) => {
    setMessage(null);
    setSettings((s) => ({ ...s, ...patch }));
  };

  const saveSettings = async () => {
    if (!settings.title.trim()) {
      setMessage({ type: 'error', text: t('admin.quiz.titleRequired') });
      return;
    }
    setSaving(true);
    setMessage(null);
    await guarded(async () => {
      const { quiz: updated } = await api.patch(`/admin/quizzes/${quiz.id}`, {
        title: settings.title,
        instructions: settings.instructions,
        passingScore: Number(settings.passingScore),
        maxAttempts: settings.maxAttempts === '' ? null : Number(settings.maxAttempts),
        shuffleQuestions: settings.shuffleQuestions,
        isRequired: settings.isRequired,
        showCorrection: settings.showCorrection,
      });
      setQuiz(updated);
      setSettings(toSettings(updated));
      setMessage({ type: 'ok', text: t('admin.quiz.saved') });
      onChanged?.();
    });
    setSaving(false);
  };

  const addQuestion = (type) =>
    guarded(async () => {
      const { question } = await api.post(`/admin/quizzes/${quiz.id}/questions`, { type });
      setQuiz({ questions: [...quiz.questions, question], isComplete: false });
      onChanged?.();
    });

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const from = quiz.questions.findIndex((q) => q.id === active.id);
    const to = quiz.questions.findIndex((q) => q.id === over.id);
    const next = arrayMove(quiz.questions, from, to);
    setQuiz({ questions: next });
    guarded(() => api.put(`/admin/quizzes/${quiz.id}/questions/order`, { questionIds: next.map((q) => q.id) }));
  };

  const confirmDelete = async () => {
    setBusy(true);
    await guarded(async () => {
      if (toDelete.type === 'quiz') {
        await api.delete(`/admin/quizzes/${quiz.id}`);
        onDeleted?.();
      } else {
        await api.delete(`/admin/questions/${toDelete.id}`);
        setQuiz({ questions: quiz.questions.filter((q) => q.id !== toDelete.id) });
        // The server knows whether what is left is complete.
        const fresh = await api.get(`/admin/quizzes/${quiz.id}`);
        setQuiz({ isComplete: fresh.quiz.isComplete });
        onChanged?.();
      }
    });
    setToDelete(null);
    setBusy(false);
  };

  const markComplete = (isComplete) => {
    setQuiz({ isComplete });
    onChanged?.();
  };

  return (
    <div className="quiz-editor">
      <div className="quiz-summary" role="status">
        <ListChecks size={18} strokeWidth={1.8} aria-hidden="true" />
        {quiz.isComplete ? (
          <span className="quiz-ok">{t('admin.quiz.complete', { count: quiz.questions.length })}</span>
        ) : (
          <span className="dash-missing">{quiz.questions.length === 0 ? t('admin.quiz.problems.noQuestions') : t('admin.quiz.notComplete')}</span>
        )}
      </div>

      <fieldset className="cms-fieldset">
        <legend>{t('admin.quiz.settings')}</legend>
        <Field label={t('admin.quiz.title')} htmlFor={`quiz-title-${quiz.id}`}>
          <input id={`quiz-title-${quiz.id}`} type="text" maxLength={150} value={settings.title} onChange={(e) => setField({ title: e.target.value })} />
        </Field>
        <Field label={t('admin.quiz.instructions')} htmlFor={`quiz-instructions-${quiz.id}`} hint={t('admin.quiz.instructionsHint')}>
          <textarea id={`quiz-instructions-${quiz.id}`} rows={2} maxLength={1000} value={settings.instructions} onChange={(e) => setField({ instructions: e.target.value })} aria-describedby={`quiz-instructions-${quiz.id}-hint`} />
        </Field>
        <div className="quiz-question-options">
          <Field label={t('admin.quiz.passingScore')} htmlFor={`quiz-pass-${quiz.id}`} hint={t('admin.quiz.passingScoreHint')}>
            <input id={`quiz-pass-${quiz.id}`} type="number" min="0" max="100" inputMode="numeric" value={settings.passingScore} onChange={(e) => setField({ passingScore: e.target.value })} aria-describedby={`quiz-pass-${quiz.id}-hint`} />
          </Field>
          <Field label={t('admin.quiz.maxAttempts')} htmlFor={`quiz-attempts-${quiz.id}`} hint={t('admin.quiz.maxAttemptsHint')}>
            <input id={`quiz-attempts-${quiz.id}`} type="number" min="1" max="50" inputMode="numeric" value={settings.maxAttempts} placeholder={t('admin.quiz.unlimited')} onChange={(e) => setField({ maxAttempts: e.target.value })} aria-describedby={`quiz-attempts-${quiz.id}-hint`} />
          </Field>
        </div>
        <label className="cms-check">
          <input type="checkbox" checked={settings.isRequired} onChange={(e) => setField({ isRequired: e.target.checked })} />
          <span>
            {t('admin.quiz.required')}
            <small className="form-hint">{t('admin.quiz.requiredHint')}</small>
          </span>
        </label>
        <label className="cms-check">
          <input type="checkbox" checked={settings.showCorrection} onChange={(e) => setField({ showCorrection: e.target.checked })} />
          <span>
            {t('admin.quiz.showCorrection')}
            <small className="form-hint">{t('admin.quiz.showCorrectionHint')}</small>
          </span>
        </label>
        <label className="cms-check">
          <input type="checkbox" checked={settings.shuffleQuestions} onChange={(e) => setField({ shuffleQuestions: e.target.checked })} />
          {t('admin.quiz.shuffle')}
        </label>
        <div className="cms-course-actions">
          {message && (
            <p className={`cms-inline-message ${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>
              {message.text}
            </p>
          )}
          <Button variant="secondary" onClick={() => setSettings(toSettings(quiz))} disabled={!dirty || saving}>
            {t('admin.save.discard')}
          </Button>
          <Button onClick={saveSettings} disabled={!dirty || saving}>
            {saving ? t('admin.save.saving') : t('admin.quiz.saveSettings')}
          </Button>
        </div>
      </fieldset>

      <h3 className="quiz-editor-title">{t('admin.quiz.questions')}</h3>
      {quiz.questions.length === 0 && <p className="cms-muted">{t('admin.quiz.noQuestions')}</p>}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} accessibility={{ screenReaderInstructions: { draggable: t('admin.quiz.instructionsDrag') } }}>
        <SortableContext items={quiz.questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
          <ol className="quiz-question-list">
            {quiz.questions.map((question, index) => (
              <QuestionCard key={question.id} question={question} index={index} onSaved={markComplete} onDelete={() => setToDelete({ type: 'question', id: question.id })} />
            ))}
          </ol>
        </SortableContext>
      </DndContext>

      <p className="cms-muted">{t('admin.quiz.addQuestion')}</p>
      <div className="cms-palette" role="group" aria-label={t('admin.quiz.addQuestion')}>
        {TYPES.map(({ type, icon: Icon }) => (
          <button key={type} type="button" className="cms-palette-button" onClick={() => addQuestion(type)}>
            <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
            {t(`admin.quiz.types.${type}`)}
          </button>
        ))}
      </div>

      {error && (
        <p className="cms-inline-message error" role="alert">
          {error}
        </p>
      )}

      <div className="quiz-danger">
        <Button variant="secondary" className="btn-danger-outline" onClick={() => setToDelete({ type: 'quiz' })}>
          <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
          {t('admin.quiz.delete')}
        </Button>
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={toDelete?.type === 'quiz' ? t('admin.quiz.deleteTitle') : t('admin.quiz.question.deleteTitle')}
        confirmLabel={t('admin.courses.deleteConfirm')}
        danger
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      >
        <p>{toDelete?.type === 'quiz' ? t('admin.quiz.deleteBody') : t('admin.quiz.question.deleteBody')}</p>
      </ConfirmDialog>
    </div>
  );
}
