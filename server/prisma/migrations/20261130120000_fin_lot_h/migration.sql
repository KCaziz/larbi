-- P13-05, lot H (2026-11-24) - what payroll, accounting and HR still lacked,
-- built on our default choices (the user's instruction: « fais comme tu dis »):
-- irregular bonuses taxed apart, payslips readable by the employee, fixed
-- assets and depreciation, fiscal year closing, bank statement matching,
-- timesheets, skills, training plan, recruitment.

-- ---- payroll ------------------------------------------------------------------------
-- Bonuses paid for several months (quarterly, 13th month, back pay): subject to
-- contributions, taxed apart at the flat rate of 10 %.
ALTER TABLE `fin_payroll_slips` ADD COLUMN `irregularBonuses` DOUBLE NOT NULL DEFAULT 0;
ALTER TABLE `fin_payroll_slips` ADD COLUMN `irgIrregular` DOUBLE NOT NULL DEFAULT 0;
ALTER TABLE `fin_payroll_slips` ADD COLUMN `overtimeHours` DOUBLE NOT NULL DEFAULT 0;
ALTER TABLE `fin_payroll_slips` ADD CONSTRAINT `chk_slip_irregular` CHECK (`irregularBonuses` >= 0 AND `irgIrregular` >= 0 AND `overtimeHours` >= 0);

-- The FINCLUDIA account of the employee, to read their own payslips (ECR-0269).
ALTER TABLE `fin_business_employees` ADD COLUMN `userId` VARCHAR(191) NULL;
ALTER TABLE `fin_business_employees` ADD COLUMN `socialNumber` VARCHAR(30) NULL;
CREATE INDEX `fin_business_employees_userId_idx` ON `fin_business_employees`(`userId`);
ALTER TABLE `fin_business_employees` ADD CONSTRAINT `fin_business_employees_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ---- HR (ECR-0274 to 0277) ------------------------------------------------------------
-- Hours worked, by day; approved by another person than the one who entered them.
-- Approved overtime feeds the payroll of the month.
CREATE TABLE `fin_business_timesheets` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `workedOn` DATETIME(3) NOT NULL,
    `hours` DOUBLE NOT NULL,
    `overtimeHours` DOUBLE NOT NULL DEFAULT 0,
    `note` VARCHAR(300) NULL,
    `status` VARCHAR(12) NOT NULL DEFAULT 'submitted',
    `createdById` VARCHAR(191) NOT NULL,
    `decidedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `fin_business_timesheets_employeeId_workedOn_key`(`employeeId`, `workedOn`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_business_timesheets` ADD CONSTRAINT `fin_business_timesheets_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `fin_business_employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_business_timesheets` ADD CONSTRAINT `chk_timesheet_hours` CHECK (`hours` >= 0 AND `hours` <= 24 AND `overtimeHours` >= 0 AND `overtimeHours` <= `hours`);
ALTER TABLE `fin_business_timesheets` ADD CONSTRAINT `chk_timesheet_status` CHECK (`status` IN ('submitted', 'approved', 'refused'));
ALTER TABLE `fin_business_timesheets` ADD CONSTRAINT `chk_timesheet_two_people` CHECK (`decidedById` IS NULL OR `decidedById` <> `createdById`);

-- A skill of an employee and its level (1 to 4), dated.
CREATE TABLE `fin_business_skills` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `skill` VARCHAR(120) NOT NULL,
    `level` INTEGER NOT NULL,
    `assessedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `fin_business_skills_employeeId_skill_key`(`employeeId`, `skill`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_business_skills` ADD CONSTRAINT `fin_business_skills_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `fin_business_employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_business_skills` ADD CONSTRAINT `chk_skill_level` CHECK (`level` BETWEEN 1 AND 4);

-- The training plan: an action, for one employee or for everyone, its cost.
CREATE TABLE `fin_business_trainings` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NULL,
    `title` VARCHAR(160) NOT NULL,
    `provider` VARCHAR(160) NULL,
    `plannedAt` DATETIME(3) NOT NULL,
    `cost` DOUBLE NULL,
    `status` VARCHAR(12) NOT NULL DEFAULT 'planned',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `fin_business_trainings_businessId_idx`(`businessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_business_trainings` ADD CONSTRAINT `fin_business_trainings_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_business_trainings` ADD CONSTRAINT `fin_business_trainings_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `fin_business_employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `fin_business_trainings` ADD CONSTRAINT `chk_training_status` CHECK (`status` IN ('planned', 'done', 'cancelled'));
ALTER TABLE `fin_business_trainings` ADD CONSTRAINT `chk_training_cost` CHECK (`cost` IS NULL OR `cost` >= 0);

-- Recruitment: an open position and its candidates (name and stage only).
CREATE TABLE `fin_business_vacancies` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(160) NOT NULL,
    `department` VARCHAR(120) NULL,
    `contract` VARCHAR(12) NOT NULL,
    `openedAt` DATETIME(3) NOT NULL,
    `status` VARCHAR(12) NOT NULL DEFAULT 'open',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `fin_business_vacancies_businessId_idx`(`businessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_business_vacancies` ADD CONSTRAINT `fin_business_vacancies_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_business_vacancies` ADD CONSTRAINT `chk_vacancy_status` CHECK (`status` IN ('open', 'filled', 'cancelled'));

CREATE TABLE `fin_business_candidates` (
    `id` VARCHAR(191) NOT NULL,
    `vacancyId` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(160) NOT NULL,
    `stage` VARCHAR(12) NOT NULL DEFAULT 'applied',
    `note` VARCHAR(300) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `fin_business_candidates_vacancyId_idx`(`vacancyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_business_candidates` ADD CONSTRAINT `fin_business_candidates_vacancyId_fkey` FOREIGN KEY (`vacancyId`) REFERENCES `fin_business_vacancies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_business_candidates` ADD CONSTRAINT `chk_candidate_stage` CHECK (`stage` IN ('applied', 'interview', 'offer', 'hired', 'rejected'));

-- ---- accounting ---------------------------------------------------------------------
-- A fixed asset (register) and its straight-line depreciation (default method).
CREATE TABLE `fin_ledger_assets` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(160) NOT NULL,
    `category` VARCHAR(20) NOT NULL,
    `account` VARCHAR(10) NOT NULL,
    `acquiredAt` DATETIME(3) NOT NULL,
    `cost` DOUBLE NOT NULL,
    `durationMonths` INTEGER NOT NULL,
    `disposedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `fin_ledger_assets_businessId_idx`(`businessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_ledger_assets` ADD CONSTRAINT `fin_ledger_assets_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_ledger_assets` ADD CONSTRAINT `chk_asset_values` CHECK (`cost` > 0 AND `durationMonths` > 0 AND `durationMonths` <= 1200);
ALTER TABLE `fin_ledger_assets` ADD CONSTRAINT `chk_asset_dates` CHECK (`disposedAt` IS NULL OR `disposedAt` >= `acquiredAt`);

-- A closed fiscal year: its result and the opening entry of the next one.
CREATE TABLE `fin_ledger_years` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `result` DOUBLE NOT NULL,
    `closedById` VARCHAR(191) NOT NULL,
    `closedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `fin_ledger_years_businessId_year_key`(`businessId`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_ledger_years` ADD CONSTRAINT `fin_ledger_years_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- A line of a bank statement, matched to at most one line of the books (lettrage).
CREATE TABLE `fin_ledger_bank_lines` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `account` VARCHAR(10) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `label` VARCHAR(200) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `importKey` VARCHAR(120) NOT NULL,
    `matchedLineId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `fin_ledger_bank_lines_businessId_importKey_key`(`businessId`, `importKey`),
    UNIQUE INDEX `fin_ledger_bank_lines_matchedLineId_key`(`matchedLineId`),
    INDEX `fin_ledger_bank_lines_businessId_account_idx`(`businessId`, `account`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_ledger_bank_lines` ADD CONSTRAINT `fin_ledger_bank_lines_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_ledger_bank_lines` ADD CONSTRAINT `fin_ledger_bank_lines_matchedLineId_fkey` FOREIGN KEY (`matchedLineId`) REFERENCES `fin_ledger_lines`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `fin_ledger_bank_lines` ADD CONSTRAINT `chk_bank_line_amount` CHECK (`amount` <> 0);
