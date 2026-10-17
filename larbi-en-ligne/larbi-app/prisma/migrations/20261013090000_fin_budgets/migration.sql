-- FINCLUDIA budgets and envelopes (P6-05), screens C06 / JA03 / JA04.
--
-- Both tables carry the metadata socle of P6-02, and every closed vocabulary
-- gets its SQL CHECK as well as its zod enum (project convention): what the
-- database refuses and what validation refuses stay the same lists.
--
-- Two rules are deliberately NOT here: a budget's period must not overlap
-- another of the same account, and an envelope's currency must equal its
-- budget's. Both read a FOREIGN KEY column (`userId`, `budgetId`), which
-- MariaDB refuses inside a CHECK, so they live in finBudget.service.js and in
-- the consistency control — exactly like the media and category rules before
-- them.

-- CreateTable
CREATE TABLE `fin_budgets` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(80) NOT NULL,
    `periodStart` DATETIME(3) NOT NULL,
    `periodEnd` DATETIME(3) NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `recurrence` VARCHAR(20) NOT NULL DEFAULT 'monthly',
    `alertThresholds` JSON NOT NULL,
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

    INDEX `fin_budgets_userId_periodStart_idx`(`userId`, `periodStart`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_envelopes` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `budgetId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NULL,
    `kind` VARCHAR(10) NOT NULL,
    `value` INTEGER NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `cap` INTEGER NULL,
    `recurring` BOOLEAN NOT NULL DEFAULT true,
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

    INDEX `fin_envelopes_budgetId_idx`(`budgetId`),
    INDEX `fin_envelopes_userId_deletedAt_idx`(`userId`, `deletedAt`),
    INDEX `fin_envelopes_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `fin_budgets` ADD CONSTRAINT `fin_budgets_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_envelopes` ADD CONSTRAINT `fin_envelopes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: an envelope belongs to its budget and goes with it.
ALTER TABLE `fin_envelopes` ADD CONSTRAINT `fin_envelopes_budgetId_fkey` FOREIGN KEY (`budgetId`) REFERENCES `fin_budgets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: SET NULL, never Restrict (the P6-04 lesson) — losing a category
-- must never block erasing an account.
ALTER TABLE `fin_envelopes` ADD CONSTRAINT `fin_envelopes_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `fin_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- The socle's closed vocabularies, plus this task's own rules.
ALTER TABLE `fin_budgets`
  ADD CONSTRAINT `fin_budgets_scope_check` CHECK (`scope` IN ('personal', 'couple', 'household', 'space')),
  ADD CONSTRAINT `fin_budgets_source_check` CHECK (`source` IN ('manual', 'imported', 'document', 'partner', 'computed')),
  ADD CONSTRAINT `fin_budgets_status_check` CHECK (`status` IN ('real', 'declared', 'imported', 'computed', 'fictional', 'official', 'to_confirm')),
  ADD CONSTRAINT `fin_budgets_confidence_check` CHECK (`confidence` IS NULL OR `confidence` IN ('high', 'medium', 'low')),
  ADD CONSTRAINT `fin_budgets_currency_check` CHECK (`currency` REGEXP '^[A-Z]{3}$'),
  ADD CONSTRAINT `fin_budgets_recurrence_check` CHECK (`recurrence` IN ('none', 'monthly', 'quarterly', 'yearly')),
  ADD CONSTRAINT `fin_budgets_version_check` CHECK (`version` >= 1),
  ADD CONSTRAINT `fin_budgets_label_check` CHECK (TRIM(`label`) <> ''),
  -- A period of zero or negative length is not a period.
  ADD CONSTRAINT `fin_budgets_period_check` CHECK (`periodEnd` > `periodStart`),
  -- Thresholds are a list of ratios. The values themselves are checked by zod;
  -- what SQL can guarantee is that the column really holds an array.
  ADD CONSTRAINT `fin_budgets_thresholds_check` CHECK (JSON_TYPE(`alertThresholds`) = 'ARRAY');

ALTER TABLE `fin_envelopes`
  ADD CONSTRAINT `fin_envelopes_scope_check` CHECK (`scope` IN ('personal', 'couple', 'household', 'space')),
  ADD CONSTRAINT `fin_envelopes_source_check` CHECK (`source` IN ('manual', 'imported', 'document', 'partner', 'computed')),
  ADD CONSTRAINT `fin_envelopes_status_check` CHECK (`status` IN ('real', 'declared', 'imported', 'computed', 'fictional', 'official', 'to_confirm')),
  ADD CONSTRAINT `fin_envelopes_confidence_check` CHECK (`confidence` IS NULL OR `confidence` IN ('high', 'medium', 'low')),
  ADD CONSTRAINT `fin_envelopes_currency_check` CHECK (`currency` REGEXP '^[A-Z]{3}$'),
  ADD CONSTRAINT `fin_envelopes_kind_check` CHECK (`kind` IN ('fixed', 'variable')),
  ADD CONSTRAINT `fin_envelopes_version_check` CHECK (`version` >= 1),
  -- A planned amount is positive: the sign is carried by the envelope being an
  -- expense budget, exactly as a movement's sign is carried by its `kind`.
  ADD CONSTRAINT `fin_envelopes_value_check` CHECK (`value` >= 0),
  -- A ceiling below what the person already planned to spend would be a
  -- contradiction nobody could act on.
  ADD CONSTRAINT `fin_envelopes_cap_check` CHECK (`cap` IS NULL OR `cap` >= `value`);
