import { useState } from 'react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api, ApiError, errorKey } from '../../lib/api.js';
import { formatDate } from '../../lib/format.js';
import Button from '../ui/Button.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import ReadinessChecklist from './ReadinessChecklist.jsx';

// Publication step shared by every CMS content (formations, articles): the
// "ready to publish" checklist, publish / unpublish, and the separate danger zone.
// `basePath`: e.g. "/admin/formations/<id>" (POST .../publish, .../unpublish, DELETE).
// `i18n`: prefixes of the texts, so each kind of content keeps its own wording:
//   { publish: 'admin.publish', danger: 'admin.danger', blocked: 'hasLearners' }
// `extra`: optional node rendered under the status (e.g. "view on the blog").
export default function PublishPanel({ entity, basePath, listPath, i18n: keys, hasUnsaved, onChanged, onGo, extra }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const published = entity.status === 'published';
  const { ready, items } = entity.readiness;
  const p = keys.publish;
  const d = keys.danger;

  const run = async (path, successKey) => {
    setBusy(true);
    setMessage(null);
    try {
      await api.post(`${basePath}/${path}`);
      await onChanged();
      setMessage({ type: 'ok', text: t(successKey) });
    } catch (err) {
      await onChanged().catch(() => {});
      setMessage({
        type: 'error',
        text: err instanceof ApiError && err.status === 422 ? t(`${p}.notReady`) : t(errorKey(err)),
      });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setDeleteError(null);
    try {
      await api.delete(basePath);
      navigate(listPath, { replace: true });
    } catch (err) {
      setDeleteError(err instanceof ApiError && err.status === 409 ? t(`${d}.${keys.blocked}`) : t(errorKey(err)));
      setConfirmDelete(false);
      setBusy(false);
    }
  };

  return (
    <div className="cms-form">
      <p className="cms-intro">{t(`${p}.intro`)}</p>

      <section className="cms-card" aria-labelledby="checklist-title">
        <h2 id="checklist-title">{t(`${p}.checklist`)}</h2>
        <ReadinessChecklist items={items} onGo={onGo} prefix={keys.readiness} />
        {ready && <p className="cms-inline-message ok">{t(`${p}.allDone`)}</p>}
      </section>

      <section className="cms-card" aria-labelledby="publish-title">
        <h2 id="publish-title">{t(`${p}.title`)}</h2>
        <p>
          {published
            ? t(`${p}.statusPublished`, { date: formatDate(i18n.language, entity.publishedAt) })
            : t(`${p}.statusDraft`)}
        </p>
        {published && <p className="cms-muted">{t(`${p}.unpublishHint`)}</p>}
        {published && extra}
        {hasUnsaved && <p className="cms-inline-message warn">{t(`${p}.unsavedFirst`)}</p>}
        {message && (
          <p className={`cms-inline-message ${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>
            {message.text}
          </p>
        )}
        {published ? (
          <Button variant="secondary" onClick={() => run('unpublish', `${p}.unpublished`)} disabled={busy}>
            <EyeOff size={16} strokeWidth={1.9} aria-hidden="true" />
            {t(`${p}.unpublish`)}
          </Button>
        ) : (
          <Button onClick={() => run('publish', `${p}.published`)} disabled={busy || !ready || hasUnsaved}>
            <Eye size={16} strokeWidth={1.9} aria-hidden="true" />
            {t(`${p}.publish`)}
          </Button>
        )}
      </section>

      <section className="cms-card cms-danger" aria-labelledby="danger-title">
        <h2 id="danger-title">{t(`${d}.title`)}</h2>
        <p>{t(`${d}.body`)}</p>
        {deleteError && (
          <p className="cms-inline-message error" role="alert">
            {deleteError}
          </p>
        )}
        <Button variant="secondary" className="btn-danger-outline" onClick={() => setConfirmDelete(true)} disabled={busy}>
          <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
          {t(`${d}.button`)}
        </Button>
      </section>

      <ConfirmDialog
        open={confirmDelete}
        title={t(`${d}.confirmTitle`)}
        confirmLabel={t(`${d}.confirm`)}
        danger
        busy={busy}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      >
        <p>{t(`${d}.confirmBody`, { title: entity.title })}</p>
      </ConfirmDialog>
    </div>
  );
}
