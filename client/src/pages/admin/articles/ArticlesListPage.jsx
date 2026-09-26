import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ImageOff, Newspaper } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, errorKey } from '../../../lib/api.js';
import { CONTENT_LANGUAGES } from '../../../lib/contentLanguage.js';
import { formatDate } from '../../../lib/format.js';
import Button from '../../../components/ui/Button.jsx';
import ContentList from '../../../components/cms/ContentList.jsx';
import StatusBadge from '../../../components/cms/StatusBadge.jsx';

// Languages badge + "copy into a new language" shortcut: starts a translation
// from a copy of the article's own text (P3-16 follow-up) so an admin does not
// need to open the editor just to get a language added to this row. It is
// still one article, one row: the new language only grows this cell.
function LanguageCell({ article }) {
  const { t } = useTranslation();
  const [added, setAdded] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const known = [article.language, ...article.translationLanguages, ...added];
  const missing = CONTENT_LANGUAGES.filter((code) => !known.includes(code));

  const duplicate = async (event) => {
    const language = event.target.value;
    event.target.value = '';
    if (!language) return;
    setBusy(true);
    setError(null);
    try {
      await api.post(`/admin/articles/${article.id}/translations/${language}/duplicate`);
      setAdded((list) => [...list, language]);
    } catch (err) {
      setError(t(errorKey(err)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cms-lang-cell">
      <span>{known.map((code) => code.toUpperCase()).join(' · ')}</span>
      {missing.length > 0 && (
        <select
          className="cms-lang-select"
          value=""
          onChange={duplicate}
          disabled={busy}
          aria-label={t('admin.articles.list.addLanguage')}
        >
          <option value="">{t('admin.articles.list.addLanguage')}</option>
          {missing.map((code) => (
            <option key={code} value={code}>
              {t(`contentLanguage.names.${code}`)}
            </option>
          ))}
        </select>
      )}
      {error && (
        <p className="cms-inline-message error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

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
    {
      key: 'language',
      header: t('admin.articles.list.columns.languages'),
      render: (a) => <LanguageCell article={a} />,
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
