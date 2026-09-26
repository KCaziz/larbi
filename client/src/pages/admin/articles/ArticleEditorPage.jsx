import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, ApiError, errorKey } from '../../../lib/api.js';
import ErrorState from '../../../components/ui/ErrorState.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import PageToolbar from '../../../components/cms/PageToolbar.jsx';
import PublishPanel from '../../../components/cms/PublishPanel.jsx';
import SaveBar from '../../../components/cms/SaveBar.jsx';
import StatusBadge from '../../../components/cms/StatusBadge.jsx';
import StepNav from '../../../components/cms/StepNav.jsx';
import StepTabs from '../../../components/cms/StepTabs.jsx';
import UnsavedChangesGuard from '../../../components/cms/UnsavedChangesGuard.jsx';
import ContentStep from './ContentStep.jsx';
import MediaStep from './MediaStep.jsx';
import OrganizeStep from './OrganizeStep.jsx';
import PreviewStep from './PreviewStep.jsx';
import TranslationsStep from './TranslationsStep.jsx';

// Fields typed by the author (steps "Contenu" and "Classement"), saved together
// with the save bar. Cover and files are saved on their own, immediately.
const toDraft = (a) => ({
  language: a.language,
  title: a.title,
  excerpt: a.excerpt,
  body: a.body ?? '',
  categoryId: a.category?.id ?? '',
  tags: a.tags,
  requiredAccessLevel: a.requiredAccessLevel,
  targetAccountTypes: a.targetAccountTypes,
  metaTitle: a.metaTitle ?? '',
  metaDescription: a.metaDescription ?? '',
});

// Which step lets the author fix each checklist item.
const STEP_FOR_ITEM = { title: 'content', excerpt: 'content', content: 'content', cover: 'media' };

const okOf = (article, keys) => keys.every((k) => article.readiness.items.find((i) => i.key === k)?.ok);

export default function ArticleEditorPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [load, setLoad] = useState({ status: 'loading' }); // loading | ready | notFound | error
  const [article, setArticle] = useState(null);
  const [draft, setDraft] = useState(null);
  const [categories, setCategories] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [step, setStep] = useState('content');
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [titleError, setTitleError] = useState(null);
  const [resetKey, setResetKey] = useState(0); // tells the rich editor to reload its content

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    Promise.all([
      api.get(`/admin/articles/${id}`, { signal }),
      api.get('/admin/article-categories', { signal }),
      api.get('/admin/tags', { signal }),
    ])
      .then(([a, c, tg]) => {
        setArticle(a.article);
        setDraft(toDraft(a.article));
        setCategories(c.categories);
        setSuggestions(tg.tags);
        setLoad({ status: 'ready' });
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setLoad({ status: err instanceof ApiError && err.status === 404 ? 'notFound' : 'error' });
      });
    return () => controller.abort();
  }, [id, attempt]);

  // Re-reads the article after an immediate action (cover, files, publish)
  // WITHOUT touching what the author is typing in the draft.
  const refresh = useCallback(async () => {
    const { article: fresh } = await api.get(`/admin/articles/${id}`);
    setArticle(fresh);
    return fresh;
  }, [id]);

  const dirty = useMemo(
    () => Boolean(article && draft && JSON.stringify(draft) !== JSON.stringify(toDraft(article))),
    [article, draft],
  );

  const setField = (name, value) => {
    setSaved(false);
    setSaveError(null);
    if (name === 'title') setTitleError(null);
    setDraft((d) => ({ ...d, [name]: value }));
  };

  const save = async () => {
    if (!draft.title.trim()) {
      setStep('content');
      setTitleError(t('admin.articles.content.titleRequired'));
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const { article: updated } = await api.patch(`/admin/articles/${id}`, {
        ...draft,
        body: draft.body || null,
        categoryId: draft.categoryId || null,
      });
      setArticle(updated);
      setDraft(toDraft(updated));
      setResetKey((k) => k + 1); // show the text as cleaned by the server
      setSaved(true);
      api.get('/admin/tags').then((tg) => setSuggestions(tg.tags)).catch(() => {});
    } catch (err) {
      setSaveError(t(errorKey(err)));
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    setDraft(toDraft(article));
    setResetKey((k) => k + 1);
    setSaveError(null);
    setTitleError(null);
  };

  if (load.status === 'loading') return <LoadingState />;
  if (load.status === 'notFound') return <ErrorState message={t('admin.articles.editor.notFound')} />;
  if (load.status === 'error') {
    return (
      <ErrorState
        message={t('admin.articles.editor.loadError')}
        onRetry={() => {
          setLoad({ status: 'loading' });
          setAttempt((n) => n + 1);
        }}
      />
    );
  }

  const steps = [
    { id: 'content', label: t('admin.articles.steps.content'), done: okOf(article, ['title', 'excerpt', 'content']) },
    { id: 'media', label: t('admin.articles.steps.media'), done: okOf(article, ['cover']) },
    { id: 'organize', label: t('admin.articles.steps.organize'), done: Boolean(article.category) },
    { id: 'translations', label: t('admin.articles.steps.translations'), done: article.translations.length > 0 },
    { id: 'preview', label: t('admin.articles.steps.preview'), done: false },
    { id: 'publish', label: t('admin.articles.steps.publish'), done: article.status === 'published' },
  ];
  const panelProps = (name) => ({
    role: 'tabpanel',
    id: `step-panel-${name}`,
    'aria-labelledby': `step-tab-${name}`,
    hidden: step !== name,
    className: 'cms-panel',
  });

  return (
    <>
      <UnsavedChangesGuard dirty={dirty} />
      <PageToolbar
        title={article.title || t('admin.articles.editor.untitled')}
        backTo="/admin/articles"
        backLabel={t('admin.articles.editor.back')}
        badge={<StatusBadge status={article.status} labelKey={`admin.articles.status.${article.status}`} />}
      />

      <StepTabs steps={steps} active={step} onChange={setStep} label={t('admin.articles.steps.label')} />

      <div {...panelProps('content')}>
        <ContentStep draft={draft} setField={setField} titleError={titleError} resetKey={resetKey} />
      </div>
      <div {...panelProps('media')}>
        <MediaStep article={article} onChanged={refresh} />
      </div>
      <div {...panelProps('organize')}>
        <OrganizeStep
          draft={draft}
          setField={setField}
          categories={categories}
          suggestions={suggestions}
          onCategoryCreated={(category) => {
            setCategories((list) => [...list, category].sort((a, b) => a.name.localeCompare(b.name)));
            setField('categoryId', category.id);
          }}
        />
      </div>
      <div {...panelProps('translations')}>
        <TranslationsStep article={article} languageUnsaved={draft.language !== article.language} onChanged={refresh} />
      </div>
      <div {...panelProps('preview')}>
        <PreviewStep article={article} draft={draft} categories={categories} dirty={dirty} />
      </div>
      <div {...panelProps('publish')}>
        <PublishPanel
          entity={article}
          basePath={`/admin/articles/${article.id}`}
          listPath="/admin/articles"
          i18n={{
            publish: 'admin.articles.publish',
            danger: 'admin.articles.danger',
            readiness: 'admin.articles.readiness',
            blocked: 'blocked',
          }}
          hasUnsaved={dirty}
          onChanged={refresh}
          onGo={(key) => setStep(STEP_FOR_ITEM[key] ?? 'content')}
          extra={
            article.publicPath && (
              <Link className="cms-back" to={article.publicPath} target="_blank" rel="noopener">
                <ExternalLink size={16} strokeWidth={1.75} aria-hidden="true" />
                {t('admin.articles.publish.viewOnBlog')}
              </Link>
            )
          }
        />
      </div>

      <StepNav steps={steps} active={step} onChange={setStep} />

      {(step === 'content' || step === 'organize') && (
        <SaveBar dirty={dirty} saving={saving} saved={saved && !dirty} error={saveError} onSave={save} onDiscard={discard} />
      )}
    </>
  );
}
