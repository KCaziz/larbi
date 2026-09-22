import { useState } from 'react';
import { Download, Mail, Search, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, errorKey } from '../../../lib/api.js';
import { formatDate } from '../../../lib/format.js';
import { useApi } from '../../../lib/useApi.js';
import Button from '../../../components/ui/Button.jsx';
import ErrorState from '../../../components/ui/ErrorState.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import Notice from '../../../components/ui/Notice.jsx';
import ConfirmDialog from '../../../components/cms/ConfirmDialog.jsx';
import DataTable from '../../../components/cms/DataTable.jsx';
import EmptyState from '../../../components/cms/EmptyState.jsx';
import Field from '../../../components/cms/Field.jsx';
import PageToolbar from '../../../components/cms/PageToolbar.jsx';
import './Newsletter.css';

const STATUSES = ['pending', 'confirmed', 'unsubscribed'];
const LOCALES = ['fr', 'en', 'ar'];

function Subscribers() {
  const { t, i18n } = useTranslation();
  const [status, setStatus] = useState('');
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const params = new URLSearchParams({ page: String(page), limit: '25' });
  if (status) params.set('status', status);
  if (query) params.set('query', query);
  const list = useApi(`/admin/newsletter/subscribers?${params}`);

  const remove = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.delete(`/admin/newsletter/subscribers/${toDelete.id}`);
      setToDelete(null);
      list.reload();
    } catch (err) {
      setError(t(errorKey(err)));
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: 'email', header: t('admin.newsletter.columns.email'), render: (s) => s.email },
    {
      key: 'status',
      header: t('admin.newsletter.columns.status'),
      render: (s) => <span className={`newsletter-status newsletter-status-${s.status}`}>{t(`admin.newsletter.status.${s.status}`)}</span>,
    },
    { key: 'locale', header: t('admin.newsletter.columns.locale'), render: (s) => t(`admin.newsletter.locale.${s.locale}`) },
    {
      key: 'since',
      header: t('admin.newsletter.columns.since'),
      render: (s) => formatDate(i18n.language, s.confirmedAt ?? s.createdAt),
    },
    {
      key: 'actions',
      header: <span className="sr-only">{t('admin.list.columns.actions')}</span>,
      render: (s) => (
        <Button variant="secondary" onClick={() => { setError(null); setToDelete(s); }} aria-label={t('admin.newsletter.delete', { email: s.email })}>
          <Trash2 size={15} strokeWidth={1.9} aria-hidden="true" />
          {t('admin.newsletter.deleteShort')}
        </Button>
      ),
    },
  ];

  const counts = list.status === 'ready' ? list.data.counts : null;

  return (
    <>
      {counts && (
        <dl className="newsletter-stats">
          {['confirmed', 'pending', 'unsubscribed'].map((key) => (
            <div key={key}>
              <dt>{t(`admin.newsletter.status.${key}`)}</dt>
              <dd>{counts[key]}</dd>
            </div>
          ))}
        </dl>
      )}

      <form
        className="newsletter-filters"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setQuery(text.trim());
        }}
      >
        <Field label={t('admin.newsletter.search')} htmlFor="nl-search">
          <input id="nl-search" type="search" maxLength={100} value={text} onChange={(e) => setText(e.target.value)} />
        </Field>
        <Field label={t('admin.newsletter.filterStatus')} htmlFor="nl-status">
          <select
            id="nl-status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">{t('admin.newsletter.statusAll')}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`admin.newsletter.status.${s}`)}
              </option>
            ))}
          </select>
        </Field>
        <Button type="submit" variant="secondary">
          <Search size={16} strokeWidth={1.9} aria-hidden="true" />
          {t('admin.newsletter.searchButton')}
        </Button>
        {/* Same-origin downloads: the session cookie authorises them, the server checks the role. */}
        <Button to="/api/admin/newsletter/subscribers.csv?status=confirmed" download variant="secondary" reloadDocument>
          <Download size={16} strokeWidth={1.9} aria-hidden="true" />
          {t('admin.newsletter.exportConfirmed')}
        </Button>
        <Button to="/api/admin/newsletter/subscribers.csv?status=all" download variant="secondary" reloadDocument>
          <Download size={16} strokeWidth={1.9} aria-hidden="true" />
          {t('admin.newsletter.exportAll')}
        </Button>
      </form>

      {list.status === 'loading' && <LoadingState />}
      {list.status === 'error' && <ErrorState message={t('admin.newsletter.loadError')} onRetry={list.reload} />}
      {list.status === 'ready' && list.data.subscribers.length === 0 && (
        <EmptyState icon={Mail} title={t('admin.newsletter.emptyTitle')}>
          <p>{t('admin.newsletter.emptyBody')}</p>
        </EmptyState>
      )}
      {list.status === 'ready' && list.data.subscribers.length > 0 && (
        <>
          <DataTable columns={columns} rows={list.data.subscribers} />
          {list.data.pagination.pages > 1 && (
            <nav className="newsletter-pager" aria-label={t('blogList.pagination')}>
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

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={t('admin.newsletter.deleteTitle')}
        confirmLabel={t('admin.newsletter.deleteConfirm')}
        danger
        busy={busy}
        onConfirm={remove}
        onCancel={() => !busy && setToDelete(null)}
      >
        <p>{t('admin.newsletter.deleteBody', { email: toDelete?.email ?? '' })}</p>
        {error && (
          <p className="cms-inline-message error" role="alert">
            {error}
          </p>
        )}
      </ConfirmDialog>
    </>
  );
}

// Preparation of the next mailing: built from the latest published articles, shown
// per language. Nothing is sent from here.
function Digest() {
  const { t } = useTranslation();
  const [limit, setLimit] = useState('5');
  const [locale, setLocale] = useState('fr');
  const digest = useApi(`/admin/newsletter/digest?limit=${limit}`);

  return (
    <>
      <p className="cms-intro">{t('admin.newsletter.digest.intro')}</p>
      {digest.status === 'loading' && <LoadingState />}
      {digest.status === 'error' && <ErrorState message={t('admin.newsletter.loadError')} onRetry={digest.reload} />}
      {digest.status === 'ready' && (
        <>
          <Notice variant="info">
            {digest.data.digest.sendingAvailable ? t('admin.newsletter.digest.notSentYet') : t('admin.newsletter.digest.noProvider')}
          </Notice>
          <div className="newsletter-filters">
            <Field label={t('admin.newsletter.digest.count')} htmlFor="nl-limit">
              <select id="nl-limit" value={limit} onChange={(e) => setLimit(e.target.value)}>
                {[3, 5, 10].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('admin.newsletter.digest.language')} htmlFor="nl-locale">
              <select id="nl-locale" value={locale} onChange={(e) => setLocale(e.target.value)}>
                {LOCALES.map((l) => (
                  <option key={l} value={l}>
                    {t(`admin.newsletter.locale.${l}`)} ({digest.data.digest.recipients.byLocale[l]})
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <p>{t('admin.newsletter.digest.recipients', { count: digest.data.digest.recipients.total })}</p>
          {digest.data.digest.articles.length === 0 ? (
            <EmptyState icon={Mail} title={t('admin.newsletter.digest.noArticles')} />
          ) : (
            <div className="newsletter-preview">
              <p>
                <strong>{t('admin.newsletter.digest.subject')}</strong> {digest.data.digest.messages[locale].subject}
              </p>
              <pre dir={locale === 'ar' ? 'rtl' : 'ltr'}>{digest.data.digest.messages[locale].text}</pre>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default function NewsletterPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('subscribers');

  return (
    <>
      <PageToolbar title={t('admin.newsletter.title')} subtitle={t('admin.newsletter.subtitle')} />
      <div className="cms-steps" role="tablist" aria-label={t('admin.newsletter.title')}>
        {['subscribers', 'digest'].map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`nl-tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`nl-panel-${id}`}
            className={`cms-step ${tab === id ? 'active' : ''}`}
            onClick={() => setTab(id)}
          >
            {t(`admin.newsletter.tabs.${id}`)}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`nl-panel-${tab}`} aria-labelledby={`nl-tab-${tab}`} className="newsletter-panel">
        {tab === 'subscribers' ? <Subscribers /> : <Digest />}
      </div>
    </>
  );
}
