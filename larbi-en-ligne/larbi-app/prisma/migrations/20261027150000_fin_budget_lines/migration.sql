-- P8-09 — Budgets : enveloppe par groupe de catégories du client, report du
-- reste, et rattachement modifiable des méthodes facultatives.

ALTER TABLE `fin_budgets` ADD COLUMN `carryOver` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `methodMapping` JSON NULL;
UPDATE `fin_budgets` SET `methodMapping` = '{}';
ALTER TABLE `fin_budgets` MODIFY `methodMapping` JSON NOT NULL DEFAULT '{}';

ALTER TABLE `fin_envelopes` ADD COLUMN `categoryGroup` VARCHAR(60) NULL;
