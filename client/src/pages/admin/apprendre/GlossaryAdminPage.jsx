import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Eye, EyeOff, History, Pencil, Plus, Tag, Trash2 } from 'lucide-react';
import { api, errorKey } from '../../../lib/api.js';
import { useApi } from '../../../lib/useApi.js';
import { formatDate } from '../../../lib/format.js';
import Button from '../../../components/ui/Button.jsx';
import ErrorState from '../../../components/ui/ErrorState.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import ConfirmDialog from '../../../components/cms/ConfirmDialog.jsx';
import Field from '../../../components/cms/Field.jsx';
import MoveButtons from '../../../components/cms/MoveButtons.jsx';
import PageToolbar from '../../../components/cms/PageToolbar.jsx';
import RichTextEditor from '../../../components/cms/RichTextEditor.jsx';
import StatusBadge from '../../../components/cms/StatusBadge.jsx';
import './GlossaryAdmin.css';

const LEVELS = ['beginner', 'intermediate', 'advanced'];

// Administration of the "Apprendre" glossary and mini-guides (P2-08). Written
// by the team (decided 2026-10-11): general definitions, nothing tied to a
// specific offer, rate or legal rule.
export default function GlossaryAdminPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('terms');

  return (
    <>
      <PageToolbar title={t('admin.glossary.title')} subtitle={t('admin.glossary.subtitle')} />
      <div className="glossary-admin-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'terms'} className={tab === 'terms' ? 'active' : ''} onClick={() => setTab('terms')}>
          <Tag size={16} aria-hidden="true" />
          {t('admin.glossary.terms')}
        </button>
        <button type="button" role="tab" aria-selected={tab === 'guides'} className={tab === 'guides' ? 'active' : ''} onClick={() => setTab('guides')}>
          <BookOpen size={16} aria-hidden="true" />
          {t('admin.glossary.guides')}
        </button>
      </div>
      {tab === 'terms' ? <TermsTab /> : <GuidesTab />}
    </>
  );
}

const LevelField = ({ value, onChange }) => {
  const { t } = useTranslation();
  return (
    <select value={value ?? ''} onChange={(e) => onChange(e.target.value || null)}>
      <option value="">{t('admin.glossary.noLevel')}</option>
      {LEVELS.map((lv) => (
        <option key={lv} value={lv}>
          {t(`apprendre.levels.${lv}`)}
        </option>
      ))}
    </select>
  );
};

// ---- Terms ------------------------------------------------------------------
function TermsTab() {
  const { t, i18n } = useTranslation();
  const list = useApi('/admin/glossary/terms');
  const [editing, setEditing] = useState(null); // term row, or null
  const [draft, setDraft] = useState(null); // { term, definition, example, level, theme }
  const [resetKey, setResetKey] = useState(0);
  const [revisionsFor, setRevisionsFor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [newTermName, setNewTermName] = useState('');
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const run = async (action, okText) => {
    setBusy(true);
    setMessage(null);
    try {
      await action();
      setMessage({ kind: 'ok', text: okText });
      list.reload();
      return true;
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 422: 'admin.glossary.needsDefinition' })) });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const create = async (event) => {
    event.preventDefault();
    const res = await run(() => api.post('/admin/glossary/terms', { term: newTermName.trim() }), t('admin.glossary.saved'));
    if (res) {
      setNewTermName('');
      setAdding(false);
    }
  };

  const openEdit = (term) => {
    setMessage(null);
    setEditing(term);
    setDraft({ definition: term.definition, example: term.example ?? '', level: term.level, theme: term.theme ?? '' });
    setResetKey((k) => k + 1);
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    const body = { definition: draft.definition, example: draft.example.trim() || null, level: draft.level, theme: draft.theme.trim() || null };
    if (await run(() => api.patch(`/admin/glossary/terms/${editing.id}`, body), t('admin.glossary.saved'))) setEditing(null);
  };

  const remove = async () => {
    if (await run(() => api.delete(`/admin/glossary/terms/${deleteTarget.id}`), t('admin.glossary.deleted'))) setDeleteTarget(null);
  };

  if (list.status === 'loading') return <LoadingState />;
  if (list.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={list.reload} />;

  return (
    <div className="glossary-admin-section">
      <div className="glossary-admin-bar">
        <Button onClick={() => setAdding((v) => !v)} disabled={busy}>
          <Plus size={16} aria-hidden="true" />
          {t('admin.glossary.addTerm')}
        </Button>
      </div>

      {adding && (
        <form className="glossary-admin-inline-form" onSubmit={create}>
          <input value={newTermName} onChange={(e) => setNewTermName(e.target.value)} maxLength={120} placeholder={t('admin.glossary.termName')} autoFocus />
          <Button type="submit" disabled={busy || !newTermName.trim()}>
            {t('admin.glossary.save')}
          </Button>
        </form>
      )}

      {message && (
        <p className={`cms-inline-message ${message.kind}`} role={message.kind === 'error' ? 'alert' : 'status'}>
          {message.text}
        </p>
      )}

      {editing && (
        <form className="glossary-admin-form" onSubmit={saveEdit}>
          <h2>{editing.term}</h2>
          <Field label={t('admin.glossary.definition')} htmlFor="gt-def">
            <RichTextEditor id="gt-def" value={draft.definition} resetKey={resetKey} onChange={(html) => setDraft((d) => ({ ...d, definition: html }))} />
          </Field>
          <Field label={t('admin.glossary.example')} htmlFor="gt-ex">
            <RichTextEditor id="gt-ex" value={draft.example} resetKey={resetKey} onChange={(html) => setDraft((d) => ({ ...d, example: html }))} />
          </Field>
          <div className="glossary-admin-grid">
            <Field label={t('admin.glossary.level')} htmlFor="gt-level">
              <LevelField value={draft.level} onChange={(v) => setDraft((d) => ({ ...d, level: v }))} />
            </Field>
            <Field label={t('admin.glossary.theme')} htmlFor="gt-theme">
              <input id="gt-theme" value={draft.theme} maxLength={60} onChange={(e) => setDraft((d) => ({ ...d, theme: e.target.value }))} />
            </Field>
          </div>
          <div className="glossary-admin-actions">
            <Button type="submit" disabled={busy}>
              {t('admin.glossary.save')}
            </Button>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              {t('admin.glossary.cancel')}
            </Button>
          </div>
        </form>
      )}

      {revisionsFor && <RevisionsPanel term={revisionsFor} onClose={() => setRevisionsFor(null)} lang={i18n.language} />}

      {list.data.terms.length === 0 ? (
        <p className="cms-muted">{t('admin.glossary.noTerm')}</p>
      ) : (
        <ul className="glossary-admin-list">
          {list.data.terms.map((term) => (
            <li key={term.id} className="glossary-admin-item">
              <div className="glossary-admin-text">
                <strong>{term.term}</strong>
                <StatusBadge status={term.status} labelKey={`admin.status.${term.status}`} />
              </div>
              <div className="cms-row-actions">
                <button type="button" className="cms-icon-button" title={t('admin.glossary.revisions')} aria-label={`${t('admin.glossary.revisions')} — ${term.term}`} onClick={() => setRevisionsFor(term)}>
                  <History size={15} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="cms-icon-button"
                  title={term.status === 'published' ? t('admin.glossary.unpublish') : t('admin.glossary.publish')}
                  aria-label={`${term.status === 'published' ? t('admin.glossary.unpublish') : t('admin.glossary.publish')} — ${term.term}`}
                  disabled={busy}
                  onClick={() => run(() => api.post(`/admin/glossary/terms/${term.id}/${term.status === 'published' ? 'unpublish' : 'publish'}`), term.status === 'published' ? t('admin.glossary.unpublished') : t('admin.glossary.published'))}
                >
                  {term.status === 'published' ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
                </button>
                <button type="button" className="cms-icon-button" title={t('admin.glossary.edit')} aria-label={`${t('admin.glossary.edit')} — ${term.term}`} onClick={() => openEdit(term)}>
                  <Pencil size={15} aria-hidden="true" />
                </button>
                <button type="button" className="cms-icon-button danger" title={t('admin.glossary.delete')} aria-label={`${t('admin.glossary.delete')} — ${term.term}`} onClick={() => setDeleteTarget(term)}>
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog open={Boolean(deleteTarget)} title={t('admin.glossary.delete')} confirmLabel={t('admin.glossary.delete')} danger busy={busy} onConfirm={remove} onCancel={() => setDeleteTarget(null)}>
        <p>{t('admin.glossary.deleteTermConfirm', { term: deleteTarget?.term ?? '' })}</p>
      </ConfirmDialog>
    </div>
  );
}

function RevisionsPanel({ term, onClose, lang }) {
  const { t } = useTranslation();
  const revisions = useApi(`/admin/glossary/terms/${term.id}/revisions`);
  return (
    <div className="glossary-revisions">
      <div className="glossary-revisions-head">
        <h2>{t('admin.glossary.revisionsFor', { term: term.term })}</h2>
        <Button variant="secondary" onClick={onClose}>
          {t('admin.glossary.close')}
        </Button>
      </div>
      {revisions.status === 'loading' && <LoadingState />}
      {revisions.status === 'ready' && revisions.data.revisions.length === 0 && <p className="cms-muted">{t('admin.glossary.noRevision')}</p>}
      {revisions.status === 'ready' && (
        <ol className="glossary-revisions-list">
          {revisions.data.revisions.map((r) => (
            <li key={r.id}>
              <time>{formatDate(lang, r.createdAt)}</time>
              <div dangerouslySetInnerHTML={{ __html: r.definition }} />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// ---- Guides -------------------------------------------------------------------
function GuidesTab() {
  const { t } = useTranslation();
  const list = useApi('/admin/glossary/guides');
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(null);
  const [resetKey, setResetKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const run = async (action, okText) => {
    setBusy(true);
    setMessage(null);
    try {
      await action();
      setMessage({ kind: 'ok', text: okText });
      list.reload();
      return true;
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 422: 'admin.glossary.needsBody', 409: 'admin.glossary.changed' })) });
      if (err.status === 409) list.reload();
      return false;
    } finally {
      setBusy(false);
    }
  };

  const create = async (event) => {
    event.preventDefault();
    if (await run(() => api.post('/admin/glossary/guides', { title: newTitle.trim() }), t('admin.glossary.saved'))) {
      setNewTitle('');
      setAdding(false);
    }
  };

  const openEdit = (guide) => {
    setMessage(null);
    setEditing(guide);
    setDraft({ body: guide.body, level: guide.level, theme: guide.theme ?? '' });
    setResetKey((k) => k + 1);
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    const body = { body: draft.body, level: draft.level, theme: draft.theme.trim() || null };
    if (await run(() => api.patch(`/admin/glossary/guides/${editing.id}`, body), t('admin.glossary.saved'))) setEditing(null);
  };

  const remove = async () => {
    if (await run(() => api.delete(`/admin/glossary/guides/${deleteTarget.id}`), t('admin.glossary.deleted'))) setDeleteTarget(null);
  };

  const move = (from, to) => {
    const ids = list.data.guides.map((g) => g.id);
    const [moved] = ids.splice(from, 1);
    ids.splice(to, 0, moved);
    run(() => api.put('/admin/glossary/guides/order', { ids }), t('admin.glossary.reordered'));
  };

  if (list.status === 'loading') return <LoadingState />;
  if (list.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={list.reload} />;

  return (
    <div className="glossary-admin-section">
      <div className="glossary-admin-bar">
        <Button onClick={() => setAdding((v) => !v)} disabled={busy}>
          <Plus size={16} aria-hidden="true" />
          {t('admin.glossary.addGuide')}
        </Button>
      </div>

      {adding && (
        <form className="glossary-admin-inline-form" onSubmit={create}>
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} maxLength={150} placeholder={t('admin.glossary.guideTitle')} autoFocus />
          <Button type="submit" disabled={busy || !newTitle.trim()}>
            {t('admin.glossary.save')}
          </Button>
        </form>
      )}

      {message && (
        <p className={`cms-inline-message ${message.kind}`} role={message.kind === 'error' ? 'alert' : 'status'}>
          {message.text}
        </p>
      )}

      {editing && (
        <form className="glossary-admin-form" onSubmit={saveEdit}>
          <h2>{editing.title}</h2>
          <Field label={t('admin.glossary.guideBody')} htmlFor="mg-body">
            <RichTextEditor id="mg-body" value={draft.body} resetKey={resetKey} onChange={(html) => setDraft((d) => ({ ...d, body: html }))} />
          </Field>
          <div className="glossary-admin-grid">
            <Field label={t('admin.glossary.level')} htmlFor="mg-level">
              <LevelField value={draft.level} onChange={(v) => setDraft((d) => ({ ...d, level: v }))} />
            </Field>
            <Field label={t('admin.glossary.theme')} htmlFor="mg-theme">
              <input id="mg-theme" value={draft.theme} maxLength={60} onChange={(e) => setDraft((d) => ({ ...d, theme: e.target.value }))} />
            </Field>
          </div>
          <div className="glossary-admin-actions">
            <Button type="submit" disabled={busy}>
              {t('admin.glossary.save')}
            </Button>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              {t('admin.glossary.cancel')}
            </Button>
          </div>
        </form>
      )}

      {list.data.guides.length === 0 ? (
        <p className="cms-muted">{t('admin.glossary.noGuide')}</p>
      ) : (
        <ol className="glossary-admin-list">
          {list.data.guides.map((guide, index) => (
            <li key={guide.id} className="glossary-admin-item">
              <MoveButtons index={index} count={list.data.guides.length} onMove={move} disabled={busy} />
              <div className="glossary-admin-text">
                <strong>{guide.title}</strong>
                <StatusBadge status={guide.status} labelKey={`admin.status.${guide.status}`} />
              </div>
              <div className="cms-row-actions">
                <button
                  type="button"
                  className="cms-icon-button"
                  title={guide.status === 'published' ? t('admin.glossary.unpublish') : t('admin.glossary.publish')}
                  aria-label={`${guide.status === 'published' ? t('admin.glossary.unpublish') : t('admin.glossary.publish')} — ${guide.title}`}
                  disabled={busy}
                  onClick={() => run(() => api.post(`/admin/glossary/guides/${guide.id}/${guide.status === 'published' ? 'unpublish' : 'publish'}`), guide.status === 'published' ? t('admin.glossary.unpublished') : t('admin.glossary.published'))}
                >
                  {guide.status === 'published' ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
                </button>
                <button type="button" className="cms-icon-button" title={t('admin.glossary.edit')} aria-label={`${t('admin.glossary.edit')} — ${guide.title}`} onClick={() => openEdit(guide)}>
                  <Pencil size={15} aria-hidden="true" />
                </button>
                <button type="button" className="cms-icon-button danger" title={t('admin.glossary.delete')} aria-label={`${t('admin.glossary.delete')} — ${guide.title}`} onClick={() => setDeleteTarget(guide)}>
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <ConfirmDialog open={Boolean(deleteTarget)} title={t('admin.glossary.delete')} confirmLabel={t('admin.glossary.delete')} danger busy={busy} onConfirm={remove} onCancel={() => setDeleteTarget(null)}>
        <p>{t('admin.glossary.deleteGuideConfirm', { title: deleteTarget?.title ?? '' })}</p>
      </ConfirmDialog>
    </div>
  );
}
