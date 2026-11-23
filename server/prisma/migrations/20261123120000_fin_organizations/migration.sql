-- P13-05, lot A (2026-11-23): the business space becomes the client's
-- ORGANISATION model (« Référentiel unique Professionnels, Commerce,
-- Diaspora »): a person may hold or join several organisations; an
-- organisation has members, each with a role (tab 22_AUTORISATIONS), mandates
-- limited in time and revocable (DEC-008, CNV-14), and a journal nobody can
-- rewrite (ECR-0008). The table keeps its name: every existing row, contact,
-- document and payment stays where it is.

-- An organisation is no longer « the one business of an account »: `userId`
-- stays as the person who created it, without the uniqueness. MariaDB needs an
-- index on the foreign key before the unique one can go.
ALTER TABLE `fin_businesses` ADD INDEX `fin_businesses_userId_idx`(`userId`);
ALTER TABLE `fin_businesses` DROP INDEX `fin_businesses_userId_key`;

-- What the client's screens ECR-0162 to ECR-0164 ask of an organisation.
ALTER TABLE `fin_businesses`
    ADD COLUMN `tradeName` VARCHAR(160) NULL,
    ADD COLUMN `publicKey` VARCHAR(10) NULL,
    ADD COLUMN `sector` VARCHAR(160) NULL,
    ADD COLUMN `wilaya` VARCHAR(60) NULL,
    ADD COLUMN `timezone` VARCHAR(40) NOT NULL DEFAULT 'Africa/Algiers';
ALTER TABLE `fin_businesses` ADD CONSTRAINT `chk_business_public` CHECK (`publicKey` IS NULL OR `publicKey` IN ('PUB-01', 'PUB-02', 'PUB-03', 'PUB-04', 'PUB-05', 'PUB-06', 'PUB-07', 'PUB-08', 'PUB-09', 'PUB-10'));

-- The people of an organisation. An invitation is a member « invited » by
-- e-mail, linked to the account when it exists; it becomes « active » when
-- accepted, and « revoked » is kept, never deleted (the journal refers to it).
CREATE TABLE `fin_organization_members` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `email` VARCHAR(254) NOT NULL,
    `role` VARCHAR(40) NOT NULL,
    `status` VARCHAR(12) NOT NULL,
    `invitedById` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NULL,
    `acceptedAt` DATETIME(3) NULL,
    `revokedAt` DATETIME(3) NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `fin_organization_members_businessId_email_key`(`businessId`, `email`),
    INDEX `fin_organization_members_userId_status_idx`(`userId`, `status`),
    INDEX `fin_organization_members_email_status_idx`(`email`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `fin_organization_members` ADD CONSTRAINT `fin_organization_members_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_organization_members` ADD CONSTRAINT `fin_organization_members_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_organization_members` ADD CONSTRAINT `fin_organization_members_invitedById_fkey` FOREIGN KEY (`invitedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `fin_organization_members` ADD CONSTRAINT `chk_member_status` CHECK (`status` IN ('invited', 'active', 'revoked'));
ALTER TABLE `fin_organization_members` ADD CONSTRAINT `chk_member_role` CHECK (`role` IN ('owner', 'finance_manager', 'accountant_internal', 'accountant_external', 'collaborator', 'project_manager', 'storekeeper', 'hr_manager', 'reader'));
ALTER TABLE `fin_organization_members` ADD CONSTRAINT `chk_member_version` CHECK (`version` >= 1);

-- A mandate: what a member (an external accountant, first) may reach, for
-- what purpose, from when to when. Checked on every request (DRT-003).
CREATE TABLE `fin_organization_mandates` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `memberId` VARCHAR(191) NOT NULL,
    `scope` VARCHAR(20) NOT NULL,
    `purpose` VARCHAR(200) NOT NULL,
    `startsAt` DATETIME(3) NOT NULL,
    `endsAt` DATETIME(3) NULL,
    `revokedAt` DATETIME(3) NULL,
    `grantedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fin_organization_mandates_memberId_idx`(`memberId`),
    INDEX `fin_organization_mandates_businessId_idx`(`businessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `fin_organization_mandates` ADD CONSTRAINT `fin_organization_mandates_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_organization_mandates` ADD CONSTRAINT `fin_organization_mandates_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `fin_organization_members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_organization_mandates` ADD CONSTRAINT `fin_organization_mandates_grantedById_fkey` FOREIGN KEY (`grantedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `fin_organization_mandates` ADD CONSTRAINT `chk_mandate_scope` CHECK (`scope` IN ('finance', 'documents'));
ALTER TABLE `fin_organization_mandates` ADD CONSTRAINT `chk_mandate_period` CHECK (`endsAt` IS NULL OR `endsAt` > `startsAt`);

-- The journal of the organisation (ECR-0008): who did what, on which object,
-- when. Written by the application only; no route changes or removes a line.
CREATE TABLE `fin_organization_journal` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `actorId` VARCHAR(191) NULL,
    `action` VARCHAR(60) NOT NULL,
    `objectType` VARCHAR(40) NOT NULL,
    `objectId` VARCHAR(191) NULL,
    `details` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fin_organization_journal_businessId_createdAt_idx`(`businessId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `fin_organization_journal` ADD CONSTRAINT `fin_organization_journal_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_organization_journal` ADD CONSTRAINT `fin_organization_journal_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Idempotency-Key (DEC-005), as the client asks of every creation: the same
-- key replays the first answer instead of creating twice.
CREATE TABLE `fin_idempotency_keys` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `key` VARCHAR(120) NOT NULL,
    `route` VARCHAR(200) NOT NULL,
    `statusCode` INTEGER NOT NULL,
    `body` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `fin_idempotency_keys_userId_key_key`(`userId`, `key`),
    INDEX `fin_idempotency_keys_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `fin_idempotency_keys` ADD CONSTRAINT `fin_idempotency_keys_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Every existing business keeps its creator, now its owner.
INSERT INTO `fin_organization_members` (`id`, `businessId`, `userId`, `email`, `role`, `status`, `acceptedAt`, `version`, `createdAt`, `updatedAt`)
SELECT UUID(), `b`.`id`, `b`.`userId`, `u`.`email`, 'owner', 'active', `b`.`createdAt`, 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM `fin_businesses` `b` JOIN `users` `u` ON `u`.`id` = `b`.`userId`;
