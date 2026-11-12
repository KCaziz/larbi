-- R13-02: a weekly budget.
ALTER TABLE `fin_budgets` DROP CONSTRAINT `fin_budgets_recurrence_check`;
ALTER TABLE `fin_budgets` ADD CONSTRAINT `fin_budgets_recurrence_check` CHECK (`recurrence` IN ('none', 'weekly', 'monthly', 'quarterly', 'yearly'));
