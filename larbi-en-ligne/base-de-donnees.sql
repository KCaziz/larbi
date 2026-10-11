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
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES
('1d7fb3cf-93a6-4aab-aabb-92860ba2b8fa','1c2ad9e7508b7874b1ecd87a0b442502d1764087fb1e639462dcb6b562cb9c10','2026-10-06 21:04:12.729','20261006210000_account_types_seed',NULL,NULL,'2026-10-06 21:04:12.721',1),
('80a48f54-b0cc-4df5-817d-ef4bc1ad7479','7b112dacf9885ca10bd07e6bc2d161efa3d5cda8d38de0d02797c0687e6c3f2c','2026-10-06 21:04:12.682','20261006204200_integrity_checks',NULL,NULL,'2026-10-06 21:04:12.012',1),
('902643c3-8468-4fbd-bd95-dfae46625e19','5eea775c2110734baa24b0d28914463fcbac248bb2b7a235c1b6b8ca6b381b75','2026-10-06 21:04:12.009','20261006204050_init',NULL,NULL,'2026-10-06 21:04:10.523',1),
('a743f3d5-ee9f-452e-b965-47dc7af7d89d','64e9159987733b1d2287a4ce5c5ae13d25b8ea3dfb6e049a3e2cd9a9887f70df','2026-10-07 23:06:05.859','20261007230551_long_text_columns',NULL,NULL,'2026-10-07 23:06:05.376',1),
('ccb42bdd-1f24-4d6e-9f8d-1c5a913d175d','e6e30079c80fbedf1a4290e2b6552a52820eccef3638be6d74b325d5b31cdeca','2026-10-06 21:04:12.719','20261006204702_comparator_data',NULL,NULL,'2026-10-06 21:04:12.684',1),
('e0979b7a-c510-47c2-9a10-d82c54666a33','a1b83acff6d07aecc51bd0a4f7b7b5cefe2e728edb65e5a58b9a53c71c623449','2026-10-06 21:13:54.510','20261006211000_case_sensitive_checks',NULL,NULL,'2026-10-06 21:13:54.346',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
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
/*!40000 ALTER TABLE `account_types` DISABLE KEYS */;
INSERT INTO `account_types` VALUES
('a0000000-0000-4000-8000-000000000001','auto-entrepreneur','Auto-entrepreneur',1,1,'2026-09-25 13:05:45.640','2026-09-25 13:05:45.640'),
('a0000000-0000-4000-8000-000000000002','pme','PME',1,2,'2026-09-25 13:05:45.640','2026-09-25 13:05:45.640'),
('a0000000-0000-4000-8000-000000000003','pmi','PMI',1,3,'2026-09-25 13:05:45.640','2026-09-25 13:05:45.640'),
('a0000000-0000-4000-8000-000000000004','etudiant','Étudiant',1,4,'2026-09-25 13:05:45.640','2026-09-25 13:05:45.640'),
('a0000000-0000-4000-8000-000000000005','lyceen','Lycéen',1,5,'2026-09-25 13:05:45.640','2026-09-25 13:05:45.640'),
('a0000000-0000-4000-8000-000000000006','salarie','Salarié',1,6,'2026-09-25 13:05:45.640','2026-09-25 13:05:45.640');
/*!40000 ALTER TABLE `account_types` ENABLE KEYS */;
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
/*!40000 ALTER TABLE `article_categories` DISABLE KEYS */;
INSERT INTO `article_categories` VALUES
('37b13ec8-319c-48bc-840c-5fe12aabc84a','demo-actualites','Actualités','2026-10-06 19:23:47.742'),
('ad26406b-9789-40ff-982b-00423b0a0d67','demo-conseils','Conseils','2026-10-06 19:23:47.739');
/*!40000 ALTER TABLE `article_categories` ENABLE KEYS */;
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
/*!40000 ALTER TABLE `article_tags` DISABLE KEYS */;
INSERT INTO `article_tags` VALUES
('4bd91598-1c98-4c63-8729-8fce6d019522','4c229f6a-c3f0-43b1-9de4-30b80e6ebaf7'),
('c2442bf8-f0a9-4976-97a1-1059e5322303','4c229f6a-c3f0-43b1-9de4-30b80e6ebaf7'),
('4bd91598-1c98-4c63-8729-8fce6d019522','81ac4076-732a-4322-a157-ec1efafc4987'),
('85d806c6-320a-440f-9c45-9af45c58434a','81ac4076-732a-4322-a157-ec1efafc4987');
/*!40000 ALTER TABLE `article_tags` ENABLE KEYS */;
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
/*!40000 ALTER TABLE `article_translations` DISABLE KEYS */;
INSERT INTO `article_translations` VALUES
('3b20da20-6d5a-46ef-9d1f-5bd7ceb9bf0f','e0c3ab2a-68ed-4f8a-923a-6c9b529fca8a','en','Article en cours de rédaction','Brouillon visible seulement dans le CMS.','<p>Ce texte n’est pas encore publié.</p>','Ce texte n’est pas encore publié.',NULL,NULL,1,'2026-10-06 19:27:09.155','2026-10-06 19:27:09.155');
/*!40000 ALTER TABLE `article_translations` ENABLE KEYS */;
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
  CONSTRAINT `articles_slug_check` CHECK (`slug` collate utf8mb4_bin regexp '^[a-z0-9]+(-[a-z0-9]+)*$' and octet_length(`slug`) <= 80)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `articles`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
/*!40000 ALTER TABLE `articles` DISABLE KEYS */;
INSERT INTO `articles` VALUES
('4bd91598-1c98-4c63-8729-8fce6d019522','demo-choisir-un-outil-de-facturation','fr','Bien choisir son outil de facturation','Les critères qui comptent vraiment.','<p>Facturation conforme, export comptable, simplicité : trois critères pour comparer les solutions.</p>','Facturation conforme, export comptable, simplicité : trois critères pour comparer les solutions.','published','2026-10-04 19:23:47.789','standard','[\"pmi\",\"auto-entrepreneur\"]','ad26406b-9789-40ff-982b-00423b0a0d67',NULL,'d533b47c-9497-4a43-89b5-83919a96530c',NULL,NULL,'2026-10-03 19:23:47.789','2026-10-06 19:23:47.792'),
('85d806c6-320a-440f-9c45-9af45c58434a','demo-calendrier-fiscal','fr','Le calendrier fiscal de l’année','Toutes les dates à retenir pour ne rien oublier.','<h2>Les grandes échéances</h2><p>Déclarations, acomptes, régularisations : notez-les dès le début de l’année.</p><blockquote>Une échéance manquée coûte souvent plus cher que la préparer à l’avance.</blockquote>','Les grandes échéances Déclarations, acomptes, régularisations : notez-les dès le début de l’année. Une échéance manquée coûte souvent plus cher que la préparer à l’avance.','published','2026-09-30 19:23:47.780','premium','[\"pmi\",\"pme\"]','37b13ec8-319c-48bc-840c-5fe12aabc84a',NULL,'d533b47c-9497-4a43-89b5-83919a96530c',NULL,NULL,'2026-09-29 19:23:47.780','2026-10-06 19:23:47.783'),
('c2442bf8-f0a9-4976-97a1-1059e5322303','demo-5-erreurs-de-tresorerie','fr','5 erreurs de trésorerie à éviter','Les pièges les plus fréquents des petites entreprises.','<p>La trésorerie est le nerf de la guerre. Voici les <strong>cinq erreurs</strong> les plus courantes.</p><ol><li>Confondre bénéfice et trésorerie</li><li>Ne pas relancer les factures</li><li>Ignorer les échéances fiscales</li><li>Mélanger comptes personnels et professionnels</li><li>Ne pas prévoir de marge de sécurité</li></ol>','La trésorerie est le nerf de la guerre. Voici les cinq erreurs les plus courantes. Confondre bénéfice et trésorerie Ne pas relancer les factures Ignorer les échéances fiscales Mélanger comptes personnels et professionnels Ne pas prévoir de marge de sécurité','published','2026-09-24 19:23:47.751','standard','[\"pme\"]','ad26406b-9789-40ff-982b-00423b0a0d67',NULL,'d533b47c-9497-4a43-89b5-83919a96530c',NULL,NULL,'2026-09-23 19:23:47.751','2026-10-06 19:23:47.770'),
('e0c3ab2a-68ed-4f8a-923a-6c9b529fca8a','demo-article-brouillon','fr','Article en cours de rédaction','Brouillon visible seulement dans le CMS.','<p>Ce texte n’est pas encore publié.</p>','Ce texte n’est pas encore publié.','draft',NULL,'standard','[]','ad26406b-9789-40ff-982b-00423b0a0d67',NULL,'d533b47c-9497-4a43-89b5-83919a96530c',NULL,NULL,'2026-10-05 19:23:47.799','2026-10-06 19:23:47.801');
/*!40000 ALTER TABLE `articles` ENABLE KEYS */;
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
/*!40000 ALTER TABLE `certifications` DISABLE KEYS */;
INSERT INTO `certifications` VALUES
('32e075d3-34ac-4544-9b91-23a00360f548','LARBI-B7DJ-TY7D-3M26','a55c74f7-75ac-4043-b8c3-420ce31f49b1','Karim Premium','Comptabilité de base','Certificat en comptabilité de base','2026-09-28 19:23:47.733',NULL,NULL);
/*!40000 ALTER TABLE `certifications` ENABLE KEYS */;
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
/*!40000 ALTER TABLE `comparator_banks` DISABLE KEYS */;
INSERT INTO `comparator_banks` VALUES
('090136f2-85d1-4f8d-bcfd-a66a3310000a','aziz','2026-10-06 19:28:24.519','2026-10-06 19:28:24.519'),
('c0000000-0000-4000-8000-000000000001','Al Baraka','2026-10-06 19:22:26.955','2026-10-06 19:22:26.955'),
('c0000000-0000-4000-8000-000000000002','Al Salam Bank','2026-10-06 19:22:26.955','2026-10-06 19:22:26.955'),
('c0000000-0000-4000-8000-000000000003','HSBC','2026-10-06 19:22:26.955','2026-10-06 19:22:26.955'),
('c0000000-0000-4000-8000-000000000004','Fransabank','2026-10-06 19:22:26.955','2026-10-06 19:22:26.955'),
('c0000000-0000-4000-8000-000000000005','TBA','2026-10-06 19:22:26.955','2026-10-06 19:22:26.955'),
('c0000000-0000-4000-8000-000000000006','BNH','2026-10-06 19:22:26.955','2026-10-06 19:22:26.955'),
('c0000000-0000-4000-8000-000000000007','BADR','2026-10-06 19:22:26.955','2026-10-06 19:22:26.955'),
('c0000000-0000-4000-8000-000000000008','CPA','2026-10-06 19:22:26.955','2026-10-06 19:22:26.955'),
('c0000000-0000-4000-8000-000000000009','BNP Paribas','2026-10-06 19:22:26.955','2026-10-06 19:22:26.955'),
('c0000000-0000-4000-8000-000000000010','SGA','2026-10-06 19:22:26.955','2026-10-06 19:22:26.955'),
('c0000000-0000-4000-8000-000000000011','Natixis','2026-10-06 19:22:26.955','2026-10-06 19:22:26.955'),
('c0000000-0000-4000-8000-000000000012','ABC Bank','2026-10-06 19:22:26.955','2026-10-06 19:22:26.955'),
('c0000000-0000-4000-8000-000000000013','CNEP','2026-10-06 19:22:26.955','2026-10-06 19:22:26.955');
/*!40000 ALTER TABLE `comparator_banks` ENABLE KEYS */;
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
/*!40000 ALTER TABLE `comparator_conditions` DISABLE KEYS */;
INSERT INTO `comparator_conditions` VALUES
('c1000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000001','comptes','particulier',NULL,'Compte Chèque (Particulier)','{\"fee\":\"100 DA\",\"period\":\"Mensuel\"}',0,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000002','c0000000-0000-4000-8000-000000000001','comptes','professionnel',NULL,'Compte Courant (Professionnel)','{\"fee\":\"200 DA\",\"period\":\"Mensuel\"}',1,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000003','c0000000-0000-4000-8000-000000000001','comptes','entreprise',NULL,'Compte Courant (Entreprise)','{\"fee\":\"1 000 DA\",\"period\":\"Mensuel\"}',2,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000004','c0000000-0000-4000-8000-000000000001','comptes','non_precise',NULL,'Compte Épargne','{\"fee\":\"Gratuit\"}',3,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000005','c0000000-0000-4000-8000-000000000001','comptes','non_precise',NULL,'Compte Devises','{\"fee\":\"Gratuit\"}',4,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000006','c0000000-0000-4000-8000-000000000002','comptes','non_precise',NULL,'Compte Courant','{\"fee\":\"2 500 DA\",\"period\":\"Trimestriel\"}',5,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000007','c0000000-0000-4000-8000-000000000002','comptes','non_precise',NULL,'Compte Chèque','{\"fee\":\"1 000 DA\",\"period\":\"Trimestriel\"}',6,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000008','c0000000-0000-4000-8000-000000000002','comptes','non_precise',NULL,'Compte Tawfir (Épargne)','{\"fee\":\"Gratuit\"}',7,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000009','c0000000-0000-4000-8000-000000000003','comptes','entreprise',NULL,'Compte Commercial DZD (Entreprise)','{\"fee\":\"3 750 DA\",\"period\":\"Annuel\"}',8,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000010','c0000000-0000-4000-8000-000000000004','comptes','particulier',NULL,'Compte Chèque (Particulier)','{\"fee\":\"180 DA (TTC)\",\"period\":\"Mensuel\"}',9,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000011','c0000000-0000-4000-8000-000000000004','comptes','entreprise',NULL,'Compte Courant (Entreprise)','{\"fee\":\"500 DA\",\"period\":\"Mensuel\"}',10,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000012','c0000000-0000-4000-8000-000000000005','comptes','particulier',NULL,'Compte Courant (Particulier)','{\"fee\":\"1 200 DA\",\"period\":\"Mensuel\"}',11,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000013','c0000000-0000-4000-8000-000000000005','comptes','non_precise',NULL,'Compte de Chèques','{\"fee\":\"200 DA\",\"period\":\"Mensuel\"}',12,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000014','c0000000-0000-4000-8000-000000000006','comptes','non_precise',NULL,'Compte Courant','{\"fee\":\"500 DA\",\"period\":\"Trimestriel\"}',13,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000015','c0000000-0000-4000-8000-000000000006','comptes','non_precise',NULL,'Compte Chèque','{\"fee\":\"75 DA\",\"period\":\"Trimestriel\"}',14,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000016','c0000000-0000-4000-8000-000000000007','comptes','non_precise',NULL,'Compte Chèque','{\"fee\":\"1 000 DA\",\"period\":\"Annuel\"}',15,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000017','c0000000-0000-4000-8000-000000000008','comptes','non_precise',NULL,'Compte de Chèques','{\"fee\":\"300 DA\",\"period\":\"Annuel\"}',16,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000018','c0000000-0000-4000-8000-000000000008','comptes','professionnel',NULL,'Compte Courant (Professionnel)','{\"fee\":\"1 500 DA\",\"period\":\"Annuel\"}',17,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000019','c0000000-0000-4000-8000-000000000009','comptes','particulier',NULL,'Compte Particulier','{\"fee\":\"800 DA\",\"period\":\"Trimestriel\"}',18,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000020','c0000000-0000-4000-8000-000000000009','comptes','professionnel',NULL,'Compte Professionnel','{\"fee\":\"1 500 DA\",\"period\":\"Trimestriel\"}',19,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000021','c0000000-0000-4000-8000-000000000010','comptes','particulier',NULL,'Compte Courant (Particulier)','{\"fee\":\"800 DA\",\"period\":\"Trimestriel\"}',20,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000022','c0000000-0000-4000-8000-000000000010','comptes','entreprise',NULL,'Compte Courant (Entreprise)','{\"fee\":\"900 DA\",\"period\":\"Trimestriel\"}',21,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000023','c0000000-0000-4000-8000-000000000011','comptes','particulier',NULL,'Compte Chèque (Particulier)','{\"fee\":\"1 260,5 DA\",\"period\":\"Trimestriel\"}',22,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000024','c0000000-0000-4000-8000-000000000011','comptes','professionnel',NULL,'Compte Courant (Professionnel)','{\"fee\":\"4 000 DA\",\"period\":\"Annuel\"}',23,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000025','c0000000-0000-4000-8000-000000000012','comptes','entreprise',NULL,'Compte Courant (Corporate)','{\"fee\":\"2 500 DA\",\"period\":\"Trimestriel\"}',24,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000026','c0000000-0000-4000-8000-000000000012','comptes','professionnel',NULL,'Compte Courant (Professionnel)','{\"fee\":\"1 000 DA\",\"period\":\"Trimestriel\"}',25,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000027','c0000000-0000-4000-8000-000000000001','versements-retraits','non_precise','Retrait','Retrait même agence','{\"fee\":\"Gratuit\"}',0,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000028','c0000000-0000-4000-8000-000000000001','versements-retraits','non_precise','Retrait','Retrait déplacé (≤ 500 000 DA)','{\"fee\":\"Gratuit\"}',1,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000029','c0000000-0000-4000-8000-000000000001','versements-retraits','non_precise','Retrait','Retrait déplacé (> 500 000 DA)','{\"fee\":\"0,25% (Max 3 500 DA)\"}',2,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000030','c0000000-0000-4000-8000-000000000001','versements-retraits','non_precise','Versement','Versement même agence','{\"fee\":\"Gratuit\"}',3,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000031','c0000000-0000-4000-8000-000000000001','versements-retraits','non_precise','Versement','Versement inter-agences','{\"fee\":\"Gratuit\"}',4,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000032','c0000000-0000-4000-8000-000000000002','versements-retraits','non_precise','Retrait','Retrait même agence','{\"fee\":\"Gratuit\"}',5,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000033','c0000000-0000-4000-8000-000000000002','versements-retraits','non_precise','Retrait','Retrait déplacé (≤ 15 000 DA)','{\"fee\":\"Gratuit\"}',6,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000034','c0000000-0000-4000-8000-000000000002','versements-retraits','non_precise','Retrait','Retrait déplacé (> 15 000 DA et ≤ 50 000 DA)','{\"fee\":\"100 DA\"}',7,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000035','c0000000-0000-4000-8000-000000000002','versements-retraits','non_precise','Retrait','Retrait déplacé (> 50 000 DA)','{\"fee\":\"200 DA\"}',8,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000036','c0000000-0000-4000-8000-000000000004','versements-retraits','non_precise','Retrait','Retrait même agence','{\"fee\":\"Gratuit\"}',9,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000037','c0000000-0000-4000-8000-000000000004','versements-retraits','non_precise','Retrait','Retrait déplacé','{\"fee\":\"50 DA\",\"conditions\":\"opérations de caisse retrait ou versement\"}',10,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000038','c0000000-0000-4000-8000-000000000005','versements-retraits','non_precise','Retrait','Retrait même agence','{\"fee\":\"Gratuit\"}',11,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000039','c0000000-0000-4000-8000-000000000005','versements-retraits','non_precise','Retrait','Retrait déplacé (> 50 000 DA)','{\"fee\":\"500 DA\"}',12,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000040','c0000000-0000-4000-8000-000000000006','versements-retraits','non_precise','Retrait','Retrait même agence','{\"fee\":\"Gratuit\"}',13,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000041','c0000000-0000-4000-8000-000000000006','versements-retraits','non_precise','Retrait','Retrait déplacé','{\"fee\":\"100 DA (ou 500 DA selon banque)\"}',14,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000042','c0000000-0000-4000-8000-000000000007','versements-retraits','non_precise','Retrait','Retrait déplacé (par chèque)','{\"fee\":\"0,50% (Min 100 DA)\",\"conditions\":\"Plafonné à 500 000 DA\"}',15,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000043','c0000000-0000-4000-8000-000000000008','versements-retraits','non_precise','Retrait','Retrait même agence','{\"fee\":\"Gratuit\"}',16,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000044','c0000000-0000-4000-8000-000000000009','versements-retraits','non_precise','Retrait','Retrait même agence','{\"fee\":\"Gratuit\"}',17,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000045','c0000000-0000-4000-8000-000000000009','versements-retraits','particulier','Retrait','Retrait déplacé (Particulier)','{\"fee\":\"300 DA\",\"conditions\":\"Plafond de 300 000 DA\"}',18,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000046','c0000000-0000-4000-8000-000000000010','versements-retraits','non_precise','Retrait','Retrait même agence','{\"fee\":\"0,05% (Min 15, Max 50 DA)\"}',19,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000047','c0000000-0000-4000-8000-000000000010','versements-retraits','non_precise','Retrait','Retrait déplacé','{\"fee\":\"200 DA (jusqu\'à 250 000 DA)\"}',20,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000048','c0000000-0000-4000-8000-000000000011','versements-retraits','non_precise','Retrait','Retrait même agence','{\"fee\":\"Gratuit\"}',21,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000049','c0000000-0000-4000-8000-000000000011','versements-retraits','non_precise','Retrait','Retrait déplacé','{\"fee\":\"0,05%\"}',22,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000050','c0000000-0000-4000-8000-000000000012','versements-retraits','non_precise','Retrait','Retrait même agence','{\"fee\":\"Gratuit\"}',23,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000051','c0000000-0000-4000-8000-000000000012','versements-retraits','professionnel','Retrait','Retrait déplacé (Professionnel)','{\"fee\":\"2 000 DA\"}',24,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000052','c0000000-0000-4000-8000-000000000001','carte-locale','non_precise',NULL,'Carte CIB','{\"annualFee\":\"Gratuit\",\"opposition\":\"200 DA\",\"atmWithdrawal\":\"29,41 DA\"}',0,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000053','c0000000-0000-4000-8000-000000000002','carte-locale','non_precise',NULL,'CIB Classique','{\"annualFee\":\"200 DA\",\"opposition\":\"500 DA (avec réédition)\",\"atmWithdrawal\":\"20 DA\"}',1,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000054','c0000000-0000-4000-8000-000000000002','carte-locale','non_precise',NULL,'CIB Gold','{\"annualFee\":\"3 000 DA\",\"opposition\":\"500 DA (avec réédition)\",\"atmWithdrawal\":\"20 DA\"}',2,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000055','c0000000-0000-4000-8000-000000000004','carte-locale','non_precise',NULL,'CIB Classic','{\"annualFee\":\"Gratuit\",\"opposition\":\"200 DA\",\"atmWithdrawal\":\"35 DA\"}',3,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000056','c0000000-0000-4000-8000-000000000005','carte-locale','non_precise',NULL,'CIB Classic / Gold','{\"annualFee\":\"Franco\",\"opposition\":\"200 DA\",\"atmWithdrawal\":\"25 DA\"}',4,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000057','c0000000-0000-4000-8000-000000000006','carte-locale','non_precise',NULL,'CIB Classic','{\"annualFee\":\"Gratuit\",\"opposition\":\"100 DA\",\"atmWithdrawal\":\"35 DA (TTC)\"}',5,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000058','c0000000-0000-4000-8000-000000000007','carte-locale','non_precise',NULL,'CIB Classic / Gold','{\"annualFee\":\"Gratuit\",\"opposition\":\"150 DA\",\"atmWithdrawal\":\"29,41 DA\"}',6,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000059','c0000000-0000-4000-8000-000000000008','carte-locale','non_precise',NULL,'CIB Classic','{\"annualFee\":\"Gratuit\",\"opposition\":\"100 DA\",\"atmWithdrawal\":\"25 DA\"}',7,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000060','c0000000-0000-4000-8000-000000000009','carte-locale','non_precise',NULL,'CIB Classic','{\"annualFee\":\"800 DA (frais de gestion)\",\"opposition\":\"300 DA\",\"atmWithdrawal\":\"50 DA\"}',8,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000061','c0000000-0000-4000-8000-000000000010','carte-locale','non_precise',NULL,'CIB Classic','{\"annualFee\":\"Gratuit\",\"opposition\":\"1 000 DA\",\"atmWithdrawal\":\"Gratuit\"}',9,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000062','c0000000-0000-4000-8000-000000000011','carte-locale','non_precise',NULL,'CIB Classic','{\"annualFee\":\"426,89 DA (renouvellement)\",\"opposition\":\"420,17 DA\",\"atmWithdrawal\":\"Gratuit\"}',10,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000063','c0000000-0000-4000-8000-000000000012','carte-locale','non_precise',NULL,'CIB Gold','{\"annualFee\":\"3 500 DA\",\"opposition\":\"300 DA\",\"atmWithdrawal\":\"35 DA\"}',11,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000064','c0000000-0000-4000-8000-000000000001','epargne','non_precise',NULL,'Livret d\'Épargne','{\"rate\":\"53,27% (Part Client) / 46,73% (Part Banque)\",\"conditions\":\"Sur les bénéfices\"}',0,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000065','c0000000-0000-4000-8000-000000000001','epargne','non_precise',NULL,'Dépôt Affecté 3 mois','{\"rate\":\"52,50% (Part Client) / 47,50% (Part Banque)\"}',1,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000066','c0000000-0000-4000-8000-000000000001','epargne','non_precise',NULL,'Dépôt Affecté 6 mois','{\"rate\":\"53,80% (Part Client) / 46,20% (Part Banque)\"}',2,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000067','c0000000-0000-4000-8000-000000000001','epargne','non_precise',NULL,'Dépôt Affecté 12 mois','{\"rate\":\"55,50% (Part Client) / 44,50% (Part Banque)\"}',3,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000068','c0000000-0000-4000-8000-000000000001','epargne','non_precise',NULL,'Dépôt Affecté 24 mois','{\"rate\":\"59,00% (Part Client) / 41,00% (Part Banque)\"}',4,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000069','c0000000-0000-4000-8000-000000000001','epargne','non_precise',NULL,'Dépôt Affecté 36 mois','{\"rate\":\"63,00% (Part Client) / 37,00% (Part Banque)\"}',5,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000070','c0000000-0000-4000-8000-000000000001','epargne','non_precise',NULL,'Dépôt Affecté 60 mois','{\"rate\":\"67,50% (Part Client) / 32,50% (Part Banque)\"}',6,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000071','c0000000-0000-4000-8000-000000000001','epargne','non_precise',NULL,'Dépôt Affecté > 60 mois','{\"rate\":\"72,00% (Part Client) / 28,00% (Part Banque)\"}',7,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000072','c0000000-0000-4000-8000-000000000002','epargne','non_precise',NULL,'Compte Épargne','{\"rate\":\"61% (Part Client) / 39% (Part Banque)\",\"conditions\":\"Sur les bénéfices\"}',8,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000073','c0000000-0000-4000-8000-000000000002','epargne','non_precise',NULL,'DAT 3 mois','{\"rate\":\"75% (Part Client) / 25% (Part Banque)\"}',9,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000074','c0000000-0000-4000-8000-000000000002','epargne','non_precise',NULL,'DAT 6 mois','{\"rate\":\"60% (Part Client) / 40% (Part Banque)\"}',10,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000075','c0000000-0000-4000-8000-000000000002','epargne','non_precise',NULL,'DAT 12 mois','{\"rate\":\"65% (Part Client) / 35% (Part Banque)\"}',11,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000076','c0000000-0000-4000-8000-000000000002','epargne','non_precise',NULL,'DAT 24 mois','{\"rate\":\"75% (Part Client) / 25% (Part Banque)\"}',12,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000077','c0000000-0000-4000-8000-000000000002','epargne','non_precise',NULL,'DAT 36 mois','{\"rate\":\"80% (Part Client) / 20% (Part Banque)\"}',13,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000078','c0000000-0000-4000-8000-000000000002','epargne','non_precise',NULL,'DAT 60 mois et +','{\"rate\":\"90% (Part Client) / 10% (Part Banque)\"}',14,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000079','c0000000-0000-4000-8000-000000000004','epargne','non_precise',NULL,'Livret d\'Épargne','{\"rate\":\"3,5% / an\"}',15,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000080','c0000000-0000-4000-8000-000000000004','epargne','non_precise',NULL,'DAT (12 à 24 mois)','{\"rate\":\"3,5% / an\"}',16,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000081','c0000000-0000-4000-8000-000000000005','epargne','non_precise',NULL,'Compte Épargne \"Tawfir\"','{\"rate\":\"2,5% à 4% / an\",\"conditions\":\"Variable selon montant\"}',17,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000082','c0000000-0000-4000-8000-000000000006','epargne','non_precise',NULL,'Compte Épargne','{\"rate\":\"3% / an\"}',18,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000083','c0000000-0000-4000-8000-000000000006','epargne','non_precise',NULL,'DAT (12 à 18 mois)','{\"rate\":\"2,00%\"}',19,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000084','c0000000-0000-4000-8000-000000000013','epargne','non_precise',NULL,'Compte Épargne Logement','{\"rate\":\"2%\"}',20,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000085','c0000000-0000-4000-8000-000000000013','epargne','non_precise',NULL,'DAT (12 mois)','{\"rate\":\"3,25%\"}',21,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000086','c0000000-0000-4000-8000-000000000007','epargne','non_precise',NULL,'Livret d\'Épargne','{\"rate\":\"Non spécifié\"}',22,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000087','c0000000-0000-4000-8000-000000000008','epargne','non_precise',NULL,'DAT (12 à 18 mois)','{\"rate\":\"Taux variable de 1,75%+\"}',23,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000088','c0000000-0000-4000-8000-000000000009','epargne','non_precise',NULL,'DAT (12 mois)','{\"rate\":\"Consulter la grille\"}',24,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000089','c0000000-0000-4000-8000-000000000010','epargne','non_precise',NULL,'Compte Tawfiri','{\"rate\":\"1,9% / an\"}',25,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000090','c0000000-0000-4000-8000-000000000011','epargne','non_precise',NULL,'Compte Épargne','{\"rate\":\"3,25%\"}',26,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000091','c0000000-0000-4000-8000-000000000012','epargne','non_precise',NULL,'DAT (12 mois)','{\"rate\":\"TRC + 0,25%\"}',27,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000092','c0000000-0000-4000-8000-000000000001','credits','non_precise',NULL,'Prélèvement avec balayage','{\"fileFee\":\"4% du montant prélevé\"}',0,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000093','c0000000-0000-4000-8000-000000000001','credits','entreprise',NULL,'Financement Exploitation (Entreprise)','{\"rate\":\"6% - 9%\"}',1,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000094','c0000000-0000-4000-8000-000000000001','credits','entreprise',NULL,'Financement Investissement (Entreprise)','{\"rate\":\"5,50% - 8%\"}',2,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000095','c0000000-0000-4000-8000-000000000001','credits','non_precise',NULL,'Ijara (Leasing)','{\"rate\":\"Max 12%\"}',3,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000096','c0000000-0000-4000-8000-000000000001','credits','non_precise',NULL,'Financement Immobilier (Épargnant)','{\"rate\":\"6% - 6,50%\"}',4,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000097','c0000000-0000-4000-8000-000000000001','credits','non_precise',NULL,'Financement Immobilier (Non-épargnant)','{\"rate\":\"7% - 7,50%\"}',5,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000098','c0000000-0000-4000-8000-000000000001','credits','non_precise',NULL,'Financement Consommation','{\"rate\":\"10% - 11%\",\"fileFee\":\"1% flat (Min 5 000 DA)\"}',6,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000099','c0000000-0000-4000-8000-000000000002','credits','non_precise',NULL,'Crédit Immobilier (Épargnant)','{\"rate\":\"6,50% / an\",\"fileFee\":\"10 000 DA\",\"earlyRepayment\":\"Non spécifié\"}',7,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000100','c0000000-0000-4000-8000-000000000002','credits','non_precise',NULL,'Crédit Immobilier (Non-épargnant)','{\"rate\":\"7,00% / an\",\"fileFee\":\"7 000 DA\"}',8,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000101','c0000000-0000-4000-8000-000000000002','credits','non_precise',NULL,'Crédit Consommation (Équipement)','{\"rate\":\"9,50% / an\",\"fileFee\":\"3 000 DA\"}',9,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000102','c0000000-0000-4000-8000-000000000002','credits','non_precise',NULL,'Crédit Consommation (Auto)','{\"rate\":\"9,50% / an\",\"fileFee\":\"15 000 DA\"}',10,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000103','c0000000-0000-4000-8000-000000000003','credits','non_precise',NULL,'Découvert','{\"rate\":\"Taux de référence + 7,25%\"}',11,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000104','c0000000-0000-4000-8000-000000000004','credits','non_precise',NULL,'Crédit Immobilier','{\"rate\":\"TR + Marge\",\"fileFee\":\"0,5% (Min 10 000, Max 50 000 DA)\",\"earlyRepayment\":\"1% (partiel), 2% (total)\"}',12,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000105','c0000000-0000-4000-8000-000000000004','credits','non_precise',NULL,'Crédit Consommation','{\"rate\":\"TR + Marge\",\"fileFee\":\"1% (Min 3 000, Max 10 000 DA)\",\"earlyRepayment\":\"Pénalité de 4%\"}',13,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000106','c0000000-0000-4000-8000-000000000005','credits','non_precise',NULL,'Crédit Immobilier \"Menzili\"','{\"rate\":\"TRD + 0,85%\",\"fileFee\":\"Non spécifié\"}',14,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000107','c0000000-0000-4000-8000-000000000006','credits','non_precise',NULL,'Crédit Immobilier','{\"rate\":\"5,75% (épargnant)\",\"fileFee\":\"10 000 DA\"}',15,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000108','c0000000-0000-4000-8000-000000000006','credits','non_precise',NULL,'Crédit Consommation','{\"rate\":\"8,00%\",\"fileFee\":\"5 000 DA\"}',16,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000109','c0000000-0000-4000-8000-000000000007','credits','non_precise',NULL,'Crédit Immobilier','{\"rate\":\"Non spécifié\",\"fileFee\":\"20 000 DA\"}',17,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000110','c0000000-0000-4000-8000-000000000007','credits','non_precise',NULL,'Crédit Consommation','{\"rate\":\"Non spécifié\",\"fileFee\":\"5 000 DA\"}',18,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000111','c0000000-0000-4000-8000-000000000008','credits','non_precise',NULL,'Crédit Immobilier','{\"rate\":\"5,75% (épargnant)\",\"fileFee\":\"10 000 DA\"}',19,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000112','c0000000-0000-4000-8000-000000000008','credits','non_precise',NULL,'Crédit Consommation','{\"rate\":\"8,00%\",\"fileFee\":\"5 000 DA\"}',20,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000113','c0000000-0000-4000-8000-000000000009','credits','non_precise',NULL,'Crédit Immobilier','{\"rate\":\"À partir de 6%\",\"fileFee\":\"0,50%\"}',21,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000114','c0000000-0000-4000-8000-000000000009','credits','non_precise',NULL,'Crédit Véhicule','{\"rate\":\"À partir de 6%\",\"fileFee\":\"1,03% (Min 5 000, Max 20 000 DA)\"}',22,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000115','c0000000-0000-4000-8000-000000000010','credits','non_precise',NULL,'Prêt Immobilier','{\"rate\":\"TBSGA + Marge\",\"fileFee\":\"1,2% (Min 20 000, Max 100 000 DA)\"}',23,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000116','c0000000-0000-4000-8000-000000000010','credits','non_precise',NULL,'Crédit Auto','{\"rate\":\"TBSGA + Marge\",\"fileFee\":\"1% (Min 10 000, Max 20 000 DA)\"}',24,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000117','c0000000-0000-4000-8000-000000000011','credits','non_precise',NULL,'Prêt Habitat','{\"rate\":\"TR + Marge\",\"fileFee\":\"T% (Min 3 000, Max 20 000 DA)\",\"earlyRepayment\":\"2%\"}',25,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000118','c0000000-0000-4000-8000-000000000012','credits','non_precise',NULL,'Crédit Véhicule','{\"rate\":\"TRD + Marge\",\"fileFee\":\"15 000 DA\",\"earlyRepayment\":\"4% (flat)\"}',26,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000119','c0000000-0000-4000-8000-000000000001','carte-internationale','non_precise',NULL,'Carte Visa Classique','{\"annualFee\":\"1 800 DA + 700 DA/chargement\",\"opposition\":\"800 DA\",\"foreignWithdrawal\":\"1 € + 2%\"}',0,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000120','c0000000-0000-4000-8000-000000000001','carte-internationale','non_precise',NULL,'Carte Visa Gold','{\"annualFee\":\"4 500 DA\",\"opposition\":\"800 DA\",\"foreignWithdrawal\":\"1 € + 2%\"}',1,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000121','c0000000-0000-4000-8000-000000000001','carte-internationale','non_precise',NULL,'Carte Visa Platinum','{\"annualFee\":\"14 000 DA\",\"opposition\":\"800 DA\",\"foreignWithdrawal\":\"1 € + 2%\"}',2,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000122','c0000000-0000-4000-8000-000000000002','carte-internationale','non_precise',NULL,'Visa Classique','{\"annualFee\":\"4 000 DA\",\"opposition\":\"Gratuit (sans réédition)\",\"foreignWithdrawal\":\"2 € + 1,5% (Zone Euro)\"}',3,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000123','c0000000-0000-4000-8000-000000000002','carte-internationale','non_precise',NULL,'Visa Gold','{\"annualFee\":\"6 500 DA\",\"opposition\":\"Gratuit (sans réédition)\",\"foreignWithdrawal\":\"2 € + 1,5% (Zone Euro)\"}',4,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000124','c0000000-0000-4000-8000-000000000002','carte-internationale','non_precise',NULL,'Visa Platinum','{\"annualFee\":\"14 000 DA\",\"opposition\":\"Gratuit (sans réédition)\",\"foreignWithdrawal\":\"2 € + 1,5% (Zone Euro)\"}',5,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000125','c0000000-0000-4000-8000-000000000004','carte-internationale','non_precise',NULL,'Visa Classic (sans assurance)','{\"annualFee\":\"1 790 DA\",\"opposition\":\"Gratuit\",\"foreignWithdrawal\":\"1,5 € + 1%\"}',6,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000126','c0000000-0000-4000-8000-000000000005','carte-internationale','non_precise',NULL,'Mastercard Prépayée','{\"annualFee\":\"2 500 DA\",\"opposition\":\"500 DA (blocage)\",\"foreignWithdrawal\":\"Non spécifié\"}',7,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000127','c0000000-0000-4000-8000-000000000007','carte-internationale','non_precise',NULL,'Mastercard Titanium','{\"annualFee\":\"17 000 DA / 2 ans\",\"opposition\":\"2 500 DA\",\"foreignWithdrawal\":\"2,5% + 2 €\"}',8,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000128','c0000000-0000-4000-8000-000000000008','carte-internationale','non_precise',NULL,'Carte Mastercard Platinum','{\"annualFee\":\"17 000 DA / An\",\"opposition\":\"1 000 DA\",\"foreignWithdrawal\":\"1 000 DA / 2 000 DA\"}',9,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000129','c0000000-0000-4000-8000-000000000009','carte-internationale','non_precise',NULL,'Visa Classique','{\"annualFee\":\"4 500 DA\",\"opposition\":\"1 500 DA\",\"foreignWithdrawal\":\"2 € + 1,5%\"}',10,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000130','c0000000-0000-4000-8000-000000000010','carte-internationale','non_precise',NULL,'Visa Classic','{\"annualFee\":\"4 500 DA\",\"opposition\":\"Non spécifié\",\"foreignWithdrawal\":\"2 € + 2%\"}',11,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000131','c0000000-0000-4000-8000-000000000001','devises','non_precise','Transfert international','Virement à l\'étranger','{\"fee\":\"0,5% (Min 3 000 DA) + Frais Swift 3 000 DA\"}',0,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000132','c0000000-0000-4000-8000-000000000001','devises','non_precise','SWIFT / correspondant','Avis de sort','{\"fee\":\"5 000 DA + Frais Swift 3 000 DA\"}',1,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000133','c0000000-0000-4000-8000-000000000001','devises','non_precise','SWIFT / correspondant','Frais correspondants étrangers','{\"fee\":\"15 000 DA\"}',2,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000134','c0000000-0000-4000-8000-000000000001','devises','non_precise','SWIFT / correspondant','Frais de notification Swift','{\"fee\":\"1 500 DA/Message\"}',3,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000135','c0000000-0000-4000-8000-000000000001','devises','non_precise','Change','Achat devise','{\"fee\":\"Gratuit\"}',4,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000136','c0000000-0000-4000-8000-000000000001','devises','non_precise','Change','Vente devise','{\"fee\":\"2% (Min 500 DA)\"}',5,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000137','c0000000-0000-4000-8000-000000000002','devises','non_precise','Transfert international','Transfert libre (Import)','{\"fee\":\"3 000 DA (frais Swift)\"}',6,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000138','c0000000-0000-4000-8000-000000000002','devises','non_precise','Transfert international','Transfert à l\'étranger','{\"fee\":\"1,00% (Commission Banque d\'Algérie) + Frais Swift\"}',7,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000139','c0000000-0000-4000-8000-000000000002','devises','non_precise','Allocation','Allocation touristique','{\"fee\":\"840,34 DA\"}',8,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000140','c0000000-0000-4000-8000-000000000003','devises','non_precise','Transfert international','Paiement sur compte devise','{\"fee\":\"0,25% + 3 000 DA (frais Swift)\"}',9,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000141','c0000000-0000-4000-8000-000000000004','devises','non_precise','Transfert international','Transfert de devises','{\"fee\":\"Frais Swift 2 500 DA\"}',10,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000142','c0000000-0000-4000-8000-000000000004','devises','non_precise','Allocation','Allocation touristique','{\"fee\":\"1 000 DA\"}',11,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000143','c0000000-0000-4000-8000-000000000005','devises','non_precise','Transfert international','Transfert libre','{\"fee\":\"0,25% (Min 2 500 DA) + Frais Swift 3 000 DA\"}',12,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000144','c0000000-0000-4000-8000-000000000006','devises','non_precise','Transfert international','Virement à l\'étranger','{\"fee\":\"Non spécifié\"}',13,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000145','c0000000-0000-4000-8000-000000000007','devises','non_precise','Transfert international','Transfert sur compte devise','{\"fee\":\"0,25% (Min 2 500 DA) + Frais Swift\"}',14,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000146','c0000000-0000-4000-8000-000000000007','devises','non_precise','Allocation','Allocation touristique','{\"fee\":\"500 DA (adulte), 250 DA (enfant)\"}',15,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000147','c0000000-0000-4000-8000-000000000008','devises','non_precise','Transfert international','Virement à l\'étranger','{\"fee\":\"1% (Min 2 500 DA) + Frais Swift\"}',16,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000148','c0000000-0000-4000-8000-000000000009','devises','non_precise','Transfert international','Transfert','{\"fee\":\"Marge de 0,1% + com BA 0,10% + Frais Swift\"}',17,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000149','c0000000-0000-4000-8000-000000000010','devises','non_precise','Transfert international','Transfert vers l\'étranger','{\"fee\":\"0,1% + 0,10% (com BA) + 1 000 DA (Swift)\"}',18,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000150','c0000000-0000-4000-8000-000000000011','devises','non_precise','Transfert international','Transfert','{\"fee\":\"Marge de 0,1% + com BA 0,10% + Frais Swift 3 000 DA\"}',19,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000151','c0000000-0000-4000-8000-000000000012','devises','non_precise','Transfert international','Transfert à l\'étranger','{\"fee\":\"0,25% (Min 2 500 DA) + Frais Swift\"}',20,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000'),
('c1000000-0000-4000-8000-000000000152','c0000000-0000-4000-8000-000000000001','operations-diverses','non_precise','Digital / pack','Pack \"Smart\" (E-banking, SMS)','{\"fee\":\"100 DA/mois\"}',0,'2026-10-06 19:22:27.000','2026-10-06 19:22:27.000');
/*!40000 ALTER TABLE `comparator_conditions` ENABLE KEYS */;
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
/*!40000 ALTER TABLE `comparator_meta` DISABLE KEYS */;
INSERT INTO `comparator_meta` VALUES
(1,'2026-10-06 19:28:24.521');
/*!40000 ALTER TABLE `comparator_meta` ENABLE KEYS */;
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
/*!40000 ALTER TABLE `contact_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `contact_messages` ENABLE KEYS */;
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
/*!40000 ALTER TABLE `course_progress` DISABLE KEYS */;
INSERT INTO `course_progress` VALUES
('4fef2372-160d-4c3e-89eb-b2f5807501c8','1072d2d9-660f-4492-bc9e-06339c2765b8','1f828468-433a-4239-972e-69771920d58e','dba64efe-4342-42c2-abf7-843875d017a2','completed','2026-10-01 19:23:47.720','2026-10-02 19:23:47.720'),
('525fdd97-bcee-47f7-8498-fea5e1747ad2','a55c74f7-75ac-4043-b8c3-420ce31f49b1','e65b8f94-255e-4726-a2cc-603b54f77ee2','dba64efe-4342-42c2-abf7-843875d017a2','completed','2026-09-24 19:23:47.729','2026-09-24 19:23:47.729'),
('547ed840-5a0b-479d-89cc-75cf6e6f0b30','1072d2d9-660f-4492-bc9e-06339c2765b8','b8859233-73d6-4995-a2ff-71bea674984e','dba64efe-4342-42c2-abf7-843875d017a2','in_progress','2026-10-04 19:23:47.720',NULL),
('62b93b5b-490c-408d-a24c-8f24214f12fb','a55c74f7-75ac-4043-b8c3-420ce31f49b1','b8859233-73d6-4995-a2ff-71bea674984e','dba64efe-4342-42c2-abf7-843875d017a2','completed','2026-09-23 19:23:47.729','2026-09-23 19:23:47.729'),
('d455e2e7-f66b-4b7d-8779-64bb91eefcba','a55c74f7-75ac-4043-b8c3-420ce31f49b1','1f828468-433a-4239-972e-69771920d58e','dba64efe-4342-42c2-abf7-843875d017a2','completed','2026-09-22 19:23:47.729','2026-09-22 19:23:47.729');
/*!40000 ALTER TABLE `course_progress` ENABLE KEYS */;
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
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES
('0c181a28-0e80-4a46-924b-b67b77f01e32','8cbe0465-9199-40bc-9a68-0768c1f0d75a','Préparer un contrôle','Bons réflexes.','<ol><li>Classer les justificatifs</li><li>Garder les contrats</li><li>Répondre dans les délais</li></ol>',2,1,20,'abedeac8-c7d8-4a05-ad84-38132db5b885','2026-10-06 19:23:47.674','2026-10-06 19:23:47.674'),
('1f828468-433a-4239-972e-69771920d58e','dba64efe-4342-42c2-abf7-843875d017a2','Introduction à la comptabilité','À quoi sert la comptabilité ?','<h2>Pourquoi tenir une comptabilité ?</h2><p>La comptabilité donne une <strong>image fidèle</strong> de la situation de votre entreprise.</p><ul><li>Suivre les recettes et les dépenses</li><li>Respecter les obligations légales</li><li>Prendre de meilleures décisions</li></ul>',0,1,15,'c107f9c9-1d87-4bf3-b49e-adafd9bab6a0','2026-10-06 19:23:47.568','2026-10-06 19:23:47.568'),
('42b08229-10a2-45c9-a89d-0624fc105f68','8cbe0465-9199-40bc-9a68-0768c1f0d75a','Charges déductibles','Ce que l’on peut déduire.','<p>Toute dépense engagée dans l’intérêt de l’entreprise et justifiée peut, en principe, être déduite.</p>',1,1,25,'e68c8a99-9cce-40cd-81dc-690107f703fe','2026-10-06 19:23:47.663','2026-10-06 19:23:47.663'),
('4cf3d620-fe60-497a-8cbd-ceef10582cec','dba64efe-4342-42c2-abf7-843875d017a2','Aller plus loin : lectures conseillées','Cours bonus, non obligatoire.','<p>Quelques pistes pour approfondir : plan comptable, TVA, amortissements.</p>',3,0,10,'6389322d-baf1-44e5-9304-8f4c9384b3bd','2026-10-06 19:23:47.608','2026-10-06 19:23:47.608'),
('82a8587b-1fb8-4a57-ad3a-4b8f10100461','a6fb6c6f-85cc-4eee-9f0c-c7293b529661','Prévoir ses encaissements','Plan de trésorerie.','<p>Contenu en cours de rédaction.</p>',0,1,20,'e09548a9-3899-47fa-8124-4b7491e6f5ff','2026-10-06 19:23:47.690','2026-10-06 19:23:47.690'),
('b80a443b-004b-4424-948a-8aa5c0219b1a','129b63d0-5283-483b-8484-11762a0ae939','Leçon d’archive','Ancien contenu.','<p>Contenu conservé.</p>',0,1,5,'eaffccb2-8078-4caa-aa92-1f868300b366','2026-10-06 19:23:47.708','2026-10-06 19:23:47.708'),
('b8859233-73d6-4995-a2ff-71bea674984e','dba64efe-4342-42c2-abf7-843875d017a2','Le journal et le grand livre','Enregistrer chaque opération.','<h2>Le journal</h2><p>Chaque opération est enregistrée <em>chronologiquement</em> avec un débit et un crédit.</p><p>Le grand livre regroupe ensuite ces écritures par compte.</p>',1,1,25,'c107f9c9-1d87-4bf3-b49e-adafd9bab6a0','2026-10-06 19:23:47.583','2026-10-06 19:23:47.583'),
('e65b8f94-255e-4726-a2cc-603b54f77ee2','dba64efe-4342-42c2-abf7-843875d017a2','Le bilan et le compte de résultat','Lire les deux documents de synthèse.','<h2>Le bilan</h2><p>Photographie du patrimoine à une date donnée : ce que possède l’entreprise et ce qu’elle doit.</p><h2>Le compte de résultat</h2><p>Il mesure le bénéfice ou la perte sur une période.</p>',2,1,30,'6389322d-baf1-44e5-9304-8f4c9384b3bd','2026-10-06 19:23:47.600','2026-10-06 19:23:47.600'),
('eb580128-12d2-4d40-89c3-30a01c6c9328','8cbe0465-9199-40bc-9a68-0768c1f0d75a','Les régimes d’imposition','Comparer les régimes.','<h2>Choisir son régime</h2><p>Le régime dépend de la forme juridique et du chiffre d’affaires.</p>',0,1,30,'e68c8a99-9cce-40cd-81dc-690107f703fe','2026-10-06 19:23:47.654','2026-10-06 19:23:47.654');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
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
/*!40000 ALTER TABLE `enrollments` DISABLE KEYS */;
INSERT INTO `enrollments` VALUES
('1072d2d9-660f-4492-bc9e-06339c2765b8','d2182dc3-126f-47d6-b5df-eeaf6f5199f7','dba64efe-4342-42c2-abf7-843875d017a2','active','2026-10-01 19:23:47.716',NULL),
('a55c74f7-75ac-4043-b8c3-420ce31f49b1','02055049-8154-4b8c-be77-e739f9462d62','dba64efe-4342-42c2-abf7-843875d017a2','completed','2026-09-21 19:23:47.726','2026-09-28 19:23:47.726');
/*!40000 ALTER TABLE `enrollments` ENABLE KEYS */;
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
/*!40000 ALTER TABLE `formation_categories` DISABLE KEYS */;
INSERT INTO `formation_categories` VALUES
('5926fdae-42fb-4b16-b960-e3724a1c526b','demo-finance','Finance','2026-10-06 19:23:47.533'),
('8e48efe9-0cc9-4306-adad-7255b5fbfdc0','demo-gestion','Gestion','2026-10-06 19:23:47.537');
/*!40000 ALTER TABLE `formation_categories` ENABLE KEYS */;
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
/*!40000 ALTER TABLE `formations` DISABLE KEYS */;
INSERT INTO `formations` VALUES
('129b63d0-5283-483b-8484-11762a0ae939','demo-ancienne-formation','Ancienne formation (archivée)','Retirée du catalogue : les inscrits gardent leur accès.','archived','standard','8e48efe9-0cc9-4306-adad-7255b5fbfdc0',NULL,0,NULL,NULL,NULL,NULL,'[]','[]','d533b47c-9497-4a43-89b5-83919a96530c',NULL,'2026-09-15 19:23:47.700','2026-10-06 19:23:47.701'),
('8cbe0465-9199-40bc-9a68-0768c1f0d75a','demo-fiscalite-avancee','Fiscalité avancée pour PME','Optimiser légalement la fiscalité de son entreprise. Formation réservée aux comptes premium.','published','premium','5926fdae-42fb-4b16-b960-e3724a1c526b',NULL,1,'Certificat en fiscalité avancée','Valide la maîtrise des régimes fiscaux courants.','Optimiser légalement la fiscalité de son entreprise','advanced','[\"Comparer les régimes d’imposition\",\"Identifier les charges déductibles\",\"Préparer un contrôle fiscal\"]','[\"Connaître les bases de la comptabilité\",\"Avoir une entreprise ou un projet de création\"]','d533b47c-9497-4a43-89b5-83919a96530c','2026-09-16 19:23:47.643','2026-09-15 19:23:47.643','2026-10-06 19:23:47.645'),
('a6fb6c6f-85cc-4eee-9f0c-c7293b529661','demo-brouillon-tresorerie','Gestion de trésorerie (en révision)','Formation en préparation : en attente de relecture, pas encore dans le catalogue.','in_review','standard','8e48efe9-0cc9-4306-adad-7255b5fbfdc0',NULL,0,NULL,NULL,'Prévoir ses encaissements et ses décaissements','intermediate','[\"Construire un plan de trésorerie\"]','[]','d533b47c-9497-4a43-89b5-83919a96530c',NULL,'2026-09-15 19:23:47.683','2026-10-06 19:23:47.684'),
('dba64efe-4342-42c2-abf7-843875d017a2','demo-comptabilite-de-base','Comptabilité de base','Comprendre les bases de la comptabilité d’une petite entreprise : journal, bilan et compte de résultat.','published','standard','5926fdae-42fb-4b16-b960-e3724a1c526b',NULL,1,'Certificat en comptabilité de base','Atteste que le titulaire a suivi tous les cours obligatoires.','Tenir les comptes d’une petite entreprise, pas à pas','beginner','[\"Comprendre à quoi sert la comptabilité\",\"Enregistrer une opération au journal\",\"Lire un bilan et un compte de résultat\"]','[\"Aucun : cette formation s’adresse aux débutants\"]','d533b47c-9497-4a43-89b5-83919a96530c','2026-09-16 19:23:47.540','2026-09-15 19:23:47.540','2026-10-06 19:23:47.546');
/*!40000 ALTER TABLE `formations` ENABLE KEYS */;
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
/*!40000 ALTER TABLE `lesson_blocks` DISABLE KEYS */;
INSERT INTO `lesson_blocks` VALUES
('05dd8256-35c5-4014-b6c6-7b1cf75fcb52','b8859233-73d6-4995-a2ff-71bea674984e','table',2,'{\"rows\":[[\"512 Banque\",\"1 200,00\",\"\"],[\"706 Prestations\",\"\",\"1 200,00\"]],\"caption\":\"Exemple : encaissement d’une facture\",\"headers\":[\"Compte\",\"Débit\",\"Crédit\"]}',NULL,'2026-10-06 19:23:47.592','2026-10-06 19:23:47.592'),
('37bdff69-55fc-46c2-8e1b-94d64e721898','b8859233-73d6-4995-a2ff-71bea674984e','callout',1,'{\"html\":\"<p>Chaque écriture a <strong>autant de débit que de crédit</strong>.</p>\",\"title\":\"À retenir\",\"variant\":\"tip\"}',NULL,'2026-10-06 19:23:47.592','2026-10-06 19:23:47.592'),
('554bd716-871f-48ed-af14-a7f4d5de6e69','b8859233-73d6-4995-a2ff-71bea674984e','quote',4,'{\"text\":\"La comptabilité est le langage des affaires.\",\"author\":\"Proverbe\"}',NULL,'2026-10-06 19:23:47.592','2026-10-06 19:23:47.592'),
('937963db-61ea-4cdf-bb61-737b5f78f9c0','82a8587b-1fb8-4a57-ad3a-4b8f10100461','text',0,'{\"html\":\"<p>Contenu en cours de rédaction.</p>\"}',NULL,'2026-10-06 19:23:47.694','2026-10-06 19:23:47.694'),
('b2f60ceb-5a8f-47fb-8686-9d76f861b229','b8859233-73d6-4995-a2ff-71bea674984e','code',3,'{\"code\":\"SELECT compte, SUM(debit) - SUM(credit) AS solde\\nFROM ecritures\\nGROUP BY compte;\",\"caption\":\"Calculer le solde de chaque compte\",\"language\":\"sql\"}',NULL,'2026-10-06 19:23:47.592','2026-10-06 19:23:47.592'),
('b70d5b1a-236d-451b-8c66-8b805be64b50','42b08229-10a2-45c9-a89d-0624fc105f68','text',0,'{\"html\":\"<p>Toute dépense engagée dans l’intérêt de l’entreprise et justifiée peut, en principe, être déduite.</p>\"}',NULL,'2026-10-06 19:23:47.667','2026-10-06 19:23:47.667'),
('c226f560-80bc-45aa-9ecc-6e98d6a42892','1f828468-433a-4239-972e-69771920d58e','text',0,'{\"html\":\"<h2>Pourquoi tenir une comptabilité ?</h2><p>La comptabilité donne une <strong>image fidèle</strong> de la situation de votre entreprise.</p><ul><li>Suivre les recettes et les dépenses</li><li>Respecter les obligations légales</li><li>Prendre de meilleures décisions</li></ul>\"}',NULL,'2026-10-06 19:23:47.578','2026-10-06 19:23:47.578'),
('c84e0943-c905-42dc-88e1-fecbbd373362','b8859233-73d6-4995-a2ff-71bea674984e','resources',5,'{\"items\":[{\"url\":\"https://example.org/plan-comptable\",\"label\":\"Plan comptable\",\"description\":\"Liste des comptes\"}],\"title\":\"Pour aller plus loin\"}',NULL,'2026-10-06 19:23:47.592','2026-10-06 19:23:47.592'),
('cae7c5b9-2008-46e3-9d68-e4c2d85a8da4','b80a443b-004b-4424-948a-8aa5c0219b1a','text',0,'{\"html\":\"<p>Contenu conservé.</p>\"}',NULL,'2026-10-06 19:23:47.710','2026-10-06 19:23:47.710'),
('cee0d16b-486a-4261-890a-c63a5aeefd1c','0c181a28-0e80-4a46-924b-b67b77f01e32','text',0,'{\"html\":\"<ol><li>Classer les justificatifs</li><li>Garder les contrats</li><li>Répondre dans les délais</li></ol>\"}',NULL,'2026-10-06 19:23:47.677','2026-10-06 19:23:47.677'),
('d37facfd-0909-4123-bee2-f0cdb619c877','b8859233-73d6-4995-a2ff-71bea674984e','text',0,'{\"html\":\"<h2>Le journal</h2><p>Chaque opération est enregistrée <em>chronologiquement</em> avec un débit et un crédit.</p><p>Le grand livre regroupe ensuite ces écritures par compte.</p>\"}',NULL,'2026-10-06 19:23:47.592','2026-10-06 19:23:47.592'),
('d49eaa01-e156-428f-b41a-2f2016f6ceca','4cf3d620-fe60-497a-8cbd-ceef10582cec','text',0,'{\"html\":\"<p>Quelques pistes pour approfondir : plan comptable, TVA, amortissements.</p>\"}',NULL,'2026-10-06 19:23:47.613','2026-10-06 19:23:47.613'),
('dc3a91c6-6fae-47ea-b730-16f1638904fc','eb580128-12d2-4d40-89c3-30a01c6c9328','text',0,'{\"html\":\"<h2>Choisir son régime</h2><p>Le régime dépend de la forme juridique et du chiffre d’affaires.</p>\"}',NULL,'2026-10-06 19:23:47.660','2026-10-06 19:23:47.660'),
('e2dd7b3b-9eae-48bd-9a12-51e929e28d5e','e65b8f94-255e-4726-a2cc-603b54f77ee2','text',0,'{\"html\":\"<h2>Le bilan</h2><p>Photographie du patrimoine à une date donnée : ce que possède l’entreprise et ce qu’elle doit.</p><h2>Le compte de résultat</h2><p>Il mesure le bénéfice ou la perte sur une période.</p>\"}',NULL,'2026-10-06 19:23:47.605','2026-10-06 19:23:47.605');
/*!40000 ALTER TABLE `lesson_blocks` ENABLE KEYS */;
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
/*!40000 ALTER TABLE `lesson_revisions` DISABLE KEYS */;
/*!40000 ALTER TABLE `lesson_revisions` ENABLE KEYS */;
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `media_storageKey_key` (`storageKey`),
  UNIQUE KEY `media_id_courseId_key` (`id`,`courseId`),
  KEY `media_courseId_idx` (`courseId`),
  KEY `media_articleId_idx` (`articleId`),
  KEY `media_uploadedById_fkey` (`uploadedById`),
  CONSTRAINT `media_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `media_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `media_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `media_kind_check` CHECK (`kind` in ('video','image','document')),
  CONSTRAINT `media_sizeBytes_check` CHECK (`sizeBytes` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
/*!40000 ALTER TABLE `media` DISABLE KEYS */;
/*!40000 ALTER TABLE `media` ENABLE KEYS */;
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
/*!40000 ALTER TABLE `newsletter_subscribers` DISABLE KEYS */;
INSERT INTO `newsletter_subscribers` VALUES
('1ef05470-22c7-4568-8b32-94d6decb024d','abonne1@demo.larbi.test','confirmed','fr','2026-10-06 19:23:47.807','2026-09-26 19:23:47.806',NULL,NULL),
('89c5ef44-0075-486a-9909-52d534fe639d','attente@demo.larbi.test','pending','fr','2026-10-06 19:23:47.807',NULL,NULL,NULL),
('8c083615-b14a-474f-881e-f69720ddd392','parti@demo.larbi.test','unsubscribed','fr','2026-10-06 19:23:47.807','2026-09-16 19:23:47.806','2026-10-04 19:23:47.806',NULL),
('a4161e97-9986-491d-9f5c-15f29bb7b88a','abonne2@demo.larbi.test','confirmed','en','2026-10-06 19:23:47.807','2026-10-03 19:23:47.806',NULL,NULL);
/*!40000 ALTER TABLE `newsletter_subscribers` ENABLE KEYS */;
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
/*!40000 ALTER TABLE `platform_settings` DISABLE KEYS */;
INSERT INTO `platform_settings` VALUES
('aziz','sellal','2026-09-26 19:26:52.769'),
('contactAddress','','2026-09-25 13:05:45.643'),
('contactEmail','','2026-09-25 13:05:45.643'),
('contactPhone','','2026-09-25 13:05:45.643'),
('maintenanceMode','false','2026-09-25 13:05:45.643');
/*!40000 ALTER TABLE `platform_settings` ENABLE KEYS */;
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
/*!40000 ALTER TABLE `quiz_attempt_answers` DISABLE KEYS */;
/*!40000 ALTER TABLE `quiz_attempt_answers` ENABLE KEYS */;
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
/*!40000 ALTER TABLE `quiz_attempts` DISABLE KEYS */;
/*!40000 ALTER TABLE `quiz_attempts` ENABLE KEYS */;
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
/*!40000 ALTER TABLE `quiz_choices` DISABLE KEYS */;
/*!40000 ALTER TABLE `quiz_choices` ENABLE KEYS */;
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
/*!40000 ALTER TABLE `quiz_questions` DISABLE KEYS */;
/*!40000 ALTER TABLE `quiz_questions` ENABLE KEYS */;
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
/*!40000 ALTER TABLE `quizzes` DISABLE KEYS */;
/*!40000 ALTER TABLE `quizzes` ENABLE KEYS */;
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
/*!40000 ALTER TABLE `sections` DISABLE KEYS */;
INSERT INTO `sections` VALUES
('6389322d-baf1-44e5-9304-8f4c9384b3bd','dba64efe-4342-42c2-abf7-843875d017a2','Lire les documents de synthèse','Le bilan, le compte de résultat et pour aller plus loin.',1,'2026-10-06 19:23:47.596','2026-10-06 19:23:47.596'),
('abedeac8-c7d8-4a05-ad84-38132db5b885','8cbe0465-9199-40bc-9a68-0768c1f0d75a','Contrôle fiscal',NULL,1,'2026-10-06 19:23:47.671','2026-10-06 19:23:47.671'),
('c107f9c9-1d87-4bf3-b49e-adafd9bab6a0','dba64efe-4342-42c2-abf7-843875d017a2','Les fondations','À quoi sert la comptabilité et comment on enregistre une opération.',0,'2026-10-06 19:23:47.556','2026-10-06 19:23:47.556'),
('e09548a9-3899-47fa-8124-4b7491e6f5ff','a6fb6c6f-85cc-4eee-9f0c-c7293b529661','Le plan de trésorerie',NULL,0,'2026-10-06 19:23:47.688','2026-10-06 19:23:47.688'),
('e68c8a99-9cce-40cd-81dc-690107f703fe','8cbe0465-9199-40bc-9a68-0768c1f0d75a','Régimes et charges',NULL,0,'2026-10-06 19:23:47.650','2026-10-06 19:23:47.650'),
('eaffccb2-8078-4caa-aa92-1f868300b366','129b63d0-5283-483b-8484-11762a0ae939','Contenu',NULL,0,'2026-10-06 19:23:47.705','2026-10-06 19:23:47.705');
/*!40000 ALTER TABLE `sections` ENABLE KEYS */;
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
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` VALUES
('4c229f6a-c3f0-43b1-9de4-30b80e6ebaf7','demo-gestion','gestion','2026-10-06 19:23:47.744'),
('81ac4076-732a-4322-a157-ec1efafc4987','demo-fiscalite','fiscalité','2026-10-06 19:23:47.748');
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`),
  CONSTRAINT `users_role_check` CHECK (`role` in ('user','admin')),
  CONSTRAINT `users_accessLevel_check` CHECK (`accessLevel` in ('standard','premium')),
  CONSTRAINT `users_status_check` CHECK (`status` in ('active','suspended'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
('02055049-8154-4b8c-be77-e739f9462d62','premium@demo.larbi.test','$2b$10$2s.ooYjNvM84QIDwYpj/EejqzpHmC2muC9a6r/HguKrtUyr5Dkssm','Karim Premium','pme','premium','user','active','2026-10-06 19:23:47.529','2026-10-06 19:23:47.529'),
('d2182dc3-126f-47d6-b5df-eeaf6f5199f7','standard@demo.larbi.test','$2b$10$2s.ooYjNvM84QIDwYpj/EejqzpHmC2muC9a6r/HguKrtUyr5Dkssm','Sofia Standard','pmi','standard','user','active','2026-10-06 19:23:47.524','2026-10-06 19:23:47.524'),
('d4266c5f-94e5-4d99-b755-0380ec0060d8','mynameisazizsellal@gmail.com','$2b$12$1VhR5DMGquPebXcgksN7KedL0n7vsD6D/0hrKrqbUwHSn2yEO.1C2','Aziz Sellal','lyceen','standard','user','active','2026-09-26 19:18:23.056','2026-09-26 19:28:58.862'),
('d533b47c-9497-4a43-89b5-83919a96530c','admin@demo.larbi.test','$2b$10$gNJPLasttv17LFA.grraVeWngULct10VZrS.H7GkNpTXjvFWoD.my','Admin Démo','lyceen','premium','admin','active','2026-10-06 19:23:47.508','2026-10-06 19:31:37.145');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
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

-- Dump completed on 2026-10-07 23:06:37
