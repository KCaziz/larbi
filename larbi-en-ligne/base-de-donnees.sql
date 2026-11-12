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
('04b11f74-4ba3-498e-9246-dfd32ba53341','8e019262efe5b93b402cc8fa638f5adc129e2be62c638a9490a34738544aa00f',NULL,'20261014090000_fin_shared_expenses','A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20261014090000_fin_shared_expenses\n\nDatabase error code: 1901\n\nDatabase error:\nFunction or expression \'fromId\' cannot be used in the CHECK clause of `fin_settlements_parties_check`\n\nPlease check the query number 16 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"20261014090000_fin_shared_expenses\"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name=\"20261014090000_fin_shared_expenses\"\n             at schema-engine\\commands\\src\\commands\\apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:255','2026-10-13 20:28:48.592','2026-10-13 20:27:17.919',0),
('04f69393-e329-4bf3-bbef-f9444097b2aa','0fdde5f53d48aecad9393d80ab0c6452aabac44cb6b6895e2b348895887e224c','2026-10-27 19:06:57.454','20261027160000_fin_calendar_occurrences',NULL,NULL,'2026-10-27 19:06:57.327',1),
('04fa137d-3660-449b-84ac-792ecf569e91','51649509979b5eb3f1b7d9e41e52dc7690d8a5f0eb0048e4d8a81d6d33660703','2026-10-13 20:29:01.597','20261014090000_fin_shared_expenses',NULL,NULL,'2026-10-13 20:29:00.729',1),
('07647c4d-369b-43e8-8382-dd86e25bb444','71bcf48409e3503947621eb8b5296d84d95bb1fecf9da0051507a9f8e10c12bb','2026-10-17 16:36:27.224','20261017090000_adult_age_19',NULL,NULL,'2026-10-17 16:36:27.194',1),
('09da01b6-f394-4d2e-9deb-1cb6a13e07d4','4ac53abc48edaee03082c3453fa443e2e9a151a9fdb1bd30c54ce7e56904b6ed','2026-10-31 17:33:36.182','20261031130000_fin_shared_expenses_rules',NULL,NULL,'2026-10-31 17:33:35.923',1),
('0ad5cb4d-4721-417f-abbc-ae047817a658','8a6961c55028ff8656d3830d94da503eb80cd177b7cca6f31216ce169ccb8ac5','2026-10-31 16:17:39.597','20261029090000_fin_payslips',NULL,NULL,'2026-10-31 16:17:39.539',1),
('0fe0747c-278a-45a9-957c-83073f90196f','709dee79fca2956599b3224ee50d7e224dc220fba685ae6ab4a478a293d40f9c','2026-11-12 19:52:57.235','20261112120000_fin_budget_account',NULL,NULL,'2026-11-12 19:52:56.977',1),
('1324c13c-3826-42c2-a714-b5a0cebcecb0','caaf204e0dc5d50cf01b3734ce38341161e4b08215c769ccf3c027328a37976a','2026-10-11 18:56:27.582','20261011072704_chatbot_entries',NULL,NULL,'2026-10-11 18:56:27.506',1),
('1d0d0199-a1e3-4d38-883d-32940024c91d','7f4af88a42403f97b8989130cfb232a1f4b812f6dc5db489b47a0f30956e84ea','2026-10-12 00:33:41.325','20261012003049_fin_data_model',NULL,NULL,'2026-10-12 00:33:41.149',1),
('1d7fb3cf-93a6-4aab-aabb-92860ba2b8fa','1c2ad9e7508b7874b1ecd87a0b442502d1764087fb1e639462dcb6b562cb9c10','2026-10-06 21:04:12.729','20261006210000_account_types_seed',NULL,NULL,'2026-10-06 21:04:12.721',1),
('1fc6ce32-2de6-4db2-94e9-54e9fa305c45','e72b7434ebfe90ffe700a0d2744eabdc95a7602398eeb2d1427af460e4ffd95f','2026-10-31 16:17:38.985','20261028090000_fin_transactions_account_cascade',NULL,NULL,'2026-10-31 16:17:38.795',1),
('2381aab9-eb11-40e0-a451-05cbec95b4a8','26cbeb2a17f086abb35cdbeec987d9e50efa0625b13f893464c73168bc244415','2026-11-12 19:45:33.349','20261111120000_occurrence_included',NULL,NULL,'2026-11-12 19:45:33.305',1),
('2643d223-a2e6-4f14-85b8-82a89b7429e1','ee3143b2fd194bb1ed44f6a8befcfe8e802dffe32e4575c41b86ffa2f3b33ac2','2026-10-16 19:41:10.599','20261014133329_fin_notifications',NULL,NULL,'2026-10-16 19:41:10.520',1),
('2668d4d2-777f-4f1c-8a0d-96f78971d12b','9de7d81687704da3e9f9b9c08ff65390e96e9a057016ad64149b3defa79ef94e','2026-10-11 21:21:02.757','20261011212102_apprendre_axes_favorites',NULL,NULL,'2026-10-11 21:21:02.597',1),
('2adb7180-5443-4d83-bf33-aa93ef7e8403','690b76eb02fcd2b11ff99c1fa2d8e08eac1757c44164f216557eca7e56808c54','2026-10-27 18:47:30.944','20261027140000_fin_movements',NULL,NULL,'2026-10-27 18:47:30.748',1),
('313fc39f-6350-4c79-985d-0be2bf8627fb','d09ba6435d87cc08bc49f90476648c2b81d0f4452c938ea9fbff07c4fd4607a1','2026-10-16 19:41:10.518','20261014123925_fin_space_goals_children_provisions',NULL,NULL,'2026-10-16 19:41:10.323',1),
('3400604a-3892-41e4-b31f-f36130dbc9f7','a2387a3a122b7e340bd21b74f901400b2c2f48883c7c076ab44d402c1d8d44a6','2026-10-31 21:23:14.641','20261031220000_fin_missions',NULL,NULL,'2026-10-31 21:23:14.559',1),
('34d518ac-0663-4b81-a535-42a916893131','fdb0e4e67ecf3eb375e0de57936c452e4c779a920bf33c1b4a2208b786be2bf6','2026-10-13 19:43:32.441','20261013200000_fin_spaces',NULL,NULL,'2026-10-13 19:43:31.933',1),
('3dac6170-2370-460d-8e68-48d974c8c1ad','3670ccfae1aab3a75839c96052ddbc1d5f77ac799120ab26d86c12532f439568','2026-11-01 17:49:42.184','20261031230000_fin_shared_receipts',NULL,NULL,'2026-11-01 17:49:42.029',1),
('3dfa7761-8e9f-4ddd-b7ac-87853cdb8dc5','4869cec7e6119847c5420d595b4c7384ab30bfb398e1f44ca4f7bcbae61048fc','2026-11-02 20:35:19.687','20261102140000_fin_space_goal_calendar',NULL,NULL,'2026-11-02 20:35:19.607',1),
('41cd3670-ef48-4d56-8bd2-2826a656d498','7885415c9e62bcca1df35e5e251b08744cf8b9c59f32f22ac1acf4d10713ecfa','2026-11-12 19:45:33.215','20261110100000_chatbot_audience',NULL,NULL,'2026-11-12 19:45:33.192',1),
('4381e42f-cfcc-4fc9-9c6e-849c0f7bf0b0','c1a89437386516552382b73212cdc0f9525222af87998e49d06f761fabdda982','2026-10-31 19:18:53.258','20261031180000_fin_space_group_closing',NULL,NULL,'2026-10-31 19:18:53.209',1),
('47363d6a-17c7-42aa-9d23-7d63f7436841','ce6ac200c0064fc6adb1e5f9140dead1d2befbf5af082dc38313b30200b96665','2026-10-13 19:52:26.724','20261013220000_fin_paper',NULL,NULL,'2026-10-13 19:52:26.357',1),
('4aedaf96-4dfc-4bc8-91d7-69032e66d533','6b16c84176e21f03d3605ee9fa1e7d9843cc2c737a4e13b3b90cdc7eeb781550','2026-10-31 16:27:19.225','20261031120000_user_sessions',NULL,NULL,'2026-10-31 16:27:19.140',1),
('4b65c2eb-f962-49e8-8e79-7544856334ad','03befc59bd8c993f0d51244c913801f33c86a85f539f11f3a24d2fc0d66a96d0','2026-11-12 20:02:33.871','20261112130000_fin_budget_weekly',NULL,NULL,'2026-11-12 20:02:33.777',1),
('4b68744c-9132-44ef-967a-27d2b18735a9','44822cdc4d20ba0e55f89804650c748608d64c829f90f33f5b2b93e0f0abe5d3','2026-10-31 19:06:37.141','20261031170000_fin_space_inflows',NULL,NULL,'2026-10-31 19:06:37.118',1),
('4e6807c4-b229-4312-9fd9-a2fd077ce9d3','a4657e318187850340cecfb6e3da282fe3f95da10542295d8514e76d99cbe8a0','2026-10-27 17:28:43.824','20261027121000_fin_accounts_socle',NULL,NULL,'2026-10-27 17:28:43.602',1),
('50558023-ca31-44aa-a38c-b615f3714002','56d61a8907eb5693dba7fc10bee12ae6942c23405c7f8b00baa98c0c3c3ef697','2026-10-31 17:56:38.624','20261031150000_fin_space_tasks',NULL,NULL,'2026-10-31 17:56:38.606',1),
('51df2bb1-f47f-45ba-8b97-1a9f7f87d1c4','f1c3169b5b2eb087d726e764256c0c7307ba2266cef831a53b6facd460393bf8','2026-10-12 18:57:25.802','20261012185725_fin_money_category_setnull',NULL,NULL,'2026-10-12 18:57:25.732',1),
('567691de-11f9-4c22-85f6-720b12c9ebfc','b6f92a17dc98840850930779fd684056dc7716f0f19e7e8c2075e2ef82abc4b3','2026-10-31 17:52:06.768','20261031140000_fin_space_budgets',NULL,NULL,'2026-10-31 17:52:06.724',1),
('56f13d8f-276d-42fb-a5fa-5156cd7ef755','43dba8dbe2887ff2e6d3fd22b092b48cc6d03c12438fb62fe3a25f30925e28f9','2026-10-11 18:56:28.645','20261011150559_finculdia_p3_18_p2_08_p3_19',NULL,NULL,'2026-10-11 18:56:27.925',1),
('59984097-c795-4e61-b05c-cbbdbe164d9f','86a9b5c4ffc245338bc5eae4414ae041345a9e47717186b1b1a2e6e5b57718a3','2026-10-13 19:32:35.484','20261013180000_fin_assets',NULL,NULL,'2026-10-13 19:32:35.224',1),
('5ca6ebf4-a228-42cd-9314-75ddf08389bf','e73fe3fdf4505a572847f45fd7c2521527f64ff0c80b386def5f934ffad569f9','2026-10-27 17:26:15.683','20261027120000_fin_accounts',NULL,NULL,'2026-10-27 17:26:15.246',1),
('5db2cd6a-623e-45d7-af95-01002f03aac7','2a2c4e81fa6d6ae57569dc321b6bb2a9f05089347e4aff56c05f1a19d3b80501','2026-11-12 19:45:33.051','20261108120000_fin_colors',NULL,NULL,'2026-11-12 19:45:32.725',1),
('65fc622b-ecc3-4d0f-9348-2e6358131973','87dd70d0467dcbf4df09519ef815d2b60f70a72ba6ac2c3b6892df71dc7e8c67','2026-10-31 16:17:39.661','20261029120000_tool_favorites',NULL,NULL,'2026-10-31 16:17:39.602',1),
('70c6e5bc-66d6-4a30-abec-fdaa22e258b8','fdd71df10d0b3c97a877a7ddd635a820eb12c172aa378e8391919477d3a6d37e','2026-11-12 19:45:33.190','20261110090000_fin_recurrence_income',NULL,NULL,'2026-11-12 19:45:33.139',1),
('7259c89b-daac-4afe-b90c-cc08574188a8','223e51b44d16246eb483847e30f6b5a39c28cae6ffd47382b5f6fe99f6300e49','2026-10-12 18:03:39.105','20261012180310_fin_money_onboarding',NULL,NULL,'2026-10-12 18:03:38.877',1),
('74d1478c-4aae-4b53-92cf-12e57a295a53','9ae0fd6123953cc80e6736a2cae0b556615768f5c11e0efbe7440f863d4983b5','2026-11-12 19:45:33.137','20261108140000_fin_exchange_rates',NULL,NULL,'2026-11-12 19:45:33.107',1),
('7a4332a1-e572-48e3-b071-b2d6a0ae2054','0dfeb84646fc31a3f1010816bdcc3439e2d90531800c2e3ad4cb13e64173fec2','2026-10-27 19:21:36.603','20261027170000_fin_goals_accounts',NULL,NULL,'2026-10-27 19:21:36.518',1),
('800d56fa-06bc-4795-9138-13475ba41c8b','a0e9fa143d4b5f68d3b7ced90d41f91aa591b80bd9256ab0d538789a37c4bdef','2026-10-12 18:59:46.141','20261012192000_fin_receipt_on_media',NULL,NULL,'2026-10-12 18:59:46.047',1),
('80a48f54-b0cc-4df5-817d-ef4bc1ad7479','7b112dacf9885ca10bd07e6bc2d161efa3d5cda8d38de0d02797c0687e6c3f2c','2026-10-06 21:04:12.682','20261006204200_integrity_checks',NULL,NULL,'2026-10-06 21:04:12.012',1),
('8daa108f-78a5-46be-841a-bec807e32011','c3c90444b4bceb90092155cf48ca284166dbf9bedc08a65f9c19eed6470db4f0','2026-10-31 16:17:39.430','20261028130000_fin_categories_retired',NULL,NULL,'2026-10-31 16:17:39.223',1),
('902643c3-8468-4fbd-bd95-dfae46625e19','5eea775c2110734baa24b0d28914463fcbac248bb2b7a235c1b6b8ca6b381b75','2026-10-06 21:04:12.009','20261006204050_init',NULL,NULL,'2026-10-06 21:04:10.523',1),
('9528227c-641d-499c-9f48-07fa3c622a83','679f53a5482e37594bcbd6438c8f8148d9827e13594731038736bdcde60e243c','2026-10-31 16:22:49.123','20261031110000_fin_intents_personal_only',NULL,NULL,'2026-10-31 16:22:49.100',1),
('996d1288-08fe-46ce-a01d-43c87f1555f9','0a02878e4c87810c19cecc2e329a9adc261c78dcb82b18984bce9ede2bc7e25c','2026-10-11 18:56:27.922','20261011073811_payments',NULL,NULL,'2026-10-11 18:56:27.588',1),
('a061ae8a-d180-4573-a69a-8cb5674181ae','58c0c11a2c0fb53856b2f750300245c3dd6f94b8a72a0d625f9188901ae09faa','2026-10-13 18:20:44.388','20261013152319_fin_goals_debts_reserve',NULL,NULL,'2026-10-13 18:20:44.003',1),
('a07982c9-7486-4112-8d02-0f1cc5d7ceb8','2acf41b64fed008abb8fa9bc6e0bc1b1760befe95e31420898415b9f709d9619',NULL,'20261016120000_fin_business','A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20261016120000_fin_business\n\nDatabase error code: 1005\n\nDatabase error:\nCan\'t create table `larbi_dev`.`fin_space_goals` (errno: 121 \"Duplicate key on write or update\")\n\nPlease check the query number 5 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"20261016120000_fin_business\"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name=\"20261016120000_fin_business\"\n             at schema-engine\\commands\\src\\commands\\apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:255','2026-10-16 19:41:51.945','2026-10-16 19:41:10.601',0),
('a327c0ac-67da-40c6-8387-2c7c7670b4cf','201f8f2ab0ab41bfb1742ceb9ca60f99175c333703bb584aa05d42870557d635','2026-10-16 21:21:24.471','20261015093455_formation_target_account_types',NULL,NULL,'2026-10-16 21:21:24.395',1),
('a743f3d5-ee9f-452e-b965-47dc7af7d89d','64e9159987733b1d2287a4ce5c5ae13d25b8ea3dfb6e049a3e2cd9a9887f70df','2026-10-07 23:06:05.859','20261007230551_long_text_columns',NULL,NULL,'2026-10-07 23:06:05.376',1),
('b1152773-f10e-42b9-95ad-470e6c093917','290e2d4d8e320831eeee658dae800b09de790891627797d4c04a00eea52f526c','2026-10-31 18:24:25.040','20261031160000_fin_shared_personal_link',NULL,NULL,'2026-10-31 18:24:24.962',1),
('b353a6c1-6f26-4395-8f67-843b574e31cb','0f267be84d0a5b117a59eb157148ad795fa0213131a93d88af336d3df868759c','2026-11-12 19:45:33.303','20261111100000_assistant_languages',NULL,NULL,'2026-11-12 19:45:33.217',1),
('bc29cda0-879e-41ae-8a48-fdfb3032e62f','2c7dc316c3791915b40982590cca31d2551f03190e94356d154723e61aa80464','2026-10-16 19:42:29.185','20261016120000_fin_business',NULL,NULL,'2026-10-16 19:42:28.766',1),
('bf06a73c-ae09-4869-8a5d-df91b520de5c','97be2e8a6962c794f7ba85dd78e11a1973a915df240eb33b9b7080ba8bbd7a21','2026-10-27 18:58:50.553','20261027150000_fin_budget_lines',NULL,NULL,'2026-10-27 18:58:50.489',1),
('bf809fe2-13b9-43e9-bdc9-9d3546a71ccc','6d8dd4449a482de46456244f4065a498b3b530974ec914ca314b4f9bb828ec69','2026-10-31 20:35:02.948','20261031200000_fin_debt_budget_envelope',NULL,NULL,'2026-10-31 20:35:02.916',1),
('c6b7dcf4-c005-4b16-9f03-b46fd37771f6','2f9ed4e3a3d76c49f730ead3616670d6468683b3809bf9c4ae3f89d44134f5ae','2026-10-13 18:20:43.999','20261013120000_fin_calendar',NULL,NULL,'2026-10-13 18:20:43.677',1),
('ca14be74-1dbe-4a57-bd40-3168a4d0cdfb','b4e816b30ac3e4ddeaaa7c83526fc7bf2d2b8c030085b469102623f411881ac7','2026-10-31 16:17:39.536','20261028140000_formation_education_profiles',NULL,NULL,'2026-10-31 16:17:39.433',1),
('ccb42bdd-1f24-4d6e-9f8d-1c5a913d175d','e6e30079c80fbedf1a4290e2b6552a52820eccef3638be6d74b325d5b31cdeca','2026-10-06 21:04:12.719','20261006204702_comparator_data',NULL,NULL,'2026-10-06 21:04:12.684',1),
('d208f633-0ec7-4500-b4ed-0a62fdb16df0','192c837d9f817137425e6af32ba3e688d575b555775974cfe3647138fbcc515f','2026-10-31 16:17:39.725','20261031100000_fin_first_steps',NULL,NULL,'2026-10-31 16:17:39.664',1),
('d4924b73-2b35-4a6d-a42d-591f935fc6a0','56797611c4be02acc8399149009c65782d675f9a3ed8532b17f2fc2848f6b029','2026-11-01 18:56:14.603','20261101100000_fin_push_subscriptions',NULL,NULL,'2026-11-01 18:56:14.574',1),
('d5dded5a-ee9c-433b-8993-b6f4d56af1ab','5e4b0c43d46fa59c90f579c05590b3fe614e20a70bf5b6934ba687d789381f9a','2026-10-27 17:40:21.703','20261027130000_fin_categories_125',NULL,NULL,'2026-10-27 17:40:21.233',1),
('d5ea651b-62f4-433d-afde-3094ca20d5b6','d8a271e07a35c075cd675a28b57a6f70424677985d06ccea9da29e00b40c8859','2026-10-31 16:17:39.051','20261028100000_fin_budget_carry_overspend',NULL,NULL,'2026-10-31 16:17:38.990',1),
('d85e78cf-1d9e-4261-a060-be97514b5179','ffcf9b5bdf74b4afface7a3d08e91c93e067168e145a1db50428a052ea0a9f04','2026-10-12 21:13:27.399','20261013090000_fin_budgets',NULL,NULL,'2026-10-12 21:13:27.238',1),
('d9fe4182-fee0-4f51-8657-6d5b00caa4b2','f80bfa60da32c97d2e197b82bfbb9b3ac7fabb6499ff5167af5c156263ad3ac7','2026-10-27 19:27:42.578','20261027180000_fin_debts_receivables',NULL,NULL,'2026-10-27 19:27:42.517',1),
('dde7e833-e3a6-4d84-bb53-a497b5c246cb','47895959fcfc8a6dedab61269d0f4c470952c6e24bea70083e57e9ce8f0c515d','2026-11-12 19:45:33.103','20261108130000_fin_main_categories',NULL,NULL,'2026-11-12 19:45:33.054',1),
('e0979b7a-c510-47c2-9a10-d82c54666a33','a1b83acff6d07aecc51bd0a4f7b7b5cefe2e728edb65e5a58b9a53c71c623449','2026-10-06 21:13:54.510','20261006211000_case_sensitive_checks',NULL,NULL,'2026-10-06 21:13:54.346',1),
('e464e151-f056-45f1-bcc5-5bc1f60f91e7','57bb49c7feccf7437a317bed5d4c6c4f10d441ec3148518a6acfb49757dff672','2026-10-31 16:17:39.179','20261028110000_fin_income_regularity',NULL,NULL,'2026-10-31 16:17:39.055',1),
('e934add9-525f-4962-8c37-487ec78c993f','684ba9546015e8fe2e8297e3f17f69238649881a5d1da54ce5626cd1a4cdda13','2026-10-31 21:14:37.697','20261031210000_fin_intents_catalogue_codes',NULL,NULL,'2026-10-31 21:14:37.609',1),
('e9c55d2f-81b9-45f9-be55-5fc3b1d5c50b','1664ed2d264fad1ddea4ec4e49068625994ba481a1d5cf4c53abce8e3438e3e2','2026-10-09 19:57:59.688','20261009195759_simulation_scenarios',NULL,NULL,'2026-10-09 19:57:59.626',1),
('e9ea623d-cf03-488c-8a5b-3664c59b2ce2','f9412ef3d492a83520ffb1815a60ec923128626bcdd67233a71ed4851324b829','2026-10-31 20:18:23.120','20261031190000_fin_snapshots',NULL,NULL,'2026-10-31 20:18:23.101',1),
('f0eb1349-af97-4579-bae7-753868b51885','48f8282bcaa0a3a999b18dc6f1d5db83bb726ca4b4ef8f9a4414e45e1fd0104f','2026-10-31 16:17:39.218','20261028120000_fin_goal_models_go12_go17',NULL,NULL,'2026-10-31 16:17:39.182',1),
('f360873b-83a0-4e3b-9dc4-b47800e2dc87','82bd82d829199670c04c73d57fa75549b52914215bf2aba391d6f81953d5fc0f','2026-11-02 20:18:09.532','20261102120000_fin_shared_advance',NULL,NULL,'2026-11-02 20:18:09.457',1),
('f7448fe2-1b68-426a-a25c-03a9da84b0be','2c7dc316c3791915b40982590cca31d2551f03190e94356d154723e61aa80464',NULL,'20261016120000_fin_business','A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20261016120000_fin_business\n\nDatabase error code: 1050\n\nDatabase error:\nTable \'fin_businesses\' already exists\n\nPlease check the query number 1 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"20261016120000_fin_business\"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name=\"20261016120000_fin_business\"\n             at schema-engine\\commands\\src\\commands\\apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:255','2026-10-16 19:42:26.381','2026-10-16 19:42:17.225',0),
('ffffc7ca-e031-4cf4-9984-9ce703a7106a','ec086ac0fe2c67ab17356fdf0f39c5325c5d774213d05ae8dd6b1654c35e5c8c','2026-11-04 21:11:31.740','20261104120000_fin_money_double',NULL,NULL,'2026-11-04 21:11:29.824',1);
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
('a0000000-0000-4000-8000-000000000001','auto-entrepreneur','Auto-entrepreneur',1,1,'2026-09-25 13:05:45.640','2026-09-25 13:05:45.640'),
('a0000000-0000-4000-8000-000000000002','pme','PME',1,2,'2026-09-25 13:05:45.640','2026-09-25 13:05:45.640'),
('a0000000-0000-4000-8000-000000000003','pmi','PMI',1,3,'2026-09-25 13:05:45.640','2026-09-25 13:05:45.640'),
('a0000000-0000-4000-8000-000000000004','etudiant','Étudiant',1,4,'2026-09-25 13:05:45.640','2026-09-25 13:05:45.640'),
('a0000000-0000-4000-8000-000000000005','lyceen','Lycéen',1,5,'2026-09-25 13:05:45.640','2026-09-25 13:05:45.640'),
('a0000000-0000-4000-8000-000000000006','salarie','Salarié',1,6,'2026-09-25 13:05:45.640','2026-09-25 13:05:45.640');
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
('e2620386-79bf-4ccc-9a14-245b61485103','article-mvctioql-2-38dd','fr','Article audit P5-03','Résumé de Article audit P5-03','<p>Contenu de larticle</p>','Contenu de larticle','published','2026-10-17 19:57:17.373','standard','[]',NULL,'4c9b841b-fc73-41de-8a85-df383585600e','75c5e648-3370-4db7-b399-fd88675d2f73',NULL,NULL,'2026-10-17 19:57:17.381','2026-10-17 19:57:17.563',NULL,NULL);
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
  `audience` varchar(10) NOT NULL DEFAULT 'both',
  `groupId` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `chatbot_entries_language_status_position_idx` (`language`,`status`,`position`),
  KEY `chatbot_entries_groupId_idx` (`groupId`),
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
  `color` varchar(9) DEFAULT NULL,
  `accountId` varchar(191) DEFAULT NULL,
  `countBalance` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `fin_budgets_userId_periodStart_idx` (`userId`,`periodStart`),
  KEY `fin_budgets_accountId_idx` (`accountId`),
  CONSTRAINT `fin_budgets_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `fin_accounts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fin_budgets_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_budgets_scope_check` CHECK (`scope` in ('personal','couple','household','space')),
  CONSTRAINT `fin_budgets_source_check` CHECK (`source` in ('manual','imported','document','partner','computed')),
  CONSTRAINT `fin_budgets_status_check` CHECK (`status` in ('real','declared','imported','computed','fictional','official','to_confirm')),
  CONSTRAINT `fin_budgets_confidence_check` CHECK (`confidence` is null or `confidence` in ('high','medium','low')),
  CONSTRAINT `fin_budgets_currency_check` CHECK (`currency` regexp '^[A-Z]{3}$'),
  CONSTRAINT `fin_budgets_version_check` CHECK (`version` >= 1),
  CONSTRAINT `fin_budgets_label_check` CHECK (trim(`label`) <> ''),
  CONSTRAINT `fin_budgets_period_check` CHECK (`periodEnd` > `periodStart`),
  CONSTRAINT `fin_budgets_thresholds_check` CHECK (json_type(`alertThresholds`) = 'ARRAY'),
  CONSTRAINT `fin_budgets_recurrence_check` CHECK (`recurrence` in ('none','weekly','monthly','quarterly','yearly'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_budgets`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_budgets` WRITE;
/*!40000 ALTER TABLE `fin_budgets` DISABLE KEYS */;
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
('00463b58-dd2d-5234-91e9-bacbe2dfe7bd',NULL,'shared','shared.gaz',NULL,'Gaz','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('022689f4-0a13-56bf-a282-427f826e8839',NULL,'shared','shared.electricite',NULL,'Électricité','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('032a4909-a331-5ea4-9caa-25f6d1bacf2b',NULL,'seasonal','seasonal.assurance_vehicule',NULL,'Assurance véhicule','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.502','2026-10-27 17:40:21.502',1,NULL,NULL,'2026-10-27 17:40:21.502','2026-10-27 17:40:21.502','Transport','🛡️','#1D4ED8',1,'Annuel','[\"Tous ; ordre suggéré selon profil\"]'),
('038fc44f-f441-5177-b247-0a31b743b7fa',NULL,'variable','variable.transport_voyage',NULL,'Transport voyage','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.608','2026-10-27 17:40:21.608',1,NULL,NULL,'2026-10-27 17:40:21.608','2026-10-27 17:40:21.608','Voyage & vacances','✈️','#0891B2',0,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('03df1e5d-51f9-5407-a496-0f6b099f4b7d',NULL,'variable','variable.parking_peage',NULL,'Parking / péage','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.495','2026-10-27 17:40:21.495',1,NULL,NULL,'2026-10-27 17:40:21.495','2026-10-27 17:40:21.495','Transport','🅿️','#64748B',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('05029b7d-7d4b-52db-a1b4-08170adedc9f',NULL,'variable','variable.transport_professionnel',NULL,'Transport professionnel','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.674','2026-10-27 17:40:21.674',1,NULL,NULL,'2026-10-27 17:40:21.674','2026-10-27 17:40:21.674','Dépenses professionnelles personnelles','💼','#0369A1',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('05504481-7b72-50d3-9810-4f8b636e4edf',NULL,'variable','variable.hygiene_soins',NULL,'Hygiène / soins','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.541','2026-10-27 17:40:21.541',1,NULL,NULL,'2026-10-27 17:40:21.541','2026-10-27 17:40:21.541','Santé & bien-être','🧴','#FB7185',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('06c02b43-af20-5eed-bb6d-bf82fb3c78e8',NULL,'fixed','fixed.credit_immobilier',NULL,'Crédit immobilier','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',2,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130','Logement','🏦','#92400E',1,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('08af4316-70e4-4e32-b45b-e284f5bcf605',NULL,'fixed','main.telecom_numerique',NULL,'Télécom & numérique','personal','document','P10-01 — catégorie principale','official','[]','2026-11-12 19:45:33.077','2026-11-12 19:45:33.077',1,NULL,NULL,'2026-11-12 19:45:33.077','2026-11-12 19:45:33.077','Télécom & numérique','📱',NULL,0,NULL,'[]'),
('0a3cd861-c283-5a9b-9626-2a224feb4a7b',NULL,'variable','variable.sorties',NULL,'Sorties','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.596','2026-10-27 17:40:21.596',1,NULL,NULL,'2026-10-27 17:40:21.596','2026-10-27 17:40:21.596','Loisirs & culture','🎉','#E11D48',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('0ad7aaee-263a-5255-9f92-c40c480392fa',NULL,'shared','shared.transport_commun',NULL,'Transport commun','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('0b9357f3-bf24-54a5-ae8c-d03c93588924',NULL,'variable','variable.culture_livres_loisirs',NULL,'Culture / livres loisirs','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.601','2026-10-27 17:40:21.601',1,NULL,NULL,'2026-10-27 17:40:21.601','2026-10-27 17:40:21.601','Loisirs & culture','📖','#9F1239',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('0c28300a-1c43-5505-9cfc-641739643cf6',NULL,'variable','variable.mobilier_decoration',NULL,'Mobilier / décoration','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.470','2026-10-27 17:40:21.470',1,NULL,NULL,'2026-10-27 17:40:21.470','2026-10-27 17:40:21.470','Logement','🛋️','#A78BFA',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('0d4b5ee9-4a68-4272-9b31-39e768b7ba6b',NULL,'variable','main.sante_bien_etre',NULL,'Santé & bien-être','personal','document','P10-01 — catégorie principale','official','[]','2026-11-12 19:45:33.079','2026-11-12 19:45:33.079',1,NULL,NULL,'2026-11-12 19:45:33.079','2026-11-12 19:45:33.079','Santé & bien-être','🩺',NULL,1,NULL,'[]'),
('0f232541-0d4e-5808-bb77-1a318a6171e0',NULL,'variable','variable.formation_professionnelle',NULL,'Formation professionnelle','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.557','2026-10-27 17:40:21.557',1,NULL,NULL,'2026-10-27 17:40:21.557','2026-10-27 17:40:21.557','Éducation & formation','📘','#0284C7',0,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('103b8ab1-e94b-5e29-9f5e-c036e30d74b8',NULL,'income','income.pension',NULL,'Retraite / pension','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',2,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130','Social & pensions','🌅','#64748B',1,'Mensuel','[\"Tous\"]'),
('1224a7ae-33ca-5ed3-b388-3bd2b1d849e9',NULL,'fixed','fixed.creche_garde',NULL,'Crèche / garde','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.562','2026-10-27 17:40:21.562',1,NULL,NULL,'2026-10-27 17:40:21.562','2026-10-27 17:40:21.562','Enfants & famille','🧸','#DB2777',1,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('13a0020c-1f62-5ac1-a3e7-8630c99ced1e',NULL,'variable','variable.hebergement',NULL,'Hébergement','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.610','2026-10-27 17:40:21.610',1,NULL,NULL,'2026-10-27 17:40:21.610','2026-10-27 17:40:21.610','Voyage & vacances','🏨','#0E7490',0,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('14cc3c7e-44af-5689-befd-9f3ec33b6113',NULL,'income','income.indemnisation_assurance',NULL,'Indemnisation assurance','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.446','2026-10-27 17:40:21.446',1,NULL,NULL,'2026-10-27 17:40:21.446','2026-10-27 17:40:21.446','Exceptionnel','🛡️','#0369A1',0,'Ponctuel','[\"Tous\"]'),
('14cc44e4-c1d9-53a5-8f79-b33ec7dbd78b',NULL,'fixed','fixed.eau',NULL,'Eau','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',2,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130','Logement','💧','#0EA5E9',1,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('15aaaa15-e5c9-5fc6-9363-ec8e76602eb0',NULL,'seasonal','seasonal.rentree_scolaire',NULL,'Rentrée scolaire','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,'2026-10-31 16:17:39.419',NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('18d882c4-7c4a-5e08-a3bb-b5befd4c17ee',NULL,'goal','goal.ordinateur_equipement',NULL,'Ordinateur / équipement','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('18dbc888-e04f-5190-8942-5ad813e3e8b7',NULL,'income','income.commission',NULL,'Commission','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.396','2026-10-27 17:40:21.396',1,NULL,NULL,'2026-10-27 17:40:21.396','2026-10-27 17:40:21.396','Salaire & emploi','🎯','#0EA5E9',0,'Variable','[\"Jeune actif\", \"Salarié\"]'),
('1dd8739c-599a-5a0c-9e66-6b24479f1049',NULL,'fixed','fixed.remboursement_carte_de_credit',NULL,'Remboursement carte de crédit','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.647','2026-10-27 17:40:21.647',1,NULL,NULL,'2026-10-27 17:40:21.647','2026-10-27 17:40:21.647','Dettes & engagements','💳','#7F1D1D',1,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('1e971e35-07cf-5969-947a-6c63486b8f03',NULL,'variable','variable.frais_bancaires',NULL,'Frais bancaires','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.625','2026-10-27 17:40:21.625',1,NULL,NULL,'2026-10-27 17:40:21.625','2026-10-27 17:40:21.625','Banque & finance','🏦','#475569',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('1f6e6e4f-acf6-571d-adfc-79e6eabd1bb3',NULL,'fixed','fixed.gaz',NULL,'Gaz','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',2,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130','Logement','🔥','#F97316',1,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('2115e6b9-3f42-5c86-a2b4-4b40a37d7aee',NULL,'variable','variable.hobbies',NULL,'Hobbies','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.603','2026-10-27 17:40:21.603',1,NULL,NULL,'2026-10-27 17:40:21.603','2026-10-27 17:40:21.603','Loisirs & culture','🎨','#F43F5E',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('22974473-f8a8-4d20-9a65-fb4f7edee579',NULL,'income','main.etudes_jeunesse',NULL,'Études & jeunesse','personal','document','P10-01 — catégorie principale','official','[]','2026-11-12 19:45:33.063','2026-11-12 19:45:33.063',1,NULL,NULL,'2026-11-12 19:45:33.063','2026-11-12 19:45:33.063','Études & jeunesse','🎓',NULL,1,NULL,'[]'),
('258c6882-ab7b-5a0d-97ce-627e15f5575a',NULL,'variable','variable.interets_agios',NULL,'Intérêts / agios','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.631','2026-10-27 17:40:21.631',1,NULL,NULL,'2026-10-27 17:40:21.631','2026-10-27 17:40:21.631','Banque & finance','📉','#B91C1C',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('261f4208-3118-5ff1-ac11-3f9a9627fae0',NULL,'variable','variable.amende_penalite',NULL,'Amende / pénalité','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.658','2026-10-27 17:40:21.658',1,NULL,NULL,'2026-10-27 17:40:21.658','2026-10-27 17:40:21.658','Impôts & administration','🚫','#DC2626',0,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('26fb98c2-4ffb-5d47-86d2-035076a1792a',NULL,'variable','variable.telecom_variable',NULL,'Télécom variable','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,'2026-10-31 16:17:39.419',NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('297a728a-1b03-578b-9559-95faea0b9170',NULL,'shared','shared.sorties',NULL,'Sorties','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('2a06b72d-d887-560b-865e-68c6852d64cb',NULL,'income','income.heritage_transmission',NULL,'Héritage / transmission','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.441','2026-10-27 17:40:21.441',1,NULL,NULL,'2026-10-27 17:40:21.441','2026-10-27 17:40:21.441','Exceptionnel','📦','#BE185D',0,'Ponctuel','[\"Tous\"]'),
('2a6aef91-968d-4d80-b43c-5c793a5b637d',NULL,'variable','main.animaux',NULL,'Animaux','personal','document','P10-01 — catégorie principale','official','[]','2026-11-12 19:45:33.097','2026-11-12 19:45:33.097',1,NULL,NULL,'2026-11-12 19:45:33.097','2026-11-12 19:45:33.097','Animaux','🐾',NULL,1,NULL,'[]'),
('2c007ea1-fc78-5170-adaf-c7680d325044',NULL,'shared','shared.projet_commun',NULL,'Projet commun','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('2ce5bdbe-8325-5deb-8e86-24bf89328d1e',NULL,'variable','variable.cadeau_offert',NULL,'Cadeau offert','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.665','2026-10-27 17:40:21.665',1,NULL,NULL,'2026-10-27 17:40:21.665','2026-10-27 17:40:21.665','Dons & solidarité','🎁','#DB2777',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('2d925b61-db62-57b0-b1c1-fbcafb309575',NULL,'shared','shared.loyer',NULL,'Loyer','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('2da80560-f1c7-53ad-96ae-b4c0288dd055',NULL,'goal','goal.permis',NULL,'Permis','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('2eeeddb9-7ad5-5304-8962-a8eb9886a4fd',NULL,'fixed','fixed.musique_media',NULL,'Musique / média','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.514','2026-10-27 17:40:21.514',1,NULL,NULL,'2026-10-27 17:40:21.514','2026-10-27 17:40:21.514','Télécom & numérique','🎵','#A855F7',0,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('32fd710a-6837-5822-9cfb-eb19ff666957',NULL,'variable','variable.culture_loisirs_sorties',NULL,'Culture / loisirs / sorties','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,'2026-10-31 16:17:39.419',NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('32ff301d-fc65-5454-9a47-d1063570bb97',NULL,'variable','variable.optique',NULL,'Optique','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.534','2026-10-27 17:40:21.534',1,NULL,NULL,'2026-10-27 17:40:21.534','2026-10-27 17:40:21.534','Santé & bien-être','👓','#BE123C',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('333e3974-8709-5416-843c-294daaa7a4b8',NULL,'variable','variable.taxi_vtc',NULL,'Taxi / VTC','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.493','2026-10-27 17:40:21.493',1,NULL,NULL,'2026-10-27 17:40:21.493','2026-10-27 17:40:21.493','Transport','🚕','#0EA5E9',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('346b9da6-92c7-5136-bac3-938ebbdaaad2',NULL,'fixed','fixed.abonnement',NULL,'Abonnement','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,'2026-10-31 16:17:39.419',NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('36050ecb-1fbc-5065-a972-6cb986997a9e',NULL,'variable','variable.medecin',NULL,'Médecin','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.525','2026-10-27 17:40:21.525',1,NULL,NULL,'2026-10-27 17:40:21.525','2026-10-27 17:40:21.525','Santé & bien-être','🩺','#DC2626',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('36562e12-b329-5574-be61-96e4c8634aeb',NULL,'fixed','fixed.transport_recurrent',NULL,'Transport récurrent','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,1,NULL,'[]'),
('36e951ae-e694-5577-90c6-94633a7dc5c4',NULL,'fixed','fixed.streaming_video',NULL,'Streaming vidéo','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.511','2026-10-27 17:40:21.511',1,NULL,NULL,'2026-10-27 17:40:21.511','2026-10-27 17:40:21.511','Télécom & numérique','🎬','#9333EA',0,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('3a27e5cc-a558-5a24-99db-d09bb93eaf97',NULL,'income','income.revenu_locatif',NULL,'Loyer reçu','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',2,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130','Patrimoine','🏠','#B45309',1,'Mensuel','[\"Tous\"]'),
('3d2b25f3-3202-53a6-bc60-0e809da751d3',NULL,'fixed','fixed.pension_engagement',NULL,'Pension / engagement','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',2,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130','Dettes & engagements','📅','#9F1239',1,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('3d89a832-3386-55a4-8d23-4e282ca74200',NULL,'variable','variable.penalites_financieres',NULL,'Pénalités financières','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.633','2026-10-27 17:40:21.633',1,NULL,NULL,'2026-10-27 17:40:21.633','2026-10-27 17:40:21.633','Banque & finance','⚠️','#991B1B',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('3dc2b43c-b045-5a69-b5fa-4e2951a95791',NULL,'goal','goal.voyage',NULL,'Voyage','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('3f7c3422-96b9-58c9-b779-be915b5ad3ef',NULL,'income','income.salaire_brut_information',NULL,'Salaire brut (information)','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,'2026-10-31 16:17:39.419',NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('4139e59c-3c2e-5a29-8cdf-fe5e8f070157',NULL,'debt','debt.dette_familiale_declaree',NULL,'Dette familiale déclarée','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('44473602-32e0-54e3-8e84-c97fa4ab290b',NULL,'goal','goal.autre',NULL,'Autre','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('452c4589-17d4-5e80-91ad-418d1b72e5f2',NULL,'debt','debt.credit_immobilier',NULL,'Crédit immobilier','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('4559ae8c-a437-555a-ab9c-57004bb0682b',NULL,'variable','variable.transport_automobile',NULL,'Transport / automobile','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,'2026-10-31 16:17:39.419',NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('462c54ab-ae70-52cc-95be-06f40240b8a3',NULL,'income','income.aide_familiale',NULL,'Aide familiale','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',2,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130','Études & jeunesse','👪','#A855F7',1,'Variable','[\"Lycéen\", \"Étudiant\"]'),
('46830f2c-7ad5-596a-9284-4218186837a9',NULL,'asset','asset.ccp',NULL,'CCP','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('47448ae2-9c9b-5418-af5b-5875b554f11f',NULL,'asset','asset.compte_d_epargne',NULL,'Compte d’épargne','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('475ef139-1929-5e4a-8a66-33e148467cc8',NULL,'fixed','fixed.mensualite_financement_vehicule',NULL,'Mensualité financement véhicule','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.639','2026-10-27 17:40:21.639',1,NULL,NULL,'2026-10-27 17:40:21.639','2026-10-27 17:40:21.639','Dettes & engagements','🚗','#991B1B',1,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('47f702a5-91ca-55df-962c-cadfe651ab05',NULL,'goal','goal.etudes',NULL,'Études','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('48067220-d777-5db4-b6e0-0f63bdf37265',NULL,'seasonal','seasonal.entretien_reparation',NULL,'Entretien / réparation','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,'2026-10-31 16:17:39.419',NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('4a9dcfd0-279b-528c-933a-130990a43a40',NULL,'variable','variable.maison_equipement',NULL,'Maison / équipement','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,'2026-10-31 16:17:39.419',NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('4ba17c79-10b2-56d1-ae91-a9cad1745397',NULL,'fixed','fixed.electricite',NULL,'Électricité','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',2,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130','Logement','💡','#EAB308',1,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('4c1b6baf-0911-52e2-a510-c399f66b18b0',NULL,'variable','variable.timbre_frais_dossier',NULL,'Timbre / frais dossier','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.656','2026-10-27 17:40:21.656',1,NULL,NULL,'2026-10-27 17:40:21.656','2026-10-27 17:40:21.656','Impôts & administration','🧾','#A1A1AA',0,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('4d01add5-eb04-5201-ae40-fa1c1899a79a',NULL,'fixed','fixed.autre_charge_fixe',NULL,'Autre charge fixe','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,1,NULL,'[]'),
('4e7ff089-d967-5ffe-a5ac-f9e1bfd932f9',NULL,'variable','variable.entretien_logement',NULL,'Entretien logement','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.466','2026-10-27 17:40:21.466',1,NULL,NULL,'2026-10-27 17:40:21.466','2026-10-27 17:40:21.466','Logement','🧰','#78716C',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('4e8a3bcd-0163-5b6d-a72f-781452a115b9',NULL,'goal','goal.reserve_de_securite',NULL,'Réserve de sécurité','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('4edfe57c-8740-52cb-95c5-9c26ab1f9948',NULL,'variable','variable.chaussures',NULL,'Chaussures','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.580','2026-10-27 17:40:21.580',1,NULL,NULL,'2026-10-27 17:40:21.580','2026-10-27 17:40:21.580','Vêtements & soins personnels','👟','#7E22CE',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('4f75acc1-aee3-5114-a5e4-a7db5521e1f6',NULL,'asset','asset.or',NULL,'Or','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('510f4d62-5c45-59db-894f-f6a167054a49',NULL,'variable','variable.analyses_imagerie',NULL,'Analyses / imagerie','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.529','2026-10-27 17:40:21.529',1,NULL,NULL,'2026-10-27 17:40:21.529','2026-10-27 17:40:21.529','Santé & bien-être','🧪','#F43F5E',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('52c27920-339b-5bd4-95c6-ffd2554a4933',NULL,'variable','variable.formation_pro_autofinancee',NULL,'Formation pro autofinancée','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.680','2026-10-27 17:40:21.680',1,NULL,NULL,'2026-10-27 17:40:21.680','2026-10-27 17:40:21.680','Dépenses professionnelles personnelles','📚','#082F49',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('53b4f820-e19b-5fb5-9dda-b97488a9db80',NULL,'income','income.interets_rendement',NULL,'Intérêts / rendement','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.430','2026-10-27 17:40:21.430',1,NULL,NULL,'2026-10-27 17:40:21.430','2026-10-27 17:40:21.430','Patrimoine','💹','#22C55E',0,'Variable','[\"Tous\"]'),
('54d836e0-2a54-59cb-b6fc-cd9a6c629516',NULL,'fixed','fixed.credit_consommation',NULL,'Mensualité crédit consommation','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',2,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130','Dettes & engagements','🧾','#B91C1C',1,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('55711fdc-bd85-529e-b196-11015a0fd410',NULL,'variable','variable.restauration_voyage',NULL,'Restauration voyage','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.613','2026-10-27 17:40:21.613',1,NULL,NULL,'2026-10-27 17:40:21.613','2026-10-27 17:40:21.613','Voyage & vacances','🍴','#06B6D4',0,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('58b791c3-f03e-57de-833f-253a51346e84',NULL,'income','income.bourse',NULL,'Bourse','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',2,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130','Études & jeunesse','🎓','#7E57C2',1,'Mensuel/Trimestriel','[\"Lycéen\", \"Étudiant\"]'),
('5a02d22b-6ba1-57cd-9ada-e96fca576f24',NULL,'variable','variable.repas_ecole_travail',NULL,'Repas école / travail','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.486','2026-10-27 17:40:21.486',1,NULL,NULL,'2026-10-27 17:40:21.486','2026-10-27 17:40:21.486','Alimentation','🥗','#84CC16',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('5bd7e27d-563d-5170-b55b-3c2e0d453278',NULL,'variable','variable.veterinaire',NULL,'Vétérinaire','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.669','2026-10-27 17:40:21.669',1,NULL,NULL,'2026-10-27 17:40:21.669','2026-10-27 17:40:21.669','Animaux','🐕','#B45309',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('5d49e78e-a179-5ffd-a539-63971bde01b4',NULL,'fixed','fixed.cloud_stockage',NULL,'Cloud / stockage','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.516','2026-10-27 17:40:21.516',1,NULL,NULL,'2026-10-27 17:40:21.516','2026-10-27 17:40:21.516','Télécom & numérique','☁️','#8B5CF6',0,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('5df77210-f140-571e-82d9-f97becf973a4',NULL,'fixed','fixed.sport_salle',NULL,'Sport / salle','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.543','2026-10-27 17:40:21.543',1,NULL,NULL,'2026-10-27 17:40:21.543','2026-10-27 17:40:21.543','Santé & bien-être','🏋️','#F97316',0,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('5fe76ef2-65d7-5034-aa7c-c635f4ea3bd8',NULL,'asset','asset.participation_entreprise',NULL,'Participation / entreprise','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('60a634d8-f7b4-5951-a166-418e7b8c48a2',NULL,'seasonal','seasonal.fetes',NULL,'Fêtes','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,'2026-10-31 16:17:39.419',NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('63d6891a-1837-5101-8d53-1222f71edb54',NULL,'variable','variable.entretien_vehicule',NULL,'Entretien véhicule','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.498','2026-10-27 17:40:21.498',1,NULL,NULL,'2026-10-27 17:40:21.498','2026-10-27 17:40:21.498','Transport','🔧','#475569',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('63e6771e-3289-45d9-95d8-efc795cdbe07',NULL,'variable','main.imprevus',NULL,'Imprévus','personal','document','P10-01 — catégorie principale','official','[]','2026-11-12 19:45:33.099','2026-11-12 19:45:33.099',1,NULL,NULL,'2026-11-12 19:45:33.099','2026-11-12 19:45:33.099','Imprévus','🚑',NULL,1,NULL,'[]'),
('655c8f61-ec2c-5437-8142-6790d4812b5e',NULL,'income','income.job_etudiant',NULL,'Job étudiant','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',2,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130','Études & jeunesse','🧑‍💼','#8B5CF6',1,'Variable','[\"Étudiant\"]'),
('6574f20d-459e-544b-be00-ea981c74e874',NULL,'income','income.vente_petite_activite',NULL,'Vente / petite activité','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.421','2026-10-27 17:40:21.421',1,NULL,NULL,'2026-10-27 17:40:21.421','2026-10-27 17:40:21.421','Indépendant','🛍️','#2DD4BF',0,'Variable','[\"Tous\"]'),
('6b8a6661-1283-5766-bc54-d9e06e27f955',NULL,'income','income.indemnite_avantage_monetise',NULL,'Indemnité / avantage monétisé','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.398','2026-10-27 17:40:21.398',1,NULL,NULL,'2026-10-27 17:40:21.398','2026-10-27 17:40:21.398','Salaire & emploi','🧾','#0284C7',0,'Variable','[\"Jeune actif\", \"Salarié\"]'),
('6ce58349-1108-5eaf-aec3-244273fda544',NULL,'variable','variable.cosmetiques',NULL,'Cosmétiques','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.585','2026-10-27 17:40:21.585',1,NULL,NULL,'2026-10-27 17:40:21.585','2026-10-27 17:40:21.585','Vêtements & soins personnels','🧴','#C084FC',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('6cfb8cd3-1e71-5d2f-8b7f-0f5fedd40606',NULL,'variable','variable.hospitalisation',NULL,'Hospitalisation','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.537','2026-10-27 17:40:21.537',1,NULL,NULL,'2026-10-27 17:40:21.537','2026-10-27 17:40:21.537','Santé & bien-être','🏥','#991B1B',1,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('6e358662-0ac3-5781-a586-83c52e657d2b',NULL,'income','income.vente_dun_actif',NULL,'Vente d’un actif','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.447','2026-10-27 17:40:21.447',1,NULL,NULL,'2026-10-27 17:40:21.447','2026-10-27 17:40:21.447','Exceptionnel','🏷️','#9A3412',0,'Ponctuel','[\"Tous\"]'),
('6f48de67-b016-5512-be4d-feab8f4f7763',NULL,'shared','shared.equipement_commun',NULL,'Équipement commun','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('6f66efbc-8ae9-5eb3-abc2-b5ce7edd85dd',NULL,'fixed','fixed.copropriete_charges',NULL,'Charges / copropriété','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',2,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130','Logement','🏢','#A16207',1,'Mensuel/Trimestriel','[\"Tous ; ordre suggéré selon profil\"]'),
('6faa9b73-32cc-559b-a5d3-862e6685fb38',NULL,'asset','asset.obligations_sukuk_declares',NULL,'Obligations / sukuk déclarés','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('6fbea5a6-a534-52e9-8157-99f2b9db8d34',NULL,'asset','asset.compte_bancaire',NULL,'Compte bancaire','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('705566dd-0c6f-4cdf-be30-0f34d6392768',NULL,'variable','main.alimentation',NULL,'Alimentation','personal','document','P10-01 — catégorie principale','official','[]','2026-11-12 19:45:33.073','2026-11-12 19:45:33.073',1,NULL,NULL,'2026-11-12 19:45:33.073','2026-11-12 19:45:33.073','Alimentation','🛒',NULL,0,NULL,'[]'),
('7090167a-9552-42ec-8c1e-7fa264d276e8',NULL,'variable','main.maison_equipement',NULL,'Maison & équipement','personal','document','P10-01 — catégorie principale','official','[]','2026-11-12 19:45:33.087','2026-11-12 19:45:33.087',1,NULL,NULL,'2026-11-12 19:45:33.087','2026-11-12 19:45:33.087','Maison & équipement','🧹',NULL,0,NULL,'[]'),
('71d30936-de69-550a-a91a-13bf1a0062d0',NULL,'variable','variable.transport_enfant',NULL,'Transport enfant','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.567','2026-10-27 17:40:21.567',1,NULL,NULL,'2026-10-27 17:40:21.567','2026-10-27 17:40:21.567','Enfants & famille','🚌','#9D174D',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('73abb6aa-b5e6-5bfa-a360-61654dd00c62',NULL,'debt','debt.financement_vehicule',NULL,'Financement véhicule','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('7508d75a-8d76-5f6f-b9b9-0256a17c8f09',NULL,'asset','asset.autre_actif',NULL,'Autre actif','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('765fd009-4112-5026-8680-adec38a9bdb1',NULL,'variable','variable.pharmacie',NULL,'Pharmacie','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.527','2026-10-27 17:40:21.527',1,NULL,NULL,'2026-10-27 17:40:21.527','2026-10-27 17:40:21.527','Santé & bien-être','💊','#EF4444',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('78536d54-4a70-5fea-bed7-4f5cd47cc162',NULL,'income','income.prime',NULL,'Prime / bonus','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',2,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130','Salaire & emploi','⭐','#3B82F6',0,'Variable','[\"Jeune actif\", \"Salarié\"]'),
('7d7ea9f5-c2c8-59bc-ad70-29262b0f0560',NULL,'goal','goal.mariage',NULL,'Mariage','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('80cde8f0-4164-5bf2-88ca-98f4982daa34',NULL,'variable','variable.pieces_pneus',NULL,'Pièces / pneus','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.500','2026-10-27 17:40:21.500',1,NULL,NULL,'2026-10-27 17:40:21.500','2026-10-27 17:40:21.500','Transport','🛞','#334155',0,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('81f63e70-0f31-42b9-89d5-fcb8c2ca304c',NULL,'variable','main.transport',NULL,'Transport','personal','document','P10-01 — catégorie principale','official','[]','2026-11-12 19:45:33.075','2026-11-12 19:45:33.075',1,NULL,NULL,'2026-11-12 19:45:33.075','2026-11-12 19:45:33.075','Transport','🚌',NULL,0,NULL,'[]'),
('82170294-0ad9-5b51-8d61-9ffcbb1dcf53',NULL,'variable','variable.travaux_renovation',NULL,'Travaux / rénovation','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.594','2026-10-27 17:40:21.594',1,NULL,NULL,'2026-10-27 17:40:21.594','2026-10-27 17:40:21.594','Maison & équipement','🧱','#115E59',0,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('8342f600-6234-50d1-9d33-cd805da2aee7',NULL,'variable','variable.materiel_numerique',NULL,'Matériel numérique','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.523','2026-10-27 17:40:21.523',1,NULL,NULL,'2026-10-27 17:40:21.523','2026-10-27 17:40:21.523','Télécom & numérique','🖥️','#4338CA',0,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('835cb991-3ba1-435e-bb7b-5baf3afab74f',NULL,'income','main.patrimoine',NULL,'Patrimoine','personal','document','P10-01 — catégorie principale','official','[]','2026-11-12 19:45:33.067','2026-11-12 19:45:33.067',1,NULL,NULL,'2026-11-12 19:45:33.067','2026-11-12 19:45:33.067','Patrimoine','🏠',NULL,0,NULL,'[]'),
('854896f7-1242-5e64-b0f1-2da7a7670cc1',NULL,'asset','asset.vehicule',NULL,'Véhicule','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('86f42c04-3784-542a-9472-65df4507d459',NULL,'goal','goal.logement',NULL,'Logement','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('87939ff4-59f5-529b-9964-179097e615ac',NULL,'debt','debt.autre_dette',NULL,'Autre dette','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('8e21bf12-f74b-5dcd-b902-dbae7d0c9391',NULL,'shared','shared.internet',NULL,'Internet','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('8e9eade5-03e0-5fe2-8439-75ee6cb045e2',NULL,'variable','variable.location_vehicule',NULL,'Location véhicule','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.505','2026-10-27 17:40:21.505',1,NULL,NULL,'2026-10-27 17:40:21.505','2026-10-27 17:40:21.505','Transport','🚙','#2563A6',0,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('918065a4-38c2-53fa-bf1c-08bfdc901151',NULL,'income','income.allocation_aide',NULL,'Allocation / aide publique','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',2,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130','Social & pensions','🏛️','#475569',1,'Variable','[\"Tous\"]'),
('928309a9-0b58-533f-8678-c0dbf6dce7b6',NULL,'variable','variable.produits_menagers',NULL,'Produits ménagers','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.588','2026-10-27 17:40:21.588',1,NULL,NULL,'2026-10-27 17:40:21.588','2026-10-27 17:40:21.588','Maison & équipement','🧹','#0F766E',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('940c2e48-4a40-4f9d-a31d-53f40f5372e7',NULL,'fixed','main.dettes_engagements',NULL,'Dettes & engagements','personal','document','P10-01 — catégorie principale','official','[]','2026-11-12 19:45:33.093','2026-11-12 19:45:33.093',1,NULL,NULL,'2026-11-12 19:45:33.093','2026-11-12 19:45:33.093','Dettes & engagements','🤝',NULL,1,NULL,'[]'),
('95899733-fcc9-57b0-8b47-386f29730bf9',NULL,'shared','shared.autre',NULL,'Autre','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('965fe038-3789-5523-b376-595558730679',NULL,'fixed','fixed.securite_gardiennage',NULL,'Sécurité / gardiennage','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.472','2026-10-27 17:40:21.472',1,NULL,NULL,'2026-10-27 17:40:21.472','2026-10-27 17:40:21.472','Logement','🔐','#334155',0,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('96f89ece-9181-5f6d-925a-907789acff10',NULL,'variable','variable.document_administratif',NULL,'Document administratif','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.654','2026-10-27 17:40:21.654',1,NULL,NULL,'2026-10-27 17:40:21.654','2026-10-27 17:40:21.654','Impôts & administration','📄','#71717A',0,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('9786a0f1-c571-5741-9eed-75498574eaac',NULL,'variable','variable.livres',NULL,'Livres','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.551','2026-10-27 17:40:21.551',1,NULL,NULL,'2026-10-27 17:40:21.551','2026-10-27 17:40:21.551','Éducation & formation','📚','#3B82F6',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('979b2ce5-8cef-593d-9952-3df2b444b827',NULL,'seasonal','seasonal.vacances',NULL,'Vacances','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,'2026-10-31 16:17:39.419',NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('97d85967-739f-5e00-b36e-c935d67b72e7',NULL,'asset','asset.actions_declarees',NULL,'Actions déclarées','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('993a351a-d5d9-5e41-a1fa-890055832624',NULL,'asset','asset.especes',NULL,'Espèces','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('9bd44a96-ada6-5cde-bff1-34a221c3a8e9',NULL,'variable','variable.materiel_professionnel',NULL,'Matériel professionnel','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.678','2026-10-27 17:40:21.678',1,NULL,NULL,'2026-10-27 17:40:21.678','2026-10-27 17:40:21.678','Dépenses professionnelles personnelles','🧰','#0C4A6E',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('9cf3d796-046f-5370-9ff3-afb9b93b0801',NULL,'variable','variable.dentaire',NULL,'Dentaire','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.532','2026-10-27 17:40:21.532',1,NULL,NULL,'2026-10-27 17:40:21.532','2026-10-27 17:40:21.532','Santé & bien-être','🦷','#E11D48',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('9d475061-3ad4-5bcf-b567-ccd9e3dc73bf',NULL,'income','income.coupon_obligation_sukuk',NULL,'Coupon obligation / sukuk','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.432','2026-10-27 17:40:21.432',1,NULL,NULL,'2026-10-27 17:40:21.432','2026-10-27 17:40:21.432','Patrimoine','📜','#4D7C0F',0,'Variable','[\"Tous\"]'),
('9efa89fa-f1b8-4329-96bb-256e708eed3e',NULL,'variable','main.depenses_professionnelles_personnelles',NULL,'Dépenses professionnelles personnelles','personal','document','P10-01 — catégorie principale','official','[]','2026-11-12 19:45:33.098','2026-11-12 19:45:33.098',1,NULL,NULL,'2026-11-12 19:45:33.098','2026-11-12 19:45:33.098','Dépenses professionnelles personnelles','💼',NULL,0,NULL,'[]'),
('a0f8616f-e9ee-5fb7-a081-e61feaeaea80',NULL,'fixed','fixed.loyer',NULL,'Loyer','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',2,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130','Logement','🏠','#B45309',1,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('a198fbc0-818d-5f58-b782-1d1534d62afc',NULL,'income','income.remboursement_recu',NULL,'Remboursement reçu','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.444','2026-10-27 17:40:21.444',1,NULL,NULL,'2026-10-27 17:40:21.444','2026-10-27 17:40:21.444','Exceptionnel','↩️','#0891B2',0,'Ponctuel','[\"Tous\"]'),
('a3f83cd1-762a-50c3-988d-2a3fc3286f5f',NULL,'seasonal','seasonal.frais_d_etudes',NULL,'Frais d’études','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,'2026-10-31 16:17:39.419',NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('a415d1d7-45a1-5d74-b2e7-48ccb63d61b5',NULL,'variable','variable.electromenager',NULL,'Électroménager','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.592','2026-10-27 17:40:21.592',1,NULL,NULL,'2026-10-27 17:40:21.592','2026-10-27 17:40:21.592','Maison & équipement','🧺','#0D9488',0,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('a47a98ca-6886-5db3-b468-5468da9a1e56',NULL,'income','income.salaire_net',NULL,'Salaire net','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',2,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130','Salaire & emploi','💼','#2563A6',1,'Mensuel','[\"Jeune actif\", \"Salarié\"]'),
('a7aa1ddc-f379-5f91-ab31-c8e865bbcf69',NULL,'fixed','fixed.telephone',NULL,'Téléphone mobile','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',2,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130','Télécom & numérique','📱','#7C3AED',1,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('a8654f08-69fd-55a6-a693-c3bdcf9ecb69',NULL,'goal','goal.mobilite_stage',NULL,'Mobilité / stage','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('aafc5a61-1a56-597e-9095-105ce5c36d58',NULL,'fixed','fixed.scolarite_etudes',NULL,'Frais de scolarité / université','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',2,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130','Éducation & formation','🎓','#2563A6',1,'Annuel/Semestriel','[\"Tous ; ordre suggéré selon profil\"]'),
('abe93d0f-9adf-53cb-8542-3d25edcf6c20',NULL,'variable','variable.activites_voyage',NULL,'Activités voyage','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.615','2026-10-27 17:40:21.615',1,NULL,NULL,'2026-10-27 17:40:21.615','2026-10-27 17:40:21.615','Voyage & vacances','🗺️','#22D3EE',0,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('ac23aa53-66f5-5abf-ae3f-25aea6fd343a',NULL,'seasonal','seasonal.equipement',NULL,'Équipement','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,'2026-10-31 16:17:39.419',NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('ad3f4d4a-630f-5a9a-b2f3-78740cbfbfd3',NULL,'variable','variable.zakat_solidarite',NULL,'Zakat / solidarité','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.662','2026-10-27 17:40:21.662',1,NULL,NULL,'2026-10-27 17:40:21.662','2026-10-27 17:40:21.662','Dons & solidarité','🤲','#BE185D',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('adc17407-65dd-54f5-969d-758d828ee966',NULL,'goal','goal.epargne_investissement',NULL,'Épargne / investissement','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('ae523647-26b2-5391-a582-8789ed50785c',NULL,'income','income.honoraires_prestations',NULL,'Honoraires / prestations','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.419','2026-10-27 17:40:21.419',1,NULL,NULL,'2026-10-27 17:40:21.419','2026-10-27 17:40:21.419','Indépendant','🛠️','#14B8A6',1,'Variable','[\"Tous\"]'),
('ae926353-961d-5def-9bee-7aaab310570f',NULL,'asset','asset.immobilier',NULL,'Immobilier','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('aef5039e-54f5-47db-b311-82fd10f6724b',NULL,'income','main.salaire_emploi',NULL,'Salaire & emploi','personal','document','P10-01 — catégorie principale','official','[]','2026-11-12 19:45:33.058','2026-11-12 19:45:33.058',1,NULL,NULL,'2026-11-12 19:45:33.058','2026-11-12 19:45:33.058','Salaire & emploi','💼',NULL,0,NULL,'[]'),
('afa90cff-94a7-5329-81e2-1f3abd7a260a',NULL,'variable','variable.autre_imprevu',NULL,'Autre imprévu','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.693','2026-10-27 17:40:21.693',1,NULL,NULL,'2026-10-27 17:40:21.693','2026-10-27 17:40:21.693','Imprévus','⚠️','#F59E0B',1,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('afc065d0-6654-5ca2-99af-7bf2811f3eae',NULL,'variable','variable.autre_depense_variable',NULL,'Autre dépense','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',2,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130','Autre','➕','#64748B',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('b001d0bd-63b9-5fb6-be78-f089647f8921',NULL,'fixed','fixed.logiciel_application',NULL,'Logiciel / application','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.518','2026-10-27 17:40:21.518',1,NULL,NULL,'2026-10-27 17:40:21.518','2026-10-27 17:40:21.518','Télécom & numérique','💻','#4F46E5',0,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('b32bea56-6e1b-5f32-88e5-56570bb0dfbe',NULL,'variable','variable.jeux_video',NULL,'Jeux vidéo','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.521','2026-10-27 17:40:21.521',1,NULL,NULL,'2026-10-27 17:40:21.521','2026-10-27 17:40:21.521','Télécom & numérique','🎮','#6366F1',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('b36b0df4-7c40-5571-aeab-821d60b0f6f4',NULL,'variable','variable.habillement',NULL,'Vêtements','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',2,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130','Vêtements & soins personnels','👕','#9333EA',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('b5af8550-f021-59cf-ba34-bec1034bd2bc',NULL,'variable','variable.argent_de_poche',NULL,'Argent de poche','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.573','2026-10-27 17:40:21.573',1,NULL,NULL,'2026-10-27 17:40:21.573','2026-10-27 17:40:21.573','Enfants & famille','🪙','#FDA4AF',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('b684cf8c-4eec-5fcb-821f-55457a9343e7',NULL,'variable','variable.urgence_medicale',NULL,'Urgence médicale','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.687','2026-10-27 17:40:21.687',1,NULL,NULL,'2026-10-27 17:40:21.687','2026-10-27 17:40:21.687','Imprévus','🚑','#DC2626',1,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('b6b8f17f-4daf-54e0-b21e-99c53ca98cae',NULL,'variable','variable.impot_taxe',NULL,'Impôt / taxe','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.652','2026-10-27 17:40:21.652',1,NULL,NULL,'2026-10-27 17:40:21.652','2026-10-27 17:40:21.652','Impôts & administration','🏛️','#52525B',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('b7045a2d-770d-53ae-8f2b-0103f00f02af',NULL,'fixed','fixed.assurance',NULL,'Assurance','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,'2026-10-31 16:17:39.419',NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('b7e4742c-c204-56a7-8598-bee4b2eb436b',NULL,'variable','variable.repas_professionnel',NULL,'Repas professionnel','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.676','2026-10-27 17:40:21.676',1,NULL,NULL,'2026-10-27 17:40:21.676','2026-10-27 17:40:21.676','Dépenses professionnelles personnelles','🍽️','#075985',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('bafe8adb-910d-5264-a001-9c9108cebde5',NULL,'shared','shared.eau',NULL,'Eau','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('bb5bb719-9b10-4555-8837-f91f1866d701',NULL,'variable','main.enfants_famille',NULL,'Enfants & famille','personal','document','P10-01 — catégorie principale','official','[]','2026-11-12 19:45:33.083','2026-11-12 19:45:33.083',1,NULL,NULL,'2026-11-12 19:45:33.083','2026-11-12 19:45:33.083','Enfants & famille','🧸',NULL,1,NULL,'[]'),
('bc04304c-9853-5dd4-9398-9967d9b85e90',NULL,'shared','shared.courses',NULL,'Courses','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('bdbdb210-ceb0-56eb-9570-8d9327dfc333',NULL,'variable','variable.etudes_fournitures',NULL,'Fournitures','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',2,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130','Éducation & formation','✏️','#60A5FA',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('be027e21-6f4e-55db-a8ea-8a64e4fbbb19',NULL,'variable','variable.frais_de_transfert',NULL,'Frais de transfert','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.629','2026-10-27 17:40:21.629',1,NULL,NULL,'2026-10-27 17:40:21.629','2026-10-27 17:40:21.629','Banque & finance','↔️','#64748B',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('c097a6f2-9498-545f-90f8-8ed229556a0d',NULL,'variable','variable.aide_urgente',NULL,'Aide urgente','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.691','2026-10-27 17:40:21.691',1,NULL,NULL,'2026-10-27 17:40:21.691','2026-10-27 17:40:21.691','Imprévus','🆘','#F97316',1,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('c280e826-1302-5d9e-8181-21b5c0b3f9a9',NULL,'variable','variable.coiffeur_esthetique',NULL,'Coiffeur / esthétique','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.583','2026-10-27 17:40:21.583',1,NULL,NULL,'2026-10-27 17:40:21.583','2026-10-27 17:40:21.583','Vêtements & soins personnels','💇','#A855F7',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('c2ac9b83-ac14-4b1a-9555-fa6b60730037',NULL,'fixed','main.logement',NULL,'Logement','personal','document','P10-01 — catégorie principale','official','[]','2026-11-12 19:45:33.072','2026-11-12 19:45:33.072',1,NULL,NULL,'2026-11-12 19:45:33.072','2026-11-12 19:45:33.072','Logement','🏠',NULL,1,NULL,'[]'),
('c3148d45-b770-5086-b81e-ab2c77067434',NULL,'variable','variable.boulangerie_proximite',NULL,'Boulangerie / proximité','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.478','2026-10-27 17:40:21.478',1,NULL,NULL,'2026-10-27 17:40:21.478','2026-10-27 17:40:21.478','Alimentation','🥖','#65A30D',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('c34b51bd-f8d9-54b3-acfa-603a280ad382',NULL,'variable','variable.don',NULL,'Don','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.660','2026-10-27 17:40:21.660',1,NULL,NULL,'2026-10-27 17:40:21.660','2026-10-27 17:40:21.660','Dons & solidarité','❤️','#E11D48',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('c38f2197-68b5-4350-b08e-944a17df6b90',NULL,'income','main.social_pensions',NULL,'Social & pensions','personal','document','P10-01 — catégorie principale','official','[]','2026-11-12 19:45:33.069','2026-11-12 19:45:33.069',1,NULL,NULL,'2026-11-12 19:45:33.069','2026-11-12 19:45:33.069','Social & pensions','🌅',NULL,1,NULL,'[]'),
('c5903594-cd43-5704-86e7-94dab376eaca',NULL,'variable','variable.reparation',NULL,'Réparation','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.468','2026-10-27 17:40:21.468',1,NULL,NULL,'2026-10-27 17:40:21.468','2026-10-27 17:40:21.468','Logement','🔧','#57534E',0,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('c66a196d-8475-57f2-b3e1-f4249b39452e',NULL,'variable','variable.petit_equipement',NULL,'Petit équipement','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.590','2026-10-27 17:40:21.590',1,NULL,NULL,'2026-10-27 17:40:21.590','2026-10-27 17:40:21.590','Maison & équipement','🔌','#14B8A6',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('c6a6d92e-d5a2-59e5-9b3a-75c6c99bc77e',NULL,'asset','asset.creance',NULL,'Créance','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('c9079dda-c0a2-508b-b72a-850247675fc2',NULL,'income','income.dividende_revenu_de_placement_declare',NULL,'Dividendes','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',2,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130','Patrimoine','📈','#16A34A',0,'Variable','[\"Tous\"]'),
('cc192d7f-8605-5a4f-b6b7-223a63b0a666',NULL,'variable','variable.bien_etre',NULL,'Bien-être','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.546','2026-10-27 17:40:21.546',1,NULL,NULL,'2026-10-27 17:40:21.546','2026-10-27 17:40:21.546','Santé & bien-être','🧘','#FDA4AF',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('cc4ee9bb-a69a-54c3-aa56-47b737216c01',NULL,'variable','variable.alimentation_animal',NULL,'Alimentation animal','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.667','2026-10-27 17:40:21.667',1,NULL,NULL,'2026-10-27 17:40:21.667','2026-10-27 17:40:21.667','Animaux','🐾','#92400E',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('ccaeffa6-0d49-59d5-8c02-f674d16fad0d',NULL,'variable','variable.sante_hygiene',NULL,'Santé / hygiène','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,'2026-10-31 16:17:39.419',NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('cdc54ee8-e814-56ac-8ac8-dda0d06d910e',NULL,'income','income.heures_supplementaires',NULL,'Heures supplémentaires','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.394','2026-10-27 17:40:21.394',1,NULL,NULL,'2026-10-27 17:40:21.394','2026-10-27 17:40:21.394','Salaire & emploi','⏱️','#60A5FA',0,'Variable','[\"Jeune actif\", \"Salarié\"]'),
('ce48b98e-a468-514b-b064-796ef8d5a9c7',NULL,'debt','debt.credit_consommation',NULL,'Crédit consommation','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('cfc4680a-69cf-4742-8287-6453f13a9a35',NULL,'variable','main.vetements_soins_personnels',NULL,'Vêtements & soins personnels','personal','document','P10-01 — catégorie principale','official','[]','2026-11-12 19:45:33.085','2026-11-12 19:45:33.085',1,NULL,NULL,'2026-11-12 19:45:33.085','2026-11-12 19:45:33.085','Vêtements & soins personnels','👕',NULL,0,NULL,'[]'),
('cfddd094-3f04-5336-bba4-716b8b347a8b',NULL,'income','income.autre_revenu',NULL,'Autre revenu','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',2,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130','Autre','➕','#64748B',0,'Variable','[\"Tous\"]'),
('d2107177-0393-5597-b5bd-5fff69401ecd',NULL,'goal','goal.projet_personnel',NULL,'Projet personnel','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('d4bae995-73fb-5d9b-bb30-41f698a13432',NULL,'seasonal','seasonal.assurance_annuelle',NULL,'Assurance annuelle','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,'2026-10-31 16:17:39.419',NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('d5df1d98-4e40-5e19-8591-cdf0b66466eb',NULL,'variable','variable.reparation_urgente',NULL,'Réparation urgente','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.689','2026-10-27 17:40:21.689',1,NULL,NULL,'2026-10-27 17:40:21.689','2026-10-27 17:40:21.689','Imprévus','🧯','#EA580C',1,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('d729a923-1676-5c61-b0ea-44a8021cb20d',NULL,'variable','variable.aide_familiale_versee',NULL,'Aide familiale versée','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.576','2026-10-27 17:40:21.576',1,NULL,NULL,'2026-10-27 17:40:21.576','2026-10-27 17:40:21.576','Enfants & famille','🤝','#C026D3',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('d82913b2-3052-5db0-9122-99f88a765f26',NULL,'variable','variable.cafe_snack',NULL,'Café / snack','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.482','2026-10-27 17:40:21.482',1,NULL,NULL,'2026-10-27 17:40:21.482','2026-10-27 17:40:21.482','Alimentation','☕','#D97706',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('d8505eed-2ae5-52d0-ac5e-7b18e64e645d',NULL,'goal','goal.enfant_etudes_enfant',NULL,'Enfant / études enfant','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('db6ae868-c1b5-53bf-a1fe-3dfaba60168c',NULL,'seasonal','seasonal.frais_carte',NULL,'Frais carte','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.626','2026-10-27 17:40:21.626',1,NULL,NULL,'2026-10-27 17:40:21.626','2026-10-27 17:40:21.626','Banque & finance','💳','#334155',1,'Annuel/Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('dbbf3736-dfe7-448f-90ed-963ab06ed9de',NULL,'income','main.independant',NULL,'Indépendant','personal','document','P10-01 — catégorie principale','official','[]','2026-11-12 19:45:33.065','2026-11-12 19:45:33.065',1,NULL,NULL,'2026-11-12 19:45:33.065','2026-11-12 19:45:33.065','Indépendant','🧑‍💻',NULL,1,NULL,'[]'),
('de2ffde0-47dd-4a4f-be34-4129cf714dda',NULL,'variable','main.impots_administration',NULL,'Impôts & administration','personal','document','P10-01 — catégorie principale','official','[]','2026-11-12 19:45:33.095','2026-11-12 19:45:33.095',1,NULL,NULL,'2026-11-12 19:45:33.095','2026-11-12 19:45:33.095','Impôts & administration','🏛️',NULL,0,NULL,'[]'),
('df388a6b-dd98-4507-926b-37911dd7bcb2',NULL,'variable','main.voyage_vacances',NULL,'Voyage & vacances','personal','document','P10-01 — catégorie principale','official','[]','2026-11-12 19:45:33.091','2026-11-12 19:45:33.091',1,NULL,NULL,'2026-11-12 19:45:33.091','2026-11-12 19:45:33.091','Voyage & vacances','✈️',NULL,0,NULL,'[]'),
('e01bc4eb-e1bc-5c62-b38f-c0eb2b559a97',NULL,'variable','variable.transport_public',NULL,'Transport public','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.489','2026-10-27 17:40:21.489',1,NULL,NULL,'2026-10-27 17:40:21.489','2026-10-27 17:40:21.489','Transport','🚌','#0284C7',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('e0277a77-7b36-5572-89f2-2f01a327df7c',NULL,'goal','goal.retraite',NULL,'Retraite','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('e12c5b6f-fbdf-5c19-b286-93adcf97466d',NULL,'variable','variable.alimentation_boissons',NULL,'Courses alimentaires','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',2,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130','Alimentation','🛒','#16A34A',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('e2617d8d-cb90-5688-be81-124628284099',NULL,'variable','variable.scolarite_enfant',NULL,'Scolarité enfant','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.564','2026-10-27 17:40:21.564',1,NULL,NULL,'2026-10-27 17:40:21.564','2026-10-27 17:40:21.564','Enfants & famille','🏫','#BE185D',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('e271c465-0f8f-56ea-95b0-232df8f434e9',NULL,'variable','variable.activites_enfant',NULL,'Activités enfant','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.571','2026-10-27 17:40:21.571',1,NULL,NULL,'2026-10-27 17:40:21.571','2026-10-27 17:40:21.571','Enfants & famille','⚽','#F472B6',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('e35437b4-a5ae-5dd9-8aaa-72991bc415ec',NULL,'seasonal','seasonal.mariage',NULL,'Mariage','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,'2026-10-31 16:17:39.419',NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('e6e78085-532d-5569-8e34-ac6eb3b92194',NULL,'variable','variable.dons_cadeaux',NULL,'Dons / cadeaux','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,'2026-10-31 16:17:39.419',NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('e7ad952a-e216-56d2-8eb5-6de2b6dd68a6',NULL,'shared','shared.menage',NULL,'Ménage','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('e9cfaa31-0bc0-4921-b07b-dd3e489312e7',NULL,'variable','main.banque_finance',NULL,'Banque & finance','personal','document','P10-01 — catégorie principale','official','[]','2026-11-12 19:45:33.092','2026-11-12 19:45:33.092',1,NULL,NULL,'2026-11-12 19:45:33.092','2026-11-12 19:45:33.092','Banque & finance','🏦',NULL,1,NULL,'[]'),
('e9fabe23-0060-4dac-9620-f0aa44b9fb70',NULL,'income','main.exceptionnel',NULL,'Exceptionnel','personal','document','P10-01 — catégorie principale','official','[]','2026-11-12 19:45:33.070','2026-11-12 19:45:33.070',1,NULL,NULL,'2026-11-12 19:45:33.070','2026-11-12 19:45:33.070','Exceptionnel','🎁',NULL,0,NULL,'[]'),
('eb966e09-eff4-5c06-b416-dcba21878228',NULL,'income','income.freelance_mission',NULL,'Freelance / mission','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',2,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130','Indépendant','🧑‍💻','#0F766E',1,'Variable','[\"Étudiant\", \"Jeune actif\", \"Salarié\"]'),
('ebd999ab-e77b-5084-9230-e0eebc19d41a',NULL,'variable','variable.cours_soutien',NULL,'Cours / soutien','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.555','2026-10-27 17:40:21.555',1,NULL,NULL,'2026-10-27 17:40:21.555','2026-10-27 17:40:21.555','Éducation & formation','🧑‍🏫','#0EA5E9',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('ef797af5-1b79-4f6f-8286-a686938a624b',NULL,'variable','main.loisirs_culture',NULL,'Loisirs & culture','personal','document','P10-01 — catégorie principale','official','[]','2026-11-12 19:45:33.089','2026-11-12 19:45:33.089',1,NULL,NULL,'2026-11-12 19:45:33.089','2026-11-12 19:45:33.089','Loisirs & culture','🎉',NULL,0,NULL,'[]'),
('f0870e20-7da6-4790-9d39-6a60f65aa97b',NULL,'variable','main.education_formation',NULL,'Éducation & formation','personal','document','P10-01 — catégorie principale','official','[]','2026-11-12 19:45:33.081','2026-11-12 19:45:33.081',1,NULL,NULL,'2026-11-12 19:45:33.081','2026-11-12 19:45:33.081','Éducation & formation','🎓',NULL,0,NULL,'[]'),
('f2c41dc3-7c24-52f2-8882-f514bb517c9a',NULL,'fixed','fixed.assurance_mutuelle_sante',NULL,'Assurance / mutuelle santé','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.539','2026-10-27 17:40:21.539',1,NULL,NULL,'2026-10-27 17:40:21.539','2026-10-27 17:40:21.539','Santé & bien-être','🛡️','#9F1239',1,'Mensuel/Annuel','[\"Tous ; ordre suggéré selon profil\"]'),
('f3dbd149-0d39-570c-b388-d40a5eb65d0f',NULL,'variable','variable.restaurant',NULL,'Restaurant','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.480','2026-10-27 17:40:21.480',1,NULL,NULL,'2026-10-27 17:40:21.480','2026-10-27 17:40:21.480','Alimentation','🍽️','#EA580C',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('f4141c9d-edb0-5515-9b8b-79e26eba4df8',NULL,'variable','variable.vetements_enfant',NULL,'Vêtements enfant','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.569','2026-10-27 17:40:21.569',1,NULL,NULL,'2026-10-27 17:40:21.569','2026-10-27 17:40:21.569','Enfants & famille','👕','#EC4899',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('f4531576-1478-58fe-b668-ff7ac8606023',NULL,'fixed','fixed.remboursement_pret_personnel',NULL,'Remboursement prêt personnel','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.635','2026-10-27 17:40:21.635',1,NULL,NULL,'2026-10-27 17:40:21.635','2026-10-27 17:40:21.635','Dettes & engagements','🤝','#C62828',1,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('f57e601d-af48-58e6-9471-1e51972c0252',NULL,'variable','variable.carburant',NULL,'Carburant','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.491','2026-10-27 17:40:21.491',1,NULL,NULL,'2026-10-27 17:40:21.491','2026-10-27 17:40:21.491','Transport','⛽','#0369A1',1,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('f5a1859d-dca8-5797-b372-c9544e582810',NULL,'variable','variable.cinema_spectacle',NULL,'Cinéma / spectacle','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.598','2026-10-27 17:40:21.598',1,NULL,NULL,'2026-10-27 17:40:21.598','2026-10-27 17:40:21.598','Loisirs & culture','🎭','#BE123C',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('f8c3ff67-9464-5c8c-9b7b-4a4719886d45',NULL,'variable','variable.livraison_repas',NULL,'Livraison repas','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.484','2026-10-27 17:40:21.484',1,NULL,NULL,'2026-10-27 17:40:21.484','2026-10-27 17:40:21.484','Alimentation','🛵','#F59E0B',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('f8cd113f-8f01-53a9-9b75-737115648e38',NULL,'variable','variable.certification_examen',NULL,'Certification / examen','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.560','2026-10-27 17:40:21.560',1,NULL,NULL,'2026-10-27 17:40:21.560','2026-10-27 17:40:21.560','Éducation & formation','📝','#0369A1',0,'Ponctuel','[\"Tous ; ordre suggéré selon profil\"]'),
('f8f35c1f-cd76-57aa-aec6-c34dee5010c4',NULL,'seasonal','seasonal.autre_depense_annuelle',NULL,'Autre dépense annuelle','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,'2026-10-31 16:17:39.419',NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('f912fe10-28e4-5579-9317-bc283b5f198f',NULL,'variable','variable.jeux_divertissement',NULL,'Jeux / divertissement','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.605','2026-10-27 17:40:21.605',1,NULL,NULL,'2026-10-27 17:40:21.605','2026-10-27 17:40:21.605','Loisirs & culture','🎲','#FB7185',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('faba33b4-5693-5c7e-9ba6-2886b93cf0f7',NULL,'income','income.cadeau_don_recu',NULL,'Cadeau / don reçu','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.440','2026-10-27 17:40:21.440',1,NULL,NULL,'2026-10-27 17:40:21.440','2026-10-27 17:40:21.440','Exceptionnel','🎁','#DB2777',0,'Ponctuel','[\"Tous\"]'),
('fada5eec-1344-517e-a4d3-82b523b95422',NULL,'goal','goal.voiture',NULL,'Voiture','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]'),
('fb238194-33e8-5309-a0ad-e47aea414d2e',NULL,'fixed','fixed.internet',NULL,'Internet','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',2,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130','Télécom & numérique','🌐','#6D28D9',1,'Mensuel','[\"Tous ; ordre suggéré selon profil\"]'),
('fc4f14b6-de29-54aa-ba2a-6a2a95962272',NULL,'variable','variable.accessoires_animal',NULL,'Accessoires animal','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-27 17:40:21.672','2026-10-27 17:40:21.672',1,NULL,NULL,'2026-10-27 17:40:21.672','2026-10-27 17:40:21.672','Animaux','🦴','#D97706',0,'Variable','[\"Tous ; ordre suggéré selon profil\"]'),
('fdb1b26b-7902-5733-95e4-f23e4c98c6dd',NULL,'income','income.stage_remunere',NULL,'Stage rémunéré','personal','document','FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',2,NULL,NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130','Études & jeunesse','🧑‍🎓','#6D28D9',1,'Variable','[\"Étudiant\"]'),
('ff8c8854-dd18-40f8-9298-3d4188650e76',NULL,'variable','main.dons_solidarite',NULL,'Dons & solidarité','personal','document','P10-01 — catégorie principale','official','[]','2026-11-12 19:45:33.096','2026-11-12 19:45:33.096',1,NULL,NULL,'2026-11-12 19:45:33.096','2026-11-12 19:45:33.096','Dons & solidarité','❤️',NULL,0,NULL,'[]'),
('ffdb3270-f70f-5cf5-94dd-bd5114b96c42',NULL,'variable','variable.animaux',NULL,'Animaux','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',1,'2026-10-31 16:17:39.419',NULL,'2026-10-17 19:57:17.130','2026-10-17 19:57:17.130',NULL,NULL,NULL,0,NULL,'[]');
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
  `accountId` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fin_envelopes_budgetId_idx` (`budgetId`),
  KEY `fin_envelopes_userId_deletedAt_idx` (`userId`,`deletedAt`),
  KEY `fin_envelopes_categoryId_idx` (`categoryId`),
  KEY `fin_envelopes_accountId_idx` (`accountId`),
  CONSTRAINT `fin_envelopes_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `fin_accounts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
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
/*!40000 ALTER TABLE `fin_envelopes` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fin_exchange_rates`
--

DROP TABLE IF EXISTS `fin_exchange_rates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fin_exchange_rates` (
  `id` varchar(191) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `rate` double NOT NULL,
  `referenceDate` date NOT NULL,
  `source` varchar(200) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fin_exchange_rates_currency_referenceDate_key` (`currency`,`referenceDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_exchange_rates`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_exchange_rates` WRITE;
/*!40000 ALTER TABLE `fin_exchange_rates` DISABLE KEYS */;
INSERT INTO `fin_exchange_rates` VALUES
('5f0c1d2e-0000-4000-8000-000000000001','EUR',152.07,'2026-11-04','Banque d\'Algérie, cours officiel du 4 novembre 2026','2026-11-12 19:45:33.129','2026-11-12 19:45:33.129'),
('5f0c1d2e-0000-4000-8000-000000000002','USD',135.91,'2026-11-04','Banque d\'Algérie, cours officiel du 4 novembre 2026','2026-11-12 19:45:33.131','2026-11-12 19:45:33.131'),
('5f0c1d2e-0000-4000-8000-000000000003','GBP',182.39,'2026-11-04','Banque d\'Algérie, cours officiel du 4 novembre 2026','2026-11-12 19:45:33.132','2026-11-12 19:45:33.132'),
('5f0c1d2e-0000-4000-8000-000000000004','CAD',97.21,'2026-11-04','Banque d\'Algérie, cours officiel du 4 novembre 2026','2026-11-12 19:45:33.135','2026-11-12 19:45:33.135');
/*!40000 ALTER TABLE `fin_exchange_rates` ENABLE KEYS */;
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
  `translations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`translations`)),
  PRIMARY KEY (`id`),
  UNIQUE KEY `fin_intents_code_key` (`code`),
  CONSTRAINT `fin_intents_label_check` CHECK (octet_length(trim(`label`)) > 0),
  CONSTRAINT `fin_intents_response_check` CHECK (octet_length(trim(`responseTemplate`)) > 0),
  CONSTRAINT `fin_intents_status_check` CHECK (`status` in ('draft','published')),
  CONSTRAINT `fin_intents_keywords_check` CHECK (json_type(`keywords`) = 'ARRAY'),
  CONSTRAINT `fin_intents_position_check` CHECK (`position` >= 0),
  CONSTRAINT `fin_intents_code_check` CHECK (`code` in ('NAVIGUER','EXPLIQUER_INDICATEUR','CRÉER_OBJECTIF','AIDE_BUDGET','AIDE_DETTE','APPRENDRE_TERME','CHERCHER_SOLUTION','DÉPENSE_PARTAGÉE','CB01','CB02','CB03','CB04','CB05','CB06','CB07','CB08','CB09','CB10','CB11','CB12','CB13','CB14','CB15','CB16','CB17','CB18','CB19','CB20','CB21','CB22','CB23','CB24','CB99') or `code` regexp '^PERSO-[0-9]{3}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_intents`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_intents` WRITE;
/*!40000 ALTER TABLE `fin_intents` DISABLE KEYS */;
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
('073d4b69-23af-45fa-8448-3c903426b86f','mon-argent-01','Lire et analyser mon mois','Lire son mois : ce qui est entré, ce qui est sorti, ce qui reste.','[\"SAL\"]',500000,'DZD','[{\"key\":\"etape-1\",\"prompt\":\"Le mois se termine. Par où commences-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je compare mes revenus et mes dépenses, et je regarde le reste\",\"explanation\":\"Le reste du mois est le chiffre qui guide les décisions.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je regarde seulement mon solde\",\"explanation\":\"Le solde ne dit pas d’où vient l’écart.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je ne regarde pas, tout va bien\",\"explanation\":\"Sans lecture, un écart répété passe inaperçu.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]},{\"key\":\"etape-2\",\"prompt\":\"Une catégorie a dépassé son budget de moitié. Que fais-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je cherche la cause et j’ajuste le budget ou la dépense\",\"explanation\":\"Comprendre la cause permet de corriger durablement.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je note l’écart pour plus tard\",\"explanation\":\"Noter sans agir laisse le problème revenir.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je supprime le budget de cette catégorie\",\"explanation\":\"Sans repère, le dépassement ne se voit plus.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]}]','[{\"key\":\"a-consolider\",\"label\":\"À consolider\",\"minResilience\":0},{\"key\":\"acquis\",\"label\":\"Acquis\",\"minResilience\":14},{\"key\":\"maitrise\",\"label\":\"Maîtrisé\",\"minResilience\":20}]','published',9,1,'2026-11-02 21:04:39.184','2026-11-02 21:04:39.186','2026-11-02 21:04:39.186'),
('116eda4c-dcbe-4ecb-b4f5-57e5867182c0','epargne-01','Suis-je prêt à épargner ou investir ?','Vérifier qu’on est prêt à épargner ou investir : réserve, dettes, horizon.','[\"EPG\"]',500000,'DZD','[{\"key\":\"etape-1\",\"prompt\":\"Tu veux commencer à investir. Que vérifies-tu d’abord ?\",\"choices\":[{\"key\":\"a\",\"label\":\"J’ai une réserve pour les imprévus et pas de dette coûteuse\",\"explanation\":\"On investit l’argent dont on n’a pas besoin tout de suite.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"J’ai de l’argent disponible ce mois-ci\",\"explanation\":\"Disponible aujourd’hui ne veut pas dire disponible demain.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je vois que d’autres le font\",\"explanation\":\"L’avis des autres ne remplace pas ta situation.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]},{\"key\":\"etape-2\",\"prompt\":\"Tu as une dette à taux élevé et un peu d’épargne. Que fais-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je compare le coût de la dette au gain possible avant de choisir\",\"explanation\":\"Rembourser une dette coûteuse est souvent un gain sûr.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je garde la dette et j’investis la totalité\",\"explanation\":\"Le gain incertain peut ne pas couvrir le coût certain.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"J’ignore la dette\",\"explanation\":\"Une dette qui court coûte chaque mois.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]}]','[{\"key\":\"a-consolider\",\"label\":\"À consolider\",\"minResilience\":0},{\"key\":\"acquis\",\"label\":\"Acquis\",\"minResilience\":14},{\"key\":\"maitrise\",\"label\":\"Maîtrisé\",\"minResilience\":20}]','published',18,1,'2026-11-02 21:04:39.250','2026-11-02 21:04:39.251','2026-11-02 21:04:39.251'),
('3e3e07c5-b554-4b70-9e3e-59434df8f381','mon-argent-07','Construire mon patrimoine net','Construire son patrimoine net : ce qu’on possède moins ce qu’on doit.','[\"SAL\"]',500000,'DZD','[{\"key\":\"etape-1\",\"prompt\":\"Tu veux connaître ton patrimoine net. Que fais-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je liste ce que je possède et ce que je dois, puis je soustrais\",\"explanation\":\"Le patrimoine net est la différence entre les deux.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je compte seulement mon épargne\",\"explanation\":\"Les dettes et autres biens changent le résultat.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je ne compte que mes biens, pas mes dettes\",\"explanation\":\"On se croit plus riche qu’on ne l’est.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]},{\"key\":\"etape-2\",\"prompt\":\"Un bien a perdu de la valeur depuis l’achat. Que fais-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je mets sa valeur à jour dans mon calcul\",\"explanation\":\"Un patrimoine à jour reflète la réalité.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je garde le prix d’achat\",\"explanation\":\"Le chiffre devient trop optimiste.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je l’ignore\",\"explanation\":\"Une valeur ignorée fausse le total.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]}]','[{\"key\":\"a-consolider\",\"label\":\"À consolider\",\"minResilience\":0},{\"key\":\"acquis\",\"label\":\"Acquis\",\"minResilience\":14},{\"key\":\"maitrise\",\"label\":\"Maîtrisé\",\"minResilience\":20}]','published',15,1,'2026-11-02 21:04:39.231','2026-11-02 21:04:39.232','2026-11-02 21:04:39.232'),
('416e8ba7-9e36-4fdd-a524-53d6191696a4','mon-argent-cas-final','Cas final — Pilotage financier personnel','Un mois complet : clôture, imprévu, dette et objectif de long terme.','[\"SAL\"]',500000,'DZD','[{\"key\":\"etape-1\",\"prompt\":\"Le mois est clos et tu as un peu d’argent en plus. Que fais-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je complète d’abord mon fonds d’urgence, puis je finance mes objectifs\",\"explanation\":\"La sécurité d’abord, ensuite les projets.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je mets tout sur un objectif de long terme\",\"explanation\":\"Sans réserve, un imprévu peut le défaire.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je dépense, c’est un bonus\",\"explanation\":\"Tu perds une occasion de renforcer ta situation.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]},{\"key\":\"etape-2\",\"prompt\":\"Un imprévu coûte plus que ton fonds d’urgence. Que fais-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"J’utilise le fonds, je comble le reste avec le moins cher, et je reconstitue le fonds\",\"explanation\":\"Tu limites le coût et tu corriges vite.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je prends un crédit pour tout couvrir\",\"explanation\":\"Tu gardes ton fonds, mais tu paies des intérêts.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je retarde le paiement\",\"explanation\":\"Les retards ajoutent des frais.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]},{\"key\":\"etape-3\",\"prompt\":\"Tu as deux dettes. Comment utilises-tu un versement en plus ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je suis la stratégie choisie et je mesure l’économie d’intérêts\",\"explanation\":\"Une stratégie mesurée donne un résultat chiffré.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je le répartis également\",\"explanation\":\"Cela avance sans optimiser.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je le garde sur le compte\",\"explanation\":\"Les dettes continuent de coûter.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]}]','[{\"key\":\"a-consolider\",\"label\":\"À consolider\",\"minResilience\":0},{\"key\":\"acquis\",\"label\":\"Acquis\",\"minResilience\":21},{\"key\":\"maitrise\",\"label\":\"Maîtrisé\",\"minResilience\":30}]','published',17,1,'2026-11-02 21:04:39.243','2026-11-02 21:04:39.244','2026-11-02 21:04:39.244'),
('458adfc4-fb85-47ee-afa9-35e66ac27fbe','mon-argent-05','Comprendre mes dettes et choisir une stratégie','Comprendre ses dettes et choisir une stratégie de remboursement.','[\"SAL\"]',500000,'DZD','[{\"key\":\"etape-1\",\"prompt\":\"Tu as plusieurs dettes. Par quoi commences-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je les liste avec montant, taux et mensualité\",\"explanation\":\"On ne choisit une stratégie qu’avec une vue complète.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je paie celle qui me stresse le plus\",\"explanation\":\"Compréhensible, mais pas toujours la moins chère.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je paie au hasard\",\"explanation\":\"Sans ordre, on paie plus d’intérêts que nécessaire.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]},{\"key\":\"etape-2\",\"prompt\":\"Tu as un peu d’argent en plus. Que fais-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je le mets sur la dette choisie par ma stratégie\",\"explanation\":\"Un versement supplémentaire raccourcit la durée.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je le répartis également sur toutes les dettes\",\"explanation\":\"Cela avance, moins vite qu’une stratégie ciblée.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je le dépense, mes dettes ne bougent pas\",\"explanation\":\"La dette continue de coûter chaque mois.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]}]','[{\"key\":\"a-consolider\",\"label\":\"À consolider\",\"minResilience\":0},{\"key\":\"acquis\",\"label\":\"Acquis\",\"minResilience\":14},{\"key\":\"maitrise\",\"label\":\"Maîtrisé\",\"minResilience\":20}]','published',13,1,'2026-11-02 21:04:39.213','2026-11-02 21:04:39.214','2026-11-02 21:04:39.214'),
('54720adb-3816-4678-bb9f-ae696f274bae','avenir-05','Sécurité financière numérique','Reconnaître les pièges numériques et protéger ses codes.','[\"LYC\"]',500000,'DZD','[{\"key\":\"etape-1\",\"prompt\":\"Un message te demande ton code de carte « pour débloquer un gain ». Que fais-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je ne réponds pas, je ne donne jamais mes codes et j’en parle à un adulte\",\"explanation\":\"Aucun organisme sérieux ne demande un code secret par message.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je réponds pour demander qui écrit\",\"explanation\":\"Répondre confirme que ton numéro est actif et attire d’autres messages.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je donne le code pour recevoir le gain\",\"explanation\":\"Donner son code, c’est donner accès à son argent.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]},{\"key\":\"etape-2\",\"prompt\":\"Un site te demande de créer un compte avec le même mot de passe que ton e-mail. Que fais-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"J’utilise un mot de passe différent et long pour chaque service\",\"explanation\":\"Un mot de passe réutilisé ouvre tous les comptes si un seul est volé.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je change juste un chiffre du mot de passe\",\"explanation\":\"Trop facile à deviner une fois un mot de passe connu.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je mets le même partout pour ne pas oublier\",\"explanation\":\"Un seul vol de mot de passe compromet tous tes comptes.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]}]','[{\"key\":\"a-consolider\",\"label\":\"À consolider\",\"minResilience\":0},{\"key\":\"acquis\",\"label\":\"Acquis\",\"minResilience\":14},{\"key\":\"maitrise\",\"label\":\"Maîtrisé\",\"minResilience\":20}]','published',4,1,'2026-11-02 21:04:39.148','2026-11-02 21:04:39.149','2026-11-02 21:04:39.149'),
('5b974695-6c0a-4e7d-b6a1-57424589a058','epargne-10','Tenir un journal de décisions et faire une revue','Tenir un journal de décisions et faire une revue régulière.','[\"EPG\"]',500000,'DZD','[{\"key\":\"etape-1\",\"prompt\":\"Après une décision d’épargne, que notes-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"La raison, l’alternative écartée et ce que j’attends\",\"explanation\":\"Noter pourquoi permet d’apprendre de ses décisions.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Seulement le montant\",\"explanation\":\"On ne saura plus pourquoi on a choisi.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Rien, je m’en souviendrai\",\"explanation\":\"La mémoire reconstruit le passé à son avantage.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]},{\"key\":\"etape-2\",\"prompt\":\"À la revue, une décision a mal tourné. Que fais-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je regarde si la décision était raisonnable avec ce que je savais\",\"explanation\":\"On juge la décision, pas seulement le résultat.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je blâme la malchance\",\"explanation\":\"Parfois vrai, mais on n’apprend rien.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je renonce à investir\",\"explanation\":\"Une erreur est une information, pas une fin.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]}]','[{\"key\":\"a-consolider\",\"label\":\"À consolider\",\"minResilience\":0},{\"key\":\"acquis\",\"label\":\"Acquis\",\"minResilience\":14},{\"key\":\"maitrise\",\"label\":\"Maîtrisé\",\"minResilience\":20}]','published',27,1,'2026-11-02 21:04:39.316','2026-11-02 21:04:39.317','2026-11-02 21:04:39.317'),
('5d4c16a9-4d2c-4060-a258-f51e5a8e2604','avenir-03','Transformer une envie en objectif','Transformer une envie en objectif chiffré, daté et finançable.','[\"LYC\"]',500000,'DZD','[{\"key\":\"etape-1\",\"prompt\":\"Tu veux un casque audio. Comment en fais-tu un objectif ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je fixe son prix, une date et une somme à mettre de côté chaque mois\",\"explanation\":\"Un objectif a un montant, une date et un rythme.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je mets de côté quand j’y pense\",\"explanation\":\"Mieux que rien, mais sans rythme on n’arrive pas à une date.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"J’attends d’avoir assez d’argent d’un coup\",\"explanation\":\"Sans plan, l’envie passe ou l’argent est dépensé ailleurs.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]},{\"key\":\"etape-2\",\"prompt\":\"Au bout de deux mois, tu as moins mis de côté que prévu. Que fais-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"J’ajuste la date ou le montant mensuel et je continue\",\"explanation\":\"Réviser le plan garde l’objectif atteignable.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je laisse tomber ce mois-ci et je verrai\",\"explanation\":\"Une pause peut se comprendre, mais il faut reprendre le plan.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"J’abandonne l’objectif\",\"explanation\":\"Un retard se corrige ; l’abandon fait perdre l’effort déjà fait.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]}]','[{\"key\":\"a-consolider\",\"label\":\"À consolider\",\"minResilience\":0},{\"key\":\"acquis\",\"label\":\"Acquis\",\"minResilience\":14},{\"key\":\"maitrise\",\"label\":\"Maîtrisé\",\"minResilience\":20}]','published',2,1,'2026-11-02 21:04:39.132','2026-11-02 21:04:39.133','2026-11-02 21:04:39.133'),
('5d773b73-f2d6-4737-9eb8-87e19b6bd922','avenir-06','Comprendre le crédit sans emprunter','Comprendre ce qu’est un crédit et ce qu’il coûte, sans emprunter.','[\"LYC\"]',500000,'DZD','[{\"key\":\"etape-1\",\"prompt\":\"Un crédit te permet d’acheter maintenant et de payer plus tard. Qu’est-ce qui est vrai ?\",\"choices\":[{\"key\":\"a\",\"label\":\"On rembourse plus que ce qu’on a reçu : la différence est le coût du crédit\",\"explanation\":\"Emprunter a un prix ; il faut le connaître avant de s’engager.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"On rembourse exactement la somme reçue\",\"explanation\":\"En général non : le prêteur est payé pour avancer l’argent.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Un crédit est un cadeau de la banque\",\"explanation\":\"Un crédit est une dette qu’il faut rembourser.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]},{\"key\":\"etape-2\",\"prompt\":\"On te propose une mensualité « légère » pour un achat. Que fais-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je demande le coût total et je compare avec mon budget\",\"explanation\":\"La mensualité seule cache la durée et le coût total.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je regarde seulement si la mensualité est basse\",\"explanation\":\"Une mensualité basse peut s’étaler très longtemps.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je signe, la mensualité est petite\",\"explanation\":\"On s’engage sans connaître ce que ça coûtera vraiment.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]}]','[{\"key\":\"a-consolider\",\"label\":\"À consolider\",\"minResilience\":0},{\"key\":\"acquis\",\"label\":\"Acquis\",\"minResilience\":14},{\"key\":\"maitrise\",\"label\":\"Maîtrisé\",\"minResilience\":20}]','published',5,1,'2026-11-02 21:04:39.155','2026-11-02 21:04:39.156','2026-11-02 21:04:39.156'),
('6868521b-618f-48c1-8134-ab9550826d35','epargne-06','Comprendre les grandes classes d’actifs','Découvrir les grandes classes d’actifs et leurs rôles.','[\"EPG\"]',500000,'DZD','[{\"key\":\"etape-1\",\"prompt\":\"Quelle idée décrit le mieux les grandes classes d’actifs ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Chaque classe a son niveau de risque, de rendement possible et de liquidité\",\"explanation\":\"Connaître ces trois aspects aide à choisir.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Elles se valent toutes\",\"explanation\":\"Elles ne se comportent pas de la même manière.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"La plus risquée est toujours la meilleure\",\"explanation\":\"Plus de risque ne garantit pas plus de gain.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]},{\"key\":\"etape-2\",\"prompt\":\"Pourquoi mélanger plusieurs classes d’actifs ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Elles ne réagissent pas toutes pareil aux mêmes événements\",\"explanation\":\"Le mélange réduit l’effet d’un mauvais épisode.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Pour compliquer les choses\",\"explanation\":\"Le but est de réduire le risque, pas de compliquer.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Ce n’est pas utile\",\"explanation\":\"Le mélange est un des moyens de limiter le risque.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]}]','[{\"key\":\"a-consolider\",\"label\":\"À consolider\",\"minResilience\":0},{\"key\":\"acquis\",\"label\":\"Acquis\",\"minResilience\":14},{\"key\":\"maitrise\",\"label\":\"Maîtrisé\",\"minResilience\":20}]','published',23,1,'2026-11-02 21:04:39.284','2026-11-02 21:04:39.286','2026-11-02 21:04:39.286'),
('68bfd974-a64f-428d-ad94-edb846a6a0a5','mon-argent-03','Maîtriser abonnements et dépenses récurrentes','Repérer les abonnements et dépenses récurrentes qui s’accumulent.','[\"SAL\"]',500000,'DZD','[{\"key\":\"etape-1\",\"prompt\":\"Tu fais la liste de tes abonnements. Que fais-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je garde ceux que j’utilise et je résilie les autres\",\"explanation\":\"Un abonnement inutilisé est une dépense pour rien.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je garde tout, c’est peu cher chacun\",\"explanation\":\"Plusieurs petits montants font un gros total.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je ne regarde pas, ça se prélève tout seul\",\"explanation\":\"Ce qui est automatique est ce qu’on oublie le plus.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]},{\"key\":\"etape-2\",\"prompt\":\"Un essai gratuit demande ta carte. Que fais-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je note la date de fin pour décider avant le premier paiement\",\"explanation\":\"Un essai gratuit devient payant si on oublie la date.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je m’inscris en pensant résilier à temps\",\"explanation\":\"Sans rappel, on oublie souvent.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je m’inscris sans lire les conditions\",\"explanation\":\"Les conditions disent quand et combien tu paieras.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]}]','[{\"key\":\"a-consolider\",\"label\":\"À consolider\",\"minResilience\":0},{\"key\":\"acquis\",\"label\":\"Acquis\",\"minResilience\":14},{\"key\":\"maitrise\",\"label\":\"Maîtrisé\",\"minResilience\":20}]','published',11,1,'2026-11-02 21:04:39.197','2026-11-02 21:04:39.198','2026-11-02 21:04:39.198'),
('6cd3556a-0480-4265-a0e1-deb19c7d0142','epargne-05','Risque, volatilité, perte et liquidité','Distinguer risque, volatilité, perte possible et liquidité.','[\"EPG\"]',500000,'DZD','[{\"key\":\"etape-1\",\"prompt\":\"Un placement varie beaucoup d’une semaine à l’autre. Que signifie cela ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Il est volatil : sa valeur peut monter ou baisser fortement\",\"explanation\":\"Volatilité veut dire amplitude des variations.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Il est sûr, car il bouge beaucoup\",\"explanation\":\"Bouger beaucoup n’est pas être sûr.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Il va forcément monter\",\"explanation\":\"Rien ne garantit la hausse.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]},{\"key\":\"etape-2\",\"prompt\":\"Tu pourrais avoir besoin de cet argent bientôt. Que privilégies-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Un placement liquide, que je peux reprendre sans perte importante\",\"explanation\":\"La liquidité, c’est pouvoir récupérer son argent quand il le faut.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Un placement dont je ne peux pas sortir facilement\",\"explanation\":\"Risque de rester bloqué au mauvais moment.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Peu importe, je verrai\",\"explanation\":\"Le besoin d’argent arrive rarement quand on l’a prévu.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]}]','[{\"key\":\"a-consolider\",\"label\":\"À consolider\",\"minResilience\":0},{\"key\":\"acquis\",\"label\":\"Acquis\",\"minResilience\":14},{\"key\":\"maitrise\",\"label\":\"Maîtrisé\",\"minResilience\":20}]','published',22,1,'2026-11-02 21:04:39.275','2026-11-02 21:04:39.276','2026-11-02 21:04:39.276'),
('7878c365-fd13-40cf-831c-fe20604390b9','mon-argent-04','Construire ma sécurité financière et tester un choc','Constituer un fonds d’urgence et mesurer l’effet d’un choc.','[\"SAL\"]',500000,'DZD','[{\"key\":\"etape-1\",\"prompt\":\"Une dépense imprévue de réparation arrive. Qu’est-ce qui t’aide le plus ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Un fonds d’urgence déjà constitué\",\"explanation\":\"Il absorbe le choc sans dettes ni retard de paiement.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Reprendre sur l’épargne d’un autre projet\",\"explanation\":\"Cela dépanne, mais retarde un autre objectif.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Rien de prévu : je m’endette\",\"explanation\":\"Sans réserve, un imprévu devient une dette.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]},{\"key\":\"etape-2\",\"prompt\":\"Tu veux calibrer ton fonds d’urgence. Comment fais-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je le calcule en mois de dépenses essentielles\",\"explanation\":\"Les mois couverts disent combien de temps tu tiens.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je choisis un montant rond au hasard\",\"explanation\":\"Un montant arbitraire peut être trop faible.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je pense que ce n’est pas utile\",\"explanation\":\"Les imprévus arrivent à tout le monde.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]}]','[{\"key\":\"a-consolider\",\"label\":\"À consolider\",\"minResilience\":0},{\"key\":\"acquis\",\"label\":\"Acquis\",\"minResilience\":14},{\"key\":\"maitrise\",\"label\":\"Maîtrisé\",\"minResilience\":20}]','published',12,1,'2026-11-02 21:04:39.204','2026-11-02 21:04:39.205','2026-11-02 21:04:39.205'),
('789faa92-c235-45ff-9cbb-23f05f2c4bfa','avenir-cas-final','Cas final — Passeport Avenir','Une situation complète : budget, objectif, sécurité et crédit à la fois.','[\"LYC\"]',500000,'DZD','[{\"key\":\"etape-1\",\"prompt\":\"Tu reçois ton premier revenu et un message te propose un « placement garanti » par un inconnu. Que fais-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je refuse, je ne donne aucun code et j’en parle à un adulte\",\"explanation\":\"Une promesse de gain garanti venue d’un inconnu est un signal d’alerte.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je demande des détails avant de décider\",\"explanation\":\"Tu donnes du temps à l’arnaqueur.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je tente avec une petite somme\",\"explanation\":\"Une petite somme perdue reste perdue, et on te recontactera.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]},{\"key\":\"etape-2\",\"prompt\":\"Tu veux un objet à 20 000 DA. Quelle est la meilleure démarche ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je fixe une date, je mets de côté chaque mois, sans crédit\",\"explanation\":\"Un objectif financé par l’épargne ne coûte pas d’intérêts.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je prends un crédit avec une petite mensualité\",\"explanation\":\"Tu paieras plus que le prix de l’objet.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"J’achète tout de suite avec l’argent du loyer\",\"explanation\":\"Un besoin essentiel devient impayé.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]},{\"key\":\"etape-3\",\"prompt\":\"Ce mois-ci, ton budget est serré. Que fais-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je réduis une dépense d’envie et je garde l’épargne prévue\",\"explanation\":\"Tu protèges l’objectif en ajustant le confort.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je saute l’épargne ce mois-ci\",\"explanation\":\"Un mois sauté se rattrape rarement.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je dépense comme d’habitude\",\"explanation\":\"L’écart s’agrandit.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]}]','[{\"key\":\"a-consolider\",\"label\":\"À consolider\",\"minResilience\":0},{\"key\":\"acquis\",\"label\":\"Acquis\",\"minResilience\":21},{\"key\":\"maitrise\",\"label\":\"Maîtrisé\",\"minResilience\":30}]','published',8,1,'2026-11-02 21:04:39.175','2026-11-02 21:04:39.176','2026-11-02 21:04:39.176'),
('88e7b512-9d55-4280-9b7f-6059e5906972','epargne-02','Définir objectif et horizon','Définir un objectif d’épargne et son horizon de temps.','[\"EPG\"]',500000,'DZD','[{\"key\":\"etape-1\",\"prompt\":\"Ton objectif est dans deux ans. Quel type de placement convient ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Un choix stable et facile à récupérer\",\"explanation\":\"Sur court terme, on évite les variations fortes.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Un choix risqué pour aller plus vite\",\"explanation\":\"Une baisse peut survenir juste avant la date.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je ne définis pas d’horizon\",\"explanation\":\"Sans horizon, on ne sait pas quel risque accepter.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]},{\"key\":\"etape-2\",\"prompt\":\"Un objectif est dans quinze ans. Que peux-tu envisager ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Accepter plus de variations, car le temps lisse les hauts et les bas\",\"explanation\":\"Un horizon long permet de supporter les baisses passagères.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Tout garder en liquide\",\"explanation\":\"Sûr, mais l’inflation grignote la valeur.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Tout miser sur un seul choix\",\"explanation\":\"La concentration reste risquée, même à long terme.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]}]','[{\"key\":\"a-consolider\",\"label\":\"À consolider\",\"minResilience\":0},{\"key\":\"acquis\",\"label\":\"Acquis\",\"minResilience\":14},{\"key\":\"maitrise\",\"label\":\"Maîtrisé\",\"minResilience\":20}]','published',19,1,'2026-11-02 21:04:39.256','2026-11-02 21:04:39.257','2026-11-02 21:04:39.257'),
('896b0d11-d580-4a8c-aea4-5604e6592b3f','avenir-04','Comprendre compte, CCP, carte et paiement','Comprendre à quoi servent un compte, un CCP, une carte et un paiement.','[\"LYC\"]',500000,'DZD','[{\"key\":\"etape-1\",\"prompt\":\"Tu reçois pour la première fois de l’argent sur un compte. Que retiens-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Le compte garde mon argent et je dois suivre son solde\",\"explanation\":\"Connaître son solde évite les mauvaises surprises.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"L’argent est là, je regarderai quand j’en aurai besoin\",\"explanation\":\"On risque de dépenser plus que ce qu’il y a.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Une carte me donne de l’argent en plus\",\"explanation\":\"Une carte permet de payer avec TON argent ; elle n’en crée pas.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]},{\"key\":\"etape-2\",\"prompt\":\"Tu paies un achat avec ta carte. Que fais-tu ensuite ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je vérifie que le montant débité est le bon\",\"explanation\":\"Contrôler ses opérations permet de repérer une erreur.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je garde le ticket, sans vérifier\",\"explanation\":\"Le ticket aide, mais le contrôle du compte reste à faire.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je ne regarde jamais mes opérations\",\"explanation\":\"Une erreur ou une fraude passerait inaperçue.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]}]','[{\"key\":\"a-consolider\",\"label\":\"À consolider\",\"minResilience\":0},{\"key\":\"acquis\",\"label\":\"Acquis\",\"minResilience\":14},{\"key\":\"maitrise\",\"label\":\"Maîtrisé\",\"minResilience\":20}]','published',3,1,'2026-11-02 21:04:39.141','2026-11-02 21:04:39.142','2026-11-02 21:04:39.142'),
('9434a8eb-6483-44d4-819e-3ff550c1b4d8','mon-argent-06','Planifier mes objectifs de long terme','Planifier des objectifs de long terme avec un rythme réaliste.','[\"SAL\"]',500000,'DZD','[{\"key\":\"etape-1\",\"prompt\":\"Tu as un projet dans plusieurs années. Comment le prépares-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je chiffre le projet, fixe une date et calcule le versement mensuel\",\"explanation\":\"Un versement calculé rend le projet atteignable.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je mets de côté ce que je peux, sans chiffre\",\"explanation\":\"On avance, sans savoir si c’est suffisant.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"J’attends d’avoir de l’argent en trop\",\"explanation\":\"Cet argent en trop n’arrive presque jamais.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]},{\"key\":\"etape-2\",\"prompt\":\"Plusieurs objectifs se concurrencent. Que fais-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je les classe par priorité et je finance d’abord le plus important\",\"explanation\":\"Prioriser évite de tous les retarder.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je donne un peu à chacun\",\"explanation\":\"Aucun n’avance assez vite.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je les finance au gré de mes envies\",\"explanation\":\"Les objectifs importants restent en retard.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]}]','[{\"key\":\"a-consolider\",\"label\":\"À consolider\",\"minResilience\":0},{\"key\":\"acquis\",\"label\":\"Acquis\",\"minResilience\":14},{\"key\":\"maitrise\",\"label\":\"Maîtrisé\",\"minResilience\":20}]','published',14,1,'2026-11-02 21:04:39.221','2026-11-02 21:04:39.223','2026-11-02 21:04:39.223'),
('994f01bc-7c5f-41c8-b4ba-4ae5a72fc743','avenir-01','Besoin ou envie ?','Faire la différence entre ce dont on a besoin et ce dont on a envie, avant de dépenser.','[\"LYC\"]',500000,'DZD','[{\"key\":\"etape-1\",\"prompt\":\"Ta chaussure de sport est usée et tu as un entraînement demain. Que fais-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je remplace la paire usée par un modèle simple\",\"explanation\":\"C’est un vrai besoin : on choisit l’utile, sans payer le prestige.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je répare ou j’emprunte pour le moment, puis j’achète plus tard\",\"explanation\":\"Prudent, mais un besoin réel finit par devoir être couvert.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"J’achète la paire la plus chère de la vitrine\",\"explanation\":\"Le besoin existait, mais le prix a servi l’envie.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]},{\"key\":\"etape-2\",\"prompt\":\"Un ami te propose un jeu en promotion « aujourd’hui seulement ». Que fais-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"J’attends 48 heures pour voir si l’envie reste\",\"explanation\":\"Attendre transforme un achat d’impulsion en choix réfléchi.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"J’achète seulement si j’ai déjà mis cet argent de côté\",\"explanation\":\"Acceptable : l’envie est financée, pas empruntée.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"J’achète tout de suite pour ne pas rater l’offre\",\"explanation\":\"La pression du « seulement aujourd’hui » vise ta décision rapide.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]}]','[{\"key\":\"a-consolider\",\"label\":\"À consolider\",\"minResilience\":0},{\"key\":\"acquis\",\"label\":\"Acquis\",\"minResilience\":14},{\"key\":\"maitrise\",\"label\":\"Maîtrisé\",\"minResilience\":20}]','published',0,1,'2026-11-02 21:04:39.100','2026-11-02 21:04:39.113','2026-11-02 21:04:39.113'),
('9985166d-1f66-409c-b76b-621956a3ed84','avenir-08','Découvrir épargne, risque et portefeuille fictif','Découvrir le lien entre épargne, risque et rendement, avec un portefeuille fictif.','[\"LYC\"]',500000,'DZD','[{\"key\":\"etape-1\",\"prompt\":\"Dans le portefeuille fictif, tu as une somme à placer. Que fais-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je répartis entre plusieurs choix, dont une part facile à récupérer\",\"explanation\":\"Répartir limite l’effet d’une mauvaise surprise.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je mets tout dans un seul choix qui semble bon\",\"explanation\":\"Si ce choix baisse, tout baisse avec lui.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je mets tout dans le choix qui promet le plus\",\"explanation\":\"Une promesse très haute cache souvent un risque très haut.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]},{\"key\":\"etape-2\",\"prompt\":\"Ton portefeuille fictif baisse après deux semaines. Que fais-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je regarde pourquoi, sans décider dans la panique\",\"explanation\":\"Comprendre avant d’agir évite les décisions regrettées.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je vends une partie pour me rassurer\",\"explanation\":\"Possible, mais vendre sous le coup de la peur fige la perte.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je vends tout tout de suite\",\"explanation\":\"Réagir à chaud transforme une baisse passagère en perte.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]}]','[{\"key\":\"a-consolider\",\"label\":\"À consolider\",\"minResilience\":0},{\"key\":\"acquis\",\"label\":\"Acquis\",\"minResilience\":14},{\"key\":\"maitrise\",\"label\":\"Maîtrisé\",\"minResilience\":20}]','published',7,1,'2026-11-02 21:04:39.168','2026-11-02 21:04:39.169','2026-11-02 21:04:39.169'),
('a0deca8a-88aa-4de6-a84d-de2f0aee811c','epargne-cas-final','Cas final — Épargne & Investissement','Un projet à plusieurs années : objectif, risque, inflation et revue.','[\"EPG\"]',500000,'DZD','[{\"key\":\"etape-1\",\"prompt\":\"Tu as un projet dans huit ans. Quelle démarche suis-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je fixe objectif et horizon, puis je choisis un risque adapté\",\"explanation\":\"L’objectif et l’horizon guident le risque acceptable.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je choisis ce qui a le plus rapporté cette année\",\"explanation\":\"Le passé récent ne garantit pas la suite.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je laisse l’argent sur le compte sans plan\",\"explanation\":\"L’inflation réduira sa valeur.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]},{\"key\":\"etape-2\",\"prompt\":\"Ton portefeuille fictif baisse de 15 % en un mois. Que fais-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je relis mon objectif et mon horizon avant de décider\",\"explanation\":\"Une baisse passagère ne change pas forcément le plan.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je vends la moitié par prudence\",\"explanation\":\"Possible, mais cela fige une partie de la perte.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je vends tout\",\"explanation\":\"Tu transformes une baisse en perte.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]},{\"key\":\"etape-3\",\"prompt\":\"À la revue de l’année, que fais-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je compare le rendement à l’inflation, je relis mon journal et j’ajuste le plan\",\"explanation\":\"La revue relie les décisions aux résultats.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je regarde seulement le solde\",\"explanation\":\"Tu ignores l’inflation et les raisons de tes choix.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je ne fais pas de revue\",\"explanation\":\"Sans revue, on répète les mêmes erreurs.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]}]','[{\"key\":\"a-consolider\",\"label\":\"À consolider\",\"minResilience\":0},{\"key\":\"acquis\",\"label\":\"Acquis\",\"minResilience\":21},{\"key\":\"maitrise\",\"label\":\"Maîtrisé\",\"minResilience\":30}]','published',28,1,'2026-11-02 21:04:39.322','2026-11-02 21:04:39.323','2026-11-02 21:04:39.323'),
('a37239d9-1905-4511-ab80-53f16348d8ab','avenir-02','Construire mon premier budget','Construire un premier budget simple : ce qui entre, ce qui sort, ce qui reste.','[\"LYC\"]',500000,'DZD','[{\"key\":\"etape-1\",\"prompt\":\"Tu reçois de l’argent de poche chaque mois. Par quoi commences-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je note ce qui entre et je réserve d’abord une part à mettre de côté\",\"explanation\":\"Se payer en premier rend l’épargne régulière.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je note mes dépenses à la fin du mois\",\"explanation\":\"Utile, mais on découvre le résultat trop tard pour le changer.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je dépense et je regarde ce qu’il reste\",\"explanation\":\"Sans repère, il ne reste souvent rien.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]},{\"key\":\"etape-2\",\"prompt\":\"À mi-mois, il te reste peu pour les sorties prévues. Que fais-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je regarde mon budget et je réduis une dépense non essentielle\",\"explanation\":\"Un budget sert à corriger en cours de route.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je demande une avance sur le mois suivant\",\"explanation\":\"Cela règle ce mois-ci en fragilisant le suivant.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je fais comme si de rien n’était\",\"explanation\":\"Ignorer l’écart ne le fait pas disparaître.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]}]','[{\"key\":\"a-consolider\",\"label\":\"À consolider\",\"minResilience\":0},{\"key\":\"acquis\",\"label\":\"Acquis\",\"minResilience\":14},{\"key\":\"maitrise\",\"label\":\"Maîtrisé\",\"minResilience\":20}]','published',1,1,'2026-11-02 21:04:39.123','2026-11-02 21:04:39.125','2026-11-02 21:04:39.125'),
('a69ce0f2-2499-4d70-bb1f-925b37d3ace4','epargne-09','Comparer deux placements','Comparer deux placements sur les mêmes critères.','[\"EPG\"]',500000,'DZD','[{\"key\":\"etape-1\",\"prompt\":\"Deux placements te sont proposés. Comment les compares-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Sur rendement possible, risque, liquidité, durée et frais\",\"explanation\":\"Comparer sur les mêmes critères évite d’être trompé par un seul chiffre.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Sur le rendement affiché seulement\",\"explanation\":\"Un rendement élevé peut cacher du risque ou des frais.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Sur l’avis d’un ami\",\"explanation\":\"Son cas n’est pas le tien.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]},{\"key\":\"etape-2\",\"prompt\":\"Un placement promet un gain très élevé et sans risque. Que fais-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je me méfie et je demande comment ce gain est possible\",\"explanation\":\"Un gain très élevé sans risque ne se rencontre pas.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"J’essaie avec une petite somme\",\"explanation\":\"Prudent, mais une arnaque peut aussi prendre peu.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"J’investis tout, l’occasion est rare\",\"explanation\":\"C’est le schéma typique d’une arnaque.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]}]','[{\"key\":\"a-consolider\",\"label\":\"À consolider\",\"minResilience\":0},{\"key\":\"acquis\",\"label\":\"Acquis\",\"minResilience\":14},{\"key\":\"maitrise\",\"label\":\"Maîtrisé\",\"minResilience\":20}]','published',26,1,'2026-11-02 21:04:39.309','2026-11-02 21:04:39.310','2026-11-02 21:04:39.310'),
('c65566db-20e0-46f4-a930-37fb422d081f','avenir-07','Simuler mon premier salaire','Passer du salaire annoncé à ce qu’on reçoit vraiment, et le répartir.','[\"LYC\"]',500000,'DZD','[{\"key\":\"etape-1\",\"prompt\":\"On t’annonce un salaire brut pour un premier emploi. Que fais-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je demande le salaire net, celui qui arrive sur le compte\",\"explanation\":\"Seul le net sert à construire un budget.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je calcule mon budget sur le brut\",\"explanation\":\"Le net est plus bas : le budget serait trop optimiste.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je dépense avant de voir la première paie\",\"explanation\":\"Une dépense engagée sur un chiffre incertain est un risque.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]},{\"key\":\"etape-2\",\"prompt\":\"Première paie reçue. Comment la répartis-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Besoins d’abord, une part pour l’épargne, le reste pour les envies\",\"explanation\":\"Une répartition dès le départ évite que tout parte en envies.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je paie mes besoins et je garde le reste sans plan\",\"explanation\":\"Sans plan, le reste disparaît souvent.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je m’offre une grosse envie avec la moitié\",\"explanation\":\"Une grosse envie le premier mois laisse peu pour la suite.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]}]','[{\"key\":\"a-consolider\",\"label\":\"À consolider\",\"minResilience\":0},{\"key\":\"acquis\",\"label\":\"Acquis\",\"minResilience\":14},{\"key\":\"maitrise\",\"label\":\"Maîtrisé\",\"minResilience\":20}]','published',6,1,'2026-11-02 21:04:39.162','2026-11-02 21:04:39.163','2026-11-02 21:04:39.163'),
('d13069db-2610-4b41-9aed-085eed478a8e','mon-argent-08','Simuler logement, retraite, inflation et décisions de long terme','Simuler logement, retraite, inflation et décisions de long terme.','[\"SAL\"]',500000,'DZD','[{\"key\":\"etape-1\",\"prompt\":\"Tu simules un projet de long terme. Quelle précaution prends-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je teste plusieurs hypothèses, dont une défavorable\",\"explanation\":\"Une simulation prudente évite les mauvaises surprises.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je teste une seule hypothèse raisonnable\",\"explanation\":\"Utile, mais ne montre pas la marge de risque.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je prends l’hypothèse la plus favorable\",\"explanation\":\"On construit un plan sur un cas qui peut ne pas arriver.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]},{\"key\":\"etape-2\",\"prompt\":\"L’inflation fait monter les prix. Comment la prends-tu en compte ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je compare le rendement à l’inflation pour juger le gain réel\",\"explanation\":\"Un gain inférieur à l’inflation fait perdre du pouvoir d’achat.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je regarde le rendement affiché seulement\",\"explanation\":\"Le rendement affiché ne dit pas le gain réel.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je pense que les prix ne bougent pas\",\"explanation\":\"Sur la durée, les prix montent.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]}]','[{\"key\":\"a-consolider\",\"label\":\"À consolider\",\"minResilience\":0},{\"key\":\"acquis\",\"label\":\"Acquis\",\"minResilience\":14},{\"key\":\"maitrise\",\"label\":\"Maîtrisé\",\"minResilience\":20}]','published',16,1,'2026-11-02 21:04:39.237','2026-11-02 21:04:39.238','2026-11-02 21:04:39.238'),
('d31c383e-6518-47a7-bfb4-969129ae13d2','epargne-04','Inflation et rendement réel','Comprendre l’inflation et distinguer rendement nominal et rendement réel.','[\"EPG\"]',500000,'DZD','[{\"key\":\"etape-1\",\"prompt\":\"Ton épargne rapporte 4 % et les prix montent de 6 %. Que se passe-t-il ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Tu perds du pouvoir d’achat malgré les intérêts\",\"explanation\":\"Le rendement réel est négatif quand l’inflation dépasse le rendement.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Tu gagnes 4 %, donc tu es gagnant\",\"explanation\":\"4 % est le gain affiché ; ce que tu peux acheter a baissé.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"L’inflation ne concerne que les prix\",\"explanation\":\"L’inflation réduit ce que ton argent permet d’acheter.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]},{\"key\":\"etape-2\",\"prompt\":\"Comment juger un gain d’épargne ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je compare le rendement à l’inflation\",\"explanation\":\"C’est la comparaison qui donne le gain réel.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je regarde le montant final seulement\",\"explanation\":\"Un montant plus grand peut acheter moins.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je regarde la publicité\",\"explanation\":\"Une publicité met en avant le meilleur chiffre.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]}]','[{\"key\":\"a-consolider\",\"label\":\"À consolider\",\"minResilience\":0},{\"key\":\"acquis\",\"label\":\"Acquis\",\"minResilience\":14},{\"key\":\"maitrise\",\"label\":\"Maîtrisé\",\"minResilience\":20}]','published',21,1,'2026-11-02 21:04:39.268','2026-11-02 21:04:39.269','2026-11-02 21:04:39.269'),
('f1113ee5-79bd-4d24-8447-6a1cf5717d00','epargne-07','Diversification et concentration','Comprendre la diversification et le danger de la concentration.','[\"EPG\"]',500000,'DZD','[{\"key\":\"etape-1\",\"prompt\":\"Presque toute ton épargne est dans un seul actif. Que fais-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je répartis progressivement sur plusieurs actifs\",\"explanation\":\"Répartir diminue le poids d’un seul incident.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je garde tout, je lui fais confiance\",\"explanation\":\"La confiance ne protège pas d’une baisse.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"J’ajoute encore dans ce même actif\",\"explanation\":\"Cela augmente la concentration.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]},{\"key\":\"etape-2\",\"prompt\":\"Qu’est-ce qu’une bonne diversification ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Des actifs différents, pas seulement plusieurs noms du même type\",\"explanation\":\"Deux actifs qui réagissent pareil ne diversifient pas.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Beaucoup de petits placements du même type\",\"explanation\":\"La quantité ne fait pas la diversification.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Un seul placement, mais très surveillé\",\"explanation\":\"Surveiller ne remplace pas répartir.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]}]','[{\"key\":\"a-consolider\",\"label\":\"À consolider\",\"minResilience\":0},{\"key\":\"acquis\",\"label\":\"Acquis\",\"minResilience\":14},{\"key\":\"maitrise\",\"label\":\"Maîtrisé\",\"minResilience\":20}]','published',24,1,'2026-11-02 21:04:39.292','2026-11-02 21:04:39.293','2026-11-02 21:04:39.293'),
('f310b11b-af3a-46e0-a626-acd899a4a825','mon-argent-02','Comprendre ma fiche de paie','Comprendre les lignes d’une fiche de paie : brut, retenues, net.','[\"SAL\"]',500000,'DZD','[{\"key\":\"etape-1\",\"prompt\":\"Ta fiche de paie montre un brut et un net différents. Que fais-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je lis les retenues ligne par ligne pour comprendre l’écart\",\"explanation\":\"Savoir d’où vient l’écart évite de se tromper dans son budget.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je retiens seulement le net\",\"explanation\":\"Le net suffit au budget, mais on ne repère pas une erreur.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je ne l’ouvre jamais\",\"explanation\":\"Une erreur éventuelle ne serait jamais vue.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]},{\"key\":\"etape-2\",\"prompt\":\"Une ligne te paraît inhabituelle ce mois-ci. Que fais-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je compare avec le mois précédent et je pose la question au service compétent\",\"explanation\":\"Vérifier tôt permet de faire corriger rapidement.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"J’attends le mois prochain pour voir\",\"explanation\":\"Le temps qui passe complique parfois la correction.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je suppose que c’est normal\",\"explanation\":\"Une erreur non signalée peut durer.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]}]','[{\"key\":\"a-consolider\",\"label\":\"À consolider\",\"minResilience\":0},{\"key\":\"acquis\",\"label\":\"Acquis\",\"minResilience\":14},{\"key\":\"maitrise\",\"label\":\"Maîtrisé\",\"minResilience\":20}]','published',10,1,'2026-11-02 21:04:39.191','2026-11-02 21:04:39.192','2026-11-02 21:04:39.192'),
('f6245d67-ee72-449e-ae73-f0c97b4d8791','epargne-08','Construire un portefeuille fictif','Construire un portefeuille fictif et en lire le résultat.','[\"EPG\"]',500000,'DZD','[{\"key\":\"etape-1\",\"prompt\":\"Tu construis ton premier portefeuille fictif. Comment répartis-tu ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Selon mon objectif, mon horizon et le risque que je supporte\",\"explanation\":\"Le portefeuille découle de l’objectif.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Selon ce qui a le mieux marché récemment\",\"explanation\":\"Le passé récent ne garantit pas la suite.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Au hasard\",\"explanation\":\"Sans logique, on ne peut pas expliquer le résultat.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]},{\"key\":\"etape-2\",\"prompt\":\"Comment lis-tu le résultat de ton portefeuille fictif ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Je regarde le gain et aussi la baisse maximale supportée\",\"explanation\":\"Un résultat se juge avec le risque pris.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Je regarde seulement le gain\",\"explanation\":\"On oublie le risque pris pour l’obtenir.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"Je ne le regarde pas\",\"explanation\":\"Un portefeuille non suivi ne sert pas à apprendre.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]}]','[{\"key\":\"a-consolider\",\"label\":\"À consolider\",\"minResilience\":0},{\"key\":\"acquis\",\"label\":\"Acquis\",\"minResilience\":14},{\"key\":\"maitrise\",\"label\":\"Maîtrisé\",\"minResilience\":20}]','published',25,1,'2026-11-02 21:04:39.300','2026-11-02 21:04:39.301','2026-11-02 21:04:39.301'),
('fc107d96-8eec-468e-b24d-39f21229c222','epargne-03','Intérêt simple et intérêt composé','Comprendre la différence entre intérêt simple et intérêt composé.','[\"EPG\"]',500000,'DZD','[{\"key\":\"etape-1\",\"prompt\":\"En intérêt simple, que se passe-t-il chaque période ?\",\"choices\":[{\"key\":\"a\",\"label\":\"L’intérêt est calculé sur le capital de départ seulement\",\"explanation\":\"L’intérêt simple ne s’ajoute pas au capital.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"L’intérêt est calculé sur le capital et les intérêts déjà gagnés\",\"explanation\":\"C’est la définition de l’intérêt composé.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"L’intérêt est le même quelle que soit la durée\",\"explanation\":\"Le total des intérêts grandit avec la durée.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]},{\"key\":\"etape-2\",\"prompt\":\"En intérêt composé, pourquoi la durée compte-t-elle autant ?\",\"choices\":[{\"key\":\"a\",\"label\":\"Les intérêts gagnent eux-mêmes des intérêts, l’effet s’accélère\",\"explanation\":\"C’est l’effet « boule de neige » de l’intérêt composé.\",\"cash\":-30000,\"savings\":30000,\"resilience\":10},{\"key\":\"b\",\"label\":\"Parce que le taux augmente tout seul\",\"explanation\":\"Le taux ne change pas, c’est la base de calcul qui grandit.\",\"cash\":0,\"savings\":0,\"resilience\":4},{\"key\":\"c\",\"label\":\"La durée ne change rien\",\"explanation\":\"Plus la durée est longue, plus l’écart avec l’intérêt simple grandit.\",\"cash\":-60000,\"savings\":0,\"resilience\":-6}]}]','[{\"key\":\"a-consolider\",\"label\":\"À consolider\",\"minResilience\":0},{\"key\":\"acquis\",\"label\":\"Acquis\",\"minResilience\":14},{\"key\":\"maitrise\",\"label\":\"Maîtrisé\",\"minResilience\":20}]','published',20,1,'2026-11-02 21:04:39.262','2026-11-02 21:04:39.263','2026-11-02 21:04:39.263');
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
  CONSTRAINT `fin_occurrences_scope_check` CHECK (`scope` in ('personal','couple','household','space')),
  CONSTRAINT `fin_occurrences_source_check` CHECK (`source` in ('manual','imported','document','partner','computed')),
  CONSTRAINT `fin_occurrences_status_check` CHECK (`status` in ('real','declared','imported','computed','official','to_confirm')),
  CONSTRAINT `fin_occurrences_version_check` CHECK (`version` >= 1),
  CONSTRAINT `fin_occurrences_outcome_check` CHECK (`outcome` in ('confirmed','missed','postponed','included'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_occurrences`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_occurrences` WRITE;
/*!40000 ALTER TABLE `fin_occurrences` DISABLE KEYS */;
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
  `incomeId` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fin_recurrences_userId_nextDate_idx` (`userId`,`nextDate`),
  KEY `fin_recurrences_categoryId_idx` (`categoryId`),
  KEY `fin_recurrences_accountId_fkey` (`accountId`),
  KEY `fin_recurrences_incomeId_idx` (`incomeId`),
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
('a1e68b5a-fc8b-404c-aaab-74e26eb6990a','c9f44b4f-ab19-4d8e-8355-fc32952c3796','health','2026-11','{\"valeur\":0,\"bande\":\"Priorité sécurité\",\"partiel\":true,\"version\":\"B-9\",\"dimensions\":[{\"key\":\"balance\",\"score\":null},{\"key\":\"reserve\",\"score\":null},{\"key\":\"debt\",\"score\":null},{\"key\":\"savings\",\"score\":null},{\"key\":\"goals\",\"score\":null},{\"key\":\"budgets\",\"score\":null},{\"key\":\"dataQuality\",\"score\":0}]}',2,'2026-11-03 20:30:46.194');
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
('4c9b841b-fc73-41de-8a85-df383585600e','image','b8343cd4640080368a35a8c112dda173.png','evil.php','image/png',191,NULL,'75c5e648-3370-4db7-b399-fd88675d2f73','2026-10-17 19:57:17.542',NULL,NULL,NULL);
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
('aziz','sellal','2026-09-26 19:26:52.769'),
('contactAddress','','2026-09-25 13:05:45.643'),
('contactEmail','','2026-09-25 13:05:45.643'),
('contactPhone','','2026-09-25 13:05:45.643'),
('maintenanceMode','false','2026-09-25 13:05:45.643');
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
('eabc8758-1fd8-48a5-ab42-00611cad1a17','c9f44b4f-ab19-4d8e-8355-fc32952c3796','Chrome · Windows','2026-11-03 20:30:44.934','2026-11-03 20:30:44.934',NULL);
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
('75c5e648-3370-4db7-b399-fd88675d2f73','user-mvctiok5-1-9fb2@test.local','not-a-real-hash','Test Admin','pme','standard','admin','active','2026-10-17 19:57:17.203','2026-10-17 19:57:17.203',NULL,NULL,'DZD',NULL,NULL,NULL,NULL,'[]',NULL,NULL,'{}','stable','{}'),
('c9f44b4f-ab19-4d8e-8355-fc32952c3796','mynameisazizsellal@gmail.com','$2b$12$Q8A6xTCTIDg5CfQf.KhbrOJY2V/m.GiRNEKzpHfiu9P.N5cmk1sFy','Aziz Sellal','lyceen','standard','user','active','2026-11-03 20:30:44.906','2026-11-03 20:30:44.906',NULL,NULL,'DZD',NULL,NULL,NULL,NULL,'[]',NULL,NULL,'{}','stable','{}');
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

-- Dump completed on 2026-11-12 20:32:52

-- Mise en ligne (2026-11-12) : les sessions de la base de développement ne valent rien
-- en ligne ; elles sont fermées pour qu’aucune ne bloque la connexion d’un compte
-- gratuit (règle « un seul écran », P10-06).
UPDATE `user_sessions` SET `revokedAt` = NOW(3) WHERE `revokedAt` IS NULL;
