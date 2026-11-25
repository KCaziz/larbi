-- P13-02 (2026-11-25) - parameterised exercises of FINCLUDIA Academy (pedagogical
-- referential, sections 2 and 21): new amounts at each attempt, the answer checked
-- by the server with a tolerance. The exercise score is the best of the grid
-- (self-assessment on the corrected answer) and of the numbered exercise.
ALTER TABLE `fin_skill_records` ADD COLUMN `exerciseVariant` JSON NULL;
ALTER TABLE `fin_skill_records` ADD COLUMN `gridScore` INTEGER NULL;
ALTER TABLE `fin_skill_records` ADD COLUMN `autoScore` INTEGER NULL;
UPDATE `fin_skill_records` SET `gridScore` = `exerciseScore` WHERE `gridScore` IS NULL AND `exerciseScore` IS NOT NULL;
