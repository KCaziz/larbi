-- P13-05, lot E (2026-11-24): the diaspora (PUB-10), as the client's screens
-- ECR-0372 to ECR-0381 describe it — projects in Algeria followed from
-- abroad, their budget, weighted milestones, expenses justified and validated
-- by a second person (DEC-018, CNV-13), access by project and in time
-- (CNV-14), and a multi-currency patrimony whose history is never
-- overwritten. FINCLUDIA moves no money (DEC-016).

CREATE TABLE `fin_business_projects` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(160) NOT NULL,
    `nature` VARCHAR(20) NOT NULL,
    `location` VARCHAR(160) NULL,
    `managerName` VARCHAR(160) NULL,
    `budget` DOUBLE NOT NULL,
    `currency` CHAR(3) NOT NULL,
    `fundsConfirmed` DOUBLE NOT NULL DEFAULT 0,
    `targetAt` DATETIME(3) NULL,
    `status` VARCHAR(12) NOT NULL DEFAULT 'planned',
    `note` VARCHAR(300) NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `fin_business_projects_businessId_idx`(`businessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_business_projects` ADD CONSTRAINT `fin_business_projects_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_business_projects` ADD CONSTRAINT `chk_project_nature` CHECK (`nature` IN ('construction', 'immobilier', 'agriculture', 'commerce', 'industrie', 'services', 'autre'));
ALTER TABLE `fin_business_projects` ADD CONSTRAINT `chk_project_status` CHECK (`status` IN ('planned', 'active', 'done', 'cancelled'));
ALTER TABLE `fin_business_projects` ADD CONSTRAINT `chk_project_amounts` CHECK (`budget` >= 0 AND `fundsConfirmed` >= 0);
ALTER TABLE `fin_business_projects` ADD CONSTRAINT `chk_project_currency` CHECK (`currency` REGEXP '^[A-Z]{3}$');

-- A milestone: its weight in the progress, and its proof. « Declared done »
-- by whoever works on it, « accepted » by the one who manages the project:
-- accepted progress is not spent money (ECR-0375).
CREATE TABLE `fin_business_project_milestones` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(200) NOT NULL,
    `weight` INTEGER NOT NULL,
    `dueAt` DATETIME(3) NULL,
    `status` VARCHAR(12) NOT NULL DEFAULT 'planned',
    `proofRef` VARCHAR(160) NULL,
    `declaredById` VARCHAR(191) NULL,
    `decidedById` VARCHAR(191) NULL,
    `decidedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `fin_business_project_milestones_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_business_project_milestones` ADD CONSTRAINT `fin_business_project_milestones_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `fin_business_projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_business_project_milestones` ADD CONSTRAINT `chk_milestone_weight` CHECK (`weight` BETWEEN 1 AND 100);
ALTER TABLE `fin_business_project_milestones` ADD CONSTRAINT `chk_milestone_status` CHECK (`status` IN ('planned', 'declared', 'accepted', 'rejected'));

-- An expense of the project (DEC-018): declared is not paid, a submitted proof
-- is not an accepted one. « To justify » until a proof is given; « validated »
-- only by another person than the one who declared it.
CREATE TABLE `fin_business_project_expenses` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(200) NOT NULL,
    `supplier` VARCHAR(160) NULL,
    `amount` DOUBLE NOT NULL,
    `currency` CHAR(3) NOT NULL,
    `rate` DOUBLE NULL,
    `rateDate` DATETIME(3) NULL,
    `rateSource` VARCHAR(120) NULL,
    `spentAt` DATETIME(3) NOT NULL,
    `proofRef` VARCHAR(160) NULL,
    `status` VARCHAR(12) NOT NULL DEFAULT 'to_justify',
    `createdById` VARCHAR(191) NOT NULL,
    `validatedById` VARCHAR(191) NULL,
    `validatedAt` DATETIME(3) NULL,
    `rejectionNote` VARCHAR(300) NULL,
    `paidAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `fin_business_project_expenses_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_business_project_expenses` ADD CONSTRAINT `fin_business_project_expenses_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `fin_business_projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_business_project_expenses` ADD CONSTRAINT `chk_project_expense_status` CHECK (`status` IN ('to_justify', 'submitted', 'validated', 'rejected'));
ALTER TABLE `fin_business_project_expenses` ADD CONSTRAINT `chk_project_expense_amount` CHECK (`amount` >= 0);
ALTER TABLE `fin_business_project_expenses` ADD CONSTRAINT `chk_project_expense_rate` CHECK (`rate` IS NULL OR (`rate` > 0 AND `rateDate` IS NOT NULL AND `rateSource` IS NOT NULL));
-- Two people: whoever declared an expense does not validate it.
ALTER TABLE `fin_business_project_expenses` ADD CONSTRAINT `chk_project_expense_two_people` CHECK (`validatedById` IS NULL OR `validatedById` <> `createdById`);
ALTER TABLE `fin_business_project_expenses` ADD CONSTRAINT `chk_project_expense_proof` CHECK (`status` NOT IN ('submitted', 'validated') OR `proofRef` IS NOT NULL);

-- Access to ONE project, for a member, for a purpose, until a date (CNV-14):
-- never a general access to the patrimony.
CREATE TABLE `fin_business_project_shares` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `memberId` VARCHAR(191) NOT NULL,
    `access` VARCHAR(12) NOT NULL,
    `purpose` VARCHAR(200) NOT NULL,
    `endsAt` DATETIME(3) NULL,
    `revokedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fin_business_project_shares_projectId_idx`(`projectId`),
    INDEX `fin_business_project_shares_memberId_idx`(`memberId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_business_project_shares` ADD CONSTRAINT `fin_business_project_shares_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `fin_business_projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_business_project_shares` ADD CONSTRAINT `fin_business_project_shares_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `fin_organization_members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_business_project_shares` ADD CONSTRAINT `chk_project_share_access` CHECK (`access` IN ('read', 'contribute'));

-- The patrimony across countries (ECR-0372, ECR-0373): an asset or a debt,
-- in its country and currency; each valuation is a new row, dated, with its
-- mode (declared, estimated, verified) — never overwritten.
CREATE TABLE `fin_business_holdings` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(8) NOT NULL,
    `category` VARCHAR(20) NOT NULL,
    `label` VARCHAR(160) NOT NULL,
    `country` CHAR(2) NOT NULL,
    `currency` CHAR(3) NOT NULL,
    `archivedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fin_business_holdings_businessId_idx`(`businessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_business_holdings` ADD CONSTRAINT `fin_business_holdings_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_business_holdings` ADD CONSTRAINT `chk_holding_kind` CHECK (`kind` IN ('asset', 'debt'));
ALTER TABLE `fin_business_holdings` ADD CONSTRAINT `chk_holding_category` CHECK (`category` IN ('immobilier', 'terrain', 'compte', 'placement', 'entreprise', 'vehicule', 'pret', 'autre'));
ALTER TABLE `fin_business_holdings` ADD CONSTRAINT `chk_holding_country` CHECK (`country` REGEXP '^[A-Z]{2}$');
ALTER TABLE `fin_business_holdings` ADD CONSTRAINT `chk_holding_currency` CHECK (`currency` REGEXP '^[A-Z]{3}$');

CREATE TABLE `fin_business_holding_values` (
    `id` VARCHAR(191) NOT NULL,
    `holdingId` VARCHAR(191) NOT NULL,
    `value` DOUBLE NOT NULL,
    `valuedAt` DATETIME(3) NOT NULL,
    `mode` VARCHAR(10) NOT NULL,
    `rate` DOUBLE NULL,
    `rateDate` DATETIME(3) NULL,
    `rateSource` VARCHAR(120) NULL,
    `proofRef` VARCHAR(160) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fin_business_holding_values_holdingId_idx`(`holdingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_business_holding_values` ADD CONSTRAINT `fin_business_holding_values_holdingId_fkey` FOREIGN KEY (`holdingId`) REFERENCES `fin_business_holdings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_business_holding_values` ADD CONSTRAINT `chk_holding_value` CHECK (`value` >= 0);
ALTER TABLE `fin_business_holding_values` ADD CONSTRAINT `chk_holding_mode` CHECK (`mode` IN ('declared', 'estimated', 'verified'));
ALTER TABLE `fin_business_holding_values` ADD CONSTRAINT `chk_holding_rate` CHECK (`rate` IS NULL OR (`rate` > 0 AND `rateDate` IS NOT NULL AND `rateSource` IS NOT NULL));
