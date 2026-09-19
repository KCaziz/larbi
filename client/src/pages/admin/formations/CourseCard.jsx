import { useEffect, useState } from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, errorKey } from '../../../lib/api.js';
import Button from '../../../components/ui/Button.jsx';
import Field from '../../../components/cms/Field.jsx';
import FileUpload from '../../../components/cms/FileUpload.jsx';
import MediaList from '../../../components/cms/MediaList.jsx';
import MoveButtons from '../../../components/cms/MoveButtons.jsx';
import RichTextEditor from '../../../components/cms/RichTextEditor.jsx';

const toDraft = (c) => ({
  title: c.title,
  summary: c.summary ?? '',
  body: c.body ?? '',
  estimatedMinutes: c.estimatedMinutes ?? '',
  isRequired: c.isRequired,
});

// One course of the formation. It keeps its own unsaved edits, so switching
// steps or opening another course never loses what was typed.
export default function CourseCard({ course, index, count, open, onToggle, onMove, onDelete, onChanged, onDirtyChange }) {
  const { t } = useTranslation();
  const [saved, setSaved] = useState(() => toDraft(course)); // last version stored on the server
  const [draft, setDraft] = useState(() => toDraft(course));
  const [resetKey, setResetKey] = useState(0); // tells the rich editor to reload its content
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  useEffect(() => {
    onDirtyChange(course.id, dirty);
  }, [dirty, course.id, onDirtyChange]);

  const setField = (name, value) => {
    setMessage(null);
    setDraft((d) => ({ ...d, [name]: value }));
  };

  const save = async () => {
    if (!draft.title.trim()) {
      setMessage({ type: 'error', text: t('admin.course.titleRequired') });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const { course: updated } = await api.patch(`/admin/courses/${course.id}`, {
        title: draft.title,
        summary: draft.summary,
        body: draft.body || null,
        estimatedMinutes: draft.estimatedMinutes === '' ? null : Number(draft.estimatedMinutes),
        isRequired: draft.isRequired,
      });
      const next = toDraft(updated);
      setSaved(next);
      setDraft(next);
      setResetKey((k) => k + 1); // show the server-cleaned text
      setMessage({ type: 'ok', text: t('admin.course.saved') });
      await onChanged();
    } catch (err) {
      setMessage({ type: 'error', text: t(errorKey(err)) });
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    setDraft(saved);
    setResetKey((k) => k + 1);
    setMessage(null);
  };

  const removeFile = async (media) => {
    setRemovingId(media.id);
    try {
      await api.delete(`/admin/media/${media.id}`);
      await onChanged();
    } catch (err) {
      setMessage({ type: 'error', text: t(errorKey(err)) });
    } finally {
      setRemovingId(null);
    }
  };

  const panelId = `course-panel-${course.id}`;

  return (
    <li className={`cms-course ${open ? 'open' : ''}`}>
      <div className="cms-course-head">
        <span className="cms-course-number" aria-hidden="true">
          {index + 1}
        </span>
        <button type="button" className="cms-course-toggle" onClick={onToggle} aria-expanded={open} aria-controls={panelId}>
          <span className="cms-course-title">{saved.title || t('admin.courses.untitled')}</span>
          {dirty && <span className="cms-dot" title={t('admin.save.dirty')} aria-label={t('admin.save.dirty')} />}
          <ChevronDown className="cms-course-chevron" size={18} strokeWidth={1.9} aria-hidden="true" />
        </button>
        <MoveButtons index={index} count={count} onMove={onMove} />
        <button
          type="button"
          className="cms-icon-button danger"
          onClick={onDelete}
          aria-label={`${t('admin.courses.delete')} : ${saved.title}`}
          title={t('admin.courses.delete')}
        >
          <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>

      <div id={panelId} className="cms-course-body" hidden={!open}>
        <Field label={t('admin.course.title')} htmlFor={`course-title-${course.id}`}>
          <input
            id={`course-title-${course.id}`}
            type="text"
            maxLength={150}
            value={draft.title}
            onChange={(e) => setField('title', e.target.value)}
          />
        </Field>

        <Field label={t('admin.course.summary')} htmlFor={`course-summary-${course.id}`} hint={t('admin.course.summaryHint')}>
          <input
            id={`course-summary-${course.id}`}
            type="text"
            maxLength={500}
            value={draft.summary}
            onChange={(e) => setField('summary', e.target.value)}
            aria-describedby={`course-summary-${course.id}-hint`}
          />
        </Field>

        <div className="form-field cms-field">
          <label htmlFor={`course-body-${course.id}`}>{t('admin.course.content')}</label>
          <small id={`course-body-${course.id}-hint`} className="form-hint">
            {t('admin.course.contentHint')}
          </small>
          <RichTextEditor
            id={`course-body-${course.id}`}
            describedBy={`course-body-${course.id}-hint`}
            value={draft.body}
            resetKey={resetKey}
            onChange={(html) => setField('body', html)}
          />
        </div>

        <div className="form-field cms-field">
          <span className="cms-label">{t('admin.course.files')}</span>
          <small className="form-hint">{t('admin.course.filesHint')}</small>
          <MediaList items={course.media} onRemove={removeFile} busyId={removingId} />
          <FileUpload
            label={t('admin.course.upload')}
            accept="video/mp4,video/webm,application/pdf,image/png,image/jpeg,image/webp"
            onUpload={async (file) => {
              await api.upload(`/admin/courses/${course.id}/media`, file);
              await onChanged();
            }}
          />
        </div>

        <div className="cms-course-options">
          <Field label={t('admin.course.minutes')} htmlFor={`course-minutes-${course.id}`}>
            <input
              id={`course-minutes-${course.id}`}
              type="number"
              min="0"
              max="1440"
              inputMode="numeric"
              value={draft.estimatedMinutes}
              onChange={(e) => setField('estimatedMinutes', e.target.value)}
            />
          </Field>
          <label className="cms-check">
            <input type="checkbox" checked={draft.isRequired} onChange={(e) => setField('isRequired', e.target.checked)} />
            <span>
              {t('admin.course.required')}
              <small className="form-hint">{t('admin.course.requiredHint')}</small>
            </span>
          </label>
        </div>

        <div className="cms-course-actions">
          {message && (
            <p className={`cms-inline-message ${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>
              {message.text}
            </p>
          )}
          <Button variant="secondary" onClick={discard} disabled={!dirty || saving}>
            {t('admin.save.discard')}
          </Button>
          <Button onClick={save} disabled={!dirty || saving}>
            {saving ? t('admin.save.saving') : t('admin.course.save')}
          </Button>
        </div>
      </div>
    </li>
  );
}
