-- A movement's account key was ON DELETE RESTRICT (P8-03). The application never
-- deletes an account (it archives it), so the only real deletion is the erasure
-- of the whole User, and there RESTRICT made MariaDB refuse it when it reached
-- the accounts before their movements: « Supprimer mon compte » failed for
-- anyone with a movement on an account.

-- DropForeignKey
ALTER TABLE `fin_transactions` DROP FOREIGN KEY `fin_transactions_accountId_fkey`;

-- AddForeignKey
ALTER TABLE `fin_transactions` ADD CONSTRAINT `fin_transactions_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `fin_accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
