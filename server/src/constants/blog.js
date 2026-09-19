// Allowed values for the blog string columns. Kept in sync with the CHECK
// constraints in prisma/migrations/*_blog_model.
export const ARTICLE_STATUS = { DRAFT: 'draft', PUBLISHED: 'published' };

export const MAX_TAGS_PER_ARTICLE = 10;
export const BLOG_PAGE_SIZE = { default: 9, max: 24 };
