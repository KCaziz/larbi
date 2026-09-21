import { useState } from 'react';
import { RotateCcw, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import Button from '../ui/Button.jsx';
import ConfirmDialog from '../cms/ConfirmDialog.jsx';
import ErrorState from '../ui/ErrorState.jsx';
import LoadingState from '../ui/LoadingState.jsx';

// History of a lesson: the versions saved automatically (before edits, at most one every few
// minutes) and the ones the author named. Restoring keeps the current state as a version
// too, so a restoration can always be undone.
const formatDateTime = (language, iso) => {
  try {
    return new Intl.DateTimeFormat(language === 'tzm' ? 'fr' : language, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
  } catch {
    return iso;
  }
};

export default function RevisionsPanel({ courseId, onRestored }) {
  const { t, i18n } = useTranslation();
  const list = useApi(`/admin/courses/${courseId}/revisions`);
  const [label, setLabel] = useState('');
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toRestore, setToRestore] = useState(null);

  const run = async (action) => {
    setBusy(true);
    setMessage(null);
    try {
      await action();
    } catch (err) {
      setMessage({ type: 'error', text: t(errorKey(err)) });
    } finally {
      setBusy(false);
    }
  };

  const save = (event) => {
    event.preventDefault();
    return run(async () => {
      await api.post(`/admin/courses/${courseId}/revisions`, label.trim() ? { label: label.trim() } : {});
      setLabel('');
      setMessage({ type: 'ok', text: t('admin.blocks.revision.saved') });
      list.reload();
    });
  };

  const restore = () =>
    run(async () => {
      const { blocks } = await api.post(`/admin/courses/${courseId}/revisions/${toRestore.id}/restore`);
      setToRestore(null);
      onRestored(blocks);
      setMessage({ type: 'ok', text: t('admin.blocks.revision.restored') });
      list.reload();
    });

  const title = (revision) => {
    if (revision.label === 'before-restore') return t('admin.blocks.revision.beforeRestore');
    return revision.label || t('admin.blocks.revision.automatic');
  };

  return (
    <section className="cms-revisions" aria-label={t('admin.blocks.history')}>
      <p className="cms-muted">{t('admin.blocks.revision.intro')}</p>
      <form className="cms-add-row" onSubmit={save}>
        <label htmlFor={`revision-label-${courseId}`} className="sr-only">
          {t('admin.blocks.revision.labelField')}
        </label>
        <input id={`revision-label-${courseId}`} type="text" maxLength={100} value={label} placeholder={t('admin.blocks.revision.placeholder')} onChange={(e) => setLabel(e.target.value)} />
        <Button type="submit" variant="secondary" disabled={busy}>
          <Save size={16} strokeWidth={1.9} aria-hidden="true" />
          {t('admin.blocks.revision.save')}
        </Button>
      </form>
      {message && (
        <p className={`cms-inline-message ${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>
          {message.text}
        </p>
      )}

      {list.status === 'loading' && <LoadingState />}
      {list.status === 'error' && <ErrorState message={t('admin.blocks.revision.loadError')} onRetry={list.reload} />}
      {list.status === 'ready' && list.data.revisions.length === 0 && <p className="cms-muted">{t('admin.blocks.revision.empty')}</p>}
      {list.status === 'ready' && list.data.revisions.length > 0 && (
        <ul className="cms-revision-list">
          {list.data.revisions.map((revision) => (
            <li key={revision.id}>
              <span className="cms-revision-main">
                <strong>{title(revision)}</strong>
                <small>
                  {formatDateTime(i18n.language, revision.createdAt)}
                  {revision.author ? ` · ${revision.author.name}` : ''} · {t('admin.blocks.revision.blocks', { count: revision.blockCount })}
                </small>
              </span>
              <Button variant="secondary" onClick={() => setToRestore(revision)} disabled={busy}>
                <RotateCcw size={16} strokeWidth={1.9} aria-hidden="true" />
                {t('admin.blocks.revision.restore')}
              </Button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(toRestore)}
        title={t('admin.blocks.revision.restoreTitle')}
        confirmLabel={t('admin.blocks.revision.restore')}
        busy={busy}
        onConfirm={restore}
        onCancel={() => setToRestore(null)}
      >
        <p>{t('admin.blocks.revision.restoreBody')}</p>
      </ConfirmDialog>
    </section>
  );
}
