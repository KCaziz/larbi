-- AlterTable
ALTER TABLE `articles` ADD COLUMN `level` VARCHAR(191) NULL,
    ADD COLUMN `theme` VARCHAR(60) NULL;

-- AlterTable
ALTER TABLE `formations` ADD COLUMN `theme` VARCHAR(60) NULL;

-- AlterTable
ALTER TABLE `glossary_terms` ADD COLUMN `simulatorKey` VARCHAR(60) NULL;

-- AlterTable
ALTER TABLE `mini_guides` ADD COLUMN `simulatorKey` VARCHAR(60) NULL;

-- CreateTable
CREATE TABLE `learning_favorites` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(20) NOT NULL,
    `refId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `learning_favorites_userId_createdAt_idx`(`userId`, `createdAt`),
    UNIQUE INDEX `learning_favorites_userId_kind_refId_key`(`userId`, `kind`, `refId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `learning_favorites` ADD CONSTRAINT `learning_favorites_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Closed vocabularies are constrained in the database too (project convention,
-- same as every other enum-like column): the application validates, and the
-- database refuses anyway, so no path can write a value nobody declared.
ALTER TABLE `articles`
  ADD CONSTRAINT `articles_level_check` CHECK (`level` IS NULL OR `level` IN ('beginner', 'intermediate', 'advanced'));

ALTER TABLE `learning_favorites`
  ADD CONSTRAINT `learning_favorites_kind_check` CHECK (`kind` IN ('course', 'article', 'term', 'guide'));
