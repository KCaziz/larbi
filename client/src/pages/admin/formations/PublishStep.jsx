import { useState } from 'react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api, ApiError, errorKey } from '../../../lib/api.js';
import { formatDate } from '../../../lib/format.js';
import Button from '../../../components/ui/Button.jsx';
import ConfirmDialog from '../../../components/cms/ConfirmDialog.jsx';
import ReadinessChecklist from '../../../components/cms/ReadinessChecklist.jsx';

export default function PublishStep({ formation, hasUnsaved, onChanged, onGo }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const published = formation.status === 'published';
  const { ready, items } = formation.readiness;

  const run = async (path, successKey) => {
    setBusy(true);
    setMessage(null);
    try {
      await api.post(`/admin/formations/${formation.id}/${path}`);
      await onChanged();
      setMessage({ type: 'ok', text: t(successKey) });
    } catch (err) {
      await onChanged().catch(() => {});
      setMessage({
        type: 'error',
        text: err instanceof ApiError && err.status === 422 ? t('admin.publish.notReady') : t(errorKey(err)),
      });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setDeleteError(null);
    try {
      await api.delete(`/admin/formations/${formation.id}`);
      navigate('/admin/formations', { replace: true });
    } catch (err) {
      setDeleteError(err instanceof ApiError && err.status === 409 ? t('admin.danger.hasLearners') : t(errorKey(err)));
      setConfirmDelete(false);
      setBusy(false);
    }
  };

  return (
    <div className="cms-form">
      <p className="cms-intro">{t('admin.publish.intro')}</p>

      <section className="cms-card" aria-labelledby="checklist-title">
        <h2 id="checklist-title">{t('admin.publish.checklist')}</h2>
        <ReadinessChecklist items={items} onGo={onGo} />
        {ready && <p className="cms-inline-message ok">{t('admin.publish.allDone')}</p>}
      </section>

      <section className="cms-card" aria-labelledby="publish-title">
        <h2 id="publish-title">{t('admin.publish.title')}</h2>
        <p>
          {published
            ? t('admin.publish.statusPublished', { date: formatDate(i18n.language, formation.publishedAt) })
            : t('admin.publish.statusDraft')}
        </p>
        {published && <p className="cms-muted">{t('admin.publish.unpublishHint')}</p>}
        {hasUnsaved && <p className="cms-inline-message warn">{t('admin.publish.unsavedFirst')}</p>}
        {message && (
          <p className={`cms-inline-message ${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>
            {message.text}
          </p>
        )}
        {published ? (
          <Button variant="secondary" onClick={() => run('unpublish', 'admin.publish.unpublished')} disabled={busy}>
            <EyeOff size={16} strokeWidth={1.9} aria-hidden="true" />
            {t('admin.publish.unpublish')}
          </Button>
        ) : (
          <Button onClick={() => run('publish', 'admin.publish.published')} disabled={busy || !ready || hasUnsaved}>
            <Eye size={16} strokeWidth={1.9} aria-hidden="true" />
            {t('admin.publish.publish')}
          </Button>
        )}
      </section>

      <section className="cms-card cms-danger" aria-labelledby="danger-title">
        <h2 id="danger-title">{t('admin.danger.title')}</h2>
        <p>{t('admin.danger.body')}</p>
        {deleteError && (
          <p className="cms-inline-message error" role="alert">
            {deleteError}
          </p>
        )}
        <Button variant="secondary" className="btn-danger-outline" onClick={() => setConfirmDelete(true)} disabled={busy}>
          <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
          {t('admin.danger.button')}
        </Button>
      </section>

      <ConfirmDialog
        open={confirmDelete}
        title={t('admin.danger.confirmTitle')}
        confirmLabel={t('admin.danger.confirm')}
        danger
        busy={busy}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      >
        <p>{t('admin.danger.confirmBody', { title: formation.title })}</p>
      </ConfirmDialog>
    </div>
  );
}
