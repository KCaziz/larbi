import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileImage, Search, Trash2 } from 'lucide-react';
import { api, errorKey } from '../../../lib/api.js';
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

const KINDS = ['image', 'video', 'document'];

const formatSize = (t, bytes) => {
  if (bytes < 1024) return t('admin.media.size.bytes', { value: bytes });
  if (bytes < 1024 * 1024) return t('admin.media.size.kb', { value: (bytes / 1024).toFixed(1) });
  return t('admin.media.size.mb', { value: (bytes / (1024 * 1024)).toFixed(1) });
};

export default function MediaLibraryPage() {
  const { t, i18n } = useTranslation();
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const params = new URLSearchParams({ page: String(page), limit: '25' });
  if (query) params.set('query', query);
  if (kind) params.set('kind', kind);
  const list = useApi(`/admin/media?${params}`);

  const remove = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.delete(`/admin/media/${toDelete.id}`);
      setToDelete(null);
      list.reload();
    } catch (err) {
      setError(t(errorKey(err)));
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: 'name', header: t('admin.media.columns.name'), render: (m) => m.originalName },
    { key: 'kind', header: t('admin.media.columns.kind'), render: (m) => t(`admin.media.kind.${m.kind}`) },
    { key: 'size', header: t('admin.media.columns.size'), render: (m) => formatSize(t, m.sizeBytes) },
    {
      key: 'usage',
      header: t('admin.media.columns.usage'),
      render: (m) => <span className="admin-usage">{m.usage.label ? `${t(`admin.media.usage.${m.usage.kind}`)} — ${m.usage.label}` : t('admin.media.usage.orphan')}</span>,
    },
    { key: 'uploadedBy', header: t('admin.media.columns.uploadedBy'), render: (m) => m.uploadedBy ?? '—' },
    { key: 'createdAt', header: t('admin.media.columns.since'), render: (m) => formatDate(i18n.language, m.createdAt) },
    {
      key: 'actions',
      header: <span className="sr-only">{t('admin.list.columns.actions')}</span>,
      render: (m) => (
        <Button variant="secondary" onClick={() => { setError(null); setToDelete(m); }}>
          <Trash2 size={15} strokeWidth={1.9} aria-hidden="true" />
          {t('admin.media.delete')}
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageToolbar title={t('admin.media.title')} subtitle={t('admin.media.subtitle')} />
      <div className="admin-panel">
        <form
          className="admin-filters"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setQuery(text.trim());
          }}
        >
          <Field label={t('admin.media.search')} htmlFor="m-search">
            <input id="m-search" type="search" maxLength={150} value={text} onChange={(e) => setText(e.target.value)} />
          </Field>
          <Field label={t('admin.media.filterKind')} htmlFor="m-kind">
            <select id="m-kind" value={kind} onChange={(e) => { setKind(e.target.value); setPage(1); }}>
              <option value="">{t('admin.media.kindAll')}</option>
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {t(`admin.media.kind.${k}`)}
                </option>
              ))}
            </select>
          </Field>
          <Button type="submit" variant="secondary">
            <Search size={16} strokeWidth={1.9} aria-hidden="true" />
            {t('admin.media.searchButton')}
          </Button>
        </form>

        {list.status === 'loading' && <LoadingState />}
        {list.status === 'error' && <ErrorState message={t('admin.media.loadError')} onRetry={list.reload} />}
        {list.status === 'ready' && list.data.media.length === 0 && (
          <EmptyState icon={FileImage} title={t('admin.media.emptyTitle')}>
            <p>{t('admin.media.emptyBody')}</p>
          </EmptyState>
        )}
        {list.status === 'ready' && list.data.media.length > 0 && (
          <>
            <DataTable columns={columns} rows={list.data.media} />
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
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={t('admin.media.deleteTitle')}
        confirmLabel={t('admin.media.deleteConfirm')}
        danger
        busy={busy}
        onConfirm={remove}
        onCancel={() => !busy && setToDelete(null)}
      >
        <p>{t('admin.media.deleteBody', { name: toDelete?.originalName ?? '' })}</p>
        {error && (
          <p className="cms-inline-message error" role="alert">
            {error}
          </p>
        )}
      </ConfirmDialog>
    </>
  );
}
