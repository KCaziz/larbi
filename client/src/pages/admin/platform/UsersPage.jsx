import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, ShieldOff, ShieldCheck, Trash2 } from 'lucide-react';
import { useAuth } from '../../../auth/useAuth.js';
import { api, errorKey } from '../../../lib/api.js';
import { accountTypeLabel, useAccountTypes } from '../../../lib/accountTypes.js';
import { formatDate } from '../../../lib/format.js';
import { useApi } from '../../../lib/useApi.js';
import Button from '../../../components/ui/Button.jsx';
import ErrorState from '../../../components/ui/ErrorState.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import ConfirmDialog from '../../../components/cms/ConfirmDialog.jsx';
import DataTable from '../../../components/cms/DataTable.jsx';
import EmptyState from '../../../components/cms/EmptyState.jsx';
import Field from '../../../components/cms/Field.jsx';
import PageToolbar from '../../../components/cms/PageToolbar.jsx';
import './Platform.css';

const ROLES = ['user', 'admin'];
const LEVELS = ['standard', 'premium'];
const STATUSES = ['active', 'suspended'];

function Accounts() {
  const { t, i18n } = useTranslation();
  const { user: me } = useAuth();
  const accountTypes = useAccountTypes();
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [savingId, setSavingId] = useState(null);
  const [rowError, setRowError] = useState(null);

  const params = new URLSearchParams({ page: String(page), limit: '25' });
  if (query) params.set('query', query);
  if (role) params.set('role', role);
  if (status) params.set('status', status);
  const list = useApi(`/admin/users?${params}`);

  const change = async (userId, patch) => {
    setSavingId(userId);
    setRowError(null);
    try {
      await api.patch(`/admin/users/${userId}`, patch);
      list.reload();
    } catch (err) {
      setRowError({ id: userId, text: t(errorKey(err)) });
    } finally {
      setSavingId(null);
    }
  };

  const columns = [
    {
      key: 'name',
      header: t('admin.users.columns.name'),
      render: (u) => (
        <>
          <div>{u.name}</div>
          <div className="admin-usage">{u.email}</div>
        </>
      ),
    },
    {
      key: 'accountType',
      header: t('admin.users.columns.accountType'),
      render: (u) => (
        <select
          className="admin-select"
          value={u.accountType}
          disabled={u.id === me.id || savingId === u.id}
          onChange={(e) => change(u.id, { accountType: e.target.value })}
        >
          {!accountTypes.types.some((x) => x.value === u.accountType) && <option value={u.accountType}>{u.accountTypeLabel}</option>}
          {accountTypes.types.map((x) => (
            <option key={x.value} value={x.value}>
              {accountTypeLabel(x)}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: 'accessLevel',
      header: t('admin.users.columns.accessLevel'),
      render: (u) => (
        <select
          className="admin-select"
          value={u.accessLevel}
          disabled={u.id === me.id || savingId === u.id}
          onChange={(e) => change(u.id, { accessLevel: e.target.value })}
        >
          {LEVELS.map((lvl) => (
            <option key={lvl} value={lvl}>
              {t(`admin.users.accessLevel.${lvl}`)}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: 'role',
      header: t('admin.users.columns.role'),
      render: (u) => (
        <select
          className="admin-select"
          value={u.role}
          disabled={u.id === me.id || savingId === u.id}
          onChange={(e) => change(u.id, { role: e.target.value })}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {t(`admin.users.role.${r}`)}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: 'status',
      header: t('admin.users.columns.status'),
      render: (u) => (
        <span className={`cms-badge ${u.status === 'active' ? 'cms-badge-published' : 'cms-badge-danger'}`}>
          {t(`admin.users.status.${u.status}`)}
        </span>
      ),
    },
    { key: 'createdAt', header: t('admin.users.columns.since'), render: (u) => formatDate(i18n.language, u.createdAt) },
    {
      key: 'actions',
      header: <span className="sr-only">{t('admin.list.columns.actions')}</span>,
      render: (u) =>
        u.id === me.id ? null : (
          <Button
            variant="secondary"
            disabled={savingId === u.id}
            onClick={() => change(u.id, { status: u.status === 'active' ? 'suspended' : 'active' })}
          >
            {u.status === 'active' ? (
              <>
                <ShieldOff size={15} strokeWidth={1.9} aria-hidden="true" />
                {t('admin.users.suspend')}
              </>
            ) : (
              <>
                <ShieldCheck size={15} strokeWidth={1.9} aria-hidden="true" />
                {t('admin.users.reactivate')}
              </>
            )}
          </Button>
        ),
    },
  ];

  return (
    <>
      <form
        className="admin-filters"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setQuery(text.trim());
        }}
      >
        <Field label={t('admin.users.search')} htmlFor="u-search">
          <input id="u-search" type="search" maxLength={100} value={text} onChange={(e) => setText(e.target.value)} />
        </Field>
        <Field label={t('admin.users.filterRole')} htmlFor="u-role">
          <select id="u-role" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
            <option value="">{t('admin.users.roleAll')}</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {t(`admin.users.role.${r}`)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('admin.users.filterStatus')} htmlFor="u-status">
          <select id="u-status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">{t('admin.users.statusAll')}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`admin.users.status.${s}`)}
              </option>
            ))}
          </select>
        </Field>
        <Button type="submit" variant="secondary">
          <Search size={16} strokeWidth={1.9} aria-hidden="true" />
          {t('admin.users.searchButton')}
        </Button>
      </form>

      {rowError && (
        <p className="cms-inline-message error" role="alert">
          {rowError.text}
        </p>
      )}

      {list.status === 'loading' && <LoadingState />}
      {list.status === 'error' && <ErrorState message={t('admin.users.loadError')} onRetry={list.reload} />}
      {list.status === 'ready' && list.data.users.length === 0 && <EmptyState title={t('admin.users.emptyTitle')} />}
      {list.status === 'ready' && list.data.users.length > 0 && (
        <>
          <DataTable columns={columns} rows={list.data.users} />
          {list.data.pagination.pages > 1 && (
            <nav className="admin-pager" aria-label={t('blogList.pagination')}>
              <Button variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                {t('blogList.previous')}
              </Button>
              <p>{t('blogList.page', { page, pages: list.data.pagination.pages })}</p>
              <Button variant="secondary" disabled={page >= list.data.pagination.pages} onClick={() => setPage(page + 1)}>
                {t('blogList.next')}
              </Button>
            </nav>
          )}
        </>
      )}
    </>
  );
}

function AccountTypes() {
  const { t } = useTranslation();
  const list = useApi('/admin/account-types');
  const [label, setLabel] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [edits, setEdits] = useState({}); // id -> { label, order }
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const draftOf = (type) => edits[type.id] ?? { label: type.label, order: type.order };
  const setDraft = (id, patch) => setEdits((e) => ({ ...e, [id]: { ...draftOf(list.data.accountTypes.find((x) => x.id === id)), ...patch } }));

  const create = async (event) => {
    event.preventDefault();
    if (!label.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await api.post('/admin/account-types', { label: label.trim() });
      setLabel('');
      list.reload();
    } catch (err) {
      setError(t(errorKey(err)));
    } finally {
      setCreating(false);
    }
  };

  const save = async (type) => {
    const draft = draftOf(type);
    setError(null);
    try {
      await api.patch(`/admin/account-types/${type.id}`, { label: draft.label.trim(), order: Number(draft.order) });
      list.reload();
    } catch (err) {
      setError(t(errorKey(err)));
    }
  };

  const toggleActive = async (type) => {
    setError(null);
    try {
      await api.patch(`/admin/account-types/${type.id}`, { isActive: !type.isActive });
      list.reload();
    } catch (err) {
      setError(t(errorKey(err)));
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/admin/account-types/${toDelete.id}`);
      setToDelete(null);
      list.reload();
    } catch (err) {
      setError(t(errorKey(err)));
      setToDelete(null);
    } finally {
      setBusy(false);
    }
  };

  const columns = list.status === 'ready' && [
    {
      key: 'label',
      header: t('admin.accountTypes.columns.label'),
      render: (type) => (
        <input
          type="text"
          maxLength={60}
          value={draftOf(type).label}
          onChange={(e) => setDraft(type.id, { label: e.target.value })}
        />
      ),
    },
    { key: 'slug', header: t('admin.accountTypes.columns.slug'), render: (type) => <code>{type.slug}</code> },
    {
      key: 'order',
      header: t('admin.accountTypes.columns.order'),
      render: (type) => (
        <input
          type="number"
          min="0"
          max="1000"
          className="admin-select admin-input-sm"
          value={draftOf(type).order}
          onChange={(e) => setDraft(type.id, { order: e.target.value })}
        />
      ),
    },
    {
      key: 'active',
      header: t('admin.accountTypes.columns.active'),
      render: (type) => (
        <label className="cms-check">
          <input type="checkbox" checked={type.isActive} onChange={() => toggleActive(type)} />
          {type.isActive ? t('admin.accountTypes.active') : t('admin.accountTypes.inactive')}
        </label>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">{t('admin.list.columns.actions')}</span>,
      render: (type) => (
        <div className="cms-row-actions">
          <Button variant="secondary" onClick={() => save(type)}>
            {t('admin.accountTypes.save')}
          </Button>
          <Button variant="secondary" onClick={() => setToDelete(type)}>
            <Trash2 size={15} strokeWidth={1.9} aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <p className="cms-intro">{t('admin.accountTypes.intro')}</p>
      <form className="admin-inline-form" onSubmit={create}>
        <Field label={t('admin.accountTypes.newLabel')} htmlFor="at-new">
          <input id="at-new" type="text" maxLength={60} value={label} onChange={(e) => setLabel(e.target.value)} />
        </Field>
        <Button type="submit" disabled={creating || !label.trim()}>
          <Plus size={16} strokeWidth={2} aria-hidden="true" />
          {t('admin.accountTypes.add')}
        </Button>
      </form>
      {error && (
        <p className="cms-inline-message error" role="alert">
          {error}
        </p>
      )}
      {list.status === 'loading' && <LoadingState />}
      {list.status === 'error' && <ErrorState message={t('admin.accountTypes.loadError')} onRetry={list.reload} />}
      {list.status === 'ready' && <DataTable columns={columns} rows={list.data.accountTypes} />}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={t('admin.accountTypes.deleteTitle')}
        confirmLabel={t('admin.accountTypes.deleteConfirm')}
        danger
        busy={busy}
        onConfirm={remove}
        onCancel={() => !busy && setToDelete(null)}
      >
        <p>{t('admin.accountTypes.deleteBody', { label: toDelete?.label ?? '' })}</p>
      </ConfirmDialog>
    </>
  );
}

export default function UsersPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('accounts');

  return (
    <>
      <PageToolbar title={t('admin.users.title')} subtitle={t('admin.users.subtitle')} />
      <div className="cms-steps" role="tablist" aria-label={t('admin.users.title')}>
        {['accounts', 'accountTypes'].map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`u-tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`u-panel-${id}`}
            className={`cms-step ${tab === id ? 'active' : ''}`}
            onClick={() => setTab(id)}
          >
            {t(`admin.users.tabs.${id}`)}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`u-panel-${tab}`} aria-labelledby={`u-tab-${tab}`} className="admin-panel">
        {tab === 'accounts' ? <Accounts /> : <AccountTypes />}
      </div>
    </>
  );
}
