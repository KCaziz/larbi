-- P9-05: common budgets per collective category and month.
ALTER TABLE `fin_shared_expenses` ADD COLUMN `collectiveCategory` VARCHAR(8) NULL;

CREATE TABLE `fin_space_budgets` (
  `id` VARCHAR(191) NOT NULL,
  `spaceId` VARCHAR(191) NOT NULL,
  `category` VARCHAR(8) NOT NULL,
  `period` VARCHAR(7) NOT NULL,
  `value` INTEGER NOT NULL,
  `setById` VARCHAR(191) NOT NULL,
  `version` INTEGER NOT NULL DEFAULT 1,
  `deletedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `fin_space_budgets_spaceId_period_idx`(`spaceId`, `period`),
  UNIQUE INDEX `fin_space_budgets_spaceId_category_period_key`(`spaceId`, `category`, `period`),
  PRIMARY KEY (`id`),
  CONSTRAINT `fin_space_budgets_value_check` CHECK (`value` >= 0),
  CONSTRAINT `fin_space_budgets_period_check` CHECK (`period` REGEXP '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  CONSTRAINT `fin_space_budgets_spaceId_fkey` FOREIGN KEY (`spaceId`) REFERENCES `fin_spaces`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
