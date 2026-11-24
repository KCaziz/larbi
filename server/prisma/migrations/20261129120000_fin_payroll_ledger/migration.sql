-- P13-05, lot G, second part (2026-11-24) - payroll (ECR-0265 to 0271) and
-- accounting (ECR-0108, 0243 to 0250, 0330), on DEFAULT rules until the
-- administration confirms them (constants/finEmployerRules.js): every result
-- says it is provisional, a bulletin is a draft, a statement is not certified.

-- ---- payroll ------------------------------------------------------------------------
-- The employee's payroll conditions (ECR-0265): matricule, monthly base salary
-- (centimes), part time (no minimum-wage warning then).
ALTER TABLE `fin_business_employees` ADD COLUMN `employeeNumber` VARCHAR(30) NULL;
ALTER TABLE `fin_business_employees` ADD COLUMN `baseSalary` DOUBLE NULL;
ALTER TABLE `fin_business_employees` ADD COLUMN `partTime` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `fin_business_employees` ADD CONSTRAINT `chk_employee_salary` CHECK (`baseSalary` IS NULL OR `baseSalary` >= 0);

-- The monthly payroll run (ECR-0268): prepared, validated by ANOTHER person
-- (double control), closed. The rules used are kept with it.
CREATE TABLE `fin_payroll_runs` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `period` CHAR(7) NOT NULL,
    `status` VARCHAR(12) NOT NULL DEFAULT 'draft',
    `provisional` BOOLEAN NOT NULL DEFAULT true,
    `rules` JSON NOT NULL,
    `preparedById` VARCHAR(191) NOT NULL,
    `validatedById` VARCHAR(191) NULL,
    `validatedAt` DATETIME(3) NULL,
    `closedAt` DATETIME(3) NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `fin_payroll_runs_businessId_period_key`(`businessId`, `period`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_payroll_runs` ADD CONSTRAINT `fin_payroll_runs_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_payroll_runs` ADD CONSTRAINT `chk_payroll_status` CHECK (`status` IN ('draft', 'validated', 'closed'));
ALTER TABLE `fin_payroll_runs` ADD CONSTRAINT `chk_payroll_period` CHECK (`period` REGEXP '^[0-9]{4}-(0[1-9]|1[0-2])$');
ALTER TABLE `fin_payroll_runs` ADD CONSTRAINT `chk_payroll_two_people` CHECK (`validatedById` IS NULL OR `validatedById` <> `preparedById`);

-- One bulletin of a run (ECR-0266, 0267, 0269): the month's variables and what
-- the engine computed from them.
CREATE TABLE `fin_payroll_slips` (
    `id` VARCHAR(191) NOT NULL,
    `runId` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `baseSalary` DOUBLE NOT NULL DEFAULT 0,
    `overtime` DOUBLE NOT NULL DEFAULT 0,
    `bonuses` DOUBLE NOT NULL DEFAULT 0,
    `nonContributable` DOUBLE NOT NULL DEFAULT 0,
    `absenceDeduction` DOUBLE NOT NULL DEFAULT 0,
    `netDeductions` DOUBLE NOT NULL DEFAULT 0,
    `gross` DOUBLE NOT NULL DEFAULT 0,
    `contributionBase` DOUBLE NOT NULL DEFAULT 0,
    `employeeContrib` DOUBLE NOT NULL DEFAULT 0,
    `taxable` DOUBLE NOT NULL DEFAULT 0,
    `irg` DOUBLE NOT NULL DEFAULT 0,
    `net` DOUBLE NOT NULL DEFAULT 0,
    `employerContrib` DOUBLE NOT NULL DEFAULT 0,
    `socialWorks` DOUBLE NOT NULL DEFAULT 0,
    `employerCost` DOUBLE NOT NULL DEFAULT 0,
    `anomalies` JSON NOT NULL,
    `note` VARCHAR(300) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `fin_payroll_slips_runId_employeeId_key`(`runId`, `employeeId`),
    INDEX `fin_payroll_slips_employeeId_idx`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_payroll_slips` ADD CONSTRAINT `fin_payroll_slips_runId_fkey` FOREIGN KEY (`runId`) REFERENCES `fin_payroll_runs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_payroll_slips` ADD CONSTRAINT `fin_payroll_slips_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `fin_business_employees`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `fin_payroll_slips` ADD CONSTRAINT `chk_slip_variables` CHECK (`baseSalary` >= 0 AND `overtime` >= 0 AND `bonuses` >= 0 AND `nonContributable` >= 0 AND `absenceDeduction` >= 0 AND `netDeductions` >= 0);

-- ---- accounting -------------------------------------------------------------------------
-- The organisation's own sub-accounts (ECR-0243), always under a root of the
-- SCF nomenclature (checked by the server).
CREATE TABLE `fin_ledger_accounts` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `code` VARCHAR(10) NOT NULL,
    `label` VARCHAR(160) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `fin_ledger_accounts_businessId_code_key`(`businessId`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_ledger_accounts` ADD CONSTRAINT `fin_ledger_accounts_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_ledger_accounts` ADD CONSTRAINT `chk_ledger_account_code` CHECK (`code` REGEXP '^[1-7][0-9]{1,9}$');

-- The correspondence between the accounts of another software and the SCF (ECR-0243).
CREATE TABLE `fin_ledger_mappings` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `sourceCode` VARCHAR(20) NOT NULL,
    `sourceLabel` VARCHAR(200) NOT NULL,
    `account` VARCHAR(10) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `fin_ledger_mappings_businessId_sourceCode_key`(`businessId`, `sourceCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_ledger_mappings` ADD CONSTRAINT `fin_ledger_mappings_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- An accounting entry (ECR-0244, 0247): entered, proposed from an event of the
-- application (sourceKey: one event, one entry) or imported; draft, then validated.
CREATE TABLE `fin_ledger_entries` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `journal` VARCHAR(4) NOT NULL,
    `number` VARCHAR(40) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `label` VARCHAR(200) NOT NULL,
    `status` VARCHAR(12) NOT NULL DEFAULT 'draft',
    `source` VARCHAR(10) NOT NULL DEFAULT 'manual',
    `sourceKey` VARCHAR(80) NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `validatedById` VARCHAR(191) NULL,
    `validatedAt` DATETIME(3) NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `fin_ledger_entries_businessId_sourceKey_key`(`businessId`, `sourceKey`),
    INDEX `fin_ledger_entries_businessId_date_idx`(`businessId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_ledger_entries` ADD CONSTRAINT `fin_ledger_entries_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_ledger_entries` ADD CONSTRAINT `chk_ledger_journal` CHECK (`journal` IN ('VT', 'AC', 'BQ', 'CA', 'PA', 'OD', 'AN'));
ALTER TABLE `fin_ledger_entries` ADD CONSTRAINT `chk_ledger_status` CHECK (`status` IN ('draft', 'validated'));
ALTER TABLE `fin_ledger_entries` ADD CONSTRAINT `chk_ledger_source` CHECK (`source` IN ('manual', 'auto', 'import'));

-- A line of an entry: a debit OR a credit, never both, never nothing.
CREATE TABLE `fin_ledger_lines` (
    `id` VARCHAR(191) NOT NULL,
    `entryId` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL,
    `account` VARCHAR(10) NOT NULL,
    `label` VARCHAR(200) NULL,
    `debit` DOUBLE NOT NULL DEFAULT 0,
    `credit` DOUBLE NOT NULL DEFAULT 0,

    INDEX `fin_ledger_lines_entryId_idx`(`entryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_ledger_lines` ADD CONSTRAINT `fin_ledger_lines_entryId_fkey` FOREIGN KEY (`entryId`) REFERENCES `fin_ledger_entries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_ledger_lines` ADD CONSTRAINT `chk_ledger_line_amount` CHECK (`debit` >= 0 AND `credit` >= 0 AND (`debit` = 0 OR `credit` = 0) AND `debit` + `credit` > 0);

-- A closed month (ECR-0248): no entry is added or validated in it; reopened
-- only with a reason, kept.
CREATE TABLE `fin_ledger_periods` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `period` CHAR(7) NOT NULL,
    `status` VARCHAR(8) NOT NULL DEFAULT 'closed',
    `closedById` VARCHAR(191) NOT NULL,
    `closedAt` DATETIME(3) NOT NULL,
    `reopenReason` VARCHAR(300) NULL,
    `reopenedById` VARCHAR(191) NULL,
    `reopenedAt` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `fin_ledger_periods_businessId_period_key`(`businessId`, `period`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_ledger_periods` ADD CONSTRAINT `fin_ledger_periods_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_ledger_periods` ADD CONSTRAINT `chk_ledger_period_status` CHECK (`status` IN ('closed', 'open'));
ALTER TABLE `fin_ledger_periods` ADD CONSTRAINT `chk_ledger_period_format` CHECK (`period` REGEXP '^[0-9]{4}-(0[1-9]|1[0-2])$');
ALTER TABLE `fin_ledger_periods` ADD CONSTRAINT `chk_ledger_reopen_reason` CHECK (`status` = 'closed' OR `reopenReason` IS NOT NULL);

-- A bank or cash reconciliation (ECR-0246): the balance of the statement at a
-- date against the balance of the books; the gap is kept with its explanation.
CREATE TABLE `fin_ledger_bank_checks` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `account` VARCHAR(10) NOT NULL,
    `checkedAt` DATETIME(3) NOT NULL,
    `statementBalance` DOUBLE NOT NULL,
    `bookBalance` DOUBLE NOT NULL,
    `note` VARCHAR(300) NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fin_ledger_bank_checks_businessId_idx`(`businessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_ledger_bank_checks` ADD CONSTRAINT `fin_ledger_bank_checks_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
