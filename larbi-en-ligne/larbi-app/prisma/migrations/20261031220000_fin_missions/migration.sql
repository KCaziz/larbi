-- P8-17: pedagogical missions and their attempts.
CREATE TABLE `fin_missions` (
  `id` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(80) NOT NULL,
  `title` VARCHAR(120) NOT NULL,
  `summary` VARCHAR(500) NOT NULL,
  `profiles` JSON NOT NULL DEFAULT '[]',
  `startingAmount` INTEGER NOT NULL,
  `currency` VARCHAR(3) NOT NULL,
  `steps` JSON NOT NULL,
  `badges` JSON NOT NULL DEFAULT '[]',
  `status` VARCHAR(10) NOT NULL DEFAULT 'draft',
  `position` INTEGER NOT NULL DEFAULT 0,
  `version` INTEGER NOT NULL DEFAULT 1,
  `publishedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `fin_missions_slug_key`(`slug`),
  INDEX `fin_missions_status_position_idx`(`status`, `position`),
  PRIMARY KEY (`id`),
  CONSTRAINT `fin_missions_status_check` CHECK (`status` IN ('draft', 'published')),
  CONSTRAINT `fin_missions_amount_check` CHECK (`startingAmount` >= 0)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `fin_mission_attempts` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `missionId` VARCHAR(191) NOT NULL,
  `choices` JSON NOT NULL,
  `result` JSON NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `fin_mission_attempts_userId_missionId_idx`(`userId`, `missionId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `fin_mission_attempts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_mission_attempts_missionId_fkey` FOREIGN KEY (`missionId`) REFERENCES `fin_missions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
