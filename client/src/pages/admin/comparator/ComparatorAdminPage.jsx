import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Landmark, ListChecks, Pencil, Plus, Trash2 } from 'lucide-react';
import { api, errorKey } from '../../../lib/api.js';
import { useApi } from '../../../lib/useApi.js';
import Button from '../../../components/ui/Button.jsx';
import ErrorState from '../../../components/ui/ErrorState.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import ConfirmDialog from '../../../components/cms/ConfirmDialog.jsx';
import DataTable from '../../../components/cms/DataTable.jsx';
import PageToolbar from '../../../components/cms/PageToolbar.jsx';
import { fieldLabel, labelHeader } from '../../../lib/comparator.js';
import './ComparatorAdmin.css';

// Administration of the bank comparator (P4-08). The rubric keys, in the order of
// the client's guide (server: src/constants/comparator.js). Their columns and
// whether they have a category come from the server with the conditions, so they
// are defined in one place only.
const THEME_KEYS = [
  'comptes',
  'versements-retraits',
  'carte-locale',
  'epargne',
  'coffres-forts',
  'credits',
  'virements',
  'carte-internationale',
  'devises',
  'operations-diverses',
  'cheques',
];

const SEGMENTS = ['non_precise', 'particulier', 'professionnel', 'entreprise'];
const LIMITS = { bankName: 80, label: 200, category: 80, value: 300 };

const bankErrorKey = (err) => errorKey(err, { 409: 'comparator.admin.bankExists' });

export default function ComparatorAdminPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('banks'); // 'banks' | 'conditions'
  const [themeKey, setThemeKey] = useState(THEME_KEYS[0]);

  return (
    <>
      <PageToolbar title={t('comparator.admin.title')} subtitle={t('comparator.admin.subtitle')} />

      <div className="comparator-admin-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'banks'} className={tab === 'banks' ? 'active' : ''} onClick={() => setTab('banks')}>
          <Landmark size={16} aria-hidden="true" />
          {t('comparator.admin.banks')}
        </button>
        <button type="button" role="tab" aria-selected={tab === 'conditions'} className={tab === 'conditions' ? 'active' : ''} onClick={() => setTab('conditions')}>
          <ListChecks size={16} aria-hidden="true" />
          {t('comparator.admin.conditions')}
        </button>
      </div>

      {tab === 'banks' ? <BanksTab /> : <ConditionsTab themeKey={themeKey} setThemeKey={setThemeKey} />}
    </>
  );
}

// ---- Banks ------------------------------------------------------------------
function BanksTab() {
  const { t } = useTranslation();
  const banks = useApi('/admin/comparator/banks');
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null); // { kind: 'ok' | 'error', text }

  const run = async (action, okText) => {
    setBusy(true);
    setMessage(null);
    try {
      await action();
      setMessage({ kind: 'ok', text: okText });
      banks.reload();
      return true;
    } catch (err) {
      setMessage({ kind: 'error', text: t(bankErrorKey(err)) });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const create = async (event) => {
    event.preventDefault();
    if (await run(() => api.post('/admin/comparator/banks', { name: newName.trim() }), t('comparator.admin.saved'))) {
      setNewName('');
      setAdding(false);
    }
  };

  const rename = async (event) => {
    event.preventDefault();
    if (await run(() => api.patch(`/admin/comparator/banks/${editId}`, { name: editName.trim() }), t('comparator.admin.saved'))) setEditId(null);
  };

  const remove = async () => {
    const target = deleteTarget;
    if (await run(() => api.delete(`/admin/comparator/banks/${target.id}`), t('comparator.admin.deleted'))) setDeleteTarget(null);
  };

  if (banks.status === 'loading') return <LoadingState />;
  if (banks.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={banks.reload} />;

  const columns = [
    {
      key: 'name',
      header: t('comparator.admin.bankName'),
      render: (b) =>
        editId === b.id ? (
          <form className="comparator-inline-form" onSubmit={rename}>
            <input value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={LIMITS.bankName} aria-label={t('comparator.admin.bankName')} autoFocus />
            <Button type="submit" disabled={busy || !editName.trim()}>
              {t('comparator.admin.save')}
            </Button>
            <Button variant="secondary" onClick={() => setEditId(null)}>
              {t('comparator.admin.cancel')}
            </Button>
          </form>
        ) : (
          <strong>{b.name}</strong>
        ),
    },
    { key: 'count', header: t('comparator.admin.conditions'), render: (b) => t('comparator.admin.conditionCount', { count: b.conditionCount }) },
    {
      key: 'actions',
      header: <span className="sr-only">{t('comparator.admin.actions')}</span>,
      render: (b) =>
        editId === b.id ? null : (
          <div className="cms-row-actions">
            <button
              type="button"
              className="cms-icon-button"
              title={t('comparator.admin.editBank')}
              aria-label={`${t('comparator.admin.editBank')} — ${b.name}`}
              onClick={() => {
                setEditId(b.id);
                setEditName(b.name);
                setMessage(null);
              }}
            >
              <Pencil size={15} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="cms-icon-button danger"
              title={t('comparator.admin.deleteBank')}
              aria-label={`${t('comparator.admin.deleteBank')} — ${b.name}`}
              onClick={() => setDeleteTarget(b)}
            >
              <Trash2 size={15} aria-hidden="true" />
            </button>
          </div>
        ),
    },
  ];

  return (
    <div className="comparator-admin-section">
      <div className="comparator-admin-bar">
        <Button onClick={() => setAdding((v) => !v)} aria-expanded={adding}>
          <Plus size={16} aria-hidden="true" />
          {t('comparator.admin.addBank')}
        </Button>
      </div>

      {adding && (
        <form className="comparator-admin-form" onSubmit={create}>
          <label>
            {t('comparator.admin.bankName')}
            <input value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={LIMITS.bankName} autoFocus />
          </label>
          <div className="comparator-admin-form-actions">
            <Button type="submit" disabled={busy || !newName.trim()}>
              {t('comparator.admin.save')}
            </Button>
            <Button variant="secondary" onClick={() => setAdding(false)}>
              {t('comparator.admin.cancel')}
            </Button>
          </div>
        </form>
      )}

      {message && (
        <p className={`cms-inline-message ${message.kind}`} role={message.kind === 'error' ? 'alert' : 'status'}>
          {message.text}
        </p>
      )}

      <DataTable columns={columns} rows={banks.data.banks} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('comparator.admin.deleteBank')}
        confirmLabel={t('comparator.admin.deleteBank')}
        danger
        busy={busy}
        onConfirm={remove}
        onCancel={() => setDeleteTarget(null)}
      >
        <p>{t('comparator.admin.deleteBankConfirm', { name: deleteTarget?.name ?? '', count: deleteTarget?.conditionCount ?? 0 })}</p>
      </ConfirmDialog>
    </div>
  );
}

// ---- Conditions, rubric by rubric -------------------------------------------
const emptyValues = (theme) => Object.fromEntries(theme.fields.map((f) => [f, '']));

function ConditionsTab({ themeKey, setThemeKey }) {
  const { t } = useTranslation();
  const list = useApi(`/admin/comparator/conditions?theme=${themeKey}`);
  const [form, setForm] = useState(null); // null | { mode: 'add' | 'edit', id?, bankId, label, category, segment, values }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const theme = list.data?.theme ?? null;
  const banks = list.data?.banks ?? [];

  const changeTheme = (key) => {
    setThemeKey(key);
    setForm(null);
    setMessage(null);
  };

  const openAdd = () => {
    setMessage(null);
    setForm({ mode: 'add', bankId: banks[0]?.id ?? '', label: '', category: '', segment: 'non_precise', values: emptyValues(theme) });
  };

  const openEdit = (c) => {
    setMessage(null);
    setForm({ mode: 'edit', id: c.id, bankId: c.bank.id, label: c.label, category: c.category ?? '', segment: c.segment, values: { ...emptyValues(theme), ...c.values } });
  };

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const setValue = (key, value) => setForm((prev) => ({ ...prev, values: { ...prev.values, [key]: value } }));

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    // Every column of the rubric is sent: an emptied field is removed on the server.
    const body = { bankId: form.bankId, label: form.label.trim(), segment: form.segment, values: form.values };
    if (theme.category) body.category = form.category.trim() || null;
    try {
      if (form.mode === 'add') await api.post('/admin/comparator/conditions', { theme: theme.key, ...body });
      else await api.patch(`/admin/comparator/conditions/${form.id}`, body);
      setForm(null);
      setMessage({ kind: 'ok', text: t('comparator.admin.saved') });
      list.reload();
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err)) });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await api.delete(`/admin/comparator/conditions/${deleteTarget.id}`);
      setDeleteTarget(null);
      setMessage({ kind: 'ok', text: t('comparator.admin.deleted') });
      list.reload();
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err)) });
    } finally {
      setBusy(false);
    }
  };

  const columns = theme
    ? [
        { key: 'bank', header: t('comparator.bank'), render: (c) => <strong>{c.bank.name}</strong> },
        { key: 'label', header: labelHeader(t, theme.key), render: (c) => c.label },
        ...(theme.category ? [{ key: 'category', header: t('comparator.category'), render: (c) => c.category ?? '' }] : []),
        { key: 'segment', header: t('comparator.segment'), render: (c) => t(`comparator.segments.${c.segment}`) },
        ...theme.fields.map((f) => ({ key: f, header: fieldLabel(t, theme.key, f), render: (c) => c.values[f] ?? '' })),
        {
          key: 'actions',
          header: <span className="sr-only">{t('comparator.admin.actions')}</span>,
          render: (c) => (
            <div className="cms-row-actions">
              <button type="button" className="cms-icon-button" title={t('comparator.admin.editCondition')} aria-label={`${t('comparator.admin.editCondition')} — ${c.bank.name}, ${c.label}`} onClick={() => openEdit(c)}>
                <Pencil size={15} aria-hidden="true" />
              </button>
              <button type="button" className="cms-icon-button danger" title={t('comparator.admin.deleteCondition')} aria-label={`${t('comparator.admin.deleteCondition')} — ${c.bank.name}, ${c.label}`} onClick={() => setDeleteTarget(c)}>
                <Trash2 size={15} aria-hidden="true" />
              </button>
            </div>
          ),
        },
      ]
    : [];

  return (
    <div className="comparator-admin-section">
      <div className="comparator-admin-bar">
        <label className="comparator-admin-theme">
          {t('comparator.admin.selectTheme')}
          <select value={themeKey} onChange={(e) => changeTheme(e.target.value)}>
            {THEME_KEYS.map((key) => (
              <option key={key} value={key}>
                {t(`comparator.themes.${key}`)}
              </option>
            ))}
          </select>
        </label>
        <Button onClick={openAdd} disabled={list.status !== 'ready' || banks.length === 0}>
          <Plus size={16} aria-hidden="true" />
          {t('comparator.admin.addCondition')}
        </Button>
      </div>

      {message && (
        <p className={`cms-inline-message ${message.kind}`} role={message.kind === 'error' ? 'alert' : 'status'}>
          {message.text}
        </p>
      )}

      {list.status === 'loading' && <LoadingState />}
      {list.status === 'error' && <ErrorState message={t('state.loadError')} onRetry={list.reload} />}
      {list.status === 'ready' && (
        <>
          {form && (
            <form className="comparator-admin-form comparator-condition-form" onSubmit={submit}>
              <h2>{form.mode === 'add' ? t('comparator.admin.addCondition') : t('comparator.admin.editCondition')}</h2>
              <div className="comparator-admin-grid">
                <label>
                  {t('comparator.bank')}
                  <select value={form.bankId} onChange={(e) => setField('bankId', e.target.value)} required>
                    {banks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {labelHeader(t, theme.key)}
                  <input value={form.label} onChange={(e) => setField('label', e.target.value)} maxLength={LIMITS.label} required />
                </label>
                {theme.category && (
                  <label>
                    {t('comparator.category')}
                    <input value={form.category} onChange={(e) => setField('category', e.target.value)} maxLength={LIMITS.category} />
                  </label>
                )}
                <label>
                  {t('comparator.segment')}
                  <select value={form.segment} onChange={(e) => setField('segment', e.target.value)}>
                    {SEGMENTS.map((s) => (
                      <option key={s} value={s}>
                        {t(`comparator.segments.${s}`)}
                      </option>
                    ))}
                  </select>
                  <small className="form-hint">{t('comparator.admin.segmentHint')}</small>
                </label>
                {theme.fields.map((f) => (
                  <label key={f}>
                    {fieldLabel(t, theme.key, f)}
                    <input value={form.values[f] ?? ''} onChange={(e) => setValue(f, e.target.value)} maxLength={LIMITS.value} />
                  </label>
                ))}
              </div>
              <p className="form-hint">{t('comparator.admin.valuesHint')}</p>
              <div className="comparator-admin-form-actions">
                <Button type="submit" disabled={busy || !form.label.trim() || !form.bankId}>
                  {t('comparator.admin.save')}
                </Button>
                <Button variant="secondary" onClick={() => setForm(null)}>
                  {t('comparator.admin.cancel')}
                </Button>
              </div>
            </form>
          )}

          {list.data.conditions.length === 0 ? (
            <p className="cms-muted">{t('comparator.admin.emptyTheme')}</p>
          ) : (
            <DataTable columns={columns} rows={list.data.conditions} />
          )}
        </>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('comparator.admin.deleteCondition')}
        confirmLabel={t('comparator.admin.deleteCondition')}
        danger
        busy={busy}
        onConfirm={remove}
        onCancel={() => setDeleteTarget(null)}
      >
        <p>{t('comparator.admin.deleteConditionConfirm', { bank: deleteTarget?.bank.name ?? '', label: deleteTarget?.label ?? '' })}</p>
      </ConfirmDialog>
    </div>
  );
}
