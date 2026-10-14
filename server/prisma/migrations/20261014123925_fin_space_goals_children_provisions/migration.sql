-- CreateTable
CREATE TABLE `fin_space_goals` (
    `id` VARCHAR(191) NOT NULL,
    `spaceId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(80) NOT NULL,
    `target` INTEGER NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `targetDate` DATETIME(3) NULL,
    `note` VARCHAR(300) NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `archivedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `fin_space_goals_spaceId_deletedAt_idx`(`spaceId`, `deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_space_goal_contributions` (
    `id` VARCHAR(191) NOT NULL,
    `spaceGoalId` VARCHAR(191) NOT NULL,
    `memberId` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `contributedAt` DATETIME(3) NOT NULL,
    `note` VARCHAR(300) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,

    INDEX `fin_space_goal_contributions_spaceGoalId_idx`(`spaceGoalId`),
    INDEX `fin_space_goal_contributions_memberId_idx`(`memberId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_children` (
    `id` VARCHAR(191) NOT NULL,
    `spaceId` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(60) NOT NULL,
    `birthYear` INTEGER NOT NULL,
    `note` VARCHAR(300) NULL,
    `archivedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `fin_children_spaceId_deletedAt_idx`(`spaceId`, `deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_space_provisions` (
    `id` VARCHAR(191) NOT NULL,
    `spaceId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(80) NOT NULL,
    `plannedAmount` INTEGER NOT NULL,
    `alreadyProvisioned` INTEGER NOT NULL DEFAULT 0,
    `currency` VARCHAR(3) NOT NULL,
    `targetDate` DATETIME(3) NOT NULL,
    `note` VARCHAR(300) NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `archivedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `fin_space_provisions_spaceId_deletedAt_idx`(`spaceId`, `deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `fin_space_goals` ADD CONSTRAINT `fin_space_goals_spaceId_fkey` FOREIGN KEY (`spaceId`) REFERENCES `fin_spaces`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_space_goal_contributions` ADD CONSTRAINT `fin_space_goal_contributions_spaceGoalId_fkey` FOREIGN KEY (`spaceGoalId`) REFERENCES `fin_space_goals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_space_goal_contributions` ADD CONSTRAINT `fin_space_goal_contributions_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `fin_space_members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_children` ADD CONSTRAINT `fin_children_spaceId_fkey` FOREIGN KEY (`spaceId`) REFERENCES `fin_spaces`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_space_provisions` ADD CONSTRAINT `fin_space_provisions_spaceId_fkey` FOREIGN KEY (`spaceId`) REFERENCES `fin_spaces`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- CheckConstraint (hand-written: MariaDB refuses a CHECK on a FOREIGN KEY column)
ALTER TABLE `fin_space_goals`
  ADD CONSTRAINT `fin_space_goals_currency_check` CHECK (`currency` REGEXP '^[A-Z]{3}$'),
  ADD CONSTRAINT `fin_space_goals_label_check` CHECK (TRIM(`label`) <> ''),
  ADD CONSTRAINT `fin_space_goals_version_check` CHECK (`version` >= 1),
  ADD CONSTRAINT `fin_space_goals_target_check` CHECK (`target` > 0);

ALTER TABLE `fin_space_goal_contributions`
  ADD CONSTRAINT `fin_space_goal_contributions_currency_check` CHECK (`currency` REGEXP '^[A-Z]{3}$'),
  ADD CONSTRAINT `fin_space_goal_contributions_amount_check` CHECK (`amount` > 0);

ALTER TABLE `fin_children`
  ADD CONSTRAINT `fin_children_first_name_check` CHECK (TRIM(`firstName`) <> ''),
  -- A reasonable bound, not a precise one: minimal data means no birth date,
  -- and a year is enough to compute an age for the household's own planning.
  ADD CONSTRAINT `fin_children_birth_year_check` CHECK (`birthYear` BETWEEN 1900 AND 2100);

ALTER TABLE `fin_space_provisions`
  ADD CONSTRAINT `fin_space_provisions_currency_check` CHECK (`currency` REGEXP '^[A-Z]{3}$'),
  ADD CONSTRAINT `fin_space_provisions_label_check` CHECK (TRIM(`label`) <> ''),
  ADD CONSTRAINT `fin_space_provisions_version_check` CHECK (`version` >= 1),
  ADD CONSTRAINT `fin_space_provisions_planned_check` CHECK (`plannedAmount` > 0),
  ADD CONSTRAINT `fin_space_provisions_provisioned_check` CHECK (`alreadyProvisioned` >= 0);
