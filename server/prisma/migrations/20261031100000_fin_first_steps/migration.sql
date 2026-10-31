-- P8-23 — Premiers pas : les étapes mises de côté (jamais bloquantes).
ALTER TABLE `users` ADD COLUMN `finFirstSteps` JSON NULL;
UPDATE `users` SET `finFirstSteps` = '{}';
ALTER TABLE `users` MODIFY `finFirstSteps` JSON NOT NULL DEFAULT '{}';
