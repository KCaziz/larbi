-- CreateTable
CREATE TABLE "formation_categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "formation_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formations" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "requiredAccessLevel" TEXT NOT NULL DEFAULT 'standard',
    "categoryId" TEXT,
    "coverImageId" TEXT,
    "certificationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "certificationTitle" TEXT,
    "certificationDescription" TEXT,
    "createdById" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "formationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "body" TEXT,
    "position" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "estimatedMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "courseId" TEXT,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "formationId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_progress" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "formationId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "course_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certifications" (
    "id" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "holderName" TEXT NOT NULL,
    "formationTitle" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "formation_categories_slug_key" ON "formation_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "formations_slug_key" ON "formations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "formations_coverImageId_key" ON "formations"("coverImageId");

-- CreateIndex
CREATE INDEX "formations_status_idx" ON "formations"("status");

-- CreateIndex
CREATE INDEX "courses_formationId_position_idx" ON "courses"("formationId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "courses_id_formationId_key" ON "courses"("id", "formationId");

-- CreateIndex
CREATE UNIQUE INDEX "media_storageKey_key" ON "media"("storageKey");

-- CreateIndex
CREATE INDEX "media_courseId_idx" ON "media"("courseId");

-- CreateIndex
CREATE INDEX "enrollments_formationId_idx" ON "enrollments"("formationId");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_userId_formationId_key" ON "enrollments"("userId", "formationId");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_id_formationId_key" ON "enrollments"("id", "formationId");

-- CreateIndex
CREATE INDEX "course_progress_courseId_idx" ON "course_progress"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "course_progress_enrollmentId_courseId_key" ON "course_progress"("enrollmentId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "certifications_certificateNumber_key" ON "certifications"("certificateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "certifications_enrollmentId_key" ON "certifications"("enrollmentId");

-- AddForeignKey
ALTER TABLE "formations" ADD CONSTRAINT "formations_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "formation_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formations" ADD CONSTRAINT "formations_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formations" ADD CONSTRAINT "formations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "formations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "formations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_enrollmentId_formationId_fkey" FOREIGN KEY ("enrollmentId", "formationId") REFERENCES "enrollments"("id", "formationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_courseId_formationId_fkey" FOREIGN KEY ("courseId", "formationId") REFERENCES "courses"("id", "formationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- ---------------------------------------------------------------------------
-- Hand-written integrity constraints (Prisma cannot express CHECK).
-- Values mirror src/constants/elearning.js and src/constants/roles.js.
-- ---------------------------------------------------------------------------

-- Existing table: the role / level columns were only validated by the app so far.
ALTER TABLE "users" ADD CONSTRAINT "users_role_check" CHECK ("role" IN ('user', 'admin'));
ALTER TABLE "users" ADD CONSTRAINT "users_accessLevel_check" CHECK ("accessLevel" IN ('standard', 'premium'));

ALTER TABLE "formations" ADD CONSTRAINT "formations_status_check" CHECK ("status" IN ('draft', 'published'));
ALTER TABLE "formations" ADD CONSTRAINT "formations_requiredAccessLevel_check" CHECK ("requiredAccessLevel" IN ('standard', 'premium'));
-- A published formation always has a publication date, a draft never has one.
ALTER TABLE "formations" ADD CONSTRAINT "formations_publishedAt_check" CHECK (("status" = 'published') = ("publishedAt" IS NOT NULL));

ALTER TABLE "courses" ADD CONSTRAINT "courses_position_check" CHECK ("position" >= 0);
ALTER TABLE "courses" ADD CONSTRAINT "courses_estimatedMinutes_check" CHECK ("estimatedMinutes" IS NULL OR "estimatedMinutes" >= 0);

ALTER TABLE "media" ADD CONSTRAINT "media_kind_check" CHECK ("kind" IN ('video', 'image', 'document'));
ALTER TABLE "media" ADD CONSTRAINT "media_sizeBytes_check" CHECK ("sizeBytes" >= 0);

-- Status and completion date must agree (no "completed" without a date, no date while active).
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_status_check" CHECK ("status" IN ('active', 'completed'));
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_completedAt_check" CHECK (("status" = 'completed') = ("completedAt" IS NOT NULL));

ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_status_check" CHECK ("status" IN ('in_progress', 'completed'));
ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_completedAt_check" CHECK (("status" = 'completed') = ("completedAt" IS NOT NULL));
