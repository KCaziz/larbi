-- AlterTable
ALTER TABLE `formations` ADD COLUMN `targetAccountTypes` JSON NOT NULL DEFAULT ('[]');
