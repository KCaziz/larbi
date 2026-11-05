-- P8-03 — Comptes, transferts et anti-doublon (ARC-04, PB-F001, PB-PR-04, PB-PR-06).
--
-- 1. The accounts table and the two new columns of a movement.
-- 2. The vocabulary of `kind` gains the two sides of a transfer.
-- 3. The data already there is migrated WITHOUT LOSS:
--    - each (person, currency) that has movements gets an « Espèces » account
--      (AC-01) holding all of them — PB-PR-04, the default account;
--    - every « épargne » movement (category family `goal`) becomes one side of
--      a transfer, and its other side is written on an « Épargne » account
--      (AC-04). Money set aside was never spending (PB-F005, diagnostic n°2,
--      C2): now it is what it always was, money moving between two pockets.

-- CreateTable
CREATE TABLE `fin_accounts` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(80) NOT NULL,
    `type` VARCHAR(5) NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `openingBalance` INTEGER NOT NULL DEFAULT 0,
    `openingDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `includeInTotal` BOOLEAN NOT NULL,
    `includeInNetWorth` BOOLEAN NOT NULL,
    `color` VARCHAR(9) NULL,
    `icon` VARCHAR(16) NULL,
    `minBalanceAlert` INTEGER NULL,
    `maxBalanceInfo` INTEGER NULL,
    `overdraftAllowed` INTEGER NULL,
    `note` VARCHAR(300) NULL,
    `archivedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `fin_accounts_userId_deletedAt_idx`(`userId`, `deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `fin_accounts`
  ADD CONSTRAINT `fin_accounts_type_check` CHECK (`type` IN ('AC-01', 'AC-02', 'AC-03', 'AC-04', 'AC-05', 'AC-06', 'AC-07', 'AC-08', 'AC-09', 'AC-10')),
  ADD CONSTRAINT `fin_accounts_currency_check` CHECK (`currency` REGEXP '^[A-Z]{3}$'),
  ADD CONSTRAINT `fin_accounts_overdraft_check` CHECK (`overdraftAllowed` IS NULL OR `overdraftAllowed` >= 0);

-- AlterTable
ALTER TABLE `fin_transactions` ADD COLUMN `accountId` VARCHAR(191) NULL,
    ADD COLUMN `transferId` VARCHAR(36) NULL,
    MODIFY `kind` VARCHAR(12) NOT NULL;

ALTER TABLE `fin_transactions` DROP CONSTRAINT `fin_transactions_kind_check`;
ALTER TABLE `fin_transactions` DROP CONSTRAINT `fin_transactions_planned_check`;
ALTER TABLE `fin_transactions`
  ADD CONSTRAINT `fin_transactions_kind_check` CHECK (`kind` IN ('income', 'expense', 'transfer_out', 'transfer_in')),
  -- A planned movement is still money going out, or one side of a planned
  -- transfer; never a planned income (that is a recurrence to confirm).
  ADD CONSTRAINT `fin_transactions_planned_check` CHECK (`planned` = FALSE OR `kind` <> 'income'),
  -- A transfer side always carries its transfer id, and nothing else does.
  ADD CONSTRAINT `fin_transactions_transfer_check` CHECK ((`kind` IN ('transfer_out', 'transfer_in')) = (`transferId` IS NOT NULL));

-- CreateIndex
CREATE INDEX `fin_transactions_accountId_idx` ON `fin_transactions`(`accountId`);
CREATE INDEX `fin_transactions_transferId_idx` ON `fin_transactions`(`transferId`);

-- AddForeignKey
ALTER TABLE `fin_accounts` ADD CONSTRAINT `fin_accounts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_transactions` ADD CONSTRAINT `fin_transactions_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `fin_accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- ---- Data ------------------------------------------------------------------

-- One « Espèces » account per person and currency that has movements. Its
-- opening balance is 0 at the date of the first movement: the balance is then
-- exactly the sum of what was recorded, as before.
INSERT INTO `fin_accounts` (`id`, `userId`, `label`, `type`, `currency`, `openingBalance`, `openingDate`, `includeInTotal`, `includeInNetWorth`, `updatedAt`)
SELECT UUID(), `userId`, 'Espèces', 'AC-01', `currency`, 0, MIN(`occurredAt`), TRUE, TRUE, CURRENT_TIMESTAMP(3)
FROM `fin_transactions`
GROUP BY `userId`, `currency`;

UPDATE `fin_transactions` t
JOIN `fin_accounts` a ON a.`userId` = t.`userId` AND a.`currency` = t.`currency` AND a.`type` = 'AC-01'
SET t.`accountId` = a.`id`;

-- One « Épargne » account per person and currency that set money aside.
INSERT INTO `fin_accounts` (`id`, `userId`, `label`, `type`, `currency`, `openingBalance`, `openingDate`, `includeInTotal`, `includeInNetWorth`, `updatedAt`)
SELECT UUID(), t.`userId`, 'Épargne', 'AC-04', t.`currency`, 0, MIN(t.`occurredAt`), TRUE, TRUE, CURRENT_TIMESTAMP(3)
FROM `fin_transactions` t
JOIN `fin_categories` c ON c.`id` = t.`categoryId`
WHERE c.`family` = 'goal'
GROUP BY t.`userId`, t.`currency`;

-- Each savings movement becomes the cash side of a transfer: a deposit leaves
-- the cash account, a withdrawal comes back into it.
UPDATE `fin_transactions` t
JOIN `fin_categories` c ON c.`id` = t.`categoryId`
SET t.`transferId` = UUID(),
    t.`kind` = CASE t.`kind` WHEN 'expense' THEN 'transfer_out' ELSE 'transfer_in' END
WHERE c.`family` = 'goal';

-- And its other side, on the savings account: same amount, date, status and
-- deletion, opposite direction.
INSERT INTO `fin_transactions` (`id`, `userId`, `kind`, `accountId`, `transferId`, `value`, `currency`, `occurredAt`, `categoryId`, `note`, `shared`, `planned`, `scope`, `source`, `status`, `consentUses`, `effectiveAt`, `collectedAt`, `version`, `deletedAt`, `createdAt`, `updatedAt`)
SELECT UUID(), t.`userId`, CASE t.`kind` WHEN 'transfer_out' THEN 'transfer_in' ELSE 'transfer_out' END, s.`id`, t.`transferId`, t.`value`, t.`currency`, t.`occurredAt`, t.`categoryId`, t.`note`, FALSE, t.`planned`, 'personal', t.`source`, t.`status`, '[]', t.`effectiveAt`, t.`collectedAt`, 1, t.`deletedAt`, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM `fin_transactions` t
JOIN `fin_accounts` s ON s.`userId` = t.`userId` AND s.`currency` = t.`currency` AND s.`type` = 'AC-04'
WHERE t.`transferId` IS NOT NULL AND t.`accountId` <> s.`id`;
