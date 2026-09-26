import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Inbox, Newspaper, Search, SearchX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import ArticleCard from '../../components/blog/ArticleCard.jsx';
import NewsletterForm from '../../components/newsletter/NewsletterForm.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import { withLang } from '../../lib/contentLanguage.js';
import '../../components/blog/Blog.css';
import '../Pages.css';

const toPage = (value) => Math.max(1, Math.floor(Number(value)) || 1);

// Public blog: search, category / keyword filters and pagination. The filters live
// in the address (?q=&category=&tag=&page=) so a filtered list can be shared.
export default function BlogListPage() {
  const { t, i18n } = useTranslation();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const category = params.get('category') ?? '';
  const tag = params.get('tag') ?? '';
  const page = toPage(params.get('page'));
  const [text, setText] = useState(query);

  useDocumentMeta(t('blogList.title'), t('blogList.intro'));

  const apiParams = new URLSearchParams({ page: String(page) });
  if (query) apiParams.set('query', query);
  if (category) apiParams.set('category', category);
  if (tag) apiParams.set('tag', tag);
  const list = useApi(withLang(`/blog/articles?${apiParams}`, i18n.language));
  const categories = useApi('/blog/categories');
  const tags = useApi('/blog/tags');
  const recommended = useApi(withLang('/blog/recommendations', i18n.language));

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries({ page: '', ...changes }).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    setParams(next);
  };

  const submit = (event) => {
    event.preventDefault();
    update({ q: text.trim() });
  };
  const filtered = Boolean(query || category || tag);
  const clear = () => {
    setText('');
    setParams(new URLSearchParams());
  };

  // A malformed filter typed in the address (400) simply matches nothing.
  const rejected = list.status === 'error' && list.error instanceof ApiError && list.error.status === 400;
  const total = list.status === 'ready' ? list.data.pagination.total : 0;

  return (
    <>
      <PageHeader icon={Newspaper} title={t('blogList.title')} subtitle={t('blogList.intro')} />

      <div className="blog-page">
        <div className="blog-controls">
          <form className="blog-search" role="search" onSubmit={submit}>
            <label htmlFor="blog-search" className="sr-only">
              {t('blogList.searchLabel')}
            </label>
            <input
              id="blog-search"
              type="search"
              maxLength={100}
              value={text}
              placeholder={t('blogList.searchPlaceholder')}
              onChange={(event) => setText(event.target.value)}
            />
            <Button type="submit">
              <Search size={16} strokeWidth={1.9} aria-hidden="true" />
              {t('blogList.searchButton')}
            </Button>
            {filtered && (
              <Button variant="secondary" onClick={clear}>
                {t('blogList.clear')}
              </Button>
            )}
          </form>

          {categories.status === 'ready' && categories.data.categories.length > 0 && (
            <div className="blog-filter-row" role="group" aria-label={t('blogList.categories')}>
              <span className="blog-filter-label">{t('blogList.categories')}</span>
              {categories.data.categories.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  className="blog-filter"
                  aria-pressed={category === c.slug}
                  onClick={() => update({ category: category === c.slug ? '' : c.slug })}
                >
                  {c.name} ({c.count})
                </button>
              ))}
            </div>
          )}

          {tags.status === 'ready' && tags.data.tags.length > 0 && (
            <div className="blog-filter-row" role="group" aria-label={t('blogList.tags')}>
              <span className="blog-filter-label">{t('blogList.tags')}</span>
              {tags.data.tags.map((item) => (
                <button
                  key={item.slug}
                  type="button"
                  className="blog-filter"
                  aria-pressed={tag === item.slug}
                  onClick={() => update({ tag: tag === item.slug ? '' : item.slug })}
                >
                  {item.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Only when something is really aimed at this account type (the server decides). */}
        {recommended.status === 'ready' && recommended.data.personalised && !filtered && page === 1 && (
          <section className="blog-foryou" aria-labelledby="forme-title">
            <h2 id="forme-title">{t('blogList.forYou')}</h2>
            <p>{t('blogList.forYouIntro')}</p>
            <div className="blog-grid">
              {recommended.data.articles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </section>
        )}

        {list.status === 'loading' && <LoadingState />}
        {list.status === 'error' && !rejected && <ErrorState message={t('blogList.loadError')} onRetry={list.reload} />}

        {(rejected || (list.status === 'ready' && total === 0)) && (
          <section className="status-hero">
            <div className="status-icon" aria-hidden="true">
              {filtered ? <SearchX size={26} strokeWidth={1.6} /> : <Inbox size={26} strokeWidth={1.6} />}
            </div>
            <h2>{filtered ? t('blogList.noResultsTitle') : t('blogList.emptyTitle')}</h2>
            <p>{filtered ? t('blogList.noResultsBody') : t('blogList.emptyBody')}</p>
            {filtered && (
              <Button variant="secondary" onClick={clear}>
                {t('blogList.clear')}
              </Button>
            )}
          </section>
        )}

        {list.status === 'ready' && total > 0 && (
          <>
            <p className="blog-result-count" role="status">
              {t('blogList.resultCount', { count: total })}
            </p>
            <div className="blog-grid">
              {list.data.articles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
            {list.data.pagination.pages > 1 && (
              <nav className="blog-pagination" aria-label={t('blogList.pagination')}>
                <Button variant="secondary" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}>
                  {t('blogList.previous')}
                </Button>
                <p>{t('blogList.page', { page, pages: list.data.pagination.pages })}</p>
                <Button variant="secondary" disabled={page >= list.data.pagination.pages} onClick={() => update({ page: String(page + 1) })}>
                  {t('blogList.next')}
                </Button>
              </nav>
            )}
          </>
        )}

        <NewsletterForm />
      </div>
    </>
  );
}
