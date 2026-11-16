-- FINCLUDIA — mise à jour de la base en ligne (2026-11-13).
-- À importer dans phpMyAdmin : choisir la base, onglet « SQL » (ou « Importer »), exécuter.
-- Rien n'est supprimé. Le fichier peut être rejoué sans risque : chaque instruction vérifie
-- d'abord que ce qu'elle ajoute n'existe pas déjà, et chaque migration n'est notée qu'une fois
-- dans `_prisma_migrations` (comme le ferait `npx prisma migrate deploy`).
-- Ajoute : le compte à débiter d'un budget et de ses enveloppes, le budget hebdomadaire,
-- et les montants en DOUBLE (grands patrimoines).

SET @OLD_FK = @@FOREIGN_KEY_CHECKS; SET FOREIGN_KEY_CHECKS = 0;

-- 1/3 — 20261104120000_fin_money_double
ALTER TABLE `fin_incomes` MODIFY COLUMN `value` DOUBLE NOT NULL;
ALTER TABLE `fin_accounts` MODIFY COLUMN `openingBalance` DOUBLE NOT NULL DEFAULT 0;
ALTER TABLE `fin_accounts` MODIFY COLUMN `minBalanceAlert` DOUBLE NULL DEFAULT NULL;
ALTER TABLE `fin_accounts` MODIFY COLUMN `maxBalanceInfo` DOUBLE NULL DEFAULT NULL;
ALTER TABLE `fin_accounts` MODIFY COLUMN `overdraftAllowed` DOUBLE NULL DEFAULT NULL;
ALTER TABLE `fin_transactions` MODIFY COLUMN `value` DOUBLE NOT NULL;
ALTER TABLE `fin_envelopes` MODIFY COLUMN `value` DOUBLE NOT NULL;
ALTER TABLE `fin_envelopes` MODIFY COLUMN `cap` DOUBLE NULL DEFAULT NULL;
ALTER TABLE `fin_goals` MODIFY COLUMN `target` DOUBLE NOT NULL;
ALTER TABLE `fin_goals` MODIFY COLUMN `allocated` DOUBLE NOT NULL DEFAULT 0;
ALTER TABLE `fin_goals` MODIFY COLUMN `monthlyContribution` DOUBLE NULL DEFAULT NULL;
ALTER TABLE `fin_debts` MODIFY COLUMN `outstandingPrincipal` DOUBLE NOT NULL;
ALTER TABLE `fin_debts` MODIFY COLUMN `monthlyInstalment` DOUBLE NOT NULL;
ALTER TABLE `fin_debts` MODIFY COLUMN `knownTotalCost` DOUBLE NULL DEFAULT NULL;
ALTER TABLE `fin_debt_payments` MODIFY COLUMN `amount` DOUBLE NOT NULL;
ALTER TABLE `fin_recurrences` MODIFY COLUMN `value` DOUBLE NOT NULL;
ALTER TABLE `fin_provisions` MODIFY COLUMN `value` DOUBLE NOT NULL;
ALTER TABLE `fin_provisions` MODIFY COLUMN `provisioned` DOUBLE NOT NULL DEFAULT 0;
ALTER TABLE `fin_assets` MODIFY COLUMN `value` DOUBLE NOT NULL;
ALTER TABLE `fin_spaces` MODIFY COLUMN `smallBalance` DOUBLE NOT NULL DEFAULT 20000;
ALTER TABLE `fin_paper_portfolios` MODIFY COLUMN `capital` DOUBLE NOT NULL;
ALTER TABLE `fin_paper_portfolios` MODIFY COLUMN `cash` DOUBLE NOT NULL;
ALTER TABLE `fin_paper_instruments` MODIFY COLUMN `markPrice` DOUBLE NOT NULL;
ALTER TABLE `fin_paper_trades` MODIFY COLUMN `unitPrice` DOUBLE NOT NULL;
ALTER TABLE `fin_paper_trades` MODIFY COLUMN `fee` DOUBLE NOT NULL;
ALTER TABLE `fin_shared_expenses` MODIFY COLUMN `value` DOUBLE NOT NULL;
ALTER TABLE `fin_shared_expenses` MODIFY COLUMN `advanceOriginalValue` DOUBLE NULL DEFAULT NULL;
ALTER TABLE `fin_shared_shares` MODIFY COLUMN `share` DOUBLE NOT NULL;
ALTER TABLE `fin_shared_shares` MODIFY COLUMN `weight` DOUBLE NULL DEFAULT NULL;
ALTER TABLE `fin_settlements` MODIFY COLUMN `value` DOUBLE NOT NULL;
ALTER TABLE `fin_space_goals` MODIFY COLUMN `target` DOUBLE NOT NULL;
ALTER TABLE `fin_space_goal_contributions` MODIFY COLUMN `amount` DOUBLE NOT NULL;
ALTER TABLE `fin_space_goal_shares` MODIFY COLUMN `amount` DOUBLE NOT NULL;
ALTER TABLE `fin_space_provisions` MODIFY COLUMN `plannedAmount` DOUBLE NOT NULL;
ALTER TABLE `fin_space_provisions` MODIFY COLUMN `alreadyProvisioned` DOUBLE NOT NULL DEFAULT 0;
ALTER TABLE `fin_business_documents` MODIFY COLUMN `amountExcl` DOUBLE NOT NULL;
ALTER TABLE `fin_business_documents` MODIFY COLUMN `taxAmount` DOUBLE NOT NULL DEFAULT 0;
ALTER TABLE `fin_business_payments` MODIFY COLUMN `value` DOUBLE NOT NULL;
ALTER TABLE `fin_payslips` MODIFY COLUMN `gross` DOUBLE NOT NULL;
ALTER TABLE `fin_payslips` MODIFY COLUMN `value` DOUBLE NOT NULL;
ALTER TABLE `fin_payslips` MODIFY COLUMN `declaredNet` DOUBLE NULL DEFAULT NULL;
ALTER TABLE `fin_space_budgets` MODIFY COLUMN `value` DOUBLE NOT NULL;
ALTER TABLE `fin_space_inflows` MODIFY COLUMN `value` DOUBLE NOT NULL;
ALTER TABLE `fin_missions` MODIFY COLUMN `startingAmount` DOUBLE NOT NULL;

-- 2/3 — 20261112120000_fin_budget_account
ALTER TABLE `fin_budgets` ADD COLUMN IF NOT EXISTS `accountId` VARCHAR(191) NULL, ADD COLUMN IF NOT EXISTS `countBalance` BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE `fin_envelopes` ADD COLUMN IF NOT EXISTS `accountId` VARCHAR(191) NULL;
CREATE INDEX IF NOT EXISTS `fin_budgets_accountId_idx` ON `fin_budgets`(`accountId`);
CREATE INDEX IF NOT EXISTS `fin_envelopes_accountId_idx` ON `fin_envelopes`(`accountId`);
ALTER TABLE `fin_budgets` DROP FOREIGN KEY IF EXISTS `fin_budgets_accountId_fkey`;
ALTER TABLE `fin_budgets` ADD CONSTRAINT `fin_budgets_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `fin_accounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `fin_envelopes` DROP FOREIGN KEY IF EXISTS `fin_envelopes_accountId_fkey`;
ALTER TABLE `fin_envelopes` ADD CONSTRAINT `fin_envelopes_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `fin_accounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 3/3 — 20261112130000_fin_budget_weekly
ALTER TABLE `fin_budgets` DROP CONSTRAINT IF EXISTS `fin_budgets_recurrence_check`;
ALTER TABLE `fin_budgets` ADD CONSTRAINT `fin_budgets_recurrence_check` CHECK (`recurrence` IN ('none', 'weekly', 'monthly', 'quarterly', 'yearly'));

SET FOREIGN_KEY_CHECKS = @OLD_FK;

-- Les trois migrations sont notées comme appliquées (une seule fois chacune).
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) SELECT UUID(), 'ec086ac0fe2c67ab17356fdf0f39c5325c5d774213d05ae8dd6b1654c35e5c8c', NOW(3), '20261104120000_fin_money_double', NULL, NULL, NOW(3), 1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `_prisma_migrations` WHERE `migration_name` = '20261104120000_fin_money_double' AND `rolled_back_at` IS NULL AND `finished_at` IS NOT NULL);
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) SELECT UUID(), '709dee79fca2956599b3224ee50d7e224dc220fba685ae6ab4a478a293d40f9c', NOW(3), '20261112120000_fin_budget_account', NULL, NULL, NOW(3), 1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `_prisma_migrations` WHERE `migration_name` = '20261112120000_fin_budget_account' AND `rolled_back_at` IS NULL AND `finished_at` IS NOT NULL);
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) SELECT UUID(), '03befc59bd8c993f0d51244c913801f33c86a85f539f11f3a24d2fc0d66a96d0', NOW(3), '20261112130000_fin_budget_weekly', NULL, NULL, NOW(3), 1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `_prisma_migrations` WHERE `migration_name` = '20261112130000_fin_budget_weekly' AND `rolled_back_at` IS NULL AND `finished_at` IS NOT NULL);

-- Vérification : doit afficher les trois migrations.
SELECT `migration_name`, `finished_at` FROM `_prisma_migrations` WHERE `migration_name` IN ('20261104120000_fin_money_double', '20261112120000_fin_budget_account', '20261112130000_fin_budget_weekly');

-- Adresse de contact du site (pied de page, page Contact) : contact@fincludia.com,
-- seulement si aucune adresse n'a encore été saisie dans l'administration.
INSERT INTO `platform_settings` (`key`, `value`, `updatedAt`) VALUES ('contactEmail', 'contact@fincludia.com', NOW(3))
  ON DUPLICATE KEY UPDATE `value` = IF(`value` = '', VALUES(`value`), `value`), `updatedAt` = IF(`value` = 'contact@fincludia.com', NOW(3), `updatedAt`);

-- 2026-11-16 (P12-06) — Référencement : identifiant Google Analytics 4, modifiable
-- dans Administration → Paramètres. Vide = aucune mesure. Sans effet s'il existe déjà.
INSERT INTO `platform_settings` (`key`, `value`, `updatedAt`) VALUES ('gaMeasurementId', '', NOW(3))
  ON DUPLICATE KEY UPDATE `key` = `key`;
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) SELECT UUID(), 'a4625281f7342511d1bce7523afed88d1583c046fe0e3e4e5f06a5ebf5d52b01', NOW(3), '20261116150000_analytics_setting', NULL, NULL, NOW(3), 1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `_prisma_migrations` WHERE `migration_name` = '20261116150000_analytics_setting' AND `rolled_back_at` IS NULL AND `finished_at` IS NOT NULL);
