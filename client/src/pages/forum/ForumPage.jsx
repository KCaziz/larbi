import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flag, MessagesSquare, Plus } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatDate } from '../../lib/format.js';
import { newIdempotencyKey } from '../../lib/organisation.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Notice from '../../components/ui/Notice.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import AdultOnly from '../../components/fincludia/AdultOnly.jsx';
import { adultRefusalReason, isAdultRefusal } from '../../lib/adultRefusal.js';
import '../entreprise/Business.css';

// P13-05, lot G (2026-11-24): the forum of mutual help between professionals
// (ECR-0156 to 0158). Unverified content, said so; a message that seems to
// hold personal data waits for a moderator; reports are decided by a person.

const CATEGORIES = ['gestion', 'facturation', 'tresorerie', 'financement', 'import_export', 'diaspora', 'rh', 'creation', 'autre'];
const REASONS = ['personal_data', 'abuse', 'spam', 'wrong_advice', 'other'];

export default function ForumPage() {
  const { t, i18n } = useTranslation();
  const [category, setCategory] = useState('');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);
  const [writing, setWriting] = useState(false);
  const [message, setMessage] = useState(null);
  const params = new URLSearchParams({ ...(category ? { category } : {}), ...(q.trim().length >= 2 ? { q: q.trim() } : {}) }).toString();
  const threads = useApi(`/fin/forum?${params}`);
  useDocumentMeta(t('forum.title'), t('forum.intro'));

  const run = async (action, okKey) => {
    setMessage(null);
    try {
      const result = await action();
      setMessage({ kind: 'ok', text: t(okKey) });
      threads.reload();
      return result ?? true;
    } catch (err) {
      setMessage({ kind: 'error', text: t(err?.details?.reason ? `forum.errors.${err.details.reason}` : errorKey(err), { defaultValue: t(errorKey(err)) }) });
      return false;
    }
  };

  if (isAdultRefusal(threads.error)) {
    return (
      <>
        <PageHeader icon={MessagesSquare} title={t('forum.title')} subtitle={t('forum.intro')} maxWidth={1000} />
        <div className="business-page">
          <AdultOnly reason={adultRefusalReason(threads.error)} />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader icon={MessagesSquare} title={t('forum.title')} subtitle={t('forum.intro')} maxWidth={1000} />
      <div className="business-page">
        <Notice variant="info">{t('forum.unverified')}</Notice>
        {message && (
          <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
            {message.text}
          </p>
        )}

        {open ? (
          <Thread id={open} onBack={() => setOpen(null)} run={run} />
        ) : (
          <>
            <div className="inv-actions">
              <label className="pilot-inline">
                {t('forum.category')}
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">{t('forum.allCategories')}</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {t(`forum.categories.${c}`)}
                    </option>
                  ))}
                </select>
              </label>
              <input className="tools-search" value={q} onChange={(e) => setQ(e.target.value)} maxLength={80} placeholder={t('forum.search')} aria-label={t('forum.search')} />
              <Button type="button" variant="secondary" onClick={() => setWriting(!writing)}>
                <Plus size={16} aria-hidden="true" />
                {t('forum.ask')}
              </Button>
            </div>
            {writing && <NewThread run={run} onDone={() => setWriting(false)} />}
            {threads.status === 'loading' && !threads.data ? (
              <LoadingState />
            ) : (threads.data?.discussions ?? []).length === 0 ? (
              <p className="business-empty">{t('forum.none')}</p>
            ) : (
              <ul className="business-documents">
                {threads.data.discussions.map((th) => (
                  <li key={th.id} className="business-document">
                    <div className="business-document-head">
                      <span className="inv-badge">{t(`forum.categories.${th.category}`)}</span>
                      <button type="button" className="forum-link" onClick={() => setOpen(th.id)}>
                        <strong>{th.title}</strong>
                      </button>
                      <span className="inv-muted">
                        {th.auteur} · {formatDate(i18n.language, th.lastActivityAt)} · {t('forum.replies', { n: th.replyCount })}
                      </span>
                      {th.status === 'held' && <span className="business-document-state">{t('forum.held')}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </>
  );
}

function NewThread({ run, onDone }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ category: 'gestion', title: '', body: '', consent: false });
  const [key, setKey] = useState(newIdempotencyKey);
  return (
    <form
      className="business-form"
      onSubmit={async (e) => {
        e.preventDefault();
        const created = await run(() => api.post('/fin/forum', { category: form.category, title: form.title.trim(), body: form.body.trim(), consent: true }, { idempotencyKey: key }), 'forum.posted');
        if (created) {
          setKey(newIdempotencyKey());
          if (created.discussion?.status === 'held') window.alert(t('forum.heldNotice'));
          onDone();
        }
      }}
    >
      <div className="business-form-row">
        <label>
          {t('forum.category')}
          <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(`forum.categories.${c}`)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('forum.subject')}
          <input id="forum-title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} maxLength={200} required />
        </label>
      </div>
      <label>
        {t('forum.text')}
        <textarea id="forum-body" className="inv-preview" rows={6} value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} minLength={10} maxLength={5000} required />
      </label>
      <p className="inv-muted">{t('forum.privacyHint')}</p>
      <label className="pilot-check">
        <input type="checkbox" checked={form.consent} onChange={(e) => setForm((p) => ({ ...p, consent: e.target.checked }))} required />
        {t('forum.consent')}
      </label>
      <Button type="submit" variant="secondary" disabled={!form.consent}>
        {t('forum.publish')}
      </Button>
    </form>
  );
}

function Thread({ id, onBack, run }) {
  const { t, i18n } = useTranslation();
  const thread = useApi(`/fin/forum/${id}`);
  const [body, setBody] = useState('');
  const [key, setKey] = useState(newIdempotencyKey);
  const [reporting, setReporting] = useState(null);
  const data = thread.data?.discussion;
  const act = async (action, okKey) => {
    const done = await run(action, okKey);
    if (done) thread.reload();
    return done;
  };

  if (thread.status === 'loading' && !data) return <LoadingState />;
  if (!data) return null;
  const Report = ({ target }) =>
    reporting === target.id ? (
      <span className="dia-actions">
        {REASONS.map((r) => (
          <Button key={r} type="button" variant="ghost" onClick={() => act(() => api.post('/fin/forum/signalements', { ...target.body, reason: r }), 'forum.reported').then(() => setReporting(null))}>
            {t(`forum.reasons.${r}`)}
          </Button>
        ))}
      </span>
    ) : (
      <Button type="button" variant="ghost" onClick={() => setReporting(target.id)}>
        <Flag size={14} aria-hidden="true" />
        {t('forum.report')}
      </Button>
    );

  return (
    <>
      <Button type="button" variant="ghost" onClick={onBack}>
        {t('forum.back')}
      </Button>
      <article className="business-document">
        <div className="business-document-head">
          <span className="inv-badge">{t(`forum.categories.${data.category}`)}</span>
          <strong>{data.title}</strong>
          <span className="inv-muted">
            {data.auteur} · {formatDate(i18n.language, data.createdAt)}
          </span>
          {data.status === 'held' && <span className="business-document-state">{t('forum.held')}</span>}
        </div>
        <p className="forum-body">{data.body}</p>
        {!data.deMoi && data.status === 'published' && <Report target={{ id: data.id, body: { threadId: data.id } }} />}
      </article>
      <ul className="business-documents">
        {data.posts.map((p) => (
          <li key={p.id} className="business-document">
            <p className="inv-muted inv-note">
              {p.auteur} · {formatDate(i18n.language, p.createdAt)}
              {p.status === 'held' && ` · ${t('forum.held')}`}
            </p>
            <p className="forum-body">{p.body}</p>
            {!p.deMoi && p.status === 'published' && <Report target={{ id: p.id, body: { postId: p.id } }} />}
          </li>
        ))}
      </ul>
      {data.status === 'published' && (
        <form
          className="business-form"
          onSubmit={async (e) => {
            e.preventDefault();
            const posted = await act(() => api.post(`/fin/forum/${id}/reponses`, { body: body.trim() }, { idempotencyKey: key }), 'forum.replied');
            if (posted) {
              setKey(newIdempotencyKey());
              setBody('');
              if (posted.message?.status === 'held') window.alert(t('forum.heldNotice'));
            }
          }}
        >
          <label>
            {t('forum.yourReply')}
            <textarea className="inv-preview" rows={4} value={body} onChange={(e) => setBody(e.target.value)} minLength={2} maxLength={5000} required />
          </label>
          <p className="inv-muted">{t('forum.privacyHint')}</p>
          <Button type="submit" variant="secondary">
            {t('forum.replyButton')}
          </Button>
        </form>
      )}
    </>
  );
}
