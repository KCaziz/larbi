-- AlterTable
ALTER TABLE `users` ADD COLUMN `finAgeRange` VARCHAR(191) NULL,
    ADD COLUMN `finCountry` VARCHAR(2) NULL,
    ADD COLUMN `finCurrency` VARCHAR(3) NOT NULL DEFAULT 'DZD',
    ADD COLUMN `finHorizon` VARCHAR(191) NULL,
    ADD COLUMN `finMainIntention` VARCHAR(191) NULL,
    ADD COLUMN `finOnboardedAt` DATETIME(3) NULL,
    ADD COLUMN `finPublic` VARCHAR(191) NULL,
    ADD COLUMN `finSecondaryPublics` JSON NOT NULL DEFAULT ('[]'),
    ADD COLUMN `finSituation` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `fin_profile_transitions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `fromPublic` VARCHAR(191) NULL,
    `toPublic` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fin_profile_transitions_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_consents` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `textKey` VARCHAR(40) NOT NULL,
    `version` VARCHAR(20) NOT NULL,
    `acceptedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fin_consents_userId_textKey_idx`(`userId`, `textKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `glossary_terms` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `term` VARCHAR(120) NOT NULL,
    `definition` TEXT NOT NULL,
    `example` TEXT NULL,
    `relatedTerms` JSON NOT NULL,
    `level` VARCHAR(191) NULL,
    `theme` VARCHAR(60) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `language` VARCHAR(191) NOT NULL DEFAULT 'fr',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `glossary_terms_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `glossary_term_revisions` (
    `id` VARCHAR(191) NOT NULL,
    `termId` VARCHAR(191) NOT NULL,
    `definition` TEXT NOT NULL,
    `example` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `glossary_term_revisions_termId_createdAt_idx`(`termId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mini_guides` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `body` MEDIUMTEXT NOT NULL,
    `level` VARCHAR(191) NULL,
    `theme` VARCHAR(60) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `language` VARCHAR(191) NOT NULL DEFAULT 'fr',
    `position` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `mini_guides_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_intents` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(40) NOT NULL,
    `label` VARCHAR(120) NOT NULL,
    `exampleQuery` VARCHAR(200) NOT NULL,
    `keywords` JSON NOT NULL,
    `responseTemplate` TEXT NOT NULL,
    `deepLinkPath` VARCHAR(200) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `position` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `fin_intents_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_flows` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(60) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `fin_flows_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_flow_steps` (
    `id` VARCHAR(191) NOT NULL,
    `flowId` VARCHAR(191) NOT NULL,
    `stepKey` VARCHAR(60) NOT NULL,
    `prompt` TEXT NOT NULL,
    `options` JSON NOT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `fin_flow_steps_flowId_stepKey_key`(`flowId`, `stepKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `intentCode` VARCHAR(40) NULL,
    `flowKey` VARCHAR(60) NULL,
    `stepKey` VARCHAR(60) NULL,
    `action` VARCHAR(30) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fin_audit_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `fin_profile_transitions` ADD CONSTRAINT `fin_profile_transitions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_consents` ADD CONSTRAINT `fin_consents_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `glossary_term_revisions` ADD CONSTRAINT `glossary_term_revisions_termId_fkey` FOREIGN KEY (`termId`) REFERENCES `glossary_terms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_flow_steps` ADD CONSTRAINT `fin_flow_steps_flowId_fkey` FOREIGN KEY (`flowId`) REFERENCES `fin_flows`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_audit_logs` ADD CONSTRAINT `fin_audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Integrity enforced by the database itself (P3-18, P2-08, P3-19).
ALTER TABLE `users`
  ADD CONSTRAINT `users_fin_public_check` CHECK (`finPublic` IS NULL OR `finPublic` IN ('LYC', 'ETU', 'JAC', 'SAL', 'COL', 'COU', 'FAM', 'EPG')),
  ADD CONSTRAINT `users_fin_secondary_publics_check` CHECK (JSON_TYPE(`finSecondaryPublics`) = 'ARRAY'),
  ADD CONSTRAINT `users_fin_age_range_check` CHECK (`finAgeRange` IS NULL OR `finAgeRange` IN ('under18', '18-24', '25-34', '35-49', '50-64', '65plus')),
  ADD CONSTRAINT `users_fin_currency_check` CHECK (`finCurrency` COLLATE utf8mb4_bin REGEXP '^[A-Z]{3}$');

ALTER TABLE `fin_profile_transitions`
  ADD CONSTRAINT `fin_profile_transitions_to_check` CHECK (`toPublic` IN ('LYC', 'ETU', 'JAC', 'SAL', 'COL', 'COU', 'FAM', 'EPG'));

ALTER TABLE `fin_consents`
  ADD CONSTRAINT `fin_consents_text_key_check` CHECK (`textKey` IN ('finPrivacy', 'finNoAdvice'));

ALTER TABLE `glossary_terms`
  ADD CONSTRAINT `glossary_terms_term_check` CHECK (OCTET_LENGTH(TRIM(`term`)) > 0),
  ADD CONSTRAINT `glossary_terms_definition_check` CHECK (OCTET_LENGTH(TRIM(`definition`)) > 0),
  ADD CONSTRAINT `glossary_terms_slug_check` CHECK (`slug` COLLATE utf8mb4_bin REGEXP '^[a-z0-9]+(-[a-z0-9]+)*$' AND OCTET_LENGTH(`slug`) <= 80),
  ADD CONSTRAINT `glossary_terms_status_check` CHECK (`status` IN ('draft', 'published')),
  ADD CONSTRAINT `glossary_terms_level_check` CHECK (`level` IS NULL OR `level` IN ('beginner', 'intermediate', 'advanced')),
  ADD CONSTRAINT `glossary_terms_language_check` CHECK (`language` IN ('fr', 'en', 'ar')),
  ADD CONSTRAINT `glossary_terms_related_check` CHECK (JSON_TYPE(`relatedTerms`) = 'ARRAY');

ALTER TABLE `mini_guides`
  ADD CONSTRAINT `mini_guides_title_check` CHECK (OCTET_LENGTH(TRIM(`title`)) > 0),
  ADD CONSTRAINT `mini_guides_slug_check` CHECK (`slug` COLLATE utf8mb4_bin REGEXP '^[a-z0-9]+(-[a-z0-9]+)*$' AND OCTET_LENGTH(`slug`) <= 80),
  ADD CONSTRAINT `mini_guides_status_check` CHECK (`status` IN ('draft', 'published')),
  ADD CONSTRAINT `mini_guides_level_check` CHECK (`level` IS NULL OR `level` IN ('beginner', 'intermediate', 'advanced')),
  ADD CONSTRAINT `mini_guides_language_check` CHECK (`language` IN ('fr', 'en', 'ar')),
  ADD CONSTRAINT `mini_guides_position_check` CHECK (`position` >= 0);

ALTER TABLE `fin_intents`
  ADD CONSTRAINT `fin_intents_code_check` CHECK (`code` IN ('NAVIGUER', 'EXPLIQUER_INDICATEUR', 'CRÉER_OBJECTIF', 'AIDE_BUDGET', 'AIDE_DETTE', 'APPRENDRE_TERME', 'CHERCHER_SOLUTION', 'DÉPENSE_PARTAGÉE')),
  ADD CONSTRAINT `fin_intents_label_check` CHECK (OCTET_LENGTH(TRIM(`label`)) > 0),
  ADD CONSTRAINT `fin_intents_response_check` CHECK (OCTET_LENGTH(TRIM(`responseTemplate`)) > 0),
  ADD CONSTRAINT `fin_intents_status_check` CHECK (`status` IN ('draft', 'published')),
  ADD CONSTRAINT `fin_intents_keywords_check` CHECK (JSON_TYPE(`keywords`) = 'ARRAY'),
  ADD CONSTRAINT `fin_intents_position_check` CHECK (`position` >= 0);

ALTER TABLE `fin_flows`
  ADD CONSTRAINT `fin_flows_key_check` CHECK (`key` COLLATE utf8mb4_bin REGEXP '^[a-z0-9]+(-[a-z0-9]+)*$'),
  ADD CONSTRAINT `fin_flows_name_check` CHECK (OCTET_LENGTH(TRIM(`name`)) > 0),
  ADD CONSTRAINT `fin_flows_status_check` CHECK (`status` IN ('draft', 'published'));

ALTER TABLE `fin_flow_steps`
  ADD CONSTRAINT `fin_flow_steps_prompt_check` CHECK (OCTET_LENGTH(TRIM(`prompt`)) > 0),
  ADD CONSTRAINT `fin_flow_steps_options_check` CHECK (JSON_TYPE(`options`) = 'ARRAY'),
  ADD CONSTRAINT `fin_flow_steps_position_check` CHECK (`position` >= 0);

ALTER TABLE `fin_audit_logs`
  ADD CONSTRAINT `fin_audit_logs_action_check` CHECK (`action` IN ('resolved', 'fallback', 'deep_link_opened', 'flow_started', 'flow_step', 'flow_ended', 'not_available'));
