-- DropForeignKey
ALTER TABLE `fin_incomes` DROP FOREIGN KEY `fin_incomes_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `fin_transactions` DROP FOREIGN KEY `fin_transactions_categoryId_fkey`;

-- AddForeignKey
ALTER TABLE `fin_incomes` ADD CONSTRAINT `fin_incomes_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `fin_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_transactions` ADD CONSTRAINT `fin_transactions_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `fin_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
