import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, HelpCircle, ListTree, MessagesSquare, Plus, ScrollText, Trash2 } from 'lucide-react';
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
import ChatbotAdminPage from '../chatbot/ChatbotAdminPage.jsx';
import { APP_NAV, SETTINGS_LINKS } from '../../../config/appNavigation.js';
import './FinAssistantAdmin.css';

const TABS = ['questions', 'intents', 'flows', 'audit'];
const TAB_ICONS = { questions: HelpCircle, intents: MessagesSquare, flows: ListTree, audit: ScrollText };
// French is the answer itself; these are its translations (R11-05).
const LANGS = ['fr', 'en', 'ar'];

// A rich text with nothing written in it ("<p></p>") is no answer at all.
const hasText = (html) => Boolean((html ?? '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim());

// The name of a screen an answer may open: the menu's own name when it has
// one, its address otherwise (R11-05: every screen, not a dozen).
const MENU_LABELS = new Map([...APP_NAV, ...SETTINGS_LINKS].map((entry) => [entry.to, entry.labelKey]));
const screenLabel = (t, path) => (MENU_LABELS.has(path) ? `${t(MENU_LABELS.get(path))} — ${path}` : path);

// One assistant, « Une question ? », the same on the site and in the
// application (recette R11-03): only its questions differ. Its four parts sit on
// one screen — the questions people pick, the automatic answers to a typed
// sentence, the guided paths, and the log.
export default function FinAssistantAdminPage() {
  const { t } = useTranslation();
  const { pathname, search } = useLocation();
  const asked = new URLSearchParams(search).get('onglet');
  const [tab, setTab] = useState(TABS.includes(asked) ? asked : pathname.endsWith('assistant-fincludia') ? 'intents' : 'questions');

  return (
    <>
      <PageToolbar title={t('admin.finAssistant.title')} subtitle={t('admin.finAssistant.subtitle')} />
      <div className="fa-admin-tabs" role="tablist">
        {TABS.map((key) => {
          const Icon = TAB_ICONS[key];
          return (
            <button key={key} type="button" role="tab" aria-selected={tab === key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>
              <Icon size={16} aria-hidden="true" />
              {t(`admin.finAssistant.tabs.${key}`)}
            </button>
          );
        })}
      </div>
      <p className="form-hint fa-admin-note">{t(`admin.finAssistant.${tab}Note`)}</p>
      {tab === 'questions' && <ChatbotAdminPage embedded />}
      {tab === 'intents' && <IntentsTab />}
      {tab === 'flows' && <FlowsTab />}
      {tab === 'audit' && <AuditTab />}
    </>
  );
}

// ---- Automatic answers (intents) ------------------------------------------------
function IntentsTab() {
  const { t } = useTranslation();
  const list = useApi('/admin/fin-assistant/intents');
  const [editing, setEditing] = useState(null); // an intent, or { new: true }
  const [draft, setDraft] = useState(null);
  const [lang, setLang] = useState('fr');
  const [resetKey, setResetKey] = useState(0);
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
      setMessage({ kind: 'error', text: t(errorKey(err, { 422: 'admin.finAssistant.needsResponse' })) });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const openEdit = (intent) => {
    setMessage(null);
    setEditing(intent ?? { new: true, custom: true, status: 'draft' });
    const texts = { fr: { label: intent?.label ?? '', responseTemplate: intent?.responseTemplate ?? '' } };
    for (const code of LANGS.slice(1)) texts[code] = { label: intent?.translations?.[code]?.label ?? '', responseTemplate: intent?.translations?.[code]?.responseTemplate ?? '' };
    setDraft({ texts, keywords: (intent?.keywords ?? []).join(', '), deepLinkPath: intent?.deepLinkPath ?? '' });
    setLang('fr');
    setResetKey((k) => k + 1);
  };

  const save = async (publish) => {
    const keywords = draft.keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
    const translations = Object.fromEntries(LANGS.slice(1).map((code) => [code, { label: draft.texts[code].label.trim(), responseTemplate: draft.texts[code].responseTemplate || '' }]));
    const body = { responseTemplate: draft.texts.fr.responseTemplate || '<p></p>', keywords, deepLinkPath: draft.deepLinkPath || null, translations };
    if (editing.custom) body.label = draft.texts.fr.label.trim();
    if (editing.new && (!body.label || keywords.length === 0)) {
      setMessage({ kind: 'error', text: t('admin.finAssistant.newNeeds') });
      return;
    }
    const ok = await run(async () => {
      const id = editing.new ? (await api.post('/admin/fin-assistant/intents', body)).intent.id : (await api.patch(`/admin/fin-assistant/intents/${editing.id}`, body)).intent.id;
      if (publish) await api.post(`/admin/fin-assistant/intents/${id}/publish`);
    }, publish ? t('admin.finAssistant.published') : t('admin.finAssistant.saved'));
    if (ok) setEditing(null);
  };

  const toggle = (intent) =>
    run(
      () => api.post(`/admin/fin-assistant/intents/${intent.id}/${intent.status === 'published' ? 'unpublish' : 'publish'}`),
      intent.status === 'published' ? t('admin.finAssistant.unpublished') : t('admin.finAssistant.published'),
    );

  const remove = async () => {
    if (await run(() => api.delete(`/admin/fin-assistant/intents/${deleteTarget.id}`), t('admin.finAssistant.deleted'))) setDeleteTarget(null);
  };

  if (list.status === 'loading') return <LoadingState />;
  if (list.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={list.reload} />;

  const published = list.data.intents.filter((intent) => intent.status === 'published').length;
  const deepLinks = list.data.deepLinks ?? [];
  const appLinks = deepLinks.filter((path) => path.startsWith('/app'));
  const siteLinks = deepLinks.filter((path) => !path.startsWith('/app'));
  const translated = (intent, code) => (code === 'fr' ? hasText(intent.responseTemplate) : hasText(intent.translations?.[code]?.responseTemplate));
  const text = draft?.texts[lang];
  const setText = (patch) => setDraft((d) => ({ ...d, texts: { ...d.texts, [lang]: { ...d.texts[lang], ...patch } } }));

  return (
    <div className="fa-admin-section">
      <Button onClick={() => openEdit(null)} disabled={busy}>
        <Plus size={16} aria-hidden="true" />
        {t('admin.finAssistant.addIntent')}
      </Button>
      <p className="fa-admin-count">{t('admin.finAssistant.publishedCount', { n: published, total: list.data.intents.length })}</p>
      {message && (
        <p className={`cms-inline-message ${message.kind}`} role={message.kind === 'error' ? 'alert' : 'status'}>
          {message.text}
        </p>
      )}

      {editing && (
        <form
          className="fa-admin-form"
          onSubmit={(event) => {
            event.preventDefault();
            save(false);
          }}
        >
          <h2>{editing.new ? t('admin.finAssistant.addIntent') : editing.label}</h2>
          {!editing.new && <p className="form-hint">{t('admin.finAssistant.example', { example: editing.exampleQuery })}</p>}
          {/* What the client's own file allows (answer, questions, guard-rail): the
              administrator's reference for the public text, never shown to the public. */}
          {editing.reference && (
            <aside className="fa-admin-reference" aria-label={t('admin.finAssistant.referenceTitle')}>
              <h3>{t('admin.finAssistant.referenceTitle')}</h3>
              <p>
                <strong>{t('admin.finAssistant.referenceAnswer')}</strong> {editing.reference.answer}
              </p>
              {editing.reference.steps?.length > 0 && (
                <p>
                  <strong>{t('admin.finAssistant.referenceSteps')}</strong> {editing.reference.steps.join(' · ')}
                </p>
              )}
              <p>
                <strong>{t('admin.finAssistant.referenceGuardrail')}</strong> {editing.reference.guardrail}
              </p>
            </aside>
          )}
          <Field label={t('admin.finAssistant.keywords')} htmlFor="fi-keywords" hint={t('admin.finAssistant.keywordsHintAll')}>
            <input id="fi-keywords" value={draft.keywords} onChange={(e) => setDraft((d) => ({ ...d, keywords: e.target.value }))} />
          </Field>

          <div className="chatbot-admin-langs" role="tablist" aria-label={t('chatbot.admin.language')}>
            {LANGS.map((code) => {
              const done = hasText(draft.texts[code].responseTemplate);
              return (
                <button
                  key={code}
                  type="button"
                  role="tab"
                  aria-selected={lang === code}
                  className={`chatbot-admin-lang ${lang === code ? 'active' : ''} ${done ? 'done' : 'missing'}`}
                  onClick={() => {
                    setLang(code);
                    setResetKey((k) => k + 1);
                  }}
                >
                  {t(`contentLanguage.names.${code}`)}
                  <span>{done ? t('chatbot.admin.translated') : code === 'fr' ? t('chatbot.admin.toWrite') : t('chatbot.admin.toTranslate')}</span>
                </button>
              );
            })}
          </div>
          {(editing.custom || lang !== 'fr') && (
            <Field label={`${t('admin.finAssistant.intentLabel')} (${t(`contentLanguage.names.${lang}`)})`} htmlFor="fi-label">
              <input id="fi-label" dir={lang === 'ar' ? 'rtl' : 'ltr'} maxLength={120} value={text.label} placeholder={lang !== 'fr' ? editing.label ?? '' : ''} onChange={(e) => setText({ label: e.target.value })} />
            </Field>
          )}
          <Field label={`${t('admin.finAssistant.response')} (${t(`contentLanguage.names.${lang}`)})`} htmlFor="fi-response" hint={lang === 'fr' ? t('admin.finAssistant.responseHint') : t('admin.finAssistant.translationHint')}>
            <RichTextEditor id="fi-response" value={text.responseTemplate} resetKey={`${resetKey}-${lang}`} onChange={(html) => setText({ responseTemplate: html })} />
          </Field>

          <Field label={t('admin.finAssistant.deepLink')} htmlFor="fi-link" hint={t('admin.finAssistant.deepLinkHintAll')}>
            <select id="fi-link" value={draft.deepLinkPath} onChange={(e) => setDraft((d) => ({ ...d, deepLinkPath: e.target.value }))}>
              <option value="">{t('admin.finAssistant.noLink')}</option>
              <optgroup label={t('admin.finAssistant.screensApp')}>
                {appLinks.map((path) => (
                  <option key={path} value={path}>
                    {screenLabel(t, path)}
                  </option>
                ))}
              </optgroup>
              <optgroup label={t('admin.finAssistant.screensSite')}>
                {siteLinks.map((path) => (
                  <option key={path} value={path}>
                    {path}
                  </option>
                ))}
              </optgroup>
            </select>
          </Field>
          <div className="fa-admin-actions">
            {editing.status !== 'published' && (
              <Button type="button" disabled={busy || !hasText(draft.texts.fr.responseTemplate)} onClick={() => save(true)}>
                {t('admin.finAssistant.saveAndPublish')}
              </Button>
            )}
            <Button type="submit" variant={editing.status === 'published' ? 'primary' : 'secondary'} disabled={busy}>
              {t('admin.finAssistant.save')}
            </Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              {t('admin.finAssistant.cancel')}
            </Button>
          </div>
        </form>
      )}

      <ul className="fa-admin-list">
        {list.data.intents.map((intent) => {
          const ready = hasText(intent.responseTemplate);
          return (
            <li key={intent.id} className="fa-admin-item">
              <div className="fa-admin-text">
                <strong>{intent.label}</strong>
                <StatusBadge status={intent.status} labelKey={`admin.status.${intent.status}`} />
                {!ready && <span className="fa-admin-missing">{t('admin.finAssistant.answerMissing')}</span>}
                {ready && (
                  <span className="chatbot-admin-lang-chips">
                    {LANGS.map((code) => (
                      <span key={code} className={`chatbot-admin-chip ${translated(intent, code) ? 'done' : 'missing'}`} title={t(`contentLanguage.names.${code}`)}>
                        {code.toUpperCase()} {translated(intent, code) ? '✓' : t('chatbot.admin.missingShort')}
                      </span>
                    ))}
                  </span>
                )}
              </div>
              <div className="cms-row-actions">
                {ready ? (
                  <Button variant="secondary" disabled={busy} onClick={() => toggle(intent)}>
                    {intent.status === 'published' ? t('admin.finAssistant.unpublish') : t('admin.finAssistant.publish')}
                  </Button>
                ) : null}
                <Button variant={ready ? 'ghost' : 'secondary'} onClick={() => openEdit(intent)}>
                  {ready ? t('admin.finAssistant.edit') : t('admin.finAssistant.writeAnswer')}
                </Button>
                {intent.custom && (
                  <button type="button" className="cms-icon-button danger" title={t('admin.finAssistant.delete')} aria-label={`${t('admin.finAssistant.delete')} — ${intent.label}`} onClick={() => setDeleteTarget(intent)}>
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <ConfirmDialog open={Boolean(deleteTarget)} title={t('admin.finAssistant.delete')} confirmLabel={t('admin.finAssistant.delete')} danger busy={busy} onConfirm={remove} onCancel={() => setDeleteTarget(null)}>
        <p>{t('admin.finAssistant.deleteIntentConfirm', { name: deleteTarget?.label ?? '' })}</p>
      </ConfirmDialog>
    </div>
  );
}

// ---- Guided paths (flows) ------------------------------------------------------
function FlowsTab() {
  const { t } = useTranslation();
  const list = useApi('/admin/fin-assistant/flows');
  const intents = useApi('/admin/fin-assistant/intents');
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const run = async (action, okText) => {
    setBusy(true);
    setMessage(null);
    try {
      const result = await action();
      setMessage({ kind: 'ok', text: okText });
      list.reload();
      return result ?? true;
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 422: 'admin.finAssistant.needsStep' })) });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const create = async (event) => {
    event.preventDefault();
    const created = await run(() => api.post('/admin/fin-assistant/flows', { name: newName.trim() }), t('admin.finAssistant.flowCreated'));
    if (created) {
      setNewName('');
      setAdding(false);
      // Straight to its steps: a path with none can be neither used nor published.
      if (created.flow?.id) setOpenId(created.flow.id);
    }
  };

  const remove = async () => {
    if (await run(() => api.delete(`/admin/fin-assistant/flows/${deleteTarget.id}`), t('admin.finAssistant.deleted'))) setDeleteTarget(null);
  };

  if (list.status === 'loading') return <LoadingState />;
  if (list.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={list.reload} />;

  const intentChoices = intents.status === 'ready' ? intents.data.intents : [];

  return (
    <div className="fa-admin-section">
      <Button onClick={() => setAdding((v) => !v)} disabled={busy}>
        <Plus size={16} aria-hidden="true" />
        {t('admin.finAssistant.addFlow')}
      </Button>

      {adding && (
        <form className="fa-admin-inline-form" onSubmit={create}>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={150} placeholder={t('admin.finAssistant.flowName')} aria-label={t('admin.finAssistant.flowName')} autoFocus />
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
            <li key={flow.id} className="fa-admin-item fa-admin-flow">
              <div className="fa-admin-flow-head">
                <div className="fa-admin-text">
                  <strong>{flow.name}</strong>
                  <span className="fa-admin-steps">{t('admin.finAssistant.stepCount', { count: flow.stepCount })}</span>
                  <StatusBadge status={flow.status} labelKey={`admin.status.${flow.status}`} />
                </div>
                <div className="cms-row-actions">
                  <Button variant="secondary" aria-expanded={openId === flow.id} onClick={() => setOpenId(openId === flow.id ? null : flow.id)}>
                    {openId === flow.id ? <ChevronUp size={15} aria-hidden="true" /> : <ChevronDown size={15} aria-hidden="true" />}
                    {t('admin.finAssistant.steps')}
                  </Button>
                  {flow.stepCount > 0 && (
                    <Button
                      variant="secondary"
                      disabled={busy}
                      onClick={() =>
                        run(
                          () => api.post(`/admin/fin-assistant/flows/${flow.id}/${flow.status === 'published' ? 'unpublish' : 'publish'}`),
                          flow.status === 'published' ? t('admin.finAssistant.unpublished') : t('admin.finAssistant.published'),
                        )
                      }
                    >
                      {flow.status === 'published' ? t('admin.finAssistant.unpublish') : t('admin.finAssistant.publish')}
                    </Button>
                  )}
                  <button type="button" className="cms-icon-button danger" title={t('admin.finAssistant.delete')} aria-label={`${t('admin.finAssistant.delete')} — ${flow.name}`} onClick={() => setDeleteTarget(flow)}>
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>
              </div>
              {openId === flow.id && <FlowSteps flow={flow} intents={intentChoices} onChanged={list.reload} />}
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

const NEXT = '__next';
const emptyOption = () => ({ label: '', target: '' });

// Where a choice leads, as one select value: the end, a step, the next step
// (created afterwards), or an automatic answer.
const targetOf = (option) => (option.nextStepKey ? `step:${option.nextStepKey}` : option.intentCode ? `intent:${option.intentCode}` : '');

// The steps of one path: each asks a question and offers up to 8 choices.
function FlowSteps({ flow, intents, onChanged }) {
  const { t } = useTranslation();
  const detail = useApi(`/admin/fin-assistant/flows/${flow.id}`);
  const [prompt, setPrompt] = useState('');
  const [options, setOptions] = useState([emptyOption()]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  if (detail.status === 'loading') return <LoadingState />;
  if (detail.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={detail.reload} />;

  const steps = detail.data.flow.steps;
  const numberOf = (key) => steps.findIndex((s) => s.stepKey === key) + 1;
  const nextNumber = steps.reduce((max, s) => Math.max(max, Number(/^etape-(\d+)$/.exec(s.stepKey)?.[1] ?? 0)), steps.length) + 1;
  const newKey = `etape-${nextNumber}`;

  const describe = (option) => {
    if (option.nextStepKey) {
      const n = numberOf(option.nextStepKey);
      return n > 0 ? t('admin.finAssistant.targetStep', { n }) : t('admin.finAssistant.targetNext');
    }
    if (option.intentCode) {
      const intent = intents.find((i) => i.code === option.intentCode);
      return t('admin.finAssistant.targetIntent', { label: intent?.label ?? option.intentCode });
    }
    return t('admin.finAssistant.targetEnd');
  };

  const act = async (action, okText) => {
    setBusy(true);
    setMessage(null);
    try {
      await action();
      setMessage({ kind: 'ok', text: okText });
      detail.reload();
      onChanged();
      return true;
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 409: 'admin.finAssistant.stepExists' })) });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const add = async (event) => {
    event.preventDefault();
    const body = {
      stepKey: newKey,
      prompt: prompt.trim(),
      options: options
        .filter((o) => o.label.trim())
        .map((o) => ({
          label: o.label.trim(),
          nextStepKey: o.target === NEXT ? `etape-${nextNumber + 1}` : o.target.startsWith('step:') ? o.target.slice(5) : null,
          intentCode: o.target.startsWith('intent:') ? o.target.slice(7) : null,
        })),
    };
    if (await act(() => api.post(`/admin/fin-assistant/flows/${flow.id}/steps`, body), t('admin.finAssistant.stepAdded'))) {
      setPrompt('');
      setOptions([emptyOption()]);
    }
  };

  const setOption = (index, patch) => setOptions((list) => list.map((o, i) => (i === index ? { ...o, ...patch } : o)));

  return (
    <div className="fa-flow-steps">
      {message && (
        <p className={`cms-inline-message ${message.kind}`} role={message.kind === 'error' ? 'alert' : 'status'}>
          {message.text}
        </p>
      )}
      {steps.length === 0 ? (
        <p className="cms-muted">{t('admin.finAssistant.noStep')}</p>
      ) : (
        <ol className="fa-flow-step-list">
          {steps.map((step, index) => (
            <li key={step.id} className="fa-flow-step">
              <div className="fa-flow-step-head">
                <strong>{t('admin.finAssistant.targetStep', { n: index + 1 })}</strong>
                <button
                  type="button"
                  className="cms-icon-button danger"
                  title={t('admin.finAssistant.deleteStep')}
                  aria-label={`${t('admin.finAssistant.deleteStep')} — ${t('admin.finAssistant.targetStep', { n: index + 1 })}`}
                  disabled={busy}
                  onClick={() => act(() => api.delete(`/admin/fin-assistant/flows/${flow.id}/steps/${step.id}`), t('admin.finAssistant.deleted'))}
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
              <p>{step.prompt}</p>
              {step.options.length > 0 && (
                <ul className="fa-flow-options">
                  {step.options.map((option, i) => (
                    <li key={i}>
                      « {option.label} » → {describe(option)}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      )}

      <form className="fa-flow-step-form" onSubmit={add}>
        <h3>{t('admin.finAssistant.addStepTitle', { n: steps.length + 1 })}</h3>
        <Field label={t('admin.finAssistant.stepPrompt')} htmlFor={`fs-prompt-${flow.id}`}>
          <textarea id={`fs-prompt-${flow.id}`} rows={2} maxLength={2000} value={prompt} onChange={(e) => setPrompt(e.target.value)} required />
        </Field>
        <fieldset className="fa-flow-option-fields">
          <legend>{t('admin.finAssistant.stepOptions')}</legend>
          {options.map((option, index) => (
            <div key={index} className="fa-flow-option-row">
              <input
                value={option.label}
                maxLength={100}
                placeholder={t('admin.finAssistant.optionLabel')}
                aria-label={`${t('admin.finAssistant.optionLabel')} ${index + 1}`}
                onChange={(e) => setOption(index, { label: e.target.value })}
              />
              <select aria-label={`${t('admin.finAssistant.optionTarget')} ${index + 1}`} value={option.target} onChange={(e) => setOption(index, { target: e.target.value })}>
                <option value="">{t('admin.finAssistant.targetEnd')}</option>
                <option value={NEXT}>{t('admin.finAssistant.targetNext')}</option>
                {steps.map((step, i) => (
                  <option key={step.id} value={`step:${step.stepKey}`}>
                    {t('admin.finAssistant.targetStep', { n: i + 1 })}
                  </option>
                ))}
                {intents.map((intent) => (
                  <option key={intent.code} value={`intent:${intent.code}`}>
                    {t('admin.finAssistant.targetIntent', { label: intent.label })}
                  </option>
                ))}
              </select>
              {options.length > 1 && (
                <button type="button" className="cms-icon-button" title={t('admin.finAssistant.removeOption')} aria-label={`${t('admin.finAssistant.removeOption')} ${index + 1}`} onClick={() => setOptions((list) => list.filter((_, i) => i !== index))}>
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
          {options.length < 8 && (
            <Button variant="ghost" onClick={() => setOptions((list) => [...list, emptyOption()])}>
              <Plus size={15} aria-hidden="true" />
              {t('admin.finAssistant.addOption')}
            </Button>
          )}
          <p className="form-hint">{t('admin.finAssistant.optionsHint')}</p>
        </fieldset>
        <div className="fa-admin-actions">
          <Button type="submit" disabled={busy || !prompt.trim()}>
            {t('admin.finAssistant.addStep')}
          </Button>
        </div>
      </form>
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
