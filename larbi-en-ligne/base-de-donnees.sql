/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.20-11.8.9-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: larbi_dev
-- ------------------------------------------------------
-- Server version	11.8.9-MariaDB-ubu2404

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES
('006d79aa-1ce3-4d65-b255-3af341e361bc','68a63ce2adb49d10d3cf9dc4bbf1bc488869fdd4f3fff5ac99efd4be61115f42','2026-11-02 08:36:40.415','20261031160000_fin_shared_personal_link',NULL,NULL,'2026-11-02 08:36:40.272',1),
('071b337e-58f6-4401-85db-80859f5af9ba','1dce6318ec88cc7051773e7cbb540891eef6564dd147c7c61fb6f645c7f3c1f1','2026-10-28 09:03:34.707','20261028090000_fin_transactions_account_cascade',NULL,NULL,'2026-10-28 09:03:34.575',1),
('07bf1a98-9f1f-42cd-a8c9-96754cfd61fb','1a06e2be0563c759044955e7f9b6ed3f2b5853b98ee2ca6466020989dd55bc47','2026-10-28 09:03:31.890','20261017090000_adult_age_19',NULL,NULL,'2026-10-28 09:03:31.807',1),
('0d27bde6-a454-4ebb-bbf4-8f2e3b58f8d0','8a547a48151a05331edc38b27d03de9e597b30b349566ef5ce733d5081e7c225','2026-10-11 07:38:25.590','20261011073811_payments',NULL,NULL,'2026-10-11 07:38:25.157',1),
('0d4bfa74-f62a-44ff-ab19-00900fd90df8','94a797dd8a728d67ce57d0c08dc6293bd639e2f397690a24b960a2ee5bfe0a71','2026-10-14 12:07:39.446','20261013220000_fin_paper',NULL,NULL,'2026-10-14 12:07:39.058',1),
('0d54b65e-d756-471b-a255-217bbf3df75f','58bf7a47465ef37f11ec9b5cf30e1d67d9eab54e134ffbab277a4c164c13fb5f','2026-10-29 12:28:12.308','20261029120000_tool_favorites',NULL,NULL,'2026-10-29 12:28:12.229',1),
('0dd00c15-88a6-4af1-a0fc-f0543959767a','c17b847092959ff94d2fc63ee5ab0abdfd13bc87209e1dfc9260a0b6701d9dd4','2026-10-14 12:07:40.233','20261014090000_fin_shared_expenses',NULL,NULL,'2026-10-14 12:07:39.449',1),
('156cb726-b338-4b5d-95c0-674f545ae660','a2bad17068acd30467d181a2b02578dd6d199f1d2522eaeb5cd15965b6fe9e9e','2026-10-10 14:40:23.707','20261007230551_long_text_columns',NULL,NULL,'2026-10-10 14:40:22.783',1),
('1976149a-95d2-45ca-bc56-d1591778f6b7','1bde2dae92b872c8b04b841306b843f81b01659f8fd49c2329531c9f405cd687','2026-10-11 07:27:27.732','20261011072704_chatbot_entries',NULL,NULL,'2026-10-11 07:27:27.653',1),
('1db7227f-999f-4c99-adc6-e5d168085a56','be70232d797218e82f8cfa039a243f268fa5911a5472542681e44cdbb6585d2b','2026-10-28 09:03:31.804','20261016120000_fin_business',NULL,NULL,'2026-10-28 09:03:30.519',1),
('1fb1a59d-ac82-4a1c-b7f5-7f29cb877419','2b84aef4f87ac66aaccce41cfee73187dab039803b4dc2288e7a77f067c2a4cb','2026-10-14 12:07:38.557','20261013180000_fin_assets',NULL,NULL,'2026-10-14 12:07:38.378',1),
('2299fcde-4379-4898-b5da-b1ecdb151966','9c63e5b19641e9dc79f1eb042bd4f7288528a3ad53e069326c9c48c1fcbac412','2026-11-02 08:36:39.719','20261031100000_fin_first_steps',NULL,NULL,'2026-11-02 08:36:39.575',1),
('22a3d89f-6210-4aac-9596-7fd26a33d07a','39ae937a0cccd159b9b0604dc2dbc96ba4f280a6f1dfb8b1666134a5a38e909a','2026-11-05 08:53:30.188','20261104120000_fin_money_double',NULL,NULL,'2026-11-05 08:53:27.695',1),
('2d6bb738-aa30-47e1-8cbe-62bc14faca69','7290dbd42ab600e5b4a744c6749a6a087eec2d82f809b2dd55587c0c93d455be','2026-11-02 08:36:40.153','20261031130000_fin_shared_expenses_rules',NULL,NULL,'2026-11-02 08:36:39.819',1),
('2f0a8b1a-0774-4d00-b5f6-fbcc286b73a0','80e99ed8aca15997fd263d8f38aa5597c1ce0dca4a38f89247fd1d92d41ab24f','2026-10-13 15:23:08.320','20261012180310_fin_money_onboarding',NULL,NULL,'2026-10-13 15:23:07.836',1),
('3020dfe7-217a-4dc3-979b-ed5a24da0038','1312bb3f20872a47d7ee3db7ce777fe7400d7af5c630c89d4ee4eb3892089164','2026-10-28 09:03:33.118','20261027130000_fin_categories_125',NULL,NULL,'2026-10-28 09:03:32.559',1),
('30af393f-1b20-4366-ac76-cf8f12143896','d2e02e7f9d67cec625e61379c41caf319330a1db95780b7c576d4429a8bf4283','2026-10-14 12:07:39.055','20261013200000_fin_spaces',NULL,NULL,'2026-10-14 12:07:38.560',1),
('34ec7891-88d5-444b-a657-b8dfa3873df1','0f93c35e2c3737c351080a8f78b5b2456e1583ea1342215e6b70390eaad446cc','2026-10-10 14:40:20.843','20261006204050_init',NULL,NULL,'2026-10-10 14:40:17.853',1),
('38ecfa27-13bf-44be-bb50-86fc3a881cbd','705ddda5aa8b57e4e34eb801401970810f5986f93a12ec6e95aa6c4ada91d8a2','2026-10-10 14:40:22.359','20261006204702_comparator_data',NULL,NULL,'2026-10-10 14:40:22.243',1),
('39ab38d2-a37b-473d-a2c0-8245f1dd1668','c57843fe98a9e9d2a8b4885638444e19ab4ded992764c729e3b6de46e2b9b1d7','2026-11-02 08:36:40.652','20261031200000_fin_debt_budget_envelope',NULL,NULL,'2026-11-02 08:36:40.608',1),
('3dda1dbb-27e2-4d97-8daa-5f3a963d2476','bb29ca0cb76dcbc3c9bf576950a34e2ceb8a7e83a6dd3e5bcb22bd5bc3c41b30','2026-11-02 08:36:40.231','20261031140000_fin_space_budgets',NULL,NULL,'2026-11-02 08:36:40.156',1),
('418133a6-a078-4615-b1ca-e02ab2ef1569','0a5fea75a8936a7f70b74e10664f8099eed9248f0bdb4150472b735ce08c604b','2026-11-02 08:36:40.447','20261031170000_fin_space_inflows',NULL,NULL,'2026-11-02 08:36:40.418',1),
('42618f5f-a44d-4d9a-9368-7a73b4868a0f','9bf9ffe53953b8174fc29766427ae8d85b53a10f99df233bb83fa1f1a7c75596','2026-10-13 15:23:08.461','20261012185725_fin_money_category_setnull',NULL,NULL,'2026-10-13 15:23:08.322',1),
('484d66f5-e021-44b9-8234-2aae65364061','ebe878822b246c7b2d037c1b0a291b07dee3b166219d06dbd4b360faa8bf2240','2026-10-28 12:35:28.834','20261028120000_fin_goal_models_go12_go17',NULL,NULL,'2026-10-28 12:35:28.798',1),
('5845694d-9f2e-4103-b597-9fc34ae6ff01','82644efd9ac6089619d2a01d0d7ebcb5d85f63a4b4b620fcbf13f1b52a365941','2026-10-13 15:23:07.834','20261012003049_fin_data_model',NULL,NULL,'2026-10-13 15:23:07.477',1),
('58795c55-d18f-473a-a260-043dc8e25c27','153735a73a5f2c2690493f24f703e31dfb988bf212b953f5951efe5f57d2178b','2026-11-02 08:36:40.576','20261031180000_fin_space_group_closing',NULL,NULL,'2026-11-02 08:36:40.451',1),
('642ea29d-2d7e-43d0-9200-591c878885d8','193ffcd4f0031c4ec4ee537e5e3dde3d2e450c8f133115baff3e4a833bbc7cd9','2026-10-14 12:07:38.375','20261013120000_fin_calendar',NULL,NULL,'2026-10-14 12:07:38.032',1),
('68223956-f731-4654-b724-79525eabc51f','bb2fc11d326f2e1dfb07cd856efe67baf0070447602bb6c3244dff5585f474c3','2026-10-11 15:08:04.365','20261011150559_finculdia_p3_18_p2_08_p3_19',NULL,NULL,'2026-10-11 15:08:03.492',1),
('6e2ec181-2574-4faf-8f4d-bedfefd4d728','c259eaf490858a87ce79ae99016770eb8530c35b18dcf4d05d6fc6518b550fd2','2026-11-02 08:36:39.816','20261031120000_user_sessions',NULL,NULL,'2026-11-02 08:36:39.737',1),
('72dfce87-0c66-4e36-a337-dcfaf26b03d0','088772f54a57a0b6cfd543ec2ec6d719149a8f6577c2e3259a0458754ca9bd43','2026-10-28 09:03:32.556','20261027121000_fin_accounts_socle',NULL,NULL,'2026-10-28 09:03:32.372',1),
('7381fca0-9f41-4cfc-a0bc-528937a28ab5','109ad56ee46afbbe5316ed76eee92e36b0ea39bf664d97d63d9f6f4e55ba24a8','2026-10-13 15:24:10.990','20261013152319_fin_goals_debts_reserve',NULL,NULL,'2026-10-13 15:24:10.384',1),
('76666184-f6d8-402f-a07f-e049a1253cfe','9122d4b6c91d81aa42108fc76b3501bd64c4954b5ca4f9d3f8ced45b3d397c3c','2026-11-02 08:36:40.754','20261031210000_fin_intents_catalogue_codes',NULL,NULL,'2026-11-02 08:36:40.655',1),
('76c36ff4-f9b8-4288-8464-fe33c5541cc5','0e7091ebe18dd8d4cf468ee04c8c42d714302ab8ae45f1d367498900697c9853','2026-10-28 09:03:33.774','20261027150000_fin_budget_lines',NULL,NULL,'2026-10-28 09:03:33.630',1),
('79f2d68e-8174-4162-8f2b-9dc0deb151e4','22bbf6e68211b1dc7aebfed52496b1e4c875631c38727981c31f843565ee729b','2026-10-28 14:36:07.495','20261028140000_formation_education_profiles',NULL,NULL,'2026-10-28 14:36:07.378',1),
('7c1d7586-ae5b-4beb-8490-b8be806e00f9','fa3dd781ab6657ee39b68a7f6edb59fc458cc9141c78e3c0576e2b3845aa4aa0','2026-10-10 14:40:22.375','20261006210000_account_types_seed',NULL,NULL,'2026-10-10 14:40:22.362',1),
('814081fe-4c2a-43df-b58b-5b0c17f6df26','bec617fcf0dfc0d29dcc8ad2f8ce024c24ea45004b2e942e61c05a139d462f84','2026-11-02 08:36:41.042','20261101100000_fin_push_subscriptions',NULL,NULL,'2026-11-02 08:36:41.005',1),
('85dfd4fb-40be-4fdb-9a2c-7510a672a376','16b48354881c9360113fffc9298897e26f13440cd632bf05f8db403946e628bd','2026-11-02 08:36:40.268','20261031150000_fin_space_tasks',NULL,NULL,'2026-11-02 08:36:40.233',1),
('93417e07-14c5-4f85-8743-c5bc6b60adc9','dc09fe1c46a6e60fca304f5907eb328c9c9f6846bb7c234f128bc194ba24a826','2026-10-28 09:03:33.628','20261027140000_fin_movements',NULL,NULL,'2026-10-28 09:03:33.121',1),
('957f6695-4c41-4331-b1fc-7ce3b2c8e0aa','e18f423ee86ef5901e1ee50dc81d24e48f66d9ed4bf77be94c78e25154fe17bd','2026-10-10 14:40:22.240','20261006204200_integrity_checks',NULL,NULL,'2026-10-10 14:40:20.850',1),
('975dc156-5647-4090-a072-a4685c215cbf','7e49511c7196ae2d1403c243a755d1291d40e82439aff871c799c38a35262db6','2026-10-14 13:34:27.203','20261014133329_fin_notifications',NULL,NULL,'2026-10-14 13:34:26.948',1),
('9da955f1-01c8-4030-93ca-58617c915f9b','7a380d85b8dd10b4c25e971e70306ccebfc47e81120aa08b02b447e137f594eb','2026-10-29 12:28:12.226','20261029090000_fin_payslips',NULL,NULL,'2026-10-29 12:28:12.154',1),
('a6465632-ef0f-42cf-84b0-f72e4de3f985','731507dc62329627d4204e8cc794796f68f63f38c81ba0ed6b846d8832b7f047','2026-11-02 08:36:39.734','20261031110000_fin_intents_personal_only',NULL,NULL,'2026-11-02 08:36:39.723',1),
('a94aa217-5bb5-4e85-9cf9-c040c853d031','5fc652a0e7581ce0d32effc2eb270fc35819af792b905f363e7fac24401564e1','2026-10-28 12:35:28.968','20261028130000_fin_categories_retired',NULL,NULL,'2026-10-28 12:35:28.836',1),
('abf7a24b-78a0-49a7-85b2-acae4f7cdf5f','11fbfd8b18da3830f4860f3d0a008e657674d9d8ee3cb24bb86469680e4ee3fa','2026-10-14 12:40:14.618','20261014123925_fin_space_goals_children_provisions',NULL,NULL,'2026-10-14 12:40:14.138',1),
('bfed6932-986b-40d5-8d3f-ccfd71cbcc6c','afea6502b55ad8e8813a0fe64101553fb4dc1dc693ba7718325098498c2a66d3','2026-10-28 09:03:34.393','20261027170000_fin_goals_accounts',NULL,NULL,'2026-10-28 09:03:34.174',1),
('c889d531-6744-42e2-9fde-252b92764691','531b9dd353c6aaaeeecf51170926b378fa6b0cc7c5db751e7e4f305f04a295a7','2026-11-02 08:36:40.816','20261031220000_fin_missions',NULL,NULL,'2026-11-02 08:36:40.757',1),
('cbe671dc-7797-434d-a8ca-06c49bf5e90d','e9ff45d7fe01dbc12d0525cff027ed831cb28c491d86a2dea89d201962acb75b','2026-11-02 08:36:41.001','20261031230000_fin_shared_receipts',NULL,NULL,'2026-11-02 08:36:40.819',1),
('cea8d428-c292-45a6-ac2f-79bdf5bf7fd1','0ba890dbaa1b9e6ec653ac2ed8074bc1e95cac47be6caddf48eab831bce2aeea','2026-10-28 09:03:34.172','20261027160000_fin_calendar_occurrences',NULL,NULL,'2026-10-28 09:03:33.776',1),
('cfd2d2f1-13e0-4223-b056-57f2ba925a15','59f0677e29be1a9c59358560156fe02aa4a5ba993a688fe9422b55ce875600c6','2026-10-28 09:03:32.368','20261027120000_fin_accounts',NULL,NULL,'2026-10-28 09:03:31.893',1),
('d6fd1731-82ad-47c4-a571-ea8bdf3e541b','da72c0034e2d00dcd86918b5acf7a3c16b9e546946bffcdb7d337e2ab3a38754','2026-10-28 12:35:28.795','20261028110000_fin_income_regularity',NULL,NULL,'2026-10-28 12:35:28.708',1),
('da584954-1f56-4573-9fe1-5c7d8c4b280b','7a65b0e6a3a93c99896efbd3930aa24abddf0d1f83bf0980b62e5d4d46752124','2026-10-15 09:35:37.777','20261015093455_formation_target_account_types',NULL,NULL,'2026-10-15 09:35:37.745',1),
('dd09612a-bc2c-46c4-8f0b-f636e82d838b','350f04ade403dce02b29395e11f6eeee83e25be74c29efcb17685c7981d30394','2026-10-13 15:23:07.473','20261011212102_apprendre_axes_favorites',NULL,NULL,'2026-10-13 15:23:07.022',1),
('de6bbb28-3f46-4145-94ce-671711db3b41','49e727f64a2ed9cd8bf556105b3246c2810cb4174b072fe2b03c94750ed27e68',NULL,'20261011150559_finculdia_p3_18_p2_08_p3_19','A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20261011150559_finculdia_p3_18_p2_08_p3_19\n\nDatabase error code: 4025\n\nDatabase error:\nCONSTRAINT `users.finSecondaryPublics` failed for `larbi_dev`.`users`\n\nPlease check the query number 16 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"20261011150559_finculdia_p3_18_p2_08_p3_19\"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name=\"20261011150559_finculdia_p3_18_p2_08_p3_19\"\n             at schema-engine\\commands\\src\\commands\\apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:255','2026-10-11 15:07:31.664','2026-10-11 15:06:42.209',0),
('deb2efad-8c2e-42dd-9a05-7cb0a97e8df7','1741a7e6fbbba782aa134556b2a362d9b0b5106b785d5ddc568821bc51fec35a','2026-10-10 14:40:23.795','20261009195759_simulation_scenarios',NULL,NULL,'2026-10-10 14:40:23.710',1),
('e4004aaa-732d-4c55-9f63-2078ced3e506','1234f5199b811f4fd27f96c887b48467798fde87cf49502292f429ab5372f10c','2026-11-03 10:21:21.727','20261102140000_fin_space_goal_calendar',NULL,NULL,'2026-11-03 10:21:21.569',1),
('e5573013-1cae-4512-ab52-cf164c477191','ac83ebbec273be63126a9bbc5e39b0430c4f9b5bc54a25e5af5c340bc4062509','2026-10-28 12:35:28.705','20261028100000_fin_budget_carry_overspend',NULL,NULL,'2026-10-28 12:35:28.665',1),
('e55f4a5e-bf28-4c64-861c-8a5dcfeb25d5','aeed228837c50d043828e21e3af8ca954502547212fc01d724093d9a5bebe242','2026-10-13 15:23:08.683','20261012192000_fin_receipt_on_media',NULL,NULL,'2026-10-13 15:23:08.463',1),
('eb87ac4f-f8d1-4426-acea-f19af291ae4c','4e0117726a7afa6676fcbecddfd40cb3e4d01d61ec0160386201f4e0d7077b5e','2026-10-28 09:03:34.572','20261027180000_fin_debts_receivables',NULL,NULL,'2026-10-28 09:03:34.395',1),
('f0a48115-3598-48cb-8d06-dbb54d9bafa9','4a8ea78d982054d0730fcb53e9d0971240a06104c267cca799539cca321bc637','2026-10-10 14:40:22.779','20261006211000_case_sensitive_checks',NULL,NULL,'2026-10-10 14:40:22.378',1),
('f66b1d25-9910-4d45-85f7-638da8628a2e','e1db5611f13ca75b0a74220e4fe9d14546571060fed49f90a794737d278626cf','2026-10-13 15:23:09.036','20261013090000_fin_budgets',NULL,NULL,'2026-10-13 15:23:08.685',1),
('f678044e-16e5-4c97-8864-5053fe484f91','3dd0a42d0abda10bb7216a0628dc6bb8a7060d6401c902bfd4efe0c795a6f3f3','2026-11-02 08:36:40.606','20261031190000_fin_snapshots',NULL,NULL,'2026-11-02 08:36:40.578',1),
('f8a906d5-4622-45a2-82da-0e6c7f1d0336','1e9f91ed20578ace597dbe1fc4857bf000e63ad11299ec4c64fe43de7e8370b6','2026-11-03 10:21:21.566','20261102120000_fin_shared_advance',NULL,NULL,'2026-11-03 10:21:21.452',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `account_types`
--

DROP TABLE IF EXISTS `account_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_types` (
  `id` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `label` varchar(191) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `order` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_types_slug_key` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_types`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `account_types` WRITE;
/*!40000 ALTER TABLE `account_types` DISABLE KEYS */;
INSERT INTO `account_types` VALUES
('a0000000-0000-4000-8000-000000000001','auto-entrepreneur','Auto-entrepreneur',1,1,'2026-09-26 07:41:06.245','2026-09-26 07:41:06.245'),
('a0000000-0000-4000-8000-000000000002','pme','PME',1,2,'2026-09-26 07:41:06.245','2026-09-26 07:41:06.245'),
('a0000000-0000-4000-8000-000000000003','pmi','PMI',1,3,'2026-09-26 07:41:06.245','2026-09-26 07:41:06.245'),
('a0000000-0000-4000-8000-000000000004','etudiant','Étudiant',1,4,'2026-09-26 07:41:06.245','2026-09-26 07:41:06.245'),
('a0000000-0000-4000-8000-000000000005','lyceen','Lycéen',1,5,'2026-09-26 07:41:06.245','2026-09-26 07:41:06.245'),
('a0000000-0000-4000-8000-000000000006','salarie','Salarié',1,6,'2026-09-26 07:41:06.245','2026-09-26 07:41:06.245');
/*!40000 ALTER TABLE `account_types` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `article_categories`
--

DROP TABLE IF EXISTS `article_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `article_categories` (
  `id` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `article_categories_slug_key` (`slug`),
  CONSTRAINT `article_categories_slug_check` CHECK (`slug` collate utf8mb4_bin regexp '^[a-z0-9]+(-[a-z0-9]+)*$' and octet_length(`slug`) <= 80)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `article_categories`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `article_categories` WRITE;
/*!40000 ALTER TABLE `article_categories` DISABLE KEYS */;
INSERT INTO `article_categories` VALUES
('9791760d-7c70-406e-a73e-05b92b182408','demo-conseils','Conseils','2026-10-06 14:51:48.874'),
('d76168a7-3e4a-4116-8b3a-08dd2b58a152','demo-actualites','Actualités','2026-10-06 14:51:48.877');
/*!40000 ALTER TABLE `article_categories` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `article_tags`
--

DROP TABLE IF EXISTS `article_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `article_tags` (
  `articleId` varchar(191) NOT NULL,
  `tagId` varchar(191) NOT NULL,
  PRIMARY KEY (`articleId`,`tagId`),
  KEY `article_tags_tagId_idx` (`tagId`),
  CONSTRAINT `article_tags_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `article_tags_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `tags` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `article_tags`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `article_tags` WRITE;
/*!40000 ALTER TABLE `article_tags` DISABLE KEYS */;
INSERT INTO `article_tags` VALUES
('0c96177d-1dcf-457f-b376-31a4a463fb65','0c8edbe8-8f96-46ae-a725-763853568f2f'),
('8591d49f-e1ab-4a6e-85df-b1de485cb494','0c8edbe8-8f96-46ae-a725-763853568f2f'),
('616f5132-3faf-45bd-b8d3-dde50f6cf841','40985e9c-8d4d-457d-a90a-ec87dd00af79'),
('8591d49f-e1ab-4a6e-85df-b1de485cb494','40985e9c-8d4d-457d-a90a-ec87dd00af79'),
('28d306ff-573c-4ba2-b1b5-51d0d3705c2e','7837a2cc-a3a9-4dd7-8a3d-13b8c8402824'),
('28d306ff-573c-4ba2-b1b5-51d0d3705c2e','fe9d496a-1f5d-43a0-b45b-bbeff5be14cb');
/*!40000 ALTER TABLE `article_tags` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `article_translations`
--

DROP TABLE IF EXISTS `article_translations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `article_translations` (
  `id` varchar(191) NOT NULL,
  `articleId` varchar(191) NOT NULL,
  `language` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `excerpt` text NOT NULL DEFAULT '',
  `body` mediumtext DEFAULT NULL,
  `bodyText` mediumtext NOT NULL DEFAULT '',
  `metaTitle` varchar(191) DEFAULT NULL,
  `metaDescription` varchar(191) DEFAULT NULL,
  `pending` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `article_translations_articleId_language_key` (`articleId`,`language`),
  CONSTRAINT `article_translations_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `article_translations_language_check` CHECK (`language` in ('fr','en','ar')),
  CONSTRAINT `article_translations_content_check` CHECK (octet_length(trim(`title`)) > 0 and `bodyText` <> '')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `article_translations`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `article_translations` WRITE;
/*!40000 ALTER TABLE `article_translations` DISABLE KEYS */;
/*!40000 ALTER TABLE `article_translations` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `articles`
--

DROP TABLE IF EXISTS `articles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `articles` (
  `id` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `language` varchar(191) NOT NULL DEFAULT 'fr',
  `title` varchar(191) NOT NULL,
  `excerpt` text NOT NULL DEFAULT '',
  `body` mediumtext DEFAULT NULL,
  `bodyText` mediumtext NOT NULL DEFAULT '',
  `status` varchar(191) NOT NULL DEFAULT 'draft',
  `publishedAt` datetime(3) DEFAULT NULL,
  `requiredAccessLevel` varchar(191) NOT NULL DEFAULT 'standard',
  `targetAccountTypes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`targetAccountTypes`)),
  `categoryId` varchar(191) DEFAULT NULL,
  `coverImageId` varchar(191) DEFAULT NULL,
  `authorId` varchar(191) DEFAULT NULL,
  `metaTitle` varchar(191) DEFAULT NULL,
  `metaDescription` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `level` varchar(191) DEFAULT NULL,
  `theme` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `articles_slug_key` (`slug`),
  UNIQUE KEY `articles_coverImageId_key` (`coverImageId`),
  KEY `articles_status_publishedAt_idx` (`status`,`publishedAt`),
  KEY `articles_categoryId_idx` (`categoryId`),
  KEY `articles_authorId_fkey` (`authorId`),
  CONSTRAINT `articles_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `articles_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `article_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `articles_coverImageId_fkey` FOREIGN KEY (`coverImageId`) REFERENCES `media` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `articles_status_check` CHECK (`status` in ('draft','published')),
  CONSTRAINT `articles_publishedAt_check` CHECK (`status` = 'published' = (`publishedAt` is not null)),
  CONSTRAINT `articles_title_check` CHECK (octet_length(trim(`title`)) > 0),
  CONSTRAINT `articles_required_access_level_check` CHECK (`requiredAccessLevel` in ('standard','premium')),
  CONSTRAINT `articles_language_check` CHECK (`language` in ('fr','en','ar')),
  CONSTRAINT `articles_slug_check` CHECK (`slug` collate utf8mb4_bin regexp '^[a-z0-9]+(-[a-z0-9]+)*$' and octet_length(`slug`) <= 80),
  CONSTRAINT `articles_level_check` CHECK (`level` is null or `level` in ('beginner','intermediate','advanced'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `articles`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `articles` WRITE;
/*!40000 ALTER TABLE `articles` DISABLE KEYS */;
INSERT INTO `articles` VALUES
('0c96177d-1dcf-457f-b376-31a4a463fb65','demo-calendrier-fiscal','fr','Le calendrier fiscal de l’année','Toutes les dates à retenir pour ne rien oublier.','<h2>Les grandes échéances</h2><p>Déclarations, acomptes, régularisations : notez-les dès le début de l’année.</p><blockquote>Une échéance manquée coûte souvent plus cher que la préparer à l’avance.</blockquote>','Les grandes échéances Déclarations, acomptes, régularisations : notez-les dès le début de l’année. Une échéance manquée coûte souvent plus cher que la préparer à l’avance.','published','2026-09-30 14:51:48.897','premium','[\"pmi\",\"pme\"]','d76168a7-3e4a-4116-8b3a-08dd2b58a152',NULL,'dd81c796-b6b8-49bd-a807-876c1c531d0b',NULL,NULL,'2026-09-29 14:51:48.897','2026-10-06 14:51:48.899',NULL,NULL),
('28d306ff-573c-4ba2-b1b5-51d0d3705c2e','azdda','fr','azdda','legal.notice','<p>legal.noticelegal.noticelegal.noticelegal.noticelegal.noticelegal.notice</p><p>legal.noticelegal.noticelegal.noticelegal.noticelegal.notice</p><ol><li><p>legal.noticelegal.noticelegal.noticelegal.noticev</p></li><li><p>legal.noticevv</p></li></ol><h2>legal.notice<em>z</em>legal.noticelegal.noticelegal.noticelegal.noticelegal.notice</h2><p>legal.noticelegal.notice</p>','legal.noticelegal.noticelegal.noticelegal.noticelegal.noticelegal.notice legal.noticelegal.noticelegal.noticelegal.noticelegal.notice legal.noticelegal.noticelegal.noticelegal.noticev legal.noticevv legal.noticezlegal.noticelegal.noticelegal.noticelegal.noticelegal.notice legal.noticelegal.notice','published','2026-09-22 07:08:12.704','standard','[\"auto-entrepreneur\"]',NULL,'290456ea-42b3-4b08-94ac-69c8e55d4218',NULL,'aziz','legal.notice','2026-09-22 07:04:53.571','2026-09-22 07:08:12.711',NULL,NULL),
('616f5132-3faf-45bd-b8d3-dde50f6cf841','demo-5-erreurs-de-tresorerie','fr','5 erreurs de trésorerie à éviter','Les pièges les plus fréquents des petites entreprises.','<p>La trésorerie est le nerf de la guerre. Voici les <strong>cinq erreurs</strong> les plus courantes.</p><ol><li>Confondre bénéfice et trésorerie</li><li>Ne pas relancer les factures</li><li>Ignorer les échéances fiscales</li><li>Mélanger comptes personnels et professionnels</li><li>Ne pas prévoir de marge de sécurité</li></ol>','La trésorerie est le nerf de la guerre. Voici les cinq erreurs les plus courantes. Confondre bénéfice et trésorerie Ne pas relancer les factures Ignorer les échéances fiscales Mélanger comptes personnels et professionnels Ne pas prévoir de marge de sécurité','published','2026-09-24 14:51:48.884','standard','[\"pme\"]','9791760d-7c70-406e-a73e-05b92b182408',NULL,'dd81c796-b6b8-49bd-a807-876c1c531d0b',NULL,NULL,'2026-09-23 14:51:48.884','2026-10-06 14:51:48.892',NULL,NULL),
('8591d49f-e1ab-4a6e-85df-b1de485cb494','demo-choisir-un-outil-de-facturation','fr','Bien choisir son outil de facturation','Les critères qui comptent vraiment.','<p>Facturation conforme, export comptable, simplicité : trois critères pour comparer les solutions.</p>','Facturation conforme, export comptable, simplicité : trois critères pour comparer les solutions.','published','2026-10-04 14:51:48.903','standard','[\"pmi\",\"auto-entrepreneur\"]','9791760d-7c70-406e-a73e-05b92b182408',NULL,'dd81c796-b6b8-49bd-a807-876c1c531d0b',NULL,NULL,'2026-10-03 14:51:48.903','2026-10-06 14:51:48.904',NULL,NULL),
('da0eee8d-6afc-4f7a-b2d4-1f01355626b7','demo-article-brouillon','fr','Article en cours de rédaction','Brouillon visible seulement dans le CMS.','<p>Ce texte n’est pas encore publié.</p>','Ce texte n’est pas encore publié.','draft',NULL,'standard','[]','9791760d-7c70-406e-a73e-05b92b182408',NULL,'dd81c796-b6b8-49bd-a807-876c1c531d0b',NULL,NULL,'2026-10-05 14:51:48.908','2026-10-06 14:51:48.910',NULL,NULL);
/*!40000 ALTER TABLE `articles` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `certifications`
--

DROP TABLE IF EXISTS `certifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `certifications` (
  `id` varchar(191) NOT NULL,
  `certificateNumber` varchar(191) NOT NULL,
  `enrollmentId` varchar(191) NOT NULL,
  `holderName` varchar(191) NOT NULL,
  `formationTitle` varchar(191) NOT NULL,
  `certificationTitle` varchar(191) DEFAULT NULL,
  `issuedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `revokedAt` datetime(3) DEFAULT NULL,
  `revokedReason` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `certifications_certificateNumber_key` (`certificateNumber`),
  UNIQUE KEY `certifications_enrollmentId_key` (`enrollmentId`),
  CONSTRAINT `certifications_enrollmentId_fkey` FOREIGN KEY (`enrollmentId`) REFERENCES `enrollments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `certifications_revoked_reason_check` CHECK (`revokedReason` is null or `revokedAt` is not null)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certifications`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `certifications` WRITE;
/*!40000 ALTER TABLE `certifications` DISABLE KEYS */;
INSERT INTO `certifications` VALUES
('116e4378-ae3e-4753-98a9-bfdd33634f05','FINCLUDIA-E3BJ-FUZH-3BNY','d91f13e2-f261-4c87-bf7a-4663305949d1','Admin Démo','Ma mutuelle','Expert','2026-10-17 09:18:13.878',NULL,NULL),
('955b9cd2-92d1-4602-89f2-fa09fc73f3c7','LARBI-PZR4-NYKC-FFYF','1a7b66a4-cad9-4a0b-848f-7f489ad4825d','Karim Premium','Comptabilité de base','Certificat en comptabilité de base','2026-09-28 14:51:48.871',NULL,NULL);
/*!40000 ALTER TABLE `certifications` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `chatbot_entries`
--

DROP TABLE IF EXISTS `chatbot_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `chatbot_entries` (
  `id` varchar(191) NOT NULL,
  `question` varchar(200) NOT NULL,
  `answer` text NOT NULL,
  `language` varchar(2) NOT NULL DEFAULT 'fr',
  `status` varchar(20) NOT NULL DEFAULT 'draft',
  `position` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `chatbot_entries_language_status_position_idx` (`language`,`status`,`position`),
  CONSTRAINT `chatbot_entries_question_check` CHECK (octet_length(trim(`question`)) > 0),
  CONSTRAINT `chatbot_entries_answer_check` CHECK (octet_length(trim(`answer`)) > 0),
  CONSTRAINT `chatbot_entries_language_check` CHECK (`language` in ('fr','en','ar')),
  CONSTRAINT `chatbot_entries_status_check` CHECK (`status` in ('draft','published')),
  CONSTRAINT `chatbot_entries_position_check` CHECK (`position` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chatbot_entries`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `chatbot_entries` WRITE;
/*!40000 ALTER TABLE `chatbot_entries` DISABLE KEYS */;
INSERT INTO `chatbot_entries` VALUES
('343afaf6-3891-43a3-97ad-2d3277bc228f','Comment obtenir mon certificat de formation ?','<p>Le certificat est délivré automatiquement une fois les cours obligatoires d\'une formation terminés. Il est ensuite disponible dans « Mon espace » puis « Mes certificats ».</p>','fr','published',3,'2026-10-11 14:47:05.275','2026-10-11 14:47:05.275'),
('39bb9c06-6106-452e-92ad-7a077752a543','Comment suivre ma progression dans une formation ?','<p>Une fois inscrit à une formation, ouvrez « Mon espace » puis « Mes formations » : vous y retrouvez l\'avancement de chaque cours.</p>','fr','published',2,'2026-10-11 14:47:05.178','2026-10-11 14:47:05.178'),
('3b30b31c-d9c1-47cd-aeeb-68aa1f35f665','Comment créer un compte ?','<p>Cliquez sur « Inscription » en haut du site, renseignez votre nom, votre e-mail, un mot de passe et votre type de compte. Vous pouvez vous connecter immédiatement après.</p>','fr','published',0,'2026-10-11 14:47:04.977','2026-10-11 14:47:04.977'),
('89484ddd-ff76-4393-ac3f-c7d185a7765e','Comment contacter l\'équipe ?','<p>Utilisez le formulaire de la page « Contact », accessible depuis le pied de page.</p>','fr','published',5,'2026-10-11 14:47:05.467','2026-10-11 14:47:05.467'),
('abb95bd4-7996-42aa-ae8a-35e43ddd0dda','Le comparateur bancaire est-il gratuit ?','<p>Oui. Le comparateur bancaire est consultable librement, sans créer de compte.</p>','fr','published',1,'2026-10-11 14:47:05.080','2026-10-11 14:47:05.080'),
('e4be60f6-417f-485b-8158-6bc2cc989192','Comment vérifier l\'authenticité d\'un certificat ?','<p>Rendez-vous sur la page « Vérification » (lien en pied de page) et saisissez le numéro du certificat.</p>','fr','published',4,'2026-10-11 14:47:05.374','2026-10-11 14:47:05.374');
/*!40000 ALTER TABLE `chatbot_entries` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `comparator_banks`
--

DROP TABLE IF EXISTS `comparator_banks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `comparator_banks` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `comparator_banks_name_key` (`name`),
  CONSTRAINT `comparator_banks_name_check` CHECK (octet_length(trim(`name`)) > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comparator_banks`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `comparator_banks` WRITE;
/*!40000 ALTER TABLE `comparator_banks` DISABLE KEYS */;
INSERT INTO `comparator_banks` VALUES
('c0000000-0000-4000-8000-000000000001','Al Baraka','2026-10-04 07:57:52.276','2026-10-04 07:57:52.276'),
('c0000000-0000-4000-8000-000000000002','Al Salam Bank','2026-10-04 07:57:52.276','2026-10-04 07:57:52.276'),
('c0000000-0000-4000-8000-000000000003','HSBC','2026-10-04 07:57:52.276','2026-10-04 07:57:52.276'),
('c0000000-0000-4000-8000-000000000004','Fransabank','2026-10-04 07:57:52.276','2026-10-04 07:57:52.276'),
('c0000000-0000-4000-8000-000000000005','TBA','2026-10-04 07:57:52.276','2026-10-04 07:57:52.276'),
('c0000000-0000-4000-8000-000000000006','BNH','2026-10-04 07:57:52.276','2026-10-04 07:57:52.276'),
('c0000000-0000-4000-8000-000000000007','BADR','2026-10-04 07:57:52.276','2026-10-04 07:57:52.276'),
('c0000000-0000-4000-8000-000000000008','CPA','2026-10-04 07:57:52.276','2026-10-04 07:57:52.276'),
('c0000000-0000-4000-8000-000000000009','BNP Paribas','2026-10-04 07:57:52.276','2026-10-04 07:57:52.276'),
('c0000000-0000-4000-8000-000000000010','SGA','2026-10-04 07:57:52.276','2026-10-04 07:57:52.276'),
('c0000000-0000-4000-8000-000000000011','Natixis','2026-10-04 07:57:52.276','2026-10-04 07:57:52.276'),
('c0000000-0000-4000-8000-000000000012','ABC Bank','2026-10-04 07:57:52.276','2026-10-04 07:57:52.276'),
('c0000000-0000-4000-8000-000000000013','CNEP','2026-10-04 07:57:52.276','2026-10-04 07:57:52.276');
/*!40000 ALTER TABLE `comparator_banks` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `comparator_conditions`
--

DROP TABLE IF EXISTS `comparator_conditions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `comparator_conditions` (
  `id` varchar(191) NOT NULL,
  `bankId` varchar(191) NOT NULL,
  `theme` varchar(191) NOT NULL,
  `segment` varchar(191) NOT NULL DEFAULT 'non_precise',
  `category` varchar(191) DEFAULT NULL,
  `label` text NOT NULL,
  `values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`values`)),
  `position` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `comparator_conditions_theme_position_idx` (`theme`,`position`),
  KEY `comparator_conditions_bankId_idx` (`bankId`),
  CONSTRAINT `comparator_conditions_bankId_fkey` FOREIGN KEY (`bankId`) REFERENCES `comparator_banks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `comparator_conditions_theme_check` CHECK (`theme` in ('comptes','versements-retraits','carte-locale','epargne','coffres-forts','credits','virements','carte-internationale','devises','operations-diverses','cheques')),
  CONSTRAINT `comparator_conditions_segment_check` CHECK (`segment` in ('particulier','professionnel','entreprise','non_precise')),
  CONSTRAINT `comparator_conditions_label_check` CHECK (octet_length(trim(`label`)) > 0),
  CONSTRAINT `comparator_conditions_category_check` CHECK (`category` is null or octet_length(trim(`category`)) > 0),
  CONSTRAINT `comparator_conditions_values_check` CHECK (json_type(`values`) = 'OBJECT')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comparator_conditions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `comparator_conditions` WRITE;
/*!40000 ALTER TABLE `comparator_conditions` DISABLE KEYS */;
INSERT INTO `comparator_conditions` VALUES
('c1000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000001','comptes','particulier',NULL,'Compte Chèque (Particulier)','{\"fee\":\"100 DA\",\"period\":\"Mensuel\"}',0,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000002','c0000000-0000-4000-8000-000000000001','comptes','professionnel',NULL,'Compte Courant (Professionnel)','{\"fee\":\"200 DA\",\"period\":\"Mensuel\"}',1,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000003','c0000000-0000-4000-8000-000000000001','comptes','entreprise',NULL,'Compte Courant (Entreprise)','{\"fee\":\"1 000 DA\",\"period\":\"Mensuel\"}',2,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000004','c0000000-0000-4000-8000-000000000001','comptes','non_precise',NULL,'Compte Épargne','{\"fee\":\"Gratuit\"}',3,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000005','c0000000-0000-4000-8000-000000000001','comptes','non_precise',NULL,'Compte Devises','{\"fee\":\"Gratuit\"}',4,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000006','c0000000-0000-4000-8000-000000000002','comptes','non_precise',NULL,'Compte Courant','{\"fee\":\"2 500 DA\",\"period\":\"Trimestriel\"}',5,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000007','c0000000-0000-4000-8000-000000000002','comptes','non_precise',NULL,'Compte Chèque','{\"fee\":\"1 000 DA\",\"period\":\"Trimestriel\"}',6,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000008','c0000000-0000-4000-8000-000000000002','comptes','non_precise',NULL,'Compte Tawfir (Épargne)','{\"fee\":\"Gratuit\"}',7,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000009','c0000000-0000-4000-8000-000000000003','comptes','entreprise',NULL,'Compte Commercial DZD (Entreprise)','{\"fee\":\"3 750 DA\",\"period\":\"Annuel\"}',8,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000010','c0000000-0000-4000-8000-000000000004','comptes','particulier',NULL,'Compte Chèque (Particulier)','{\"fee\":\"180 DA (TTC)\",\"period\":\"Mensuel\"}',9,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000011','c0000000-0000-4000-8000-000000000004','comptes','entreprise',NULL,'Compte Courant (Entreprise)','{\"fee\":\"500 DA\",\"period\":\"Mensuel\"}',10,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000012','c0000000-0000-4000-8000-000000000005','comptes','particulier',NULL,'Compte Courant (Particulier)','{\"fee\":\"1 200 DA\",\"period\":\"Mensuel\"}',11,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000013','c0000000-0000-4000-8000-000000000005','comptes','non_precise',NULL,'Compte de Chèques','{\"fee\":\"200 DA\",\"period\":\"Mensuel\"}',12,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000014','c0000000-0000-4000-8000-000000000006','comptes','non_precise',NULL,'Compte Courant','{\"fee\":\"500 DA\",\"period\":\"Trimestriel\"}',13,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000015','c0000000-0000-4000-8000-000000000006','comptes','non_precise',NULL,'Compte Chèque','{\"fee\":\"75 DA\",\"period\":\"Trimestriel\"}',14,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000016','c0000000-0000-4000-8000-000000000007','comptes','non_precise',NULL,'Compte Chèque','{\"fee\":\"1 000 DA\",\"period\":\"Annuel\"}',15,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000017','c0000000-0000-4000-8000-000000000008','comptes','non_precise',NULL,'Compte de Chèques','{\"fee\":\"300 DA\",\"period\":\"Annuel\"}',16,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000018','c0000000-0000-4000-8000-000000000008','comptes','professionnel',NULL,'Compte Courant (Professionnel)','{\"fee\":\"1 500 DA\",\"period\":\"Annuel\"}',17,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000019','c0000000-0000-4000-8000-000000000009','comptes','particulier',NULL,'Compte Particulier','{\"fee\":\"800 DA\",\"period\":\"Trimestriel\"}',18,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000020','c0000000-0000-4000-8000-000000000009','comptes','professionnel',NULL,'Compte Professionnel','{\"fee\":\"1 500 DA\",\"period\":\"Trimestriel\"}',19,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000021','c0000000-0000-4000-8000-000000000010','comptes','particulier',NULL,'Compte Courant (Particulier)','{\"fee\":\"800 DA\",\"period\":\"Trimestriel\"}',20,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000022','c0000000-0000-4000-8000-000000000010','comptes','entreprise',NULL,'Compte Courant (Entreprise)','{\"fee\":\"900 DA\",\"period\":\"Trimestriel\"}',21,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000023','c0000000-0000-4000-8000-000000000011','comptes','particulier',NULL,'Compte Chèque (Particulier)','{\"fee\":\"1 260,5 DA\",\"period\":\"Trimestriel\"}',22,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000024','c0000000-0000-4000-8000-000000000011','comptes','professionnel',NULL,'Compte Courant (Professionnel)','{\"fee\":\"4 000 DA\",\"period\":\"Annuel\"}',23,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000025','c0000000-0000-4000-8000-000000000012','comptes','entreprise',NULL,'Compte Courant (Corporate)','{\"fee\":\"2 500 DA\",\"period\":\"Trimestriel\"}',24,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000026','c0000000-0000-4000-8000-000000000012','comptes','professionnel',NULL,'Compte Courant (Professionnel)','{\"fee\":\"1 000 DA\",\"period\":\"Trimestriel\"}',25,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000027','c0000000-0000-4000-8000-000000000001','versements-retraits','non_precise','Retrait','Retrait même agence','{\"fee\":\"Gratuit\"}',0,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000028','c0000000-0000-4000-8000-000000000001','versements-retraits','non_precise','Retrait','Retrait déplacé (≤ 500 000 DA)','{\"fee\":\"Gratuit\"}',1,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000029','c0000000-0000-4000-8000-000000000001','versements-retraits','non_precise','Retrait','Retrait déplacé (> 500 000 DA)','{\"fee\":\"0,25% (Max 3 500 DA)\"}',2,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000030','c0000000-0000-4000-8000-000000000001','versements-retraits','non_precise','Versement','Versement même agence','{\"fee\":\"Gratuit\"}',3,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000031','c0000000-0000-4000-8000-000000000001','versements-retraits','non_precise','Versement','Versement inter-agences','{\"fee\":\"Gratuit\"}',4,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000032','c0000000-0000-4000-8000-000000000002','versements-retraits','non_precise','Retrait','Retrait même agence','{\"fee\":\"Gratuit\"}',5,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000033','c0000000-0000-4000-8000-000000000002','versements-retraits','non_precise','Retrait','Retrait déplacé (≤ 15 000 DA)','{\"fee\":\"Gratuit\"}',6,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000034','c0000000-0000-4000-8000-000000000002','versements-retraits','non_precise','Retrait','Retrait déplacé (> 15 000 DA et ≤ 50 000 DA)','{\"fee\":\"100 DA\"}',7,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000035','c0000000-0000-4000-8000-000000000002','versements-retraits','non_precise','Retrait','Retrait déplacé (> 50 000 DA)','{\"fee\":\"200 DA\"}',8,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000036','c0000000-0000-4000-8000-000000000004','versements-retraits','non_precise','Retrait','Retrait même agence','{\"fee\":\"Gratuit\"}',9,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000037','c0000000-0000-4000-8000-000000000004','versements-retraits','non_precise','Retrait','Retrait déplacé','{\"fee\":\"50 DA\",\"conditions\":\"opérations de caisse retrait ou versement\"}',10,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000038','c0000000-0000-4000-8000-000000000005','versements-retraits','non_precise','Retrait','Retrait même agence','{\"fee\":\"Gratuit\"}',11,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000039','c0000000-0000-4000-8000-000000000005','versements-retraits','non_precise','Retrait','Retrait déplacé (> 50 000 DA)','{\"fee\":\"500 DA\"}',12,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000040','c0000000-0000-4000-8000-000000000006','versements-retraits','non_precise','Retrait','Retrait même agence','{\"fee\":\"Gratuit\"}',13,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000041','c0000000-0000-4000-8000-000000000006','versements-retraits','non_precise','Retrait','Retrait déplacé','{\"fee\":\"100 DA (ou 500 DA selon banque)\"}',14,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000042','c0000000-0000-4000-8000-000000000007','versements-retraits','non_precise','Retrait','Retrait déplacé (par chèque)','{\"fee\":\"0,50% (Min 100 DA)\",\"conditions\":\"Plafonné à 500 000 DA\"}',15,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000043','c0000000-0000-4000-8000-000000000008','versements-retraits','non_precise','Retrait','Retrait même agence','{\"fee\":\"Gratuit\"}',16,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000044','c0000000-0000-4000-8000-000000000009','versements-retraits','non_precise','Retrait','Retrait même agence','{\"fee\":\"Gratuit\"}',17,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000045','c0000000-0000-4000-8000-000000000009','versements-retraits','particulier','Retrait','Retrait déplacé (Particulier)','{\"fee\":\"300 DA\",\"conditions\":\"Plafond de 300 000 DA\"}',18,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000046','c0000000-0000-4000-8000-000000000010','versements-retraits','non_precise','Retrait','Retrait même agence','{\"fee\":\"0,05% (Min 15, Max 50 DA)\"}',19,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000047','c0000000-0000-4000-8000-000000000010','versements-retraits','non_precise','Retrait','Retrait déplacé','{\"fee\":\"200 DA (jusqu\'à 250 000 DA)\"}',20,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000048','c0000000-0000-4000-8000-000000000011','versements-retraits','non_precise','Retrait','Retrait même agence','{\"fee\":\"Gratuit\"}',21,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000049','c0000000-0000-4000-8000-000000000011','versements-retraits','non_precise','Retrait','Retrait déplacé','{\"fee\":\"0,05%\"}',22,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000050','c0000000-0000-4000-8000-000000000012','versements-retraits','non_precise','Retrait','Retrait même agence','{\"fee\":\"Gratuit\"}',23,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000051','c0000000-0000-4000-8000-000000000012','versements-retraits','professionnel','Retrait','Retrait déplacé (Professionnel)','{\"fee\":\"2 000 DA\"}',24,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000052','c0000000-0000-4000-8000-000000000001','carte-locale','non_precise',NULL,'Carte CIB','{\"annualFee\":\"Gratuit\",\"opposition\":\"200 DA\",\"atmWithdrawal\":\"29,41 DA\"}',0,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000053','c0000000-0000-4000-8000-000000000002','carte-locale','non_precise',NULL,'CIB Classique','{\"annualFee\":\"200 DA\",\"opposition\":\"500 DA (avec réédition)\",\"atmWithdrawal\":\"20 DA\"}',1,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000054','c0000000-0000-4000-8000-000000000002','carte-locale','non_precise',NULL,'CIB Gold','{\"annualFee\":\"3 000 DA\",\"opposition\":\"500 DA (avec réédition)\",\"atmWithdrawal\":\"20 DA\"}',2,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000055','c0000000-0000-4000-8000-000000000004','carte-locale','non_precise',NULL,'CIB Classic','{\"annualFee\":\"Gratuit\",\"opposition\":\"200 DA\",\"atmWithdrawal\":\"35 DA\"}',3,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000056','c0000000-0000-4000-8000-000000000005','carte-locale','non_precise',NULL,'CIB Classic / Gold','{\"annualFee\":\"Franco\",\"opposition\":\"200 DA\",\"atmWithdrawal\":\"25 DA\"}',4,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000057','c0000000-0000-4000-8000-000000000006','carte-locale','non_precise',NULL,'CIB Classic','{\"annualFee\":\"Gratuit\",\"opposition\":\"100 DA\",\"atmWithdrawal\":\"35 DA (TTC)\"}',5,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000058','c0000000-0000-4000-8000-000000000007','carte-locale','non_precise',NULL,'CIB Classic / Gold','{\"annualFee\":\"Gratuit\",\"opposition\":\"150 DA\",\"atmWithdrawal\":\"29,41 DA\"}',6,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000059','c0000000-0000-4000-8000-000000000008','carte-locale','non_precise',NULL,'CIB Classic','{\"annualFee\":\"Gratuit\",\"opposition\":\"100 DA\",\"atmWithdrawal\":\"25 DA\"}',7,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000060','c0000000-0000-4000-8000-000000000009','carte-locale','non_precise',NULL,'CIB Classic','{\"annualFee\":\"800 DA (frais de gestion)\",\"opposition\":\"300 DA\",\"atmWithdrawal\":\"50 DA\"}',8,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000061','c0000000-0000-4000-8000-000000000010','carte-locale','non_precise',NULL,'CIB Classic','{\"annualFee\":\"Gratuit\",\"opposition\":\"1 000 DA\",\"atmWithdrawal\":\"Gratuit\"}',9,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000062','c0000000-0000-4000-8000-000000000011','carte-locale','non_precise',NULL,'CIB Classic','{\"annualFee\":\"426,89 DA (renouvellement)\",\"opposition\":\"420,17 DA\",\"atmWithdrawal\":\"Gratuit\"}',10,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000063','c0000000-0000-4000-8000-000000000012','carte-locale','non_precise',NULL,'CIB Gold','{\"annualFee\":\"3 500 DA\",\"opposition\":\"300 DA\",\"atmWithdrawal\":\"35 DA\"}',11,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000064','c0000000-0000-4000-8000-000000000001','epargne','non_precise',NULL,'Livret d\'Épargne','{\"rate\":\"53,27% (Part Client) / 46,73% (Part Banque)\",\"conditions\":\"Sur les bénéfices\"}',0,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000065','c0000000-0000-4000-8000-000000000001','epargne','non_precise',NULL,'Dépôt Affecté 3 mois','{\"rate\":\"52,50% (Part Client) / 47,50% (Part Banque)\"}',1,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000066','c0000000-0000-4000-8000-000000000001','epargne','non_precise',NULL,'Dépôt Affecté 6 mois','{\"rate\":\"53,80% (Part Client) / 46,20% (Part Banque)\"}',2,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000067','c0000000-0000-4000-8000-000000000001','epargne','non_precise',NULL,'Dépôt Affecté 12 mois','{\"rate\":\"55,50% (Part Client) / 44,50% (Part Banque)\"}',3,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000068','c0000000-0000-4000-8000-000000000001','epargne','non_precise',NULL,'Dépôt Affecté 24 mois','{\"rate\":\"59,00% (Part Client) / 41,00% (Part Banque)\"}',4,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000069','c0000000-0000-4000-8000-000000000001','epargne','non_precise',NULL,'Dépôt Affecté 36 mois','{\"rate\":\"63,00% (Part Client) / 37,00% (Part Banque)\"}',5,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000070','c0000000-0000-4000-8000-000000000001','epargne','non_precise',NULL,'Dépôt Affecté 60 mois','{\"rate\":\"67,50% (Part Client) / 32,50% (Part Banque)\"}',6,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000071','c0000000-0000-4000-8000-000000000001','epargne','non_precise',NULL,'Dépôt Affecté > 60 mois','{\"rate\":\"72,00% (Part Client) / 28,00% (Part Banque)\"}',7,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000072','c0000000-0000-4000-8000-000000000002','epargne','non_precise',NULL,'Compte Épargne','{\"rate\":\"61% (Part Client) / 39% (Part Banque)\",\"conditions\":\"Sur les bénéfices\"}',8,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000073','c0000000-0000-4000-8000-000000000002','epargne','non_precise',NULL,'DAT 3 mois','{\"rate\":\"75% (Part Client) / 25% (Part Banque)\"}',9,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000074','c0000000-0000-4000-8000-000000000002','epargne','non_precise',NULL,'DAT 6 mois','{\"rate\":\"60% (Part Client) / 40% (Part Banque)\"}',10,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000075','c0000000-0000-4000-8000-000000000002','epargne','non_precise',NULL,'DAT 12 mois','{\"rate\":\"65% (Part Client) / 35% (Part Banque)\"}',11,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000076','c0000000-0000-4000-8000-000000000002','epargne','non_precise',NULL,'DAT 24 mois','{\"rate\":\"75% (Part Client) / 25% (Part Banque)\"}',12,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000077','c0000000-0000-4000-8000-000000000002','epargne','non_precise',NULL,'DAT 36 mois','{\"rate\":\"80% (Part Client) / 20% (Part Banque)\"}',13,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000078','c0000000-0000-4000-8000-000000000002','epargne','non_precise',NULL,'DAT 60 mois et +','{\"rate\":\"90% (Part Client) / 10% (Part Banque)\"}',14,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000079','c0000000-0000-4000-8000-000000000004','epargne','non_precise',NULL,'Livret d\'Épargne','{\"rate\":\"3,5% / an\"}',15,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000080','c0000000-0000-4000-8000-000000000004','epargne','non_precise',NULL,'DAT (12 à 24 mois)','{\"rate\":\"3,5% / an\"}',16,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000081','c0000000-0000-4000-8000-000000000005','epargne','non_precise',NULL,'Compte Épargne \"Tawfir\"','{\"rate\":\"2,5% à 4% / an\",\"conditions\":\"Variable selon montant\"}',17,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000082','c0000000-0000-4000-8000-000000000006','epargne','non_precise',NULL,'Compte Épargne','{\"rate\":\"3% / an\"}',18,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000083','c0000000-0000-4000-8000-000000000006','epargne','non_precise',NULL,'DAT (12 à 18 mois)','{\"rate\":\"2,00%\"}',19,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000084','c0000000-0000-4000-8000-000000000013','epargne','non_precise',NULL,'Compte Épargne Logement','{\"rate\":\"2%\"}',20,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000085','c0000000-0000-4000-8000-000000000013','epargne','non_precise',NULL,'DAT (12 mois)','{\"rate\":\"3,25%\"}',21,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000086','c0000000-0000-4000-8000-000000000007','epargne','non_precise',NULL,'Livret d\'Épargne','{\"rate\":\"Non spécifié\"}',22,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000087','c0000000-0000-4000-8000-000000000008','epargne','non_precise',NULL,'DAT (12 à 18 mois)','{\"rate\":\"Taux variable de 1,75%+\"}',23,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000088','c0000000-0000-4000-8000-000000000009','epargne','non_precise',NULL,'DAT (12 mois)','{\"rate\":\"Consulter la grille\"}',24,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000089','c0000000-0000-4000-8000-000000000010','epargne','non_precise',NULL,'Compte Tawfiri','{\"rate\":\"1,9% / an\"}',25,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000090','c0000000-0000-4000-8000-000000000011','epargne','non_precise',NULL,'Compte Épargne','{\"rate\":\"3,25%\"}',26,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000091','c0000000-0000-4000-8000-000000000012','epargne','non_precise',NULL,'DAT (12 mois)','{\"rate\":\"TRC + 0,25%\"}',27,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000092','c0000000-0000-4000-8000-000000000001','credits','non_precise',NULL,'Prélèvement avec balayage','{\"fileFee\":\"4% du montant prélevé\"}',0,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000093','c0000000-0000-4000-8000-000000000001','credits','entreprise',NULL,'Financement Exploitation (Entreprise)','{\"rate\":\"6% - 9%\"}',1,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000094','c0000000-0000-4000-8000-000000000001','credits','entreprise',NULL,'Financement Investissement (Entreprise)','{\"rate\":\"5,50% - 8%\"}',2,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000095','c0000000-0000-4000-8000-000000000001','credits','non_precise',NULL,'Ijara (Leasing)','{\"rate\":\"Max 12%\"}',3,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000096','c0000000-0000-4000-8000-000000000001','credits','non_precise',NULL,'Financement Immobilier (Épargnant)','{\"rate\":\"6% - 6,50%\"}',4,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000097','c0000000-0000-4000-8000-000000000001','credits','non_precise',NULL,'Financement Immobilier (Non-épargnant)','{\"rate\":\"7% - 7,50%\"}',5,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000098','c0000000-0000-4000-8000-000000000001','credits','non_precise',NULL,'Financement Consommation','{\"rate\":\"10% - 11%\",\"fileFee\":\"1% flat (Min 5 000 DA)\"}',6,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000099','c0000000-0000-4000-8000-000000000002','credits','non_precise',NULL,'Crédit Immobilier (Épargnant)','{\"rate\":\"6,50% / an\",\"fileFee\":\"10 000 DA\",\"earlyRepayment\":\"Non spécifié\"}',7,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000100','c0000000-0000-4000-8000-000000000002','credits','non_precise',NULL,'Crédit Immobilier (Non-épargnant)','{\"rate\":\"7,00% / an\",\"fileFee\":\"7 000 DA\"}',8,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000101','c0000000-0000-4000-8000-000000000002','credits','non_precise',NULL,'Crédit Consommation (Équipement)','{\"rate\":\"9,50% / an\",\"fileFee\":\"3 000 DA\"}',9,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000102','c0000000-0000-4000-8000-000000000002','credits','non_precise',NULL,'Crédit Consommation (Auto)','{\"rate\":\"9,50% / an\",\"fileFee\":\"15 000 DA\"}',10,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000103','c0000000-0000-4000-8000-000000000003','credits','non_precise',NULL,'Découvert','{\"rate\":\"Taux de référence + 7,25%\"}',11,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000104','c0000000-0000-4000-8000-000000000004','credits','non_precise',NULL,'Crédit Immobilier','{\"rate\":\"TR + Marge\",\"fileFee\":\"0,5% (Min 10 000, Max 50 000 DA)\",\"earlyRepayment\":\"1% (partiel), 2% (total)\"}',12,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000105','c0000000-0000-4000-8000-000000000004','credits','non_precise',NULL,'Crédit Consommation','{\"rate\":\"TR + Marge\",\"fileFee\":\"1% (Min 3 000, Max 10 000 DA)\",\"earlyRepayment\":\"Pénalité de 4%\"}',13,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000106','c0000000-0000-4000-8000-000000000005','credits','non_precise',NULL,'Crédit Immobilier \"Menzili\"','{\"rate\":\"TRD + 0,85%\",\"fileFee\":\"Non spécifié\"}',14,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000107','c0000000-0000-4000-8000-000000000006','credits','non_precise',NULL,'Crédit Immobilier','{\"rate\":\"5,75% (épargnant)\",\"fileFee\":\"10 000 DA\"}',15,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000108','c0000000-0000-4000-8000-000000000006','credits','non_precise',NULL,'Crédit Consommation','{\"rate\":\"8,00%\",\"fileFee\":\"5 000 DA\"}',16,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000109','c0000000-0000-4000-8000-000000000007','credits','non_precise',NULL,'Crédit Immobilier','{\"rate\":\"Non spécifié\",\"fileFee\":\"20 000 DA\"}',17,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000110','c0000000-0000-4000-8000-000000000007','credits','non_precise',NULL,'Crédit Consommation','{\"rate\":\"Non spécifié\",\"fileFee\":\"5 000 DA\"}',18,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000111','c0000000-0000-4000-8000-000000000008','credits','non_precise',NULL,'Crédit Immobilier','{\"rate\":\"5,75% (épargnant)\",\"fileFee\":\"10 000 DA\"}',19,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000112','c0000000-0000-4000-8000-000000000008','credits','non_precise',NULL,'Crédit Consommation','{\"rate\":\"8,00%\",\"fileFee\":\"5 000 DA\"}',20,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000113','c0000000-0000-4000-8000-000000000009','credits','non_precise',NULL,'Crédit Immobilier','{\"rate\":\"À partir de 6%\",\"fileFee\":\"0,50%\"}',21,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000114','c0000000-0000-4000-8000-000000000009','credits','non_precise',NULL,'Crédit Véhicule','{\"rate\":\"À partir de 6%\",\"fileFee\":\"1,03% (Min 5 000, Max 20 000 DA)\"}',22,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000115','c0000000-0000-4000-8000-000000000010','credits','non_precise',NULL,'Prêt Immobilier','{\"rate\":\"TBSGA + Marge\",\"fileFee\":\"1,2% (Min 20 000, Max 100 000 DA)\"}',23,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000116','c0000000-0000-4000-8000-000000000010','credits','non_precise',NULL,'Crédit Auto','{\"rate\":\"TBSGA + Marge\",\"fileFee\":\"1% (Min 10 000, Max 20 000 DA)\"}',24,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000117','c0000000-0000-4000-8000-000000000011','credits','non_precise',NULL,'Prêt Habitat','{\"rate\":\"TR + Marge\",\"fileFee\":\"T% (Min 3 000, Max 20 000 DA)\",\"earlyRepayment\":\"2%\"}',25,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000118','c0000000-0000-4000-8000-000000000012','credits','non_precise',NULL,'Crédit Véhicule','{\"rate\":\"TRD + Marge\",\"fileFee\":\"15 000 DA\",\"earlyRepayment\":\"4% (flat)\"}',26,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000119','c0000000-0000-4000-8000-000000000001','carte-internationale','non_precise',NULL,'Carte Visa Classique','{\"annualFee\":\"1 800 DA + 700 DA/chargement\",\"opposition\":\"800 DA\",\"foreignWithdrawal\":\"1 € + 2%\"}',0,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000120','c0000000-0000-4000-8000-000000000001','carte-internationale','non_precise',NULL,'Carte Visa Gold','{\"annualFee\":\"4 500 DA\",\"opposition\":\"800 DA\",\"foreignWithdrawal\":\"1 € + 2%\"}',1,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000121','c0000000-0000-4000-8000-000000000001','carte-internationale','non_precise',NULL,'Carte Visa Platinum','{\"annualFee\":\"14 000 DA\",\"opposition\":\"800 DA\",\"foreignWithdrawal\":\"1 € + 2%\"}',2,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000122','c0000000-0000-4000-8000-000000000002','carte-internationale','non_precise',NULL,'Visa Classique','{\"annualFee\":\"4 000 DA\",\"opposition\":\"Gratuit (sans réédition)\",\"foreignWithdrawal\":\"2 € + 1,5% (Zone Euro)\"}',3,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000123','c0000000-0000-4000-8000-000000000002','carte-internationale','non_precise',NULL,'Visa Gold','{\"annualFee\":\"6 500 DA\",\"opposition\":\"Gratuit (sans réédition)\",\"foreignWithdrawal\":\"2 € + 1,5% (Zone Euro)\"}',4,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000124','c0000000-0000-4000-8000-000000000002','carte-internationale','non_precise',NULL,'Visa Platinum','{\"annualFee\":\"14 000 DA\",\"opposition\":\"Gratuit (sans réédition)\",\"foreignWithdrawal\":\"2 € + 1,5% (Zone Euro)\"}',5,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000125','c0000000-0000-4000-8000-000000000004','carte-internationale','non_precise',NULL,'Visa Classic (sans assurance)','{\"annualFee\":\"1 790 DA\",\"opposition\":\"Gratuit\",\"foreignWithdrawal\":\"1,5 € + 1%\"}',6,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000126','c0000000-0000-4000-8000-000000000005','carte-internationale','non_precise',NULL,'Mastercard Prépayée','{\"annualFee\":\"2 500 DA\",\"opposition\":\"500 DA (blocage)\",\"foreignWithdrawal\":\"Non spécifié\"}',7,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000127','c0000000-0000-4000-8000-000000000007','carte-internationale','non_precise',NULL,'Mastercard Titanium','{\"annualFee\":\"17 000 DA / 2 ans\",\"opposition\":\"2 500 DA\",\"foreignWithdrawal\":\"2,5% + 2 €\"}',8,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000128','c0000000-0000-4000-8000-000000000008','carte-internationale','non_precise',NULL,'Carte Mastercard Platinum','{\"annualFee\":\"17 000 DA / An\",\"opposition\":\"1 000 DA\",\"foreignWithdrawal\":\"1 000 DA / 2 000 DA\"}',9,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000129','c0000000-0000-4000-8000-000000000009','carte-internationale','non_precise',NULL,'Visa Classique','{\"annualFee\":\"4 500 DA\",\"opposition\":\"1 500 DA\",\"foreignWithdrawal\":\"2 € + 1,5%\"}',10,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000130','c0000000-0000-4000-8000-000000000010','carte-internationale','non_precise',NULL,'Visa Classic','{\"annualFee\":\"4 500 DA\",\"opposition\":\"Non spécifié\",\"foreignWithdrawal\":\"2 € + 2%\"}',11,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000131','c0000000-0000-4000-8000-000000000001','devises','non_precise','Transfert international','Virement à l\'étranger','{\"fee\":\"0,5% (Min 3 000 DA) + Frais Swift 3 000 DA\"}',0,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000132','c0000000-0000-4000-8000-000000000001','devises','non_precise','SWIFT / correspondant','Avis de sort','{\"fee\":\"5 000 DA + Frais Swift 3 000 DA\"}',1,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000133','c0000000-0000-4000-8000-000000000001','devises','non_precise','SWIFT / correspondant','Frais correspondants étrangers','{\"fee\":\"15 000 DA\"}',2,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000134','c0000000-0000-4000-8000-000000000001','devises','non_precise','SWIFT / correspondant','Frais de notification Swift','{\"fee\":\"1 500 DA/Message\"}',3,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000135','c0000000-0000-4000-8000-000000000001','devises','non_precise','Change','Achat devise','{\"fee\":\"Gratuit\"}',4,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000136','c0000000-0000-4000-8000-000000000001','devises','non_precise','Change','Vente devise','{\"fee\":\"2% (Min 500 DA)\"}',5,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000137','c0000000-0000-4000-8000-000000000002','devises','non_precise','Transfert international','Transfert libre (Import)','{\"fee\":\"3 000 DA (frais Swift)\"}',6,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000138','c0000000-0000-4000-8000-000000000002','devises','non_precise','Transfert international','Transfert à l\'étranger','{\"fee\":\"1,00% (Commission Banque d\'Algérie) + Frais Swift\"}',7,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000139','c0000000-0000-4000-8000-000000000002','devises','non_precise','Allocation','Allocation touristique','{\"fee\":\"840,34 DA\"}',8,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000140','c0000000-0000-4000-8000-000000000003','devises','non_precise','Transfert international','Paiement sur compte devise','{\"fee\":\"0,25% + 3 000 DA (frais Swift)\"}',9,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000141','c0000000-0000-4000-8000-000000000004','devises','non_precise','Transfert international','Transfert de devises','{\"fee\":\"Frais Swift 2 500 DA\"}',10,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000142','c0000000-0000-4000-8000-000000000004','devises','non_precise','Allocation','Allocation touristique','{\"fee\":\"1 000 DA\"}',11,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000143','c0000000-0000-4000-8000-000000000005','devises','non_precise','Transfert international','Transfert libre','{\"fee\":\"0,25% (Min 2 500 DA) + Frais Swift 3 000 DA\"}',12,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000144','c0000000-0000-4000-8000-000000000006','devises','non_precise','Transfert international','Virement à l\'étranger','{\"fee\":\"Non spécifié\"}',13,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000145','c0000000-0000-4000-8000-000000000007','devises','non_precise','Transfert international','Transfert sur compte devise','{\"fee\":\"0,25% (Min 2 500 DA) + Frais Swift\"}',14,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000146','c0000000-0000-4000-8000-000000000007','devises','non_precise','Allocation','Allocation touristique','{\"fee\":\"500 DA (adulte), 250 DA (enfant)\"}',15,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000147','c0000000-0000-4000-8000-000000000008','devises','non_precise','Transfert international','Virement à l\'étranger','{\"fee\":\"1% (Min 2 500 DA) + Frais Swift\"}',16,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000148','c0000000-0000-4000-8000-000000000009','devises','non_precise','Transfert international','Transfert','{\"fee\":\"Marge de 0,1% + com BA 0,10% + Frais Swift\"}',17,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000149','c0000000-0000-4000-8000-000000000010','devises','non_precise','Transfert international','Transfert vers l\'étranger','{\"fee\":\"0,1% + 0,10% (com BA) + 1 000 DA (Swift)\"}',18,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000150','c0000000-0000-4000-8000-000000000011','devises','non_precise','Transfert international','Transfert','{\"fee\":\"Marge de 0,1% + com BA 0,10% + Frais Swift 3 000 DA\"}',19,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000151','c0000000-0000-4000-8000-000000000012','devises','non_precise','Transfert international','Transfert à l\'étranger','{\"fee\":\"0,25% (Min 2 500 DA) + Frais Swift\"}',20,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320'),
('c1000000-0000-4000-8000-000000000152','c0000000-0000-4000-8000-000000000001','operations-diverses','non_precise','Digital / pack','Pack \"Smart\" (E-banking, SMS)','{\"fee\":\"100 DA/mois\"}',0,'2026-10-04 07:57:52.320','2026-10-04 07:57:52.320');
/*!40000 ALTER TABLE `comparator_conditions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `comparator_meta`
--

DROP TABLE IF EXISTS `comparator_meta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `comparator_meta` (
  `id` int(11) NOT NULL DEFAULT 1,
  `dataUpdatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `comparator_meta_single_row_check` CHECK (`id` = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comparator_meta`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `comparator_meta` WRITE;
/*!40000 ALTER TABLE `comparator_meta` DISABLE KEYS */;
INSERT INTO `comparator_meta` VALUES
(1,'2026-10-04 07:57:52.329');
/*!40000 ALTER TABLE `comparator_meta` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `contact_messages`
--

DROP TABLE IF EXISTS `contact_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_messages` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(254) NOT NULL,
  `message` text NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_messages`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `contact_messages` WRITE;
/*!40000 ALTER TABLE `contact_messages` DISABLE KEYS */;
INSERT INTO `contact_messages` VALUES
('e106c422-c469-4a4b-a69a-773562c4cd73','Admin Démo','azizsellal.idh@gmail.com','azdazdzadza','2026-11-04 12:33:28.328');
/*!40000 ALTER TABLE `contact_messages` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `course_progress`
--

DROP TABLE IF EXISTS `course_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_progress` (
  `id` varchar(191) NOT NULL,
  `enrollmentId` varchar(191) NOT NULL,
  `courseId` varchar(191) NOT NULL,
  `formationId` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'in_progress',
  `openedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `completedAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_progress_enrollmentId_courseId_key` (`enrollmentId`,`courseId`),
  KEY `course_progress_courseId_idx` (`courseId`),
  KEY `course_progress_enrollmentId_formationId_fkey` (`enrollmentId`,`formationId`),
  KEY `course_progress_courseId_formationId_fkey` (`courseId`,`formationId`),
  CONSTRAINT `course_progress_courseId_formationId_fkey` FOREIGN KEY (`courseId`, `formationId`) REFERENCES `courses` (`id`, `formationId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `course_progress_enrollmentId_formationId_fkey` FOREIGN KEY (`enrollmentId`, `formationId`) REFERENCES `enrollments` (`id`, `formationId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `course_progress_status_check` CHECK (`status` in ('in_progress','completed')),
  CONSTRAINT `course_progress_completedAt_check` CHECK (`status` = 'completed' = (`completedAt` is not null))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_progress`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `course_progress` WRITE;
/*!40000 ALTER TABLE `course_progress` DISABLE KEYS */;
INSERT INTO `course_progress` VALUES
('1c4644ae-41d1-4cd4-b296-4e424f9fbf56','1a7b66a4-cad9-4a0b-848f-7f489ad4825d','d2cc05c4-6946-4b7b-8d87-83a6e43ca8ce','21d0e24a-224a-4af9-8e77-3c902ea12199','completed','2026-09-23 14:51:48.867','2026-09-23 14:51:48.867'),
('45f9042b-e450-4740-9e74-a247ffbea376','1a7b66a4-cad9-4a0b-848f-7f489ad4825d','6d9b6ac8-34ca-41ce-a680-3db935ab2cb7','21d0e24a-224a-4af9-8e77-3c902ea12199','completed','2026-09-24 14:51:48.867','2026-09-24 14:51:48.867'),
('4ef0bd87-03da-459a-9171-b4b58f7c5e2e','1a7b66a4-cad9-4a0b-848f-7f489ad4825d','c97db33c-c6e9-47e6-8108-0b9e9269cb3f','21d0e24a-224a-4af9-8e77-3c902ea12199','completed','2026-09-22 14:51:48.867','2026-09-22 14:51:48.867'),
('5c899afa-da54-4016-ba7b-ed932b618c33','d91f13e2-f261-4c87-bf7a-4663305949d1','7bb94490-38ce-48b9-b2fc-a5427398ace7','0dfb27a5-c466-44d2-b8d9-032f6fee4a78','completed','2026-10-17 09:18:09.559','2026-10-17 09:18:13.119'),
('85ceaa04-c380-4d11-89bc-7a75b1108c88','1ad28407-be73-44e2-a6a0-888ef0dc6965','c97db33c-c6e9-47e6-8108-0b9e9269cb3f','21d0e24a-224a-4af9-8e77-3c902ea12199','completed','2026-10-01 14:51:48.861','2026-10-02 14:51:48.861'),
('ff76260d-d4bc-43d0-ac05-7b28468c833b','1ad28407-be73-44e2-a6a0-888ef0dc6965','d2cc05c4-6946-4b7b-8d87-83a6e43ca8ce','21d0e24a-224a-4af9-8e77-3c902ea12199','in_progress','2026-10-04 14:51:48.861',NULL);
/*!40000 ALTER TABLE `course_progress` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` varchar(191) NOT NULL,
  `formationId` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `summary` text DEFAULT NULL,
  `body` mediumtext DEFAULT NULL,
  `position` int(11) NOT NULL,
  `isRequired` tinyint(1) NOT NULL DEFAULT 1,
  `estimatedMinutes` int(11) DEFAULT NULL,
  `sectionId` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `courses_id_formationId_key` (`id`,`formationId`),
  KEY `courses_formationId_position_idx` (`formationId`,`position`),
  KEY `courses_sectionId_formationId_fkey` (`sectionId`,`formationId`),
  CONSTRAINT `courses_formationId_fkey` FOREIGN KEY (`formationId`) REFERENCES `formations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `courses_sectionId_formationId_fkey` FOREIGN KEY (`sectionId`, `formationId`) REFERENCES `sections` (`id`, `formationId`) ON UPDATE CASCADE,
  CONSTRAINT `courses_position_check` CHECK (`position` >= 0),
  CONSTRAINT `courses_estimatedMinutes_check` CHECK (`estimatedMinutes` is null or `estimatedMinutes` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES
('1a7ece0e-0cec-437b-8978-72458861492c','8450352f-b35e-496a-b3da-92872dfd7a7e','Leçon d’archive','Ancien contenu.','<p>Contenu conservé.</p>',0,1,5,'1625faeb-44dc-4491-be9d-d2300b511107','2026-09-26 08:14:44.917','2026-09-26 08:14:44.917'),
('23350dc6-e513-45af-8959-0fdc673e6ace','b5245bb8-482e-4229-bd4f-0f80119eaaf4','Intro','azzzdadad',NULL,0,1,NULL,'a1bfc9d3-3559-4ddd-a0e2-71078f797f27','2026-09-21 13:52:37.955','2026-09-21 13:56:13.034'),
('6d9b6ac8-34ca-41ce-a680-3db935ab2cb7','21d0e24a-224a-4af9-8e77-3c902ea12199','Le bilan et le compte de résultat','Lire les deux documents de synthèse.','<h2>Le bilan</h2><p>Photographie du patrimoine à une date donnée : ce que possède l’entreprise et ce qu’elle doit.</p><h2>Le compte de résultat</h2><p>Il mesure le bénéfice ou la perte sur une période.</p>',2,1,30,'dc9191b6-23d7-4293-bf46-fa05a1b46fa9','2026-10-06 14:51:48.779','2026-10-06 14:51:48.779'),
('7a68219d-134c-41ad-a1e6-8c13968ac630','a485b226-95af-4eae-b360-c0e3c6f4f812','Leçon d’archive','Ancien contenu.','<p>Contenu conservé.</p>',0,1,5,'7fe2500c-5e4c-4e1c-a5b2-3fd4c7822dd5','2026-10-06 14:51:48.851','2026-10-06 14:51:48.851'),
('7bb94490-38ce-48b9-b2fc-a5427398ace7','0dfb27a5-c466-44d2-b8d9-032f6fee4a78','Intro','Introduction','<p>aaa <strong>adad <em>zdzd</em></strong><em>zdzd </em></p><h2>eefee</h2><p><u>deded </u></p><p><em><u>eded</u></em></p><ol><li><p>deededeede</p></li></ol><blockquote><p>eded</p></blockquote><p></p><p></p>',0,1,2,'2ac9c870-88cc-4e91-ae10-53e3862adeec','2026-09-20 08:17:33.830','2026-09-20 08:18:56.051'),
('846c2e84-eb5b-4356-896a-a75412952589','2b902f76-1048-4a36-a492-9f8c3bfcea18','alors ?','Gestion budgétaire',NULL,0,1,10,'96238a08-9abd-4dd9-9259-64d6471586ac','2026-11-05 08:42:37.889','2026-11-05 08:46:16.995'),
('9ec9ea81-dbc3-4fe5-9f67-5ade3344754f','21d0e24a-224a-4af9-8e77-3c902ea12199','Aller plus loin : lectures conseillées','Cours bonus, non obligatoire.','<p>Quelques pistes pour approfondir : plan comptable, TVA, amortissements.</p>',3,0,10,'dc9191b6-23d7-4293-bf46-fa05a1b46fa9','2026-10-06 14:51:48.786','2026-10-06 14:51:48.786'),
('ad0ce140-ad37-41f1-a92c-b01507f1b74f','a7828933-f8f2-4ce5-b609-0b1e4f373d36','Prévoir ses encaissements','Plan de trésorerie.','<p>Contenu en cours de rédaction.</p>',0,1,20,'c78616e0-340f-4477-ac9c-74c957b24f71','2026-10-06 14:51:48.838','2026-10-06 14:51:48.838'),
('b6e8cb1d-60a7-4e21-b2d5-b4be82f20fa1','2cf07958-5a80-4cdd-8bce-2080fb74ab4f','Les régimes d’imposition','Comparer les régimes.','<h2>Choisir son régime</h2><p>Le régime dépend de la forme juridique et du chiffre d’affaires.</p>',0,1,30,'3237f5e0-de61-48c5-9d17-29d3947068e3','2026-10-06 14:51:48.810','2026-10-06 14:51:48.810'),
('c1252cdd-5431-401a-be09-06333e4fa03f','2cf07958-5a80-4cdd-8bce-2080fb74ab4f','Préparer un contrôle','Bons réflexes.','<ol><li>Classer les justificatifs</li><li>Garder les contrats</li><li>Répondre dans les délais</li></ol>',2,1,20,'e7aa5c30-40bc-4846-8f05-65e9393fe009','2026-10-06 14:51:48.824','2026-10-06 14:51:48.824'),
('c97db33c-c6e9-47e6-8108-0b9e9269cb3f','21d0e24a-224a-4af9-8e77-3c902ea12199','Introduction à la comptabilité','À quoi sert la comptabilité ?','<h2>Pourquoi tenir une comptabilité ?</h2><p>La comptabilité donne une <strong>image fidèle</strong> de la situation de votre entreprise.</p><ul><li>Suivre les recettes et les dépenses</li><li>Respecter les obligations légales</li><li>Prendre de meilleures décisions</li></ul>',0,1,15,'6c87f5ea-b352-40c6-ac98-ae8d4c8d69e8','2026-10-06 14:51:48.755','2026-10-06 14:51:48.755'),
('d2cc05c4-6946-4b7b-8d87-83a6e43ca8ce','21d0e24a-224a-4af9-8e77-3c902ea12199','Le journal et le grand livre','Enregistrer chaque opération.','<h2>Le journal</h2><p>Chaque opération est enregistrée <em>chronologiquement</em> avec un débit et un crédit.</p><p>Le grand livre regroupe ensuite ces écritures par compte.</p>',1,1,25,'6c87f5ea-b352-40c6-ac98-ae8d4c8d69e8','2026-10-06 14:51:48.767','2026-10-06 14:51:48.767'),
('f2090008-2139-4b30-bb14-0e172acae73c','2cf07958-5a80-4cdd-8bce-2080fb74ab4f','Charges déductibles','Ce que l’on peut déduire.','<p>Toute dépense engagée dans l’intérêt de l’entreprise et justifiée peut, en principe, être déduite.</p>',1,1,25,'3237f5e0-de61-48c5-9d17-29d3947068e3','2026-10-06 14:51:48.816','2026-10-06 14:51:48.816');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `enrollments`
--

DROP TABLE IF EXISTS `enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `enrollments` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `formationId` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'active',
  `enrolledAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `completedAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `enrollments_userId_formationId_key` (`userId`,`formationId`),
  UNIQUE KEY `enrollments_id_formationId_key` (`id`,`formationId`),
  KEY `enrollments_formationId_idx` (`formationId`),
  CONSTRAINT `enrollments_formationId_fkey` FOREIGN KEY (`formationId`) REFERENCES `formations` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `enrollments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `enrollments_status_check` CHECK (`status` in ('active','completed')),
  CONSTRAINT `enrollments_completedAt_check` CHECK (`status` = 'completed' = (`completedAt` is not null))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollments`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `enrollments` WRITE;
/*!40000 ALTER TABLE `enrollments` DISABLE KEYS */;
INSERT INTO `enrollments` VALUES
('1a7b66a4-cad9-4a0b-848f-7f489ad4825d','2f9936ff-7b0e-40ea-83ad-18de8c87e949','21d0e24a-224a-4af9-8e77-3c902ea12199','completed','2026-09-21 14:51:48.864','2026-09-28 14:51:48.864'),
('1ad28407-be73-44e2-a6a0-888ef0dc6965','a668ea3d-14e5-4935-8cd5-5936647e290f','21d0e24a-224a-4af9-8e77-3c902ea12199','active','2026-10-01 14:51:48.858',NULL),
('22a8a025-65bf-4518-8145-18baeab853a5','2f9936ff-7b0e-40ea-83ad-18de8c87e949','0dfb27a5-c466-44d2-b8d9-032f6fee4a78','active','2026-10-10 14:58:16.714',NULL),
('d91f13e2-f261-4c87-bf7a-4663305949d1','dd81c796-b6b8-49bd-a807-876c1c531d0b','0dfb27a5-c466-44d2-b8d9-032f6fee4a78','completed','2026-10-17 09:18:08.486','2026-10-17 09:18:13.478');
/*!40000 ALTER TABLE `enrollments` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_accounts`
--

DROP TABLE IF EXISTS `fin_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_accounts` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `label` varchar(80) NOT NULL,
  `type` varchar(5) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `openingBalance` double NOT NULL DEFAULT 0,
  `openingDate` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `includeInTotal` tinyint(1) NOT NULL,
  `includeInNetWorth` tinyint(1) NOT NULL,
  `color` varchar(9) DEFAULT NULL,
  `icon` varchar(16) DEFAULT NULL,
  `minBalanceAlert` double DEFAULT NULL,
  `maxBalanceInfo` double DEFAULT NULL,
  `overdraftAllowed` double DEFAULT NULL,
  `note` varchar(300) DEFAULT NULL,
  `archivedAt` datetime(3) DEFAULT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `collectedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `confidence` varchar(10) DEFAULT NULL,
  `consentUses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`consentUses`)),
  `effectiveAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `scope` varchar(20) NOT NULL DEFAULT 'personal',
  `source` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL,
  `version` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `fin_accounts_userId_deletedAt_idx` (`userId`,`deletedAt`),
  CONSTRAINT `fin_accounts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_accounts_type_check` CHECK (`type` in ('AC-01','AC-02','AC-03','AC-04','AC-05','AC-06','AC-07','AC-08','AC-09','AC-10')),
  CONSTRAINT `fin_accounts_currency_check` CHECK (`currency` regexp '^[A-Z]{3}$'),
  CONSTRAINT `fin_accounts_overdraft_check` CHECK (`overdraftAllowed` is null or `overdraftAllowed` >= 0),
  CONSTRAINT `fin_accounts_scope_check` CHECK (`scope` in ('personal','couple','household','space')),
  CONSTRAINT `fin_accounts_source_check` CHECK (`source` in ('manual','imported','document','partner','computed')),
  CONSTRAINT `fin_accounts_status_check` CHECK (`status` in ('real','declared','imported','computed','official','to_confirm')),
  CONSTRAINT `fin_accounts_confidence_check` CHECK (`confidence` is null or `confidence` in ('high','medium','low')),
  CONSTRAINT `fin_accounts_version_check` CHECK (`version` >= 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_accounts`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_accounts` WRITE;
/*!40000 ALTER TABLE `fin_accounts` DISABLE KEYS */;
INSERT INTO `fin_accounts` VALUES
('32b7ad8b-8287-4ae1-9ae9-9a0d6208b5b0','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','Prêt à Un ami','AC-09','DZD',0,'2026-10-29 12:00:00.000',0,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-04 13:23:22.704','2026-11-04 13:23:22.704','2026-11-04 13:23:22.704',NULL,'[]','2026-11-04 13:23:22.704','personal','manual','declared',1),
('46b02ea5-fab0-449e-9386-04500d1d613d','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','Fonds d’urgence','AC-04','DZD',0,'2026-11-04 13:36:12.155',1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-04 13:36:12.155','2026-11-04 13:36:12.155','2026-11-04 13:36:12.155',NULL,'[]','2026-11-04 13:36:12.155','personal','computed','declared',1),
('50beca3c-3b32-4019-a38e-014733bd20e3','087b8449-6ea8-4478-9a2a-097b0a43fc72','Compte courant CCP','AC-02','DZD',4500000,'2026-06-01 00:00:00.000',1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-03 10:21:37.209','2026-11-03 10:21:37.209','2026-11-03 10:21:37.209',NULL,'[]','2026-11-03 10:21:37.209','personal','manual','declared',1),
('6d90b22d-0ed9-4f3b-84dc-47a63b1a8a03','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','aziz','AC-01','DZD',2000000,'2026-11-03 00:00:00.000',1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-04 10:43:53.389','2026-11-04 10:43:53.389','2026-11-04 10:43:53.389',NULL,'[]','2026-11-04 10:43:53.389','personal','manual','declared',1),
('7dfbc7e0-36f1-48d2-a9ac-34d421bc0374','087b8449-6ea8-4478-9a2a-097b0a43fc72','Espèces','AC-01','DZD',0,'2026-11-04 15:47:24.818',1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-04 15:47:24.818','2026-11-04 15:47:24.818','2026-11-04 15:47:24.818',NULL,'[]','2026-11-04 15:47:24.818','personal','computed','declared',1),
('9c43294b-4b77-4bf9-87db-98bde28eee2d','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','aziz 3','AC-04','DZD',14000000,'2026-11-04 00:00:00.000',1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-04 10:45:07.999','2026-11-04 10:45:07.999','2026-11-04 10:45:07.999',NULL,'[]','2026-11-04 10:45:07.999','personal','manual','declared',1),
('c3dbcd55-2aec-471c-b56c-f08a7e5c69ec','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','secret epargne','AC-02','DZD',140000000,'2025-07-11 00:00:00.000',1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-04 14:16:14.318','2026-11-04 14:16:14.318','2026-11-04 14:16:14.318',NULL,'[]','2026-11-04 14:16:14.318','personal','manual','declared',1),
('d624debb-3c83-4386-abbb-e334ebb8cbfa','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','aziz 2','AC-03','DZD',2000000,'2026-11-04 00:00:00.000',1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-04 10:44:19.016','2026-11-04 10:44:19.016','2026-11-04 10:44:19.016',NULL,'[]','2026-11-04 10:44:19.016','personal','manual','declared',1),
('e039ec1b-f0b7-4249-99a4-49460da05a4d','5daa4745-535e-4e92-824a-a705598eaead','Espèces','AC-01','DZD',0,'2026-11-03 10:21:48.458',1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-03 10:21:48.458','2026-11-03 10:21:48.458','2026-11-03 10:21:48.458',NULL,'[]','2026-11-03 10:21:48.458','personal','computed','declared',1),
('ec4a7ae8-bd2b-4861-959a-498e5a98d14d','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','aziz 4','AC-09','DZD',1000000,'2026-11-04 00:00:00.000',0,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-04 10:45:27.193','2026-11-04 10:45:27.193','2026-11-04 10:45:27.193',NULL,'[]','2026-11-04 10:45:27.193','personal','manual','declared',1);
/*!40000 ALTER TABLE `fin_accounts` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_assets`
--

DROP TABLE IF EXISTS `fin_assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_assets` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `label` varchar(80) NOT NULL,
  `kind` varchar(20) NOT NULL,
  `categoryId` varchar(191) DEFAULT NULL,
  `value` double NOT NULL,
  `currency` varchar(3) NOT NULL,
  `valuedAt` datetime(3) NOT NULL,
  `liquidity` varchar(20) NOT NULL,
  `holder` varchar(80) DEFAULT NULL,
  `note` varchar(300) DEFAULT NULL,
  `scope` varchar(20) NOT NULL DEFAULT 'personal',
  `source` varchar(20) NOT NULL,
  `sourceRef` varchar(200) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `confidence` varchar(10) DEFAULT NULL,
  `consentUses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`consentUses`)),
  `effectiveAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `collectedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `version` int(11) NOT NULL DEFAULT 1,
  `archivedAt` datetime(3) DEFAULT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fin_assets_userId_deletedAt_idx` (`userId`,`deletedAt`),
  KEY `fin_assets_userId_valuedAt_idx` (`userId`,`valuedAt`),
  KEY `fin_assets_categoryId_idx` (`categoryId`),
  CONSTRAINT `fin_assets_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `fin_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fin_assets_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_assets_scope_check` CHECK (`scope` in ('personal','couple','household','space')),
  CONSTRAINT `fin_assets_source_check` CHECK (`source` in ('manual','imported','document','partner','computed')),
  CONSTRAINT `fin_assets_status_check` CHECK (`status` in ('real','declared','imported','computed','official','to_confirm')),
  CONSTRAINT `fin_assets_confidence_check` CHECK (`confidence` is null or `confidence` in ('high','medium','low')),
  CONSTRAINT `fin_assets_currency_check` CHECK (`currency` regexp '^[A-Z]{3}$'),
  CONSTRAINT `fin_assets_kind_check` CHECK (`kind` in ('account','ccp','cash','gold','vehicle','property','investment','other')),
  CONSTRAINT `fin_assets_liquidity_check` CHECK (`liquidity` in ('liquid','semi_liquid','illiquid')),
  CONSTRAINT `fin_assets_version_check` CHECK (`version` >= 1),
  CONSTRAINT `fin_assets_label_check` CHECK (trim(`label`) <> ''),
  CONSTRAINT `fin_assets_value_check` CHECK (`value` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_assets`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_assets` WRITE;
/*!40000 ALTER TABLE `fin_assets` DISABLE KEYS */;
INSERT INTO `fin_assets` VALUES
('237cadc5-5c29-4efc-9152-bbc1b7a0ee24','dd81c796-b6b8-49bd-a807-876c1c531d0b','commerce','investment',NULL,50000000,'DZD','2026-11-05 00:00:00.000','illiquid',NULL,NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-05 09:42:47.195','2026-11-05 09:42:47.195',1,NULL,NULL,'2026-11-05 09:42:47.195','2026-11-05 09:42:47.195'),
('96a14ec9-6329-4a2a-bb62-da10922ca9e5','087b8449-6ea8-4478-9a2a-097b0a43fc72','Voiture','vehicle',NULL,90000000,'DZD','2026-09-01 12:00:00.000','illiquid',NULL,NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-03 10:21:48.156','2026-11-03 10:21:48.156',1,NULL,NULL,'2026-11-03 10:21:48.156','2026-11-03 10:21:48.156'),
('b33a30da-5bb2-486b-9b56-a2d0a65ca907','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','SLS','vehicle',NULL,14000000,'DZD','2025-10-17 00:00:00.000','semi_liquid','moi',NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-10-17 08:20:13.938','2026-10-17 08:20:13.938',1,NULL,NULL,'2026-10-17 08:20:13.938','2026-10-17 08:20:13.938'),
('d4c9879c-0188-45f3-804e-c3818c0f3265','dd81c796-b6b8-49bd-a807-876c1c531d0b','SLS','vehicle',NULL,140000000,'DZD','2026-11-05 00:00:00.000','semi_liquid',NULL,NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-05 09:42:19.081','2026-11-05 09:42:19.081',1,NULL,NULL,'2026-11-05 09:42:19.081','2026-11-05 09:42:19.081'),
('e708249d-e81b-4302-b0e8-947ec7e63b5b','dd81c796-b6b8-49bd-a807-876c1c531d0b','epargne','account',NULL,15000000,'DZD','2026-11-05 00:00:00.000','liquid',NULL,NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-05 09:41:57.437','2026-11-05 09:41:57.437',1,NULL,NULL,'2026-11-05 09:41:57.437','2026-11-05 09:41:57.437'),
('f5598308-e360-4e83-92cd-0b1a33864029','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','maison','property',NULL,150000000,'DZD','2020-10-17 00:00:00.000','liquid','moi',NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-10-17 08:19:42.011','2026-10-17 08:19:42.011',1,NULL,NULL,'2026-10-17 08:19:42.011','2026-10-17 08:19:42.011');
/*!40000 ALTER TABLE `fin_assets` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_audit_logs`
--

DROP TABLE IF EXISTS `fin_audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_audit_logs` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) DEFAULT NULL,
  `intentCode` varchar(40) DEFAULT NULL,
  `flowKey` varchar(60) DEFAULT NULL,
  `stepKey` varchar(60) DEFAULT NULL,
  `action` varchar(30) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `fin_audit_logs_createdAt_idx` (`createdAt`),
  KEY `fin_audit_logs_userId_fkey` (`userId`),
  CONSTRAINT `fin_audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fin_audit_logs_action_check` CHECK (`action` in ('resolved','fallback','deep_link_opened','flow_started','flow_step','flow_ended','not_available'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_audit_logs`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_audit_logs` WRITE;
/*!40000 ALTER TABLE `fin_audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `fin_audit_logs` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_budgets`
--

DROP TABLE IF EXISTS `fin_budgets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_budgets` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `label` varchar(80) NOT NULL,
  `periodStart` datetime(3) NOT NULL,
  `periodEnd` datetime(3) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `recurrence` varchar(20) NOT NULL DEFAULT 'monthly',
  `alertThresholds` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`alertThresholds`)),
  `note` varchar(300) DEFAULT NULL,
  `scope` varchar(20) NOT NULL DEFAULT 'personal',
  `source` varchar(20) NOT NULL,
  `sourceRef` varchar(200) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `confidence` varchar(10) DEFAULT NULL,
  `consentUses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`consentUses`)),
  `effectiveAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `collectedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `version` int(11) NOT NULL DEFAULT 1,
  `archivedAt` datetime(3) DEFAULT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `carryOver` tinyint(1) NOT NULL DEFAULT 0,
  `methodMapping` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '{}' CHECK (json_valid(`methodMapping`)),
  `carryOverspend` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fin_budgets_userId_periodStart_idx` (`userId`,`periodStart`),
  CONSTRAINT `fin_budgets_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_budgets_scope_check` CHECK (`scope` in ('personal','couple','household','space')),
  CONSTRAINT `fin_budgets_source_check` CHECK (`source` in ('manual','imported','document','partner','computed')),
  CONSTRAINT `fin_budgets_status_check` CHECK (`status` in ('real','declared','imported','computed','fictional','official','to_confirm')),
  CONSTRAINT `fin_budgets_confidence_check` CHECK (`confidence` is null or `confidence` in ('high','medium','low')),
  CONSTRAINT `fin_budgets_currency_check` CHECK (`currency` regexp '^[A-Z]{3}$'),
  CONSTRAINT `fin_budgets_recurrence_check` CHECK (`recurrence` in ('none','monthly','quarterly','yearly')),
  CONSTRAINT `fin_budgets_version_check` CHECK (`version` >= 1),
  CONSTRAINT `fin_budgets_label_check` CHECK (trim(`label`) <> ''),
  CONSTRAINT `fin_budgets_period_check` CHECK (`periodEnd` > `periodStart`),
  CONSTRAINT `fin_budgets_thresholds_check` CHECK (json_type(`alertThresholds`) = 'ARRAY')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_budgets`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_budgets` WRITE;
/*!40000 ALTER TABLE `fin_budgets` DISABLE KEYS */;
INSERT INTO `fin_budgets` VALUES
('770f6a7d-f556-4b6c-ab9e-c0656cda29c5','087b8449-6ea8-4478-9a2a-097b0a43fc72','Ce mois-ci','2026-11-01 00:00:00.000','2026-11-30 23:59:59.000','DZD','monthly','[0.8,1]',NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-03 10:21:45.608','2026-11-03 10:21:45.608',1,NULL,NULL,'2026-11-03 10:21:45.608','2026-11-03 10:21:45.608',0,'{}',0),
('e0f6f7f6-edd0-4388-aa12-929fac5ffaed','dd81c796-b6b8-49bd-a807-876c1c531d0b','aziz','2026-10-01 00:00:00.000','2026-10-31 22:59:59.000','DZD','monthly','[0.8,1]',NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-10-15 08:53:16.366','2026-10-15 08:53:16.366',1,NULL,NULL,'2026-10-15 08:53:16.366','2026-10-15 08:53:16.366',0,'{}',0),
('e34414c7-fb80-4d72-897b-d767ce4a2253','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','novembre','2026-11-01 00:00:00.000','2026-11-30 22:59:59.000','DZD','monthly','[0.8,1]',NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-04 10:27:12.342','2026-11-04 10:27:12.342',3,NULL,NULL,'2026-11-04 10:27:12.342','2026-11-04 10:27:37.706',1,'{}',1),
('eb1a8c58-c6dc-4494-81ee-ca690e3a2b50','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','aziz','2026-04-15 00:00:00.000','2026-10-31 22:59:59.000','DZD','none','[0.8,1]',NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-10-17 08:10:15.553','2026-10-17 08:10:15.553',1,NULL,NULL,'2026-10-17 08:10:15.553','2026-10-17 08:10:15.553',0,'{}',0);
/*!40000 ALTER TABLE `fin_budgets` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_business_contacts`
--

DROP TABLE IF EXISTS `fin_business_contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_business_contacts` (
  `id` varchar(191) NOT NULL,
  `businessId` varchar(191) NOT NULL,
  `kind` varchar(10) NOT NULL,
  `name` varchar(160) NOT NULL,
  `taxId` varchar(40) DEFAULT NULL,
  `email` varchar(254) DEFAULT NULL,
  `phone` varchar(40) DEFAULT NULL,
  `address` varchar(300) DEFAULT NULL,
  `country` varchar(2) DEFAULT NULL,
  `note` varchar(300) DEFAULT NULL,
  `scope` varchar(20) NOT NULL DEFAULT 'business',
  `source` varchar(20) NOT NULL,
  `sourceRef` varchar(200) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `consentUses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`consentUses`)),
  `effectiveAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `collectedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `version` int(11) NOT NULL DEFAULT 1,
  `archivedAt` datetime(3) DEFAULT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fin_business_contacts_businessId_kind_idx` (`businessId`,`kind`),
  CONSTRAINT `fin_business_contacts_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_contact_kind` CHECK (`kind` in ('client','supplier')),
  CONSTRAINT `chk_contact_version` CHECK (`version` >= 1),
  CONSTRAINT `chk_contact_country` CHECK (`country` is null or `country` regexp '^[A-Z]{2}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_business_contacts`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_business_contacts` WRITE;
/*!40000 ALTER TABLE `fin_business_contacts` DISABLE KEYS */;
/*!40000 ALTER TABLE `fin_business_contacts` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_business_documents`
--

DROP TABLE IF EXISTS `fin_business_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_business_documents` (
  `id` varchar(191) NOT NULL,
  `businessId` varchar(191) NOT NULL,
  `contactId` varchar(191) DEFAULT NULL,
  `kind` varchar(10) NOT NULL,
  `number` varchar(40) NOT NULL,
  `label` varchar(200) NOT NULL,
  `issuedAt` datetime(3) NOT NULL,
  `dueAt` datetime(3) DEFAULT NULL,
  `amountExcl` double NOT NULL,
  `taxAmount` double NOT NULL DEFAULT 0,
  `currency` varchar(3) NOT NULL,
  `note` varchar(300) DEFAULT NULL,
  `scope` varchar(20) NOT NULL DEFAULT 'business',
  `source` varchar(20) NOT NULL,
  `sourceRef` varchar(200) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `confidence` varchar(20) DEFAULT NULL,
  `consentUses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`consentUses`)),
  `effectiveAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `collectedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `version` int(11) NOT NULL DEFAULT 1,
  `archivedAt` datetime(3) DEFAULT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fin_business_documents_businessId_kind_number_key` (`businessId`,`kind`,`number`),
  KEY `fin_business_documents_businessId_issuedAt_idx` (`businessId`,`issuedAt`),
  KEY `fin_business_documents_contactId_fkey` (`contactId`),
  CONSTRAINT `fin_business_documents_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_business_documents_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `fin_business_contacts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_document_kind` CHECK (`kind` in ('sale','purchase')),
  CONSTRAINT `chk_document_amount` CHECK (`amountExcl` >= 0 and `taxAmount` >= 0),
  CONSTRAINT `chk_document_currency` CHECK (`currency` regexp '^[A-Z]{3}$'),
  CONSTRAINT `chk_document_due` CHECK (`dueAt` is null or `dueAt` >= `issuedAt`),
  CONSTRAINT `chk_document_version` CHECK (`version` >= 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_business_documents`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_business_documents` WRITE;
/*!40000 ALTER TABLE `fin_business_documents` DISABLE KEYS */;
INSERT INTO `fin_business_documents` VALUES
('854bae79-a1d1-48fb-b89e-bd366270b3b7','caf44ba9-0caa-41dd-8279-97a9677783c7',NULL,'sale','12','test','2026-11-01 00:00:00.000','2026-11-03 00:00:00.000',1200000,100,'DZD',NULL,'business','declared',NULL,'active',NULL,'[]','2026-11-04 14:34:28.603','2026-11-04 14:34:28.603',1,NULL,NULL,'2026-11-04 14:34:28.603','2026-11-04 14:34:28.603');
/*!40000 ALTER TABLE `fin_business_documents` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_business_payments`
--

DROP TABLE IF EXISTS `fin_business_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_business_payments` (
  `id` varchar(191) NOT NULL,
  `businessId` varchar(191) NOT NULL,
  `documentId` varchar(191) NOT NULL,
  `value` double NOT NULL,
  `currency` varchar(3) NOT NULL,
  `receivedAt` datetime(3) NOT NULL,
  `method` varchar(20) DEFAULT NULL,
  `note` varchar(300) DEFAULT NULL,
  `scope` varchar(20) NOT NULL DEFAULT 'business',
  `source` varchar(20) NOT NULL,
  `sourceRef` varchar(200) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `consentUses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`consentUses`)),
  `effectiveAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `collectedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `version` int(11) NOT NULL DEFAULT 1,
  `archivedAt` datetime(3) DEFAULT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fin_business_payments_businessId_receivedAt_idx` (`businessId`,`receivedAt`),
  KEY `fin_business_payments_documentId_idx` (`documentId`),
  CONSTRAINT `fin_business_payments_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `fin_businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_business_payments_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `fin_business_documents` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_payment_value` CHECK (`value` > 0),
  CONSTRAINT `chk_payment_currency` CHECK (`currency` regexp '^[A-Z]{3}$'),
  CONSTRAINT `chk_payment_version` CHECK (`version` >= 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_business_payments`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_business_payments` WRITE;
/*!40000 ALTER TABLE `fin_business_payments` DISABLE KEYS */;
INSERT INTO `fin_business_payments` VALUES
('e1b62b4c-feb9-436c-8450-8951cb3189e1','caf44ba9-0caa-41dd-8279-97a9677783c7','854bae79-a1d1-48fb-b89e-bd366270b3b7',500000,'DZD','2026-11-01 00:00:00.000',NULL,NULL,'business','declared',NULL,'active','[]','2026-11-04 14:34:38.137','2026-11-04 14:34:38.137',1,NULL,NULL,'2026-11-04 14:34:38.137','2026-11-04 14:34:38.137');
/*!40000 ALTER TABLE `fin_business_payments` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_businesses`
--

DROP TABLE IF EXISTS `fin_businesses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_businesses` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `name` varchar(160) NOT NULL,
  `legalForm` varchar(40) DEFAULT NULL,
  `taxId` varchar(40) DEFAULT NULL,
  `tradeRegister` varchar(40) DEFAULT NULL,
  `statisticalId` varchar(40) DEFAULT NULL,
  `activity` varchar(160) DEFAULT NULL,
  `currency` varchar(3) NOT NULL,
  `fiscalYearStartMonth` int(11) NOT NULL DEFAULT 1,
  `scope` varchar(20) NOT NULL DEFAULT 'business',
  `source` varchar(20) NOT NULL,
  `sourceRef` varchar(200) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `consentUses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`consentUses`)),
  `effectiveAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `collectedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `version` int(11) NOT NULL DEFAULT 1,
  `archivedAt` datetime(3) DEFAULT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fin_businesses_userId_key` (`userId`),
  CONSTRAINT `fin_businesses_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_business_currency` CHECK (`currency` regexp '^[A-Z]{3}$'),
  CONSTRAINT `chk_business_fiscal_month` CHECK (`fiscalYearStartMonth` between 1 and 12),
  CONSTRAINT `chk_business_version` CHECK (`version` >= 1),
  CONSTRAINT `chk_business_scope` CHECK (`scope` = 'business')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_businesses`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_businesses` WRITE;
/*!40000 ALTER TABLE `fin_businesses` DISABLE KEYS */;
INSERT INTO `fin_businesses` VALUES
('caf44ba9-0caa-41dd-8279-97a9677783c7','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','ay web',NULL,NULL,NULL,NULL,NULL,'DZD',1,'business','declared',NULL,'active','[]','2026-11-04 14:32:48.991','2026-11-04 14:32:48.991',1,NULL,NULL,'2026-11-04 14:32:48.991','2026-11-04 14:32:48.991');
/*!40000 ALTER TABLE `fin_businesses` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_categories`
--

DROP TABLE IF EXISTS `fin_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_categories` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) DEFAULT NULL,
  `family` varchar(20) NOT NULL,
  `key` varchar(80) DEFAULT NULL,
  `baseKey` varchar(80) DEFAULT NULL,
  `label` varchar(80) NOT NULL,
  `scope` varchar(20) NOT NULL DEFAULT 'personal',
  `source` varchar(20) NOT NULL,
  `sourceRef` varchar(200) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `consentUses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`consentUses`)),
  `effectiveAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `collectedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `version` int(11) NOT NULL DEFAULT 1,
  `archivedAt` datetime(3) DEFAULT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `group` varchar(60) DEFAULT NULL,
  `icon` varchar(16) DEFAULT NULL,
  `color` varchar(9) DEFAULT NULL,
  `essential` tinyint(1) DEFAULT NULL,
  `recurrence` varchar(40) DEFAULT NULL,
  `suggestedFor` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '[]' CHECK (json_valid(`suggestedFor`)),
  PRIMARY KEY (`id`),
  UNIQUE KEY `fin_categories_key_key` (`key`),
  UNIQUE KEY `fin_categories_userId_baseKey_key` (`userId`,`baseKey`),
  KEY `fin_categories_userId_family_idx` (`userId`,`family`),
  CONSTRAINT `fin_categories_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_categories_family_check` CHECK (`family` in ('income','fixed','variable','seasonal','goal','asset','debt','shared')),
  CONSTRAINT `fin_categories_scope_check` CHECK (`scope` in ('personal','couple','household','space')),
  CONSTRAINT `fin_categories_source_check` CHECK (`source` in ('manual','imported','document','partner','computed')),
  CONSTRAINT `fin_categories_status_check` CHECK (`status` in ('real','declared','imported','computed','fictional','official','to_confirm')),
  CONSTRAINT `fin_categories_version_check` CHECK (`version` >= 1),
  CONSTRAINT `fin_categories_label_check` CHECK (trim(`label`) <> '')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_categories`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_categories` WRITE;
/*!40000 ALTER TABLE `fin_categories` DISABLE KEYS */;
INSERT INTO `fin_categories` VALUES
('00463b58-dd2d-5234-91e9-bacbe2dfe7bd',NULL,'shared','shared.gaz',NULL,'Gaz','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('022689f4-0a13-56bf-a282-427f826e8839',NULL,'shared','shared.electricite',NULL,'Électricité','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('032a4909-a331-5ea4-9caa-25f6d1bacf2b',NULL,'seasonal','seasonal.assurance_vehicule',NULL,'Assurance véhicule','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.864','2026-10-28 09:03:32.864',1,NULL,NULL,'2026-10-28 09:03:32.864','2026-10-28 09:03:32.864','Transport','🛡️','#1D4ED8',1,'Annuel','[\"Tous ; ordre suggéré selon profil\"]'),
('038fc44f-f441-5177-b247-0a31b743b7fa',NULL,'variable','variable.transport_voyage',NULL,'Transport voyage','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:33.000','2026-10-28 09:03:33.000',1,NULL,NULL,'2026-10-28 09:03:33.000','2026-10-28 09:03:33.000','Voyage & vacances','✈️','#0891B2',0,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('03df1e5d-51f9-5407-a496-0f6b099f4b7d',NULL,'variable','variable.parking_peage',NULL,'Parking / péage','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.859','2026-10-28 09:03:32.859',1,NULL,NULL,'2026-10-28 09:03:32.859','2026-10-28 09:03:32.859','Transport','🅿️','#64748B',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('05029b7d-7d4b-52db-a1b4-08170adedc9f',NULL,'variable','variable.transport_professionnel',NULL,'Transport professionnel','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:33.094','2026-10-28 09:03:33.094',1,NULL,NULL,'2026-10-28 09:03:33.094','2026-10-28 09:03:33.094','Dépenses professionnelles personnelles','💼','#0369A1',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('05504481-7b72-50d3-9810-4f8b636e4edf',NULL,'variable','variable.hygiene_soins',NULL,'Hygiène / soins','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.910','2026-10-28 09:03:32.910',1,NULL,NULL,'2026-10-28 09:03:32.910','2026-10-28 09:03:32.910','Santé & bien-être','🧴','#FB7185',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('06c02b43-af20-5eed-bb6d-bf82fb3c78e8',NULL,'fixed','fixed.credit_immobilier',NULL,'Crédit immobilier','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',2,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821','Logement','🏦','#92400E',1,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('0a3cd861-c283-5a9b-9626-2a224feb4a7b',NULL,'variable','variable.sorties',NULL,'Sorties','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.991','2026-10-28 09:03:32.991',1,NULL,NULL,'2026-10-28 09:03:32.991','2026-10-28 09:03:32.991','Loisirs & culture','🎉','#E11D48',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('0ad7aaee-263a-5255-9f92-c40c480392fa',NULL,'shared','shared.transport_commun',NULL,'Transport commun','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('0b9357f3-bf24-54a5-ae8c-d03c93588924',NULL,'variable','variable.culture_livres_loisirs',NULL,'Culture / livres loisirs','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.994','2026-10-28 09:03:32.994',1,NULL,NULL,'2026-10-28 09:03:32.994','2026-10-28 09:03:32.994','Loisirs & culture','📖','#9F1239',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('0c28300a-1c43-5505-9cfc-641739643cf6',NULL,'variable','variable.mobilier_decoration',NULL,'Mobilier / décoration','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.838','2026-10-28 09:03:32.838',1,NULL,NULL,'2026-10-28 09:03:32.838','2026-10-28 09:03:32.838','Logement','🛋️','#A78BFA',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('0f232541-0d4e-5808-bb77-1a318a6171e0',NULL,'variable','variable.formation_professionnelle',NULL,'Formation professionnelle','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.924','2026-10-28 09:03:32.924',1,NULL,NULL,'2026-10-28 09:03:32.924','2026-10-28 09:03:32.924','Éducation & formation','📘','#0284C7',0,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('103b8ab1-e94b-5e29-9f5e-c036e30d74b8',NULL,'income','income.pension',NULL,'Retraite / pension','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',2,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821','Social & pensions','🌅','#64748B',1,'Mensuel','[\"Tous\"]'),
('1224a7ae-33ca-5ed3-b388-3bd2b1d849e9',NULL,'fixed','fixed.creche_garde',NULL,'Crèche / garde','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.956','2026-10-28 09:03:32.956',1,NULL,NULL,'2026-10-28 09:03:32.956','2026-10-28 09:03:32.956','Enfants & famille','🧸','#DB2777',1,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('13a0020c-1f62-5ac1-a3e7-8630c99ced1e',NULL,'variable','variable.hebergement',NULL,'Hébergement','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:33.011','2026-10-28 09:03:33.011',1,NULL,NULL,'2026-10-28 09:03:33.011','2026-10-28 09:03:33.011','Voyage & vacances','🏨','#0E7490',0,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('14cc3c7e-44af-5689-befd-9f3ec33b6113',NULL,'income','income.indemnisation_assurance',NULL,'Indemnisation assurance','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.802','2026-10-28 09:03:32.802',1,NULL,NULL,'2026-10-28 09:03:32.802','2026-10-28 09:03:32.802','Exceptionnel','🛡️','#0369A1',0,'Ponctuel','[\"Tous\"]'),
('14cc44e4-c1d9-53a5-8f79-b33ec7dbd78b',NULL,'fixed','fixed.eau',NULL,'Eau','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',2,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821','Logement','💧','#0EA5E9',1,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('15aaaa15-e5c9-5fc6-9363-ec8e76602eb0',NULL,'seasonal','seasonal.rentree_scolaire',NULL,'Rentrée scolaire','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,'2026-10-28 12:35:28.962',NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('18d882c4-7c4a-5e08-a3bb-b5befd4c17ee',NULL,'goal','goal.ordinateur_equipement',NULL,'Ordinateur / équipement','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('18dbc888-e04f-5190-8942-5ad813e3e8b7',NULL,'income','income.commission',NULL,'Commission','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.745','2026-10-28 09:03:32.745',1,NULL,NULL,'2026-10-28 09:03:32.745','2026-10-28 09:03:32.745','Salaire & emploi','🎯','#0EA5E9',0,'Variable','[\"Jeune actif\", \"Salarié\"]'),
('1dd8739c-599a-5a0c-9e66-6b24479f1049',NULL,'fixed','fixed.remboursement_carte_de_credit',NULL,'Remboursement carte de crédit','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:33.043','2026-10-28 09:03:33.043',1,NULL,NULL,'2026-10-28 09:03:33.043','2026-10-28 09:03:33.043','Dettes & engagements','💳','#7F1D1D',1,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('1e971e35-07cf-5969-947a-6c63486b8f03',NULL,'variable','variable.frais_bancaires',NULL,'Frais bancaires','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:33.023','2026-10-28 09:03:33.023',1,NULL,NULL,'2026-10-28 09:03:33.023','2026-10-28 09:03:33.023','Banque & finance','🏦','#475569',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('1f6e6e4f-acf6-571d-adfc-79e6eabd1bb3',NULL,'fixed','fixed.gaz',NULL,'Gaz','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',2,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821','Logement','🔥','#F97316',1,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('2115e6b9-3f42-5c86-a2b4-4b40a37d7aee',NULL,'variable','variable.hobbies',NULL,'Hobbies','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.996','2026-10-28 09:03:32.996',1,NULL,NULL,'2026-10-28 09:03:32.996','2026-10-28 09:03:32.996','Loisirs & culture','🎨','#F43F5E',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('232ee03b-efc5-4a2b-9b56-43526542d85f','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','variable',NULL,NULL,'Tabac','personal','manual',NULL,'declared','[]','2026-11-04 14:37:26.095','2026-11-04 14:37:26.095',2,NULL,NULL,'2026-11-04 14:37:26.095','2026-11-04 14:37:29.231',NULL,NULL,NULL,1,NULL,'[]'),
('258c6882-ab7b-5a0d-97ce-627e15f5575a',NULL,'variable','variable.interets_agios',NULL,'Intérêts / agios','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:33.028','2026-10-28 09:03:33.028',1,NULL,NULL,'2026-10-28 09:03:33.028','2026-10-28 09:03:33.028','Banque & finance','📉','#B91C1C',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('261f4208-3118-5ff1-ac11-3f9a9627fae0',NULL,'variable','variable.amende_penalite',NULL,'Amende / pénalité','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:33.054','2026-10-28 09:03:33.054',1,NULL,NULL,'2026-10-28 09:03:33.054','2026-10-28 09:03:33.054','Impôts & administration','🚫','#DC2626',0,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('26fb98c2-4ffb-5d47-86d2-035076a1792a',NULL,'variable','variable.telecom_variable',NULL,'Télécom variable','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,'2026-10-28 12:35:28.962',NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('297a728a-1b03-578b-9559-95faea0b9170',NULL,'shared','shared.sorties',NULL,'Sorties','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('2a06b72d-d887-560b-865e-68c6852d64cb',NULL,'income','income.heritage_transmission',NULL,'Héritage / transmission','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.798','2026-10-28 09:03:32.798',1,NULL,NULL,'2026-10-28 09:03:32.798','2026-10-28 09:03:32.798','Exceptionnel','📦','#BE185D',0,'Ponctuel','[\"Tous\"]'),
('2c007ea1-fc78-5170-adaf-c7680d325044',NULL,'shared','shared.projet_commun',NULL,'Projet commun','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('2ce5bdbe-8325-5deb-8e86-24bf89328d1e',NULL,'variable','variable.cadeau_offert',NULL,'Cadeau offert','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:33.082','2026-10-28 09:03:33.082',1,NULL,NULL,'2026-10-28 09:03:33.082','2026-10-28 09:03:33.082','Dons & solidarité','🎁','#DB2777',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('2d925b61-db62-57b0-b1c1-fbcafb309575',NULL,'shared','shared.loyer',NULL,'Loyer','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('2da80560-f1c7-53ad-96ae-b4c0288dd055',NULL,'goal','goal.permis',NULL,'Permis','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('2eeeddb9-7ad5-5304-8962-a8eb9886a4fd',NULL,'fixed','fixed.musique_media',NULL,'Musique / média','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.886','2026-10-28 09:03:32.886',1,NULL,NULL,'2026-10-28 09:03:32.886','2026-10-28 09:03:32.886','Télécom & numérique','🎵','#A855F7',0,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('32fd710a-6837-5822-9cfb-eb19ff666957',NULL,'variable','variable.culture_loisirs_sorties',NULL,'Culture / loisirs / sorties','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,'2026-10-28 12:35:28.962',NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('32ff301d-fc65-5454-9a47-d1063570bb97',NULL,'variable','variable.optique',NULL,'Optique','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.903','2026-10-28 09:03:32.903',1,NULL,NULL,'2026-10-28 09:03:32.903','2026-10-28 09:03:32.903','Santé & bien-être','👓','#BE123C',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('333e3974-8709-5416-843c-294daaa7a4b8',NULL,'variable','variable.taxi_vtc',NULL,'Taxi / VTC','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.857','2026-10-28 09:03:32.857',1,NULL,NULL,'2026-10-28 09:03:32.857','2026-10-28 09:03:32.857','Transport','🚕','#0EA5E9',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('346b9da6-92c7-5136-bac3-938ebbdaaad2',NULL,'fixed','fixed.abonnement',NULL,'Abonnement','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,'2026-10-28 12:35:28.962',NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('36050ecb-1fbc-5065-a972-6cb986997a9e',NULL,'variable','variable.medecin',NULL,'Médecin','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.895','2026-10-28 09:03:32.895',1,NULL,NULL,'2026-10-28 09:03:32.895','2026-10-28 09:03:32.895','Santé & bien-être','🩺','#DC2626',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('36562e12-b329-5574-be61-96e4c8634aeb',NULL,'fixed','fixed.transport_recurrent',NULL,'Transport récurrent','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,1,NULL,'[]'),
('36e951ae-e694-5577-90c6-94633a7dc5c4',NULL,'fixed','fixed.streaming_video',NULL,'Streaming vidéo','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.884','2026-10-28 09:03:32.884',1,NULL,NULL,'2026-10-28 09:03:32.884','2026-10-28 09:03:32.884','Télécom & numérique','🎬','#9333EA',0,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('3a27e5cc-a558-5a24-99db-d09bb93eaf97',NULL,'income','income.revenu_locatif',NULL,'Loyer reçu','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',2,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821','Patrimoine','🏠','#B45309',1,'Mensuel','[\"Tous\"]'),
('3d2b25f3-3202-53a6-bc60-0e809da751d3',NULL,'fixed','fixed.pension_engagement',NULL,'Pension / engagement','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',2,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821','Dettes & engagements','📅','#9F1239',1,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('3d89a832-3386-55a4-8d23-4e282ca74200',NULL,'variable','variable.penalites_financieres',NULL,'Pénalités financières','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:33.030','2026-10-28 09:03:33.030',1,NULL,NULL,'2026-10-28 09:03:33.030','2026-10-28 09:03:33.030','Banque & finance','⚠️','#991B1B',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('3dc2b43c-b045-5a69-b5fa-4e2951a95791',NULL,'goal','goal.voyage',NULL,'Voyage','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('3f7c3422-96b9-58c9-b779-be915b5ad3ef',NULL,'income','income.salaire_brut_information',NULL,'Salaire brut (information)','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,'2026-10-28 12:35:28.962',NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('4139e59c-3c2e-5a29-8cdf-fe5e8f070157',NULL,'debt','debt.dette_familiale_declaree',NULL,'Dette familiale déclarée','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('44473602-32e0-54e3-8e84-c97fa4ab290b',NULL,'goal','goal.autre',NULL,'Autre','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('452c4589-17d4-5e80-91ad-418d1b72e5f2',NULL,'debt','debt.credit_immobilier',NULL,'Crédit immobilier','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('4559ae8c-a437-555a-ab9c-57004bb0682b',NULL,'variable','variable.transport_automobile',NULL,'Transport / automobile','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,'2026-10-28 12:35:28.962',NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('462c54ab-ae70-52cc-95be-06f40240b8a3',NULL,'income','income.aide_familiale',NULL,'Aide familiale','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',2,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821','Études & jeunesse','👪','#A855F7',1,'Variable','[\"Lycéen\", \"Étudiant\"]'),
('46830f2c-7ad5-596a-9284-4218186837a9',NULL,'asset','asset.ccp',NULL,'CCP','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('47448ae2-9c9b-5418-af5b-5875b554f11f',NULL,'asset','asset.compte_d_epargne',NULL,'Compte d’épargne','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('475ef139-1929-5e4a-8a66-33e148467cc8',NULL,'fixed','fixed.mensualite_financement_vehicule',NULL,'Mensualité financement véhicule','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:33.036','2026-10-28 09:03:33.036',1,NULL,NULL,'2026-10-28 09:03:33.036','2026-10-28 09:03:33.036','Dettes & engagements','🚗','#991B1B',1,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('47f702a5-91ca-55df-962c-cadfe651ab05',NULL,'goal','goal.etudes',NULL,'Études','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('48067220-d777-5db4-b6e0-0f63bdf37265',NULL,'seasonal','seasonal.entretien_reparation',NULL,'Entretien / réparation','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,'2026-10-28 12:35:28.962',NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('4a9dcfd0-279b-528c-933a-130990a43a40',NULL,'variable','variable.maison_equipement',NULL,'Maison / équipement','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,'2026-10-28 12:35:28.962',NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('4ba17c79-10b2-56d1-ae91-a9cad1745397',NULL,'fixed','fixed.electricite',NULL,'Électricité','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',2,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821','Logement','💡','#EAB308',1,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('4c1b6baf-0911-52e2-a510-c399f66b18b0',NULL,'variable','variable.timbre_frais_dossier',NULL,'Timbre / frais dossier','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:33.051','2026-10-28 09:03:33.051',1,NULL,NULL,'2026-10-28 09:03:33.051','2026-10-28 09:03:33.051','Impôts & administration','🧾','#A1A1AA',0,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('4d01add5-eb04-5201-ae40-fa1c1899a79a',NULL,'fixed','fixed.autre_charge_fixe',NULL,'Autre charge fixe','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,1,NULL,'[]'),
('4e7ff089-d967-5ffe-a5ac-f9e1bfd932f9',NULL,'variable','variable.entretien_logement',NULL,'Entretien logement','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.834','2026-10-28 09:03:32.834',1,NULL,NULL,'2026-10-28 09:03:32.834','2026-10-28 09:03:32.834','Logement','🧰','#78716C',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('4e8a3bcd-0163-5b6d-a72f-781452a115b9',NULL,'goal','goal.reserve_de_securite',NULL,'Réserve de sécurité','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('4edfe57c-8740-52cb-95c5-9c26ab1f9948',NULL,'variable','variable.chaussures',NULL,'Chaussures','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.973','2026-10-28 09:03:32.973',1,NULL,NULL,'2026-10-28 09:03:32.973','2026-10-28 09:03:32.973','Vêtements & soins personnels','👟','#7E22CE',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('4f75acc1-aee3-5114-a5e4-a7db5521e1f6',NULL,'asset','asset.or',NULL,'Or','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('510f4d62-5c45-59db-894f-f6a167054a49',NULL,'variable','variable.analyses_imagerie',NULL,'Analyses / imagerie','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.898','2026-10-28 09:03:32.898',1,NULL,NULL,'2026-10-28 09:03:32.898','2026-10-28 09:03:32.898','Santé & bien-être','🧪','#F43F5E',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('52c27920-339b-5bd4-95c6-ffd2554a4933',NULL,'variable','variable.formation_pro_autofinancee',NULL,'Formation pro autofinancée','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:33.099','2026-10-28 09:03:33.099',1,NULL,NULL,'2026-10-28 09:03:33.099','2026-10-28 09:03:33.099','Dépenses professionnelles personnelles','📚','#082F49',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('53b4f820-e19b-5fb5-9dda-b97488a9db80',NULL,'income','income.interets_rendement',NULL,'Intérêts / rendement','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.789','2026-10-28 09:03:32.789',1,NULL,NULL,'2026-10-28 09:03:32.789','2026-10-28 09:03:32.789','Patrimoine','💹','#22C55E',0,'Variable','[\"Tous\"]'),
('54d836e0-2a54-59cb-b6fc-cd9a6c629516',NULL,'fixed','fixed.credit_consommation',NULL,'Mensualité crédit consommation','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',2,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821','Dettes & engagements','🧾','#B91C1C',1,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('55711fdc-bd85-529e-b196-11015a0fd410',NULL,'variable','variable.restauration_voyage',NULL,'Restauration voyage','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:33.015','2026-10-28 09:03:33.015',1,NULL,NULL,'2026-10-28 09:03:33.015','2026-10-28 09:03:33.015','Voyage & vacances','🍴','#06B6D4',0,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('58b791c3-f03e-57de-833f-253a51346e84',NULL,'income','income.bourse',NULL,'Bourse','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',2,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821','Études & jeunesse','🎓','#7E57C2',1,'Mensuel/Trimestriel','[\"Lycéen\", \"Étudiant\"]'),
('5a02d22b-6ba1-57cd-9ada-e96fca576f24',NULL,'variable','variable.repas_ecole_travail',NULL,'Repas école / travail','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.851','2026-10-28 09:03:32.851',1,NULL,NULL,'2026-10-28 09:03:32.851','2026-10-28 09:03:32.851','Alimentation','🥗','#84CC16',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('5bd7e27d-563d-5170-b55b-3c2e0d453278',NULL,'variable','variable.veterinaire',NULL,'Vétérinaire','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:33.090','2026-10-28 09:03:33.090',1,NULL,NULL,'2026-10-28 09:03:33.090','2026-10-28 09:03:33.090','Animaux','🐕','#B45309',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('5d49e78e-a179-5ffd-a539-63971bde01b4',NULL,'fixed','fixed.cloud_stockage',NULL,'Cloud / stockage','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.888','2026-10-28 09:03:32.888',1,NULL,NULL,'2026-10-28 09:03:32.888','2026-10-28 09:03:32.888','Télécom & numérique','☁️','#8B5CF6',0,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('5df77210-f140-571e-82d9-f97becf973a4',NULL,'fixed','fixed.sport_salle',NULL,'Sport / salle','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.912','2026-10-28 09:03:32.912',1,NULL,NULL,'2026-10-28 09:03:32.912','2026-10-28 09:03:32.912','Santé & bien-être','🏋️','#F97316',0,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('5fe76ef2-65d7-5034-aa7c-c635f4ea3bd8',NULL,'asset','asset.participation_entreprise',NULL,'Participation / entreprise','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('60a634d8-f7b4-5951-a166-418e7b8c48a2',NULL,'seasonal','seasonal.fetes',NULL,'Fêtes','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,'2026-10-28 12:35:28.962',NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('63d6891a-1837-5101-8d53-1222f71edb54',NULL,'variable','variable.entretien_vehicule',NULL,'Entretien véhicule','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.860','2026-10-28 09:03:32.860',1,NULL,NULL,'2026-10-28 09:03:32.860','2026-10-28 09:03:32.860','Transport','🔧','#475569',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('655c8f61-ec2c-5437-8142-6790d4812b5e',NULL,'income','income.job_etudiant',NULL,'Job étudiant','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',2,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821','Études & jeunesse','🧑‍💼','#8B5CF6',1,'Variable','[\"Étudiant\"]'),
('6574f20d-459e-544b-be00-ea981c74e874',NULL,'income','income.vente_petite_activite',NULL,'Vente / petite activité','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.783','2026-10-28 09:03:32.783',1,NULL,NULL,'2026-10-28 09:03:32.783','2026-10-28 09:03:32.783','Indépendant','🛍️','#2DD4BF',0,'Variable','[\"Tous\"]'),
('6b8a6661-1283-5766-bc54-d9e06e27f955',NULL,'income','income.indemnite_avantage_monetise',NULL,'Indemnité / avantage monétisé','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.747','2026-10-28 09:03:32.747',1,NULL,NULL,'2026-10-28 09:03:32.747','2026-10-28 09:03:32.747','Salaire & emploi','🧾','#0284C7',0,'Variable','[\"Jeune actif\", \"Salarié\"]'),
('6ce58349-1108-5eaf-aec3-244273fda544',NULL,'variable','variable.cosmetiques',NULL,'Cosmétiques','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.977','2026-10-28 09:03:32.977',1,NULL,NULL,'2026-10-28 09:03:32.977','2026-10-28 09:03:32.977','Vêtements & soins personnels','🧴','#C084FC',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('6cfb8cd3-1e71-5d2f-8b7f-0f5fedd40606',NULL,'variable','variable.hospitalisation',NULL,'Hospitalisation','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.906','2026-10-28 09:03:32.906',1,NULL,NULL,'2026-10-28 09:03:32.906','2026-10-28 09:03:32.906','Santé & bien-être','🏥','#991B1B',1,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('6e358662-0ac3-5781-a586-83c52e657d2b',NULL,'income','income.vente_dun_actif',NULL,'Vente d’un actif','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.805','2026-10-28 09:03:32.805',1,NULL,NULL,'2026-10-28 09:03:32.805','2026-10-28 09:03:32.805','Exceptionnel','🏷️','#9A3412',0,'Ponctuel','[\"Tous\"]'),
('6f48de67-b016-5512-be4d-feab8f4f7763',NULL,'shared','shared.equipement_commun',NULL,'Équipement commun','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('6f66efbc-8ae9-5eb3-abc2-b5ce7edd85dd',NULL,'fixed','fixed.copropriete_charges',NULL,'Charges / copropriété','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',2,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821','Logement','🏢','#A16207',1,'Mensuel/Trimestriel','[\"Tous ; ordre suggéré selon profil\"]'),
('6faa9b73-32cc-559b-a5d3-862e6685fb38',NULL,'asset','asset.obligations_sukuk_declares',NULL,'Obligations / sukuk déclarés','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('6fbea5a6-a534-52e9-8157-99f2b9db8d34',NULL,'asset','asset.compte_bancaire',NULL,'Compte bancaire','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('71d30936-de69-550a-a91a-13bf1a0062d0',NULL,'variable','variable.transport_enfant',NULL,'Transport enfant','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.960','2026-10-28 09:03:32.960',1,NULL,NULL,'2026-10-28 09:03:32.960','2026-10-28 09:03:32.960','Enfants & famille','🚌','#9D174D',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('73abb6aa-b5e6-5bfa-a360-61654dd00c62',NULL,'debt','debt.financement_vehicule',NULL,'Financement véhicule','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('7508d75a-8d76-5f6f-b9b9-0256a17c8f09',NULL,'asset','asset.autre_actif',NULL,'Autre actif','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('765fd009-4112-5026-8680-adec38a9bdb1',NULL,'variable','variable.pharmacie',NULL,'Pharmacie','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.897','2026-10-28 09:03:32.897',1,NULL,NULL,'2026-10-28 09:03:32.897','2026-10-28 09:03:32.897','Santé & bien-être','💊','#EF4444',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('78536d54-4a70-5fea-bed7-4f5cd47cc162',NULL,'income','income.prime',NULL,'Prime / bonus','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',2,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821','Salaire & emploi','⭐','#3B82F6',0,'Variable','[\"Jeune actif\", \"Salarié\"]'),
('7d7ea9f5-c2c8-59bc-ad70-29262b0f0560',NULL,'goal','goal.mariage',NULL,'Mariage','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('80cde8f0-4164-5bf2-88ca-98f4982daa34',NULL,'variable','variable.pieces_pneus',NULL,'Pièces / pneus','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.862','2026-10-28 09:03:32.862',1,NULL,NULL,'2026-10-28 09:03:32.862','2026-10-28 09:03:32.862','Transport','🛞','#334155',0,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('82170294-0ad9-5b51-8d61-9ffcbb1dcf53',NULL,'variable','variable.travaux_renovation',NULL,'Travaux / rénovation','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.989','2026-10-28 09:03:32.989',1,NULL,NULL,'2026-10-28 09:03:32.989','2026-10-28 09:03:32.989','Maison & équipement','🧱','#115E59',0,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('8342f600-6234-50d1-9d33-cd805da2aee7',NULL,'variable','variable.materiel_numerique',NULL,'Matériel numérique','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.893','2026-10-28 09:03:32.893',1,NULL,NULL,'2026-10-28 09:03:32.893','2026-10-28 09:03:32.893','Télécom & numérique','🖥️','#4338CA',0,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('854896f7-1242-5e64-b0f1-2da7a7670cc1',NULL,'asset','asset.vehicule',NULL,'Véhicule','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('86f42c04-3784-542a-9472-65df4507d459',NULL,'goal','goal.logement',NULL,'Logement','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('87939ff4-59f5-529b-9964-179097e615ac',NULL,'debt','debt.autre_dette',NULL,'Autre dette','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('8e21bf12-f74b-5dcd-b902-dbae7d0c9391',NULL,'shared','shared.internet',NULL,'Internet','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('8e9eade5-03e0-5fe2-8439-75ee6cb045e2',NULL,'variable','variable.location_vehicule',NULL,'Location véhicule','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.866','2026-10-28 09:03:32.866',1,NULL,NULL,'2026-10-28 09:03:32.866','2026-10-28 09:03:32.866','Transport','🚙','#2563A6',0,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('918065a4-38c2-53fa-bf1c-08bfdc901151',NULL,'income','income.allocation_aide',NULL,'Allocation / aide publique','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',2,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821','Social & pensions','🏛️','#475569',1,'Variable','[\"Tous\"]'),
('928309a9-0b58-533f-8678-c0dbf6dce7b6',NULL,'variable','variable.produits_menagers',NULL,'Produits ménagers','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.979','2026-10-28 09:03:32.979',1,NULL,NULL,'2026-10-28 09:03:32.979','2026-10-28 09:03:32.979','Maison & équipement','🧹','#0F766E',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('95899733-fcc9-57b0-8b47-386f29730bf9',NULL,'shared','shared.autre',NULL,'Autre','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('965fe038-3789-5523-b376-595558730679',NULL,'fixed','fixed.securite_gardiennage',NULL,'Sécurité / gardiennage','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.840','2026-10-28 09:03:32.840',1,NULL,NULL,'2026-10-28 09:03:32.840','2026-10-28 09:03:32.840','Logement','🔐','#334155',0,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('96f89ece-9181-5f6d-925a-907789acff10',NULL,'variable','variable.document_administratif',NULL,'Document administratif','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:33.049','2026-10-28 09:03:33.049',1,NULL,NULL,'2026-10-28 09:03:33.049','2026-10-28 09:03:33.049','Impôts & administration','📄','#71717A',0,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('9786a0f1-c571-5741-9eed-75498574eaac',NULL,'variable','variable.livres',NULL,'Livres','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.918','2026-10-28 09:03:32.918',1,NULL,NULL,'2026-10-28 09:03:32.918','2026-10-28 09:03:32.918','Éducation & formation','📚','#3B82F6',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('979b2ce5-8cef-593d-9952-3df2b444b827',NULL,'seasonal','seasonal.vacances',NULL,'Vacances','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,'2026-10-28 12:35:28.962',NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('97d85967-739f-5e00-b36e-c935d67b72e7',NULL,'asset','asset.actions_declarees',NULL,'Actions déclarées','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('993a351a-d5d9-5e41-a1fa-890055832624',NULL,'asset','asset.especes',NULL,'Espèces','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('9bd44a96-ada6-5cde-bff1-34a221c3a8e9',NULL,'variable','variable.materiel_professionnel',NULL,'Matériel professionnel','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:33.097','2026-10-28 09:03:33.097',1,NULL,NULL,'2026-10-28 09:03:33.097','2026-10-28 09:03:33.097','Dépenses professionnelles personnelles','🧰','#0C4A6E',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('9cf3d796-046f-5370-9ff3-afb9b93b0801',NULL,'variable','variable.dentaire',NULL,'Dentaire','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.900','2026-10-28 09:03:32.900',1,NULL,NULL,'2026-10-28 09:03:32.900','2026-10-28 09:03:32.900','Santé & bien-être','🦷','#E11D48',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('9d475061-3ad4-5bcf-b567-ccd9e3dc73bf',NULL,'income','income.coupon_obligation_sukuk',NULL,'Coupon obligation / sukuk','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.791','2026-10-28 09:03:32.791',1,NULL,NULL,'2026-10-28 09:03:32.791','2026-10-28 09:03:32.791','Patrimoine','📜','#4D7C0F',0,'Variable','[\"Tous\"]'),
('a0f8616f-e9ee-5fb7-a081-e61feaeaea80',NULL,'fixed','fixed.loyer',NULL,'Loyer','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',2,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821','Logement','🏠','#B45309',1,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('a198fbc0-818d-5f58-b782-1d1534d62afc',NULL,'income','income.remboursement_recu',NULL,'Remboursement reçu','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.800','2026-10-28 09:03:32.800',1,NULL,NULL,'2026-10-28 09:03:32.800','2026-10-28 09:03:32.800','Exceptionnel','↩️','#0891B2',0,'Ponctuel','[\"Tous\"]'),
('a3f83cd1-762a-50c3-988d-2a3fc3286f5f',NULL,'seasonal','seasonal.frais_d_etudes',NULL,'Frais d’études','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,'2026-10-28 12:35:28.962',NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('a415d1d7-45a1-5d74-b2e7-48ccb63d61b5',NULL,'variable','variable.electromenager',NULL,'Électroménager','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.983','2026-10-28 09:03:32.983',1,NULL,NULL,'2026-10-28 09:03:32.983','2026-10-28 09:03:32.983','Maison & équipement','🧺','#0D9488',0,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('a47a98ca-6886-5db3-b468-5468da9a1e56',NULL,'income','income.salaire_net',NULL,'Salaire net','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',2,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821','Salaire & emploi','💼','#2563A6',1,'Mensuel','[\"Jeune actif\", \"Salarié\"]'),
('a7aa1ddc-f379-5f91-ab31-c8e865bbcf69',NULL,'fixed','fixed.telephone',NULL,'Téléphone mobile','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',2,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821','Télécom & numérique','📱','#7C3AED',1,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('a8654f08-69fd-55a6-a693-c3bdcf9ecb69',NULL,'goal','goal.mobilite_stage',NULL,'Mobilité / stage','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('aafc5a61-1a56-597e-9095-105ce5c36d58',NULL,'fixed','fixed.scolarite_etudes',NULL,'Frais de scolarité / université','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',2,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821','Éducation & formation','🎓','#2563A6',1,'Annuel/Semestriel','[\"Tous ; ordre suggéré selon profil\"]'),
('abe93d0f-9adf-53cb-8542-3d25edcf6c20',NULL,'variable','variable.activites_voyage',NULL,'Activités voyage','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:33.017','2026-10-28 09:03:33.017',1,NULL,NULL,'2026-10-28 09:03:33.017','2026-10-28 09:03:33.017','Voyage & vacances','🗺️','#22D3EE',0,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('ac23aa53-66f5-5abf-ae3f-25aea6fd343a',NULL,'seasonal','seasonal.equipement',NULL,'Équipement','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,'2026-10-28 12:35:28.962',NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('ad3f4d4a-630f-5a9a-b2f3-78740cbfbfd3',NULL,'variable','variable.zakat_solidarite',NULL,'Zakat / solidarité','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:33.058','2026-10-28 09:03:33.058',1,NULL,NULL,'2026-10-28 09:03:33.058','2026-10-28 09:03:33.058','Dons & solidarité','🤲','#BE185D',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('adc17407-65dd-54f5-969d-758d828ee966',NULL,'goal','goal.epargne_investissement',NULL,'Épargne / investissement','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('ae523647-26b2-5391-a582-8789ed50785c',NULL,'income','income.honoraires_prestations',NULL,'Honoraires / prestations','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.781','2026-10-28 09:03:32.781',1,NULL,NULL,'2026-10-28 09:03:32.781','2026-10-28 09:03:32.781','Indépendant','🛠️','#14B8A6',1,'Variable','[\"Tous\"]'),
('ae926353-961d-5def-9bee-7aaab310570f',NULL,'asset','asset.immobilier',NULL,'Immobilier','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('afa90cff-94a7-5329-81e2-1f3abd7a260a',NULL,'variable','variable.autre_imprevu',NULL,'Autre imprévu','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:33.111','2026-10-28 09:03:33.111',1,NULL,NULL,'2026-10-28 09:03:33.111','2026-10-28 09:03:33.111','Imprévus','⚠️','#F59E0B',1,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('afc065d0-6654-5ca2-99af-7bf2811f3eae',NULL,'variable','variable.autre_depense_variable',NULL,'Autre dépense','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',2,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821','Autre','➕','#64748B',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('b001d0bd-63b9-5fb6-be78-f089647f8921',NULL,'fixed','fixed.logiciel_application',NULL,'Logiciel / application','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.890','2026-10-28 09:03:32.890',1,NULL,NULL,'2026-10-28 09:03:32.890','2026-10-28 09:03:32.890','Télécom & numérique','💻','#4F46E5',0,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('b32bea56-6e1b-5f32-88e5-56570bb0dfbe',NULL,'variable','variable.jeux_video',NULL,'Jeux vidéo','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.892','2026-10-28 09:03:32.892',1,NULL,NULL,'2026-10-28 09:03:32.892','2026-10-28 09:03:32.892','Télécom & numérique','🎮','#6366F1',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('b36b0df4-7c40-5571-aeab-821d60b0f6f4',NULL,'variable','variable.habillement',NULL,'Vêtements','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',2,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821','Vêtements & soins personnels','👕','#9333EA',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('b5af8550-f021-59cf-ba34-bec1034bd2bc',NULL,'variable','variable.argent_de_poche',NULL,'Argent de poche','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.966','2026-10-28 09:03:32.966',1,NULL,NULL,'2026-10-28 09:03:32.966','2026-10-28 09:03:32.966','Enfants & famille','🪙','#FDA4AF',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('b684cf8c-4eec-5fcb-821f-55457a9343e7',NULL,'variable','variable.urgence_medicale',NULL,'Urgence médicale','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:33.106','2026-10-28 09:03:33.106',1,NULL,NULL,'2026-10-28 09:03:33.106','2026-10-28 09:03:33.106','Imprévus','🚑','#DC2626',1,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('b6b8f17f-4daf-54e0-b21e-99c53ca98cae',NULL,'variable','variable.impot_taxe',NULL,'Impôt / taxe','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:33.047','2026-10-28 09:03:33.047',1,NULL,NULL,'2026-10-28 09:03:33.047','2026-10-28 09:03:33.047','Impôts & administration','🏛️','#52525B',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('b7045a2d-770d-53ae-8f2b-0103f00f02af',NULL,'fixed','fixed.assurance',NULL,'Assurance','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,'2026-10-28 12:35:28.962',NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('b7e4742c-c204-56a7-8598-bee4b2eb436b',NULL,'variable','variable.repas_professionnel',NULL,'Repas professionnel','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:33.095','2026-10-28 09:03:33.095',1,NULL,NULL,'2026-10-28 09:03:33.095','2026-10-28 09:03:33.095','Dépenses professionnelles personnelles','🍽️','#075985',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('bafe8adb-910d-5264-a001-9c9108cebde5',NULL,'shared','shared.eau',NULL,'Eau','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('bc04304c-9853-5dd4-9398-9967d9b85e90',NULL,'shared','shared.courses',NULL,'Courses','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('bdbdb210-ceb0-56eb-9570-8d9327dfc333',NULL,'variable','variable.etudes_fournitures',NULL,'Fournitures','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',2,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821','Éducation & formation','✏️','#60A5FA',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('be027e21-6f4e-55db-a8ea-8a64e4fbbb19',NULL,'variable','variable.frais_de_transfert',NULL,'Frais de transfert','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:33.027','2026-10-28 09:03:33.027',1,NULL,NULL,'2026-10-28 09:03:33.027','2026-10-28 09:03:33.027','Banque & finance','↔️','#64748B',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('c097a6f2-9498-545f-90f8-8ed229556a0d',NULL,'variable','variable.aide_urgente',NULL,'Aide urgente','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:33.109','2026-10-28 09:03:33.109',1,NULL,NULL,'2026-10-28 09:03:33.109','2026-10-28 09:03:33.109','Imprévus','🆘','#F97316',1,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('c280e826-1302-5d9e-8181-21b5c0b3f9a9',NULL,'variable','variable.coiffeur_esthetique',NULL,'Coiffeur / esthétique','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.975','2026-10-28 09:03:32.975',1,NULL,NULL,'2026-10-28 09:03:32.975','2026-10-28 09:03:32.975','Vêtements & soins personnels','💇','#A855F7',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('c3148d45-b770-5086-b81e-ab2c77067434',NULL,'variable','variable.boulangerie_proximite',NULL,'Boulangerie / proximité','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.843','2026-10-28 09:03:32.843',1,NULL,NULL,'2026-10-28 09:03:32.843','2026-10-28 09:03:32.843','Alimentation','🥖','#65A30D',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('c34b51bd-f8d9-54b3-acfa-603a280ad382',NULL,'variable','variable.don',NULL,'Don','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:33.056','2026-10-28 09:03:33.056',1,NULL,NULL,'2026-10-28 09:03:33.056','2026-10-28 09:03:33.056','Dons & solidarité','❤️','#E11D48',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('c5903594-cd43-5704-86e7-94dab376eaca',NULL,'variable','variable.reparation',NULL,'Réparation','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.836','2026-10-28 09:03:32.836',1,NULL,NULL,'2026-10-28 09:03:32.836','2026-10-28 09:03:32.836','Logement','🔧','#57534E',0,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('c66a196d-8475-57f2-b3e1-f4249b39452e',NULL,'variable','variable.petit_equipement',NULL,'Petit équipement','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.981','2026-10-28 09:03:32.981',1,NULL,NULL,'2026-10-28 09:03:32.981','2026-10-28 09:03:32.981','Maison & équipement','🔌','#14B8A6',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('c6a6d92e-d5a2-59e5-9b3a-75c6c99bc77e',NULL,'asset','asset.creance',NULL,'Créance','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('c9079dda-c0a2-508b-b72a-850247675fc2',NULL,'income','income.dividende_revenu_de_placement_declare',NULL,'Dividendes','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',2,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821','Patrimoine','📈','#16A34A',0,'Variable','[\"Tous\"]'),
('cc192d7f-8605-5a4f-b6b7-223a63b0a666',NULL,'variable','variable.bien_etre',NULL,'Bien-être','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.914','2026-10-28 09:03:32.914',1,NULL,NULL,'2026-10-28 09:03:32.914','2026-10-28 09:03:32.914','Santé & bien-être','🧘','#FDA4AF',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('cc4ee9bb-a69a-54c3-aa56-47b737216c01',NULL,'variable','variable.alimentation_animal',NULL,'Alimentation animal','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:33.087','2026-10-28 09:03:33.087',1,NULL,NULL,'2026-10-28 09:03:33.087','2026-10-28 09:03:33.087','Animaux','🐾','#92400E',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('ccaeffa6-0d49-59d5-8c02-f674d16fad0d',NULL,'variable','variable.sante_hygiene',NULL,'Santé / hygiène','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,'2026-10-28 12:35:28.962',NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('cdc54ee8-e814-56ac-8ac8-dda0d06d910e',NULL,'income','income.heures_supplementaires',NULL,'Heures supplémentaires','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.743','2026-10-28 09:03:32.743',1,NULL,NULL,'2026-10-28 09:03:32.743','2026-10-28 09:03:32.743','Salaire & emploi','⏱️','#60A5FA',0,'Variable','[\"Jeune actif\", \"Salarié\"]'),
('ce48b98e-a468-514b-b064-796ef8d5a9c7',NULL,'debt','debt.credit_consommation',NULL,'Crédit consommation','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('cfddd094-3f04-5336-bba4-716b8b347a8b',NULL,'income','income.autre_revenu',NULL,'Autre revenu','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',2,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821','Autre','➕','#64748B',0,'Variable','[\"Tous\"]'),
('d2107177-0393-5597-b5bd-5fff69401ecd',NULL,'goal','goal.projet_personnel',NULL,'Projet personnel','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('d4bae995-73fb-5d9b-bb30-41f698a13432',NULL,'seasonal','seasonal.assurance_annuelle',NULL,'Assurance annuelle','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,'2026-10-28 12:35:28.962',NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('d5df1d98-4e40-5e19-8591-cdf0b66466eb',NULL,'variable','variable.reparation_urgente',NULL,'Réparation urgente','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:33.108','2026-10-28 09:03:33.108',1,NULL,NULL,'2026-10-28 09:03:33.108','2026-10-28 09:03:33.108','Imprévus','🧯','#EA580C',1,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('d729a923-1676-5c61-b0ea-44a8021cb20d',NULL,'variable','variable.aide_familiale_versee',NULL,'Aide familiale versée','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.969','2026-10-28 09:03:32.969',1,NULL,NULL,'2026-10-28 09:03:32.969','2026-10-28 09:03:32.969','Enfants & famille','🤝','#C026D3',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('d82913b2-3052-5db0-9122-99f88a765f26',NULL,'variable','variable.cafe_snack',NULL,'Café / snack','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.847','2026-10-28 09:03:32.847',1,NULL,NULL,'2026-10-28 09:03:32.847','2026-10-28 09:03:32.847','Alimentation','☕','#D97706',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('d8505eed-2ae5-52d0-ac5e-7b18e64e645d',NULL,'goal','goal.enfant_etudes_enfant',NULL,'Enfant / études enfant','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('db6ae868-c1b5-53bf-a1fe-3dfaba60168c',NULL,'seasonal','seasonal.frais_carte',NULL,'Frais carte','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:33.025','2026-10-28 09:03:33.025',1,NULL,NULL,'2026-10-28 09:03:33.025','2026-10-28 09:03:33.025','Banque & finance','💳','#334155',1,'Annuel/Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('e01bc4eb-e1bc-5c62-b38f-c0eb2b559a97',NULL,'variable','variable.transport_public',NULL,'Transport public','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.853','2026-10-28 09:03:32.853',1,NULL,NULL,'2026-10-28 09:03:32.853','2026-10-28 09:03:32.853','Transport','🚌','#0284C7',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('e0277a77-7b36-5572-89f2-2f01a327df7c',NULL,'goal','goal.retraite',NULL,'Retraite','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('e12c5b6f-fbdf-5c19-b286-93adcf97466d',NULL,'variable','variable.alimentation_boissons',NULL,'Courses alimentaires','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',2,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821','Alimentation','🛒','#16A34A',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('e2617d8d-cb90-5688-be81-124628284099',NULL,'variable','variable.scolarite_enfant',NULL,'Scolarité enfant','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.958','2026-10-28 09:03:32.958',1,NULL,NULL,'2026-10-28 09:03:32.958','2026-10-28 09:03:32.958','Enfants & famille','🏫','#BE185D',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('e271c465-0f8f-56ea-95b0-232df8f434e9',NULL,'variable','variable.activites_enfant',NULL,'Activités enfant','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.964','2026-10-28 09:03:32.964',1,NULL,NULL,'2026-10-28 09:03:32.964','2026-10-28 09:03:32.964','Enfants & famille','⚽','#F472B6',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('e35437b4-a5ae-5dd9-8aaa-72991bc415ec',NULL,'seasonal','seasonal.mariage',NULL,'Mariage','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,'2026-10-28 12:35:28.962',NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('e6e78085-532d-5569-8e34-ac6eb3b92194',NULL,'variable','variable.dons_cadeaux',NULL,'Dons / cadeaux','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,'2026-10-28 12:35:28.962',NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('e7ad952a-e216-56d2-8eb5-6de2b6dd68a6',NULL,'shared','shared.menage',NULL,'Ménage','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('eb966e09-eff4-5c06-b416-dcba21878228',NULL,'income','income.freelance_mission',NULL,'Freelance / mission','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',2,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821','Indépendant','🧑‍💻','#0F766E',1,'Variable','[\"Étudiant\", \"Jeune actif\", \"Salarié\"]'),
('ebd999ab-e77b-5084-9230-e0eebc19d41a',NULL,'variable','variable.cours_soutien',NULL,'Cours / soutien','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.922','2026-10-28 09:03:32.922',1,NULL,NULL,'2026-10-28 09:03:32.922','2026-10-28 09:03:32.922','Éducation & formation','🧑‍🏫','#0EA5E9',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('f2c41dc3-7c24-52f2-8882-f514bb517c9a',NULL,'fixed','fixed.assurance_mutuelle_sante',NULL,'Assurance / mutuelle santé','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.908','2026-10-28 09:03:32.908',1,NULL,NULL,'2026-10-28 09:03:32.908','2026-10-28 09:03:32.908','Santé & bien-être','🛡️','#9F1239',1,'Mensuel/Annuel','[\"Tous ; ordre suggéré selon profil\"]'),
('f3dbd149-0d39-570c-b388-d40a5eb65d0f',NULL,'variable','variable.restaurant',NULL,'Restaurant','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.845','2026-10-28 09:03:32.845',1,NULL,NULL,'2026-10-28 09:03:32.845','2026-10-28 09:03:32.845','Alimentation','🍽️','#EA580C',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('f4141c9d-edb0-5515-9b8b-79e26eba4df8',NULL,'variable','variable.vetements_enfant',NULL,'Vêtements enfant','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.961','2026-10-28 09:03:32.961',1,NULL,NULL,'2026-10-28 09:03:32.961','2026-10-28 09:03:32.961','Enfants & famille','👕','#EC4899',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('f4531576-1478-58fe-b668-ff7ac8606023',NULL,'fixed','fixed.remboursement_pret_personnel',NULL,'Remboursement prêt personnel','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:33.032','2026-10-28 09:03:33.032',1,NULL,NULL,'2026-10-28 09:03:33.032','2026-10-28 09:03:33.032','Dettes & engagements','🤝','#C62828',1,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('f57e601d-af48-58e6-9471-1e51972c0252',NULL,'variable','variable.carburant',NULL,'Carburant','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.855','2026-10-28 09:03:32.855',1,NULL,NULL,'2026-10-28 09:03:32.855','2026-10-28 09:03:32.855','Transport','⛽','#0369A1',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('f5a1859d-dca8-5797-b372-c9544e582810',NULL,'variable','variable.cinema_spectacle',NULL,'Cinéma / spectacle','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.992','2026-10-28 09:03:32.992',1,NULL,NULL,'2026-10-28 09:03:32.992','2026-10-28 09:03:32.992','Loisirs & culture','🎭','#BE123C',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('f8c3ff67-9464-5c8c-9b7b-4a4719886d45',NULL,'variable','variable.livraison_repas',NULL,'Livraison repas','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.849','2026-10-28 09:03:32.849',1,NULL,NULL,'2026-10-28 09:03:32.849','2026-10-28 09:03:32.849','Alimentation','🛵','#F59E0B',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('f8cd113f-8f01-53a9-9b75-737115648e38',NULL,'variable','variable.certification_examen',NULL,'Certification / examen','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.926','2026-10-28 09:03:32.926',1,NULL,NULL,'2026-10-28 09:03:32.926','2026-10-28 09:03:32.926','Éducation & formation','📝','#0369A1',0,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('f8f35c1f-cd76-57aa-aec6-c34dee5010c4',NULL,'seasonal','seasonal.autre_depense_annuelle',NULL,'Autre dépense annuelle','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,'2026-10-28 12:35:28.962',NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('f912fe10-28e4-5579-9317-bc283b5f198f',NULL,'variable','variable.jeux_divertissement',NULL,'Jeux / divertissement','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.997','2026-10-28 09:03:32.997',1,NULL,NULL,'2026-10-28 09:03:32.997','2026-10-28 09:03:32.997','Loisirs & culture','🎲','#FB7185',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('faba33b4-5693-5c7e-9ba6-2886b93cf0f7',NULL,'income','income.cadeau_don_recu',NULL,'Cadeau / don reçu','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:32.797','2026-10-28 09:03:32.797',1,NULL,NULL,'2026-10-28 09:03:32.797','2026-10-28 09:03:32.797','Exceptionnel','🎁','#DB2777',0,'Ponctuel','[\"Tous\"]'),
('fada5eec-1344-517e-a4d3-82b523b95422',NULL,'goal','goal.voiture',NULL,'Voiture','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]'),
('fb238194-33e8-5309-a0ad-e47aea414d2e',NULL,'fixed','fixed.internet',NULL,'Internet','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',2,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821','Télécom & numérique','🌐','#6D28D9',1,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('fc4f14b6-de29-54aa-ba2a-6a2a95962272',NULL,'variable','variable.accessoires_animal',NULL,'Accessoires animal','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-28 09:03:33.092','2026-10-28 09:03:33.092',1,NULL,NULL,'2026-10-28 09:03:33.092','2026-10-28 09:03:33.092','Animaux','🦴','#D97706',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('fdb1b26b-7902-5733-95e4-f23e4c98c6dd',NULL,'income','income.stage_remunere',NULL,'Stage rémunéré','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',2,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821','Études & jeunesse','🧑‍🎓','#6D28D9',1,'Variable','[\"Étudiant\"]'),
('ffdb3270-f70f-5cf5-94dd-bd5114b96c42',NULL,'variable','variable.animaux',NULL,'Animaux','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,'2026-10-28 12:35:28.962',NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',NULL,NULL,NULL,0,NULL,'[]');
/*!40000 ALTER TABLE `fin_categories` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_changes`
--

DROP TABLE IF EXISTS `fin_changes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_changes` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `entity` varchar(40) NOT NULL,
  `entityId` varchar(191) NOT NULL,
  `action` varchar(20) NOT NULL,
  `field` varchar(40) DEFAULT NULL,
  `before` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`before`)),
  `after` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`after`)),
  `reason` varchar(200) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `fin_changes_entity_entityId_createdAt_idx` (`entity`,`entityId`,`createdAt`),
  KEY `fin_changes_userId_createdAt_idx` (`userId`,`createdAt`),
  CONSTRAINT `fin_changes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_changes_action_check` CHECK (`action` in ('create','correct','archive','restore','delete')),
  CONSTRAINT `fin_changes_entity_check` CHECK (trim(`entity`) <> '')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_changes`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_changes` WRITE;
/*!40000 ALTER TABLE `fin_changes` DISABLE KEYS */;
INSERT INTO `fin_changes` VALUES
('04102525-b517-4c09-b896-ddfc2470fa06','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','membership','a0d0dcce-227d-4aff-aee0-8a7ec57b6d7a','correct','sharing.goals','\"private\"','\"shared\"',NULL,'2026-10-17 08:24:00.196'),
('05c8c21c-d5f7-4765-a7f7-77d79a64b753','087b8449-6ea8-4478-9a2a-097b0a43fc72','sharedExpense','c355a320-7a36-4b87-8d27-d46dd024cf94','create',NULL,NULL,'{\"spaceId\":\"54b4f2b8-a2d7-4514-85e0-f1cc548b6ba6\",\"label\":\"Courses du mois\",\"value\":1800000,\"currency\":\"DZD\",\"splitMode\":\"equal\"}',NULL,'2026-11-03 10:22:02.921'),
('08dd51f2-948f-49c8-80a4-f568a2ac59b1','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','asset','b33a30da-5bb2-486b-9b56-a2d0a65ca907','create',NULL,NULL,'{\"label\":\"SLS\",\"kind\":\"vehicle\",\"value\":14000000,\"currency\":\"DZD\",\"valuedAt\":\"2025-10-17T00:00:00.000Z\"}',NULL,'2026-10-17 08:20:13.987'),
('099b5de1-f9e8-4b69-af2a-709c1445613a','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','dc8b64d4-5231-4a4a-b251-fb39a99addae','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":250000,\"currency\":\"DZD\",\"occurredAt\":\"2026-10-10T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:43.685'),
('0b5c85d2-40d3-4387-b5e0-b28ddf968bcf','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','8a4e9dff-3ee5-4996-b1c9-d2ed4393e69d','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":282800,\"currency\":\"DZD\",\"occurredAt\":\"2026-09-18T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:42.689'),
('0d4863d0-cca2-4da5-9f02-46bf422d1421','087b8449-6ea8-4478-9a2a-097b0a43fc72','goal','6fdeafed-4de2-45f1-b5c1-e3e1d96eb809','create',NULL,NULL,'{\"label\":\"Vacances d’été\",\"target\":6000000,\"currency\":\"DZD\",\"allocated\":0}',NULL,'2026-11-03 10:21:47.562'),
('0deb2730-aa8d-4473-8f32-4d339f3eab86','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transaction','c77e5ac2-02bf-4ac9-9e7a-fa56766954a2','correct','clearing','\"unchecked\"','\"checked\"',NULL,'2026-11-04 13:43:00.330'),
('0e85b013-c700-458d-a11a-d267ef80b25f','52982f43-bd76-479c-bbe3-d527decd2c63','membership','207a9a1f-f57c-414c-9d5d-c907b874ab01','create',NULL,NULL,'{\"spaceId\":\"85afecf3-0025-47a6-babb-17e941f50449\",\"role\":\"member\"}','invitation acceptée','2026-11-03 10:21:54.607'),
('10501db6-29ba-429c-90a7-cf8f4bfb2c33','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','debt','49a5720f-9077-4656-b2c3-94b995782eb5','create',NULL,NULL,'{\"label\":\"bna\",\"outstandingPrincipal\":10000000,\"currency\":\"DZD\"}',NULL,'2026-10-17 08:16:18.072'),
('10e4ac5c-a4a9-4a85-9eb5-141790f6f898','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','spaceGoal','08ab522c-8421-4102-8aa1-fb60fe969ea8','create',NULL,NULL,'{\"spaceId\":\"11997080-485f-4694-b760-568ac6592a5f\",\"label\":\"epargne\",\"target\":100000000}',NULL,'2026-10-17 08:24:51.352'),
('111d5a42-0e1b-482b-a2c8-b9b10aa3ec74','087b8449-6ea8-4478-9a2a-097b0a43fc72','debt','fd26f2e8-6d02-445a-8122-805967477f56','create',NULL,NULL,'{\"label\":\"Crédit voiture\",\"outstandingPrincipal\":42000000,\"currency\":\"DZD\"}',NULL,'2026-11-03 10:21:47.762'),
('11f854b4-4c67-4c8f-94ac-e5ffb56e48bd','9da929b7-d604-461b-ab52-84e2c5dcb02b','spaceGoalContribution','2cf55b02-d987-4627-98de-1f6c4d828232','create',NULL,NULL,'{\"spaceGoalId\":\"24d4b1b8-2724-432b-abc7-343701338de2\",\"memberId\":\"fb4f230c-4ec4-4ee6-a816-baeaf3ecf3dc\",\"amount\":3500000}',NULL,'2026-11-03 10:22:06.318'),
('13b2d869-97bf-4a73-aa48-73347fbd2b87','dd81c796-b6b8-49bd-a807-876c1c531d0b','asset','e708249d-e81b-4302-b0e8-947ec7e63b5b','create',NULL,NULL,'{\"label\":\"epargne\",\"kind\":\"account\",\"value\":15000000,\"currency\":\"DZD\",\"valuedAt\":\"2026-11-05T00:00:00.000Z\"}',NULL,'2026-11-05 09:41:57.489'),
('14810426-f8ef-4e48-b6f2-646b848712ca','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','e8761fe4-c480-4273-8421-f11d5fa19f06','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":909000,\"currency\":\"DZD\",\"occurredAt\":\"2026-08-06T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:39.241'),
('1482910e-37d8-42cd-88f2-0b7990bf0d54','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','ce12d72a-1b84-4462-b788-b54456e46e2d','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":2800000,\"currency\":\"DZD\",\"occurredAt\":\"2026-11-02T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:45.453'),
('15b3d731-32e2-49f7-b6bd-7b7ed417433d','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transfer','b053d3da-5ef4-421b-a439-4f8747e4eff4','create',NULL,NULL,'{\"from\":\"9c43294b-4b77-4bf9-87db-98bde28eee2d\",\"to\":\"6d90b22d-0ed9-4f3b-84dc-47a63b1a8a03\",\"value\":500000,\"currency\":\"DZD\"}',NULL,'2026-11-04 10:48:17.444'),
('167e993c-1c1c-449b-a6dc-7664c30a286c','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','4fe61396-7c16-474b-8896-f70ca24318f4','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":297500,\"currency\":\"DZD\",\"occurredAt\":\"2026-08-14T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:39.985'),
('1a2d9af3-65db-4afd-b46f-778b3b72a20c','087b8449-6ea8-4478-9a2a-097b0a43fc72','sharedExpense','a44cdfe5-8ddc-4129-8172-ff260fc62148','create',NULL,NULL,'{\"spaceId\":\"54b4f2b8-a2d7-4514-85e0-f1cc548b6ba6\",\"label\":\"Courses du mois\",\"value\":1800000,\"currency\":\"DZD\",\"splitMode\":\"equal\"}',NULL,'2026-11-03 10:22:04.810'),
('1cb453c8-23c9-4ac8-a0f2-e1cceb7ce546','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','envelope','88bfb0d0-8f63-40de-be28-b04538ab3bed','create',NULL,NULL,'{\"budgetId\":\"e34414c7-fb80-4d72-897b-d767ce4a2253\",\"categoryId\":null,\"kind\":\"fixed\",\"value\":200000}',NULL,'2026-11-04 10:28:36.638'),
('2243cc46-9d89-4961-9703-485083996b2c','dd81c796-b6b8-49bd-a807-876c1c531d0b','asset','d4c9879c-0188-45f3-804e-c3818c0f3265','create',NULL,NULL,'{\"label\":\"SLS\",\"kind\":\"vehicle\",\"value\":140000000,\"currency\":\"DZD\",\"valuedAt\":\"2026-11-05T00:00:00.000Z\"}',NULL,'2026-11-05 09:42:19.129'),
('23a37224-0c7c-4a29-b9c6-94e5869b7664','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','1a993274-500b-4b59-93e1-c682bcbf9366','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":150000,\"currency\":\"DZD\",\"occurredAt\":\"2026-08-10T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:39.005'),
('26e8bb64-598a-4fe0-afbe-302529a9aa9b','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transfer','42fa18ad-b149-4c24-9e77-ef30e3d4b749','create',NULL,NULL,'{\"from\":\"9c43294b-4b77-4bf9-87db-98bde28eee2d\",\"to\":\"46b02ea5-fab0-449e-9386-04500d1d613d\",\"value\":1000000,\"currency\":\"DZD\"}',NULL,'2026-11-04 13:36:12.522'),
('278371c6-43b7-4df7-83f1-7c12467245bf','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','fc217b1e-fc72-4db6-9855-30dfe8b65663','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":2800000,\"currency\":\"DZD\",\"occurredAt\":\"2026-10-02T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:43.191'),
('2c2ba424-757c-4ab5-939f-4c5fca494013','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','debtPayment','a80c0a13-6516-4e60-b6ed-76bf9490ca89','create',NULL,NULL,'{\"debtId\":\"b1ffe26d-af78-46fc-b9f4-623e230703cd\",\"amount\":300000}',NULL,'2026-11-05 08:13:24.999'),
('2ce289a3-7057-475f-a01f-dfa1791a9d1c','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','budget','e34414c7-fb80-4d72-897b-d767ce4a2253','create',NULL,NULL,'{\"label\":\"novembre\",\"periodStart\":\"2026-11-01T00:00:00.000Z\",\"periodEnd\":\"2026-11-30T22:59:59.000Z\",\"currency\":\"DZD\"}',NULL,'2026-11-04 10:27:12.392'),
('2d6aba0e-7e97-413c-a2d9-b0b9881c7720','dd81c796-b6b8-49bd-a807-876c1c531d0b','budget','e0f6f7f6-edd0-4388-aa12-929fac5ffaed','create',NULL,NULL,'{\"label\":\"aziz\",\"periodStart\":\"2026-10-01T00:00:00.000Z\",\"periodEnd\":\"2026-10-31T22:59:59.000Z\",\"currency\":\"DZD\"}',NULL,'2026-10-15 08:53:16.414'),
('2de76eaa-e202-4475-b302-26d48d60c67f','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','debt','743c5d1e-76b1-47cd-b650-5bd8905427f5','create',NULL,NULL,'{\"label\":\"bna\",\"outstandingPrincipal\":100000000,\"currency\":\"DZD\"}',NULL,'2026-11-04 14:12:14.107'),
('2ee53e57-5828-4e0e-a8eb-a690ed3f548d','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','9b483bc6-4848-42c3-9136-8d3029262fbb','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":2800000,\"currency\":\"DZD\",\"occurredAt\":\"2026-09-02T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:40.732'),
('32e2e79f-dc93-4097-b117-5a37d92d6590','08fb6c4e-5b4c-42a5-b499-2ea486544b98','sharedExpense','61ec13d1-dfd7-4f0c-9583-394461688f36','create',NULL,NULL,'{\"spaceId\":\"71a33179-68ea-4391-96ec-7da90a76d362\",\"label\":\"Essence\",\"value\":900000,\"currency\":\"DZD\",\"splitMode\":\"equal\"}',NULL,'2026-11-03 10:22:09.339'),
('3501d5d2-a757-447f-ae18-fcae13d9d1e1','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','recurrence','10bdcda8-cd8b-4df4-94d8-bd1139d2a8ef','create',NULL,NULL,'{\"label\":\"salaire\",\"value\":7000000,\"currency\":\"DZD\",\"frequency\":\"mensuel\",\"nextDate\":\"2026-11-04T00:00:00.000Z\"}',NULL,'2026-11-04 10:41:38.580'),
('36128bae-2638-4dc8-aa1b-6dfcdf9b13e4','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','spaceGoalContribution','1ded335d-b5b8-4465-afe9-da3ed8a0fa44','create',NULL,NULL,'{\"spaceGoalId\":\"08ab522c-8421-4102-8aa1-fb60fe969ea8\",\"memberId\":\"a0d0dcce-227d-4aff-aee0-8a7ec57b6d7a\",\"amount\":12000000}',NULL,'2026-10-17 08:24:58.619'),
('36217064-8e64-4830-8a7d-ca11f26eeb87','5daa4745-535e-4e92-824a-a705598eaead','transaction','782acb77-ae46-4212-b8d9-713bb665df76','create',NULL,NULL,'{\"kind\":\"income\",\"value\":300000,\"currency\":\"DZD\",\"occurredAt\":\"2026-08-01T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:48.679'),
('374cff57-ec06-40cc-b1b8-efc04b51d2d7','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','97eb5d94-b2f0-48c8-a942-a04a9f46c7ac','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":150000,\"currency\":\"DZD\",\"occurredAt\":\"2026-09-10T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:41.474'),
('38190b5e-cafc-4bfa-8264-e639c2679299','5daa4745-535e-4e92-824a-a705598eaead','transaction','3a61657b-fd8e-45cb-9e5a-9f8da9b913e5','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":90000,\"currency\":\"DZD\",\"occurredAt\":\"2026-10-19T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:51.843'),
('3974a778-364d-49a3-9c58-03b458509f21','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','account','ec4a7ae8-bd2b-4861-959a-498e5a98d14d','create',NULL,NULL,'{\"type\":\"AC-09\",\"label\":\"aziz 4\"}',NULL,'2026-11-04 10:45:27.239'),
('3a7cfcbd-1298-46fe-a124-b7b9f72b2882','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','1551eb77-a33e-49e1-8c34-fc3bbff4c6ff','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":204000,\"currency\":\"DZD\",\"occurredAt\":\"2026-08-04T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:39.733'),
('3b418939-a78f-4040-9fca-532e3b8284e8','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transaction','ec694b20-a9f4-40f0-8654-88c24c05f572','correct','clearing','\"unchecked\"','\"checked\"',NULL,'2026-11-04 14:24:43.198'),
('3b64d712-7fb8-4bde-8403-dc9a5b4f0512','087b8449-6ea8-4478-9a2a-097b0a43fc72','goal','d0e42f62-db20-4dfe-a94e-7196b4b9d34f','delete','deletedAt',NULL,'true',NULL,'2026-11-04 15:31:40.352'),
('3c33dd97-fdae-469c-8873-f5093a76d056','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','sharedExpense','ecf60b46-26ed-4143-9ab3-8432027cf2a3','create',NULL,NULL,'{\"spaceId\":\"11997080-485f-4694-b760-568ac6592a5f\",\"label\":\"loyer\",\"value\":1800000,\"currency\":\"DZD\",\"splitMode\":\"equal\"}',NULL,'2026-10-17 08:24:34.615'),
('3c4658c3-1871-41b8-9ffe-84d8c71a42b1','087b8449-6ea8-4478-9a2a-097b0a43fc72','sharedExpense','ebb299eb-f8f1-4df6-930c-b162e221c286','create',NULL,NULL,'{\"spaceId\":\"85afecf3-0025-47a6-babb-17e941f50449\",\"label\":\"Internet\",\"value\":300000,\"currency\":\"DZD\",\"splitMode\":\"equal\"}',NULL,'2026-11-03 10:21:58.199'),
('3da7fb0f-6205-415c-b7af-e2a91df5a992','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','goal','ad7a3b69-5801-4fc4-889d-e1306df6d4e6','create',NULL,NULL,'{\"label\":\"sls\",\"target\":100000000,\"currency\":\"DZD\",\"allocated\":0}',NULL,'2026-10-17 08:12:52.328'),
('3e652f83-0f61-4386-becc-f334ef59105a','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transfer','3ebf413d-aee5-4bca-8754-745623b2fbdf','create',NULL,NULL,'{\"from\":\"6d90b22d-0ed9-4f3b-84dc-47a63b1a8a03\",\"to\":\"32b7ad8b-8287-4ae1-9ae9-9a0d6208b5b0\",\"value\":1000000,\"currency\":\"DZD\"}',NULL,'2026-11-04 13:23:22.942'),
('3f41c5f6-ba7d-46ce-9085-b6e4677fb0b3','087b8449-6ea8-4478-9a2a-097b0a43fc72','envelope','dd7c23fd-0e1d-47e3-bb77-b3eeca32ae02','create',NULL,NULL,'{\"budgetId\":\"770f6a7d-f556-4b6c-ab9e-c0656cda29c5\",\"categoryId\":\"e01bc4eb-e1bc-5c62-b38f-c0eb2b559a97\",\"kind\":\"variable\",\"value\":300000}',NULL,'2026-11-03 10:21:46.702'),
('41bbf0a0-ae3f-4784-8309-fd0448368cb9','087b8449-6ea8-4478-9a2a-097b0a43fc72','sharedExpense','ffd000f5-69a7-4be6-a9ec-e1d896175fb4','create',NULL,NULL,'{\"spaceId\":\"54b4f2b8-a2d7-4514-85e0-f1cc548b6ba6\",\"label\":\"Sortie du week-end\",\"value\":500000,\"currency\":\"DZD\",\"splitMode\":\"equal\"}',NULL,'2026-11-03 10:22:03.403'),
('42c92e35-64d7-41e3-9341-126479ea25cb','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','space','11997080-485f-4694-b760-568ac6592a5f','correct','note',NULL,'\"je soussigne te vendre touts\"',NULL,'2026-10-17 08:24:15.470'),
('4324a782-96a8-46bf-bbef-0c224e61055b','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','membership','ed19ecad-f07a-48ba-8abe-2cc5742339b9','create',NULL,NULL,'{\"spaceId\":\"b467fabd-2be5-4deb-9ad7-d3cf76e09e3b\",\"role\":\"member\"}','invitation acceptée','2026-11-04 14:53:46.999'),
('43c9c2f3-3f12-4698-ad82-9bced3f5cb94','087b8449-6ea8-4478-9a2a-097b0a43fc72','budget','770f6a7d-f556-4b6c-ab9e-c0656cda29c5','create',NULL,NULL,'{\"label\":\"Ce mois-ci\",\"periodStart\":\"2026-11-01T00:00:00.000Z\",\"periodEnd\":\"2026-11-30T23:59:59.000Z\",\"currency\":\"DZD\"}',NULL,'2026-11-03 10:21:45.651'),
('4469597f-eaf0-4135-884c-2afeccb61e47','08fb6c4e-5b4c-42a5-b499-2ea486544b98','sharedExpense','2df5f429-1e1d-4a3e-95a4-5512bf34f1c0','create',NULL,NULL,'{\"spaceId\":\"71a33179-68ea-4391-96ec-7da90a76d362\",\"label\":\"Restaurant au port\",\"value\":750000,\"currency\":\"DZD\",\"splitMode\":\"equal\"}',NULL,'2026-11-03 10:22:09.923'),
('44da9dc6-8f48-4eb4-bc63-8e3586af536f','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','be74bb92-1e84-4bc5-bef5-bcfb118ed09c','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":994500,\"currency\":\"DZD\",\"occurredAt\":\"2026-09-20T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:41.963'),
('47062288-568f-44b6-825e-3340b3de5a50','08fb6c4e-5b4c-42a5-b499-2ea486544b98','space','71a33179-68ea-4391-96ec-7da90a76d362','create',NULL,NULL,'{\"kind\":\"group\",\"label\":\"Voyage à Béjaïa\",\"currency\":\"DZD\"}',NULL,'2026-11-03 10:22:06.701'),
('4707b3e9-176c-4db7-bded-0ad67c27d407','087b8449-6ea8-4478-9a2a-097b0a43fc72','sharedExpense','7462e558-93ee-49bb-b39c-2fa1c9df48d1','create',NULL,NULL,'{\"spaceId\":\"85afecf3-0025-47a6-babb-17e941f50449\",\"label\":\"Internet\",\"value\":300000,\"currency\":\"DZD\",\"splitMode\":\"equal\"}',NULL,'2026-11-03 10:21:59.952'),
('48c005df-e710-4456-bf35-362cdc52dffa','5daa4745-535e-4e92-824a-a705598eaead','transaction','40c0159f-363b-400d-af70-b50aa9fe8a75','create',NULL,NULL,'{\"kind\":\"income\",\"value\":300000,\"currency\":\"DZD\",\"occurredAt\":\"2026-09-01T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:49.826'),
('494f5fd6-6a13-4f08-8e6f-969286c218db','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','provision','a14a7738-aa74-4205-9580-2bf5d5086984','create',NULL,NULL,'{\"label\":\"Casnos\",\"value\":2400000,\"currency\":\"DZD\",\"targetDate\":\"2026-12-20T00:00:00.000Z\"}',NULL,'2026-11-05 07:51:31.398'),
('4a5ac48a-4909-4071-aa08-05cff9a4c947','5daa4745-535e-4e92-824a-a705598eaead','transaction','43da7024-d6be-4aff-ac52-261f271c343d','create',NULL,NULL,'{\"kind\":\"income\",\"value\":300000,\"currency\":\"DZD\",\"occurredAt\":\"2026-11-01T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:52.140'),
('4a5f3ed8-ccdc-469a-a23a-c53a8badcfdf','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','06012199-a74e-4c6a-87fc-bfc28689e9b8','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":765000,\"currency\":\"DZD\",\"occurredAt\":\"2026-09-06T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:41.717'),
('4b06ef12-c7b5-4b78-9f8b-71164b37ec5f','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','account','9c43294b-4b77-4bf9-87db-98bde28eee2d','create',NULL,NULL,'{\"type\":\"AC-04\",\"label\":\"aziz 3\"}',NULL,'2026-11-04 10:45:08.042'),
('4b17baec-be50-468b-b3bc-98adb112c6b2','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','bfeda4c5-3ded-4ed4-b71c-9d130b6b5f4b','delete','deletedAt',NULL,'true',NULL,'2026-11-04 15:48:33.146'),
('4bcfbd1f-ce09-4b6f-9d66-95ccade1e22d','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transaction','168e5339-38be-42e3-817d-58ea44488e09','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":1000000,\"currency\":\"DZD\",\"occurredAt\":\"2026-11-05T00:00:00.000Z\"}',NULL,'2026-11-05 07:58:10.145'),
('4c70f8d9-36b5-4625-b86c-7d97a1ec3e36','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','account','d624debb-3c83-4386-abbb-e334ebb8cbfa','create',NULL,NULL,'{\"type\":\"AC-03\",\"label\":\"aziz 2\"}',NULL,'2026-11-04 10:44:19.062'),
('4cf0a810-ac70-4598-96a2-badb0a251357','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','membership','a0d0dcce-227d-4aff-aee0-8a7ec57b6d7a','correct','sharing.incomes','\"private\"','\"shared\"',NULL,'2026-10-17 08:23:53.217'),
('4d79fcdd-7a3b-4ae3-88cc-1be68b7ed25e','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','ef4e1c03-c7b2-4be3-8187-2337c5f82b93','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":238000,\"currency\":\"DZD\",\"occurredAt\":\"2026-10-18T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:45.204'),
('4de4519c-bcae-4e21-84c7-3e90642dcd82','5daa4745-535e-4e92-824a-a705598eaead','transaction','ca7937dc-cb21-4542-bfeb-8cd5489f3d9c','create',NULL,NULL,'{\"kind\":\"income\",\"value\":300000,\"currency\":\"DZD\",\"occurredAt\":\"2026-10-01T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:50.990'),
('51de1fa7-7070-48c6-9f92-9a7bd390c49a','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','category','232ee03b-efc5-4a2b-9b56-43526542d85f','create',NULL,NULL,'{\"family\":\"variable\",\"label\":\"Tabac\",\"scope\":\"personal\",\"consentUses\":[]}',NULL,'2026-11-04 14:37:26.140'),
('52940685-5e50-4614-ae21-f924f06a0410','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transfer','69fd261c-486e-44a3-8d29-580363de6bbd','create',NULL,NULL,'{\"from\":\"32b7ad8b-8287-4ae1-9ae9-9a0d6208b5b0\",\"to\":\"6d90b22d-0ed9-4f3b-84dc-47a63b1a8a03\",\"value\":300000,\"currency\":\"DZD\"}',NULL,'2026-11-05 08:13:24.674'),
('529601d1-74f3-4cf0-aa73-4b46046652ae','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','spaceGoal','f93742b2-ecea-4d76-927a-ceec86b00be0','create',NULL,NULL,'{\"spaceId\":\"b467fabd-2be5-4deb-9ad7-d3cf76e09e3b\",\"label\":\"trouvez mieux\",\"target\":5000000}',NULL,'2026-11-04 14:51:37.271'),
('53d5a522-bc4d-43c5-8df3-a57d5a91c03c','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','goal','71c4f605-59b2-4f22-8836-17f9a117c7d2','create',NULL,NULL,'{\"label\":\"Fonds d’urgence\",\"target\":40000000,\"currency\":\"DZD\",\"allocated\":0}',NULL,'2026-11-04 13:32:49.937'),
('540f7add-9c47-4012-bd80-dfcdc0a14fdf','dd81c796-b6b8-49bd-a807-876c1c531d0b','space','1a1c902c-a3a7-4946-a83b-96df9bedcf17','create',NULL,NULL,'{\"kind\":\"flatshare\",\"label\":\"nous deux\",\"currency\":\"DZD\"}',NULL,'2026-11-03 14:33:55.540'),
('545b8a01-6481-4395-9e77-6bdb9b7617a4','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transaction','ec694b20-a9f4-40f0-8654-88c24c05f572','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":1000000,\"currency\":\"DZD\",\"occurredAt\":\"2026-11-04T00:00:00.000Z\"}',NULL,'2026-11-04 13:48:32.022'),
('548d093f-9b37-41a2-b1e5-eff9a8d8261f','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','envelope','311446a6-2fc0-4b35-a5c4-a0703ff6348a','create',NULL,NULL,'{\"budgetId\":\"e34414c7-fb80-4d72-897b-d767ce4a2253\",\"categoryId\":null,\"kind\":\"variable\",\"value\":800000}',NULL,'2026-11-04 10:34:12.514'),
('556bd06b-6175-4399-9c22-f841bb62a6b9','087b8449-6ea8-4478-9a2a-097b0a43fc72','asset','96a14ec9-6329-4a2a-bb62-da10922ca9e5','create',NULL,NULL,'{\"label\":\"Voiture\",\"kind\":\"vehicle\",\"value\":90000000,\"currency\":\"DZD\",\"valuedAt\":\"2026-09-01T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:48.204'),
('584a3138-5318-4562-8125-459e1d3ea5be','55ebe856-2adf-4aa6-9f70-43bf06ca29e0','membership','0a772d8c-5b3e-405f-a0aa-f1471dd7ecd1','correct','role','\"admin\"','\"owner\"',NULL,'2026-11-04 15:41:12.759'),
('5a6a3524-aca6-443c-8266-b4ae7b1d7758','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','tag','1607f534-fd76-4ad8-988e-f6c1ec5c9dc3','create',NULL,NULL,'{\"name\":\"salut\"}',NULL,'2026-11-04 13:43:31.839'),
('5b1fec90-839e-455f-82aa-b99a1d3e3e56','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transaction','b3252530-fcef-454b-ae60-dc8d78cd6f5f','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":1000000,\"currency\":\"DZD\",\"occurredAt\":\"2026-11-04T00:00:00.000Z\"}',NULL,'2026-11-04 13:55:00.753'),
('5c1e729d-3e17-4801-9a6b-5e3f741d63b7','5daa4745-535e-4e92-824a-a705598eaead','transaction','83c82d87-cb05-431b-bca8-d690eacd6340','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":70000,\"currency\":\"DZD\",\"occurredAt\":\"2026-08-12T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:49.259'),
('5c780358-03e8-45f9-ac5f-d067250dd47b','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','fbe83061-adc4-4939-a348-6c993661bbb5','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":150000,\"currency\":\"DZD\",\"occurredAt\":\"2026-10-10T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:43.932'),
('6265a8b9-313c-49e3-b129-fec3dbe97e17','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','debt','b1ffe26d-af78-46fc-b9f4-623e230703cd','correct','outstandingPrincipal','1000000','700000','paiement enregistré','2026-11-05 08:13:25.107'),
('627fca31-0411-4bb6-8914-d7e053833201','087b8449-6ea8-4478-9a2a-097b0a43fc72','sharedExpense','0197fe5c-8b02-4417-a286-a63aef07acb1','create',NULL,NULL,'{\"spaceId\":\"85afecf3-0025-47a6-babb-17e941f50449\",\"label\":\"Courses communes\",\"value\":1200000,\"currency\":\"DZD\",\"splitMode\":\"equal\"}',NULL,'2026-11-03 10:21:55.873'),
('62a03568-65ce-466c-807d-73f7007f34f6','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transaction','0ffaa2ac-af7f-4171-b8d4-070f59d72ccb','correct','clearing','\"unchecked\"','\"reconciled\"',NULL,'2026-11-05 07:55:20.795'),
('62bb3152-d2c5-4c48-b618-601d53a0195e','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transaction','2696bf58-2565-45e1-b639-cedfbfdbd992','correct','clearing','\"reconciled\"','\"checked\"',NULL,'2026-11-04 13:47:33.020'),
('638a897c-646b-436f-842f-f109c8ac0cc7','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','envelope','27696f7c-cc7f-4488-b5cb-263d89e3fd55','create',NULL,NULL,'{\"budgetId\":\"e34414c7-fb80-4d72-897b-d767ce4a2253\",\"categoryId\":null,\"kind\":\"variable\",\"value\":500000}',NULL,'2026-11-04 10:31:53.236'),
('649b3111-e242-439c-8dec-341e24dd2321','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','abf99259-a17d-4d05-8746-0c79c6466982','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":2800000,\"currency\":\"DZD\",\"occurredAt\":\"2026-08-02T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:38.267'),
('64d026db-c4e8-49ee-9741-c26180129130','9da929b7-d604-461b-ab52-84e2c5dcb02b','membership','fb4f230c-4ec4-4ee6-a816-baeaf3ecf3dc','create',NULL,NULL,'{\"spaceId\":\"54b4f2b8-a2d7-4514-85e0-f1cc548b6ba6\",\"role\":\"member\"}','invitation acceptée','2026-11-03 10:22:02.333'),
('658af53b-6eca-4388-a803-7289b84c5a1e','087b8449-6ea8-4478-9a2a-097b0a43fc72','spaceGoal','24d4b1b8-2724-432b-abc7-343701338de2','create',NULL,NULL,'{\"spaceId\":\"54b4f2b8-a2d7-4514-85e0-f1cc548b6ba6\",\"label\":\"Mariage\",\"target\":80000000}',NULL,'2026-11-03 10:22:05.689'),
('665b0bac-c6ca-4030-843c-bd7c4c703b0c','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','envelope','ce50ca25-f8fb-4e0b-97d8-9a0704882837','create',NULL,NULL,'{\"budgetId\":\"e34414c7-fb80-4d72-897b-d767ce4a2253\",\"categoryId\":null,\"kind\":\"fixed\",\"value\":3000000}',NULL,'2026-11-04 10:30:04.521'),
('6cdc6e50-3086-4796-933e-bdcf63eb68bf','5daa4745-535e-4e92-824a-a705598eaead','transaction','a17c96ef-dbbc-41de-a9c6-d57cd65b8d97','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":70000,\"currency\":\"DZD\",\"occurredAt\":\"2026-09-12T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:50.401'),
('6d585b5c-1da8-41d2-b7c9-922c195b692d','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','79c9f8ab-ecc8-42e5-ab12-0a7c1f7be115','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":320000,\"currency\":\"DZD\",\"occurredAt\":\"2026-09-08T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:40.986'),
('6dc7579c-72e7-4cab-9a56-ec7ee0bb002b','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','envelope','055cacf8-3e28-4689-a4e1-ea1ad17dd261','create',NULL,NULL,'{\"budgetId\":\"e34414c7-fb80-4d72-897b-d767ce4a2253\",\"categoryId\":null,\"kind\":\"variable\",\"value\":2000000}',NULL,'2026-11-04 10:30:37.993'),
('6f0374f6-97f3-4daa-8180-de10a58bccf0','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','spaceInflow','b4a560ba-1076-44f3-ae0e-8d3d63939250','create',NULL,NULL,'{\"spaceId\":\"b467fabd-2be5-4deb-9ad7-d3cf76e09e3b\",\"kind\":\"contribution\",\"value\":6000000,\"status\":\"confirmed\"}',NULL,'2026-11-04 14:45:37.511'),
('705a23ba-1d93-499c-b8c4-302a5babea0f','087b8449-6ea8-4478-9a2a-097b0a43fc72','envelope','6a3e600a-3f92-4d86-aab4-a1d333aceaa0','create',NULL,NULL,'{\"budgetId\":\"770f6a7d-f556-4b6c-ab9e-c0656cda29c5\",\"categoryId\":\"0b9357f3-bf24-54a5-ae8c-d03c93588924\",\"kind\":\"variable\",\"value\":300000}',NULL,'2026-11-03 10:21:47.127'),
('70d00ada-3263-403d-a0e7-4ef2977d402f','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','sharedExpense','170cfee8-56b0-4abe-8e8c-3b353142b577','create',NULL,NULL,'{\"spaceId\":\"b467fabd-2be5-4deb-9ad7-d3cf76e09e3b\",\"label\":\"loyer\",\"value\":3000000,\"currency\":\"DZD\",\"splitMode\":\"equal\"}',NULL,'2026-11-04 14:43:22.375'),
('72b3437c-f955-4da3-bab1-6b09bf0db38d','087b8449-6ea8-4478-9a2a-097b0a43fc72','spaceBudget','f1ad67c0-e2c1-41ea-ac6c-0c2a29568621','create',NULL,NULL,'1500000',NULL,'2026-11-03 10:22:00.444'),
('7376264f-2a70-4ebc-906a-d37f4d3d55f6','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','bfeda4c5-3ded-4ed4-b71c-9d130b6b5f4b','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":150000,\"currency\":\"DZD\",\"occurredAt\":\"2026-11-03T12:00:00.000Z\"}',NULL,'2026-11-04 15:47:25.046'),
('746fe9b0-09be-401c-b6d5-f6b9da87199a','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','space','b467fabd-2be5-4deb-9ad7-d3cf76e09e3b','create',NULL,NULL,'{\"kind\":\"flatshare\",\"label\":\"nous deux\",\"currency\":\"DZD\"}',NULL,'2026-11-04 14:41:03.035'),
('77d8168b-04d2-4882-b93a-33efc6b098f3','087b8449-6ea8-4478-9a2a-097b0a43fc72','sharedExpense','d455877b-a8ed-45bd-941a-551c941177d3','create',NULL,NULL,'{\"spaceId\":\"54b4f2b8-a2d7-4514-85e0-f1cc548b6ba6\",\"label\":\"Sortie du week-end\",\"value\":500000,\"currency\":\"DZD\",\"splitMode\":\"equal\"}',NULL,'2026-11-03 10:22:04.353'),
('77e975e2-aa9d-4adc-8f91-8a56ba4a2ceb','087b8449-6ea8-4478-9a2a-097b0a43fc72','sharedExpense','88ddcc76-3a32-47dc-8964-b6ce8c02fa32','create',NULL,NULL,'{\"spaceId\":\"85afecf3-0025-47a6-babb-17e941f50449\",\"label\":\"Loyer de l’appartement\",\"value\":6600000,\"currency\":\"DZD\",\"splitMode\":\"equal\"}',NULL,'2026-11-03 10:21:58.780'),
('7871acc5-deba-4dab-b0c0-3c1ee12d7988','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','membership','0394ee7a-df49-4c23-b7e0-8f082d11e0d1','correct','sharing.assets','\"private\"','\"shared\"',NULL,'2026-11-04 14:53:09.343'),
('78d15cba-dbac-4999-bb3d-ffc3ff5bbee5','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transaction','5cb01fd3-976b-4b84-8136-35f2b7807287','correct','clearing','\"unchecked\"','\"checked\"',NULL,'2026-11-04 13:43:08.868'),
('7ba9d536-b996-489b-a765-8b9eeb3848bc','087b8449-6ea8-4478-9a2a-097b0a43fc72','sharedExpense','4b8da904-b15c-4d4a-871e-407f8988cfc9','create',NULL,NULL,'{\"spaceId\":\"54b4f2b8-a2d7-4514-85e0-f1cc548b6ba6\",\"label\":\"Sortie du week-end\",\"value\":500000,\"currency\":\"DZD\",\"splitMode\":\"equal\"}',NULL,'2026-11-03 10:22:05.283'),
('7d559b75-dd13-4425-9cae-baa2bad6aa94','087b8449-6ea8-4478-9a2a-097b0a43fc72','space','54b4f2b8-a2d7-4514-85e0-f1cc548b6ba6','create',NULL,NULL,'{\"kind\":\"couple\",\"label\":\"Yasmine et Sami\",\"currency\":\"DZD\"}',NULL,'2026-11-03 10:22:01.684'),
('808a9a49-95cc-459f-9667-56c0856149d9','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','spaceGoal','f93742b2-ecea-4d76-927a-ceec86b00be0','correct','calendar',NULL,'1',NULL,'2026-11-04 14:52:10.781'),
('8161a773-490f-4496-96a7-f49612ad80a1','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transfer','14841b98-5061-4651-a9c5-7e6650363e00','create',NULL,NULL,'{\"from\":\"9c43294b-4b77-4bf9-87db-98bde28eee2d\",\"to\":\"46b02ea5-fab0-449e-9386-04500d1d613d\",\"value\":9000000,\"currency\":\"DZD\"}',NULL,'2026-11-04 13:36:27.703'),
('81671167-4e35-485f-af97-5d19fde69085','5daa4745-535e-4e92-824a-a705598eaead','goal','765ddcaf-d3da-4772-8646-d013d8d96b51','create',NULL,NULL,'{\"label\":\"Casque audio\",\"target\":800000,\"currency\":\"DZD\",\"allocated\":0}',NULL,'2026-11-03 10:21:52.335'),
('832fb53e-f8b8-4bfe-98c4-324e6b28131c','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','5e2d5fc3-67c4-44b2-b31f-1ff7b833a9e6','create',NULL,NULL,'{\"kind\":\"income\",\"value\":8500000,\"currency\":\"DZD\",\"occurredAt\":\"2026-08-25T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:38.012'),
('83417973-5ece-4460-ad0f-22732129497b','087b8449-6ea8-4478-9a2a-097b0a43fc72','membership','9cc9b1e7-d226-48ce-8364-3020a2f91ac8','correct','role','\"member\"','\"owner\"',NULL,'2026-11-04 15:41:11.085'),
('874a8eef-e2b5-42aa-a59c-5ecfe90f47ba','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','5bf0b1a0-b84e-47d7-8a7a-b12acbcffecd','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":381500,\"currency\":\"DZD\",\"occurredAt\":\"2026-09-14T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:42.443'),
('87aa4c64-3555-4bee-ae9b-216259a30106','087b8449-6ea8-4478-9a2a-097b0a43fc72','recurrence','317045cf-f8c5-4c3a-b4db-968e908d1190','create',NULL,NULL,'{\"label\":\"Salaire\",\"value\":8500000,\"currency\":\"DZD\",\"frequency\":\"mensuel\",\"nextDate\":\"2026-12-25T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:37.739'),
('898a0d81-12a5-4a96-ae77-92aed28bcf66','dd81c796-b6b8-49bd-a807-876c1c531d0b','membership','11b22b66-3397-45b5-a10e-3d3c148dd9fc','create',NULL,NULL,'{\"spaceId\":\"11997080-485f-4694-b760-568ac6592a5f\",\"role\":\"member\"}','invitation acceptée','2026-10-17 08:25:36.800'),
('8b9c3c4e-fa59-4ea7-b5de-805dd124fbac','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','7edb68ac-cf65-43a9-9806-eade5c80be5e','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":250000,\"currency\":\"DZD\",\"occurredAt\":\"2026-09-10T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:41.228'),
('8c000390-ef03-4a66-9b66-f8128017e097','5daa4745-535e-4e92-824a-a705598eaead','transaction','fa08e724-cc18-4a02-8d13-4355f58f5440','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":60000,\"currency\":\"DZD\",\"occurredAt\":\"2026-10-05T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:51.281'),
('8c0a6886-004f-46a3-95e3-7c8c7543e30f','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','spaceInflow','7f48730d-bad9-448a-a9dd-b3b1b70130ac','create',NULL,NULL,'{\"spaceId\":\"b467fabd-2be5-4deb-9ad7-d3cf76e09e3b\",\"kind\":\"other\",\"value\":1000000,\"status\":\"planned\"}',NULL,'2026-11-04 14:46:42.526'),
('8d05a27f-1d89-49bb-85de-f96af24c2fb9','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','goal','84dc8484-61f9-4284-868b-592b6c36b566','create',NULL,NULL,'{\"label\":\"Mariage\",\"target\":500000000,\"currency\":\"DZD\",\"allocated\":0}',NULL,'2026-11-04 13:07:36.102'),
('8def6936-18fa-4c1e-9d9d-4addcb056f2a','087b8449-6ea8-4478-9a2a-097b0a43fc72','goal','45944814-236c-489d-b9a1-89c63a0a79e8','create',NULL,NULL,'{\"label\":\"Fonds d’urgence\",\"target\":15000000,\"currency\":\"DZD\",\"allocated\":0}',NULL,'2026-11-03 10:21:47.336'),
('9143f08d-e2a9-4db5-9976-64d82dfc08c8','08fb6c4e-5b4c-42a5-b499-2ea486544b98','sharedExpense','393b712e-1bc8-431c-b84c-04e43480225e','create',NULL,NULL,'{\"spaceId\":\"71a33179-68ea-4391-96ec-7da90a76d362\",\"label\":\"Location de la maison\",\"value\":4500000,\"currency\":\"DZD\",\"splitMode\":\"equal\"}',NULL,'2026-11-03 10:22:08.757'),
('922ea8b0-dc23-4917-99c7-9be2d949bd83','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','b825e494-be38-40f1-869e-6055b9745208','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":327600,\"currency\":\"DZD\",\"occurredAt\":\"2026-08-18T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:40.239'),
('9336c789-c28d-4fa0-bb05-cf3aa0fe5f5e','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transaction','2f9f61c3-5bda-4f93-8f33-9a678cc7f6e1','correct','clearing','\"unchecked\"','\"checked\"',NULL,'2026-11-05 07:59:27.173'),
('93d68649-86c2-48ab-aa3e-0be0e84d6646','087b8449-6ea8-4478-9a2a-097b0a43fc72','sharedExpense','6328495a-2f38-4385-974c-013964d1ab25','create',NULL,NULL,'{\"spaceId\":\"85afecf3-0025-47a6-babb-17e941f50449\",\"label\":\"Courses communes\",\"value\":1200000,\"currency\":\"DZD\",\"splitMode\":\"equal\"}',NULL,'2026-11-03 10:21:57.618'),
('93dba87d-e269-464f-ba16-eb0af0370016','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','6de457e8-3a93-4773-9e05-3cc5b639cc83','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":223200,\"currency\":\"DZD\",\"occurredAt\":\"2026-10-04T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:44.695'),
('96d95b58-a395-4aca-87fe-545463dc1786','5daa4745-535e-4e92-824a-a705598eaead','transaction','a63abe85-b97b-4952-90a1-24bf6961184a','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":70000,\"currency\":\"DZD\",\"occurredAt\":\"2026-10-12T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:51.553'),
('9a253509-b399-4d79-acd0-6a3794d710b9','087b8449-6ea8-4478-9a2a-097b0a43fc72','envelope','ecb59b71-59d1-41fd-95ff-d7da089ab4f0','create',NULL,NULL,'{\"budgetId\":\"770f6a7d-f556-4b6c-ab9e-c0656cda29c5\",\"categoryId\":\"f3dbd149-0d39-570c-b388-d40a5eb65d0f\",\"kind\":\"variable\",\"value\":300000}',NULL,'2026-11-03 10:21:46.924'),
('9a6cbd2b-4e41-407a-9ddf-0bc456576a28','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','bd023e8c-669a-4932-b2e8-ac86910b03e0','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":250000,\"currency\":\"DZD\",\"occurredAt\":\"2026-08-10T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:38.757'),
('9ab8cc6a-f65e-400d-9695-01bc1f0563fe','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','recurrence','10bdcda8-cd8b-4df4-94d8-bd1139d2a8ef','correct','occurrence',NULL,'{\"dueDate\":\"2026-11-04\",\"action\":\"confirm\"}',NULL,'2026-11-04 13:05:51.614'),
('9b0b0b8e-8c75-4cf4-b7c2-3be41b8e3912','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','account','c3dbcd55-2aec-471c-b56c-f08a7e5c69ec','create',NULL,NULL,'{\"type\":\"AC-02\",\"label\":\"secret epargne\"}',NULL,'2026-11-04 14:16:14.363'),
('9c017f1b-4894-430d-bfba-7704c4a76e77','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transaction','2696bf58-2565-45e1-b639-cedfbfdbd992','correct','clearing','\"unchecked\"','\"reconciled\"',NULL,'2026-11-04 13:42:53.029'),
('9c109f08-264f-4954-a055-69835ef70cd6','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','1474eed1-eadc-43f6-8f8d-67d6a5fb8466','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":858500,\"currency\":\"DZD\",\"occurredAt\":\"2026-10-20T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:44.457'),
('9eff4d6f-b4a9-4271-96db-c76cc37cf259','087b8449-6ea8-4478-9a2a-097b0a43fc72','membership','0cd130cb-462f-4e4c-acb4-d08578ec5059','create',NULL,NULL,'{\"spaceId\":\"71a33179-68ea-4391-96ec-7da90a76d362\",\"role\":\"member\"}','invitation acceptée','2026-11-03 10:22:07.323'),
('9f3f00b2-b6ec-4f4c-9ebd-eeb69f0b08ee','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','budget','eb1a8c58-c6dc-4494-81ee-ca690e3a2b50','create',NULL,NULL,'{\"label\":\"aziz\",\"periodStart\":\"2026-04-15T00:00:00.000Z\",\"periodEnd\":\"2026-10-31T22:59:59.000Z\",\"currency\":\"DZD\"}',NULL,'2026-10-17 08:10:15.603'),
('a0e1ed1a-b5e5-41a2-8242-4dec0c0df294','087b8449-6ea8-4478-9a2a-097b0a43fc72','sharedExpense','6bcd5449-13ea-46b3-b777-a8c2926e5f82','create',NULL,NULL,'{\"spaceId\":\"85afecf3-0025-47a6-babb-17e941f50449\",\"label\":\"Loyer de l’appartement\",\"value\":6600000,\"currency\":\"DZD\",\"splitMode\":\"equal\"}',NULL,'2026-11-03 10:21:57.025'),
('a1397c62-1598-4b8b-81d2-fb0e4848368b','087b8449-6ea8-4478-9a2a-097b0a43fc72','spaceTask','8143760a-43fc-4017-a564-6ec5452c0b19','create',NULL,NULL,'{\"spaceId\":\"85afecf3-0025-47a6-babb-17e941f50449\",\"title\":\"Ménage des parties communes\",\"assigneeId\":\"0a772d8c-5b3e-405f-a0aa-f1471dd7ecd1\"}',NULL,'2026-11-03 10:22:00.714'),
('a288fde3-3471-46a9-abfc-410cd7e690b5','5daa4745-535e-4e92-824a-a705598eaead','transaction','3aa3656f-f037-48d6-ac39-a466e626ba22','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":60000,\"currency\":\"DZD\",\"occurredAt\":\"2026-08-05T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:48.967'),
('a2f2d864-1545-4c68-ae92-97cd0175d657','087b8449-6ea8-4478-9a2a-097b0a43fc72','envelope','69a2946a-fb55-4c6b-811b-86449d58f3a9','create',NULL,NULL,'{\"budgetId\":\"770f6a7d-f556-4b6c-ab9e-c0656cda29c5\",\"categoryId\":\"4ba17c79-10b2-56d1-ae91-a9cad1745397\",\"kind\":\"fixed\",\"value\":350000}',NULL,'2026-11-03 10:21:46.091'),
('a31b77cf-7fc6-4d55-98eb-cc131130a82a','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transaction','b3252530-fcef-454b-ae60-dc8d78cd6f5f','correct','clearing','\"unchecked\"','\"checked\"',NULL,'2026-11-04 13:55:06.239'),
('a3ad339a-3c1e-4e5b-9ff9-3d638f97531d','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','577b7495-687e-447f-9ac4-a63eb2afda62','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":261600,\"currency\":\"DZD\",\"occurredAt\":\"2026-09-04T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:42.202'),
('a59ebc76-9573-44bd-b6b9-f4a8deba073d','087b8449-6ea8-4478-9a2a-097b0a43fc72','envelope','d6dfebd6-e51b-4663-8872-8c48a2b0e018','create',NULL,NULL,'{\"budgetId\":\"770f6a7d-f556-4b6c-ab9e-c0656cda29c5\",\"categoryId\":\"fb238194-33e8-5309-a0ad-e47aea414d2e\",\"kind\":\"fixed\",\"value\":250000}',NULL,'2026-11-03 10:21:46.291'),
('a6ae7c68-4e9e-4eb0-819b-a5d42cd41a6b','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transaction','2d1bc25f-e555-4795-a2c5-b20c520fb60e','correct','clearing','\"unchecked\"','\"checked\"',NULL,'2026-11-05 07:49:38.081'),
('a6dcbd3e-5660-4535-acef-f7ed48b41e5b','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','spaceTask','aa2f8475-0957-427d-ac05-47aeada205d8','create',NULL,NULL,'{\"spaceId\":\"b467fabd-2be5-4deb-9ad7-d3cf76e09e3b\",\"title\":\"peinture\",\"assigneeId\":\"0394ee7a-df49-4c23-b7e0-8f082d11e0d1\"}',NULL,'2026-11-04 14:50:44.729'),
('aa8a544f-99f8-4802-a8da-223462e57a56','087b8449-6ea8-4478-9a2a-097b0a43fc72','membership','0a772d8c-5b3e-405f-a0aa-f1471dd7ecd1','correct','role','\"owner\"','\"admin\"',NULL,'2026-11-04 15:41:10.994'),
('aab46115-d273-4f14-9965-733528126482','087b8449-6ea8-4478-9a2a-097b0a43fc72','spaceGoalContribution','6fc79011-e39d-4ba4-81a1-15ec8030932f','create',NULL,NULL,'{\"spaceGoalId\":\"24d4b1b8-2724-432b-abc7-343701338de2\",\"memberId\":\"81390fab-d75b-458b-bcd0-72694d15a6dd\",\"amount\":4000000}',NULL,'2026-11-03 10:22:06.015'),
('ad5361da-34bc-441b-ba15-a2f1f2693bcc','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','fff3fa50-fc4d-4bd5-ae09-91f1908459cf','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":325500,\"currency\":\"DZD\",\"occurredAt\":\"2026-10-14T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:44.941'),
('b010990a-a69d-4934-a367-c3aec7b76466','087b8449-6ea8-4478-9a2a-097b0a43fc72','debt','0b40fe96-78af-41bd-9247-fd5308b5f7d1','create',NULL,NULL,'{\"label\":\"Téléphone en plusieurs fois\",\"outstandingPrincipal\":3600000,\"currency\":\"DZD\"}',NULL,'2026-11-03 10:21:47.958'),
('b06afedd-e55d-4a33-a32e-ca7626c2dec0','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','f489beb9-c919-4a54-b154-40a727509e50','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":790500,\"currency\":\"DZD\",\"occurredAt\":\"2026-08-20T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:39.483'),
('b1010c4d-0ec8-444d-b0c0-d660a828c85e','087b8449-6ea8-4478-9a2a-097b0a43fc72','envelope','bbeb5b3c-a576-4e2c-a920-7629cecc5ed9','create',NULL,NULL,'{\"budgetId\":\"770f6a7d-f556-4b6c-ab9e-c0656cda29c5\",\"categoryId\":\"a0f8616f-e9ee-5fb7-a081-e61feaeaea80\",\"kind\":\"fixed\",\"value\":2800000}',NULL,'2026-11-03 10:21:45.877'),
('b1fa424b-69aa-4291-ae9f-63d48efd8dc1','55ebe856-2adf-4aa6-9f70-43bf06ca29e0','membership','9cc9b1e7-d226-48ce-8364-3020a2f91ac8','correct','role','\"owner\"','\"admin\"',NULL,'2026-11-04 15:41:12.667'),
('b26441a1-3d14-4b12-a4de-bae567f3a425','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','72381ce7-90de-43f0-965a-b8a2e035cc9f','create',NULL,NULL,'{\"kind\":\"income\",\"value\":8500000,\"currency\":\"DZD\",\"occurredAt\":\"2026-09-25T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:40.485'),
('b37af13a-aca0-4af2-99de-5f0e0c431b25','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','spaceGoalContribution','13b1b59f-d4d2-4c55-acd5-c4c4b5b5f11c','create',NULL,NULL,'{\"spaceGoalId\":\"f93742b2-ecea-4d76-927a-ceec86b00be0\",\"memberId\":\"0394ee7a-df49-4c23-b7e0-8f082d11e0d1\",\"amount\":2000000}',NULL,'2026-11-04 14:51:44.499'),
('b411e6e3-9e08-429b-8045-502d35df4f62','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','a1842b6e-ba61-4212-bc27-9fc7f80ffb0f','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":320000,\"currency\":\"DZD\",\"occurredAt\":\"2026-10-08T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:43.439'),
('b47ec453-9bb0-492e-a4ac-f0b9bac54282','087b8449-6ea8-4478-9a2a-097b0a43fc72','space','85afecf3-0025-47a6-babb-17e941f50449','create',NULL,NULL,'{\"kind\":\"flatshare\",\"label\":\"Colocation rue Didouche\",\"currency\":\"DZD\"}',NULL,'2026-11-03 10:21:53.194'),
('b54660eb-7441-4cd1-b4a2-04f2daaffe8a','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','membership','0394ee7a-df49-4c23-b7e0-8f082d11e0d1','correct','sharing.incomes','\"private\"','\"shared\"',NULL,'2026-11-04 14:53:04.783'),
('b92add89-808d-4725-8e36-f48c55213ea2','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','envelope','a69ecc7d-ebf6-49a4-9314-80e2613e7705','create',NULL,NULL,'{\"budgetId\":\"e34414c7-fb80-4d72-897b-d767ce4a2253\",\"categoryId\":null,\"kind\":\"variable\",\"value\":1000000}',NULL,'2026-11-04 10:31:31.819'),
('ba9a05dc-c976-49fc-babb-1794b30d81a1','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transaction','2d1bc25f-e555-4795-a2c5-b20c520fb60e','correct','categoryId',NULL,'\"afc065d0-6654-5ca2-99af-7bf2811f3eae\"',NULL,'2026-11-05 07:49:33.778'),
('bbca17f6-5042-40c8-a8f5-b7c2350af465','087b8449-6ea8-4478-9a2a-097b0a43fc72','income','880f4dec-ca72-4857-ab7b-94a993f597c1','create',NULL,NULL,'{\"label\":\"Salaire\",\"value\":8500000,\"currency\":\"DZD\",\"frequency\":\"mensuel\"}',NULL,'2026-11-03 10:21:37.498'),
('bbda2503-e007-4d40-9902-33e6c81dabbf','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','account','6d90b22d-0ed9-4f3b-84dc-47a63b1a8a03','create',NULL,NULL,'{\"type\":\"AC-01\",\"label\":\"aziz\"}',NULL,'2026-11-04 10:43:53.438'),
('be8578a9-3e50-4376-9245-21e5a1a7cccd','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','76c3678c-0e72-4e19-82dc-b03f29dfea50','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":320000,\"currency\":\"DZD\",\"occurredAt\":\"2026-08-08T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:38.509'),
('c4376d94-2843-469d-823c-3e9403262c70','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','8374e8d7-8348-4226-837a-92eeea8b8749','create',NULL,NULL,'{\"kind\":\"income\",\"value\":8500000,\"currency\":\"DZD\",\"occurredAt\":\"2026-10-25T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:42.932'),
('c4a33413-b141-436d-aec2-0a32b87cbc07','dd81c796-b6b8-49bd-a807-876c1c531d0b','asset','237cadc5-5c29-4efc-9152-bbc1b7a0ee24','create',NULL,NULL,'{\"label\":\"commerce\",\"kind\":\"investment\",\"value\":50000000,\"currency\":\"DZD\",\"valuedAt\":\"2026-11-05T00:00:00.000Z\"}',NULL,'2026-11-05 09:42:47.240'),
('c5874505-e723-4841-a8df-d47c5ae0f861','087b8449-6ea8-4478-9a2a-097b0a43fc72','sharedExpense','9b01f564-bc82-4e71-acb7-a211515763b0','create',NULL,NULL,'{\"spaceId\":\"85afecf3-0025-47a6-babb-17e941f50449\",\"label\":\"Internet\",\"value\":300000,\"currency\":\"DZD\",\"splitMode\":\"equal\"}',NULL,'2026-11-03 10:21:56.458'),
('c7068be3-e142-47c0-ae62-13bfb7f8f355','087b8449-6ea8-4478-9a2a-097b0a43fc72','sharedExpense','421ce769-67f9-4f34-a2b6-c28ad5420baa','create',NULL,NULL,'{\"spaceId\":\"85afecf3-0025-47a6-babb-17e941f50449\",\"label\":\"Courses communes\",\"value\":1200000,\"currency\":\"DZD\",\"splitMode\":\"equal\"}',NULL,'2026-11-03 10:21:59.366'),
('cad9374d-c738-4d13-a35f-22360c396d23','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transaction','2f9f61c3-5bda-4f93-8f33-9a678cc7f6e1','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":2000000,\"currency\":\"DZD\",\"occurredAt\":\"2026-11-05T00:00:00.000Z\"}',NULL,'2026-11-05 07:59:21.365'),
('ccb30df0-d5f2-48b9-8beb-ef57742f1898','087b8449-6ea8-4478-9a2a-097b0a43fc72','account','50beca3c-3b32-4019-a38e-014733bd20e3','create',NULL,NULL,'{\"type\":\"AC-02\",\"label\":\"Compte courant CCP\"}',NULL,'2026-11-03 10:21:37.257'),
('ce7dc49b-ef99-45e5-9cb4-e836482acd06','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','goal','84dc8484-61f9-4284-868b-592b6c36b566','correct','monthlyContribution',NULL,'3000000',NULL,'2026-11-04 13:19:38.595'),
('d0deb713-8da7-4c10-8961-785f582aaeee','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transaction','0ffaa2ac-af7f-4171-b8d4-070f59d72ccb','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":40000,\"currency\":\"DZD\",\"occurredAt\":\"2026-11-05T00:00:00.000Z\"}',NULL,'2026-11-05 07:55:15.574'),
('d2560651-3af3-4ac8-9f70-267a6e4f40a4','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','envelope','2a36f342-6d14-4af7-b0ae-683fbb50f534','create',NULL,NULL,'{\"budgetId\":\"e34414c7-fb80-4d72-897b-d767ce4a2253\",\"categoryId\":null,\"kind\":\"variable\",\"value\":1000000}',NULL,'2026-11-04 10:32:53.149'),
('d51223e5-eade-4610-8def-5952abb5936e','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','recurrence','c9939f7d-102c-45f3-b829-3d3d128c558d','correct','occurrence',NULL,'{\"dueDate\":\"2026-11-04\",\"action\":\"confirm\"}',NULL,'2026-11-05 07:36:48.964'),
('d52d236d-1a7c-47dc-a46c-41fff95ba022','5daa4745-535e-4e92-824a-a705598eaead','transaction','4c420d72-728f-412f-ad5d-f45c935478eb','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":90000,\"currency\":\"DZD\",\"occurredAt\":\"2026-09-19T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:50.696'),
('d56dd3f1-e5e0-4ec5-8baf-2e34d6941a46','087b8449-6ea8-4478-9a2a-097b0a43fc72','envelope','bdfaa141-58af-420c-8faf-f7d648592acf','create',NULL,NULL,'{\"budgetId\":\"770f6a7d-f556-4b6c-ab9e-c0656cda29c5\",\"categoryId\":\"e12c5b6f-fbdf-5c19-b286-93adcf97466d\",\"kind\":\"variable\",\"value\":1800000}',NULL,'2026-11-03 10:21:46.500'),
('d73e0676-8336-49b7-a5ec-6fd6221421ca','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','space','11997080-485f-4694-b760-568ac6592a5f','create',NULL,NULL,'{\"kind\":\"flatshare\",\"label\":\"nous deux\",\"currency\":\"DZD\"}',NULL,'2026-10-17 08:23:45.117'),
('d768c5f0-95f9-4b37-8000-480bb87e1334','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','asset','f5598308-e360-4e83-92cd-0b1a33864029','create',NULL,NULL,'{\"label\":\"maison\",\"kind\":\"property\",\"value\":150000000,\"currency\":\"DZD\",\"valuedAt\":\"2020-10-17T00:00:00.000Z\"}',NULL,'2026-10-17 08:19:42.058'),
('d86139fe-c721-44ab-a07a-7ccd78cb7d35','5daa4745-535e-4e92-824a-a705598eaead','transaction','67c917eb-87ff-494a-bc1a-e2624099929d','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":60000,\"currency\":\"DZD\",\"occurredAt\":\"2026-09-05T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:50.112'),
('d8ad40d7-3ee7-438b-ab66-a11199b97a3b','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','space','b467fabd-2be5-4deb-9ad7-d3cf76e09e3b','correct','note',NULL,'\"on fait 50 50 comme des fréres !\"',NULL,'2026-11-04 14:41:39.308'),
('d963c8e6-5c2f-4d83-a80e-ce55f77afa8a','087b8449-6ea8-4478-9a2a-097b0a43fc72','goal','d0e42f62-db20-4dfe-a94e-7196b4b9d34f','create',NULL,NULL,'{\"label\":\"Essai sans date R107\",\"target\":2147483647,\"currency\":\"DZD\",\"allocated\":0}',NULL,'2026-11-04 15:30:11.322'),
('ddc4103c-c0e7-42f4-85a2-9f61bc4a6033','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transaction','168e5339-38be-42e3-817d-58ea44488e09','correct','clearing','\"unchecked\"','\"checked\"',NULL,'2026-11-05 07:58:16.942'),
('de4b47ce-94a0-46c1-be80-7ad672181d8d','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transaction','3ab54467-f697-4c76-b1f6-1eda828c13a0','correct','clearing','\"unchecked\"','\"checked\"',NULL,'2026-11-04 13:43:11.028'),
('defd6275-2726-4aa8-b6dc-70a478831a2a','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','income','ed860091-95d8-4321-bfa0-078d7469cfa1','create',NULL,NULL,'{\"label\":\"salaire\",\"value\":7000000,\"currency\":\"DZD\",\"frequency\":\"mensuel\"}',NULL,'2026-11-04 10:41:38.383'),
('e42aa083-b3e9-4e4c-b611-0a554dfade98','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','membership','0394ee7a-df49-4c23-b7e0-8f082d11e0d1','correct','sharing.transactions','\"private\"','\"shared\"',NULL,'2026-11-04 14:53:07.455'),
('e7587c8b-14a4-4488-9a67-f45629bd9aab','5daa4745-535e-4e92-824a-a705598eaead','transaction','9805858b-3c20-4cc8-a506-837e8e8b6a30','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":90000,\"currency\":\"DZD\",\"occurredAt\":\"2026-08-19T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:49.547'),
('e7fd025e-e727-46c4-95df-6ae09c3774f1','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','8f65b282-aba4-4e57-9081-e940b665f025','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":981000,\"currency\":\"DZD\",\"occurredAt\":\"2026-10-06T12:00:00.000Z\"}',NULL,'2026-11-03 10:21:44.207'),
('e87eb212-846d-404b-a749-db569d1f92ec','087b8449-6ea8-4478-9a2a-097b0a43fc72','spaceTask','cd026232-c511-4c0b-bcfa-0c1abae745ee','create',NULL,NULL,'{\"spaceId\":\"85afecf3-0025-47a6-babb-17e941f50449\",\"title\":\"Sortir les poubelles\",\"assigneeId\":\"9cc9b1e7-d226-48ce-8364-3020a2f91ac8\"}',NULL,'2026-11-03 10:22:01.004'),
('ea805d88-d77c-4759-abc0-e42ef8242cf6','087b8449-6ea8-4478-9a2a-097b0a43fc72','transaction','87e281fa-2c56-4c86-9d1a-0fef0564aa39','create',NULL,NULL,'{\"kind\":\"expense\",\"value\":987654321,\"currency\":\"DZD\",\"occurredAt\":\"2026-11-03T12:00:00.000Z\"}',NULL,'2026-11-04 15:47:56.328'),
('eb27dd9d-594a-41ee-b1c2-f30c06fc01df','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','debt','ee8ea20b-3f4f-49c5-9214-dbaf9d5d3b10','create',NULL,NULL,'{\"label\":\"bea\",\"outstandingPrincipal\":1000000,\"currency\":\"DZD\"}',NULL,'2026-10-17 08:16:45.970'),
('ebc28de3-2475-48ec-bd57-4eff45de8aa4','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transaction','b1e8cd91-6137-4b40-aaaa-7b8f82201917','correct','clearing','\"unchecked\"','\"checked\"',NULL,'2026-11-04 13:43:06.878'),
('ec998ae8-4f8c-40c5-9b15-13dcd8b35fee','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','membership','a0d0dcce-227d-4aff-aee0-8a7ec57b6d7a','correct','sharing.transactions','\"private\"','\"shared\"',NULL,'2026-10-17 08:23:57.088'),
('ec9c2c9b-25b5-4ab6-8f24-f494335bd0f1','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','spaceBudget','8846e981-5ec0-4a1a-a5a7-d3ca286ad8ab','create',NULL,NULL,'2000000',NULL,'2026-11-04 14:45:21.078'),
('ec9de740-70dd-42ff-83fa-5a5cac157e7e','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','membership','0394ee7a-df49-4c23-b7e0-8f082d11e0d1','correct','sharing.goals','\"private\"','\"shared\"',NULL,'2026-11-04 14:53:10.941'),
('f0456649-3750-40ba-89e7-c65468baaf2c','55ebe856-2adf-4aa6-9f70-43bf06ca29e0','membership','9cc9b1e7-d226-48ce-8364-3020a2f91ac8','create',NULL,NULL,'{\"spaceId\":\"85afecf3-0025-47a6-babb-17e941f50449\",\"role\":\"member\"}','invitation acceptée','2026-11-03 10:21:53.845'),
('f37ff810-607e-41d1-b2a7-c0186892a471','087b8449-6ea8-4478-9a2a-097b0a43fc72','sharedExpense','02323548-054d-4797-960c-19f348852d1b','create',NULL,NULL,'{\"spaceId\":\"54b4f2b8-a2d7-4514-85e0-f1cc548b6ba6\",\"label\":\"Courses du mois\",\"value\":1800000,\"currency\":\"DZD\",\"splitMode\":\"equal\"}',NULL,'2026-11-03 10:22:03.871'),
('f39f7cac-c521-4182-9453-c2855f3ea039','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','category','232ee03b-efc5-4a2b-9b56-43526542d85f','correct','essential','false','true',NULL,'2026-11-04 14:37:29.326'),
('f423fc62-6d9e-4ee0-b165-8c3c4a554d0a','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','envelope','1cc4d231-3726-4ca7-8691-7fae92140b18','create',NULL,NULL,'{\"budgetId\":\"e34414c7-fb80-4d72-897b-d767ce4a2253\",\"categoryId\":null,\"kind\":\"variable\",\"value\":1000000}',NULL,'2026-11-04 10:31:19.726'),
('f546ef51-3ff2-4c09-a1c1-0d9cd7508cf9','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','debt','b1ffe26d-af78-46fc-b9f4-623e230703cd','create',NULL,NULL,'{\"label\":\"Prêt à Un ami\",\"outstandingPrincipal\":1000000,\"currency\":\"DZD\"}',NULL,'2026-11-04 13:23:23.145'),
('f6711a27-ffcd-40e8-92db-c5451e210c74','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','recurrence','c9939f7d-102c-45f3-b829-3d3d128c558d','create',NULL,NULL,'{\"label\":\"abonnement claude\",\"value\":1200000,\"currency\":\"DZD\",\"frequency\":\"mensuel\",\"nextDate\":\"2026-11-04T00:00:00.000Z\"}',NULL,'2026-11-04 13:52:48.547'),
('f6ccb626-6d77-4a7c-989b-11201df8a5ac','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','membership','a0d0dcce-227d-4aff-aee0-8a7ec57b6d7a','correct','sharing.assets','\"private\"','\"shared\"',NULL,'2026-10-17 08:23:58.628'),
('f6f1a54d-f311-4b3c-8d61-32ef638a444d','087b8449-6ea8-4478-9a2a-097b0a43fc72','sharedExpense','8d4a665a-7706-4be7-bc58-871bef18a416','create',NULL,NULL,'{\"spaceId\":\"85afecf3-0025-47a6-babb-17e941f50449\",\"label\":\"Loyer de l’appartement\",\"value\":6600000,\"currency\":\"DZD\",\"splitMode\":\"equal\"}',NULL,'2026-11-03 10:21:55.295'),
('f842f3ed-3a37-4290-9070-4e2bd46b4ea5','6fc2c284-bff5-4b8a-893a-da24525ac358','membership','d3ba34f0-c23a-451a-b3df-788926435db4','create',NULL,NULL,'{\"spaceId\":\"71a33179-68ea-4391-96ec-7da90a76d362\",\"role\":\"member\"}','invitation acceptée','2026-11-03 10:22:08.065'),
('fd458feb-2e2b-4438-987e-0b053eb15ba2','087b8449-6ea8-4478-9a2a-097b0a43fc72','spaceTask','98a2c82e-9c46-4309-88fc-3aa8a6141d8d','create',NULL,NULL,'{\"spaceId\":\"85afecf3-0025-47a6-babb-17e941f50449\",\"title\":\"Faire les courses\",\"assigneeId\":\"207a9a1f-f57c-414c-9d5d-c907b874ab01\"}',NULL,'2026-11-03 10:22:01.282');
/*!40000 ALTER TABLE `fin_changes` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_children`
--

DROP TABLE IF EXISTS `fin_children`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_children` (
  `id` varchar(191) NOT NULL,
  `spaceId` varchar(191) NOT NULL,
  `firstName` varchar(60) NOT NULL,
  `birthYear` int(11) NOT NULL,
  `note` varchar(300) DEFAULT NULL,
  `archivedAt` datetime(3) DEFAULT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fin_children_spaceId_deletedAt_idx` (`spaceId`,`deletedAt`),
  CONSTRAINT `fin_children_spaceId_fkey` FOREIGN KEY (`spaceId`) REFERENCES `fin_spaces` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_children_first_name_check` CHECK (trim(`firstName`) <> ''),
  CONSTRAINT `fin_children_birth_year_check` CHECK (`birthYear` between 1900 and 2100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_children`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_children` WRITE;
/*!40000 ALTER TABLE `fin_children` DISABLE KEYS */;
/*!40000 ALTER TABLE `fin_children` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_consents`
--

DROP TABLE IF EXISTS `fin_consents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_consents` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `textKey` varchar(40) NOT NULL,
  `version` varchar(20) NOT NULL,
  `acceptedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `fin_consents_userId_textKey_idx` (`userId`,`textKey`),
  CONSTRAINT `fin_consents_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_consents_text_key_check` CHECK (`textKey` in ('finPrivacy','finNoAdvice'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_consents`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_consents` WRITE;
/*!40000 ALTER TABLE `fin_consents` DISABLE KEYS */;
INSERT INTO `fin_consents` VALUES
('15ff4e86-bd69-43de-9bd1-1b2b5d22f53e','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','finNoAdvice','1','2026-10-17 08:01:24.673'),
('3844f82d-f6a5-4238-a40b-b21ccacf9bc1','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','finPrivacy','1','2026-11-04 10:39:07.583'),
('442e5760-817c-479a-a0a8-f0e5121814ce','dd81c796-b6b8-49bd-a807-876c1c531d0b','finPrivacy','1','2026-10-17 09:27:03.919'),
('65166da4-c7af-4194-9f9e-fbf31b9bc54d','dd81c796-b6b8-49bd-a807-876c1c531d0b','finNoAdvice','1','2026-10-17 09:27:03.919'),
('a7d1fb49-bbc2-42c5-8b49-9e392234ee71','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','finNoAdvice','1','2026-11-04 10:39:07.583'),
('d6f98798-1462-4984-88d8-c799808d8c35','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','finPrivacy','1','2026-10-17 08:01:24.673');
/*!40000 ALTER TABLE `fin_consents` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_debt_payments`
--

DROP TABLE IF EXISTS `fin_debt_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_debt_payments` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `debtId` varchar(191) NOT NULL,
  `amount` double NOT NULL,
  `currency` varchar(3) NOT NULL,
  `paidAt` datetime(3) NOT NULL,
  `note` varchar(300) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `deletedAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fin_debt_payments_debtId_idx` (`debtId`),
  KEY `fin_debt_payments_userId_deletedAt_idx` (`userId`,`deletedAt`),
  CONSTRAINT `fin_debt_payments_debtId_fkey` FOREIGN KEY (`debtId`) REFERENCES `fin_debts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_debt_payments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_debt_payments_currency_check` CHECK (`currency` regexp '^[A-Z]{3}$'),
  CONSTRAINT `fin_debt_payments_amount_check` CHECK (`amount` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_debt_payments`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_debt_payments` WRITE;
/*!40000 ALTER TABLE `fin_debt_payments` DISABLE KEYS */;
INSERT INTO `fin_debt_payments` VALUES
('a80c0a13-6516-4e60-b6ed-76bf9490ca89','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','b1ffe26d-af78-46fc-b9f4-623e230703cd',300000,'DZD','2026-11-05 08:13:24.473',NULL,'2026-11-05 08:13:24.812',NULL);
/*!40000 ALTER TABLE `fin_debt_payments` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_debts`
--

DROP TABLE IF EXISTS `fin_debts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_debts` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `label` varchar(80) NOT NULL,
  `lender` varchar(120) DEFAULT NULL,
  `purpose` varchar(200) DEFAULT NULL,
  `assetFinanced` varchar(120) DEFAULT NULL,
  `outstandingPrincipal` double NOT NULL,
  `monthlyInstalment` double NOT NULL,
  `currency` varchar(3) NOT NULL,
  `rate` double DEFAULT NULL,
  `knownTotalCost` double DEFAULT NULL,
  `dueDate` datetime(3) DEFAULT NULL,
  `note` varchar(300) DEFAULT NULL,
  `scope` varchar(20) NOT NULL DEFAULT 'personal',
  `source` varchar(20) NOT NULL,
  `sourceRef` varchar(200) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `confidence` varchar(10) DEFAULT NULL,
  `consentUses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`consentUses`)),
  `effectiveAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `collectedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `version` int(11) NOT NULL DEFAULT 1,
  `archivedAt` datetime(3) DEFAULT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `accountId` varchar(191) DEFAULT NULL,
  `debtType` varchar(4) DEFAULT NULL,
  `direction` varchar(5) NOT NULL DEFAULT 'owed',
  `budgetEnvelopeId` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fin_debts_userId_deletedAt_idx` (`userId`,`deletedAt`),
  KEY `fin_debts_accountId_fkey` (`accountId`),
  CONSTRAINT `fin_debts_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `fin_accounts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fin_debts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_debts_scope_check` CHECK (`scope` in ('personal','couple','household','space')),
  CONSTRAINT `fin_debts_source_check` CHECK (`source` in ('manual','imported','document','partner','computed')),
  CONSTRAINT `fin_debts_status_check` CHECK (`status` in ('real','declared','imported','computed','fictional','official','to_confirm')),
  CONSTRAINT `fin_debts_confidence_check` CHECK (`confidence` is null or `confidence` in ('high','medium','low')),
  CONSTRAINT `fin_debts_currency_check` CHECK (`currency` regexp '^[A-Z]{3}$'),
  CONSTRAINT `fin_debts_version_check` CHECK (`version` >= 1),
  CONSTRAINT `fin_debts_label_check` CHECK (trim(`label`) <> ''),
  CONSTRAINT `fin_debts_outstanding_check` CHECK (`outstandingPrincipal` >= 0),
  CONSTRAINT `fin_debts_instalment_check` CHECK (`monthlyInstalment` >= 0),
  CONSTRAINT `fin_debts_known_cost_check` CHECK (`knownTotalCost` is null or `knownTotalCost` >= 0),
  CONSTRAINT `fin_debts_rate_check` CHECK (`rate` is null or `rate` >= 0 and `rate` <= 1),
  CONSTRAINT `fin_debts_consent_uses_check` CHECK (json_type(`consentUses`) = 'ARRAY'),
  CONSTRAINT `fin_debts_direction_check` CHECK (`direction` in ('owed','lent')),
  CONSTRAINT `fin_debts_type_check` CHECK (`debtType` is null or `debtType` in ('D-01','D-02','D-03','D-04','D-05'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_debts`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_debts` WRITE;
/*!40000 ALTER TABLE `fin_debts` DISABLE KEYS */;
INSERT INTO `fin_debts` VALUES
('0b40fe96-78af-41bd-9247-fd5308b5f7d1','087b8449-6ea8-4478-9a2a-097b0a43fc72','Téléphone en plusieurs fois','Magasin',NULL,NULL,3600000,400000,'DZD',0,NULL,NULL,NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-03 10:21:47.915','2026-11-03 10:21:47.915',1,NULL,NULL,'2026-11-03 10:21:47.915','2026-11-03 10:21:47.915',NULL,NULL,'owed',NULL),
('49a5720f-9077-4656-b2c3-94b995782eb5','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','bna','bna',NULL,NULL,10000000,100000,'DZD',0.05,NULL,'2030-10-10 00:00:00.000',NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-10-17 08:16:18.025','2026-10-17 08:16:18.025',1,NULL,NULL,'2026-10-17 08:16:18.025','2026-10-17 08:16:18.025',NULL,NULL,'owed',NULL),
('743c5d1e-76b1-47cd-b650-5bd8905427f5','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','bna','bna',NULL,NULL,100000000,500000,'DZD',0.015,NULL,'2028-02-01 00:00:00.000',NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-04 14:12:14.064','2026-11-04 14:12:14.064',1,NULL,NULL,'2026-11-04 14:12:14.064','2026-11-04 14:12:14.064',NULL,NULL,'owed',NULL),
('b1ffe26d-af78-46fc-b9f4-623e230703cd','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','Prêt à Un ami',NULL,NULL,NULL,700000,0,'DZD',NULL,NULL,NULL,NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-04 13:23:23.092','2026-11-04 13:23:23.092',2,NULL,NULL,'2026-11-04 13:23:23.092','2026-11-05 08:13:24.906','32b7ad8b-8287-4ae1-9ae9-9a0d6208b5b0','D-01','lent',NULL),
('ee8ea20b-3f4f-49c5-9214-dbaf9d5d3b10','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','bea','bea',NULL,NULL,1000000,15000,'DZD',0.08,NULL,'2029-11-08 00:00:00.000',NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-10-17 08:16:45.921','2026-10-17 08:16:45.921',1,NULL,NULL,'2026-10-17 08:16:45.921','2026-10-17 08:16:45.921',NULL,NULL,'owed',NULL),
('fd26f2e8-6d02-445a-8122-805967477f56','087b8449-6ea8-4478-9a2a-097b0a43fc72','Crédit voiture','Banque',NULL,NULL,42000000,1200000,'DZD',0.065,NULL,NULL,NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-03 10:21:47.709','2026-11-03 10:21:47.709',1,NULL,NULL,'2026-11-03 10:21:47.709','2026-11-03 10:21:47.709',NULL,NULL,'owed',NULL);
/*!40000 ALTER TABLE `fin_debts` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_envelopes`
--

DROP TABLE IF EXISTS `fin_envelopes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_envelopes` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `budgetId` varchar(191) NOT NULL,
  `categoryId` varchar(191) DEFAULT NULL,
  `kind` varchar(10) NOT NULL,
  `value` double NOT NULL,
  `currency` varchar(3) NOT NULL,
  `cap` double DEFAULT NULL,
  `recurring` tinyint(1) NOT NULL DEFAULT 1,
  `note` varchar(300) DEFAULT NULL,
  `scope` varchar(20) NOT NULL DEFAULT 'personal',
  `source` varchar(20) NOT NULL,
  `sourceRef` varchar(200) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `confidence` varchar(10) DEFAULT NULL,
  `consentUses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`consentUses`)),
  `effectiveAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `collectedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `version` int(11) NOT NULL DEFAULT 1,
  `archivedAt` datetime(3) DEFAULT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `categoryGroup` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fin_envelopes_budgetId_idx` (`budgetId`),
  KEY `fin_envelopes_userId_deletedAt_idx` (`userId`,`deletedAt`),
  KEY `fin_envelopes_categoryId_idx` (`categoryId`),
  CONSTRAINT `fin_envelopes_budgetId_fkey` FOREIGN KEY (`budgetId`) REFERENCES `fin_budgets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_envelopes_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `fin_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fin_envelopes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_envelopes_scope_check` CHECK (`scope` in ('personal','couple','household','space')),
  CONSTRAINT `fin_envelopes_source_check` CHECK (`source` in ('manual','imported','document','partner','computed')),
  CONSTRAINT `fin_envelopes_status_check` CHECK (`status` in ('real','declared','imported','computed','fictional','official','to_confirm')),
  CONSTRAINT `fin_envelopes_confidence_check` CHECK (`confidence` is null or `confidence` in ('high','medium','low')),
  CONSTRAINT `fin_envelopes_currency_check` CHECK (`currency` regexp '^[A-Z]{3}$'),
  CONSTRAINT `fin_envelopes_kind_check` CHECK (`kind` in ('fixed','variable')),
  CONSTRAINT `fin_envelopes_version_check` CHECK (`version` >= 1),
  CONSTRAINT `fin_envelopes_value_check` CHECK (`value` >= 0),
  CONSTRAINT `fin_envelopes_cap_check` CHECK (`cap` is null or `cap` >= `value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_envelopes`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_envelopes` WRITE;
/*!40000 ALTER TABLE `fin_envelopes` DISABLE KEYS */;
INSERT INTO `fin_envelopes` VALUES
('055cacf8-3e28-4689-a4e1-ea1ad17dd261','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','e34414c7-fb80-4d72-897b-d767ce4a2253',NULL,'variable',2000000,'DZD',3000000,1,NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-04 10:30:37.947','2026-11-04 10:30:37.947',1,NULL,NULL,'2026-11-04 10:30:37.947','2026-11-04 10:30:37.947','Alimentation'),
('1cc4d231-3726-4ca7-8691-7fae92140b18','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','e34414c7-fb80-4d72-897b-d767ce4a2253',NULL,'variable',1000000,'DZD',1500000,1,NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-04 10:31:19.682','2026-11-04 10:31:19.682',1,NULL,NULL,'2026-11-04 10:31:19.682','2026-11-04 10:31:19.682','Transport'),
('27696f7c-cc7f-4488-b5cb-263d89e3fd55','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','e34414c7-fb80-4d72-897b-d767ce4a2253',NULL,'variable',500000,'DZD',1000000,1,NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-04 10:31:53.190','2026-11-04 10:31:53.190',1,NULL,NULL,'2026-11-04 10:31:53.190','2026-11-04 10:31:53.190','Dons & solidarité'),
('2a36f342-6d14-4af7-b0ae-683fbb50f534','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','e34414c7-fb80-4d72-897b-d767ce4a2253',NULL,'variable',1000000,'DZD',2000000,1,NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-04 10:32:53.103','2026-11-04 10:32:53.103',1,NULL,NULL,'2026-11-04 10:32:53.103','2026-11-04 10:32:53.103','Imprévus'),
('311446a6-2fc0-4b35-a5c4-a0703ff6348a','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','e34414c7-fb80-4d72-897b-d767ce4a2253',NULL,'variable',800000,'DZD',1000000,1,'tabac','personal','manual',NULL,'declared',NULL,'[]','2026-11-04 10:34:12.468','2026-11-04 10:34:12.468',1,NULL,NULL,'2026-11-04 10:34:12.468','2026-11-04 10:34:12.468','Autre'),
('69a2946a-fb55-4c6b-811b-86449d58f3a9','087b8449-6ea8-4478-9a2a-097b0a43fc72','770f6a7d-f556-4b6c-ab9e-c0656cda29c5','4ba17c79-10b2-56d1-ae91-a9cad1745397','fixed',350000,'DZD',NULL,1,NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-03 10:21:46.041','2026-11-03 10:21:46.041',1,NULL,NULL,'2026-11-03 10:21:46.041','2026-11-03 10:21:46.041',NULL),
('6a3e600a-3f92-4d86-aab4-a1d333aceaa0','087b8449-6ea8-4478-9a2a-097b0a43fc72','770f6a7d-f556-4b6c-ab9e-c0656cda29c5','0b9357f3-bf24-54a5-ae8c-d03c93588924','variable',300000,'DZD',NULL,1,NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-03 10:21:47.082','2026-11-03 10:21:47.082',1,NULL,NULL,'2026-11-03 10:21:47.082','2026-11-03 10:21:47.082',NULL),
('88bfb0d0-8f63-40de-be28-b04538ab3bed','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','e34414c7-fb80-4d72-897b-d767ce4a2253',NULL,'fixed',200000,'DZD',250000,1,'attention au dépassement','personal','manual',NULL,'declared',NULL,'[]','2026-11-04 10:28:36.589','2026-11-04 10:28:36.589',1,NULL,NULL,'2026-11-04 10:28:36.589','2026-11-04 10:28:36.589','Télécom & numérique'),
('a69ecc7d-ebf6-49a4-9314-80e2613e7705','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','e34414c7-fb80-4d72-897b-d767ce4a2253',NULL,'variable',1000000,'DZD',1500000,1,NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-04 10:31:31.772','2026-11-04 10:31:31.772',1,NULL,NULL,'2026-11-04 10:31:31.772','2026-11-04 10:31:31.772','Santé & bien-être'),
('bbeb5b3c-a576-4e2c-a920-7629cecc5ed9','087b8449-6ea8-4478-9a2a-097b0a43fc72','770f6a7d-f556-4b6c-ab9e-c0656cda29c5','a0f8616f-e9ee-5fb7-a081-e61feaeaea80','fixed',2800000,'DZD',NULL,1,NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-03 10:21:45.828','2026-11-03 10:21:45.828',1,NULL,NULL,'2026-11-03 10:21:45.828','2026-11-03 10:21:45.828',NULL),
('bdfaa141-58af-420c-8faf-f7d648592acf','087b8449-6ea8-4478-9a2a-097b0a43fc72','770f6a7d-f556-4b6c-ab9e-c0656cda29c5','e12c5b6f-fbdf-5c19-b286-93adcf97466d','variable',1800000,'DZD',NULL,1,NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-03 10:21:46.455','2026-11-03 10:21:46.455',1,NULL,NULL,'2026-11-03 10:21:46.455','2026-11-03 10:21:46.455',NULL),
('ce50ca25-f8fb-4e0b-97d8-9a0704882837','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','e34414c7-fb80-4d72-897b-d767ce4a2253',NULL,'fixed',3000000,'DZD',NULL,1,NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-04 10:30:04.474','2026-11-04 10:30:04.474',1,NULL,NULL,'2026-11-04 10:30:04.474','2026-11-04 10:30:04.474','Logement'),
('d6dfebd6-e51b-4663-8872-8c48a2b0e018','087b8449-6ea8-4478-9a2a-097b0a43fc72','770f6a7d-f556-4b6c-ab9e-c0656cda29c5','fb238194-33e8-5309-a0ad-e47aea414d2e','fixed',250000,'DZD',NULL,1,NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-03 10:21:46.245','2026-11-03 10:21:46.245',1,NULL,NULL,'2026-11-03 10:21:46.245','2026-11-03 10:21:46.245',NULL),
('dd7c23fd-0e1d-47e3-bb77-b3eeca32ae02','087b8449-6ea8-4478-9a2a-097b0a43fc72','770f6a7d-f556-4b6c-ab9e-c0656cda29c5','e01bc4eb-e1bc-5c62-b38f-c0eb2b559a97','variable',300000,'DZD',NULL,1,NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-03 10:21:46.656','2026-11-03 10:21:46.656',1,NULL,NULL,'2026-11-03 10:21:46.656','2026-11-03 10:21:46.656',NULL),
('ecb59b71-59d1-41fd-95ff-d7da089ab4f0','087b8449-6ea8-4478-9a2a-097b0a43fc72','770f6a7d-f556-4b6c-ab9e-c0656cda29c5','f3dbd149-0d39-570c-b388-d40a5eb65d0f','variable',300000,'DZD',NULL,1,NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-03 10:21:46.867','2026-11-03 10:21:46.867',1,NULL,NULL,'2026-11-03 10:21:46.867','2026-11-03 10:21:46.867',NULL);
/*!40000 ALTER TABLE `fin_envelopes` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_flow_steps`
--

DROP TABLE IF EXISTS `fin_flow_steps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_flow_steps` (
  `id` varchar(191) NOT NULL,
  `flowId` varchar(191) NOT NULL,
  `stepKey` varchar(60) NOT NULL,
  `prompt` text NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`options`)),
  `position` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fin_flow_steps_flowId_stepKey_key` (`flowId`,`stepKey`),
  CONSTRAINT `fin_flow_steps_flowId_fkey` FOREIGN KEY (`flowId`) REFERENCES `fin_flows` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_flow_steps_prompt_check` CHECK (octet_length(trim(`prompt`)) > 0),
  CONSTRAINT `fin_flow_steps_options_check` CHECK (json_type(`options`) = 'ARRAY'),
  CONSTRAINT `fin_flow_steps_position_check` CHECK (`position` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_flow_steps`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_flow_steps` WRITE;
/*!40000 ALTER TABLE `fin_flow_steps` DISABLE KEYS */;
/*!40000 ALTER TABLE `fin_flow_steps` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_flows`
--

DROP TABLE IF EXISTS `fin_flows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_flows` (
  `id` varchar(191) NOT NULL,
  `key` varchar(60) NOT NULL,
  `name` varchar(150) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'draft',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fin_flows_key_key` (`key`),
  CONSTRAINT `fin_flows_key_check` CHECK (`key` collate utf8mb4_bin regexp '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT `fin_flows_name_check` CHECK (octet_length(trim(`name`)) > 0),
  CONSTRAINT `fin_flows_status_check` CHECK (`status` in ('draft','published'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_flows`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_flows` WRITE;
/*!40000 ALTER TABLE `fin_flows` DISABLE KEYS */;
/*!40000 ALTER TABLE `fin_flows` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_goals`
--

DROP TABLE IF EXISTS `fin_goals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_goals` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `label` varchar(80) NOT NULL,
  `templateKey` varchar(40) DEFAULT NULL,
  `target` double NOT NULL,
  `currency` varchar(3) NOT NULL,
  `targetDate` datetime(3) DEFAULT NULL,
  `allocated` double NOT NULL DEFAULT 0,
  `monthlyContribution` double DEFAULT NULL,
  `rate` double DEFAULT NULL,
  `priority` int(11) NOT NULL DEFAULT 0,
  `note` varchar(300) DEFAULT NULL,
  `scope` varchar(20) NOT NULL DEFAULT 'personal',
  `source` varchar(20) NOT NULL,
  `sourceRef` varchar(200) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `confidence` varchar(10) DEFAULT NULL,
  `consentUses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`consentUses`)),
  `effectiveAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `collectedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `version` int(11) NOT NULL DEFAULT 1,
  `archivedAt` datetime(3) DEFAULT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `accountId` varchar(191) DEFAULT NULL,
  `progressStatus` varchar(10) NOT NULL DEFAULT 'active',
  `icon` varchar(16) DEFAULT NULL,
  `color` varchar(7) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fin_goals_userId_deletedAt_idx` (`userId`,`deletedAt`),
  KEY `fin_goals_accountId_fkey` (`accountId`),
  CONSTRAINT `fin_goals_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `fin_accounts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fin_goals_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_goals_scope_check` CHECK (`scope` in ('personal','couple','household','space')),
  CONSTRAINT `fin_goals_source_check` CHECK (`source` in ('manual','imported','document','partner','computed')),
  CONSTRAINT `fin_goals_status_check` CHECK (`status` in ('real','declared','imported','computed','fictional','official','to_confirm')),
  CONSTRAINT `fin_goals_confidence_check` CHECK (`confidence` is null or `confidence` in ('high','medium','low')),
  CONSTRAINT `fin_goals_currency_check` CHECK (`currency` regexp '^[A-Z]{3}$'),
  CONSTRAINT `fin_goals_version_check` CHECK (`version` >= 1),
  CONSTRAINT `fin_goals_label_check` CHECK (trim(`label`) <> ''),
  CONSTRAINT `fin_goals_target_check` CHECK (`target` > 0),
  CONSTRAINT `fin_goals_allocated_check` CHECK (`allocated` >= 0),
  CONSTRAINT `fin_goals_priority_check` CHECK (`priority` >= 0),
  CONSTRAINT `fin_goals_monthly_contribution_check` CHECK (`monthlyContribution` is null or `monthlyContribution` >= 0),
  CONSTRAINT `fin_goals_rate_check` CHECK (`rate` is null or `rate` >= 0 and `rate` <= 1),
  CONSTRAINT `fin_goals_consent_uses_check` CHECK (json_type(`consentUses`) = 'ARRAY'),
  CONSTRAINT `fin_goals_progress_check` CHECK (`progressStatus` in ('active','reached','paused','stopped'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_goals`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_goals` WRITE;
/*!40000 ALTER TABLE `fin_goals` DISABLE KEYS */;
INSERT INTO `fin_goals` VALUES
('45944814-236c-489d-b9a1-89c63a0a79e8','087b8449-6ea8-4478-9a2a-097b0a43fc72','Fonds d’urgence',NULL,15000000,'DZD','2027-08-30 10:21:36.169',0,NULL,NULL,0,NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-03 10:21:47.287','2026-11-03 10:21:47.287',1,NULL,NULL,'2026-11-03 10:21:47.287','2026-11-03 10:21:47.287',NULL,'active',NULL,NULL),
('6fdeafed-4de2-45f1-b5c1-e3e1d96eb809','087b8449-6ea8-4478-9a2a-097b0a43fc72','Vacances d’été',NULL,6000000,'DZD','2027-06-11 10:21:36.169',0,NULL,NULL,0,NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-03 10:21:47.510','2026-11-03 10:21:47.510',1,NULL,NULL,'2026-11-03 10:21:47.510','2026-11-03 10:21:47.510',NULL,'active',NULL,NULL),
('71c4f605-59b2-4f22-8836-17f9a117c7d2','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','Fonds d’urgence','emergency',40000000,'DZD','2027-01-15 00:00:00.000',0,NULL,NULL,0,NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-04 13:32:49.889','2026-11-04 13:32:49.889',2,NULL,NULL,'2026-11-04 13:32:49.889','2026-11-04 13:36:12.252','46b02ea5-fab0-449e-9386-04500d1d613d','active',NULL,NULL),
('765ddcaf-d3da-4772-8646-d013d8d96b51','5daa4745-535e-4e92-824a-a705598eaead','Casque audio',NULL,800000,'DZD','2027-03-03 10:21:36.169',0,NULL,NULL,0,NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-03 10:21:52.292','2026-11-03 10:21:52.292',1,NULL,NULL,'2026-11-03 10:21:52.292','2026-11-03 10:21:52.292',NULL,'active',NULL,NULL),
('84dc8484-61f9-4284-868b-592b6c36b566','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','Mariage','wedding',500000000,'DZD','2028-02-04 00:00:00.000',0,3000000,NULL,0,NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-04 13:07:36.053','2026-11-04 13:07:36.053',2,NULL,NULL,'2026-11-04 13:07:36.053','2026-11-04 13:19:38.504',NULL,'active',NULL,NULL),
('ad7a3b69-5801-4fc4-889d-e1306df6d4e6','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','sls','car',100000000,'DZD','2030-10-10 00:00:00.000',0,NULL,0.01,0,NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-10-17 08:12:52.282','2026-10-17 08:12:52.282',1,NULL,NULL,'2026-10-17 08:12:52.282','2026-10-17 08:12:52.282',NULL,'active',NULL,NULL),
('d0e42f62-db20-4dfe-a94e-7196b4b9d34f','087b8449-6ea8-4478-9a2a-097b0a43fc72','Essai sans date R107',NULL,2147483647,'DZD',NULL,0,NULL,NULL,0,NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-04 15:30:11.271','2026-11-04 15:30:11.271',1,NULL,'2026-11-04 15:31:40.252','2026-11-04 15:30:11.271','2026-11-04 15:31:40.259',NULL,'active',NULL,NULL);
/*!40000 ALTER TABLE `fin_goals` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_incomes`
--

DROP TABLE IF EXISTS `fin_incomes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_incomes` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `label` varchar(80) NOT NULL,
  `categoryId` varchar(191) DEFAULT NULL,
  `value` double NOT NULL,
  `currency` varchar(3) NOT NULL,
  `frequency` varchar(20) NOT NULL,
  `startDate` datetime(3) NOT NULL,
  `endDate` datetime(3) DEFAULT NULL,
  `scope` varchar(20) NOT NULL DEFAULT 'personal',
  `source` varchar(20) NOT NULL,
  `sourceRef` varchar(200) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `confidence` varchar(10) DEFAULT NULL,
  `consentUses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`consentUses`)),
  `effectiveAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `collectedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `version` int(11) NOT NULL DEFAULT 1,
  `archivedAt` datetime(3) DEFAULT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fin_incomes_userId_deletedAt_idx` (`userId`,`deletedAt`),
  KEY `fin_incomes_categoryId_idx` (`categoryId`),
  CONSTRAINT `fin_incomes_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `fin_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fin_incomes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_incomes_scope_check` CHECK (`scope` in ('personal','couple','household','space')),
  CONSTRAINT `fin_incomes_source_check` CHECK (`source` in ('manual','imported','document','partner','computed')),
  CONSTRAINT `fin_incomes_status_check` CHECK (`status` in ('real','declared','imported','computed','fictional','official','to_confirm')),
  CONSTRAINT `fin_incomes_confidence_check` CHECK (`confidence` is null or `confidence` in ('high','medium','low')),
  CONSTRAINT `fin_incomes_frequency_check` CHECK (`frequency` in ('hebdomadaire','mensuel','trimestriel','semestriel','annuel')),
  CONSTRAINT `fin_incomes_currency_check` CHECK (`currency` regexp '^[A-Z]{3}$'),
  CONSTRAINT `fin_incomes_version_check` CHECK (`version` >= 1),
  CONSTRAINT `fin_incomes_label_check` CHECK (trim(`label`) <> ''),
  CONSTRAINT `fin_incomes_dates_check` CHECK (`endDate` is null or `endDate` >= `startDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_incomes`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_incomes` WRITE;
/*!40000 ALTER TABLE `fin_incomes` DISABLE KEYS */;
INSERT INTO `fin_incomes` VALUES
('880f4dec-ca72-4857-ab7b-94a993f597c1','087b8449-6ea8-4478-9a2a-097b0a43fc72','Salaire','a47a98ca-6886-5db3-b468-5468da9a1e56',8500000,'DZD','mensuel','2026-06-01 00:00:00.000',NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-03 10:21:37.449','2026-11-03 10:21:37.449',1,NULL,NULL,'2026-11-03 10:21:37.449','2026-11-03 10:21:37.449'),
('ed860091-95d8-4321-bfa0-078d7469cfa1','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','salaire','a47a98ca-6886-5db3-b468-5468da9a1e56',7000000,'DZD','mensuel','2026-11-04 00:00:00.000',NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-04 10:41:38.336','2026-11-04 10:41:38.336',1,NULL,NULL,'2026-11-04 10:41:38.336','2026-11-04 10:41:38.336');
/*!40000 ALTER TABLE `fin_incomes` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_intents`
--

DROP TABLE IF EXISTS `fin_intents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_intents` (
  `id` varchar(191) NOT NULL,
  `code` varchar(40) NOT NULL,
  `label` varchar(120) NOT NULL,
  `exampleQuery` varchar(200) NOT NULL,
  `keywords` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`keywords`)),
  `responseTemplate` text NOT NULL,
  `deepLinkPath` varchar(200) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'draft',
  `position` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fin_intents_code_key` (`code`),
  CONSTRAINT `fin_intents_label_check` CHECK (octet_length(trim(`label`)) > 0),
  CONSTRAINT `fin_intents_response_check` CHECK (octet_length(trim(`responseTemplate`)) > 0),
  CONSTRAINT `fin_intents_status_check` CHECK (`status` in ('draft','published')),
  CONSTRAINT `fin_intents_keywords_check` CHECK (json_type(`keywords`) = 'ARRAY'),
  CONSTRAINT `fin_intents_position_check` CHECK (`position` >= 0),
  CONSTRAINT `fin_intents_code_check` CHECK (`code` in ('NAVIGUER','EXPLIQUER_INDICATEUR','CRÉER_OBJECTIF','AIDE_BUDGET','AIDE_DETTE','APPRENDRE_TERME','CHERCHER_SOLUTION','DÉPENSE_PARTAGÉE','CB01','CB02','CB03','CB04','CB05','CB06','CB07','CB08','CB09','CB10','CB11','CB12','CB13','CB14','CB15','CB16','CB17','CB18','CB19','CB20','CB21','CB22','CB23','CB24','CB99'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_intents`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_intents` WRITE;
/*!40000 ALTER TABLE `fin_intents` DISABLE KEYS */;
INSERT INTO `fin_intents` VALUES
('17b3b14f-042d-4b1e-b411-75030a244058','AIDE_BUDGET','Aide au budget','Comment faire mon budget ?','[]','<p></p>',NULL,'draft',3,'2026-10-17 09:45:47.954','2026-10-17 09:45:47.954'),
('1b834cfb-ba98-44ee-a0c5-9317e1808051','CB24','Offre bancaire absente','banque absente','[\"banque absente\",\"taux inconnu\"]','<p></p>','/app/outils/comparateur','draft',123,'2026-11-05 08:36:01.839','2026-11-05 08:36:01.839'),
('1e76f3cd-201d-4289-b797-fcb08b521f73','CB08','Rembourser plus vite','rembourser dette','[\"rembourser dette\",\"paiement supplémentaire\"]','<p></p>','/app/dettes/strategies','draft',107,'2026-11-05 08:36:01.839','2026-11-05 08:36:01.839'),
('232202da-55db-4d61-8941-0148ecf56331','CB06','Créer un objectif','objectif','[\"objectif\",\"économiser pour\"]','<p></p>','/app/objectifs','draft',105,'2026-11-05 08:36:01.839','2026-11-05 08:36:01.839'),
('30495a52-e101-4c3d-a660-2cff5efafbc1','CB21','Exporter mes données','export','[\"export\",\"Excel\",\"PDF\"]','<p></p>','/app/synthese/rapports','draft',120,'2026-11-05 08:36:01.839','2026-11-05 08:36:01.839'),
('33a18243-0faa-4a46-b10c-56ad7f38e836','NAVIGUER','Naviguer vers un écran','Où ajouter une dépense ?','[]','<p></p>',NULL,'draft',0,'2026-10-17 09:45:47.954','2026-10-17 09:45:47.954'),
('36387eba-c2c4-4b54-b522-02f7bf26d994','CB01','Budget négatif','budget négatif','[\"budget négatif\",\"je dépense trop\",\"plus d’argent\"]','<p></p>','/app/budgets','draft',100,'2026-11-05 08:36:01.839','2026-11-05 08:36:01.839'),
('456415b8-c3ff-445e-8a09-4e8bc2e95f3f','CB17','Commencer à investir','investir','[\"investir\",\"bourse\",\"placement\"]','<p></p>','/app/portefeuille','draft',116,'2026-11-05 08:36:01.839','2026-11-05 08:36:01.839'),
('492cfd1f-a3e5-4e52-8653-0b57c0b19d05','EXPLIQUER_INDICATEUR','Expliquer un indicateur','C\'est quoi mon taux d\'épargne ?','[]','<p></p>',NULL,'draft',1,'2026-10-17 09:45:47.954','2026-10-17 09:45:47.954'),
('49708158-f86b-4983-bcbd-70667d902771','CB19','Comparer financement islamique','mourabaha','[\"mourabaha\",\"ijara\",\"islamique\"]','<p></p>','/app/outils/comparateur','draft',118,'2026-11-05 08:36:01.839','2026-11-05 08:36:01.839'),
('53c5ae77-572a-4325-ad51-d06030be8390','APPRENDRE_TERME','Apprendre un terme','C\'est quoi une obligation ?','[]','<p></p>',NULL,'draft',5,'2026-10-17 09:45:47.954','2026-10-17 09:45:47.954'),
('53e9178d-056a-482a-b3b1-bd50cefded82','CB15','Choisir un compte bancaire','compte bancaire','[\"compte bancaire\",\"carte\"]','<p></p>','/app/outils/comparateur','draft',114,'2026-11-05 08:36:01.839','2026-11-05 08:36:01.839'),
('547f1fc2-74f6-483c-89a7-38307f15e99b','CB22','Fraude / sécurité','fraude','[\"fraude\",\"phishing\",\"PIN\"]','<p></p>',NULL,'draft',121,'2026-11-05 08:36:01.839','2026-11-05 08:36:01.839'),
('57fc3a5d-9ce7-4dd0-9da9-3290030dd15f','CB18','Comprendre inflation','inflation','[\"inflation\",\"pouvoir achat\"]','<p></p>','/app/outils/simulateurs','draft',117,'2026-11-05 08:36:01.839','2026-11-05 08:36:01.839'),
('65ca557d-a105-4255-93c7-5dc567af1cee','CB23','Pourquoi mon score baisse ?','santé financière','[\"santé financière\",\"score\"]','<p></p>','/app/sante','draft',122,'2026-11-05 08:36:01.839','2026-11-05 08:36:01.839'),
('679fb4a5-852f-4e6e-b079-2887827c2ff0','CB10','Acheter une voiture','voiture','[\"voiture\",\"auto\"]','<p></p>','/app/outils/simulateurs','draft',109,'2026-11-05 08:36:01.839','2026-11-05 08:36:01.839'),
('85c32f7d-c069-4a4f-a796-d20c16fc95e2','CRÉER_OBJECTIF','Créer un objectif','Je veux acheter une voiture','[]','<p></p>',NULL,'draft',2,'2026-10-17 09:45:47.954','2026-10-17 09:45:47.954'),
('91c8986b-3a12-4925-82fd-36389ac7f6fb','CHERCHER_SOLUTION','Chercher une solution de financement','Financement voiture','[]','<p></p>',NULL,'draft',6,'2026-10-17 09:45:47.954','2026-10-17 09:45:47.954'),
('a4224a3a-d71c-45e6-9f9e-6354fcd69916','CB04','Combien puis-je épargner ?','épargner combien','[\"épargner combien\",\"capacité épargne\"]','<p></p>','/app/synthese','draft',103,'2026-11-05 08:36:01.839','2026-11-05 08:36:01.839'),
('acc09b75-6711-4f19-bd56-4f998df631f5','CB02','Créer un budget','faire un budget','[\"faire un budget\",\"commencer budget\"]','<p></p>','/app/budgets/nouveau','draft',101,'2026-11-05 08:36:01.839','2026-11-05 08:36:01.839'),
('c1caca2f-01cd-4d18-9af0-620a4ebe407d','AIDE_DETTE','Aide au remboursement d\'une dette','Comment rembourser plus vite ?','[]','<p></p>',NULL,'draft',4,'2026-10-17 09:45:47.954','2026-10-17 09:45:47.954'),
('c4edcc14-e193-42bc-9d9b-6fc65bbebd69','CB11','Acheter un logement','logement','[\"logement\",\"immobilier\",\"apport\"]','<p></p>','/app/financement','draft',110,'2026-11-05 08:36:01.839','2026-11-05 08:36:01.839'),
('c53ec464-be5a-418d-9cc1-55383947dce2','CB20','Objectif hors trajectoire','objectif retard','[\"objectif retard\",\"je n’atteins pas\"]','<p></p>','/app/objectifs','draft',119,'2026-11-05 08:36:01.839','2026-11-05 08:36:01.839'),
('c63aa22b-0f28-4070-8acb-72feb637545f','CB14','Ouvrir un CCP','CCP','[\"CCP\",\"Algérie Poste\"]','<p></p>','/app/outils/postal','draft',113,'2026-11-05 08:36:01.839','2026-11-05 08:36:01.839'),
('c8ec5412-8607-473e-b7f0-c30b8901bca8','CB03','Enveloppe dépassée','enveloppe dépassée','[\"enveloppe dépassée\",\"transport trop élevé\"]','<p></p>','/app/budgets','draft',102,'2026-11-05 08:36:01.839','2026-11-05 08:36:01.839'),
('c98df003-304a-4a82-b23a-6eeafdf95096','CB09','Simuler un crédit','crédit','[\"crédit\",\"mensualité\",\"prêt\"]','<p></p>','/app/outils/credit','draft',108,'2026-11-05 08:36:01.839','2026-11-05 08:36:01.839'),
('de06748e-7983-4bef-a0bb-89122429025a','CB07','Dette trop élevée','trop de dettes','[\"trop de dettes\",\"mensualités élevées\"]','<p></p>','/app/dettes','draft',106,'2026-11-05 08:36:01.839','2026-11-05 08:36:01.839'),
('ed10a442-2c21-4db6-a95e-289f0be8ab05','CB13','Comprendre IRG','IRG','[\"IRG\",\"impôt salaire\"]','<p></p>','/app/outils/fiche-de-paie','draft',112,'2026-11-05 08:36:01.839','2026-11-05 08:36:01.839'),
('ed22f792-9d71-4b2b-b5c6-b3ca933aca22','CB99','Intention inconnue','Fallback','[\"Fallback\"]','<p></p>',NULL,'draft',124,'2026-11-05 08:36:01.839','2026-11-05 08:36:01.839'),
('ef55fbce-4a01-43c5-9ba8-f749ab03b49b','CB16','Utilisateur mineur','mineur','[\"mineur\",\"parent\",\"lycéen\"]','<p></p>',NULL,'draft',115,'2026-11-05 08:36:01.839','2026-11-05 08:36:01.839'),
('f0e5a07b-5513-4471-bfda-949f9e50877f','CB12','Comprendre fiche de paie','brut net','[\"brut net\",\"fiche de paie\"]','<p></p>','/app/outils/fiche-de-paie','draft',111,'2026-11-05 08:36:01.839','2026-11-05 08:36:01.839'),
('fc8433a5-d5c7-40d4-b8af-1898ea9f71cb','CB05','Réserve de sécurité','fonds urgence','[\"fonds urgence\",\"réserve\",\"épargne sécurité\"]','<p></p>','/app/objectifs/fonds-urgence','draft',104,'2026-11-05 08:36:01.839','2026-11-05 08:36:01.839');
/*!40000 ALTER TABLE `fin_intents` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_mission_attempts`
--

DROP TABLE IF EXISTS `fin_mission_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_mission_attempts` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `missionId` varchar(191) NOT NULL,
  `choices` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`choices`)),
  `result` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`result`)),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `fin_mission_attempts_userId_missionId_idx` (`userId`,`missionId`),
  KEY `fin_mission_attempts_missionId_fkey` (`missionId`),
  CONSTRAINT `fin_mission_attempts_missionId_fkey` FOREIGN KEY (`missionId`) REFERENCES `fin_missions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_mission_attempts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_mission_attempts`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_mission_attempts` WRITE;
/*!40000 ALTER TABLE `fin_mission_attempts` DISABLE KEYS */;
/*!40000 ALTER TABLE `fin_mission_attempts` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_missions`
--

DROP TABLE IF EXISTS `fin_missions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_missions` (
  `id` varchar(191) NOT NULL,
  `slug` varchar(80) NOT NULL,
  `title` varchar(120) NOT NULL,
  `summary` varchar(500) NOT NULL,
  `profiles` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '[]' CHECK (json_valid(`profiles`)),
  `startingAmount` double NOT NULL,
  `currency` varchar(3) NOT NULL,
  `steps` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`steps`)),
  `badges` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '[]' CHECK (json_valid(`badges`)),
  `status` varchar(10) NOT NULL DEFAULT 'draft',
  `position` int(11) NOT NULL DEFAULT 0,
  `version` int(11) NOT NULL DEFAULT 1,
  `publishedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fin_missions_slug_key` (`slug`),
  KEY `fin_missions_status_position_idx` (`status`,`position`),
  CONSTRAINT `fin_missions_status_check` CHECK (`status` in ('draft','published')),
  CONSTRAINT `fin_missions_amount_check` CHECK (`startingAmount` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_missions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_missions` WRITE;
/*!40000 ALTER TABLE `fin_missions` DISABLE KEYS */;
INSERT INTO `fin_missions` VALUES
('2332a216-4dbe-4775-a752-93e7846ae326','mon-premier-salaire','Mon premier salaire','Quelques choix sur une somme fictive.','[\"LYC\"]',5000000,'DZD','[{\"key\":\"loyer\",\"prompt\":\"Le loyer arrive. Que fais-tu ?\",\"choices\":[{\"key\":\"payer\",\"label\":\"Je le paie tout de suite\",\"cash\":-2000000,\"savings\":0,\"resilience\":20,\"explanation\":\"Une charge fixe payée à temps évite les pénalités.\"},{\"key\":\"attendre\",\"label\":\"J’attends la fin du mois\",\"cash\":0,\"savings\":0,\"resilience\":-10,\"explanation\":\"Un retard coûte plus qu’il ne rapporte.\"}]}]','[{\"key\":\"en-route\",\"label\":\"En route\",\"minResilience\":20}]','draft',0,1,NULL,'2026-11-05 08:48:02.803','2026-11-05 08:48:02.803');
/*!40000 ALTER TABLE `fin_missions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_notifications`
--

DROP TABLE IF EXISTS `fin_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_notifications` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `type` varchar(40) NOT NULL,
  `category` varchar(20) NOT NULL,
  `priority` varchar(20) NOT NULL,
  `params` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`params`)),
  `link` varchar(200) DEFAULT NULL,
  `referenceId` varchar(191) DEFAULT NULL,
  `read` tinyint(1) NOT NULL DEFAULT 0,
  `readAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `fin_notifications_userId_read_createdAt_idx` (`userId`,`read`,`createdAt`),
  KEY `fin_notifications_userId_type_referenceId_idx` (`userId`,`type`,`referenceId`),
  CONSTRAINT `fin_notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_notifications_category_check` CHECK (`category` in ('action','information','securite')),
  CONSTRAINT `fin_notifications_priority_check` CHECK (`priority` in ('securite','echeance','budget','apprentissage')),
  CONSTRAINT `fin_notifications_params_check` CHECK (json_type(`params`) = 'OBJECT')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_notifications`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_notifications` WRITE;
/*!40000 ALTER TABLE `fin_notifications` DISABLE KEYS */;
INSERT INTO `fin_notifications` VALUES
('03862458-db0a-4cfe-8944-d06cd828084b','9da929b7-d604-461b-ab52-84e2c5dcb02b','space_expense','information','apprentissage','{\"label\":\"Sortie du week-end\"}','/partage/54b4f2b8-a2d7-4514-85e0-f1cc548b6ba6/depenses','d455877b-a8ed-45bd-941a-551c941177d3',0,NULL,'2026-11-03 10:22:04.489'),
('074caa02-ce88-446d-86e7-f5d9f38d5909','6fc2c284-bff5-4b8a-893a-da24525ac358','space_expense','information','apprentissage','{\"label\":\"Location de la maison\"}','/partage/71a33179-68ea-4391-96ec-7da90a76d362/depenses','393b712e-1bc8-431c-b84c-04e43480225e',0,NULL,'2026-11-03 10:22:08.990'),
('12e2fbc4-74e4-4ead-83e7-87da9c361593','52982f43-bd76-479c-bbe3-d527decd2c63','space_expense','information','apprentissage','{\"label\":\"Internet\"}','/partage/85afecf3-0025-47a6-babb-17e941f50449/depenses','7462e558-93ee-49bb-b39c-2fa1c9df48d1',0,NULL,'2026-11-03 10:22:00.103'),
('16060a7e-e06c-4505-aed7-49f6ac7e209a','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','income_to_confirm','action','echeance','{\"label\":\"salaire\",\"date\":\"2026-11-04\",\"value\":7000000,\"currency\":\"DZD\"}','/app/aujourdhui','recurrence:10bdcda8-cd8b-4df4-94d8-bd1139d2a8ef:2026-11-04',0,NULL,'2026-11-04 10:42:34.885'),
('18b4f584-864e-49fb-a5f0-c38e893858c8','55ebe856-2adf-4aa6-9f70-43bf06ca29e0','space_permission','information','apprentissage','{\"role\":\"owner\"}','/partage/85afecf3-0025-47a6-babb-17e941f50449/membres','9cc9b1e7-d226-48ce-8364-3020a2f91ac8:owner:1793806871214',0,NULL,'2026-11-04 15:41:11.240'),
('1932ac38-8e81-4e27-adfb-070bec484a45','55ebe856-2adf-4aa6-9f70-43bf06ca29e0','space_expense','information','apprentissage','{\"label\":\"Courses communes\"}','/partage/85afecf3-0025-47a6-babb-17e941f50449/depenses','6328495a-2f38-4385-974c-013964d1ab25',0,NULL,'2026-11-03 10:21:57.861'),
('1f03353a-b49f-4995-8757-42ad7c425bf8','52982f43-bd76-479c-bbe3-d527decd2c63','space_expense','information','apprentissage','{\"label\":\"Courses communes\"}','/partage/85afecf3-0025-47a6-babb-17e941f50449/depenses','0197fe5c-8b02-4417-a286-a63aef07acb1',0,NULL,'2026-11-03 10:21:56.025'),
('244009e2-ff79-47db-b995-2922bfed9533','9da929b7-d604-461b-ab52-84e2c5dcb02b','space_expense','information','apprentissage','{\"label\":\"Courses du mois\"}','/partage/54b4f2b8-a2d7-4514-85e0-f1cc548b6ba6/depenses','c355a320-7a36-4b87-8d27-d46dd024cf94',0,NULL,'2026-11-03 10:22:03.067'),
('24acd228-840b-4366-b174-9cda2b05d365','55ebe856-2adf-4aa6-9f70-43bf06ca29e0','space_expense','information','apprentissage','{\"label\":\"Internet\"}','/partage/85afecf3-0025-47a6-babb-17e941f50449/depenses','7462e558-93ee-49bb-b39c-2fa1c9df48d1',0,NULL,'2026-11-03 10:22:00.207'),
('2dae9c63-3e4b-459e-ab77-10fb50d8f500','6fc2c284-bff5-4b8a-893a-da24525ac358','space_expense','information','apprentissage','{\"label\":\"Restaurant au port\"}','/partage/71a33179-68ea-4391-96ec-7da90a76d362/depenses','2df5f429-1e1d-4a3e-95a4-5512bf34f1c0',0,NULL,'2026-11-03 10:22:10.158'),
('2efa0f23-8978-4417-9f1d-8ef7d3707d59','52982f43-bd76-479c-bbe3-d527decd2c63','space_expense','information','apprentissage','{\"label\":\"Courses communes\"}','/partage/85afecf3-0025-47a6-babb-17e941f50449/depenses','6328495a-2f38-4385-974c-013964d1ab25',0,NULL,'2026-11-03 10:21:57.760'),
('31b7f2ff-3096-414c-9e46-cf544681d770','55ebe856-2adf-4aa6-9f70-43bf06ca29e0','space_member','information','apprentissage','{\"event\":\"joined\"}','/partage/85afecf3-0025-47a6-babb-17e941f50449/membres','207a9a1f-f57c-414c-9d5d-c907b874ab01:joined:1793701314740',0,NULL,'2026-11-03 10:21:54.850'),
('41478246-23c7-4cfa-837e-b0972e69fcfb','52982f43-bd76-479c-bbe3-d527decd2c63','space_expense','information','apprentissage','{\"label\":\"Internet\"}','/partage/85afecf3-0025-47a6-babb-17e941f50449/depenses','ebb299eb-f8f1-4df6-930c-b162e221c286',0,NULL,'2026-11-03 10:21:58.357'),
('45764392-bbf7-4cf3-96e8-a0f144fed783','087b8449-6ea8-4478-9a2a-097b0a43fc72','space_member','information','apprentissage','{\"event\":\"joined\"}','/partage/85afecf3-0025-47a6-babb-17e941f50449/membres','9cc9b1e7-d226-48ce-8364-3020a2f91ac8:joined:1793701313983',0,NULL,'2026-11-03 10:21:53.992'),
('4a6d7a4f-1716-48b3-b9ce-7504d32dc888','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','budget_alert','action','budget','{\"niveau\":\"exceeded\",\"label\":\"Autre\",\"taux\":1.5}','/app/budgets/e34414c7-fb80-4d72-897b-d767ce4a2253','311446a6-2fc0-4b35-a5c4-a0703ff6348a',0,NULL,'2026-11-05 07:55:16.147'),
('4f2098ed-60a7-4c31-990a-63139c1aeade','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','space_member','information','apprentissage','{\"event\":\"joined\"}','/partage/b467fabd-2be5-4deb-9ad7-d3cf76e09e3b/membres','ed19ecad-f07a-48ba-8abe-2cc5742339b9:joined:1793804027130',0,NULL,'2026-11-04 14:53:47.146'),
('51fa8773-8352-4b70-8efc-0a17fce5ff37','52982f43-bd76-479c-bbe3-d527decd2c63','space_expense','information','apprentissage','{\"label\":\"Loyer de l’appartement\"}','/partage/85afecf3-0025-47a6-babb-17e941f50449/depenses','6bcd5449-13ea-46b3-b777-a8c2926e5f82',0,NULL,'2026-11-03 10:21:57.179'),
('63ca6851-8328-4fc1-be57-efce73967a56','087b8449-6ea8-4478-9a2a-097b0a43fc72','budget_alert','action','budget','{\"niveau\":\"reached\",\"label\":\"Loyer\",\"taux\":1}','/app/budgets/770f6a7d-f556-4b6c-ab9e-c0656cda29c5','bbeb5b3c-a576-4e2c-a920-7629cecc5ed9',0,NULL,'2026-11-04 15:14:15.321'),
('65902964-34e6-42a0-aa70-43376a45df17','55ebe856-2adf-4aa6-9f70-43bf06ca29e0','space_expense','information','apprentissage','{\"label\":\"Loyer de l’appartement\"}','/partage/85afecf3-0025-47a6-babb-17e941f50449/depenses','8d4a665a-7706-4be7-bc58-871bef18a416',0,NULL,'2026-11-03 10:21:55.542'),
('671d0221-2960-4f39-a8f1-70e32ca2c94e','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','space_goal_gap','action','echeance','{\"event\":\"milestone\",\"label\":\"trouvez mieux\",\"percent\":25}','/partage/b467fabd-2be5-4deb-9ad7-d3cf76e09e3b/objectifs','f93742b2-ecea-4d76-927a-ceec86b00be0:m25',0,NULL,'2026-11-05 07:31:54.968'),
('70aa5d79-0603-40c4-a67b-d25561d09c86','087b8449-6ea8-4478-9a2a-097b0a43fc72','space_expense','information','apprentissage','{\"label\":\"Essence\"}','/partage/71a33179-68ea-4391-96ec-7da90a76d362/depenses','61ec13d1-dfd7-4f0c-9583-394461688f36',0,NULL,'2026-11-03 10:22:09.496'),
('740bfdd1-4fb6-4789-9be4-1f907b91241d','55ebe856-2adf-4aa6-9f70-43bf06ca29e0','space_expense','information','apprentissage','{\"label\":\"Courses communes\"}','/partage/85afecf3-0025-47a6-babb-17e941f50449/depenses','421ce769-67f9-4f34-a2b6-c28ad5420baa',0,NULL,'2026-11-03 10:21:59.615'),
('7882f87f-ce3a-4347-9f07-ef91cd52bde6','087b8449-6ea8-4478-9a2a-097b0a43fc72','space_expense','information','apprentissage','{\"label\":\"Location de la maison\"}','/partage/71a33179-68ea-4391-96ec-7da90a76d362/depenses','393b712e-1bc8-431c-b84c-04e43480225e',0,NULL,'2026-11-03 10:22:08.895'),
('7b3d142e-1213-42dd-9c23-b203233d840f','52982f43-bd76-479c-bbe3-d527decd2c63','space_expense','information','apprentissage','{\"label\":\"Internet\"}','/partage/85afecf3-0025-47a6-babb-17e941f50449/depenses','9b01f564-bc82-4e71-acb7-a211515763b0',0,NULL,'2026-11-03 10:21:56.597'),
('85c63215-12fc-4587-9c21-ea4c50c7a0ba','087b8449-6ea8-4478-9a2a-097b0a43fc72','space_permission','information','apprentissage','{\"role\":\"owner\"}','/partage/85afecf3-0025-47a6-babb-17e941f50449/membres','0a772d8c-5b3e-405f-a0aa-f1471dd7ecd1:owner:1793806872893',0,NULL,'2026-11-04 15:41:12.916'),
('8755ffb5-2a8b-4a34-911d-0f6ab2b120dc','087b8449-6ea8-4478-9a2a-097b0a43fc72','space_expense','information','apprentissage','{\"label\":\"Restaurant au port\"}','/partage/71a33179-68ea-4391-96ec-7da90a76d362/depenses','2df5f429-1e1d-4a3e-95a4-5512bf34f1c0',0,NULL,'2026-11-03 10:22:10.062'),
('8e92eaf1-08f9-48a9-a60d-acccd3e6f19b','9da929b7-d604-461b-ab52-84e2c5dcb02b','space_expense','information','apprentissage','{\"label\":\"Courses du mois\"}','/partage/54b4f2b8-a2d7-4514-85e0-f1cc548b6ba6/depenses','a44cdfe5-8ddc-4129-8172-ff260fc62148',0,NULL,'2026-11-03 10:22:04.954'),
('95cc6090-890b-46ef-8843-12927cb22deb','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','space_goal_gap','action','echeance','{\"event\":\"milestone\",\"label\":\"trouvez mieux\",\"percent\":25}','/partage/b467fabd-2be5-4deb-9ad7-d3cf76e09e3b/objectifs','f93742b2-ecea-4d76-927a-ceec86b00be0:m25',0,NULL,'2026-11-05 07:36:01.783'),
('95d61ab5-858b-4a7a-b30b-1306341b9da6','52982f43-bd76-479c-bbe3-d527decd2c63','space_expense','information','apprentissage','{\"label\":\"Loyer de l’appartement\"}','/partage/85afecf3-0025-47a6-babb-17e941f50449/depenses','88ddcc76-3a32-47dc-8964-b6ce8c02fa32',0,NULL,'2026-11-03 10:21:58.928'),
('9f4ee0d2-5cb8-4dc3-8e84-0641645fdbcb','08fb6c4e-5b4c-42a5-b499-2ea486544b98','space_member','information','apprentissage','{\"event\":\"joined\"}','/partage/71a33179-68ea-4391-96ec-7da90a76d362/membres','d3ba34f0-c23a-451a-b3df-788926435db4:joined:1793701328219',0,NULL,'2026-11-03 10:22:08.322'),
('a1ae5f02-9db8-4c9d-bb93-8d65b593f176','087b8449-6ea8-4478-9a2a-097b0a43fc72','account_alert','action','securite','{\"niveau\":\"overdrawn\",\"label\":\"Espèces\"}','/app/comptes','account:7dfbc7e0-36f1-48d2-a9ac-34d421bc0374',0,NULL,'2026-11-04 15:47:27.851'),
('a2178492-a0d5-4015-b7c7-8a09ab1e2e57','6fc2c284-bff5-4b8a-893a-da24525ac358','space_expense','information','apprentissage','{\"label\":\"Essence\"}','/partage/71a33179-68ea-4391-96ec-7da90a76d362/depenses','61ec13d1-dfd7-4f0c-9583-394461688f36',0,NULL,'2026-11-03 10:22:09.596'),
('a7747066-533f-45c9-b416-926103d82e84','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','goal_milestone','information','apprentissage','{\"niveau\":\"0.25\",\"label\":\"Fonds d’urgence\"}','/app/objectifs','milestone:71c4f605-59b2-4f22-8836-17f9a117c7d2',0,NULL,'2026-11-04 13:40:47.595'),
('a89c30f1-0ddd-40c9-971f-ab518cebcf79','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','budget_alert','action','budget','{\"niveau\":\"reached\",\"label\":\"Alimentation\",\"taux\":1}','/app/budgets/e34414c7-fb80-4d72-897b-d767ce4a2253','055cacf8-3e28-4689-a4e1-ea1ad17dd261',0,NULL,'2026-11-05 08:06:04.964'),
('aabc05f7-3722-44f9-b6b8-383b03137ac5','08fb6c4e-5b4c-42a5-b499-2ea486544b98','space_member','information','apprentissage','{\"event\":\"joined\"}','/partage/71a33179-68ea-4391-96ec-7da90a76d362/membres','0cd130cb-462f-4e4c-acb4-d08578ec5059:joined:1793701327464',0,NULL,'2026-11-03 10:22:07.478'),
('abc8fae9-77d8-49d5-ae68-d4241d357842','55ebe856-2adf-4aa6-9f70-43bf06ca29e0','space_expense','information','apprentissage','{\"label\":\"Internet\"}','/partage/85afecf3-0025-47a6-babb-17e941f50449/depenses','ebb299eb-f8f1-4df6-930c-b162e221c286',0,NULL,'2026-11-03 10:21:58.455'),
('ad5f1f0b-919e-410b-9e77-e783ccc522a9','9da929b7-d604-461b-ab52-84e2c5dcb02b','space_expense','information','apprentissage','{\"label\":\"Sortie du week-end\"}','/partage/54b4f2b8-a2d7-4514-85e0-f1cc548b6ba6/depenses','4b8da904-b15c-4d4a-871e-407f8988cfc9',0,NULL,'2026-11-03 10:22:05.421'),
('ae391f4d-0063-48b0-a77f-4a88a079e373','087b8449-6ea8-4478-9a2a-097b0a43fc72','space_member','information','apprentissage','{\"event\":\"joined\"}','/partage/71a33179-68ea-4391-96ec-7da90a76d362/membres','d3ba34f0-c23a-451a-b3df-788926435db4:joined:1793701328219',0,NULL,'2026-11-03 10:22:08.226'),
('b021c439-9e7a-4761-9ec7-388dd7157ff2','55ebe856-2adf-4aa6-9f70-43bf06ca29e0','space_expense','information','apprentissage','{\"label\":\"Internet\"}','/partage/85afecf3-0025-47a6-babb-17e941f50449/depenses','9b01f564-bc82-4e71-acb7-a211515763b0',0,NULL,'2026-11-03 10:21:56.692'),
('b8777f9a-cb43-4378-8693-14160aa62e1a','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','payment_to_confirm','action','echeance','{\"label\":\"abonnement claude\",\"date\":\"2026-11-04\",\"value\":1200000,\"currency\":\"DZD\"}','/app/aujourdhui','recurrence:c9939f7d-102c-45f3-b829-3d3d128c558d:2026-11-04',0,NULL,'2026-11-04 13:56:14.877'),
('b91950bf-9632-43d7-8158-5de6ffab6b5b','087b8449-6ea8-4478-9a2a-097b0a43fc72','space_task','action','echeance','{\"label\":\"Ménage des parties communes\",\"niveau\":\"soon\",\"date\":\"2026-11-05\"}','/partage/85afecf3-0025-47a6-babb-17e941f50449/taches','8143760a-43fc-4017-a564-6ec5452c0b19',0,NULL,'2026-11-04 15:14:15.690'),
('be8b8ebb-d120-458a-9a6a-c25cb9020c6a','55ebe856-2adf-4aa6-9f70-43bf06ca29e0','space_expense','information','apprentissage','{\"label\":\"Loyer de l’appartement\"}','/partage/85afecf3-0025-47a6-babb-17e941f50449/depenses','88ddcc76-3a32-47dc-8964-b6ce8c02fa32',0,NULL,'2026-11-03 10:21:59.043'),
('c3595eb8-f186-4fa4-b1ac-c0c472851eb8','55ebe856-2adf-4aa6-9f70-43bf06ca29e0','space_expense','information','apprentissage','{\"label\":\"Courses communes\"}','/partage/85afecf3-0025-47a6-babb-17e941f50449/depenses','0197fe5c-8b02-4417-a286-a63aef07acb1',0,NULL,'2026-11-03 10:21:56.120'),
('cb7609dc-d390-4aa1-b81f-d41277ed9a25','9da929b7-d604-461b-ab52-84e2c5dcb02b','space_expense','information','apprentissage','{\"label\":\"Sortie du week-end\"}','/partage/54b4f2b8-a2d7-4514-85e0-f1cc548b6ba6/depenses','ffd000f5-69a7-4be6-a9ec-e1d896175fb4',0,NULL,'2026-11-03 10:22:03.549'),
('cb799daa-1be3-455d-ab65-a3d78474572f','52982f43-bd76-479c-bbe3-d527decd2c63','space_expense','information','apprentissage','{\"label\":\"Courses communes\"}','/partage/85afecf3-0025-47a6-babb-17e941f50449/depenses','421ce769-67f9-4f34-a2b6-c28ad5420baa',0,NULL,'2026-11-03 10:21:59.513'),
('cc1ff5c1-a040-4ebb-9a0f-f3e646bef1ef','52982f43-bd76-479c-bbe3-d527decd2c63','space_expense','information','apprentissage','{\"label\":\"Loyer de l’appartement\"}','/partage/85afecf3-0025-47a6-babb-17e941f50449/depenses','8d4a665a-7706-4be7-bc58-871bef18a416',0,NULL,'2026-11-03 10:21:55.440'),
('d182f596-8a36-4257-a500-ae6236f1c8f9','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','space_bill','action','echeance','{\"label\":\"loyer\",\"days\":0,\"date\":\"2026-11-04\"}','/partage/b467fabd-2be5-4deb-9ad7-d3cf76e09e3b/calendrier','170cfee8-56b0-4abe-8e8c-3b353142b577:0',0,NULL,'2026-11-04 14:47:28.123'),
('db7eaa3c-9ac3-4383-8267-9c48bd29be70','55ebe856-2adf-4aa6-9f70-43bf06ca29e0','space_expense','information','apprentissage','{\"label\":\"Loyer de l’appartement\"}','/partage/85afecf3-0025-47a6-babb-17e941f50449/depenses','6bcd5449-13ea-46b3-b777-a8c2926e5f82',0,NULL,'2026-11-03 10:21:57.286'),
('ddcaacdf-9f3b-4d1c-b5b5-eeede04727f4','9da929b7-d604-461b-ab52-84e2c5dcb02b','space_expense','information','apprentissage','{\"label\":\"Courses du mois\"}','/partage/54b4f2b8-a2d7-4514-85e0-f1cc548b6ba6/depenses','02323548-054d-4797-960c-19f348852d1b',0,NULL,'2026-11-03 10:22:04.012'),
('edb5cd01-2645-43c7-9035-6cce8f97af15','087b8449-6ea8-4478-9a2a-097b0a43fc72','emergency_fund','action','securite','{\"niveau\":\"critical\",\"mois\":0,\"cible\":3}','/app/objectifs/fonds-urgence','emergency-fund',0,NULL,'2026-11-04 15:45:13.119'),
('f112a2cb-8bff-4da4-8500-8a16abc93055','087b8449-6ea8-4478-9a2a-097b0a43fc72','space_member','information','apprentissage','{\"event\":\"joined\"}','/partage/54b4f2b8-a2d7-4514-85e0-f1cc548b6ba6/membres','fb4f230c-4ec4-4ee6-a816-baeaf3ecf3dc:joined:1793701322467',0,NULL,'2026-11-03 10:22:02.481'),
('f5e6b9c6-3555-41ea-8a40-4e2b5628112f','087b8449-6ea8-4478-9a2a-097b0a43fc72','space_member','information','apprentissage','{\"event\":\"joined\"}','/partage/85afecf3-0025-47a6-babb-17e941f50449/membres','207a9a1f-f57c-414c-9d5d-c907b874ab01:joined:1793701314740',0,NULL,'2026-11-03 10:21:54.748');
/*!40000 ALTER TABLE `fin_notifications` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_occurrences`
--

DROP TABLE IF EXISTS `fin_occurrences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_occurrences` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `recurrenceId` varchar(191) NOT NULL,
  `dueDate` datetime(3) NOT NULL,
  `outcome` varchar(12) NOT NULL,
  `postponedTo` datetime(3) DEFAULT NULL,
  `transactionId` varchar(191) DEFAULT NULL,
  `scope` varchar(20) NOT NULL DEFAULT 'personal',
  `source` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL,
  `confidence` varchar(10) DEFAULT NULL,
  `consentUses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`consentUses`)),
  `effectiveAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `collectedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `version` int(11) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fin_occurrences_recurrenceId_dueDate_key` (`recurrenceId`,`dueDate`),
  KEY `fin_occurrences_userId_idx` (`userId`),
  CONSTRAINT `fin_occurrences_recurrenceId_fkey` FOREIGN KEY (`recurrenceId`) REFERENCES `fin_recurrences` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_occurrences_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_occurrences_outcome_check` CHECK (`outcome` in ('confirmed','missed','postponed')),
  CONSTRAINT `fin_occurrences_scope_check` CHECK (`scope` in ('personal','couple','household','space')),
  CONSTRAINT `fin_occurrences_source_check` CHECK (`source` in ('manual','imported','document','partner','computed')),
  CONSTRAINT `fin_occurrences_status_check` CHECK (`status` in ('real','declared','imported','computed','official','to_confirm')),
  CONSTRAINT `fin_occurrences_version_check` CHECK (`version` >= 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_occurrences`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_occurrences` WRITE;
/*!40000 ALTER TABLE `fin_occurrences` DISABLE KEYS */;
INSERT INTO `fin_occurrences` VALUES
('329973ea-9cbc-4120-9430-55b2df418e3d','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','10bdcda8-cd8b-4df4-94d8-bd1139d2a8ef','2026-11-04 00:00:00.000','confirmed',NULL,'2696bf58-2565-45e1-b639-cedfbfdbd992','personal','manual','real',NULL,'[]','2026-11-04 13:05:51.521','2026-11-04 13:05:51.521',1,'2026-11-04 13:05:51.521','2026-11-04 13:05:51.521'),
('847ede71-d5b7-4667-a212-0a1ba132303e','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','c9939f7d-102c-45f3-b829-3d3d128c558d','2026-11-04 00:00:00.000','confirmed',NULL,'2d1bc25f-e555-4795-a2c5-b20c520fb60e','personal','manual','real',NULL,'[]','2026-11-05 07:36:48.876','2026-11-05 07:36:48.876',1,'2026-11-05 07:36:48.876','2026-11-05 07:36:48.876');
/*!40000 ALTER TABLE `fin_occurrences` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_onboardings`
--

DROP TABLE IF EXISTS `fin_onboardings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_onboardings` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `answers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`answers`)),
  `fictional` tinyint(1) NOT NULL DEFAULT 0,
  `completedAt` datetime(3) DEFAULT NULL,
  `scope` varchar(20) NOT NULL DEFAULT 'personal',
  `source` varchar(20) NOT NULL,
  `sourceRef` varchar(200) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `confidence` varchar(10) DEFAULT NULL,
  `consentUses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`consentUses`)),
  `effectiveAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `collectedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `version` int(11) NOT NULL DEFAULT 1,
  `archivedAt` datetime(3) DEFAULT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fin_onboardings_userId_key` (`userId`),
  CONSTRAINT `fin_onboardings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_onboardings_scope_check` CHECK (`scope` in ('personal','couple','household','space')),
  CONSTRAINT `fin_onboardings_source_check` CHECK (`source` in ('manual','imported','document','partner','computed')),
  CONSTRAINT `fin_onboardings_status_check` CHECK (`status` in ('real','declared','imported','computed','fictional','official','to_confirm')),
  CONSTRAINT `fin_onboardings_confidence_check` CHECK (`confidence` is null or `confidence` in ('high','medium','low')),
  CONSTRAINT `fin_onboardings_currency_check` CHECK (`currency` regexp '^[A-Z]{3}$'),
  CONSTRAINT `fin_onboardings_version_check` CHECK (`version` >= 1),
  CONSTRAINT `fin_onboardings_fictional_check` CHECK (`fictional` = 0 or `status` = 'fictional')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_onboardings`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_onboardings` WRITE;
/*!40000 ALTER TABLE `fin_onboardings` DISABLE KEYS */;
/*!40000 ALTER TABLE `fin_onboardings` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_paper_instruments`
--

DROP TABLE IF EXISTS `fin_paper_instruments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_paper_instruments` (
  `id` varchar(191) NOT NULL,
  `portfolioId` varchar(191) NOT NULL,
  `label` varchar(80) NOT NULL,
  `markPrice` double NOT NULL,
  `markedAt` datetime(3) NOT NULL,
  `note` varchar(300) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fin_paper_instruments_portfolioId_label_key` (`portfolioId`,`label`),
  CONSTRAINT `fin_paper_instruments_portfolioId_fkey` FOREIGN KEY (`portfolioId`) REFERENCES `fin_paper_portfolios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_paper_instruments_label_check` CHECK (trim(`label`) <> ''),
  CONSTRAINT `fin_paper_instruments_price_check` CHECK (`markPrice` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_paper_instruments`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_paper_instruments` WRITE;
/*!40000 ALTER TABLE `fin_paper_instruments` DISABLE KEYS */;
INSERT INTO `fin_paper_instruments` VALUES
('3bb9ff66-c383-413c-a2a4-afcad092df46','e55b6af1-a125-4f4d-95c6-498119216063','test 2',400000,'2026-11-05 00:00:00.000',NULL,'2026-11-05 08:11:27.962','2026-11-05 08:11:27.962'),
('3dce3ba4-c085-4e65-bdea-9a5a059b5c74','300e89b0-e441-418c-9516-229186925580','test',15000000,'2026-11-05 00:00:00.000',NULL,'2026-11-05 09:39:18.702','2026-11-05 09:39:18.702'),
('cf467946-5657-4f85-98df-193e4e715f96','e55b6af1-a125-4f4d-95c6-498119216063','test',400000,'2026-11-05 00:00:00.000',NULL,'2026-11-05 08:06:36.206','2026-11-05 08:06:36.206'),
('eda1a718-c4da-46cc-8bbc-9d9c720fb70f','ad520061-997c-416d-859d-ce65493db7bc','test',100000,'2026-10-17 00:00:00.000',NULL,'2026-10-17 08:22:25.234','2026-10-17 08:22:25.234');
/*!40000 ALTER TABLE `fin_paper_instruments` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_paper_portfolios`
--

DROP TABLE IF EXISTS `fin_paper_portfolios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_paper_portfolios` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `capital` double NOT NULL,
  `cash` double NOT NULL,
  `currency` varchar(3) NOT NULL,
  `feeRate` double NOT NULL DEFAULT 0.01,
  `resetAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `source` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL,
  `version` int(11) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fin_paper_portfolios_userId_key` (`userId`),
  CONSTRAINT `fin_paper_portfolios_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_paper_portfolios_status_check` CHECK (`status` = 'fictional'),
  CONSTRAINT `fin_paper_portfolios_source_check` CHECK (`source` in ('manual','imported','document','partner','computed')),
  CONSTRAINT `fin_paper_portfolios_currency_check` CHECK (`currency` regexp '^[A-Z]{3}$'),
  CONSTRAINT `fin_paper_portfolios_capital_check` CHECK (`capital` > 0),
  CONSTRAINT `fin_paper_portfolios_cash_check` CHECK (`cash` >= 0),
  CONSTRAINT `fin_paper_portfolios_fee_check` CHECK (`feeRate` >= 0 and `feeRate` <= 0.1),
  CONSTRAINT `fin_paper_portfolios_version_check` CHECK (`version` >= 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_paper_portfolios`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_paper_portfolios` WRITE;
/*!40000 ALTER TABLE `fin_paper_portfolios` DISABLE KEYS */;
INSERT INTO `fin_paper_portfolios` VALUES
('300e89b0-e441-418c-9516-229186925580','dd81c796-b6b8-49bd-a807-876c1c531d0b',10000000,10000000,'DZD',0.01,'2026-10-15 08:54:39.044','manual','fictional',1,'2026-10-15 08:54:39.044','2026-10-15 08:54:39.044'),
('690f87c7-afdf-4a29-8674-f84d0bd3d7f2','087b8449-6ea8-4478-9a2a-097b0a43fc72',10000000,10000000,'DZD',0.01,'2026-11-04 15:16:29.318','manual','fictional',1,'2026-11-04 15:16:29.318','2026-11-04 15:16:29.318'),
('ad520061-997c-416d-859d-ce65493db7bc','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d',10000000,10000000,'DZD',0.01,'2026-10-17 07:57:03.322','manual','fictional',1,'2026-10-17 07:57:03.322','2026-10-17 07:57:03.322'),
('e55b6af1-a125-4f4d-95c6-498119216063','030c2429-b6d4-4764-9ea9-9abb2b00ce4a',10000000,10000000,'DZD',0.01,'2026-11-04 13:56:15.358','manual','fictional',1,'2026-11-04 13:56:15.358','2026-11-04 13:56:15.358');
/*!40000 ALTER TABLE `fin_paper_portfolios` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_paper_trades`
--

DROP TABLE IF EXISTS `fin_paper_trades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_paper_trades` (
  `id` varchar(191) NOT NULL,
  `portfolioId` varchar(191) NOT NULL,
  `instrumentId` varchar(191) NOT NULL,
  `kind` varchar(10) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unitPrice` double NOT NULL,
  `fee` double NOT NULL,
  `currency` varchar(3) NOT NULL,
  `decidedAt` datetime(3) NOT NULL,
  `note` varchar(300) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `fin_paper_trades_portfolioId_decidedAt_idx` (`portfolioId`,`decidedAt`),
  KEY `fin_paper_trades_instrumentId_idx` (`instrumentId`),
  CONSTRAINT `fin_paper_trades_instrumentId_fkey` FOREIGN KEY (`instrumentId`) REFERENCES `fin_paper_instruments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_paper_trades_portfolioId_fkey` FOREIGN KEY (`portfolioId`) REFERENCES `fin_paper_portfolios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_paper_trades_status_check` CHECK (`status` = 'fictional'),
  CONSTRAINT `fin_paper_trades_kind_check` CHECK (`kind` in ('buy','sell')),
  CONSTRAINT `fin_paper_trades_currency_check` CHECK (`currency` regexp '^[A-Z]{3}$'),
  CONSTRAINT `fin_paper_trades_quantity_check` CHECK (`quantity` > 0),
  CONSTRAINT `fin_paper_trades_price_check` CHECK (`unitPrice` > 0),
  CONSTRAINT `fin_paper_trades_fee_check` CHECK (`fee` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_paper_trades`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_paper_trades` WRITE;
/*!40000 ALTER TABLE `fin_paper_trades` DISABLE KEYS */;
/*!40000 ALTER TABLE `fin_paper_trades` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_payslips`
--

DROP TABLE IF EXISTS `fin_payslips`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_payslips` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `period` varchar(20) DEFAULT NULL,
  `lines` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`lines`)),
  `gross` double NOT NULL,
  `value` double NOT NULL,
  `declaredNet` double DEFAULT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'DZD',
  `scope` varchar(20) NOT NULL DEFAULT 'personal',
  `source` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL,
  `confidence` varchar(10) DEFAULT NULL,
  `consentUses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '[]' CHECK (json_valid(`consentUses`)),
  `effectiveAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `collectedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `version` int(11) NOT NULL DEFAULT 1,
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fin_payslips_userId_deletedAt_idx` (`userId`,`deletedAt`),
  CONSTRAINT `fin_payslips_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_payslips`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_payslips` WRITE;
/*!40000 ALTER TABLE `fin_payslips` DISABLE KEYS */;
/*!40000 ALTER TABLE `fin_payslips` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_profile_transitions`
--

DROP TABLE IF EXISTS `fin_profile_transitions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_profile_transitions` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `fromPublic` varchar(191) DEFAULT NULL,
  `toPublic` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `fin_profile_transitions_userId_createdAt_idx` (`userId`,`createdAt`),
  CONSTRAINT `fin_profile_transitions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_profile_transitions_to_check` CHECK (`toPublic` in ('LYC','ETU','JAC','SAL','COL','COU','FAM','EPG'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_profile_transitions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_profile_transitions` WRITE;
/*!40000 ALTER TABLE `fin_profile_transitions` DISABLE KEYS */;
/*!40000 ALTER TABLE `fin_profile_transitions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_provisions`
--

DROP TABLE IF EXISTS `fin_provisions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_provisions` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `label` varchar(80) NOT NULL,
  `categoryId` varchar(191) DEFAULT NULL,
  `value` double NOT NULL,
  `currency` varchar(3) NOT NULL,
  `provisioned` double NOT NULL DEFAULT 0,
  `targetDate` datetime(3) NOT NULL,
  `reminderDays` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`reminderDays`)),
  `note` varchar(300) DEFAULT NULL,
  `scope` varchar(20) NOT NULL DEFAULT 'personal',
  `source` varchar(20) NOT NULL,
  `sourceRef` varchar(200) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `confidence` varchar(10) DEFAULT NULL,
  `consentUses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`consentUses`)),
  `effectiveAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `collectedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `version` int(11) NOT NULL DEFAULT 1,
  `archivedAt` datetime(3) DEFAULT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fin_provisions_userId_targetDate_idx` (`userId`,`targetDate`),
  KEY `fin_provisions_categoryId_idx` (`categoryId`),
  CONSTRAINT `fin_provisions_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `fin_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fin_provisions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_provisions_scope_check` CHECK (`scope` in ('personal','couple','household','space')),
  CONSTRAINT `fin_provisions_source_check` CHECK (`source` in ('manual','imported','document','partner','computed')),
  CONSTRAINT `fin_provisions_status_check` CHECK (`status` in ('real','declared','imported','computed','fictional','official','to_confirm')),
  CONSTRAINT `fin_provisions_confidence_check` CHECK (`confidence` is null or `confidence` in ('high','medium','low')),
  CONSTRAINT `fin_provisions_currency_check` CHECK (`currency` regexp '^[A-Z]{3}$'),
  CONSTRAINT `fin_provisions_version_check` CHECK (`version` >= 1),
  CONSTRAINT `fin_provisions_label_check` CHECK (trim(`label`) <> ''),
  CONSTRAINT `fin_provisions_value_check` CHECK (`value` > 0),
  CONSTRAINT `fin_provisions_provisioned_check` CHECK (`provisioned` >= 0 and `provisioned` <= `value`),
  CONSTRAINT `fin_provisions_reminders_check` CHECK (json_type(`reminderDays`) = 'ARRAY')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_provisions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_provisions` WRITE;
/*!40000 ALTER TABLE `fin_provisions` DISABLE KEYS */;
INSERT INTO `fin_provisions` VALUES
('a14a7738-aa74-4205-9580-2bf5d5086984','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','Casnos',NULL,2400000,'DZD',2400000,'2026-12-20 00:00:00.000','[7,1]',NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-05 07:51:31.349','2026-11-05 07:51:31.349',1,NULL,NULL,'2026-11-05 07:51:31.349','2026-11-05 07:51:31.349');
/*!40000 ALTER TABLE `fin_provisions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_push_subscriptions`
--

DROP TABLE IF EXISTS `fin_push_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_push_subscriptions` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `endpoint` varchar(700) NOT NULL,
  `p256dh` varchar(200) NOT NULL,
  `auth` varchar(100) NOT NULL,
  `label` varchar(80) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `lastSentAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fin_push_subscriptions_endpoint_key` (`endpoint`),
  KEY `fin_push_subscriptions_userId_idx` (`userId`),
  CONSTRAINT `fin_push_subscriptions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_push_subscriptions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_push_subscriptions` WRITE;
/*!40000 ALTER TABLE `fin_push_subscriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `fin_push_subscriptions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_recurrences`
--

DROP TABLE IF EXISTS `fin_recurrences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_recurrences` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `label` varchar(80) NOT NULL,
  `categoryId` varchar(191) DEFAULT NULL,
  `kind` varchar(10) NOT NULL,
  `value` double NOT NULL,
  `currency` varchar(3) NOT NULL,
  `frequency` varchar(20) NOT NULL,
  `nextDate` datetime(3) NOT NULL,
  `endDate` datetime(3) DEFAULT NULL,
  `reminderDays` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`reminderDays`)),
  `detected` tinyint(1) NOT NULL DEFAULT 0,
  `note` varchar(300) DEFAULT NULL,
  `scope` varchar(20) NOT NULL DEFAULT 'personal',
  `source` varchar(20) NOT NULL,
  `sourceRef` varchar(200) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `confidence` varchar(10) DEFAULT NULL,
  `consentUses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`consentUses`)),
  `effectiveAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `collectedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `version` int(11) NOT NULL DEFAULT 1,
  `archivedAt` datetime(3) DEFAULT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `accountId` varchar(191) DEFAULT NULL,
  `creationMode` varchar(12) NOT NULL DEFAULT 'confirm',
  `weekendRule` varchar(10) NOT NULL DEFAULT 'previous',
  PRIMARY KEY (`id`),
  KEY `fin_recurrences_userId_nextDate_idx` (`userId`,`nextDate`),
  KEY `fin_recurrences_categoryId_idx` (`categoryId`),
  KEY `fin_recurrences_accountId_fkey` (`accountId`),
  CONSTRAINT `fin_recurrences_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `fin_accounts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fin_recurrences_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `fin_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fin_recurrences_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_recurrences_scope_check` CHECK (`scope` in ('personal','couple','household','space')),
  CONSTRAINT `fin_recurrences_source_check` CHECK (`source` in ('manual','imported','document','partner','computed')),
  CONSTRAINT `fin_recurrences_status_check` CHECK (`status` in ('real','declared','imported','computed','fictional','official','to_confirm')),
  CONSTRAINT `fin_recurrences_confidence_check` CHECK (`confidence` is null or `confidence` in ('high','medium','low')),
  CONSTRAINT `fin_recurrences_currency_check` CHECK (`currency` regexp '^[A-Z]{3}$'),
  CONSTRAINT `fin_recurrences_kind_check` CHECK (`kind` in ('income','expense')),
  CONSTRAINT `fin_recurrences_frequency_check` CHECK (`frequency` in ('hebdomadaire','mensuel','trimestriel','semestriel','annuel')),
  CONSTRAINT `fin_recurrences_version_check` CHECK (`version` >= 1),
  CONSTRAINT `fin_recurrences_label_check` CHECK (trim(`label`) <> ''),
  CONSTRAINT `fin_recurrences_value_check` CHECK (`value` >= 0),
  CONSTRAINT `fin_recurrences_dates_check` CHECK (`endDate` is null or `endDate` >= `nextDate`),
  CONSTRAINT `fin_recurrences_reminders_check` CHECK (json_type(`reminderDays`) = 'ARRAY'),
  CONSTRAINT `fin_recurrences_creation_check` CHECK (`creationMode` in ('confirm','auto_real','planned')),
  CONSTRAINT `fin_recurrences_weekend_check` CHECK (`weekendRule` in ('previous','next','none'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_recurrences`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_recurrences` WRITE;
/*!40000 ALTER TABLE `fin_recurrences` DISABLE KEYS */;
INSERT INTO `fin_recurrences` VALUES
('10bdcda8-cd8b-4df4-94d8-bd1139d2a8ef','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','salaire','a47a98ca-6886-5db3-b468-5468da9a1e56','income',7000000,'DZD','mensuel','2026-11-04 00:00:00.000',NULL,'[7,1]',0,NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-04 10:41:38.531','2026-11-04 10:41:38.531',2,NULL,NULL,'2026-11-04 10:41:38.531','2026-11-04 13:06:37.938','6d90b22d-0ed9-4f3b-84dc-47a63b1a8a03','confirm','previous'),
('317045cf-f8c5-4c3a-b4db-968e908d1190','087b8449-6ea8-4478-9a2a-097b0a43fc72','Salaire',NULL,'income',8500000,'DZD','mensuel','2026-12-25 12:00:00.000',NULL,'[7,1]',0,NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-03 10:21:37.691','2026-11-03 10:21:37.691',1,NULL,NULL,'2026-11-03 10:21:37.691','2026-11-03 10:21:37.691',NULL,'confirm','previous'),
('c9939f7d-102c-45f3-b829-3d3d128c558d','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','abonnement claude',NULL,'expense',1200000,'DZD','mensuel','2026-11-04 00:00:00.000',NULL,'[7,0]',0,NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-11-04 13:52:48.499','2026-11-04 13:52:48.499',1,NULL,NULL,'2026-11-04 13:52:48.499','2026-11-04 13:52:48.499',NULL,'confirm','previous');
/*!40000 ALTER TABLE `fin_recurrences` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_settlements`
--

DROP TABLE IF EXISTS `fin_settlements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_settlements` (
  `id` varchar(191) NOT NULL,
  `spaceId` varchar(191) NOT NULL,
  `fromId` varchar(191) NOT NULL,
  `toId` varchar(191) NOT NULL,
  `value` double NOT NULL,
  `currency` varchar(3) NOT NULL,
  `settledAt` datetime(3) NOT NULL,
  `note` varchar(300) DEFAULT NULL,
  `recordedById` varchar(191) NOT NULL,
  `source` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `transferId` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fin_settlements_spaceId_settledAt_idx` (`spaceId`,`settledAt`),
  KEY `fin_settlements_fromId_idx` (`fromId`),
  KEY `fin_settlements_toId_idx` (`toId`),
  KEY `fin_settlements_recordedById_idx` (`recordedById`),
  CONSTRAINT `fin_settlements_fromId_fkey` FOREIGN KEY (`fromId`) REFERENCES `fin_space_members` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_settlements_recordedById_fkey` FOREIGN KEY (`recordedById`) REFERENCES `fin_space_members` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_settlements_spaceId_fkey` FOREIGN KEY (`spaceId`) REFERENCES `fin_spaces` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_settlements_toId_fkey` FOREIGN KEY (`toId`) REFERENCES `fin_space_members` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_settlements_source_check` CHECK (`source` in ('manual','imported','document','partner','computed')),
  CONSTRAINT `fin_settlements_status_check` CHECK (`status` in ('real','declared','imported','computed','fictional','official','to_confirm')),
  CONSTRAINT `fin_settlements_currency_check` CHECK (`currency` regexp '^[A-Z]{3}$'),
  CONSTRAINT `fin_settlements_value_check` CHECK (`value` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_settlements`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_settlements` WRITE;
/*!40000 ALTER TABLE `fin_settlements` DISABLE KEYS */;
/*!40000 ALTER TABLE `fin_settlements` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_shared_expenses`
--

DROP TABLE IF EXISTS `fin_shared_expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_shared_expenses` (
  `id` varchar(191) NOT NULL,
  `spaceId` varchar(191) NOT NULL,
  `payerId` varchar(191) NOT NULL,
  `label` varchar(80) NOT NULL,
  `value` double NOT NULL,
  `currency` varchar(3) NOT NULL,
  `occurredAt` datetime(3) NOT NULL,
  `splitMode` varchar(30) NOT NULL,
  `categoryId` varchar(191) DEFAULT NULL,
  `note` varchar(300) DEFAULT NULL,
  `recordedById` varchar(191) NOT NULL,
  `source` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL,
  `version` int(11) NOT NULL DEFAULT 1,
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `lifecycle` varchar(12) NOT NULL DEFAULT 'done',
  `cancelledAt` datetime(3) DEFAULT NULL,
  `usageUnit` varchar(30) DEFAULT NULL,
  `collectiveCategory` varchar(8) DEFAULT NULL,
  `personalTransactionId` varchar(191) DEFAULT NULL,
  `subCategory` varchar(40) DEFAULT NULL,
  `advanceTransferId` varchar(36) DEFAULT NULL,
  `advanceOriginalValue` double DEFAULT NULL,
  `personalCreated` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fin_shared_expenses_personalTransactionId_key` (`personalTransactionId`),
  KEY `fin_shared_expenses_spaceId_occurredAt_idx` (`spaceId`,`occurredAt`),
  KEY `fin_shared_expenses_payerId_idx` (`payerId`),
  KEY `fin_shared_expenses_categoryId_idx` (`categoryId`),
  KEY `fin_shared_expenses_recordedById_idx` (`recordedById`),
  CONSTRAINT `fin_shared_expenses_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `fin_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fin_shared_expenses_payerId_fkey` FOREIGN KEY (`payerId`) REFERENCES `fin_space_members` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_shared_expenses_personalTransactionId_fkey` FOREIGN KEY (`personalTransactionId`) REFERENCES `fin_transactions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fin_shared_expenses_recordedById_fkey` FOREIGN KEY (`recordedById`) REFERENCES `fin_space_members` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_shared_expenses_spaceId_fkey` FOREIGN KEY (`spaceId`) REFERENCES `fin_spaces` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_shared_expenses_source_check` CHECK (`source` in ('manual','imported','document','partner','computed')),
  CONSTRAINT `fin_shared_expenses_status_check` CHECK (`status` in ('real','declared','imported','computed','fictional','official','to_confirm')),
  CONSTRAINT `fin_shared_expenses_currency_check` CHECK (`currency` regexp '^[A-Z]{3}$'),
  CONSTRAINT `fin_shared_expenses_label_check` CHECK (trim(`label`) <> ''),
  CONSTRAINT `fin_shared_expenses_version_check` CHECK (`version` >= 1),
  CONSTRAINT `fin_shared_expenses_value_check` CHECK (`value` > 0),
  CONSTRAINT `fin_shared_expenses_split_check` CHECK (`splitMode` in ('equal','percent','amounts','income_proportional','weighted','usage')),
  CONSTRAINT `fin_shared_expenses_lifecycle_check` CHECK (`lifecycle` in ('done','planned','cancelled'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_shared_expenses`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_shared_expenses` WRITE;
/*!40000 ALTER TABLE `fin_shared_expenses` DISABLE KEYS */;
INSERT INTO `fin_shared_expenses` VALUES
('0197fe5c-8b02-4417-a286-a63aef07acb1','85afecf3-0025-47a6-babb-17e941f50449','9cc9b1e7-d226-48ce-8364-3020a2f91ac8','Courses communes',1200000,'DZD','2026-09-09 12:00:00.000','equal','e12c5b6f-fbdf-5c19-b286-93adcf97466d',NULL,'0a772d8c-5b3e-405f-a0aa-f1471dd7ecd1','manual','real',1,NULL,'2026-11-03 10:21:55.735','2026-11-03 10:21:55.735','done',NULL,NULL,'COLC-02',NULL,NULL,NULL,NULL,0),
('02323548-054d-4797-960c-19f348852d1b','54b4f2b8-a2d7-4514-85e0-f1cc548b6ba6','fb4f230c-4ec4-4ee6-a816-baeaf3ecf3dc','Courses du mois',1800000,'DZD','2026-10-05 12:00:00.000','equal','e12c5b6f-fbdf-5c19-b286-93adcf97466d',NULL,'81390fab-d75b-458b-bcd0-72694d15a6dd','manual','real',1,NULL,'2026-11-03 10:22:03.737','2026-11-03 10:22:03.737','done',NULL,NULL,'COLC-02',NULL,NULL,NULL,NULL,0),
('170cfee8-56b0-4abe-8e8c-3b353142b577','b467fabd-2be5-4deb-9ad7-d3cf76e09e3b','0394ee7a-df49-4c23-b7e0-8f082d11e0d1','loyer',3000000,'DZD','2026-11-04 00:00:00.000','equal','a0f8616f-e9ee-5fb7-a081-e61feaeaea80',NULL,'0394ee7a-df49-4c23-b7e0-8f082d11e0d1','manual','real',1,NULL,'2026-11-04 14:43:22.234','2026-11-04 14:43:22.234','planned',NULL,NULL,'COLC-01',NULL,NULL,NULL,NULL,0),
('2df5f429-1e1d-4a3e-95a4-5512bf34f1c0','71a33179-68ea-4391-96ec-7da90a76d362','d3ba34f0-c23a-451a-b3df-788926435db4','Restaurant au port',750000,'DZD','2026-11-01 12:00:00.000','equal','0a3cd861-c283-5a9b-9626-2a224feb4a7b',NULL,'4eeea235-d1f4-4cae-9a70-0ce441c1b017','manual','real',1,NULL,'2026-11-03 10:22:09.790','2026-11-03 10:22:09.790','done',NULL,NULL,'COLC-14',NULL,NULL,NULL,NULL,0),
('393b712e-1bc8-431c-b84c-04e43480225e','71a33179-68ea-4391-96ec-7da90a76d362','4eeea235-d1f4-4cae-9a70-0ce441c1b017','Location de la maison',4500000,'DZD','2026-11-01 12:00:00.000','equal','13a0020c-1f62-5ac1-a3e7-8630c99ced1e',NULL,'4eeea235-d1f4-4cae-9a70-0ce441c1b017','manual','real',1,NULL,'2026-11-03 10:22:08.624','2026-11-03 10:22:08.624','done',NULL,NULL,'COLC-15',NULL,NULL,NULL,NULL,0),
('421ce769-67f9-4f34-a2b6-c28ad5420baa','85afecf3-0025-47a6-babb-17e941f50449','9cc9b1e7-d226-48ce-8364-3020a2f91ac8','Courses communes',1200000,'DZD','2026-11-02 10:21:36.169','equal','e12c5b6f-fbdf-5c19-b286-93adcf97466d',NULL,'0a772d8c-5b3e-405f-a0aa-f1471dd7ecd1','manual','real',1,NULL,'2026-11-03 10:21:59.233','2026-11-03 10:21:59.233','done',NULL,NULL,'COLC-02',NULL,NULL,NULL,NULL,0),
('4b8da904-b15c-4d4a-871e-407f8988cfc9','54b4f2b8-a2d7-4514-85e0-f1cc548b6ba6','81390fab-d75b-458b-bcd0-72694d15a6dd','Sortie du week-end',500000,'DZD','2026-11-02 10:21:36.169','equal','0a3cd861-c283-5a9b-9626-2a224feb4a7b',NULL,'81390fab-d75b-458b-bcd0-72694d15a6dd','manual','real',1,NULL,'2026-11-03 10:22:05.146','2026-11-03 10:22:05.146','done',NULL,NULL,'COLC-14',NULL,NULL,NULL,NULL,0),
('61ec13d1-dfd7-4f0c-9583-394461688f36','71a33179-68ea-4391-96ec-7da90a76d362','0cd130cb-462f-4e4c-acb4-d08578ec5059','Essence',900000,'DZD','2026-11-01 12:00:00.000','equal','e01bc4eb-e1bc-5c62-b38f-c0eb2b559a97',NULL,'4eeea235-d1f4-4cae-9a70-0ce441c1b017','manual','real',1,NULL,'2026-11-03 10:22:09.200','2026-11-03 10:22:09.200','done',NULL,NULL,'COLC-09',NULL,NULL,NULL,NULL,0),
('6328495a-2f38-4385-974c-013964d1ab25','85afecf3-0025-47a6-babb-17e941f50449','9cc9b1e7-d226-48ce-8364-3020a2f91ac8','Courses communes',1200000,'DZD','2026-10-09 12:00:00.000','equal','e12c5b6f-fbdf-5c19-b286-93adcf97466d',NULL,'0a772d8c-5b3e-405f-a0aa-f1471dd7ecd1','manual','real',1,NULL,'2026-11-03 10:21:57.485','2026-11-03 10:21:57.485','done',NULL,NULL,'COLC-02',NULL,NULL,NULL,NULL,0),
('6bcd5449-13ea-46b3-b777-a8c2926e5f82','85afecf3-0025-47a6-babb-17e941f50449','0a772d8c-5b3e-405f-a0aa-f1471dd7ecd1','Loyer de l’appartement',6600000,'DZD','2026-10-02 12:00:00.000','equal','a0f8616f-e9ee-5fb7-a081-e61feaeaea80',NULL,'0a772d8c-5b3e-405f-a0aa-f1471dd7ecd1','manual','real',1,NULL,'2026-11-03 10:21:56.888','2026-11-03 10:21:56.888','done',NULL,NULL,'COLC-01',NULL,NULL,NULL,NULL,0),
('7462e558-93ee-49bb-b39c-2fa1c9df48d1','85afecf3-0025-47a6-babb-17e941f50449','207a9a1f-f57c-414c-9d5d-c907b874ab01','Internet',300000,'DZD','2026-11-02 10:21:36.169','equal','fb238194-33e8-5309-a0ad-e47aea414d2e',NULL,'0a772d8c-5b3e-405f-a0aa-f1471dd7ecd1','manual','real',1,NULL,'2026-11-03 10:21:59.815','2026-11-03 10:21:59.815','done',NULL,NULL,'COLC-06',NULL,NULL,NULL,NULL,0),
('88ddcc76-3a32-47dc-8964-b6ce8c02fa32','85afecf3-0025-47a6-babb-17e941f50449','0a772d8c-5b3e-405f-a0aa-f1471dd7ecd1','Loyer de l’appartement',6600000,'DZD','2026-11-02 12:00:00.000','equal','a0f8616f-e9ee-5fb7-a081-e61feaeaea80',NULL,'0a772d8c-5b3e-405f-a0aa-f1471dd7ecd1','manual','real',1,NULL,'2026-11-03 10:21:58.646','2026-11-03 10:21:58.646','done',NULL,NULL,'COLC-01',NULL,NULL,NULL,NULL,0),
('8d4a665a-7706-4be7-bc58-871bef18a416','85afecf3-0025-47a6-babb-17e941f50449','0a772d8c-5b3e-405f-a0aa-f1471dd7ecd1','Loyer de l’appartement',6600000,'DZD','2026-09-02 12:00:00.000','equal','a0f8616f-e9ee-5fb7-a081-e61feaeaea80',NULL,'0a772d8c-5b3e-405f-a0aa-f1471dd7ecd1','manual','real',1,NULL,'2026-11-03 10:21:55.161','2026-11-03 10:21:55.161','done',NULL,NULL,'COLC-01',NULL,NULL,NULL,NULL,0),
('9b01f564-bc82-4e71-acb7-a211515763b0','85afecf3-0025-47a6-babb-17e941f50449','207a9a1f-f57c-414c-9d5d-c907b874ab01','Internet',300000,'DZD','2026-09-10 12:00:00.000','equal','fb238194-33e8-5309-a0ad-e47aea414d2e',NULL,'0a772d8c-5b3e-405f-a0aa-f1471dd7ecd1','manual','real',1,NULL,'2026-11-03 10:21:56.324','2026-11-03 10:21:56.324','done',NULL,NULL,'COLC-06',NULL,NULL,NULL,NULL,0),
('a44cdfe5-8ddc-4129-8172-ff260fc62148','54b4f2b8-a2d7-4514-85e0-f1cc548b6ba6','fb4f230c-4ec4-4ee6-a816-baeaf3ecf3dc','Courses du mois',1800000,'DZD','2026-11-02 10:21:36.169','equal','e12c5b6f-fbdf-5c19-b286-93adcf97466d',NULL,'81390fab-d75b-458b-bcd0-72694d15a6dd','manual','real',1,NULL,'2026-11-03 10:22:04.678','2026-11-03 10:22:04.678','done',NULL,NULL,'COLC-02',NULL,NULL,NULL,NULL,0),
('c355a320-7a36-4b87-8d27-d46dd024cf94','54b4f2b8-a2d7-4514-85e0-f1cc548b6ba6','fb4f230c-4ec4-4ee6-a816-baeaf3ecf3dc','Courses du mois',1800000,'DZD','2026-09-05 12:00:00.000','equal','e12c5b6f-fbdf-5c19-b286-93adcf97466d',NULL,'81390fab-d75b-458b-bcd0-72694d15a6dd','manual','real',1,NULL,'2026-11-03 10:22:02.783','2026-11-03 10:22:02.783','done',NULL,NULL,'COLC-02',NULL,NULL,NULL,NULL,0),
('d455877b-a8ed-45bd-941a-551c941177d3','54b4f2b8-a2d7-4514-85e0-f1cc548b6ba6','81390fab-d75b-458b-bcd0-72694d15a6dd','Sortie du week-end',500000,'DZD','2026-10-16 12:00:00.000','equal','0a3cd861-c283-5a9b-9626-2a224feb4a7b',NULL,'81390fab-d75b-458b-bcd0-72694d15a6dd','manual','real',1,NULL,'2026-11-03 10:22:04.213','2026-11-03 10:22:04.213','done',NULL,NULL,'COLC-14',NULL,NULL,NULL,NULL,0),
('ebb299eb-f8f1-4df6-930c-b162e221c286','85afecf3-0025-47a6-babb-17e941f50449','207a9a1f-f57c-414c-9d5d-c907b874ab01','Internet',300000,'DZD','2026-10-10 12:00:00.000','equal','fb238194-33e8-5309-a0ad-e47aea414d2e',NULL,'0a772d8c-5b3e-405f-a0aa-f1471dd7ecd1','manual','real',1,NULL,'2026-11-03 10:21:58.065','2026-11-03 10:21:58.065','done',NULL,NULL,'COLC-06',NULL,NULL,NULL,NULL,0),
('ecf60b46-26ed-4143-9ab3-8432027cf2a3','11997080-485f-4694-b760-568ac6592a5f','a0d0dcce-227d-4aff-aee0-8a7ec57b6d7a','loyer',1800000,'DZD','2026-10-17 00:00:00.000','equal',NULL,NULL,'a0d0dcce-227d-4aff-aee0-8a7ec57b6d7a','manual','real',1,NULL,'2026-10-17 08:24:34.480','2026-10-17 08:24:34.480','done',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0),
('ffd000f5-69a7-4be6-a9ec-e1d896175fb4','54b4f2b8-a2d7-4514-85e0-f1cc548b6ba6','81390fab-d75b-458b-bcd0-72694d15a6dd','Sortie du week-end',500000,'DZD','2026-09-16 12:00:00.000','equal','0a3cd861-c283-5a9b-9626-2a224feb4a7b',NULL,'81390fab-d75b-458b-bcd0-72694d15a6dd','manual','real',1,NULL,'2026-11-03 10:22:03.268','2026-11-03 10:22:03.268','done',NULL,NULL,'COLC-14',NULL,NULL,NULL,NULL,0);
/*!40000 ALTER TABLE `fin_shared_expenses` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_shared_shares`
--

DROP TABLE IF EXISTS `fin_shared_shares`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_shared_shares` (
  `id` varchar(191) NOT NULL,
  `expenseId` varchar(191) NOT NULL,
  `memberId` varchar(191) NOT NULL,
  `share` double NOT NULL,
  `weight` double DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `fin_shared_shares_expenseId_memberId_key` (`expenseId`,`memberId`),
  KEY `fin_shared_shares_memberId_idx` (`memberId`),
  CONSTRAINT `fin_shared_shares_expenseId_fkey` FOREIGN KEY (`expenseId`) REFERENCES `fin_shared_expenses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_shared_shares_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `fin_space_members` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_shared_shares_share_check` CHECK (`share` >= 0),
  CONSTRAINT `fin_shared_shares_weight_check` CHECK (`weight` is null or `weight` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_shared_shares`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_shared_shares` WRITE;
/*!40000 ALTER TABLE `fin_shared_shares` DISABLE KEYS */;
INSERT INTO `fin_shared_shares` VALUES
('03dd46a1-dd81-40fd-8a2a-350a0e6755e4','d455877b-a8ed-45bd-941a-551c941177d3','fb4f230c-4ec4-4ee6-a816-baeaf3ecf3dc',250000,NULL,'2026-11-03 10:22:04.213'),
('0675fcdd-75be-4f89-97f8-f95e0d965295','393b712e-1bc8-431c-b84c-04e43480225e','d3ba34f0-c23a-451a-b3df-788926435db4',1500000,NULL,'2026-11-03 10:22:08.624'),
('115c1ad6-0d0d-47c8-a0e7-439d63def4d4','6328495a-2f38-4385-974c-013964d1ab25','9cc9b1e7-d226-48ce-8364-3020a2f91ac8',400000,NULL,'2026-11-03 10:21:57.485'),
('14c3f236-d5be-4fbf-8ec7-d3a9325e43b0','88ddcc76-3a32-47dc-8964-b6ce8c02fa32','207a9a1f-f57c-414c-9d5d-c907b874ab01',2200000,NULL,'2026-11-03 10:21:58.646'),
('1608b0bd-4b25-44ea-aec9-6e0c81085de3','421ce769-67f9-4f34-a2b6-c28ad5420baa','207a9a1f-f57c-414c-9d5d-c907b874ab01',400000,NULL,'2026-11-03 10:21:59.233'),
('1889e728-a0cc-4a05-9771-e2ff5d7af679','0197fe5c-8b02-4417-a286-a63aef07acb1','0a772d8c-5b3e-405f-a0aa-f1471dd7ecd1',400000,NULL,'2026-11-03 10:21:55.735'),
('1cb94880-e870-445e-be1b-71c117a64afd','7462e558-93ee-49bb-b39c-2fa1c9df48d1','0a772d8c-5b3e-405f-a0aa-f1471dd7ecd1',100000,NULL,'2026-11-03 10:21:59.815'),
('23012d70-7ab5-469b-9906-fc0110880834','a44cdfe5-8ddc-4129-8172-ff260fc62148','81390fab-d75b-458b-bcd0-72694d15a6dd',900000,NULL,'2026-11-03 10:22:04.678'),
('2b63c2fd-de8e-4362-b1f8-99148336baf6','8d4a665a-7706-4be7-bc58-871bef18a416','207a9a1f-f57c-414c-9d5d-c907b874ab01',2200000,NULL,'2026-11-03 10:21:55.161'),
('2d7d0cbe-8b67-436b-8e5e-ccfa0326e8a5','a44cdfe5-8ddc-4129-8172-ff260fc62148','fb4f230c-4ec4-4ee6-a816-baeaf3ecf3dc',900000,NULL,'2026-11-03 10:22:04.678'),
('2dc8cca0-8d8f-48d8-bb04-9cd33a4ef6ca','2df5f429-1e1d-4a3e-95a4-5512bf34f1c0','4eeea235-d1f4-4cae-9a70-0ce441c1b017',250000,NULL,'2026-11-03 10:22:09.790'),
('31597053-c635-4bbf-b846-16a186d900c2','ebb299eb-f8f1-4df6-930c-b162e221c286','9cc9b1e7-d226-48ce-8364-3020a2f91ac8',100000,NULL,'2026-11-03 10:21:58.065'),
('315e369f-d625-40a9-8ef2-eba95089d18b','6328495a-2f38-4385-974c-013964d1ab25','207a9a1f-f57c-414c-9d5d-c907b874ab01',400000,NULL,'2026-11-03 10:21:57.485'),
('44302f72-26e1-49aa-915e-e06559dc854f','ebb299eb-f8f1-4df6-930c-b162e221c286','207a9a1f-f57c-414c-9d5d-c907b874ab01',100000,NULL,'2026-11-03 10:21:58.065'),
('4b7a80d7-9508-495f-8b03-d60df091959d','170cfee8-56b0-4abe-8e8c-3b353142b577','0394ee7a-df49-4c23-b7e0-8f082d11e0d1',3000000,NULL,'2026-11-04 14:43:22.234'),
('57bf2d64-15c6-471f-acbb-f45f7dafff6d','9b01f564-bc82-4e71-acb7-a211515763b0','9cc9b1e7-d226-48ce-8364-3020a2f91ac8',100000,NULL,'2026-11-03 10:21:56.324'),
('5d29eaff-f363-4fb7-b794-96b58df43357','61ec13d1-dfd7-4f0c-9583-394461688f36','0cd130cb-462f-4e4c-acb4-d08578ec5059',300000,NULL,'2026-11-03 10:22:09.200'),
('6ea9853b-893f-4e98-a205-9840103e1793','6bcd5449-13ea-46b3-b777-a8c2926e5f82','207a9a1f-f57c-414c-9d5d-c907b874ab01',2200000,NULL,'2026-11-03 10:21:56.888'),
('6eec696a-9983-4f6b-8693-0a40c8b58aa5','ffd000f5-69a7-4be6-a9ec-e1d896175fb4','81390fab-d75b-458b-bcd0-72694d15a6dd',250000,NULL,'2026-11-03 10:22:03.268'),
('7022869b-784f-41d6-b936-e9df3174fcc7','61ec13d1-dfd7-4f0c-9583-394461688f36','4eeea235-d1f4-4cae-9a70-0ce441c1b017',300000,NULL,'2026-11-03 10:22:09.200'),
('70369118-7b6d-4ee1-9d6c-d5c6217a2fa2','393b712e-1bc8-431c-b84c-04e43480225e','4eeea235-d1f4-4cae-9a70-0ce441c1b017',1500000,NULL,'2026-11-03 10:22:08.624'),
('7168a06a-4372-495a-b7d5-df934e347057','4b8da904-b15c-4d4a-871e-407f8988cfc9','fb4f230c-4ec4-4ee6-a816-baeaf3ecf3dc',250000,NULL,'2026-11-03 10:22:05.146'),
('7655a6d9-1df6-42b2-bd0d-803e6f01a1a5','88ddcc76-3a32-47dc-8964-b6ce8c02fa32','0a772d8c-5b3e-405f-a0aa-f1471dd7ecd1',2200000,NULL,'2026-11-03 10:21:58.646'),
('766cba83-d76a-457e-9201-2efa7a054726','02323548-054d-4797-960c-19f348852d1b','fb4f230c-4ec4-4ee6-a816-baeaf3ecf3dc',900000,NULL,'2026-11-03 10:22:03.737'),
('7730c9a1-095b-4a1a-a252-1a77b03fddbc','61ec13d1-dfd7-4f0c-9583-394461688f36','d3ba34f0-c23a-451a-b3df-788926435db4',300000,NULL,'2026-11-03 10:22:09.200'),
('81181b6e-de70-406f-9697-e62df7afadd6','88ddcc76-3a32-47dc-8964-b6ce8c02fa32','9cc9b1e7-d226-48ce-8364-3020a2f91ac8',2200000,NULL,'2026-11-03 10:21:58.646'),
('8bb7e541-76c9-4730-8bba-0eeb3baf30b6','6bcd5449-13ea-46b3-b777-a8c2926e5f82','0a772d8c-5b3e-405f-a0aa-f1471dd7ecd1',2200000,NULL,'2026-11-03 10:21:56.888'),
('91e3c835-f222-4f51-b5cc-e46eba719a5a','8d4a665a-7706-4be7-bc58-871bef18a416','9cc9b1e7-d226-48ce-8364-3020a2f91ac8',2200000,NULL,'2026-11-03 10:21:55.161'),
('9268559d-ec32-45d7-a880-754f9bb1d54a','6bcd5449-13ea-46b3-b777-a8c2926e5f82','9cc9b1e7-d226-48ce-8364-3020a2f91ac8',2200000,NULL,'2026-11-03 10:21:56.888'),
('963ba689-d383-4531-9cc5-cf70c7be3ad7','9b01f564-bc82-4e71-acb7-a211515763b0','0a772d8c-5b3e-405f-a0aa-f1471dd7ecd1',100000,NULL,'2026-11-03 10:21:56.324'),
('9e6d517b-d784-4321-a599-9c0a2e5e7fce','02323548-054d-4797-960c-19f348852d1b','81390fab-d75b-458b-bcd0-72694d15a6dd',900000,NULL,'2026-11-03 10:22:03.737'),
('ab037593-351a-4e41-836e-630756f9b76f','d455877b-a8ed-45bd-941a-551c941177d3','81390fab-d75b-458b-bcd0-72694d15a6dd',250000,NULL,'2026-11-03 10:22:04.213'),
('af4d0515-1218-4289-817c-54e3542dbe4e','421ce769-67f9-4f34-a2b6-c28ad5420baa','0a772d8c-5b3e-405f-a0aa-f1471dd7ecd1',400000,NULL,'2026-11-03 10:21:59.233'),
('ba04ee7b-3f64-43c9-9fc7-652ebd222322','7462e558-93ee-49bb-b39c-2fa1c9df48d1','207a9a1f-f57c-414c-9d5d-c907b874ab01',100000,NULL,'2026-11-03 10:21:59.815'),
('bbc57c01-c970-42c8-9e9d-589327abcdd8','7462e558-93ee-49bb-b39c-2fa1c9df48d1','9cc9b1e7-d226-48ce-8364-3020a2f91ac8',100000,NULL,'2026-11-03 10:21:59.815'),
('bbd82ba5-e1b2-49bb-95eb-664f54c09bcb','ebb299eb-f8f1-4df6-930c-b162e221c286','0a772d8c-5b3e-405f-a0aa-f1471dd7ecd1',100000,NULL,'2026-11-03 10:21:58.065'),
('c9e529b5-dc46-48a2-b9f2-4a15e959e7c4','9b01f564-bc82-4e71-acb7-a211515763b0','207a9a1f-f57c-414c-9d5d-c907b874ab01',100000,NULL,'2026-11-03 10:21:56.324'),
('cd6762c6-a976-4fad-a248-7f2108ee541f','c355a320-7a36-4b87-8d27-d46dd024cf94','81390fab-d75b-458b-bcd0-72694d15a6dd',900000,NULL,'2026-11-03 10:22:02.783'),
('d5b4ffe3-1466-4c74-86fd-61ee58825abf','ecf60b46-26ed-4143-9ab3-8432027cf2a3','a0d0dcce-227d-4aff-aee0-8a7ec57b6d7a',1800000,NULL,'2026-10-17 08:24:34.480'),
('d67b1cc2-2d28-422d-ab8c-f00c424773a3','ffd000f5-69a7-4be6-a9ec-e1d896175fb4','fb4f230c-4ec4-4ee6-a816-baeaf3ecf3dc',250000,NULL,'2026-11-03 10:22:03.268'),
('da0904ee-0992-4c37-b38d-d8eb4321ab73','c355a320-7a36-4b87-8d27-d46dd024cf94','fb4f230c-4ec4-4ee6-a816-baeaf3ecf3dc',900000,NULL,'2026-11-03 10:22:02.783'),
('da4125f6-0f8a-4d68-bf0c-5ffe9e8c76ad','2df5f429-1e1d-4a3e-95a4-5512bf34f1c0','d3ba34f0-c23a-451a-b3df-788926435db4',250000,NULL,'2026-11-03 10:22:09.790'),
('e3d092f4-81fe-499f-a021-1ff8b263b51c','393b712e-1bc8-431c-b84c-04e43480225e','0cd130cb-462f-4e4c-acb4-d08578ec5059',1500000,NULL,'2026-11-03 10:22:08.624'),
('e509130f-532f-43af-855f-fe1a9a1035df','8d4a665a-7706-4be7-bc58-871bef18a416','0a772d8c-5b3e-405f-a0aa-f1471dd7ecd1',2200000,NULL,'2026-11-03 10:21:55.161'),
('ebc9dfa0-acfc-4762-a939-fefb4d2f58d4','2df5f429-1e1d-4a3e-95a4-5512bf34f1c0','0cd130cb-462f-4e4c-acb4-d08578ec5059',250000,NULL,'2026-11-03 10:22:09.790'),
('f0b9308a-7335-4820-92a6-630b3669f8f7','0197fe5c-8b02-4417-a286-a63aef07acb1','207a9a1f-f57c-414c-9d5d-c907b874ab01',400000,NULL,'2026-11-03 10:21:55.735'),
('f24c3696-9664-474f-b13d-b631e88e88ea','0197fe5c-8b02-4417-a286-a63aef07acb1','9cc9b1e7-d226-48ce-8364-3020a2f91ac8',400000,NULL,'2026-11-03 10:21:55.735'),
('f7904a8b-c983-4401-ae60-3eba63454495','421ce769-67f9-4f34-a2b6-c28ad5420baa','9cc9b1e7-d226-48ce-8364-3020a2f91ac8',400000,NULL,'2026-11-03 10:21:59.233'),
('f79d461a-060e-4809-bf0b-804c7bb80dd3','6328495a-2f38-4385-974c-013964d1ab25','0a772d8c-5b3e-405f-a0aa-f1471dd7ecd1',400000,NULL,'2026-11-03 10:21:57.485'),
('ff6c3491-eb0a-48e3-bd2d-4a27dbcec817','4b8da904-b15c-4d4a-871e-407f8988cfc9','81390fab-d75b-458b-bcd0-72694d15a6dd',250000,NULL,'2026-11-03 10:22:05.146');
/*!40000 ALTER TABLE `fin_shared_shares` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_snapshots`
--

DROP TABLE IF EXISTS `fin_snapshots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_snapshots` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `kind` varchar(10) NOT NULL,
  `period` varchar(7) NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`payload`)),
  `version` int(11) NOT NULL DEFAULT 1,
  `capturedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `fin_snapshots_userId_kind_period_key` (`userId`,`kind`,`period`),
  CONSTRAINT `fin_snapshots_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_snapshots_kind_check` CHECK (`kind` in ('report','health')),
  CONSTRAINT `fin_snapshots_period_check` CHECK (`period` regexp '^[0-9]{4}-(0[1-9]|1[0-2])$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_snapshots`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_snapshots` WRITE;
/*!40000 ALTER TABLE `fin_snapshots` DISABLE KEYS */;
INSERT INTO `fin_snapshots` VALUES
('0f48515f-b468-4be9-b97d-6c0471d07644','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','health','2026-11','{\"valeur\":66,\"bande\":\"Stable\",\"partiel\":true,\"version\":\"B-9\",\"dimensions\":[{\"key\":\"balance\",\"score\":100},{\"key\":\"reserve\",\"score\":null},{\"key\":\"debt\",\"score\":100},{\"key\":\"savings\",\"score\":0},{\"key\":\"goals\",\"score\":0},{\"key\":\"budgets\",\"score\":96},{\"key\":\"dataQuality\",\"score\":56}]}',259,'2026-11-05 08:25:04.194'),
('605956ca-8eb8-4a5e-a099-6fb7d34b81fa','0c56432a-ba94-44ac-bacf-8309ab92a755','health','2026-11','{\"valeur\":0,\"bande\":\"Priorité sécurité\",\"partiel\":true,\"version\":\"B-9\",\"dimensions\":[{\"key\":\"balance\",\"score\":null},{\"key\":\"reserve\",\"score\":null},{\"key\":\"debt\",\"score\":null},{\"key\":\"savings\",\"score\":null},{\"key\":\"goals\",\"score\":null},{\"key\":\"budgets\",\"score\":null},{\"key\":\"dataQuality\",\"score\":0}]}',4,'2026-11-05 09:08:55.437'),
('6d24146b-da10-4357-8bf1-c6af7171753c','dd81c796-b6b8-49bd-a807-876c1c531d0b','health','2026-11','{\"valeur\":43,\"bande\":\"À consolider\",\"partiel\":true,\"version\":\"B-9\",\"dimensions\":[{\"key\":\"balance\",\"score\":null},{\"key\":\"reserve\",\"score\":null},{\"key\":\"debt\",\"score\":null},{\"key\":\"savings\",\"score\":null},{\"key\":\"goals\",\"score\":null},{\"key\":\"budgets\",\"score\":null},{\"key\":\"dataQuality\",\"score\":43}]}',72,'2026-11-05 11:33:26.893'),
('8d03a24a-00e5-47aa-ab68-10f4777d832f','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','health','2026-11','{\"valeur\":7,\"bande\":\"Priorité sécurité\",\"partiel\":true,\"version\":\"B-9\",\"dimensions\":[{\"key\":\"balance\",\"score\":null},{\"key\":\"reserve\",\"score\":null},{\"key\":\"debt\",\"score\":null},{\"key\":\"savings\",\"score\":null},{\"key\":\"goals\",\"score\":0},{\"key\":\"budgets\",\"score\":null},{\"key\":\"dataQuality\",\"score\":21}]}',23,'2026-11-05 07:35:49.238'),
('a6c1d97e-6cf9-474a-bab0-1fdbd1261260','087b8449-6ea8-4478-9a2a-097b0a43fc72','health','2026-11','{\"valeur\":44,\"bande\":\"À consolider\",\"partiel\":true,\"version\":\"B-9\",\"dimensions\":[{\"key\":\"balance\",\"score\":null},{\"key\":\"reserve\",\"score\":0},{\"key\":\"debt\",\"score\":100},{\"key\":\"savings\",\"score\":null},{\"key\":\"goals\",\"score\":0},{\"key\":\"budgets\",\"score\":100},{\"key\":\"dataQuality\",\"score\":30}]}',263,'2026-11-05 10:53:44.046');
/*!40000 ALTER TABLE `fin_snapshots` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_space_budgets`
--

DROP TABLE IF EXISTS `fin_space_budgets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_space_budgets` (
  `id` varchar(191) NOT NULL,
  `spaceId` varchar(191) NOT NULL,
  `category` varchar(8) NOT NULL,
  `period` varchar(7) NOT NULL,
  `value` double NOT NULL,
  `setById` varchar(191) NOT NULL,
  `version` int(11) NOT NULL DEFAULT 1,
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fin_space_budgets_spaceId_category_period_key` (`spaceId`,`category`,`period`),
  KEY `fin_space_budgets_spaceId_period_idx` (`spaceId`,`period`),
  CONSTRAINT `fin_space_budgets_spaceId_fkey` FOREIGN KEY (`spaceId`) REFERENCES `fin_spaces` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_space_budgets_value_check` CHECK (`value` >= 0),
  CONSTRAINT `fin_space_budgets_period_check` CHECK (`period` regexp '^[0-9]{4}-(0[1-9]|1[0-2])$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_space_budgets`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_space_budgets` WRITE;
/*!40000 ALTER TABLE `fin_space_budgets` DISABLE KEYS */;
INSERT INTO `fin_space_budgets` VALUES
('37104f80-9dca-47a5-a087-4b34858f92c2','6228a31c-9d5c-40ba-b4c5-c8435a6de635','COLC-02','2026-11',1500000,'0965979f-3b3e-4bee-862b-e0a9d89166c4',1,NULL,'2026-11-02 12:26:46.518','2026-11-02 12:26:46.518'),
('3d58fb23-8717-4176-ad58-e9f5d1ee262f','3b4a5ef2-af52-48b0-932c-14f414786c5d','COLC-02','2026-11',1500000,'8987c2c3-acfc-4c80-b339-f2e5ad8a6067',1,NULL,'2026-11-02 12:26:00.357','2026-11-02 12:26:00.357'),
('8846e981-5ec0-4a1a-a5a7-d3ca286ad8ab','b467fabd-2be5-4deb-9ad7-d3cf76e09e3b','COLC-02','2026-11',2000000,'0394ee7a-df49-4c23-b7e0-8f082d11e0d1',1,NULL,'2026-11-04 14:45:21.031','2026-11-04 14:45:21.031'),
('f1ad67c0-e2c1-41ea-ac6c-0c2a29568621','85afecf3-0025-47a6-babb-17e941f50449','COLC-02','2026-11',1500000,'0a772d8c-5b3e-405f-a0aa-f1471dd7ecd1',1,NULL,'2026-11-03 10:22:00.396','2026-11-03 10:22:00.396');
/*!40000 ALTER TABLE `fin_space_budgets` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_space_goal_contributions`
--

DROP TABLE IF EXISTS `fin_space_goal_contributions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_space_goal_contributions` (
  `id` varchar(191) NOT NULL,
  `spaceGoalId` varchar(191) NOT NULL,
  `memberId` varchar(191) NOT NULL,
  `amount` double NOT NULL,
  `currency` varchar(3) NOT NULL,
  `contributedAt` datetime(3) NOT NULL,
  `note` varchar(300) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `deletedAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fin_space_goal_contributions_spaceGoalId_idx` (`spaceGoalId`),
  KEY `fin_space_goal_contributions_memberId_idx` (`memberId`),
  CONSTRAINT `fin_space_goal_contributions_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `fin_space_members` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_space_goal_contributions_spaceGoalId_fkey` FOREIGN KEY (`spaceGoalId`) REFERENCES `fin_space_goals` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_space_goal_contributions_currency_check` CHECK (`currency` regexp '^[A-Z]{3}$'),
  CONSTRAINT `fin_space_goal_contributions_amount_check` CHECK (`amount` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_space_goal_contributions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_space_goal_contributions` WRITE;
/*!40000 ALTER TABLE `fin_space_goal_contributions` DISABLE KEYS */;
INSERT INTO `fin_space_goal_contributions` VALUES
('13b1b59f-d4d2-4c55-acd5-c4c4b5b5f11c','f93742b2-ecea-4d76-927a-ceec86b00be0','0394ee7a-df49-4c23-b7e0-8f082d11e0d1',2000000,'DZD','2026-11-04 14:51:44.245',NULL,'2026-11-04 14:51:44.453',NULL),
('1ded335d-b5b8-4465-afe9-da3ed8a0fa44','08ab522c-8421-4102-8aa1-fb60fe969ea8','a0d0dcce-227d-4aff-aee0-8a7ec57b6d7a',12000000,'DZD','2026-10-17 08:24:58.481',NULL,'2026-10-17 08:24:58.570',NULL),
('2cf55b02-d987-4627-98de-1f6c4d828232','24d4b1b8-2724-432b-abc7-343701338de2','fb4f230c-4ec4-4ee6-a816-baeaf3ecf3dc',3500000,'DZD','2026-10-28 12:00:00.000',NULL,'2026-11-03 10:22:06.272',NULL),
('6fc79011-e39d-4ba4-81a1-15ec8030932f','24d4b1b8-2724-432b-abc7-343701338de2','81390fab-d75b-458b-bcd0-72694d15a6dd',4000000,'DZD','2026-10-28 12:00:00.000',NULL,'2026-11-03 10:22:05.969',NULL);
/*!40000 ALTER TABLE `fin_space_goal_contributions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_space_goal_shares`
--

DROP TABLE IF EXISTS `fin_space_goal_shares`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_space_goal_shares` (
  `id` varchar(191) NOT NULL,
  `spaceGoalId` varchar(191) NOT NULL,
  `memberId` varchar(191) NOT NULL,
  `amount` double NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fin_space_goal_shares_spaceGoalId_memberId_key` (`spaceGoalId`,`memberId`),
  KEY `fin_space_goal_shares_memberId_idx` (`memberId`),
  CONSTRAINT `fin_space_goal_shares_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `fin_space_members` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_space_goal_shares_spaceGoalId_fkey` FOREIGN KEY (`spaceGoalId`) REFERENCES `fin_space_goals` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_space_goal_shares`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_space_goal_shares` WRITE;
/*!40000 ALTER TABLE `fin_space_goal_shares` DISABLE KEYS */;
INSERT INTO `fin_space_goal_shares` VALUES
('15e58264-2236-472f-8c25-58473770f0b5','f93742b2-ecea-4d76-927a-ceec86b00be0','0394ee7a-df49-4c23-b7e0-8f082d11e0d1',1000000);
/*!40000 ALTER TABLE `fin_space_goal_shares` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_space_goals`
--

DROP TABLE IF EXISTS `fin_space_goals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_space_goals` (
  `id` varchar(191) NOT NULL,
  `spaceId` varchar(191) NOT NULL,
  `label` varchar(80) NOT NULL,
  `target` double NOT NULL,
  `currency` varchar(3) NOT NULL,
  `targetDate` datetime(3) DEFAULT NULL,
  `note` varchar(300) DEFAULT NULL,
  `version` int(11) NOT NULL DEFAULT 1,
  `archivedAt` datetime(3) DEFAULT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `contributionEveryMonths` int(11) DEFAULT NULL,
  `firstDueAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fin_space_goals_spaceId_deletedAt_idx` (`spaceId`,`deletedAt`),
  CONSTRAINT `fin_space_goals_spaceId_fkey` FOREIGN KEY (`spaceId`) REFERENCES `fin_spaces` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_space_goals_currency_check` CHECK (`currency` regexp '^[A-Z]{3}$'),
  CONSTRAINT `fin_space_goals_label_check` CHECK (trim(`label`) <> ''),
  CONSTRAINT `fin_space_goals_version_check` CHECK (`version` >= 1),
  CONSTRAINT `fin_space_goals_target_check` CHECK (`target` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_space_goals`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_space_goals` WRITE;
/*!40000 ALTER TABLE `fin_space_goals` DISABLE KEYS */;
INSERT INTO `fin_space_goals` VALUES
('08ab522c-8421-4102-8aa1-fb60fe969ea8','11997080-485f-4694-b760-568ac6592a5f','epargne',100000000,'DZD','2030-10-10 00:00:00.000',NULL,1,NULL,NULL,'2026-10-17 08:24:51.306','2026-10-17 08:24:51.306',NULL,NULL),
('24d4b1b8-2724-432b-abc7-343701338de2','54b4f2b8-a2d7-4514-85e0-f1cc548b6ba6','Mariage',80000000,'DZD','2027-12-08 10:21:36.169',NULL,1,NULL,NULL,'2026-11-03 10:22:05.645','2026-11-03 10:22:05.645',NULL,NULL),
('45f1f09c-df39-4f1b-bd9d-4df0fee698f9','efeea052-fd03-4252-8732-0e56db3443dd','Mariage',80000000,'DZD','2027-12-07 12:25:37.340',NULL,1,NULL,NULL,'2026-11-02 12:26:05.632','2026-11-02 12:26:05.632',NULL,NULL),
('779ff9f4-3b41-45fc-8a87-db05b9df59dc','f8ef2a94-48be-4441-b978-745e1c55ff6c','Mariage',80000000,'DZD','2027-12-07 12:26:22.521',NULL,1,NULL,NULL,'2026-11-02 12:26:51.791','2026-11-02 12:26:51.791',NULL,NULL),
('f93742b2-ecea-4d76-927a-ceec86b00be0','b467fabd-2be5-4deb-9ad7-d3cf76e09e3b','trouvez mieux',5000000,'DZD','2027-06-01 00:00:00.000',NULL,2,NULL,NULL,'2026-11-04 14:51:37.223','2026-11-04 14:52:10.687',1,'2026-12-01 00:00:00.000');
/*!40000 ALTER TABLE `fin_space_goals` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_space_inflows`
--

DROP TABLE IF EXISTS `fin_space_inflows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_space_inflows` (
  `id` varchar(191) NOT NULL,
  `spaceId` varchar(191) NOT NULL,
  `kind` varchar(12) NOT NULL,
  `memberId` varchar(191) DEFAULT NULL,
  `value` double NOT NULL,
  `occurredAt` datetime(3) NOT NULL,
  `status` varchar(10) NOT NULL DEFAULT 'confirmed',
  `note` varchar(300) DEFAULT NULL,
  `recordedById` varchar(191) NOT NULL,
  `version` int(11) NOT NULL DEFAULT 1,
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fin_space_inflows_spaceId_status_idx` (`spaceId`,`status`),
  CONSTRAINT `fin_space_inflows_spaceId_fkey` FOREIGN KEY (`spaceId`) REFERENCES `fin_spaces` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_space_inflows_value_check` CHECK (`value` > 0),
  CONSTRAINT `fin_space_inflows_kind_check` CHECK (`kind` in ('opening','contribution','other')),
  CONSTRAINT `fin_space_inflows_status_check` CHECK (`status` in ('planned','confirmed'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_space_inflows`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_space_inflows` WRITE;
/*!40000 ALTER TABLE `fin_space_inflows` DISABLE KEYS */;
INSERT INTO `fin_space_inflows` VALUES
('7f48730d-bad9-448a-a9dd-b3b1b70130ac','b467fabd-2be5-4deb-9ad7-d3cf76e09e3b','other',NULL,1000000,'2026-11-04 00:00:00.000','planned',NULL,'0394ee7a-df49-4c23-b7e0-8f082d11e0d1',1,NULL,'2026-11-04 14:46:42.482','2026-11-04 14:46:42.482'),
('b4a560ba-1076-44f3-ae0e-8d3d63939250','b467fabd-2be5-4deb-9ad7-d3cf76e09e3b','contribution','0394ee7a-df49-4c23-b7e0-8f082d11e0d1',6000000,'2026-11-04 00:00:00.000','confirmed',NULL,'0394ee7a-df49-4c23-b7e0-8f082d11e0d1',1,NULL,'2026-11-04 14:45:37.465','2026-11-04 14:45:37.465');
/*!40000 ALTER TABLE `fin_space_inflows` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_space_invites`
--

DROP TABLE IF EXISTS `fin_space_invites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_space_invites` (
  `id` varchar(191) NOT NULL,
  `spaceId` varchar(191) NOT NULL,
  `invitedById` varchar(191) NOT NULL,
  `tokenHash` varchar(64) NOT NULL,
  `role` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `expiresAt` datetime(3) NOT NULL,
  `acceptedAt` datetime(3) DEFAULT NULL,
  `acceptedById` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `fin_space_invites_tokenHash_key` (`tokenHash`),
  KEY `fin_space_invites_spaceId_status_idx` (`spaceId`,`status`),
  KEY `fin_space_invites_invitedById_fkey` (`invitedById`),
  KEY `fin_space_invites_acceptedById_fkey` (`acceptedById`),
  CONSTRAINT `fin_space_invites_acceptedById_fkey` FOREIGN KEY (`acceptedById`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fin_space_invites_invitedById_fkey` FOREIGN KEY (`invitedById`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_space_invites_spaceId_fkey` FOREIGN KEY (`spaceId`) REFERENCES `fin_spaces` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_space_invites_role_check` CHECK (`role` in ('admin','member','viewer')),
  CONSTRAINT `fin_space_invites_status_check` CHECK (`status` in ('pending','accepted','revoked','expired')),
  CONSTRAINT `fin_space_invites_accepted_check` CHECK (`status` = 'accepted' and `acceptedAt` is not null or `status` <> 'accepted' and `acceptedAt` is null)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_space_invites`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_space_invites` WRITE;
/*!40000 ALTER TABLE `fin_space_invites` DISABLE KEYS */;
INSERT INTO `fin_space_invites` VALUES
('050cb7f0-ded8-4612-a108-6ea39d0c26a7','85afecf3-0025-47a6-babb-17e941f50449','087b8449-6ea8-4478-9a2a-097b0a43fc72','867623057c31b805a19bf603e59b42b3c8f83ae30af5e0bec3bdab879a477509','member','accepted','2026-11-17 10:21:54.207','2026-11-03 10:21:54.476','52982f43-bd76-479c-bbe3-d527decd2c63','2026-11-03 10:21:54.213'),
('32427289-088b-458d-97dc-976dc54bc508','b467fabd-2be5-4deb-9ad7-d3cf76e09e3b','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','b36dae600a0d2e33a34f217953b9eac4bd4eb199b456a60191a5dc04b143cea9','member','accepted','2026-11-18 14:53:15.883','2026-11-04 14:53:46.864','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','2026-11-04 14:53:15.885'),
('409f4345-a3d1-4a89-bd93-73c6b7ee257c','85afecf3-0025-47a6-babb-17e941f50449','087b8449-6ea8-4478-9a2a-097b0a43fc72','669a0aaf0578858ddeddbb2984526ab755c30376080aa5939c9f332d21c9341e','member','accepted','2026-11-17 10:21:53.452','2026-11-03 10:21:53.710','55ebe856-2adf-4aa6-9f70-43bf06ca29e0','2026-11-03 10:21:53.455'),
('625bd04e-c928-4768-917a-c613f663bcf5','71a33179-68ea-4391-96ec-7da90a76d362','08fb6c4e-5b4c-42a5-b499-2ea486544b98','cd42f06035237ab18db4cbb207f290243c32c38b8b8aa9108cc350df5d13db57','member','accepted','2026-11-17 10:22:07.692','2026-11-03 10:22:07.932','6fc2c284-bff5-4b8a-893a-da24525ac358','2026-11-03 10:22:07.693'),
('7e9b8e9d-e51e-40d4-83f6-a5890e12aa43','71a33179-68ea-4391-96ec-7da90a76d362','08fb6c4e-5b4c-42a5-b499-2ea486544b98','59d005684c4233c87679c2eed38b8b15f25d01f30fca58f61a6a803f2af23709','member','accepted','2026-11-17 10:22:06.942','2026-11-03 10:22:07.189','087b8449-6ea8-4478-9a2a-097b0a43fc72','2026-11-03 10:22:06.948'),
('dedb5d8d-4ff0-45c0-ad9b-a05ee9706182','54b4f2b8-a2d7-4514-85e0-f1cc548b6ba6','087b8449-6ea8-4478-9a2a-097b0a43fc72','cfafcc9627267c28792b547c395084f55777f0e7a5937725b3bba4df5a77c9a3','member','accepted','2026-11-17 10:22:01.938','2026-11-03 10:22:02.202','9da929b7-d604-461b-ab52-84e2c5dcb02b','2026-11-03 10:22:01.940'),
('f161d176-d997-461b-bd5d-8ed67b870041','11997080-485f-4694-b760-568ac6592a5f','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','ce307ad6055eac9fca9be4e4c02476ef9fa4291e217ba978734788d14e3d502b','member','accepted','2026-10-31 08:25:09.243','2026-10-17 08:25:36.666','dd81c796-b6b8-49bd-a807-876c1c531d0b','2026-10-17 08:25:09.244');
/*!40000 ALTER TABLE `fin_space_invites` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_space_members`
--

DROP TABLE IF EXISTS `fin_space_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_space_members` (
  `id` varchar(191) NOT NULL,
  `spaceId` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `role` varchar(20) NOT NULL,
  `sharing` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`sharing`)),
  `displayName` varchar(60) DEFAULT NULL,
  `joinedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `leftAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fin_space_members_spaceId_userId_key` (`spaceId`,`userId`),
  KEY `fin_space_members_userId_idx` (`userId`),
  CONSTRAINT `fin_space_members_spaceId_fkey` FOREIGN KEY (`spaceId`) REFERENCES `fin_spaces` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_space_members_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_space_members_role_check` CHECK (`role` in ('owner','admin','member','viewer')),
  CONSTRAINT `fin_space_members_sharing_check` CHECK (json_type(`sharing`) = 'OBJECT')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_space_members`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_space_members` WRITE;
/*!40000 ALTER TABLE `fin_space_members` DISABLE KEYS */;
INSERT INTO `fin_space_members` VALUES
('0394ee7a-df49-4c23-b7e0-8f082d11e0d1','b467fabd-2be5-4deb-9ad7-d3cf76e09e3b','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','owner','{\"incomes\":\"shared\",\"transactions\":\"shared\",\"assets\":\"shared\",\"goals\":\"shared\"}','nous deux','2026-11-04 14:41:02.946',NULL,'2026-11-04 14:41:02.946','2026-11-04 14:53:10.855'),
('0a772d8c-5b3e-405f-a0aa-f1471dd7ecd1','85afecf3-0025-47a6-babb-17e941f50449','087b8449-6ea8-4478-9a2a-097b0a43fc72','owner','{\"incomes\":\"private\",\"transactions\":\"private\",\"assets\":\"private\",\"goals\":\"private\"}',NULL,'2026-11-03 10:21:53.111',NULL,'2026-11-03 10:21:53.111','2026-11-04 15:41:12.577'),
('0cd130cb-462f-4e4c-acb4-d08578ec5059','71a33179-68ea-4391-96ec-7da90a76d362','087b8449-6ea8-4478-9a2a-097b0a43fc72','member','{\"incomes\":\"private\",\"transactions\":\"private\",\"assets\":\"private\",\"goals\":\"private\"}',NULL,'2026-11-03 10:22:07.144',NULL,'2026-11-03 10:22:07.144','2026-11-03 10:22:07.144'),
('11b22b66-3397-45b5-a10e-3d3c148dd9fc','11997080-485f-4694-b760-568ac6592a5f','dd81c796-b6b8-49bd-a807-876c1c531d0b','member','{\"incomes\":\"private\",\"transactions\":\"private\",\"assets\":\"private\",\"goals\":\"private\"}',NULL,'2026-10-17 08:25:36.620',NULL,'2026-10-17 08:25:36.620','2026-10-17 08:25:36.620'),
('207a9a1f-f57c-414c-9d5d-c907b874ab01','85afecf3-0025-47a6-babb-17e941f50449','52982f43-bd76-479c-bbe3-d527decd2c63','member','{\"incomes\":\"private\",\"transactions\":\"private\",\"assets\":\"private\",\"goals\":\"private\"}',NULL,'2026-11-03 10:21:54.427',NULL,'2026-11-03 10:21:54.427','2026-11-03 10:21:54.427'),
('4eeea235-d1f4-4cae-9a70-0ce441c1b017','71a33179-68ea-4391-96ec-7da90a76d362','08fb6c4e-5b4c-42a5-b499-2ea486544b98','owner','{\"incomes\":\"private\",\"transactions\":\"private\",\"assets\":\"private\",\"goals\":\"private\"}',NULL,'2026-11-03 10:22:06.613',NULL,'2026-11-03 10:22:06.613','2026-11-03 10:22:06.613'),
('81390fab-d75b-458b-bcd0-72694d15a6dd','54b4f2b8-a2d7-4514-85e0-f1cc548b6ba6','087b8449-6ea8-4478-9a2a-097b0a43fc72','owner','{\"incomes\":\"private\",\"transactions\":\"private\",\"assets\":\"private\",\"goals\":\"private\"}',NULL,'2026-11-03 10:22:01.594',NULL,'2026-11-03 10:22:01.594','2026-11-03 10:22:01.594'),
('821dd801-1418-4d6b-b45f-9a57dfd9e22d','1a1c902c-a3a7-4946-a83b-96df9bedcf17','dd81c796-b6b8-49bd-a807-876c1c531d0b','owner','{\"incomes\":\"private\",\"transactions\":\"private\",\"assets\":\"private\",\"goals\":\"private\"}','test124','2026-11-03 14:33:55.451',NULL,'2026-11-03 14:33:55.451','2026-11-03 14:33:55.451'),
('9cc9b1e7-d226-48ce-8364-3020a2f91ac8','85afecf3-0025-47a6-babb-17e941f50449','55ebe856-2adf-4aa6-9f70-43bf06ca29e0','admin','{\"incomes\":\"private\",\"transactions\":\"private\",\"assets\":\"private\",\"goals\":\"private\"}',NULL,'2026-11-03 10:21:53.664',NULL,'2026-11-03 10:21:53.664','2026-11-04 15:41:12.432'),
('a0d0dcce-227d-4aff-aee0-8a7ec57b6d7a','11997080-485f-4694-b760-568ac6592a5f','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','owner','{\"incomes\":\"shared\",\"transactions\":\"shared\",\"assets\":\"shared\",\"goals\":\"shared\"}','test124','2026-10-17 08:23:45.027',NULL,'2026-10-17 08:23:45.027','2026-10-17 08:24:00.107'),
('d3ba34f0-c23a-451a-b3df-788926435db4','71a33179-68ea-4391-96ec-7da90a76d362','6fc2c284-bff5-4b8a-893a-da24525ac358','member','{\"incomes\":\"private\",\"transactions\":\"private\",\"assets\":\"private\",\"goals\":\"private\"}',NULL,'2026-11-03 10:22:07.890',NULL,'2026-11-03 10:22:07.890','2026-11-03 10:22:07.890'),
('ed19ecad-f07a-48ba-8abe-2cc5742339b9','b467fabd-2be5-4deb-9ad7-d3cf76e09e3b','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','member','{\"incomes\":\"private\",\"transactions\":\"private\",\"assets\":\"private\",\"goals\":\"private\"}',NULL,'2026-11-04 14:53:46.816',NULL,'2026-11-04 14:53:46.816','2026-11-04 14:53:46.816'),
('fb4f230c-4ec4-4ee6-a816-baeaf3ecf3dc','54b4f2b8-a2d7-4514-85e0-f1cc548b6ba6','9da929b7-d604-461b-ab52-84e2c5dcb02b','member','{\"incomes\":\"private\",\"transactions\":\"private\",\"assets\":\"private\",\"goals\":\"private\"}',NULL,'2026-11-03 10:22:02.154',NULL,'2026-11-03 10:22:02.154','2026-11-03 10:22:02.154');
/*!40000 ALTER TABLE `fin_space_members` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_space_provisions`
--

DROP TABLE IF EXISTS `fin_space_provisions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_space_provisions` (
  `id` varchar(191) NOT NULL,
  `spaceId` varchar(191) NOT NULL,
  `label` varchar(80) NOT NULL,
  `plannedAmount` double NOT NULL,
  `alreadyProvisioned` double NOT NULL DEFAULT 0,
  `currency` varchar(3) NOT NULL,
  `targetDate` datetime(3) NOT NULL,
  `note` varchar(300) DEFAULT NULL,
  `version` int(11) NOT NULL DEFAULT 1,
  `archivedAt` datetime(3) DEFAULT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fin_space_provisions_spaceId_deletedAt_idx` (`spaceId`,`deletedAt`),
  CONSTRAINT `fin_space_provisions_spaceId_fkey` FOREIGN KEY (`spaceId`) REFERENCES `fin_spaces` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_space_provisions_currency_check` CHECK (`currency` regexp '^[A-Z]{3}$'),
  CONSTRAINT `fin_space_provisions_label_check` CHECK (trim(`label`) <> ''),
  CONSTRAINT `fin_space_provisions_version_check` CHECK (`version` >= 1),
  CONSTRAINT `fin_space_provisions_planned_check` CHECK (`plannedAmount` > 0),
  CONSTRAINT `fin_space_provisions_provisioned_check` CHECK (`alreadyProvisioned` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_space_provisions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_space_provisions` WRITE;
/*!40000 ALTER TABLE `fin_space_provisions` DISABLE KEYS */;
/*!40000 ALTER TABLE `fin_space_provisions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_space_tasks`
--

DROP TABLE IF EXISTS `fin_space_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_space_tasks` (
  `id` varchar(191) NOT NULL,
  `spaceId` varchar(191) NOT NULL,
  `title` varchar(120) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `category` varchar(20) NOT NULL,
  `assigneeId` varchar(191) NOT NULL,
  `participants` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '[]' CHECK (json_valid(`participants`)),
  `dueDate` datetime(3) DEFAULT NULL,
  `priority` varchar(10) NOT NULL DEFAULT 'normal',
  `recurrence` varchar(10) NOT NULL DEFAULT 'none',
  `checklist` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '[]' CHECK (json_valid(`checklist`)),
  `weight` int(11) NOT NULL DEFAULT 1,
  `status` varchar(10) NOT NULL DEFAULT 'todo',
  `completedAt` datetime(3) DEFAULT NULL,
  `reminderDays` int(11) DEFAULT NULL,
  `linkedExpenseId` varchar(191) DEFAULT NULL,
  `createdById` varchar(191) NOT NULL,
  `version` int(11) NOT NULL DEFAULT 1,
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fin_space_tasks_spaceId_status_idx` (`spaceId`,`status`),
  KEY `fin_space_tasks_spaceId_dueDate_idx` (`spaceId`,`dueDate`),
  CONSTRAINT `fin_space_tasks_spaceId_fkey` FOREIGN KEY (`spaceId`) REFERENCES `fin_spaces` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_space_tasks_weight_check` CHECK (`weight` in (1,2,3)),
  CONSTRAINT `fin_space_tasks_status_check` CHECK (`status` in ('todo','doing','done','cancelled')),
  CONSTRAINT `fin_space_tasks_priority_check` CHECK (`priority` in ('low','normal','high','urgent')),
  CONSTRAINT `fin_space_tasks_recurrence_check` CHECK (`recurrence` in ('none','daily','weekly','monthly')),
  CONSTRAINT `fin_space_tasks_category_check` CHECK (`category` in ('household','shopping','bills','children','admin','upkeep','project','pet','other'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_space_tasks`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_space_tasks` WRITE;
/*!40000 ALTER TABLE `fin_space_tasks` DISABLE KEYS */;
INSERT INTO `fin_space_tasks` VALUES
('2e4954cb-03c9-4925-9031-6a5fd7073c1a','3b4a5ef2-af52-48b0-932c-14f414786c5d','Faire les courses',NULL,'shopping','bf2c3b9f-a00c-4ccf-b125-fbc2c49722e4','[]','2026-11-05 12:25:37.340','normal','none','[]',2,'todo',NULL,NULL,NULL,'8987c2c3-acfc-4c80-b339-f2e5ad8a6067',1,NULL,'2026-11-02 12:26:01.172','2026-11-02 12:26:01.172'),
('4e3456ab-bf1b-4ab3-90d5-ff65cbd62c6b','6228a31c-9d5c-40ba-b4c5-c8435a6de635','Ménage des parties communes',NULL,'household','0965979f-3b3e-4bee-862b-e0a9d89166c4','[]','2026-11-04 12:26:22.521','normal','none','[]',3,'todo',NULL,NULL,NULL,'0965979f-3b3e-4bee-862b-e0a9d89166c4',1,NULL,'2026-11-02 12:26:46.793','2026-11-02 12:26:46.793'),
('740ac2d1-5ddc-42c2-ac6b-5812ef7b366b','3b4a5ef2-af52-48b0-932c-14f414786c5d','Sortir les poubelles',NULL,'household','1180b506-772c-4dda-bc1d-4aa6c0bb7332','[]','2026-11-03 12:25:37.340','normal','none','[]',1,'todo',NULL,NULL,NULL,'8987c2c3-acfc-4c80-b339-f2e5ad8a6067',1,NULL,'2026-11-02 12:26:00.905','2026-11-02 12:26:00.905'),
('7b77f06f-37f0-47ab-bd49-4bd0f6852456','3b4a5ef2-af52-48b0-932c-14f414786c5d','Ménage des parties communes',NULL,'household','8987c2c3-acfc-4c80-b339-f2e5ad8a6067','[]','2026-11-04 12:25:37.340','normal','none','[]',3,'todo',NULL,NULL,NULL,'8987c2c3-acfc-4c80-b339-f2e5ad8a6067',1,NULL,'2026-11-02 12:26:00.634','2026-11-02 12:26:00.634'),
('8143760a-43fc-4017-a564-6ec5452c0b19','85afecf3-0025-47a6-babb-17e941f50449','Ménage des parties communes',NULL,'household','0a772d8c-5b3e-405f-a0aa-f1471dd7ecd1','[]','2026-11-05 10:21:36.169','normal','none','[]',3,'todo',NULL,NULL,NULL,'0a772d8c-5b3e-405f-a0aa-f1471dd7ecd1',1,NULL,'2026-11-03 10:22:00.667','2026-11-03 10:22:00.667'),
('9121f3a4-bdcd-428a-bbbf-7afc5216a44e','6228a31c-9d5c-40ba-b4c5-c8435a6de635','Sortir les poubelles',NULL,'household','05ad261f-f46a-43a8-87e0-5d7aa1838138','[]','2026-11-03 12:26:22.521','normal','none','[]',1,'todo',NULL,NULL,NULL,'0965979f-3b3e-4bee-862b-e0a9d89166c4',1,NULL,'2026-11-02 12:26:47.066','2026-11-02 12:26:47.066'),
('98a2c82e-9c46-4309-88fc-3aa8a6141d8d','85afecf3-0025-47a6-babb-17e941f50449','Faire les courses',NULL,'shopping','207a9a1f-f57c-414c-9d5d-c907b874ab01','[]','2026-11-06 10:21:36.169','normal','none','[]',2,'todo',NULL,NULL,NULL,'0a772d8c-5b3e-405f-a0aa-f1471dd7ecd1',1,NULL,'2026-11-03 10:22:01.234','2026-11-03 10:22:01.234'),
('aa2f8475-0957-427d-ac05-47aeada205d8','b467fabd-2be5-4deb-9ad7-d3cf76e09e3b','peinture',NULL,'project','0394ee7a-df49-4c23-b7e0-8f082d11e0d1','[]','2027-12-10 00:00:00.000','high','weekly','[]',1,'todo',NULL,NULL,NULL,'0394ee7a-df49-4c23-b7e0-8f082d11e0d1',1,NULL,'2026-11-04 14:50:44.682','2026-11-04 14:50:44.682'),
('bcb30351-b028-4a92-8eb3-1024009f63ed','6228a31c-9d5c-40ba-b4c5-c8435a6de635','Faire les courses',NULL,'shopping','30844828-11c6-4006-8de0-c275fee76c93','[]','2026-11-05 12:26:22.521','normal','none','[]',2,'todo',NULL,NULL,NULL,'0965979f-3b3e-4bee-862b-e0a9d89166c4',1,NULL,'2026-11-02 12:26:47.350','2026-11-02 12:26:47.350'),
('cd026232-c511-4c0b-bcfa-0c1abae745ee','85afecf3-0025-47a6-babb-17e941f50449','Sortir les poubelles',NULL,'household','9cc9b1e7-d226-48ce-8364-3020a2f91ac8','[]','2026-11-04 10:21:36.169','normal','none','[]',1,'todo',NULL,NULL,NULL,'0a772d8c-5b3e-405f-a0aa-f1471dd7ecd1',1,NULL,'2026-11-03 10:22:00.954','2026-11-03 10:22:00.954');
/*!40000 ALTER TABLE `fin_space_tasks` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_spaces`
--

DROP TABLE IF EXISTS `fin_spaces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_spaces` (
  `id` varchar(191) NOT NULL,
  `kind` varchar(20) NOT NULL,
  `label` varchar(80) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `splitRule` varchar(30) NOT NULL DEFAULT 'equal',
  `note` varchar(300) DEFAULT NULL,
  `source` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL,
  `version` int(11) NOT NULL DEFAULT 1,
  `archivedAt` datetime(3) DEFAULT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `smallBalance` double NOT NULL DEFAULT 20000,
  `closedAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fin_spaces_kind_idx` (`kind`),
  CONSTRAINT `fin_spaces_currency_check` CHECK (`currency` regexp '^[A-Z]{3}$'),
  CONSTRAINT `fin_spaces_split_check` CHECK (`splitRule` in ('equal','income_proportional','custom')),
  CONSTRAINT `fin_spaces_source_check` CHECK (`source` in ('manual','imported','document','partner','computed')),
  CONSTRAINT `fin_spaces_status_check` CHECK (`status` in ('real','declared','imported','computed','fictional','official','to_confirm')),
  CONSTRAINT `fin_spaces_version_check` CHECK (`version` >= 1),
  CONSTRAINT `fin_spaces_label_check` CHECK (trim(`label`) <> ''),
  CONSTRAINT `fin_spaces_small_balance_check` CHECK (`smallBalance` >= 0),
  CONSTRAINT `fin_spaces_kind_check` CHECK (`kind` in ('flatshare','couple','household','group'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_spaces`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_spaces` WRITE;
/*!40000 ALTER TABLE `fin_spaces` DISABLE KEYS */;
INSERT INTO `fin_spaces` VALUES
('11997080-485f-4694-b760-568ac6592a5f','flatshare','nous deux','DZD','equal','je soussigne te vendre touts','manual','declared',2,NULL,NULL,'2026-10-17 08:23:44.981','2026-10-17 08:24:15.373',20000,NULL),
('1a1c902c-a3a7-4946-a83b-96df9bedcf17','flatshare','nous deux','DZD','equal',NULL,'manual','declared',1,NULL,NULL,'2026-11-03 14:33:55.396','2026-11-03 14:33:55.396',20000,NULL),
('3b4a5ef2-af52-48b0-932c-14f414786c5d','flatshare','Colocation rue Didouche','DZD','equal',NULL,'manual','declared',1,NULL,NULL,'2026-11-02 12:25:53.143','2026-11-02 12:25:53.143',20000,NULL),
('54b4f2b8-a2d7-4514-85e0-f1cc548b6ba6','couple','Yasmine et Sami','DZD','equal',NULL,'manual','declared',1,NULL,NULL,'2026-11-03 10:22:01.546','2026-11-03 10:22:01.546',20000,NULL),
('5756c498-02ac-4c5b-b0d9-fd4e0cb8bf8d','group','Voyage à Béjaïa','DZD','equal',NULL,'manual','declared',1,NULL,NULL,'2026-11-02 12:26:52.709','2026-11-02 12:26:52.709',20000,NULL),
('6228a31c-9d5c-40ba-b4c5-c8435a6de635','flatshare','Colocation rue Didouche','DZD','equal',NULL,'manual','declared',1,NULL,NULL,'2026-11-02 12:26:39.299','2026-11-02 12:26:39.299',20000,NULL),
('71a33179-68ea-4391-96ec-7da90a76d362','group','Voyage à Béjaïa','DZD','equal',NULL,'manual','declared',1,NULL,NULL,'2026-11-03 10:22:06.569','2026-11-03 10:22:06.569',20000,NULL),
('85afecf3-0025-47a6-babb-17e941f50449','flatshare','Colocation rue Didouche','DZD','equal',NULL,'manual','declared',1,NULL,NULL,'2026-11-03 10:21:53.058','2026-11-03 10:21:53.058',20000,NULL),
('a7391921-e837-4a9b-92d8-d79b885e5a7a','group','Voyage à Béjaïa','DZD','equal',NULL,'manual','declared',1,NULL,NULL,'2026-11-02 12:26:06.575','2026-11-02 12:26:06.575',20000,NULL),
('b467fabd-2be5-4deb-9ad7-d3cf76e09e3b','flatshare','nous deux','DZD','equal','on fait 50 50 comme des fréres !','manual','declared',2,NULL,NULL,'2026-11-04 14:41:02.893','2026-11-04 14:41:39.212',20000,NULL),
('efeea052-fd03-4252-8732-0e56db3443dd','couple','Yasmine et Sami','DZD','equal',NULL,'manual','declared',1,NULL,NULL,'2026-11-02 12:26:01.456','2026-11-02 12:26:01.456',20000,NULL),
('f8ef2a94-48be-4441-b978-745e1c55ff6c','couple','Yasmine et Sami','DZD','equal',NULL,'manual','declared',1,NULL,NULL,'2026-11-02 12:26:47.652','2026-11-02 12:26:47.652',20000,NULL);
/*!40000 ALTER TABLE `fin_spaces` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_tags`
--

DROP TABLE IF EXISTS `fin_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_tags` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `name` varchar(40) NOT NULL,
  `color` varchar(9) NOT NULL,
  `autoCategoryId` varchar(191) DEFAULT NULL,
  `scope` varchar(20) NOT NULL DEFAULT 'personal',
  `source` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL,
  `confidence` varchar(10) DEFAULT NULL,
  `consentUses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`consentUses`)),
  `effectiveAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `collectedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `version` int(11) NOT NULL DEFAULT 1,
  `archivedAt` datetime(3) DEFAULT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fin_tags_userId_deletedAt_idx` (`userId`,`deletedAt`),
  KEY `fin_tags_autoCategoryId_fkey` (`autoCategoryId`),
  CONSTRAINT `fin_tags_autoCategoryId_fkey` FOREIGN KEY (`autoCategoryId`) REFERENCES `fin_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fin_tags_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_tags_name_check` CHECK (trim(`name`) <> ''),
  CONSTRAINT `fin_tags_color_check` CHECK (`color` regexp '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT `fin_tags_scope_check` CHECK (`scope` in ('personal','couple','household','space')),
  CONSTRAINT `fin_tags_source_check` CHECK (`source` in ('manual','imported','document','partner','computed')),
  CONSTRAINT `fin_tags_status_check` CHECK (`status` in ('real','declared','imported','computed','official','to_confirm')),
  CONSTRAINT `fin_tags_version_check` CHECK (`version` >= 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_tags`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_tags` WRITE;
/*!40000 ALTER TABLE `fin_tags` DISABLE KEYS */;
INSERT INTO `fin_tags` VALUES
('1607f534-fd76-4ad8-988e-f6c1ec5c9dc3','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','salut','#27a725',NULL,'personal','manual','declared',NULL,'[]','2026-11-04 13:43:31.790','2026-11-04 13:43:31.790',1,NULL,NULL,'2026-11-04 13:43:31.790','2026-11-04 13:43:31.790');
/*!40000 ALTER TABLE `fin_tags` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_transactions`
--

DROP TABLE IF EXISTS `fin_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_transactions` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `kind` varchar(12) NOT NULL,
  `value` double NOT NULL,
  `currency` varchar(3) NOT NULL,
  `occurredAt` datetime(3) NOT NULL,
  `categoryId` varchar(191) DEFAULT NULL,
  `subcategory` varchar(60) DEFAULT NULL,
  `paymentMethod` varchar(20) DEFAULT NULL,
  `note` varchar(300) DEFAULT NULL,
  `shared` tinyint(1) NOT NULL DEFAULT 0,
  `planned` tinyint(1) NOT NULL DEFAULT 0,
  `scope` varchar(20) NOT NULL DEFAULT 'personal',
  `source` varchar(20) NOT NULL,
  `sourceRef` varchar(200) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `confidence` varchar(10) DEFAULT NULL,
  `consentUses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`consentUses`)),
  `effectiveAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `collectedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `version` int(11) NOT NULL DEFAULT 1,
  `archivedAt` datetime(3) DEFAULT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `accountId` varchar(191) DEFAULT NULL,
  `transferId` varchar(36) DEFAULT NULL,
  `clearing` varchar(12) NOT NULL DEFAULT 'unchecked',
  `payer` varchar(80) DEFAULT NULL,
  `place` varchar(120) DEFAULT NULL,
  `tagId` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fin_transactions_userId_occurredAt_idx` (`userId`,`occurredAt`),
  KEY `fin_transactions_userId_kind_value_occurredAt_idx` (`userId`,`kind`,`value`,`occurredAt`),
  KEY `fin_transactions_categoryId_idx` (`categoryId`),
  KEY `fin_transactions_accountId_idx` (`accountId`),
  KEY `fin_transactions_transferId_idx` (`transferId`),
  KEY `fin_transactions_tagId_idx` (`tagId`),
  CONSTRAINT `fin_transactions_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `fin_accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_transactions_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `fin_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fin_transactions_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `fin_tags` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fin_transactions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_transactions_scope_check` CHECK (`scope` in ('personal','couple','household','space')),
  CONSTRAINT `fin_transactions_source_check` CHECK (`source` in ('manual','imported','document','partner','computed')),
  CONSTRAINT `fin_transactions_status_check` CHECK (`status` in ('real','declared','imported','computed','fictional','official','to_confirm')),
  CONSTRAINT `fin_transactions_confidence_check` CHECK (`confidence` is null or `confidence` in ('high','medium','low')),
  CONSTRAINT `fin_transactions_currency_check` CHECK (`currency` regexp '^[A-Z]{3}$'),
  CONSTRAINT `fin_transactions_version_check` CHECK (`version` >= 1),
  CONSTRAINT `fin_transactions_kind_check` CHECK (`kind` in ('income','expense','transfer_out','transfer_in')),
  CONSTRAINT `fin_transactions_planned_check` CHECK (`planned` = 0 or `kind` <> 'income'),
  CONSTRAINT `fin_transactions_transfer_check` CHECK (`kind` in ('transfer_out','transfer_in') = (`transferId` is not null)),
  CONSTRAINT `fin_transactions_payment_check` CHECK (`paymentMethod` is null or `paymentMethod` in ('PM-01','PM-02','PM-03','PM-04','PM-05','PM-06','PM-07','PM-08','PM-09','PM-10')),
  CONSTRAINT `fin_transactions_clearing_check` CHECK (`clearing` in ('unchecked','checked','reconciled','to_verify'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_transactions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_transactions` WRITE;
/*!40000 ALTER TABLE `fin_transactions` DISABLE KEYS */;
INSERT INTO `fin_transactions` VALUES
('06012199-a74e-4c6a-87fc-bfc28689e9b8','087b8449-6ea8-4478-9a2a-097b0a43fc72','expense',765000,'DZD','2026-09-06 12:00:00.000','e12c5b6f-fbdf-5c19-b286-93adcf97466d',NULL,NULL,'Courses de la semaine',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:41.628','2026-11-03 10:21:41.628',1,NULL,NULL,'2026-11-03 10:21:41.628','2026-11-03 10:21:41.628','50beca3c-3b32-4019-a38e-014733bd20e3',NULL,'unchecked',NULL,NULL,NULL),
('0ffaa2ac-af7f-4171-b8d4-070f59d72ccb','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','expense',40000,'DZD','2026-11-05 00:00:00.000','232ee03b-efc5-4a2b-9b56-43526542d85f',NULL,'PM-01','Tabac',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-05 07:55:15.484','2026-11-05 07:55:15.484',1,NULL,NULL,'2026-11-05 07:55:15.484','2026-11-05 07:55:20.791','6d90b22d-0ed9-4f3b-84dc-47a63b1a8a03',NULL,'reconciled','moi',NULL,NULL),
('1474eed1-eadc-43f6-8f8d-67d6a5fb8466','087b8449-6ea8-4478-9a2a-097b0a43fc72','expense',858500,'DZD','2026-10-20 12:00:00.000','e12c5b6f-fbdf-5c19-b286-93adcf97466d',NULL,NULL,'Courses de la semaine',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:44.367','2026-11-03 10:21:44.367',1,NULL,NULL,'2026-11-03 10:21:44.367','2026-11-03 10:21:44.367','50beca3c-3b32-4019-a38e-014733bd20e3',NULL,'unchecked',NULL,NULL,NULL),
('1551eb77-a33e-49e1-8c34-fc3bbff4c6ff','087b8449-6ea8-4478-9a2a-097b0a43fc72','expense',204000,'DZD','2026-08-04 12:00:00.000','e01bc4eb-e1bc-5c62-b38f-c0eb2b559a97',NULL,NULL,'Transport',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:39.646','2026-11-03 10:21:39.646',1,NULL,NULL,'2026-11-03 10:21:39.646','2026-11-03 10:21:39.646','50beca3c-3b32-4019-a38e-014733bd20e3',NULL,'unchecked',NULL,NULL,NULL),
('168e5339-38be-42e3-817d-58ea44488e09','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','expense',1000000,'DZD','2026-11-05 00:00:00.000','a0f8616f-e9ee-5fb7-a081-e61feaeaea80',NULL,'PM-05','loyer',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-05 07:58:10.056','2026-11-05 07:58:10.056',1,NULL,NULL,'2026-11-05 07:58:10.056','2026-11-05 07:58:16.938','6d90b22d-0ed9-4f3b-84dc-47a63b1a8a03',NULL,'checked',NULL,NULL,NULL),
('1a993274-500b-4b59-93e1-c682bcbf9366','087b8449-6ea8-4478-9a2a-097b0a43fc72','expense',150000,'DZD','2026-08-10 12:00:00.000','a7aa1ddc-f379-5f91-ab31-c8e865bbcf69',NULL,NULL,'Forfait mobile',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:38.917','2026-11-03 10:21:38.917',1,NULL,NULL,'2026-11-03 10:21:38.917','2026-11-03 10:21:38.917','50beca3c-3b32-4019-a38e-014733bd20e3',NULL,'unchecked',NULL,NULL,NULL),
('2696bf58-2565-45e1-b639-cedfbfdbd992','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','income',7000000,'DZD','2026-11-04 00:00:00.000','a47a98ca-6886-5db3-b468-5468da9a1e56',NULL,NULL,'salaire',0,0,'personal','manual','recurrence:10bdcda8-cd8b-4df4-94d8-bd1139d2a8ef:2026-11-04','real',NULL,'[]','2026-11-04 13:05:51.426','2026-11-04 13:05:51.426',1,NULL,NULL,'2026-11-04 13:05:51.426','2026-11-04 13:47:33.016','6d90b22d-0ed9-4f3b-84dc-47a63b1a8a03',NULL,'checked',NULL,NULL,NULL),
('2d1bc25f-e555-4795-a2c5-b20c520fb60e','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','expense',1200000,'DZD','2026-11-04 00:00:00.000','afc065d0-6654-5ca2-99af-7bf2811f3eae',NULL,NULL,'abonnement claude',0,0,'personal','manual','recurrence:c9939f7d-102c-45f3-b829-3d3d128c558d:2026-11-04','real',NULL,'[]','2026-11-05 07:36:48.770','2026-11-05 07:36:48.770',2,NULL,NULL,'2026-11-05 07:36:48.770','2026-11-05 07:49:38.073','6d90b22d-0ed9-4f3b-84dc-47a63b1a8a03',NULL,'checked',NULL,NULL,NULL),
('2f9f61c3-5bda-4f93-8f33-9a678cc7f6e1','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','expense',2000000,'DZD','2026-11-05 00:00:00.000','e12c5b6f-fbdf-5c19-b286-93adcf97466d',NULL,'PM-01','course',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-05 07:59:21.278','2026-11-05 07:59:21.278',1,NULL,NULL,'2026-11-05 07:59:21.278','2026-11-05 07:59:27.168','6d90b22d-0ed9-4f3b-84dc-47a63b1a8a03',NULL,'checked','moi',NULL,NULL),
('3a61657b-fd8e-45cb-9e5a-9f8da9b913e5','5daa4745-535e-4e92-824a-a705598eaead','expense',90000,'DZD','2026-10-19 12:00:00.000','0b9357f3-bf24-54a5-ae8c-d03c93588924',NULL,NULL,'Livre',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:51.713','2026-11-03 10:21:51.713',1,NULL,NULL,'2026-11-03 10:21:51.713','2026-11-03 10:21:51.713','e039ec1b-f0b7-4249-99a4-49460da05a4d',NULL,'unchecked',NULL,NULL,NULL),
('3aa3656f-f037-48d6-ac39-a466e626ba22','5daa4745-535e-4e92-824a-a705598eaead','expense',60000,'DZD','2026-08-05 12:00:00.000','e01bc4eb-e1bc-5c62-b38f-c0eb2b559a97',NULL,NULL,'Bus',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:48.829','2026-11-03 10:21:48.829',1,NULL,NULL,'2026-11-03 10:21:48.829','2026-11-03 10:21:48.829','e039ec1b-f0b7-4249-99a4-49460da05a4d',NULL,'unchecked',NULL,NULL,NULL),
('3ab54467-f697-4c76-b1f6-1eda828c13a0','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transfer_in',1000000,'DZD','2026-10-29 12:00:00.000',NULL,NULL,NULL,'Prêt à Un ami',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-04 13:23:22.856','2026-11-04 13:23:22.856',1,NULL,NULL,'2026-11-04 13:23:22.856','2026-11-04 13:43:11.026','32b7ad8b-8287-4ae1-9ae9-9a0d6208b5b0','3ebf413d-aee5-4bca-8754-745623b2fbdf','checked',NULL,NULL,NULL),
('3b213973-37bd-4d60-ba41-530c1d979f24','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transfer_out',9000000,'DZD','2026-11-04 12:00:00.000',NULL,NULL,NULL,'Fonds d’urgence',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-04 13:36:27.572','2026-11-04 13:36:27.572',1,NULL,NULL,'2026-11-04 13:36:27.572','2026-11-04 13:43:00.324','9c43294b-4b77-4bf9-87db-98bde28eee2d','14841b98-5061-4651-a9c5-7e6650363e00','checked',NULL,NULL,NULL),
('40c0159f-363b-400d-af70-b50aa9fe8a75','5daa4745-535e-4e92-824a-a705598eaead','income',300000,'DZD','2026-09-01 12:00:00.000','b5af8550-f021-59cf-ba34-bec1034bd2bc',NULL,NULL,'Argent de poche',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:49.695','2026-11-03 10:21:49.695',1,NULL,NULL,'2026-11-03 10:21:49.695','2026-11-03 10:21:49.695','e039ec1b-f0b7-4249-99a4-49460da05a4d',NULL,'unchecked',NULL,NULL,NULL),
('43da7024-d6be-4aff-ac52-261f271c343d','5daa4745-535e-4e92-824a-a705598eaead','income',300000,'DZD','2026-11-01 12:00:00.000','b5af8550-f021-59cf-ba34-bec1034bd2bc',NULL,NULL,'Argent de poche',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:52.006','2026-11-03 10:21:52.006',1,NULL,NULL,'2026-11-03 10:21:52.006','2026-11-03 10:21:52.006','e039ec1b-f0b7-4249-99a4-49460da05a4d',NULL,'unchecked',NULL,NULL,NULL),
('4c420d72-728f-412f-ad5d-f45c935478eb','5daa4745-535e-4e92-824a-a705598eaead','expense',90000,'DZD','2026-09-19 12:00:00.000','0b9357f3-bf24-54a5-ae8c-d03c93588924',NULL,NULL,'Livre',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:50.562','2026-11-03 10:21:50.562',1,NULL,NULL,'2026-11-03 10:21:50.562','2026-11-03 10:21:50.562','e039ec1b-f0b7-4249-99a4-49460da05a4d',NULL,'unchecked',NULL,NULL,NULL),
('4fe61396-7c16-474b-8896-f70ca24318f4','087b8449-6ea8-4478-9a2a-097b0a43fc72','expense',297500,'DZD','2026-08-14 12:00:00.000','f3dbd149-0d39-570c-b388-d40a5eb65d0f',NULL,NULL,'Restaurant',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:39.897','2026-11-03 10:21:39.897',1,NULL,NULL,'2026-11-03 10:21:39.897','2026-11-03 10:21:39.897','50beca3c-3b32-4019-a38e-014733bd20e3',NULL,'unchecked',NULL,NULL,NULL),
('577b7495-687e-447f-9ac4-a63eb2afda62','087b8449-6ea8-4478-9a2a-097b0a43fc72','expense',261600,'DZD','2026-09-04 12:00:00.000','e01bc4eb-e1bc-5c62-b38f-c0eb2b559a97',NULL,NULL,'Transport',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:42.112','2026-11-03 10:21:42.112',1,NULL,NULL,'2026-11-03 10:21:42.112','2026-11-03 10:21:42.112','50beca3c-3b32-4019-a38e-014733bd20e3',NULL,'unchecked',NULL,NULL,NULL),
('578c3eb6-f9d5-495a-978f-366fc3e3400b','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transfer_out',500000,'DZD','2026-11-04 00:00:00.000',NULL,NULL,NULL,NULL,0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-04 10:48:17.305','2026-11-04 10:48:17.305',1,NULL,NULL,'2026-11-04 10:48:17.305','2026-11-04 13:43:08.864','9c43294b-4b77-4bf9-87db-98bde28eee2d','b053d3da-5ef4-421b-a439-4f8747e4eff4','checked',NULL,NULL,NULL),
('5bf0b1a0-b84e-47d7-8a7a-b12acbcffecd','087b8449-6ea8-4478-9a2a-097b0a43fc72','expense',381500,'DZD','2026-09-14 12:00:00.000','f3dbd149-0d39-570c-b388-d40a5eb65d0f',NULL,NULL,'Restaurant',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:42.354','2026-11-03 10:21:42.354',1,NULL,NULL,'2026-11-03 10:21:42.354','2026-11-03 10:21:42.354','50beca3c-3b32-4019-a38e-014733bd20e3',NULL,'unchecked',NULL,NULL,NULL),
('5cb01fd3-976b-4b84-8136-35f2b7807287','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transfer_in',500000,'DZD','2026-11-04 00:00:00.000',NULL,NULL,NULL,NULL,0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-04 10:48:17.357','2026-11-04 10:48:17.357',1,NULL,NULL,'2026-11-04 10:48:17.357','2026-11-04 13:43:08.864','6d90b22d-0ed9-4f3b-84dc-47a63b1a8a03','b053d3da-5ef4-421b-a439-4f8747e4eff4','checked',NULL,NULL,NULL),
('5e2d5fc3-67c4-44b2-b31f-1ff7b833a9e6','087b8449-6ea8-4478-9a2a-097b0a43fc72','income',8500000,'DZD','2026-08-25 12:00:00.000','a47a98ca-6886-5db3-b468-5468da9a1e56',NULL,NULL,'Salaire',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:37.916','2026-11-03 10:21:37.916',1,NULL,NULL,'2026-11-03 10:21:37.916','2026-11-03 10:21:37.916','50beca3c-3b32-4019-a38e-014733bd20e3',NULL,'unchecked',NULL,NULL,NULL),
('67c917eb-87ff-494a-bc1a-e2624099929d','5daa4745-535e-4e92-824a-a705598eaead','expense',60000,'DZD','2026-09-05 12:00:00.000','e01bc4eb-e1bc-5c62-b38f-c0eb2b559a97',NULL,NULL,'Bus',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:49.981','2026-11-03 10:21:49.981',1,NULL,NULL,'2026-11-03 10:21:49.981','2026-11-03 10:21:49.981','e039ec1b-f0b7-4249-99a4-49460da05a4d',NULL,'unchecked',NULL,NULL,NULL),
('6de457e8-3a93-4773-9e05-3cc5b639cc83','087b8449-6ea8-4478-9a2a-097b0a43fc72','expense',223200,'DZD','2026-10-04 12:00:00.000','e01bc4eb-e1bc-5c62-b38f-c0eb2b559a97',NULL,NULL,'Transport',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:44.606','2026-11-03 10:21:44.606',1,NULL,NULL,'2026-11-03 10:21:44.606','2026-11-03 10:21:44.606','50beca3c-3b32-4019-a38e-014733bd20e3',NULL,'unchecked',NULL,NULL,NULL),
('72381ce7-90de-43f0-965a-b8a2e035cc9f','087b8449-6ea8-4478-9a2a-097b0a43fc72','income',8500000,'DZD','2026-09-25 12:00:00.000','a47a98ca-6886-5db3-b468-5468da9a1e56',NULL,NULL,'Salaire',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:40.396','2026-11-03 10:21:40.396',1,NULL,NULL,'2026-11-03 10:21:40.396','2026-11-03 10:21:40.396','50beca3c-3b32-4019-a38e-014733bd20e3',NULL,'unchecked',NULL,NULL,NULL),
('76b2d547-95a2-4bc5-9fef-5083814f1645','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transfer_out',1000000,'DZD','2026-11-04 12:00:00.000',NULL,NULL,NULL,'Fonds d’urgence',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-04 13:36:12.387','2026-11-04 13:36:12.387',1,NULL,NULL,'2026-11-04 13:36:12.387','2026-11-04 13:43:06.875','9c43294b-4b77-4bf9-87db-98bde28eee2d','42fa18ad-b149-4c24-9e77-ef30e3d4b749','checked',NULL,NULL,NULL),
('76c3678c-0e72-4e19-82dc-b03f29dfea50','087b8449-6ea8-4478-9a2a-097b0a43fc72','expense',320000,'DZD','2026-08-08 12:00:00.000','4ba17c79-10b2-56d1-ae91-a9cad1745397',NULL,NULL,'Sonelgaz',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:38.419','2026-11-03 10:21:38.419',1,NULL,NULL,'2026-11-03 10:21:38.419','2026-11-03 10:21:38.419','50beca3c-3b32-4019-a38e-014733bd20e3',NULL,'unchecked',NULL,NULL,NULL),
('782acb77-ae46-4212-b8d9-713bb665df76','5daa4745-535e-4e92-824a-a705598eaead','income',300000,'DZD','2026-08-01 12:00:00.000','b5af8550-f021-59cf-ba34-bec1034bd2bc',NULL,NULL,'Argent de poche',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:48.547','2026-11-03 10:21:48.547',1,NULL,NULL,'2026-11-03 10:21:48.547','2026-11-03 10:21:48.547','e039ec1b-f0b7-4249-99a4-49460da05a4d',NULL,'unchecked',NULL,NULL,NULL),
('79c9f8ab-ecc8-42e5-ab12-0a7c1f7be115','087b8449-6ea8-4478-9a2a-097b0a43fc72','expense',320000,'DZD','2026-09-08 12:00:00.000','4ba17c79-10b2-56d1-ae91-a9cad1745397',NULL,NULL,'Sonelgaz',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:40.896','2026-11-03 10:21:40.896',1,NULL,NULL,'2026-11-03 10:21:40.896','2026-11-03 10:21:40.896','50beca3c-3b32-4019-a38e-014733bd20e3',NULL,'unchecked',NULL,NULL,NULL),
('7edb68ac-cf65-43a9-9806-eade5c80be5e','087b8449-6ea8-4478-9a2a-097b0a43fc72','expense',250000,'DZD','2026-09-10 12:00:00.000','fb238194-33e8-5309-a0ad-e47aea414d2e',NULL,NULL,'Internet',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:41.138','2026-11-03 10:21:41.138',1,NULL,NULL,'2026-11-03 10:21:41.138','2026-11-03 10:21:41.138','50beca3c-3b32-4019-a38e-014733bd20e3',NULL,'unchecked',NULL,NULL,NULL),
('8374e8d7-8348-4226-837a-92eeea8b8749','087b8449-6ea8-4478-9a2a-097b0a43fc72','income',8500000,'DZD','2026-10-25 12:00:00.000','a47a98ca-6886-5db3-b468-5468da9a1e56',NULL,NULL,'Salaire',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:42.843','2026-11-03 10:21:42.843',1,NULL,NULL,'2026-11-03 10:21:42.843','2026-11-03 10:21:42.843','50beca3c-3b32-4019-a38e-014733bd20e3',NULL,'unchecked',NULL,NULL,NULL),
('83c82d87-cb05-431b-bca8-d690eacd6340','5daa4745-535e-4e92-824a-a705598eaead','expense',70000,'DZD','2026-08-12 12:00:00.000','f3dbd149-0d39-570c-b388-d40a5eb65d0f',NULL,NULL,'Sandwich avec les amis',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:49.126','2026-11-03 10:21:49.126',1,NULL,NULL,'2026-11-03 10:21:49.126','2026-11-03 10:21:49.126','e039ec1b-f0b7-4249-99a4-49460da05a4d',NULL,'unchecked',NULL,NULL,NULL),
('87e281fa-2c56-4c86-9d1a-0fef0564aa39','087b8449-6ea8-4478-9a2a-097b0a43fc72','expense',987654321,'DZD','2026-11-03 12:00:00.000',NULL,NULL,NULL,'Essai R308 : un libellé très très long pour vérifier que la ligne ne casse pas même avec beaucoup de texte et plusieurs informations à afficher',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-04 15:47:56.196','2026-11-04 15:47:56.196',1,NULL,NULL,'2026-11-04 15:47:56.196','2026-11-04 15:47:56.196','7dfbc7e0-36f1-48d2-a9ac-34d421bc0374',NULL,'unchecked','Une personne au nom particulièrement long','Centre commercial de Bab Ezzouar, deuxième étage',NULL),
('8a4e9dff-3ee5-4996-b1c9-d2ed4393e69d','087b8449-6ea8-4478-9a2a-097b0a43fc72','expense',282800,'DZD','2026-09-18 12:00:00.000','0b9357f3-bf24-54a5-ae8c-d03c93588924',NULL,NULL,'Sortie',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:42.600','2026-11-03 10:21:42.600',1,NULL,NULL,'2026-11-03 10:21:42.600','2026-11-03 10:21:42.600','50beca3c-3b32-4019-a38e-014733bd20e3',NULL,'unchecked',NULL,NULL,NULL),
('8cd216bb-fd7e-4f2f-a132-21dc3b042af0','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transfer_out',300000,'DZD','2026-11-05 08:13:24.473',NULL,NULL,NULL,'Prêt à Un ami',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-05 08:13:24.540','2026-11-05 08:13:24.540',1,NULL,NULL,'2026-11-05 08:13:24.540','2026-11-05 08:13:24.540','32b7ad8b-8287-4ae1-9ae9-9a0d6208b5b0','69fd261c-486e-44a3-8d29-580363de6bbd','unchecked',NULL,NULL,NULL),
('8f65b282-aba4-4e57-9081-e940b665f025','087b8449-6ea8-4478-9a2a-097b0a43fc72','expense',981000,'DZD','2026-10-06 12:00:00.000','e12c5b6f-fbdf-5c19-b286-93adcf97466d',NULL,NULL,'Courses de la semaine',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:44.116','2026-11-03 10:21:44.116',1,NULL,NULL,'2026-11-03 10:21:44.116','2026-11-03 10:21:44.116','50beca3c-3b32-4019-a38e-014733bd20e3',NULL,'unchecked',NULL,NULL,NULL),
('97eb5d94-b2f0-48c8-a942-a04a9f46c7ac','087b8449-6ea8-4478-9a2a-097b0a43fc72','expense',150000,'DZD','2026-09-10 12:00:00.000','a7aa1ddc-f379-5f91-ab31-c8e865bbcf69',NULL,NULL,'Forfait mobile',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:41.382','2026-11-03 10:21:41.382',1,NULL,NULL,'2026-11-03 10:21:41.382','2026-11-03 10:21:41.382','50beca3c-3b32-4019-a38e-014733bd20e3',NULL,'unchecked',NULL,NULL,NULL),
('9805858b-3c20-4cc8-a506-837e8e8b6a30','5daa4745-535e-4e92-824a-a705598eaead','expense',90000,'DZD','2026-08-19 12:00:00.000','0b9357f3-bf24-54a5-ae8c-d03c93588924',NULL,NULL,'Livre',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:49.415','2026-11-03 10:21:49.415',1,NULL,NULL,'2026-11-03 10:21:49.415','2026-11-03 10:21:49.415','e039ec1b-f0b7-4249-99a4-49460da05a4d',NULL,'unchecked',NULL,NULL,NULL),
('9b483bc6-4848-42c3-9136-8d3029262fbb','087b8449-6ea8-4478-9a2a-097b0a43fc72','expense',2800000,'DZD','2026-09-02 12:00:00.000','a0f8616f-e9ee-5fb7-a081-e61feaeaea80',NULL,NULL,'Loyer',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:40.642','2026-11-03 10:21:40.642',1,NULL,NULL,'2026-11-03 10:21:40.642','2026-11-03 10:21:40.642','50beca3c-3b32-4019-a38e-014733bd20e3',NULL,'unchecked',NULL,NULL,NULL),
('a17c96ef-dbbc-41de-a9c6-d57cd65b8d97','5daa4745-535e-4e92-824a-a705598eaead','expense',70000,'DZD','2026-09-12 12:00:00.000','f3dbd149-0d39-570c-b388-d40a5eb65d0f',NULL,NULL,'Sandwich avec les amis',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:50.262','2026-11-03 10:21:50.262',1,NULL,NULL,'2026-11-03 10:21:50.262','2026-11-03 10:21:50.262','e039ec1b-f0b7-4249-99a4-49460da05a4d',NULL,'unchecked',NULL,NULL,NULL),
('a1842b6e-ba61-4212-bc27-9fc7f80ffb0f','087b8449-6ea8-4478-9a2a-097b0a43fc72','expense',320000,'DZD','2026-10-08 12:00:00.000','4ba17c79-10b2-56d1-ae91-a9cad1745397',NULL,NULL,'Sonelgaz',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:43.341','2026-11-03 10:21:43.341',1,NULL,NULL,'2026-11-03 10:21:43.341','2026-11-03 10:21:43.341','50beca3c-3b32-4019-a38e-014733bd20e3',NULL,'unchecked',NULL,NULL,NULL),
('a63abe85-b97b-4952-90a1-24bf6961184a','5daa4745-535e-4e92-824a-a705598eaead','expense',70000,'DZD','2026-10-12 12:00:00.000','f3dbd149-0d39-570c-b388-d40a5eb65d0f',NULL,NULL,'Sandwich avec les amis',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:51.421','2026-11-03 10:21:51.421',1,NULL,NULL,'2026-11-03 10:21:51.421','2026-11-03 10:21:51.421','e039ec1b-f0b7-4249-99a4-49460da05a4d',NULL,'unchecked',NULL,NULL,NULL),
('abf99259-a17d-4d05-8746-0c79c6466982','087b8449-6ea8-4478-9a2a-097b0a43fc72','expense',2800000,'DZD','2026-08-02 12:00:00.000','a0f8616f-e9ee-5fb7-a081-e61feaeaea80',NULL,NULL,'Loyer',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:38.177','2026-11-03 10:21:38.177',1,NULL,NULL,'2026-11-03 10:21:38.177','2026-11-03 10:21:38.177','50beca3c-3b32-4019-a38e-014733bd20e3',NULL,'unchecked',NULL,NULL,NULL),
('b1e8cd91-6137-4b40-aaaa-7b8f82201917','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transfer_in',1000000,'DZD','2026-11-04 12:00:00.000',NULL,NULL,NULL,'Fonds d’urgence',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-04 13:36:12.431','2026-11-04 13:36:12.431',1,NULL,NULL,'2026-11-04 13:36:12.431','2026-11-04 13:43:06.875','46b02ea5-fab0-449e-9386-04500d1d613d','42fa18ad-b149-4c24-9e77-ef30e3d4b749','checked',NULL,NULL,NULL),
('b3252530-fcef-454b-ae60-dc8d78cd6f5f','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','expense',1000000,'DZD','2026-11-04 00:00:00.000','462c54ab-ae70-52cc-95be-06f40240b8a3',NULL,'PM-01',NULL,0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-04 13:55:00.622','2026-11-04 13:55:00.622',1,NULL,NULL,'2026-11-04 13:55:00.622','2026-11-04 13:55:06.237','6d90b22d-0ed9-4f3b-84dc-47a63b1a8a03',NULL,'checked',NULL,NULL,NULL),
('b825e494-be38-40f1-869e-6055b9745208','087b8449-6ea8-4478-9a2a-097b0a43fc72','expense',327600,'DZD','2026-08-18 12:00:00.000','0b9357f3-bf24-54a5-ae8c-d03c93588924',NULL,NULL,'Sortie',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:40.146','2026-11-03 10:21:40.146',1,NULL,NULL,'2026-11-03 10:21:40.146','2026-11-03 10:21:40.146','50beca3c-3b32-4019-a38e-014733bd20e3',NULL,'unchecked',NULL,NULL,NULL),
('bbbab861-7630-48d1-af4f-fcac84a9e5c8','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transfer_in',300000,'DZD','2026-11-05 08:13:24.473',NULL,NULL,NULL,'Prêt à Un ami',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-05 08:13:24.587','2026-11-05 08:13:24.587',1,NULL,NULL,'2026-11-05 08:13:24.587','2026-11-05 08:13:24.587','6d90b22d-0ed9-4f3b-84dc-47a63b1a8a03','69fd261c-486e-44a3-8d29-580363de6bbd','unchecked',NULL,NULL,NULL),
('bd023e8c-669a-4932-b2e8-ac86910b03e0','087b8449-6ea8-4478-9a2a-097b0a43fc72','expense',250000,'DZD','2026-08-10 12:00:00.000','fb238194-33e8-5309-a0ad-e47aea414d2e',NULL,NULL,'Internet',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:38.663','2026-11-03 10:21:38.663',1,NULL,NULL,'2026-11-03 10:21:38.663','2026-11-03 10:21:38.663','50beca3c-3b32-4019-a38e-014733bd20e3',NULL,'unchecked',NULL,NULL,NULL),
('be74bb92-1e84-4bc5-bef5-bcfb118ed09c','087b8449-6ea8-4478-9a2a-097b0a43fc72','expense',994500,'DZD','2026-09-20 12:00:00.000','e12c5b6f-fbdf-5c19-b286-93adcf97466d',NULL,NULL,'Courses de la semaine',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:41.871','2026-11-03 10:21:41.871',1,NULL,NULL,'2026-11-03 10:21:41.871','2026-11-03 10:21:41.871','50beca3c-3b32-4019-a38e-014733bd20e3',NULL,'unchecked',NULL,NULL,NULL),
('bfeda4c5-3ded-4ed4-b71c-9d130b6b5f4b','087b8449-6ea8-4478-9a2a-097b0a43fc72','expense',150000,'DZD','2026-11-03 12:00:00.000',NULL,NULL,NULL,'Essai sans catégorie R109',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-04 15:47:24.910','2026-11-04 15:47:24.910',1,NULL,'2026-11-04 15:48:33.053','2026-11-04 15:47:24.910','2026-11-04 15:48:33.055','7dfbc7e0-36f1-48d2-a9ac-34d421bc0374',NULL,'unchecked',NULL,NULL,NULL),
('c77e5ac2-02bf-4ac9-9e7a-fa56766954a2','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transfer_in',9000000,'DZD','2026-11-04 12:00:00.000',NULL,NULL,NULL,'Fonds d’urgence',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-04 13:36:27.617','2026-11-04 13:36:27.617',1,NULL,NULL,'2026-11-04 13:36:27.617','2026-11-04 13:43:00.324','46b02ea5-fab0-449e-9386-04500d1d613d','14841b98-5061-4651-a9c5-7e6650363e00','checked',NULL,NULL,NULL),
('ca7937dc-cb21-4542-bfeb-8cd5489f3d9c','5daa4745-535e-4e92-824a-a705598eaead','income',300000,'DZD','2026-10-01 12:00:00.000','b5af8550-f021-59cf-ba34-bec1034bd2bc',NULL,NULL,'Argent de poche',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:50.854','2026-11-03 10:21:50.854',1,NULL,NULL,'2026-11-03 10:21:50.854','2026-11-03 10:21:50.854','e039ec1b-f0b7-4249-99a4-49460da05a4d',NULL,'unchecked',NULL,NULL,NULL),
('ce12d72a-1b84-4462-b788-b54456e46e2d','087b8449-6ea8-4478-9a2a-097b0a43fc72','expense',2800000,'DZD','2026-11-02 12:00:00.000','a0f8616f-e9ee-5fb7-a081-e61feaeaea80',NULL,NULL,'Loyer',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:45.363','2026-11-03 10:21:45.363',1,NULL,NULL,'2026-11-03 10:21:45.363','2026-11-03 10:21:45.363','50beca3c-3b32-4019-a38e-014733bd20e3',NULL,'unchecked',NULL,NULL,NULL),
('dc8b64d4-5231-4a4a-b251-fb39a99addae','087b8449-6ea8-4478-9a2a-097b0a43fc72','expense',250000,'DZD','2026-10-10 12:00:00.000','fb238194-33e8-5309-a0ad-e47aea414d2e',NULL,NULL,'Internet',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:43.595','2026-11-03 10:21:43.595',1,NULL,NULL,'2026-11-03 10:21:43.595','2026-11-03 10:21:43.595','50beca3c-3b32-4019-a38e-014733bd20e3',NULL,'unchecked',NULL,NULL,NULL),
('df441b87-c933-45da-8f33-ea6670cf740b','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','transfer_out',1000000,'DZD','2026-10-29 12:00:00.000',NULL,NULL,NULL,'Prêt à Un ami',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-04 13:23:22.806','2026-11-04 13:23:22.806',1,NULL,NULL,'2026-11-04 13:23:22.806','2026-11-04 13:43:11.026','6d90b22d-0ed9-4f3b-84dc-47a63b1a8a03','3ebf413d-aee5-4bca-8754-745623b2fbdf','checked',NULL,NULL,NULL),
('e8761fe4-c480-4273-8421-f11d5fa19f06','087b8449-6ea8-4478-9a2a-097b0a43fc72','expense',909000,'DZD','2026-08-06 12:00:00.000','e12c5b6f-fbdf-5c19-b286-93adcf97466d',NULL,NULL,'Courses de la semaine',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:39.153','2026-11-03 10:21:39.153',1,NULL,NULL,'2026-11-03 10:21:39.153','2026-11-03 10:21:39.153','50beca3c-3b32-4019-a38e-014733bd20e3',NULL,'unchecked',NULL,NULL,NULL),
('ec694b20-a9f4-40f0-8654-88c24c05f572','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','expense',1000000,'DZD','2026-11-04 00:00:00.000','faba33b4-5693-5c7e-9ba6-2886b93cf0f7',NULL,'PM-01',NULL,0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-04 13:48:31.931','2026-11-04 13:48:31.931',1,NULL,NULL,'2026-11-04 13:48:31.931','2026-11-04 14:24:43.196','6d90b22d-0ed9-4f3b-84dc-47a63b1a8a03',NULL,'checked','moi',NULL,'1607f534-fd76-4ad8-988e-f6c1ec5c9dc3'),
('ef4e1c03-c7b2-4be3-8187-2337c5f82b93','087b8449-6ea8-4478-9a2a-097b0a43fc72','expense',238000,'DZD','2026-10-18 12:00:00.000','0b9357f3-bf24-54a5-ae8c-d03c93588924',NULL,NULL,'Sortie',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:45.115','2026-11-03 10:21:45.115',1,NULL,NULL,'2026-11-03 10:21:45.115','2026-11-03 10:21:45.115','50beca3c-3b32-4019-a38e-014733bd20e3',NULL,'unchecked',NULL,NULL,NULL),
('f489beb9-c919-4a54-b154-40a727509e50','087b8449-6ea8-4478-9a2a-097b0a43fc72','expense',790500,'DZD','2026-08-20 12:00:00.000','e12c5b6f-fbdf-5c19-b286-93adcf97466d',NULL,NULL,'Courses de la semaine',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:39.390','2026-11-03 10:21:39.390',1,NULL,NULL,'2026-11-03 10:21:39.390','2026-11-03 10:21:39.390','50beca3c-3b32-4019-a38e-014733bd20e3',NULL,'unchecked',NULL,NULL,NULL),
('fa08e724-cc18-4a02-8d13-4355f58f5440','5daa4745-535e-4e92-824a-a705598eaead','expense',60000,'DZD','2026-10-05 12:00:00.000','e01bc4eb-e1bc-5c62-b38f-c0eb2b559a97',NULL,NULL,'Bus',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:51.148','2026-11-03 10:21:51.148',1,NULL,NULL,'2026-11-03 10:21:51.148','2026-11-03 10:21:51.148','e039ec1b-f0b7-4249-99a4-49460da05a4d',NULL,'unchecked',NULL,NULL,NULL),
('fbe83061-adc4-4939-a348-6c993661bbb5','087b8449-6ea8-4478-9a2a-097b0a43fc72','expense',150000,'DZD','2026-10-10 12:00:00.000','a7aa1ddc-f379-5f91-ab31-c8e865bbcf69',NULL,NULL,'Forfait mobile',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:43.841','2026-11-03 10:21:43.841',1,NULL,NULL,'2026-11-03 10:21:43.841','2026-11-03 10:21:43.841','50beca3c-3b32-4019-a38e-014733bd20e3',NULL,'unchecked',NULL,NULL,NULL),
('fc217b1e-fc72-4db6-9855-30dfe8b65663','087b8449-6ea8-4478-9a2a-097b0a43fc72','expense',2800000,'DZD','2026-10-02 12:00:00.000','a0f8616f-e9ee-5fb7-a081-e61feaeaea80',NULL,NULL,'Loyer',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:43.100','2026-11-03 10:21:43.100',1,NULL,NULL,'2026-11-03 10:21:43.100','2026-11-03 10:21:43.100','50beca3c-3b32-4019-a38e-014733bd20e3',NULL,'unchecked',NULL,NULL,NULL),
('fff3fa50-fc4d-4bd5-ae09-91f1908459cf','087b8449-6ea8-4478-9a2a-097b0a43fc72','expense',325500,'DZD','2026-10-14 12:00:00.000','f3dbd149-0d39-570c-b388-d40a5eb65d0f',NULL,NULL,'Restaurant',0,0,'personal','manual',NULL,'real',NULL,'[]','2026-11-03 10:21:44.852','2026-11-03 10:21:44.852',1,NULL,NULL,'2026-11-03 10:21:44.852','2026-11-03 10:21:44.852','50beca3c-3b32-4019-a38e-014733bd20e3',NULL,'unchecked',NULL,NULL,NULL);
/*!40000 ALTER TABLE `fin_transactions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `formation_categories`
--

DROP TABLE IF EXISTS `formation_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `formation_categories` (
  `id` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `formation_categories_slug_key` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `formation_categories`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `formation_categories` WRITE;
/*!40000 ALTER TABLE `formation_categories` DISABLE KEYS */;
INSERT INTO `formation_categories` VALUES
('3e5c7f82-7346-4970-ab0c-5a5b6c123aaa','demo-finance','Finance','2026-10-06 14:51:48.736'),
('82ae0c68-05b5-4f99-be25-630e6b2010ee','tech','Tech','2026-09-20 08:16:26.018'),
('f456614d-abb0-477f-8ebe-de296fa1354d','aziz','aziz','2026-09-21 13:52:03.583'),
('fff5bc2d-8549-4ec7-a8aa-3b8d41061691','demo-gestion','Gestion','2026-10-06 14:51:48.739');
/*!40000 ALTER TABLE `formation_categories` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `formations`
--

DROP TABLE IF EXISTS `formations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `formations` (
  `id` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'draft',
  `requiredAccessLevel` varchar(191) NOT NULL DEFAULT 'standard',
  `categoryId` varchar(191) DEFAULT NULL,
  `coverImageId` varchar(191) DEFAULT NULL,
  `certificationEnabled` tinyint(1) NOT NULL DEFAULT 1,
  `certificationTitle` varchar(191) DEFAULT NULL,
  `certificationDescription` text DEFAULT NULL,
  `subtitle` varchar(191) DEFAULT NULL,
  `level` varchar(191) DEFAULT NULL,
  `objectives` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`objectives`)),
  `prerequisites` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`prerequisites`)),
  `createdById` varchar(191) DEFAULT NULL,
  `publishedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `theme` varchar(60) DEFAULT NULL,
  `targetAccountTypes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '[]' CHECK (json_valid(`targetAccountTypes`)),
  `educationProfiles` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '[]' CHECK (json_valid(`educationProfiles`)),
  PRIMARY KEY (`id`),
  UNIQUE KEY `formations_slug_key` (`slug`),
  UNIQUE KEY `formations_coverImageId_key` (`coverImageId`),
  KEY `formations_status_idx` (`status`),
  KEY `formations_categoryId_fkey` (`categoryId`),
  KEY `formations_createdById_fkey` (`createdById`),
  CONSTRAINT `formations_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `formation_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `formations_coverImageId_fkey` FOREIGN KEY (`coverImageId`) REFERENCES `media` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `formations_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `formations_status_check` CHECK (`status` in ('draft','in_review','published','archived')),
  CONSTRAINT `formations_requiredAccessLevel_check` CHECK (`requiredAccessLevel` in ('standard','premium')),
  CONSTRAINT `formations_publishedAt_check` CHECK (`status` = 'published' = (`publishedAt` is not null)),
  CONSTRAINT `formations_level_check` CHECK (`level` is null or `level` in ('beginner','intermediate','advanced'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `formations`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `formations` WRITE;
/*!40000 ALTER TABLE `formations` DISABLE KEYS */;
INSERT INTO `formations` VALUES
('0dfb27a5-c466-44d2-b8d9-032f6fee4a78','ma-mutuelle','Ma mutuelle','Formation sur le choix d\'une mutuelle','published','standard','82ae0c68-05b5-4f99-be25-630e6b2010ee','c1939f21-bea1-443a-9ca7-fc9fdf25919f',1,'Expert','vous estes expert',NULL,NULL,'[]','[]',NULL,'2026-09-20 08:19:19.402','2026-09-20 08:15:48.235','2026-09-20 08:19:19.404',NULL,'[]','[]'),
('13edf601-4428-4be5-9c9e-f629608b0b4b','rthytr','rthytr','','draft','standard',NULL,NULL,1,NULL,NULL,NULL,NULL,'[]','[]',NULL,NULL,'2026-09-22 07:04:30.482','2026-09-22 07:04:30.482',NULL,'[]','[]'),
('21d0e24a-224a-4af9-8e77-3c902ea12199','demo-comptabilite-de-base','Comptabilité de base','Comprendre les bases de la comptabilité d’une petite entreprise : journal, bilan et compte de résultat.','published','standard','3e5c7f82-7346-4970-ab0c-5a5b6c123aaa',NULL,1,'Certificat en comptabilité de base','Atteste que le titulaire a suivi tous les cours obligatoires.','Tenir les comptes d’une petite entreprise, pas à pas','beginner','[\"Comprendre à quoi sert la comptabilité\",\"Enregistrer une opération au journal\",\"Lire un bilan et un compte de résultat\"]','[\"Aucun : cette formation s’adresse aux débutants\"]','dd81c796-b6b8-49bd-a807-876c1c531d0b','2026-09-16 14:51:48.741','2026-09-15 14:51:48.741','2026-10-06 14:51:48.744',NULL,'[]','[]'),
('2b902f76-1048-4a36-a492-9f8c3bfcea18','infomatique','Infomatique','Vous allez découvrire les bases de l\'informatique, vous pourrez distiquer les plus et les moins.','published','premium','82ae0c68-05b5-4f99-be25-630e6b2010ee','35a0de05-a449-4603-8115-bec1922d8c45',1,'IT expert','felicitation mr IT','les base de l\'IT','intermediate','[\"Maitriser les bases\"]','[\"avoir un ordinateur\",\"connaitre les fondements\"]','dd81c796-b6b8-49bd-a807-876c1c531d0b','2026-11-05 08:47:09.919','2026-11-05 08:36:22.184','2026-11-05 08:47:09.934',NULL,'[\"salarie\",\"pme\"]','[\"SAL\",\"AUT\"]'),
('2cf07958-5a80-4cdd-8bce-2080fb74ab4f','demo-fiscalite-avancee','Fiscalité avancée pour PME','Optimiser légalement la fiscalité de son entreprise. Formation réservée aux comptes premium.','published','premium','3e5c7f82-7346-4970-ab0c-5a5b6c123aaa',NULL,1,'Certificat en fiscalité avancée','Valide la maîtrise des régimes fiscaux courants.','Optimiser légalement la fiscalité de son entreprise','advanced','[\"Comparer les régimes d’imposition\",\"Identifier les charges déductibles\",\"Préparer un contrôle fiscal\"]','[\"Connaître les bases de la comptabilité\",\"Avoir une entreprise ou un projet de création\"]','dd81c796-b6b8-49bd-a807-876c1c531d0b','2026-09-16 14:51:48.803','2026-09-15 14:51:48.803','2026-10-06 14:51:48.804',NULL,'[]','[]'),
('8450352f-b35e-496a-b3da-92872dfd7a7e','ancienne-formation-archivee-copie','Ancienne formation (archivée) (copie)','Retirée du catalogue : les inscrits gardent leur accès.','draft','standard',NULL,NULL,0,NULL,NULL,NULL,NULL,'[]','[]',NULL,NULL,'2026-09-26 08:14:44.910','2026-09-26 08:14:44.910',NULL,'[]','[]'),
('9fb5f42a-1a07-4531-b5b5-7d079e3eeb32','azdza','azdza','','draft','standard',NULL,NULL,1,NULL,NULL,NULL,NULL,'[]','[]',NULL,NULL,'2026-09-22 07:03:31.102','2026-09-22 07:03:31.102',NULL,'[]','[]'),
('a485b226-95af-4eae-b360-c0e3c6f4f812','demo-ancienne-formation','Ancienne formation (archivée)','Retirée du catalogue : les inscrits gardent leur accès.','published','standard','fff5bc2d-8549-4ec7-a8aa-3b8d41061691','525e1edf-9d62-494e-be30-aba4d04e4ad1',0,NULL,NULL,'rregrgreg','beginner','[]','[]','dd81c796-b6b8-49bd-a807-876c1c531d0b','2026-10-17 09:43:59.064','2026-09-15 14:51:48.845','2026-10-17 09:43:59.068',NULL,'[\"pme\"]','[]'),
('a7828933-f8f2-4ce5-b609-0b1e4f373d36','demo-brouillon-tresorerie','Gestion de trésorerie (en révision)','Formation en préparation : en attente de relecture, pas encore dans le catalogue.','in_review','standard','fff5bc2d-8549-4ec7-a8aa-3b8d41061691',NULL,0,NULL,NULL,'Prévoir ses encaissements et ses décaissements','intermediate','[\"Construire un plan de trésorerie\"]','[]','dd81c796-b6b8-49bd-a807-876c1c531d0b',NULL,'2026-09-15 14:51:48.831','2026-10-06 14:51:48.832',NULL,'[]','[]'),
('b5245bb8-482e-4229-bd4f-0f80119eaaf4','aziz','aziz','c aziz aziz aziz','published','premium','f456614d-abb0-477f-8ebe-de296fa1354d','63e871b2-2b55-42a3-b9c3-7d8bcf3401ef',1,'Expert','Content Security Policy (CSP) 	−25\nFailed\n	\n\nContent Security Policy (CSP) header not implemented\n	\n\nImplement one, see MDN\'s Content Security Policy (CSP) documentation.','c aziz','beginner','[\"test\",\"azz\",\"qsd\"]','[\"zza\",\"zad\",\"ad\"]',NULL,'2026-09-21 13:57:12.590','2026-09-21 13:50:46.210','2026-09-21 13:57:12.594',NULL,'[]','[]');
/*!40000 ALTER TABLE `formations` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `glossary_term_revisions`
--

DROP TABLE IF EXISTS `glossary_term_revisions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `glossary_term_revisions` (
  `id` varchar(191) NOT NULL,
  `termId` varchar(191) NOT NULL,
  `definition` text NOT NULL,
  `example` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `glossary_term_revisions_termId_createdAt_idx` (`termId`,`createdAt`),
  CONSTRAINT `glossary_term_revisions_termId_fkey` FOREIGN KEY (`termId`) REFERENCES `glossary_terms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `glossary_term_revisions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `glossary_term_revisions` WRITE;
/*!40000 ALTER TABLE `glossary_term_revisions` DISABLE KEYS */;
/*!40000 ALTER TABLE `glossary_term_revisions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `glossary_terms`
--

DROP TABLE IF EXISTS `glossary_terms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `glossary_terms` (
  `id` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `term` varchar(120) NOT NULL,
  `definition` text NOT NULL,
  `example` text DEFAULT NULL,
  `relatedTerms` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`relatedTerms`)),
  `level` varchar(191) DEFAULT NULL,
  `theme` varchar(60) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'draft',
  `language` varchar(191) NOT NULL DEFAULT 'fr',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `simulatorKey` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `glossary_terms_slug_key` (`slug`),
  CONSTRAINT `glossary_terms_term_check` CHECK (octet_length(trim(`term`)) > 0),
  CONSTRAINT `glossary_terms_definition_check` CHECK (octet_length(trim(`definition`)) > 0),
  CONSTRAINT `glossary_terms_slug_check` CHECK (`slug` collate utf8mb4_bin regexp '^[a-z0-9]+(-[a-z0-9]+)*$' and octet_length(`slug`) <= 80),
  CONSTRAINT `glossary_terms_status_check` CHECK (`status` in ('draft','published')),
  CONSTRAINT `glossary_terms_level_check` CHECK (`level` is null or `level` in ('beginner','intermediate','advanced')),
  CONSTRAINT `glossary_terms_language_check` CHECK (`language` in ('fr','en','ar')),
  CONSTRAINT `glossary_terms_related_check` CHECK (json_type(`relatedTerms`) = 'ARRAY')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `glossary_terms`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `glossary_terms` WRITE;
/*!40000 ALTER TABLE `glossary_terms` DISABLE KEYS */;
/*!40000 ALTER TABLE `glossary_terms` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `learning_favorites`
--

DROP TABLE IF EXISTS `learning_favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `learning_favorites` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `kind` varchar(20) NOT NULL,
  `refId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `learning_favorites_userId_kind_refId_key` (`userId`,`kind`,`refId`),
  KEY `learning_favorites_userId_createdAt_idx` (`userId`,`createdAt`),
  CONSTRAINT `learning_favorites_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `learning_favorites_kind_check` CHECK (`kind` in ('course','article','term','guide'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `learning_favorites`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `learning_favorites` WRITE;
/*!40000 ALTER TABLE `learning_favorites` DISABLE KEYS */;
/*!40000 ALTER TABLE `learning_favorites` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `lesson_blocks`
--

DROP TABLE IF EXISTS `lesson_blocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `lesson_blocks` (
  `id` varchar(191) NOT NULL,
  `courseId` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `position` int(11) NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`data`)),
  `mediaId` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `lesson_blocks_courseId_position_idx` (`courseId`,`position`),
  KEY `lesson_blocks_mediaId_courseId_fkey` (`mediaId`,`courseId`),
  CONSTRAINT `lesson_blocks_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `lesson_blocks_mediaId_courseId_fkey` FOREIGN KEY (`mediaId`, `courseId`) REFERENCES `media` (`id`, `courseId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `lesson_blocks_type_check` CHECK (`type` in ('text','image','video','file','code','table','quote','callout','resources')),
  CONSTRAINT `lesson_blocks_position_check` CHECK (`position` >= 0),
  CONSTRAINT `lesson_blocks_data_object_check` CHECK (json_type(`data`) = 'OBJECT')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lesson_blocks`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `lesson_blocks` WRITE;
/*!40000 ALTER TABLE `lesson_blocks` DISABLE KEYS */;
INSERT INTO `lesson_blocks` VALUES
('0c2372a1-16f7-4151-9ec9-1c1f68daf20a','7a68219d-134c-41ad-a1e6-8c13968ac630','text',0,'{\"html\":\"<p>Contenu conservé.</p>\"}',NULL,'2026-10-06 14:51:48.854','2026-10-06 14:51:48.854'),
('1987efa4-01a5-496c-aa18-d26fc5a15640','23350dc6-e513-45af-8959-0fdc673e6ace','image',1,'{\"alt\":\"tiktok.png\",\"caption\":\"aza\"}','87e9aea2-7bdb-4010-b8e4-50ce9b5d5738','2026-09-21 13:53:08.033','2026-09-21 13:53:49.332'),
('2a558fcc-2ddc-42f4-ac62-8f50aeca4ce5','d2cc05c4-6946-4b7b-8d87-83a6e43ca8ce','resources',5,'{\"items\":[{\"url\":\"https://example.org/plan-comptable\",\"label\":\"Plan comptable\",\"description\":\"Liste des comptes\"}],\"title\":\"Pour aller plus loin\"}',NULL,'2026-10-06 14:51:48.772','2026-10-06 14:51:48.772'),
('33d4466b-b7eb-416a-9f9a-9c910ed96f80','c97db33c-c6e9-47e6-8108-0b9e9269cb3f','text',0,'{\"html\":\"<h2>Pourquoi tenir une comptabilité ?</h2><p>La comptabilité donne une <strong>image fidèle</strong> de la situation de votre entreprise.</p><ul><li>Suivre les recettes et les dépenses</li><li>Respecter les obligations légales</li><li>Prendre de meilleures décisions</li></ul>\"}',NULL,'2026-10-06 14:51:48.763','2026-10-06 14:51:48.763'),
('445bd17a-116e-4fae-9387-eceea17372f2','6d9b6ac8-34ca-41ce-a680-3db935ab2cb7','text',0,'{\"html\":\"<h2>Le bilan</h2><p>Photographie du patrimoine à une date donnée : ce que possède l’entreprise et ce qu’elle doit.</p><h2>Le compte de résultat</h2><p>Il mesure le bénéfice ou la perte sur une période.</p>\"}',NULL,'2026-10-06 14:51:48.783','2026-10-06 14:51:48.783'),
('45325889-81b5-46b4-bf07-f2db45019b09','846c2e84-eb5b-4356-896a-a75412952589','text',5,'{\"html\":\"<p><strong>ssvfdsv</strong></p><h2>sdv</h2><h3>sdv</h3><ol><li><p>svsdvdv</p></li><li><p>sv</p></li><li><p>dv</p></li><li><p>sdv</p></li></ol><blockquote><p>sdvsdvddv</p></blockquote><p></p><p></p>\"}',NULL,'2026-11-05 08:44:08.838','2026-11-05 08:44:46.859'),
('460785ff-5018-48e2-9af8-78192a78de36','d2cc05c4-6946-4b7b-8d87-83a6e43ca8ce','text',0,'{\"html\":\"<h2>Le journal</h2><p>Chaque opération est enregistrée <em>chronologiquement</em> avec un débit et un crédit.</p><p>Le grand livre regroupe ensuite ces écritures par compte.</p>\"}',NULL,'2026-10-06 14:51:48.772','2026-10-06 14:51:48.772'),
('5c8833ef-caa8-4537-835a-4e93423c0eba','23350dc6-e513-45af-8959-0fdc673e6ace','text',0,'{\"html\":\"<p>adadazd</p><p>adadzadzad</p>\"}',NULL,'2026-09-21 13:52:55.514','2026-09-21 13:53:49.330'),
('6fa662ba-cc39-4d25-953d-5b0e6133a09e','c1252cdd-5431-401a-be09-06333e4fa03f','text',0,'{\"html\":\"<ol><li>Classer les justificatifs</li><li>Garder les contrats</li><li>Répondre dans les délais</li></ol>\"}',NULL,'2026-10-06 14:51:48.827','2026-10-06 14:51:48.827'),
('73ecacfd-5d54-4584-b74b-e9c32babc3fa','23350dc6-e513-45af-8959-0fdc673e6ace','table',2,'{\"rows\":[[\"dzd\",\"dzzdzd\",\"dzzd\"],[\"azd\",\"adzd\",\"ddza\"]],\"caption\":\"zddzdzd\",\"headers\":[\"za\",\"zaz\",\"azd\"]}',NULL,'2026-09-21 13:53:17.755','2026-09-21 13:53:49.333'),
('7bd753c5-fc20-4f3a-9988-914dac524ef3','d2cc05c4-6946-4b7b-8d87-83a6e43ca8ce','quote',4,'{\"text\":\"La comptabilité est le langage des affaires.\",\"author\":\"Proverbe\"}',NULL,'2026-10-06 14:51:48.772','2026-10-06 14:51:48.772'),
('7f2dfbef-1ac3-4606-a37a-14fbde543a7f','846c2e84-eb5b-4356-896a-a75412952589','text',3,'{\"html\":\"<ul><li><p>Gestion budgétaire</p></li><li><p>Gestion budgétaire</p></li><li><p>Gestion budgétaire</p></li><li><p>Gestion budgétaire</p></li></ul><p></p>\"}',NULL,'2026-11-05 08:43:22.609','2026-11-05 08:44:46.596'),
('86378462-ccde-4f55-bffd-9e5364828eb5','7bb94490-38ce-48b9-b2fc-a5427398ace7','text',0,'{\"html\":\"<p>aaa <strong>adad <em>zdzd</em></strong><em>zdzd </em></p><h2>eefee</h2><p><u>deded </u></p><p><em><u>eded</u></em></p><ol><li><p>deededeede</p></li></ol><blockquote><p>eded</p></blockquote><p></p><p></p>\"}',NULL,'2026-09-21 12:03:18.526','2026-09-21 12:03:18.526'),
('9208db7f-88ff-4142-bc0d-e65e0ccd0d99','23350dc6-e513-45af-8959-0fdc673e6ace','quote',3,'{\"text\":\"azdazdasqsd\",\"author\":\"aziz\"}',NULL,'2026-09-21 13:53:37.592','2026-09-21 13:53:49.334'),
('9d498c1c-f5a5-4f5d-bbcf-ad27c4e77fda','846c2e84-eb5b-4356-896a-a75412952589','text',2,'{\"html\":\"<p>Gestion budgétaireGestion budgétaireGestion budgétaireGestion budgétaireGestion budgétaireGestion budgétaire</p>\"}',NULL,'2026-11-05 08:43:14.809','2026-11-05 08:44:46.464'),
('a4fef649-c2c3-433b-8c1e-919b9d592c56','f2090008-2139-4b30-bb14-0e172acae73c','text',0,'{\"html\":\"<p>Toute dépense engagée dans l’intérêt de l’entreprise et justifiée peut, en principe, être déduite.</p>\"}',NULL,'2026-10-06 14:51:48.819','2026-10-06 14:51:48.819'),
('ac9468cc-2c6e-4d88-b448-3f1cec8b53b5','9ec9ea81-dbc3-4fe5-9f67-5ade3344754f','text',0,'{\"html\":\"<p>Quelques pistes pour approfondir : plan comptable, TVA, amortissements.</p>\"}',NULL,'2026-10-06 14:51:48.789','2026-10-06 14:51:48.789'),
('ad0f0409-9de4-4cbc-932c-4181fb6021e3','b6e8cb1d-60a7-4e21-b2d5-b4be82f20fa1','text',0,'{\"html\":\"<h2>Choisir son régime</h2><p>Le régime dépend de la forme juridique et du chiffre d’affaires.</p>\"}',NULL,'2026-10-06 14:51:48.813','2026-10-06 14:51:48.813'),
('be75c085-6e5e-453a-ad61-784ec091c743','23350dc6-e513-45af-8959-0fdc673e6ace','callout',4,'{\"html\":\"<p>azdzadz</p>\",\"title\":\"aaaaaa\",\"variant\":\"info\"}',NULL,'2026-09-21 13:53:49.327','2026-09-21 13:53:57.922'),
('bedf830a-0bf0-41d9-a70f-a1fb52141987','1a7ece0e-0cec-437b-8978-72458861492c','text',0,'{\"html\":\"<p>Contenu conservé.</p>\"}',NULL,'2026-09-26 08:14:44.919','2026-09-26 08:14:44.919'),
('c6b28ec5-e3fb-40ac-b28f-0ac635e2eaea','846c2e84-eb5b-4356-896a-a75412952589','text',0,'{\"html\":\"<p>Gestion budgétaireGestion budgétaireGestion budgétaireGestion budgétaireGestion budgétaireGestion budgétaireGestion budgétaireGestion budgétaire</p>\"}',NULL,'2026-11-05 08:42:50.667','2026-11-05 08:44:46.200'),
('c94293b1-722b-43f0-86b8-bb9a73607a0b','d2cc05c4-6946-4b7b-8d87-83a6e43ca8ce','code',3,'{\"code\":\"SELECT compte, SUM(debit) - SUM(credit) AS solde\\nFROM ecritures\\nGROUP BY compte;\",\"caption\":\"Calculer le solde de chaque compte\",\"language\":\"sql\"}',NULL,'2026-10-06 14:51:48.772','2026-10-06 14:51:48.772'),
('d3e65fd8-9b3c-4f24-89fe-e1d10e1426b2','846c2e84-eb5b-4356-896a-a75412952589','image',1,'{\"alt\":\"tiktok.png\",\"caption\":\"Gestion budgétaire\"}','25d227cb-d2bf-490f-a35d-1daef21a4c8b','2026-11-05 08:43:05.534','2026-11-05 08:44:46.333'),
('dfda438d-51d3-4479-8ebc-f02fc2b6e56c','846c2e84-eb5b-4356-896a-a75412952589','table',6,'{\"headers\":[\"c1\",\"c2\",\"c5\"],\"rows\":[[\"l1\",\"l2\",\"l6\"],[\"l3\",\"l4\",\"l7\"]],\"caption\":\"c\'est le tab\"}',NULL,'2026-11-05 08:44:46.024','2026-11-05 08:46:11.842'),
('e1362c30-2461-4689-a14d-4be6f49e2ede','d2cc05c4-6946-4b7b-8d87-83a6e43ca8ce','table',2,'{\"rows\":[[\"512 Banque\",\"1 200,00\",\"\"],[\"706 Prestations\",\"\",\"1 200,00\"]],\"caption\":\"Exemple : encaissement d’une facture\",\"headers\":[\"Compte\",\"Débit\",\"Crédit\"]}',NULL,'2026-10-06 14:51:48.772','2026-10-06 14:51:48.772'),
('e2160c57-ecd6-4a16-bbae-3011db200b6d','846c2e84-eb5b-4356-896a-a75412952589','file',4,'{\"label\":\"5CYURGGW.pdf\",\"description\":\"Gestion budgétaire\"}','d0597cc0-8fe2-4609-b07a-63b535a34193','2026-11-05 08:44:02.963','2026-11-05 08:44:46.728'),
('ee1870d5-a965-496c-a43d-56e7890fbb1c','7bb94490-38ce-48b9-b2fc-a5427398ace7','image',1,'{\"alt\":\"flight-bg-2.webp\",\"caption\":\"\"}','7c00cea1-ba90-4df4-a64d-e06d70b141d4','2026-09-21 12:03:18.530','2026-09-21 12:03:18.530'),
('ee7e9015-8b47-4dd6-92c5-a3788eebdc0e','ad0ce140-ad37-41f1-a92c-b01507f1b74f','text',0,'{\"html\":\"<p>Contenu en cours de rédaction.</p>\"}',NULL,'2026-10-06 14:51:48.841','2026-10-06 14:51:48.841'),
('f085092e-fd48-41a0-a868-563bb8281c7f','d2cc05c4-6946-4b7b-8d87-83a6e43ca8ce','callout',1,'{\"html\":\"<p>Chaque écriture a <strong>autant de débit que de crédit</strong>.</p>\",\"title\":\"À retenir\",\"variant\":\"tip\"}',NULL,'2026-10-06 14:51:48.772','2026-10-06 14:51:48.772');
/*!40000 ALTER TABLE `lesson_blocks` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `lesson_revisions`
--

DROP TABLE IF EXISTS `lesson_revisions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `lesson_revisions` (
  `id` varchar(191) NOT NULL,
  `courseId` varchar(191) NOT NULL,
  `blocks` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`blocks`)),
  `label` varchar(191) DEFAULT NULL,
  `createdById` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `lesson_revisions_courseId_createdAt_idx` (`courseId`,`createdAt`),
  KEY `lesson_revisions_createdById_fkey` (`createdById`),
  CONSTRAINT `lesson_revisions_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `lesson_revisions_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `lesson_revisions_blocks_array_check` CHECK (json_type(`blocks`) = 'ARRAY')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lesson_revisions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `lesson_revisions` WRITE;
/*!40000 ALTER TABLE `lesson_revisions` DISABLE KEYS */;
INSERT INTO `lesson_revisions` VALUES
('1ff46223-42a9-477c-8363-a2bdc0273a4a','23350dc6-e513-45af-8959-0fdc673e6ace','[{\"data\":{\"html\":\"\"},\"type\":\"text\",\"mediaId\":null,\"position\":0}]',NULL,NULL,'2026-09-21 13:52:58.738'),
('776b3e82-e285-463e-8073-23b59fc61341','846c2e84-eb5b-4356-896a-a75412952589','[{\"type\":\"text\",\"position\":0,\"data\":{\"html\":\"\"},\"mediaId\":null}]',NULL,'dd81c796-b6b8-49bd-a807-876c1c531d0b','2026-11-05 08:42:55.803');
/*!40000 ALTER TABLE `lesson_revisions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `media`
--

DROP TABLE IF EXISTS `media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `media` (
  `id` varchar(191) NOT NULL,
  `kind` varchar(191) NOT NULL,
  `storageKey` varchar(191) NOT NULL,
  `originalName` varchar(255) NOT NULL,
  `mimeType` varchar(191) NOT NULL,
  `sizeBytes` int(11) NOT NULL,
  `courseId` varchar(191) DEFAULT NULL,
  `uploadedById` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `articleId` varchar(191) DEFAULT NULL,
  `finTransactionId` varchar(191) DEFAULT NULL,
  `sharedExpenseId` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `media_storageKey_key` (`storageKey`),
  UNIQUE KEY `media_id_courseId_key` (`id`,`courseId`),
  UNIQUE KEY `media_finTransactionId_key` (`finTransactionId`),
  UNIQUE KEY `media_sharedExpenseId_key` (`sharedExpenseId`),
  KEY `media_courseId_idx` (`courseId`),
  KEY `media_articleId_idx` (`articleId`),
  KEY `media_uploadedById_fkey` (`uploadedById`),
  CONSTRAINT `media_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `media_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `media_finTransactionId_fkey` FOREIGN KEY (`finTransactionId`) REFERENCES `fin_transactions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `media_sharedExpenseId_fkey` FOREIGN KEY (`sharedExpenseId`) REFERENCES `fin_shared_expenses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `media_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `media_kind_check` CHECK (`kind` in ('video','image','document')),
  CONSTRAINT `media_sizeBytes_check` CHECK (`sizeBytes` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `media` WRITE;
/*!40000 ALTER TABLE `media` DISABLE KEYS */;
INSERT INTO `media` VALUES
('25d227cb-d2bf-490f-a35d-1daef21a4c8b','image','ca420aad989b850082ef80d56324aabe.png','tiktok.png','image/png',14180,'846c2e84-eb5b-4356-896a-a75412952589','dd81c796-b6b8-49bd-a807-876c1c531d0b','2026-11-05 08:43:05.443',NULL,NULL,NULL),
('290456ea-42b3-4b08-94ac-69c8e55d4218','image','5ed2a8d35e213accc0d71954a786231c.webp','discount-bg.webp','image/webp',52276,NULL,NULL,'2026-09-22 07:07:20.768',NULL,NULL,NULL),
('35a0de05-a449-4603-8115-bec1922d8c45','image','3743c38b4841aebda528c7c46515655a.webp','contact-bg.webp','image/webp',29310,NULL,'dd81c796-b6b8-49bd-a807-876c1c531d0b','2026-11-05 08:38:44.413',NULL,NULL,NULL),
('525e1edf-9d62-494e-be30-aba4d04e4ad1','image','c797212d3974ac80c84ba1d42c0708fc.png','QR Code Akili.png','image/png',177076,NULL,'dd81c796-b6b8-49bd-a807-876c1c531d0b','2026-10-17 09:43:42.818',NULL,NULL,NULL),
('63e871b2-2b55-42a3-b9c3-7d8bcf3401ef','image','9dff7a1af9ab4d2a8c85e91f0a4cddef.png','facebook.png','image/png',16039,NULL,NULL,'2026-09-21 13:52:17.219',NULL,NULL,NULL),
('7c00cea1-ba90-4df4-a64d-e06d70b141d4','image','a55177a8c989523077cd4854f4345d0a.webp','flight-bg-2.webp','image/webp',63636,'7bb94490-38ce-48b9-b2fc-a5427398ace7',NULL,'2026-09-20 08:18:50.489',NULL,NULL,NULL),
('87e9aea2-7bdb-4010-b8e4-50ce9b5d5738','image','2494562c3e4595db9bfd210b3697166a.png','tiktok.png','image/png',14180,'23350dc6-e513-45af-8959-0fdc673e6ace',NULL,'2026-09-21 13:53:08.026',NULL,NULL,NULL),
('9373d938-f9dc-4e53-9509-c2579873b79b','image','f98684122b959936ad9bceeddac5a01f.webp','flight-bg-2.webp','image/webp',63636,NULL,NULL,'2026-09-22 07:07:15.870','28d306ff-573c-4ba2-b1b5-51d0d3705c2e',NULL,NULL),
('c1939f21-bea1-443a-9ca7-fc9fdf25919f','image','7b8d21c453a4be59e7476f2609b76637.png','youtube.png','image/png',8618,NULL,NULL,'2026-09-20 08:16:57.935',NULL,NULL,NULL),
('d0597cc0-8fe2-4609-b07a-63b535a34193','document','9be66afc5078febe4af17b0d8995262a.pdf','5CYURGGW.pdf','application/pdf',106900,'846c2e84-eb5b-4356-896a-a75412952589','dd81c796-b6b8-49bd-a807-876c1c531d0b','2026-11-05 08:44:02.875',NULL,NULL,NULL),
('f1875222-dd4e-4c2a-95b4-a482c1102ce4','image','078ddd45a37c9fc9ead648360d184e7b.webp','contact-bg.webp','image/webp',29310,NULL,'dd81c796-b6b8-49bd-a807-876c1c531d0b','2026-11-05 08:38:24.013',NULL,NULL,NULL);
/*!40000 ALTER TABLE `media` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `mini_guides`
--

DROP TABLE IF EXISTS `mini_guides`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `mini_guides` (
  `id` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `title` varchar(150) NOT NULL,
  `body` mediumtext NOT NULL,
  `level` varchar(191) DEFAULT NULL,
  `theme` varchar(60) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'draft',
  `language` varchar(191) NOT NULL DEFAULT 'fr',
  `position` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `simulatorKey` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `mini_guides_slug_key` (`slug`),
  CONSTRAINT `mini_guides_title_check` CHECK (octet_length(trim(`title`)) > 0),
  CONSTRAINT `mini_guides_slug_check` CHECK (`slug` collate utf8mb4_bin regexp '^[a-z0-9]+(-[a-z0-9]+)*$' and octet_length(`slug`) <= 80),
  CONSTRAINT `mini_guides_status_check` CHECK (`status` in ('draft','published')),
  CONSTRAINT `mini_guides_level_check` CHECK (`level` is null or `level` in ('beginner','intermediate','advanced')),
  CONSTRAINT `mini_guides_language_check` CHECK (`language` in ('fr','en','ar')),
  CONSTRAINT `mini_guides_position_check` CHECK (`position` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mini_guides`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `mini_guides` WRITE;
/*!40000 ALTER TABLE `mini_guides` DISABLE KEYS */;
/*!40000 ALTER TABLE `mini_guides` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `newsletter_subscribers`
--

DROP TABLE IF EXISTS `newsletter_subscribers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `newsletter_subscribers` (
  `id` varchar(191) NOT NULL,
  `email` varchar(254) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'pending',
  `locale` varchar(191) NOT NULL DEFAULT 'fr',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `confirmedAt` datetime(3) DEFAULT NULL,
  `unsubscribedAt` datetime(3) DEFAULT NULL,
  `lastEmailAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `newsletter_subscribers_email_key` (`email`),
  KEY `newsletter_subscribers_status_idx` (`status`),
  CONSTRAINT `newsletter_status_check` CHECK (`status` in ('pending','confirmed','unsubscribed')),
  CONSTRAINT `newsletter_confirmed_at_check` CHECK (`status` = 'pending' or `confirmedAt` is not null),
  CONSTRAINT `newsletter_unsubscribed_at_check` CHECK (`status` = 'unsubscribed' = (`unsubscribedAt` is not null)),
  CONSTRAINT `newsletter_email_normalised_check` CHECK (`email` collate utf8mb4_bin = lcase(trim(`email`)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsletter_subscribers`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `newsletter_subscribers` WRITE;
/*!40000 ALTER TABLE `newsletter_subscribers` DISABLE KEYS */;
INSERT INTO `newsletter_subscribers` VALUES
('0d8b210f-fac4-478f-92f6-35aed33aa62b','azizsellal.idh@gmail.com','pending','fr','2026-11-04 12:34:40.717',NULL,NULL,'2026-11-04 12:34:40.809'),
('29741b7e-fb8a-48c3-be4c-a376211980bc','parti@demo.larbi.test','unsubscribed','fr','2026-10-06 14:51:48.914','2026-09-16 14:51:48.913','2026-10-04 14:51:48.913',NULL),
('62913cfa-77d4-42d0-857c-aeb09e6917cc','abonne2@demo.larbi.test','confirmed','en','2026-10-06 14:51:48.914','2026-10-03 14:51:48.913',NULL,NULL),
('b1681bb6-8d96-4cce-9168-b782a10a1684','attente@demo.larbi.test','pending','fr','2026-10-06 14:51:48.914',NULL,NULL,NULL),
('fd3d0fe0-986a-4b50-8052-b22ddaa36315','abonne1@demo.larbi.test','confirmed','fr','2026-10-06 14:51:48.914','2026-09-26 14:51:48.913',NULL,NULL);
/*!40000 ALTER TABLE `newsletter_subscribers` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `payment_events`
--

DROP TABLE IF EXISTS `payment_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_events` (
  `id` varchar(191) NOT NULL,
  `provider` varchar(30) NOT NULL,
  `externalId` varchar(191) NOT NULL,
  `type` varchar(60) NOT NULL,
  `orderId` varchar(191) DEFAULT NULL,
  `outcome` varchar(30) NOT NULL,
  `receivedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `payment_events_provider_externalId_key` (`provider`,`externalId`),
  KEY `payment_events_orderId_fkey` (`orderId`),
  CONSTRAINT `payment_events_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `payment_orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `payment_events_outcome_check` CHECK (`outcome` in ('applied','ignored','unknown_order','amount_mismatch'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_events`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `payment_events` WRITE;
/*!40000 ALTER TABLE `payment_events` DISABLE KEYS */;
INSERT INTO `payment_events` VALUES
('0ac923c8-b896-4118-a4b8-1b9e67ecc8db','fake','evt_e48f4e54-75c6-430b-8298-0ecbdeb0f4ff','payment.succeeded','294b514d-ec5a-4f9f-bf9a-dd1de394a79b','applied','2026-11-04 14:40:38.454'),
('1d3e97df-7492-49fa-9e53-ecd21c154804','fake','evt_dfe7f8af-3942-4969-b809-43efd6e9d9cc','payment.succeeded','49cb4602-1985-4d09-887e-ed3390f2e94a','applied','2026-10-17 09:48:32.210');
/*!40000 ALTER TABLE `payment_events` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `payment_offers`
--

DROP TABLE IF EXISTS `payment_offers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_offers` (
  `id` varchar(191) NOT NULL,
  `name` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `amount` int(11) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `accessLevel` varchar(20) NOT NULL DEFAULT 'premium',
  `isActive` tinyint(1) NOT NULL DEFAULT 0,
  `position` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `payment_offers_name_check` CHECK (octet_length(trim(`name`)) > 0),
  CONSTRAINT `payment_offers_amount_check` CHECK (`amount` > 0),
  CONSTRAINT `payment_offers_currency_check` CHECK (`currency` collate utf8mb4_bin regexp '^[A-Z]{3}$'),
  CONSTRAINT `payment_offers_access_level_check` CHECK (`accessLevel` = 'premium'),
  CONSTRAINT `payment_offers_position_check` CHECK (`position` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_offers`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `payment_offers` WRITE;
/*!40000 ALTER TABLE `payment_offers` DISABLE KEYS */;
INSERT INTO `payment_offers` VALUES
('0b985c2b-2b54-47bb-8df4-04c681ee6689','promo','POST /api/tools/scenarios/comparaison 409',250000,'DZD','premium',1,0,'2026-10-17 09:46:21.853','2026-10-17 09:46:21.853'),
('87db09fd-0de5-4a5a-a138-b946adf0cb60','test','zefze',600000,'DZD','premium',1,1,'2026-11-05 08:49:55.642','2026-11-05 08:49:59.227');
/*!40000 ALTER TABLE `payment_offers` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `payment_orders`
--

DROP TABLE IF EXISTS `payment_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_orders` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `offerId` varchar(191) NOT NULL,
  `amount` int(11) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `accessLevel` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `provider` varchar(30) NOT NULL,
  `providerReference` varchar(191) DEFAULT NULL,
  `paidAt` datetime(3) DEFAULT NULL,
  `refundedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payment_orders_providerReference_key` (`providerReference`),
  KEY `payment_orders_userId_createdAt_idx` (`userId`,`createdAt`),
  KEY `payment_orders_status_idx` (`status`),
  KEY `payment_orders_offerId_fkey` (`offerId`),
  CONSTRAINT `payment_orders_offerId_fkey` FOREIGN KEY (`offerId`) REFERENCES `payment_offers` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `payment_orders_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `payment_orders_amount_check` CHECK (`amount` > 0),
  CONSTRAINT `payment_orders_currency_check` CHECK (`currency` collate utf8mb4_bin regexp '^[A-Z]{3}$'),
  CONSTRAINT `payment_orders_access_level_check` CHECK (`accessLevel` = 'premium'),
  CONSTRAINT `payment_orders_status_check` CHECK (`status` in ('pending','paid','failed','cancelled','refunded')),
  CONSTRAINT `payment_orders_paid_at_check` CHECK (`status` in ('paid','refunded') = (`paidAt` is not null)),
  CONSTRAINT `payment_orders_refunded_at_check` CHECK (`status` = 'refunded' = (`refundedAt` is not null))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_orders`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `payment_orders` WRITE;
/*!40000 ALTER TABLE `payment_orders` DISABLE KEYS */;
INSERT INTO `payment_orders` VALUES
('294b514d-ec5a-4f9f-bf9a-dd1de394a79b','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','0b985c2b-2b54-47bb-8df4-04c681ee6689',250000,'DZD','premium','paid','fake','fake_46477b6d-8f6f-4444-b713-36fb058528b1','2026-11-04 14:40:38.547',NULL,'2026-11-04 14:40:32.995','2026-11-04 14:40:38.549'),
('49cb4602-1985-4d09-887e-ed3390f2e94a','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','0b985c2b-2b54-47bb-8df4-04c681ee6689',250000,'DZD','premium','paid','fake','fake_a4fb1139-e449-4efe-b853-e707d511cdab','2026-10-17 09:48:32.294',NULL,'2026-10-17 09:48:27.815','2026-10-17 09:48:32.296');
/*!40000 ALTER TABLE `payment_orders` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `platform_settings`
--

DROP TABLE IF EXISTS `platform_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `platform_settings` (
  `key` varchar(191) NOT NULL,
  `value` text NOT NULL,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platform_settings`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `platform_settings` WRITE;
/*!40000 ALTER TABLE `platform_settings` DISABLE KEYS */;
INSERT INTO `platform_settings` VALUES
('contactAddress','','2026-09-26 07:41:06.247'),
('contactEmail','','2026-09-26 07:41:06.247'),
('contactPhone','','2026-09-26 07:41:06.247'),
('maintenanceMode','false','2026-09-26 07:41:06.247');
/*!40000 ALTER TABLE `platform_settings` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `quiz_attempt_answers`
--

DROP TABLE IF EXISTS `quiz_attempt_answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz_attempt_answers` (
  `id` varchar(191) NOT NULL,
  `attemptId` varchar(191) NOT NULL,
  `questionId` varchar(191) NOT NULL,
  `choiceIds` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`choiceIds`)),
  `text` text NOT NULL DEFAULT '',
  `correct` tinyint(1) NOT NULL,
  `points` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `quiz_attempt_answers_attemptId_questionId_key` (`attemptId`,`questionId`),
  CONSTRAINT `quiz_attempt_answers_attemptId_fkey` FOREIGN KEY (`attemptId`) REFERENCES `quiz_attempts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `quiz_attempt_answers_points_check` CHECK (`points` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_attempt_answers`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `quiz_attempt_answers` WRITE;
/*!40000 ALTER TABLE `quiz_attempt_answers` DISABLE KEYS */;
/*!40000 ALTER TABLE `quiz_attempt_answers` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `quiz_attempts`
--

DROP TABLE IF EXISTS `quiz_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz_attempts` (
  `id` varchar(191) NOT NULL,
  `quizId` varchar(191) NOT NULL,
  `formationId` varchar(191) NOT NULL,
  `enrollmentId` varchar(191) NOT NULL,
  `startedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `submittedAt` datetime(3) DEFAULT NULL,
  `questionOrder` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`questionOrder`)),
  `score` int(11) DEFAULT NULL,
  `earnedPoints` int(11) DEFAULT NULL,
  `totalPoints` int(11) DEFAULT NULL,
  `passed` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `quiz_attempts_enrollmentId_quizId_idx` (`enrollmentId`,`quizId`),
  KEY `quiz_attempts_quizId_idx` (`quizId`),
  KEY `quiz_attempts_quizId_formationId_fkey` (`quizId`,`formationId`),
  KEY `quiz_attempts_enrollmentId_formationId_fkey` (`enrollmentId`,`formationId`),
  CONSTRAINT `quiz_attempts_enrollmentId_formationId_fkey` FOREIGN KEY (`enrollmentId`, `formationId`) REFERENCES `enrollments` (`id`, `formationId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `quiz_attempts_quizId_formationId_fkey` FOREIGN KEY (`quizId`, `formationId`) REFERENCES `quizzes` (`id`, `formationId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `quiz_attempts_graded_check` CHECK (`submittedAt` is null and `score` is null and `earnedPoints` is null and `totalPoints` is null and `passed` is null or `submittedAt` is not null and `score` between 0 and 100 and `earnedPoints` >= 0 and `totalPoints` >= 0 and `passed` is not null)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_attempts`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `quiz_attempts` WRITE;
/*!40000 ALTER TABLE `quiz_attempts` DISABLE KEYS */;
/*!40000 ALTER TABLE `quiz_attempts` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `quiz_choices`
--

DROP TABLE IF EXISTS `quiz_choices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz_choices` (
  `id` varchar(191) NOT NULL,
  `questionId` varchar(191) NOT NULL,
  `position` int(11) NOT NULL,
  `text` text NOT NULL,
  `isCorrect` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `quiz_choices_questionId_position_idx` (`questionId`,`position`),
  CONSTRAINT `quiz_choices_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `quiz_questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `quiz_choices_position_check` CHECK (`position` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_choices`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `quiz_choices` WRITE;
/*!40000 ALTER TABLE `quiz_choices` DISABLE KEYS */;
INSERT INTO `quiz_choices` VALUES
('18b139c1-1e4f-42c2-b0f1-bf149b670e1f','c54775cb-291e-48aa-8463-835ccab4f525',0,'moi',0),
('21cbe855-29c0-4305-b18c-8c4a47ef2f53','c54775cb-291e-48aa-8463-835ccab4f525',1,'aziz',1),
('35e3c362-9f1b-4a3e-a26a-66f4019a7b68','e580d10c-9df3-49ef-8802-61a4a71b843f',2,'tbib ?',1),
('3b025509-94ff-478a-90ad-f05833388823','c54775cb-291e-48aa-8463-835ccab4f525',2,'pas moi',0),
('3d2ff6f7-1b40-46f0-8ca9-b3cf6b2cb79f','df11324b-eb4b-4829-91f4-ac5357db142c',1,'Gestion commune',0),
('4056a77d-099c-4a2d-8444-89aaecf5dadc','e580d10c-9df3-49ef-8802-61a4a71b843f',0,'oui',0),
('57b12286-2fd7-4fa6-8c08-b8cca0d98bef','e580d10c-9df3-49ef-8802-61a4a71b843f',1,'non',0),
('7a654bef-6ee2-4d52-a6e8-2d1262f21ef5','df11324b-eb4b-4829-91f4-ac5357db142c',0,'Gestion budgétaire',1),
('a1b8b84c-06fa-4492-8c80-4acbf2f1b253','2cc9f6b9-e338-4a82-b8d1-64be5b4d7477',1,'false',0),
('fb6736d0-cc05-405a-8e4a-998d63d8a659','2cc9f6b9-e338-4a82-b8d1-64be5b4d7477',0,'true',1);
/*!40000 ALTER TABLE `quiz_choices` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `quiz_questions`
--

DROP TABLE IF EXISTS `quiz_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz_questions` (
  `id` varchar(191) NOT NULL,
  `quizId` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `position` int(11) NOT NULL,
  `prompt` text NOT NULL DEFAULT '',
  `explanation` text NOT NULL DEFAULT '',
  `points` int(11) NOT NULL DEFAULT 1,
  `acceptedAnswers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`acceptedAnswers`)),
  PRIMARY KEY (`id`),
  KEY `quiz_questions_quizId_position_idx` (`quizId`,`position`),
  CONSTRAINT `quiz_questions_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `quiz_questions_type_check` CHECK (`type` in ('single','multiple','true_false','text')),
  CONSTRAINT `quiz_questions_points_check` CHECK (`points` between 1 and 100),
  CONSTRAINT `quiz_questions_position_check` CHECK (`position` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_questions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `quiz_questions` WRITE;
/*!40000 ALTER TABLE `quiz_questions` DISABLE KEYS */;
INSERT INTO `quiz_questions` VALUES
('2cc9f6b9-e338-4a82-b8d1-64be5b4d7477','975d4b36-4a9f-4da9-893f-3ce3436941b5','true_false',1,'Gestion commune','C\'etais sur',1,'[]'),
('c54775cb-291e-48aa-8463-835ccab4f525','15098cab-72fd-4481-9846-5b3c55a96a32','multiple',0,'quel est le théme','',2,'[]'),
('df11324b-eb4b-4829-91f4-ac5357db142c','975d4b36-4a9f-4da9-893f-3ce3436941b5','single',0,'Gestion budgétaire\nGestion commune','C\'etais sur',1,'[]'),
('e580d10c-9df3-49ef-8802-61a4a71b843f','15098cab-72fd-4481-9846-5b3c55a96a32','single',1,'vous aller bien','eh oui ca ne le regarde pas',1,'[]'),
('e88abc9e-754e-4efa-8dde-269746f84fcb','975d4b36-4a9f-4da9-893f-3ce3436941b5','text',2,'Gestion budgétaire\nGestion commune','Gestion budgétaire',2,'[\"Gestion budgétaire\",\"budget\"]');
/*!40000 ALTER TABLE `quiz_questions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `quizzes`
--

DROP TABLE IF EXISTS `quizzes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `quizzes` (
  `id` varchar(191) NOT NULL,
  `formationId` varchar(191) NOT NULL,
  `scope` varchar(191) NOT NULL,
  `courseId` varchar(191) DEFAULT NULL,
  `sectionId` varchar(191) DEFAULT NULL,
  `finalFormationId` varchar(191) DEFAULT NULL,
  `title` varchar(191) NOT NULL,
  `instructions` text NOT NULL DEFAULT '',
  `passingScore` int(11) NOT NULL DEFAULT 70,
  `maxAttempts` int(11) DEFAULT NULL,
  `shuffleQuestions` tinyint(1) NOT NULL DEFAULT 0,
  `isRequired` tinyint(1) NOT NULL DEFAULT 0,
  `showCorrection` tinyint(1) NOT NULL DEFAULT 1,
  `isComplete` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `quizzes_id_formationId_key` (`id`,`formationId`),
  UNIQUE KEY `quizzes_finalFormationId_key` (`finalFormationId`),
  UNIQUE KEY `quizzes_courseId_key` (`courseId`),
  UNIQUE KEY `quizzes_sectionId_key` (`sectionId`),
  KEY `quizzes_formationId_idx` (`formationId`),
  KEY `quizzes_courseId_formationId_fkey` (`courseId`,`formationId`),
  KEY `quizzes_sectionId_formationId_fkey` (`sectionId`,`formationId`),
  CONSTRAINT `quizzes_courseId_formationId_fkey` FOREIGN KEY (`courseId`, `formationId`) REFERENCES `courses` (`id`, `formationId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `quizzes_finalFormationId_fkey` FOREIGN KEY (`finalFormationId`) REFERENCES `formations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `quizzes_formationId_fkey` FOREIGN KEY (`formationId`) REFERENCES `formations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `quizzes_sectionId_formationId_fkey` FOREIGN KEY (`sectionId`, `formationId`) REFERENCES `sections` (`id`, `formationId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `quizzes_scope_check` CHECK (`scope` in ('course','section','formation')),
  CONSTRAINT `quizzes_passing_score_check` CHECK (`passingScore` between 0 and 100),
  CONSTRAINT `quizzes_max_attempts_check` CHECK (`maxAttempts` is null or `maxAttempts` between 1 and 50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quizzes`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `quizzes` WRITE;
/*!40000 ALTER TABLE `quizzes` DISABLE KEYS */;
INSERT INTO `quizzes` VALUES
('15098cab-72fd-4481-9846-5b3c55a96a32','b5245bb8-482e-4229-bd4f-0f80119eaaf4','course','23350dc6-e513-45af-8959-0fdc673e6ace',NULL,NULL,'Quiz aziz','juste envoyer les réponse',70,NULL,0,0,1,1,'2026-09-21 13:54:03.038','2026-09-21 13:55:52.211'),
('975d4b36-4a9f-4da9-893f-3ce3436941b5','2b902f76-1048-4a36-a492-9f8c3bfcea18','formation',NULL,NULL,'2b902f76-1048-4a36-a492-9f8c3bfcea18','Quiz final','reponds simplement',70,2,1,1,1,1,'2026-11-05 08:38:59.578','2026-11-05 08:42:10.691');
/*!40000 ALTER TABLE `quizzes` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `sections`
--

DROP TABLE IF EXISTS `sections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sections` (
  `id` varchar(191) NOT NULL,
  `formationId` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `position` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sections_id_formationId_key` (`id`,`formationId`),
  KEY `sections_formationId_position_idx` (`formationId`,`position`),
  CONSTRAINT `sections_formationId_fkey` FOREIGN KEY (`formationId`) REFERENCES `formations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `sections_position_check` CHECK (`position` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sections`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `sections` WRITE;
/*!40000 ALTER TABLE `sections` DISABLE KEYS */;
INSERT INTO `sections` VALUES
('1625faeb-44dc-4491-be9d-d2300b511107','8450352f-b35e-496a-b3da-92872dfd7a7e','Contenu',NULL,0,'2026-09-26 08:14:44.914','2026-09-26 08:14:44.914'),
('2ac9c870-88cc-4e91-ae10-53e3862adeec','0dfb27a5-c466-44d2-b8d9-032f6fee4a78','Chapitre 1',NULL,0,'2026-09-21 11:10:18.912','2026-09-21 11:10:18.912'),
('3237f5e0-de61-48c5-9d17-29d3947068e3','2cf07958-5a80-4cdd-8bce-2080fb74ab4f','Régimes et charges',NULL,0,'2026-10-06 14:51:48.807','2026-10-06 14:51:48.807'),
('6c87f5ea-b352-40c6-ac98-ae8d4c8d69e8','21d0e24a-224a-4af9-8e77-3c902ea12199','Les fondations','À quoi sert la comptabilité et comment on enregistre une opération.',0,'2026-10-06 14:51:48.750','2026-10-06 14:51:48.750'),
('7fe2500c-5e4c-4e1c-a5b2-3fd4c7822dd5','a485b226-95af-4eae-b360-c0e3c6f4f812','Contenu',NULL,0,'2026-10-06 14:51:48.848','2026-10-06 14:51:48.848'),
('96238a08-9abd-4dd9-9259-64d6471586ac','2b902f76-1048-4a36-a492-9f8c3bfcea18','deux',NULL,0,'2026-11-05 08:42:18.332','2026-11-05 08:42:38.293'),
('a1bfc9d3-3559-4ddd-a0e2-71078f797f27','b5245bb8-482e-4229-bd4f-0f80119eaaf4','Chapitre 1',NULL,0,'2026-09-21 13:52:37.950','2026-09-21 13:52:37.984'),
('c78616e0-340f-4477-ac9c-74c957b24f71','a7828933-f8f2-4ce5-b609-0b1e4f373d36','Le plan de trésorerie',NULL,0,'2026-10-06 14:51:48.835','2026-10-06 14:51:48.835'),
('dc9191b6-23d7-4293-bf46-fa05a1b46fa9','21d0e24a-224a-4af9-8e77-3c902ea12199','Lire les documents de synthèse','Le bilan, le compte de résultat et pour aller plus loin.',1,'2026-10-06 14:51:48.775','2026-10-06 14:51:48.775'),
('e7aa5c30-40bc-4846-8f05-65e9393fe009','2cf07958-5a80-4cdd-8bce-2080fb74ab4f','Contrôle fiscal',NULL,1,'2026-10-06 14:51:48.821','2026-10-06 14:51:48.821');
/*!40000 ALTER TABLE `sections` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `simulation_scenarios`
--

DROP TABLE IF EXISTS `simulation_scenarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `simulation_scenarios` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `simulator` varchar(191) NOT NULL,
  `title` varchar(120) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `inputs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`inputs`)),
  `hypotheses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`hypotheses`)),
  `versions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`versions`)),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `simulation_scenarios_userId_createdAt_idx` (`userId`,`createdAt`),
  CONSTRAINT `simulation_scenarios_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `simulation_scenarios`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `simulation_scenarios` WRITE;
/*!40000 ALTER TABLE `simulation_scenarios` DISABLE KEYS */;
INSERT INTO `simulation_scenarios` VALUES
('1dfb2f1c-458d-445c-84da-320eacc43eb1','dd81c796-b6b8-49bd-a807-876c1c531d0b','strategies-dettes','azoz','DZD','{\"debts\":[{\"label\":\"azoz\",\"balance\":1200000,\"annualRate\":0.06,\"minimumPayment\":100000}],\"extraPayment\":0}','{\"periodes_par_an\":12,\"versement_supplementaire\":0}','{\"F017\":1,\"ALG-01\":1}','2026-10-17 09:34:57.442','2026-10-17 09:34:57.442'),
('3914cf39-1e98-40a6-9595-3c0a484a8bf8','dd81c796-b6b8-49bd-a807-876c1c531d0b','strategies-dettes','1212','DZD','{\"debts\":[{\"label\":\"123\",\"balance\":11000,\"annualRate\":0.1,\"minimumPayment\":12200}],\"extraPayment\":0}','{\"periodes_par_an\":12,\"versement_supplementaire\":0}','{\"F017\":1,\"ALG-01\":1}','2026-10-17 09:40:31.142','2026-10-17 09:40:31.142'),
('45d206f4-6f46-4f87-a799-9d621e482b78','dd81c796-b6b8-49bd-a807-876c1c531d0b','budget-fin-de-mois','la derniere semaine 2','DZD','{\"currentBalance\":500000,\"remainingDays\":7,\"remainingBills\":300000,\"dailySpendingReference\":20000}',NULL,'{\"F012\":1,\"F013\":1}','2026-10-17 09:33:15.914','2026-10-17 09:33:15.914'),
('67e8e87d-9e63-484d-a992-b6db81e12fe2','dd81c796-b6b8-49bd-a807-876c1c531d0b','projection-retraite','la derniere semaine 23','DZD','{\"capital\":10000000,\"monthlyContribution\":20100,\"years\":3,\"monthlyRate\":0.12,\"inflation\":0.1}','{\"rendement_mensuel\":0.12,\"inflation\":0.1,\"horizon_annees\":3}','{\"F029\":1,\"F030\":1,\"F031\":1,\"F033\":1}','2026-10-17 09:39:36.169','2026-10-17 09:39:36.169'),
('b27209cd-0bc8-4e35-b496-5af02cc80bc3','dd81c796-b6b8-49bd-a807-876c1c531d0b','budget-fin-de-mois','la derniere semaine','DZD','{\"currentBalance\":1000000,\"remainingDays\":17,\"remainingBills\":0,\"dailySpendingReference\":20000}',NULL,'{\"F012\":1,\"F013\":1}','2026-10-17 09:32:24.594','2026-10-17 09:32:24.594'),
('e72bd6de-7d90-4c70-a08b-c8401130f3da','dd81c796-b6b8-49bd-a807-876c1c531d0b','premier-salaire','test','DZD','{\"net\":5000000,\"housing\":0,\"transport\":700000,\"food\":1500000,\"otherExpenses\":600000,\"savingsTarget\":2000000}',NULL,'{\"F003\":1,\"F004\":1,\"F007\":1,\"F008\":1,\"F009\":1}','2026-10-17 09:38:16.755','2026-10-17 09:38:16.755'),
('ea337d80-f678-48a8-a326-b28d978c0bf4','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','budget-fin-de-mois','la crise','DZD','{\"currentBalance\":2500000,\"remainingDays\":30,\"remainingBills\":2000000,\"dailySpendingReference\":20000}',NULL,'{\"F012\":1,\"F013\":1}','2026-11-04 14:22:13.163','2026-11-04 14:22:13.163');
/*!40000 ALTER TABLE `simulation_scenarios` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `id` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `tags_slug_key` (`slug`),
  CONSTRAINT `tags_slug_check` CHECK (`slug` collate utf8mb4_bin regexp '^[a-z0-9]+(-[a-z0-9]+)*$' and octet_length(`slug`) <= 80)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` VALUES
('0c8edbe8-8f96-46ae-a725-763853568f2f','demo-fiscalite','fiscalité','2026-10-06 14:51:48.882'),
('40985e9c-8d4d-457d-a90a-ec87dd00af79','demo-gestion','gestion','2026-10-06 14:51:48.879'),
('7837a2cc-a3a9-4dd7-8a3d-13b8c8402824','gestion','gestion','2026-09-22 07:07:51.544'),
('fe9d496a-1f5d-43a0-b45b-bbeff5be14cb','fiscalite','fiscalité','2026-09-22 07:07:51.544');
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `tool_favorites`
--

DROP TABLE IF EXISTS `tool_favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tool_favorites` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `code` varchar(20) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `tool_favorites_userId_code_key` (`userId`,`code`),
  KEY `tool_favorites_userId_createdAt_idx` (`userId`,`createdAt`),
  CONSTRAINT `tool_favorites_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tool_favorites`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `tool_favorites` WRITE;
/*!40000 ALTER TABLE `tool_favorites` DISABLE KEYS */;
/*!40000 ALTER TABLE `tool_favorites` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_sessions` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `device` varchar(120) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `lastSeenAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `revokedAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_sessions_userId_revokedAt_idx` (`userId`,`revokedAt`),
  CONSTRAINT `user_sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_sessions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `user_sessions` WRITE;
/*!40000 ALTER TABLE `user_sessions` DISABLE KEYS */;
INSERT INTO `user_sessions` VALUES
('07714081-de67-4cc9-a310-984c45da641a','55ebe856-2adf-4aa6-9f70-43bf06ca29e0','Chrome · Windows','2026-11-05 09:03:26.338','2026-11-05 09:03:26.338',NULL),
('089d8147-dfec-4701-8bbc-314bfcb81c28','087b8449-6ea8-4478-9a2a-097b0a43fc72','Chrome · Windows','2026-11-04 15:32:09.219','2026-11-04 15:32:09.219',NULL),
('08e6c399-804a-46a8-a11d-902f54bfa041','8f072244-32a1-4ab9-9a0a-3dd441ef560a','Appareil inconnu','2026-11-04 15:13:21.507','2026-11-04 15:13:21.507',NULL),
('0a81f244-8e60-4b03-b675-4116d3c12e79','087b8449-6ea8-4478-9a2a-097b0a43fc72','Appareil inconnu','2026-11-04 15:48:32.941','2026-11-04 15:48:32.941',NULL),
('0da3f268-d130-49c1-b6bc-b90526305aa0','55ebe856-2adf-4aa6-9f70-43bf06ca29e0','Chrome · Windows','2026-11-04 15:38:12.553','2026-11-04 15:38:12.553',NULL),
('0e857bdc-b2e8-449f-a9ef-c4ed1e3bb448','087b8449-6ea8-4478-9a2a-097b0a43fc72','Appareil inconnu','2026-11-05 09:04:01.680','2026-11-05 09:04:01.680',NULL),
('0ec56522-63af-4197-9d2c-3fa6d27fbff3','087b8449-6ea8-4478-9a2a-097b0a43fc72','Chrome · Windows','2026-11-04 15:21:23.181','2026-11-04 15:21:23.181',NULL),
('0fd39eeb-7d0a-46ee-988f-328359b93cdc','087b8449-6ea8-4478-9a2a-097b0a43fc72','Appareil inconnu','2026-11-04 15:43:22.346','2026-11-04 15:43:22.346',NULL),
('1694c010-02d2-41c7-a5c1-1f946782da5c','087b8449-6ea8-4478-9a2a-097b0a43fc72','Chrome · Windows','2026-11-05 09:05:08.219','2026-11-05 09:05:08.219',NULL),
('171c3230-d006-432d-a00f-adf3d0f6a6c9','087b8449-6ea8-4478-9a2a-097b0a43fc72','Appareil inconnu','2026-11-05 09:09:16.928','2026-11-05 09:09:16.928',NULL),
('1782dedf-10cb-4dbc-84c9-9ec814ae9759','087b8449-6ea8-4478-9a2a-097b0a43fc72','Chrome · Windows','2026-11-04 15:30:40.166','2026-11-04 15:30:40.166',NULL),
('1a8a1026-4781-4a9f-8f11-ff916ff42ee9','0c56432a-ba94-44ac-bacf-8309ab92a755','Chrome · Windows','2026-11-05 08:58:47.333','2026-11-05 08:58:47.333',NULL),
('1aee4d53-30cd-4a2f-a4f6-f9506ea6a230','087b8449-6ea8-4478-9a2a-097b0a43fc72','Appareil inconnu','2026-11-05 08:53:47.513','2026-11-05 08:53:47.513',NULL),
('1f0cfd34-7fe0-48ae-bdf1-d6051bae78ee','087b8449-6ea8-4478-9a2a-097b0a43fc72','Chrome · Windows','2026-11-04 15:47:57.659','2026-11-04 15:47:57.659',NULL),
('269159ea-af28-4bae-af65-9d1dfa9b4cd3','0c56432a-ba94-44ac-bacf-8309ab92a755','Chrome · Windows','2026-11-05 08:56:30.401','2026-11-05 08:56:30.401',NULL),
('27959cc3-58c2-42d9-bf12-c0503e46d57e','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','Edge · Windows','2026-11-05 07:36:00.185','2026-11-05 08:25:00.080','2026-11-05 08:27:09.613'),
('287822af-f936-4174-8daf-1dcbca53f054','087b8449-6ea8-4478-9a2a-097b0a43fc72','Chrome · Windows','2026-11-05 09:09:23.650','2026-11-05 09:09:23.650',NULL),
('2f4ec4f6-b9be-452c-89fa-e5dc9cd862cc','087b8449-6ea8-4478-9a2a-097b0a43fc72','Appareil inconnu','2026-11-05 10:50:19.632','2026-11-05 10:50:19.632',NULL),
('32f5f97c-1265-4488-90cb-3afd806841da','087b8449-6ea8-4478-9a2a-097b0a43fc72','Chrome · Windows','2026-11-05 10:53:00.941','2026-11-05 10:53:00.941',NULL),
('36f4b071-62ff-49f5-8970-08c8ad59fea8','0cfc5721-6267-497b-8e74-4d11719d1346','Appareil inconnu','2026-11-04 15:13:21.975','2026-11-04 15:13:21.975',NULL),
('377bcd73-f4d5-43b0-892b-e412a63ec5a4','cfd4b09e-951f-4941-adce-ef642f959ad7','Appareil inconnu','2026-11-04 15:13:20.522','2026-11-04 15:13:20.522',NULL),
('3c16b57c-4fc3-4044-8538-6d6edccd124f','087b8449-6ea8-4478-9a2a-097b0a43fc72','Appareil inconnu','2026-11-04 15:41:10.423','2026-11-04 15:41:10.423',NULL),
('42650e40-a4a5-48f5-926f-cadbd53b6fee','0c56432a-ba94-44ac-bacf-8309ab92a755','Chrome · Windows','2026-11-05 08:58:51.320','2026-11-05 08:58:51.320',NULL),
('45b9e9ad-880d-4e24-9ed9-0cddfc6aecb8','087b8449-6ea8-4478-9a2a-097b0a43fc72','Appareil inconnu','2026-11-04 15:41:11.553','2026-11-04 15:41:11.553',NULL),
('4c275b6c-4e89-4099-a490-7f4e68060cf0','087b8449-6ea8-4478-9a2a-097b0a43fc72','Appareil inconnu','2026-11-05 09:09:16.394','2026-11-05 09:09:16.394',NULL),
('4e4a59fc-1314-4774-8e11-ff54fea6ada9','dd81c796-b6b8-49bd-a807-876c1c531d0b','Edge · Windows','2026-11-05 08:30:06.614','2026-11-05 11:29:43.834',NULL),
('4ed88cc6-ddd0-4a4b-8d91-fcba404386c6','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','Edge · Windows','2026-11-04 14:53:38.546','2026-11-04 15:14:46.912',NULL),
('583e0b7a-3020-415e-8f48-925862907d0e','087b8449-6ea8-4478-9a2a-097b0a43fc72','Appareil inconnu','2026-11-04 15:42:37.621','2026-11-04 15:42:37.621',NULL),
('590bb071-3769-44b8-b44e-a96135df3d90','087b8449-6ea8-4478-9a2a-097b0a43fc72','Chrome · Windows','2026-11-05 08:55:49.392','2026-11-05 08:55:49.392',NULL),
('5baf5293-49e6-4234-9790-1f51f5282493','55ebe856-2adf-4aa6-9f70-43bf06ca29e0','Appareil inconnu','2026-11-04 15:41:12.094','2026-11-04 15:41:12.094',NULL),
('5dbaf07b-ea71-49f8-a516-be7373b8620a','087b8449-6ea8-4478-9a2a-097b0a43fc72','Chrome · Windows','2026-11-04 15:37:15.971','2026-11-04 15:37:15.971',NULL),
('61aa90cb-294d-4f1d-9b3d-d5f3e712fbd6','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','Edge · Windows','2026-11-05 07:31:52.695','2026-11-05 07:31:52.695','2026-11-05 07:35:54.115'),
('64391231-a512-4ee8-aa7d-0fefc2b92f8d','087b8449-6ea8-4478-9a2a-097b0a43fc72','Chrome · Windows','2026-11-05 09:09:05.253','2026-11-05 09:09:05.253',NULL),
('6679a085-1a61-4416-99b7-c84d3290aa00','0c56432a-ba94-44ac-bacf-8309ab92a755','Appareil inconnu','2026-11-05 09:08:13.244','2026-11-05 09:08:13.244',NULL),
('69144378-f56a-44fb-be99-26eea0dc9763','087b8449-6ea8-4478-9a2a-097b0a43fc72','Appareil inconnu','2026-11-05 10:50:18.630','2026-11-05 10:50:18.630',NULL),
('6d277d45-dd28-44c8-ad81-770e32fd6ce5','087b8449-6ea8-4478-9a2a-097b0a43fc72','Chrome · Windows','2026-11-04 15:48:01.814','2026-11-04 15:48:01.814',NULL),
('718052b7-7088-4efe-a334-faa3e2da6f78','087b8449-6ea8-4478-9a2a-097b0a43fc72','Appareil inconnu','2026-11-04 15:31:39.736','2026-11-04 15:31:39.736',NULL),
('737077ed-9980-46f0-b0be-68005d1f28f6','55ebe856-2adf-4aa6-9f70-43bf06ca29e0','Appareil inconnu','2026-11-04 15:37:50.575','2026-11-04 15:37:50.575',NULL),
('739ed8be-a17a-48ff-9d8a-0408de8f4fd5','087b8449-6ea8-4478-9a2a-097b0a43fc72','Appareil inconnu','2026-11-05 09:09:15.870','2026-11-05 09:09:15.870',NULL),
('75294c07-b584-4eba-8789-0b5e86b1c53d','087b8449-6ea8-4478-9a2a-097b0a43fc72','Chrome · Windows','2026-11-04 15:14:08.507','2026-11-04 15:14:08.507',NULL),
('7a119d6e-fa36-4a7d-834f-ee9a219968ff','0c56432a-ba94-44ac-bacf-8309ab92a755','Chrome · Windows','2026-11-05 09:08:00.855','2026-11-05 09:08:00.855',NULL),
('7b595bfc-2bca-432c-9aca-3abe0c836eab','087b8449-6ea8-4478-9a2a-097b0a43fc72','Appareil inconnu','2026-11-05 10:50:18.052','2026-11-05 10:50:18.052',NULL),
('8631c436-e2fe-4595-abb2-282b62950b80','55ebe856-2adf-4aa6-9f70-43bf06ca29e0','Appareil inconnu','2026-11-05 09:03:25.042','2026-11-05 09:03:25.042',NULL),
('89af26dd-4d00-4bee-a38e-216ac4f4acef','0c56432a-ba94-44ac-bacf-8309ab92a755','Chrome · Windows','2026-11-05 09:01:29.098','2026-11-05 09:01:29.098',NULL),
('8d7a9a50-aa2a-4422-b2d5-689f89d8e26b','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','Edge · Windows','2026-11-04 13:04:48.216','2026-11-04 14:49:56.633','2026-11-04 14:53:35.085'),
('8e4e2014-f0a0-4fc3-88f9-4f1423ff23e4','0c56432a-ba94-44ac-bacf-8309ab92a755','Chrome · Windows','2026-11-05 09:08:53.473','2026-11-05 09:08:53.473',NULL),
('96ed8a1a-70da-47f5-b76f-e32fe8708048','087b8449-6ea8-4478-9a2a-097b0a43fc72','Appareil inconnu','2026-11-04 15:31:40.093','2026-11-04 15:31:40.093',NULL),
('9a9afcb8-eabb-47d5-958f-8520eb6a59ee','55ebe856-2adf-4aa6-9f70-43bf06ca29e0','Chrome · Windows','2026-11-04 15:38:38.852','2026-11-04 15:38:38.852',NULL),
('9b669fb3-c7c4-4962-b472-799b90a3a06b','087b8449-6ea8-4478-9a2a-097b0a43fc72','Chrome · Windows','2026-11-04 15:14:13.979','2026-11-04 15:14:13.979',NULL),
('a4379817-b246-4d29-98c5-ee0cf4b7bbd6','781b23dd-74e6-4f4c-b841-18097e54ea2b','Appareil inconnu','2026-11-04 15:13:20.063','2026-11-04 15:13:20.063',NULL),
('a49bfb1e-e07d-40ed-b5d1-9108dbb54581','087b8449-6ea8-4478-9a2a-097b0a43fc72','Chrome · Windows','2026-11-05 09:03:03.858','2026-11-05 09:03:03.858',NULL),
('a7222d3a-04a3-49df-b817-19393b6c6304','ccbc8d27-42db-40b3-a66f-fab62e3cfc99','Appareil inconnu','2026-11-04 15:13:21.008','2026-11-04 15:13:21.008',NULL),
('a7dc3580-fa11-4844-8c2e-fa73f354cd74','087b8449-6ea8-4478-9a2a-097b0a43fc72','Chrome · Windows','2026-11-04 15:26:05.093','2026-11-04 15:26:05.093',NULL),
('ab1b42d5-e17b-4220-9213-b8f47e84928b','087b8449-6ea8-4478-9a2a-097b0a43fc72','Chrome · Windows','2026-11-04 15:29:45.596','2026-11-04 15:29:45.596',NULL),
('acd2683c-6c39-4253-84d0-febe1cb80047','087b8449-6ea8-4478-9a2a-097b0a43fc72','Appareil inconnu','2026-11-04 15:30:03.138','2026-11-04 15:30:03.138',NULL),
('b0173fc1-8e29-4088-b34c-fc438fceb6d3','087b8449-6ea8-4478-9a2a-097b0a43fc72','Chrome · Windows','2026-11-05 10:53:41.319','2026-11-05 10:53:41.319',NULL),
('b44a5b4f-2fe5-44c0-a76b-fec4903add43','0c56432a-ba94-44ac-bacf-8309ab92a755','Chrome · Windows','2026-11-05 11:32:45.258','2026-11-05 11:32:45.258',NULL),
('b4729c88-cfec-42d9-a1e7-de8d462fec47','0c56432a-ba94-44ac-bacf-8309ab92a755','Chrome · Windows','2026-11-05 11:32:41.252','2026-11-05 11:32:41.252',NULL),
('b5b1b68f-57ef-4635-b204-2b2fca5547a2','55ebe856-2adf-4aa6-9f70-43bf06ca29e0','Appareil inconnu','2026-11-04 15:39:53.983','2026-11-04 15:39:53.983',NULL),
('b74edf88-6b09-403a-b8d3-e2ba492eeb9c','087b8449-6ea8-4478-9a2a-097b0a43fc72','Chrome · Windows','2026-11-04 15:45:11.367','2026-11-04 15:45:11.367',NULL),
('b833083d-35cf-4252-ae6b-60f4811e2c8d','55ebe856-2adf-4aa6-9f70-43bf06ca29e0','Appareil inconnu','2026-11-04 15:41:02.241','2026-11-04 15:41:02.241',NULL),
('b9c08f7e-c16d-43f5-8af7-44c4f1b31f8c','087b8449-6ea8-4478-9a2a-097b0a43fc72','Appareil inconnu','2026-11-05 09:05:01.052','2026-11-05 09:05:01.052',NULL),
('bd560d49-5aea-4b67-9a1c-9b56998f4aa1','0c56432a-ba94-44ac-bacf-8309ab92a755','Chrome · Windows','2026-11-05 08:56:50.355','2026-11-05 08:56:50.355',NULL),
('bea6b3bd-a553-4fa0-81f1-41dd8fc72e32','087b8449-6ea8-4478-9a2a-097b0a43fc72','Appareil inconnu','2026-11-04 15:30:11.115','2026-11-04 15:30:11.115',NULL),
('c155104c-7688-4629-ac87-402750400fac','087b8449-6ea8-4478-9a2a-097b0a43fc72','Chrome · Windows','2026-11-04 15:29:01.877','2026-11-04 15:29:01.877',NULL),
('c4887ea1-166b-4144-aa1e-262fd0fef4b5','087b8449-6ea8-4478-9a2a-097b0a43fc72','Chrome · Windows','2026-11-04 15:47:26.541','2026-11-04 15:47:26.541',NULL),
('cef3b0ee-d53d-432f-8d70-ab815aba431e','087b8449-6ea8-4478-9a2a-097b0a43fc72','Chrome · Windows','2026-11-04 15:37:28.409','2026-11-04 15:37:28.409',NULL),
('cf6e4a74-ed4d-4caf-9713-7f2f16d03096','55ebe856-2adf-4aa6-9f70-43bf06ca29e0','Appareil inconnu','2026-11-04 15:37:42.947','2026-11-04 15:37:42.947',NULL),
('d2ebab9e-4f93-453e-bfe5-af7d20ebacce','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','Edge · Windows','2026-11-04 10:22:22.740','2026-11-04 10:22:22.740','2026-11-04 10:24:17.214'),
('d4968b61-5c60-44cf-aeef-c55e61642a37','55ebe856-2adf-4aa6-9f70-43bf06ca29e0','Appareil inconnu','2026-11-04 15:38:50.478','2026-11-04 15:38:50.478',NULL),
('d75a046d-5375-4a7e-b79f-89046d27aa14','dd81c796-b6b8-49bd-a807-876c1c531d0b','Edge · Windows','2026-11-03 14:30:48.540','2026-11-04 10:17:14.416','2026-11-04 10:17:32.601'),
('db92629b-bcb8-41c7-a196-7151bab410fd','0c56432a-ba94-44ac-bacf-8309ab92a755','Chrome · Windows','2026-11-05 08:56:54.201','2026-11-05 08:56:54.201',NULL),
('ddc2eae6-2a99-4b06-9252-901a1a527500','087b8449-6ea8-4478-9a2a-097b0a43fc72','Appareil inconnu','2026-11-05 08:53:42.440','2026-11-05 08:53:42.440',NULL),
('e29a9e8b-bd36-4748-bde7-098f800d751d','087b8449-6ea8-4478-9a2a-097b0a43fc72','Chrome · Windows','2026-11-04 15:24:32.497','2026-11-04 15:24:32.497',NULL),
('e670f5ec-5e58-401c-8714-9c4f1c2e68fe','087b8449-6ea8-4478-9a2a-097b0a43fc72','Appareil inconnu','2026-11-04 15:47:56.084','2026-11-04 15:47:56.084',NULL),
('e74f7855-81be-46d0-94d2-1ebb8b360ae9','55ebe856-2adf-4aa6-9f70-43bf06ca29e0','Appareil inconnu','2026-11-04 15:41:09.937','2026-11-04 15:41:09.937',NULL),
('e87deb95-79f2-4060-bc0d-14fb085fcd8e','0c56432a-ba94-44ac-bacf-8309ab92a755','Chrome · Windows','2026-11-05 09:07:35.850','2026-11-05 09:07:35.850',NULL),
('ea373480-cf41-45fd-a24f-6b6740da21f3','087b8449-6ea8-4478-9a2a-097b0a43fc72','Chrome · Windows','2026-11-04 15:26:56.686','2026-11-04 15:26:56.686',NULL),
('ebbb1808-941e-469e-be4c-1fb63b5f0b03','55ebe856-2adf-4aa6-9f70-43bf06ca29e0','Chrome · Windows','2026-11-04 15:37:56.317','2026-11-04 15:37:56.317',NULL),
('f18089e7-ef73-4635-8a63-c257f432c6b1','087b8449-6ea8-4478-9a2a-097b0a43fc72','Appareil inconnu','2026-11-05 10:50:19.134','2026-11-05 10:50:19.134',NULL),
('f1c22387-d27c-4360-9dbc-72b07b6a69ac','087b8449-6ea8-4478-9a2a-097b0a43fc72','Chrome · Windows','2026-11-04 15:18:46.434','2026-11-04 15:18:46.434',NULL),
('f208892f-af9a-43f7-877e-7dea76acaa03','dd81c796-b6b8-49bd-a807-876c1c531d0b','Edge · Windows','2026-11-04 10:21:59.561','2026-11-04 10:21:59.561','2026-11-04 10:22:17.414'),
('f3a61777-cd36-46a8-a8ea-06351fbaaeb3','087b8449-6ea8-4478-9a2a-097b0a43fc72','Appareil inconnu','2026-11-04 15:47:24.617','2026-11-04 15:47:24.617',NULL),
('f3cfe772-501f-4e95-844b-fab550feffb1','030c2429-b6d4-4764-9ea9-9abb2b00ce4a','Edge · Windows','2026-11-04 10:25:39.857','2026-11-04 12:35:32.489','2026-11-04 12:35:37.761'),
('f45b84e8-3eb7-473d-9c8d-0e7457f8250a','0c56432a-ba94-44ac-bacf-8309ab92a755','Chrome · Windows','2026-11-05 08:56:46.535','2026-11-05 08:56:46.535',NULL),
('f55a5299-fe43-42bf-b939-e8cbb0f61048','087b8449-6ea8-4478-9a2a-097b0a43fc72','Chrome · Windows','2026-11-05 09:03:42.373','2026-11-05 09:03:42.373',NULL),
('f6bae4a1-a96a-4f3c-9504-cf478fcc9187','dd81c796-b6b8-49bd-a807-876c1c531d0b','Edge · Windows','2026-11-05 08:27:13.275','2026-11-05 08:27:13.275','2026-11-05 08:30:00.900'),
('f722b8d1-a6df-45fa-88ac-01caced373b6','087b8449-6ea8-4478-9a2a-097b0a43fc72','Chrome · Windows','2026-11-05 09:10:10.779','2026-11-05 09:10:10.779',NULL),
('f75ea118-8e61-4644-a331-9e83931966b0','087b8449-6ea8-4478-9a2a-097b0a43fc72','Chrome · Windows','2026-11-04 15:15:33.284','2026-11-04 15:15:33.284',NULL);
/*!40000 ALTER TABLE `user_sessions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(191) NOT NULL,
  `email` varchar(254) NOT NULL,
  `passwordHash` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `accountType` varchar(191) NOT NULL,
  `accessLevel` varchar(191) NOT NULL DEFAULT 'standard',
  `role` varchar(191) NOT NULL DEFAULT 'user',
  `status` varchar(191) NOT NULL DEFAULT 'active',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `finAgeRange` varchar(191) DEFAULT NULL,
  `finCountry` varchar(2) DEFAULT NULL,
  `finCurrency` varchar(3) NOT NULL DEFAULT 'DZD',
  `finHorizon` varchar(191) DEFAULT NULL,
  `finMainIntention` varchar(191) DEFAULT NULL,
  `finOnboardedAt` datetime(3) DEFAULT NULL,
  `finPublic` varchar(191) DEFAULT NULL,
  `finSecondaryPublics` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '[]' CHECK (json_valid(`finSecondaryPublics`)),
  `finSituation` varchar(191) DEFAULT NULL,
  `finReserveTargetMonths` int(11) DEFAULT NULL,
  `finNotificationSettings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '{}' CHECK (json_valid(`finNotificationSettings`)),
  `finIncomeRegularity` varchar(10) NOT NULL DEFAULT 'stable',
  `finFirstSteps` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '{}' CHECK (json_valid(`finFirstSteps`)),
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`),
  CONSTRAINT `users_role_check` CHECK (`role` in ('user','admin')),
  CONSTRAINT `users_accessLevel_check` CHECK (`accessLevel` in ('standard','premium')),
  CONSTRAINT `users_status_check` CHECK (`status` in ('active','suspended')),
  CONSTRAINT `users_fin_secondary_publics_check` CHECK (json_type(`finSecondaryPublics`) = 'ARRAY'),
  CONSTRAINT `users_fin_currency_check` CHECK (`finCurrency` collate utf8mb4_bin regexp '^[A-Z]{3}$'),
  CONSTRAINT `users_finReserveTargetMonths_check` CHECK (`finReserveTargetMonths` is null or `finReserveTargetMonths` >= 0),
  CONSTRAINT `users_notification_settings_check` CHECK (json_type(`finNotificationSettings`) = 'OBJECT'),
  CONSTRAINT `users_fin_age_range_check` CHECK (`finAgeRange` is null or `finAgeRange` in ('under13','13-18','19-24','25-34','35-49','50-64','65plus')),
  CONSTRAINT `users_fin_public_check` CHECK (`finPublic` is null or `finPublic` in ('LYC','ETU','JAC','SAL','COL','COU','FAM','EPG','AUT'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
('030c2429-b6d4-4764-9ea9-9abb2b00ce4a','azizsellal.idh@gmail.com','$2b$12$KTLZV0Pqh3QhKK8Lb2O7teY6Qheu0Mu1AJ9cRI/mu68JlSARIk5K6','aziz sellal','pme','premium','user','active','2026-09-20 07:55:35.592','2026-11-04 14:40:38.635','25-34',NULL,'DZD','2028','Mariage','2026-11-04 10:39:07.585','JAC','[\"SAL\"]','salarié',NULL,'{}','stable','{}'),
('087b8449-6ea8-4478-9a2a-097b0a43fc72','salarie@demo.fincludia.local','$2b$10$youmJgdSDoZE/5HlGNzF4utxWr5jdqJQlSEJwGRtrrtsyqwUvXSg6','Yasmine Salariée','salarie','standard','user','active','2026-11-03 10:21:37.036','2026-11-03 10:21:37.036','25-34',NULL,'DZD',NULL,NULL,'2026-11-03 10:21:37.031','SAL','[]',NULL,NULL,'{}','stable','{}'),
('08fb6c4e-5b4c-42a5-b499-2ea486544b98','amis.nour@demo.fincludia.local','$2b$10$youmJgdSDoZE/5HlGNzF4utxWr5jdqJQlSEJwGRtrrtsyqwUvXSg6','Nour Amie','salarie','standard','user','active','2026-11-03 10:21:52.767','2026-11-03 10:21:52.767','25-34',NULL,'DZD',NULL,NULL,'2026-11-03 10:21:52.765','SAL','[]',NULL,NULL,'{}','stable','{}'),
('0c56432a-ba94-44ac-bacf-8309ab92a755','admin@demo.fincludia.local','$2b$10$2/M4aw/oeFpoVug563W8A.Kt0A7kJv9pFY7LFL3ZLX0GtrFf1Frfq','Admin Démo','salarie','standard','admin','active','2026-11-05 08:56:24.634','2026-11-05 08:56:24.634','25-34',NULL,'DZD',NULL,NULL,'2026-11-05 08:56:24.559','SAL','[]',NULL,NULL,'{}','stable','{}'),
('0cfc5721-6267-497b-8e74-4d11719d1346','essai.r101.5.1719@demo.fincludia.local','$2b$12$e8GDLoXP4fWucIknvCUVX.c8X63I8G5oSDZ9K89L3pwBKX2Sa.d/u','Essai 5','salarie','standard','user','active','2026-11-04 15:13:21.883','2026-11-04 15:13:21.883',NULL,NULL,'DZD',NULL,NULL,NULL,NULL,'[]',NULL,NULL,'{}','stable','{}'),
('2f9936ff-7b0e-40ea-83ad-18de8c87e949','premium@demo.larbi.test','$2b$10$eGZ.jYg1tHf67e3M3u5XbuCqk1zeKj9wyFWDcGbeFBF/c763/4MjK','Karim Premium','pme','premium','user','active','2026-10-06 14:51:48.733','2026-10-06 14:51:48.733',NULL,NULL,'DZD',NULL,NULL,NULL,NULL,'[]',NULL,NULL,'{}','stable','{}'),
('3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','azizsellal.dz@gmail.com','$2b$12$k8g9uwc1VwonYa8igyDare8jSfcd1Rri8IBqNCrQ3iSW85WXPFnZu','aziz sellal','pmi','premium','user','active','2026-10-17 07:50:50.430','2026-10-17 09:48:32.384','35-49',NULL,'DZD',NULL,NULL,NULL,NULL,'[]',NULL,3,'{\"reminder_upcoming\":{\"optedIn\":true}}','stable','{}'),
('52982f43-bd76-479c-bbe3-d527decd2c63','coloc.lina@demo.fincludia.local','$2b$10$youmJgdSDoZE/5HlGNzF4utxWr5jdqJQlSEJwGRtrrtsyqwUvXSg6','Lina Colocataire','salarie','standard','user','active','2026-11-03 10:21:52.577','2026-11-03 10:21:52.577','19-24',NULL,'DZD',NULL,NULL,'2026-11-03 10:21:52.574','JAC','[]',NULL,NULL,'{}','stable','{}'),
('55ebe856-2adf-4aa6-9f70-43bf06ca29e0','coloc.karim@demo.fincludia.local','$2b$10$youmJgdSDoZE/5HlGNzF4utxWr5jdqJQlSEJwGRtrrtsyqwUvXSg6','Karim Colocataire','etudiant','standard','user','active','2026-11-03 10:21:52.477','2026-11-03 10:21:52.477','19-24',NULL,'DZD',NULL,NULL,'2026-11-03 10:21:52.474','ETU','[]',NULL,NULL,'{}','stable','{}'),
('5daa4745-535e-4e92-824a-a705598eaead','lyceen@demo.fincludia.local','$2b$10$youmJgdSDoZE/5HlGNzF4utxWr5jdqJQlSEJwGRtrrtsyqwUvXSg6','Amine Lycéen','lyceen','standard','user','active','2026-11-03 10:21:48.343','2026-11-03 10:21:48.343','13-18',NULL,'DZD',NULL,NULL,'2026-11-03 10:21:48.340','LYC','[]',NULL,NULL,'{}','stable','{}'),
('6fc2c284-bff5-4b8a-893a-da24525ac358','amis.walid@demo.fincludia.local','$2b$10$youmJgdSDoZE/5HlGNzF4utxWr5jdqJQlSEJwGRtrrtsyqwUvXSg6','Walid Ami','etudiant','standard','user','active','2026-11-03 10:21:52.863','2026-11-03 10:21:52.863','19-24',NULL,'DZD',NULL,NULL,'2026-11-03 10:21:52.861','ETU','[]',NULL,NULL,'{}','stable','{}'),
('781b23dd-74e6-4f4c-b841-18097e54ea2b','essai.r101.1.11272@demo.fincludia.local','$2b$12$Y7j.N9bb277NBCHzc.fkQ.yH4FNiwZ7V7ChQN91iLcg7cdKBVhH82','Essai 1','salarie','standard','user','active','2026-11-04 15:13:19.962','2026-11-04 15:13:19.962',NULL,NULL,'DZD',NULL,NULL,NULL,NULL,'[]',NULL,NULL,'{}','stable','{}'),
('8f072244-32a1-4ab9-9a0a-3dd441ef560a','essai.r101.4.20352@demo.fincludia.local','$2b$12$vFJQI1GLvx9BUJpZa4XBHelh9OLb/zc8VQIndSLTZkAVlUZRbSria','Essai 4','salarie','standard','user','active','2026-11-04 15:13:21.407','2026-11-04 15:13:21.407',NULL,NULL,'DZD',NULL,NULL,NULL,NULL,'[]',NULL,NULL,'{}','stable','{}'),
('9da929b7-d604-461b-ab52-84e2c5dcb02b','couple.sami@demo.fincludia.local','$2b$10$youmJgdSDoZE/5HlGNzF4utxWr5jdqJQlSEJwGRtrrtsyqwUvXSg6','Sami Conjoint','salarie','standard','user','active','2026-11-03 10:21:52.673','2026-11-03 10:21:52.673','25-34',NULL,'DZD',NULL,NULL,'2026-11-03 10:21:52.671','SAL','[]',NULL,NULL,'{}','stable','{}'),
('a668ea3d-14e5-4935-8cd5-5936647e290f','standard@demo.larbi.test','$2b$10$eGZ.jYg1tHf67e3M3u5XbuCqk1zeKj9wyFWDcGbeFBF/c763/4MjK','Sofia Standard','pmi','standard','user','active','2026-10-06 14:51:48.730','2026-10-06 14:51:48.730',NULL,NULL,'DZD',NULL,NULL,NULL,NULL,'[]',NULL,NULL,'{}','stable','{}'),
('ccbc8d27-42db-40b3-a66f-fab62e3cfc99','essai.r101.3.28126@demo.fincludia.local','$2b$12$006epZk7OIu3MFBb6ZnWIetxAPp1NRoJdabMUn/NxkNOZrZVDCeUK','Essai 3','salarie','standard','user','active','2026-11-04 15:13:20.913','2026-11-04 15:13:20.913',NULL,NULL,'DZD',NULL,NULL,NULL,NULL,'[]',NULL,NULL,'{}','stable','{}'),
('cfd4b09e-951f-4941-adce-ef642f959ad7','essai.r101.2.12947@demo.fincludia.local','$2b$12$WuvqsagwhBZMfbHkDGi/FO6B1zZalZOz.aD2xGQP9QAfU4etBDHJi','Essai 2','salarie','standard','user','active','2026-11-04 15:13:20.424','2026-11-04 15:13:20.424',NULL,NULL,'DZD',NULL,NULL,NULL,NULL,'[]',NULL,NULL,'{}','stable','{}'),
('dd81c796-b6b8-49bd-a807-876c1c531d0b','admin@demo.larbi.test','$2b$10$bkAJ8TbCw3aekzY4nscypuhoQSP/oW/YsBidhCwnVDD5FJ.Z6wYEm','Admin Démo','pme','premium','admin','active','2026-10-06 14:51:48.723','2026-10-17 09:27:31.729','25-34',NULL,'DZD',NULL,NULL,NULL,NULL,'[]',NULL,NULL,'{}','stable','{}');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Dumping routines for database 'larbi_dev'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-11-05 11:36:40
