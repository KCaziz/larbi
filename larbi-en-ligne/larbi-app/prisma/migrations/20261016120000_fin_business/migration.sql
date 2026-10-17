-- Espace entreprise (P7-02) — le socle de l'ERP annoncé par l'annexe 1 du
-- contrat : entreprises, PME, PMI, micro-entreprises, auto-entrepreneurs,
-- micro-importateurs et professions libérales.
--
-- Ce que ces tables permettent de calculer ne dépend d'AUCUN référentiel
-- comptable : des tiers, des documents de vente et d'achat tels qu'ils ont été
-- émis ou reçus, et les règlements qui les soldent. De quoi répondre à « qui me
-- doit quoi, qu'est-ce que je dois, combien est réellement entré ce mois-ci ».
--
-- Ce qu'elles ne permettent PAS, volontairement : bilan, compte de résultat,
-- TVA à déclarer, amortissements, stock. Tout cela suppose le Système
-- Comptable Financier algérien et des règles fiscales datées que le client n'a
-- pas fournies (voir P7-01). Des états comptables inventés seraient faux ET
-- présentés comme officiels : c'est la faute la plus coûteuse possible ici.
--
-- Montants en centimes, comme partout dans le moteur. Hors taxe et taxe sont
-- DÉCLARÉS tous les deux : le taux appliqué appartient au document réel, et
-- aucun taux de TVA n'est supposé.
--
-- Règles qui ne peuvent pas être des CHECK, et où elles vivent :
--   * « la somme des règlements ne dépasse pas le total du document » traverse
--     plusieurs lignes : service + contrôle de cohérence.
--   * « le règlement est dans la devise de son document » référence une
--     colonne de clé étrangère, ce que MariaDB refuse (erreur 1901) : service.

-- CreateTable
CREATE TABLE `fin_businesses` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(160) NOT NULL,
    `legalForm` VARCHAR(40) NULL,
    `taxId` VARCHAR(40) NULL,
    `tradeRegister` VARCHAR(40) NULL,
    `statisticalId` VARCHAR(40) NULL,
    `activity` VARCHAR(160) NULL,
    `currency` VARCHAR(3) NOT NULL,
    `fiscalYearStartMonth` INTEGER NOT NULL DEFAULT 1,
    `scope` VARCHAR(20) NOT NULL DEFAULT 'business',
    `source` VARCHAR(20) NOT NULL,
    `sourceRef` VARCHAR(200) NULL,
    `status` VARCHAR(20) NOT NULL,
    `consentUses` JSON NOT NULL,
    `effectiveAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `collectedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `version` INTEGER NOT NULL DEFAULT 1,
    `archivedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `fin_businesses_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_business_contacts` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(10) NOT NULL,
    `name` VARCHAR(160) NOT NULL,
    `taxId` VARCHAR(40) NULL,
    `email` VARCHAR(254) NULL,
    `phone` VARCHAR(40) NULL,
    `address` VARCHAR(300) NULL,
    `country` VARCHAR(2) NULL,
    `note` VARCHAR(300) NULL,
    `scope` VARCHAR(20) NOT NULL DEFAULT 'business',
    `source` VARCHAR(20) NOT NULL,
    `sourceRef` VARCHAR(200) NULL,
    `status` VARCHAR(20) NOT NULL,
    `consentUses` JSON NOT NULL,
    `effectiveAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `collectedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `version` INTEGER NOT NULL DEFAULT 1,
    `archivedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `fin_business_contacts_businessId_kind_idx`(`businessId`, `kind`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_business_documents` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `contactId` VARCHAR(191) NULL,
    `kind` VARCHAR(10) NOT NULL,
    `number` VARCHAR(40) NOT NULL,
    `label` VARCHAR(200) NOT NULL,
    `issuedAt` DATETIME(3) NOT NULL,
    `dueAt` DATETIME(3) NULL,
    `amountExcl` INTEGER NOT NULL,
    `taxAmount` INTEGER NOT NULL DEFAULT 0,
    `currency` VARCHAR(3) NOT NULL,
    `note` VARCHAR(300) NULL,
    `scope` VARCHAR(20) NOT NULL DEFAULT 'business',
    `source` VARCHAR(20) NOT NULL,
    `sourceRef` VARCHAR(200) NULL,
    `status` VARCHAR(20) NOT NULL,
    `confidence` VARCHAR(20) NULL,
    `consentUses` JSON NOT NULL,
    `effectiveAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `collectedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `version` INTEGER NOT NULL DEFAULT 1,
    `archivedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `fin_business_documents_businessId_issuedAt_idx`(`businessId`, `issuedAt`),
    UNIQUE INDEX `fin_business_documents_businessId_kind_number_key`(`businessId`, `kind`, `number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_business_payments` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `documentId` VARCHAR(191) NOT NULL,
    `value` INTEGER NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `receivedAt` DATETIME(3) NOT NULL,
    `method` VARCHAR(20) NULL,
    `note` VARCHAR(300) NULL,
    `scope` VARCHAR(20) NOT NULL DEFAULT 'business',
    `source` VARCHAR(20) NOT NULL,
    `sourceRef` VARCHAR(200) NULL,
    `status` VARCHAR(20) NOT NULL,
    `consentUses` JSON NOT NULL,
    `effectiveAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `collectedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `version` INTEGER NOT NULL DEFAULT 1,
    `archivedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `fin_business_payments_businessId_receivedAt_idx`(`businessId`, `receivedAt`),
    INDEX `fin_business_payments_documentId_idx`(`documentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `fin_businesses` ADD CONSTRAINT `fin_businesses_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_business_contacts` ADD CONSTRAINT `fin_business_contacts_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_business_documents` ADD CONSTRAINT `fin_business_documents_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_business_documents` ADD CONSTRAINT `fin_business_documents_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `fin_business_contacts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_business_payments` ADD CONSTRAINT `fin_business_payments_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_business_payments` ADD CONSTRAINT `fin_business_payments_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `fin_business_documents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;


-- Contraintes de cohérence. Ce qu'une CHECK peut tenir est tenu ici, au plus
-- près de la donnée ; le reste est dans les services, et dit pourquoi.

-- Une devise est un code ISO à trois lettres majuscules, partout dans le moteur.
ALTER TABLE `fin_businesses` ADD CONSTRAINT `chk_business_currency` CHECK (`currency` REGEXP '^[A-Z]{3}$');
-- Un exercice commence un mois de l'année. Le client n'a fourni aucune règle
-- d'exercice : le mois est déclaré, pas supposé janvier, mais il reste un mois.
ALTER TABLE `fin_businesses` ADD CONSTRAINT `chk_business_fiscal_month` CHECK (`fiscalYearStartMonth` BETWEEN 1 AND 12);
ALTER TABLE `fin_businesses` ADD CONSTRAINT `chk_business_version` CHECK (`version` >= 1);
ALTER TABLE `fin_businesses` ADD CONSTRAINT `chk_business_scope` CHECK (`scope` = 'business');

-- Un tiers est un client OU un fournisseur. Le même tiers peut être les deux :
-- il est alors enregistré deux fois, parce qu'un client et un fournisseur n'ont
-- ni le même solde ni le même délai de paiement.
ALTER TABLE `fin_business_contacts` ADD CONSTRAINT `chk_contact_kind` CHECK (`kind` IN ('client', 'supplier'));
ALTER TABLE `fin_business_contacts` ADD CONSTRAINT `chk_contact_version` CHECK (`version` >= 1);
ALTER TABLE `fin_business_contacts` ADD CONSTRAINT `chk_contact_country` CHECK (`country` IS NULL OR `country` REGEXP '^[A-Z]{2}$');

-- Une vente ou un achat : le sens du montant en dépend entièrement.
ALTER TABLE `fin_business_documents` ADD CONSTRAINT `chk_document_kind` CHECK (`kind` IN ('sale', 'purchase'));
-- Un document ne porte pas de montant négatif : un avoir est un document de
-- sens inverse, pas une facture au montant négatif.
ALTER TABLE `fin_business_documents` ADD CONSTRAINT `chk_document_amount` CHECK (`amountExcl` >= 0 AND `taxAmount` >= 0);
ALTER TABLE `fin_business_documents` ADD CONSTRAINT `chk_document_currency` CHECK (`currency` REGEXP '^[A-Z]{3}$');
-- Une échéance ne précède pas l'émission.
ALTER TABLE `fin_business_documents` ADD CONSTRAINT `chk_document_due` CHECK (`dueAt` IS NULL OR `dueAt` >= `issuedAt`);
ALTER TABLE `fin_business_documents` ADD CONSTRAINT `chk_document_version` CHECK (`version` >= 1);

-- Un règlement porte un montant strictement positif : un règlement de zéro
-- n'est pas un règlement, et un remboursement est un règlement de sens inverse
-- sur un document de sens inverse.
ALTER TABLE `fin_business_payments` ADD CONSTRAINT `chk_payment_value` CHECK (`value` > 0);
ALTER TABLE `fin_business_payments` ADD CONSTRAINT `chk_payment_currency` CHECK (`currency` REGEXP '^[A-Z]{3}$');
ALTER TABLE `fin_business_payments` ADD CONSTRAINT `chk_payment_version` CHECK (`version` >= 1);
