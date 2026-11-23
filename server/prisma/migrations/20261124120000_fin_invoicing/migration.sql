-- P13-05, lot B (2026-11-23): selling and collecting, as the client's tab
-- 19_CYCLE_FACTURE describes it (FAC-001 to FAC-012): quote → invoice →
-- payment / credit note, reminders, export.
--
-- The P7-02 tables are EXTENDED, not duplicated: a quote, an invoice and a
-- credit note are all documents. Every existing row becomes an issued invoice,
-- which is exactly what it was.

-- What kind of document, and where it stands in its cycle.
--   quote:       draft → sent → accepted | refused → invoiced
--   invoice:     draft → issued (an issued invoice is never rewritten: CNV-02)
--   credit_note: issued, always linked to the invoice it corrects
-- Payment state (unpaid, partial, paid…) stays DEDUCED from the payments,
-- never stored, as in P7-02.
ALTER TABLE `fin_business_documents`
    ADD COLUMN `docType` VARCHAR(12) NOT NULL DEFAULT 'invoice',
    ADD COLUMN `state` VARCHAR(12) NOT NULL DEFAULT 'issued',
    ADD COLUMN `relatedId` VARCHAR(191) NULL,
    ADD COLUMN `validUntil` DATETIME(3) NULL,
    ADD COLUMN `costExcl` DOUBLE NULL,
    MODIFY `number` VARCHAR(40) NULL;

-- A draft invoice has no number yet: it receives the next one of the sequence
-- when it is issued (FAC-003). Quotes, invoices and credit notes each have
-- their own numbering.
ALTER TABLE `fin_business_documents` ADD UNIQUE INDEX `fin_business_documents_businessId_kind_docType_number_key`(`businessId`, `kind`, `docType`, `number`);
ALTER TABLE `fin_business_documents` DROP INDEX `fin_business_documents_businessId_kind_number_key`;
ALTER TABLE `fin_business_documents` ADD INDEX `fin_business_documents_relatedId_idx`(`relatedId`);
ALTER TABLE `fin_business_documents` ADD CONSTRAINT `fin_business_documents_relatedId_fkey` FOREIGN KEY (`relatedId`) REFERENCES `fin_business_documents`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE `fin_business_documents` ADD CONSTRAINT `chk_document_type` CHECK (`docType` IN ('quote', 'invoice', 'credit_note'));
ALTER TABLE `fin_business_documents` ADD CONSTRAINT `chk_document_state` CHECK (
    (`docType` = 'quote' AND `state` IN ('draft', 'sent', 'accepted', 'refused', 'invoiced'))
    OR (`docType` = 'invoice' AND `state` IN ('draft', 'issued'))
    OR (`docType` = 'credit_note' AND `state` = 'issued'));
-- A quote is something one sends to a client.
ALTER TABLE `fin_business_documents` ADD CONSTRAINT `chk_document_quote_sale` CHECK (`docType` <> 'quote' OR `kind` = 'sale');
-- Only a draft invoice may wait for its number.
ALTER TABLE `fin_business_documents` ADD CONSTRAINT `chk_document_number` CHECK (`number` IS NOT NULL OR (`docType` = 'invoice' AND `state` = 'draft'));
ALTER TABLE `fin_business_documents` ADD CONSTRAINT `chk_document_cost` CHECK (`costExcl` IS NULL OR `costExcl` >= 0);
ALTER TABLE `fin_business_documents` ADD CONSTRAINT `chk_document_valid_until` CHECK (`validUntil` IS NULL OR `validUntil` >= `issuedAt`);

-- The lines of a quote or an invoice: what is sold, how many, at what price
-- excluding tax. Their sum IS the amount excluding tax of the document. No tax
-- rate is applied anywhere (CNV-05): the tax stays declared on the document.
CREATE TABLE `fin_business_document_lines` (
    `id` VARCHAR(191) NOT NULL,
    `documentId` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL,
    `label` VARCHAR(200) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `unitPrice` DOUBLE NOT NULL,
    `amount` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fin_business_document_lines_documentId_idx`(`documentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `fin_business_document_lines` ADD CONSTRAINT `fin_business_document_lines_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `fin_business_documents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_business_document_lines` ADD CONSTRAINT `chk_line_values` CHECK (`quantity` > 0 AND `unitPrice` >= 0 AND `amount` >= 0);

-- The reminders sent for an unpaid invoice (FAC-008): FINCLUDIA prepares the
-- text, the person sends it through their own channel and records it here. A
-- reminder changes no balance.
CREATE TABLE `fin_business_reminders` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `documentId` VARCHAR(191) NOT NULL,
    `channel` VARCHAR(12) NOT NULL,
    `sentAt` DATETIME(3) NOT NULL,
    `note` VARCHAR(300) NULL,
    `nextActionAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fin_business_reminders_businessId_idx`(`businessId`),
    INDEX `fin_business_reminders_documentId_idx`(`documentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `fin_business_reminders` ADD CONSTRAINT `fin_business_reminders_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_business_reminders` ADD CONSTRAINT `fin_business_reminders_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `fin_business_documents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_business_reminders` ADD CONSTRAINT `chk_reminder_channel` CHECK (`channel` IN ('email', 'telephone', 'sms', 'courrier', 'visite', 'autre'));
ALTER TABLE `fin_business_reminders` ADD CONSTRAINT `chk_reminder_next` CHECK (`nextActionAt` IS NULL OR `nextActionAt` >= `sentAt`);
