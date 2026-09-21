import { useMemo, useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BookOpenText, Copy, GripVertical, Layers, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, ApiError, errorKey } from '../../../lib/api.js';
import Button from '../../../components/ui/Button.jsx';
import ConfirmDialog from '../../../components/cms/ConfirmDialog.jsx';
import EmptyState from '../../../components/cms/EmptyState.jsx';
import MoveButtons from '../../../components/cms/MoveButtons.jsx';
import CourseCard from './CourseCard.jsx';
import QuizAttach from '../../../components/quiz/QuizAttach.jsx';

// The plan of the formation: chapters, each with its lessons. Chapters and lessons are
// reordered by drag and drop (mouse, touch or keyboard: Space to lift, arrows, Space to drop),
// a lesson can be dropped into another chapter, and the arrow buttons do the same without
// any drag. The whole plan is saved in ONE request, so the plan is never half-saved.
const sid = (id) => `s:${id}`; // sortable id of a chapter
const cid = (id) => `c:${id}`; // sortable id of a lesson
const raw = (sortableId) => String(sortableId).slice(2);

// The plan as the API describes it: [{ id, courseIds }]
const planOf = (formation) =>
  formation.sections.map((s) => ({ id: s.id, courseIds: formation.courses.filter((c) => c.sectionId === s.id).map((c) => c.id) }));

// A dragged chapter can only land on another chapter (never inside a lesson list).
const collisions = (args) =>
  closestCorners(
    String(args.active.id).startsWith('s:')
      ? { ...args, droppableContainers: args.droppableContainers.filter((c) => String(c.id).startsWith('s:')) }
      : args,
  );

const samePlan = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const chapterOfLesson = (plan, lessonId) => plan.find((s) => s.courseIds.includes(lessonId));

function SortableChapter({ chapter, children, header }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sid(chapter.id) });
  const { t } = useTranslation();
  return (
    <li
      ref={setNodeRef}
      className={`cms-chapter ${isDragging ? 'dragging' : ''}`}
      style={{ transform: CSS.Translate.toString(transform), transition }}
    >
      {header({
        handle: (
          <button type="button" className="cms-grip" {...attributes} {...listeners} aria-label={t('admin.outline.dragChapter')} title={t('admin.outline.dragChapter')}>
            <GripVertical size={18} strokeWidth={1.8} aria-hidden="true" />
          </button>
        ),
      })}
      {children}
    </li>
  );
}

function SortableLesson({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cid(id) });
  const { t } = useTranslation();
  return (
    <div ref={setNodeRef} className={`cms-lesson-slot ${isDragging ? 'dragging' : ''}`} style={{ transform: CSS.Translate.toString(transform), transition }}>
      {children(
        <button type="button" className="cms-grip" {...attributes} {...listeners} aria-label={t('admin.outline.dragLesson')} title={t('admin.outline.dragLesson')}>
          <GripVertical size={18} strokeWidth={1.8} aria-hidden="true" />
        </button>,
      )}
    </div>
  );
}

function ChapterTitle({ chapter, onRename }) {
  const { t } = useTranslation();
  // The parent gives this component a new key when the saved title changes: no effect needed.
  const [value, setValue] = useState(chapter.title);
  const commit = () => {
    const title = value.trim();
    if (!title) return setValue(chapter.title);
    if (title !== chapter.title) onRename(chapter, title);
    return undefined;
  };
  return (
    <input
      type="text"
      className="cms-chapter-title"
      maxLength={150}
      value={value}
      aria-label={t('admin.outline.chapterTitle')}
      onChange={(event) => setValue(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur();
      }}
    />
  );
}

export default function OutlineStep({ formation, onChanged, onDirtyChange }) {
  const { t } = useTranslation();
  const [plan, setPlan] = useState(() => planOf(formation));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [newChapter, setNewChapter] = useState('');
  const [firstLesson, setFirstLesson] = useState('');
  const [newLesson, setNewLesson] = useState({}); // chapterId -> title being typed
  const [toDelete, setToDelete] = useState(null); // { type: 'lesson' | 'chapter', item }
  const [deleting, setDeleting] = useState(false);

  // The server's version is the truth: whenever the formation is reloaded, the plan follows.
  const serverPlan = useMemo(() => planOf(formation), [formation]);
  const [syncedWith, setSyncedWith] = useState(serverPlan);
  if (syncedWith !== serverPlan) {
    setSyncedWith(serverPlan);
    setPlan(serverPlan);
  }

  const lessons = useMemo(() => new Map(formation.courses.map((c) => [c.id, c])), [formation.courses]);
  const chapters = useMemo(() => new Map(formation.sections.map((s) => [s.id, s])), [formation.sections]);
  const flatIds = plan.flatMap((s) => s.courseIds);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const persist = async (next) => {
    if (samePlan(next, serverPlan)) return;
    setBusy(true);
    setError(null);
    try {
      await api.put(`/admin/formations/${formation.id}/outline`, { sections: next });
      await onChanged();
    } catch (err) {
      setPlan(serverPlan);
      setError(t(errorKey(err)));
    } finally {
      setBusy(false);
    }
  };

  // ---- drag and drop ---------------------------------------------------------------
  const findContainer = (id) => {
    if (String(id).startsWith('s:')) return plan.find((s) => sid(s.id) === id);
    return chapterOfLesson(plan, raw(id));
  };

  const onDragOver = ({ active, over }) => {
    if (!over || !String(active.id).startsWith('c:')) return;
    const from = findContainer(active.id);
    const to = findContainer(over.id);
    if (!from || !to || from.id === to.id) return;
    setPlan((current) => {
      const lessonId = raw(active.id);
      const overIsLesson = String(over.id).startsWith('c:');
      const target = current.find((s) => s.id === to.id);
      const index = overIsLesson ? target.courseIds.indexOf(raw(over.id)) : target.courseIds.length;
      return current.map((s) => {
        if (s.id === from.id) return { ...s, courseIds: s.courseIds.filter((id) => id !== lessonId) };
        if (s.id === to.id) {
          const ids = [...s.courseIds];
          ids.splice(index < 0 ? ids.length : index, 0, lessonId);
          return { ...s, courseIds: ids };
        }
        return s;
      });
    });
  };

  const onDragEnd = ({ active, over }) => {
    if (!over) return setPlan(serverPlan);
    let next = plan;
    if (String(active.id).startsWith('s:')) {
      const from = plan.findIndex((s) => sid(s.id) === active.id);
      const to = plan.findIndex((s) => sid(s.id) === over.id);
      if (from >= 0 && to >= 0 && from !== to) next = arrayMove(plan, from, to);
    } else {
      const container = chapterOfLesson(plan, raw(active.id));
      const overIsLesson = String(over.id).startsWith('c:');
      if (container && overIsLesson && container.courseIds.includes(raw(over.id))) {
        const from = container.courseIds.indexOf(raw(active.id));
        const to = container.courseIds.indexOf(raw(over.id));
        if (from !== to) next = plan.map((s) => (s.id === container.id ? { ...s, courseIds: arrayMove(s.courseIds, from, to) } : s));
      }
    }
    setPlan(next);
    return persist(next);
  };

  // ---- buttons (the same operations without dragging) ---------------------------------
  const moveChapter = (from, to) => {
    if (to < 0 || to >= plan.length) return;
    const next = arrayMove(plan, from, to);
    setPlan(next);
    persist(next);
  };

  // One step up or down in the reading order; crossing the edge of a chapter enters the neighbour.
  const moveLesson = (lessonId, direction) => {
    const next = plan.map((s) => ({ ...s, courseIds: [...s.courseIds] }));
    const at = next.findIndex((s) => s.courseIds.includes(lessonId));
    const inside = next[at].courseIds.indexOf(lessonId);
    next[at].courseIds.splice(inside, 1);
    if (direction < 0) {
      if (inside > 0) next[at].courseIds.splice(inside - 1, 0, lessonId);
      else if (at > 0) next[at - 1].courseIds.push(lessonId);
      else next[at].courseIds.unshift(lessonId);
    } else if (inside < next[at].courseIds.length) {
      next[at].courseIds.splice(inside + 1, 0, lessonId);
    } else if (at < next.length - 1) {
      next[at + 1].courseIds.unshift(lessonId);
    } else {
      next[at].courseIds.push(lessonId);
    }
    setPlan(next);
    persist(next);
  };

  // ---- create / rename / delete ----------------------------------------------------------
  const guarded = async (action) => {
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(t(errorKey(err)));
    }
  };

  const addChapter = (event) => {
    event.preventDefault();
    if (!newChapter.trim()) return undefined;
    return guarded(async () => {
      await api.post(`/admin/formations/${formation.id}/sections`, { title: newChapter });
      setNewChapter('');
      await onChanged();
    });
  };

  const addFirstLesson = (event) => {
    event.preventDefault();
    if (!firstLesson.trim()) return undefined;
    return guarded(async () => {
      const { course } = await api.post(`/admin/formations/${formation.id}/courses`, { title: firstLesson });
      setFirstLesson('');
      await onChanged();
      setOpenId(course.id);
    });
  };

  const addLesson = (event, chapter) => {
    event.preventDefault();
    const title = (newLesson[chapter.id] ?? '').trim();
    if (!title) return undefined;
    return guarded(async () => {
      const { course } = await api.post(`/admin/formations/${formation.id}/courses`, { title, sectionId: chapter.id });
      setNewLesson((current) => ({ ...current, [chapter.id]: '' }));
      await onChanged();
      setOpenId(course.id);
    });
  };

  const rename = (chapter, title) => guarded(async () => {
    await api.patch(`/admin/sections/${chapter.id}`, { title });
    await onChanged();
  });

  const duplicateChapter = (chapter) => guarded(async () => {
    await api.post(`/admin/sections/${chapter.id}/duplicate`);
    await onChanged();
  });

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      if (toDelete.type === 'lesson') {
        await api.delete(`/admin/courses/${toDelete.item.id}`);
        onDirtyChange(toDelete.item.id, false);
      } else {
        await api.delete(`/admin/sections/${toDelete.item.id}`);
      }
      setToDelete(null);
      await onChanged();
    } catch (err) {
      setError(err instanceof ApiError && err.status === 409 ? t('admin.outline.chapterNotEmpty') : t(errorKey(err)));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const announcements = {
    onDragStart: ({ active }) => t('admin.outline.announce.start', { name: label(active.id) }),
    onDragOver: ({ over }) => (over ? t('admin.outline.announce.over', { name: label(over.id) }) : undefined),
    onDragEnd: ({ active, over }) => (over ? t('admin.outline.announce.end', { name: label(active.id), target: label(over.id) }) : t('admin.outline.announce.cancel')),
    onDragCancel: () => t('admin.outline.announce.cancel'),
  };
  function label(sortableId) {
    const id = raw(sortableId);
    return (String(sortableId).startsWith('s:') ? chapters.get(id)?.title : lessons.get(id)?.title) ?? '';
  }

  return (
    <div className="cms-form">
      <p className="cms-intro">{t('admin.outline.intro')}</p>

      {plan.length === 0 ? (
        <>
          <EmptyState icon={BookOpenText} title={t('admin.outline.empty')} />
          {/* The first lesson creates "Chapitre 1" by itself: nobody has to understand chapters to start. */}
          <form className="cms-add-row" onSubmit={addFirstLesson}>
            <label htmlFor="new-course-title" className="sr-only">
              {t('admin.courses.addLabel')}
            </label>
            <input
              id="new-course-title"
              type="text"
              maxLength={150}
              value={firstLesson}
              placeholder={t('admin.courses.addPlaceholder')}
              onChange={(event) => setFirstLesson(event.target.value)}
            />
            <Button type="submit" disabled={!firstLesson.trim()}>
              <Plus size={16} strokeWidth={2} aria-hidden="true" />
              {t('admin.courses.add')}
            </Button>
          </form>
        </>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={collisions}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
          onDragCancel={() => setPlan(serverPlan)}
          accessibility={{ announcements, screenReaderInstructions: { draggable: t('admin.outline.instructions') } }}
        >
          <SortableContext items={plan.map((s) => sid(s.id))} strategy={verticalListSortingStrategy}>
            <ol className="cms-chapter-list" aria-busy={busy}>
              {plan.map((section, chapterIndex) => {
                const chapter = chapters.get(section.id);
                if (!chapter) return null;
                return (
                  <SortableChapter
                    key={section.id}
                    chapter={chapter}
                    header={({ handle }) => (
                      <div className="cms-chapter-head">
                        {handle}
                        <Layers size={18} strokeWidth={1.7} aria-hidden="true" className="cms-chapter-icon" />
                        <ChapterTitle key={chapter.title} chapter={chapter} onRename={rename} />
                        <span className="cms-muted">{t('admin.outline.lessonCount', { count: section.courseIds.length })}</span>
                        <MoveButtons
                          index={chapterIndex}
                          count={plan.length}
                          onMove={moveChapter}
                          upLabel={t('admin.outline.chapterUp')}
                          downLabel={t('admin.outline.chapterDown')}
                          disabled={busy}
                        />
                        <button
                          type="button"
                          className="cms-icon-button"
                          onClick={() => duplicateChapter(chapter)}
                          aria-label={`${t('admin.outline.duplicateChapter')} : ${chapter.title}`}
                          title={t('admin.outline.duplicateChapter')}
                        >
                          <Copy size={16} strokeWidth={1.75} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="cms-icon-button danger"
                          onClick={() => setToDelete({ type: 'chapter', item: chapter })}
                          aria-label={`${t('admin.outline.deleteChapter')} : ${chapter.title}`}
                          title={t('admin.outline.deleteChapter')}
                        >
                          <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  >
                    <SortableContext items={section.courseIds.map(cid)} strategy={verticalListSortingStrategy}>
                      <div className="cms-course-list" role="list">
                        {section.courseIds.length === 0 && <p className="cms-muted cms-chapter-empty">{t('admin.outline.chapterEmpty')}</p>}
                        {section.courseIds.map((lessonId) => {
                          const course = lessons.get(lessonId);
                          if (!course) return null;
                          const index = flatIds.indexOf(lessonId);
                          return (
                            <SortableLesson key={lessonId} id={lessonId}>
                              {(handle) => (
                                <CourseCard
                                  formation={formation}
                                  course={course}
                                  index={index}
                                  count={flatIds.length}
                                  open={openId === course.id}
                                  dragHandle={handle}
                                  onToggle={() => setOpenId(openId === course.id ? null : course.id)}
                                  onMove={(from, to) => moveLesson(course.id, to > from ? 1 : -1)}
                                  onDelete={() => setToDelete({ type: 'lesson', item: course })}
                                  onChanged={onChanged}
                                  onDirtyChange={onDirtyChange}
                                />
                              )}
                            </SortableLesson>
                          );
                        })}
                      </div>
                    </SortableContext>
                    <form className="cms-add-row cms-chapter-add" onSubmit={(event) => addLesson(event, chapter)}>
                      <label htmlFor={`new-lesson-${chapter.id}`} className="sr-only">
                        {t('admin.outline.addLessonLabel', { chapter: chapter.title })}
                      </label>
                      <input
                        id={`new-lesson-${chapter.id}`}
                        type="text"
                        maxLength={150}
                        value={newLesson[chapter.id] ?? ''}
                        placeholder={t('admin.outline.addLessonPlaceholder')}
                        onChange={(event) => setNewLesson((current) => ({ ...current, [chapter.id]: event.target.value }))}
                      />
                      <Button type="submit" variant="secondary" disabled={!(newLesson[chapter.id] ?? '').trim()}>
                        <Plus size={16} strokeWidth={2} aria-hidden="true" />
                        {t('admin.outline.addLesson')}
                      </Button>
                    </form>
                    <QuizAttach formation={formation} scope="section" sectionId={chapter.id} onChanged={onChanged} />
                  </SortableChapter>
                );
              })}
            </ol>
          </SortableContext>
        </DndContext>
      )}

      <section className="cms-card" aria-labelledby="final-quiz-title">
        <h2 id="final-quiz-title">{t('admin.quiz.finalTitle')}</h2>
        <p className="cms-muted">{t('admin.quiz.finalHint')}</p>
        <QuizAttach formation={formation} scope="formation" onChanged={onChanged} />
      </section>

      <form className="cms-add-row" onSubmit={addChapter}>
        <label htmlFor="new-chapter-title" className="sr-only">
          {t('admin.outline.addChapterLabel')}
        </label>
        <input
          id="new-chapter-title"
          type="text"
          maxLength={150}
          value={newChapter}
          placeholder={t('admin.outline.addChapterPlaceholder')}
          onChange={(event) => setNewChapter(event.target.value)}
        />
        <Button type="submit" disabled={!newChapter.trim()}>
          <Plus size={16} strokeWidth={2} aria-hidden="true" />
          {t('admin.outline.addChapter')}
        </Button>
      </form>
      {error && (
        <p className="form-status form-status-error" role="alert">
          {error}
        </p>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={toDelete?.type === 'chapter' ? t('admin.outline.deleteChapterTitle') : t('admin.courses.deleteConfirmTitle')}
        confirmLabel={t('admin.courses.deleteConfirm')}
        danger
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      >
        <p>
          {toDelete?.type === 'chapter'
            ? t('admin.outline.deleteChapterBody', { title: toDelete.item.title })
            : t('admin.courses.deleteConfirmBody', { title: toDelete?.item.title ?? '' })}
        </p>
      </ConfirmDialog>
    </div>
  );
}
