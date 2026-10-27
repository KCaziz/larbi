-- P8-07 — Mouvements : étiquettes, payeur, lieu, pointage, et les moyens de
-- paiement du client (PM-01 à PM-10, onglet `05B_Moyens_Paiement`) à la place
-- de la liste provisoire de P6-04.

-- CreateTable
CREATE TABLE `fin_tags` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(40) NOT NULL,
    `color` VARCHAR(9) NOT NULL,
    `autoCategoryId` VARCHAR(191) NULL,
    `scope` VARCHAR(20) NOT NULL DEFAULT 'personal',
    `source` VARCHAR(20) NOT NULL,
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

    INDEX `fin_tags_userId_deletedAt_idx`(`userId`, `deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `fin_tags`
  ADD CONSTRAINT `fin_tags_name_check` CHECK (TRIM(`name`) <> ''),
  ADD CONSTRAINT `fin_tags_color_check` CHECK (`color` REGEXP '^#[0-9A-Fa-f]{6}$'),
  ADD CONSTRAINT `fin_tags_scope_check` CHECK (`scope` IN ('personal', 'couple', 'household', 'space')),
  ADD CONSTRAINT `fin_tags_source_check` CHECK (`source` IN ('manual', 'imported', 'document', 'partner', 'computed')),
  ADD CONSTRAINT `fin_tags_status_check` CHECK (`status` IN ('real', 'declared', 'imported', 'computed', 'official', 'to_confirm')),
  ADD CONSTRAINT `fin_tags_version_check` CHECK (`version` >= 1);

-- AlterTable
ALTER TABLE `fin_transactions` ADD COLUMN `clearing` VARCHAR(12) NOT NULL DEFAULT 'unchecked',
    ADD COLUMN `payer` VARCHAR(80) NULL,
    ADD COLUMN `place` VARCHAR(120) NULL,
    ADD COLUMN `tagId` VARCHAR(191) NULL;

-- The provisional list becomes the client's: each old value to its PM code.
-- « ccp » was an account, not an instrument: a CCP payment is a transfer.
ALTER TABLE `fin_transactions` DROP CONSTRAINT `fin_transactions_payment_check`;
UPDATE `fin_transactions` SET `paymentMethod` = CASE `paymentMethod`
  WHEN 'cash' THEN 'PM-01'
  WHEN 'card' THEN 'PM-02'
  WHEN 'transfer' THEN 'PM-04'
  WHEN 'ccp' THEN 'PM-04'
  WHEN 'cheque' THEN 'PM-09'
  WHEN 'other' THEN 'PM-10'
  ELSE `paymentMethod` END
WHERE `paymentMethod` IS NOT NULL;
ALTER TABLE `fin_transactions`
  ADD CONSTRAINT `fin_transactions_payment_check` CHECK (`paymentMethod` IS NULL OR `paymentMethod` IN ('PM-01', 'PM-02', 'PM-03', 'PM-04', 'PM-05', 'PM-06', 'PM-07', 'PM-08', 'PM-09', 'PM-10')),
  ADD CONSTRAINT `fin_transactions_clearing_check` CHECK (`clearing` IN ('unchecked', 'checked', 'reconciled', 'to_verify'));

-- AddForeignKey
ALTER TABLE `fin_tags` ADD CONSTRAINT `fin_tags_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_tags` ADD CONSTRAINT `fin_tags_autoCategoryId_fkey` FOREIGN KEY (`autoCategoryId`) REFERENCES `fin_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `fin_transactions` ADD CONSTRAINT `fin_transactions_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `fin_tags`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX `fin_transactions_tagId_idx` ON `fin_transactions`(`tagId`);
