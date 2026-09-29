-- A translation created as a raw copy of the article's own text ("duplicate to
-- start") is pending until a human reviews and saves it: it must never be shown
-- to a visitor as a real translation of that language.
ALTER TABLE "article_translations" ADD COLUMN "pending" BOOLEAN NOT NULL DEFAULT false;
