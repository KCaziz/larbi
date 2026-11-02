-- P9-15: a shared expense paid with one's own money weighs on the budget only for the payer's share.
ALTER TABLE `fin_shared_expenses` ADD COLUMN `advanceTransferId` VARCHAR(36) NULL, ADD COLUMN `advanceOriginalValue` INTEGER NULL, ADD COLUMN `personalCreated` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `fin_settlements` ADD COLUMN `transferId` VARCHAR(36) NULL;
