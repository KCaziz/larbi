-- P13-05, lot C (2026-11-23): spend, stock, steer. Expenses classified by
-- family and nature, stock by lot (CNV-16), budgets by family and month, and
-- the declared cash balances the 13-week plan starts from.

-- A purchase says what it pays for, and whether it is a fixed or a variable
-- charge (the break-even point needs both). The families are FINCLUDIA's own
-- list (constants/finBusiness.js), not an accounting plan.
ALTER TABLE `fin_business_documents`
    ADD COLUMN `category` VARCHAR(30) NULL,
    ADD COLUMN `costNature` VARCHAR(10) NULL;
ALTER TABLE `fin_business_documents` ADD CONSTRAINT `chk_document_category` CHECK (`category` IS NULL OR `category` IN ('marchandises', 'matieres', 'sous_traitance', 'loyer', 'salaires', 'charges_sociales', 'energie', 'telecom', 'transport', 'honoraires', 'assurance', 'entretien', 'marketing', 'banque', 'impots_taxes', 'equipement', 'autre'));
ALTER TABLE `fin_business_documents` ADD CONSTRAINT `chk_document_cost_nature` CHECK (`costNature` IS NULL OR `costNature` IN ('fixed', 'variable'));

-- What the organisation keeps in stock.
CREATE TABLE `fin_business_items` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(160) NOT NULL,
    `unit` VARCHAR(20) NOT NULL,
    `reference` VARCHAR(60) NULL,
    `archivedAt` DATETIME(3) NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `fin_business_items_businessId_name_key`(`businessId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_business_items` ADD CONSTRAINT `fin_business_items_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Stock movements, by lot (CNV-16). An entry (`in`) IS a lot: its received
-- quantity and its total cost. Losses and exits name the lot they come from.
-- Net quantity = received − losses; unit cost = total cost / net quantity;
-- what remains = net − exits. No valuation method is assumed (P7-04): each
-- lot keeps its own cost.
CREATE TABLE `fin_business_stock_moves` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `lotId` VARCHAR(191) NULL,
    `kind` VARCHAR(10) NOT NULL,
    `lotRef` VARCHAR(60) NULL,
    `quantity` DOUBLE NOT NULL,
    `totalCost` DOUBLE NULL,
    `movedAt` DATETIME(3) NOT NULL,
    `documentId` VARCHAR(191) NULL,
    `note` VARCHAR(300) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fin_business_stock_moves_businessId_idx`(`businessId`),
    INDEX `fin_business_stock_moves_itemId_idx`(`itemId`),
    INDEX `fin_business_stock_moves_lotId_idx`(`lotId`),
    INDEX `fin_business_stock_moves_documentId_idx`(`documentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_business_stock_moves` ADD CONSTRAINT `fin_business_stock_moves_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_business_stock_moves` ADD CONSTRAINT `fin_business_stock_moves_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `fin_business_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_business_stock_moves` ADD CONSTRAINT `fin_business_stock_moves_lotId_fkey` FOREIGN KEY (`lotId`) REFERENCES `fin_business_stock_moves`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `fin_business_stock_moves` ADD CONSTRAINT `fin_business_stock_moves_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `fin_business_documents`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `fin_business_stock_moves` ADD CONSTRAINT `chk_stock_kind` CHECK (`kind` IN ('in', 'out', 'loss'));
ALTER TABLE `fin_business_stock_moves` ADD CONSTRAINT `chk_stock_quantity` CHECK (`quantity` > 0);
ALTER TABLE `fin_business_stock_moves` ADD CONSTRAINT `chk_stock_cost` CHECK ((`kind` = 'in' AND `totalCost` IS NOT NULL AND `totalCost` >= 0) OR (`kind` <> 'in' AND `totalCost` IS NULL));

-- A budget: one family, one month, one amount excluding tax.
CREATE TABLE `fin_business_budgets` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `category` VARCHAR(30) NOT NULL,
    `month` CHAR(7) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `fin_business_budgets_businessId_category_month_key`(`businessId`, `category`, `month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_business_budgets` ADD CONSTRAINT `fin_business_budgets_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_business_budgets` ADD CONSTRAINT `chk_budget_amount` CHECK (`amount` >= 0);
ALTER TABLE `fin_business_budgets` ADD CONSTRAINT `chk_budget_month` CHECK (`month` REGEXP '^[0-9]{4}-(0[1-9]|1[0-2])$');
ALTER TABLE `fin_business_budgets` ADD CONSTRAINT `chk_budget_category` CHECK (`category` IN ('marchandises', 'matieres', 'sous_traitance', 'loyer', 'salaires', 'charges_sociales', 'energie', 'telecom', 'transport', 'honoraires', 'assurance', 'entretien', 'marketing', 'banque', 'impots_taxes', 'equipement', 'autre'));

-- The cash the organisation really holds at a date, as read on its accounts
-- (« solde initial rapproché »). The 13-week plan starts from the latest one.
-- It may be negative: an overdraft is a balance too.
CREATE TABLE `fin_business_cash_positions` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `observedAt` DATETIME(3) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `note` VARCHAR(300) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fin_business_cash_positions_businessId_observedAt_idx`(`businessId`, `observedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_business_cash_positions` ADD CONSTRAINT `fin_business_cash_positions_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
