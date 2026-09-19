import { Link } from 'react-router-dom';
import { GraduationCap, ImageOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../../lib/format.js';
import Button from '../../../components/ui/Button.jsx';
import ContentList from '../../../components/cms/ContentList.jsx';
import StatusBadge from '../../../components/cms/StatusBadge.jsx';

// List of formations for the administrator. The list / create logic is the
// shared CMS "content list" (also used by the articles).
export default function FormationsListPage() {
  const { t, i18n } = useTranslation();

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
    <ContentList
      listPath="/admin/formations"
      listKey="formations"
      createPath="/admin/formations"
      createKey="formation"
      editPath={(f) => `/admin/formations/${f.id}`}
      icon={GraduationCap}
      columns={columns}
      texts={{
        title: t('admin.list.title'),
        subtitle: t('admin.list.subtitle'),
        newLabel: t('admin.list.new'),
        emptyTitle: t('admin.list.emptyTitle'),
        emptyBody: t('admin.list.emptyBody'),
        loadError: t('admin.list.loadError'),
        dialog: {
          title: t('admin.newDialog.title'),
          body: t('admin.newDialog.body'),
          label: t('admin.newDialog.label'),
          placeholder: t('admin.newDialog.placeholder'),
          create: t('admin.newDialog.create'),
          required: t('admin.newDialog.required'),
        },
      }}
    />
  );
}
