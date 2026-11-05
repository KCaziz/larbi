-- P8-24: snapshots (kept monthly reports, monthly health index).
CREATE TABLE `fin_snapshots` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `kind` VARCHAR(10) NOT NULL,
  `period` VARCHAR(7) NOT NULL,
  `payload` JSON NOT NULL,
  `version` INTEGER NOT NULL DEFAULT 1,
  `capturedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `fin_snapshots_userId_kind_period_key`(`userId`, `kind`, `period`),
  PRIMARY KEY (`id`),
  CONSTRAINT `fin_snapshots_kind_check` CHECK (`kind` IN ('report', 'health')),
  CONSTRAINT `fin_snapshots_period_check` CHECK (`period` REGEXP '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  CONSTRAINT `fin_snapshots_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
