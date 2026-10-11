import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react';
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

// Administration of the guided assistant (P3-07): the questions visitors can
// pick and the answer shown for each, one language at a time, in the order
// they appear in the panel. A new question stays a draft until published.
export default function ChatbotAdminPage() {
  const { t } = useTranslation();
  const list = useApi('/admin/chatbot');
  const [language, setLanguage] = useState('fr');
  const [form, setForm] = useState(null); // null | { id?, question, answer, language }
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
      // A 409 means the list is stale (edited in another tab): show the fresh one.
      if (err.status === 409) list.reload();
      return false;
    } finally {
      setBusy(false);
    }
  };

  const openForm = (entry) => {
    setMessage(null);
    setForm(entry ? { id: entry.id, question: entry.question, answer: entry.answer, language: entry.language } : { question: '', answer: '', language });
    setResetKey((k) => k + 1);
  };

  const submit = async (event) => {
    event.preventDefault();
    const body = { question: form.question.trim(), answer: form.answer, language: form.language };
    const saved = await run(
      () => (form.id ? api.patch(`/admin/chatbot/${form.id}`, body) : api.post('/admin/chatbot', body)),
      t('chatbot.admin.saved'),
    );
    if (saved) {
      setLanguage(form.language);
      setForm(null);
    }
  };

  if (list.status === 'loading') return <LoadingState />;
  if (list.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={list.reload} />;

  const entries = list.data.entries.filter((e) => e.language === language);
  const limits = list.data.limits;

  const move = (from, to) => {
    const ids = entries.map((e) => e.id);
    const [moved] = ids.splice(from, 1);
    ids.splice(to, 0, moved);
    run(() => api.put('/admin/chatbot/order', { language, ids }), t('chatbot.admin.reordered'));
  };

  const setStatus = (entry) =>
    run(
      () => api.post(`/admin/chatbot/${entry.id}/${entry.status === 'published' ? 'unpublish' : 'publish'}`),
      entry.status === 'published' ? t('chatbot.admin.unpublished') : t('chatbot.admin.published'),
    );

  const remove = async () => {
    if (await run(() => api.delete(`/admin/chatbot/${deleteTarget.id}`), t('chatbot.admin.deleted'))) setDeleteTarget(null);
  };

  return (
    <>
      <PageToolbar title={t('chatbot.admin.title')} subtitle={t('chatbot.admin.subtitle')}>
        <Button onClick={() => openForm(null)} disabled={busy}>
          <Plus size={16} aria-hidden="true" />
          {t('chatbot.admin.add')}
        </Button>
      </PageToolbar>

      <div className="chatbot-admin-bar">
        <label>
          {t('chatbot.admin.language')}
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            {CONTENT_LANGUAGES.map((code) => (
              <option key={code} value={code}>
                {t(`contentLanguage.names.${code}`)} ({list.data.entries.filter((e) => e.language === code).length})
              </option>
            ))}
          </select>
        </label>
        <p className="form-hint">{t('chatbot.admin.languageHint')}</p>
      </div>

      {message && (
        <p className={`cms-inline-message ${message.kind}`} role={message.kind === 'error' ? 'alert' : 'status'}>
          {message.text}
        </p>
      )}

      {form && (
        <form className="chatbot-admin-form" onSubmit={submit}>
          <h2>{form.id ? t('chatbot.admin.edit') : t('chatbot.admin.add')}</h2>
          <Field label={t('chatbot.admin.question')} htmlFor="cb-question" hint={t('chatbot.admin.questionHint')}>
            <input
              id="cb-question"
              type="text"
              aria-describedby="cb-question-hint"
              maxLength={limits.question}
              value={form.question}
              onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
              required
              autoFocus
            />
          </Field>
          <Field label={t('chatbot.admin.answer')} htmlFor="cb-answer" hint={t('chatbot.admin.answerHint')}>
            <RichTextEditor id="cb-answer" describedBy="cb-answer-hint" value={form.answer} resetKey={resetKey} onChange={(html) => setForm((f) => ({ ...f, answer: html }))} />
          </Field>
          <Field label={t('chatbot.admin.language')} htmlFor="cb-language">
            <select id="cb-language" value={form.language} onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}>
              {CONTENT_LANGUAGES.map((code) => (
                <option key={code} value={code}>
                  {t(`contentLanguage.names.${code}`)}
                </option>
              ))}
            </select>
          </Field>
          <p className="form-hint">{t('chatbot.admin.draftHint')}</p>
          <div className="chatbot-admin-form-actions">
            <Button type="submit" disabled={busy || !form.question.trim()}>
              {t('chatbot.admin.save')}
            </Button>
            <Button variant="secondary" onClick={() => setForm(null)}>
              {t('chatbot.admin.cancel')}
            </Button>
          </div>
        </form>
      )}

      {entries.length === 0 ? (
        <p className="cms-muted">{t('chatbot.admin.empty', { language: t(`contentLanguage.names.${language}`) })}</p>
      ) : (
        <ol className="chatbot-admin-list">
          {entries.map((entry, index) => (
            <li key={entry.id} className="chatbot-admin-item">
              <MoveButtons
                index={index}
                count={entries.length}
                onMove={move}
                disabled={busy}
                upLabel={`${t('chatbot.admin.moveUp')} — ${entry.question}`}
                downLabel={`${t('chatbot.admin.moveDown')} — ${entry.question}`}
              />
              <div className="chatbot-admin-text">
                <strong>{entry.question}</strong>
                <StatusBadge status={entry.status} labelKey={`chatbot.admin.status.${entry.status}`} />
              </div>
              <div className="cms-row-actions">
                <button
                  type="button"
                  className="cms-icon-button"
                  title={entry.status === 'published' ? t('chatbot.admin.unpublish') : t('chatbot.admin.publish')}
                  aria-label={`${entry.status === 'published' ? t('chatbot.admin.unpublish') : t('chatbot.admin.publish')} — ${entry.question}`}
                  onClick={() => setStatus(entry)}
                  disabled={busy}
                >
                  {entry.status === 'published' ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
                </button>
                <button type="button" className="cms-icon-button" title={t('chatbot.admin.edit')} aria-label={`${t('chatbot.admin.edit')} — ${entry.question}`} onClick={() => openForm(entry)}>
                  <Pencil size={15} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="cms-icon-button danger"
                  title={t('chatbot.admin.delete')}
                  aria-label={`${t('chatbot.admin.delete')} — ${entry.question}`}
                  onClick={() => setDeleteTarget(entry)}
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
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
        <p>{t('chatbot.admin.deleteConfirm', { question: deleteTarget?.question ?? '' })}</p>
      </ConfirmDialog>
    </>
  );
}
