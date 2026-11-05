-- P8-15, the client's answer D5 (2026-10-28): the payslip decoder keeps a
-- history — of the payslips the person chose to keep, and only those.

-- CreateTable
CREATE TABLE `fin_payslips` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `period` VARCHAR(20) NULL,
    `lines` JSON NOT NULL,
    `gross` INTEGER NOT NULL,
    `value` INTEGER NOT NULL,
    `declaredNet` INTEGER NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'DZD',
    `scope` VARCHAR(20) NOT NULL DEFAULT 'personal',
    `source` VARCHAR(20) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `confidence` VARCHAR(10) NULL,
    `consentUses` JSON NOT NULL DEFAULT ('[]'),
    `effectiveAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `collectedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `version` INTEGER NOT NULL DEFAULT 1,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `fin_payslips_userId_deletedAt_idx`(`userId`, `deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `fin_payslips` ADD CONSTRAINT `fin_payslips_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
