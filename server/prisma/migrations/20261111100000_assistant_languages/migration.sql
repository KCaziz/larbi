-- R11-05: one FAQ question written in several languages (its translations share
-- a group); the automatic answers get their translations too, and an
-- administrator may add answers of their own (codes PERSO-…).
ALTER TABLE `chatbot_entries` ADD COLUMN `groupId` VARCHAR(36) NULL;
UPDATE `chatbot_entries` SET `groupId` = `id` WHERE `groupId` IS NULL;
CREATE INDEX `chatbot_entries_groupId_idx` ON `chatbot_entries`(`groupId`);

ALTER TABLE `fin_intents` ADD COLUMN `translations` JSON NULL;

ALTER TABLE `fin_intents` DROP CONSTRAINT `fin_intents_code_check`;
ALTER TABLE `fin_intents` ADD CONSTRAINT `fin_intents_code_check` CHECK (`code` IN ('NAVIGUER', 'EXPLIQUER_INDICATEUR', 'CRÉER_OBJECTIF', 'AIDE_BUDGET', 'AIDE_DETTE', 'APPRENDRE_TERME', 'CHERCHER_SOLUTION', 'DÉPENSE_PARTAGÉE', 'CB01', 'CB02', 'CB03', 'CB04', 'CB05', 'CB06', 'CB07', 'CB08', 'CB09', 'CB10', 'CB11', 'CB12', 'CB13', 'CB14', 'CB15', 'CB16', 'CB17', 'CB18', 'CB19', 'CB20', 'CB21', 'CB22', 'CB23', 'CB24', 'CB99') OR `code` REGEXP '^PERSO-[0-9]{3}$');
