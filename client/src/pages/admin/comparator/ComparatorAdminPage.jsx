import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Landmark, Pencil, Plus, Trash2 } from 'lucide-react';
import { api, errorKey } from '../../../lib/api.js';
import { useApi } from '../../../lib/useApi.js';
import Button from '../../../components/ui/Button.jsx';
import ErrorState from '../../../components/ui/ErrorState.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import ConfirmDialog from '../../../components/cms/ConfirmDialog.jsx';
import DataTable from '../../../components/cms/DataTable.jsx';
import PageToolbar from '../../../components/cms/PageToolbar.jsx';
import './ComparatorAdmin.css';

// The 11 rubric keys and their fields, mirrored from constants/comparator.js.
const THEMES = [
  { key: 'comptes', fields: ['fee', 'period'], category: false },
  { key: 'versements-retraits', fields: ['fee', 'conditions'], category: true },
  { key: 'carte-locale', fields: ['annualFee', 'atmWithdrawal', 'opposition'], category: false },
  { key: 'epargne', fields: ['rate', 'conditions'], category: false },
  { key: 'coffres-forts', fields: ['fee', 'period', 'conditions'], category: false },
  { key: 'credits', fields: ['fileFee', 'rate', 'earlyRepayment'], category: false },
  { key: 'virements', fields: ['fee', 'conditions'], category: false },
  { key: 'carte-internationale', fields: ['annualFee', 'foreignWithdrawal', 'opposition'], category: false },
  { key: 'devises', fields: ['fee', 'conditions'], category: true },
  { key: 'operations-diverses', fields: ['fee', 'conditions'], category: true },
  { key: 'cheques', fields: ['fee', 'conditions'], category: false },
];

const SEGMENTS = ['non_precise', 'particulier', 'professionnel', 'entreprise'];

export default function ComparatorAdminPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('banks'); // 'banks' | 'conditions'
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0].key);

  return (
    <div>
      <PageToolbar title={t('comparator.admin.title')} />

      <div className="comparator-admin-tabs">
        <button type="button" className={`cms-tab${tab === 'banks' ? ' active' : ''}`} onClick={() => setTab('banks')}>
          <Landmark size={16} aria-hidden="true" />
          {t('comparator.admin.banks')}
        </button>
        <button type="button" className={`cms-tab${tab === 'conditions' ? ' active' : ''}`} onClick={() => setTab('conditions')}>
          {t('comparator.admin.conditions')}
        </button>
      </div>

      {tab === 'banks' && <BanksTab t={t} />}
      {tab === 'conditions' && <ConditionsTab t={t} selectedTheme={selectedTheme} setSelectedTheme={setSelectedTheme} />}
    </div>
  );
}

// ---- Banks tab ----
function BanksTab({ t }) {
  const banks = useApi('/admin/comparator/banks');
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post('/admin/comparator/banks', { name: newName.trim() });
      setNewName('');
      setAdding(false);
      banks.reload();
    } catch (err) {
      setError(err.status === 409 ? t('comparator.admin.bankExists') : t(errorKey(err)));
    } finally {
      setBusy(false);
    }
  };

  const rename = async (id) => {
    setBusy(true);
    setError(null);
    try {
      await api.patch(`/admin/comparator/banks/${id}`, { name: editName.trim() });
      setEditId(null);
      banks.reload();
    } catch (err) {
      setError(err.status === 409 ? t('comparator.admin.bankExists') : t(errorKey(err)));
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await api.delete(`/admin/comparator/banks/${deleteTarget.id}`);
      setDeleteTarget(null);
      banks.reload();
    } catch (err) {
      setError(t(errorKey(err)));
    } finally {
      setBusy(false);
    }
  };

  if (banks.status === 'loading') return <LoadingState />;
  if (banks.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={banks.reload} />;

  const columns = [
    { key: 'name', header: t('comparator.admin.bankName'), render: (b) => editId === b.id ? (
      <form className="inline-form" onSubmit={(e) => { e.preventDefault(); rename(b.id); }}>
        <input value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus maxLength={80} />
        <Button type="submit" disabled={busy || !editName.trim()}>{t('comparator.admin.save')}</Button>
        <Button variant="secondary" onClick={() => setEditId(null)}>{t('comparator.admin.cancel')}</Button>
      </form>
    ) : <strong>{b.name}</strong> },
    { key: 'count', header: t('comparator.admin.conditions'), render: (b) => t('comparator.admin.conditionCount', { count: b.conditionCount }) },
    { key: 'actions', header: '', render: (b) => editId === b.id ? null : (
      <div className="cms-row-actions">
        <button type="button" className="admin-icon-btn" title={t('comparator.admin.editBank')} onClick={() => { setEditId(b.id); setEditName(b.name); }}>
          <Pencil size={15} />
        </button>
        <button type="button" className="admin-icon-btn admin-icon-danger" title={t('comparator.admin.deleteBank')} onClick={() => setDeleteTarget(b)}>
          <Trash2 size={15} />
        </button>
      </div>
    ) },
  ];

  return (
    <div className="comparator-admin-section">
      <div className="comparator-admin-bar">
        <Button onClick={() => setAdding(!adding)}>
          <Plus size={16} aria-hidden="true" />
          {t('comparator.admin.addBank')}
        </Button>
      </div>

      {adding && (
        <form className="comparator-admin-form" onSubmit={submit}>
          <input placeholder={t('comparator.admin.bankName')} value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={80} autoFocus />
          <Button type="submit" disabled={busy || !newName.trim()}>{t('comparator.admin.save')}</Button>
          <Button variant="secondary" onClick={() => setAdding(false)}>{t('comparator.admin.cancel')}</Button>
        </form>
      )}

      {error && <p className="form-error">{error}</p>}

      <DataTable columns={columns} rows={banks.data.banks} />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('comparator.admin.deleteBank')}
        confirmLabel={t('comparator.admin.deleteBank')}
        danger
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      >
        <p>{t('comparator.admin.deleteBankConfirm', { name: deleteTarget?.name })}</p>
      </ConfirmDialog>
    </div>
  );
}

// ---- Conditions tab ----
function ConditionsTab({ t, selectedTheme, setSelectedTheme }) {
  const theme = THEMES.find((th) => th.key === selectedTheme) ?? THEMES[0];
  const conditions = useApi(`/admin/comparator/conditions?theme=${theme.key}`);
  const banks = useApi('/admin/comparator/banks');

  const [form, setForm] = useState(null); // null | { mode: 'add'|'edit', id?, bankId, label, category, segment, values }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const bankList = banks.data?.banks ?? [];

  const openAdd = () => setForm({
    mode: 'add', bankId: bankList[0]?.id ?? '', label: '', category: '', segment: 'non_precise',
    values: Object.fromEntries(theme.fields.map((f) => [f, ''])),
  });

  const openEdit = (c) => setForm({
    mode: 'edit', id: c.id, bankId: c.bankId, label: c.label, category: c.category ?? '', segment: c.segment,
    values: { ...Object.fromEntries(theme.fields.map((f) => [f, ''])), ...c.values },
  });

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const setVal = (key, value) => setForm((prev) => ({ ...prev, values: { ...prev.values, [key]: value } }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const body = {
      bankId: form.bankId,
      label: form.label.trim(),
      segment: form.segment,
      values: Object.fromEntries(Object.entries(form.values).filter(([, v]) => v.trim())),
    };
    if (theme.category && form.category.trim()) body.category = form.category.trim();
    if (form.mode === 'add') body.theme = theme.key;
    try {
      if (form.mode === 'add') await api.post('/admin/comparator/conditions', body);
      else await api.patch(`/admin/comparator/conditions/${form.id}`, body);
      setForm(null);
      conditions.reload();
    } catch (err) {
      setError(t(errorKey(err)));
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await api.delete(`/admin/comparator/conditions/${deleteTarget.id}`);
      setDeleteTarget(null);
      conditions.reload();
    } catch (err) {
      setError(t(errorKey(err)));
    } finally {
      setBusy(false);
    }
  };

  const loading = conditions.status === 'loading' || banks.status === 'loading';

  const columns = [
    { key: 'bank', header: t('comparator.admin.banks'), render: (c) => <strong>{c.bank?.name}</strong> },
    { key: 'label', header: t('comparator.admin.label'), render: (c) => c.label },
    ...(theme.category ? [{ key: 'category', header: t('comparator.admin.category'), render: (c) => c.category ?? '' }] : []),
    { key: 'segment', header: t('comparator.admin.segment'), render: (c) => t(`comparator.segments.${c.segment}`) },
    ...theme.fields.map((f) => ({ key: f, header: t(`comparator.fields.${f}`), render: (c) => c.values?.[f] ?? '' })),
    { key: 'actions', header: '', render: (c) => (
      <div className="cms-row-actions">
        <button type="button" className="admin-icon-btn" title={t('comparator.admin.editCondition')} onClick={() => openEdit(c)}>
          <Pencil size={15} />
        </button>
        <button type="button" className="admin-icon-btn admin-icon-danger" title={t('comparator.admin.deleteCondition')} onClick={() => setDeleteTarget(c)}>
          <Trash2 size={15} />
        </button>
      </div>
    ) },
  ];

  return (
    <div className="comparator-admin-section">
      <div className="comparator-admin-bar">
        <select value={selectedTheme} onChange={(e) => { setSelectedTheme(e.target.value); setForm(null); }}>
          {THEMES.map((th) => <option key={th.key} value={th.key}>{t(`comparator.themes.${th.key}`)}</option>)}
        </select>
        <Button onClick={openAdd} disabled={loading || bankList.length === 0}>
          <Plus size={16} aria-hidden="true" />
          {t('comparator.admin.addCondition')}
        </Button>
      </div>

      {error && <p className="form-error">{error}</p>}

      {loading ? <LoadingState /> : conditions.status === 'error' ? <ErrorState message={t('state.loadError')} onRetry={conditions.reload} /> : (
        <>
          {form && (
            <form className="comparator-admin-form condition-form" onSubmit={submit}>
              <label>
                {t('comparator.admin.selectBank')}
                <select value={form.bankId} onChange={(e) => setField('bankId', e.target.value)} disabled={form.mode === 'edit'}>
                  {bankList.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </label>
              <label>
                {t('comparator.admin.label')}
                <input value={form.label} onChange={(e) => setField('label', e.target.value)} maxLength={200} required />
              </label>
              {theme.category && (
                <label>
                  {t('comparator.admin.category')}
                  <input value={form.category} onChange={(e) => setField('category', e.target.value)} maxLength={80} />
                </label>
              )}
              <label>
                {t('comparator.admin.segment')}
                <select value={form.segment} onChange={(e) => setField('segment', e.target.value)}>
                  {SEGMENTS.map((s) => <option key={s} value={s}>{t(`comparator.segments.${s}`)}</option>)}
                </select>
              </label>
              <fieldset>
                <legend>{t('comparator.admin.values')}</legend>
                {theme.fields.map((f) => (
                  <label key={f}>
                    {t(`comparator.fields.${f}`)}
                    <input value={form.values[f] ?? ''} onChange={(e) => setVal(f, e.target.value)} maxLength={300} />
                  </label>
                ))}
              </fieldset>
              <div className="comparator-admin-form-actions">
                <Button type="submit" disabled={busy || !form.label.trim() || !form.bankId}>{t('comparator.admin.save')}</Button>
                <Button variant="secondary" onClick={() => setForm(null)}>{t('comparator.admin.cancel')}</Button>
              </div>
            </form>
          )}

          <DataTable columns={columns} rows={conditions.data.conditions} />
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('comparator.admin.deleteCondition')}
        confirmLabel={t('comparator.admin.deleteCondition')}
        danger
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      >
        <p>{t('comparator.admin.deleteConditionConfirm')}</p>
      </ConfirmDialog>
    </div>
  );
}
