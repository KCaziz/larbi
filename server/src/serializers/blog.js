import { readingMinutes } from '../services/article.service.js';

// PUBLIC allow-lists for the blog. Anyone on the internet can call these routes,
// so nothing is returned that is not meant to be public: no e-mail, no ids of
// users, no storage key, no draft field (status, SEO source rows...).
export const blogCoverUrl = (slug) => `/api/blog/articles/${slug}/cover`;
export const blogMediaUrl = (id) => `/api/blog/media/${id}`;

const category = (c) => (c ? { name: c.name, slug: c.slug } : null);
const tags = (links) => (links ?? []).map((l) => ({ name: l.tag.name, slug: l.tag.slug })).sort((a, b) => a.name.localeCompare(b.name));

// Card in the list / "related articles". `lock` is what THIS viewer may not read
// (null = readable): computed by the controller from the session, see blogAccess.
export function toArticleCard(article, lock = null) {
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
    requiredAccessLevel: article.requiredAccessLevel,
    locked: lock !== null,
    lockReason: lock,
  };
}

// Full article. `body` was sanitised when the editor saved it.
// A locked viewer gets the card and the SEO teaser only: no text, no files.
export function toArticleDetail(article, { lock = null, related = [] } = {}) {
  return {
    ...toArticleCard(article, lock),
    body: lock ? null : article.body,
    updatedAt: article.updatedAt,
    seo: {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt,
    },
    media: (lock ? [] : article.media ?? []).map((m) => ({
      id: m.id,
      kind: m.kind,
      originalName: m.originalName,
      mimeType: m.mimeType,
      sizeBytes: m.sizeBytes,
      url: blogMediaUrl(m.id),
    })),
    related: related.map(({ article: a, lock: l }) => toArticleCard(a, l)),
  };
}
