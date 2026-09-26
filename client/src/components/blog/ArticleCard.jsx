import { Link } from 'react-router-dom';
import { Clock, ImageOff, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../lib/format.js';
import LanguageBadges from './LanguageBadges.jsx';
import { textDirection } from '../../lib/contentLanguage.js';
import './Blog.css';

// Card of the blog list and of "related articles". `article` = card from the API.
export default function ArticleCard({ article }) {
  const { t, i18n } = useTranslation();
  const href = `/blog/${article.slug}`;

  return (
    <article className="blog-card">
      <Link to={href} className="blog-card-cover" tabIndex={-1} aria-hidden="true">
        {article.coverUrl ? <img src={article.coverUrl} alt="" loading="lazy" /> : <ImageOff size={28} strokeWidth={1.4} />}
      </Link>
      <div className="blog-card-body">
        <div className="blog-chips">
          {article.category && <span className="blog-chip">{article.category.name}</span>}
          {article.requiredAccessLevel === 'premium' && (
            <span className="blog-chip blog-chip-premium">
              <Lock size={12} strokeWidth={2} aria-hidden="true" />
              {t('blogList.premiumBadge')}
            </span>
          )}
        </div>
        <h3 lang={article.language} dir={textDirection(article.language)}>
          <Link to={href}>{article.title}</Link>
        </h3>
        {article.excerpt && (
          <p className="blog-card-text" lang={article.language} dir={textDirection(article.language)}>
            {article.excerpt}
          </p>
        )}
        <p className="blog-card-meta">
          <time dateTime={article.publishedAt}>{formatDate(i18n.language, article.publishedAt)}</time>
          {article.readingMinutes > 0 && (
            <span className="blog-meta-item">
              <Clock size={13} strokeWidth={1.8} aria-hidden="true" />
              {t('blogList.readingTime', { count: article.readingMinutes })}
            </span>
          )}
          <LanguageBadges languages={article.availableLanguages} shown={article.language} />
        </p>
      </div>
    </article>
  );
}
