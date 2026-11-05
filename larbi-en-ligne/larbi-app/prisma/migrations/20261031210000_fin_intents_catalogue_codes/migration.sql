-- P8-24: the client's 25 intentions (CB01 to CB24 and CB99) join the first list.
ALTER TABLE `fin_intents` DROP CONSTRAINT `fin_intents_code_check`;
ALTER TABLE `fin_intents` ADD CONSTRAINT `fin_intents_code_check` CHECK (`code` IN ('NAVIGUER', 'EXPLIQUER_INDICATEUR', 'CRÉER_OBJECTIF', 'AIDE_BUDGET', 'AIDE_DETTE', 'APPRENDRE_TERME', 'CHERCHER_SOLUTION', 'DÉPENSE_PARTAGÉE', 'CB01', 'CB02', 'CB03', 'CB04', 'CB05', 'CB06', 'CB07', 'CB08', 'CB09', 'CB10', 'CB11', 'CB12', 'CB13', 'CB14', 'CB15', 'CB16', 'CB17', 'CB18', 'CB19', 'CB20', 'CB21', 'CB22', 'CB23', 'CB24', 'CB99'));
