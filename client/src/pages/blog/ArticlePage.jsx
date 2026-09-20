import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import ArticleCard from '../../components/blog/ArticleCard.jsx';
import ArticleView from '../../components/blog/ArticleView.jsx';
import NewsletterForm from '../../components/newsletter/NewsletterForm.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import '../../components/blog/Blog.css';
import '../Pages.css';

// Public page of one article (/blog/:slug). An unknown or unpublished slug is the
// same "not found": nothing tells a draft from an article that never existed.
export default function ArticlePage() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const { status, data, error, reload } = useApi(`/blog/articles/${slug}`);
  const article = status === 'ready' ? data.article : null;

  useDocumentMeta(article?.seo.title, article?.seo.description);

  if (status === 'loading') return <LoadingState />;

  if (status === 'error') {
    const missing = error instanceof ApiError && error.status === 404;
    if (!missing) return <ErrorState message={t('article.loadError')} onRetry={reload} />;
    return (
      <section className="status-hero">
        <div className="status-icon" aria-hidden="true">
          <FileText size={26} strokeWidth={1.6} />
        </div>
        <span className="status-label">{t('article.label')}</span>
        <h1>{t('article.notFoundTitle')}</h1>
        <p>{t('article.notFoundBody')}</p>
        <Button to="/blog" className="btn-lg">
          {t('article.back')}
        </Button>
      </section>
    );
  }

  return (
    <div className="blog-page">
      <Link to="/blog" className="blog-back">
        <ArrowLeft className="icon-dir" size={16} strokeWidth={1.75} aria-hidden="true" />
        {t('article.back')}
      </Link>
      <ArticleView article={article} />
      {article.related.length > 0 && (
        <section className="blog-related" aria-labelledby="related-title">
          <h2 id="related-title">{t('article.related')}</h2>
          <div className="blog-grid">
            {article.related.map((item) => (
              <ArticleCard key={item.slug} article={item} />
            ))}
          </div>
        </section>
      )}
      <NewsletterForm />
    </div>
  );
}
