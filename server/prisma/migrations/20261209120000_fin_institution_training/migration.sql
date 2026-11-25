-- P13-05, lot I bis (2026-11-25) - an institution's own training (02_ECRANS ECR-0294:
-- « Modules ; sessions ; formateurs ; quiz ; participants », « Créer session ;
-- publier ; suivre » ; 23_PARTENAIRES PRT-020: « attestation pédagogique, pas de
-- certification réglementaire implicite »).
--   - a course can belong to an institution's space: it is never in the public
--     catalogue, only open to the learners of that institution's cohorts;
--   - a session: a cohort, a trainer, dates, a place, and who attended.

ALTER TABLE `formations` ADD COLUMN `ownerSpaceId` VARCHAR(191) NULL;
CREATE INDEX `formations_ownerSpaceId_idx` ON `formations`(`ownerSpaceId`);
ALTER TABLE `formations` ADD CONSTRAINT `formations_ownerSpaceId_fkey` FOREIGN KEY (`ownerSpaceId`) REFERENCES `fin_partner_spaces`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `fin_institution_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `spaceId` VARCHAR(191) NOT NULL,
    `cohortId` VARCHAR(191) NOT NULL,
    `formationId` VARCHAR(191) NULL,
    `title` VARCHAR(160) NOT NULL,
    `trainerName` VARCHAR(160) NOT NULL,
    `startsAt` DATETIME(3) NOT NULL,
    `endsAt` DATETIME(3) NOT NULL,
    `location` VARCHAR(200) NULL,
    `status` VARCHAR(10) NOT NULL DEFAULT 'planned',
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fin_institution_sessions_spaceId_idx`(`spaceId`),
    INDEX `fin_institution_sessions_cohortId_idx`(`cohortId`),
    INDEX `fin_institution_sessions_formationId_idx`(`formationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_institution_sessions` ADD CONSTRAINT `chk_institution_session` CHECK (`status` IN ('planned', 'done', 'cancelled') AND `endsAt` >= `startsAt`);
ALTER TABLE `fin_institution_sessions` ADD CONSTRAINT `fin_institution_sessions_spaceId_fkey` FOREIGN KEY (`spaceId`) REFERENCES `fin_partner_spaces`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_institution_sessions` ADD CONSTRAINT `fin_institution_sessions_cohortId_fkey` FOREIGN KEY (`cohortId`) REFERENCES `fin_partner_cohorts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_institution_sessions` ADD CONSTRAINT `fin_institution_sessions_formationId_fkey` FOREIGN KEY (`formationId`) REFERENCES `formations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE `fin_institution_attendance` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `memberId` VARCHAR(191) NOT NULL,
    `present` BOOLEAN NOT NULL,
    `markedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `fin_institution_attendance_sessionId_memberId_key`(`sessionId`, `memberId`),
    INDEX `fin_institution_attendance_memberId_idx`(`memberId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_institution_attendance` ADD CONSTRAINT `fin_institution_attendance_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `fin_institution_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_institution_attendance` ADD CONSTRAINT `fin_institution_attendance_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `fin_partner_cohort_members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
