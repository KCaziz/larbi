import { Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ArticleView from '../../../components/blog/ArticleView.jsx';
import Notice from '../../../components/ui/Notice.jsx';

// Step 4: the article exactly as visitors will read it (same component as the
// public page), built from what is on screen NOW, saved or not. Only the media
// and the reading time come from the last saved version.
export default function PreviewStep({ article, draft, categories, dirty }) {
  const { t } = useTranslation();

  const preview = {
    title: draft.title || t('admin.articles.editor.untitled'),
    excerpt: draft.excerpt,
    body: draft.body,
    category: categories.find((c) => c.id === draft.categoryId) ?? null,
    tags: draft.tags.map((name) => ({ name, slug: name })),
    coverUrl: article.cover?.url ?? null,
    media: article.media,
    author: article.author,
    publishedAt: article.publishedAt ?? new Date().toISOString(),
    readingMinutes: article.readingMinutes,
  };

  return (
    <div className="cms-form">
      <p className="cms-intro">
        <Eye size={16} strokeWidth={1.9} aria-hidden="true" /> {t('admin.articles.preview.intro')}
      </p>
      {dirty && <Notice variant="info">{t('admin.articles.preview.unsaved')}</Notice>}
      <div className="cms-preview">
        <ArticleView article={preview} linkTags={false} />
      </div>
    </div>
  );
}
