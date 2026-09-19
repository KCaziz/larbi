import { readingMinutes } from '../services/article.service.js';

// PUBLIC allow-lists for the blog. Anyone on the internet can call these routes,
// so nothing is returned that is not meant to be public: no e-mail, no ids of
// users, no storage key, no draft field (status, SEO source rows...).
export const blogCoverUrl = (slug) => `/api/blog/articles/${slug}/cover`;
export const blogMediaUrl = (id) => `/api/blog/media/${id}`;

const category = (c) => (c ? { name: c.name, slug: c.slug } : null);
const tags = (links) => (links ?? []).map((l) => ({ name: l.tag.name, slug: l.tag.slug })).sort((a, b) => a.name.localeCompare(b.name));

// Card in the list / "related articles".
export function toArticleCard(article) {
  return {
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    category: category(article.category),
    tags: tags(article.tags),
    coverUrl: article.coverImageId ? blogCoverUrl(article.slug) : null,
    author: article.author ? { name: article.author.name } : null,
    publishedAt: article.publishedAt,
    readingMinutes: readingMinutes(article.bodyText),
  };
}

// Full article. `body` was sanitised when the editor saved it.
export function toArticleDetail(article, related = []) {
  return {
    ...toArticleCard(article),
    body: article.body,
    updatedAt: article.updatedAt,
    seo: {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt,
    },
    media: (article.media ?? []).map((m) => ({
      id: m.id,
      kind: m.kind,
      originalName: m.originalName,
      mimeType: m.mimeType,
      sizeBytes: m.sizeBytes,
      url: blogMediaUrl(m.id),
    })),
    related: related.map(toArticleCard),
  };
}
