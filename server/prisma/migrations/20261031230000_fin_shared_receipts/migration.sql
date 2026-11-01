-- P9-14: a receipt and a free sub-category on a shared expense.
ALTER TABLE `media` ADD COLUMN `sharedExpenseId` VARCHAR(191) NULL;
CREATE UNIQUE INDEX `media_sharedExpenseId_key` ON `media`(`sharedExpenseId`);
ALTER TABLE `media` ADD CONSTRAINT `media_sharedExpenseId_fkey` FOREIGN KEY (`sharedExpenseId`) REFERENCES `fin_shared_expenses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_shared_expenses` ADD COLUMN `subCategory` VARCHAR(40) NULL;
