// Allowed values for the blog string columns. Kept in sync with the CHECK
// constraints in prisma/migrations/*_blog_model.
export const ARTICLE_STATUS = { DRAFT: 'draft', PUBLISHED: 'published' };

// Languages an article can be written or translated in (the platform's own
// languages; Tamazight has no content yet and falls back to French).
export const CONTENT_LANGUAGES = ['fr', 'en', 'ar'];
export const DEFAULT_CONTENT_LANGUAGE = 'fr';

export const MAX_TAGS_PER_ARTICLE = 10;
export const BLOG_PAGE_SIZE = { default: 9, max: 24 };

// A premium article keeps its title, excerpt and cover public (teaser); its text
// and files need a premium account (P3-04).
export const MAX_TARGET_ACCOUNT_TYPES = 10;
