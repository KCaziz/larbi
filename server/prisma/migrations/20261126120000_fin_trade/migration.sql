-- P13-05, lot D (2026-11-24): micro-import and international trade, as the
-- client's screens ECR-0350 to ECR-0371 describe them. An operation, its
-- costs in their own currency with a dated and sourced rate (DEC-015,
-- CNV-10), its file of documents, its reception into stock, its margin.
-- FINCLUDIA files nothing with customs and moves no money: it prepares,
-- computes and keeps the proof.

CREATE TABLE `fin_business_operations` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(12) NOT NULL,
    `reference` VARCHAR(40) NOT NULL,
    `label` VARCHAR(200) NOT NULL,
    `country` CHAR(2) NOT NULL,
    `counterpartyId` VARCHAR(191) NULL,
    `currency` CHAR(3) NOT NULL,
    `incoterm` VARCHAR(3) NULL,
    `incotermVersion` VARCHAR(4) NULL,
    `namedPlace` VARCHAR(120) NULL,
    `itemId` VARCHAR(191) NULL,
    `quantityOrdered` DOUBLE NULL,
    `plannedAt` DATETIME(3) NULL,
    `status` VARCHAR(12) NOT NULL DEFAULT 'draft',
    `note` VARCHAR(300) NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `fin_business_operations_businessId_reference_key`(`businessId`, `reference`),
    INDEX `fin_business_operations_counterpartyId_idx`(`counterpartyId`),
    INDEX `fin_business_operations_itemId_idx`(`itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_business_operations` ADD CONSTRAINT `fin_business_operations_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_business_operations` ADD CONSTRAINT `fin_business_operations_counterpartyId_fkey` FOREIGN KEY (`counterpartyId`) REFERENCES `fin_business_contacts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `fin_business_operations` ADD CONSTRAINT `fin_business_operations_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `fin_business_items`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `fin_business_operations` ADD CONSTRAINT `chk_operation_kind` CHECK (`kind` IN ('micro_import', 'import', 'export'));
ALTER TABLE `fin_business_operations` ADD CONSTRAINT `chk_operation_status` CHECK (`status` IN ('draft', 'ordered', 'shipped', 'received', 'closed', 'cancelled'));
ALTER TABLE `fin_business_operations` ADD CONSTRAINT `chk_operation_currency` CHECK (`currency` REGEXP '^[A-Z]{3}$');
ALTER TABLE `fin_business_operations` ADD CONSTRAINT `chk_operation_country` CHECK (`country` REGEXP '^[A-Z]{2}$');
ALTER TABLE `fin_business_operations` ADD CONSTRAINT `chk_operation_incoterm` CHECK (`incoterm` IS NULL OR `incoterm` IN ('EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF'));
-- DEC-017: an Incoterm means nothing without its version and its named place.
ALTER TABLE `fin_business_operations` ADD CONSTRAINT `chk_operation_incoterm_place` CHECK (`incoterm` IS NULL OR (`incotermVersion` IS NOT NULL AND `namedPlace` IS NOT NULL));
ALTER TABLE `fin_business_operations` ADD CONSTRAINT `chk_operation_quantity` CHECK (`quantityOrdered` IS NULL OR `quantityOrdered` > 0);

-- The costs of an operation, each in ITS currency. A cost in another currency
-- than the organisation's carries the rate used, its date and its source; no
-- rate is ever implied (DEC-015). A cost is engaged until it is paid (CNV-09).
CREATE TABLE `fin_business_operation_costs` (
    `id` VARCHAR(191) NOT NULL,
    `operationId` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(20) NOT NULL,
    `label` VARCHAR(200) NULL,
    `amount` DOUBLE NOT NULL,
    `currency` CHAR(3) NOT NULL,
    `rate` DOUBLE NULL,
    `rateDate` DATETIME(3) NULL,
    `rateSource` VARCHAR(120) NULL,
    `paidAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fin_business_operation_costs_operationId_idx`(`operationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_business_operation_costs` ADD CONSTRAINT `fin_business_operation_costs_operationId_fkey` FOREIGN KEY (`operationId`) REFERENCES `fin_business_operations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_business_operation_costs` ADD CONSTRAINT `chk_operation_cost_kind` CHECK (`kind` IN ('goods', 'transport', 'insurance', 'travel', 'duties', 'customs_fees', 'bank', 'local_transport', 'other'));
ALTER TABLE `fin_business_operation_costs` ADD CONSTRAINT `chk_operation_cost_amount` CHECK (`amount` >= 0);
ALTER TABLE `fin_business_operation_costs` ADD CONSTRAINT `chk_operation_cost_currency` CHECK (`currency` REGEXP '^[A-Z]{3}$');
ALTER TABLE `fin_business_operation_costs` ADD CONSTRAINT `chk_operation_cost_rate` CHECK (`rate` IS NULL OR (`rate` > 0 AND `rateDate` IS NOT NULL AND `rateSource` IS NOT NULL));

-- The file of an operation: each expected document and where it stands.
-- « Ready to file » only when every expected one is accepted (ECR-0356).
CREATE TABLE `fin_business_operation_pieces` (
    `id` VARCHAR(191) NOT NULL,
    `operationId` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(30) NOT NULL,
    `status` VARCHAR(12) NOT NULL DEFAULT 'missing',
    `reference` VARCHAR(80) NULL,
    `note` VARCHAR(300) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `fin_business_operation_pieces_operationId_kind_key`(`operationId`, `kind`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_business_operation_pieces` ADD CONSTRAINT `fin_business_operation_pieces_operationId_fkey` FOREIGN KEY (`operationId`) REFERENCES `fin_business_operations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_business_operation_pieces` ADD CONSTRAINT `chk_operation_piece_kind` CHECK (`kind` IN ('commercial_invoice', 'packing_list', 'transport_document', 'customs_declaration', 'origin_certificate', 'payment_proof', 'authorization', 'insurance_certificate'));
ALTER TABLE `fin_business_operation_pieces` ADD CONSTRAINT `chk_operation_piece_status` CHECK (`status` IN ('missing', 'submitted', 'accepted', 'rejected'));

-- What an operation brings into stock, and what it sells: the lot received
-- and the invoices linked to it make its margin (ECR-0369).
ALTER TABLE `fin_business_stock_moves` ADD COLUMN `operationId` VARCHAR(191) NULL;
ALTER TABLE `fin_business_stock_moves` ADD INDEX `fin_business_stock_moves_operationId_idx`(`operationId`);
ALTER TABLE `fin_business_stock_moves` ADD CONSTRAINT `fin_business_stock_moves_operationId_fkey` FOREIGN KEY (`operationId`) REFERENCES `fin_business_operations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `fin_business_documents` ADD COLUMN `operationId` VARCHAR(191) NULL;
ALTER TABLE `fin_business_documents` ADD INDEX `fin_business_documents_operationId_idx`(`operationId`);
ALTER TABLE `fin_business_documents` ADD CONSTRAINT `fin_business_documents_operationId_fkey` FOREIGN KEY (`operationId`) REFERENCES `fin_business_operations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
