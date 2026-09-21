import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Copy, GraduationCap, ImageOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, errorKey } from '../../../lib/api.js';
import { formatDate } from '../../../lib/format.js';
import Button from '../../../components/ui/Button.jsx';
import ContentList from '../../../components/cms/ContentList.jsx';
import StatusBadge from '../../../components/cms/StatusBadge.jsx';

// Duplicates a formation (content and files, as a draft) and opens the copy.
function DuplicateButton({ formation }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [state, setState] = useState({ busy: false, error: null });
  const run = async () => {
    setState({ busy: true, error: null });
    try {
      const { formation: copy } = await api.post(`/admin/formations/${formation.id}/duplicate`);
      navigate(`/admin/formations/${copy.id}`);
    } catch (err) {
      setState({ busy: false, error: t(errorKey(err)) });
    }
  };
  return (
    <>
      <Button variant="secondary" onClick={run} disabled={state.busy} aria-label={`${t('admin.list.duplicate')} : ${formation.title}`}>
        <Copy size={15} strokeWidth={1.9} aria-hidden="true" />
        {state.busy ? t('admin.list.duplicating') : t('admin.list.duplicate')}
      </Button>
      {state.error && (
        <small className="form-hint form-hint-error" role="alert">
          {state.error}
        </small>
      )}
    </>
  );
}

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
        <span className="cms-row-actions">
          <Button to={`/admin/formations/${f.id}`} variant="secondary">
            {t('admin.list.edit')}
          </Button>
          <DuplicateButton formation={f} />
        </span>
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
