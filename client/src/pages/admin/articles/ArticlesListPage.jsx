import { Link } from 'react-router-dom';
import { ImageOff, Newspaper } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../../lib/format.js';
import Button from '../../../components/ui/Button.jsx';
import ContentList from '../../../components/cms/ContentList.jsx';
import StatusBadge from '../../../components/cms/StatusBadge.jsx';

// List of blog articles for the administrator (shared CMS content list).
export default function ArticlesListPage() {
  const { t, i18n } = useTranslation();

  const columns = [
    {
      key: 'title',
      header: t('admin.articles.list.columns.article'),
      render: (a) => (
        <Link to={`/admin/articles/${a.id}`} className="cms-row-title">
          <span className="cms-thumb" aria-hidden="true">
            {a.cover ? <img src={a.cover.url} alt="" /> : <ImageOff size={18} strokeWidth={1.5} />}
          </span>
          <span>{a.title}</span>
        </Link>
      ),
    },
    {
      key: 'status',
      header: t('admin.articles.list.columns.status'),
      render: (a) => <StatusBadge status={a.status} labelKey={`admin.articles.status.${a.status}`} />,
    },
    {
      key: 'category',
      header: t('admin.articles.list.columns.category'),
      render: (a) => a.category?.name ?? t('admin.articles.list.uncategorized'),
    },
    { key: 'author', header: t('admin.articles.list.columns.author'), render: (a) => a.author?.name ?? '—' },
    { key: 'updated', header: t('admin.articles.list.columns.updated'), render: (a) => formatDate(i18n.language, a.updatedAt) },
    {
      key: 'actions',
      header: <span className="sr-only">{t('admin.list.columns.actions')}</span>,
      render: (a) => (
        <Button to={`/admin/articles/${a.id}`} variant="secondary">
          {t('admin.list.edit')}
        </Button>
      ),
    },
  ];

  return (
    <ContentList
      listPath="/admin/articles"
      listKey="articles"
      createPath="/admin/articles"
      createKey="article"
      editPath={(a) => `/admin/articles/${a.id}`}
      icon={Newspaper}
      columns={columns}
      texts={{
        title: t('admin.articles.list.title'),
        subtitle: t('admin.articles.list.subtitle'),
        newLabel: t('admin.articles.list.new'),
        emptyTitle: t('admin.articles.list.emptyTitle'),
        emptyBody: t('admin.articles.list.emptyBody'),
        loadError: t('admin.articles.list.loadError'),
        dialog: {
          title: t('admin.articles.newDialog.title'),
          body: t('admin.articles.newDialog.body'),
          label: t('admin.articles.newDialog.label'),
          placeholder: t('admin.articles.newDialog.placeholder'),
          create: t('admin.articles.newDialog.create'),
          required: t('admin.articles.newDialog.required'),
        },
      }}
    />
  );
}
