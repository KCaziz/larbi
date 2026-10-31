-- P9-09: what comes into the common pot of a space (client rule A1).
CREATE TABLE `fin_space_inflows` (
  `id` VARCHAR(191) NOT NULL,
  `spaceId` VARCHAR(191) NOT NULL,
  `kind` VARCHAR(12) NOT NULL,
  `memberId` VARCHAR(191) NULL,
  `value` INTEGER NOT NULL,
  `occurredAt` DATETIME(3) NOT NULL,
  `status` VARCHAR(10) NOT NULL DEFAULT 'confirmed',
  `note` VARCHAR(300) NULL,
  `recordedById` VARCHAR(191) NOT NULL,
  `version` INTEGER NOT NULL DEFAULT 1,
  `deletedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `fin_space_inflows_spaceId_status_idx`(`spaceId`, `status`),
  PRIMARY KEY (`id`),
  CONSTRAINT `fin_space_inflows_value_check` CHECK (`value` > 0),
  CONSTRAINT `fin_space_inflows_kind_check` CHECK (`kind` IN ('opening', 'contribution', 'other')),
  CONSTRAINT `fin_space_inflows_status_check` CHECK (`status` IN ('planned', 'confirmed')),
  CONSTRAINT `fin_space_inflows_spaceId_fkey` FOREIGN KEY (`spaceId`) REFERENCES `fin_spaces`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
