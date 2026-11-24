import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api, errorKey } from '../../../lib/api.js';
import { useApi } from '../../../lib/useApi.js';
import { formatDate } from '../../../lib/format.js';
import Button from '../../../components/ui/Button.jsx';
import ErrorState from '../../../components/ui/ErrorState.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import PageToolbar from '../../../components/cms/PageToolbar.jsx';
import '../../entreprise/Business.css';

// P13-05, lot G (2026-11-24): moderation of the forum (ECR-0158) — reports and
// held messages, each decided by a person; the decisions are kept.

export default function ForumModerationPage() {
  const { t, i18n } = useTranslation();
  const queue = useApi('/admin/forum/moderation');
  const [message, setMessage] = useState(null);
  if (queue.status === 'loading' && !queue.data) return <LoadingState />;
  if (queue.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={queue.reload} />;
  const data = queue.data;

  const run = async (action) => {
    setMessage(null);
    try {
      await action();
      setMessage({ kind: 'ok', text: t('adminForum.decided') });
      queue.reload();
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err)) });
    }
  };
  const decide = (report, decision) => {
    const note = window.prompt(t('adminForum.note')) ?? undefined;
    run(() => api.post(`/admin/forum/signalements/${report.id}/decision`, { decision, ...(note ? { note } : {}) }));
  };
  const held = (kind, id, publish) => run(() => api.post(`/admin/forum/${kind}/${id}/decision`, { publish }));

  return (
    <>
      <PageToolbar title={t('adminForum.title')} subtitle={t('adminForum.intro')} />
      {message && (
        <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
          {message.text}
        </p>
      )}

      <h2>{t('adminForum.heldTitle')}</h2>
      {data.discussionsRetenues.length + data.messagesRetenus.length === 0 ? (
        <p className="business-empty">{t('adminForum.noHeld')}</p>
      ) : (
        <ul className="business-documents">
          {data.discussionsRetenues.map((th) => (
            <li key={th.id} className="business-document">
              <p className="inv-muted">
                {t(`adminForum.reasons.${th.heldReason}`, { defaultValue: th.heldReason })} · {th.auteur} · {formatDate(i18n.language, th.createdAt)}
              </p>
              <strong>{th.title}</strong>
              <p className="forum-body">{th.body}</p>
              <div className="inv-actions">
                <Button type="button" variant="secondary" onClick={() => held('thread', th.id, true)}>
                  {t('adminForum.publish')}
                </Button>
                <Button type="button" variant="ghost" onClick={() => held('thread', th.id, false)}>
                  {t('adminForum.remove')}
                </Button>
              </div>
            </li>
          ))}
          {data.messagesRetenus.map((p) => (
            <li key={p.id} className="business-document">
              <p className="inv-muted">
                {t(`adminForum.reasons.${p.heldReason}`, { defaultValue: p.heldReason })} · {p.auteur} · {p.thread.title}
              </p>
              <p className="forum-body">{p.body}</p>
              <div className="inv-actions">
                <Button type="button" variant="secondary" onClick={() => held('post', p.id, true)}>
                  {t('adminForum.publish')}
                </Button>
                <Button type="button" variant="ghost" onClick={() => held('post', p.id, false)}>
                  {t('adminForum.remove')}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2>{t('adminForum.reportsTitle')}</h2>
      {data.signalements.length === 0 ? (
        <p className="business-empty">{t('adminForum.noReport')}</p>
      ) : (
        <ul className="business-documents">
          {data.signalements.map((r) => (
            <li key={r.id} className="business-document">
              <p className="inv-muted">
                {t(`forum.reasons.${r.reason}`)} · {formatDate(i18n.language, r.createdAt)}
                {r.note ? ` · ${r.note}` : ''}
              </p>
              {r.thread && <strong>{r.thread.title}</strong>}
              <p className="forum-body">{r.thread?.body ?? r.post?.body}</p>
              <div className="inv-actions">
                <Button type="button" variant="ghost" onClick={() => decide(r, 'kept')}>
                  {t('adminForum.keep')}
                </Button>
                <Button type="button" variant="secondary" onClick={() => decide(r, 'removed')}>
                  {t('adminForum.remove')}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2>{t('adminForum.historyTitle')}</h2>
      <ul className="trade-pieces">
        {data.historique.map((h) => (
          <li key={h.id}>
            <span>
              {t(`forum.reasons.${h.reason}`)} → <strong>{t(`adminForum.decisions.${h.decision}`)}</strong>
              {h.decisionNote ? ` · ${h.decisionNote}` : ''}
            </span>
            <span className="inv-muted">{formatDate(i18n.language, h.decidedAt)}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
