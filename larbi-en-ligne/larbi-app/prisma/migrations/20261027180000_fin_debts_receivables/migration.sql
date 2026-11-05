-- P8-13 — Dettes et créances : sens, type D-01 à D-05, compte porteur.

-- AlterTable
ALTER TABLE `fin_debts` ADD COLUMN `accountId` VARCHAR(191) NULL,
    ADD COLUMN `debtType` VARCHAR(4) NULL,
    ADD COLUMN `direction` VARCHAR(5) NOT NULL DEFAULT 'owed';

-- AddForeignKey
ALTER TABLE `fin_debts` ADD CONSTRAINT `fin_debts_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `fin_accounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;


ALTER TABLE `fin_debts`
  ADD CONSTRAINT `fin_debts_direction_check` CHECK (`direction` IN ('owed', 'lent')),
  ADD CONSTRAINT `fin_debts_type_check` CHECK (`debtType` IS NULL OR `debtType` IN ('D-01', 'D-02', 'D-03', 'D-04', 'D-05'));
