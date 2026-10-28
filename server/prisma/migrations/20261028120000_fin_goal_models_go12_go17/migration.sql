-- The client's answer D1 (2026-10-28): the six models kept beside GO-01 to
-- GO-11 take the client's codes GO-12 to GO-17, and « Autre objectif » has its
-- own icon and colour. The goals already created under an old code follow.

-- AlterTable
ALTER TABLE `fin_goals` ADD COLUMN `icon` VARCHAR(16) NULL,
    ADD COLUMN `color` VARCHAR(7) NULL;

UPDATE `fin_goals` SET `templateKey` = 'GO-12' WHERE `templateKey` = 'G09';
UPDATE `fin_goals` SET `templateKey` = 'GO-13' WHERE `templateKey` = 'G10';
UPDATE `fin_goals` SET `templateKey` = 'GO-14' WHERE `templateKey` = 'G13';
UPDATE `fin_goals` SET `templateKey` = 'GO-15' WHERE `templateKey` = 'G16';
UPDATE `fin_goals` SET `templateKey` = 'GO-16' WHERE `templateKey` = 'G17';
UPDATE `fin_goals` SET `templateKey` = 'GO-17' WHERE `templateKey` = 'G19';
