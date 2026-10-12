-- CreateTable
CREATE TABLE `fin_incomes` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(80) NOT NULL,
    `categoryId` VARCHAR(191) NULL,
    `value` INTEGER NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `frequency` VARCHAR(20) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
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

    INDEX `fin_incomes_userId_deletedAt_idx`(`userId`, `deletedAt`),
    INDEX `fin_incomes_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_transactions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(10) NOT NULL,
    `value` INTEGER NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `occurredAt` DATETIME(3) NOT NULL,
    `categoryId` VARCHAR(191) NULL,
    `subcategory` VARCHAR(60) NULL,
    `paymentMethod` VARCHAR(20) NULL,
    `note` VARCHAR(300) NULL,
    `shared` BOOLEAN NOT NULL DEFAULT false,
    `planned` BOOLEAN NOT NULL DEFAULT false,
    `receiptId` VARCHAR(191) NULL,
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

    UNIQUE INDEX `fin_transactions_receiptId_key`(`receiptId`),
    INDEX `fin_transactions_userId_occurredAt_idx`(`userId`, `occurredAt`),
    INDEX `fin_transactions_userId_kind_value_occurredAt_idx`(`userId`, `kind`, `value`, `occurredAt`),
    INDEX `fin_transactions_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_onboardings` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `answers` JSON NOT NULL,
    `fictional` BOOLEAN NOT NULL DEFAULT false,
    `completedAt` DATETIME(3) NULL,
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

    UNIQUE INDEX `fin_onboardings_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `fin_incomes` ADD CONSTRAINT `fin_incomes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_incomes` ADD CONSTRAINT `fin_incomes_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `fin_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_transactions` ADD CONSTRAINT `fin_transactions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_transactions` ADD CONSTRAINT `fin_transactions_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `fin_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_transactions` ADD CONSTRAINT `fin_transactions_receiptId_fkey` FOREIGN KEY (`receiptId`) REFERENCES `media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_onboardings` ADD CONSTRAINT `fin_onboardings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Closed vocabularies get their SQL CHECK too (project convention). The socle
-- columns repeat the same four lists as `fin_categories`; what is specific to
-- these tables is the movement type, the payment method, the frequency, and the
-- two rules below that SQL can express on its own.
ALTER TABLE `fin_incomes`
  ADD CONSTRAINT `fin_incomes_scope_check` CHECK (`scope` IN ('personal', 'couple', 'household', 'space')),
  ADD CONSTRAINT `fin_incomes_source_check` CHECK (`source` IN ('manual', 'imported', 'document', 'partner', 'computed')),
  ADD CONSTRAINT `fin_incomes_status_check` CHECK (`status` IN ('real', 'declared', 'imported', 'computed', 'fictional', 'official', 'to_confirm')),
  ADD CONSTRAINT `fin_incomes_confidence_check` CHECK (`confidence` IS NULL OR `confidence` IN ('high', 'medium', 'low')),
  ADD CONSTRAINT `fin_incomes_frequency_check` CHECK (`frequency` IN ('hebdomadaire', 'mensuel', 'trimestriel', 'semestriel', 'annuel')),
  ADD CONSTRAINT `fin_incomes_currency_check` CHECK (`currency` REGEXP '^[A-Z]{3}$'),
  ADD CONSTRAINT `fin_incomes_version_check` CHECK (`version` >= 1),
  ADD CONSTRAINT `fin_incomes_label_check` CHECK (TRIM(`label`) <> ''),
  -- A resource that ends before it starts is not a period.
  ADD CONSTRAINT `fin_incomes_dates_check` CHECK (`endDate` IS NULL OR `endDate` >= `startDate`);

ALTER TABLE `fin_transactions`
  ADD CONSTRAINT `fin_transactions_kind_check` CHECK (`kind` IN ('income', 'expense')),
  ADD CONSTRAINT `fin_transactions_scope_check` CHECK (`scope` IN ('personal', 'couple', 'household', 'space')),
  ADD CONSTRAINT `fin_transactions_source_check` CHECK (`source` IN ('manual', 'imported', 'document', 'partner', 'computed')),
  ADD CONSTRAINT `fin_transactions_status_check` CHECK (`status` IN ('real', 'declared', 'imported', 'computed', 'fictional', 'official', 'to_confirm')),
  ADD CONSTRAINT `fin_transactions_confidence_check` CHECK (`confidence` IS NULL OR `confidence` IN ('high', 'medium', 'low')),
  ADD CONSTRAINT `fin_transactions_payment_check` CHECK (`paymentMethod` IS NULL OR `paymentMethod` IN ('cash', 'card', 'transfer', 'cheque', 'ccp', 'other')),
  ADD CONSTRAINT `fin_transactions_currency_check` CHECK (`currency` REGEXP '^[A-Z]{3}$'),
  ADD CONSTRAINT `fin_transactions_version_check` CHECK (`version` >= 1),
  -- Only a PLANNED EXPENSE may be dated in the future (client's rule, screen
  -- C08). The date itself is compared in the application, where "now" is known;
  -- what SQL can state is that a future date is never a planned income.
  ADD CONSTRAINT `fin_transactions_planned_check` CHECK (`planned` = FALSE OR `kind` = 'expense');

ALTER TABLE `fin_onboardings`
  ADD CONSTRAINT `fin_onboardings_scope_check` CHECK (`scope` IN ('personal', 'couple', 'household', 'space')),
  ADD CONSTRAINT `fin_onboardings_source_check` CHECK (`source` IN ('manual', 'imported', 'document', 'partner', 'computed')),
  ADD CONSTRAINT `fin_onboardings_status_check` CHECK (`status` IN ('real', 'declared', 'imported', 'computed', 'fictional', 'official', 'to_confirm')),
  ADD CONSTRAINT `fin_onboardings_confidence_check` CHECK (`confidence` IS NULL OR `confidence` IN ('high', 'medium', 'low')),
  ADD CONSTRAINT `fin_onboardings_currency_check` CHECK (`currency` REGEXP '^[A-Z]{3}$'),
  ADD CONSTRAINT `fin_onboardings_version_check` CHECK (`version` >= 1),
  -- A fictional onboarding is fictional in its status too: that is what keeps
  -- its figures out of every real total.
  ADD CONSTRAINT `fin_onboardings_fictional_check` CHECK (`fictional` = FALSE OR `status` = 'fictional');
