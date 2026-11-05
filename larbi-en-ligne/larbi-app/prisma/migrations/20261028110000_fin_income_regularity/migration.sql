-- The client's answer C3 (2026-10-28): « Régularité du revenu = Stable |
-- Irrégulier | Saisonnier » replaces the yes/no « revenu irrégulier ». What
-- people already declared is kept: irregular stays irregular.

-- AlterTable
ALTER TABLE `users` ADD COLUMN `finIncomeRegularity` VARCHAR(10) NOT NULL DEFAULT 'stable';

UPDATE `users` SET `finIncomeRegularity` = 'irregular' WHERE `finIrregularIncome` = true;

ALTER TABLE `users` DROP COLUMN `finIrregularIncome`;
