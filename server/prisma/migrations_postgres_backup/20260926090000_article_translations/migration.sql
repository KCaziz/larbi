
-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'fr';

-- CreateTable
CREATE TABLE "article_translations" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL DEFAULT '',
    "body" TEXT,
    "bodyText" TEXT NOT NULL DEFAULT '',
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "article_translations_articleId_language_key" ON "article_translations"("articleId", "language");

-- AddForeignKey
ALTER TABLE "article_translations" ADD CONSTRAINT "article_translations_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Only the languages the platform is translated into (Tamazight falls back to French).
ALTER TABLE "articles" ADD CONSTRAINT "articles_language_check" CHECK ("language" IN ('fr', 'en', 'ar'));
ALTER TABLE "article_translations" ADD CONSTRAINT "article_translations_language_check" CHECK ("language" IN ('fr', 'en', 'ar'));
-- A translation always has a title and a text: a half-written one is never stored.
ALTER TABLE "article_translations" ADD CONSTRAINT "article_translations_content_check" CHECK (length(btrim("title")) > 0 AND "bodyText" <> '');
