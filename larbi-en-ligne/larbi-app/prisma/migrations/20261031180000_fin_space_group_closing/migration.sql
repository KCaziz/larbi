-- P9-03: the fourth kind of space (group / friends) and its closing.
ALTER TABLE `fin_spaces` DROP CONSTRAINT `fin_spaces_kind_check`;
ALTER TABLE `fin_spaces` ADD CONSTRAINT `fin_spaces_kind_check` CHECK (`kind` IN ('flatshare', 'couple', 'household', 'group'));
ALTER TABLE `fin_spaces` ADD COLUMN `closedAt` DATETIME(3) NULL;
