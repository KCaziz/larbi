-- P13-05, lot F bis (2026-11-25) - the financial passport of the organisation
-- (19_CYCLE_FACTURE FAC-010; 02_ECRANS ECR-0012, ECR-0050, ECR-0107, ECR-0152)
-- and the receivables to finance (FAC-011; ECR-0104).
--   - a passport is a dated snapshot, numbered, with its completeness explained;
--     without validated books it is a provisional management passport;
--   - an invoice can be marked disputed; a batch of invoices to finance keeps each
--     invoice once (an invoice already in a live batch is not offered again);
--   - a passport or a batch is shared with a financer's space, with consent, until
--     a date, revocable; every opening by the financer is recorded.
-- FINCLUDIA grants nothing and transfers nothing.

CREATE TABLE `fin_business_passports` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `number` INTEGER NOT NULL,
    `periodFrom` DATETIME(3) NOT NULL,
    `periodTo` DATETIME(3) NOT NULL,
    `items` JSON NOT NULL,
    `content` JSON NOT NULL,
    `completeness` JSON NOT NULL,
    `provisional` BOOLEAN NOT NULL DEFAULT true,
    `status` VARCHAR(10) NOT NULL DEFAULT 'draft',
    `preparedById` VARCHAR(191) NULL,
    `publishedById` VARCHAR(191) NULL,
    `publishedAt` DATETIME(3) NULL,
    `revokedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `fin_business_passports_businessId_number_key`(`businessId`, `number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_business_passports` ADD CONSTRAINT `chk_business_passport` CHECK (`status` IN ('draft', 'published', 'revoked') AND `periodTo` >= `periodFrom`);
ALTER TABLE `fin_business_passports` ADD CONSTRAINT `fin_business_passports_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `fin_business_documents` ADD COLUMN `disputedAt` DATETIME(3) NULL;
ALTER TABLE `fin_business_documents` ADD COLUMN `disputeNote` VARCHAR(300) NULL;

CREATE TABLE `fin_business_financing_batches` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(160) NOT NULL,
    `advanceRate` DOUBLE NOT NULL,
    `feeRate` DOUBLE NOT NULL,
    `status` VARCHAR(10) NOT NULL DEFAULT 'draft',
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `fin_business_financing_batches_businessId_idx`(`businessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_business_financing_batches` ADD CONSTRAINT `chk_business_financing_batch` CHECK (`status` IN ('draft', 'shared', 'closed', 'cancelled') AND `advanceRate` > 0 AND `advanceRate` <= 1 AND `feeRate` >= 0 AND `feeRate` < 1);
ALTER TABLE `fin_business_financing_batches` ADD CONSTRAINT `fin_business_financing_batches_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `fin_business_financing_items` (
    `id` VARCHAR(191) NOT NULL,
    `batchId` VARCHAR(191) NOT NULL,
    `documentId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,

    UNIQUE INDEX `fin_business_financing_items_batchId_documentId_key`(`batchId`, `documentId`),
    INDEX `fin_business_financing_items_documentId_idx`(`documentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_business_financing_items` ADD CONSTRAINT `chk_business_financing_item` CHECK (`amount` > 0);
ALTER TABLE `fin_business_financing_items` ADD CONSTRAINT `fin_business_financing_items_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `fin_business_financing_batches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_business_financing_items` ADD CONSTRAINT `fin_business_financing_items_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `fin_business_documents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `fin_business_shares` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(10) NOT NULL,
    `passportId` VARCHAR(191) NULL,
    `batchId` VARCHAR(191) NULL,
    `spaceId` VARCHAR(191) NOT NULL,
    `consentAt` DATETIME(3) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `revokedAt` DATETIME(3) NULL,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fin_business_shares_businessId_idx`(`businessId`),
    INDEX `fin_business_shares_spaceId_idx`(`spaceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- « A share points at what its kind says » involves foreign-key columns: MariaDB
-- refuses such a CHECK (error 1901). The server enforces it (finPassport.service).
ALTER TABLE `fin_business_shares` ADD CONSTRAINT `chk_business_share_kind` CHECK (`kind` IN ('passport', 'batch'));
ALTER TABLE `fin_business_shares` ADD CONSTRAINT `fin_business_shares_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_business_shares` ADD CONSTRAINT `fin_business_shares_passportId_fkey` FOREIGN KEY (`passportId`) REFERENCES `fin_business_passports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_business_shares` ADD CONSTRAINT `fin_business_shares_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `fin_business_financing_batches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_business_shares` ADD CONSTRAINT `fin_business_shares_spaceId_fkey` FOREIGN KEY (`spaceId`) REFERENCES `fin_partner_spaces`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `fin_business_share_accesses` (
    `id` VARCHAR(191) NOT NULL,
    `shareId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `accessedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fin_business_share_accesses_shareId_idx`(`shareId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_business_share_accesses` ADD CONSTRAINT `fin_business_share_accesses_shareId_fkey` FOREIGN KEY (`shareId`) REFERENCES `fin_business_shares`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
