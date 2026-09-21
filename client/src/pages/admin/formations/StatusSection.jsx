import { useState } from 'react';
import { Archive, Eye, EyeOff, RotateCcw, SearchCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, ApiError, errorKey } from '../../../lib/api.js';
import { formatDate } from '../../../lib/format.js';
import Button from '../../../components/ui/Button.jsx';
import StatusBadge from '../../../components/cms/StatusBadge.jsx';

// Where the formation is in its life: draft -> in review -> published -> archived.
// Every move goes through the server, which refuses to publish an incomplete formation.
// A formation that is not published is out of the catalogue but stays readable by the
// learners already enrolled (they keep their progress).
const ACTIONS = {
  draft: [
    { to: 'in_review', icon: SearchCheck, variant: 'secondary' },
    { to: 'published', icon: Eye, needsReady: true },
  ],
  in_review: [
    { to: 'published', icon: Eye, needsReady: true },
    { to: 'draft', icon: RotateCcw, variant: 'secondary' },
  ],
  published: [
    { to: 'draft', icon: EyeOff, variant: 'secondary' },
    { to: 'archived', icon: Archive, variant: 'secondary' },
  ],
  archived: [{ to: 'draft', icon: RotateCcw, variant: 'secondary' }],
};

export default function StatusSection({ formation, hasUnsaved, onChanged }) {
  const { t, i18n } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const { ready } = formation.readiness;

  const move = async (status) => {
    setBusy(true);
    setMessage(null);
    try {
      await api.put(`/admin/formations/${formation.id}/status`, { status });
      await onChanged();
      setMessage({ type: 'ok', text: t(`admin.workflow.done.${status}`) });
    } catch (err) {
      await onChanged().catch(() => {});
      setMessage({ type: 'error', text: err instanceof ApiError && err.status === 422 ? t('admin.publish.notReady') : t(errorKey(err)) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="cms-card" aria-labelledby="status-title">
      <h2 id="status-title">{t('admin.publish.title')}</h2>
      <p>
        <StatusBadge status={formation.status} />
      </p>
      <p>
        {t(`admin.workflow.state.${formation.status}`, { date: formatDate(i18n.language, formation.publishedAt) })}
      </p>
      {formation.status === 'published' && <p className="cms-muted">{t('admin.publish.unpublishHint')}</p>}
      {hasUnsaved && <p className="cms-inline-message warn">{t('admin.publish.unsavedFirst')}</p>}
      {message && (
        <p className={`cms-inline-message ${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>
          {message.text}
        </p>
      )}
      <div className="cms-workflow-actions">
        {ACTIONS[formation.status].map(({ to, icon: Icon, variant, needsReady }) => (
          <Button
            key={to}
            variant={variant}
            onClick={() => move(to)}
            disabled={busy || (needsReady && (!ready || hasUnsaved))}
          >
            <Icon size={16} strokeWidth={1.9} aria-hidden="true" />
            {t(`admin.workflow.action.${to}`)}
          </Button>
        ))}
      </div>
    </section>
  );
}
