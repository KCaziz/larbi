-- P9-08: a collective expense is linked to at most ONE personal transaction.
ALTER TABLE `fin_shared_expenses` ADD COLUMN `personalTransactionId` VARCHAR(191) NULL;
CREATE UNIQUE INDEX `fin_shared_expenses_personalTransactionId_key` ON `fin_shared_expenses`(`personalTransactionId`);
ALTER TABLE `fin_shared_expenses` ADD CONSTRAINT `fin_shared_expenses_personalTransactionId_fkey` FOREIGN KEY (`personalTransactionId`) REFERENCES `fin_transactions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
