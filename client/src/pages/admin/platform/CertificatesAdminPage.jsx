import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Award, RotateCcw, Search, ShieldAlert } from 'lucide-react';
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

export default function CertificatesAdminPage() {
  const { t, i18n } = useTranslation();
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [toRevoke, setToRevoke] = useState(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const params = new URLSearchParams({ page: String(page), limit: '25', status });
  if (query) params.set('query', query);
  const list = useApi(`/admin/certificates?${params}`);

  const revoke = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.post(`/admin/certificates/${toRevoke.id}/revoke`, { reason: reason.trim() || undefined });
      setToRevoke(null);
      setReason('');
      list.reload();
    } catch (err) {
      setError(t(errorKey(err)));
    } finally {
      setBusy(false);
    }
  };

  const restore = async (certificate) => {
    setError(null);
    try {
      await api.post(`/admin/certificates/${certificate.id}/restore`);
      list.reload();
    } catch (err) {
      setError(t(errorKey(err)));
    }
  };

  const columns = [
    { key: 'number', header: t('admin.certificates.columns.number'), render: (c) => <code>{c.certificateNumber}</code> },
    { key: 'holder', header: t('admin.certificates.columns.holder'), render: (c) => c.holderName },
    { key: 'formation', header: t('admin.certificates.columns.formation'), render: (c) => c.formationTitle },
    { key: 'issuedAt', header: t('admin.certificates.columns.issuedAt'), render: (c) => formatDate(i18n.language, c.issuedAt) },
    {
      key: 'status',
      header: t('admin.certificates.columns.status'),
      render: (c) => (
        <span className={`cms-badge ${c.revoked ? 'cms-badge-danger' : 'cms-badge-published'}`}>
          {c.revoked ? t('admin.certificates.revoked') : t('admin.certificates.active')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">{t('admin.list.columns.actions')}</span>,
      render: (c) =>
        c.revoked ? (
          <Button variant="secondary" onClick={() => restore(c)}>
            <RotateCcw size={15} strokeWidth={1.9} aria-hidden="true" />
            {t('admin.certificates.restore')}
          </Button>
        ) : (
          <Button variant="secondary" onClick={() => { setError(null); setReason(''); setToRevoke(c); }}>
            <ShieldAlert size={15} strokeWidth={1.9} aria-hidden="true" />
            {t('admin.certificates.revoke')}
          </Button>
        ),
    },
  ];

  return (
    <>
      <PageToolbar title={t('admin.certificates.title')} subtitle={t('admin.certificates.subtitle')} />
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
          <Field label={t('admin.certificates.search')} htmlFor="c-search">
            <input id="c-search" type="search" maxLength={100} value={text} onChange={(e) => setText(e.target.value)} />
          </Field>
          <Field label={t('admin.certificates.filterStatus')} htmlFor="c-status">
            <select id="c-status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="all">{t('admin.certificates.statusAll')}</option>
              <option value="active">{t('admin.certificates.active')}</option>
              <option value="revoked">{t('admin.certificates.revoked')}</option>
            </select>
          </Field>
          <Button type="submit" variant="secondary">
            <Search size={16} strokeWidth={1.9} aria-hidden="true" />
            {t('admin.certificates.searchButton')}
          </Button>
        </form>

        {list.status === 'loading' && <LoadingState />}
        {list.status === 'error' && <ErrorState message={t('admin.certificates.loadError')} onRetry={list.reload} />}
        {list.status === 'ready' && list.data.certificates.length === 0 && (
          <EmptyState icon={Award} title={t('admin.certificates.emptyTitle')} />
        )}
        {list.status === 'ready' && list.data.certificates.length > 0 && (
          <>
            <DataTable columns={columns} rows={list.data.certificates} />
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
        open={Boolean(toRevoke)}
        title={t('admin.certificates.revokeTitle')}
        confirmLabel={t('admin.certificates.revokeConfirm')}
        danger
        busy={busy}
        onConfirm={revoke}
        onCancel={() => !busy && setToRevoke(null)}
      >
        <p>{t('admin.certificates.revokeBody', { number: toRevoke?.certificateNumber ?? '' })}</p>
        <Field label={t('admin.certificates.revokeReason')} htmlFor="c-reason">
          <textarea id="c-reason" rows={3} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
        {error && (
          <p className="cms-inline-message error" role="alert">
            {error}
          </p>
        )}
      </ConfirmDialog>
    </>
  );
}
