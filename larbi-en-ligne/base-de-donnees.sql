-- Larbi : création complète de la base (5 migrations).
-- A importer UNE SEULE FOIS dans une base vide (phpMyAdmin > Importer).

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `_prisma_migrations` (
  `id` VARCHAR(36) NOT NULL,
  `checksum` VARCHAR(64) NOT NULL,
  `finished_at` DATETIME(3) NULL,
  `migration_name` VARCHAR(255) NOT NULL,
  `logs` TEXT NULL,
  `rolled_back_at` DATETIME(3) NULL,
  `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` INTEGER UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ===== 20261006204050_init =====
-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `accountType` VARCHAR(191) NOT NULL,
    `accessLevel` VARCHAR(191) NOT NULL DEFAULT 'standard',
    `role` VARCHAR(191) NOT NULL DEFAULT 'user',
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_messages` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `account_types` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `account_types_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `platform_settings` (
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `formation_categories` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `formation_categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `formations` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `requiredAccessLevel` VARCHAR(191) NOT NULL DEFAULT 'standard',
    `categoryId` VARCHAR(191) NULL,
    `coverImageId` VARCHAR(191) NULL,
    `certificationEnabled` BOOLEAN NOT NULL DEFAULT true,
    `certificationTitle` VARCHAR(191) NULL,
    `certificationDescription` VARCHAR(191) NULL,
    `subtitle` VARCHAR(191) NULL,
    `level` VARCHAR(191) NULL,
    `objectives` JSON NOT NULL,
    `prerequisites` JSON NOT NULL,
    `createdById` VARCHAR(191) NULL,
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `formations_slug_key`(`slug`),
    UNIQUE INDEX `formations_coverImageId_key`(`coverImageId`),
    INDEX `formations_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `courses` (
    `id` VARCHAR(191) NOT NULL,
    `formationId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `summary` VARCHAR(191) NULL,
    `body` VARCHAR(191) NULL,
    `position` INTEGER NOT NULL,
    `isRequired` BOOLEAN NOT NULL DEFAULT true,
    `estimatedMinutes` INTEGER NULL,
    `sectionId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `courses_formationId_position_idx`(`formationId`, `position`),
    UNIQUE INDEX `courses_id_formationId_key`(`id`, `formationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `media` (
    `id` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(191) NOT NULL,
    `storageKey` VARCHAR(191) NOT NULL,
    `originalName` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `sizeBytes` INTEGER NOT NULL,
    `courseId` VARCHAR(191) NULL,
    `uploadedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `articleId` VARCHAR(191) NULL,

    UNIQUE INDEX `media_storageKey_key`(`storageKey`),
    INDEX `media_courseId_idx`(`courseId`),
    INDEX `media_articleId_idx`(`articleId`),
    UNIQUE INDEX `media_id_courseId_key`(`id`, `courseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `enrollments` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `formationId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `enrolledAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,

    INDEX `enrollments_formationId_idx`(`formationId`),
    UNIQUE INDEX `enrollments_userId_formationId_key`(`userId`, `formationId`),
    UNIQUE INDEX `enrollments_id_formationId_key`(`id`, `formationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_progress` (
    `id` VARCHAR(191) NOT NULL,
    `enrollmentId` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `formationId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'in_progress',
    `openedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,

    INDEX `course_progress_courseId_idx`(`courseId`),
    UNIQUE INDEX `course_progress_enrollmentId_courseId_key`(`enrollmentId`, `courseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `certifications` (
    `id` VARCHAR(191) NOT NULL,
    `certificateNumber` VARCHAR(191) NOT NULL,
    `enrollmentId` VARCHAR(191) NOT NULL,
    `holderName` VARCHAR(191) NOT NULL,
    `formationTitle` VARCHAR(191) NOT NULL,
    `certificationTitle` VARCHAR(191) NULL,
    `issuedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `revokedAt` DATETIME(3) NULL,
    `revokedReason` VARCHAR(191) NULL,

    UNIQUE INDEX `certifications_certificateNumber_key`(`certificateNumber`),
    UNIQUE INDEX `certifications_enrollmentId_key`(`enrollmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `article_categories` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `article_categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `tags_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `articles` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `language` VARCHAR(191) NOT NULL DEFAULT 'fr',
    `title` VARCHAR(191) NOT NULL,
    `excerpt` VARCHAR(191) NOT NULL DEFAULT '',
    `body` VARCHAR(191) NULL,
    `bodyText` VARCHAR(191) NOT NULL DEFAULT '',
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `publishedAt` DATETIME(3) NULL,
    `requiredAccessLevel` VARCHAR(191) NOT NULL DEFAULT 'standard',
    `targetAccountTypes` JSON NOT NULL,
    `categoryId` VARCHAR(191) NULL,
    `coverImageId` VARCHAR(191) NULL,
    `authorId` VARCHAR(191) NULL,
    `metaTitle` VARCHAR(191) NULL,
    `metaDescription` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `articles_slug_key`(`slug`),
    UNIQUE INDEX `articles_coverImageId_key`(`coverImageId`),
    INDEX `articles_status_publishedAt_idx`(`status`, `publishedAt`),
    INDEX `articles_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `article_translations` (
    `id` VARCHAR(191) NOT NULL,
    `articleId` VARCHAR(191) NOT NULL,
    `language` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `excerpt` VARCHAR(191) NOT NULL DEFAULT '',
    `body` VARCHAR(191) NULL,
    `bodyText` VARCHAR(191) NOT NULL DEFAULT '',
    `metaTitle` VARCHAR(191) NULL,
    `metaDescription` VARCHAR(191) NULL,
    `pending` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `article_translations_articleId_language_key`(`articleId`, `language`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `article_tags` (
    `articleId` VARCHAR(191) NOT NULL,
    `tagId` VARCHAR(191) NOT NULL,

    INDEX `article_tags_tagId_idx`(`tagId`),
    PRIMARY KEY (`articleId`, `tagId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `newsletter_subscribers` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `locale` VARCHAR(191) NOT NULL DEFAULT 'fr',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `confirmedAt` DATETIME(3) NULL,
    `unsubscribedAt` DATETIME(3) NULL,
    `lastEmailAt` DATETIME(3) NULL,

    UNIQUE INDEX `newsletter_subscribers_email_key`(`email`),
    INDEX `newsletter_subscribers_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sections` (
    `id` VARCHAR(191) NOT NULL,
    `formationId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `position` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `sections_formationId_position_idx`(`formationId`, `position`),
    UNIQUE INDEX `sections_id_formationId_key`(`id`, `formationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lesson_blocks` (
    `id` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL,
    `data` JSON NOT NULL,
    `mediaId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `lesson_blocks_courseId_position_idx`(`courseId`, `position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lesson_revisions` (
    `id` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `blocks` JSON NOT NULL,
    `label` VARCHAR(191) NULL,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `lesson_revisions_courseId_createdAt_idx`(`courseId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quizzes` (
    `id` VARCHAR(191) NOT NULL,
    `formationId` VARCHAR(191) NOT NULL,
    `scope` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NULL,
    `sectionId` VARCHAR(191) NULL,
    `finalFormationId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `instructions` VARCHAR(191) NOT NULL DEFAULT '',
    `passingScore` INTEGER NOT NULL DEFAULT 70,
    `maxAttempts` INTEGER NULL,
    `shuffleQuestions` BOOLEAN NOT NULL DEFAULT false,
    `isRequired` BOOLEAN NOT NULL DEFAULT false,
    `showCorrection` BOOLEAN NOT NULL DEFAULT true,
    `isComplete` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `quizzes_finalFormationId_key`(`finalFormationId`),
    INDEX `quizzes_formationId_idx`(`formationId`),
    UNIQUE INDEX `quizzes_id_formationId_key`(`id`, `formationId`),
    UNIQUE INDEX `quizzes_courseId_key`(`courseId`),
    UNIQUE INDEX `quizzes_sectionId_key`(`sectionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quiz_questions` (
    `id` VARCHAR(191) NOT NULL,
    `quizId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL,
    `prompt` VARCHAR(191) NOT NULL DEFAULT '',
    `explanation` VARCHAR(191) NOT NULL DEFAULT '',
    `points` INTEGER NOT NULL DEFAULT 1,
    `acceptedAnswers` JSON NOT NULL,

    INDEX `quiz_questions_quizId_position_idx`(`quizId`, `position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quiz_choices` (
    `id` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `isCorrect` BOOLEAN NOT NULL DEFAULT false,

    INDEX `quiz_choices_questionId_position_idx`(`questionId`, `position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quiz_attempts` (
    `id` VARCHAR(191) NOT NULL,
    `quizId` VARCHAR(191) NOT NULL,
    `formationId` VARCHAR(191) NOT NULL,
    `enrollmentId` VARCHAR(191) NOT NULL,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `submittedAt` DATETIME(3) NULL,
    `questionOrder` JSON NOT NULL,
    `score` INTEGER NULL,
    `earnedPoints` INTEGER NULL,
    `totalPoints` INTEGER NULL,
    `passed` BOOLEAN NULL,

    INDEX `quiz_attempts_enrollmentId_quizId_idx`(`enrollmentId`, `quizId`),
    INDEX `quiz_attempts_quizId_idx`(`quizId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quiz_attempt_answers` (
    `id` VARCHAR(191) NOT NULL,
    `attemptId` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `choiceIds` JSON NOT NULL,
    `text` VARCHAR(191) NOT NULL DEFAULT '',
    `correct` BOOLEAN NOT NULL,
    `points` INTEGER NOT NULL,

    UNIQUE INDEX `quiz_attempt_answers_attemptId_questionId_key`(`attemptId`, `questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comparator_banks` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `comparator_banks_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comparator_conditions` (
    `id` VARCHAR(191) NOT NULL,
    `bankId` VARCHAR(191) NOT NULL,
    `theme` VARCHAR(191) NOT NULL,
    `segment` VARCHAR(191) NOT NULL DEFAULT 'non_precise',
    `category` VARCHAR(191) NULL,
    `label` VARCHAR(191) NOT NULL,
    `values` JSON NOT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `comparator_conditions_theme_position_idx`(`theme`, `position`),
    INDEX `comparator_conditions_bankId_idx`(`bankId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comparator_meta` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `dataUpdatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `formations` ADD CONSTRAINT `formations_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `formation_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `formations` ADD CONSTRAINT `formations_coverImageId_fkey` FOREIGN KEY (`coverImageId`) REFERENCES `media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `formations` ADD CONSTRAINT `formations_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `courses` ADD CONSTRAINT `courses_formationId_fkey` FOREIGN KEY (`formationId`) REFERENCES `formations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `courses` ADD CONSTRAINT `courses_sectionId_formationId_fkey` FOREIGN KEY (`sectionId`, `formationId`) REFERENCES `sections`(`id`, `formationId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `media` ADD CONSTRAINT `media_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `media` ADD CONSTRAINT `media_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `media` ADD CONSTRAINT `media_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `articles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_formationId_fkey` FOREIGN KEY (`formationId`) REFERENCES `formations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_progress` ADD CONSTRAINT `course_progress_enrollmentId_formationId_fkey` FOREIGN KEY (`enrollmentId`, `formationId`) REFERENCES `enrollments`(`id`, `formationId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_progress` ADD CONSTRAINT `course_progress_courseId_formationId_fkey` FOREIGN KEY (`courseId`, `formationId`) REFERENCES `courses`(`id`, `formationId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `certifications` ADD CONSTRAINT `certifications_enrollmentId_fkey` FOREIGN KEY (`enrollmentId`) REFERENCES `enrollments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `articles` ADD CONSTRAINT `articles_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `article_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `articles` ADD CONSTRAINT `articles_coverImageId_fkey` FOREIGN KEY (`coverImageId`) REFERENCES `media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `articles` ADD CONSTRAINT `articles_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `article_translations` ADD CONSTRAINT `article_translations_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `articles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `article_tags` ADD CONSTRAINT `article_tags_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `articles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `article_tags` ADD CONSTRAINT `article_tags_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sections` ADD CONSTRAINT `sections_formationId_fkey` FOREIGN KEY (`formationId`) REFERENCES `formations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lesson_blocks` ADD CONSTRAINT `lesson_blocks_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lesson_blocks` ADD CONSTRAINT `lesson_blocks_mediaId_courseId_fkey` FOREIGN KEY (`mediaId`, `courseId`) REFERENCES `media`(`id`, `courseId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lesson_revisions` ADD CONSTRAINT `lesson_revisions_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lesson_revisions` ADD CONSTRAINT `lesson_revisions_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quizzes` ADD CONSTRAINT `quizzes_formationId_fkey` FOREIGN KEY (`formationId`) REFERENCES `formations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quizzes` ADD CONSTRAINT `quizzes_courseId_formationId_fkey` FOREIGN KEY (`courseId`, `formationId`) REFERENCES `courses`(`id`, `formationId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quizzes` ADD CONSTRAINT `quizzes_sectionId_formationId_fkey` FOREIGN KEY (`sectionId`, `formationId`) REFERENCES `sections`(`id`, `formationId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quizzes` ADD CONSTRAINT `quizzes_finalFormationId_fkey` FOREIGN KEY (`finalFormationId`) REFERENCES `formations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_questions` ADD CONSTRAINT `quiz_questions_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_choices` ADD CONSTRAINT `quiz_choices_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `quiz_questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_attempts` ADD CONSTRAINT `quiz_attempts_quizId_formationId_fkey` FOREIGN KEY (`quizId`, `formationId`) REFERENCES `quizzes`(`id`, `formationId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_attempts` ADD CONSTRAINT `quiz_attempts_enrollmentId_formationId_fkey` FOREIGN KEY (`enrollmentId`, `formationId`) REFERENCES `enrollments`(`id`, `formationId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_attempt_answers` ADD CONSTRAINT `quiz_attempt_answers_attemptId_fkey` FOREIGN KEY (`attemptId`) REFERENCES `quiz_attempts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comparator_conditions` ADD CONSTRAINT `comparator_conditions_bankId_fkey` FOREIGN KEY (`bankId`) REFERENCES `comparator_banks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `started_at`, `applied_steps_count`) VALUES (UUID(), '0f93c35e2c3737c351080a8f78b5b2456e1583ea1342215e6b70390eaad446cc', NOW(3), '20261006204050_init', NOW(3), 1);

-- ===== 20261006204200_integrity_checks =====
-- Hand-written integrity constraints (Prisma cannot express CHECK). Ported from the
-- project's PostgreSQL migrations (see prisma/migrations_postgres_backup/) to
-- MySQL/MariaDB dialect: `btrim` -> `trim`, the `~` regex operator -> `REGEXP`,
-- `jsonb_typeof(x) = 'object'/'array'` -> `JSON_TYPE(x) = 'OBJECT'/'ARRAY'`,
-- the `::type` cast suffix dropped (not needed here). Written with backtick-quoted
-- identifiers, the native MySQL/MariaDB style (no ANSI_QUOTES dependency).
--
-- Three rules from the PostgreSQL version are NOT ported as CHECK constraints:
-- MariaDB refuses a CHECK that references a column carrying a FOREIGN KEY
-- (error 1901, confirmed interactively — not a typo), whatever its ON DELETE
-- action. `media_owner_check`, `lesson_blocks_media_check` and
-- `quizzes_target_check` each only exist to compare FOREIGN KEY columns, so
-- none of the three can be expressed here at all. They are checked instead by
-- `services/consistency.service.js` (its own docstring already says it exists
-- for "rules SQL cannot express" — this is now one more case of that, not a
-- new mechanism), run by `npm run check:consistency` and the test suite.

-- ---- users -------------------------------------------------------------
ALTER TABLE `users`
  ADD CONSTRAINT `users_role_check` CHECK (`role` IN ('user', 'admin')),
  ADD CONSTRAINT `users_accessLevel_check` CHECK (`accessLevel` IN ('standard', 'premium')),
  ADD CONSTRAINT `users_status_check` CHECK (`status` IN ('active', 'suspended'));

-- ---- formations / courses / media / enrollments / progress -------------
ALTER TABLE `formations`
  ADD CONSTRAINT `formations_status_check` CHECK (`status` IN ('draft', 'in_review', 'published', 'archived')),
  ADD CONSTRAINT `formations_requiredAccessLevel_check` CHECK (`requiredAccessLevel` IN ('standard', 'premium')),
  ADD CONSTRAINT `formations_publishedAt_check` CHECK ((`status` = 'published') = (`publishedAt` IS NOT NULL)),
  ADD CONSTRAINT `formations_level_check` CHECK (`level` IS NULL OR `level` IN ('beginner', 'intermediate', 'advanced'));

ALTER TABLE `courses`
  ADD CONSTRAINT `courses_position_check` CHECK (`position` >= 0),
  ADD CONSTRAINT `courses_estimatedMinutes_check` CHECK (`estimatedMinutes` IS NULL OR `estimatedMinutes` >= 0);

ALTER TABLE `media`
  ADD CONSTRAINT `media_kind_check` CHECK (`kind` IN ('video', 'image', 'document')),
  ADD CONSTRAINT `media_sizeBytes_check` CHECK (`sizeBytes` >= 0);
  -- media_owner_check (a file belongs to at most one lesson OR one article) is NOT
  -- a CHECK here: both columns are FOREIGN KEYs (see the note at the top of this file).
  -- Checked instead by consistency.service.js.

ALTER TABLE `enrollments`
  ADD CONSTRAINT `enrollments_status_check` CHECK (`status` IN ('active', 'completed')),
  ADD CONSTRAINT `enrollments_completedAt_check` CHECK ((`status` = 'completed') = (`completedAt` IS NOT NULL));

ALTER TABLE `course_progress`
  ADD CONSTRAINT `course_progress_status_check` CHECK (`status` IN ('in_progress', 'completed')),
  ADD CONSTRAINT `course_progress_completedAt_check` CHECK ((`status` = 'completed') = (`completedAt` IS NOT NULL));

ALTER TABLE `sections` ADD CONSTRAINT `sections_position_check` CHECK (`position` >= 0);

-- ---- lesson blocks / revisions -------------------------------------------
ALTER TABLE `lesson_blocks`
  ADD CONSTRAINT `lesson_blocks_type_check`
    CHECK (`type` IN ('text', 'image', 'video', 'file', 'code', 'table', 'quote', 'callout', 'resources')),
  ADD CONSTRAINT `lesson_blocks_position_check` CHECK (`position` >= 0),
  ADD CONSTRAINT `lesson_blocks_data_object_check` CHECK (JSON_TYPE(`data`) = 'OBJECT');
  -- lesson_blocks_media_check ((type IN (image,video,file)) = (mediaId IS NOT NULL)) is NOT
  -- a CHECK here: mediaId is a FOREIGN KEY (see the note at the top of this file).
  -- Checked instead by consistency.service.js.

ALTER TABLE `lesson_revisions`
  ADD CONSTRAINT `lesson_revisions_blocks_array_check` CHECK (JSON_TYPE(`blocks`) = 'ARRAY');

-- ---- quizzes -------------------------------------------------------------
ALTER TABLE `quizzes`
  ADD CONSTRAINT `quizzes_scope_check` CHECK (`scope` IN ('course', 'section', 'formation')),
  ADD CONSTRAINT `quizzes_passing_score_check` CHECK (`passingScore` BETWEEN 0 AND 100),
  ADD CONSTRAINT `quizzes_max_attempts_check` CHECK (`maxAttempts` IS NULL OR `maxAttempts` BETWEEN 1 AND 50);
  -- quizzes_target_check (the target matches the scope: a lesson, a chapter, or (final
  -- quiz) the formation itself) is NOT a CHECK here: courseId, sectionId,
  -- finalFormationId and formationId are all FOREIGN KEYs (see the note at the top of
  -- this file). Checked instead by consistency.service.js.

ALTER TABLE `quiz_questions`
  ADD CONSTRAINT `quiz_questions_type_check` CHECK (`type` IN ('single', 'multiple', 'true_false', 'text')),
  ADD CONSTRAINT `quiz_questions_points_check` CHECK (`points` BETWEEN 1 AND 100),
  ADD CONSTRAINT `quiz_questions_position_check` CHECK (`position` >= 0);

ALTER TABLE `quiz_choices` ADD CONSTRAINT `quiz_choices_position_check` CHECK (`position` >= 0);

ALTER TABLE `quiz_attempts`
  -- an attempt is either open (nothing graded) or submitted (everything graded)
  ADD CONSTRAINT `quiz_attempts_graded_check` CHECK (
    (`submittedAt` IS NULL AND `score` IS NULL AND `earnedPoints` IS NULL AND `totalPoints` IS NULL AND `passed` IS NULL) OR
    (`submittedAt` IS NOT NULL AND `score` BETWEEN 0 AND 100 AND `earnedPoints` >= 0 AND `totalPoints` >= 0 AND `passed` IS NOT NULL)
  );

ALTER TABLE `quiz_attempt_answers` ADD CONSTRAINT `quiz_attempt_answers_points_check` CHECK (`points` >= 0);

-- ---- blog ------------------------------------------------------------------
ALTER TABLE `articles`
  ADD CONSTRAINT `articles_status_check` CHECK (`status` IN ('draft', 'published')),
  -- A published article always has a publication date, a draft never has one.
  ADD CONSTRAINT `articles_publishedAt_check` CHECK ((`status` = 'published') = (`publishedAt` IS NOT NULL)),
  ADD CONSTRAINT `articles_title_check` CHECK (length(trim(`title`)) > 0),
  -- Slugs are used in public URLs: lower-case words joined by dashes, nothing else.
  ADD CONSTRAINT `articles_slug_check` CHECK (`slug` REGEXP '^[a-z0-9]+(-[a-z0-9]+)*$' AND length(`slug`) <= 80),
  ADD CONSTRAINT `articles_required_access_level_check` CHECK (`requiredAccessLevel` IN ('standard', 'premium')),
  ADD CONSTRAINT `articles_language_check` CHECK (`language` IN ('fr', 'en', 'ar'));

ALTER TABLE `article_categories`
  ADD CONSTRAINT `article_categories_slug_check` CHECK (`slug` REGEXP '^[a-z0-9]+(-[a-z0-9]+)*$' AND length(`slug`) <= 80);

ALTER TABLE `tags`
  ADD CONSTRAINT `tags_slug_check` CHECK (`slug` REGEXP '^[a-z0-9]+(-[a-z0-9]+)*$' AND length(`slug`) <= 80);

ALTER TABLE `article_translations`
  ADD CONSTRAINT `article_translations_language_check` CHECK (`language` IN ('fr', 'en', 'ar')),
  ADD CONSTRAINT `article_translations_content_check` CHECK (length(trim(`title`)) > 0 AND `bodyText` <> '');

-- ---- newsletter --------------------------------------------------------------
ALTER TABLE `newsletter_subscribers`
  ADD CONSTRAINT `newsletter_status_check` CHECK (`status` IN ('pending', 'confirmed', 'unsubscribed')),
  ADD CONSTRAINT `newsletter_email_normalised_check` CHECK (`email` = lower(trim(`email`))),
  ADD CONSTRAINT `newsletter_confirmed_at_check` CHECK ((`status` = 'pending') OR (`confirmedAt` IS NOT NULL)),
  ADD CONSTRAINT `newsletter_unsubscribed_at_check` CHECK ((`status` = 'unsubscribed') = (`unsubscribedAt` IS NOT NULL));

-- ---- certifications ------------------------------------------------------------
ALTER TABLE `certifications`
  ADD CONSTRAINT `certifications_revoked_reason_check` CHECK (`revokedReason` IS NULL OR `revokedAt` IS NOT NULL);

-- ---- bank comparator (P4-06) ----------------------------------------------------
ALTER TABLE `comparator_banks`
  ADD CONSTRAINT `comparator_banks_name_check` CHECK (length(trim(`name`)) > 0);

-- The 11 rubrics of the client's guide (src/constants/comparator.js).
ALTER TABLE `comparator_conditions`
  ADD CONSTRAINT `comparator_conditions_theme_check`
    CHECK (`theme` IN ('comptes', 'versements-retraits', 'carte-locale', 'epargne', 'coffres-forts', 'credits',
                       'virements', 'carte-internationale', 'devises', 'operations-diverses', 'cheques')),
  ADD CONSTRAINT `comparator_conditions_segment_check`
    CHECK (`segment` IN ('particulier', 'professionnel', 'entreprise', 'non_precise')),
  ADD CONSTRAINT `comparator_conditions_label_check` CHECK (length(trim(`label`)) > 0),
  ADD CONSTRAINT `comparator_conditions_category_check` CHECK (`category` IS NULL OR length(trim(`category`)) > 0),
  -- The values are an object of texts ({ "fee": "100 DA", "period": "Mensuel" }).
  ADD CONSTRAINT `comparator_conditions_values_check` CHECK (JSON_TYPE(`values`) = 'OBJECT');

-- A single row: the date the comparator's data last changed.
ALTER TABLE `comparator_meta` ADD CONSTRAINT `comparator_meta_single_row_check` CHECK (`id` = 1);

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `started_at`, `applied_steps_count`) VALUES (UUID(), 'e18f423ee86ef5901e1ee50dc81d24e48f66d9ed4bf77be94c78e25154fe17bd', NOW(3), '20261006204200_integrity_checks', NOW(3), 1);

-- ===== 20261006204702_comparator_data =====
-- Data of the bank comparator (P4-06), from the client's workbook
-- « Conditions_bancaires_par_thematiques_et_segments.xlsx » (itself built only on
-- « Tableaux_conditions_bancaires_mise_en_forme.xlsx »). Texts are verbatim. The only
-- changes, all documented in TASKS.md (P4-06) and reported to the client:
--   - versements-retraits: Fransabank / Retrait déplacé — note of the base workbook (column E) kept as conditions
--   - 03_Carte_Locale: Pack "Smart" ignored here (not a card; kept in operations-diverses, as the guide says)
--   - credits: HSBC / Découvert — « Taux de référence + 7,25% » moved from "Frais de dossier" to "Taux / marge"
--   - operations-diverses: Pack "Smart" rebuilt — label « Pack "Smart" (E-banking, SMS) », fee « 100 DA/mois »
-- Fixed ids so the migration is reproducible; INSERT IGNORE makes it safe to replay.
-- Banks are named exactly as in the file: no full name is invented.

INSERT IGNORE INTO `comparator_banks` (`id`, `name`, `createdAt`, `updatedAt`) VALUES
  ('c0000000-0000-4000-8000-000000000001', 'Al Baraka', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c0000000-0000-4000-8000-000000000002', 'Al Salam Bank', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c0000000-0000-4000-8000-000000000003', 'HSBC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c0000000-0000-4000-8000-000000000004', 'Fransabank', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c0000000-0000-4000-8000-000000000005', 'TBA', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c0000000-0000-4000-8000-000000000006', 'BNH', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c0000000-0000-4000-8000-000000000007', 'BADR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c0000000-0000-4000-8000-000000000008', 'CPA', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c0000000-0000-4000-8000-000000000009', 'BNP Paribas', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c0000000-0000-4000-8000-000000000010', 'SGA', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c0000000-0000-4000-8000-000000000011', 'Natixis', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c0000000-0000-4000-8000-000000000012', 'ABC Bank', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c0000000-0000-4000-8000-000000000013', 'CNEP', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT IGNORE INTO `comparator_conditions` (`id`, `bankId`, `theme`, `segment`, `category`, `label`, `values`, `position`, `createdAt`, `updatedAt`) VALUES
  ('c1000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'comptes', 'particulier', NULL, 'Compte Chèque (Particulier)', '{"fee": "100 DA", "period": "Mensuel"}', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000001', 'comptes', 'professionnel', NULL, 'Compte Courant (Professionnel)', '{"fee": "200 DA", "period": "Mensuel"}', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000001', 'comptes', 'entreprise', NULL, 'Compte Courant (Entreprise)', '{"fee": "1 000 DA", "period": "Mensuel"}', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000001', 'comptes', 'non_precise', NULL, 'Compte Épargne', '{"fee": "Gratuit"}', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-000000000001', 'comptes', 'non_precise', NULL, 'Compte Devises', '{"fee": "Gratuit"}', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000006', 'c0000000-0000-4000-8000-000000000002', 'comptes', 'non_precise', NULL, 'Compte Courant', '{"fee": "2 500 DA", "period": "Trimestriel"}', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000007', 'c0000000-0000-4000-8000-000000000002', 'comptes', 'non_precise', NULL, 'Compte Chèque', '{"fee": "1 000 DA", "period": "Trimestriel"}', 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000008', 'c0000000-0000-4000-8000-000000000002', 'comptes', 'non_precise', NULL, 'Compte Tawfir (Épargne)', '{"fee": "Gratuit"}', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000009', 'c0000000-0000-4000-8000-000000000003', 'comptes', 'entreprise', NULL, 'Compte Commercial DZD (Entreprise)', '{"fee": "3 750 DA", "period": "Annuel"}', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000010', 'c0000000-0000-4000-8000-000000000004', 'comptes', 'particulier', NULL, 'Compte Chèque (Particulier)', '{"fee": "180 DA (TTC)", "period": "Mensuel"}', 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000011', 'c0000000-0000-4000-8000-000000000004', 'comptes', 'entreprise', NULL, 'Compte Courant (Entreprise)', '{"fee": "500 DA", "period": "Mensuel"}', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000012', 'c0000000-0000-4000-8000-000000000005', 'comptes', 'particulier', NULL, 'Compte Courant (Particulier)', '{"fee": "1 200 DA", "period": "Mensuel"}', 11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000013', 'c0000000-0000-4000-8000-000000000005', 'comptes', 'non_precise', NULL, 'Compte de Chèques', '{"fee": "200 DA", "period": "Mensuel"}', 12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000014', 'c0000000-0000-4000-8000-000000000006', 'comptes', 'non_precise', NULL, 'Compte Courant', '{"fee": "500 DA", "period": "Trimestriel"}', 13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000015', 'c0000000-0000-4000-8000-000000000006', 'comptes', 'non_precise', NULL, 'Compte Chèque', '{"fee": "75 DA", "period": "Trimestriel"}', 14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000016', 'c0000000-0000-4000-8000-000000000007', 'comptes', 'non_precise', NULL, 'Compte Chèque', '{"fee": "1 000 DA", "period": "Annuel"}', 15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000017', 'c0000000-0000-4000-8000-000000000008', 'comptes', 'non_precise', NULL, 'Compte de Chèques', '{"fee": "300 DA", "period": "Annuel"}', 16, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000018', 'c0000000-0000-4000-8000-000000000008', 'comptes', 'professionnel', NULL, 'Compte Courant (Professionnel)', '{"fee": "1 500 DA", "period": "Annuel"}', 17, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000019', 'c0000000-0000-4000-8000-000000000009', 'comptes', 'particulier', NULL, 'Compte Particulier', '{"fee": "800 DA", "period": "Trimestriel"}', 18, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000020', 'c0000000-0000-4000-8000-000000000009', 'comptes', 'professionnel', NULL, 'Compte Professionnel', '{"fee": "1 500 DA", "period": "Trimestriel"}', 19, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT IGNORE INTO `comparator_conditions` (`id`, `bankId`, `theme`, `segment`, `category`, `label`, `values`, `position`, `createdAt`, `updatedAt`) VALUES
  ('c1000000-0000-4000-8000-000000000021', 'c0000000-0000-4000-8000-000000000010', 'comptes', 'particulier', NULL, 'Compte Courant (Particulier)', '{"fee": "800 DA", "period": "Trimestriel"}', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000022', 'c0000000-0000-4000-8000-000000000010', 'comptes', 'entreprise', NULL, 'Compte Courant (Entreprise)', '{"fee": "900 DA", "period": "Trimestriel"}', 21, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000023', 'c0000000-0000-4000-8000-000000000011', 'comptes', 'particulier', NULL, 'Compte Chèque (Particulier)', '{"fee": "1 260,5 DA", "period": "Trimestriel"}', 22, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000024', 'c0000000-0000-4000-8000-000000000011', 'comptes', 'professionnel', NULL, 'Compte Courant (Professionnel)', '{"fee": "4 000 DA", "period": "Annuel"}', 23, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000025', 'c0000000-0000-4000-8000-000000000012', 'comptes', 'entreprise', NULL, 'Compte Courant (Corporate)', '{"fee": "2 500 DA", "period": "Trimestriel"}', 24, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000026', 'c0000000-0000-4000-8000-000000000012', 'comptes', 'professionnel', NULL, 'Compte Courant (Professionnel)', '{"fee": "1 000 DA", "period": "Trimestriel"}', 25, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000027', 'c0000000-0000-4000-8000-000000000001', 'versements-retraits', 'non_precise', 'Retrait', 'Retrait même agence', '{"fee": "Gratuit"}', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000028', 'c0000000-0000-4000-8000-000000000001', 'versements-retraits', 'non_precise', 'Retrait', 'Retrait déplacé (≤ 500 000 DA)', '{"fee": "Gratuit"}', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000029', 'c0000000-0000-4000-8000-000000000001', 'versements-retraits', 'non_precise', 'Retrait', 'Retrait déplacé (> 500 000 DA)', '{"fee": "0,25% (Max 3 500 DA)"}', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000030', 'c0000000-0000-4000-8000-000000000001', 'versements-retraits', 'non_precise', 'Versement', 'Versement même agence', '{"fee": "Gratuit"}', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000031', 'c0000000-0000-4000-8000-000000000001', 'versements-retraits', 'non_precise', 'Versement', 'Versement inter-agences', '{"fee": "Gratuit"}', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000032', 'c0000000-0000-4000-8000-000000000002', 'versements-retraits', 'non_precise', 'Retrait', 'Retrait même agence', '{"fee": "Gratuit"}', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000033', 'c0000000-0000-4000-8000-000000000002', 'versements-retraits', 'non_precise', 'Retrait', 'Retrait déplacé (≤ 15 000 DA)', '{"fee": "Gratuit"}', 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000034', 'c0000000-0000-4000-8000-000000000002', 'versements-retraits', 'non_precise', 'Retrait', 'Retrait déplacé (> 15 000 DA et ≤ 50 000 DA)', '{"fee": "100 DA"}', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000035', 'c0000000-0000-4000-8000-000000000002', 'versements-retraits', 'non_precise', 'Retrait', 'Retrait déplacé (> 50 000 DA)', '{"fee": "200 DA"}', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000036', 'c0000000-0000-4000-8000-000000000004', 'versements-retraits', 'non_precise', 'Retrait', 'Retrait même agence', '{"fee": "Gratuit"}', 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000037', 'c0000000-0000-4000-8000-000000000004', 'versements-retraits', 'non_precise', 'Retrait', 'Retrait déplacé', '{"fee": "50 DA", "conditions": "opérations de caisse retrait ou versement"}', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000038', 'c0000000-0000-4000-8000-000000000005', 'versements-retraits', 'non_precise', 'Retrait', 'Retrait même agence', '{"fee": "Gratuit"}', 11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000039', 'c0000000-0000-4000-8000-000000000005', 'versements-retraits', 'non_precise', 'Retrait', 'Retrait déplacé (> 50 000 DA)', '{"fee": "500 DA"}', 12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000040', 'c0000000-0000-4000-8000-000000000006', 'versements-retraits', 'non_precise', 'Retrait', 'Retrait même agence', '{"fee": "Gratuit"}', 13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT IGNORE INTO `comparator_conditions` (`id`, `bankId`, `theme`, `segment`, `category`, `label`, `values`, `position`, `createdAt`, `updatedAt`) VALUES
  ('c1000000-0000-4000-8000-000000000041', 'c0000000-0000-4000-8000-000000000006', 'versements-retraits', 'non_precise', 'Retrait', 'Retrait déplacé', '{"fee": "100 DA (ou 500 DA selon banque)"}', 14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000042', 'c0000000-0000-4000-8000-000000000007', 'versements-retraits', 'non_precise', 'Retrait', 'Retrait déplacé (par chèque)', '{"fee": "0,50% (Min 100 DA)", "conditions": "Plafonné à 500 000 DA"}', 15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000043', 'c0000000-0000-4000-8000-000000000008', 'versements-retraits', 'non_precise', 'Retrait', 'Retrait même agence', '{"fee": "Gratuit"}', 16, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000044', 'c0000000-0000-4000-8000-000000000009', 'versements-retraits', 'non_precise', 'Retrait', 'Retrait même agence', '{"fee": "Gratuit"}', 17, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000045', 'c0000000-0000-4000-8000-000000000009', 'versements-retraits', 'particulier', 'Retrait', 'Retrait déplacé (Particulier)', '{"fee": "300 DA", "conditions": "Plafond de 300 000 DA"}', 18, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000046', 'c0000000-0000-4000-8000-000000000010', 'versements-retraits', 'non_precise', 'Retrait', 'Retrait même agence', '{"fee": "0,05% (Min 15, Max 50 DA)"}', 19, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000047', 'c0000000-0000-4000-8000-000000000010', 'versements-retraits', 'non_precise', 'Retrait', 'Retrait déplacé', '{"fee": "200 DA (jusqu''à 250 000 DA)"}', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000048', 'c0000000-0000-4000-8000-000000000011', 'versements-retraits', 'non_precise', 'Retrait', 'Retrait même agence', '{"fee": "Gratuit"}', 21, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000049', 'c0000000-0000-4000-8000-000000000011', 'versements-retraits', 'non_precise', 'Retrait', 'Retrait déplacé', '{"fee": "0,05%"}', 22, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000050', 'c0000000-0000-4000-8000-000000000012', 'versements-retraits', 'non_precise', 'Retrait', 'Retrait même agence', '{"fee": "Gratuit"}', 23, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000051', 'c0000000-0000-4000-8000-000000000012', 'versements-retraits', 'professionnel', 'Retrait', 'Retrait déplacé (Professionnel)', '{"fee": "2 000 DA"}', 24, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000052', 'c0000000-0000-4000-8000-000000000001', 'carte-locale', 'non_precise', NULL, 'Carte CIB', '{"annualFee": "Gratuit", "atmWithdrawal": "29,41 DA", "opposition": "200 DA"}', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000053', 'c0000000-0000-4000-8000-000000000002', 'carte-locale', 'non_precise', NULL, 'CIB Classique', '{"annualFee": "200 DA", "atmWithdrawal": "20 DA", "opposition": "500 DA (avec réédition)"}', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000054', 'c0000000-0000-4000-8000-000000000002', 'carte-locale', 'non_precise', NULL, 'CIB Gold', '{"annualFee": "3 000 DA", "atmWithdrawal": "20 DA", "opposition": "500 DA (avec réédition)"}', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000055', 'c0000000-0000-4000-8000-000000000004', 'carte-locale', 'non_precise', NULL, 'CIB Classic', '{"annualFee": "Gratuit", "atmWithdrawal": "35 DA", "opposition": "200 DA"}', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000056', 'c0000000-0000-4000-8000-000000000005', 'carte-locale', 'non_precise', NULL, 'CIB Classic / Gold', '{"annualFee": "Franco", "atmWithdrawal": "25 DA", "opposition": "200 DA"}', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000057', 'c0000000-0000-4000-8000-000000000006', 'carte-locale', 'non_precise', NULL, 'CIB Classic', '{"annualFee": "Gratuit", "atmWithdrawal": "35 DA (TTC)", "opposition": "100 DA"}', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000058', 'c0000000-0000-4000-8000-000000000007', 'carte-locale', 'non_precise', NULL, 'CIB Classic / Gold', '{"annualFee": "Gratuit", "atmWithdrawal": "29,41 DA", "opposition": "150 DA"}', 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000059', 'c0000000-0000-4000-8000-000000000008', 'carte-locale', 'non_precise', NULL, 'CIB Classic', '{"annualFee": "Gratuit", "atmWithdrawal": "25 DA", "opposition": "100 DA"}', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000060', 'c0000000-0000-4000-8000-000000000009', 'carte-locale', 'non_precise', NULL, 'CIB Classic', '{"annualFee": "800 DA (frais de gestion)", "atmWithdrawal": "50 DA", "opposition": "300 DA"}', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT IGNORE INTO `comparator_conditions` (`id`, `bankId`, `theme`, `segment`, `category`, `label`, `values`, `position`, `createdAt`, `updatedAt`) VALUES
  ('c1000000-0000-4000-8000-000000000061', 'c0000000-0000-4000-8000-000000000010', 'carte-locale', 'non_precise', NULL, 'CIB Classic', '{"annualFee": "Gratuit", "atmWithdrawal": "Gratuit", "opposition": "1 000 DA"}', 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000062', 'c0000000-0000-4000-8000-000000000011', 'carte-locale', 'non_precise', NULL, 'CIB Classic', '{"annualFee": "426,89 DA (renouvellement)", "atmWithdrawal": "Gratuit", "opposition": "420,17 DA"}', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000063', 'c0000000-0000-4000-8000-000000000012', 'carte-locale', 'non_precise', NULL, 'CIB Gold', '{"annualFee": "3 500 DA", "atmWithdrawal": "35 DA", "opposition": "300 DA"}', 11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000064', 'c0000000-0000-4000-8000-000000000001', 'epargne', 'non_precise', NULL, 'Livret d''Épargne', '{"rate": "53,27% (Part Client) / 46,73% (Part Banque)", "conditions": "Sur les bénéfices"}', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000065', 'c0000000-0000-4000-8000-000000000001', 'epargne', 'non_precise', NULL, 'Dépôt Affecté 3 mois', '{"rate": "52,50% (Part Client) / 47,50% (Part Banque)"}', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000066', 'c0000000-0000-4000-8000-000000000001', 'epargne', 'non_precise', NULL, 'Dépôt Affecté 6 mois', '{"rate": "53,80% (Part Client) / 46,20% (Part Banque)"}', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000067', 'c0000000-0000-4000-8000-000000000001', 'epargne', 'non_precise', NULL, 'Dépôt Affecté 12 mois', '{"rate": "55,50% (Part Client) / 44,50% (Part Banque)"}', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000068', 'c0000000-0000-4000-8000-000000000001', 'epargne', 'non_precise', NULL, 'Dépôt Affecté 24 mois', '{"rate": "59,00% (Part Client) / 41,00% (Part Banque)"}', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000069', 'c0000000-0000-4000-8000-000000000001', 'epargne', 'non_precise', NULL, 'Dépôt Affecté 36 mois', '{"rate": "63,00% (Part Client) / 37,00% (Part Banque)"}', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000070', 'c0000000-0000-4000-8000-000000000001', 'epargne', 'non_precise', NULL, 'Dépôt Affecté 60 mois', '{"rate": "67,50% (Part Client) / 32,50% (Part Banque)"}', 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000071', 'c0000000-0000-4000-8000-000000000001', 'epargne', 'non_precise', NULL, 'Dépôt Affecté > 60 mois', '{"rate": "72,00% (Part Client) / 28,00% (Part Banque)"}', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000072', 'c0000000-0000-4000-8000-000000000002', 'epargne', 'non_precise', NULL, 'Compte Épargne', '{"rate": "61% (Part Client) / 39% (Part Banque)", "conditions": "Sur les bénéfices"}', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000073', 'c0000000-0000-4000-8000-000000000002', 'epargne', 'non_precise', NULL, 'DAT 3 mois', '{"rate": "75% (Part Client) / 25% (Part Banque)"}', 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000074', 'c0000000-0000-4000-8000-000000000002', 'epargne', 'non_precise', NULL, 'DAT 6 mois', '{"rate": "60% (Part Client) / 40% (Part Banque)"}', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000075', 'c0000000-0000-4000-8000-000000000002', 'epargne', 'non_precise', NULL, 'DAT 12 mois', '{"rate": "65% (Part Client) / 35% (Part Banque)"}', 11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000076', 'c0000000-0000-4000-8000-000000000002', 'epargne', 'non_precise', NULL, 'DAT 24 mois', '{"rate": "75% (Part Client) / 25% (Part Banque)"}', 12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000077', 'c0000000-0000-4000-8000-000000000002', 'epargne', 'non_precise', NULL, 'DAT 36 mois', '{"rate": "80% (Part Client) / 20% (Part Banque)"}', 13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000078', 'c0000000-0000-4000-8000-000000000002', 'epargne', 'non_precise', NULL, 'DAT 60 mois et +', '{"rate": "90% (Part Client) / 10% (Part Banque)"}', 14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000079', 'c0000000-0000-4000-8000-000000000004', 'epargne', 'non_precise', NULL, 'Livret d''Épargne', '{"rate": "3,5% / an"}', 15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000080', 'c0000000-0000-4000-8000-000000000004', 'epargne', 'non_precise', NULL, 'DAT (12 à 24 mois)', '{"rate": "3,5% / an"}', 16, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT IGNORE INTO `comparator_conditions` (`id`, `bankId`, `theme`, `segment`, `category`, `label`, `values`, `position`, `createdAt`, `updatedAt`) VALUES
  ('c1000000-0000-4000-8000-000000000081', 'c0000000-0000-4000-8000-000000000005', 'epargne', 'non_precise', NULL, 'Compte Épargne "Tawfir"', '{"rate": "2,5% à 4% / an", "conditions": "Variable selon montant"}', 17, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000082', 'c0000000-0000-4000-8000-000000000006', 'epargne', 'non_precise', NULL, 'Compte Épargne', '{"rate": "3% / an"}', 18, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000083', 'c0000000-0000-4000-8000-000000000006', 'epargne', 'non_precise', NULL, 'DAT (12 à 18 mois)', '{"rate": "2,00%"}', 19, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000084', 'c0000000-0000-4000-8000-000000000013', 'epargne', 'non_precise', NULL, 'Compte Épargne Logement', '{"rate": "2%"}', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000085', 'c0000000-0000-4000-8000-000000000013', 'epargne', 'non_precise', NULL, 'DAT (12 mois)', '{"rate": "3,25%"}', 21, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000086', 'c0000000-0000-4000-8000-000000000007', 'epargne', 'non_precise', NULL, 'Livret d''Épargne', '{"rate": "Non spécifié"}', 22, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000087', 'c0000000-0000-4000-8000-000000000008', 'epargne', 'non_precise', NULL, 'DAT (12 à 18 mois)', '{"rate": "Taux variable de 1,75%+"}', 23, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000088', 'c0000000-0000-4000-8000-000000000009', 'epargne', 'non_precise', NULL, 'DAT (12 mois)', '{"rate": "Consulter la grille"}', 24, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000089', 'c0000000-0000-4000-8000-000000000010', 'epargne', 'non_precise', NULL, 'Compte Tawfiri', '{"rate": "1,9% / an"}', 25, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000090', 'c0000000-0000-4000-8000-000000000011', 'epargne', 'non_precise', NULL, 'Compte Épargne', '{"rate": "3,25%"}', 26, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000091', 'c0000000-0000-4000-8000-000000000012', 'epargne', 'non_precise', NULL, 'DAT (12 mois)', '{"rate": "TRC + 0,25%"}', 27, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000092', 'c0000000-0000-4000-8000-000000000001', 'credits', 'non_precise', NULL, 'Prélèvement avec balayage', '{"fileFee": "4% du montant prélevé"}', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000093', 'c0000000-0000-4000-8000-000000000001', 'credits', 'entreprise', NULL, 'Financement Exploitation (Entreprise)', '{"rate": "6% - 9%"}', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000094', 'c0000000-0000-4000-8000-000000000001', 'credits', 'entreprise', NULL, 'Financement Investissement (Entreprise)', '{"rate": "5,50% - 8%"}', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000095', 'c0000000-0000-4000-8000-000000000001', 'credits', 'non_precise', NULL, 'Ijara (Leasing)', '{"rate": "Max 12%"}', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000096', 'c0000000-0000-4000-8000-000000000001', 'credits', 'non_precise', NULL, 'Financement Immobilier (Épargnant)', '{"rate": "6% - 6,50%"}', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000097', 'c0000000-0000-4000-8000-000000000001', 'credits', 'non_precise', NULL, 'Financement Immobilier (Non-épargnant)', '{"rate": "7% - 7,50%"}', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000098', 'c0000000-0000-4000-8000-000000000001', 'credits', 'non_precise', NULL, 'Financement Consommation', '{"fileFee": "1% flat (Min 5 000 DA)", "rate": "10% - 11%"}', 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000099', 'c0000000-0000-4000-8000-000000000002', 'credits', 'non_precise', NULL, 'Crédit Immobilier (Épargnant)', '{"fileFee": "10 000 DA", "rate": "6,50% / an", "earlyRepayment": "Non spécifié"}', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000100', 'c0000000-0000-4000-8000-000000000002', 'credits', 'non_precise', NULL, 'Crédit Immobilier (Non-épargnant)', '{"fileFee": "7 000 DA", "rate": "7,00% / an"}', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT IGNORE INTO `comparator_conditions` (`id`, `bankId`, `theme`, `segment`, `category`, `label`, `values`, `position`, `createdAt`, `updatedAt`) VALUES
  ('c1000000-0000-4000-8000-000000000101', 'c0000000-0000-4000-8000-000000000002', 'credits', 'non_precise', NULL, 'Crédit Consommation (Équipement)', '{"fileFee": "3 000 DA", "rate": "9,50% / an"}', 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000102', 'c0000000-0000-4000-8000-000000000002', 'credits', 'non_precise', NULL, 'Crédit Consommation (Auto)', '{"fileFee": "15 000 DA", "rate": "9,50% / an"}', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000103', 'c0000000-0000-4000-8000-000000000003', 'credits', 'non_precise', NULL, 'Découvert', '{"rate": "Taux de référence + 7,25%"}', 11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000104', 'c0000000-0000-4000-8000-000000000004', 'credits', 'non_precise', NULL, 'Crédit Immobilier', '{"fileFee": "0,5% (Min 10 000, Max 50 000 DA)", "rate": "TR + Marge", "earlyRepayment": "1% (partiel), 2% (total)"}', 12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000105', 'c0000000-0000-4000-8000-000000000004', 'credits', 'non_precise', NULL, 'Crédit Consommation', '{"fileFee": "1% (Min 3 000, Max 10 000 DA)", "rate": "TR + Marge", "earlyRepayment": "Pénalité de 4%"}', 13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000106', 'c0000000-0000-4000-8000-000000000005', 'credits', 'non_precise', NULL, 'Crédit Immobilier "Menzili"', '{"fileFee": "Non spécifié", "rate": "TRD + 0,85%"}', 14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000107', 'c0000000-0000-4000-8000-000000000006', 'credits', 'non_precise', NULL, 'Crédit Immobilier', '{"fileFee": "10 000 DA", "rate": "5,75% (épargnant)"}', 15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000108', 'c0000000-0000-4000-8000-000000000006', 'credits', 'non_precise', NULL, 'Crédit Consommation', '{"fileFee": "5 000 DA", "rate": "8,00%"}', 16, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000109', 'c0000000-0000-4000-8000-000000000007', 'credits', 'non_precise', NULL, 'Crédit Immobilier', '{"fileFee": "20 000 DA", "rate": "Non spécifié"}', 17, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000110', 'c0000000-0000-4000-8000-000000000007', 'credits', 'non_precise', NULL, 'Crédit Consommation', '{"fileFee": "5 000 DA", "rate": "Non spécifié"}', 18, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000111', 'c0000000-0000-4000-8000-000000000008', 'credits', 'non_precise', NULL, 'Crédit Immobilier', '{"fileFee": "10 000 DA", "rate": "5,75% (épargnant)"}', 19, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000112', 'c0000000-0000-4000-8000-000000000008', 'credits', 'non_precise', NULL, 'Crédit Consommation', '{"fileFee": "5 000 DA", "rate": "8,00%"}', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000113', 'c0000000-0000-4000-8000-000000000009', 'credits', 'non_precise', NULL, 'Crédit Immobilier', '{"fileFee": "0,50%", "rate": "À partir de 6%"}', 21, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000114', 'c0000000-0000-4000-8000-000000000009', 'credits', 'non_precise', NULL, 'Crédit Véhicule', '{"fileFee": "1,03% (Min 5 000, Max 20 000 DA)", "rate": "À partir de 6%"}', 22, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000115', 'c0000000-0000-4000-8000-000000000010', 'credits', 'non_precise', NULL, 'Prêt Immobilier', '{"fileFee": "1,2% (Min 20 000, Max 100 000 DA)", "rate": "TBSGA + Marge"}', 23, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000116', 'c0000000-0000-4000-8000-000000000010', 'credits', 'non_precise', NULL, 'Crédit Auto', '{"fileFee": "1% (Min 10 000, Max 20 000 DA)", "rate": "TBSGA + Marge"}', 24, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000117', 'c0000000-0000-4000-8000-000000000011', 'credits', 'non_precise', NULL, 'Prêt Habitat', '{"fileFee": "T% (Min 3 000, Max 20 000 DA)", "rate": "TR + Marge", "earlyRepayment": "2%"}', 25, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000118', 'c0000000-0000-4000-8000-000000000012', 'credits', 'non_precise', NULL, 'Crédit Véhicule', '{"fileFee": "15 000 DA", "rate": "TRD + Marge", "earlyRepayment": "4% (flat)"}', 26, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000119', 'c0000000-0000-4000-8000-000000000001', 'carte-internationale', 'non_precise', NULL, 'Carte Visa Classique', '{"annualFee": "1 800 DA + 700 DA/chargement", "foreignWithdrawal": "1 € + 2%", "opposition": "800 DA"}', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000120', 'c0000000-0000-4000-8000-000000000001', 'carte-internationale', 'non_precise', NULL, 'Carte Visa Gold', '{"annualFee": "4 500 DA", "foreignWithdrawal": "1 € + 2%", "opposition": "800 DA"}', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT IGNORE INTO `comparator_conditions` (`id`, `bankId`, `theme`, `segment`, `category`, `label`, `values`, `position`, `createdAt`, `updatedAt`) VALUES
  ('c1000000-0000-4000-8000-000000000121', 'c0000000-0000-4000-8000-000000000001', 'carte-internationale', 'non_precise', NULL, 'Carte Visa Platinum', '{"annualFee": "14 000 DA", "foreignWithdrawal": "1 € + 2%", "opposition": "800 DA"}', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000122', 'c0000000-0000-4000-8000-000000000002', 'carte-internationale', 'non_precise', NULL, 'Visa Classique', '{"annualFee": "4 000 DA", "foreignWithdrawal": "2 € + 1,5% (Zone Euro)", "opposition": "Gratuit (sans réédition)"}', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000123', 'c0000000-0000-4000-8000-000000000002', 'carte-internationale', 'non_precise', NULL, 'Visa Gold', '{"annualFee": "6 500 DA", "foreignWithdrawal": "2 € + 1,5% (Zone Euro)", "opposition": "Gratuit (sans réédition)"}', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000124', 'c0000000-0000-4000-8000-000000000002', 'carte-internationale', 'non_precise', NULL, 'Visa Platinum', '{"annualFee": "14 000 DA", "foreignWithdrawal": "2 € + 1,5% (Zone Euro)", "opposition": "Gratuit (sans réédition)"}', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000125', 'c0000000-0000-4000-8000-000000000004', 'carte-internationale', 'non_precise', NULL, 'Visa Classic (sans assurance)', '{"annualFee": "1 790 DA", "foreignWithdrawal": "1,5 € + 1%", "opposition": "Gratuit"}', 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000126', 'c0000000-0000-4000-8000-000000000005', 'carte-internationale', 'non_precise', NULL, 'Mastercard Prépayée', '{"annualFee": "2 500 DA", "foreignWithdrawal": "Non spécifié", "opposition": "500 DA (blocage)"}', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000127', 'c0000000-0000-4000-8000-000000000007', 'carte-internationale', 'non_precise', NULL, 'Mastercard Titanium', '{"annualFee": "17 000 DA / 2 ans", "foreignWithdrawal": "2,5% + 2 €", "opposition": "2 500 DA"}', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000128', 'c0000000-0000-4000-8000-000000000008', 'carte-internationale', 'non_precise', NULL, 'Carte Mastercard Platinum', '{"annualFee": "17 000 DA / An", "foreignWithdrawal": "1 000 DA / 2 000 DA", "opposition": "1 000 DA"}', 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000129', 'c0000000-0000-4000-8000-000000000009', 'carte-internationale', 'non_precise', NULL, 'Visa Classique', '{"annualFee": "4 500 DA", "foreignWithdrawal": "2 € + 1,5%", "opposition": "1 500 DA"}', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000130', 'c0000000-0000-4000-8000-000000000010', 'carte-internationale', 'non_precise', NULL, 'Visa Classic', '{"annualFee": "4 500 DA", "foreignWithdrawal": "2 € + 2%", "opposition": "Non spécifié"}', 11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000131', 'c0000000-0000-4000-8000-000000000001', 'devises', 'non_precise', 'Transfert international', 'Virement à l''étranger', '{"fee": "0,5% (Min 3 000 DA) + Frais Swift 3 000 DA"}', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000132', 'c0000000-0000-4000-8000-000000000001', 'devises', 'non_precise', 'SWIFT / correspondant', 'Avis de sort', '{"fee": "5 000 DA + Frais Swift 3 000 DA"}', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000133', 'c0000000-0000-4000-8000-000000000001', 'devises', 'non_precise', 'SWIFT / correspondant', 'Frais correspondants étrangers', '{"fee": "15 000 DA"}', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000134', 'c0000000-0000-4000-8000-000000000001', 'devises', 'non_precise', 'SWIFT / correspondant', 'Frais de notification Swift', '{"fee": "1 500 DA/Message"}', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000135', 'c0000000-0000-4000-8000-000000000001', 'devises', 'non_precise', 'Change', 'Achat devise', '{"fee": "Gratuit"}', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000136', 'c0000000-0000-4000-8000-000000000001', 'devises', 'non_precise', 'Change', 'Vente devise', '{"fee": "2% (Min 500 DA)"}', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000137', 'c0000000-0000-4000-8000-000000000002', 'devises', 'non_precise', 'Transfert international', 'Transfert libre (Import)', '{"fee": "3 000 DA (frais Swift)"}', 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000138', 'c0000000-0000-4000-8000-000000000002', 'devises', 'non_precise', 'Transfert international', 'Transfert à l''étranger', '{"fee": "1,00% (Commission Banque d''Algérie) + Frais Swift"}', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000139', 'c0000000-0000-4000-8000-000000000002', 'devises', 'non_precise', 'Allocation', 'Allocation touristique', '{"fee": "840,34 DA"}', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000140', 'c0000000-0000-4000-8000-000000000003', 'devises', 'non_precise', 'Transfert international', 'Paiement sur compte devise', '{"fee": "0,25% + 3 000 DA (frais Swift)"}', 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT IGNORE INTO `comparator_conditions` (`id`, `bankId`, `theme`, `segment`, `category`, `label`, `values`, `position`, `createdAt`, `updatedAt`) VALUES
  ('c1000000-0000-4000-8000-000000000141', 'c0000000-0000-4000-8000-000000000004', 'devises', 'non_precise', 'Transfert international', 'Transfert de devises', '{"fee": "Frais Swift 2 500 DA"}', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000142', 'c0000000-0000-4000-8000-000000000004', 'devises', 'non_precise', 'Allocation', 'Allocation touristique', '{"fee": "1 000 DA"}', 11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000143', 'c0000000-0000-4000-8000-000000000005', 'devises', 'non_precise', 'Transfert international', 'Transfert libre', '{"fee": "0,25% (Min 2 500 DA) + Frais Swift 3 000 DA"}', 12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000144', 'c0000000-0000-4000-8000-000000000006', 'devises', 'non_precise', 'Transfert international', 'Virement à l''étranger', '{"fee": "Non spécifié"}', 13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000145', 'c0000000-0000-4000-8000-000000000007', 'devises', 'non_precise', 'Transfert international', 'Transfert sur compte devise', '{"fee": "0,25% (Min 2 500 DA) + Frais Swift"}', 14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000146', 'c0000000-0000-4000-8000-000000000007', 'devises', 'non_precise', 'Allocation', 'Allocation touristique', '{"fee": "500 DA (adulte), 250 DA (enfant)"}', 15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000147', 'c0000000-0000-4000-8000-000000000008', 'devises', 'non_precise', 'Transfert international', 'Virement à l''étranger', '{"fee": "1% (Min 2 500 DA) + Frais Swift"}', 16, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000148', 'c0000000-0000-4000-8000-000000000009', 'devises', 'non_precise', 'Transfert international', 'Transfert', '{"fee": "Marge de 0,1% + com BA 0,10% + Frais Swift"}', 17, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000149', 'c0000000-0000-4000-8000-000000000010', 'devises', 'non_precise', 'Transfert international', 'Transfert vers l''étranger', '{"fee": "0,1% + 0,10% (com BA) + 1 000 DA (Swift)"}', 18, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000150', 'c0000000-0000-4000-8000-000000000011', 'devises', 'non_precise', 'Transfert international', 'Transfert', '{"fee": "Marge de 0,1% + com BA 0,10% + Frais Swift 3 000 DA"}', 19, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000151', 'c0000000-0000-4000-8000-000000000012', 'devises', 'non_precise', 'Transfert international', 'Transfert à l''étranger', '{"fee": "0,25% (Min 2 500 DA) + Frais Swift"}', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c1000000-0000-4000-8000-000000000152', 'c0000000-0000-4000-8000-000000000001', 'operations-diverses', 'non_precise', 'Digital / pack', 'Pack "Smart" (E-banking, SMS)', '{"fee": "100 DA/mois"}', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- The date shown to visitors ("données mises à jour le"): the day this data was loaded.
INSERT INTO `comparator_meta` (`id`, `dataUpdatedAt`) VALUES (1, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE `dataUpdatedAt` = CURRENT_TIMESTAMP;

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `started_at`, `applied_steps_count`) VALUES (UUID(), '705ddda5aa8b57e4e34eb801401970810f5986f93a12ec6e95aa6c4ada91d8a2', NOW(3), '20261006204702_comparator_data', NOW(3), 1);

-- ===== 20261006210000_account_types_seed =====
-- Seed: the account categories used until now (P1-06, still referenced by every
-- existing `users.accountType` value) plus the three the client asked for on
-- 2026-09-25. Fixed ids so this migration is reproducible; INSERT IGNORE makes it
-- safe to run on a database where the row already exists.
INSERT IGNORE INTO `account_types` (`id`, `slug`, `label`, `isActive`, `order`, `createdAt`, `updatedAt`) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'auto-entrepreneur', 'Auto-entrepreneur', true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('a0000000-0000-4000-8000-000000000002', 'pme',               'PME',               true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('a0000000-0000-4000-8000-000000000003', 'pmi',               'PMI',               true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('a0000000-0000-4000-8000-000000000004', 'etudiant',          'Étudiant',          true, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('a0000000-0000-4000-8000-000000000005', 'lyceen',            'Lycéen',            true, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('a0000000-0000-4000-8000-000000000006', 'salarie',           'Salarié',           true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Seed: platform settings the admin panel can edit (P3-16). Empty by default —
-- nothing invented; the admin fills them in when the client provides real values.
INSERT IGNORE INTO `platform_settings` (`key`, `value`, `updatedAt`) VALUES
  ('maintenanceMode', 'false', CURRENT_TIMESTAMP),
  ('contactEmail', '', CURRENT_TIMESTAMP),
  ('contactPhone', '', CURRENT_TIMESTAMP),
  ('contactAddress', '', CURRENT_TIMESTAMP);

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `started_at`, `applied_steps_count`) VALUES (UUID(), 'fa3dd781ab6657ee39b68a7f6edb59fc458cc9141c78e3c0576e2b3845aa4aa0', NOW(3), '20261006210000_account_types_seed', NOW(3), 1);

-- ===== 20261006211000_case_sensitive_checks =====
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

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `started_at`, `applied_steps_count`) VALUES (UUID(), '4a8ea78d982054d0730fcb53e9d0971240a06104c267cca799539cca321bc637', NOW(3), '20261006211000_case_sensitive_checks', NOW(3), 1);

