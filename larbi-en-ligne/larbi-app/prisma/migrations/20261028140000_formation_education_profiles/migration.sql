-- P8-17: a formation is recommended to some of the client's educational
-- profiles (LYC, ETU, JAC, SAL, EPG, AUT). Empty = for everyone.

-- AlterTable
ALTER TABLE `formations` ADD COLUMN `educationProfiles` JSON NOT NULL DEFAULT ('[]');

-- And the sixth educational profile, « autre / libre » (AUT), joins the
-- profiles a person may hold. The collective ones stay valid for the people
-- who have them until they choose (P8-17).
ALTER TABLE `users` DROP CONSTRAINT `users_fin_public_check`;
ALTER TABLE `users` ADD CONSTRAINT `users_fin_public_check` CHECK (`finPublic` IS NULL OR `finPublic` IN ('LYC', 'ETU', 'JAC', 'SAL', 'COL', 'COU', 'FAM', 'EPG', 'AUT'));
