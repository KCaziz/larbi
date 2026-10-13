-- FINCLUDIA calendar and recurring expenses (P6-07), screens C23 / SA03 / SA04
-- / ET04 / FA04 and ALG-04.
--
-- Two tables, and deliberately not a third: a planned payment is already a
-- movement marked `planned` in `fin_transactions` (P6-04), so the calendar
-- reads it there. A second table of planned events would be exactly the double
-- counting the client forbids.
--
-- Both carry the metadata socle of P6-02, and every closed vocabulary gets its
-- SQL CHECK as well as its zod enum.

-- CreateTable
CREATE TABLE `fin_recurrences` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(80) NOT NULL,
    `categoryId` VARCHAR(191) NULL,
    `kind` VARCHAR(10) NOT NULL,
    `value` INTEGER NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `frequency` VARCHAR(20) NOT NULL,
    `nextDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `reminderDays` JSON NOT NULL,
    `detected` BOOLEAN NOT NULL DEFAULT false,
    `note` VARCHAR(300) NULL,
    `scope` VARCHAR(20) NOT NULL DEFAULT 'personal',
    `source` VARCHAR(20) NOT NULL,
    `sourceRef` VARCHAR(200) NULL,
    `status` VARCHAR(20) NOT NULL,
    `confidence` VARCHAR(10) NULL,
    `consentUses` JSON NOT NULL,
    `effectiveAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `collectedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `version` INTEGER NOT NULL DEFAULT 1,
    `archivedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `fin_recurrences_userId_nextDate_idx`(`userId`, `nextDate`),
    INDEX `fin_recurrences_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_provisions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(80) NOT NULL,
    `categoryId` VARCHAR(191) NULL,
    `value` INTEGER NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `provisioned` INTEGER NOT NULL DEFAULT 0,
    `targetDate` DATETIME(3) NOT NULL,
    `reminderDays` JSON NOT NULL,
    `note` VARCHAR(300) NULL,
    `scope` VARCHAR(20) NOT NULL DEFAULT 'personal',
    `source` VARCHAR(20) NOT NULL,
    `sourceRef` VARCHAR(200) NULL,
    `status` VARCHAR(20) NOT NULL,
    `confidence` VARCHAR(10) NULL,
    `consentUses` JSON NOT NULL,
    `effectiveAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `collectedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `version` INTEGER NOT NULL DEFAULT 1,
    `archivedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `fin_provisions_userId_targetDate_idx`(`userId`, `targetDate`),
    INDEX `fin_provisions_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `fin_recurrences` ADD CONSTRAINT `fin_recurrences_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: SET NULL, never Restrict (the P6-04 lesson) — losing a category
-- must never block erasing an account.
ALTER TABLE `fin_recurrences` ADD CONSTRAINT `fin_recurrences_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `fin_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_provisions` ADD CONSTRAINT `fin_provisions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_provisions` ADD CONSTRAINT `fin_provisions_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `fin_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `fin_recurrences`
  ADD CONSTRAINT `fin_recurrences_scope_check` CHECK (`scope` IN ('personal', 'couple', 'household', 'space')),
  ADD CONSTRAINT `fin_recurrences_source_check` CHECK (`source` IN ('manual', 'imported', 'document', 'partner', 'computed')),
  ADD CONSTRAINT `fin_recurrences_status_check` CHECK (`status` IN ('real', 'declared', 'imported', 'computed', 'fictional', 'official', 'to_confirm')),
  ADD CONSTRAINT `fin_recurrences_confidence_check` CHECK (`confidence` IS NULL OR `confidence` IN ('high', 'medium', 'low')),
  ADD CONSTRAINT `fin_recurrences_currency_check` CHECK (`currency` REGEXP '^[A-Z]{3}$'),
  ADD CONSTRAINT `fin_recurrences_kind_check` CHECK (`kind` IN ('income', 'expense')),
  ADD CONSTRAINT `fin_recurrences_frequency_check` CHECK (`frequency` IN ('hebdomadaire', 'mensuel', 'trimestriel', 'semestriel', 'annuel')),
  ADD CONSTRAINT `fin_recurrences_version_check` CHECK (`version` >= 1),
  ADD CONSTRAINT `fin_recurrences_label_check` CHECK (TRIM(`label`) <> ''),
  ADD CONSTRAINT `fin_recurrences_value_check` CHECK (`value` >= 0),
  ADD CONSTRAINT `fin_recurrences_dates_check` CHECK (`endDate` IS NULL OR `endDate` >= `nextDate`),
  ADD CONSTRAINT `fin_recurrences_reminders_check` CHECK (JSON_TYPE(`reminderDays`) = 'ARRAY');

ALTER TABLE `fin_provisions`
  ADD CONSTRAINT `fin_provisions_scope_check` CHECK (`scope` IN ('personal', 'couple', 'household', 'space')),
  ADD CONSTRAINT `fin_provisions_source_check` CHECK (`source` IN ('manual', 'imported', 'document', 'partner', 'computed')),
  ADD CONSTRAINT `fin_provisions_status_check` CHECK (`status` IN ('real', 'declared', 'imported', 'computed', 'fictional', 'official', 'to_confirm')),
  ADD CONSTRAINT `fin_provisions_confidence_check` CHECK (`confidence` IS NULL OR `confidence` IN ('high', 'medium', 'low')),
  ADD CONSTRAINT `fin_provisions_currency_check` CHECK (`currency` REGEXP '^[A-Z]{3}$'),
  ADD CONSTRAINT `fin_provisions_version_check` CHECK (`version` >= 1),
  ADD CONSTRAINT `fin_provisions_label_check` CHECK (TRIM(`label`) <> ''),
  ADD CONSTRAINT `fin_provisions_value_check` CHECK (`value` > 0),
  -- What has been set aside is never negative, and never more than the expense
  -- it is set aside for: past that, the provision is simply reached.
  ADD CONSTRAINT `fin_provisions_provisioned_check` CHECK (`provisioned` >= 0 AND `provisioned` <= `value`),
  ADD CONSTRAINT `fin_provisions_reminders_check` CHECK (JSON_TYPE(`reminderDays`) = 'ARRAY');
