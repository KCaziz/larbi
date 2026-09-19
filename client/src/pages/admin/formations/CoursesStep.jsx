import { useState } from 'react';
import { BookOpenText, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, errorKey } from '../../../lib/api.js';
import Button from '../../../components/ui/Button.jsx';
import ConfirmDialog from '../../../components/cms/ConfirmDialog.jsx';
import EmptyState from '../../../components/cms/EmptyState.jsx';
import CourseCard from './CourseCard.jsx';

export default function CoursesStep({ formation, onChanged, onDirtyChange }) {
  const { t } = useTranslation();
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const courses = formation.courses;

  const addCourse = async (event) => {
    event?.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const { course } = await api.post(`/admin/formations/${formation.id}/courses`, { title: newTitle });
      setNewTitle('');
      await onChanged();
      setOpenId(course.id);
    } catch (err) {
      setError(t(errorKey(err)));
    } finally {
      setAdding(false);
    }
  };

  const move = async (from, to) => {
    if (to < 0 || to >= courses.length) return;
    const ids = courses.map((c) => c.id);
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    setError(null);
    try {
      await api.put(`/admin/formations/${formation.id}/courses/order`, { courseIds: ids });
      await onChanged();
    } catch (err) {
      setError(t(errorKey(err)));
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/admin/courses/${toDelete.id}`);
      onDirtyChange(toDelete.id, false);
      setToDelete(null);
      await onChanged();
    } catch (err) {
      setError(t(errorKey(err)));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="cms-form">
      <p className="cms-intro">{t('admin.courses.intro')}</p>

      {courses.length === 0 ? (
        <EmptyState icon={BookOpenText} title={t('admin.courses.empty')} />
      ) : (
        <ol className="cms-course-list">
          {courses.map((course, index) => (
            <CourseCard
              key={course.id}
              course={course}
              index={index}
              count={courses.length}
              open={openId === course.id}
              onToggle={() => setOpenId(openId === course.id ? null : course.id)}
              onMove={move}
              onDelete={() => setToDelete(course)}
              onChanged={onChanged}
              onDirtyChange={onDirtyChange}
            />
          ))}
        </ol>
      )}

      <form className="cms-add-row" onSubmit={addCourse}>
        <label htmlFor="new-course-title" className="sr-only">
          {t('admin.courses.addLabel')}
        </label>
        <input
          id="new-course-title"
          type="text"
          maxLength={150}
          value={newTitle}
          placeholder={t('admin.courses.addPlaceholder')}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <Button type="submit" disabled={adding || !newTitle.trim()}>
          <Plus size={16} strokeWidth={2} aria-hidden="true" />
          {t('admin.courses.add')}
        </Button>
      </form>
      {error && (
        <p className="form-status form-status-error" role="alert">
          {error}
        </p>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={t('admin.courses.deleteConfirmTitle')}
        confirmLabel={t('admin.courses.deleteConfirm')}
        danger
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      >
        <p>{t('admin.courses.deleteConfirmBody', { title: toDelete?.title ?? '' })}</p>
      </ConfirmDialog>
    </div>
  );
}
