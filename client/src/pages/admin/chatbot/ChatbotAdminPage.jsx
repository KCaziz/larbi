import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api, errorKey } from '../../../lib/api.js';
import { useApi } from '../../../lib/useApi.js';
import { CONTENT_LANGUAGES } from '../../../lib/contentLanguage.js';
import Button from '../../../components/ui/Button.jsx';
import ErrorState from '../../../components/ui/ErrorState.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import ConfirmDialog from '../../../components/cms/ConfirmDialog.jsx';
import Field from '../../../components/cms/Field.jsx';
import MoveButtons from '../../../components/cms/MoveButtons.jsx';
import PageToolbar from '../../../components/cms/PageToolbar.jsx';
import RichTextEditor from '../../../components/cms/RichTextEditor.jsx';
import StatusBadge from '../../../components/cms/StatusBadge.jsx';
import './ChatbotAdmin.css';

const hasText = (html) => Boolean((html ?? '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim());

// The questions of « Une question ? » (P3-07), each written in every language
// (recette R11-05): one question = one group of translations, edited on one
// form, with the languages still missing shown on the list. A language left
// empty shows the French text to its readers until it is written.
//
// `embedded`: shown as the « Questions » tab of the assistant screen (R11-03).
export default function ChatbotAdminPage({ embedded = false }) {
  const { t } = useTranslation();
  const list = useApi('/admin/chatbot');
  const [form, setForm] = useState(null); // null | { groupId?, audience, lang, texts: { fr: { id?, question, answer } } }
  const [resetKey, setResetKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null); // { kind: 'ok' | 'error', text }

  const run = async (action, okText) => {
    setBusy(true);
    setMessage(null);
    try {
      await action();
      setMessage({ kind: 'ok', text: okText });
      list.reload();
      return true;
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 409: 'chatbot.admin.changed' })) });
      if (err.status === 409) list.reload();
      return false;
    } finally {
      setBusy(false);
    }
  };

  if (list.status === 'loading') return <LoadingState />;
  if (list.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={list.reload} />;

  const limits = list.data.limits;
  // One entry per question, its translations by language, in the questions' order.
  const groups = [];
  const byId = new Map();
  for (const entry of [...list.data.entries].sort((a, b) => a.position - b.position)) {
    if (!byId.has(entry.groupId)) {
      const group = { groupId: entry.groupId, position: entry.position, audience: entry.audience ?? 'both', rows: {} };
      byId.set(entry.groupId, group);
      groups.push(group);
    }
    byId.get(entry.groupId).rows[entry.language] = entry;
  }
  const titleOf = (group) => (group.rows.fr ?? Object.values(group.rows)[0]).question;
  const missingOf = (group) => CONTENT_LANGUAGES.filter((lang) => !group.rows[lang]);
  const incomplete = groups.filter((group) => missingOf(group).length > 0).length;

  const openForm = (group) => {
    setMessage(null);
    const texts = Object.fromEntries(CONTENT_LANGUAGES.map((lang) => {
      const row = group?.rows[lang];
      return [lang, row ? { id: row.id, question: row.question, answer: row.answer } : { question: '', answer: '' }];
    }));
    setForm({ groupId: group?.groupId, audience: group?.audience ?? 'both', lang: 'fr', texts });
    setResetKey((k) => k + 1);
  };

  const submit = async (event) => {
    event.preventDefault();
    const filled = CONTENT_LANGUAGES.filter((lang) => form.texts[lang].question.trim());
    const halfDone = filled.find((lang) => !hasText(form.texts[lang].answer));
    if (filled.length === 0 || halfDone) {
      setMessage({ kind: 'error', text: t('chatbot.admin.answerMissing', { language: t(`contentLanguage.names.${halfDone ?? 'fr'}`) }) });
      if (halfDone) setForm((f) => ({ ...f, lang: halfDone }));
      return;
    }
    const saved = await run(async () => {
      let groupId = form.groupId;
      // The French text first when the question is new: it opens the group.
      const order = [...filled].sort((a, b) => (a === 'fr' ? -1 : b === 'fr' ? 1 : 0));
      for (const lang of order) {
        const text = form.texts[lang];
        const body = { question: text.question.trim(), answer: text.answer };
        if (text.id) {
          await api.patch(`/admin/chatbot/${text.id}`, { ...body, audience: form.audience });
        } else {
          const created = await api.post('/admin/chatbot', { ...body, language: lang, audience: form.audience, ...(groupId ? { groupId } : {}) });
          groupId = created.entry.groupId;
        }
      }
      // A language emptied on the form loses its translation.
      for (const lang of CONTENT_LANGUAGES) {
        const text = form.texts[lang];
        if (text.id && !text.question.trim()) await api.delete(`/admin/chatbot/${text.id}`);
      }
    }, t('chatbot.admin.saved'));
    if (saved) setForm(null);
  };

  const move = (from, to) => {
    const ids = groups.map((g) => g.groupId);
    const [moved] = ids.splice(from, 1);
    ids.splice(to, 0, moved);
    run(() => api.put('/admin/chatbot/order-groups', { groupIds: ids }), t('chatbot.admin.reordered'));
  };

  const published = (group) => Object.values(group.rows).some((row) => row.status === 'published');
  const setStatus = (group) => {
    const withdraw = published(group);
    return run(
      async () => {
        for (const row of Object.values(group.rows)) {
          if (withdraw) await api.post(`/admin/chatbot/${row.id}/unpublish`);
          else await api.post(`/admin/chatbot/${row.id}/publish`);
        }
      },
      withdraw ? t('chatbot.admin.unpublished') : t('chatbot.admin.published'),
    );
  };

  const remove = async () => {
    const ok = await run(async () => {
      for (const row of Object.values(deleteTarget.rows)) await api.delete(`/admin/chatbot/${row.id}`);
    }, t('chatbot.admin.deleted'));
    if (ok) setDeleteTarget(null);
  };

  const addButton = (
    <Button onClick={() => openForm(null)} disabled={busy}>
      <Plus size={16} aria-hidden="true" />
      {t('chatbot.admin.add')}
    </Button>
  );
  const current = form?.texts[form.lang];
  const setText = (patch) => setForm((f) => ({ ...f, texts: { ...f.texts, [f.lang]: { ...f.texts[f.lang], ...patch } } }));

  return (
    <>
      {embedded ? (
        <div className="chatbot-admin-add">{addButton}</div>
      ) : (
        <PageToolbar title={t('chatbot.admin.title')} subtitle={t('chatbot.admin.subtitle')}>
          {addButton}
        </PageToolbar>
      )}

      {incomplete > 0 && (
        <p className="chatbot-admin-warning" role="status">
          {t('chatbot.admin.incomplete', { n: incomplete, total: groups.length })}
        </p>
      )}

      {message && (
        <p className={`cms-inline-message ${message.kind}`} role={message.kind === 'error' ? 'alert' : 'status'}>
          {message.text}
        </p>
      )}

      {form && (
        <form className="chatbot-admin-form" onSubmit={submit}>
          <h2>{form.groupId ? t('chatbot.admin.edit') : t('chatbot.admin.add')}</h2>
          <div className="chatbot-admin-langs" role="tablist" aria-label={t('chatbot.admin.language')}>
            {CONTENT_LANGUAGES.map((lang) => {
              const done = form.texts[lang].question.trim() && hasText(form.texts[lang].answer);
              return (
                <button
                  key={lang}
                  type="button"
                  role="tab"
                  aria-selected={form.lang === lang}
                  className={`chatbot-admin-lang ${form.lang === lang ? 'active' : ''} ${done ? 'done' : 'missing'}`}
                  onClick={() => {
                    setForm((f) => ({ ...f, lang }));
                    setResetKey((k) => k + 1);
                  }}
                >
                  {t(`contentLanguage.names.${lang}`)}
                  <span>{done ? t('chatbot.admin.translated') : lang === 'fr' ? t('chatbot.admin.toWrite') : t('chatbot.admin.toTranslate')}</span>
                </button>
              );
            })}
          </div>
          <Field label={`${t('chatbot.admin.question')} (${t(`contentLanguage.names.${form.lang}`)})`} htmlFor="cb-question" hint={t('chatbot.admin.questionHint')}>
            <input
              id="cb-question"
              type="text"
              dir={form.lang === 'ar' ? 'rtl' : 'ltr'}
              aria-describedby="cb-question-hint"
              maxLength={limits.question}
              value={current.question}
              onChange={(e) => setText({ question: e.target.value })}
              autoFocus
            />
          </Field>
          <Field label={`${t('chatbot.admin.answer')} (${t(`contentLanguage.names.${form.lang}`)})`} htmlFor="cb-answer" hint={t('chatbot.admin.answerHint')}>
            <RichTextEditor id="cb-answer" describedBy="cb-answer-hint" value={current.answer} resetKey={`${resetKey}-${form.lang}`} onChange={(html) => setText({ answer: html })} />
          </Field>
          <p className="form-hint">{t('chatbot.admin.translationHint')}</p>
          {/* P11-02: where the question shows — once for all its translations. */}
          <Field label={t('chatbot.admin.audience')} htmlFor="cb-audience">
            <select id="cb-audience" value={form.audience} onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value }))}>
              {['site', 'app', 'both'].map((code) => (
                <option key={code} value={code}>
                  {t(`chatbot.admin.audiences.${code}`)}
                </option>
              ))}
            </select>
          </Field>
          <p className="form-hint">{t('chatbot.admin.draftHint')}</p>
          <div className="chatbot-admin-form-actions">
            <Button type="submit" disabled={busy}>
              {t('chatbot.admin.save')}
            </Button>
            <Button variant="secondary" onClick={() => setForm(null)}>
              {t('chatbot.admin.cancel')}
            </Button>
          </div>
        </form>
      )}

      {groups.length === 0 ? (
        <p className="cms-muted">{t('chatbot.admin.emptyAll')}</p>
      ) : (
        <ol className="chatbot-admin-list">
          {groups.map((group, index) => {
            const title = titleOf(group);
            const isPublished = published(group);
            return (
              <li key={group.groupId} className="chatbot-admin-item">
                <MoveButtons
                  index={index}
                  count={groups.length}
                  onMove={move}
                  disabled={busy}
                  upLabel={`${t('chatbot.admin.moveUp')} — ${title}`}
                  downLabel={`${t('chatbot.admin.moveDown')} — ${title}`}
                />
                <div className="chatbot-admin-text">
                  <strong>{title}</strong>
                  <StatusBadge status={isPublished ? 'published' : 'draft'} labelKey={`chatbot.admin.status.${isPublished ? 'published' : 'draft'}`} />
                  <span className="cms-muted"> · {t(`chatbot.admin.audiences.${group.audience}`)}</span>
                  <span className="chatbot-admin-lang-chips">
                    {CONTENT_LANGUAGES.map((lang) => (
                      <span key={lang} className={`chatbot-admin-chip ${group.rows[lang] ? 'done' : 'missing'}`} title={t(`contentLanguage.names.${lang}`)}>
                        {lang.toUpperCase()} {group.rows[lang] ? '✓' : t('chatbot.admin.missingShort')}
                      </span>
                    ))}
                  </span>
                </div>
                <div className="cms-row-actions">
                  <Button variant="secondary" aria-label={`${isPublished ? t('chatbot.admin.unpublish') : t('chatbot.admin.publish')} — ${title}`} onClick={() => setStatus(group)} disabled={busy}>
                    {isPublished ? t('chatbot.admin.unpublish') : t('chatbot.admin.publish')}
                  </Button>
                  <button type="button" className="cms-icon-button" title={t('chatbot.admin.edit')} aria-label={`${t('chatbot.admin.edit')} — ${title}`} onClick={() => openForm(group)}>
                    <Pencil size={15} aria-hidden="true" />
                  </button>
                  <button type="button" className="cms-icon-button danger" title={t('chatbot.admin.delete')} aria-label={`${t('chatbot.admin.delete')} — ${title}`} onClick={() => setDeleteTarget(group)}>
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('chatbot.admin.delete')}
        confirmLabel={t('chatbot.admin.delete')}
        danger
        busy={busy}
        onConfirm={remove}
        onCancel={() => setDeleteTarget(null)}
      >
        <p>{t('chatbot.admin.deleteConfirm', { question: deleteTarget ? titleOf(deleteTarget) : '' })}</p>
      </ConfirmDialog>
    </>
  );
}
