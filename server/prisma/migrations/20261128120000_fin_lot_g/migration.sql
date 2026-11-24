-- P13-05, lot G (2026-11-24) — the modules that need no regulatory value:
-- partners (ECR-0159 to 0161, 0288), forum (ECR-0156 to 0158), human
-- resources without payroll (ECR-0272, 0273, 0278), crowdfunding preparation
-- (ECR-0301 to 0306). Payroll and accounting wait for their official rules.

-- ---- partners ---------------------------------------------------------------
-- An offer of a partner, kept by the administration: who, authorised by what,
-- checked when, for whom, on what conditions. Commercial information, never a
-- recommendation nor a promise (ECR-0160).
CREATE TABLE `fin_partner_offers` (
    `id` VARCHAR(191) NOT NULL,
    `partnerName` VARCHAR(160) NOT NULL,
    `partnerType` VARCHAR(20) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL,
    `authorization` VARCHAR(160) NULL,
    `verifiedAt` DATETIME(3) NULL,
    `wilayas` JSON NOT NULL,
    `publics` JSON NOT NULL,
    `conditions` TEXT NULL,
    `fees` VARCHAR(300) NULL,
    `sourceUrl` VARCHAR(300) NULL,
    `contactEmail` VARCHAR(254) NULL,
    `validUntil` DATETIME(3) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_partner_offers` ADD CONSTRAINT `chk_partner_type` CHECK (`partnerType` IN ('accountant', 'bank', 'leasing', 'insurance', 'microfinance', 'crowdfunding', 'support', 'training', 'institution', 'other'));

-- A request of an organisation to a partner (ECR-0161): sent only once the
-- person confirmed and consented; followed by the administration, every step
-- kept in its history.
CREATE TABLE `fin_partner_requests` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `offerId` VARCHAR(191) NOT NULL,
    `motive` VARCHAR(300) NOT NULL,
    `amount` DOUBLE NULL,
    `currency` CHAR(3) NULL,
    `message` TEXT NULL,
    `sharedItems` JSON NOT NULL,
    `consentAt` DATETIME(3) NOT NULL,
    `status` VARCHAR(12) NOT NULL DEFAULT 'sent',
    `history` JSON NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `fin_partner_requests_businessId_idx`(`businessId`),
    INDEX `fin_partner_requests_offerId_idx`(`offerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_partner_requests` ADD CONSTRAINT `fin_partner_requests_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_partner_requests` ADD CONSTRAINT `fin_partner_requests_offerId_fkey` FOREIGN KEY (`offerId`) REFERENCES `fin_partner_offers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `fin_partner_requests` ADD CONSTRAINT `chk_partner_request_status` CHECK (`status` IN ('sent', 'received', 'in_review', 'answered', 'closed', 'withdrawn'));

-- ---- forum ----------------------------------------------------------------------
-- Mutual help between members (ECR-0156, 0157): unverified content, labelled
-- as such; a message where personal data is detected waits for a moderator.
CREATE TABLE `forum_threads` (
    `id` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `category` VARCHAR(20) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `body` TEXT NOT NULL,
    `status` VARCHAR(12) NOT NULL,
    `heldReason` VARCHAR(40) NULL,
    `replyCount` INTEGER NOT NULL DEFAULT 0,
    `lastActivityAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `forum_threads_status_lastActivityAt_idx`(`status`, `lastActivityAt`),
    INDEX `forum_threads_authorId_idx`(`authorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `forum_threads` ADD CONSTRAINT `forum_threads_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `forum_threads` ADD CONSTRAINT `chk_forum_thread_category` CHECK (`category` IN ('gestion', 'facturation', 'tresorerie', 'financement', 'import_export', 'diaspora', 'rh', 'creation', 'autre'));
ALTER TABLE `forum_threads` ADD CONSTRAINT `chk_forum_thread_status` CHECK (`status` IN ('published', 'held', 'removed'));

CREATE TABLE `forum_posts` (
    `id` VARCHAR(191) NOT NULL,
    `threadId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `status` VARCHAR(12) NOT NULL,
    `heldReason` VARCHAR(40) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `forum_posts_threadId_idx`(`threadId`),
    INDEX `forum_posts_authorId_idx`(`authorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `forum_posts` ADD CONSTRAINT `forum_posts_threadId_fkey` FOREIGN KEY (`threadId`) REFERENCES `forum_threads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `forum_posts` ADD CONSTRAINT `forum_posts_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `forum_posts` ADD CONSTRAINT `chk_forum_post_status` CHECK (`status` IN ('published', 'held', 'removed'));

-- A report and the human decision taken on it (ECR-0158): traced, never an
-- opaque automatic moderation.
CREATE TABLE `forum_reports` (
    `id` VARCHAR(191) NOT NULL,
    `threadId` VARCHAR(191) NULL,
    `postId` VARCHAR(191) NULL,
    `reporterId` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(20) NOT NULL,
    `note` VARCHAR(300) NULL,
    `status` VARCHAR(12) NOT NULL DEFAULT 'open',
    `decision` VARCHAR(12) NULL,
    `decisionNote` VARCHAR(300) NULL,
    `decidedById` VARCHAR(191) NULL,
    `decidedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `forum_reports_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `forum_reports` ADD CONSTRAINT `forum_reports_threadId_fkey` FOREIGN KEY (`threadId`) REFERENCES `forum_threads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `forum_reports` ADD CONSTRAINT `forum_reports_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `forum_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `forum_reports` ADD CONSTRAINT `forum_reports_reporterId_fkey` FOREIGN KEY (`reporterId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `forum_reports` ADD CONSTRAINT `chk_forum_report_reason` CHECK (`reason` IN ('personal_data', 'abuse', 'spam', 'wrong_advice', 'other'));
ALTER TABLE `forum_reports` ADD CONSTRAINT `chk_forum_report_status` CHECK (`status` IN ('open', 'decided'));
ALTER TABLE `forum_reports` ADD CONSTRAINT `chk_forum_report_decision` CHECK (`decision` IS NULL OR `decision` IN ('kept', 'removed'));

-- ---- human resources (no payroll, no amounts) ---------------------------------------
CREATE TABLE `fin_business_employees` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(160) NOT NULL,
    `position` VARCHAR(120) NOT NULL,
    `department` VARCHAR(120) NULL,
    `contract` VARCHAR(12) NOT NULL,
    `managerName` VARCHAR(160) NULL,
    `startedAt` DATETIME(3) NOT NULL,
    `endedAt` DATETIME(3) NULL,
    `leaveRightsPerYear` DOUBLE NOT NULL DEFAULT 0,
    `leaveCarryOver` DOUBLE NOT NULL DEFAULT 0,
    `version` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `fin_business_employees_businessId_idx`(`businessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_business_employees` ADD CONSTRAINT `fin_business_employees_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_business_employees` ADD CONSTRAINT `chk_employee_contract` CHECK (`contract` IN ('cdi', 'cdd', 'stage', 'apprenti', 'interim', 'autre'));
ALTER TABLE `fin_business_employees` ADD CONSTRAINT `chk_employee_dates` CHECK (`endedAt` IS NULL OR `endedAt` >= `startedAt`);
ALTER TABLE `fin_business_employees` ADD CONSTRAINT `chk_employee_leave` CHECK (`leaveRightsPerYear` >= 0 AND `leaveCarryOver` >= 0);

-- An absence (ECR-0273): requested, then approved by another person than the
-- one who entered it, or refused. Only approved days count.
CREATE TABLE `fin_business_absences` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(12) NOT NULL,
    `startsAt` DATETIME(3) NOT NULL,
    `endsAt` DATETIME(3) NOT NULL,
    `days` DOUBLE NOT NULL,
    `status` VARCHAR(12) NOT NULL DEFAULT 'requested',
    `note` VARCHAR(300) NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `decidedById` VARCHAR(191) NULL,
    `decidedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `fin_business_absences_employeeId_idx`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_business_absences` ADD CONSTRAINT `fin_business_absences_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `fin_business_employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_business_absences` ADD CONSTRAINT `chk_absence_kind` CHECK (`kind` IN ('conge', 'maladie', 'formation', 'sans_solde', 'autre'));
ALTER TABLE `fin_business_absences` ADD CONSTRAINT `chk_absence_status` CHECK (`status` IN ('requested', 'approved', 'refused', 'cancelled'));
ALTER TABLE `fin_business_absences` ADD CONSTRAINT `chk_absence_dates` CHECK (`endsAt` >= `startsAt` AND `days` > 0);
ALTER TABLE `fin_business_absences` ADD CONSTRAINT `chk_absence_two_people` CHECK (`decidedById` IS NULL OR `decidedById` <> `createdById`);

-- ---- crowdfunding (preparation only) --------------------------------------------------
-- A campaign prepared by the organisation (ECR-0301): FINCLUDIA neither
-- collects nor invests; commitments are DECLARED by the partner platform, and
-- confirmed one by one (ECR-0306). The platform's authorisation is « not
-- confirmed » until a person checked it (ECR-0303).
CREATE TABLE `fin_business_campaigns` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(160) NOT NULL,
    `instrument` VARCHAR(12) NOT NULL,
    `target` DOUBLE NOT NULL,
    `currency` CHAR(3) NOT NULL,
    `preMoney` DOUBLE NULL,
    `startsAt` DATETIME(3) NULL,
    `endsAt` DATETIME(3) NULL,
    `platformName` VARCHAR(160) NULL,
    `platformAuthorization` VARCHAR(160) NULL,
    `platformCheckedAt` DATETIME(3) NULL,
    `risks` TEXT NULL,
    `checklist` JSON NOT NULL,
    `status` VARCHAR(12) NOT NULL DEFAULT 'preparing',
    `version` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `fin_business_campaigns_businessId_idx`(`businessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_business_campaigns` ADD CONSTRAINT `fin_business_campaigns_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_business_campaigns` ADD CONSTRAINT `chk_campaign_instrument` CHECK (`instrument` IN ('don', 'pret', 'capital', 'recompense'));
ALTER TABLE `fin_business_campaigns` ADD CONSTRAINT `chk_campaign_status` CHECK (`status` IN ('preparing', 'open', 'closed', 'cancelled'));
ALTER TABLE `fin_business_campaigns` ADD CONSTRAINT `chk_campaign_amounts` CHECK (`target` > 0 AND (`preMoney` IS NULL OR `preMoney` >= 0));
ALTER TABLE `fin_business_campaigns` ADD CONSTRAINT `chk_campaign_dates` CHECK (`endsAt` IS NULL OR `startsAt` IS NULL OR `endsAt` >= `startsAt`);

CREATE TABLE `fin_business_campaign_commitments` (
    `id` VARCHAR(191) NOT NULL,
    `campaignId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `declaredAt` DATETIME(3) NOT NULL,
    `source` VARCHAR(160) NOT NULL,
    `confirmedAt` DATETIME(3) NULL,
    `cancelledAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fin_business_campaign_commitments_campaignId_idx`(`campaignId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_business_campaign_commitments` ADD CONSTRAINT `fin_business_campaign_commitments_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `fin_business_campaigns`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_business_campaign_commitments` ADD CONSTRAINT `chk_commitment_amount` CHECK (`amount` > 0);
