-- AlterTable
ALTER TABLE `users` ADD COLUMN `finReserveTargetMonths` INTEGER NULL;

-- CreateTable
CREATE TABLE `fin_goals` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(80) NOT NULL,
    `templateKey` VARCHAR(40) NULL,
    `target` INTEGER NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `targetDate` DATETIME(3) NULL,
    `allocated` INTEGER NOT NULL DEFAULT 0,
    `monthlyContribution` INTEGER NULL,
    `rate` DOUBLE NULL,
    `priority` INTEGER NOT NULL DEFAULT 0,
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

    INDEX `fin_goals_userId_deletedAt_idx`(`userId`, `deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_debts` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(80) NOT NULL,
    `lender` VARCHAR(120) NULL,
    `purpose` VARCHAR(200) NULL,
    `assetFinanced` VARCHAR(120) NULL,
    `outstandingPrincipal` INTEGER NOT NULL,
    `monthlyInstalment` INTEGER NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `rate` DOUBLE NULL,
    `knownTotalCost` INTEGER NULL,
    `dueDate` DATETIME(3) NULL,
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

    INDEX `fin_debts_userId_deletedAt_idx`(`userId`, `deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_debt_payments` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `debtId` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `paidAt` DATETIME(3) NOT NULL,
    `note` VARCHAR(300) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,

    INDEX `fin_debt_payments_debtId_idx`(`debtId`),
    INDEX `fin_debt_payments_userId_deletedAt_idx`(`userId`, `deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `fin_goals` ADD CONSTRAINT `fin_goals_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_debts` ADD CONSTRAINT `fin_debts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_debt_payments` ADD CONSTRAINT `fin_debt_payments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_debt_payments` ADD CONSTRAINT `fin_debt_payments_debtId_fkey` FOREIGN KEY (`debtId`) REFERENCES `fin_debts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- CheckConstraint (hand-written: MariaDB refuses a CHECK on a FOREIGN KEY column)
ALTER TABLE `users`
  ADD CONSTRAINT `users_finReserveTargetMonths_check` CHECK (`finReserveTargetMonths` IS NULL OR `finReserveTargetMonths` >= 0);

ALTER TABLE `fin_goals`
  ADD CONSTRAINT `fin_goals_scope_check` CHECK (`scope` IN ('personal', 'couple', 'household', 'space')),
  ADD CONSTRAINT `fin_goals_source_check` CHECK (`source` IN ('manual', 'imported', 'document', 'partner', 'computed')),
  ADD CONSTRAINT `fin_goals_status_check` CHECK (`status` IN ('real', 'declared', 'imported', 'computed', 'fictional', 'official', 'to_confirm')),
  ADD CONSTRAINT `fin_goals_confidence_check` CHECK (`confidence` IS NULL OR `confidence` IN ('high', 'medium', 'low')),
  ADD CONSTRAINT `fin_goals_currency_check` CHECK (`currency` REGEXP '^[A-Z]{3}$'),
  ADD CONSTRAINT `fin_goals_version_check` CHECK (`version` >= 1),
  ADD CONSTRAINT `fin_goals_label_check` CHECK (TRIM(`label`) <> ''),
  ADD CONSTRAINT `fin_goals_target_check` CHECK (`target` > 0),
  ADD CONSTRAINT `fin_goals_allocated_check` CHECK (`allocated` >= 0),
  ADD CONSTRAINT `fin_goals_priority_check` CHECK (`priority` >= 0),
  ADD CONSTRAINT `fin_goals_monthly_contribution_check` CHECK (`monthlyContribution` IS NULL OR `monthlyContribution` >= 0),
  ADD CONSTRAINT `fin_goals_rate_check` CHECK (`rate` IS NULL OR (`rate` >= 0 AND `rate` <= 1)),
  ADD CONSTRAINT `fin_goals_consent_uses_check` CHECK (JSON_TYPE(`consentUses`) = 'ARRAY');

ALTER TABLE `fin_debts`
  ADD CONSTRAINT `fin_debts_scope_check` CHECK (`scope` IN ('personal', 'couple', 'household', 'space')),
  ADD CONSTRAINT `fin_debts_source_check` CHECK (`source` IN ('manual', 'imported', 'document', 'partner', 'computed')),
  ADD CONSTRAINT `fin_debts_status_check` CHECK (`status` IN ('real', 'declared', 'imported', 'computed', 'fictional', 'official', 'to_confirm')),
  ADD CONSTRAINT `fin_debts_confidence_check` CHECK (`confidence` IS NULL OR `confidence` IN ('high', 'medium', 'low')),
  ADD CONSTRAINT `fin_debts_currency_check` CHECK (`currency` REGEXP '^[A-Z]{3}$'),
  ADD CONSTRAINT `fin_debts_version_check` CHECK (`version` >= 1),
  ADD CONSTRAINT `fin_debts_label_check` CHECK (TRIM(`label`) <> ''),
  ADD CONSTRAINT `fin_debts_outstanding_check` CHECK (`outstandingPrincipal` >= 0),
  ADD CONSTRAINT `fin_debts_instalment_check` CHECK (`monthlyInstalment` >= 0),
  ADD CONSTRAINT `fin_debts_known_cost_check` CHECK (`knownTotalCost` IS NULL OR `knownTotalCost` >= 0),
  ADD CONSTRAINT `fin_debts_rate_check` CHECK (`rate` IS NULL OR (`rate` >= 0 AND `rate` <= 1)),
  ADD CONSTRAINT `fin_debts_consent_uses_check` CHECK (JSON_TYPE(`consentUses`) = 'ARRAY');

ALTER TABLE `fin_debt_payments`
  ADD CONSTRAINT `fin_debt_payments_currency_check` CHECK (`currency` REGEXP '^[A-Z]{3}$'),
  ADD CONSTRAINT `fin_debt_payments_amount_check` CHECK (`amount` > 0);
