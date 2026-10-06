-- The default collation (utf8mb4_unicode_ci) compares strings case-INSENSITIVELY:
-- under it, 'Upper-Case' and 'upper-case' compare equal, and `REGEXP '[a-z0-9]'`
-- also matches uppercase letters. That silently defeated four CHECK constraints
-- whose whole point is to tell upper and lower case apart. Each is re-created
-- here with an explicit `COLLATE utf8mb4_bin` (byte-wise, case-sensitive) on the
-- side of the comparison that needs it; confirmed interactively that only this
-- specific form (not casting instead, not COLLATE outside the parentheses)
-- gets accepted and actually rejects what it should.

ALTER TABLE `articles` DROP CONSTRAINT `articles_slug_check`;
ALTER TABLE `articles` ADD CONSTRAINT `articles_slug_check`
  CHECK (`slug` COLLATE utf8mb4_bin REGEXP '^[a-z0-9]+(-[a-z0-9]+)*$' AND length(`slug`) <= 80);

ALTER TABLE `article_categories` DROP CONSTRAINT `article_categories_slug_check`;
ALTER TABLE `article_categories` ADD CONSTRAINT `article_categories_slug_check`
  CHECK (`slug` COLLATE utf8mb4_bin REGEXP '^[a-z0-9]+(-[a-z0-9]+)*$' AND length(`slug`) <= 80);

ALTER TABLE `tags` DROP CONSTRAINT `tags_slug_check`;
ALTER TABLE `tags` ADD CONSTRAINT `tags_slug_check`
  CHECK (`slug` COLLATE utf8mb4_bin REGEXP '^[a-z0-9]+(-[a-z0-9]+)*$' AND length(`slug`) <= 80);

ALTER TABLE `newsletter_subscribers` DROP CONSTRAINT `newsletter_email_normalised_check`;
ALTER TABLE `newsletter_subscribers` ADD CONSTRAINT `newsletter_email_normalised_check`
  CHECK (`email` COLLATE utf8mb4_bin = lower(trim(`email`)));
