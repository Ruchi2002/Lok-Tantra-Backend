-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: smart_politician_assistant
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `category` enum('SYSTEM','TENANT','USER','ISSUE','VISIT','AREA','REPORT','SETTINGS') NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `is_system_permission` tinyint(1) NOT NULL,
  `scope` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_permissions_name` (`name`),
  KEY `ix_permissions_category` (`category`),
  KEY `ix_permissions_is_active` (`is_active`),
  KEY `ix_permissions_scope` (`scope`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES ('003aa398-fbb5-44cc-a402-821ceaecf6f7','assign_issues','Assign Issues','ISSUE','Assign issues to users',1,1,'tenant','2025-08-24 11:00:18','2025-09-05 14:59:51'),('1a9723f2-c929-41b7-b1ec-1b6702cc3f79','tenant.view','View Tenant','TENANT','View tenant information',1,1,'tenant','2025-08-24 11:00:18','2025-08-24 11:00:18'),('28938ea3-41f6-4294-b4e0-5b9719069d16','visit.create','Create Visits','VISIT','Schedule new visits',1,1,'tenant','2025-08-24 11:00:18','2025-08-24 11:00:18'),('32c95849-2c08-4190-b8d5-7da838a4c661','area.edit','Edit Areas','AREA','Edit area details',1,1,'tenant','2025-08-24 11:00:18','2025-08-24 11:00:18'),('368cd0bc-29a5-49cf-ae18-eb375a422d7b','visit.complete','Complete Visits','VISIT','Mark visits as completed',1,1,'tenant','2025-08-24 11:00:18','2025-08-24 11:00:18'),('4add31be-6afd-4805-b5c5-802c1940f3c1','user.delete','Delete Users','USER','Delete users',1,1,'tenant','2025-08-24 11:00:18','2025-08-24 11:00:18'),('4fe1f7a0-5795-426d-a3f0-68eee4495962','user.view','View Users','USER','View user list and details',1,1,'tenant','2025-08-24 11:00:18','2025-08-24 11:00:18'),('55d9a272-92df-4683-861c-1d396c593d8a','report.view','View Reports','REPORT','Access reports and analytics',1,1,'tenant','2025-08-24 11:00:18','2025-08-24 11:00:18'),('592f5c46-43eb-46b1-afc1-7d5b76c467f1','delete_issues','Resolve Issues','ISSUE','Mark issues as resolved',1,1,'tenant','2025-08-24 11:00:18','2025-09-05 14:59:51'),('5fd57891-b104-427d-8f44-6d6481170713','edit_issues','Edit Issues','ISSUE','Edit issue details',1,1,'tenant','2025-08-24 11:00:18','2025-09-05 14:59:51'),('6c287ff4-b850-4a2a-8085-23910ca9e3f5','area.create','Create Areas','AREA','Create new areas',1,1,'tenant','2025-08-24 11:00:18','2025-08-24 11:00:18'),('7fef5b48-bac8-4edf-8ebf-78769b87151f','tenant.manage','Manage Tenant','TENANT','Manage tenant settings',1,1,'tenant','2025-08-24 11:00:18','2025-08-24 11:00:18'),('9761681f-6bdc-4af0-80de-a90bff840aba','settings.edit','Edit Settings','SETTINGS','Modify system settings',1,1,'tenant','2025-08-24 11:00:18','2025-08-24 11:00:18'),('ad7144a6-ade0-44ba-b60c-86c3c5b58883','area.view','View Areas','AREA','View area information',1,1,'tenant','2025-08-24 11:00:18','2025-08-24 11:00:18'),('b125b93e-56fb-4a41-ad38-0fcecb2b2d2a','report.export','Export Reports','REPORT','Export report data',1,1,'tenant','2025-08-24 11:00:18','2025-08-24 11:00:18'),('b331b67f-ba99-47c8-8cfd-579168108a3f','create_issues','Create Issues','ISSUE','Create new issues',1,1,'tenant','2025-08-24 11:00:18','2025-09-05 14:59:51'),('b6f9239e-0eab-4552-968e-60570672f9b4','user.edit','Edit Users','USER','Edit user information',1,1,'tenant','2025-08-24 11:00:18','2025-08-24 11:00:18'),('b77c34c0-6178-4849-82bf-c63b6b7f8fc4','visit.edit','Edit Visits','VISIT','Edit visit details',1,1,'tenant','2025-08-24 11:00:18','2025-08-24 11:00:18'),('d30b43ad-2c25-4f70-bada-0104e307673f','user.create','Create Users','USER','Create new users',1,1,'tenant','2025-08-24 11:00:18','2025-08-24 11:00:18'),('da017872-aecb-4151-bb2d-279090b542f6','system.view','View System','SYSTEM','Access system overview',1,1,'tenant','2025-08-24 11:00:18','2025-08-24 11:00:18'),('ebe7e7a4-e91d-46db-bd3c-6f8f7116d3d2','system.manage','Manage System','SYSTEM','Full system management',1,1,'tenant','2025-08-24 11:00:18','2025-08-24 11:00:18'),('ed15f9a2-99b0-42c9-8f83-8d0e371f3ff6','visit.view','View Visits','VISIT','View scheduled visits',1,1,'tenant','2025-08-24 11:00:18','2025-08-24 11:00:18'),('f2af5c97-82da-491f-99d4-2c617b75d1d8','view_issues','View Issues','ISSUE','View citizen issues',1,1,'tenant','2025-08-24 11:00:18','2025-09-05 14:59:51'),('fe232876-e1bd-43b9-a770-71c5671ec4c5','settings.view','View Settings','SETTINGS','View system settings',1,1,'tenant','2025-08-24 11:00:18','2025-08-24 11:00:18');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-05 22:13:18
