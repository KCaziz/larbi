-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "sectionId" TEXT;

-- AlterTable
ALTER TABLE "formations" ADD COLUMN     "level" TEXT,
ADD COLUMN     "objectives" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "prerequisites" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "subtitle" TEXT;

-- CreateTable
CREATE TABLE "sections" (
    "id" TEXT NOT NULL,
    "formationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sections_formationId_position_idx" ON "sections"("formationId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "sections_id_formationId_key" ON "sections"("id", "formationId");

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "formations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Hand-written part (Prisma cannot express these).
-- ---------------------------------------------------------------------------

-- Statuses: a formation can also be "in_review" or "archived". Only a published one
-- has a publication date (the existing formations_publishedAt_check is unchanged).
ALTER TABLE "formations" DROP CONSTRAINT "formations_status_check";
ALTER TABLE "formations" ADD CONSTRAINT "formations_status_check"
  CHECK ("status" IN ('draft', 'in_review', 'published', 'archived'));

ALTER TABLE "formations" ADD CONSTRAINT "formations_level_check"
  CHECK ("level" IS NULL OR "level" IN ('beginner', 'intermediate', 'advanced'));

ALTER TABLE "sections" ADD CONSTRAINT "sections_position_check" CHECK ("position" >= 0);

-- A lesson can only sit in a chapter of ITS OWN formation. MATCH SIMPLE: a lesson
-- without chapter (sectionId NULL) is not checked. RESTRICT: a chapter that still
-- contains lessons cannot be deleted (the progress of learners lives on the lessons).
ALTER TABLE "courses" ADD CONSTRAINT "courses_section_same_formation_fkey"
  FOREIGN KEY ("sectionId", "formationId") REFERENCES "sections"("id", "formationId")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Data migration (idempotent: running it again changes nothing).
-- Every formation that has lessons gets ONE default chapter holding all of them; the
-- lesson ids, their order and everything that references them (progress, certificates)
-- are untouched.
-- ---------------------------------------------------------------------------
INSERT INTO "sections" ("id", "formationId", "title", "position", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, f."id", 'Chapitre 1', 0, now(), now()
FROM "formations" f
WHERE EXISTS (SELECT 1 FROM "courses" c WHERE c."formationId" = f."id")
  AND NOT EXISTS (SELECT 1 FROM "sections" s WHERE s."formationId" = f."id");

UPDATE "courses" c
SET "sectionId" = s."id"
FROM "sections" s
WHERE s."formationId" = c."formationId" AND s."position" = 0 AND c."sectionId" IS NULL;
