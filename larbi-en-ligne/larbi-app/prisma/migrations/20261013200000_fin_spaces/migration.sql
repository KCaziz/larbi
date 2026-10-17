-- FINCLUDIA shared spaces (P6-13), screens P01 / P04 / CO01 / CP01 / FA01.
--
-- Sharing is stored PER MEMBER, not per space: the phase rule is « données
-- privées par défaut ; rien n'entre dans un espace partagé sans action
-- explicite », so joining a space reveals nothing and each person decides, kind
-- by kind, what the others may see of theirs.
--
-- The invitation token is stored HASHED, like a session or a password-reset
-- token: a leaked database must not hand over the ability to join somebody's
-- household.

-- CreateTable
CREATE TABLE `fin_spaces` (
    `id` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(20) NOT NULL,
    `label` VARCHAR(80) NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `splitRule` VARCHAR(30) NOT NULL DEFAULT 'equal',
    `note` VARCHAR(300) NULL,
    `source` VARCHAR(20) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `archivedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `fin_spaces_kind_idx`(`kind`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_space_members` (
    `id` VARCHAR(191) NOT NULL,
    `spaceId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `role` VARCHAR(20) NOT NULL,
    `sharing` JSON NOT NULL,
    `displayName` VARCHAR(60) NULL,
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `leftAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `fin_space_members_userId_idx`(`userId`),
    UNIQUE INDEX `fin_space_members_spaceId_userId_key`(`spaceId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_space_invites` (
    `id` VARCHAR(191) NOT NULL,
    `spaceId` VARCHAR(191) NOT NULL,
    `invitedById` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(64) NOT NULL,
    `role` VARCHAR(20) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `expiresAt` DATETIME(3) NOT NULL,
    `acceptedAt` DATETIME(3) NULL,
    `acceptedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `fin_space_invites_tokenHash_key`(`tokenHash`),
    INDEX `fin_space_invites_spaceId_status_idx`(`spaceId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `fin_space_members` ADD CONSTRAINT `fin_space_members_spaceId_fkey` FOREIGN KEY (`spaceId`) REFERENCES `fin_spaces`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_space_members` ADD CONSTRAINT `fin_space_members_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_space_invites` ADD CONSTRAINT `fin_space_invites_spaceId_fkey` FOREIGN KEY (`spaceId`) REFERENCES `fin_spaces`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_space_invites` ADD CONSTRAINT `fin_space_invites_invitedById_fkey` FOREIGN KEY (`invitedById`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
-- SET NULL, not Cascade: an accepted invitation is part of the space's trail,
-- and it must survive the erasure of the account that accepted it.
ALTER TABLE `fin_space_invites` ADD CONSTRAINT `fin_space_invites_acceptedById_fkey` FOREIGN KEY (`acceptedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `fin_spaces`
  ADD CONSTRAINT `fin_spaces_kind_check` CHECK (`kind` IN ('flatshare', 'couple', 'household')),
  ADD CONSTRAINT `fin_spaces_currency_check` CHECK (`currency` REGEXP '^[A-Z]{3}$'),
  ADD CONSTRAINT `fin_spaces_split_check` CHECK (`splitRule` IN ('equal', 'income_proportional', 'custom')),
  ADD CONSTRAINT `fin_spaces_source_check` CHECK (`source` IN ('manual', 'imported', 'document', 'partner', 'computed')),
  ADD CONSTRAINT `fin_spaces_status_check` CHECK (`status` IN ('real', 'declared', 'imported', 'computed', 'fictional', 'official', 'to_confirm')),
  ADD CONSTRAINT `fin_spaces_version_check` CHECK (`version` >= 1),
  ADD CONSTRAINT `fin_spaces_label_check` CHECK (TRIM(`label`) <> '');

ALTER TABLE `fin_space_members`
  ADD CONSTRAINT `fin_space_members_role_check` CHECK (`role` IN ('owner', 'admin', 'member', 'viewer')),
  -- Sharing is an object of kind -> level. What SQL can guarantee is that the
  -- column really holds one; the levels themselves are checked by zod and by
  -- the consistency control.
  ADD CONSTRAINT `fin_space_members_sharing_check` CHECK (JSON_TYPE(`sharing`) = 'OBJECT');

ALTER TABLE `fin_space_invites`
  -- Never `owner`: a space has exactly one, and an invitation cannot grant it.
  ADD CONSTRAINT `fin_space_invites_role_check` CHECK (`role` IN ('admin', 'member', 'viewer')),
  ADD CONSTRAINT `fin_space_invites_status_check` CHECK (`status` IN ('pending', 'accepted', 'revoked', 'expired')),
  -- An accepted invitation says who accepted it and when; a pending one says
  -- neither. The two halves travel together or the trail is incomplete.
  ADD CONSTRAINT `fin_space_invites_accepted_check` CHECK (
    (`status` = 'accepted' AND `acceptedAt` IS NOT NULL) OR (`status` <> 'accepted' AND `acceptedAt` IS NULL)
  );
