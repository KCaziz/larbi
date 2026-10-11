-- CreateTable
CREATE TABLE `chatbot_entries` (
    `id` VARCHAR(191) NOT NULL,
    `question` VARCHAR(200) NOT NULL,
    `answer` TEXT NOT NULL,
    `language` VARCHAR(2) NOT NULL DEFAULT 'fr',
    `status` VARCHAR(20) NOT NULL DEFAULT 'draft',
    `position` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `chatbot_entries_language_status_position_idx`(`language`, `status`, `position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


-- Integrity enforced by the database itself (P3-07), like the blog: the API
-- validates first, these refuse whatever slips past it.
ALTER TABLE `chatbot_entries`
  ADD CONSTRAINT `chatbot_entries_question_check` CHECK (OCTET_LENGTH(TRIM(`question`)) > 0),
  ADD CONSTRAINT `chatbot_entries_answer_check` CHECK (OCTET_LENGTH(TRIM(`answer`)) > 0),
  ADD CONSTRAINT `chatbot_entries_language_check` CHECK (`language` IN ('fr', 'en', 'ar')),
  ADD CONSTRAINT `chatbot_entries_status_check` CHECK (`status` IN ('draft', 'published')),
  ADD CONSTRAINT `chatbot_entries_position_check` CHECK (`position` >= 0);
