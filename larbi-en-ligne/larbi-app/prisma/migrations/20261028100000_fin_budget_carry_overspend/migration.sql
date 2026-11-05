-- The client's answer C1 (2026-10-28): the remainder carried over is
-- max(0 ; reste) by default, and the person MAY choose to carry an overspend
-- too, taking it from the next budget.

-- AlterTable
ALTER TABLE `fin_budgets` ADD COLUMN `carryOverspend` BOOLEAN NOT NULL DEFAULT false;
