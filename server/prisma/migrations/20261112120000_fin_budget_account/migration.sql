-- R13-01 / R13-03: the account a budget (and each envelope) is spent from, and whether the starting balance counts as a resource.
ALTER TABLE `fin_budgets` ADD COLUMN `accountId` VARCHAR(191) NULL, ADD COLUMN `countBalance` BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE `fin_envelopes` ADD COLUMN `accountId` VARCHAR(191) NULL;
CREATE INDEX `fin_budgets_accountId_idx` ON `fin_budgets`(`accountId`);
CREATE INDEX `fin_envelopes_accountId_idx` ON `fin_envelopes`(`accountId`);
ALTER TABLE `fin_budgets` ADD CONSTRAINT `fin_budgets_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `fin_accounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `fin_envelopes` ADD CONSTRAINT `fin_envelopes_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `fin_accounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
