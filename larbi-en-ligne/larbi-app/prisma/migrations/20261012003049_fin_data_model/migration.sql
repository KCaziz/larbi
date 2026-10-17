-- CreateTable
CREATE TABLE `fin_categories` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `family` VARCHAR(20) NOT NULL,
    `key` VARCHAR(80) NULL,
    `baseKey` VARCHAR(80) NULL,
    `label` VARCHAR(80) NOT NULL,
    `scope` VARCHAR(20) NOT NULL DEFAULT 'personal',
    `source` VARCHAR(20) NOT NULL,
    `sourceRef` VARCHAR(200) NULL,
    `status` VARCHAR(20) NOT NULL,
    `consentUses` JSON NOT NULL,
    `effectiveAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `collectedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `version` INTEGER NOT NULL DEFAULT 1,
    `archivedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `fin_categories_key_key`(`key`),
    INDEX `fin_categories_userId_family_idx`(`userId`, `family`),
    UNIQUE INDEX `fin_categories_userId_baseKey_key`(`userId`, `baseKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_changes` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `entity` VARCHAR(40) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `action` VARCHAR(20) NOT NULL,
    `field` VARCHAR(40) NULL,
    `before` JSON NULL,
    `after` JSON NULL,
    `reason` VARCHAR(200) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fin_changes_entity_entityId_createdAt_idx`(`entity`, `entityId`, `createdAt`),
    INDEX `fin_changes_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `fin_categories` ADD CONSTRAINT `fin_categories_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_changes` ADD CONSTRAINT `fin_changes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Closed vocabularies are constrained in the database too (project convention):
-- the application validates, and the database refuses anyway, so no code path
-- can store a value nobody declared. The three-shape rule of a category
-- (standard / own / override) is NOT here: it reads `userId`, and MariaDB
-- refuses a CHECK that references a FOREIGN KEY column - it is enforced by
-- services/consistency.service.js instead, like the other such rules.
ALTER TABLE `fin_categories`
  ADD CONSTRAINT `fin_categories_family_check` CHECK (`family` IN ('income', 'fixed', 'variable', 'seasonal', 'goal', 'asset', 'debt', 'shared')),
  ADD CONSTRAINT `fin_categories_scope_check` CHECK (`scope` IN ('personal', 'couple', 'household', 'space')),
  ADD CONSTRAINT `fin_categories_source_check` CHECK (`source` IN ('manual', 'imported', 'document', 'partner', 'computed')),
  ADD CONSTRAINT `fin_categories_status_check` CHECK (`status` IN ('real', 'declared', 'imported', 'computed', 'fictional', 'official', 'to_confirm')),
  ADD CONSTRAINT `fin_categories_version_check` CHECK (`version` >= 1),
  ADD CONSTRAINT `fin_categories_label_check` CHECK (TRIM(`label`) <> '');

ALTER TABLE `fin_changes`
  ADD CONSTRAINT `fin_changes_action_check` CHECK (`action` IN ('create', 'correct', 'archive', 'restore', 'delete')),
  ADD CONSTRAINT `fin_changes_entity_check` CHECK (TRIM(`entity`) <> '');

-- The standard category reference, taken from the client's own file
-- (FINCLUDIA_Cahier_des_Charges_Complet.xlsx, onglet "03_Categories") and
-- generated from src/constants/finCategories.js, which holds the same 91 rows:
-- a consistency rule checks that the two still say exactly the same thing.
--
-- These rows belong to no account (`userId` NULL): they are the platform's
-- reference, status 'official', source 'document' - the client's workbook.
INSERT INTO `fin_categories`
  (`id`, `userId`, `family`, `key`, `baseKey`, `label`, `scope`, `source`, `sourceRef`, `status`, `consentUses`, `version`, `createdAt`, `updatedAt`)
VALUES
  ('a47a98ca-6886-5db3-b468-5468da9a1e56', NULL, 'income', 'income.salaire_net', NULL, 'Salaire net', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('3f7c3422-96b9-58c9-b779-be915b5ad3ef', NULL, 'income', 'income.salaire_brut_information', NULL, 'Salaire brut (information)', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('78536d54-4a70-5fea-bed7-4f5cd47cc162', NULL, 'income', 'income.prime', NULL, 'Prime', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('58b791c3-f03e-57de-833f-253a51346e84', NULL, 'income', 'income.bourse', NULL, 'Bourse', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('462c54ab-ae70-52cc-95be-06f40240b8a3', NULL, 'income', 'income.aide_familiale', NULL, 'Aide familiale', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('918065a4-38c2-53fa-bf1c-08bfdc901151', NULL, 'income', 'income.allocation_aide', NULL, 'Allocation / aide', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('655c8f61-ec2c-5437-8142-6790d4812b5e', NULL, 'income', 'income.job_etudiant', NULL, 'Job étudiant', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('fdb1b26b-7902-5733-95e4-f23e4c98c6dd', NULL, 'income', 'income.stage_remunere', NULL, 'Stage rémunéré', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('eb966e09-eff4-5c06-b416-dcba21878228', NULL, 'income', 'income.freelance_mission', NULL, 'Freelance / mission', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('3a27e5cc-a558-5a24-99db-d09bb93eaf97', NULL, 'income', 'income.revenu_locatif', NULL, 'Revenu locatif', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('103b8ab1-e94b-5e29-9f5e-c036e30d74b8', NULL, 'income', 'income.pension', NULL, 'Pension', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('c9079dda-c0a2-508b-b72a-850247675fc2', NULL, 'income', 'income.dividende_revenu_de_placement_declare', NULL, 'Dividende / revenu de placement déclaré', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('cfddd094-3f04-5336-bba4-716b8b347a8b', NULL, 'income', 'income.autre_revenu', NULL, 'Autre revenu', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('a0f8616f-e9ee-5fb7-a081-e61feaeaea80', NULL, 'fixed', 'fixed.loyer', NULL, 'Loyer', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('06c02b43-af20-5eed-bb6d-bf82fb3c78e8', NULL, 'fixed', 'fixed.credit_immobilier', NULL, 'Crédit immobilier', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('54d836e0-2a54-59cb-b6fc-cd9a6c629516', NULL, 'fixed', 'fixed.credit_consommation', NULL, 'Crédit consommation', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('b7045a2d-770d-53ae-8f2b-0103f00f02af', NULL, 'fixed', 'fixed.assurance', NULL, 'Assurance', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('6f66efbc-8ae9-5eb3-abc2-b5ce7edd85dd', NULL, 'fixed', 'fixed.copropriete_charges', NULL, 'Copropriété / charges', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('4ba17c79-10b2-56d1-ae91-a9cad1745397', NULL, 'fixed', 'fixed.electricite', NULL, 'Électricité', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('1f6e6e4f-acf6-571d-adfc-79e6eabd1bb3', NULL, 'fixed', 'fixed.gaz', NULL, 'Gaz', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('14cc44e4-c1d9-53a5-8f79-b33ec7dbd78b', NULL, 'fixed', 'fixed.eau', NULL, 'Eau', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('a7aa1ddc-f379-5f91-ab31-c8e865bbcf69', NULL, 'fixed', 'fixed.telephone', NULL, 'Téléphone', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('fb238194-33e8-5309-a0ad-e47aea414d2e', NULL, 'fixed', 'fixed.internet', NULL, 'Internet', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('36562e12-b329-5574-be61-96e4c8634aeb', NULL, 'fixed', 'fixed.transport_recurrent', NULL, 'Transport récurrent', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('aafc5a61-1a56-597e-9095-105ce5c36d58', NULL, 'fixed', 'fixed.scolarite_etudes', NULL, 'Scolarité / études', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('3d2b25f3-3202-53a6-bc60-0e809da751d3', NULL, 'fixed', 'fixed.pension_engagement', NULL, 'Pension / engagement', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('346b9da6-92c7-5136-bac3-938ebbdaaad2', NULL, 'fixed', 'fixed.abonnement', NULL, 'Abonnement', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('4d01add5-eb04-5201-ae40-fa1c1899a79a', NULL, 'fixed', 'fixed.autre_charge_fixe', NULL, 'Autre charge fixe', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('e12c5b6f-fbdf-5c19-b286-93adcf97466d', NULL, 'variable', 'variable.alimentation_boissons', NULL, 'Alimentation / boissons', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('4559ae8c-a437-555a-ab9c-57004bb0682b', NULL, 'variable', 'variable.transport_automobile', NULL, 'Transport / automobile', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('ccaeffa6-0d49-59d5-8c02-f674d16fad0d', NULL, 'variable', 'variable.sante_hygiene', NULL, 'Santé / hygiène', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('b36b0df4-7c40-5571-aeab-821d60b0f6f4', NULL, 'variable', 'variable.habillement', NULL, 'Habillement', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('4a9dcfd0-279b-528c-933a-130990a43a40', NULL, 'variable', 'variable.maison_equipement', NULL, 'Maison / équipement', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('32fd710a-6837-5822-9cfb-eb19ff666957', NULL, 'variable', 'variable.culture_loisirs_sorties', NULL, 'Culture / loisirs / sorties', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('e6e78085-532d-5569-8e34-ac6eb3b92194', NULL, 'variable', 'variable.dons_cadeaux', NULL, 'Dons / cadeaux', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('ffdb3270-f70f-5cf5-94dd-bd5114b96c42', NULL, 'variable', 'variable.animaux', NULL, 'Animaux', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('26fb98c2-4ffb-5d47-86d2-035076a1792a', NULL, 'variable', 'variable.telecom_variable', NULL, 'Télécom variable', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('bdbdb210-ceb0-56eb-9570-8d9327dfc333', NULL, 'variable', 'variable.etudes_fournitures', NULL, 'Études / fournitures', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('afc065d0-6654-5ca2-99af-7bf2811f3eae', NULL, 'variable', 'variable.autre_depense_variable', NULL, 'Autre dépense variable', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('a3f83cd1-762a-50c3-988d-2a3fc3286f5f', NULL, 'seasonal', 'seasonal.frais_d_etudes', NULL, 'Frais d’études', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('15aaaa15-e5c9-5fc6-9363-ec8e76602eb0', NULL, 'seasonal', 'seasonal.rentree_scolaire', NULL, 'Rentrée scolaire', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('d4bae995-73fb-5d9b-bb30-41f698a13432', NULL, 'seasonal', 'seasonal.assurance_annuelle', NULL, 'Assurance annuelle', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('48067220-d777-5db4-b6e0-0f63bdf37265', NULL, 'seasonal', 'seasonal.entretien_reparation', NULL, 'Entretien / réparation', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('979b2ce5-8cef-593d-9952-3df2b444b827', NULL, 'seasonal', 'seasonal.vacances', NULL, 'Vacances', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('60a634d8-f7b4-5951-a166-418e7b8c48a2', NULL, 'seasonal', 'seasonal.fetes', NULL, 'Fêtes', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('e35437b4-a5ae-5dd9-8aaa-72991bc415ec', NULL, 'seasonal', 'seasonal.mariage', NULL, 'Mariage', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('ac23aa53-66f5-5abf-ae3f-25aea6fd343a', NULL, 'seasonal', 'seasonal.equipement', NULL, 'Équipement', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('f8f35c1f-cd76-57aa-aec6-c34dee5010c4', NULL, 'seasonal', 'seasonal.autre_depense_annuelle', NULL, 'Autre dépense annuelle', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('4e8a3bcd-0163-5b6d-a72f-781452a115b9', NULL, 'goal', 'goal.reserve_de_securite', NULL, 'Réserve de sécurité', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('47f702a5-91ca-55df-962c-cadfe651ab05', NULL, 'goal', 'goal.etudes', NULL, 'Études', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('18d882c4-7c4a-5e08-a3bb-b5befd4c17ee', NULL, 'goal', 'goal.ordinateur_equipement', NULL, 'Ordinateur / équipement', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('2da80560-f1c7-53ad-96ae-b4c0288dd055', NULL, 'goal', 'goal.permis', NULL, 'Permis', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('a8654f08-69fd-55a6-a693-c3bdcf9ecb69', NULL, 'goal', 'goal.mobilite_stage', NULL, 'Mobilité / stage', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('3dc2b43c-b045-5a69-b5fa-4e2951a95791', NULL, 'goal', 'goal.voyage', NULL, 'Voyage', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('7d7ea9f5-c2c8-59bc-ad70-29262b0f0560', NULL, 'goal', 'goal.mariage', NULL, 'Mariage', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('fada5eec-1344-517e-a4d3-82b523b95422', NULL, 'goal', 'goal.voiture', NULL, 'Voiture', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('86f42c04-3784-542a-9472-65df4507d459', NULL, 'goal', 'goal.logement', NULL, 'Logement', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('d8505eed-2ae5-52d0-ac5e-7b18e64e645d', NULL, 'goal', 'goal.enfant_etudes_enfant', NULL, 'Enfant / études enfant', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('e0277a77-7b36-5572-89f2-2f01a327df7c', NULL, 'goal', 'goal.retraite', NULL, 'Retraite', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('d2107177-0393-5597-b5bd-5fff69401ecd', NULL, 'goal', 'goal.projet_personnel', NULL, 'Projet personnel', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('adc17407-65dd-54f5-969d-758d828ee966', NULL, 'goal', 'goal.epargne_investissement', NULL, 'Épargne / investissement', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('44473602-32e0-54e3-8e84-c97fa4ab290b', NULL, 'goal', 'goal.autre', NULL, 'Autre', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('993a351a-d5d9-5e41-a1fa-890055832624', NULL, 'asset', 'asset.especes', NULL, 'Espèces', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('6fbea5a6-a534-52e9-8157-99f2b9db8d34', NULL, 'asset', 'asset.compte_bancaire', NULL, 'Compte bancaire', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('46830f2c-7ad5-596a-9284-4218186837a9', NULL, 'asset', 'asset.ccp', NULL, 'CCP', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('47448ae2-9c9b-5418-af5b-5875b554f11f', NULL, 'asset', 'asset.compte_d_epargne', NULL, 'Compte d’épargne', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('ae926353-961d-5def-9bee-7aaab310570f', NULL, 'asset', 'asset.immobilier', NULL, 'Immobilier', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('4f75acc1-aee3-5114-a5e4-a7db5521e1f6', NULL, 'asset', 'asset.or', NULL, 'Or', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('854896f7-1242-5e64-b0f1-2da7a7670cc1', NULL, 'asset', 'asset.vehicule', NULL, 'Véhicule', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('5fe76ef2-65d7-5034-aa7c-c635f4ea3bd8', NULL, 'asset', 'asset.participation_entreprise', NULL, 'Participation / entreprise', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('97d85967-739f-5e00-b36e-c935d67b72e7', NULL, 'asset', 'asset.actions_declarees', NULL, 'Actions déclarées', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('6faa9b73-32cc-559b-a5d3-862e6685fb38', NULL, 'asset', 'asset.obligations_sukuk_declares', NULL, 'Obligations / sukuk déclarés', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('c6a6d92e-d5a2-59e5-9b3a-75c6c99bc77e', NULL, 'asset', 'asset.creance', NULL, 'Créance', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('7508d75a-8d76-5f6f-b9b9-0256a17c8f09', NULL, 'asset', 'asset.autre_actif', NULL, 'Autre actif', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('452c4589-17d4-5e80-91ad-418d1b72e5f2', NULL, 'debt', 'debt.credit_immobilier', NULL, 'Crédit immobilier', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('ce48b98e-a468-514b-b064-796ef8d5a9c7', NULL, 'debt', 'debt.credit_consommation', NULL, 'Crédit consommation', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('73abb6aa-b5e6-5bfa-a360-61654dd00c62', NULL, 'debt', 'debt.financement_vehicule', NULL, 'Financement véhicule', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('4139e59c-3c2e-5a29-8cdf-fe5e8f070157', NULL, 'debt', 'debt.dette_familiale_declaree', NULL, 'Dette familiale déclarée', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('87939ff4-59f5-529b-9964-179097e615ac', NULL, 'debt', 'debt.autre_dette', NULL, 'Autre dette', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('2d925b61-db62-57b0-b1c1-fbcafb309575', NULL, 'shared', 'shared.loyer', NULL, 'Loyer', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('bc04304c-9853-5dd4-9398-9967d9b85e90', NULL, 'shared', 'shared.courses', NULL, 'Courses', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('8e21bf12-f74b-5dcd-b902-dbae7d0c9391', NULL, 'shared', 'shared.internet', NULL, 'Internet', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('022689f4-0a13-56bf-a282-427f826e8839', NULL, 'shared', 'shared.electricite', NULL, 'Électricité', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('00463b58-dd2d-5234-91e9-bacbe2dfe7bd', NULL, 'shared', 'shared.gaz', NULL, 'Gaz', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('bafe8adb-910d-5264-a001-9c9108cebde5', NULL, 'shared', 'shared.eau', NULL, 'Eau', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('e7ad952a-e216-56d2-8eb5-6de2b6dd68a6', NULL, 'shared', 'shared.menage', NULL, 'Ménage', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('6f48de67-b016-5512-be4d-feab8f4f7763', NULL, 'shared', 'shared.equipement_commun', NULL, 'Équipement commun', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('0ad7aaee-263a-5255-9f92-c40c480392fa', NULL, 'shared', 'shared.transport_commun', NULL, 'Transport commun', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('297a728a-1b03-578b-9559-95faea0b9170', NULL, 'shared', 'shared.sorties', NULL, 'Sorties', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('2c007ea1-fc78-5170-adaf-c7680d325044', NULL, 'shared', 'shared.projet_commun', NULL, 'Projet commun', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
  ('95899733-fcc9-57b0-8b47-386f29730bf9', NULL, 'shared', 'shared.autre', NULL, 'Autre', 'personal', 'document', 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories', 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3));
