-- AlterTable
ALTER TABLE `article_translations` MODIFY `excerpt` TEXT NOT NULL DEFAULT '',
    MODIFY `body` MEDIUMTEXT NULL,
    MODIFY `bodyText` MEDIUMTEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `articles` MODIFY `excerpt` TEXT NOT NULL DEFAULT '',
    MODIFY `body` MEDIUMTEXT NULL,
    MODIFY `bodyText` MEDIUMTEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `certifications` MODIFY `revokedReason` TEXT NULL;

-- AlterTable
ALTER TABLE `comparator_conditions` MODIFY `label` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `contact_messages` MODIFY `email` VARCHAR(254) NOT NULL,
    MODIFY `message` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `courses` MODIFY `summary` TEXT NULL,
    MODIFY `body` MEDIUMTEXT NULL;

-- AlterTable
ALTER TABLE `formations` MODIFY `description` TEXT NOT NULL,
    MODIFY `certificationDescription` TEXT NULL;

-- AlterTable
ALTER TABLE `media` MODIFY `originalName` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `newsletter_subscribers` MODIFY `email` VARCHAR(254) NOT NULL;

-- AlterTable
ALTER TABLE `platform_settings` MODIFY `value` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `quiz_attempt_answers` MODIFY `text` TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `quiz_choices` MODIFY `text` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `quiz_questions` MODIFY `prompt` TEXT NOT NULL DEFAULT '',
    MODIFY `explanation` TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `quizzes` MODIFY `instructions` TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `sections` MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `email` VARCHAR(254) NOT NULL;
