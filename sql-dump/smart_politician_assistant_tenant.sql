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
-- Table structure for table `tenant`
--

DROP TABLE IF EXISTS `tenant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `status` enum('ACTIVE','INACTIVE') NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  `plain_password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_tenant_email` (`email`),
  UNIQUE KEY `ix_tenant_name` (`name`),
  KEY `ix_tenant_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant`
--

LOCK TABLES `tenant` WRITE;
/*!40000 ALTER TABLE `tenant` DISABLE KEYS */;
INSERT INTO `tenant` VALUES ('0b9edc38-fa0d-465f-b64b-6f0b1a2b8896','Test Tenant Organization 1756547571.105667','test1756547571.105667@tenant.org','1234567890','$2b$12$4YW8eUgzEuAFU2b5Srsxhes6fr7U4C3NKpm5BIPFZt0z7Mig.gJaS','ACTIVE','2025-08-30 09:52:53','2025-09-05 20:43:04','[PASSWORD_RESET_REQUIRED]'),('61342430-43c5-4163-9bbe-956238280951','Bangalore City Corporation','admin@bbmp.gov.in',NULL,'$2b$12$ybfZGNYPw140UHYnWTCEYO8gHOfnMqvgkEVW73b9wLrPd/.oZtSyO','ACTIVE','2025-08-24 11:00:19','2025-08-24 11:00:19','[PASSWORD_RESET_REQUIRED]'),('61bd339f-d9c7-47ec-b892-c8807a6dbad2','Test Tenant Organization','test1756547355.734983@tenant.org','1234567890','$2b$12$MbZdD1w1DFgICiRSxM1hSekHrXq1GSqBmq5A3/CvOammbTM3DWM/q','INACTIVE','2025-08-30 09:49:18','2025-08-30 15:19:22','[PASSWORD_RESET_REQUIRED]'),('7e5d9788-c545-4630-b76d-0bccbee511e5','Updated Test Tenant Organization','test@tenant.org','0987654321','$2b$12$cCBsB2zDbr5NbKq1156T3.ViIkmU0lDnY1XSNta16ZJQMSZNTNK/m','ACTIVE','2025-08-30 09:46:06','2025-09-05 20:42:45','[PASSWORD_RESET_REQUIRED]'),('872d40b9-8c55-4161-b52f-5d3af567af35','Chennai Municipal Corporation','admin@chennai.gov.in',NULL,'$2b$12$qbCBb68k7gj.lw1Msb5MaO6oCX9zBfMixufvCK4P7PPzbITucbxKi','ACTIVE','2025-08-24 11:00:20','2025-08-24 11:00:20','[PASSWORD_RESET_REQUIRED]'),('88a58338-3919-4254-9b8b-7af5bbddd376','Test Tenant Organization 1756547768.928467','test1756547768.928467@tenant.org','1234567890','$2b$12$Upk8nf9fXOl1DzTNnzKWc..xKKn99mczjWOaLfpj3Nf2rDILbhYSu','INACTIVE','2025-08-30 09:56:11','2025-08-30 15:26:15','[PASSWORD_RESET_REQUIRED]'),('cbfdfb59-b4ca-4f83-b4e6-52e7b2aef01e','Mumbai Municipal Corporation','admin@mumbai.gov.in',NULL,'$2b$12$EddH96sj7n29ZaE5KkPUyOzUmRQwlfuUQgM50HAtjmRarJ9kKrsuS','ACTIVE','2025-08-24 11:00:19','2025-08-24 11:00:19','[PASSWORD_RESET_REQUIRED]'),('ed8e1013-0481-4d45-ab35-3b3bcce7500d','Delhi Development Authority','admin@dda.gov.in',NULL,'$2b$12$LScDSd0IJFwNSFgA6//qv.rQFlbbaBY7Rrbm3TIkktQhA/m4hYi.C','ACTIVE','2025-08-24 11:00:19','2025-08-24 11:00:19','[PASSWORD_RESET_REQUIRED]');
/*!40000 ALTER TABLE `tenant` ENABLE KEYS */;
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
