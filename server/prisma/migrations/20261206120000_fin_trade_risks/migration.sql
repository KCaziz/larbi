-- P13-05, lot D bis (2026-11-25) - the register of international trade risks
-- (02_ECRANS ECR-0370: country, counterparty, transport; level = probability x
-- impact on a versioned scale; measures and reviews) and the exchange scenarios
-- kept on a diaspora project (ECR-0378).

CREATE TABLE `fin_business_risks` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `operationId` VARCHAR(191) NULL,
    `category` VARCHAR(20) NOT NULL,
    `country` VARCHAR(80) NULL,
    `counterparty` VARCHAR(255) NOT NULL,
    `description` VARCHAR(500) NULL,
    `probability` INTEGER NOT NULL,
    `impact` INTEGER NOT NULL,
    `exposure` DOUBLE NULL,
    `guaranteedAmount` DOUBLE NULL,
    `currency` VARCHAR(3) NULL,
    `guarantee` VARCHAR(255) NULL,
    `evidenceRef` VARCHAR(255) NULL,
    `reviewAt` DATETIME(3) NOT NULL,
    `status` VARCHAR(10) NOT NULL DEFAULT 'open',
    `scaleVersion` INTEGER NOT NULL DEFAULT 1,
    `version` INTEGER NOT NULL DEFAULT 1,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `fin_business_risks_businessId_status_idx`(`businessId`, `status`),
    INDEX `fin_business_risks_operationId_idx`(`operationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_business_risks` ADD CONSTRAINT `chk_business_risk_values` CHECK (`category` IN ('country', 'counterparty', 'transport', 'payment', 'currency', 'other') AND `probability` BETWEEN 1 AND 5 AND `impact` BETWEEN 1 AND 5 AND `status` IN ('open', 'closed') AND (`exposure` IS NULL OR `exposure` >= 0) AND (`guaranteedAmount` IS NULL OR `guaranteedAmount` >= 0));
ALTER TABLE `fin_business_risks` ADD CONSTRAINT `fin_business_risks_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_business_risks` ADD CONSTRAINT `fin_business_risks_operationId_fkey` FOREIGN KEY (`operationId`) REFERENCES `fin_business_operations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE `fin_business_risk_actions` (
    `id` VARCHAR(191) NOT NULL,
    `riskId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(255) NOT NULL,
    `ownerName` VARCHAR(160) NOT NULL,
    `dueAt` DATETIME(3) NULL,
    `doneAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fin_business_risk_actions_riskId_idx`(`riskId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_business_risk_actions` ADD CONSTRAINT `fin_business_risk_actions_riskId_fkey` FOREIGN KEY (`riskId`) REFERENCES `fin_business_risks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `fin_business_risk_reviews` (
    `id` VARCHAR(191) NOT NULL,
    `riskId` VARCHAR(191) NOT NULL,
    `probability` INTEGER NOT NULL,
    `impact` INTEGER NOT NULL,
    `level` INTEGER NOT NULL,
    `note` VARCHAR(300) NULL,
    `evidenceRef` VARCHAR(255) NULL,
    `reviewedById` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fin_business_risk_reviews_riskId_idx`(`riskId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_business_risk_reviews` ADD CONSTRAINT `fin_business_risk_reviews_riskId_fkey` FOREIGN KEY (`riskId`) REFERENCES `fin_business_risks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `fin_business_fx_scenarios` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(160) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `fromCurrency` VARCHAR(3) NOT NULL,
    `toCurrency` VARCHAR(3) NOT NULL,
    `referenceRate` DOUBLE NOT NULL,
    `referenceDate` DATETIME(3) NOT NULL,
    `rateSource` VARCHAR(120) NULL,
    `rates` JSON NOT NULL,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fin_business_fx_scenarios_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_business_fx_scenarios` ADD CONSTRAINT `chk_business_fx_scenario` CHECK (`amount` > 0 AND `referenceRate` > 0);
ALTER TABLE `fin_business_fx_scenarios` ADD CONSTRAINT `fin_business_fx_scenarios_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_business_fx_scenarios` ADD CONSTRAINT `fin_business_fx_scenarios_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `fin_business_projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
