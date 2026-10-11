import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, ListTree, MessagesSquare, Plus, ScrollText, Trash2 } from 'lucide-react';
import { api, errorKey } from '../../../lib/api.js';
import { useApi } from '../../../lib/useApi.js';
import { formatDate } from '../../../lib/format.js';
import Button from '../../../components/ui/Button.jsx';
import ErrorState from '../../../components/ui/ErrorState.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import ConfirmDialog from '../../../components/cms/ConfirmDialog.jsx';
import Field from '../../../components/cms/Field.jsx';
import PageToolbar from '../../../components/cms/PageToolbar.jsx';
import RichTextEditor from '../../../components/cms/RichTextEditor.jsx';
import StatusBadge from '../../../components/cms/StatusBadge.jsx';
import './FinAssistantAdmin.css';

const DEEP_LINKS = ['', '/', '/apprendre', '/blog', '/formations', '/outils', '/outils/comparateur', '/outils/simulateurs', '/outils/atelier', '/outils/offres-emploi', '/contact', '/faq'];

// Administration of the FINCLUDIA deterministic assistant (P3-19). The 8
// intents are the client's own closed list (13_Chatbot): only their keywords,
// response and deep link are editable here, never their code.
export default function FinAssistantAdminPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('intents');

  return (
    <>
      <PageToolbar title={t('admin.finAssistant.title')} subtitle={t('admin.finAssistant.subtitle')} />
      <div className="fa-admin-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'intents'} className={tab === 'intents' ? 'active' : ''} onClick={() => setTab('intents')}>
          <MessagesSquare size={16} aria-hidden="true" />
          {t('admin.finAssistant.intents')}
        </button>
        <button type="button" role="tab" aria-selected={tab === 'flows'} className={tab === 'flows' ? 'active' : ''} onClick={() => setTab('flows')}>
          <ListTree size={16} aria-hidden="true" />
          {t('admin.finAssistant.flows')}
        </button>
        <button type="button" role="tab" aria-selected={tab === 'audit'} className={tab === 'audit' ? 'active' : ''} onClick={() => setTab('audit')}>
          <ScrollText size={16} aria-hidden="true" />
          {t('admin.finAssistant.audit')}
        </button>
      </div>
      {tab === 'intents' && <IntentsTab />}
      {tab === 'flows' && <FlowsTab />}
      {tab === 'audit' && <AuditTab />}
    </>
  );
}

// ---- Intents ------------------------------------------------------------------
function IntentsTab() {
  const { t } = useTranslation();
  const list = useApi('/admin/fin-assistant/intents');
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(null);
  const [resetKey, setResetKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const run = async (action, okText) => {
    setBusy(true);
    setMessage(null);
    try {
      await action();
      setMessage({ kind: 'ok', text: okText });
      list.reload();
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 422: 'admin.finAssistant.needsResponse' })) });
    } finally {
      setBusy(false);
    }
  };

  const openEdit = (intent) => {
    setMessage(null);
    setEditing(intent);
    setDraft({ responseTemplate: intent.responseTemplate, keywords: intent.keywords.join(', '), deepLinkPath: intent.deepLinkPath ?? '' });
    setResetKey((k) => k + 1);
  };

  const save = async (event) => {
    event.preventDefault();
    const body = {
      responseTemplate: draft.responseTemplate,
      keywords: draft.keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
      deepLinkPath: draft.deepLinkPath || null,
    };
    await run(() => api.patch(`/admin/fin-assistant/intents/${editing.id}`, body), t('admin.finAssistant.saved'));
    setEditing(null);
  };

  if (list.status === 'loading') return <LoadingState />;
  if (list.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={list.reload} />;

  return (
    <div className="fa-admin-section">
      <p className="form-hint fa-admin-note">{t('admin.finAssistant.intentsNote')}</p>
      {message && (
        <p className={`cms-inline-message ${message.kind}`} role={message.kind === 'error' ? 'alert' : 'status'}>
          {message.text}
        </p>
      )}

      {editing && (
        <form className="fa-admin-form" onSubmit={save}>
          <h2>{editing.label}</h2>
          <p className="form-hint">{t('admin.finAssistant.example', { example: editing.exampleQuery })}</p>
          <Field label={t('admin.finAssistant.keywords')} htmlFor="fi-keywords" hint={t('admin.finAssistant.keywordsHint')}>
            <input id="fi-keywords" value={draft.keywords} onChange={(e) => setDraft((d) => ({ ...d, keywords: e.target.value }))} />
          </Field>
          <Field label={t('admin.finAssistant.response')} htmlFor="fi-response">
            <RichTextEditor id="fi-response" value={draft.responseTemplate} resetKey={resetKey} onChange={(html) => setDraft((d) => ({ ...d, responseTemplate: html }))} />
          </Field>
          <Field label={t('admin.finAssistant.deepLink')} htmlFor="fi-link" hint={t('admin.finAssistant.deepLinkHint')}>
            <select id="fi-link" value={draft.deepLinkPath} onChange={(e) => setDraft((d) => ({ ...d, deepLinkPath: e.target.value }))}>
              {DEEP_LINKS.map((path) => (
                <option key={path} value={path}>
                  {path || t('admin.finAssistant.noLink')}
                </option>
              ))}
            </select>
          </Field>
          <div className="fa-admin-actions">
            <Button type="submit" disabled={busy}>
              {t('admin.finAssistant.save')}
            </Button>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              {t('admin.finAssistant.cancel')}
            </Button>
          </div>
        </form>
      )}

      <ul className="fa-admin-list">
        {list.data.intents.map((intent) => (
          <li key={intent.id} className="fa-admin-item">
            <div className="fa-admin-text">
              <strong>{intent.label}</strong>
              <code>{intent.code}</code>
              <StatusBadge status={intent.status} labelKey={`admin.status.${intent.status}`} />
            </div>
            <div className="cms-row-actions">
              <button
                type="button"
                className="cms-icon-button"
                title={intent.status === 'published' ? t('admin.finAssistant.unpublish') : t('admin.finAssistant.publish')}
                aria-label={`${intent.status === 'published' ? t('admin.finAssistant.unpublish') : t('admin.finAssistant.publish')} — ${intent.label}`}
                disabled={busy}
                onClick={() => run(() => api.post(`/admin/fin-assistant/intents/${intent.id}/${intent.status === 'published' ? 'unpublish' : 'publish'}`), intent.status === 'published' ? t('admin.finAssistant.unpublished') : t('admin.finAssistant.published'))}
              >
                {intent.status === 'published' ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
              </button>
              <Button variant="secondary" onClick={() => openEdit(intent)}>
                {t('admin.finAssistant.edit')}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---- Flows --------------------------------------------------------------------
function FlowsTab() {
  const { t } = useTranslation();
  const list = useApi('/admin/fin-assistant/flows');
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
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
      setMessage({ kind: 'error', text: t(errorKey(err, { 422: 'admin.finAssistant.needsStep' })) });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const create = async (event) => {
    event.preventDefault();
    if (await run(() => api.post('/admin/fin-assistant/flows', { name: newName.trim() }), t('admin.finAssistant.saved'))) {
      setNewName('');
      setAdding(false);
    }
  };

  const remove = async () => {
    if (await run(() => api.delete(`/admin/fin-assistant/flows/${deleteTarget.id}`), t('admin.finAssistant.deleted'))) setDeleteTarget(null);
  };

  if (list.status === 'loading') return <LoadingState />;
  if (list.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={list.reload} />;

  return (
    <div className="fa-admin-section">
      <p className="form-hint fa-admin-note">{t('admin.finAssistant.flowsNote')}</p>
      <Button onClick={() => setAdding((v) => !v)} disabled={busy}>
        <Plus size={16} aria-hidden="true" />
        {t('admin.finAssistant.addFlow')}
      </Button>

      {adding && (
        <form className="fa-admin-inline-form" onSubmit={create}>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={150} placeholder={t('admin.finAssistant.flowName')} autoFocus />
          <Button type="submit" disabled={busy || !newName.trim()}>
            {t('admin.finAssistant.save')}
          </Button>
        </form>
      )}

      {message && (
        <p className={`cms-inline-message ${message.kind}`} role={message.kind === 'error' ? 'alert' : 'status'}>
          {message.text}
        </p>
      )}

      {list.data.flows.length === 0 ? (
        <p className="cms-muted">{t('admin.finAssistant.noFlow')}</p>
      ) : (
        <ul className="fa-admin-list">
          {list.data.flows.map((flow) => (
            <li key={flow.id} className="fa-admin-item">
              <div className="fa-admin-text">
                <strong>{flow.name}</strong>
                <span className="fa-admin-steps">{t('admin.finAssistant.stepCount', { count: flow.stepCount })}</span>
                <StatusBadge status={flow.status} labelKey={`admin.status.${flow.status}`} />
              </div>
              <div className="cms-row-actions">
                <button
                  type="button"
                  className="cms-icon-button"
                  title={flow.status === 'published' ? t('admin.finAssistant.unpublish') : t('admin.finAssistant.publish')}
                  aria-label={`${flow.status === 'published' ? t('admin.finAssistant.unpublish') : t('admin.finAssistant.publish')} — ${flow.name}`}
                  disabled={busy}
                  onClick={() => run(() => api.post(`/admin/fin-assistant/flows/${flow.id}/${flow.status === 'published' ? 'unpublish' : 'publish'}`), flow.status === 'published' ? t('admin.finAssistant.unpublished') : t('admin.finAssistant.published'))}
                >
                  {flow.status === 'published' ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
                </button>
                <button type="button" className="cms-icon-button danger" title={t('admin.finAssistant.delete')} aria-label={`${t('admin.finAssistant.delete')} — ${flow.name}`} onClick={() => setDeleteTarget(flow)}>
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog open={Boolean(deleteTarget)} title={t('admin.finAssistant.delete')} confirmLabel={t('admin.finAssistant.delete')} danger busy={busy} onConfirm={remove} onCancel={() => setDeleteTarget(null)}>
        <p>{t('admin.finAssistant.deleteFlowConfirm', { name: deleteTarget?.name ?? '' })}</p>
      </ConfirmDialog>
    </div>
  );
}

// ---- Audit log (read-only) ------------------------------------------------------
function AuditTab() {
  const { t, i18n } = useTranslation();
  const list = useApi('/admin/fin-assistant/audit-log');

  if (list.status === 'loading') return <LoadingState />;
  if (list.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={list.reload} />;

  return (
    <div className="fa-admin-section">
      <p className="form-hint fa-admin-note">{t('admin.finAssistant.auditNote')}</p>
      {list.data.entries.length === 0 ? (
        <p className="cms-muted">{t('admin.finAssistant.noAudit')}</p>
      ) : (
        <table className="fa-audit-table">
          <thead>
            <tr>
              <th scope="col">{t('admin.finAssistant.auditDate')}</th>
              <th scope="col">{t('admin.finAssistant.auditAction')}</th>
              <th scope="col">{t('admin.finAssistant.auditTarget')}</th>
            </tr>
          </thead>
          <tbody>
            {list.data.entries.map((e) => (
              <tr key={e.id}>
                <td>{formatDate(i18n.language, e.createdAt)}</td>
                <td>{t(`admin.finAssistant.actions.${e.action}`)}</td>
                <td>{e.intentCode ?? e.flowKey ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
