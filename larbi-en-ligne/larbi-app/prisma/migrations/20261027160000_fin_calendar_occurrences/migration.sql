-- P8-11 — Calendrier : compte, mode de création et règle de week-end des
-- récurrences ; occurrences traitées (confirmée, pas reçue, reportée).

-- AlterTable
ALTER TABLE `fin_recurrences` ADD COLUMN `accountId` VARCHAR(191) NULL,
    ADD COLUMN `creationMode` VARCHAR(12) NOT NULL DEFAULT 'confirm',
    ADD COLUMN `weekendRule` VARCHAR(10) NOT NULL DEFAULT 'previous';

-- CreateTable
CREATE TABLE `fin_occurrences` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `recurrenceId` VARCHAR(191) NOT NULL,
    `dueDate` DATETIME(3) NOT NULL,
    `outcome` VARCHAR(12) NOT NULL,
    `postponedTo` DATETIME(3) NULL,
    `transactionId` VARCHAR(191) NULL,
    `scope` VARCHAR(20) NOT NULL DEFAULT 'personal',
    `source` VARCHAR(20) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `confidence` VARCHAR(10) NULL,
    `consentUses` JSON NOT NULL,
    `effectiveAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `collectedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `version` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `fin_occurrences_userId_idx`(`userId`),
    UNIQUE INDEX `fin_occurrences_recurrenceId_dueDate_key`(`recurrenceId`, `dueDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `fin_occurrences` ADD CONSTRAINT `fin_occurrences_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_occurrences` ADD CONSTRAINT `fin_occurrences_recurrenceId_fkey` FOREIGN KEY (`recurrenceId`) REFERENCES `fin_recurrences`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_recurrences` ADD CONSTRAINT `fin_recurrences_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `fin_accounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;


ALTER TABLE `fin_recurrences`
  ADD CONSTRAINT `fin_recurrences_creation_check` CHECK (`creationMode` IN ('confirm', 'auto_real', 'planned')),
  ADD CONSTRAINT `fin_recurrences_weekend_check` CHECK (`weekendRule` IN ('previous', 'next', 'none'));
ALTER TABLE `fin_occurrences`
  ADD CONSTRAINT `fin_occurrences_outcome_check` CHECK (`outcome` IN ('confirmed', 'missed', 'postponed')),
  ADD CONSTRAINT `fin_occurrences_scope_check` CHECK (`scope` IN ('personal', 'couple', 'household', 'space')),
  ADD CONSTRAINT `fin_occurrences_source_check` CHECK (`source` IN ('manual', 'imported', 'document', 'partner', 'computed')),
  ADD CONSTRAINT `fin_occurrences_status_check` CHECK (`status` IN ('real', 'declared', 'imported', 'computed', 'official', 'to_confirm')),
  ADD CONSTRAINT `fin_occurrences_version_check` CHECK (`version` >= 1);
