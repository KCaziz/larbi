-- P8-12 — Objectifs & sécurité : statut de progression, compte de l'objectif,
-- revenu irrégulier déclaré (question C3).

-- AlterTable
ALTER TABLE `fin_goals` ADD COLUMN `accountId` VARCHAR(191) NULL,
    ADD COLUMN `progressStatus` VARCHAR(10) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE `users` ADD COLUMN `finIrregularIncome` BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE `fin_goals` ADD CONSTRAINT `fin_goals_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `fin_accounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;


ALTER TABLE `fin_goals` ADD CONSTRAINT `fin_goals_progress_check` CHECK (`progressStatus` IN ('active', 'reached', 'paused', 'stopped'));
