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
('0d27bde6-a454-4ebb-bbf4-8f2e3b58f8d0','8a547a48151a05331edc38b27d03de9e597b30b349566ef5ce733d5081e7c225','2026-10-11 07:38:25.590','20261011073811_payments',NULL,NULL,'2026-10-11 07:38:25.157',1),
('0d4bfa74-f62a-44ff-ab19-00900fd90df8','94a797dd8a728d67ce57d0c08dc6293bd639e2f397690a24b960a2ee5bfe0a71','2026-10-14 12:07:39.446','20261013220000_fin_paper',NULL,NULL,'2026-10-14 12:07:39.058',1),
('0dd00c15-88a6-4af1-a0fc-f0543959767a','c17b847092959ff94d2fc63ee5ab0abdfd13bc87209e1dfc9260a0b6701d9dd4','2026-10-14 12:07:40.233','20261014090000_fin_shared_expenses',NULL,NULL,'2026-10-14 12:07:39.449',1),
('156cb726-b338-4b5d-95c0-674f545ae660','a2bad17068acd30467d181a2b02578dd6d199f1d2522eaeb5cd15965b6fe9e9e','2026-10-10 14:40:23.707','20261007230551_long_text_columns',NULL,NULL,'2026-10-10 14:40:22.783',1),
('1976149a-95d2-45ca-bc56-d1591778f6b7','1bde2dae92b872c8b04b841306b843f81b01659f8fd49c2329531c9f405cd687','2026-10-11 07:27:27.732','20261011072704_chatbot_entries',NULL,NULL,'2026-10-11 07:27:27.653',1),
('1fb1a59d-ac82-4a1c-b7f5-7f29cb877419','2b84aef4f87ac66aaccce41cfee73187dab039803b4dc2288e7a77f067c2a4cb','2026-10-14 12:07:38.557','20261013180000_fin_assets',NULL,NULL,'2026-10-14 12:07:38.378',1),
('2f0a8b1a-0774-4d00-b5f6-fbcc286b73a0','80e99ed8aca15997fd263d8f38aa5597c1ce0dca4a38f89247fd1d92d41ab24f','2026-10-13 15:23:08.320','20261012180310_fin_money_onboarding',NULL,NULL,'2026-10-13 15:23:07.836',1),
('30af393f-1b20-4366-ac76-cf8f12143896','d2e02e7f9d67cec625e61379c41caf319330a1db95780b7c576d4429a8bf4283','2026-10-14 12:07:39.055','20261013200000_fin_spaces',NULL,NULL,'2026-10-14 12:07:38.560',1),
('34ec7891-88d5-444b-a657-b8dfa3873df1','0f93c35e2c3737c351080a8f78b5b2456e1583ea1342215e6b70390eaad446cc','2026-10-10 14:40:20.843','20261006204050_init',NULL,NULL,'2026-10-10 14:40:17.853',1),
('38ecfa27-13bf-44be-bb50-86fc3a881cbd','705ddda5aa8b57e4e34eb801401970810f5986f93a12ec6e95aa6c4ada91d8a2','2026-10-10 14:40:22.359','20261006204702_comparator_data',NULL,NULL,'2026-10-10 14:40:22.243',1),
('42618f5f-a44d-4d9a-9368-7a73b4868a0f','9bf9ffe53953b8174fc29766427ae8d85b53a10f99df233bb83fa1f1a7c75596','2026-10-13 15:23:08.461','20261012185725_fin_money_category_setnull',NULL,NULL,'2026-10-13 15:23:08.322',1),
('5845694d-9f2e-4103-b597-9fc34ae6ff01','82644efd9ac6089619d2a01d0d7ebcb5d85f63a4b4b620fcbf13f1b52a365941','2026-10-13 15:23:07.834','20261012003049_fin_data_model',NULL,NULL,'2026-10-13 15:23:07.477',1),
('642ea29d-2d7e-43d0-9200-591c878885d8','193ffcd4f0031c4ec4ee537e5e3dde3d2e450c8f133115baff3e4a833bbc7cd9','2026-10-14 12:07:38.375','20261013120000_fin_calendar',NULL,NULL,'2026-10-14 12:07:38.032',1),
('68223956-f731-4654-b724-79525eabc51f','bb2fc11d326f2e1dfb07cd856efe67baf0070447602bb6c3244dff5585f474c3','2026-10-11 15:08:04.365','20261011150559_finculdia_p3_18_p2_08_p3_19',NULL,NULL,'2026-10-11 15:08:03.492',1),
('7381fca0-9f41-4cfc-a0bc-528937a28ab5','109ad56ee46afbbe5316ed76eee92e36b0ea39bf664d97d63d9f6f4e55ba24a8','2026-10-13 15:24:10.990','20261013152319_fin_goals_debts_reserve',NULL,NULL,'2026-10-13 15:24:10.384',1),
('7c1d7586-ae5b-4beb-8490-b8be806e00f9','fa3dd781ab6657ee39b68a7f6edb59fc458cc9141c78e3c0576e2b3845aa4aa0','2026-10-10 14:40:22.375','20261006210000_account_types_seed',NULL,NULL,'2026-10-10 14:40:22.362',1),
('957f6695-4c41-4331-b1fc-7ce3b2c8e0aa','e18f423ee86ef5901e1ee50dc81d24e48f66d9ed4bf77be94c78e25154fe17bd','2026-10-10 14:40:22.240','20261006204200_integrity_checks',NULL,NULL,'2026-10-10 14:40:20.850',1),
('975dc156-5647-4090-a072-a4685c215cbf','7e49511c7196ae2d1403c243a755d1291d40e82439aff871c799c38a35262db6','2026-10-14 13:34:27.203','20261014133329_fin_notifications',NULL,NULL,'2026-10-14 13:34:26.948',1),
('abf7a24b-78a0-49a7-85b2-acae4f7cdf5f','11fbfd8b18da3830f4860f3d0a008e657674d9d8ee3cb24bb86469680e4ee3fa','2026-10-14 12:40:14.618','20261014123925_fin_space_goals_children_provisions',NULL,NULL,'2026-10-14 12:40:14.138',1),
('da584954-1f56-4573-9fe1-5c7d8c4b280b','7a65b0e6a3a93c99896efbd3930aa24abddf0d1f83bf0980b62e5d4d46752124','2026-10-15 09:35:37.777','20261015093455_formation_target_account_types',NULL,NULL,'2026-10-15 09:35:37.745',1),
('dd09612a-bc2c-46c4-8f0b-f636e82d838b','350f04ade403dce02b29395e11f6eeee83e25be74c29efcb17685c7981d30394','2026-10-13 15:23:07.473','20261011212102_apprendre_axes_favorites',NULL,NULL,'2026-10-13 15:23:07.022',1),
('de6bbb28-3f46-4145-94ce-671711db3b41','49e727f64a2ed9cd8bf556105b3246c2810cb4174b072fe2b03c94750ed27e68',NULL,'20261011150559_finculdia_p3_18_p2_08_p3_19','A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20261011150559_finculdia_p3_18_p2_08_p3_19\n\nDatabase error code: 4025\n\nDatabase error:\nCONSTRAINT `users.finSecondaryPublics` failed for `larbi_dev`.`users`\n\nPlease check the query number 16 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"20261011150559_finculdia_p3_18_p2_08_p3_19\"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name=\"20261011150559_finculdia_p3_18_p2_08_p3_19\"\n             at schema-engine\\commands\\src\\commands\\apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:255','2026-10-11 15:07:31.664','2026-10-11 15:06:42.209',0),
('deb2efad-8c2e-42dd-9a05-7cb0a97e8df7','1741a7e6fbbba782aa134556b2a362d9b0b5106b785d5ddc568821bc51fec35a','2026-10-10 14:40:23.795','20261009195759_simulation_scenarios',NULL,NULL,'2026-10-10 14:40:23.710',1),
('e55f4a5e-bf28-4c64-861c-8a5dcfeb25d5','aeed228837c50d043828e21e3af8ca954502547212fc01d724093d9a5bebe242','2026-10-13 15:23:08.683','20261012192000_fin_receipt_on_media',NULL,NULL,'2026-10-13 15:23:08.463',1),
('f0a48115-3598-48cb-8d06-dbb54d9bafa9','4a8ea78d982054d0730fcb53e9d0971240a06104c267cca799539cca321bc637','2026-10-10 14:40:22.779','20261006211000_case_sensitive_checks',NULL,NULL,'2026-10-10 14:40:22.378',1),
('f66b1d25-9910-4d45-85f7-638da8628a2e','e1db5611f13ca75b0a74220e4fe9d14546571060fed49f90a794737d278626cf','2026-10-13 15:23:09.036','20261013090000_fin_budgets',NULL,NULL,'2026-10-13 15:23:08.685',1);
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
  `value` int(11) NOT NULL,
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
('b33a30da-5bb2-486b-9b56-a2d0a65ca907','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','SLS','vehicle',NULL,14000000,'DZD','2025-10-17 00:00:00.000','semi_liquid','moi',NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-10-17 08:20:13.938','2026-10-17 08:20:13.938',1,NULL,NULL,'2026-10-17 08:20:13.938','2026-10-17 08:20:13.938'),
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
('e0f6f7f6-edd0-4388-aa12-929fac5ffaed','dd81c796-b6b8-49bd-a807-876c1c531d0b','aziz','2026-10-01 00:00:00.000','2026-10-31 22:59:59.000','DZD','monthly','[0.8,1]',NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-10-15 08:53:16.366','2026-10-15 08:53:16.366',1,NULL,NULL,'2026-10-15 08:53:16.366','2026-10-15 08:53:16.366'),
('eb1a8c58-c6dc-4494-81ee-ca690e3a2b50','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','aziz','2026-04-15 00:00:00.000','2026-10-31 22:59:59.000','DZD','none','[0.8,1]',NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-10-17 08:10:15.553','2026-10-17 08:10:15.553',1,NULL,NULL,'2026-10-17 08:10:15.553','2026-10-17 08:10:15.553');
/*!40000 ALTER TABLE `fin_budgets` ENABLE KEYS */;
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
('00463b58-dd2d-5234-91e9-bacbe2dfe7bd',NULL,'shared','shared.gaz',NULL,'Gaz','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('022689f4-0a13-56bf-a282-427f826e8839',NULL,'shared','shared.electricite',NULL,'Électricité','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('06c02b43-af20-5eed-bb6d-bf82fb3c78e8',NULL,'fixed','fixed.credit_immobilier',NULL,'Crédit immobilier','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('0ad7aaee-263a-5255-9f92-c40c480392fa',NULL,'shared','shared.transport_commun',NULL,'Transport commun','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('103b8ab1-e94b-5e29-9f5e-c036e30d74b8',NULL,'income','income.pension',NULL,'Pension','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('14cc44e4-c1d9-53a5-8f79-b33ec7dbd78b',NULL,'fixed','fixed.eau',NULL,'Eau','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('15aaaa15-e5c9-5fc6-9363-ec8e76602eb0',NULL,'seasonal','seasonal.rentree_scolaire',NULL,'Rentrée scolaire','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('18d882c4-7c4a-5e08-a3bb-b5befd4c17ee',NULL,'goal','goal.ordinateur_equipement',NULL,'Ordinateur / équipement','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('1f6e6e4f-acf6-571d-adfc-79e6eabd1bb3',NULL,'fixed','fixed.gaz',NULL,'Gaz','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('26fb98c2-4ffb-5d47-86d2-035076a1792a',NULL,'variable','variable.telecom_variable',NULL,'Télécom variable','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('297a728a-1b03-578b-9559-95faea0b9170',NULL,'shared','shared.sorties',NULL,'Sorties','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('2c007ea1-fc78-5170-adaf-c7680d325044',NULL,'shared','shared.projet_commun',NULL,'Projet commun','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('2d925b61-db62-57b0-b1c1-fbcafb309575',NULL,'shared','shared.loyer',NULL,'Loyer','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('2da80560-f1c7-53ad-96ae-b4c0288dd055',NULL,'goal','goal.permis',NULL,'Permis','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('32fd710a-6837-5822-9cfb-eb19ff666957',NULL,'variable','variable.culture_loisirs_sorties',NULL,'Culture / loisirs / sorties','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('346b9da6-92c7-5136-bac3-938ebbdaaad2',NULL,'fixed','fixed.abonnement',NULL,'Abonnement','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('36562e12-b329-5574-be61-96e4c8634aeb',NULL,'fixed','fixed.transport_recurrent',NULL,'Transport récurrent','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('3a27e5cc-a558-5a24-99db-d09bb93eaf97',NULL,'income','income.revenu_locatif',NULL,'Revenu locatif','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('3d2b25f3-3202-53a6-bc60-0e809da751d3',NULL,'fixed','fixed.pension_engagement',NULL,'Pension / engagement','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('3dc2b43c-b045-5a69-b5fa-4e2951a95791',NULL,'goal','goal.voyage',NULL,'Voyage','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('3f7c3422-96b9-58c9-b779-be915b5ad3ef',NULL,'income','income.salaire_brut_information',NULL,'Salaire brut (information)','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('4139e59c-3c2e-5a29-8cdf-fe5e8f070157',NULL,'debt','debt.dette_familiale_declaree',NULL,'Dette familiale déclarée','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('44473602-32e0-54e3-8e84-c97fa4ab290b',NULL,'goal','goal.autre',NULL,'Autre','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('452c4589-17d4-5e80-91ad-418d1b72e5f2',NULL,'debt','debt.credit_immobilier',NULL,'Crédit immobilier','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('4559ae8c-a437-555a-ab9c-57004bb0682b',NULL,'variable','variable.transport_automobile',NULL,'Transport / automobile','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('462c54ab-ae70-52cc-95be-06f40240b8a3',NULL,'income','income.aide_familiale',NULL,'Aide familiale','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('46830f2c-7ad5-596a-9284-4218186837a9',NULL,'asset','asset.ccp',NULL,'CCP','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('47448ae2-9c9b-5418-af5b-5875b554f11f',NULL,'asset','asset.compte_d_epargne',NULL,'Compte d’épargne','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('47f702a5-91ca-55df-962c-cadfe651ab05',NULL,'goal','goal.etudes',NULL,'Études','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('48067220-d777-5db4-b6e0-0f63bdf37265',NULL,'seasonal','seasonal.entretien_reparation',NULL,'Entretien / réparation','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('4a9dcfd0-279b-528c-933a-130990a43a40',NULL,'variable','variable.maison_equipement',NULL,'Maison / équipement','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('4ba17c79-10b2-56d1-ae91-a9cad1745397',NULL,'fixed','fixed.electricite',NULL,'Électricité','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('4d01add5-eb04-5201-ae40-fa1c1899a79a',NULL,'fixed','fixed.autre_charge_fixe',NULL,'Autre charge fixe','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('4e8a3bcd-0163-5b6d-a72f-781452a115b9',NULL,'goal','goal.reserve_de_securite',NULL,'Réserve de sécurité','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('4f75acc1-aee3-5114-a5e4-a7db5521e1f6',NULL,'asset','asset.or',NULL,'Or','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('54d836e0-2a54-59cb-b6fc-cd9a6c629516',NULL,'fixed','fixed.credit_consommation',NULL,'Crédit consommation','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('58b791c3-f03e-57de-833f-253a51346e84',NULL,'income','income.bourse',NULL,'Bourse','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('5fe76ef2-65d7-5034-aa7c-c635f4ea3bd8',NULL,'asset','asset.participation_entreprise',NULL,'Participation / entreprise','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('60a634d8-f7b4-5951-a166-418e7b8c48a2',NULL,'seasonal','seasonal.fetes',NULL,'Fêtes','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('655c8f61-ec2c-5437-8142-6790d4812b5e',NULL,'income','income.job_etudiant',NULL,'Job étudiant','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('6f48de67-b016-5512-be4d-feab8f4f7763',NULL,'shared','shared.equipement_commun',NULL,'Équipement commun','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('6f66efbc-8ae9-5eb3-abc2-b5ce7edd85dd',NULL,'fixed','fixed.copropriete_charges',NULL,'Copropriété / charges','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('6faa9b73-32cc-559b-a5d3-862e6685fb38',NULL,'asset','asset.obligations_sukuk_declares',NULL,'Obligations / sukuk déclarés','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('6fbea5a6-a534-52e9-8157-99f2b9db8d34',NULL,'asset','asset.compte_bancaire',NULL,'Compte bancaire','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('73abb6aa-b5e6-5bfa-a360-61654dd00c62',NULL,'debt','debt.financement_vehicule',NULL,'Financement véhicule','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('7508d75a-8d76-5f6f-b9b9-0256a17c8f09',NULL,'asset','asset.autre_actif',NULL,'Autre actif','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('78536d54-4a70-5fea-bed7-4f5cd47cc162',NULL,'income','income.prime',NULL,'Prime','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('7d7ea9f5-c2c8-59bc-ad70-29262b0f0560',NULL,'goal','goal.mariage',NULL,'Mariage','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('854896f7-1242-5e64-b0f1-2da7a7670cc1',NULL,'asset','asset.vehicule',NULL,'Véhicule','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('86f42c04-3784-542a-9472-65df4507d459',NULL,'goal','goal.logement',NULL,'Logement','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('87939ff4-59f5-529b-9964-179097e615ac',NULL,'debt','debt.autre_dette',NULL,'Autre dette','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('8e21bf12-f74b-5dcd-b902-dbae7d0c9391',NULL,'shared','shared.internet',NULL,'Internet','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('918065a4-38c2-53fa-bf1c-08bfdc901151',NULL,'income','income.allocation_aide',NULL,'Allocation / aide','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('95899733-fcc9-57b0-8b47-386f29730bf9',NULL,'shared','shared.autre',NULL,'Autre','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('979b2ce5-8cef-593d-9952-3df2b444b827',NULL,'seasonal','seasonal.vacances',NULL,'Vacances','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('97d85967-739f-5e00-b36e-c935d67b72e7',NULL,'asset','asset.actions_declarees',NULL,'Actions déclarées','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('993a351a-d5d9-5e41-a1fa-890055832624',NULL,'asset','asset.especes',NULL,'Espèces','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('a0f8616f-e9ee-5fb7-a081-e61feaeaea80',NULL,'fixed','fixed.loyer',NULL,'Loyer','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('a3f83cd1-762a-50c3-988d-2a3fc3286f5f',NULL,'seasonal','seasonal.frais_d_etudes',NULL,'Frais d’études','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('a47a98ca-6886-5db3-b468-5468da9a1e56',NULL,'income','income.salaire_net',NULL,'Salaire net','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('a7aa1ddc-f379-5f91-ab31-c8e865bbcf69',NULL,'fixed','fixed.telephone',NULL,'Téléphone','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('a8654f08-69fd-55a6-a693-c3bdcf9ecb69',NULL,'goal','goal.mobilite_stage',NULL,'Mobilité / stage','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('aafc5a61-1a56-597e-9095-105ce5c36d58',NULL,'fixed','fixed.scolarite_etudes',NULL,'Scolarité / études','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('ac23aa53-66f5-5abf-ae3f-25aea6fd343a',NULL,'seasonal','seasonal.equipement',NULL,'Équipement','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('adc17407-65dd-54f5-969d-758d828ee966',NULL,'goal','goal.epargne_investissement',NULL,'Épargne / investissement','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('ae926353-961d-5def-9bee-7aaab310570f',NULL,'asset','asset.immobilier',NULL,'Immobilier','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('afc065d0-6654-5ca2-99af-7bf2811f3eae',NULL,'variable','variable.autre_depense_variable',NULL,'Autre dépense variable','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('b36b0df4-7c40-5571-aeab-821d60b0f6f4',NULL,'variable','variable.habillement',NULL,'Habillement','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('b7045a2d-770d-53ae-8f2b-0103f00f02af',NULL,'fixed','fixed.assurance',NULL,'Assurance','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('bafe8adb-910d-5264-a001-9c9108cebde5',NULL,'shared','shared.eau',NULL,'Eau','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('bc04304c-9853-5dd4-9398-9967d9b85e90',NULL,'shared','shared.courses',NULL,'Courses','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('bdbdb210-ceb0-56eb-9570-8d9327dfc333',NULL,'variable','variable.etudes_fournitures',NULL,'Études / fournitures','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('c6a6d92e-d5a2-59e5-9b3a-75c6c99bc77e',NULL,'asset','asset.creance',NULL,'Créance','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('c9079dda-c0a2-508b-b72a-850247675fc2',NULL,'income','income.dividende_revenu_de_placement_declare',NULL,'Dividende / revenu de placement déclaré','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('ccaeffa6-0d49-59d5-8c02-f674d16fad0d',NULL,'variable','variable.sante_hygiene',NULL,'Santé / hygiène','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('ce48b98e-a468-514b-b064-796ef8d5a9c7',NULL,'debt','debt.credit_consommation',NULL,'Crédit consommation','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('cfddd094-3f04-5336-bba4-716b8b347a8b',NULL,'income','income.autre_revenu',NULL,'Autre revenu','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('d2107177-0393-5597-b5bd-5fff69401ecd',NULL,'goal','goal.projet_personnel',NULL,'Projet personnel','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('d4bae995-73fb-5d9b-bb30-41f698a13432',NULL,'seasonal','seasonal.assurance_annuelle',NULL,'Assurance annuelle','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('d8505eed-2ae5-52d0-ac5e-7b18e64e645d',NULL,'goal','goal.enfant_etudes_enfant',NULL,'Enfant / études enfant','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('e0277a77-7b36-5572-89f2-2f01a327df7c',NULL,'goal','goal.retraite',NULL,'Retraite','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('e12c5b6f-fbdf-5c19-b286-93adcf97466d',NULL,'variable','variable.alimentation_boissons',NULL,'Alimentation / boissons','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('e35437b4-a5ae-5dd9-8aaa-72991bc415ec',NULL,'seasonal','seasonal.mariage',NULL,'Mariage','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('e6e78085-532d-5569-8e34-ac6eb3b92194',NULL,'variable','variable.dons_cadeaux',NULL,'Dons / cadeaux','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('e7ad952a-e216-56d2-8eb5-6de2b6dd68a6',NULL,'shared','shared.menage',NULL,'Ménage','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('eb966e09-eff4-5c06-b416-dcba21878228',NULL,'income','income.freelance_mission',NULL,'Freelance / mission','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('f8f35c1f-cd76-57aa-aec6-c34dee5010c4',NULL,'seasonal','seasonal.autre_depense_annuelle',NULL,'Autre dépense annuelle','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('fada5eec-1344-517e-a4d3-82b523b95422',NULL,'goal','goal.voiture',NULL,'Voiture','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('fb238194-33e8-5309-a0ad-e47aea414d2e',NULL,'fixed','fixed.internet',NULL,'Internet','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('fdb1b26b-7902-5733-95e4-f23e4c98c6dd',NULL,'income','income.stage_remunere',NULL,'Stage rémunéré','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821'),
('ffdb3270-f70f-5cf5-94dd-bd5114b96c42',NULL,'variable','variable.animaux',NULL,'Animaux','personal','document','FINCLUDIA_Cahier_des_Charges_Complet.xlsx#03_Categories','official','[]','2026-10-13 15:23:07.821','2026-10-13 15:23:07.821',1,NULL,NULL,'2026-10-13 15:23:07.821','2026-10-13 15:23:07.821');
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
('08dd51f2-948f-49c8-80a4-f568a2ac59b1','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','asset','b33a30da-5bb2-486b-9b56-a2d0a65ca907','create',NULL,NULL,'{\"label\":\"SLS\",\"kind\":\"vehicle\",\"value\":14000000,\"currency\":\"DZD\",\"valuedAt\":\"2025-10-17T00:00:00.000Z\"}',NULL,'2026-10-17 08:20:13.987'),
('10501db6-29ba-429c-90a7-cf8f4bfb2c33','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','debt','49a5720f-9077-4656-b2c3-94b995782eb5','create',NULL,NULL,'{\"label\":\"bna\",\"outstandingPrincipal\":10000000,\"currency\":\"DZD\"}',NULL,'2026-10-17 08:16:18.072'),
('10e4ac5c-a4a9-4a85-9eb5-141790f6f898','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','spaceGoal','08ab522c-8421-4102-8aa1-fb60fe969ea8','create',NULL,NULL,'{\"spaceId\":\"11997080-485f-4694-b760-568ac6592a5f\",\"label\":\"epargne\",\"target\":100000000}',NULL,'2026-10-17 08:24:51.352'),
('2d6aba0e-7e97-413c-a2d9-b0b9881c7720','dd81c796-b6b8-49bd-a807-876c1c531d0b','budget','e0f6f7f6-edd0-4388-aa12-929fac5ffaed','create',NULL,NULL,'{\"label\":\"aziz\",\"periodStart\":\"2026-10-01T00:00:00.000Z\",\"periodEnd\":\"2026-10-31T22:59:59.000Z\",\"currency\":\"DZD\"}',NULL,'2026-10-15 08:53:16.414'),
('36128bae-2638-4dc8-aa1b-6dfcdf9b13e4','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','spaceGoalContribution','1ded335d-b5b8-4465-afe9-da3ed8a0fa44','create',NULL,NULL,'{\"spaceGoalId\":\"08ab522c-8421-4102-8aa1-fb60fe969ea8\",\"memberId\":\"a0d0dcce-227d-4aff-aee0-8a7ec57b6d7a\",\"amount\":12000000}',NULL,'2026-10-17 08:24:58.619'),
('3c33dd97-fdae-469c-8873-f5093a76d056','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','sharedExpense','ecf60b46-26ed-4143-9ab3-8432027cf2a3','create',NULL,NULL,'{\"spaceId\":\"11997080-485f-4694-b760-568ac6592a5f\",\"label\":\"loyer\",\"value\":1800000,\"currency\":\"DZD\",\"splitMode\":\"equal\"}',NULL,'2026-10-17 08:24:34.615'),
('3da7fb0f-6205-415c-b7af-e2a91df5a992','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','goal','ad7a3b69-5801-4fc4-889d-e1306df6d4e6','create',NULL,NULL,'{\"label\":\"sls\",\"target\":100000000,\"currency\":\"DZD\",\"allocated\":0}',NULL,'2026-10-17 08:12:52.328'),
('42c92e35-64d7-41e3-9341-126479ea25cb','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','space','11997080-485f-4694-b760-568ac6592a5f','correct','note',NULL,'\"je soussigne te vendre touts\"',NULL,'2026-10-17 08:24:15.470'),
('4cf0a810-ac70-4598-96a2-badb0a251357','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','membership','a0d0dcce-227d-4aff-aee0-8a7ec57b6d7a','correct','sharing.incomes','\"private\"','\"shared\"',NULL,'2026-10-17 08:23:53.217'),
('898a0d81-12a5-4a96-ae77-92aed28bcf66','dd81c796-b6b8-49bd-a807-876c1c531d0b','membership','11b22b66-3397-45b5-a10e-3d3c148dd9fc','create',NULL,NULL,'{\"spaceId\":\"11997080-485f-4694-b760-568ac6592a5f\",\"role\":\"member\"}','invitation acceptée','2026-10-17 08:25:36.800'),
('9f3f00b2-b6ec-4f4c-9ebd-eeb69f0b08ee','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','budget','eb1a8c58-c6dc-4494-81ee-ca690e3a2b50','create',NULL,NULL,'{\"label\":\"aziz\",\"periodStart\":\"2026-04-15T00:00:00.000Z\",\"periodEnd\":\"2026-10-31T22:59:59.000Z\",\"currency\":\"DZD\"}',NULL,'2026-10-17 08:10:15.603'),
('d73e0676-8336-49b7-a5ec-6fd6221421ca','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','space','11997080-485f-4694-b760-568ac6592a5f','create',NULL,NULL,'{\"kind\":\"flatshare\",\"label\":\"nous deux\",\"currency\":\"DZD\"}',NULL,'2026-10-17 08:23:45.117'),
('d768c5f0-95f9-4b37-8000-480bb87e1334','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','asset','f5598308-e360-4e83-92cd-0b1a33864029','create',NULL,NULL,'{\"label\":\"maison\",\"kind\":\"property\",\"value\":150000000,\"currency\":\"DZD\",\"valuedAt\":\"2020-10-17T00:00:00.000Z\"}',NULL,'2026-10-17 08:19:42.058'),
('eb27dd9d-594a-41ee-b1c2-f30c06fc01df','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','debt','ee8ea20b-3f4f-49c5-9214-dbaf9d5d3b10','create',NULL,NULL,'{\"label\":\"bea\",\"outstandingPrincipal\":1000000,\"currency\":\"DZD\"}',NULL,'2026-10-17 08:16:45.970'),
('ec998ae8-4f8c-40c5-9b15-13dcd8b35fee','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','membership','a0d0dcce-227d-4aff-aee0-8a7ec57b6d7a','correct','sharing.transactions','\"private\"','\"shared\"',NULL,'2026-10-17 08:23:57.088'),
('f6ccb626-6d77-4a7c-989b-11201df8a5ac','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','membership','a0d0dcce-227d-4aff-aee0-8a7ec57b6d7a','correct','sharing.assets','\"private\"','\"shared\"',NULL,'2026-10-17 08:23:58.628');
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
('442e5760-817c-479a-a0a8-f0e5121814ce','dd81c796-b6b8-49bd-a807-876c1c531d0b','finPrivacy','1','2026-10-17 09:27:03.919'),
('65166da4-c7af-4194-9f9e-fbf31b9bc54d','dd81c796-b6b8-49bd-a807-876c1c531d0b','finNoAdvice','1','2026-10-17 09:27:03.919'),
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
  `amount` int(11) NOT NULL,
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
  `outstandingPrincipal` int(11) NOT NULL,
  `monthlyInstalment` int(11) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `rate` double DEFAULT NULL,
  `knownTotalCost` int(11) DEFAULT NULL,
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
  PRIMARY KEY (`id`),
  KEY `fin_debts_userId_deletedAt_idx` (`userId`,`deletedAt`),
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
  CONSTRAINT `fin_debts_consent_uses_check` CHECK (json_type(`consentUses`) = 'ARRAY')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_debts`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_debts` WRITE;
/*!40000 ALTER TABLE `fin_debts` DISABLE KEYS */;
INSERT INTO `fin_debts` VALUES
('49a5720f-9077-4656-b2c3-94b995782eb5','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','bna','bna',NULL,NULL,10000000,100000,'DZD',0.05,NULL,'2030-10-10 00:00:00.000',NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-10-17 08:16:18.025','2026-10-17 08:16:18.025',1,NULL,NULL,'2026-10-17 08:16:18.025','2026-10-17 08:16:18.025'),
('ee8ea20b-3f4f-49c5-9214-dbaf9d5d3b10','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','bea','bea',NULL,NULL,1000000,15000,'DZD',0.08,NULL,'2029-11-08 00:00:00.000',NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-10-17 08:16:45.921','2026-10-17 08:16:45.921',1,NULL,NULL,'2026-10-17 08:16:45.921','2026-10-17 08:16:45.921');
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
  `value` int(11) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `cap` int(11) DEFAULT NULL,
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
  `target` int(11) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `targetDate` datetime(3) DEFAULT NULL,
  `allocated` int(11) NOT NULL DEFAULT 0,
  `monthlyContribution` int(11) DEFAULT NULL,
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
  PRIMARY KEY (`id`),
  KEY `fin_goals_userId_deletedAt_idx` (`userId`,`deletedAt`),
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
  CONSTRAINT `fin_goals_consent_uses_check` CHECK (json_type(`consentUses`) = 'ARRAY')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_goals`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_goals` WRITE;
/*!40000 ALTER TABLE `fin_goals` DISABLE KEYS */;
INSERT INTO `fin_goals` VALUES
('ad7a3b69-5801-4fc4-889d-e1306df6d4e6','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','sls','car',100000000,'DZD','2030-10-10 00:00:00.000',0,NULL,0.01,0,NULL,'personal','manual',NULL,'declared',NULL,'[]','2026-10-17 08:12:52.282','2026-10-17 08:12:52.282',1,NULL,NULL,'2026-10-17 08:12:52.282','2026-10-17 08:12:52.282');
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
  `value` int(11) NOT NULL,
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `fin_intents_code_key` (`code`),
  CONSTRAINT `fin_intents_code_check` CHECK (`code` in ('NAVIGUER','EXPLIQUER_INDICATEUR','CRÉER_OBJECTIF','AIDE_BUDGET','AIDE_DETTE','APPRENDRE_TERME','CHERCHER_SOLUTION','DÉPENSE_PARTAGÉE')),
  CONSTRAINT `fin_intents_label_check` CHECK (octet_length(trim(`label`)) > 0),
  CONSTRAINT `fin_intents_response_check` CHECK (octet_length(trim(`responseTemplate`)) > 0),
  CONSTRAINT `fin_intents_status_check` CHECK (`status` in ('draft','published')),
  CONSTRAINT `fin_intents_keywords_check` CHECK (json_type(`keywords`) = 'ARRAY'),
  CONSTRAINT `fin_intents_position_check` CHECK (`position` >= 0)
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
('33a18243-0faa-4a46-b10c-56ad7f38e836','NAVIGUER','Naviguer vers un écran','Où ajouter une dépense ?','[]','<p></p>',NULL,'draft',0,'2026-10-17 09:45:47.954','2026-10-17 09:45:47.954'),
('492cfd1f-a3e5-4e52-8653-0b57c0b19d05','EXPLIQUER_INDICATEUR','Expliquer un indicateur','C\'est quoi mon taux d\'épargne ?','[]','<p></p>',NULL,'draft',1,'2026-10-17 09:45:47.954','2026-10-17 09:45:47.954'),
('53c5ae77-572a-4325-ad51-d06030be8390','APPRENDRE_TERME','Apprendre un terme','C\'est quoi une obligation ?','[]','<p></p>',NULL,'draft',5,'2026-10-17 09:45:47.954','2026-10-17 09:45:47.954'),
('85c32f7d-c069-4a4f-a796-d20c16fc95e2','CRÉER_OBJECTIF','Créer un objectif','Je veux acheter une voiture','[]','<p></p>',NULL,'draft',2,'2026-10-17 09:45:47.954','2026-10-17 09:45:47.954'),
('91c8986b-3a12-4925-82fd-36389ac7f6fb','CHERCHER_SOLUTION','Chercher une solution de financement','Financement voiture','[]','<p></p>',NULL,'draft',6,'2026-10-17 09:45:47.954','2026-10-17 09:45:47.954'),
('a47d5dcf-1b2d-423a-9833-81fdfc82a7a2','DÉPENSE_PARTAGÉE','Dépense partagée','Qui doit quoi ?','[]','<p></p>',NULL,'draft',7,'2026-10-17 09:45:47.954','2026-10-17 09:45:47.954'),
('c1caca2f-01cd-4d18-9af0-620a4ebe407d','AIDE_DETTE','Aide au remboursement d\'une dette','Comment rembourser plus vite ?','[]','<p></p>',NULL,'draft',4,'2026-10-17 09:45:47.954','2026-10-17 09:45:47.954');
/*!40000 ALTER TABLE `fin_intents` ENABLE KEYS */;
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
  `markPrice` int(11) NOT NULL,
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
  `capital` int(11) NOT NULL,
  `cash` int(11) NOT NULL,
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
('ad520061-997c-416d-859d-ce65493db7bc','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d',10000000,10000000,'DZD',0.01,'2026-10-17 07:57:03.322','manual','fictional',1,'2026-10-17 07:57:03.322','2026-10-17 07:57:03.322');
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
  `unitPrice` int(11) NOT NULL,
  `fee` int(11) NOT NULL,
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
  `value` int(11) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `provisioned` int(11) NOT NULL DEFAULT 0,
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
  `value` int(11) NOT NULL,
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
  PRIMARY KEY (`id`),
  KEY `fin_recurrences_userId_nextDate_idx` (`userId`,`nextDate`),
  KEY `fin_recurrences_categoryId_idx` (`categoryId`),
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
  CONSTRAINT `fin_recurrences_reminders_check` CHECK (json_type(`reminderDays`) = 'ARRAY')
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
  `value` int(11) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `settledAt` datetime(3) NOT NULL,
  `note` varchar(300) DEFAULT NULL,
  `recordedById` varchar(191) NOT NULL,
  `source` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
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
  `value` int(11) NOT NULL,
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
  PRIMARY KEY (`id`),
  KEY `fin_shared_expenses_spaceId_occurredAt_idx` (`spaceId`,`occurredAt`),
  KEY `fin_shared_expenses_payerId_idx` (`payerId`),
  KEY `fin_shared_expenses_categoryId_idx` (`categoryId`),
  KEY `fin_shared_expenses_recordedById_idx` (`recordedById`),
  CONSTRAINT `fin_shared_expenses_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `fin_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fin_shared_expenses_payerId_fkey` FOREIGN KEY (`payerId`) REFERENCES `fin_space_members` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_shared_expenses_recordedById_fkey` FOREIGN KEY (`recordedById`) REFERENCES `fin_space_members` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_shared_expenses_spaceId_fkey` FOREIGN KEY (`spaceId`) REFERENCES `fin_spaces` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_shared_expenses_split_check` CHECK (`splitMode` in ('equal','percent','amounts','income_proportional')),
  CONSTRAINT `fin_shared_expenses_source_check` CHECK (`source` in ('manual','imported','document','partner','computed')),
  CONSTRAINT `fin_shared_expenses_status_check` CHECK (`status` in ('real','declared','imported','computed','fictional','official','to_confirm')),
  CONSTRAINT `fin_shared_expenses_currency_check` CHECK (`currency` regexp '^[A-Z]{3}$'),
  CONSTRAINT `fin_shared_expenses_label_check` CHECK (trim(`label`) <> ''),
  CONSTRAINT `fin_shared_expenses_version_check` CHECK (`version` >= 1),
  CONSTRAINT `fin_shared_expenses_value_check` CHECK (`value` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_shared_expenses`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_shared_expenses` WRITE;
/*!40000 ALTER TABLE `fin_shared_expenses` DISABLE KEYS */;
INSERT INTO `fin_shared_expenses` VALUES
('ecf60b46-26ed-4143-9ab3-8432027cf2a3','11997080-485f-4694-b760-568ac6592a5f','a0d0dcce-227d-4aff-aee0-8a7ec57b6d7a','loyer',1800000,'DZD','2026-10-17 00:00:00.000','equal',NULL,NULL,'a0d0dcce-227d-4aff-aee0-8a7ec57b6d7a','manual','real',1,NULL,'2026-10-17 08:24:34.480','2026-10-17 08:24:34.480');
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
  `share` int(11) NOT NULL,
  `weight` int(11) DEFAULT NULL,
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
('d5b4ffe3-1466-4c74-86fd-61ee58825abf','ecf60b46-26ed-4143-9ab3-8432027cf2a3','a0d0dcce-227d-4aff-aee0-8a7ec57b6d7a',1800000,NULL,'2026-10-17 08:24:34.480');
/*!40000 ALTER TABLE `fin_shared_shares` ENABLE KEYS */;
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
  `amount` int(11) NOT NULL,
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
('1ded335d-b5b8-4465-afe9-da3ed8a0fa44','08ab522c-8421-4102-8aa1-fb60fe969ea8','a0d0dcce-227d-4aff-aee0-8a7ec57b6d7a',12000000,'DZD','2026-10-17 08:24:58.481',NULL,'2026-10-17 08:24:58.570',NULL);
/*!40000 ALTER TABLE `fin_space_goal_contributions` ENABLE KEYS */;
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
  `target` int(11) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `targetDate` datetime(3) DEFAULT NULL,
  `note` varchar(300) DEFAULT NULL,
  `version` int(11) NOT NULL DEFAULT 1,
  `archivedAt` datetime(3) DEFAULT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
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
('08ab522c-8421-4102-8aa1-fb60fe969ea8','11997080-485f-4694-b760-568ac6592a5f','epargne',100000000,'DZD','2030-10-10 00:00:00.000',NULL,1,NULL,NULL,'2026-10-17 08:24:51.306','2026-10-17 08:24:51.306');
/*!40000 ALTER TABLE `fin_space_goals` ENABLE KEYS */;
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
('11b22b66-3397-45b5-a10e-3d3c148dd9fc','11997080-485f-4694-b760-568ac6592a5f','dd81c796-b6b8-49bd-a807-876c1c531d0b','member','{\"incomes\":\"private\",\"transactions\":\"private\",\"assets\":\"private\",\"goals\":\"private\"}',NULL,'2026-10-17 08:25:36.620',NULL,'2026-10-17 08:25:36.620','2026-10-17 08:25:36.620'),
('a0d0dcce-227d-4aff-aee0-8a7ec57b6d7a','11997080-485f-4694-b760-568ac6592a5f','3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','owner','{\"incomes\":\"shared\",\"transactions\":\"shared\",\"assets\":\"shared\",\"goals\":\"shared\"}','test124','2026-10-17 08:23:45.027',NULL,'2026-10-17 08:23:45.027','2026-10-17 08:24:00.107');
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
  `plannedAmount` int(11) NOT NULL,
  `alreadyProvisioned` int(11) NOT NULL DEFAULT 0,
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
  PRIMARY KEY (`id`),
  KEY `fin_spaces_kind_idx` (`kind`),
  CONSTRAINT `fin_spaces_kind_check` CHECK (`kind` in ('flatshare','couple','household')),
  CONSTRAINT `fin_spaces_currency_check` CHECK (`currency` regexp '^[A-Z]{3}$'),
  CONSTRAINT `fin_spaces_split_check` CHECK (`splitRule` in ('equal','income_proportional','custom')),
  CONSTRAINT `fin_spaces_source_check` CHECK (`source` in ('manual','imported','document','partner','computed')),
  CONSTRAINT `fin_spaces_status_check` CHECK (`status` in ('real','declared','imported','computed','fictional','official','to_confirm')),
  CONSTRAINT `fin_spaces_version_check` CHECK (`version` >= 1),
  CONSTRAINT `fin_spaces_label_check` CHECK (trim(`label`) <> '')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fin_spaces`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fin_spaces` WRITE;
/*!40000 ALTER TABLE `fin_spaces` DISABLE KEYS */;
INSERT INTO `fin_spaces` VALUES
('11997080-485f-4694-b760-568ac6592a5f','flatshare','nous deux','DZD','equal','je soussigne te vendre touts','manual','declared',2,NULL,NULL,'2026-10-17 08:23:44.981','2026-10-17 08:24:15.373');
/*!40000 ALTER TABLE `fin_spaces` ENABLE KEYS */;
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
  `kind` varchar(10) NOT NULL,
  `value` int(11) NOT NULL,
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
  PRIMARY KEY (`id`),
  KEY `fin_transactions_userId_occurredAt_idx` (`userId`,`occurredAt`),
  KEY `fin_transactions_userId_kind_value_occurredAt_idx` (`userId`,`kind`,`value`,`occurredAt`),
  KEY `fin_transactions_categoryId_idx` (`categoryId`),
  CONSTRAINT `fin_transactions_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `fin_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fin_transactions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fin_transactions_kind_check` CHECK (`kind` in ('income','expense')),
  CONSTRAINT `fin_transactions_scope_check` CHECK (`scope` in ('personal','couple','household','space')),
  CONSTRAINT `fin_transactions_source_check` CHECK (`source` in ('manual','imported','document','partner','computed')),
  CONSTRAINT `fin_transactions_status_check` CHECK (`status` in ('real','declared','imported','computed','fictional','official','to_confirm')),
  CONSTRAINT `fin_transactions_confidence_check` CHECK (`confidence` is null or `confidence` in ('high','medium','low')),
  CONSTRAINT `fin_transactions_payment_check` CHECK (`paymentMethod` is null or `paymentMethod` in ('cash','card','transfer','cheque','ccp','other')),
  CONSTRAINT `fin_transactions_currency_check` CHECK (`currency` regexp '^[A-Z]{3}$'),
  CONSTRAINT `fin_transactions_version_check` CHECK (`version` >= 1),
  CONSTRAINT `fin_transactions_planned_check` CHECK (`planned` = 0 or `kind` = 'expense')
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
('0dfb27a5-c466-44d2-b8d9-032f6fee4a78','ma-mutuelle','Ma mutuelle','Formation sur le choix d\'une mutuelle','published','standard','82ae0c68-05b5-4f99-be25-630e6b2010ee','c1939f21-bea1-443a-9ca7-fc9fdf25919f',1,'Expert','vous estes expert',NULL,NULL,'[]','[]',NULL,'2026-09-20 08:19:19.402','2026-09-20 08:15:48.235','2026-09-20 08:19:19.404',NULL,'[]'),
('13edf601-4428-4be5-9c9e-f629608b0b4b','rthytr','rthytr','','draft','standard',NULL,NULL,1,NULL,NULL,NULL,NULL,'[]','[]',NULL,NULL,'2026-09-22 07:04:30.482','2026-09-22 07:04:30.482',NULL,'[]'),
('21d0e24a-224a-4af9-8e77-3c902ea12199','demo-comptabilite-de-base','Comptabilité de base','Comprendre les bases de la comptabilité d’une petite entreprise : journal, bilan et compte de résultat.','published','standard','3e5c7f82-7346-4970-ab0c-5a5b6c123aaa',NULL,1,'Certificat en comptabilité de base','Atteste que le titulaire a suivi tous les cours obligatoires.','Tenir les comptes d’une petite entreprise, pas à pas','beginner','[\"Comprendre à quoi sert la comptabilité\",\"Enregistrer une opération au journal\",\"Lire un bilan et un compte de résultat\"]','[\"Aucun : cette formation s’adresse aux débutants\"]','dd81c796-b6b8-49bd-a807-876c1c531d0b','2026-09-16 14:51:48.741','2026-09-15 14:51:48.741','2026-10-06 14:51:48.744',NULL,'[]'),
('2cf07958-5a80-4cdd-8bce-2080fb74ab4f','demo-fiscalite-avancee','Fiscalité avancée pour PME','Optimiser légalement la fiscalité de son entreprise. Formation réservée aux comptes premium.','published','premium','3e5c7f82-7346-4970-ab0c-5a5b6c123aaa',NULL,1,'Certificat en fiscalité avancée','Valide la maîtrise des régimes fiscaux courants.','Optimiser légalement la fiscalité de son entreprise','advanced','[\"Comparer les régimes d’imposition\",\"Identifier les charges déductibles\",\"Préparer un contrôle fiscal\"]','[\"Connaître les bases de la comptabilité\",\"Avoir une entreprise ou un projet de création\"]','dd81c796-b6b8-49bd-a807-876c1c531d0b','2026-09-16 14:51:48.803','2026-09-15 14:51:48.803','2026-10-06 14:51:48.804',NULL,'[]'),
('8450352f-b35e-496a-b3da-92872dfd7a7e','ancienne-formation-archivee-copie','Ancienne formation (archivée) (copie)','Retirée du catalogue : les inscrits gardent leur accès.','draft','standard',NULL,NULL,0,NULL,NULL,NULL,NULL,'[]','[]',NULL,NULL,'2026-09-26 08:14:44.910','2026-09-26 08:14:44.910',NULL,'[]'),
('9fb5f42a-1a07-4531-b5b5-7d079e3eeb32','azdza','azdza','','draft','standard',NULL,NULL,1,NULL,NULL,NULL,NULL,'[]','[]',NULL,NULL,'2026-09-22 07:03:31.102','2026-09-22 07:03:31.102',NULL,'[]'),
('a485b226-95af-4eae-b360-c0e3c6f4f812','demo-ancienne-formation','Ancienne formation (archivée)','Retirée du catalogue : les inscrits gardent leur accès.','published','standard','fff5bc2d-8549-4ec7-a8aa-3b8d41061691','525e1edf-9d62-494e-be30-aba4d04e4ad1',0,NULL,NULL,'rregrgreg','beginner','[]','[]','dd81c796-b6b8-49bd-a807-876c1c531d0b','2026-10-17 09:43:59.064','2026-09-15 14:51:48.845','2026-10-17 09:43:59.068',NULL,'[\"pme\"]'),
('a7828933-f8f2-4ce5-b609-0b1e4f373d36','demo-brouillon-tresorerie','Gestion de trésorerie (en révision)','Formation en préparation : en attente de relecture, pas encore dans le catalogue.','in_review','standard','fff5bc2d-8549-4ec7-a8aa-3b8d41061691',NULL,0,NULL,NULL,'Prévoir ses encaissements et ses décaissements','intermediate','[\"Construire un plan de trésorerie\"]','[]','dd81c796-b6b8-49bd-a807-876c1c531d0b',NULL,'2026-09-15 14:51:48.831','2026-10-06 14:51:48.832',NULL,'[]'),
('b5245bb8-482e-4229-bd4f-0f80119eaaf4','aziz','aziz','c aziz aziz aziz','published','premium','f456614d-abb0-477f-8ebe-de296fa1354d','63e871b2-2b55-42a3-b9c3-7d8bcf3401ef',1,'Expert','Content Security Policy (CSP) 	−25\nFailed\n	\n\nContent Security Policy (CSP) header not implemented\n	\n\nImplement one, see MDN\'s Content Security Policy (CSP) documentation.','c aziz','beginner','[\"test\",\"azz\",\"qsd\"]','[\"zza\",\"zad\",\"ad\"]',NULL,'2026-09-21 13:57:12.590','2026-09-21 13:50:46.210','2026-09-21 13:57:12.594',NULL,'[]');
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
('460785ff-5018-48e2-9af8-78192a78de36','d2cc05c4-6946-4b7b-8d87-83a6e43ca8ce','text',0,'{\"html\":\"<h2>Le journal</h2><p>Chaque opération est enregistrée <em>chronologiquement</em> avec un débit et un crédit.</p><p>Le grand livre regroupe ensuite ces écritures par compte.</p>\"}',NULL,'2026-10-06 14:51:48.772','2026-10-06 14:51:48.772'),
('5c8833ef-caa8-4537-835a-4e93423c0eba','23350dc6-e513-45af-8959-0fdc673e6ace','text',0,'{\"html\":\"<p>adadazd</p><p>adadzadzad</p>\"}',NULL,'2026-09-21 13:52:55.514','2026-09-21 13:53:49.330'),
('6fa662ba-cc39-4d25-953d-5b0e6133a09e','c1252cdd-5431-401a-be09-06333e4fa03f','text',0,'{\"html\":\"<ol><li>Classer les justificatifs</li><li>Garder les contrats</li><li>Répondre dans les délais</li></ol>\"}',NULL,'2026-10-06 14:51:48.827','2026-10-06 14:51:48.827'),
('73ecacfd-5d54-4584-b74b-e9c32babc3fa','23350dc6-e513-45af-8959-0fdc673e6ace','table',2,'{\"rows\":[[\"dzd\",\"dzzdzd\",\"dzzd\"],[\"azd\",\"adzd\",\"ddza\"]],\"caption\":\"zddzdzd\",\"headers\":[\"za\",\"zaz\",\"azd\"]}',NULL,'2026-09-21 13:53:17.755','2026-09-21 13:53:49.333'),
('7bd753c5-fc20-4f3a-9988-914dac524ef3','d2cc05c4-6946-4b7b-8d87-83a6e43ca8ce','quote',4,'{\"text\":\"La comptabilité est le langage des affaires.\",\"author\":\"Proverbe\"}',NULL,'2026-10-06 14:51:48.772','2026-10-06 14:51:48.772'),
('86378462-ccde-4f55-bffd-9e5364828eb5','7bb94490-38ce-48b9-b2fc-a5427398ace7','text',0,'{\"html\":\"<p>aaa <strong>adad <em>zdzd</em></strong><em>zdzd </em></p><h2>eefee</h2><p><u>deded </u></p><p><em><u>eded</u></em></p><ol><li><p>deededeede</p></li></ol><blockquote><p>eded</p></blockquote><p></p><p></p>\"}',NULL,'2026-09-21 12:03:18.526','2026-09-21 12:03:18.526'),
('9208db7f-88ff-4142-bc0d-e65e0ccd0d99','23350dc6-e513-45af-8959-0fdc673e6ace','quote',3,'{\"text\":\"azdazdasqsd\",\"author\":\"aziz\"}',NULL,'2026-09-21 13:53:37.592','2026-09-21 13:53:49.334'),
('a4fef649-c2c3-433b-8c1e-919b9d592c56','f2090008-2139-4b30-bb14-0e172acae73c','text',0,'{\"html\":\"<p>Toute dépense engagée dans l’intérêt de l’entreprise et justifiée peut, en principe, être déduite.</p>\"}',NULL,'2026-10-06 14:51:48.819','2026-10-06 14:51:48.819'),
('ac9468cc-2c6e-4d88-b448-3f1cec8b53b5','9ec9ea81-dbc3-4fe5-9f67-5ade3344754f','text',0,'{\"html\":\"<p>Quelques pistes pour approfondir : plan comptable, TVA, amortissements.</p>\"}',NULL,'2026-10-06 14:51:48.789','2026-10-06 14:51:48.789'),
('ad0f0409-9de4-4cbc-932c-4181fb6021e3','b6e8cb1d-60a7-4e21-b2d5-b4be82f20fa1','text',0,'{\"html\":\"<h2>Choisir son régime</h2><p>Le régime dépend de la forme juridique et du chiffre d’affaires.</p>\"}',NULL,'2026-10-06 14:51:48.813','2026-10-06 14:51:48.813'),
('be75c085-6e5e-453a-ad61-784ec091c743','23350dc6-e513-45af-8959-0fdc673e6ace','callout',4,'{\"html\":\"<p>azdzadz</p>\",\"title\":\"aaaaaa\",\"variant\":\"info\"}',NULL,'2026-09-21 13:53:49.327','2026-09-21 13:53:57.922'),
('bedf830a-0bf0-41d9-a70f-a1fb52141987','1a7ece0e-0cec-437b-8978-72458861492c','text',0,'{\"html\":\"<p>Contenu conservé.</p>\"}',NULL,'2026-09-26 08:14:44.919','2026-09-26 08:14:44.919'),
('c94293b1-722b-43f0-86b8-bb9a73607a0b','d2cc05c4-6946-4b7b-8d87-83a6e43ca8ce','code',3,'{\"code\":\"SELECT compte, SUM(debit) - SUM(credit) AS solde\\nFROM ecritures\\nGROUP BY compte;\",\"caption\":\"Calculer le solde de chaque compte\",\"language\":\"sql\"}',NULL,'2026-10-06 14:51:48.772','2026-10-06 14:51:48.772'),
('e1362c30-2461-4689-a14d-4be6f49e2ede','d2cc05c4-6946-4b7b-8d87-83a6e43ca8ce','table',2,'{\"rows\":[[\"512 Banque\",\"1 200,00\",\"\"],[\"706 Prestations\",\"\",\"1 200,00\"]],\"caption\":\"Exemple : encaissement d’une facture\",\"headers\":[\"Compte\",\"Débit\",\"Crédit\"]}',NULL,'2026-10-06 14:51:48.772','2026-10-06 14:51:48.772'),
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
('1ff46223-42a9-477c-8363-a2bdc0273a4a','23350dc6-e513-45af-8959-0fdc673e6ace','[{\"data\":{\"html\":\"\"},\"type\":\"text\",\"mediaId\":null,\"position\":0}]',NULL,NULL,'2026-09-21 13:52:58.738');
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `media_storageKey_key` (`storageKey`),
  UNIQUE KEY `media_id_courseId_key` (`id`,`courseId`),
  UNIQUE KEY `media_finTransactionId_key` (`finTransactionId`),
  KEY `media_courseId_idx` (`courseId`),
  KEY `media_articleId_idx` (`articleId`),
  KEY `media_uploadedById_fkey` (`uploadedById`),
  CONSTRAINT `media_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `media_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `media_finTransactionId_fkey` FOREIGN KEY (`finTransactionId`) REFERENCES `fin_transactions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
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
('290456ea-42b3-4b08-94ac-69c8e55d4218','image','5ed2a8d35e213accc0d71954a786231c.webp','discount-bg.webp','image/webp',52276,NULL,NULL,'2026-09-22 07:07:20.768',NULL,NULL),
('525e1edf-9d62-494e-be30-aba4d04e4ad1','image','c797212d3974ac80c84ba1d42c0708fc.png','QR Code Akili.png','image/png',177076,NULL,'dd81c796-b6b8-49bd-a807-876c1c531d0b','2026-10-17 09:43:42.818',NULL,NULL),
('63e871b2-2b55-42a3-b9c3-7d8bcf3401ef','image','9dff7a1af9ab4d2a8c85e91f0a4cddef.png','facebook.png','image/png',16039,NULL,NULL,'2026-09-21 13:52:17.219',NULL,NULL),
('7c00cea1-ba90-4df4-a64d-e06d70b141d4','image','a55177a8c989523077cd4854f4345d0a.webp','flight-bg-2.webp','image/webp',63636,'7bb94490-38ce-48b9-b2fc-a5427398ace7',NULL,'2026-09-20 08:18:50.489',NULL,NULL),
('87e9aea2-7bdb-4010-b8e4-50ce9b5d5738','image','2494562c3e4595db9bfd210b3697166a.png','tiktok.png','image/png',14180,'23350dc6-e513-45af-8959-0fdc673e6ace',NULL,'2026-09-21 13:53:08.026',NULL,NULL),
('9373d938-f9dc-4e53-9509-c2579873b79b','image','f98684122b959936ad9bceeddac5a01f.webp','flight-bg-2.webp','image/webp',63636,NULL,NULL,'2026-09-22 07:07:15.870','28d306ff-573c-4ba2-b1b5-51d0d3705c2e',NULL),
('c1939f21-bea1-443a-9ca7-fc9fdf25919f','image','7b8d21c453a4be59e7476f2609b76637.png','youtube.png','image/png',8618,NULL,NULL,'2026-09-20 08:16:57.935',NULL,NULL);
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
('0b985c2b-2b54-47bb-8df4-04c681ee6689','promo','POST /api/tools/scenarios/comparaison 409',250000,'DZD','premium',1,0,'2026-10-17 09:46:21.853','2026-10-17 09:46:21.853');
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
('4056a77d-099c-4a2d-8444-89aaecf5dadc','e580d10c-9df3-49ef-8802-61a4a71b843f',0,'oui',0),
('57b12286-2fd7-4fa6-8c08-b8cca0d98bef','e580d10c-9df3-49ef-8802-61a4a71b843f',1,'non',0);
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
('c54775cb-291e-48aa-8463-835ccab4f525','15098cab-72fd-4481-9846-5b3c55a96a32','multiple',0,'quel est le théme','',2,'[]'),
('e580d10c-9df3-49ef-8802-61a4a71b843f','15098cab-72fd-4481-9846-5b3c55a96a32','single',1,'vous aller bien','eh oui ca ne le regarde pas',1,'[]');
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
('15098cab-72fd-4481-9846-5b3c55a96a32','b5245bb8-482e-4229-bd4f-0f80119eaaf4','course','23350dc6-e513-45af-8959-0fdc673e6ace',NULL,NULL,'Quiz aziz','juste envoyer les réponse',70,NULL,0,0,1,1,'2026-09-21 13:54:03.038','2026-09-21 13:55:52.211');
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
('e72bd6de-7d90-4c70-a08b-c8401130f3da','dd81c796-b6b8-49bd-a807-876c1c531d0b','premier-salaire','test','DZD','{\"net\":5000000,\"housing\":0,\"transport\":700000,\"food\":1500000,\"otherExpenses\":600000,\"savingsTarget\":2000000}',NULL,'{\"F003\":1,\"F004\":1,\"F007\":1,\"F008\":1,\"F009\":1}','2026-10-17 09:38:16.755','2026-10-17 09:38:16.755');
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`),
  CONSTRAINT `users_role_check` CHECK (`role` in ('user','admin')),
  CONSTRAINT `users_accessLevel_check` CHECK (`accessLevel` in ('standard','premium')),
  CONSTRAINT `users_status_check` CHECK (`status` in ('active','suspended')),
  CONSTRAINT `users_fin_public_check` CHECK (`finPublic` is null or `finPublic` in ('LYC','ETU','JAC','SAL','COL','COU','FAM','EPG')),
  CONSTRAINT `users_fin_secondary_publics_check` CHECK (json_type(`finSecondaryPublics`) = 'ARRAY'),
  CONSTRAINT `users_fin_age_range_check` CHECK (`finAgeRange` is null or `finAgeRange` in ('under18','18-24','25-34','35-49','50-64','65plus')),
  CONSTRAINT `users_fin_currency_check` CHECK (`finCurrency` collate utf8mb4_bin regexp '^[A-Z]{3}$'),
  CONSTRAINT `users_finReserveTargetMonths_check` CHECK (`finReserveTargetMonths` is null or `finReserveTargetMonths` >= 0),
  CONSTRAINT `users_notification_settings_check` CHECK (json_type(`finNotificationSettings`) = 'OBJECT')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
('030c2429-b6d4-4764-9ea9-9abb2b00ce4a','azizsellal.idh@gmail.com','$2b$12$KTLZV0Pqh3QhKK8Lb2O7teY6Qheu0Mu1AJ9cRI/mu68JlSARIk5K6','aziz sellal','pme','standard','user','active','2026-09-20 07:55:35.592','2026-09-20 07:55:35.592',NULL,NULL,'DZD',NULL,NULL,NULL,NULL,'[]',NULL,NULL,'{}'),
('2f9936ff-7b0e-40ea-83ad-18de8c87e949','premium@demo.larbi.test','$2b$10$eGZ.jYg1tHf67e3M3u5XbuCqk1zeKj9wyFWDcGbeFBF/c763/4MjK','Karim Premium','pme','premium','user','active','2026-10-06 14:51:48.733','2026-10-06 14:51:48.733',NULL,NULL,'DZD',NULL,NULL,NULL,NULL,'[]',NULL,NULL,'{}'),
('3f0d91c4-5e33-49bc-8ed0-987fe86a8d8d','azizsellal.dz@gmail.com','$2b$12$k8g9uwc1VwonYa8igyDare8jSfcd1Rri8IBqNCrQ3iSW85WXPFnZu','aziz sellal','pmi','premium','user','active','2026-10-17 07:50:50.430','2026-10-17 09:48:32.384','35-49',NULL,'DZD',NULL,NULL,NULL,NULL,'[]',NULL,3,'{\"reminder_upcoming\":{\"optedIn\":true}}'),
('a668ea3d-14e5-4935-8cd5-5936647e290f','standard@demo.larbi.test','$2b$10$eGZ.jYg1tHf67e3M3u5XbuCqk1zeKj9wyFWDcGbeFBF/c763/4MjK','Sofia Standard','pmi','standard','user','active','2026-10-06 14:51:48.730','2026-10-06 14:51:48.730',NULL,NULL,'DZD',NULL,NULL,NULL,NULL,'[]',NULL,NULL,'{}'),
('dd81c796-b6b8-49bd-a807-876c1c531d0b','admin@demo.larbi.test','$2b$10$bkAJ8TbCw3aekzY4nscypuhoQSP/oW/YsBidhCwnVDD5FJ.Z6wYEm','Admin Démo','pme','premium','admin','active','2026-10-06 14:51:48.723','2026-10-17 09:27:31.729','25-34',NULL,'DZD',NULL,NULL,NULL,NULL,'[]',NULL,NULL,'{}');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-10-17 12:40:03
