-- FINCLUDIA real patrimony (P6-11), screens C16 / JA07, F035 / F036 / F037.
--
-- Assets only: the liabilities already have `fin_debts` (P6-10) and net worth
-- reads them there. A second table of liabilities would be two places to
-- correct the same debt.
--
-- « Le fictif est interdit ici » is the client's own sentence, and it is a CHECK
-- as well as a zod enum and a consistency rule: one fictional row inside F035
-- makes net worth a lie.

-- CreateTable
CREATE TABLE `fin_assets` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(80) NOT NULL,
    `kind` VARCHAR(20) NOT NULL,
    `categoryId` VARCHAR(191) NULL,
    `value` INTEGER NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `valuedAt` DATETIME(3) NOT NULL,
    `liquidity` VARCHAR(20) NOT NULL,
    `holder` VARCHAR(80) NULL,
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

    INDEX `fin_assets_userId_deletedAt_idx`(`userId`, `deletedAt`),
    INDEX `fin_assets_userId_valuedAt_idx`(`userId`, `valuedAt`),
    INDEX `fin_assets_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `fin_assets` ADD CONSTRAINT `fin_assets_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: SET NULL, never Restrict (the P6-04 lesson).
ALTER TABLE `fin_assets` ADD CONSTRAINT `fin_assets_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `fin_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `fin_assets`
  ADD CONSTRAINT `fin_assets_scope_check` CHECK (`scope` IN ('personal', 'couple', 'household', 'space')),
  ADD CONSTRAINT `fin_assets_source_check` CHECK (`source` IN ('manual', 'imported', 'document', 'partner', 'computed')),
  -- The forbidden status is absent from this list, on purpose: `fictional`
  -- cannot be stored in a real-patrimony row at all.
  ADD CONSTRAINT `fin_assets_status_check` CHECK (`status` IN ('real', 'declared', 'imported', 'computed', 'official', 'to_confirm')),
  ADD CONSTRAINT `fin_assets_confidence_check` CHECK (`confidence` IS NULL OR `confidence` IN ('high', 'medium', 'low')),
  ADD CONSTRAINT `fin_assets_currency_check` CHECK (`currency` REGEXP '^[A-Z]{3}$'),
  ADD CONSTRAINT `fin_assets_kind_check` CHECK (`kind` IN ('account', 'ccp', 'cash', 'gold', 'vehicle', 'property', 'investment', 'other')),
  ADD CONSTRAINT `fin_assets_liquidity_check` CHECK (`liquidity` IN ('liquid', 'semi_liquid', 'illiquid')),
  ADD CONSTRAINT `fin_assets_version_check` CHECK (`version` >= 1),
  ADD CONSTRAINT `fin_assets_label_check` CHECK (TRIM(`label`) <> ''),
  -- An asset worth nothing is not an asset; a negative one would be a debt, and
  -- debts have their own table.
  ADD CONSTRAINT `fin_assets_value_check` CHECK (`value` > 0);
