-- Recette R10-05 : un revenu déclaré et le paiement régulier qui l'apporte sont
-- liés, pour que corriger, archiver ou supprimer l'un agisse sur l'autre.
ALTER TABLE `fin_recurrences` ADD COLUMN `incomeId` VARCHAR(191) NULL;
CREATE INDEX `fin_recurrences_incomeId_idx` ON `fin_recurrences`(`incomeId`);

-- Les paiements réguliers créés avec un premier revenu (même personne, même
-- nom, même montant, même fréquence) sont reliés à ce revenu.
UPDATE `fin_recurrences` r
JOIN `fin_incomes` i ON i.`userId` = r.`userId` AND i.`label` = r.`label` AND i.`value` = r.`value` AND i.`frequency` = r.`frequency` AND i.`deletedAt` IS NULL
SET r.`incomeId` = i.`id`
WHERE r.`kind` = 'income' AND r.`incomeId` IS NULL AND r.`deletedAt` IS NULL;
