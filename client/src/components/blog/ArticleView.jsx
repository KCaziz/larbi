import { Link } from 'react-router-dom';
import { Clock, Download, FileText, Lock, Tag, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../lib/format.js';
import RichContent from '../ui/RichContent.jsx';
import ArticleLock from './ArticleLock.jsx';
import './Blog.css';

function formatSize(bytes) {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// One article, as visitors read it. Shared by the public page and by the
// administration preview, so what the editor previews IS what is published.
// `article`: { title, excerpt, category, tags: [{name, slug}], coverUrl, author,
// publishedAt, readingMinutes, body, media: [{id, kind, originalName, sizeBytes, url}] }.
// `linkTags`: tags lead to the filtered blog list (off in the preview).
export default function ArticleView({ article, linkTags = true }) {
  const { t, i18n } = useTranslation();

  return (
    <article className="blog-article">
      <header className="blog-article-head">
        <div className="blog-chips">
          {article.category && <span className="blog-chip">{article.category.name}</span>}
          {article.requiredAccessLevel === 'premium' && (
            <span className="blog-chip blog-chip-premium">
              <Lock size={12} strokeWidth={2} aria-hidden="true" />
              {t('blogList.premiumBadge')}
            </span>
          )}
        </div>
        <h1>{article.title}</h1>
        {article.excerpt && <p className="lead">{article.excerpt}</p>}
        <p className="blog-article-meta">
          {article.author?.name && (
            <span className="blog-meta-item">
              <User size={14} strokeWidth={1.8} aria-hidden="true" />
              {t('article.by', { name: article.author.name })}
            </span>
          )}
          {article.publishedAt && (
            <time dateTime={article.publishedAt}>{t('article.publishedOn', { date: formatDate(i18n.language, article.publishedAt) })}</time>
          )}
          {article.readingMinutes > 0 && (
            <span className="blog-meta-item">
              <Clock size={14} strokeWidth={1.8} aria-hidden="true" />
              {t('blogList.readingTime', { count: article.readingMinutes })}
            </span>
          )}
        </p>
      </header>

      {article.coverUrl && <img className="blog-article-cover" src={article.coverUrl} alt="" />}

      {/* `locked` is the server's decision: for a locked reader the text and files were never sent. */}
      {article.locked && <ArticleLock reason={article.lockReason} />}

      {article.body ? <RichContent html={article.body} /> : null}

      {article.media?.length > 0 && (
        <section className="blog-files" aria-labelledby="blog-files-title">
          <h2 id="blog-files-title">{t('article.files')}</h2>
          {article.media.map((m) => (
            <figure key={m.id} className="blog-file">
              {m.kind === 'video' && <video controls preload="metadata" aria-label={t('article.videoLabel', { name: m.originalName })} src={m.url} />}
              {m.kind === 'image' && <img src={m.url} alt={m.originalName} loading="lazy" />}
              {m.kind === 'document' && (
                <a className="blog-doc" href={m.url} download>
                  <FileText size={22} strokeWidth={1.6} aria-hidden="true" />
                  <span>
                    <strong>{m.originalName}</strong>
                    <small>{formatSize(m.sizeBytes)}</small>
                  </span>
                  <Download size={18} strokeWidth={1.8} aria-label={t('article.download')} />
                </a>
              )}
            </figure>
          ))}
        </section>
      )}

      {article.tags?.length > 0 && (
        <ul className="blog-tags" aria-label={t('article.tagsLabel')}>
          {article.tags.map((tag) => (
            <li key={tag.slug}>
              {linkTags ? (
                <Link className="blog-tag" to={`/blog?tag=${encodeURIComponent(tag.slug)}`}>
                  <Tag size={12} strokeWidth={2} aria-hidden="true" />
                  {tag.name}
                </Link>
              ) : (
                <span className="blog-tag">
                  <Tag size={12} strokeWidth={2} aria-hidden="true" />
                  {tag.name}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
