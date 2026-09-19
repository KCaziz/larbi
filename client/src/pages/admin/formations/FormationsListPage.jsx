import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, ImageOff, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, errorKey } from '../../../lib/api.js';
import { formatDate } from '../../../lib/format.js';
import Button from '../../../components/ui/Button.jsx';
import ErrorState from '../../../components/ui/ErrorState.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import ConfirmDialog from '../../../components/cms/ConfirmDialog.jsx';
import DataTable from '../../../components/cms/DataTable.jsx';
import EmptyState from '../../../components/cms/EmptyState.jsx';
import Field from '../../../components/cms/Field.jsx';
import PageToolbar from '../../../components/cms/PageToolbar.jsx';
import StatusBadge from '../../../components/cms/StatusBadge.jsx';

export default function FormationsListPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: 'loading', formations: [] });
  const [attempt, setAttempt] = useState(0);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [createError, setCreateError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    api
      .get('/admin/formations', { signal: controller.signal })
      .then((data) => setState({ status: 'ready', formations: data.formations }))
      .catch((err) => {
        if (err.name !== 'AbortError') setState({ status: 'error', formations: [] });
      });
    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: 'loading', formations: [] });
    setAttempt((n) => n + 1);
  }, []);

  const openDialog = () => {
    setTitle('');
    setCreateError(null);
    setCreating(true);
  };

  const create = async () => {
    if (!title.trim()) {
      setCreateError(t('admin.newDialog.required'));
      return;
    }
    setBusy(true);
    setCreateError(null);
    try {
      const { formation } = await api.post('/admin/formations', { title });
      navigate(`/admin/formations/${formation.id}`);
    } catch (err) {
      setCreateError(t(errorKey(err)));
      setBusy(false);
    }
  };

  const columns = [
    {
      key: 'title',
      header: t('admin.list.columns.formation'),
      render: (f) => (
        <Link to={`/admin/formations/${f.id}`} className="cms-row-title">
          <span className="cms-thumb" aria-hidden="true">
            {f.cover ? <img src={f.cover.url} alt="" /> : <ImageOff size={18} strokeWidth={1.5} />}
          </span>
          <span>{f.title}</span>
        </Link>
      ),
    },
    { key: 'status', header: t('admin.list.columns.status'), render: (f) => <StatusBadge status={f.status} /> },
    { key: 'courses', header: t('admin.list.columns.courses'), render: (f) => f.courseCount },
    {
      key: 'access',
      header: t('admin.list.columns.access'),
      render: (f) => t(`admin.list.access.${f.requiredAccessLevel}`),
    },
    { key: 'updated', header: t('admin.list.columns.updated'), render: (f) => formatDate(i18n.language, f.updatedAt) },
    {
      key: 'actions',
      header: <span className="sr-only">{t('admin.list.columns.actions')}</span>,
      render: (f) => (
        <Button to={`/admin/formations/${f.id}`} variant="secondary">
          {t('admin.list.edit')}
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageToolbar title={t('admin.list.title')} subtitle={t('admin.list.subtitle')}>
        <Button onClick={openDialog}>
          <Plus size={16} strokeWidth={2} aria-hidden="true" />
          {t('admin.list.new')}
        </Button>
      </PageToolbar>

      {state.status === 'loading' && <LoadingState />}
      {state.status === 'error' && <ErrorState message={t('admin.list.loadError')} onRetry={retry} />}
      {state.status === 'ready' && state.formations.length === 0 && (
        <EmptyState icon={GraduationCap} title={t('admin.list.emptyTitle')}>
          <p>{t('admin.list.emptyBody')}</p>
          <Button onClick={openDialog}>{t('admin.list.new')}</Button>
        </EmptyState>
      )}
      {state.status === 'ready' && state.formations.length > 0 && <DataTable columns={columns} rows={state.formations} />}

      <ConfirmDialog
        open={creating}
        title={t('admin.newDialog.title')}
        confirmLabel={t('admin.newDialog.create')}
        busy={busy}
        onConfirm={create}
        onCancel={() => !busy && setCreating(false)}
      >
        <p>{t('admin.newDialog.body')}</p>
        <Field label={t('admin.newDialog.label')} htmlFor="new-formation-title" error={createError}>
          <input
            id="new-formation-title"
            type="text"
            maxLength={150}
            value={title}
            placeholder={t('admin.newDialog.placeholder')}
            onChange={(event) => setTitle(event.target.value)}
            autoFocus
          />
        </Field>
      </ConfirmDialog>
    </>
  );
}
