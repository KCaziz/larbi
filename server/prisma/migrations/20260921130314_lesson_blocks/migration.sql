-- CreateTable
CREATE TABLE "lesson_blocks" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "mediaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_revisions" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "blocks" JSONB NOT NULL,
    "label" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lesson_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lesson_blocks_courseId_position_idx" ON "lesson_blocks"("courseId", "position");

-- CreateIndex
CREATE INDEX "lesson_revisions_courseId_createdAt_idx" ON "lesson_revisions"("courseId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "media_id_courseId_key" ON "media"("id", "courseId");

-- AddForeignKey
ALTER TABLE "lesson_blocks" ADD CONSTRAINT "lesson_blocks_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_blocks" ADD CONSTRAINT "lesson_blocks_mediaId_courseId_fkey" FOREIGN KEY ("mediaId", "courseId") REFERENCES "media"("id", "courseId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_revisions" ADD CONSTRAINT "lesson_revisions_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_revisions" ADD CONSTRAINT "lesson_revisions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- ---------------------------------------------------------------------------
-- Hand-written part (Prisma cannot express these).
-- ---------------------------------------------------------------------------
ALTER TABLE "lesson_blocks"
  ADD CONSTRAINT "lesson_blocks_type_check"
    CHECK ("type" IN ('text', 'image', 'video', 'file', 'code', 'table', 'quote', 'callout', 'resources')),
  ADD CONSTRAINT "lesson_blocks_position_check" CHECK ("position" >= 0),
  ADD CONSTRAINT "lesson_blocks_data_object_check" CHECK (jsonb_typeof("data") = 'object'),
  -- an image / video / file block shows a file, every other block does not
  ADD CONSTRAINT "lesson_blocks_media_check"
    CHECK (("type" IN ('image', 'video', 'file')) = ("mediaId" IS NOT NULL));

ALTER TABLE "lesson_revisions"
  ADD CONSTRAINT "lesson_revisions_blocks_array_check" CHECK (jsonb_typeof("blocks") = 'array');

-- ---------------------------------------------------------------------------
-- Data migration (idempotent). Every existing lesson becomes blocks, in reading order:
-- its text first, then each attached file in upload order. The lesson ids, courses.body and
-- the media rows are untouched (expand / contract): nothing is lost, and progress and
-- certificates keep pointing at the same lessons.
-- ---------------------------------------------------------------------------
INSERT INTO "lesson_blocks" ("id", "courseId", "type", "position", "data", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, c."id", 'text', 0, jsonb_build_object('html', c."body"), now(), now()
FROM "courses" c
WHERE c."body" IS NOT NULL AND btrim(c."body") <> ''
  AND NOT EXISTS (SELECT 1 FROM "lesson_blocks" b WHERE b."courseId" = c."id");

INSERT INTO "lesson_blocks" ("id", "courseId", "type", "position", "data", "mediaId", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  m."courseId",
  CASE m."kind" WHEN 'image' THEN 'image' WHEN 'video' THEN 'video' ELSE 'file' END,
  COALESCE((SELECT max(b."position") FROM "lesson_blocks" b WHERE b."courseId" = m."courseId"), -1)
    + ROW_NUMBER() OVER (PARTITION BY m."courseId" ORDER BY m."createdAt", m."id"),
  CASE m."kind"
    WHEN 'image' THEN jsonb_build_object('alt', m."originalName", 'caption', '')
    WHEN 'video' THEN jsonb_build_object('caption', '')
    ELSE jsonb_build_object('label', m."originalName", 'description', '')
  END,
  m."id",
  now(),
  now()
FROM "media" m
WHERE m."courseId" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "lesson_blocks" b WHERE b."mediaId" = m."id");
