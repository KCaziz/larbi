-- The receipt key moves from `fin_transactions` onto `media` (P6-04).
--
-- Why: with the key on the transaction, erasing an account deleted its
-- movements and LEFT THEIR RECEIPTS BEHIND — the most sensitive file in the
-- platform, surviving the complete deletion the privacy text promises (P6-01
-- point 9). On `media`, with ON DELETE CASCADE, a receipt dies with the
-- movement it documents, exactly like a lesson file and an article file
-- already do. Written by hand: Prisma's interactive prompt warns about the
-- dropped column, which holds nothing yet.

-- AlterTable: the old side goes
ALTER TABLE `fin_transactions` DROP FOREIGN KEY `fin_transactions_receiptId_fkey`;
DROP INDEX `fin_transactions_receiptId_key` ON `fin_transactions`;
ALTER TABLE `fin_transactions` DROP COLUMN `receiptId`;

-- AlterTable: and the new one arrives
ALTER TABLE `media` ADD COLUMN `finTransactionId` VARCHAR(191) NULL;
CREATE UNIQUE INDEX `media_finTransactionId_key` ON `media`(`finTransactionId`);
ALTER TABLE `media` ADD CONSTRAINT `media_finTransactionId_fkey`
  FOREIGN KEY (`finTransactionId`) REFERENCES `fin_transactions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
