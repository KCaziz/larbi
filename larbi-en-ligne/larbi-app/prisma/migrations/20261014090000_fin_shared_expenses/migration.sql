-- FINCLUDIA shared expenses and settlements (P6-14), screens P02 and P03,
-- F041 / F042 / F043 and ALG-02.
--
-- Everything lives inside a shared space (P6-13), in that space's currency: the
-- engine never converts without a dated rate, so a space that mixed currencies
-- could not total anything.
--
-- The rule the client states first — « somme des parts = montant » — is NOT a
-- CHECK: it spans a row of `fin_shared_expenses` and every row of
-- `fin_shared_shares` that points at it, which no CHECK can see. It lives in
-- the service and in the consistency control, like the overlap rule of P6-05.
--
-- A settlement is DECLARATIVE: nothing here moves money, and there is no
-- payment integration anywhere in FINCLUDIA.

-- CreateTable
CREATE TABLE `fin_shared_expenses` (
    `id` VARCHAR(191) NOT NULL,
    `spaceId` VARCHAR(191) NOT NULL,
    `payerId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(80) NOT NULL,
    `value` INTEGER NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `occurredAt` DATETIME(3) NOT NULL,
    `splitMode` VARCHAR(30) NOT NULL,
    `categoryId` VARCHAR(191) NULL,
    `note` VARCHAR(300) NULL,
    `recordedById` VARCHAR(191) NOT NULL,
    `source` VARCHAR(20) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `fin_shared_expenses_spaceId_occurredAt_idx`(`spaceId`, `occurredAt`),
    INDEX `fin_shared_expenses_payerId_idx`(`payerId`),
    INDEX `fin_shared_expenses_categoryId_idx`(`categoryId`),
    INDEX `fin_shared_expenses_recordedById_idx`(`recordedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_shared_shares` (
    `id` VARCHAR(191) NOT NULL,
    `expenseId` VARCHAR(191) NOT NULL,
    `memberId` VARCHAR(191) NOT NULL,
    `share` INTEGER NOT NULL,
    `weight` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fin_shared_shares_memberId_idx`(`memberId`),
    UNIQUE INDEX `fin_shared_shares_expenseId_memberId_key`(`expenseId`, `memberId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_settlements` (
    `id` VARCHAR(191) NOT NULL,
    `spaceId` VARCHAR(191) NOT NULL,
    `fromId` VARCHAR(191) NOT NULL,
    `toId` VARCHAR(191) NOT NULL,
    `value` INTEGER NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `settledAt` DATETIME(3) NOT NULL,
    `note` VARCHAR(300) NULL,
    `recordedById` VARCHAR(191) NOT NULL,
    `source` VARCHAR(20) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fin_settlements_spaceId_settledAt_idx`(`spaceId`, `settledAt`),
    INDEX `fin_settlements_fromId_idx`(`fromId`),
    INDEX `fin_settlements_toId_idx`(`toId`),
    INDEX `fin_settlements_recordedById_idx`(`recordedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `fin_shared_expenses` ADD CONSTRAINT `fin_shared_expenses_spaceId_fkey` FOREIGN KEY (`spaceId`) REFERENCES `fin_spaces`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
-- The payer is a MEMBERSHIP, not a user: an expense must stay readable as
-- "paid by X" after X leaves the space (the membership row survives with
-- `leftAt` set).
ALTER TABLE `fin_shared_expenses` ADD CONSTRAINT `fin_shared_expenses_payerId_fkey` FOREIGN KEY (`payerId`) REFERENCES `fin_space_members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_shared_expenses` ADD CONSTRAINT `fin_shared_expenses_recordedById_fkey` FOREIGN KEY (`recordedById`) REFERENCES `fin_space_members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
-- SET NULL, never Restrict (the P6-04 lesson).
ALTER TABLE `fin_shared_expenses` ADD CONSTRAINT `fin_shared_expenses_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `fin_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `fin_shared_shares` ADD CONSTRAINT `fin_shared_shares_expenseId_fkey` FOREIGN KEY (`expenseId`) REFERENCES `fin_shared_expenses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_shared_shares` ADD CONSTRAINT `fin_shared_shares_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `fin_space_members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `fin_settlements` ADD CONSTRAINT `fin_settlements_spaceId_fkey` FOREIGN KEY (`spaceId`) REFERENCES `fin_spaces`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_settlements` ADD CONSTRAINT `fin_settlements_fromId_fkey` FOREIGN KEY (`fromId`) REFERENCES `fin_space_members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_settlements` ADD CONSTRAINT `fin_settlements_toId_fkey` FOREIGN KEY (`toId`) REFERENCES `fin_space_members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_settlements` ADD CONSTRAINT `fin_settlements_recordedById_fkey` FOREIGN KEY (`recordedById`) REFERENCES `fin_space_members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `fin_shared_expenses`
  ADD CONSTRAINT `fin_shared_expenses_split_check` CHECK (`splitMode` IN ('equal', 'percent', 'amounts', 'income_proportional')),
  ADD CONSTRAINT `fin_shared_expenses_source_check` CHECK (`source` IN ('manual', 'imported', 'document', 'partner', 'computed')),
  ADD CONSTRAINT `fin_shared_expenses_status_check` CHECK (`status` IN ('real', 'declared', 'imported', 'computed', 'fictional', 'official', 'to_confirm')),
  ADD CONSTRAINT `fin_shared_expenses_currency_check` CHECK (`currency` REGEXP '^[A-Z]{3}$'),
  ADD CONSTRAINT `fin_shared_expenses_label_check` CHECK (TRIM(`label`) <> ''),
  ADD CONSTRAINT `fin_shared_expenses_version_check` CHECK (`version` >= 1),
  -- A shared expense of zero is not an expense; the sign is carried by it being
  -- an expense, exactly as for a movement (P6-04).
  ADD CONSTRAINT `fin_shared_expenses_value_check` CHECK (`value` > 0);

ALTER TABLE `fin_shared_shares`
  -- A share of zero is legitimate (somebody took part but owes nothing of this
  -- one); a negative share is not.
  ADD CONSTRAINT `fin_shared_shares_share_check` CHECK (`share` >= 0),
  ADD CONSTRAINT `fin_shared_shares_weight_check` CHECK (`weight` IS NULL OR `weight` >= 0);

ALTER TABLE `fin_settlements`
  ADD CONSTRAINT `fin_settlements_source_check` CHECK (`source` IN ('manual', 'imported', 'document', 'partner', 'computed')),
  ADD CONSTRAINT `fin_settlements_status_check` CHECK (`status` IN ('real', 'declared', 'imported', 'computed', 'fictional', 'official', 'to_confirm')),
  ADD CONSTRAINT `fin_settlements_currency_check` CHECK (`currency` REGEXP '^[A-Z]{3}$'),
  ADD CONSTRAINT `fin_settlements_value_check` CHECK (`value` > 0);

-- NOT a CHECK, and not for want of trying: « nobody settles with themselves »
-- compares `fromId` and `toId`, which are both FOREIGN KEY columns, and MariaDB
-- refuses those in a CHECK (error 1901) — the same limitation that sent the
-- media, quiz and category rules into the consistency control. So that rule
-- lives in finShared.service.js and in consistency.service.js, next to the
-- period-overlap rule of P6-05 and for exactly the same reason.
