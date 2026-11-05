-- P9-17: a calendar of contributions and an expected share per member on a common goal.
ALTER TABLE `fin_space_goals` ADD COLUMN `contributionEveryMonths` INTEGER NULL, ADD COLUMN `firstDueAt` DATETIME(3) NULL;
CREATE TABLE `fin_space_goal_shares` (
  `id` VARCHAR(191) NOT NULL,
  `spaceGoalId` VARCHAR(191) NOT NULL,
  `memberId` VARCHAR(191) NOT NULL,
  `amount` INTEGER NOT NULL,
  UNIQUE INDEX `fin_space_goal_shares_spaceGoalId_memberId_key`(`spaceGoalId`, `memberId`),
  INDEX `fin_space_goal_shares_memberId_idx`(`memberId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `fin_space_goal_shares` ADD CONSTRAINT `fin_space_goal_shares_spaceGoalId_fkey` FOREIGN KEY (`spaceGoalId`) REFERENCES `fin_space_goals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fin_space_goal_shares` ADD CONSTRAINT `fin_space_goal_shares_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `fin_space_members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
