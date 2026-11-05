-- Majorité civile à 19 ans (P6-22, chantier 1).
--
-- Le référentiel maître du client fixe `ADULT_AGE = 19` (Code civil algérien,
-- article 40). Le projet avait supposé 18, et cette supposition décidait qui
-- pouvait voir ses dettes, son patrimoine réel et une préparation de
-- financement : une personne de 18 ans y avait accès alors qu'elle est
-- mineure au regard du droit applicable.
--
-- Les tranches passent de
--   under18 | 18-24 | 25-34 | 35-49 | 50-64 | 65plus
-- à
--   under13 | 13-18 | 19-24 | 25-34 | 35-49 | 50-64 | 65plus
--
-- DEUX REMAPPAGES, ET LEUR RAISON :
--
-- `under18` -> `13-18` : le compte était mineur, il le reste. Aucun droit
-- n'est ouvert par ce changement, et l'information déclarée est préservée.
-- (Un compte de moins de 13 ans aurait aussi été `under18`, mais le produit ne
-- distingue aujourd'hui aucune fonction entre les deux tranches mineures :
-- rien n'est donc accordé à tort. La distinction servira au consentement du
-- représentant légal, qui reste à construire.)
--
-- `18-24` -> NULL : cette tranche est devenue AMBIGUË. Elle contient des
-- personnes de 18 ans, désormais mineures, et des personnes de 19 à 24 ans,
-- majeures. La remapper vers `19-24` promouvrait des mineurs ; la remapper
-- vers `13-18` retirerait des droits à des majeurs. Les deux seraient une
-- supposition silencieuse sur une règle légale.
--
-- NULL est déjà un état prévu et SÛR : `requireAdult` refuse par défaut quand
-- la tranche est inconnue, et le refus porte le motif `ageUnknown`, que
-- l'interface traduit en « indiquez votre tranche d'âge » avec le lien. La
-- personne redéclare son âge une fois, et personne ne voit ce qu'il ne doit
-- pas voir entre-temps.
UPDATE `users` SET `finAgeRange` = '13-18' WHERE `finAgeRange` = 'under18';
UPDATE `users` SET `finAgeRange` = NULL WHERE `finAgeRange` = '18-24';

-- Et la CONTRAINTE qui énumère les tranches, sans laquelle la base refuserait
-- les nouvelles valeurs que le code produit. Elle est remplacée APRÈS le
-- remappage ci-dessus : l'inverse échouerait, puisque les lignes portent
-- encore les anciennes valeurs au moment où la nouvelle règle s'installe.
--
-- L'ordre compte, et c'est le genre de détail qu'une migration de données
-- oublie : le code peut être juste, la migration peut être juste, et l'ensemble
-- échouer parce que les deux moitiés sont dans le mauvais ordre.
ALTER TABLE `users` DROP CONSTRAINT `users_fin_age_range_check`;
ALTER TABLE `users` ADD CONSTRAINT `users_fin_age_range_check` CHECK (`finAgeRange` IS NULL OR `finAgeRange` IN ('under13', '13-18', '19-24', '25-34', '35-49', '50-64', '65plus'));
