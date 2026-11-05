-- P9-04: shared expenses (split by weight and by usage, realised / planned /
-- cancelled) and the small-balance threshold of a space.
ALTER TABLE `fin_shared_expenses`
  ADD COLUMN `lifecycle` VARCHAR(12) NOT NULL DEFAULT 'done',
  ADD COLUMN `cancelledAt` DATETIME(3) NULL,
  ADD COLUMN `usageUnit` VARCHAR(30) NULL;

ALTER TABLE `fin_shared_expenses` DROP CONSTRAINT `fin_shared_expenses_split_check`;
ALTER TABLE `fin_shared_expenses`
  ADD CONSTRAINT `fin_shared_expenses_split_check` CHECK (`splitMode` IN ('equal', 'percent', 'amounts', 'income_proportional', 'weighted', 'usage')),
  ADD CONSTRAINT `fin_shared_expenses_lifecycle_check` CHECK (`lifecycle` IN ('done', 'planned', 'cancelled'));

ALTER TABLE `fin_spaces`
  ADD COLUMN `smallBalance` INTEGER NOT NULL DEFAULT 20000,
  ADD CONSTRAINT `fin_spaces_small_balance_check` CHECK (`smallBalance` >= 0);
