-- P13-05, lot I (2026-11-25) - the partners' and institutions' own space
-- (02_ECRANS ECR-0287 to 0294, 23_PARTENAIRES PRT-006/007/019/020,
-- 22_AUTORISATIONS DRT-010 to 012, DRT-024) and the crowdfunding regulatory
-- report (ECR-0307).
--   - a financer sees only the requests sent to its offers, with what the
--     organisation consented to share (DRT-011), asks for documents (ECR-0288);
--   - an institution runs programmes and cohorts, assigns courses, and sees
--     aggregates only, under an anonymity threshold (DRT-012, DRT-024);
--   - a crowdfunding platform (CIP) reads the validated reports of the
--     campaigns linked to it (DRT-010).

CREATE TABLE `fin_partner_spaces` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(160) NOT NULL,
    `kind` VARCHAR(12) NOT NULL,
    `licences` INTEGER NOT NULL DEFAULT 0,
    `anonymityThreshold` INTEGER NOT NULL DEFAULT 5,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_partner_spaces` ADD CONSTRAINT `chk_partner_space_kind` CHECK (`kind` IN ('financer', 'institution', 'cip'));
ALTER TABLE `fin_partner_spaces` ADD CONSTRAINT `chk_partner_space_numbers` CHECK (`licences` >= 0 AND `anonymityThreshold` >= 1);

CREATE TABLE `fin_partner_space_members` (
    `id` VARCHAR(191) NOT NULL,
    `spaceId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `fin_partner_space_members_spaceId_userId_key`(`spaceId`, `userId`),
    INDEX `fin_partner_space_members_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_partner_space_members` ADD CONSTRAINT `fin_partner_space_members_spaceId_fkey` FOREIGN KEY (`spaceId`) REFERENCES `fin_partner_spaces`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_partner_space_members` ADD CONSTRAINT `fin_partner_space_members_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- An offer belongs to the financer's space that answers its requests.
ALTER TABLE `fin_partner_offers` ADD COLUMN `spaceId` VARCHAR(191) NULL;
CREATE INDEX `fin_partner_offers_spaceId_idx` ON `fin_partner_offers`(`spaceId`);
ALTER TABLE `fin_partner_offers` ADD CONSTRAINT `fin_partner_offers_spaceId_fkey` FOREIGN KEY (`spaceId`) REFERENCES `fin_partner_spaces`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- A request for a document, a comment, or an answer, on a request (ECR-0288).
CREATE TABLE `fin_partner_messages` (
    `id` VARCHAR(191) NOT NULL,
    `requestId` VARCHAR(191) NOT NULL,
    `side` VARCHAR(12) NOT NULL,
    `kind` VARCHAR(10) NOT NULL,
    `body` TEXT NOT NULL,
    `dueAt` DATETIME(3) NULL,
    `replyToId` VARCHAR(191) NULL,
    `closedAt` DATETIME(3) NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fin_partner_messages_requestId_idx`(`requestId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_partner_messages` ADD CONSTRAINT `fin_partner_messages_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `fin_partner_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_partner_messages` ADD CONSTRAINT `fin_partner_messages_replyToId_fkey` FOREIGN KEY (`replyToId`) REFERENCES `fin_partner_messages`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `fin_partner_messages` ADD CONSTRAINT `chk_partner_message_side` CHECK (`side` IN ('partner', 'organisation'));
ALTER TABLE `fin_partner_messages` ADD CONSTRAINT `chk_partner_message_kind` CHECK (`kind` IN ('piece', 'comment', 'answer'));

-- Institutions: programmes, cohorts, their learners and assigned courses.
CREATE TABLE `fin_partner_programs` (
    `id` VARCHAR(191) NOT NULL,
    `spaceId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(160) NOT NULL,
    `audience` VARCHAR(160) NULL,
    `objective` TEXT NULL,
    `startsAt` DATETIME(3) NOT NULL,
    `endsAt` DATETIME(3) NULL,
    `budget` DOUBLE NULL,
    `currency` CHAR(3) NULL,
    `milestones` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `fin_partner_programs_spaceId_idx`(`spaceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_partner_programs` ADD CONSTRAINT `fin_partner_programs_spaceId_fkey` FOREIGN KEY (`spaceId`) REFERENCES `fin_partner_spaces`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_partner_programs` ADD CONSTRAINT `chk_partner_program_dates` CHECK (`endsAt` IS NULL OR `endsAt` >= `startsAt`);
ALTER TABLE `fin_partner_programs` ADD CONSTRAINT `chk_partner_program_budget` CHECK (`budget` IS NULL OR `budget` >= 0);

CREATE TABLE `fin_partner_cohorts` (
    `id` VARCHAR(191) NOT NULL,
    `programId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(160) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fin_partner_cohorts_programId_idx`(`programId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_partner_cohorts` ADD CONSTRAINT `fin_partner_cohorts_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `fin_partner_programs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `fin_partner_cohort_formations` (
    `id` VARCHAR(191) NOT NULL,
    `cohortId` VARCHAR(191) NOT NULL,
    `formationId` VARCHAR(191) NOT NULL,
    `dueAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `fin_partner_cohort_formations_cohortId_formationId_key`(`cohortId`, `formationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_partner_cohort_formations` ADD CONSTRAINT `fin_partner_cohort_formations_cohortId_fkey` FOREIGN KEY (`cohortId`) REFERENCES `fin_partner_cohorts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_partner_cohort_formations` ADD CONSTRAINT `fin_partner_cohort_formations_formationId_fkey` FOREIGN KEY (`formationId`) REFERENCES `formations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- A learner invited by e-mail; active only once they accept (consent), which
-- also consumes a licence. Removal keeps the line, without the account.
CREATE TABLE `fin_partner_cohort_members` (
    `id` VARCHAR(191) NOT NULL,
    `cohortId` VARCHAR(191) NOT NULL,
    `email` VARCHAR(254) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `status` VARCHAR(10) NOT NULL DEFAULT 'invited',
    `invitedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `consentAt` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `fin_partner_cohort_members_cohortId_email_key`(`cohortId`, `email`),
    INDEX `fin_partner_cohort_members_userId_idx`(`userId`),
    INDEX `fin_partner_cohort_members_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_partner_cohort_members` ADD CONSTRAINT `fin_partner_cohort_members_cohortId_fkey` FOREIGN KEY (`cohortId`) REFERENCES `fin_partner_cohorts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_partner_cohort_members` ADD CONSTRAINT `fin_partner_cohort_members_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `fin_partner_cohort_members` ADD CONSTRAINT `chk_cohort_member_status` CHECK (`status` IN ('invited', 'active', 'declined', 'removed'));

-- ---- crowdfunding report (ECR-0307) --------------------------------------------------
ALTER TABLE `fin_business_campaigns` ADD COLUMN `platformSpaceId` VARCHAR(191) NULL;
ALTER TABLE `fin_business_campaigns` ADD CONSTRAINT `fin_business_campaigns_platformSpaceId_fkey` FOREIGN KEY (`platformSpaceId`) REFERENCES `fin_partner_spaces`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE `fin_business_campaign_reports` (
    `id` VARCHAR(191) NOT NULL,
    `campaignId` VARCHAR(191) NOT NULL,
    `periodFrom` DATETIME(3) NOT NULL,
    `periodTo` DATETIME(3) NOT NULL,
    `content` JSON NOT NULL,
    `status` VARCHAR(12) NOT NULL DEFAULT 'draft',
    `createdById` VARCHAR(191) NOT NULL,
    `validatedById` VARCHAR(191) NULL,
    `validatedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fin_business_campaign_reports_campaignId_idx`(`campaignId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_business_campaign_reports` ADD CONSTRAINT `fin_business_campaign_reports_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `fin_business_campaigns`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_business_campaign_reports` ADD CONSTRAINT `chk_campaign_report_status` CHECK (`status` IN ('draft', 'validated'));
ALTER TABLE `fin_business_campaign_reports` ADD CONSTRAINT `chk_campaign_report_period` CHECK (`periodTo` >= `periodFrom`);
ALTER TABLE `fin_business_campaign_reports` ADD CONSTRAINT `chk_campaign_report_two_people` CHECK (`validatedById` IS NULL OR `validatedById` <> `createdById`);
